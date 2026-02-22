import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDb } from './db';
import { users } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

export interface JWTPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
}

/**
 * تسجيل مستخدم جديد
 */
export async function registerUser(email: string, password: string, name: string) {
  // التحقق من عدم وجود المستخدم
  const db = await getDb();
  if (!db) throw new Error('قاعدة البيانات غير متاحة');
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (existingUser.length > 0) {
    throw new Error('البريد الإلكتروني مستخدم بالفعل');
  }

  // تشفير كلمة المرور
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // إنشاء المستخدم
  const result = await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
    role: 'user',
    subscriptionStatus: 'trial',
    trialStartDate: new Date(),
    trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 أيام
  });

  // جلب المستخدم الجديد
  const [newUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (!newUser) {
    throw new Error('فشل إنشاء المستخدم');
  }

  return newUser;
}

/**
 * تسجيل دخول المستخدم
 */
export async function loginUser(email: string, password: string) {
  // البحث عن المستخدم
  const db = await getDb();
  if (!db) throw new Error('قاعدة البيانات غير متاحة');
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user) {
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  // التحقق من كلمة المرور
  if (!user.password) throw new Error('هذا الحساب لا يدعم تسجيل الدخول بكلمة مرور');
  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  // إنشاء JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    } as JWTPayload,
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { user, token };
}

/**
 * التحقق من JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('رمز المصادقة غير صالح');
  }
}

/**
 * استخراج المستخدم من JWT token
 */
export async function getUserFromToken(token: string) {
  const payload = verifyToken(token);
  
  const db = await getDb();
  if (!db) throw new Error('قاعدة البيانات غير متاحة');
  const [user] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);

  if (!user) {
    throw new Error('المستخدم غير موجود');
  }

  return user;
}

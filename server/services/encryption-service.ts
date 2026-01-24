import crypto from 'crypto';

/**
 * خدمة التشفير والأمان
 * توفر وظائف تشفير وفك تشفير آمنة للبيانات الحساسة
 */

const ALGORITHM = 'aes-256-gcm';
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const IV_LENGTH = 12;

/**
 * الحصول على مفتاح التشفير من متغيرات البيئة
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  // تحويل المفتاح من hex إلى Buffer
  return Buffer.from(key, 'hex');
}

/**
 * تشفير البيانات
 * @param data - البيانات المراد تشفيرها
 * @returns البيانات المشفرة (IV + encrypted + tag)
 */
export function encrypt(data: string): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // دمج IV + encrypted + tag
    const result = iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex');
    return result;
  } catch (error) {
    console.error('[Encryption] Error:', error);
    throw new Error('فشل تشفير البيانات');
  }
}

/**
 * فك تشفير البيانات
 * @param encryptedData - البيانات المشفرة
 * @returns البيانات الأصلية
 */
export function decrypt(encryptedData: string): string {
  try {
    const key = getEncryptionKey();
    const parts = encryptedData.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const tag = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('[Decryption] Error:', error);
    throw new Error('فشل فك تشفير البيانات');
  }
}

/**
 * حساب hash للبيانات (للتحقق من الصحة)
 * @param data - البيانات
 * @returns hash
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * التحقق من hash
 * @param data - البيانات
 * @param hash - hash المتوقع
 * @returns هل البيانات صحيحة
 */
export function verifyHash(data: string, hash: string): boolean {
  return hashData(data) === hash;
}

/**
 * توليد رمز عشوائي آمن
 * @param length - طول الرمز
 * @returns رمز عشوائي
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * توليد رمز التحقق (6 أرقام)
 * @returns رمز التحقق
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * تشفير رقم IBAN
 * @param iban - رقم IBAN
 * @returns IBAN مشفر
 */
export function encryptIBAN(iban: string): string {
  // إزالة المسافات والأحرف الخاصة
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();

  // التحقق من صحة IBAN (طول أساسي)
  if (cleanIBAN.length < 15 || cleanIBAN.length > 34) {
    throw new Error('رقم IBAN غير صحيح');
  }

  return encrypt(cleanIBAN);
}

/**
 * فك تشفير رقم IBAN
 * @param encryptedIBAN - IBAN مشفر
 * @returns IBAN الأصلي
 */
export function decryptIBAN(encryptedIBAN: string): string {
  return decrypt(encryptedIBAN);
}

/**
 * إخفاء رقم IBAN (عرض آخر 4 أرقام فقط)
 * @param iban - رقم IBAN
 * @returns IBAN مخفي
 */
export function maskIBAN(iban: string): string {
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  const lastFour = cleanIBAN.slice(-4);
  return `****${lastFour}`;
}

/**
 * التحقق من قوة كلمة المرور
 * @param password - كلمة المرور
 * @returns درجة القوة (0-100)
 */
export function checkPasswordStrength(password: string): number {
  let strength = 0;

  // الطول
  if (password.length >= 8) strength += 20;
  if (password.length >= 12) strength += 10;
  if (password.length >= 16) strength += 10;

  // الأحرف الكبيرة
  if (/[A-Z]/.test(password)) strength += 15;

  // الأحرف الصغيرة
  if (/[a-z]/.test(password)) strength += 15;

  // الأرقام
  if (/[0-9]/.test(password)) strength += 15;

  // الأحرف الخاصة
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 15;

  return Math.min(strength, 100);
}

/**
 * إنشاء مفتاح تشفير عشوائي
 * @returns مفتاح تشفير (hex)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * التحقق من صحة البيانات المشفرة
 * @param encryptedData - البيانات المشفرة
 * @returns هل البيانات صحيحة
 */
export function isValidEncryptedData(encryptedData: string): boolean {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) return false;

    // التحقق من أن كل جزء هو hex صحيح
    for (const part of parts) {
      if (!/^[0-9a-f]*$/.test(part)) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * توليد salt عشوائي
 * @returns salt
 */
export function generateSalt(): string {
  return crypto.randomBytes(SALT_LENGTH).toString('hex');
}

/**
 * hash كلمة المرور مع salt
 * @param password - كلمة المرور
 * @param salt - salt
 * @returns hash
 */
export function hashPassword(password: string, salt: string): string {
  return crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
}

/**
 * التحقق من كلمة المرور
 * @param password - كلمة المرور المدخلة
 * @param hash - hash المخزن
 * @param salt - salt المخزن
 * @returns هل كلمة المرور صحيحة
 */
export function verifyPassword(
  password: string,
  hash: string,
  salt: string
): boolean {
  const passwordHash = hashPassword(password, salt);
  return crypto.timingSafeEqual(
    Buffer.from(passwordHash),
    Buffer.from(hash)
  );
}

import { logger } from './_core/logger-service';
/**
 * security-service
 * @module ./server/security-service
 */
import crypto from 'crypto';

/**
 * خدمة الأمان والحماية المتقدمة
 * توفر ميزات تشفير وحماية من الهجمات الشائعة
 */

interface EncryptionResult {
  encrypted: string;
  iv: string;
  authTag: string;
}

interface SecurityAuditLog {
  id: string;
  userId: number;
  action: string;
  resource: string;
  status: 'success' | 'failure';
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details?: Record<string, any>;
}

class SecurityService {
  private encryptionKey: string;
  private algorithm = 'aes-256-gcm';
  private auditLogs: SecurityAuditLog[] = [];
  private failedLoginAttempts: Map<string, number> = new Map();
  private maxFailedAttempts = 5;
  private lockoutDuration = 15 * 60 * 1000; // 15 minutes
  private suspiciousIPs: Set<string> = new Set();

  constructor() {
    // استخدام مفتاح من متغيرات البيئة
    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateEncryptionKey();
  }

  /**
   * توليد مفتاح تشفير
   */
  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * تشفير البيانات الحساسة
   */
  encryptData(data: string): EncryptionResult {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        this.algorithm,
        Buffer.from(this.encryptionKey, 'hex'),
        iv
      ) as any;

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
      };
    } catch (error) {
      logger.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * فك تشفير البيانات
   */
  decryptData(encrypted: string, iv: string, authTag: string): string {
    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        Buffer.from(this.encryptionKey, 'hex'),
        Buffer.from(iv, 'hex')
      ) as any;

      decipher.setAuthTag(Buffer.from(authTag, 'hex'));

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * تجزئة كلمة المرور (Hashing)
   */
  hashPassword(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
      .toString('hex');
    return `${salt}:${hash}`;
  }

  /**
   * التحقق من كلمة المرور
   */
  verifyPassword(password: string, hash: string): boolean {
    try {
      const [salt, originalHash] = hash.split(':');
      const computedHash = crypto
        .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
        .toString('hex');
      return computedHash === originalHash;
    } catch (error) {
      logger.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * توليد رمز التحقق الثنائي (2FA)
   */
  generate2FAToken(): string {
    return crypto.randomBytes(3).toString('hex').toUpperCase();
  }

  /**
   * التحقق من صحة رمز 2FA
   */
  verify2FAToken(token: string, storedToken: string, expirationTime: number = 300000): boolean {
    // التحقق من الصلاحية الزمنية (5 دقائق افتراضياً)
    const now = Date.now();
    return token === storedToken && now < expirationTime;
  }

  /**
   * توليد رمز CSRF
   */
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * التحقق من رمز CSRF
   */
  verifyCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken;
  }

  /**
   * تسجيل محاولة دخول فاشلة
   */
  recordFailedLogin(identifier: string, ipAddress: string): boolean {
    const key = `${identifier}:${ipAddress}`;
    const attempts = this.failedLoginAttempts.get(key) || 0;
    const newAttempts = attempts + 1;

    this.failedLoginAttempts.set(key, newAttempts);

    // قفل الحساب بعد عدد معين من المحاولات الفاشلة
    if (newAttempts >= this.maxFailedAttempts) {
      this.suspiciousIPs.add(ipAddress);
      console.warn(`Account locked: ${identifier} from IP: ${ipAddress}`);
      return false;
    }

    // إعادة تعيين المحاولات بعد انقضاء المدة
    setTimeout(() => {
      this.failedLoginAttempts.delete(key);
    }, this.lockoutDuration);

    return true;
  }

  /**
   * التحقق من قفل الحساب
   */
  isAccountLocked(identifier: string, ipAddress: string): boolean {
    const key = `${identifier}:${ipAddress}`;
    const attempts = this.failedLoginAttempts.get(key) || 0;
    return attempts >= this.maxFailedAttempts;
  }

  /**
   * إعادة تعيين محاولات الدخول الفاشلة
   */
  resetFailedLoginAttempts(identifier: string, ipAddress: string): void {
    const key = `${identifier}:${ipAddress}`;
    this.failedLoginAttempts.delete(key);
  }

  /**
   * التحقق من عنوان IP المريب
   */
  isSuspiciousIP(ipAddress: string): boolean {
    return this.suspiciousIPs.has(ipAddress);
  }

  /**
   * تسجيل عملية تدقيق أمان
   */
  logAudit(log: Omit<SecurityAuditLog, 'id' | 'timestamp'>): void {
    const auditLog: SecurityAuditLog = {
      ...log,
      id: crypto.randomBytes(16).toString('hex'),
      timestamp: new Date(),
    };

    this.auditLogs.push(auditLog);

    // الاحتفاظ بـ 10000 سجل فقط
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-10000);
    }

    // طباعة السجل
    console.log(`[AUDIT] ${auditLog.action} - ${auditLog.resource} - ${auditLog.status}`);
  }

  /**
   * الحصول على سجلات التدقيق
   */
  getAuditLogs(filters?: {
    userId?: number;
    action?: string;
    status?: 'success' | 'failure';
    startDate?: Date;
    endDate?: Date;
  }): SecurityAuditLog[] {
    let logs = [...this.auditLogs];

    if (filters?.userId) {
      logs = logs.filter(log => log.userId === filters.userId);
    }

    if (filters?.action) {
      logs = logs.filter(log => log.action.includes(filters.action!));
    }

    if (filters?.status) {
      logs = logs.filter(log => log.status === filters.status);
    }

    if (filters?.startDate) {
      logs = logs.filter(log => log.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      logs = logs.filter(log => log.timestamp <= filters.endDate!);
    }

    return logs;
  }

  /**
   * التحقق من قوة كلمة المرور
   */
  isStrongPassword(password: string): {
    isStrong: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    // التحقق من الطول
    if (password.length >= 8) {
      score += 20;
    } else {
      feedback.push('يجب أن تكون كلمة المرور 8 أحرف على الأقل');
    }

    // التحقق من الأحرف الكبيرة
    if (/[A-Z]/.test(password)) {
      score += 20;
    } else {
      feedback.push('يجب أن تحتوي على أحرف كبيرة');
    }

    // التحقق من الأحرف الصغيرة
    if (/[a-z]/.test(password)) {
      score += 20;
    } else {
      feedback.push('يجب أن تحتوي على أحرف صغيرة');
    }

    // التحقق من الأرقام
    if (/[0-9]/.test(password)) {
      score += 20;
    } else {
      feedback.push('يجب أن تحتوي على أرقام');
    }

    // التحقق من الرموز الخاصة
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      score += 20;
    } else {
      feedback.push('يجب أن تحتوي على رموز خاصة');
    }

    return {
      isStrong: score >= 80,
      score,
      feedback,
    };
  }

  /**
   * تنظيف المدخلات من الهجمات
   */
  sanitizeInput(input: string): string {
    // إزالة الرموز الخطرة
    return input
      .replace(/[<>\"']/g, '')
      .trim()
      .substring(0, 1000); // تحديد الطول الأقصى
  }

  /**
   * التحقق من صحة البريد الإلكتروني
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * توليد رمز استعادة كلمة المرور
   */
  generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * التحقق من انتهاء صلاحية الرمز
   */
  isTokenExpired(createdAt: Date, expirationHours: number = 24): boolean {
    const now = new Date();
    const expirationTime = new Date(createdAt.getTime() + expirationHours * 60 * 60 * 1000);
    return now > expirationTime;
  }

  /**
   * توليد رمز API
   */
  generateAPIKey(): string {
    return `sk_${crypto.randomBytes(32).toString('hex')}`;
  }

  /**
   * تجزئة رمز API
   */
  hashAPIKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * الحصول على إحصائيات الأمان
   */
  getSecurityStats(): {
    totalAuditLogs: number;
    failedLoginAttempts: number;
    suspiciousIPs: number;
    recentFailures: number;
  } {
    const recentFailures = this.auditLogs.filter(
      log => log.status === 'failure' && 
      new Date().getTime() - log.timestamp.getTime() < 3600000 // آخر ساعة
    ).length;

    return {
      totalAuditLogs: this.auditLogs.length,
      failedLoginAttempts: this.failedLoginAttempts.size,
      suspiciousIPs: this.suspiciousIPs.size,
      recentFailures,
    };
  }

  /**
   * مسح سجلات التدقيق القديمة
   */
  clearOldAuditLogs(daysOld: number = 90): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const initialLength = this.auditLogs.length;
    this.auditLogs = this.auditLogs.filter(log => log.timestamp > cutoffDate);

    return initialLength - this.auditLogs.length;
  }

  /**
   * التحقق من صحة رقم الهاتف
   */
  isValidPhoneNumber(phoneNumber: string): boolean {
    const phoneRegex = /^(\+962|0)?[0-9]{9,10}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  }

  /**
   * توليد رمز تحقق بريد إلكتروني
   */
  generateEmailVerificationCode(): string {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  /**
   * التحقق من صحة رمز التحقق
   */
  verifyEmailCode(code: string, storedCode: string, expirationTime: number = 600000): boolean {
    // 10 دقائق افتراضياً
    const now = Date.now();
    return code === storedCode && now < expirationTime;
  }
}

export default new SecurityService();

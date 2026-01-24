/**
 * مدير الأمان
 * يوفر وظائف أمان شاملة للتطبيق
 */

import crypto from 'crypto';

export interface SecurityConfig {
  maxLoginAttempts: number;
  lockoutDurationMs: number;
  passwordMinLength: number;
  passwordRequireSpecialChar: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireUppercase: boolean;
  sessionTimeout: number;
  tokenExpiry: number;
}

const DEFAULT_CONFIG: SecurityConfig = {
  maxLoginAttempts: 5,
  lockoutDurationMs: 15 * 60 * 1000, // 15 دقيقة
  passwordMinLength: 8,
  passwordRequireSpecialChar: true,
  passwordRequireNumbers: true,
  passwordRequireUppercase: true,
  sessionTimeout: 30 * 60 * 1000, // 30 دقيقة
  tokenExpiry: 24 * 60 * 60 * 1000, // 24 ساعة
};

class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;
  private loginAttempts: Map<string, { count: number; lockedUntil: number }> = new Map();
  private blacklistedTokens: Set<string> = new Set();

  private constructor(config: Partial<SecurityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(config?: Partial<SecurityConfig>): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager(config);
    }
    return SecurityManager.instance;
  }

  /**
   * التحقق من قوة كلمة المرور
   */
  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.config.passwordMinLength) {
      errors.push(`كلمة المرور يجب أن تكون على الأقل ${this.config.passwordMinLength} أحرف`);
    }

    if (this.config.passwordRequireUppercase && !/[A-Z]/.test(password)) {
      errors.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل');
    }

    if (this.config.passwordRequireNumbers && !/\d/.test(password)) {
      errors.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');
    }

    if (this.config.passwordRequireSpecialChar && !/[!@#$%^&*]/.test(password)) {
      errors.push('كلمة المرور يجب أن تحتوي على حرف خاص واحد على الأقل');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * تجزئة كلمة المرور
   */
  hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const saltValue = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto
      .pbkdf2Sync(password, saltValue, 10000, 64, 'sha512')
      .toString('hex');

    return { hash, salt: saltValue };
  }

  /**
   * التحقق من كلمة المرور
   */
  verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
  }

  /**
   * توليد رمز عشوائي آمن
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * توليد JWT Token
   */
  generateJWT(payload: Record<string, any>, secret: string): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString('base64');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64');

    return `${header}.${body}.${signature}`;
  }

  /**
   * التحقق من JWT Token
   */
  verifyJWT(token: string, secret: string): { valid: boolean; payload?: Record<string, any> } {
    try {
      const [header, body, signature] = token.split('.');

      // التحقق من التوقيع
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${header}.${body}`)
        .digest('base64');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return { valid: false };
      }

      // فك تشفير البيانات
      const payload = JSON.parse(Buffer.from(body, 'base64').toString());

      // التحقق من انتهاء الصلاحية
      if (payload.iat + this.config.tokenExpiry < Date.now()) {
        return { valid: false };
      }

      return { valid: true, payload };
    } catch {
      return { valid: false };
    }
  }

  /**
   * إضافة رمز إلى قائمة الحظر
   */
  blacklistToken(token: string): void {
    this.blacklistedTokens.add(token);
  }

  /**
   * التحقق من وجود رمز في قائمة الحظر
   */
  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * تسجيل محاولة دخول فاشلة
   */
  recordFailedLogin(identifier: string): { locked: boolean; remainingTime: number } {
    const now = Date.now();
    const attempt = this.loginAttempts.get(identifier) || { count: 0, lockedUntil: 0 };

    // التحقق من انتهاء فترة القفل
    if (now > attempt.lockedUntil) {
      attempt.count = 0;
      attempt.lockedUntil = 0;
    }

    attempt.count++;

    if (attempt.count >= this.config.maxLoginAttempts) {
      attempt.lockedUntil = now + this.config.lockoutDurationMs;
    }

    this.loginAttempts.set(identifier, attempt);

    return {
      locked: attempt.count >= this.config.maxLoginAttempts,
      remainingTime: Math.max(0, attempt.lockedUntil - now),
    };
  }

  /**
   * التحقق من قفل الحساب
   */
  isAccountLocked(identifier: string): boolean {
    const attempt = this.loginAttempts.get(identifier);
    if (!attempt) return false;

    if (Date.now() > attempt.lockedUntil) {
      this.loginAttempts.delete(identifier);
      return false;
    }

    return attempt.count >= this.config.maxLoginAttempts;
  }

  /**
   * إعادة تعيين محاولات الدخول
   */
  resetLoginAttempts(identifier: string): void {
    this.loginAttempts.delete(identifier);
  }

  /**
   * التحقق من صحة البريد الإلكتروني
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * التحقق من صحة رقم الهاتف
   */
  validatePhoneNumber(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }

  /**
   * تشفير البيانات
   */
  encrypt(data: string, key: string): { iv: string; encryptedData: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');

    return {
      iv: iv.toString('hex'),
      encryptedData,
    };
  }

  /**
   * فك تشفير البيانات
   */
  decrypt(encryptedData: string, iv: string, key: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(key, 'hex'),
      Buffer.from(iv, 'hex')
    );
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * توليد CSRF Token
   */
  generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * التحقق من CSRF Token
   */
  verifyCSRFToken(token: string, sessionToken: string): boolean {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken));
  }

  /**
   * تنظيف محاولات الدخول المنتهية
   */
  cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.loginAttempts.entries());
    for (const [identifier, attempt] of entries) {
      if (now > attempt.lockedUntil && attempt.count === 0) {
        this.loginAttempts.delete(identifier);
      }
    }
  }
}

export const securityManager = SecurityManager.getInstance();

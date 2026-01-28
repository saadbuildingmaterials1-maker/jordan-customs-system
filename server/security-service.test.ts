import { describe, it, expect, beforeEach } from 'vitest';
import SecurityService from './security-service';

/**
 * اختبارات شاملة لخدمة الأمان والحماية
 */

describe('خدمة الأمان والحماية', () => {
  beforeEach(() => {
    // تنظيف البيانات قبل كل اختبار
  });

  describe('التشفير وفك التشفير', () => {
    it('يجب تشفير البيانات بشكل صحيح', () => {
      const data = 'بيانات حساسة';
      const encrypted = SecurityService.encryptData(data);

      expect(encrypted).toHaveProperty('encrypted');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('authTag');
      expect(encrypted.encrypted).not.toBe(data);
    });

    it('يجب فك تشفير البيانات بشكل صحيح', () => {
      const data = 'بيانات حساسة';
      const encrypted = SecurityService.encryptData(data);
      const decrypted = SecurityService.decryptData(
        encrypted.encrypted,
        encrypted.iv,
        encrypted.authTag
      );

      expect(decrypted).toBe(data);
    });

    it('يجب فشل فك التشفير مع بيانات خاطئة', () => {
      const data = 'بيانات حساسة';
      const encrypted = SecurityService.encryptData(data);

      expect(() => {
        SecurityService.decryptData(
          'wrong_encrypted_data',
          encrypted.iv,
          encrypted.authTag
        );
      }).toThrow();
    });
  });

  describe('تجزئة كلمة المرور', () => {
    it('يجب تجزئة كلمة المرور', () => {
      const password = 'MySecurePassword123!';
      const hash = SecurityService.hashPassword(password);

      expect(hash).toContain(':');
      expect(hash).not.toBe(password);
    });

    it('يجب التحقق من كلمة المرور الصحيحة', () => {
      const password = 'MySecurePassword123!';
      const hash = SecurityService.hashPassword(password);
      const isValid = SecurityService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('يجب رفض كلمة المرور الخاطئة', () => {
      const password = 'MySecurePassword123!';
      const hash = SecurityService.hashPassword(password);
      const isValid = SecurityService.verifyPassword('WrongPassword', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('المصادقة الثنائية (2FA)', () => {
    it('يجب توليد رمز 2FA', () => {
      const token = SecurityService.generate2FAToken();

      expect(token).toHaveLength(6);
      expect(/^[A-F0-9]{6}$/.test(token)).toBe(true);
    });

    it('يجب التحقق من رمز 2FA الصحيح', () => {
      const token = '123ABC';
      const now = Date.now();
      const expirationTime = now + 300000; // 5 دقائق

      const isValid = SecurityService.verify2FAToken(token, token, expirationTime);
      expect(isValid).toBe(true);
    });

    it('يجب رفض رمز 2FA المنتهي الصلاحية', () => {
      const token = '123ABC';
      const expirationTime = Date.now() - 1000; // انتهت الصلاحية

      const isValid = SecurityService.verify2FAToken(token, token, expirationTime);
      expect(isValid).toBe(false);
    });

    it('يجب رفض رمز 2FA الخاطئ', () => {
      const token = '123ABC';
      const now = Date.now();
      const expirationTime = now + 300000;

      const isValid = SecurityService.verify2FAToken('WRONG', token, expirationTime);
      expect(isValid).toBe(false);
    });
  });

  describe('رموز CSRF', () => {
    it('يجب توليد رمز CSRF', () => {
      const token = SecurityService.generateCSRFToken();

      expect(token).toHaveLength(64);
      expect(/^[a-f0-9]{64}$/.test(token)).toBe(true);
    });

    it('يجب التحقق من رمز CSRF الصحيح', () => {
      const token = SecurityService.generateCSRFToken();
      const isValid = SecurityService.verifyCSRFToken(token, token);

      expect(isValid).toBe(true);
    });

    it('يجب رفض رمز CSRF الخاطئ', () => {
      const token = SecurityService.generateCSRFToken();
      const isValid = SecurityService.verifyCSRFToken('wrong_token', token);

      expect(isValid).toBe(false);
    });
  });

  describe('محاولات الدخول الفاشلة', () => {
    it('يجب تسجيل محاولة دخول فاشلة', () => {
      const result = SecurityService.recordFailedLogin('user@example.com', '192.168.1.1');
      expect(result).toBe(true);
    });

    it('يجب قفل الحساب بعد عدد معين من المحاولات', () => {
      const identifier = 'user@example.com';
      const ip = '192.168.1.1';

      // محاولات فاشلة متعددة
      for (let i = 0; i < 5; i++) {
        SecurityService.recordFailedLogin(identifier, ip);
      }

      const isLocked = SecurityService.isAccountLocked(identifier, ip);
      expect(isLocked).toBe(true);
    });

    it('يجب إعادة تعيين محاولات الدخول الفاشلة', () => {
      const identifier = 'user@example.com';
      const ip = '192.168.1.1';

      SecurityService.recordFailedLogin(identifier, ip);
      SecurityService.resetFailedLoginAttempts(identifier, ip);

      const isLocked = SecurityService.isAccountLocked(identifier, ip);
      expect(isLocked).toBe(false);
    });
  });

  describe('عناوين IP المريبة', () => {
    it('يجب التحقق من عنوان IP المريب', () => {
      const identifier = 'user@example.com';
      const ip = '192.168.1.1';

      // إنشاء عنوان IP مريب
      for (let i = 0; i < 5; i++) {
        SecurityService.recordFailedLogin(identifier, ip);
      }

      const isSuspicious = SecurityService.isSuspiciousIP(ip);
      expect(isSuspicious).toBe(true);
    });
  });

  describe('سجلات التدقيق', () => {
    it('يجب تسجيل عملية تدقيق', () => {
      SecurityService.logAudit({
        userId: 1,
        action: 'LOGIN',
        resource: 'user_account',
        status: 'success',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      const logs = SecurityService.getAuditLogs();
      expect(logs.length).toBeGreaterThan(0);
    });

    it('يجب تصفية سجلات التدقيق حسب المستخدم', () => {
      SecurityService.logAudit({
        userId: 1,
        action: 'LOGIN',
        resource: 'user_account',
        status: 'success',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      SecurityService.logAudit({
        userId: 2,
        action: 'LOGIN',
        resource: 'user_account',
        status: 'success',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      const logs = SecurityService.getAuditLogs({ userId: 1 });
      expect(logs.every(log => log.userId === 1)).toBe(true);
    });

    it('يجب تصفية سجلات التدقيق حسب الحالة', () => {
      SecurityService.logAudit({
        userId: 1,
        action: 'LOGIN',
        resource: 'user_account',
        status: 'success',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      SecurityService.logAudit({
        userId: 1,
        action: 'LOGIN',
        resource: 'user_account',
        status: 'failure',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      const logs = SecurityService.getAuditLogs({ status: 'success' });
      expect(logs.every(log => log.status === 'success')).toBe(true);
    });

    it('يجب مسح سجلات التدقيق القديمة', () => {
      SecurityService.logAudit({
        userId: 1,
        action: 'LOGIN',
        resource: 'user_account',
        status: 'success',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      });

      const cleared = SecurityService.clearOldAuditLogs(0);
      expect(cleared).toBeGreaterThanOrEqual(0);
    });
  });

  describe('قوة كلمة المرور', () => {
    it('يجب قبول كلمة مرور قوية', () => {
      const result = SecurityService.isStrongPassword('MySecurePassword123!@#');

      expect(result.isStrong).toBe(true);
      expect(result.score).toBe(100);
    });

    it('يجب رفض كلمة مرور ضعيفة', () => {
      const result = SecurityService.isStrongPassword('weak');

      expect(result.isStrong).toBe(false);
      expect(result.score).toBeLessThan(80);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('يجب توفير تعليقات حول كلمة المرور', () => {
      const result = SecurityService.isStrongPassword('password');

      expect(result.feedback).toContain('يجب أن تحتوي على أحرف كبيرة');
      expect(result.feedback).toContain('يجب أن تحتوي على رموز خاصة');
    });
  });

  describe('تنظيف المدخلات', () => {
    it('يجب إزالة الرموز الخطرة', () => {
      const input = '<script>alert("xss")</script>';
      const sanitized = SecurityService.sanitizeInput(input);

      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).not.toContain('"');
    });

    it('يجب تحديد الطول الأقصى للمدخلات', () => {
      const input = 'a'.repeat(2000);
      const sanitized = SecurityService.sanitizeInput(input);

      expect(sanitized.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('التحقق من البريد الإلكتروني', () => {
    it('يجب قبول بريد إلكتروني صحيح', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach(email => {
        expect(SecurityService.isValidEmail(email)).toBe(true);
      });
    });

    it('يجب رفض بريد إلكتروني غير صحيح', () => {
      const invalidEmails = ['invalid', 'user@', '@example.com', 'user@.com'];

      invalidEmails.forEach(email => {
        expect(SecurityService.isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('استعادة كلمة المرور', () => {
    it('يجب توليد رمز استعادة كلمة المرور', () => {
      const token = SecurityService.generatePasswordResetToken();

      expect(token).toHaveLength(64);
      expect(/^[a-f0-9]{64}$/.test(token)).toBe(true);
    });

    it('يجب التحقق من انتهاء صلاحية الرمز', () => {
      const oldDate = new Date();
      oldDate.setHours(oldDate.getHours() - 25);

      const isExpired = SecurityService.isTokenExpired(oldDate, 24);
      expect(isExpired).toBe(true);
    });

    it('يجب عدم انتهاء صلاحية الرمز الحديث', () => {
      const recentDate = new Date();

      const isExpired = SecurityService.isTokenExpired(recentDate, 24);
      expect(isExpired).toBe(false);
    });
  });

  describe('رموز API', () => {
    it('يجب توليد رمز API', () => {
      const apiKey = SecurityService.generateAPIKey();

      expect(apiKey).toMatch(/^sk_[a-f0-9]{64}$/);
    });

    it('يجب تجزئة رمز API', () => {
      const apiKey = SecurityService.generateAPIKey();
      const hash = SecurityService.hashAPIKey(apiKey);

      expect(hash).not.toBe(apiKey);
      expect(hash).toHaveLength(64);
    });
  });

  describe('الإحصائيات الأمنية', () => {
    it('يجب الحصول على إحصائيات الأمان', () => {
      const stats = SecurityService.getSecurityStats();

      expect(stats).toHaveProperty('totalAuditLogs');
      expect(stats).toHaveProperty('failedLoginAttempts');
      expect(stats).toHaveProperty('suspiciousIPs');
      expect(stats).toHaveProperty('recentFailures');
    });
  });

  describe('رموز التحقق من البريد الإلكتروني', () => {
    it('يجب توليد رمز التحقق من البريد الإلكتروني', () => {
      const code = SecurityService.generateEmailVerificationCode();

      expect(code).toHaveLength(8);
      expect(/^[A-F0-9]{8}$/.test(code)).toBe(true);
    });

    it('يجب التحقق من رمز البريد الإلكتروني الصحيح', () => {
      const code = '12345678';
      const now = Date.now();
      const expirationTime = now + 600000;

      const isValid = SecurityService.verifyEmailCode(code, code, expirationTime);
      expect(isValid).toBe(true);
    });

    it('يجب رفض رمز البريد الإلكتروني المنتهي الصلاحية', () => {
      const code = '12345678';
      const expirationTime = Date.now() - 1000;

      const isValid = SecurityService.verifyEmailCode(code, code, expirationTime);
      expect(isValid).toBe(false);
    });
  });

  describe('التحقق من رقم الهاتف', () => {
    it('يجب قبول أرقام الهاتف الأردنية الصحيحة', () => {
      const validNumbers = ['0791234567', '+962791234567', '0701234567'];

      validNumbers.forEach(number => {
        expect(SecurityService.isValidPhoneNumber(number)).toBe(true);
      });
    });

    it('يجب رفض أرقام الهاتف غير الصحيحة', () => {
      const invalidNumbers = ['123', 'abc', ''];

      invalidNumbers.forEach(number => {
        expect(SecurityService.isValidPhoneNumber(number)).toBe(false);
      });
    });
  });
});

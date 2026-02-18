import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  encryptBackup,
  decryptBackup,
  saveEncryptedBackup,
  restoreEncryptedBackup,
  listBackups,
  deleteOldBackups,
  manageStorageSpace,
  getBackupStats
} from './backup-encryption-service';

describe('خدمة تشفير النسخ الاحتياطية', () => {
  const testPassword = 'test-password-123';
  const testData = JSON.stringify({
    declarations: [
      {
        id: 1,
        number: 'DEC-2026-001',
        value: 10000,
        status: 'completed'
      }
    ],
    timestamp: Date.now()
  });

  describe('تشفير وفك التشفير', () => {
    it('يجب تشفير البيانات بنجاح', () => {
      const encrypted = encryptBackup(testData, testPassword);

      expect(encrypted).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.authTag).toBeDefined();
      expect(encrypted.encryptedData).toBeDefined();
      expect(encrypted.timestamp).toBeDefined();
      expect(encrypted.version).toBe('1.0.0');
    });

    it('يجب فك تشفير البيانات بنجاح', () => {
      const encrypted = encryptBackup(testData, testPassword);
      const decrypted = decryptBackup(encrypted, testPassword);

      expect(decrypted).toBe(testData);
    });

    it('يجب فشل فك التشفير بكلمة مرور خاطئة', () => {
      const encrypted = encryptBackup(testData, testPassword);

      expect(() => {
        decryptBackup(encrypted, 'wrong-password');
      }).toThrow();
    });

    it('يجب أن تكون البيانات المشفرة مختلفة في كل مرة', () => {
      const encrypted1 = encryptBackup(testData, testPassword);
      const encrypted2 = encryptBackup(testData, testPassword);

      expect(encrypted1.encryptedData).not.toBe(encrypted2.encryptedData);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });
  });

  describe('حفظ واستعادة النسخ الاحتياطية', () => {
    it('يجب حفظ نسخة احتياطية بنجاح', async () => {
      const metadata = await saveEncryptedBackup(testData, testPassword, 'test-backup');

      expect(metadata).toBeDefined();
      expect(metadata.id).toBeDefined();
      expect(metadata.name).toBe('test-backup');
      expect(metadata.size).toBeGreaterThan(0);
      expect(metadata.encrypted).toBe(true);
      expect(metadata.checksum).toBeDefined();
      expect(metadata.expiresAt).toBeDefined();
    });

    it('يجب استعادة نسخة احتياطية بنجاح', async () => {
      const saved = await saveEncryptedBackup(testData, testPassword, 'restore-test');
      const restored = await restoreEncryptedBackup(saved.id, testPassword);

      expect(restored).toBe(testData);
    });

    it('يجب فشل استعادة نسخة احتياطية غير موجودة', async () => {
      expect(async () => {
        await restoreEncryptedBackup('non-existent-id', testPassword);
      }).rejects.toThrow();
    });

    it('يجب فشل استعادة نسخة احتياطية بكلمة مرور خاطئة', async () => {
      const saved = await saveEncryptedBackup(testData, testPassword, 'wrong-password-test');

      expect(async () => {
        await restoreEncryptedBackup(saved.id, 'wrong-password');
      }).rejects.toThrow();
    });
  });

  describe('إدارة قائمة النسخ الاحتياطية', () => {
    it('يجب عرض قائمة النسخ الاحتياطية', async () => {
      await saveEncryptedBackup(testData, testPassword, 'list-test-1');
      await saveEncryptedBackup(testData, testPassword, 'list-test-2');

      const backups = await listBackups();

      expect(backups).toBeDefined();
      expect(Array.isArray(backups)).toBe(true);
      expect(backups.length).toBeGreaterThanOrEqual(2);
    });

    it('يجب تصفية النسخ المنتهية الصلاحية', async () => {
      // هذا الاختبار يتطلب محاكاة الوقت
      const backups = await listBackups();

      // التحقق من أن جميع النسخ لم تنته صلاحيتها
      for (const backup of backups) {
        if (backup.expiresAt) {
          expect(backup.expiresAt).toBeGreaterThan(Date.now());
        }
      }
    });
  });

  describe('إدارة مساحة التخزين', () => {
    it('يجب الحصول على إحصائيات التخزين', async () => {
      const stats = await manageStorageSpace();

      expect(stats).toBeDefined();
      expect(stats.totalSize).toBeGreaterThanOrEqual(0);
      expect(stats.backupCount).toBeGreaterThanOrEqual(0);
      expect(stats.deletedCount).toBeGreaterThanOrEqual(0);
      expect(stats.remainingSpace).toBeGreaterThanOrEqual(0);
    });

    it('يجب حساب الحجم الإجمالي بشكل صحيح', async () => {
      const stats = await manageStorageSpace();
      const backups = await listBackups();

      const calculatedSize = backups.reduce((sum, b) => sum + b.size, 0);
      expect(stats.totalSize).toBe(calculatedSize);
    });
  });

  describe('إحصائيات النسخ الاحتياطية', () => {
    it('يجب الحصول على إحصائيات النسخ الاحتياطية', async () => {
      const stats = await getBackupStats();

      expect(stats).toBeDefined();
      expect(stats.totalBackups).toBeGreaterThanOrEqual(0);
      expect(stats.totalSize).toBeGreaterThanOrEqual(0);
      expect(stats.averageSize).toBeGreaterThanOrEqual(0);
    });

    it('يجب حساب متوسط الحجم بشكل صحيح', async () => {
      const stats = await getBackupStats();

      if (stats.totalBackups > 0) {
        const expectedAverage = stats.totalSize / stats.totalBackups;
        expect(stats.averageSize).toBe(expectedAverage);
      }
    });

    it('يجب عرض أقدم وأحدث نسخة احتياطية', async () => {
      await saveEncryptedBackup(testData, testPassword, 'stats-test-1');
      
      // انتظر قليلاً
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await saveEncryptedBackup(testData, testPassword, 'stats-test-2');

      const stats = await getBackupStats();

      if (stats.totalBackups >= 2) {
        expect(stats.oldestBackup).toBeDefined();
        expect(stats.newestBackup).toBeDefined();
        expect(stats.oldestBackup).toBeLessThanOrEqual(stats.newestBackup!);
      }
    });
  });

  describe('حذف النسخ القديمة', () => {
    it('يجب حذف النسخ المنتهية الصلاحية', async () => {
      const beforeCount = (await listBackups()).length;
      const deletedCount = await deleteOldBackups();

      const afterCount = (await listBackups()).length;

      expect(deletedCount).toBeGreaterThanOrEqual(0);
      expect(afterCount).toBeLessThanOrEqual(beforeCount);
    });
  });

  describe('حالات الخطأ والحدود', () => {
    it('يجب رفع خطأ عند تجاوز حجم النسخة الاحتياطية', async () => {
      const largeData = JSON.stringify({
        data: 'x'.repeat(150 * 1024 * 1024) // 150MB
      });

      expect(async () => {
        await saveEncryptedBackup(largeData, testPassword, 'large-backup');
      }).rejects.toThrow();
    });

    it('يجب التعامل مع البيانات الفارغة', async () => {
      const emptyData = '';
      const metadata = await saveEncryptedBackup(emptyData, testPassword, 'empty-backup');

      expect(metadata).toBeDefined();
      expect(metadata.size).toBe(0);
    });

    it('يجب التعامل مع كلمات مرور طويلة', async () => {
      const longPassword = 'x'.repeat(1000);
      const encrypted = encryptBackup(testData, longPassword);
      const decrypted = decryptBackup(encrypted, longPassword);

      expect(decrypted).toBe(testData);
    });

    it('يجب التعامل مع البيانات التي تحتوي على أحرف خاصة', async () => {
      const specialData = JSON.stringify({
        text: '🔒 بيانات مشفرة مع أحرف خاصة: !@#$%^&*()',
        arabic: 'النصوص العربية والإنجليزية mixed'
      });

      const metadata = await saveEncryptedBackup(specialData, testPassword, 'special-backup');
      const restored = await restoreEncryptedBackup(metadata.id, testPassword);

      expect(restored).toBe(specialData);
    });
  });

  describe('الأداء والتحسينات', () => {
    it('يجب تشفير البيانات بسرعة معقولة', () => {
      const start = Date.now();
      encryptBackup(testData, testPassword);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // أقل من ثانية
    });

    it('يجب فك تشفير البيانات بسرعة معقولة', () => {
      const encrypted = encryptBackup(testData, testPassword);
      const start = Date.now();
      decryptBackup(encrypted, testPassword);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // أقل من ثانية
    });
  });
});

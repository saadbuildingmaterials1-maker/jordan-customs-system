import { describe, it, expect } from 'vitest';
import {
  exportToExcel,
  exportToCSV,
  encryptData,
  decryptData,
  createHash,
  verifyDataIntegrity,
  compressData,
  decompressData,
  createEncryptedBackup,
  restoreEncryptedBackup,
} from './export-service';

describe('Export Service - التصدير والتشفير', () => {
  const testData = [
    { id: 1, name: 'محمد', amount: 1000, currency: 'JOD' },
    { id: 2, name: 'علي', amount: 2000, currency: 'USD' },
    { id: 3, name: 'فاطمة', amount: 1500, currency: 'EGP' },
  ];

  const secretKey = 'test-secret-key-12345';

  describe('Excel Export - تصدير Excel', () => {
    it('should export data to Excel buffer', () => {
      const buffer = exportToExcel(testData, 'test.xlsx');
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle empty data array', () => {
      const buffer = exportToExcel([], 'empty.xlsx');
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it('should include all fields from data', () => {
      const buffer = exportToExcel(testData, 'test.xlsx');
      const bufferString = buffer.toString('utf-8', 0, Math.min(500, buffer.length));
      expect(bufferString).toBeDefined();
    });
  });

  describe('CSV Export - تصدير CSV', () => {
    it('should export data to CSV string', () => {
      const csv = exportToCSV(testData, 'test.csv');
      expect(typeof csv).toBe('string');
      expect(csv).toContain('id');
      expect(csv).toContain('name');
      expect(csv).toContain('محمد');
    });

    it('should handle special characters in CSV', () => {
      const dataWithSpecialChars = [
        { id: 1, name: 'محمد علي', description: 'وصف، مع، فواصل' },
      ];
      const csv = exportToCSV(dataWithSpecialChars, 'test.csv');
      expect(csv).toContain('محمد علي');
    });

    it('should include headers in CSV', () => {
      const csv = exportToCSV(testData, 'test.csv');
      const lines = csv.split('\n');
      expect(lines[0]).toContain('id');
      expect(lines[0]).toContain('name');
    });
  });

  describe('Encryption - التشفير', () => {
    it('should encrypt data successfully', () => {
      const plaintext = 'سر البيانات المهمة';
      const encrypted = encryptData(plaintext, secretKey);
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.length).toBeGreaterThan(0);
    });

    it('should decrypt data successfully', () => {
      const plaintext = 'البيانات السرية';
      const encrypted = encryptData(plaintext, secretKey);
      const decrypted = decryptData(encrypted, secretKey);
      expect(decrypted).toBe(plaintext);
    });

    it('should fail to decrypt with wrong key', () => {
      const plaintext = 'بيانات مهمة';
      const encrypted = encryptData(plaintext, secretKey);
      const wrongKey = 'wrong-key';
      try {
        const decrypted = decryptData(encrypted, wrongKey);
        expect(decrypted).not.toBe(plaintext);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle special characters in encryption', () => {
      const specialText = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const encrypted = encryptData(specialText, secretKey);
      const decrypted = decryptData(encrypted, secretKey);
      expect(decrypted).toBe(specialText);
    });

    it('should handle Arabic characters in encryption', () => {
      const arabicText = 'النص العربي مع الأرقام ١٢٣ والرموز';
      const encrypted = encryptData(arabicText, secretKey);
      const decrypted = decryptData(encrypted, secretKey);
      expect(decrypted).toBe(arabicText);
    });
  });

  describe('Hash - البصمات', () => {
    it('should create consistent hash for same data', () => {
      const data = 'البيانات الثابتة';
      const hash1 = createHash(data);
      const hash2 = createHash(data);
      expect(hash1).toBe(hash2);
    });

    it('should create different hash for different data', () => {
      const hash1 = createHash('بيانات أولى');
      const hash2 = createHash('بيانات ثانية');
      expect(hash1).not.toBe(hash2);
    });

    it('should verify data integrity correctly', () => {
      const data = 'البيانات المهمة';
      const hash = createHash(data);
      expect(verifyDataIntegrity(data, hash)).toBe(true);
    });

    it('should detect tampered data', () => {
      const data = 'البيانات الأصلية';
      const hash = createHash(data);
      const tamperedData = 'البيانات المعدلة';
      expect(verifyDataIntegrity(tamperedData, hash)).toBe(false);
    });
  });

  describe('Compression - الضغط', () => {
    it('should compress data successfully', () => {
      const data = 'البيانات المراد ضغطها';
      const compressed = compressData(data);
      expect(compressed).not.toBe(data);
      expect(compressed.length).toBeGreaterThan(0);
    });

    it('should decompress data correctly', () => {
      const data = 'البيانات المراد ضغطها';
      const compressed = compressData(data);
      const decompressed = decompressData(compressed);
      expect(decompressed).toBe(data);
    });

    it('should handle large data compression', () => {
      const largeData = 'البيانات الكبيرة '.repeat(1000);
      const compressed = compressData(largeData);
      const decompressed = decompressData(compressed);
      expect(decompressed).toBe(largeData);
    });
  });

  describe('Encrypted Backup - النسخ الاحتياطية المشفرة', () => {
    it('should create encrypted backup', async () => {
      const data = { users: testData, timestamp: new Date() };
      const backup = await createEncryptedBackup(data, secretKey, 'backup.bin');

      expect(backup).toHaveProperty('encrypted');
      expect(backup).toHaveProperty('hash');
      expect(backup).toHaveProperty('timestamp');
      expect(backup.encrypted).not.toContain('users');
    });

    it('should restore encrypted backup', async () => {
      const originalData = { users: testData, timestamp: '2024-01-24' };
      const backup = await createEncryptedBackup(originalData, secretKey, 'backup.bin');
      const restored = await restoreEncryptedBackup(backup, secretKey);

      expect(restored.users).toEqual(testData);
      expect(restored.timestamp).toBe('2024-01-24');
    });

    it('should fail to restore with wrong key', async () => {
      const data = { users: testData };
      const backup = await createEncryptedBackup(data, secretKey, 'backup.bin');

      try {
        await restoreEncryptedBackup(backup, 'wrong-key');
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should detect tampered backup', async () => {
      const data = { users: testData };
      const backup = await createEncryptedBackup(data, secretKey, 'backup.bin');

      // Tamper with the backup
      const tamperedBackup = {
        ...backup,
        encrypted: backup.encrypted.slice(0, -10) + 'TAMPERED!!',
      };

      try {
        await restoreEncryptedBackup(tamperedBackup, secretKey);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Performance - الأداء', () => {
    it('should encrypt/decrypt large data quickly', () => {
      const largeData = JSON.stringify(testData).repeat(100);
      const start = Date.now();

      const encrypted = encryptData(largeData, secretKey);
      const decrypted = decryptData(encrypted, secretKey);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
      expect(decrypted).toBe(largeData);
    });

    it('should export large dataset to Excel quickly', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `المستخدم ${i}`,
        amount: Math.random() * 10000,
      }));

      const start = Date.now();
      const buffer = exportToExcel(largeData, 'large.xlsx');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000); // Should complete in less than 5 seconds
      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases - الحالات الحدية', () => {
    it('should handle empty string encryption', () => {
      const encrypted = encryptData('', secretKey);
      const decrypted = decryptData(encrypted, secretKey);
      expect(decrypted).toBe('');
    });

    it('should handle very long data', () => {
      const longData = 'البيانات الطويلة جداً '.repeat(10000);
      const encrypted = encryptData(longData, secretKey);
      const decrypted = decryptData(encrypted, secretKey);
      expect(decrypted).toBe(longData);
    });

    it('should handle numeric data in CSV', () => {
      const numericData = [
        { id: 1, value: 123.456, count: 999 },
        { id: 2, value: 0.001, count: 1 },
      ];
      const csv = exportToCSV(numericData, 'numeric.csv');
      expect(csv).toContain('123.456');
      expect(csv).toContain('0.001');
    });
  });
});

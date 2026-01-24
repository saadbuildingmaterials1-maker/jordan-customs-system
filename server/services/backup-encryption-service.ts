/**
 * خدمة التشفير والنسخ الاحتياطية
 * توفر تشفير وفك تشفير البيانات وإدارة النسخ الاحتياطية الآمنة
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { gzip, gunzip } from 'zlib';
const uuidv4 = () => crypto.randomUUID();

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

interface BackupConfig {
  encryptionKey: string;
  backupDir: string;
  maxBackups: number;
  retentionDays: number;
}

interface BackupMetadata {
  id: string;
  timestamp: number;
  size: number;
  encrypted: boolean;
  compressed: boolean;
  hash: string;
  version: string;
}

export class BackupEncryptionService {
  private config: BackupConfig;
  private algorithm = 'aes-256-gcm';
  private encoding: BufferEncoding = 'hex';

  constructor(config: BackupConfig) {
    this.config = config;
    this.ensureBackupDir();
  }

  /**
   * التأكد من وجود مجلد النسخ الاحتياطية
   */
  private ensureBackupDir(): void {
    if (!fs.existsSync(this.config.backupDir)) {
      fs.mkdirSync(this.config.backupDir, { recursive: true });
    }
  }

  /**
   * تشفير البيانات
   */
  async encryptData(data: string | Buffer): Promise<{
    encrypted: string;
    iv: string;
    authTag: string;
  }> {
    try {
      const key = Buffer.from(this.config.encryptionKey, this.encoding);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);

      let encrypted = cipher.update(data);
      encrypted = Buffer.concat([encrypted, cipher.final()]);

      const authTag = (cipher as any).getAuthTag();

      return {
        encrypted: encrypted.toString(this.encoding),
        iv: iv.toString(this.encoding),
        authTag: authTag.toString(this.encoding),
      };
    } catch (error) {
      throw new Error(`فشل التشفير: ${error}`);
    }
  }

  /**
   * فك تشفير البيانات
   */
  async decryptData(
    encrypted: string,
    iv: string,
    authTag: string
  ): Promise<string> {
    try {
      const key = Buffer.from(this.config.encryptionKey, this.encoding);
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        key,
        Buffer.from(iv, this.encoding)
      );

      (decipher as any).setAuthTag(Buffer.from(authTag, this.encoding));

      let decrypted = decipher.update(Buffer.from(encrypted, this.encoding));
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString('utf-8');
    } catch (error) {
      throw new Error(`فشل فك التشفير: ${error}`);
    }
  }

  /**
   * حساب hash للبيانات
   */
  private hashData(data: Buffer): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * إنشاء نسخة احتياطية مشفرة
   */
  async createBackup(data: any, name: string = 'backup'): Promise<{
    backupId: string;
    metadata: BackupMetadata;
    filePath: string;
  }> {
    try {
      const backupId = uuidv4();
      const jsonData = JSON.stringify(data);
      const buffer = Buffer.from(jsonData);

      // ضغط البيانات
      const compressed = await gzipAsync(buffer);

      // تشفير البيانات
      const { encrypted, iv, authTag } = await this.encryptData(compressed);

      // حساب hash
      const hash = this.hashData(Buffer.from(encrypted, this.encoding));

      // إنشاء metadata
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp: Date.now(),
        size: Buffer.byteLength(encrypted),
        encrypted: true,
        compressed: true,
        hash,
        version: '1.0.0',
      };

      // حفظ البيانات المشفرة
      const backupData = {
        metadata,
        iv,
        authTag,
        encrypted,
      };

      const fileName = `${name}-${backupId}.backup`;
      const filePath = path.join(this.config.backupDir, fileName);

      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

      // حذف النسخ الاحتياطية القديمة
      await this.cleanOldBackups();

      return {
        backupId,
        metadata,
        filePath,
      };
    } catch (error) {
      throw new Error(`فشل إنشاء النسخة الاحتياطية: ${error}`);
    }
  }

  /**
   * استعادة النسخة الاحتياطية
   */
  async restoreBackup(backupId: string): Promise<any> {
    try {
      // البحث عن ملف النسخة الاحتياطية
      const files = fs.readdirSync(this.config.backupDir);
      const backupFile = files.find((f) => f.includes(backupId));

      if (!backupFile) {
        throw new Error(`لم يتم العثور على النسخة الاحتياطية: ${backupId}`);
      }

      const filePath = path.join(this.config.backupDir, backupFile);
      const backupData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // التحقق من hash
      const currentHash = this.hashData(
        Buffer.from(backupData.encrypted, this.encoding)
      );
      if (currentHash !== backupData.metadata.hash) {
        throw new Error('فشل التحقق من سلامة البيانات');
      }

      // فك التشفير
      const decrypted = await this.decryptData(
        backupData.encrypted,
        backupData.iv,
        backupData.authTag
      );

      // فك الضغط
      const decompressed = await gunzipAsync(Buffer.from(decrypted, 'hex'));

      // تحويل إلى JSON
      const data = JSON.parse(decompressed.toString('utf-8'));

      return data;
    } catch (error) {
      throw new Error(`فشل استعادة النسخة الاحتياطية: ${error}`);
    }
  }

  /**
   * الحصول على قائمة النسخ الاحتياطية
   */
  async listBackups(): Promise<BackupMetadata[]> {
    try {
      const files = fs.readdirSync(this.config.backupDir);
      const backups: BackupMetadata[] = [];

      for (const file of files) {
        if (file.endsWith('.backup')) {
          const filePath = path.join(this.config.backupDir, file);
          const backupData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
          backups.push(backupData.metadata);
        }
      }

      // ترتيب حسب التاريخ (الأحدث أولاً)
      return backups.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      throw new Error(`فشل الحصول على قائمة النسخ الاحتياطية: ${error}`);
    }
  }

  /**
   * حذف نسخة احتياطية
   */
  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const files = fs.readdirSync(this.config.backupDir);
      const backupFile = files.find((f) => f.includes(backupId));

      if (!backupFile) {
        throw new Error(`لم يتم العثور على النسخة الاحتياطية: ${backupId}`);
      }

      const filePath = path.join(this.config.backupDir, backupFile);
      fs.unlinkSync(filePath);

      return true;
    } catch (error) {
      throw new Error(`فشل حذف النسخة الاحتياطية: ${error}`);
    }
  }

  /**
   * حذف النسخ الاحتياطية القديمة
   */
  private async cleanOldBackups(): Promise<void> {
    try {
      const backups = await this.listBackups();

      // حذف النسخ الزائدة عن الحد الأقصى
      if (backups.length > this.config.maxBackups) {
        const toDelete = backups.slice(this.config.maxBackups);
        for (const backup of toDelete) {
          await this.deleteBackup(backup.id);
        }
      }

      // حذف النسخ المنتهية صلاحيتها
      const now = Date.now();
      const retentionMs = this.config.retentionDays * 24 * 60 * 60 * 1000;

      for (const backup of backups) {
        if (now - backup.timestamp > retentionMs) {
          await this.deleteBackup(backup.id);
        }
      }
    } catch (error) {
      console.error(`خطأ في تنظيف النسخ الاحتياطية: ${error}`);
    }
  }

  /**
   * التحقق من سلامة النسخة الاحتياطية
   */
  async verifyBackup(backupId: string): Promise<boolean> {
    try {
      const files = fs.readdirSync(this.config.backupDir);
      const backupFile = files.find((f) => f.includes(backupId));

      if (!backupFile) {
        return false;
      }

      const filePath = path.join(this.config.backupDir, backupFile);
      const backupData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // التحقق من hash
      const currentHash = this.hashData(
        Buffer.from(backupData.encrypted, this.encoding)
      );

      return currentHash === backupData.metadata.hash;
    } catch (error) {
      console.error(`خطأ في التحقق من النسخة الاحتياطية: ${error}`);
      return false;
    }
  }

  /**
   * تصدير النسخة الاحتياطية
   */
  async exportBackup(backupId: string, exportPath: string): Promise<void> {
    try {
      const files = fs.readdirSync(this.config.backupDir);
      const backupFile = files.find((f) => f.includes(backupId));

      if (!backupFile) {
        throw new Error(`لم يتم العثور على النسخة الاحتياطية: ${backupId}`);
      }

      const sourcePath = path.join(this.config.backupDir, backupFile);
      fs.copyFileSync(sourcePath, exportPath);
    } catch (error) {
      throw new Error(`فشل تصدير النسخة الاحتياطية: ${error}`);
    }
  }

  /**
   * استيراد النسخة الاحتياطية
   */
  async importBackup(importPath: string): Promise<{
    backupId: string;
    metadata: BackupMetadata;
  }> {
    try {
      if (!fs.existsSync(importPath)) {
        throw new Error(`الملف غير موجود: ${importPath}`);
      }

      const backupData = JSON.parse(fs.readFileSync(importPath, 'utf-8'));
      const backupId = backupData.metadata.id;

      const fileName = `imported-${backupId}.backup`;
      const destPath = path.join(this.config.backupDir, fileName);

      fs.copyFileSync(importPath, destPath);

      return {
        backupId,
        metadata: backupData.metadata,
      };
    } catch (error) {
      throw new Error(`فشل استيراد النسخة الاحتياطية: ${error}`);
    }
  }

  /**
   * الحصول على إحصائيات النسخ الاحتياطية
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    oldestBackup: number | null;
    newestBackup: number | null;
  }> {
    try {
      const backups = await this.listBackups();

      const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
      const timestamps = backups.map((b) => b.timestamp);

      return {
        totalBackups: backups.length,
        totalSize,
        oldestBackup: timestamps.length > 0 ? Math.min(...timestamps) : null,
        newestBackup: timestamps.length > 0 ? Math.max(...timestamps) : null,
      };
    } catch (error) {
      throw new Error(`فشل الحصول على إحصائيات النسخ الاحتياطية: ${error}`);
    }
  }
}

export default BackupEncryptionService;

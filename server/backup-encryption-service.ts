import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

/**
 * خدمة تشفير وإدارة النسخ الاحتياطية
 * توفر تشفير AES-256-GCM وإدارة مساحة التخزين والاستعادة
 */

interface EncryptedBackup {
  iv: string;
  authTag: string;
  encryptedData: string;
  timestamp: number;
  version: string;
}

interface BackupMetadata {
  id: string;
  name: string;
  size: number;
  encrypted: boolean;
  timestamp: number;
  expiresAt?: number;
  checksum: string;
}

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const METADATA_FILE = path.join(BACKUP_DIR, 'metadata.json');
const MAX_BACKUP_SIZE = 100 * 1024 * 1024; // 100MB
const BACKUP_RETENTION_DAYS = 30;

/**
 * إنشاء مفتاح تشفير من كلمة السر
 */
function deriveKey(password: string): Buffer {
  return crypto.pbkdf2Sync(password, 'backup-salt-2026', 100000, 32, 'sha256');
}

/**
 * تشفير البيانات باستخدام AES-256-GCM
 */
export function encryptBackup(data: string, password: string): EncryptedBackup {
  const key = deriveKey(password);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  
  let encryptedData = cipher.update(data, 'utf8', 'hex');
  encryptedData += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encryptedData,
    timestamp: Date.now(),
    version: '1.0.0'
  };
}

/**
 * فك تشفير البيانات
 */
export function decryptBackup(encrypted: EncryptedBackup, password: string): string {
  const key = deriveKey(password);
  const iv = Buffer.from(encrypted.iv, 'hex');
  const authTag = Buffer.from(encrypted.authTag, 'hex');
  
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decryptedData = decipher.update(encrypted.encryptedData, 'hex', 'utf8');
  decryptedData += decipher.final('utf8');
  
  return decryptedData;
}

/**
 * حساب checksum للبيانات
 */
function calculateChecksum(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * حفظ نسخة احتياطية مشفرة
 */
export async function saveEncryptedBackup(
  data: string,
  password: string,
  backupName?: string
): Promise<BackupMetadata> {
  // التحقق من حجم البيانات
  if (Buffer.byteLength(data, 'utf8') > MAX_BACKUP_SIZE) {
    throw new Error(`حجم النسخة الاحتياطية يتجاوز الحد الأقصى: ${MAX_BACKUP_SIZE / 1024 / 1024}MB`);
  }

  // إنشاء مجلد النسخ الاحتياطية إذا لم يكن موجوداً
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  } catch (error) {
    // المجلد قد يكون موجوداً بالفعل
  }

  // تشفير البيانات
  const encrypted = encryptBackup(data, password);
  const checksum = calculateChecksum(data);
  const backupId = crypto.randomUUID();
  const fileName = `${backupName || 'backup'}-${backupId}.enc.json`;
  const filePath = path.join(BACKUP_DIR, fileName);

  // حفظ البيانات المشفرة
  await fs.writeFile(filePath, JSON.stringify(encrypted, null, 2));

  // إنشاء metadata
  const metadata: BackupMetadata = {
    id: backupId,
    name: backupName || 'Backup',
    size: Buffer.byteLength(data, 'utf8'),
    encrypted: true,
    timestamp: Date.now(),
    expiresAt: Date.now() + BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000,
    checksum
  };

  // تحديث ملف metadata
  await updateBackupMetadata(metadata);

  return metadata;
}

/**
 * استعادة نسخة احتياطية مشفرة
 */
export async function restoreEncryptedBackup(
  backupId: string,
  password: string
): Promise<string> {
  const backups = await listBackups();
  const backup = backups.find(b => b.id === backupId);

  if (!backup) {
    throw new Error(`النسخة الاحتياطية غير موجودة: ${backupId}`);
  }

  // البحث عن الملف
  const files = await fs.readdir(BACKUP_DIR);
  const backupFile = files.find(f => f.includes(backupId));

  if (!backupFile) {
    throw new Error(`ملف النسخة الاحتياطية غير موجود`);
  }

  const filePath = path.join(BACKUP_DIR, backupFile);
  const encryptedContent = await fs.readFile(filePath, 'utf8');
  const encrypted = JSON.parse(encryptedContent) as EncryptedBackup;

  // فك التشفير
  const decrypted = decryptBackup(encrypted, password);

  // التحقق من checksum
  const currentChecksum = calculateChecksum(decrypted);
  if (currentChecksum !== backup.checksum) {
    throw new Error('فشل التحقق من سلامة البيانات - قد تكون البيانات تالفة');
  }

  return decrypted;
}

/**
 * تحديث metadata النسخ الاحتياطية
 */
async function updateBackupMetadata(metadata: BackupMetadata): Promise<void> {
  let allMetadata: BackupMetadata[] = [];

  try {
    const content = await fs.readFile(METADATA_FILE, 'utf8');
    allMetadata = JSON.parse(content);
  } catch (error) {
    // الملف قد لا يكون موجوداً بعد
  }

  // البحث عن metadata موجود وتحديثه أو إضافة جديد
  const index = allMetadata.findIndex(m => m.id === metadata.id);
  if (index >= 0) {
    allMetadata[index] = metadata;
  } else {
    allMetadata.push(metadata);
  }

  // حفظ metadata
  await fs.writeFile(METADATA_FILE, JSON.stringify(allMetadata, null, 2));
}

/**
 * عرض قائمة النسخ الاحتياطية
 */
export async function listBackups(): Promise<BackupMetadata[]> {
  try {
    const content = await fs.readFile(METADATA_FILE, 'utf8');
    const allMetadata = JSON.parse(content) as BackupMetadata[];

    // تصفية النسخ المنتهية الصلاحية
    return allMetadata.filter(m => !m.expiresAt || m.expiresAt > Date.now());
  } catch (error) {
    return [];
  }
}

/**
 * حذف نسخة احتياطية قديمة
 */
export async function deleteOldBackups(): Promise<number> {
  const backups = await listBackups();
  const now = Date.now();
  let deletedCount = 0;

  for (const backup of backups) {
    if (backup.expiresAt && backup.expiresAt < now) {
      const files = await fs.readdir(BACKUP_DIR);
      const backupFile = files.find(f => f.includes(backup.id));

      if (backupFile) {
        const filePath = path.join(BACKUP_DIR, backupFile);
        await fs.unlink(filePath);
        deletedCount++;
      }

      // حذف من metadata
      const allMetadata = await listBackups();
      const filtered = allMetadata.filter(m => m.id !== backup.id);
      await fs.writeFile(METADATA_FILE, JSON.stringify(filtered, null, 2));
    }
  }

  return deletedCount;
}

/**
 * إدارة مساحة التخزين
 */
export async function manageStorageSpace(): Promise<{
  totalSize: number;
  backupCount: number;
  deletedCount: number;
  remainingSpace: number;
}> {
  const backups = await listBackups();
  let totalSize = 0;

  for (const backup of backups) {
    totalSize += backup.size;
  }

  // حذف النسخ القديمة إذا تجاوزت المساحة
  let deletedCount = 0;
  if (totalSize > MAX_BACKUP_SIZE) {
    // ترتيب حسب التاريخ والحذف الأقدم
    const sortedBackups = [...backups].sort((a, b) => a.timestamp - b.timestamp);

    for (const backup of sortedBackups) {
      if (totalSize <= MAX_BACKUP_SIZE * 0.8) break;

      const files = await fs.readdir(BACKUP_DIR);
      const backupFile = files.find(f => f.includes(backup.id));

      if (backupFile) {
        const filePath = path.join(BACKUP_DIR, backupFile);
        const stats = await fs.stat(filePath);
        await fs.unlink(filePath);
        totalSize -= stats.size;
        deletedCount++;
      }
    }
  }

  return {
    totalSize,
    backupCount: backups.length,
    deletedCount,
    remainingSpace: MAX_BACKUP_SIZE - totalSize
  };
}

/**
 * الحصول على إحصائيات النسخ الاحتياطية
 */
export async function getBackupStats(): Promise<{
  totalBackups: number;
  totalSize: number;
  oldestBackup: number | null;
  newestBackup: number | null;
  averageSize: number;
}> {
  const backups = await listBackups();

  if (backups.length === 0) {
    return {
      totalBackups: 0,
      totalSize: 0,
      oldestBackup: null,
      newestBackup: null,
      averageSize: 0
    };
  }

  const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
  const timestamps = backups.map(b => b.timestamp).sort((a, b) => a - b);

  return {
    totalBackups: backups.length,
    totalSize,
    oldestBackup: timestamps[0],
    newestBackup: timestamps[timestamps.length - 1],
    averageSize: totalSize / backups.length
  };
}

export default {
  encryptBackup,
  decryptBackup,
  saveEncryptedBackup,
  restoreEncryptedBackup,
  listBackups,
  deleteOldBackups,
  manageStorageSpace,
  getBackupStats
};

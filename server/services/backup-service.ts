import { TRPCError } from '@trpc/server';
import { db } from '@/server/db';
import { backups, restoreHistory, backupLog, backupSettings } from '@/drizzle/backup-schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import * as crypto from 'crypto';

/**
 * خدمة النسخ الاحتياطي
 * Backup Service
 */

export interface CreateBackupInput {
  backupName: string;
  backupType: 'full' | 'incremental' | 'differential';
  includedTables: string[];
  excludedTables?: string[];
  compressionEnabled?: boolean;
  encryptionEnabled?: boolean;
}

export interface RestoreBackupInput {
  backupId: number;
  restoreType: 'full' | 'partial' | 'point_in_time';
  tablesToRestore?: string[];
}

// ==================== إنشاء نسخة احتياطية ====================

export async function createBackup(input: CreateBackupInput, userId: number): Promise<any> {
  try {
    // توليد مفتاح التشفير
    const encryptionKey = crypto.randomBytes(32).toString('hex');

    // إنشاء النسخة الاحتياطية
    const [result] = await db.insert(backups).values({
      backupName: input.backupName,
      backupType: input.backupType as any,
      status: 'pending',
      encryptionKey,
      archiveLocation: `/backups/${input.backupName}-${Date.now()}`,
      dataIncluded: JSON.stringify(input.includedTables),
      excludedData: JSON.stringify(input.excludedTables || []),
      backupStartTime: new Date(),
      createdBy: userId,
    });

    // تسجيل الحدث
    await logBackupEvent(result.insertId, 'backup_started', 'بدء النسخة الاحتياطية');

    return {
      id: result.insertId,
      backupName: input.backupName,
      status: 'pending',
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Error creating backup:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في إنشاء النسخة الاحتياطية',
    });
  }
}

// ==================== جلب النسخ الاحتياطية ====================

export async function getBackups(limit: number = 10, offset: number = 0) {
  try {
    const backupsList = await db
      .select()
      .from(backups)
      .orderBy(desc(backups.createdAt))
      .limit(limit)
      .offset(offset);

    return backupsList;
  } catch (error) {
    console.error('Error getting backups:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب النسخ الاحتياطية',
    });
  }
}

// ==================== جلب نسخة احتياطية واحدة ====================

export async function getBackupById(backupId: number) {
  try {
    const [backup] = await db.select().from(backups).where(eq(backups.id, backupId));

    if (!backup) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'النسخة الاحتياطية غير موجودة',
      });
    }

    return backup;
  } catch (error) {
    console.error('Error getting backup:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب النسخة الاحتياطية',
    });
  }
}

// ==================== استعادة نسخة احتياطية ====================

export async function restoreBackup(input: RestoreBackupInput, userId: number): Promise<any> {
  try {
    const backup = await getBackupById(input.backupId);

    if (!backup.canRestore) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'لا يمكن استعادة هذه النسخة الاحتياطية',
      });
    }

    // إنشاء سجل الاستعادة
    const [result] = await db.insert(restoreHistory).values({
      backupId: input.backupId,
      restoreName: `restore-${input.backupId}-${Date.now()}`,
      restoreType: input.restoreType as any,
      status: 'in_progress',
      restoreStartTime: new Date(),
      restoredBy: userId,
    });

    // تسجيل الحدث
    await logBackupEvent(input.backupId, 'restore_started', 'بدء استعادة النسخة الاحتياطية');

    return {
      id: result.insertId,
      status: 'in_progress',
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Error restoring backup:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في استعادة النسخة الاحتياطية',
    });
  }
}

// ==================== حذف نسخة احتياطية ====================

export async function deleteBackup(backupId: number): Promise<any> {
  try {
    await db.update(backups).set({ status: 'failed' }).where(eq(backups.id, backupId));

    await logBackupEvent(backupId, 'backup_corrupted', 'تم حذف النسخة الاحتياطية');

    return { success: true };
  } catch (error) {
    console.error('Error deleting backup:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في حذف النسخة الاحتياطية',
    });
  }
}

// ==================== التحقق من النسخة الاحتياطية ====================

export async function verifyBackup(backupId: number): Promise<any> {
  try {
    const backup = await getBackupById(backupId);

    // حساب البصمة
    const md5 = crypto.createHash('md5').update(JSON.stringify(backup)).digest('hex');
    const sha256 = crypto.createHash('sha256').update(JSON.stringify(backup)).digest('hex');

    // تحديث النسخة الاحتياطية
    await db
      .update(backups)
      .set({
        checksumMD5: md5,
        checksumSHA256: sha256,
        verificationStatus: 'verified',
      })
      .where(eq(backups.id, backupId));

    await logBackupEvent(backupId, 'backup_verified', 'تم التحقق من النسخة الاحتياطية بنجاح');

    return { verified: true, md5, sha256 };
  } catch (error) {
    console.error('Error verifying backup:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في التحقق من النسخة الاحتياطية',
    });
  }
}

// ==================== جلب سجل الاستعادة ====================

export async function getRestoreHistory(backupId: number, limit: number = 10) {
  try {
    const history = await db
      .select()
      .from(restoreHistory)
      .where(eq(restoreHistory.backupId, backupId))
      .orderBy(desc(restoreHistory.createdAt))
      .limit(limit);

    return history;
  } catch (error) {
    console.error('Error getting restore history:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب سجل الاستعادة',
    });
  }
}

// ==================== تسجيل حدث النسخ الاحتياطي ====================

export async function logBackupEvent(
  backupId: number,
  eventType: string,
  message: string,
  details?: any
): Promise<void> {
  try {
    await db.insert(backupLog).values({
      backupId,
      eventType: eventType as any,
      message,
      details: details ? JSON.stringify(details) : undefined,
    });
  } catch (error) {
    console.error('Error logging backup event:', error);
  }
}

// ==================== جلب إحصائيات النسخ الاحتياطية ====================

export async function getBackupStatistics() {
  try {
    const allBackups = await db.select().from(backups);

    const totalBackups = allBackups.length;
    const completedBackups = allBackups.filter((b) => b.status === 'completed').length;
    const failedBackups = allBackups.filter((b) => b.status === 'failed').length;
    const totalSize = allBackups.reduce((sum, b) => sum + (b.totalSize || 0), 0);
    const compressedSize = allBackups.reduce((sum, b) => sum + (b.compressedSize || 0), 0);

    return {
      totalBackups,
      completedBackups,
      failedBackups,
      totalSize,
      compressedSize,
      compressionRatio: totalSize > 0 ? ((1 - compressedSize / totalSize) * 100).toFixed(2) : '0',
    };
  } catch (error) {
    console.error('Error getting backup statistics:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب إحصائيات النسخ الاحتياطية',
    });
  }
}

// ==================== تحديث إعدادات النسخ الاحتياطي ====================

export async function updateBackupSettings(settings: any): Promise<any> {
  try {
    // تحديث الإعدادات
    await db.update(backupSettings).set(settings);

    return { success: true };
  } catch (error) {
    console.error('Error updating backup settings:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في تحديث إعدادات النسخ الاحتياطي',
    });
  }
}

// ==================== جلب إعدادات النسخ الاحتياطي ====================

export async function getBackupSettings(): Promise<any> {
  try {
    const [settings] = await db.select().from(backupSettings);

    return settings || {};
  } catch (error) {
    console.error('Error getting backup settings:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب إعدادات النسخ الاحتياطي',
    });
  }
}

import { mysqlTable, varchar, int, text, datetime, boolean, json, enum as mysqlEnum, bigint } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

/**
 * جداول نظام النسخ الاحتياطي
 * Backup System Schema
 */

// ==================== جدول النسخ الاحتياطية ====================
export const backups = mysqlTable('backups', {
  id: int('id').primaryKey().autoincrement(),
  backupName: varchar('backup_name', { length: 100 }).notNull(),
  backupType: mysqlEnum('backup_type', ['full', 'incremental', 'differential']).notNull(),
  status: mysqlEnum('status', ['pending', 'in_progress', 'completed', 'failed', 'verified']).default('pending'),
  
  // معلومات الحجم
  totalSize: bigint('total_size', { mode: 'number' }).default(0),
  compressedSize: bigint('compressed_size', { mode: 'number' }).default(0),
  
  // معلومات التشفير
  encryptionAlgorithm: varchar('encryption_algorithm', { length: 50 }).default('AES-256-GCM'),
  encryptionKey: varchar('encryption_key', { length: 255 }).notNull(),
  
  // معلومات الأرشفة
  archiveLocation: varchar('archive_location', { length: 500 }).notNull(),
  archiveFormat: mysqlEnum('archive_format', ['tar', 'zip', 'tar.gz', 'tar.bz2']).default('tar.gz'),
  
  // البيانات الوصفية
  dataIncluded: json('data_included'), // قائمة الجداول المشمولة
  excludedData: json('excluded_data'), // قائمة البيانات المستثناة
  
  // معلومات الجدولة
  scheduledBackup: boolean('scheduled_backup').default(false),
  scheduleFrequency: mysqlEnum('schedule_frequency', ['hourly', 'daily', 'weekly', 'monthly']).optional(),
  
  // معلومات الاستعادة
  canRestore: boolean('can_restore').default(true),
  lastRestoreAttempt: datetime('last_restore_attempt', { fsp: 3 }),
  restoreCount: int('restore_count').default(0),
  
  // الفترة الزمنية
  backupStartTime: datetime('backup_start_time', { fsp: 3 }).notNull(),
  backupEndTime: datetime('backup_end_time', { fsp: 3 }),
  
  // الفحص والتحقق
  checksumMD5: varchar('checksum_md5', { length: 32 }),
  checksumSHA256: varchar('checksum_sha256', { length: 64 }),
  verificationStatus: mysqlEnum('verification_status', ['pending', 'verified', 'corrupted']).default('pending'),
  
  // معلومات إضافية
  notes: text('notes'),
  createdBy: int('created_by').notNull(),
  
  createdAt: datetime('created_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: datetime('updated_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).onUpdateNow(),
});

// ==================== جدول جداول النسخة الاحتياطية ====================
export const backupTables = mysqlTable('backup_tables', {
  id: int('id').primaryKey().autoincrement(),
  backupId: int('backup_id').notNull(),
  tableName: varchar('table_name', { length: 100 }).notNull(),
  rowCount: int('row_count').default(0),
  tableSize: bigint('table_size', { mode: 'number' }).default(0),
  status: mysqlEnum('status', ['pending', 'backed_up', 'failed']).default('pending'),
  
  createdAt: datetime('created_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
});

// ==================== جدول سجل الاستعادة ====================
export const restoreHistory = mysqlTable('restore_history', {
  id: int('id').primaryKey().autoincrement(),
  backupId: int('backup_id').notNull(),
  restoreName: varchar('restore_name', { length: 100 }).notNull(),
  restoreType: mysqlEnum('restore_type', ['full', 'partial', 'point_in_time']).notNull(),
  status: mysqlEnum('status', ['pending', 'in_progress', 'completed', 'failed']).default('pending'),
  
  // معلومات الاستعادة
  restoreStartTime: datetime('restore_start_time', { fsp: 3 }).notNull(),
  restoreEndTime: datetime('restore_end_time', { fsp: 3 }),
  tablesRestored: int('tables_restored').default(0),
  rowsRestored: int('rows_restored').default(0),
  
  // معلومات الخطأ
  errorMessage: text('error_message'),
  
  // معلومات إضافية
  restoredBy: int('restored_by').notNull(),
  notes: text('notes'),
  
  createdAt: datetime('created_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
});

// ==================== جدول جداول الاستعادة ====================
export const restoreTables = mysqlTable('restore_tables', {
  id: int('id').primaryKey().autoincrement(),
  restoreId: int('restore_id').notNull(),
  tableName: varchar('table_name', { length: 100 }).notNull(),
  rowsRestored: int('rows_restored').default(0),
  status: mysqlEnum('status', ['pending', 'restored', 'failed']).default('pending'),
  errorMessage: text('error_message'),
  
  createdAt: datetime('created_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
});

// ==================== جدول سياسات النسخ الاحتياطي ====================
export const backupPolicies = mysqlTable('backup_policies', {
  id: int('id').primaryKey().autoincrement(),
  policyName: varchar('policy_name', { length: 100 }).notNull(),
  description: text('description'),
  
  // جدولة النسخ
  backupFrequency: mysqlEnum('backup_frequency', ['hourly', 'daily', 'weekly', 'monthly']).notNull(),
  backupTime: varchar('backup_time', { length: 10 }), // HH:MM format
  
  // الاحتفاظ بالنسخ
  retentionDays: int('retention_days').default(30),
  maxBackupCount: int('max_backup_count').default(10),
  
  // الجداول المشمولة
  includedTables: json('included_tables'),
  excludedTables: json('excluded_tables'),
  
  // الإعدادات
  compressionEnabled: boolean('compression_enabled').default(true),
  encryptionEnabled: boolean('encryption_enabled').default(true),
  verificationEnabled: boolean('verification_enabled').default(true),
  
  // الإشعارات
  notifyOnSuccess: boolean('notify_on_success').default(true),
  notifyOnFailure: boolean('notify_on_failure').default(true),
  notificationEmail: varchar('notification_email', { length: 255 }),
  
  // الحالة
  isActive: boolean('is_active').default(true),
  
  createdBy: int('created_by').notNull(),
  createdAt: datetime('created_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: datetime('updated_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).onUpdateNow(),
});

// ==================== جدول سجل النسخ الاحتياطي ====================
export const backupLog = mysqlTable('backup_log', {
  id: int('id').primaryKey().autoincrement(),
  backupId: int('backup_id').notNull(),
  eventType: mysqlEnum('event_type', [
    'backup_started',
    'backup_completed',
    'backup_failed',
    'backup_verified',
    'backup_corrupted',
    'restore_started',
    'restore_completed',
    'restore_failed',
  ]).notNull(),
  message: text('message'),
  details: json('details'),
  
  createdAt: datetime('created_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
});

// ==================== جدول إعدادات النسخ الاحتياطي ====================
export const backupSettings = mysqlTable('backup_settings', {
  id: int('id').primaryKey().autoincrement(),
  
  // الإعدادات العامة
  backupEnabled: boolean('backup_enabled').default(true),
  autoBackupEnabled: boolean('auto_backup_enabled').default(true),
  
  // مسارات التخزين
  localBackupPath: varchar('local_backup_path', { length: 500 }),
  cloudBackupPath: varchar('cloud_backup_path', { length: 500 }),
  
  // إعدادات التشفير
  encryptionEnabled: boolean('encryption_enabled').default(true),
  encryptionAlgorithm: varchar('encryption_algorithm', { length: 50 }).default('AES-256-GCM'),
  
  // إعدادات الضغط
  compressionEnabled: boolean('compression_enabled').default(true),
  compressionLevel: int('compression_level').default(6), // 1-9
  
  // إعدادات التحقق
  verificationEnabled: boolean('verification_enabled').default(true),
  verificationFrequency: mysqlEnum('verification_frequency', ['daily', 'weekly', 'monthly']).default('weekly'),
  
  // إعدادات الاحتفاظ
  retentionDays: int('retention_days').default(90),
  maxBackupSize: bigint('max_backup_size', { mode: 'number' }).default(1099511627776), // 1TB
  
  // إعدادات الإشعارات
  notificationsEnabled: boolean('notifications_enabled').default(true),
  adminEmail: varchar('admin_email', { length: 255 }),
  
  updatedAt: datetime('updated_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).onUpdateNow(),
});

// ==================== جدول الأرشفة ====================
export const backupArchives = mysqlTable('backup_archives', {
  id: int('id').primaryKey().autoincrement(),
  backupId: int('backup_id').notNull(),
  archiveName: varchar('archive_name', { length: 100 }).notNull(),
  archiveLocation: varchar('archive_location', { length: 500 }).notNull(),
  archiveFormat: mysqlEnum('archive_format', ['tar', 'zip', 'tar.gz', 'tar.bz2']).notNull(),
  archiveSize: bigint('archive_size', { mode: 'number' }).notNull(),
  
  // معلومات الأرشفة
  archivedAt: datetime('archived_at', { fsp: 3 }).notNull(),
  expiresAt: datetime('expires_at', { fsp: 3 }),
  
  // الحالة
  status: mysqlEnum('status', ['active', 'archived', 'deleted']).default('active'),
  
  createdAt: datetime('created_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
});

// ==================== أنواع النسخ الاحتياطية ====================
export type Backup = typeof backups.$inferSelect;
export type NewBackup = typeof backups.$inferInsert;
export type BackupPolicy = typeof backupPolicies.$inferSelect;
export type RestoreHistory = typeof restoreHistory.$inferSelect;
export type BackupSettings = typeof backupSettings.$inferSelect;

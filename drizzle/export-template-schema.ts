import { mysqlTable, varchar, text, int, boolean, datetime, json, enum as mysqlEnum } from 'drizzle-orm/mysql-core';
import { users } from './schema';

/**
 * جداول قوالب التصدير
 * Export Template Tables
 */

// ==================== جدول القوالب الرئيسي ====================

export const exportTemplates = mysqlTable('export_templates', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id),
  
  // معلومات القالب
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  templateType: mysqlEnum('template_type', ['invoices', 'payments', 'shipments', 'customs', 'all']).notNull(),
  exportFormat: mysqlEnum('export_format', ['csv', 'json', 'xml', 'excel']).notNull(),
  
  // الحقول المختارة
  selectedFields: json('selected_fields').$type<string[]>(),
  excludedFields: json('excluded_fields').$type<string[]>(),
  
  // خيارات التصدير
  includeMetadata: boolean('include_metadata').default(true),
  compress: boolean('compress').default(false),
  delimiter: varchar('delimiter', { length: 10 }).default(','),
  encoding: varchar('encoding', { length: 50 }).default('utf-8'),
  
  // خيارات التنسيق
  dateFormat: varchar('date_format', { length: 50 }).default('YYYY-MM-DD'),
  numberFormat: varchar('number_format', { length: 50 }).default('0.00'),
  currencySymbol: varchar('currency_symbol', { length: 10 }).default('د.ا'),
  
  // خيارات الفرز والتصفية
  sortBy: json('sort_by').$type<Array<{ field: string; order: 'asc' | 'desc' }>>(),
  filters: json('filters').$type<Array<{ field: string; operator: string; value: any }>>(),
  
  // الحقول المحسوبة
  customFields: json('custom_fields').$type<Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'formula';
    formula?: string;
  }>>(),
  
  // الإعدادات المتقدمة
  groupBy: json('group_by').$type<string[]>(),
  aggregations: json('aggregations').$type<Array<{ field: string; function: 'sum' | 'avg' | 'count' | 'min' | 'max' }>>(),
  
  // الحالة
  isDefault: boolean('is_default').default(false),
  isPublic: boolean('is_public').default(false),
  
  // الإحصائيات
  usageCount: int('usage_count').default(0),
  lastUsedAt: datetime('last_used_at'),
  
  // البيانات الوصفية
  createdAt: datetime('created_at').defaultFn(() => new Date()),
  updatedAt: datetime('updated_at').defaultFn(() => new Date()),
});

// ==================== جدول تاريخ استخدام القوالب ====================

export const templateUsageHistory = mysqlTable('template_usage_history', {
  id: int('id').primaryKey().autoincrement(),
  templateId: int('template_id').notNull().references(() => exportTemplates.id),
  userId: int('user_id').notNull().references(() => users.id),
  
  // معلومات الاستخدام
  usageType: mysqlEnum('usage_type', ['preview', 'export', 'schedule']).notNull(),
  recordCount: int('record_count'),
  fileSize: int('file_size'),
  
  // الحالة والنتيجة
  status: mysqlEnum('status', ['success', 'failed', 'pending']).default('pending'),
  errorMessage: text('error_message'),
  
  // المعاملات
  startedAt: datetime('started_at'),
  completedAt: datetime('completed_at'),
  duration: int('duration'), // بالميلي ثانية
  
  // البيانات الوصفية
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  
  createdAt: datetime('created_at').defaultFn(() => new Date()),
});

// ==================== جدول القوالب المشتركة ====================

export const sharedTemplates = mysqlTable('shared_templates', {
  id: int('id').primaryKey().autoincrement(),
  templateId: int('template_id').notNull().references(() => exportTemplates.id),
  ownerId: int('owner_id').notNull().references(() => users.id),
  
  // معلومات المشاركة
  sharedWithUserId: int('shared_with_user_id').references(() => users.id),
  shareType: mysqlEnum('share_type', ['user', 'team', 'organization', 'public']).notNull(),
  
  // الصلاحيات
  canView: boolean('can_view').default(true),
  canEdit: boolean('can_edit').default(false),
  canDelete: boolean('can_delete').default(false),
  canShare: boolean('can_share').default(false),
  
  // البيانات الوصفية
  sharedAt: datetime('shared_at').defaultFn(() => new Date()),
  expiresAt: datetime('expires_at'),
  
  createdAt: datetime('created_at').defaultFn(() => new Date()),
  updatedAt: datetime('updated_at').defaultFn(() => new Date()),
});

// ==================== جدول القوالب المجدولة ====================

export const scheduledExports = mysqlTable('scheduled_exports', {
  id: int('id').primaryKey().autoincrement(),
  templateId: int('template_id').notNull().references(() => exportTemplates.id),
  userId: int('user_id').notNull().references(() => users.id),
  
  // معلومات الجدولة
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  
  // الجدول الزمني
  frequency: mysqlEnum('frequency', ['once', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']).notNull(),
  dayOfWeek: int('day_of_week'), // 0-6 (الأحد-السبت)
  dayOfMonth: int('day_of_month'), // 1-31
  time: varchar('time', { length: 8 }).default('09:00'), // HH:MM
  timezone: varchar('timezone', { length: 50 }).default('Asia/Amman'),
  
  // خيارات الإرسال
  sendViaEmail: boolean('send_via_email').default(true),
  emailRecipients: json('email_recipients').$type<string[]>(),
  emailSubject: varchar('email_subject', { length: 255 }),
  emailMessage: text('email_message'),
  
  // خيارات التخزين
  saveToStorage: boolean('save_to_storage').default(false),
  storagePath: varchar('storage_path', { length: 255 }),
  
  // الحالة
  isActive: boolean('is_active').default(true),
  lastExecutedAt: datetime('last_executed_at'),
  nextExecutionAt: datetime('next_execution_at'),
  
  // الإحصائيات
  executionCount: int('execution_count').default(0),
  failureCount: int('failure_count').default(0),
  
  // البيانات الوصفية
  createdAt: datetime('created_at').defaultFn(() => new Date()),
  updatedAt: datetime('updated_at').defaultFn(() => new Date()),
});

// ==================== جدول القوالب المفضلة ====================

export const favoriteTemplates = mysqlTable('favorite_templates', {
  id: int('id').primaryKey().autoincrement(),
  templateId: int('template_id').notNull().references(() => exportTemplates.id),
  userId: int('user_id').notNull().references(() => users.id),
  
  // ترتيب المفضلة
  order: int('order').default(0),
  
  // البيانات الوصفية
  addedAt: datetime('added_at').defaultFn(() => new Date()),
});

// ==================== جدول إصدارات القالب ====================

export const templateVersions = mysqlTable('template_versions', {
  id: int('id').primaryKey().autoincrement(),
  templateId: int('template_id').notNull().references(() => exportTemplates.id),
  userId: int('user_id').notNull().references(() => users.id),
  
  // معلومات الإصدار
  versionNumber: int('version_number').notNull(),
  changeDescription: text('change_description'),
  
  // بيانات الإصدار
  templateData: json('template_data').$type<any>(),
  
  // البيانات الوصفية
  createdAt: datetime('created_at').defaultFn(() => new Date()),
});

// ==================== أنواع التصدير ====================

export type ExportTemplate = typeof exportTemplates.$inferSelect;
export type NewExportTemplate = typeof exportTemplates.$inferInsert;

export type TemplateUsageHistory = typeof templateUsageHistory.$inferSelect;
export type NewTemplateUsageHistory = typeof templateUsageHistory.$inferInsert;

export type SharedTemplate = typeof sharedTemplates.$inferSelect;
export type NewSharedTemplate = typeof sharedTemplates.$inferInsert;

export type ScheduledExport = typeof scheduledExports.$inferSelect;
export type NewScheduledExport = typeof scheduledExports.$inferInsert;

export type FavoriteTemplate = typeof favoriteTemplates.$inferSelect;
export type NewFavoriteTemplate = typeof favoriteTemplates.$inferInsert;

export type TemplateVersion = typeof templateVersions.$inferSelect;
export type NewTemplateVersion = typeof templateVersions.$inferInsert;

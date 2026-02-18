/**
 * Contact Form Schema
 * 
 * @module ./drizzle/contact-schema
 */
import {
  varchar,
  text,
  timestamp,
  mysqlEnum,
  boolean,
  int,
  mysqlTable,
  index
} from "drizzle-orm/mysql-core";

/**
 * جدول رسائل الاتصال
 * يخزن جميع رسائل الاتصال المرسلة من قبل الزوار
 */
export const contactMessages = mysqlTable('contact_messages', {
  id: varchar('id', { length: 36 }).primaryKey(),
  
  // معلومات المرسل
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  company: varchar('company', { length: 255 }),
  
  // معلومات الرسالة
  subject: varchar('subject', { length: 255 }).notNull(),
  category: mysqlEnum('category', [
    'general_inquiry',
    'technical_support',
    'billing',
    'partnership',
    'feedback',
    'complaint',
    'other'
  ]).notNull(),
  message: text('message').notNull(),
  
  // حالة الرسالة
  status: mysqlEnum('status', [
    'new',
    'read',
    'in_progress',
    'resolved',
    'closed'
  ]).default('new').notNull(),
  
  // معلومات الرد
  adminReply: text('admin_reply'),
  repliedBy: varchar('replied_by', { length: 64 }),
  repliedAt: timestamp('replied_at'),
  
  // معلومات إضافية
  attachmentUrl: varchar('attachment_url', { length: 500 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  priority: mysqlEnum('priority', ['low', 'medium', 'high']).default('medium').notNull(),
  isSpam: boolean('is_spam').default(false),
  
  // الطوابع الزمنية
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
  statusIdx: index('status_idx').on(table.status),
  categoryIdx: index('category_idx').on(table.category),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
}));

/**
 * جدول قالب البريد الإلكتروني للاتصال
 * يخزن قوالب البريد الإلكتروني المخصصة
 */
export const contactEmailTemplates = mysqlTable('contact_email_templates', {
  id: varchar('id', { length: 36 }).primaryKey(),
  
  // معلومات القالب
  name: varchar('name', { length: 255 }).notNull(),
  templateType: mysqlEnum('template_type', [
    'confirmation',
    'admin_notification',
    'reply',
    'auto_response'
  ]).notNull(),
  
  // محتوى القالب
  subject: varchar('subject', { length: 255 }).notNull(),
  body: text('body').notNull(),
  
  // متغيرات القالب
  variables: text('variables'), // JSON: ['name', 'email', 'subject', 'message', etc.]
  
  // الإعدادات
  isActive: boolean('is_active').default(true),
  isDefault: boolean('is_default').default(false),
  
  // الطوابع الزمنية
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * جدول إحصائيات الاتصال
 * يتتبع إحصائيات الرسائل والاستجابة
 */
export const contactStatistics = mysqlTable('contact_statistics', {
  id: varchar('id', { length: 36 }).primaryKey(),
  
  // الفترة الزمنية
  date: timestamp('date').notNull(),
  period: mysqlEnum('period', ['daily', 'weekly', 'monthly']).notNull(),
  
  // الإحصائيات
  totalMessages: int('total_messages').default(0),
  newMessages: int('new_messages').default(0),
  resolvedMessages: int('resolved_messages').default(0),
  averageResponseTime: int('average_response_time'), // بالدقائق
  
  // التصنيفات
  byCategory: text('by_category'), // JSON: { category: count }
  byPriority: text('by_priority'), // JSON: { priority: count }
  
  // الرضا
  satisfactionScore: int('satisfaction_score'), // من 1 إلى 5
  
  // الطوابع الزمنية
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  dateIdx: index('date_idx').on(table.date),
  periodIdx: index('period_idx').on(table.period),
}));

/**
 * جدول الإشعارات البريدية
 * يتتبع الإشعارات المرسلة عبر البريد الإلكتروني
 */
export const emailNotifications = mysqlTable('email_notifications', {
  id: varchar('id', { length: 36 }).primaryKey(),
  
  // معلومات الإشعار
  contactMessageId: varchar('contact_message_id', { length: 36 }).references(() => contactMessages.id),
  recipientEmail: varchar('recipient_email', { length: 255 }).notNull(),
  recipientType: mysqlEnum('recipient_type', [
    'customer',
    'admin',
    'support_team'
  ]).notNull(),
  
  // نوع الإشعار
  notificationType: mysqlEnum('notification_type', [
    'confirmation',
    'admin_alert',
    'reply',
    'auto_response'
  ]).notNull(),
  
  // حالة الإرسال
  status: mysqlEnum('status', [
    'pending',
    'sent',
    'failed',
    'bounced'
  ]).default('pending').notNull(),
  
  // محاولات الإرسال
  attemptCount: int('attempt_count').default(0),
  lastAttemptAt: timestamp('last_attempt_at'),
  failureReason: text('failure_reason'),
  
  // معلومات البريد
  subject: varchar('subject', { length: 255 }).notNull(),
  body: text('body').notNull(),
  
  // الطوابع الزمنية
  createdAt: timestamp('created_at').notNull().defaultNow(),
  sentAt: timestamp('sent_at'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  contactMessageIdIdx: index('contact_message_id_idx').on(table.contactMessageId),
  recipientEmailIdx: index('recipient_email_idx').on(table.recipientEmail),
  statusIdx: index('status_idx').on(table.status),
}));

// Export types
export type ContactMessage = typeof contactMessages.$inferSelect;
export type ContactMessageInsert = typeof contactMessages.$inferInsert;

export type ContactEmailTemplate = typeof contactEmailTemplates.$inferSelect;
export type ContactEmailTemplateInsert = typeof contactEmailTemplates.$inferInsert;

export type ContactStatistics = typeof contactStatistics.$inferSelect;
export type ContactStatisticsInsert = typeof contactStatistics.$inferInsert;

export type EmailNotification = typeof emailNotifications.$inferSelect;
export type EmailNotificationInsert = typeof emailNotifications.$inferInsert;

/**
 * نظام الدعم الحي والإشعارات المخصصة
 * 
 * @module ./drizzle/live-chat-schema
 * @description جداول قاعدة البيانات لنظام الدعم الحي والإشعارات المخصصة
 */

import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
} from "drizzle-orm/mysql-core";
import { users } from "./schema";

/**
 * جدول المحادثات الحية (Live Chat Conversations)
 * يحتفظ بسجل جميع المحادثات بين العملاء والدعم الفني
 */
export const liveChatConversations = mysqlTable("live_chat_conversations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  supportAgentId: int("support_agent_id").references(() => users.id),

  // معلومات المحادثة
  subject: varchar("subject", { length: 255 }).notNull(),
  status: mysqlEnum("status", [
    "open",
    "in_progress",
    "waiting_customer",
    "waiting_agent",
    "closed",
    "resolved",
  ])
    .default("open")
    .notNull(),

  // الأولوية
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"])
    .default("medium")
    .notNull(),

  // الفئة
  category: varchar("category", { length: 100 }).notNull(), // 'billing', 'technical', 'general', 'complaint'

  // الإحصائيات
  messageCount: int("message_count").default(0),
  firstResponseTime: timestamp("first_response_time"),
  resolvedTime: timestamp("resolved_time"),
  averageResponseTime: int("average_response_time"), // بالثواني

  // البيانات الإضافية
  tags: text("tags"), // JSON array
  metadata: text("metadata"), // JSON object

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  closedAt: timestamp("closed_at"),
});

export type LiveChatConversation = typeof liveChatConversations.$inferSelect;
export type InsertLiveChatConversation =
  typeof liveChatConversations.$inferInsert;

/**
 * جدول رسائل الدعم الحي (Live Chat Messages)
 * يحتفظ بسجل جميع الرسائل في المحادثات
 */
export const liveChatMessages = mysqlTable("live_chat_messages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  conversationId: varchar("conversation_id", { length: 36 })
    .notNull()
    .references(() => liveChatConversations.id),

  senderId: int("sender_id").notNull().references(() => users.id),
  senderType: mysqlEnum("sender_type", ["customer", "agent"]).notNull(),

  // محتوى الرسالة
  message: text("message").notNull(),
  messageType: mysqlEnum("message_type", ["text", "image", "file", "system"])
    .default("text")
    .notNull(),

  // الملفات المرفقة
  attachmentUrl: text("attachment_url"),
  attachmentName: varchar("attachment_name", { length: 255 }),
  attachmentSize: int("attachment_size"), // بالبايتات

  // الحالة
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),

  // التقييم
  rating: int("rating"), // 1-5 stars
  feedback: text("feedback"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type LiveChatMessage = typeof liveChatMessages.$inferSelect;
export type InsertLiveChatMessage = typeof liveChatMessages.$inferInsert;

/**
 * جدول الإشعارات المخصصة (Custom Notifications)
 * يسمح للمستخدمين بتخصيص الإشعارات حسب احتياجاتهم
 */
export const customNotifications = mysqlTable("custom_notifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),

  // معلومات الإشعار
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  notificationType: mysqlEnum("notification_type", [
    "order_status",
    "shipment_update",
    "payment_reminder",
    "customs_alert",
    "price_change",
    "system_update",
    "custom",
  ])
    .notNull(),

  // القنوات
  channels: text("channels").notNull(), // JSON array: ['email', 'sms', 'push', 'in_app']

  // التكرار
  frequency: mysqlEnum("frequency", [
    "immediately",
    "daily",
    "weekly",
    "monthly",
    "never",
  ])
    .default("immediately")
    .notNull(),

  // الشروط
  conditions: text("conditions"), // JSON object for filtering conditions

  // الحالة
  isActive: boolean("is_active").default(true),
  isEnabled: boolean("is_enabled").default(true),

  // الإحصائيات
  sentCount: int("sent_count").default(0),
  openedCount: int("opened_count").default(0),
  clickedCount: int("clicked_count").default(0),

  // الجدولة
  scheduledTime: timestamp("scheduled_time"),
  lastSentAt: timestamp("last_sent_at"),
  nextSendAt: timestamp("next_send_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type CustomNotification = typeof customNotifications.$inferSelect;
export type InsertCustomNotification = typeof customNotifications.$inferInsert;

/**
 * جدول قنوات الإشعارات (Notification Channels)
 * يحتفظ بتفاصيل قنوات الإشعارات المختلفة للمستخدم
 */
export const notificationChannels = mysqlTable("notification_channels", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),

  // نوع القناة
  channelType: mysqlEnum("channel_type", ["email", "sms", "push", "in_app"])
    .notNull(),

  // معلومات القناة
  channelAddress: varchar("channel_address", { length: 255 }).notNull(), // email, phone, device token
  channelName: varchar("channel_name", { length: 100 }),

  // الحالة
  isVerified: boolean("is_verified").default(false),
  verificationToken: varchar("verification_token", { length: 255 }),
  verificationSentAt: timestamp("verification_sent_at"),

  // الإعدادات
  isActive: boolean("is_active").default(true),
  isPrimary: boolean("is_primary").default(false),

  // الإحصائيات
  successCount: int("success_count").default(0),
  failureCount: int("failure_count").default(0),
  lastUsedAt: timestamp("last_used_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type NotificationChannel = typeof notificationChannels.$inferSelect;
export type InsertNotificationChannel = typeof notificationChannels.$inferInsert;

/**
 * جدول سجل الإشعارات (Notification History)
 * يحتفظ بسجل جميع الإشعارات المرسلة
 */
export const notificationHistory = mysqlTable("notification_history", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  notificationId: varchar("notification_id", { length: 36 }).references(
    () => customNotifications.id
  ),
  channelId: varchar("channel_id", { length: 36 }).references(
    () => notificationChannels.id
  ),

  // معلومات الإشعار
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  notificationType: varchar("notification_type", { length: 50 }).notNull(),

  // القناة المستخدمة
  sentVia: mysqlEnum("sent_via", ["email", "sms", "push", "in_app"]).notNull(),

  // الحالة
  status: mysqlEnum("status", [
    "pending",
    "sent",
    "delivered",
    "failed",
    "opened",
    "clicked",
  ])
    .default("pending")
    .notNull(),

  // البيانات
  recipientAddress: varchar("recipient_address", { length: 255 }),
  errorMessage: text("error_message"),

  // التتبع
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),

  // البيانات الإضافية
  metadata: text("metadata"), // JSON object

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type NotificationHistory = typeof notificationHistory.$inferSelect;
export type InsertNotificationHistory =
  typeof notificationHistory.$inferInsert;

/**
 * جدول قالب الإشعارات (Notification Templates)
 * يحتفظ بقوالب الإشعارات المخصصة
 */
export const notificationTemplates = mysqlTable("notification_templates", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),

  // معلومات القالب
  templateName: varchar("template_name", { length: 255 }).notNull(),
  templateType: mysqlEnum("template_type", [
    "email",
    "sms",
    "push",
    "in_app",
  ]).notNull(),

  // محتوى القالب
  subject: varchar("subject", { length: 255 }),
  body: text("body").notNull(),
  footer: text("footer"),

  // المتغيرات
  variables: text("variables"), // JSON array of variable names

  // الحالة
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),

  // الإحصائيات
  usageCount: int("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type InsertNotificationTemplate =
  typeof notificationTemplates.$inferInsert;

/**
 * جدول تفضيلات الإشعارات (Notification Preferences)
 * يحتفظ بتفضيلات الإشعارات للمستخدم
 */
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("user_id").notNull().unique().references(() => users.id),

  // الإشعارات العامة
  enableAllNotifications: boolean("enable_all_notifications").default(true),
  enableEmailNotifications: boolean("enable_email_notifications").default(true),
  enableSmsNotifications: boolean("enable_sms_notifications").default(true),
  enablePushNotifications: boolean("enable_push_notifications").default(true),
  enableInAppNotifications: boolean("enable_in_app_notifications").default(
    true
  ),

  // أنواع الإشعارات
  enableOrderStatusNotifications: boolean(
    "enable_order_status_notifications"
  ).default(true),
  enableShipmentNotifications: boolean("enable_shipment_notifications").default(
    true
  ),
  enablePaymentNotifications: boolean("enable_payment_notifications").default(
    true
  ),
  enableCustomsNotifications: boolean("enable_customs_notifications").default(
    true
  ),
  enablePriceAlertNotifications: boolean(
    "enable_price_alert_notifications"
  ).default(true),
  enableSystemNotifications: boolean("enable_system_notifications").default(
    true
  ),

  // أوقات الإشعارات
  quietHoursStart: varchar("quiet_hours_start", { length: 5 }), // HH:MM
  quietHoursEnd: varchar("quiet_hours_end", { length: 5 }), // HH:MM
  quietHoursEnabled: boolean("quiet_hours_enabled").default(false),

  // التكرار
  maxNotificationsPerDay: int("max_notifications_per_day").default(50),
  batchNotifications: boolean("batch_notifications").default(false),
  batchInterval: mysqlEnum("batch_interval", ["hourly", "daily", "weekly"])
    .default("daily"),

  // الإعدادات المتقدمة
  unsubscribeAll: boolean("unsubscribe_all").default(false),
  customPreferences: text("custom_preferences"), // JSON object

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type NotificationPreference =
  typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference =
  typeof notificationPreferences.$inferInsert;

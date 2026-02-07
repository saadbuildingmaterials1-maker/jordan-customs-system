/**
 * Subscription Plans and Trial Periods Schema
 * 
 * جداول الخطط الاشتراكية والفترات التجريبية
 * 
 * @module ./drizzle/subscription-schema
 */

import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  date,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * جدول الخطط الاشتراكية (Subscription Plans)
 * يحتوي على تعريف الخطط المختلفة
 */
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  
  // معلومات الخطة الأساسية
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  
  // معرّفات Stripe
  stripeProductId: varchar("stripeProductId", { length: 255 }).notNull().unique(),
  stripePriceIdMonthly: varchar("stripePriceIdMonthly", { length: 255 }),
  stripePriceIdYearly: varchar("stripePriceIdYearly", { length: 255 }),
  
  // الأسعار
  priceMonthly: decimal("priceMonthly", { precision: 12, scale: 2 }).notNull(),
  priceYearly: decimal("priceYearly", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("JOD").notNull(),
  
  // معلومات الفترة التجريبية
  trialDays: int("trialDays").default(7).notNull(), // عدد أيام الفترة التجريبية
  trialEnabled: boolean("trialEnabled").default(true).notNull(),
  
  // معلومات إضافية
  features: text("features"), // JSON array of features
  maxUsers: int("maxUsers").default(1), // عدد المستخدمين المسموح
  maxStorageGb: int("maxStorageGb").default(10), // مساحة التخزين بالجيجابايت
  supportLevel: mysqlEnum("supportLevel", ["basic", "standard", "premium"]).default("basic").notNull(),
  
  // الترتيب والعرض
  displayOrder: int("displayOrder").default(0).notNull(),
  isPopular: boolean("isPopular").default(false),
  
  // الحالة
  isActive: boolean("isActive").default(true).notNull(),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

/**
 * جدول الفترات التجريبية (Trial Periods)
 * يحتوي على معلومات الفترات التجريبية للمستخدمين
 */
export const trialPeriods = mysqlTable("trial_periods", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subscriptionPlanId: int("subscriptionPlanId").notNull(),
  
  // معلومات الفترة التجريبية
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  daysRemaining: int("daysRemaining").notNull(),
  
  // الحالة
  status: mysqlEnum("status", ["active", "expired", "converted", "canceled"]).default("active").notNull(),
  
  // معلومات إضافية
  autoConvertToSubscription: boolean("autoConvertToSubscription").default(true),
  paymentMethodRequired: boolean("paymentMethodRequired").default(false),
  
  // التواريخ
  convertedAt: timestamp("convertedAt"),
  canceledAt: timestamp("canceledAt"),
  cancelReason: varchar("cancelReason", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrialPeriod = typeof trialPeriods.$inferSelect;
export type InsertTrialPeriod = typeof trialPeriods.$inferInsert;

/**
 * جدول استرجاع المبالغ (Refunds with Trial Period)
 * يحتوي على معلومات استرجاع المبالغ المرتبطة بالفترات التجريبية
 */
export const trialRefunds = mysqlTable("trial_refunds", {
  id: int("id").autoincrement().primaryKey(),
  trialPeriodId: int("trialPeriodId").notNull(),
  userId: int("userId").notNull(),
  
  // معرّفات Stripe
  stripeRefundId: varchar("stripeRefundId", { length: 255 }).notNull().unique(),
  stripeChargeId: varchar("stripeChargeId", { length: 255 }),
  
  // معلومات المبلغ المسترجع
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("JOD").notNull(),
  
  // الحالة
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "canceled"]).default("pending").notNull(),
  
  // معلومات إضافية
  reason: varchar("reason", { length: 100 }).default("trial_period_cancellation"),
  notes: text("notes"),
  
  // التواريخ
  refundedAt: timestamp("refundedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrialRefund = typeof trialRefunds.$inferSelect;
export type InsertTrialRefund = typeof trialRefunds.$inferInsert;

/**
 * جدول تتبع الفعاليات (Subscription Events)
 * يحتوي على سجل الأحداث المرتبطة بالاشتراكات
 */
export const subscriptionEvents = mysqlTable("subscription_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  subscriptionId: int("subscriptionId"),
  trialPeriodId: int("trialPeriodId"),
  
  // نوع الحدث
  eventType: mysqlEnum("eventType", [
    "trial_started",
    "trial_ending_soon",
    "trial_expired",
    "trial_converted",
    "trial_canceled",
    "subscription_activated",
    "subscription_renewed",
    "subscription_canceled",
    "refund_initiated",
    "refund_completed",
    "refund_failed",
  ]).notNull(),
  
  // معلومات الحدث
  eventData: text("eventData"), // JSON data
  message: text("message"),
  
  // الحالة
  processed: boolean("processed").default(false),
  
  // التواريخ
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubscriptionEvent = typeof subscriptionEvents.$inferSelect;
export type InsertSubscriptionEvent = typeof subscriptionEvents.$inferInsert;

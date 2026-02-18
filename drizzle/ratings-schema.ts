import { mysqlTable, varchar, int, text, decimal, datetime, boolean, json, enum as mysqlEnum } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

/**
 * جداول نظام التقييمات
 * Ratings System Schema
 */

// ==================== جدول التقييمات الرئيسي ====================
export const shipmentRatings = mysqlTable('shipment_ratings', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  shipmentId: int('shipment_id').notNull(),
  trackingNumber: varchar('tracking_number', { length: 50 }).notNull(),
  companyCode: varchar('company_code', { length: 20 }).notNull(),
  
  // التقييمات
  overallRating: int('overall_rating').notNull(), // 1-5
  deliverySpeedRating: int('delivery_speed_rating').notNull(), // 1-5
  packageConditionRating: int('package_condition_rating').notNull(), // 1-5
  customerServiceRating: int('customer_service_rating').notNull(), // 1-5
  priceValueRating: int('price_value_rating').notNull(), // 1-5
  
  // التعليقات
  comment: text('comment'),
  wouldRecommend: boolean('would_recommend').default(true),
  
  // الحالة
  status: mysqlEnum('status', ['pending', 'approved', 'rejected', 'flagged']).default('pending'),
  isVerifiedPurchase: boolean('is_verified_purchase').default(true),
  
  // البيانات الوصفية
  createdAt: datetime('created_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: datetime('updated_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).onUpdateNow(),
  deletedAt: datetime('deleted_at', { fsp: 3 }),
});

// ==================== جدول صور التقييمات ====================
export const ratingImages = mysqlTable('rating_images', {
  id: int('id').primaryKey().autoincrement(),
  ratingId: int('rating_id').notNull(),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  imageKey: varchar('image_key', { length: 200 }).notNull(),
  caption: text('caption'),
  displayOrder: int('display_order').default(0),
  
  createdAt: datetime('created_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
});

// ==================== جدول الردود على التقييمات ====================
export const ratingReplies = mysqlTable('rating_replies', {
  id: int('id').primaryKey().autoincrement(),
  ratingId: int('rating_id').notNull(),
  companyId: int('company_id').notNull(),
  replyText: text('reply_text').notNull(),
  
  createdAt: datetime('created_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
  updatedAt: datetime('updated_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).onUpdateNow(),
});

// ==================== جدول إحصائيات التقييمات ====================
export const ratingStatistics = mysqlTable('rating_statistics', {
  id: int('id').primaryKey().autoincrement(),
  companyCode: varchar('company_code', { length: 20 }).notNull().unique(),
  
  // عدد التقييمات
  totalRatings: int('total_ratings').default(0),
  approvedRatings: int('approved_ratings').default(0),
  
  // متوسطات التقييمات
  averageOverallRating: decimal('average_overall_rating', { precision: 3, scale: 2 }).default('0.00'),
  averageDeliverySpeedRating: decimal('average_delivery_speed_rating', { precision: 3, scale: 2 }).default('0.00'),
  averagePackageConditionRating: decimal('average_package_condition_rating', { precision: 3, scale: 2 }).default('0.00'),
  averageCustomerServiceRating: decimal('average_customer_service_rating', { precision: 3, scale: 2 }).default('0.00'),
  averagePriceValueRating: decimal('average_price_value_rating', { precision: 3, scale: 2 }).default('0.00'),
  
  // النسب المئوية
  recommendationPercentage: decimal('recommendation_percentage', { precision: 5, scale: 2 }).default('0.00'),
  
  // التوزيع
  fiveStarCount: int('five_star_count').default(0),
  fourStarCount: int('four_star_count').default(0),
  threeStarCount: int('three_star_count').default(0),
  twoStarCount: int('two_star_count').default(0),
  oneStarCount: int('one_star_count').default(0),
  
  updatedAt: datetime('updated_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).onUpdateNow(),
});

// ==================== جدول الكلمات المفتاحية ====================
export const ratingKeywords = mysqlTable('rating_keywords', {
  id: int('id').primaryKey().autoincrement(),
  ratingId: int('rating_id').notNull(),
  keyword: varchar('keyword', { length: 100 }).notNull(),
  sentiment: mysqlEnum('sentiment', ['positive', 'negative', 'neutral']).default('neutral'),
  frequency: int('frequency').default(1),
  
  createdAt: datetime('created_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
});

// ==================== جدول التقارير ====================
export const ratingReports = mysqlTable('rating_reports', {
  id: int('id').primaryKey().autoincrement(),
  ratingId: int('rating_id').notNull(),
  reportedBy: int('reported_by').notNull(),
  reason: mysqlEnum('reason', [
    'inappropriate_content',
    'spam',
    'fake_review',
    'offensive_language',
    'competitor_review',
    'other',
  ]).notNull(),
  description: text('description'),
  status: mysqlEnum('status', ['pending', 'investigating', 'resolved', 'dismissed']).default('pending'),
  
  createdAt: datetime('created_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
  resolvedAt: datetime('resolved_at', { fsp: 3 }),
});

// ==================== جدول الإجراءات ====================
export const ratingActions = mysqlTable('rating_actions', {
  id: int('id').primaryKey().autoincrement(),
  ratingId: int('rating_id').notNull(),
  userId: int('user_id').notNull(),
  actionType: mysqlEnum('action_type', [
    'created',
    'updated',
    'approved',
    'rejected',
    'flagged',
    'replied',
    'reported',
  ]).notNull(),
  details: json('details'),
  
  createdAt: datetime('created_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
});

// ==================== جدول تفضيلات التقييمات ====================
export const ratingPreferences = mysqlTable('rating_preferences', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().unique(),
  
  // الإشعارات
  notifyOnReply: boolean('notify_on_reply').default(true),
  notifyOnRatingApproval: boolean('notify_on_rating_approval').default(true),
  
  // الخصوصية
  isAnonymous: boolean('is_anonymous').default(false),
  allowPublicDisplay: boolean('allow_public_display').default(true),
  
  // التفضيلات
  preferredLanguage: varchar('preferred_language', { length: 10 }).default('ar'),
  
  updatedAt: datetime('updated_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`).onUpdateNow(),
});

// ==================== جدول سجل التدقيق ====================
export const ratingAuditLog = mysqlTable('rating_audit_log', {
  id: int('id').primaryKey().autoincrement(),
  ratingId: int('rating_id').notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  performedBy: int('performed_by').notNull(),
  previousValue: json('previous_value'),
  newValue: json('new_value'),
  reason: text('reason'),
  
  createdAt: datetime('created_at', { fsp: 3 }).default(sql`CURRENT_TIMESTAMP(3)`),
});

// ==================== أنواع التقييمات ====================
export type ShipmentRating = typeof shipmentRatings.$inferSelect;
export type NewShipmentRating = typeof shipmentRatings.$inferInsert;
export type RatingImage = typeof ratingImages.$inferSelect;
export type RatingReply = typeof ratingReplies.$inferSelect;
export type RatingStatistics = typeof ratingStatistics.$inferSelect;
export type RatingReport = typeof ratingReports.$inferSelect;

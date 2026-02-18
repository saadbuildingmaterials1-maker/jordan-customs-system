import { mysqlTable, varchar, int, decimal, datetime, text, boolean, json, enum as mysqlEnum } from 'drizzle-orm/mysql-core';

/**
 * نظام تتبع الشحنات
 * Shipment Tracking System Schema
 */

// ==================== شركات الشحن ====================

export const shippingCompanies = mysqlTable('shipping_companies', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(), // اسم الشركة
  code: varchar('code', { length: 50 }).notNull().unique(), // كود الشركة
  country: varchar('country', { length: 100 }).notNull(), // الدولة
  apiKey: varchar('api_key', { length: 500 }), // مفتاح API
  apiUrl: varchar('api_url', { length: 500 }), // رابط API
  isActive: boolean('is_active').default(true), // هل الشركة نشطة
  supportedCountries: json('supported_countries').$type<string[]>(), // الدول المدعومة
  createdAt: datetime('created_at').defaultFn(() => new Date()),
  updatedAt: datetime('updated_at').defaultFn(() => new Date()),
});

// ==================== الشحنات ====================

export const shipments = mysqlTable('shipments', {
  id: int('id').primaryKey().autoincrement(),
  trackingNumber: varchar('tracking_number', { length: 100 }).notNull().unique(), // رقم التتبع
  invoiceId: int('invoice_id'), // معرف الفاتورة
  shippingCompanyId: int('shipping_company_id').notNull(), // معرف شركة الشحن
  sender: json('sender').$type<{
    name: string;
    address: string;
    phone: string;
    email: string;
  }>(), // بيانات المرسل
  recipient: json('recipient').$type<{
    name: string;
    address: string;
    phone: string;
    email: string;
  }>(), // بيانات المستقبل
  weight: decimal('weight', { precision: 10, scale: 2 }), // الوزن (كغ)
  dimensions: json('dimensions').$type<{
    length: number;
    width: number;
    height: number;
  }>(), // الأبعاد
  value: decimal('value', { precision: 12, scale: 2 }).notNull(), // قيمة الشحنة
  currency: varchar('currency', { length: 3 }).default('JOD'), // العملة
  contents: text('contents'), // محتويات الشحنة
  status: mysqlEnum('status', [
    'pending',
    'picked_up',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'failed',
    'returned',
    'lost',
  ]).default('pending'), // حالة الشحنة
  estimatedDelivery: datetime('estimated_delivery'), // التاريخ المتوقع للتسليم
  actualDelivery: datetime('actual_delivery'), // تاريخ التسليم الفعلي
  shippingCost: decimal('shipping_cost', { precision: 10, scale: 2 }), // تكلفة الشحن
  customsDuty: decimal('customs_duty', { precision: 10, scale: 2 }), // الرسوم الجمركية
  tax: decimal('tax', { precision: 10, scale: 2 }), // الضريبة
  totalCost: decimal('total_cost', { precision: 12, scale: 2 }), // التكلفة الإجمالية
  notes: text('notes'), // ملاحظات
  createdAt: datetime('created_at').defaultFn(() => new Date()),
  updatedAt: datetime('updated_at').defaultFn(() => new Date()),
});

// ==================== تحديثات التتبع ====================

export const trackingUpdates = mysqlTable('tracking_updates', {
  id: int('id').primaryKey().autoincrement(),
  shipmentId: int('shipment_id').notNull(), // معرف الشحنة
  status: varchar('status', { length: 50 }).notNull(), // الحالة
  location: varchar('location', { length: 255 }), // الموقع
  latitude: decimal('latitude', { precision: 10, scale: 7 }), // خط العرض
  longitude: decimal('longitude', { precision: 10, scale: 7 }), // خط الطول
  timestamp: datetime('timestamp').notNull(), // وقت التحديث
  description: text('description'), // الوصف
  carrier: varchar('carrier', { length: 100 }), // الناقل
  signature: varchar('signature', { length: 255 }), // التوقيع (اسم المستقبل)
  temperature: decimal('temperature', { precision: 5, scale: 2 }), // درجة الحرارة (للشحنات الحساسة)
  humidity: decimal('humidity', { precision: 5, scale: 2 }), // الرطوبة
  photos: json('photos').$type<string[]>(), // صور
  createdAt: datetime('created_at').defaultFn(() => new Date()),
});

// ==================== التنبيهات ====================

export const trackingAlerts = mysqlTable('tracking_alerts', {
  id: int('id').primaryKey().autoincrement(),
  shipmentId: int('shipment_id').notNull(), // معرف الشحنة
  userId: int('user_id').notNull(), // معرف المستخدم
  alertType: mysqlEnum('alert_type', [
    'picked_up',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'delayed',
    'failed_delivery',
    'customs_clearance',
    'lost',
  ]).notNull(), // نوع التنبيه
  title: varchar('title', { length: 255 }).notNull(), // العنوان
  message: text('message').notNull(), // الرسالة
  channels: json('channels').$type<('email' | 'sms' | 'push' | 'in_app')[]>(), // قنوات الإرسال
  isSent: boolean('is_sent').default(false), // هل تم الإرسال
  sentAt: datetime('sent_at'), // وقت الإرسال
  isRead: boolean('is_read').default(false), // هل تم القراءة
  readAt: datetime('read_at'), // وقت القراءة
  createdAt: datetime('created_at').defaultFn(() => new Date()),
});

// ==================== سجل التتبع ====================

export const trackingHistory = mysqlTable('tracking_history', {
  id: int('id').primaryKey().autoincrement(),
  shipmentId: int('shipment_id').notNull(), // معرف الشحنة
  action: varchar('action', { length: 100 }).notNull(), // الإجراء
  details: json('details'), // التفاصيل
  performedBy: varchar('performed_by', { length: 255 }), // من قام بالإجراء
  ipAddress: varchar('ip_address', { length: 45 }), // عنوان IP
  userAgent: text('user_agent'), // معلومات المتصفح
  createdAt: datetime('created_at').defaultFn(() => new Date()),
});

// ==================== إعدادات التتبع ====================

export const trackingSettings = mysqlTable('tracking_settings', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().unique(), // معرف المستخدم
  enableEmailNotifications: boolean('enable_email_notifications').default(true), // تفعيل إشعارات البريد
  enableSmsNotifications: boolean('enable_sms_notifications').default(true), // تفعيل إشعارات SMS
  enablePushNotifications: boolean('enable_push_notifications').default(true), // تفعيل إشعارات Push
  notifyOnPickup: boolean('notify_on_pickup').default(true), // إشعار عند الاستلام
  notifyOnInTransit: boolean('notify_on_in_transit').default(true), // إشعار أثناء النقل
  notifyOnDelivery: boolean('notify_on_delivery').default(true), // إشعار عند التسليم
  notifyOnDelay: boolean('notify_on_delay').default(true), // إشعار عند التأخير
  delayThreshold: int('delay_threshold').default(24), // عتبة التأخير (بالساعات)
  autoRefreshInterval: int('auto_refresh_interval').default(3600), // فترة التحديث التلقائي (بالثواني)
  createdAt: datetime('created_at').defaultFn(() => new Date()),
  updatedAt: datetime('updated_at').defaultFn(() => new Date()),
});

// ==================== معدل التسليم ====================

export const deliveryRatings = mysqlTable('delivery_ratings', {
  id: int('id').primaryKey().autoincrement(),
  shipmentId: int('shipment_id').notNull().unique(), // معرف الشحنة
  userId: int('user_id').notNull(), // معرف المستخدم
  rating: int('rating').notNull(), // التقييم (1-5)
  comment: text('comment'), // التعليق
  serviceQuality: int('service_quality'), // جودة الخدمة
  delivery Speed: int('delivery_speed'), // سرعة التسليم
  packaging: int('packaging'), // جودة التغليف
  communication: int('communication'), // التواصل
  createdAt: datetime('created_at').defaultFn(() => new Date()),
});

// ==================== الإحصائيات ====================

export const trackingStatistics = mysqlTable('tracking_statistics', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(), // معرف المستخدم
  totalShipments: int('total_shipments').default(0), // إجمالي الشحنات
  deliveredShipments: int('delivered_shipments').default(0), // الشحنات المسلمة
  failedShipments: int('failed_shipments').default(0), // الشحنات الفاشلة
  averageDeliveryTime: decimal('average_delivery_time', { precision: 10, scale: 2 }), // متوسط وقت التسليم
  averageRating: decimal('average_rating', { precision: 3, scale: 2 }), // متوسط التقييم
  totalValue: decimal('total_value', { precision: 15, scale: 2 }), // القيمة الإجمالية
  totalShippingCost: decimal('total_shipping_cost', { precision: 15, scale: 2 }), // إجمالي تكاليف الشحن
  lastUpdated: datetime('last_updated').defaultFn(() => new Date()),
});

// ==================== أنواع التصدير ====================

export type ShippingCompany = typeof shippingCompanies.$inferSelect;
export type Shipment = typeof shipments.$inferSelect;
export type TrackingUpdate = typeof trackingUpdates.$inferSelect;
export type TrackingAlert = typeof trackingAlerts.$inferSelect;
export type TrackingHistory = typeof trackingHistory.$inferSelect;
export type TrackingSettings = typeof trackingSettings.$inferSelect;
export type DeliveryRating = typeof deliveryRatings.$inferSelect;
export type TrackingStatistics = typeof trackingStatistics.$inferSelect;

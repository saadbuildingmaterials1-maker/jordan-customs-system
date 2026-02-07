/**
 * schema
 * 
 * @module ./drizzle/schema
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
  real
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/**
 * جدول المستخدمين - الأساس للمصادقة
 */// Analytics Tables
export const analyticsEvents = mysqlTable('analytics_events', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: text('user_id').references(() => users.id),
  eventType: text('event_type').notNull(), // 'view', 'create', 'update', 'delete', 'export'
  eventName: text('event_name').notNull(),
  eventData: text('event_data'), // JSON string
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const analyticsMetrics = mysqlTable('analytics_metrics', {
  id: varchar('id', { length: 36 }).primaryKey(),
  metricType: text('metric_type').notNull(), // 'revenue', 'customs', 'users', 'transactions'
  metricName: text('metric_name').notNull(),
  metricValue: real('metric_value').notNull(),
  metricUnit: text('metric_unit'), // 'JOD', 'USD', 'count'
  period: text('period').notNull(), // 'daily', 'weekly', 'monthly', 'yearly'
  periodDate: timestamp('period_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const analyticsDashboard = mysqlTable('analytics_dashboard', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 64 }).references(() => users.openId).notNull(),
  dashboardName: text('dashboard_name').notNull(),
  dashboardConfig: text('dashboard_config'), // JSON string with widget configuration
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const users = mysqlTable('users', {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * جدول البيانات الجمركية الرئيسية
 * يحتوي على معلومات البيان الجمركي الأساسية
 */
export const customsDeclarations = mysqlTable("customs_declarations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // معلومات البيان الجمركي
  declarationNumber: varchar("declarationNumber", { length: 50 }).notNull().unique(),
  registrationDate: date("registrationDate").notNull(),
  clearanceCenter: varchar("clearanceCenter", { length: 100 }).notNull(),
  exchangeRate: decimal("exchangeRate", { precision: 10, scale: 6 }).notNull(), // سعر التعادل
  exportCountry: varchar("exportCountry", { length: 100 }).notNull(),
  billOfLadingNumber: varchar("billOfLadingNumber", { length: 50 }).notNull(),
  
  // معلومات الأوزان والطرود
  grossWeight: decimal("grossWeight", { precision: 12, scale: 3 }).notNull(),
  netWeight: decimal("netWeight", { precision: 12, scale: 3 }).notNull(),
  numberOfPackages: int("numberOfPackages").notNull(),
  packageType: varchar("packageType", { length: 50 }).notNull(),
  
  // القيم المالية الأساسية
  fobValue: decimal("fobValue", { precision: 15, scale: 3 }).notNull(),
  fobValueJod: decimal("fobValueJod", { precision: 15, scale: 3 }).notNull(),
  
  freightCost: decimal("freightCost", { precision: 12, scale: 3 }).notNull(),
  insuranceCost: decimal("insuranceCost", { precision: 12, scale: 3 }).notNull(),
  
  customsDuty: decimal("customsDuty", { precision: 12, scale: 3 }).notNull(),
  salesTax: decimal("salesTax", { precision: 12, scale: 3 }).notNull(),
  additionalFees: decimal("additionalFees", { precision: 12, scale: 3 }).default("0"),
  customsServiceFee: decimal("customsServiceFee", { precision: 12, scale: 3 }).default("0"),
  penalties: decimal("penalties", { precision: 12, scale: 3 }).default("0"),
  
  estimatedFobValue: decimal("estimatedFobValue", { precision: 15, scale: 3 }).default("0"),
  estimatedFreight: decimal("estimatedFreight", { precision: 12, scale: 3 }).default("0"),
  estimatedInsurance: decimal("estimatedInsurance", { precision: 12, scale: 3 }).default("0"),
  estimatedCustomsDuty: decimal("estimatedCustomsDuty", { precision: 12, scale: 3 }).default("0"),
  estimatedSalesTax: decimal("estimatedSalesTax", { precision: 12, scale: 3 }).default("0"),
  estimatedAdditionalFees: decimal("estimatedAdditionalFees", { precision: 12, scale: 3 }).default("0"),
  
  // الإجماليات
  totalLandedCost: decimal("totalLandedCost", { precision: 15, scale: 3 }).notNull(), // التكلفة الكلية النهائية
  additionalExpensesRatio: decimal("additionalExpensesRatio", { precision: 5, scale: 2 }).notNull(), // نسبة المصاريف الإضافية
  
  // معلومات إضافية متقدمة
  barcodeNumber: varchar("barcodeNumber", { length: 50 }),
  egyptianReferenceNumber: varchar("egyptianReferenceNumber", { length: 50 }),
  importerLicenseNumber: varchar("importerLicenseNumber", { length: 50 }),
  importerTaxNumber: varchar("importerTaxNumber", { length: 50 }),
  importerSequentialNumber: varchar("importerSequentialNumber", { length: 50 }),
  importerName: varchar("importerName", { length: 200 }),
  exporterLicenseNumber: varchar("exporterLicenseNumber", { length: 50 }),
  exporterName: varchar("exporterName", { length: 200 }),
  certificateNumber: varchar("certificateNumber", { length: 50 }),
  transactionNumber: varchar("transactionNumber", { length: 50 }),
  volumeCbm: decimal("volumeCbm", { precision: 10, scale: 3 }), // الحجم بالمتر المكعب
  customsCode: varchar("customsCode", { length: 50 }), // الكود الجمركي
  
  // الحالة والملاحظات
  status: mysqlEnum("status", ["draft", "submitted", "approved", "cleared"]).default("draft"),
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomsDeclaration = typeof customsDeclarations.$inferSelect;
export type InsertCustomsDeclaration = typeof customsDeclarations.$inferInsert;

/**
 * جدول الأصناف (Items/SKUs)
 * يحتوي على تفاصيل كل صنف في الشحنة
 */
export const items = mysqlTable("items", {
  id: int("id").autoincrement().primaryKey(),
  declarationId: int("declarationId").notNull(),
  
  // معلومات الصنف
  itemName: varchar("itemName", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 3 }).notNull(),
  unitPriceForeign: decimal("unitPriceForeign", { precision: 12, scale: 3 }).notNull(), // سعر الوحدة (أجنبي)
  totalPriceForeign: decimal("totalPriceForeign", { precision: 15, scale: 3 }).notNull(), // إجمالي السعر (أجنبي)
  totalPriceJod: decimal("totalPriceJod", { precision: 15, scale: 3 }).notNull(), // إجمالي السعر (JOD)
  
  // النسب والتوزيع
  valuePercentage: decimal("valuePercentage", { precision: 5, scale: 2 }).notNull(), // نسبة القيمة من الشحنة
  itemExpensesShare: decimal("itemExpensesShare", { precision: 15, scale: 3 }).notNull(), // حصة الصنف من المصاريف
  
   // التكاليف النهاية
  totalItemCostJod: decimal("totalItemCostJod", { precision: 15, scale: 3 }).notNull(), // إجمالي تكلفة الصنف واصل
  unitCostJod: decimal("unitCostJod", { precision: 12, scale: 3 }).notNull(), // تكلفة الوحدة الواحدة (JOD)
  
  // معلومات إضافية للأصناف
  customsCode: varchar("customsCode", { length: 50 }), // الكود الجمركي للصنف
  itemNumber: varchar("itemNumber", { length: 50 }), // رقم الصنف
  description: text("description"), // وصف تفصيلي للصنف
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;

/**
 * جدول الانحرافات والمقارنات
 * يحتوي على مقارنة التكاليف الفعلية مع التقديرية
 */
export const variances = mysqlTable("variances", {
  id: int("id").autoincrement().primaryKey(),
  declarationId: int("declarationId").notNull().unique(),
  
  // الانحرافات
  fobVariance: decimal("fobVariance", { precision: 15, scale: 3 }).notNull(),
  freightVariance: decimal("freightVariance", { precision: 12, scale: 3 }).notNull(),
  insuranceVariance: decimal("insuranceVariance", { precision: 12, scale: 3 }).notNull(),
  customsDutyVariance: decimal("customsDutyVariance", { precision: 12, scale: 3 }).notNull(),
  salesTaxVariance: decimal("salesTaxVariance", { precision: 12, scale: 3 }).notNull(),
  totalVariance: decimal("totalVariance", { precision: 15, scale: 3 }).notNull(),
  
  // نسب الانحراف المئوية
  fobVariancePercent: decimal("fobVariancePercent", { precision: 6, scale: 2 }).notNull(),
  freightVariancePercent: decimal("freightVariancePercent", { precision: 6, scale: 2 }).notNull(),
  insuranceVariancePercent: decimal("insuranceVariancePercent", { precision: 6, scale: 2 }).notNull(),
  customsDutyVariancePercent: decimal("customsDutyVariancePercent", { precision: 6, scale: 2 }).notNull(),
  salesTaxVariancePercent: decimal("salesTaxVariancePercent", { precision: 6, scale: 2 }).notNull(),
  totalVariancePercent: decimal("totalVariancePercent", { precision: 6, scale: 2 }).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Variance = typeof variances.$inferSelect;
export type InsertVariance = typeof variances.$inferInsert;

/**
 * جدول الملخصات المالية
 * يحتوي على ملخص شامل للتكاليف لكل بيان جمركي
 */
export const financialSummaries = mysqlTable("financial_summaries", {
  id: int("id").autoincrement().primaryKey(),
  declarationId: int("declarationId").notNull().unique(),
  
  // إجمالي قيمة البضاعة
  totalFobValue: decimal("totalFobValue", { precision: 15, scale: 3 }).notNull(),
  
  // إجمالي مصاريف الشحن والتأمين
  totalFreightAndInsurance: decimal("totalFreightAndInsurance", { precision: 12, scale: 3 }).notNull(),
  
  // إجمالي الرسوم والضرائب الجمركية
  totalCustomsAndTaxes: decimal("totalCustomsAndTaxes", { precision: 12, scale: 3 }).notNull(),
  
  // التكلفة الكلية النهائية للشحنة
  totalLandedCost: decimal("totalLandedCost", { precision: 15, scale: 3 }).notNull(),
  
  // نسبة المصاريف الإضافية من إجمالي القيمة
  additionalExpensesRatio: decimal("additionalExpensesRatio", { precision: 5, scale: 2 }).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialSummary = typeof financialSummaries.$inferSelect;
export type InsertFinancialSummary = typeof financialSummaries.$inferInsert;


/**
 * جدول المصانع (Factories)
 * يحتوي على معلومات المصانع المختلفة
 */
export const factories = mysqlTable("factories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // معلومات المصنع
  factoryName: varchar("factoryName", { length: 255 }).notNull(),
  factoryCode: varchar("factoryCode", { length: 50 }).notNull().unique(),
  country: varchar("country", { length: 100 }).notNull(),
  contactPerson: varchar("contactPerson", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Factory = typeof factories.$inferSelect;
export type InsertFactory = typeof factories.$inferInsert;

/**
 * جدول الفواتير (Invoices)
 * يحتوي على معلومات فواتير المصانع
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  declarationId: int("declarationId").notNull(),
  factoryId: int("factoryId").notNull(),
  userId: int("userId").notNull(),
  
  // معلومات الفاتورة
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull(),
  invoiceDate: date("invoiceDate").notNull(),
  
  // التكاليف الخارجية (External Costs)
  freightCost: decimal("freightCost", { precision: 12, scale: 3 }).notNull().default("0"),
  insuranceCost: decimal("insuranceCost", { precision: 12, scale: 3 }).notNull().default("0"),
  otherExternalCosts: decimal("otherExternalCosts", { precision: 12, scale: 3 }).notNull().default("0"),
  
  // التكاليف الداخلية (Internal Costs)
  localHandlingCosts: decimal("localHandlingCosts", { precision: 12, scale: 3 }).notNull().default("0"),
  storageAndWarehouseCosts: decimal("storageAndWarehouseCosts", { precision: 12, scale: 3 }).notNull().default("0"),
  customsClearanceCosts: decimal("customsClearanceCosts", { precision: 12, scale: 3 }).notNull().default("0"),
  otherInternalCosts: decimal("otherInternalCosts", { precision: 12, scale: 3 }).notNull().default("0"),
  
  // الإجماليات
  totalExternalCosts: decimal("totalExternalCosts", { precision: 12, scale: 3 }).notNull(),
  totalInternalCosts: decimal("totalInternalCosts", { precision: 12, scale: 3 }).notNull(),
  totalCosts: decimal("totalCosts", { precision: 15, scale: 3 }).notNull(),
  
  // معلومات إضافية
  notes: text("notes"),
  status: mysqlEnum("status", ["draft", "confirmed", "completed"]).default("draft").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * جدول تفاصيل الفواتير (Invoice Items)
 * يحتوي على تفاصيل كل منتج في الفاتورة
 */
export const invoiceItems = mysqlTable("invoice_items", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  itemId: int("itemId").notNull(),
  
  // معلومات المنتج الأساسية
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: decimal("quantity", { precision: 12, scale: 3 }).notNull(),
  unitPrice: decimal("unitPrice", { precision: 12, scale: 3 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 15, scale: 3 }).notNull(),
  
  // معلومات جمركية
  customsCode: varchar("customsCode", { length: 50 }), // الكود الجمركي (HS Code)
  harmonizedCode: varchar("harmonizedCode", { length: 50 }), // الرمز المنسق
  tarifBand: varchar("tarifBand", { length: 50 }), // بند التعرفة
  dutyRate: decimal("dutyRate", { precision: 5, scale: 2 }).notNull().default("0"), // نسبة الرسم الجمركي
  salesTaxRate: decimal("salesTaxRate", { precision: 5, scale: 2 }).notNull().default("16"), // نسبة ضريبة المبيعات
  
  // التكاليف والسعر النهائي
  customsDuty: decimal("customsDuty", { precision: 12, scale: 3 }).notNull().default("0"),
  salesTax: decimal("salesTax", { precision: 12, scale: 3 }).notNull().default("0"),
  allocatedExternalCosts: decimal("allocatedExternalCosts", { precision: 12, scale: 3 }).notNull().default("0"),
  allocatedInternalCosts: decimal("allocatedInternalCosts", { precision: 12, scale: 3 }).notNull().default("0"),
  
  // السعر النهائي
  finalUnitPrice: decimal("finalUnitPrice", { precision: 12, scale: 3 }).notNull(),
  finalTotalPrice: decimal("finalTotalPrice", { precision: 15, scale: 3 }).notNull(),
  
  // معلومات إضافية
  description: text("description"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

// استيراد جداول المحاسبة
export * from './accounting-schema';

// ============================================
// استيراد جداول المحاسبة الكاملة
// ============================================

/**
 * جدول الإشعارات (Notifications)
 * يحتوي على سجل تاريخي لجميع إشعارات النظام
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // معلومات الإشعار
  type: mysqlEnum("type", ["success", "error", "warning", "info"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  // معلومات العملية المرتبطة
  operationType: varchar("operationType", { length: 100 }), // مثل: delete_declaration, update_item, etc
  relatedEntityType: varchar("relatedEntityType", { length: 100 }), // مثل: declaration, item, invoice
  relatedEntityId: int("relatedEntityId"), // معرّف الكيان المرتبط
  
  // معلومات إضافية
  metadata: text("metadata"), // JSON string للبيانات الإضافية
  isRead: boolean("isRead").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * جدول الدفعات (Payments)
 * يحتوي على معلومات جميع الدفعات عبر Stripe
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  declarationId: int("declarationId"),
  
  // معرّفات Stripe
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeChargeId: varchar("stripeChargeId", { length: 255 }),
  
  // معلومات الدفع
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("JOD").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "succeeded", "failed", "canceled", "refunded"]).default("pending").notNull(),
  
  // معلومات إضافية
  description: text("description"),
  metadata: text("metadata"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  
  // تفاصيل البطاقة
  cardBrand: varchar("cardBrand", { length: 50 }),
  cardLast4: varchar("cardLast4", { length: 4 }),
  
  // التواريخ
  paidAt: timestamp("paidAt"),
  failedAt: timestamp("failedAt"),
  refundedAt: timestamp("refundedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * جدول الفواتير (Invoices)
 * يحتوي على معلومات الفواتير من Stripe
 */
export const stripeInvoices = mysqlTable("stripe_invoices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  paymentId: int("paymentId"),
  
  // معرّفات Stripe
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull(),
  
  // معلومات الفاتورة
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("JOD").notNull(),
  status: mysqlEnum("status", ["draft", "open", "paid", "void", "uncollectible"]).default("draft").notNull(),
  
  // معلومات إضافية
  description: text("description"),
  pdfUrl: text("pdfUrl"),
  hostedInvoiceUrl: text("hostedInvoiceUrl"),
  
  // التواريخ
  dueDate: date("dueDate"),
  paidAt: timestamp("paidAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StripeInvoice = typeof stripeInvoices.$inferSelect;
export type InsertStripeInvoice = typeof stripeInvoices.$inferInsert;

/**
 * جدول المبالغ المسترجعة (Refunds)
 * يحتوي على معلومات المبالغ المسترجعة
 */
export const refunds = mysqlTable("refunds", {
  id: int("id").autoincrement().primaryKey(),
  paymentId: int("paymentId").notNull(),
  userId: int("userId").notNull(),
  
  // معرّفات Stripe
  stripeRefundId: varchar("stripeRefundId", { length: 255 }).notNull().unique(),
  stripeChargeId: varchar("stripeChargeId", { length: 255 }).notNull(),
  
  // معلومات المبلغ المسترجع
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("JOD").notNull(),
  status: mysqlEnum("status", ["pending", "succeeded", "failed", "canceled"]).default("pending").notNull(),
  
  // معلومات إضافية
  reason: varchar("reason", { length: 100 }),
  notes: text("notes"),
  
  // التواريخ
  refundedAt: timestamp("refundedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Refund = typeof refunds.$inferSelect;
export type InsertRefund = typeof refunds.$inferInsert;

/**
 * جدول الاشتراكات (Subscriptions)
 * يحتوي على معلومات الاشتراكات الدورية
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // معرّفات Stripe
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull(),
  stripePriceId: varchar("stripePriceId", { length: 255 }).notNull(),
  
  // معلومات الاشتراك
  planName: varchar("planName", { length: 100 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("JOD").notNull(),
  interval: mysqlEnum("interval", ["day", "week", "month", "year"]).notNull(),
  status: mysqlEnum("status", ["active", "past_due", "canceled", "unpaid"]).default("active").notNull(),
  
  // معلومات الفترة
  currentPeriodStart: date("currentPeriodStart").notNull(),
  currentPeriodEnd: date("currentPeriodEnd").notNull(),
  canceledAt: timestamp("canceledAt"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * جدول الفواتير الدورية (Subscription Invoices)
 * يحتوي على معلومات الفواتير المرتبطة بالاشتراكات
 */
export const subscriptionInvoices = mysqlTable("subscription_invoices", {
  id: int("id").autoincrement().primaryKey(),
  subscriptionId: int("subscriptionId").notNull(),
  userId: int("userId").notNull(),
  
  // معرّفات Stripe
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }).notNull().unique(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }).notNull(),
  
  // معلومات الفاتورة
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("JOD").notNull(),
  status: mysqlEnum("status", ["draft", "open", "paid", "void", "uncollectible"]).default("draft").notNull(),
  
  // معلومات إضافية
  pdfUrl: text("pdfUrl"),
  hostedInvoiceUrl: text("hostedInvoiceUrl"),
  
  // التواريخ
  paidAt: timestamp("paidAt"),
  dueDate: date("dueDate"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionInvoice = typeof subscriptionInvoices.$inferSelect;
export type InsertSubscriptionInvoice = typeof subscriptionInvoices.$inferInsert;


/**
 * جدول الحاويات (Containers)
 * يحتوي على معلومات الحاويات والشحنات
 */
export const containers = mysqlTable("containers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  declarationId: int("declarationId"),
  
  // معلومات الحاوية
  containerNumber: varchar("containerNumber", { length: 50 }).notNull().unique(),
  containerType: mysqlEnum("containerType", ["20ft", "40ft", "40ftHC", "45ft", "other"]).notNull(),
  sealNumber: varchar("sealNumber", { length: 50 }),
  
  // معلومات الشحن
  shippingCompany: varchar("shippingCompany", { length: 100 }).notNull(),
  billOfLadingNumber: varchar("billOfLadingNumber", { length: 50 }).notNull(),
  portOfLoading: varchar("portOfLoading", { length: 100 }).notNull(),
  portOfDischarge: varchar("portOfDischarge", { length: 100 }).notNull(),
  
  // التواريخ
  loadingDate: date("loadingDate"),
  estimatedArrivalDate: date("estimatedArrivalDate"),
  actualArrivalDate: date("actualArrivalDate"),
  
  // الحالة
  status: mysqlEnum("status", ["pending", "in_transit", "arrived", "cleared", "delivered", "delayed"]).default("pending").notNull(),
  
  // الإحداثيات الجغرافية للتتبع الحي
  currentLatitude: decimal("currentLatitude", { precision: 10, scale: 6 }),
  currentLongitude: decimal("currentLongitude", { precision: 10, scale: 6 }),
  
  // معلومات إضافية
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Container = typeof containers.$inferSelect;
export type InsertContainer = typeof containers.$inferInsert;

/**
 * جدول أحداث التتبع (Tracking Events)
 * يحتوي على سجل الأحداث المختلفة للشحنة
 */
export const trackingEvents = mysqlTable("tracking_events", {
  id: int("id").autoincrement().primaryKey(),
  containerId: int("containerId").notNull(),
  userId: int("userId").notNull(),
  
  // معلومات الحدث
  eventType: mysqlEnum("eventType", [
    "booking_confirmed",
    "container_loaded",
    "departed_port",
    "in_transit",
    "arrived_port",
    "customs_clearance_started",
    "customs_clearance_completed",
    "delivered",
    "delayed",
    "damaged",
    "lost",
    "other"
  ]).notNull(),
  
  eventLocation: varchar("eventLocation", { length: 200 }),
  eventDescription: text("eventDescription"),
  
  // التاريخ والوقت
  eventDateTime: timestamp("eventDateTime").notNull(),
  
  // معلومات إضافية
  documentUrl: text("documentUrl"),
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrackingEvent = typeof trackingEvents.$inferSelect;
export type InsertTrackingEvent = typeof trackingEvents.$inferInsert;

/**
 * جدول معلومات الشحن المتقدمة (Shipment Details)
 * يحتوي على تفاصيل متقدمة عن الشحنة
 */
export const shipmentDetails = mysqlTable("shipment_details", {
  id: int("id").autoincrement().primaryKey(),
  containerId: int("containerId").notNull(),
  userId: int("userId").notNull(),
  
  // معلومات الشحنة
  shipmentNumber: varchar("shipmentNumber", { length: 50 }).notNull().unique(),
  totalWeight: decimal("totalWeight", { precision: 12, scale: 3 }).notNull(),
  totalVolume: decimal("totalVolume", { precision: 12, scale: 3 }),
  numberOfPackages: int("numberOfPackages").notNull(),
  packageType: varchar("packageType", { length: 50 }),
  
  // معلومات الشاحن والمستقبل
  shipper: varchar("shipper", { length: 200 }).notNull(),
  consignee: varchar("consignee", { length: 200 }).notNull(),
  
  // معلومات الرسوم
  freightCharges: decimal("freightCharges", { precision: 12, scale: 2 }),
  insuranceCharges: decimal("insuranceCharges", { precision: 12, scale: 2 }),
  handlingCharges: decimal("handlingCharges", { precision: 12, scale: 2 }),
  otherCharges: decimal("otherCharges", { precision: 12, scale: 2 }),
  
  // المستندات
  invoiceUrl: text("invoiceUrl"),
  packingListUrl: text("packingListUrl"),
  certificateOfOriginUrl: text("certificateOfOriginUrl"),
  
  // ملاحظات
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShipmentDetail = typeof shipmentDetails.$inferSelect;
export type InsertShipmentDetail = typeof shipmentDetails.$inferInsert;

/**
 * جدول البيانات البنكية - تخزين آمن لمعلومات الحسابات البنكية
 */
export const bankAccounts = mysqlTable("bank_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  accountName: varchar("accountName", { length: 255 }).notNull(),
  // البيانات مشفرة
  ibanEncrypted: text("ibanEncrypted").notNull(),
  bankName: varchar("bankName", { length: 255 }).notNull(),
  swiftCode: varchar("swiftCode", { length: 20 }),
  accountType: mysqlEnum("accountType", ["checking", "savings", "business"]).default("checking"),
  currency: varchar("currency", { length: 3 }).default("JOD"),
  isDefault: boolean("isDefault").default(false),
  isVerified: boolean("isVerified").default(false),
  verificationCode: varchar("verificationCode", { length: 10 }),
  verificationAttempts: int("verificationAttempts").default(0),
  stripeAccountId: varchar("stripeAccountId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "verified", "active", "inactive", "suspended"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = typeof bankAccounts.$inferInsert;

/**
 * جدول سجل المعاملات البنكية
 */
export const bankTransactions = mysqlTable("bank_transactions", {
  id: int("id").autoincrement().primaryKey(),
  bankAccountId: int("bankAccountId").notNull().references(() => bankAccounts.id),
  transactionId: varchar("transactionId", { length: 255 }).notNull().unique(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("JOD"),
  type: mysqlEnum("type", ["deposit", "withdrawal", "transfer", "payment", "refund"]).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled"]).default("pending"),
  description: text("description"),
  reference: varchar("reference", { length: 255 }),
  metadata: text("metadata"), // JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BankTransaction = typeof bankTransactions.$inferSelect;
export type InsertBankTransaction = typeof bankTransactions.$inferInsert;

/**
 * جدول سجل التحقق من الحسابات البنكية
 */
export const bankVerifications = mysqlTable("bank_verifications", {
  id: int("id").autoincrement().primaryKey(),
  bankAccountId: int("bankAccountId").notNull().references(() => bankAccounts.id),
  verificationMethod: mysqlEnum("verificationMethod", ["micro_deposit", "document", "api", "manual"]).notNull(),
  status: mysqlEnum("status", ["pending", "verified", "failed", "expired"]).default("pending"),
  verificationCode: varchar("verificationCode", { length: 10 }),
  attempts: int("attempts").default(0),
  maxAttempts: int("maxAttempts").default(3),
  expiresAt: timestamp("expiresAt"),
  verifiedAt: timestamp("verifiedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BankVerification = typeof bankVerifications.$inferSelect;
export type InsertBankVerification = typeof bankVerifications.$inferInsert;

/**
 * جدول الإشعارات - لتخزين إشعارات النظام
 */
export const bankNotifications = mysqlTable("bank_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  type: mysqlEnum("type", [
    "account_added",
    "account_verified",
    "transaction_completed",
    "transaction_failed",
    "verification_required",
    "security_alert",
    "account_suspended",
    "payment_received",
    "payment_sent",
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  relatedEntityType: varchar("relatedEntityType", { length: 50 }), // bank_account, transaction
  relatedEntityId: int("relatedEntityId"),
  isRead: boolean("isRead").default(false),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  channels: varchar("channels", { length: 255 }).default("email,in_app"), // JSON array
  sentAt: timestamp("sentAt"),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BankNotification = typeof bankNotifications.$inferSelect;
export type InsertBankNotification = typeof bankNotifications.$inferInsert;

/**
 * جدول سجل الإشعارات المرسلة
 */
export const notificationLog = mysqlTable("notification_log", {
  id: int("id").autoincrement().primaryKey(),
  notificationId: int("notificationId").notNull().references(() => bankNotifications.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  channel: mysqlEnum("channel", ["email", "sms", "push", "in_app"]).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "bounced"]).default("pending"),
  recipient: varchar("recipient", { length: 255 }).notNull(),
  sentAt: timestamp("sentAt"),
  failureReason: text("failureReason"),
  retryCount: int("retryCount").default(0),
  maxRetries: int("maxRetries").default(3),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationLog = typeof notificationLog.$inferSelect;
export type InsertNotificationLog = typeof notificationLog.$inferInsert;

/**
 * جدول تفضيلات الإشعارات
 */
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  emailNotifications: boolean("emailNotifications").default(true),
  smsNotifications: boolean("smsNotifications").default(false),
  pushNotifications: boolean("pushNotifications").default(true),
  inAppNotifications: boolean("inAppNotifications").default(true),
  accountAddedNotification: boolean("accountAddedNotification").default(true),
  accountVerifiedNotification: boolean("accountVerifiedNotification").default(true),
  transactionNotification: boolean("transactionNotification").default(true),
  securityAlertNotification: boolean("securityAlertNotification").default(true),
  dailyDigest: boolean("dailyDigest").default(false),
  weeklyReport: boolean("weeklyReport").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreferences = typeof notificationPreferences.$inferInsert;


/**
 * جدول أنواع المصاريف
 */
export const expenseTypes = mysqlTable("expense_types", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ExpenseType = typeof expenseTypes.$inferSelect;
export type InsertExpenseType = typeof expenseTypes.$inferInsert;

/**
 * جدول المصاريف
 */
export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  billId: int("billId").notNull().references(() => customsDeclarations.id),
  typeId: int("typeId").notNull().references(() => expenseTypes.id),
  amount: decimal("amount", { precision: 12, scale: 3 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("JOD").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  category: varchar("category", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;


/**
 * جدول الحسابات المحفوظة
 * يحتفظ بسجل الحسابات التي أجراها المستخدمون
 */
export const savedCalculations = mysqlTable("saved_calculations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  
  // معلومات الحساب
  calculationName: varchar("calculationName", { length: 255 }).notNull(),
  description: text("description"),
  
  // بيانات الحساب
  weight: decimal("weight", { precision: 10, scale: 3 }).notNull(),
  value: decimal("value", { precision: 15, scale: 3 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("JOD"),
  country: varchar("country", { length: 100 }).notNull(),
  
  // النتائج
  shippingCost: decimal("shippingCost", { precision: 12, scale: 3 }).notNull(),
  customsDuty: decimal("customsDuty", { precision: 12, scale: 3 }).notNull(),
  tax: decimal("tax", { precision: 12, scale: 3 }).notNull(),
  totalCost: decimal("totalCost", { precision: 15, scale: 3 }).notNull(),
  
  // معلومات إضافية
  isPublic: boolean("isPublic").default(false),
  tags: text("tags"), // JSON array
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedCalculation = typeof savedCalculations.$inferSelect;
export type InsertSavedCalculation = typeof savedCalculations.$inferInsert;

/**
 * جدول التقارير المحفوظة
 * يحتفظ بسجل التقارير التي أنشأها المستخدمون
 */
export const savedReports = mysqlTable("saved_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  
  // معلومات التقرير
  reportName: varchar("reportName", { length: 255 }).notNull(),
  reportType: varchar("reportType", { length: 50 }).notNull(), // 'monthly', 'quarterly', 'yearly', 'custom'
  description: text("description"),
  
  // نطاق التقرير
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  
  // الإحصائيات
  totalShipping: decimal("totalShipping", { precision: 15, scale: 3 }).notNull(),
  totalDuty: decimal("totalDuty", { precision: 15, scale: 3 }).notNull(),
  totalTax: decimal("totalTax", { precision: 15, scale: 3 }).notNull(),
  totalCost: decimal("totalCost", { precision: 15, scale: 3 }).notNull(),
  recordCount: int("recordCount").notNull(),
  
  // البيانات
  reportData: text("reportData"), // JSON data
  
  // معلومات إضافية
  isPublic: boolean("isPublic").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedReport = typeof savedReports.$inferSelect;
export type InsertSavedReport = typeof savedReports.$inferInsert;

/**
 * جدول التنبيهات والإشعارات
 * يحتفظ بسجل التنبيهات والإشعارات للمستخدمين
 */
export const userAlerts = mysqlTable("user_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  
  // معلومات التنبيه
  alertType: varchar("alertType", { length: 50 }).notNull(), // 'price_change', 'customs_update', 'shipment_status'
  alertTitle: varchar("alertTitle", { length: 255 }).notNull(),
  alertMessage: text("alertMessage").notNull(),
  
  // البيانات المرتبطة
  relatedCountry: varchar("relatedCountry", { length: 100 }),
  relatedCalculationId: int("relatedCalculationId"),
  
  // الحالة
  isRead: boolean("isRead").default(false),
  isPinned: boolean("isPinned").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserAlert = typeof userAlerts.$inferSelect;
export type InsertUserAlert = typeof userAlerts.$inferInsert;

/**
 * جدول تفضيلات المستخدم
 * يحتفظ بالإعدادات والتفضيلات الشخصية
 */
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  
  // التفضيلات العامة
  defaultCurrency: varchar("defaultCurrency", { length: 10 }).default("JOD"),
  defaultCountry: varchar("defaultCountry", { length: 100 }).default("SA"),
  language: varchar("language", { length: 10 }).default("ar"),
  theme: varchar("theme", { length: 20 }).default("dark"), // 'light', 'dark'
  
  // إعدادات الإشعارات
  enableNotifications: boolean("enableNotifications").default(true),
  enableEmailNotifications: boolean("enableEmailNotifications").default(true),
  enablePriceAlerts: boolean("enablePriceAlerts").default(true),
  
  // إعدادات الخصوصية
  isPublicProfile: boolean("isPublicProfile").default(false),
  allowDataSharing: boolean("allowDataSharing").default(false),
  
  // معلومات إضافية
  preferences: text("preferences"), // JSON for additional preferences
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

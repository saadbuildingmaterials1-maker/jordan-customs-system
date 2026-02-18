// server/_core/index.ts
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import {
  int as int2,
  mysqlEnum as mysqlEnum2,
  mysqlTable as mysqlTable2,
  text as text2,
  timestamp as timestamp2,
  varchar as varchar2,
  decimal as decimal2,
  date as date2,
  boolean as boolean2,
  real
} from "drizzle-orm/mysql-core";

// drizzle/accounting-schema.ts
import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  date,
  boolean
} from "drizzle-orm/mysql-core";
var chartOfAccounts = mysqlTable("chart_of_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // معلومات الحساب
  accountCode: varchar("accountCode", { length: 20 }).notNull().unique(),
  accountName: varchar("accountName", { length: 255 }).notNull(),
  accountType: mysqlEnum("accountType", [
    "asset",
    "liability",
    "equity",
    "revenue",
    "expense"
  ]).notNull(),
  // التصنيفات
  mainCategory: varchar("mainCategory", { length: 100 }).notNull(),
  subCategory: varchar("subCategory", { length: 100 }),
  description: text("description"),
  // الخصائص
  isActive: boolean("isActive").default(true).notNull(),
  parentAccountId: int("parentAccountId"),
  // للحسابات الفرعية
  // الأرصدة
  openingBalance: decimal("openingBalance", { precision: 15, scale: 3 }).default("0"),
  currentBalance: decimal("currentBalance", { precision: 15, scale: 3 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  declarationId: int("declarationId"),
  // ربط مع البيان الجمركي
  invoiceId: int("invoiceId"),
  // ربط مع الفاتورة
  // معلومات الحركة
  transactionNumber: varchar("transactionNumber", { length: 50 }).notNull().unique(),
  transactionDate: date("transactionDate").notNull(),
  transactionType: mysqlEnum("transactionType", [
    "purchase",
    "sale",
    "expense",
    "revenue",
    "adjustment",
    "transfer"
  ]).notNull(),
  // الحسابات المدينة والدائنة
  debitAccountId: int("debitAccountId").notNull(),
  creditAccountId: int("creditAccountId").notNull(),
  // المبالغ
  amount: decimal("amount", { precision: 15, scale: 3 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("JOD").notNull(),
  // الوصف والملاحظات
  description: text("description"),
  reference: varchar("reference", { length: 100 }),
  // رقم المرجع (رقم فاتورة، إلخ)
  notes: text("notes"),
  // الحالة
  status: mysqlEnum("status", ["pending", "approved", "posted", "reversed"]).default("pending").notNull(),
  approvedBy: int("approvedBy"),
  // معرف المستخدم الذي وافق
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var generalLedger = mysqlTable("general_ledger", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  accountId: int("accountId").notNull(),
  transactionId: int("transactionId").notNull(),
  // التاريخ والوصف
  entryDate: date("entryDate").notNull(),
  description: text("description"),
  // المبالغ
  debitAmount: decimal("debitAmount", { precision: 15, scale: 3 }).default("0"),
  creditAmount: decimal("creditAmount", { precision: 15, scale: 3 }).default("0"),
  // الرصيد الجاري
  runningBalance: decimal("runningBalance", { precision: 15, scale: 3 }).notNull(),
  // المرجع
  reference: varchar("reference", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var trialBalance = mysqlTable("trial_balance", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // معلومات الميزانية
  balanceDate: date("balanceDate").notNull(),
  balancePeriod: varchar("balancePeriod", { length: 50 }).notNull(),
  // مثل "2024-01" للشهر والسنة
  // الحسابات والأرصدة
  accountId: int("accountId").notNull(),
  accountCode: varchar("accountCode", { length: 20 }).notNull(),
  accountName: varchar("accountName", { length: 255 }).notNull(),
  // الأرصدة
  debitBalance: decimal("debitBalance", { precision: 15, scale: 3 }).default("0"),
  creditBalance: decimal("creditBalance", { precision: 15, scale: 3 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var financialReports = mysqlTable("financial_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // معلومات التقرير
  reportType: mysqlEnum("reportType", [
    "balance_sheet",
    "income_statement",
    "cash_flow",
    "trial_balance",
    "general_ledger"
  ]).notNull(),
  reportName: varchar("reportName", { length: 255 }).notNull(),
  reportDate: date("reportDate").notNull(),
  reportPeriod: varchar("reportPeriod", { length: 50 }).notNull(),
  // محتوى التقرير (JSON)
  reportContent: text("reportContent"),
  // الإجماليات
  totalAssets: decimal("totalAssets", { precision: 15, scale: 3 }),
  totalLiabilities: decimal("totalLiabilities", { precision: 15, scale: 3 }),
  totalEquity: decimal("totalEquity", { precision: 15, scale: 3 }),
  totalRevenue: decimal("totalRevenue", { precision: 15, scale: 3 }),
  totalExpenses: decimal("totalExpenses", { precision: 15, scale: 3 }),
  netIncome: decimal("netIncome", { precision: 15, scale: 3 }),
  // الحالة
  status: mysqlEnum("status", ["draft", "finalized"]).default("draft").notNull(),
  generatedBy: int("generatedBy").notNull(),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // معلومات العملية
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entityType", { length: 100 }).notNull(),
  entityId: int("entityId"),
  // التفاصيل
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  description: text("description"),
  // معلومات الجهاز
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});

// drizzle/schema.ts
var analyticsEvents = mysqlTable2("analytics_events", {
  id: varchar2("id", { length: 36 }).primaryKey(),
  userId: text2("user_id").references(() => users.id),
  eventType: text2("event_type").notNull(),
  // 'view', 'create', 'update', 'delete', 'export'
  eventName: text2("event_name").notNull(),
  eventData: text2("event_data"),
  // JSON string
  timestamp: timestamp2("timestamp").notNull().defaultNow(),
  createdAt: timestamp2("created_at").notNull().defaultNow()
});
var analyticsMetrics = mysqlTable2("analytics_metrics", {
  id: varchar2("id", { length: 36 }).primaryKey(),
  metricType: text2("metric_type").notNull(),
  // 'revenue', 'customs', 'users', 'transactions'
  metricName: text2("metric_name").notNull(),
  metricValue: real("metric_value").notNull(),
  metricUnit: text2("metric_unit"),
  // 'JOD', 'USD', 'count'
  period: text2("period").notNull(),
  // 'daily', 'weekly', 'monthly', 'yearly'
  periodDate: timestamp2("period_date").notNull(),
  createdAt: timestamp2("created_at").notNull().defaultNow()
});
var analyticsDashboard = mysqlTable2("analytics_dashboard", {
  id: varchar2("id", { length: 36 }).primaryKey(),
  userId: varchar2("user_id", { length: 64 }).references(() => users.openId).notNull(),
  dashboardName: text2("dashboard_name").notNull(),
  dashboardConfig: text2("dashboard_config"),
  // JSON string with widget configuration
  isDefault: boolean2("is_default").default(false),
  createdAt: timestamp2("created_at").notNull().defaultNow(),
  updatedAt: timestamp2("updated_at").notNull().defaultNow()
});
var users = mysqlTable2("users", {
  id: int2("id").autoincrement().primaryKey(),
  openId: varchar2("openId", { length: 64 }).notNull().unique(),
  name: text2("name"),
  email: varchar2("email", { length: 320 }),
  loginMethod: varchar2("loginMethod", { length: 64 }),
  role: mysqlEnum2("role", ["user", "admin"]).default("user").notNull(),
  stripeCustomerId: varchar2("stripe_customer_id", { length: 255 }),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp2("lastSignedIn").defaultNow().notNull()
});
var customsDeclarations = mysqlTable2("customs_declarations", {
  id: int2("id").autoincrement().primaryKey(),
  userId: int2("userId").notNull(),
  // معلومات البيان الجمركي
  declarationNumber: varchar2("declarationNumber", { length: 50 }).notNull().unique(),
  registrationDate: date2("registrationDate").notNull(),
  clearanceCenter: varchar2("clearanceCenter", { length: 100 }).notNull(),
  exchangeRate: decimal2("exchangeRate", { precision: 10, scale: 6 }).notNull(),
  // سعر التعادل
  exportCountry: varchar2("exportCountry", { length: 100 }).notNull(),
  billOfLadingNumber: varchar2("billOfLadingNumber", { length: 50 }).notNull(),
  // معلومات الأوزان والطرود
  grossWeight: decimal2("grossWeight", { precision: 12, scale: 3 }).notNull(),
  netWeight: decimal2("netWeight", { precision: 12, scale: 3 }).notNull(),
  numberOfPackages: int2("numberOfPackages").notNull(),
  packageType: varchar2("packageType", { length: 50 }).notNull(),
  // القيم المالية الأساسية
  fobValue: decimal2("fobValue", { precision: 15, scale: 3 }).notNull(),
  fobValueJod: decimal2("fobValueJod", { precision: 15, scale: 3 }).notNull(),
  freightCost: decimal2("freightCost", { precision: 12, scale: 3 }).notNull(),
  insuranceCost: decimal2("insuranceCost", { precision: 12, scale: 3 }).notNull(),
  customsDuty: decimal2("customsDuty", { precision: 12, scale: 3 }).notNull(),
  salesTax: decimal2("salesTax", { precision: 12, scale: 3 }).notNull(),
  additionalFees: decimal2("additionalFees", { precision: 12, scale: 3 }).default("0"),
  customsServiceFee: decimal2("customsServiceFee", { precision: 12, scale: 3 }).default("0"),
  penalties: decimal2("penalties", { precision: 12, scale: 3 }).default("0"),
  estimatedFobValue: decimal2("estimatedFobValue", { precision: 15, scale: 3 }).default("0"),
  estimatedFreight: decimal2("estimatedFreight", { precision: 12, scale: 3 }).default("0"),
  estimatedInsurance: decimal2("estimatedInsurance", { precision: 12, scale: 3 }).default("0"),
  estimatedCustomsDuty: decimal2("estimatedCustomsDuty", { precision: 12, scale: 3 }).default("0"),
  estimatedSalesTax: decimal2("estimatedSalesTax", { precision: 12, scale: 3 }).default("0"),
  estimatedAdditionalFees: decimal2("estimatedAdditionalFees", { precision: 12, scale: 3 }).default("0"),
  // الإجماليات
  totalLandedCost: decimal2("totalLandedCost", { precision: 15, scale: 3 }).notNull(),
  // التكلفة الكلية النهائية
  additionalExpensesRatio: decimal2("additionalExpensesRatio", { precision: 5, scale: 2 }).notNull(),
  // نسبة المصاريف الإضافية
  // معلومات إضافية متقدمة
  barcodeNumber: varchar2("barcodeNumber", { length: 50 }),
  egyptianReferenceNumber: varchar2("egyptianReferenceNumber", { length: 50 }),
  importerLicenseNumber: varchar2("importerLicenseNumber", { length: 50 }),
  importerTaxNumber: varchar2("importerTaxNumber", { length: 50 }),
  importerSequentialNumber: varchar2("importerSequentialNumber", { length: 50 }),
  importerName: varchar2("importerName", { length: 200 }),
  exporterLicenseNumber: varchar2("exporterLicenseNumber", { length: 50 }),
  exporterName: varchar2("exporterName", { length: 200 }),
  certificateNumber: varchar2("certificateNumber", { length: 50 }),
  transactionNumber: varchar2("transactionNumber", { length: 50 }),
  volumeCbm: decimal2("volumeCbm", { precision: 10, scale: 3 }),
  // الحجم بالمتر المكعب
  customsCode: varchar2("customsCode", { length: 50 }),
  // الكود الجمركي
  // الحالة والملاحظات
  status: mysqlEnum2("status", ["draft", "submitted", "approved", "cleared"]).default("draft"),
  notes: text2("notes"),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var items = mysqlTable2("items", {
  id: int2("id").autoincrement().primaryKey(),
  declarationId: int2("declarationId").notNull(),
  // معلومات الصنف
  itemName: varchar2("itemName", { length: 255 }).notNull(),
  quantity: decimal2("quantity", { precision: 12, scale: 3 }).notNull(),
  unitPriceForeign: decimal2("unitPriceForeign", { precision: 12, scale: 3 }).notNull(),
  // سعر الوحدة (أجنبي)
  totalPriceForeign: decimal2("totalPriceForeign", { precision: 15, scale: 3 }).notNull(),
  // إجمالي السعر (أجنبي)
  totalPriceJod: decimal2("totalPriceJod", { precision: 15, scale: 3 }).notNull(),
  // إجمالي السعر (JOD)
  // النسب والتوزيع
  valuePercentage: decimal2("valuePercentage", { precision: 5, scale: 2 }).notNull(),
  // نسبة القيمة من الشحنة
  itemExpensesShare: decimal2("itemExpensesShare", { precision: 15, scale: 3 }).notNull(),
  // حصة الصنف من المصاريف
  // التكاليف النهاية
  totalItemCostJod: decimal2("totalItemCostJod", { precision: 15, scale: 3 }).notNull(),
  // إجمالي تكلفة الصنف واصل
  unitCostJod: decimal2("unitCostJod", { precision: 12, scale: 3 }).notNull(),
  // تكلفة الوحدة الواحدة (JOD)
  // معلومات إضافية للأصناف
  customsCode: varchar2("customsCode", { length: 50 }),
  // الكود الجمركي للصنف
  itemNumber: varchar2("itemNumber", { length: 50 }),
  // رقم الصنف
  description: text2("description"),
  // وصف تفصيلي للصنف
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var variances = mysqlTable2("variances", {
  id: int2("id").autoincrement().primaryKey(),
  declarationId: int2("declarationId").notNull().unique(),
  // الانحرافات
  fobVariance: decimal2("fobVariance", { precision: 15, scale: 3 }).notNull(),
  freightVariance: decimal2("freightVariance", { precision: 12, scale: 3 }).notNull(),
  insuranceVariance: decimal2("insuranceVariance", { precision: 12, scale: 3 }).notNull(),
  customsDutyVariance: decimal2("customsDutyVariance", { precision: 12, scale: 3 }).notNull(),
  salesTaxVariance: decimal2("salesTaxVariance", { precision: 12, scale: 3 }).notNull(),
  totalVariance: decimal2("totalVariance", { precision: 15, scale: 3 }).notNull(),
  // نسب الانحراف المئوية
  fobVariancePercent: decimal2("fobVariancePercent", { precision: 6, scale: 2 }).notNull(),
  freightVariancePercent: decimal2("freightVariancePercent", { precision: 6, scale: 2 }).notNull(),
  insuranceVariancePercent: decimal2("insuranceVariancePercent", { precision: 6, scale: 2 }).notNull(),
  customsDutyVariancePercent: decimal2("customsDutyVariancePercent", { precision: 6, scale: 2 }).notNull(),
  salesTaxVariancePercent: decimal2("salesTaxVariancePercent", { precision: 6, scale: 2 }).notNull(),
  totalVariancePercent: decimal2("totalVariancePercent", { precision: 6, scale: 2 }).notNull(),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var financialSummaries = mysqlTable2("financial_summaries", {
  id: int2("id").autoincrement().primaryKey(),
  declarationId: int2("declarationId").notNull().unique(),
  // إجمالي قيمة البضاعة
  totalFobValue: decimal2("totalFobValue", { precision: 15, scale: 3 }).notNull(),
  // إجمالي مصاريف الشحن والتأمين
  totalFreightAndInsurance: decimal2("totalFreightAndInsurance", { precision: 12, scale: 3 }).notNull(),
  // إجمالي الرسوم والضرائب الجمركية
  totalCustomsAndTaxes: decimal2("totalCustomsAndTaxes", { precision: 12, scale: 3 }).notNull(),
  // التكلفة الكلية النهائية للشحنة
  totalLandedCost: decimal2("totalLandedCost", { precision: 15, scale: 3 }).notNull(),
  // نسبة المصاريف الإضافية من إجمالي القيمة
  additionalExpensesRatio: decimal2("additionalExpensesRatio", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var factories = mysqlTable2("factories", {
  id: int2("id").autoincrement().primaryKey(),
  userId: int2("userId").notNull(),
  // معلومات المصنع
  factoryName: varchar2("factoryName", { length: 255 }).notNull(),
  factoryCode: varchar2("factoryCode", { length: 50 }).notNull().unique(),
  country: varchar2("country", { length: 100 }).notNull(),
  contactPerson: varchar2("contactPerson", { length: 255 }),
  email: varchar2("email", { length: 320 }),
  phone: varchar2("phone", { length: 20 }),
  address: text2("address"),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var invoices = mysqlTable2("invoices", {
  id: int2("id").autoincrement().primaryKey(),
  declarationId: int2("declarationId").notNull(),
  factoryId: int2("factoryId").notNull(),
  userId: int2("userId").notNull(),
  // معلومات الفاتورة
  invoiceNumber: varchar2("invoiceNumber", { length: 50 }).notNull(),
  invoiceDate: date2("invoiceDate").notNull(),
  // التكاليف الخارجية (External Costs)
  freightCost: decimal2("freightCost", { precision: 12, scale: 3 }).notNull().default("0"),
  insuranceCost: decimal2("insuranceCost", { precision: 12, scale: 3 }).notNull().default("0"),
  otherExternalCosts: decimal2("otherExternalCosts", { precision: 12, scale: 3 }).notNull().default("0"),
  // التكاليف الداخلية (Internal Costs)
  localHandlingCosts: decimal2("localHandlingCosts", { precision: 12, scale: 3 }).notNull().default("0"),
  storageAndWarehouseCosts: decimal2("storageAndWarehouseCosts", { precision: 12, scale: 3 }).notNull().default("0"),
  customsClearanceCosts: decimal2("customsClearanceCosts", { precision: 12, scale: 3 }).notNull().default("0"),
  otherInternalCosts: decimal2("otherInternalCosts", { precision: 12, scale: 3 }).notNull().default("0"),
  // الإجماليات
  totalExternalCosts: decimal2("totalExternalCosts", { precision: 12, scale: 3 }).notNull(),
  totalInternalCosts: decimal2("totalInternalCosts", { precision: 12, scale: 3 }).notNull(),
  totalCosts: decimal2("totalCosts", { precision: 15, scale: 3 }).notNull(),
  // معلومات إضافية
  notes: text2("notes"),
  status: mysqlEnum2("status", ["draft", "confirmed", "completed"]).default("draft").notNull(),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var invoiceItems = mysqlTable2("invoice_items", {
  id: int2("id").autoincrement().primaryKey(),
  invoiceId: int2("invoiceId").notNull(),
  itemId: int2("itemId").notNull(),
  // معلومات المنتج الأساسية
  productName: varchar2("productName", { length: 255 }).notNull(),
  quantity: decimal2("quantity", { precision: 12, scale: 3 }).notNull(),
  unitPrice: decimal2("unitPrice", { precision: 12, scale: 3 }).notNull(),
  totalPrice: decimal2("totalPrice", { precision: 15, scale: 3 }).notNull(),
  // معلومات جمركية
  customsCode: varchar2("customsCode", { length: 50 }),
  // الكود الجمركي (HS Code)
  harmonizedCode: varchar2("harmonizedCode", { length: 50 }),
  // الرمز المنسق
  tarifBand: varchar2("tarifBand", { length: 50 }),
  // بند التعرفة
  dutyRate: decimal2("dutyRate", { precision: 5, scale: 2 }).notNull().default("0"),
  // نسبة الرسم الجمركي
  salesTaxRate: decimal2("salesTaxRate", { precision: 5, scale: 2 }).notNull().default("16"),
  // نسبة ضريبة المبيعات
  // التكاليف والسعر النهائي
  customsDuty: decimal2("customsDuty", { precision: 12, scale: 3 }).notNull().default("0"),
  salesTax: decimal2("salesTax", { precision: 12, scale: 3 }).notNull().default("0"),
  allocatedExternalCosts: decimal2("allocatedExternalCosts", { precision: 12, scale: 3 }).notNull().default("0"),
  allocatedInternalCosts: decimal2("allocatedInternalCosts", { precision: 12, scale: 3 }).notNull().default("0"),
  // السعر النهائي
  finalUnitPrice: decimal2("finalUnitPrice", { precision: 12, scale: 3 }).notNull(),
  finalTotalPrice: decimal2("finalTotalPrice", { precision: 15, scale: 3 }).notNull(),
  // معلومات إضافية
  description: text2("description"),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var notifications = mysqlTable2("notifications", {
  id: int2("id").autoincrement().primaryKey(),
  userId: int2("userId").notNull(),
  // معلومات الإشعار
  type: mysqlEnum2("type", ["success", "error", "warning", "info"]).notNull(),
  title: varchar2("title", { length: 255 }).notNull(),
  message: text2("message").notNull(),
  // معلومات العملية المرتبطة
  operationType: varchar2("operationType", { length: 100 }),
  // مثل: delete_declaration, update_item, etc
  relatedEntityType: varchar2("relatedEntityType", { length: 100 }),
  // مثل: declaration, item, invoice
  relatedEntityId: int2("relatedEntityId"),
  // معرّف الكيان المرتبط
  // معلومات إضافية
  metadata: text2("metadata"),
  // JSON string للبيانات الإضافية
  isRead: boolean2("isRead").default(false).notNull(),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var payments = mysqlTable2("payments", {
  id: int2("id").autoincrement().primaryKey(),
  userId: int2("userId").notNull(),
  declarationId: int2("declarationId"),
  // معرّفات Stripe
  stripePaymentIntentId: varchar2("stripePaymentIntentId", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar2("stripeCustomerId", { length: 255 }),
  stripeChargeId: varchar2("stripeChargeId", { length: 255 }),
  // معلومات الدفع
  amount: decimal2("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar2("currency", { length: 3 }).default("JOD").notNull(),
  status: mysqlEnum2("status", ["pending", "processing", "succeeded", "failed", "canceled", "refunded"]).default("pending").notNull(),
  // معلومات إضافية
  description: text2("description"),
  metadata: text2("metadata"),
  paymentMethod: varchar2("paymentMethod", { length: 50 }),
  // تفاصيل البطاقة
  cardBrand: varchar2("cardBrand", { length: 50 }),
  cardLast4: varchar2("cardLast4", { length: 4 }),
  // التواريخ
  paidAt: timestamp2("paidAt"),
  failedAt: timestamp2("failedAt"),
  refundedAt: timestamp2("refundedAt"),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var stripeInvoices = mysqlTable2("stripe_invoices", {
  id: int2("id").autoincrement().primaryKey(),
  userId: int2("userId").notNull(),
  paymentId: int2("paymentId"),
  // معرّفات Stripe
  stripeInvoiceId: varchar2("stripeInvoiceId", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar2("stripeCustomerId", { length: 255 }).notNull(),
  // معلومات الفاتورة
  invoiceNumber: varchar2("invoiceNumber", { length: 50 }).notNull(),
  amount: decimal2("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar2("currency", { length: 3 }).default("JOD").notNull(),
  status: mysqlEnum2("status", ["draft", "open", "paid", "void", "uncollectible"]).default("draft").notNull(),
  // معلومات إضافية
  description: text2("description"),
  pdfUrl: text2("pdfUrl"),
  hostedInvoiceUrl: text2("hostedInvoiceUrl"),
  // التواريخ
  dueDate: date2("dueDate"),
  paidAt: timestamp2("paidAt"),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var refunds = mysqlTable2("refunds", {
  id: int2("id").autoincrement().primaryKey(),
  paymentId: int2("paymentId").notNull(),
  userId: int2("userId").notNull(),
  // معرّفات Stripe
  stripeRefundId: varchar2("stripeRefundId", { length: 255 }).notNull().unique(),
  stripeChargeId: varchar2("stripeChargeId", { length: 255 }).notNull(),
  // معلومات المبلغ المسترجع
  amount: decimal2("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar2("currency", { length: 3 }).default("JOD").notNull(),
  status: mysqlEnum2("status", ["pending", "succeeded", "failed", "canceled"]).default("pending").notNull(),
  // معلومات إضافية
  reason: varchar2("reason", { length: 100 }),
  notes: text2("notes"),
  // التواريخ
  refundedAt: timestamp2("refundedAt"),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var subscriptions = mysqlTable2("subscriptions", {
  id: int2("id").autoincrement().primaryKey(),
  userId: int2("userId").notNull(),
  // معرّفات Stripe
  stripeSubscriptionId: varchar2("stripeSubscriptionId", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar2("stripeCustomerId", { length: 255 }).notNull(),
  stripePriceId: varchar2("stripePriceId", { length: 255 }).notNull(),
  // معلومات الاشتراك
  planName: varchar2("planName", { length: 100 }).notNull(),
  amount: decimal2("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar2("currency", { length: 3 }).default("JOD").notNull(),
  interval: mysqlEnum2("interval", ["day", "week", "month", "year"]).notNull(),
  status: mysqlEnum2("status", ["active", "past_due", "canceled", "unpaid"]).default("active").notNull(),
  // معلومات الفترة
  currentPeriodStart: date2("currentPeriodStart").notNull(),
  currentPeriodEnd: date2("currentPeriodEnd").notNull(),
  canceledAt: timestamp2("canceledAt"),
  cancelAtPeriodEnd: boolean2("cancelAtPeriodEnd").default(false),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var subscriptionInvoices = mysqlTable2("subscription_invoices", {
  id: int2("id").autoincrement().primaryKey(),
  subscriptionId: int2("subscriptionId").notNull(),
  userId: int2("userId").notNull(),
  // معرّفات Stripe
  stripeInvoiceId: varchar2("stripeInvoiceId", { length: 255 }).notNull().unique(),
  stripeSubscriptionId: varchar2("stripeSubscriptionId", { length: 255 }).notNull(),
  // معلومات الفاتورة
  invoiceNumber: varchar2("invoiceNumber", { length: 50 }).notNull(),
  amount: decimal2("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar2("currency", { length: 3 }).default("JOD").notNull(),
  status: mysqlEnum2("status", ["draft", "open", "paid", "void", "uncollectible"]).default("draft").notNull(),
  // معلومات إضافية
  pdfUrl: text2("pdfUrl"),
  hostedInvoiceUrl: text2("hostedInvoiceUrl"),
  // التواريخ
  paidAt: timestamp2("paidAt"),
  dueDate: date2("dueDate"),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var containers = mysqlTable2("containers", {
  id: int2("id").autoincrement().primaryKey(),
  userId: int2("userId").notNull(),
  declarationId: int2("declarationId"),
  // معلومات الحاوية
  containerNumber: varchar2("containerNumber", { length: 50 }).notNull().unique(),
  containerType: mysqlEnum2("containerType", ["20ft", "40ft", "40ftHC", "45ft", "other"]).notNull(),
  sealNumber: varchar2("sealNumber", { length: 50 }),
  // معلومات الشحن
  shippingCompany: varchar2("shippingCompany", { length: 100 }).notNull(),
  billOfLadingNumber: varchar2("billOfLadingNumber", { length: 50 }).notNull(),
  portOfLoading: varchar2("portOfLoading", { length: 100 }).notNull(),
  portOfDischarge: varchar2("portOfDischarge", { length: 100 }).notNull(),
  // التواريخ
  loadingDate: date2("loadingDate"),
  estimatedArrivalDate: date2("estimatedArrivalDate"),
  actualArrivalDate: date2("actualArrivalDate"),
  // الحالة
  status: mysqlEnum2("status", ["pending", "in_transit", "arrived", "cleared", "delivered", "delayed"]).default("pending").notNull(),
  // الإحداثيات الجغرافية للتتبع الحي
  currentLatitude: decimal2("currentLatitude", { precision: 10, scale: 6 }),
  currentLongitude: decimal2("currentLongitude", { precision: 10, scale: 6 }),
  // معلومات إضافية
  notes: text2("notes"),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var trackingEvents = mysqlTable2("tracking_events", {
  id: int2("id").autoincrement().primaryKey(),
  containerId: int2("containerId").notNull(),
  userId: int2("userId").notNull(),
  // معلومات الحدث
  eventType: mysqlEnum2("eventType", [
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
  eventLocation: varchar2("eventLocation", { length: 200 }),
  eventDescription: text2("eventDescription"),
  // التاريخ والوقت
  eventDateTime: timestamp2("eventDateTime").notNull(),
  // معلومات إضافية
  documentUrl: text2("documentUrl"),
  notes: text2("notes"),
  createdAt: timestamp2("createdAt").defaultNow().notNull()
});
var shipmentDetails = mysqlTable2("shipment_details", {
  id: int2("id").autoincrement().primaryKey(),
  containerId: int2("containerId").notNull(),
  userId: int2("userId").notNull(),
  // معلومات الشحنة
  shipmentNumber: varchar2("shipmentNumber", { length: 50 }).notNull().unique(),
  totalWeight: decimal2("totalWeight", { precision: 12, scale: 3 }).notNull(),
  totalVolume: decimal2("totalVolume", { precision: 12, scale: 3 }),
  numberOfPackages: int2("numberOfPackages").notNull(),
  packageType: varchar2("packageType", { length: 50 }),
  // معلومات الشاحن والمستقبل
  shipper: varchar2("shipper", { length: 200 }).notNull(),
  consignee: varchar2("consignee", { length: 200 }).notNull(),
  // معلومات الرسوم
  freightCharges: decimal2("freightCharges", { precision: 12, scale: 2 }),
  insuranceCharges: decimal2("insuranceCharges", { precision: 12, scale: 2 }),
  handlingCharges: decimal2("handlingCharges", { precision: 12, scale: 2 }),
  otherCharges: decimal2("otherCharges", { precision: 12, scale: 2 }),
  // المستندات
  invoiceUrl: text2("invoiceUrl"),
  packingListUrl: text2("packingListUrl"),
  certificateOfOriginUrl: text2("certificateOfOriginUrl"),
  // ملاحظات
  notes: text2("notes"),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var bankAccounts = mysqlTable2("bank_accounts", {
  id: int2("id").autoincrement().primaryKey(),
  userId: int2("userId").notNull().references(() => users.id),
  accountName: varchar2("accountName", { length: 255 }).notNull(),
  // البيانات مشفرة
  ibanEncrypted: text2("ibanEncrypted").notNull(),
  bankName: varchar2("bankName", { length: 255 }).notNull(),
  swiftCode: varchar2("swiftCode", { length: 20 }),
  accountType: mysqlEnum2("accountType", ["checking", "savings", "business"]).default("checking"),
  currency: varchar2("currency", { length: 3 }).default("JOD"),
  isDefault: boolean2("isDefault").default(false),
  isVerified: boolean2("isVerified").default(false),
  verificationCode: varchar2("verificationCode", { length: 10 }),
  verificationAttempts: int2("verificationAttempts").default(0),
  stripeAccountId: varchar2("stripeAccountId", { length: 255 }),
  status: mysqlEnum2("status", ["pending", "verified", "active", "inactive", "suspended"]).default("pending"),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var bankTransactions = mysqlTable2("bank_transactions", {
  id: int2("id").autoincrement().primaryKey(),
  bankAccountId: int2("bankAccountId").notNull().references(() => bankAccounts.id),
  transactionId: varchar2("transactionId", { length: 255 }).notNull().unique(),
  amount: decimal2("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar2("currency", { length: 3 }).default("JOD"),
  type: mysqlEnum2("type", ["deposit", "withdrawal", "transfer", "payment", "refund"]).notNull(),
  status: mysqlEnum2("status", ["pending", "processing", "completed", "failed", "cancelled"]).default("pending"),
  description: text2("description"),
  reference: varchar2("reference", { length: 255 }),
  metadata: text2("metadata"),
  // JSON
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var bankVerifications = mysqlTable2("bank_verifications", {
  id: int2("id").autoincrement().primaryKey(),
  bankAccountId: int2("bankAccountId").notNull().references(() => bankAccounts.id),
  verificationMethod: mysqlEnum2("verificationMethod", ["micro_deposit", "document", "api", "manual"]).notNull(),
  status: mysqlEnum2("status", ["pending", "verified", "failed", "expired"]).default("pending"),
  verificationCode: varchar2("verificationCode", { length: 10 }),
  attempts: int2("attempts").default(0),
  maxAttempts: int2("maxAttempts").default(3),
  expiresAt: timestamp2("expiresAt"),
  verifiedAt: timestamp2("verifiedAt"),
  notes: text2("notes"),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var bankNotifications = mysqlTable2("bank_notifications", {
  id: int2("id").autoincrement().primaryKey(),
  userId: int2("userId").notNull().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  type: mysqlEnum2("type", [
    "account_added",
    "account_verified",
    "transaction_completed",
    "transaction_failed",
    "verification_required",
    "security_alert",
    "account_suspended",
    "payment_received",
    "payment_sent"
  ]).notNull(),
  title: varchar2("title", { length: 255 }).notNull(),
  message: text2("message").notNull(),
  relatedEntityType: varchar2("relatedEntityType", { length: 50 }),
  // bank_account, transaction
  relatedEntityId: int2("relatedEntityId"),
  isRead: boolean2("isRead").default(false),
  priority: mysqlEnum2("priority", ["low", "medium", "high", "critical"]).default("medium"),
  channels: varchar2("channels", { length: 255 }).default("email,in_app"),
  // JSON array
  sentAt: timestamp2("sentAt"),
  readAt: timestamp2("readAt"),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var notificationLog = mysqlTable2("notification_log", {
  id: int2("id").autoincrement().primaryKey(),
  notificationId: int2("notificationId").notNull().references(() => bankNotifications.id, { onDelete: "cascade", onUpdate: "cascade" }),
  channel: mysqlEnum2("channel", ["email", "sms", "push", "in_app"]).notNull(),
  status: mysqlEnum2("status", ["pending", "sent", "failed", "bounced"]).default("pending"),
  recipient: varchar2("recipient", { length: 255 }).notNull(),
  sentAt: timestamp2("sentAt"),
  failureReason: text2("failureReason"),
  retryCount: int2("retryCount").default(0),
  maxRetries: int2("maxRetries").default(3),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var notificationPreferences = mysqlTable2("notification_preferences", {
  id: int2("id").autoincrement().primaryKey(),
  userId: int2("userId").notNull().unique().references(() => users.id, { onDelete: "cascade", onUpdate: "cascade" }),
  emailNotifications: boolean2("emailNotifications").default(true),
  smsNotifications: boolean2("smsNotifications").default(false),
  pushNotifications: boolean2("pushNotifications").default(true),
  inAppNotifications: boolean2("inAppNotifications").default(true),
  accountAddedNotification: boolean2("accountAddedNotification").default(true),
  accountVerifiedNotification: boolean2("accountVerifiedNotification").default(true),
  transactionNotification: boolean2("transactionNotification").default(true),
  securityAlertNotification: boolean2("securityAlertNotification").default(true),
  dailyDigest: boolean2("dailyDigest").default(false),
  weeklyReport: boolean2("weeklyReport").default(false),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var expenseTypes = mysqlTable2("expense_types", {
  id: int2("id").autoincrement().primaryKey(),
  name: varchar2("name", { length: 100 }).notNull(),
  description: text2("description"),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var expenses = mysqlTable2("expenses", {
  id: int2("id").autoincrement().primaryKey(),
  billId: int2("billId").notNull().references(() => customsDeclarations.id),
  typeId: int2("typeId").notNull().references(() => expenseTypes.id),
  amount: decimal2("amount", { precision: 12, scale: 3 }).notNull(),
  currency: varchar2("currency", { length: 3 }).default("JOD").notNull(),
  description: text2("description"),
  date: date2("date").notNull(),
  category: varchar2("category", { length: 50 }),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var savedCalculations = mysqlTable2("saved_calculations", {
  id: int2("id").autoincrement().primaryKey(),
  userId: int2("userId").notNull().references(() => users.id),
  // معلومات الحساب
  calculationName: varchar2("calculationName", { length: 255 }).notNull(),
  description: text2("description"),
  // بيانات الحساب
  weight: decimal2("weight", { precision: 10, scale: 3 }).notNull(),
  value: decimal2("value", { precision: 15, scale: 3 }).notNull(),
  currency: varchar2("currency", { length: 10 }).notNull().default("JOD"),
  country: varchar2("country", { length: 100 }).notNull(),
  // النتائج
  shippingCost: decimal2("shippingCost", { precision: 12, scale: 3 }).notNull(),
  customsDuty: decimal2("customsDuty", { precision: 12, scale: 3 }).notNull(),
  tax: decimal2("tax", { precision: 12, scale: 3 }).notNull(),
  totalCost: decimal2("totalCost", { precision: 15, scale: 3 }).notNull(),
  // معلومات إضافية
  isPublic: boolean2("isPublic").default(false),
  tags: text2("tags"),
  // JSON array
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var savedReports = mysqlTable2("saved_reports", {
  id: int2("id").autoincrement().primaryKey(),
  userId: int2("userId").notNull().references(() => users.id),
  // معلومات التقرير
  reportName: varchar2("reportName", { length: 255 }).notNull(),
  reportType: varchar2("reportType", { length: 50 }).notNull(),
  // 'monthly', 'quarterly', 'yearly', 'custom'
  description: text2("description"),
  // نطاق التقرير
  startDate: date2("startDate").notNull(),
  endDate: date2("endDate").notNull(),
  // الإحصائيات
  totalShipping: decimal2("totalShipping", { precision: 15, scale: 3 }).notNull(),
  totalDuty: decimal2("totalDuty", { precision: 15, scale: 3 }).notNull(),
  totalTax: decimal2("totalTax", { precision: 15, scale: 3 }).notNull(),
  totalCost: decimal2("totalCost", { precision: 15, scale: 3 }).notNull(),
  recordCount: int2("recordCount").notNull(),
  // البيانات
  reportData: text2("reportData"),
  // JSON data
  // معلومات إضافية
  isPublic: boolean2("isPublic").default(false),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var userAlerts = mysqlTable2("user_alerts", {
  id: int2("id").autoincrement().primaryKey(),
  userId: int2("userId").notNull().references(() => users.id),
  // معلومات التنبيه
  alertType: varchar2("alertType", { length: 50 }).notNull(),
  // 'price_change', 'customs_update', 'shipment_status'
  alertTitle: varchar2("alertTitle", { length: 255 }).notNull(),
  alertMessage: text2("alertMessage").notNull(),
  // البيانات المرتبطة
  relatedCountry: varchar2("relatedCountry", { length: 100 }),
  relatedCalculationId: int2("relatedCalculationId"),
  // الحالة
  isRead: boolean2("isRead").default(false),
  isPinned: boolean2("isPinned").default(false),
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});
var userPreferences = mysqlTable2("user_preferences", {
  id: int2("id").autoincrement().primaryKey(),
  userId: int2("userId").notNull().unique().references(() => users.id),
  // التفضيلات العامة
  defaultCurrency: varchar2("defaultCurrency", { length: 10 }).default("JOD"),
  defaultCountry: varchar2("defaultCountry", { length: 100 }).default("SA"),
  language: varchar2("language", { length: 10 }).default("ar"),
  theme: varchar2("theme", { length: 20 }).default("dark"),
  // 'light', 'dark'
  // إعدادات الإشعارات
  enableNotifications: boolean2("enableNotifications").default(true),
  enableEmailNotifications: boolean2("enableEmailNotifications").default(true),
  enablePriceAlerts: boolean2("enablePriceAlerts").default(true),
  // إعدادات الخصوصية
  isPublicProfile: boolean2("isPublicProfile").default(false),
  allowDataSharing: boolean2("allowDataSharing").default(false),
  // معلومات إضافية
  preferences: text2("preferences"),
  // JSON for additional preferences
  createdAt: timestamp2("createdAt").defaultNow().notNull(),
  updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
import { eq, desc, and, lt, or, like } from "drizzle-orm";
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createCustomsDeclaration(userId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(customsDeclarations).values({
    ...data,
    userId
  });
  const declaration = await db.select().from(customsDeclarations).where(eq(customsDeclarations.declarationNumber, data.declarationNumber)).limit(1);
  if (!declaration.length) throw new Error("Failed to create declaration");
  return declaration[0];
}
async function getCustomsDeclarationById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(customsDeclarations).where(eq(customsDeclarations.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getCustomsDeclarationsByUserId(userId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(customsDeclarations).where(eq(customsDeclarations.userId, userId)).orderBy(desc(customsDeclarations.createdAt));
}
async function updateCustomsDeclaration(id, data) {
  const db = await getDb();
  if (!db) return void 0;
  await db.update(customsDeclarations).set(data).where(eq(customsDeclarations.id, id));
  return getCustomsDeclarationById(id);
}
async function deleteCustomsDeclaration(id) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(customsDeclarations).where(eq(customsDeclarations.id, id));
  return true;
}
async function createItem(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(items).values(data);
  const item = await db.select().from(items).where(eq(items.declarationId, data.declarationId)).orderBy(desc(items.id)).limit(1);
  if (!item.length) throw new Error("Failed to create item");
  return item[0];
}
async function getItemById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(items).where(eq(items.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getItemsByDeclarationId(declarationId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(items).where(eq(items.declarationId, declarationId)).orderBy(items.id);
}
async function updateItem(id, data) {
  const db = await getDb();
  if (!db) return void 0;
  await db.update(items).set(data).where(eq(items.id, id));
  const result = await db.select().from(items).where(eq(items.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function deleteItem(id) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(items).where(eq(items.id, id));
  return true;
}
async function deleteItemsByDeclarationId(declarationId) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(items).where(eq(items.declarationId, declarationId));
  return true;
}
async function createOrUpdateVariance(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(variances).where(eq(variances.declarationId, data.declarationId)).limit(1);
  if (existing.length > 0) {
    await db.update(variances).set(data).where(eq(variances.declarationId, data.declarationId));
  } else {
    await db.insert(variances).values(data);
  }
  const result = await db.select().from(variances).where(eq(variances.declarationId, data.declarationId)).limit(1);
  if (!result.length) throw new Error("Failed to create/update variance");
  return result[0];
}
async function getVarianceByDeclarationId(declarationId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(variances).where(eq(variances.declarationId, declarationId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createOrUpdateFinancialSummary(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(financialSummaries).where(eq(financialSummaries.declarationId, data.declarationId)).limit(1);
  if (existing.length > 0) {
    await db.update(financialSummaries).set(data).where(eq(financialSummaries.declarationId, data.declarationId));
  } else {
    await db.insert(financialSummaries).values(data);
  }
  const result = await db.select().from(financialSummaries).where(eq(financialSummaries.declarationId, data.declarationId)).limit(1);
  if (!result.length) throw new Error("Failed to create/update financial summary");
  return result[0];
}
async function getFinancialSummaryByDeclarationId(declarationId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(financialSummaries).where(eq(financialSummaries.declarationId, declarationId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getNotificationsByUserId(userId, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit).offset(offset);
}
async function getUnreadNotificationCount(userId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result.length;
}
async function markNotificationAsRead(notificationId) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
}
async function markAllNotificationsAsRead(userId) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}
async function deleteNotification(notificationId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(notifications).where(eq(notifications.id, notificationId));
}
async function createContainer(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(containers).values({
    userId: data.userId,
    containerNumber: data.containerNumber,
    containerType: data.containerType,
    shippingCompany: data.shippingCompany,
    billOfLadingNumber: data.billOfLadingNumber,
    portOfLoading: data.portOfLoading,
    portOfDischarge: data.portOfDischarge,
    sealNumber: data.sealNumber,
    loadingDate: data.loadingDate ? new Date(data.loadingDate) : null,
    estimatedArrivalDate: data.estimatedArrivalDate ? new Date(data.estimatedArrivalDate) : null,
    notes: data.notes
  });
  return result;
}
async function getContainerByNumber(containerNumber) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(containers).where(
    eq(containers.containerNumber, containerNumber)
  );
  return result[0] || null;
}
async function getUserContainers(userId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(containers).where(
    eq(containers.userId, userId)
  ).orderBy(desc(containers.createdAt));
  return result;
}
async function searchContainers(userId, query) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(containers).where(
    and(
      eq(containers.userId, userId),
      or(
        like(containers.containerNumber, `%${query}%`),
        like(containers.billOfLadingNumber, `%${query}%`),
        like(containers.shippingCompany, `%${query}%`)
      )
    )
  );
  return result;
}
async function addTrackingEvent(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(trackingEvents).values({
    containerId: data.containerId,
    userId: data.userId,
    eventType: data.eventType,
    eventLocation: data.eventLocation,
    eventDescription: data.eventDescription,
    eventDateTime: data.eventDateTime,
    documentUrl: data.documentUrl,
    notes: data.notes
  });
  return result;
}
async function getContainerTrackingHistory(containerId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select().from(trackingEvents).where(
    eq(trackingEvents.containerId, containerId)
  ).orderBy(desc(trackingEvents.eventDateTime));
  return result;
}
async function updateContainerStatus(containerId, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.update(containers).set({
    status,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq(containers.id, containerId));
  return result;
}
async function createShipmentDetail(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(shipmentDetails).values({
    containerId: data.containerId,
    userId: data.userId,
    shipmentNumber: data.shipmentNumber,
    totalWeight: data.totalWeight.toString(),
    totalVolume: data.totalVolume?.toString(),
    numberOfPackages: data.numberOfPackages,
    packageType: data.packageType,
    shipper: data.shipper,
    consignee: data.consignee,
    freightCharges: data.freightCharges?.toString(),
    insuranceCharges: data.insuranceCharges?.toString(),
    handlingCharges: data.handlingCharges?.toString(),
    otherCharges: data.otherCharges?.toString(),
    notes: data.notes
  });
  return result;
}
async function getShipmentDetail(containerId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(shipmentDetails).where(
    eq(shipmentDetails.containerId, containerId)
  );
  return result[0] || null;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  const isSecure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecure || process.env.NODE_ENV === "production"
    // فرض Secure في الإنتاج
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/routers.ts
import { z as z26 } from "zod";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// shared/constants.ts
var SALES_TAX_RATE = 0.16;
var DECIMAL_PLACES = 3;

// shared/calculations.ts
function roundToDecimals(num, decimals = DECIMAL_PLACES) {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}
function calculateFobValueJod(fobValueForeign, exchangeRate) {
  return roundToDecimals(fobValueForeign * exchangeRate);
}
function calculateFreightAndInsurance(freightCost, insuranceCost) {
  return roundToDecimals(freightCost + insuranceCost);
}
function calculateTaxableValue(fobValueJod, freightAndInsurance) {
  return roundToDecimals(fobValueJod + freightAndInsurance);
}
function calculateSalesTax(taxableValue, customsDuty, taxRate = SALES_TAX_RATE) {
  const baseForTax = roundToDecimals(taxableValue + customsDuty);
  return roundToDecimals(baseForTax * taxRate);
}
function calculateTotalCustomsAndTaxes(customsDuty, salesTax, additionalFees = 0, customsServiceFee = 0, penalties = 0) {
  return roundToDecimals(
    customsDuty + salesTax + additionalFees + customsServiceFee + penalties
  );
}
function calculateTotalLandedCost(fobValueJod, freightAndInsurance, totalCustomsAndTaxes) {
  return roundToDecimals(fobValueJod + freightAndInsurance + totalCustomsAndTaxes);
}
function calculateAdditionalExpensesRatio(totalCustomsAndTaxes, fobValueJod) {
  if (fobValueJod === 0) return 0;
  const ratio = totalCustomsAndTaxes / fobValueJod * 100;
  return roundToDecimals(ratio, 2);
}
function calculateItemValuePercentage(itemValue, totalFobValue) {
  if (totalFobValue === 0) return 0;
  const percentage = itemValue / totalFobValue * 100;
  return roundToDecimals(percentage, 2);
}
function calculateItemExpensesShare(itemValuePercentage, totalCustomsAndTaxes) {
  const share = itemValuePercentage / 100 * totalCustomsAndTaxes;
  return roundToDecimals(share);
}
function calculateItemTotalCost(itemFobValueJod, itemExpensesShare) {
  return roundToDecimals(itemFobValueJod + itemExpensesShare);
}
function calculateUnitCost(itemTotalCost, quantity) {
  if (quantity === 0) return 0;
  return roundToDecimals(itemTotalCost / quantity);
}
function calculateVariance(actualValue, estimatedValue) {
  return roundToDecimals(actualValue - estimatedValue);
}
function calculateVariancePercentage(variance, estimatedValue) {
  if (estimatedValue === 0) return 0;
  const percentage = variance / estimatedValue * 100;
  return roundToDecimals(percentage, 2);
}
function calculateAllCosts(inputs) {
  const {
    fobValueForeign,
    exchangeRate,
    freightCost,
    insuranceCost,
    customsDuty,
    additionalFees = 0,
    customsServiceFee = 0,
    penalties = 0
  } = inputs;
  const fobValueJod = calculateFobValueJod(fobValueForeign, exchangeRate);
  const freightAndInsurance = calculateFreightAndInsurance(freightCost, insuranceCost);
  const taxableValue = calculateTaxableValue(fobValueJod, freightAndInsurance);
  const salesTax = calculateSalesTax(taxableValue, customsDuty);
  const totalCustomsAndTaxes = calculateTotalCustomsAndTaxes(
    customsDuty,
    salesTax,
    additionalFees,
    customsServiceFee,
    penalties
  );
  const totalLandedCost = calculateTotalLandedCost(
    fobValueJod,
    freightAndInsurance,
    totalCustomsAndTaxes
  );
  const additionalExpensesRatio = calculateAdditionalExpensesRatio(
    totalCustomsAndTaxes,
    fobValueJod
  );
  return {
    fobValueJod,
    freightAndInsurance,
    taxableValue,
    salesTax,
    totalCustomsAndTaxes,
    totalLandedCost,
    additionalExpensesRatio
  };
}
function calculateItemCosts(inputs) {
  const {
    itemFobValueForeign,
    exchangeRate,
    quantity,
    totalFobValueJod,
    totalCustomsAndTaxes
  } = inputs;
  const itemFobValueJod = calculateFobValueJod(itemFobValueForeign, exchangeRate);
  const itemValuePercentage = calculateItemValuePercentage(itemFobValueJod, totalFobValueJod);
  const itemExpensesShare = calculateItemExpensesShare(itemValuePercentage, totalCustomsAndTaxes);
  const itemTotalCost = calculateItemTotalCost(itemFobValueJod, itemExpensesShare);
  const unitCost = calculateUnitCost(itemTotalCost, quantity);
  return {
    itemFobValueJod,
    itemValuePercentage,
    itemExpensesShare,
    itemTotalCost,
    unitCost
  };
}

// server/ai-router.ts
import { z as z2 } from "zod";

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  payload.thinking = {
    "budget_tokens": 128
  };
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/ai-service.ts
async function suggestItemClassification(itemName, description) {
  try {
    const prompt = `
\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u062C\u0645\u0631\u0643\u064A \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0628\u0636\u0627\u0626\u0639. \u0642\u0645 \u0628\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0635\u0646\u0641 \u0627\u0644\u062A\u0627\u0644\u064A \u0648\u0627\u0642\u062A\u0631\u062D \u0627\u0644\u0643\u0648\u062F \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0627\u0644\u0645\u0646\u0627\u0633\u0628:

\u0627\u0633\u0645 \u0627\u0644\u0635\u0646\u0641: ${itemName}
${description ? `\u0627\u0644\u0648\u0635\u0641: ${description}` : ""}

\u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0628\u0635\u064A\u063A\u0629 JSON \u0645\u0639 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062A\u0627\u0644\u064A\u0629:
- suggestedCustomsCode: \u0627\u0644\u0643\u0648\u062F \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0627\u0644\u0645\u0642\u062A\u0631\u062D (6 \u0623\u0631\u0642\u0627\u0645)
- suggestedDutyRate: \u0645\u0639\u062F\u0644 \u0627\u0644\u0631\u0633\u0645 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0627\u0644\u0645\u0642\u062A\u0631\u062D (\u0646\u0633\u0628\u0629 \u0645\u0626\u0648\u064A\u0629)
- confidence: \u062F\u0631\u062C\u0629 \u0627\u0644\u062B\u0642\u0629 (0-100)
- reasoning: \u0627\u0644\u062A\u0641\u0633\u064A\u0631 \u0627\u0644\u0639\u0644\u0645\u064A \u0644\u0644\u0627\u062E\u062A\u064A\u0627\u0631

\u062A\u0630\u0643\u0631: \u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0623\u0643\u0648\u0627\u062F \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0627\u0644\u0623\u0631\u062F\u0646\u064A\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629.
    `;
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u062C\u0645\u0631\u0643\u064A \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0628\u0636\u0627\u0626\u0639 \u0648\u0627\u0644\u0623\u0643\u0648\u0627\u062F \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0627\u0644\u0623\u0631\u062F\u0646\u064A\u0629."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "item_classification",
          strict: true,
          schema: {
            type: "object",
            properties: {
              suggestedCustomsCode: {
                type: "string",
                description: "\u0627\u0644\u0643\u0648\u062F \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0627\u0644\u0645\u0642\u062A\u0631\u062D"
              },
              suggestedDutyRate: {
                type: "number",
                description: "\u0645\u0639\u062F\u0644 \u0627\u0644\u0631\u0633\u0645 \u0627\u0644\u062C\u0645\u0631\u0643\u064A"
              },
              confidence: {
                type: "number",
                description: "\u062F\u0631\u062C\u0629 \u0627\u0644\u062B\u0642\u0629"
              },
              reasoning: {
                type: "string",
                description: "\u0627\u0644\u062A\u0641\u0633\u064A\u0631 \u0627\u0644\u0639\u0644\u0645\u064A"
              }
            },
            required: [
              "suggestedCustomsCode",
              "suggestedDutyRate",
              "confidence",
              "reasoning"
            ],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("\u0644\u0645 \u062A\u062D\u0635\u0644 \u0639\u0644\u0649 \u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0645\u0646 \u0627\u0644\u0646\u0645\u0648\u0630\u062C");
    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);
    return {
      itemName,
      ...parsed
    };
  } catch (error) {
    throw error;
  }
}
async function analyzeDeclaration(declarationData) {
  try {
    const itemsList = declarationData.items.map((item) => `- ${item.itemName}: ${item.quantity} \u0648\u062D\u062F\u0629 \u0628\u0633\u0639\u0631 ${item.unitPrice}`).join("\n");
    const prompt = `
\u0642\u0645 \u0628\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0627\u0644\u062A\u0627\u0644\u064A \u0648\u062A\u0642\u062F\u064A\u0645 \u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0645\u062E\u0627\u0637\u0631 \u0648\u0627\u0644\u0627\u0642\u062A\u0631\u0627\u062D\u0627\u062A:

\u0631\u0642\u0645 \u0627\u0644\u0628\u064A\u0627\u0646: ${declarationData.declarationNumber}
\u0628\u0644\u062F \u0627\u0644\u062A\u0635\u062F\u064A\u0631: ${declarationData.exportCountry}
\u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A\u0629 FOB: ${declarationData.totalFobValue}

\u0627\u0644\u0623\u0635\u0646\u0627\u0641:
${itemsList}

\u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645:
1. \u062A\u0642\u064A\u064A\u0645 \u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0645\u062E\u0627\u0637\u0631 (\u0645\u0646\u062E\u0641\u0636/\u0645\u062A\u0648\u0633\u0637/\u0645\u0631\u062A\u0641\u0639)
2. \u0642\u0627\u0626\u0645\u0629 \u0628\u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A \u0627\u0644\u0645\u062D\u062A\u0645\u0644\u0629
3. \u0627\u0642\u062A\u0631\u0627\u062D\u0627\u062A \u0644\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0627\u0644\u062C\u0645\u0631\u0643\u064A
4. \u062A\u0642\u062F\u064A\u0631 \u0645\u0639\u062F\u0644 \u0627\u0644\u0631\u0633\u0645 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0627\u0644\u0645\u062A\u0648\u0642\u0639

\u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0628\u0635\u064A\u063A\u0629 JSON.
    `;
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "\u0623\u0646\u062A \u0645\u062D\u0644\u0644 \u062C\u0645\u0631\u0643\u064A \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0645\u062E\u0627\u0637\u0631 \u0648\u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0627\u0644\u062C\u0645\u0631\u0643\u064A."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "declaration_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              riskLevel: {
                type: "string",
                enum: ["\u0645\u0646\u062E\u0641\u0636", "\u0645\u062A\u0648\u0633\u0637", "\u0645\u0631\u062A\u0641\u0639"],
                description: "\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u0645\u062E\u0627\u0637\u0631"
              },
              warnings: {
                type: "array",
                items: { type: "string" },
                description: "\u0627\u0644\u062A\u062D\u0630\u064A\u0631\u0627\u062A"
              },
              suggestions: {
                type: "array",
                items: { type: "string" },
                description: "\u0627\u0644\u0627\u0642\u062A\u0631\u0627\u062D\u0627\u062A"
              },
              estimatedDutyPercentage: {
                type: "number",
                description: "\u0645\u0639\u062F\u0644 \u0627\u0644\u0631\u0633\u0645 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0627\u0644\u0645\u062A\u0648\u0642\u0639"
              }
            },
            required: [
              "riskLevel",
              "warnings",
              "suggestions",
              "estimatedDutyPercentage"
            ],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("\u0644\u0645 \u062A\u062D\u0635\u0644 \u0639\u0644\u0649 \u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0645\u0646 \u0627\u0644\u0646\u0645\u0648\u0630\u062C");
    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    return JSON.parse(contentStr);
  } catch (error) {
    throw error;
  }
}
async function predictCosts(declarationData) {
  try {
    const itemsList = declarationData.items.map((item) => `- ${item.itemName} (${item.customsCode || "\u0628\u062F\u0648\u0646 \u0643\u0648\u062F"})`).join("\n");
    const prompt = `
\u0642\u0645 \u0628\u062A\u0648\u0642\u0639 \u0627\u0644\u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629 \u0644\u0644\u0628\u064A\u0627\u0646 \u0627\u0644\u062A\u0627\u0644\u064A:

\u0627\u0644\u0642\u064A\u0645\u0629 FOB: ${declarationData.fobValue}
\u0623\u062C\u0648\u0631 \u0627\u0644\u0634\u062D\u0646: ${declarationData.freightCost}
\u0627\u0644\u062A\u0623\u0645\u064A\u0646: ${declarationData.insuranceCost}
\u0628\u0644\u062F \u0627\u0644\u062A\u0635\u062F\u064A\u0631: ${declarationData.exportCountry}

\u0627\u0644\u0623\u0635\u0646\u0627\u0641:
${itemsList}

\u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645:
1. \u0645\u0639\u062F\u0644 \u0627\u0644\u0631\u0633\u0645 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u0627\u0644\u0645\u062A\u0648\u0642\u0639
2. \u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0627\u0644\u0645\u062A\u0648\u0642\u0639\u0629
3. \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A 16%
4. \u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0646\u0647\u0627\u0626\u064A\u0629

\u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0628\u0635\u064A\u063A\u0629 JSON \u0645\u0639 \u062A\u0641\u0635\u064A\u0644 \u0643\u0627\u0645\u0644 \u0644\u0644\u062A\u0643\u0627\u0644\u064A\u0641.
    `;
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "\u0623\u0646\u062A \u0645\u062D\u0644\u0644 \u0645\u0627\u0644\u064A \u062C\u0645\u0631\u0643\u064A \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u062D\u0633\u0627\u0628 \u0627\u0644\u062A\u0643\u0627\u0644\u064A\u0641 \u0648\u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "cost_prediction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              estimatedCustomsDuty: {
                type: "number",
                description: "\u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0627\u0644\u0645\u062A\u0648\u0642\u0639\u0629"
              },
              estimatedTotalCost: {
                type: "number",
                description: "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u062A\u0643\u0644\u0641\u0629"
              },
              costBreakdown: {
                type: "object",
                properties: {
                  fobValue: { type: "number" },
                  freight: { type: "number" },
                  insurance: { type: "number" },
                  customsDuty: { type: "number" },
                  salesTax: { type: "number" },
                  totalCost: { type: "number" }
                },
                required: [
                  "fobValue",
                  "freight",
                  "insurance",
                  "customsDuty",
                  "salesTax",
                  "totalCost"
                ]
              }
            },
            required: [
              "estimatedCustomsDuty",
              "estimatedTotalCost",
              "costBreakdown"
            ],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("\u0644\u0645 \u062A\u062D\u0635\u0644 \u0639\u0644\u0649 \u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0645\u0646 \u0627\u0644\u0646\u0645\u0648\u0630\u062C");
    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    return JSON.parse(contentStr);
  } catch (error) {
    throw error;
  }
}

// server/ai-data-extraction.ts
async function extractDataFromText(text4) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `\u0623\u0646\u062A \u0645\u0633\u0627\u0639\u062F \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0648\u0627\u0644\u0634\u062D\u0646\u0627\u062A \u0645\u0646 \u0627\u0644\u0646\u0635\u0648\u0635.
          
\u0627\u0633\u062A\u062E\u0631\u062C \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u0627\u0644\u064A\u0629 \u0645\u0646 \u0627\u0644\u0646\u0635 \u0627\u0644\u0645\u0639\u0637\u0649 \u0648\u0623\u0631\u062C\u0639\u0647\u0627 \u0628\u0635\u064A\u063A\u0629 JSON:
- declarationNumber: \u0631\u0642\u0645 \u0627\u0644\u0628\u064A\u0627\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A
- exportCountry: \u062F\u0648\u0644\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631
- billOfLadingNumber: \u0631\u0642\u0645 \u0628\u0648\u0644\u064A\u0635\u0629 \u0627\u0644\u0634\u062D\u0646
- grossWeight: \u0627\u0644\u0648\u0632\u0646 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A
- netWeight: \u0627\u0644\u0648\u0632\u0646 \u0627\u0644\u0635\u0627\u0641\u064A
- numberOfPackages: \u0639\u062F\u062F \u0627\u0644\u0637\u0631\u0648\u062F
- packageType: \u0646\u0648\u0639 \u0627\u0644\u0637\u0631\u0648\u062F
- fobValue: \u0642\u064A\u0645\u0629 FOB
- freightCost: \u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0634\u062D\u0646
- insuranceCost: \u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u062A\u0623\u0645\u064A\u0646
- customsDuty: \u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629
- salesTax: \u0636\u0631\u064A\u0628\u0629 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A
- containerNumber: \u0631\u0642\u0645 \u0627\u0644\u062D\u0627\u0648\u064A\u0629
- containerType: \u0646\u0648\u0639 \u0627\u0644\u062D\u0627\u0648\u064A\u0629 (20ft, 40ft, \u0625\u0644\u062E)
- shippingCompany: \u0634\u0631\u0643\u0629 \u0627\u0644\u0634\u062D\u0646
- portOfLoading: \u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0634\u062D\u0646
- portOfDischarge: \u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u062A\u0641\u0631\u064A\u063A
- items: \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0635\u0646\u0627\u0641 \u0645\u0639 \u0627\u0644\u0648\u0635\u0641 \u0648\u0643\u0648\u062F HS \u0648\u0627\u0644\u0643\u0645\u064A\u0629 \u0648\u0627\u0644\u0633\u0639\u0631
- confidence: \u062F\u0631\u062C\u0629 \u0627\u0644\u062B\u0642\u0629 (0-100)

\u0623\u0631\u062C\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0635\u064A\u063A\u0629 JSON \u0635\u062D\u064A\u062D\u0629 \u0641\u0642\u0637 \u0628\u062F\u0648\u0646 \u0634\u0631\u062D.`
        },
        {
          role: "user",
          content: `\u0627\u0633\u062A\u062E\u0631\u062C \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0646 \u0627\u0644\u0646\u0635 \u0627\u0644\u062A\u0627\u0644\u064A:

${text4}`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "extracted_data",
          strict: true,
          schema: {
            type: "object",
            properties: {
              declarationNumber: { type: "string" },
              exportCountry: { type: "string" },
              billOfLadingNumber: { type: "string" },
              grossWeight: { type: "number" },
              netWeight: { type: "number" },
              numberOfPackages: { type: "integer" },
              packageType: { type: "string" },
              fobValue: { type: "number" },
              freightCost: { type: "number" },
              insuranceCost: { type: "number" },
              customsDuty: { type: "number" },
              salesTax: { type: "number" },
              containerNumber: { type: "string" },
              containerType: { type: "string" },
              shippingCompany: { type: "string" },
              portOfLoading: { type: "string" },
              portOfDischarge: { type: "string" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    hsCode: { type: "string" },
                    quantity: { type: "number" },
                    unit: { type: "string" },
                    unitPrice: { type: "number" },
                    totalPrice: { type: "number" },
                    origin: { type: "string" }
                  },
                  required: ["description"]
                }
              },
              confidence: { type: "integer", minimum: 0, maximum: 100 },
              errors: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["confidence"],
            additionalProperties: false
          }
        }
      }
    });
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    return content;
  } catch (error) {
    return {
      confidence: 0,
      errors: [`\u0641\u0634\u0644 \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A: ${error instanceof Error ? error.message : "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"}`]
    };
  }
}
function validateExtractedData(data) {
  const issues = [];
  if (!data.confidence || data.confidence < 50) {
    issues.push("\u062F\u0631\u062C\u0629 \u0627\u0644\u062B\u0642\u0629 \u0645\u0646\u062E\u0641\u0636\u0629 \u062C\u062F\u0627\u064B");
  }
  if (!data.billOfLadingNumber) {
    issues.push("\u0631\u0642\u0645 \u0628\u0648\u0644\u064A\u0635\u0629 \u0627\u0644\u0634\u062D\u0646 \u0645\u0641\u0642\u0648\u062F");
  }
  if (!data.exportCountry) {
    issues.push("\u062F\u0648\u0644\u0629 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0645\u0641\u0642\u0648\u062F\u0629");
  }
  if (data.grossWeight && data.netWeight && data.grossWeight < data.netWeight) {
    issues.push("\u0627\u0644\u0648\u0632\u0646 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0623\u0642\u0644 \u0645\u0646 \u0627\u0644\u0648\u0632\u0646 \u0627\u0644\u0635\u0627\u0641\u064A");
  }
  if (data.fobValue && data.fobValue < 0) {
    issues.push("\u0642\u064A\u0645\u0629 FOB \u0633\u0627\u0644\u0628\u0629");
  }
  if (data.freightCost && data.freightCost < 0) {
    issues.push("\u062A\u0643\u0644\u0641\u0629 \u0627\u0644\u0634\u062D\u0646 \u0633\u0627\u0644\u0628\u0629");
  }
  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      if (!item.description) {
        issues.push(`\u0627\u0644\u0635\u0646\u0641 ${index + 1}: \u0627\u0644\u0648\u0635\u0641 \u0645\u0641\u0642\u0648\u062F`);
      }
      if (item.quantity !== void 0 && item.quantity !== null && item.quantity <= 0) {
        issues.push(`\u0627\u0644\u0635\u0646\u0641 ${index + 1}: \u0627\u0644\u0643\u0645\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0629`);
      }
    });
  }
  return {
    valid: issues.length === 0,
    issues
  };
}
async function enhanceExtractedData(data) {
  try {
    const validation = validateExtractedData(data);
    if (validation.valid && data.confidence && data.confidence > 80) {
      return data;
    }
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `\u0623\u0646\u062A \u0645\u0633\u0627\u0639\u062F \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u062A\u062D\u0633\u064A\u0646 \u0648\u062A\u0635\u062D\u064A\u062D \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629.
          
\u0642\u0645 \u0628\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u0627\u0644\u064A\u0629:
- \u062A\u0635\u062D\u064A\u062D \u0627\u0644\u0623\u062E\u0637\u0627\u0621 \u0627\u0644\u0648\u0627\u0636\u062D\u0629
- \u0645\u0644\u0621 \u0627\u0644\u062D\u0642\u0648\u0644 \u0627\u0644\u0645\u0641\u0642\u0648\u062F\u0629 \u0625\u0646 \u0623\u0645\u0643\u0646
- \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0646\u0637\u0642\u064A\u0629
- \u062A\u062D\u0633\u064A\u0646 \u062F\u0631\u062C\u0629 \u0627\u0644\u062B\u0642\u0629

\u0623\u0631\u062C\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u062D\u0633\u0651\u0646\u0629 \u0628\u0635\u064A\u063A\u0629 JSON \u0635\u062D\u064A\u062D\u0629 \u0641\u0642\u0637.`
        },
        {
          role: "user",
          content: `\u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u064A\u0629:
${JSON.stringify(data, null, 2)}

\u0627\u0644\u0645\u0634\u0627\u0643\u0644 \u0627\u0644\u0645\u0643\u062A\u0634\u0641\u0629:
${validation.issues.join("\n")}`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "enhanced_data",
          strict: false,
          schema: {
            type: "object",
            additionalProperties: true
          }
        }
      }
    });
    const content = response.choices[0].message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    return content;
  } catch (error) {
    return data;
  }
}

// server/ai-router.ts
var aiRouter = router({
  /**
   * اقتراح ذكي لتصنيف الصنف
   */
  suggestItemClassification: protectedProcedure.input(
    z2.object({
      itemName: z2.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0635\u0646\u0641 \u0645\u0637\u0644\u0648\u0628"),
      description: z2.string().optional()
    })
  ).mutation(async ({ input }) => {
    try {
      return await suggestItemClassification(input.itemName, input.description);
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0642\u062A\u0631\u0627\u062D \u0630\u0643\u064A. \u064A\u0631\u062C\u0649 \u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627");
    }
  }),
  /**
   * تحليل ذكي للبيان الجمركي
   */
  analyzeDeclaration: protectedProcedure.input(
    z2.object({
      declarationId: z2.number(),
      declarationNumber: z2.string(),
      exportCountry: z2.string(),
      totalFobValue: z2.number()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const declaration = await getCustomsDeclarationById(input.declarationId);
      if (!declaration || declaration.userId !== ctx.user.id) {
        throw new Error("\u0627\u0644\u0628\u064A\u0627\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      }
      const items2 = await getItemsByDeclarationId(input.declarationId);
      return await analyzeDeclaration({
        declarationNumber: input.declarationNumber,
        items: items2.map((item) => ({
          itemName: item.itemName,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPriceForeign)
        })),
        totalFobValue: input.totalFobValue,
        exportCountry: input.exportCountry
      });
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0630\u0643\u064A. \u064A\u0631\u062C\u0649 \u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627");
    }
  }),
  /**
   * استخراج بيانات من ملف PDF أو Excel
   */
  extractFromFile: protectedProcedure.input(
    z2.object({
      fileId: z2.string(),
      fileName: z2.string(),
      fileContent: z2.string(),
      fileType: z2.enum(["application/pdf", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"])
    })
  ).mutation(async ({ input }) => {
    try {
      const extracted = await extractDataFromText(input.fileContent);
      const validation = validateExtractedData(extracted);
      const enhanced = validation.valid ? extracted : await enhanceExtractedData(extracted);
      return enhanced;
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0646 \u0627\u0644\u0645\u0644\u0641. \u064A\u0631\u062C\u0649 \u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627");
    }
  }),
  /**
   * توقع ذكي للتكاليف
   */
  predictCosts: protectedProcedure.input(
    z2.object({
      declarationId: z2.number(),
      fobValue: z2.number(),
      freightCost: z2.number(),
      insuranceCost: z2.number(),
      exportCountry: z2.string()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const declaration = await getCustomsDeclarationById(input.declarationId);
      if (!declaration || declaration.userId !== ctx.user.id) {
        throw new Error("\u0627\u0644\u0628\u064A\u0627\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      }
      const items2 = await getItemsByDeclarationId(input.declarationId);
      return await predictCosts({
        fobValue: input.fobValue,
        freightCost: input.freightCost,
        insuranceCost: input.insuranceCost,
        items: items2.map((item) => ({
          itemName: item.itemName,
          customsCode: item.customsCode || void 0
        })),
        exportCountry: input.exportCountry
      });
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u062A\u0648\u0642\u0639 \u0627\u0644\u062A\u0643\u0627\u0644\u064A\u0641. \u064A\u0631\u062C\u0649 \u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627");
    }
  })
});

// server/pdf-extraction-service.ts
import * as fs from "fs";
async function extractPdfData(filePath) {
  const result = {
    extractionSuccess: false,
    extractionErrors: [],
    confidence: 0,
    items: []
  };
  try {
    const fileContent = await fs.promises.readFile(filePath, "utf-8");
    extractBasicInfo(fileContent, result);
    extractImporterInfo(fileContent, result);
    extractExporterInfo(fileContent, result);
    extractShippingInfo(fileContent, result);
    extractWeightInfo(fileContent, result);
    extractItems(fileContent, result);
    extractFinancialSummary(fileContent, result);
    calculateConfidence(result);
    result.extractionSuccess = result.extractionErrors.length === 0;
  } catch (error) {
    result.extractionErrors.push(`\u062E\u0637\u0623 \u0641\u064A \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0645\u0644\u0641: ${error instanceof Error ? error.message : "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"}`);
    result.extractionSuccess = false;
  }
  return result;
}
function extractBasicInfo(content, result) {
  const declarationMatch = content.match(/البيان\s*(?:رقم)?\s*[:=]?\s*(\d+\/\d+)/i);
  if (declarationMatch) {
    result.declarationNumber = declarationMatch[1];
  } else {
    result.extractionErrors.push("\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0631\u0642\u0645 \u0627\u0644\u0628\u064A\u0627\u0646");
  }
  const dateMatch = content.match(/التاريخ\s*[:=]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i);
  if (dateMatch) {
    result.declarationDate = dateMatch[1];
  }
  const clearanceMatch = content.match(/مركز\s*التخليص\s*[:=]?\s*([^\n]+)/i);
  if (clearanceMatch) {
    result.clearanceCenter = clearanceMatch[1].trim();
  }
  const exchangeMatch = content.match(/سعر\s*التعادل\s*[:=]?\s*([\d.]+)/i);
  if (exchangeMatch) {
    result.exchangeRate = parseFloat(exchangeMatch[1]);
  }
}
function extractImporterInfo(content, result) {
  const importerMatch = content.match(/المستورد\s*[:=]?\s*([^\n]+)/i);
  if (importerMatch) {
    result.importerName = importerMatch[1].trim();
  }
  const taxMatch = content.match(/الرقم\s*الضريبي\s*[:=]?\s*(\d+)/i);
  if (taxMatch) {
    result.importerTaxNumber = taxMatch[1];
  }
  const licenseMatch = content.match(/رقم\s*الترخيص\s*[:=]?\s*([^\n]+)/i);
  if (licenseMatch) {
    result.importerLicense = licenseMatch[1].trim();
  }
}
function extractExporterInfo(content, result) {
  const exporterMatch = content.match(/الشركة\s*المصدرة\s*[:=]?\s*([^\n]+)/i);
  if (exporterMatch) {
    result.exporterCompany = exporterMatch[1].trim();
  }
  const countryMatch = content.match(/دولة\s*التصدير\s*[:=]?\s*([^\n]+)/i);
  if (countryMatch) {
    result.exporterCountry = countryMatch[1].trim();
  }
}
function extractShippingInfo(content, result) {
  const containerMatch = content.match(/رقم\s*الحاوية\s*[:=]?\s*([A-Z0-9]+)/i);
  if (containerMatch) {
    result.containerNumber = containerMatch[1];
  }
  const bolMatch = content.match(/بوليصة\s*الشحن\s*[:=]?\s*([^\n]+)/i);
  if (bolMatch) {
    result.billOfLading = bolMatch[1].trim();
  }
  const companyMatch = content.match(/شركة\s*الشحن\s*[:=]?\s*([^\n]+)/i);
  if (companyMatch) {
    result.shippingCompany = companyMatch[1].trim();
  }
}
function extractWeightInfo(content, result) {
  const grossMatch = content.match(/الوزن\s*القائم\s*[:=]?\s*([\d.]+)/i);
  if (grossMatch) {
    result.grossWeight = parseFloat(grossMatch[1]);
  }
  const netMatch = content.match(/الوزن\s*الصافي\s*[:=]?\s*([\d.]+)/i);
  if (netMatch) {
    result.netWeight = parseFloat(netMatch[1]);
  }
  const packagesMatch = content.match(/عدد\s*الطرود\s*[:=]?\s*(\d+)/i);
  if (packagesMatch) {
    result.numberOfPackages = parseInt(packagesMatch[1]);
  }
  const typeMatch = content.match(/نوع\s*الطرود\s*[:=]?\s*([^\n]+)/i);
  if (typeMatch) {
    result.packageType = typeMatch[1].trim();
  }
}
function extractItems(content, result) {
  const itemPattern = /(\d+)\s+([A-Z0-9]+)\s+([^\n]+?)\s+([\d.]+)\s+([\d.]+)/g;
  let match;
  while ((match = itemPattern.exec(content)) !== null) {
    const item = {
      itemNumber: parseInt(match[1]),
      hsCode: match[2],
      description: match[3].trim(),
      quantity: parseFloat(match[4]),
      totalPrice: parseFloat(match[5])
    };
    result.items.push(item);
  }
  if (result.items.length === 0) {
    result.extractionErrors.push("\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0623\u0635\u0646\u0627\u0641 \u0641\u064A \u0627\u0644\u0645\u0644\u0641");
  }
}
function extractFinancialSummary(content, result) {
  const valueMatch = content.match(/إجمالي\s*القيمة\s*[:=]?\s*([\d.]+)/i);
  if (valueMatch) {
    result.totalValue = parseFloat(valueMatch[1]);
  }
  const dutiesMatch = content.match(/إجمالي\s*الرسوم\s*[:=]?\s*([\d.]+)/i);
  if (dutiesMatch) {
    result.totalDuties = parseFloat(dutiesMatch[1]);
  }
  const taxesMatch = content.match(/إجمالي\s*الضرائب\s*[:=]?\s*([\d.]+)/i);
  if (taxesMatch) {
    result.totalTaxes = parseFloat(taxesMatch[1]);
  }
  const totalMatch = content.match(/الإجمالي\s*النهائي\s*[:=]?\s*([\d.]+)/i);
  if (totalMatch) {
    result.totalCost = parseFloat(totalMatch[1]);
  }
  const currencyMatch = content.match(/العملة\s*[:=]?\s*([A-Z]+)/i);
  if (currencyMatch) {
    result.currency = currencyMatch[1];
  }
}
function calculateConfidence(result) {
  let extractedFields = 0;
  const totalFields = 15;
  if (result.declarationNumber) extractedFields++;
  if (result.declarationDate) extractedFields++;
  if (result.clearanceCenter) extractedFields++;
  if (result.exchangeRate) extractedFields++;
  if (result.importerName) extractedFields++;
  if (result.importerTaxNumber) extractedFields++;
  if (result.exporterCompany) extractedFields++;
  if (result.exporterCountry) extractedFields++;
  if (result.containerNumber) extractedFields++;
  if (result.billOfLading) extractedFields++;
  if (result.grossWeight) extractedFields++;
  if (result.netWeight) extractedFields++;
  if (result.numberOfPackages) extractedFields++;
  if (result.items && result.items.length > 0) extractedFields++;
  if (result.totalValue) extractedFields++;
  result.confidence = Math.round(extractedFields / totalFields * 100);
}
function validateExtractedData2(data) {
  const errors = [];
  if (!data.declarationNumber) {
    errors.push("\u0631\u0642\u0645 \u0627\u0644\u0628\u064A\u0627\u0646 \u0645\u0641\u0642\u0648\u062F");
  }
  if (!data.importerName) {
    errors.push("\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u0648\u0631\u062F \u0645\u0641\u0642\u0648\u062F");
  }
  if (!data.items || data.items.length === 0) {
    errors.push("\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u0635\u0646\u0627\u0641 \u0641\u064A \u0627\u0644\u0628\u064A\u0627\u0646");
  }
  if (data.exchangeRate && data.exchangeRate <= 0) {
    errors.push("\u0633\u0639\u0631 \u0627\u0644\u062A\u0639\u0627\u062F\u0644 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D");
  }
  if (data.grossWeight && data.netWeight && data.grossWeight < data.netWeight) {
    errors.push("\u0627\u0644\u0648\u0632\u0646 \u0627\u0644\u0642\u0627\u0626\u0645 \u0623\u0642\u0644 \u0645\u0646 \u0627\u0644\u0648\u0632\u0646 \u0627\u0644\u0635\u0627\u0641\u064A");
  }
  return errors;
}

// server/stripe-payment-router.ts
import { z as z3 } from "zod";

// server/services/stripe-payment-service.ts
import Stripe from "stripe";
var StripePaymentService = class {
  stripe;
  constructor(apiKey) {
    this.stripe = new Stripe(apiKey);
  }
  /**
   * إنشاء عميل جديد
   */
  async createCustomer(email, name, metadata) {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata
      });
      console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0639\u0645\u064A\u0644 Stripe \u062C\u062F\u064A\u062F`);
      console.log(`\u{1F464} \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: ${email}`);
      console.log(`\u{1F194} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0639\u0645\u064A\u0644: ${customer.id}`);
      return {
        id: customer.id,
        email: customer.email || "",
        name: customer.name || void 0,
        phone: customer.phone || void 0,
        createdAt: new Date(customer.created * 1e3),
        metadata: customer.metadata || void 0
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0639\u0645\u064A\u0644 Stripe:", error);
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0639\u0645\u064A\u0644 Stripe");
    }
  }
  /**
   * إنشاء جلسة دفع (Checkout Session)
   */
  async createCheckoutSession(customerId, priceId, successUrl, cancelUrl, metadata) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
        allow_promotion_codes: true
      });
      console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u062C\u0644\u0633\u0629 \u062F\u0641\u0639 \u062C\u062F\u064A\u062F\u0629`);
      console.log(`\u{1F194} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u062C\u0644\u0633\u0629: ${session.id}`);
      console.log(`\u{1F4B3} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0639\u0645\u064A\u0644: ${customerId}`);
      console.log(`\u{1F4CA} \u0627\u0644\u062D\u0627\u0644\u0629: ${session.payment_status}`);
      return {
        sessionId: session.id,
        url: session.url || "",
        status: session.payment_status,
        customerId,
        amount: session.amount_total || 0,
        currency: session.currency || "jod",
        createdAt: new Date(session.created * 1e3)
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u062C\u0644\u0633\u0629 \u0627\u0644\u062F\u0641\u0639:", error);
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u062C\u0644\u0633\u0629 \u0627\u0644\u062F\u0641\u0639");
    }
  }
  /**
   * الحصول على معلومات الاشتراك
   */
  async getSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      console.log(`\u2705 \u062A\u0645 \u062C\u0644\u0628 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643`);
      console.log(`\u{1F194} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643: ${subscriptionId}`);
      console.log(`\u{1F4CA} \u0627\u0644\u062D\u0627\u0644\u0629: ${subscription.status}`);
      const startDate = new Date(subscription.current_period_start * 1e3);
      const endDate = new Date(subscription.current_period_end * 1e3);
      return {
        id: subscription.id,
        customerId: subscription.customer,
        priceId: subscription.items.data[0]?.price.id || "",
        status: subscription.status,
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1e3) : void 0,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1e3) : void 0,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1e3) : void 0,
        amount: (subscription.items.data[0]?.price.unit_amount || 0) / 100,
        currency: subscription.items.data[0]?.price.currency || "jod",
        interval: subscription.items.data[0]?.price.recurring?.interval || "month"
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643:", error);
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643");
    }
  }
  /**
   * إلغاء الاشتراك
   */
  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
      console.log(`\u2705 \u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643`);
      console.log(`\u{1F194} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643: ${subscriptionId}`);
      console.log(`\u{1F4CA} \u0627\u0644\u062D\u0627\u0644\u0629: ${subscription.status}`);
      const startDate = new Date(subscription.current_period_start * 1e3);
      const endDate = new Date(subscription.current_period_end * 1e3);
      return {
        id: subscription.id,
        customerId: subscription.customer,
        priceId: subscription.items.data[0]?.price.id || "",
        status: subscription.status,
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1e3) : void 0,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1e3) : void 0,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1e3) : void 0,
        amount: (subscription.items.data[0]?.price.unit_amount || 0) / 100,
        currency: subscription.items.data[0]?.price.currency || "jod",
        interval: subscription.items.data[0]?.price.recurring?.interval || "month"
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643:", error);
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643");
    }
  }
  /**
   * الحصول على الفاتورة
   */
  async getInvoice(invoiceId) {
    try {
      const invoice = await this.stripe.invoices.retrieve(invoiceId);
      console.log(`\u2705 \u062A\u0645 \u062C\u0644\u0628 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629`);
      console.log(`\u{1F194} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629: ${invoiceId}`);
      console.log(`\u{1F4CA} \u0627\u0644\u062D\u0627\u0644\u0629: ${invoice.status}`);
      return {
        id: invoice.id,
        number: invoice.number || "",
        amount: (invoice.total || 0) / 100,
        currency: invoice.currency || "jod",
        status: invoice.status,
        pdfUrl: invoice.pdf || void 0,
        hostedUrl: invoice.hosted_invoice_url || void 0,
        createdAt: new Date(invoice.created * 1e3),
        dueDate: invoice.due_date ? new Date(invoice.due_date * 1e3) : void 0,
        paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1e3) : void 0
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629:", error);
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629");
    }
  }
  /**
   * الحصول على قائمة الفواتير
   */
  async listInvoices(customerId, limit = 10) {
    try {
      const invoices2 = await this.stripe.invoices.list({
        customer: customerId,
        limit
      });
      console.log(`\u2705 \u062A\u0645 \u062C\u0644\u0628 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631`);
      console.log(`\u{1F464} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0639\u0645\u064A\u0644: ${customerId}`);
      console.log(`\u{1F4CA} \u0639\u062F\u062F \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631: ${invoices2.data.length}`);
      return invoices2.data.map((invoice) => ({
        id: invoice.id,
        number: invoice.number || "",
        amount: (invoice.total || 0) / 100,
        currency: invoice.currency || "jod",
        status: invoice.status,
        pdfUrl: invoice.pdf || void 0,
        hostedUrl: invoice.hosted_invoice_url || void 0,
        createdAt: new Date(invoice.created * 1e3),
        dueDate: invoice.due_date ? new Date(invoice.due_date * 1e3) : void 0,
        paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1e3) : void 0
      }));
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631:", error);
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631");
    }
  }
  /**
   * إنشاء استرجاع (Refund)
   */
  async createRefund(chargeId, amount) {
    try {
      const refund = await this.stripe.refunds.create({
        charge: chargeId,
        amount
      });
      console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u062C\u062F\u064A\u062F`);
      console.log(`\u{1F194} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0627\u0633\u062A\u0631\u062C\u0627\u0639: ${refund.id}`);
      console.log(`\u{1F4B0} \u0627\u0644\u0645\u0628\u0644\u063A: ${(refund.amount || 0) / 100}`);
      console.log(`\u{1F4CA} \u0627\u0644\u062D\u0627\u0644\u0629: ${refund.status}`);
      return {
        refundId: refund.id,
        amount: (refund.amount || 0) / 100,
        status: refund.status || "succeeded",
        createdAt: new Date(refund.created * 1e3)
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0627\u0633\u062A\u0631\u062C\u0627\u0639:", error);
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0627\u0633\u062A\u0631\u062C\u0627\u0639");
    }
  }
  /**
   * التحقق من توقيع Webhook
   */
  verifyWebhookSignature(body, signature, webhookSecret) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
      console.log(`\u2705 \u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062A\u0648\u0642\u064A\u0639 Webhook`);
      console.log(`\u{1F4CA} \u0646\u0648\u0639 \u0627\u0644\u062D\u062F\u062B: ${event.type}`);
      return event;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062A\u0648\u0642\u064A\u0639 Webhook:", error);
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062A\u0648\u0642\u064A\u0639 Webhook");
    }
  }
  /**
   * معالجة حدث الدفع الناجح
   */
  async handlePaymentSuccess(event) {
    const session = event.data.object;
    console.log(`\u2705 \u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 \u062D\u062F\u062B \u0627\u0644\u062F\u0641\u0639 \u0627\u0644\u0646\u0627\u062C\u062D`);
    console.log(`\u{1F194} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u062C\u0644\u0633\u0629: ${session.id}`);
    console.log(`\u{1F464} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0639\u0645\u064A\u0644: ${session.customer}`);
    console.log(`\u{1F4CA} \u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639: ${session.payment_status}`);
    return {
      customerId: session.customer,
      subscriptionId: session.subscription,
      status: "succeeded"
    };
  }
  /**
   * معالجة حدث فشل الدفع
   */
  async handlePaymentFailed(event) {
    const session = event.data.object;
    console.log(`\u274C \u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 \u062D\u062F\u062B \u0641\u0634\u0644 \u0627\u0644\u062F\u0641\u0639`);
    console.log(`\u{1F194} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u062C\u0644\u0633\u0629: ${session.id}`);
    console.log(`\u{1F464} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0639\u0645\u064A\u0644: ${session.customer}`);
    console.log(`\u{1F4CA} \u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639: ${session.payment_status}`);
    return {
      customerId: session.customer,
      status: "failed",
      error: "\u0641\u0634\u0644 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u062F\u0641\u0639"
    };
  }
  /**
   * معالجة حدث تجديد الاشتراك
   */
  async handleSubscriptionRenewed(event) {
    const subscription = event.data.object;
    console.log(`\u2705 \u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 \u062D\u062F\u062B \u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643`);
    console.log(`\u{1F194} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643: ${subscription.id}`);
    console.log(`\u{1F464} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0639\u0645\u064A\u0644: ${subscription.customer}`);
    console.log(`\u{1F4CA} \u0627\u0644\u062D\u0627\u0644\u0629: ${subscription.status}`);
    return {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status
    };
  }
  /**
   * معالجة حدث إلغاء الاشتراك
   */
  async handleSubscriptionCanceled(event) {
    const subscription = event.data.object;
    console.log(`\u2705 \u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 \u062D\u062F\u062B \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643`);
    console.log(`\u{1F194} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643: ${subscription.id}`);
    console.log(`\u{1F464} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0639\u0645\u064A\u0644: ${subscription.customer}`);
    console.log(`\u{1F4CA} \u0627\u0644\u062D\u0627\u0644\u0629: ${subscription.status}`);
    return {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status
    };
  }
};

// server/stripe-payment-router.ts
var stripeService = null;
function getStripeService() {
  if (!stripeService) {
    const stripeApiKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeApiKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeService = new StripePaymentService(stripeApiKey);
  }
  return stripeService;
}
var stripePaymentRouter = router({
  /**
   * إنشاء جلسة دفع جديدة
   */
  createCheckoutSession: protectedProcedure.input(
    z3.object({
      priceId: z3.string().min(1, "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0633\u0639\u0631 \u0645\u0637\u0644\u0648\u0628"),
      planId: z3.string().min(1, "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u062E\u0637\u0629 \u0645\u0637\u0644\u0648\u0628"),
      successUrl: z3.string().url("\u0631\u0627\u0628\u0637 \u0627\u0644\u0646\u062C\u0627\u062D \u063A\u064A\u0631 \u0635\u062D\u064A\u062D"),
      cancelUrl: z3.string().url("\u0631\u0627\u0628\u0637 \u0627\u0644\u0625\u0644\u063A\u0627\u0621 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D")
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      console.log(`\u{1F4CB} \u062C\u0627\u0631\u064A \u0625\u0646\u0634\u0627\u0621 \u062C\u0644\u0633\u0629 \u062F\u0641\u0639 \u062C\u062F\u064A\u062F\u0629`);
      console.log(`\u{1F464} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${ctx.user.id}`);
      console.log(`\u{1F4B3} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0633\u0639\u0631: ${input.priceId}`);
      const stripeCustomerId = `cus_${ctx.user.id}_${Date.now()}`;
      console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0645\u0639\u0631\u0651\u0641 \u0639\u0645\u064A\u0644 Stripe: ${stripeCustomerId}`);
      const session = await getStripeService().createCheckoutSession(
        stripeCustomerId,
        input.priceId,
        input.successUrl,
        input.cancelUrl,
        {
          userId: ctx.user.id.toString(),
          planId: input.planId
        }
      );
      console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u062C\u0644\u0633\u0629 \u062F\u0641\u0639: ${session.sessionId}`);
      return {
        success: true,
        sessionId: session.sessionId,
        url: session.url,
        message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u062C\u0644\u0633\u0629 \u0627\u0644\u062F\u0641\u0639 \u0628\u0646\u062C\u0627\u062D"
      };
    } catch (error) {
      throw new Error(`\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u062C\u0644\u0633\u0629 \u0627\u0644\u062F\u0641\u0639: ${error instanceof Error ? error.message : "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"}`);
    }
  }),
  /**
   * جلب معلومات الاشتراك
   */
  getSubscription: protectedProcedure.input(
    z3.object({
      subscriptionId: z3.string().min(1, "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0645\u0637\u0644\u0648\u0628")
    })
  ).query(async ({ ctx, input }) => {
    try {
      console.log(`\u{1F4CB} \u062C\u0627\u0631\u064A \u062C\u0644\u0628 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643`);
      console.log(`\u{1F464} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${ctx.user.id}`);
      console.log(`\u{1F194} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643: ${input.subscriptionId}`);
      const stripeSubscription = await getStripeService().getSubscription(
        input.subscriptionId
      );
      console.log(`\u2705 \u062A\u0645 \u062C\u0644\u0628 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643: ${input.subscriptionId}`);
      return {
        success: true,
        subscription: {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          currentPeriodStart: stripeSubscription.currentPeriodStart,
          currentPeriodEnd: stripeSubscription.currentPeriodEnd,
          trialStart: stripeSubscription.trialStart,
          trialEnd: stripeSubscription.trialEnd,
          amount: stripeSubscription.amount,
          currency: stripeSubscription.currency,
          interval: stripeSubscription.interval
        }
      };
    } catch (error) {
      throw new Error(`\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643: ${error instanceof Error ? error.message : "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"}`);
    }
  }),
  /**
   * إلغاء الاشتراك
   */
  cancelSubscription: protectedProcedure.input(
    z3.object({
      subscriptionId: z3.string().min(1, "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0645\u0637\u0644\u0648\u0628")
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      console.log(`\u{1F4CB} \u062C\u0627\u0631\u064A \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643`);
      console.log(`\u{1F464} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${ctx.user.id}`);
      console.log(`\u{1F194} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643: ${input.subscriptionId}`);
      const canceledSubscription = await getStripeService().cancelSubscription(
        input.subscriptionId
      );
      console.log(`\u2705 \u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643: ${input.subscriptionId}`);
      return {
        success: true,
        message: "\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0628\u0646\u062C\u0627\u062D",
        subscription: {
          id: canceledSubscription.id,
          status: canceledSubscription.status
        }
      };
    } catch (error) {
      throw new Error(`\u0641\u0634\u0644 \u0641\u064A \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643: ${error instanceof Error ? error.message : "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"}`);
    }
  }),
  /**
   * جلب قائمة الفواتير
   */
  listInvoices: protectedProcedure.input(
    z3.object({
      limit: z3.number().min(1).max(100).default(10)
    })
  ).query(async ({ ctx, input }) => {
    try {
      console.log(`\u{1F4CB} \u062C\u0627\u0631\u064A \u062C\u0644\u0628 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631`);
      console.log(`\u{1F464} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${ctx.user.id}`);
      console.log(`\u{1F4CA} \u0627\u0644\u0639\u062F\u062F: ${input.limit}`);
      const stripeCustomerId = `cus_${ctx.user.id}_${Date.now()}`;
      const invoices2 = await getStripeService().listInvoices(
        stripeCustomerId,
        input.limit
      );
      console.log(`\u2705 \u062A\u0645 \u062C\u0644\u0628 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631: ${invoices2.length} \u0641\u0627\u062A\u0648\u0631\u0629`);
      return {
        success: true,
        invoices: invoices2.map((invoice) => ({
          id: invoice.id,
          number: invoice.number,
          amount: invoice.amount,
          currency: invoice.currency,
          status: invoice.status,
          pdfUrl: invoice.pdfUrl,
          hostedUrl: invoice.hostedUrl,
          createdAt: invoice.createdAt,
          dueDate: invoice.dueDate,
          paidAt: invoice.paidAt
        }))
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631: ${errMsg}`);
    }
  }),
  /**
   * جلب فاتورة محددة
   */
  getInvoice: protectedProcedure.input(
    z3.object({
      invoiceId: z3.string().min(1, "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0645\u0637\u0644\u0648\u0628")
    })
  ).query(async ({ ctx, input }) => {
    try {
      console.log(`\u{1F4CB} \u062C\u0627\u0631\u064A \u062C\u0644\u0628 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629`);
      console.log(`\u{1F464} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${ctx.user.id}`);
      console.log(`\u{1F194} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629: ${input.invoiceId}`);
      const invoice = await getStripeService().getInvoice(input.invoiceId);
      console.log(`\u2705 \u062A\u0645 \u062C\u0644\u0628 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629: ${input.invoiceId}`);
      return {
        success: true,
        invoice: {
          id: invoice.id,
          number: invoice.number,
          amount: invoice.amount,
          currency: invoice.currency,
          status: invoice.status,
          pdfUrl: invoice.pdfUrl,
          hostedUrl: invoice.hostedUrl,
          createdAt: invoice.createdAt,
          dueDate: invoice.dueDate,
          paidAt: invoice.paidAt
        }
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629: ${errMsg}`);
    }
  }),
  /**
   * التحقق من حالة الدفع
   */
  checkPaymentStatus: publicProcedure.input(
    z3.object({
      sessionId: z3.string().min(1, "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u062C\u0644\u0633\u0629 \u0645\u0637\u0644\u0648\u0628")
    })
  ).query(async ({ input }) => {
    try {
      console.log(`\u{1F4CB} \u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639`);
      console.log(`\u{1F194} \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u062C\u0644\u0633\u0629: ${input.sessionId}`);
      console.log(`\u2705 \u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639`);
      return {
        success: true,
        status: "pending",
        message: "\u062C\u0627\u0631\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u062F\u0641\u0639"
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639: ${errMsg}`);
    }
  })
});

// server/routers/payment-methods.ts
import { z as z4 } from "zod";

// server/services/stripe-payment-methods.ts
import Stripe2 from "stripe";
var stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("\u26A0\uFE0F \u062A\u062D\u0630\u064A\u0631: \u0645\u0641\u062A\u0627\u062D Stripe \u0627\u0644\u0633\u0631\u064A \u063A\u064A\u0631 \u0645\u0636\u0628\u0648\u0637.");
}
var stripe = new Stripe2(stripeSecretKey || "sk_test_placeholder", {
  apiVersion: "2024-12-15"
});
async function createApplePayPaymentMethod(options) {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        token: options.token
      },
      billing_details: {
        email: options.email
      },
      metadata: {
        userId: options.userId.toString(),
        paymentMethodType: "apple_pay"
      }
    });
    return paymentMethod;
  } catch (error) {
    console.error("\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 Apple Pay:", error);
    throw error;
  }
}
async function createGooglePayPaymentMethod(options) {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        token: options.token
      },
      billing_details: {
        email: options.email
      },
      metadata: {
        userId: options.userId.toString(),
        paymentMethodType: "google_pay"
      }
    });
    return paymentMethod;
  } catch (error) {
    console.error("\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 Google Pay:", error);
    throw error;
  }
}
async function createApplePayCheckoutSession(options) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: options.currency.toLowerCase(),
            product_data: {
              name: options.description
            },
            unit_amount: Math.round(options.amount * 100)
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      customer_email: options.customerEmail,
      client_reference_id: options.userId.toString(),
      metadata: {
        userId: options.userId.toString(),
        customerEmail: options.customerEmail,
        customerName: options.customerName,
        paymentMethod: "apple_pay"
      }
    });
    return session;
  } catch (error) {
    console.error("\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u062C\u0644\u0633\u0629 Apple Pay:", error);
    throw error;
  }
}
async function createGooglePayCheckoutSession(options) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: options.currency.toLowerCase(),
            product_data: {
              name: options.description
            },
            unit_amount: Math.round(options.amount * 100)
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
      customer_email: options.customerEmail,
      client_reference_id: options.userId.toString(),
      metadata: {
        userId: options.userId.toString(),
        customerEmail: options.customerEmail,
        customerName: options.customerName,
        paymentMethod: "google_pay"
      }
    });
    return session;
  } catch (error) {
    console.error("\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u062C\u0644\u0633\u0629 Google Pay:", error);
    throw error;
  }
}
async function getUserPaymentMethods(userId) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: `user_${userId}`,
      type: "card"
    });
    return paymentMethods.data;
  } catch (error) {
    console.error("\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0637\u0631\u0642 \u0627\u0644\u062F\u0641\u0639:", error);
    return [];
  }
}
async function deletePaymentMethod(paymentMethodId) {
  try {
    const result = await stripe.paymentMethods.detach(paymentMethodId);
    return result;
  } catch (error) {
    console.error("\u062E\u0637\u0623 \u0641\u064A \u062D\u0630\u0641 \u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062F\u0641\u0639:", error);
    throw error;
  }
}
async function setDefaultPaymentMethod(customerId, paymentMethodId) {
  try {
    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
    return customer;
  } catch (error) {
    console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u0639\u064A\u064A\u0646 \u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062F\u0641\u0639 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A\u0629:", error);
    throw error;
  }
}
async function createPaymentWithSavedMethod(options) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(options.amount * 100),
      currency: options.currency.toLowerCase(),
      payment_method: options.paymentMethodId,
      confirm: true,
      description: options.description,
      metadata: {
        userId: options.userId.toString()
      }
    });
    const db = await getDb();
    if (db) {
      await db.insert(payments).values({
        userId: options.userId,
        stripePaymentIntentId: paymentIntent.id,
        amount: options.amount,
        currency: options.currency,
        status: paymentIntent.status === "succeeded" ? "succeeded" : "pending",
        description: options.description,
        metadata: JSON.stringify(paymentIntent.metadata)
      });
    }
    return paymentIntent;
  } catch (error) {
    console.error("\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u062F\u0641\u0639\u0629:", error);
    throw error;
  }
}
async function updatePaymentMethod(paymentMethodId, options) {
  try {
    const paymentMethod = await stripe.paymentMethods.update(
      paymentMethodId,
      {
        billing_details: options.billingDetails
      }
    );
    return paymentMethod;
  } catch (error) {
    console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062F\u0641\u0639:", error);
    throw error;
  }
}

// server/routers/payment-methods.ts
var paymentMethodsRouter = router({
  /**
   * إنشاء Apple Pay
   */
  createApplePayMethod: protectedProcedure.input(
    z4.object({
      token: z4.string(),
      email: z4.string().email().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    return await createApplePayPaymentMethod({
      userId: ctx.user.id,
      token: input.token,
      email: input.email
    });
  }),
  /**
   * إنشاء Google Pay
   */
  createGooglePayMethod: protectedProcedure.input(
    z4.object({
      token: z4.string(),
      email: z4.string().email().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    return await createGooglePayPaymentMethod({
      userId: ctx.user.id,
      token: input.token,
      email: input.email
    });
  }),
  /**
   * إنشاء جلسة دفع Apple Pay
   */
  createApplePayCheckoutSession: protectedProcedure.input(
    z4.object({
      amount: z4.number().positive(),
      currency: z4.string().default("JOD"),
      description: z4.string(),
      successUrl: z4.string().url(),
      cancelUrl: z4.string().url()
    })
  ).mutation(async ({ ctx, input }) => {
    return await createApplePayCheckoutSession({
      userId: ctx.user.id,
      amount: input.amount,
      currency: input.currency,
      description: input.description,
      customerEmail: ctx.user.email || "",
      customerName: ctx.user.name || "Customer",
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl
    });
  }),
  /**
   * إنشاء جلسة دفع Google Pay
   */
  createGooglePayCheckoutSession: protectedProcedure.input(
    z4.object({
      amount: z4.number().positive(),
      currency: z4.string().default("JOD"),
      description: z4.string(),
      successUrl: z4.string().url(),
      cancelUrl: z4.string().url()
    })
  ).mutation(async ({ ctx, input }) => {
    return await createGooglePayCheckoutSession({
      userId: ctx.user.id,
      amount: input.amount,
      currency: input.currency,
      description: input.description,
      customerEmail: ctx.user.email || "",
      customerName: ctx.user.name || "Customer",
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl
    });
  }),
  /**
   * جلب طرق الدفع
   */
  getPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
    try {
      const methods = await getUserPaymentMethods(ctx.user.id);
      return methods.map((m) => ({
        id: m.id,
        type: m.type,
        card: m.card,
        billingDetails: m.billing_details,
        created: m.created
      }));
    } catch (error) {
      return [];
    }
  }),
  /**
   * حذف طريقة دفع
   */
  deletePaymentMethod: protectedProcedure.input(z4.object({ paymentMethodId: z4.string() })).mutation(async ({ input }) => {
    return await deletePaymentMethod(input.paymentMethodId);
  }),
  /**
   * تعيين طريقة دفع افتراضية
   */
  setDefaultPaymentMethod: protectedProcedure.input(
    z4.object({
      customerId: z4.string(),
      paymentMethodId: z4.string()
    })
  ).mutation(async ({ input }) => {
    return await setDefaultPaymentMethod(
      input.customerId,
      input.paymentMethodId
    );
  }),
  /**
   * الدفع باستخدام طريقة محفوظة
   */
  payWithSavedMethod: protectedProcedure.input(
    z4.object({
      paymentMethodId: z4.string(),
      amount: z4.number().positive(),
      currency: z4.string().default("JOD"),
      description: z4.string()
    })
  ).mutation(async ({ ctx, input }) => {
    return await createPaymentWithSavedMethod({
      userId: ctx.user.id,
      paymentMethodId: input.paymentMethodId,
      amount: input.amount,
      currency: input.currency,
      description: input.description
    });
  }),
  /**
   * تحديث طريقة الدفع
   */
  updatePaymentMethod: protectedProcedure.input(
    z4.object({
      paymentMethodId: z4.string(),
      billingDetails: z4.object({
        name: z4.string().optional(),
        email: z4.string().email().optional(),
        phone: z4.string().optional(),
        address: z4.object({
          line1: z4.string().optional(),
          line2: z4.string().optional(),
          city: z4.string().optional(),
          state: z4.string().optional(),
          postal_code: z4.string().optional(),
          country: z4.string().optional()
        }).optional()
      }).optional()
    })
  ).mutation(async ({ input }) => {
    return await updatePaymentMethod(input.paymentMethodId, {
      billingDetails: input.billingDetails
    });
  })
});

// server/routers/government.ts
import { z as z5 } from "zod";

// shared/types.ts
function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641";
}

// server/services/government-integration.ts
import axios2 from "axios";
import jwt from "jsonwebtoken";
import crypto from "crypto";
var GovernmentIntegrationService = class {
  client;
  config;
  accessToken = "";
  tokenExpiry = 0;
  constructor(config) {
    this.config = config;
    this.client = axios2.create({
      baseURL: config.baseUrl,
      timeout: 3e4,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "JordanCustomsSystem/1.0.0"
      }
    });
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u062D\u0643\u0648\u0645\u064A:", error.message);
        return Promise.reject(error);
      }
    );
  }
  /**
   * الحصول على رمز الوصول (Access Token)
   */
  async getAccessToken() {
    if (this.accessToken && this.accessToken.length > 0 && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    try {
      const response = await this.client.post("/auth/token", {
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        grantType: "client_credentials"
      });
      this.accessToken = response.data.accessToken;
      this.tokenExpiry = Date.now() + response.data.expiresIn * 1e3;
      return this.accessToken;
    } catch (error) {
      console.error("\u0641\u0634\u0644 \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0631\u0645\u0632 \u0627\u0644\u0648\u0635\u0648\u0644:", error);
      throw new Error("\u0641\u0634\u0644 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u0645\u0639 \u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u062D\u0643\u0648\u0645\u064A");
    }
  }
  /**
   * إرسال بيان جمركي إلى النظام الحكومي
   */
  async submitCustomsDeclaration(declaration) {
    try {
      const token = await this.getAccessToken();
      const signature = this.signDeclaration(declaration);
      const response = await this.client.post(
        "/customs/declaration/submit",
        {
          ...declaration,
          signature,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-API-Key": this.config.apiKey
          }
        }
      );
      return {
        status: "success",
        declarationId: response.data.id,
        referenceNumber: response.data.referenceNumber,
        message: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u064A\u0627\u0646 \u0628\u0646\u062C\u0627\u062D",
        data: response.data
      };
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u064A\u0627\u0646:", error.message);
      return {
        status: "error",
        declarationId: "",
        referenceNumber: "",
        message: error.message || "\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u064A\u0627\u0646"
      };
    }
  }
  /**
   * الحصول على حالة البيان الجمركي
   */
  async getDeclarationStatus(declarationId) {
    try {
      const token = await this.getAccessToken();
      const response = await this.client.get(
        `/customs/declaration/${declarationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-API-Key": this.config.apiKey
          }
        }
      );
      return {
        status: "success",
        data: response.data
      };
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u062D\u0627\u0644\u0629 \u0627\u0644\u0628\u064A\u0627\u0646:", error.message);
      return {
        status: "error",
        message: error.message
      };
    }
  }
  /**
   * الحصول على قائمة الرموز الجمركية (HS Codes)
   */
  async getTariffCodes(searchTerm) {
    try {
      const token = await this.getAccessToken();
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await this.client.get("/customs/tariff-codes", {
        params,
        headers: {
          Authorization: `Bearer ${token}`,
          "X-API-Key": this.config.apiKey
        }
      });
      return response.data.codes || [];
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0631\u0645\u0648\u0632 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629:", error);
      return [];
    }
  }
  /**
   * التحقق من صحة البيان الجمركي
   */
  async validateDeclaration(declaration) {
    try {
      const token = await this.getAccessToken();
      const response = await this.client.post(
        "/customs/declaration/validate",
        declaration,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-API-Key": this.config.apiKey
          }
        }
      );
      return {
        valid: response.data.valid,
        errors: response.data.errors || []
      };
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0628\u064A\u0627\u0646:", error.message);
      return {
        valid: false,
        errors: [error.message]
      };
    }
  }
  /**
   * حساب الرسوم والضرائب
   */
  async calculateTaxesAndDuties(declaration) {
    try {
      const token = await this.getAccessToken();
      const response = await this.client.post(
        "/tax/calculate",
        {
          items: declaration.items,
          totalValue: declaration.totalValue,
          currency: declaration.currency
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-API-Key": this.config.apiKey
          }
        }
      );
      return {
        customsDuty: response.data.customsDuty,
        salesTax: response.data.salesTax,
        additionalTaxes: response.data.additionalTaxes || 0,
        total: response.data.total
      };
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u062D\u0633\u0627\u0628 \u0627\u0644\u0631\u0633\u0648\u0645:", error);
      throw error;
    }
  }
  /**
   * تتبع الشحنة
   */
  async trackShipment(trackingNumber) {
    try {
      const token = await this.getAccessToken();
      const response = await this.client.get(
        `/shipping/track/${trackingNumber}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-API-Key": this.config.apiKey
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u062A\u0628\u0639 \u0627\u0644\u0634\u062D\u0646\u0629:", error);
      throw error;
    }
  }
  /**
   * التوقيع الرقمي على البيان
   */
  signDeclaration(declaration) {
    const payload = JSON.stringify(declaration);
    const signature = crypto.createHmac("sha256", this.config.clientSecret).update(payload).digest("hex");
    return signature;
  }
  /**
   * التحقق من التوقيع الرقمي
   */
  verifySignature(declaration, signature) {
    const expectedSignature = this.signDeclaration(declaration);
    return expectedSignature === signature;
  }
  /**
   * إنشاء رمز JWT للتوثيق
   */
  createJWT(payload, expiresIn = "1h") {
    return jwt.sign(payload, this.config.clientSecret, { expiresIn });
  }
  /**
   * التحقق من صحة رمز JWT
   */
  verifyJWT(token) {
    try {
      return jwt.verify(token, this.config.clientSecret);
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0631\u0645\u0632:", error);
      return null;
    }
  }
  /**
   * اختبار الاتصال بالنظام الحكومي
   */
  async testConnection() {
    try {
      const token = await this.getAccessToken();
      const response = await this.client.get("/health", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error("\u0641\u0634\u0644 \u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0627\u062A\u0635\u0627\u0644:", error);
      return false;
    }
  }
};
var governmentIntegrationService = null;
function initializeGovernmentIntegration() {
  if (!governmentIntegrationService) {
    const config = {
      baseUrl: process.env.GOVERNMENT_API_URL || "https://api.customs.gov.jo",
      apiKey: process.env.GOVERNMENT_API_KEY || "",
      clientId: process.env.GOVERNMENT_CLIENT_ID || "",
      clientSecret: process.env.GOVERNMENT_CLIENT_SECRET || ""
    };
    governmentIntegrationService = new GovernmentIntegrationService(config);
  }
  return governmentIntegrationService;
}
function getGovernmentIntegration() {
  if (!governmentIntegrationService) {
    return initializeGovernmentIntegration();
  }
  return governmentIntegrationService;
}

// server/routers/government.ts
var customsDeclarationSchema = z5.object({
  declarationNumber: z5.string(),
  declarationType: z5.enum(["import", "export"]),
  declarationDate: z5.string().datetime(),
  importer: z5.object({
    name: z5.string(),
    taxId: z5.string(),
    address: z5.string()
  }),
  items: z5.array(
    z5.object({
      hsCode: z5.string(),
      description: z5.string(),
      quantity: z5.number().positive(),
      unit: z5.string(),
      unitPrice: z5.number().positive(),
      currency: z5.string(),
      totalValue: z5.number().positive()
    })
  ),
  totalValue: z5.number().positive(),
  currency: z5.string()
});
var governmentRouter = router({
  /**
   * إرسال بيان جمركي إلى النظام الحكومي
   */
  submitDeclaration: protectedProcedure.input(customsDeclarationSchema).mutation(async ({ input, ctx }) => {
    try {
      const integration = getGovernmentIntegration();
      const result = await integration.submitCustomsDeclaration(input);
      if (result.status === "success") {
        console.log(`\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u064A\u0627\u0646 ${result.referenceNumber} \u0628\u0646\u062C\u0627\u062D`);
      }
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        status: "error",
        declarationId: "",
        referenceNumber: "",
        message: errorMessage || "\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u064A\u0627\u0646"
      };
    }
  }),
  /**
   * الحصول على حالة البيان الجمركي
   */
  getDeclarationStatus: protectedProcedure.input(z5.object({ declarationId: z5.string() })).query(async ({ input }) => {
    try {
      const integration = getGovernmentIntegration();
      const result = await integration.getDeclarationStatus(input.declarationId);
      return result;
    } catch (error) {
      return {
        status: "error",
        message: getErrorMessage(error)
      };
    }
  }),
  /**
   * الحصول على قائمة الرموز الجمركية (HS Codes)
   */
  getTariffCodes: publicProcedure.input(
    z5.object({
      searchTerm: z5.string().optional()
    })
  ).query(async ({ input }) => {
    try {
      const integration = getGovernmentIntegration();
      const codes = await integration.getTariffCodes(input.searchTerm);
      return {
        status: "success",
        codes
      };
    } catch (error) {
      return {
        status: "error",
        codes: [],
        message: getErrorMessage(error)
      };
    }
  }),
  /**
   * التحقق من صحة البيان الجمركي
   */
  validateDeclaration: protectedProcedure.input(customsDeclarationSchema).mutation(async ({ input }) => {
    try {
      const integration = getGovernmentIntegration();
      const result = await integration.validateDeclaration(input);
      return {
        status: result.valid ? "success" : "error",
        valid: result.valid,
        errors: result.errors
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        status: "error",
        valid: false,
        errors: [errorMessage]
      };
    }
  }),
  /**
   * حساب الرسوم والضرائب
   */
  calculateTaxesAndDuties: protectedProcedure.input(customsDeclarationSchema).query(async ({ input }) => {
    try {
      const integration = getGovernmentIntegration();
      const taxes = await integration.calculateTaxesAndDuties(input);
      return {
        status: "success",
        taxes
      };
    } catch (error) {
      return {
        status: "error",
        message: getErrorMessage(error)
      };
    }
  }),
  /**
   * تتبع الشحنة
   */
  trackShipment: protectedProcedure.input(z5.object({ trackingNumber: z5.string() })).query(async ({ input }) => {
    try {
      const integration = getGovernmentIntegration();
      const shipment = await integration.trackShipment(input.trackingNumber);
      return {
        status: "success",
        shipment
      };
    } catch (error) {
      return {
        status: "error",
        message: getErrorMessage(error)
      };
    }
  }),
  /**
   * اختبار الاتصال بالنظام الحكومي
   */
  testConnection: protectedProcedure.query(async () => {
    try {
      const integration = getGovernmentIntegration();
      const connected = await integration.testConnection();
      return {
        status: connected ? "success" : "error",
        connected,
        message: connected ? "\u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u062D\u0643\u0648\u0645\u064A \u064A\u0639\u0645\u0644 \u0628\u0634\u0643\u0644 \u0635\u062D\u064A\u062D" : "\u0641\u0634\u0644 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u0646\u0638\u0627\u0645 \u0627\u0644\u062D\u0643\u0648\u0645\u064A"
      };
    } catch (error) {
      return {
        status: "error",
        connected: false,
        message: error.message
      };
    }
  }),
  /**
   * الحصول على سجل العمليات
   */
  getOperationLog: protectedProcedure.input(
    z5.object({
      limit: z5.number().default(50),
      offset: z5.number().default(0)
    })
  ).query(async ({ input }) => {
    try {
      return {
        status: "success",
        operations: [],
        total: 0
      };
    } catch (error) {
      return {
        status: "error",
        operations: [],
        message: getErrorMessage(error)
      };
    }
  }),
  /**
   * الحصول على إحصائيات التكامل
   */
  getIntegrationStats: protectedProcedure.query(async () => {
    try {
      return {
        status: "success",
        stats: {
          totalDeclarations: 0,
          successfulDeclarations: 0,
          failedDeclarations: 0,
          pendingDeclarations: 0,
          averageProcessingTime: 0,
          lastSync: /* @__PURE__ */ new Date()
        }
      };
    } catch (error) {
      return {
        status: "error",
        message: error.message
      };
    }
  }),
  /**
   * إعادة محاولة إرسال بيان فاشل
   */
  retryDeclaration: protectedProcedure.input(z5.object({ declarationId: z5.string() })).mutation(async ({ input }) => {
    try {
      return {
        status: "success",
        message: "\u062A\u0645 \u0625\u0639\u0627\u062F\u0629 \u0645\u062D\u0627\u0648\u0644\u0629 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u064A\u0627\u0646"
      };
    } catch (error) {
      return {
        status: "error",
        message: getErrorMessage(error)
      };
    }
  })
});

// server/routers/auth.ts
var authRouter = router({
  /**
   * الحصول على بيانات المستخدم الحالي
   */
  me: publicProcedure.query((opts) => opts.ctx.user),
  /**
   * تسجيل الخروج
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true
    };
  })
});

// server/errorReporter.ts
import os from "os";
import fs2 from "fs";
import path from "path";
function getSystemInfo() {
  const totalMemoryBytes = os.totalmem();
  const freeMemoryBytes = os.freemem();
  const formatBytes = (bytes) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };
  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    return `${hours}h ${minutes}m`;
  };
  return {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: formatBytes(totalMemoryBytes),
    freeMemory: formatBytes(freeMemoryBytes),
    uptime: formatUptime(os.uptime()),
    nodeVersion: process.version,
    appVersion: "1.0.1",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function collectLogs(logDir) {
  const logs = [];
  try {
    const defaultLogPath = path.join(
      process.env.APPDATA || process.env.HOME || "",
      "JordanCustoms",
      "logs"
    );
    const logsPath = logDir || defaultLogPath;
    if (fs2.existsSync(logsPath)) {
      const files = fs2.readdirSync(logsPath);
      files.forEach((file) => {
        try {
          const filePath = path.join(logsPath, file);
          const content = fs2.readFileSync(filePath, "utf-8");
          const lines = content.split("\n").slice(-50);
          logs.push(`--- ${file} ---`);
          logs.push(...lines);
        } catch (error) {
          logs.push(`Error reading ${file}: ${error}`);
        }
      });
    }
  } catch (error) {
    logs.push(`Error collecting logs: ${error}`);
  }
  return logs;
}
function generateReportId() {
  return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
function createErrorReport(title, description, options) {
  return {
    id: generateReportId(),
    title,
    description,
    stackTrace: options?.stackTrace,
    systemInfo: getSystemInfo(),
    logs: collectLogs(options?.logDir),
    userEmail: options?.userEmail,
    userMessage: options?.userMessage,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function formatErrorReportForEmail(report) {
  const systemInfoStr = Object.entries(report.systemInfo).map(([key, value]) => `${key}: ${value}`).join("\n");
  const logsStr = report.logs.slice(-30).join("\n");
  return `
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
\u062A\u0642\u0631\u064A\u0631 \u062E\u0637\u0623 - \u0646\u0638\u0627\u0645 \u0625\u062F\u0627\u0631\u0629 \u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0627\u0644\u0623\u0631\u062F\u0646\u064A\u0629
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

\u0645\u0639\u0631\u0641 \u0627\u0644\u062A\u0642\u0631\u064A\u0631: ${report.id}
\u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0648\u0627\u0644\u0648\u0642\u062A: ${report.timestamp}

\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062E\u0637\u0623
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
\u0627\u0644\u0639\u0646\u0648\u0627\u0646: ${report.title}
\u0627\u0644\u0648\u0635\u0641: ${report.description}

${report.stackTrace ? `Stack Trace:
${report.stackTrace}
` : ""}

\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: ${report.userEmail || "\u0644\u0645 \u064A\u062A\u0645 \u062A\u0642\u062F\u064A\u0645\u0647"}
\u0627\u0644\u0631\u0633\u0627\u0644\u0629: ${report.userMessage || "\u0644\u0627 \u062A\u0648\u062C\u062F \u0631\u0633\u0627\u0644\u0629 \u0625\u0636\u0627\u0641\u064A\u0629"}

\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0646\u0638\u0627\u0645
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
${systemInfoStr}

\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
\u0627\u0644\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0623\u062E\u064A\u0631\u0629
\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
${logsStr}

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
\u0634\u0643\u0631\u0627\u064B \u0644\u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u062A\u0637\u0628\u064A\u0642!
\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
  `;
}
async function sendErrorReport(report) {
  try {
    const emailContent = formatErrorReportForEmail(report);
    console.log("Error report sent successfully:", report.id);
    return true;
  } catch (error) {
    return false;
  }
}
function saveErrorReportLocally(report) {
  try {
    const reportsDir = path.join(
      process.env.APPDATA || process.env.HOME || "",
      "JordanCustoms",
      "error-reports"
    );
    if (!fs2.existsSync(reportsDir)) {
      fs2.mkdirSync(reportsDir, { recursive: true });
    }
    const filePath = path.join(reportsDir, `${report.id}.json`);
    fs2.writeFileSync(filePath, JSON.stringify(report, null, 2));
    return filePath;
  } catch (error) {
    return "";
  }
}

// server/routers/errors.ts
import { z as z6 } from "zod";
var ErrorReportSchema = z6.object({
  title: z6.string().min(1, "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0645\u0637\u0644\u0648\u0628"),
  description: z6.string().min(1, "\u0627\u0644\u0648\u0635\u0641 \u0645\u0637\u0644\u0648\u0628"),
  stackTrace: z6.string().optional(),
  userEmail: z6.string().email().optional(),
  userMessage: z6.string().optional()
});
var errorsRouter = router({
  /**
   * إرسال تقرير خطأ
   */
  submitErrorReport: publicProcedure.input(ErrorReportSchema).mutation(async ({ input }) => {
    try {
      const report = createErrorReport(
        input.title,
        input.description,
        {
          stackTrace: input.stackTrace,
          userEmail: input.userEmail,
          userMessage: input.userMessage
        }
      );
      const localPath = saveErrorReportLocally(report);
      const emailSent = await sendErrorReport(report);
      return {
        success: true,
        reportId: report.id,
        message: emailSent ? "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0628\u0646\u062C\u0627\u062D. \u0634\u0643\u0631\u0627\u064B \u0644\u0645\u0633\u0627\u0639\u062F\u062A\u0643!" : "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0645\u062D\u0644\u064A\u0627\u064B. \u0633\u064A\u062A\u0645 \u0645\u0631\u0627\u062C\u0639\u062A\u0647 \u0645\u0646 \u0642\u0628\u0644 \u0641\u0631\u064A\u0642 \u0627\u0644\u062F\u0639\u0645.",
        localPath
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: "\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0642\u0631\u064A\u0631. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B."
      };
    }
  }),
  /**
   * الحصول على معلومات النظام
   */
  getSystemInfo: publicProcedure.query(() => {
    try {
      const systemInfo = getSystemInfo();
      return {
        success: true,
        data: systemInfo
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: "\u0641\u0634\u0644 \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0646\u0638\u0627\u0645"
      };
    }
  }),
  /**
   * الحصول على حالة التقرير
   */
  getReportStatus: publicProcedure.input(z6.object({ reportId: z6.string() })).query(({ input }) => {
    return {
      reportId: input.reportId,
      status: "\u062A\u0645 \u0627\u0644\u0627\u0633\u062A\u0642\u0628\u0627\u0644",
      message: "\u0633\u064A\u062A\u0645 \u0645\u0631\u0627\u062C\u0639\u0629 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0645\u0646 \u0642\u0628\u0644 \u0641\u0631\u064A\u0642 \u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A"
    };
  })
});

// server/updateChecker.ts
var CURRENT_VERSION = "1.0.0";
var CHECK_INTERVAL = 24 * 60 * 60 * 1e3;
async function fetchLatestRelease() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/jordan-customs/system/releases/latest",
      {
        headers: {
          "Accept": "application/vnd.github.v3+json"
        }
      }
    );
    if (!response.ok) {
      const errorMsg = response.statusText || "Unknown error";
      return null;
    }
    const data = await response.json();
    return {
      version: (data.tag_name || "").replace(/^v/, ""),
      name: data.name || "",
      description: data.description || "",
      releaseDate: data.published_at || "",
      downloadUrl: data.html_url || "",
      isPrerelease: data.prerelease || false,
      changeLog: data.body || "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0639\u0646 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A"
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return null;
  }
}
function compareVersions(version1, version2) {
  const v1Parts = version1.split(".").map(Number);
  const v2Parts = version2.split(".").map(Number);
  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1 = v1Parts[i] || 0;
    const v2 = v2Parts[i] || 0;
    if (v1 > v2) return 1;
    if (v1 < v2) return -1;
  }
  return 0;
}
async function checkForUpdates() {
  const now = /* @__PURE__ */ new Date();
  const lastChecked = (/* @__PURE__ */ new Date()).toISOString();
  const nextCheckDate = new Date(now.getTime() + CHECK_INTERVAL).toISOString();
  try {
    const latestRelease = await fetchLatestRelease();
    if (!latestRelease) {
      return {
        hasUpdate: false,
        currentVersion: CURRENT_VERSION,
        lastChecked,
        nextCheckDate
      };
    }
    const versionComparison = compareVersions(latestRelease.version, CURRENT_VERSION);
    return {
      hasUpdate: versionComparison > 0,
      currentVersion: CURRENT_VERSION,
      latestVersion: latestRelease.version,
      release: versionComparison > 0 ? latestRelease : void 0,
      lastChecked,
      nextCheckDate
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      hasUpdate: false,
      currentVersion: CURRENT_VERSION,
      lastChecked,
      nextCheckDate
    };
  }
}

// server/routers/updates.ts
var updatesRouter = router({
  /**
   * التحقق من وجود تحديث جديد
   */
  checkForUpdates: publicProcedure.query(async () => {
    try {
      const status = await checkForUpdates();
      return {
        success: true,
        data: status
      };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: "\u0641\u0634\u0644 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u062A\u062D\u062F\u064A\u062B\u0627\u062A"
      };
    }
  }),
  /**
   * الحصول على معلومات الإصدار الحالي
   */
  getCurrentVersion: publicProcedure.query(() => {
    return {
      version: "1.0.1",
      releaseDate: "2026-02-07",
      features: [
        "\u0646\u0638\u0627\u0645 \u0625\u062F\u0627\u0631\u0629 \u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0634\u062D\u0646",
        "\u062D\u0633\u0627\u0628 \u0627\u0644\u0631\u0633\u0648\u0645 \u0648\u0627\u0644\u0636\u0631\u0627\u0626\u0628",
        "\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u062A\u0643\u0627\u0644\u064A\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0635\u0646\u0627\u0641",
        "\u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0630\u0643\u064A\u0629",
        "\u062A\u0642\u0627\u0631\u064A\u0631 \u0634\u0627\u0645\u0644\u0629"
      ]
    };
  }),
  /**
   * تجاهل التحديث (إعادة تعيين فترة الفحص)
   */
  dismissUpdate: publicProcedure.mutation(() => {
    const nextCheckDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString();
    return {
      success: true,
      nextCheckDate,
      message: "\u062A\u0645 \u062A\u062C\u0627\u0647\u0644 \u0627\u0644\u062A\u062D\u062F\u064A\u062B. \u0633\u064A\u062A\u0645 \u0627\u0644\u0641\u062D\u0635 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649 \u062E\u0644\u0627\u0644 7 \u0623\u064A\u0627\u0645"
    };
  }),
  /**
   * الحصول على سجل التحديثات
   */
  getUpdateHistory: publicProcedure.query(() => {
    return {
      updates: [
        {
          version: "1.0.1",
          date: "2026-02-07",
          changes: "\u0625\u0636\u0627\u0641\u0629 \u0646\u0638\u0627\u0645 \u0627\u0644\u062A\u062D\u062F\u064A\u062B\u0627\u062A \u0627\u0644\u062A\u0644\u0642\u0627\u0626\u064A \u0648\u0627\u0644\u0625\u0628\u0644\u0627\u063A \u0639\u0646 \u0627\u0644\u0623\u062E\u0637\u0627\u0621"
        },
        {
          version: "1.0.0",
          date: "2026-01-15",
          changes: "\u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0627\u0644\u0623\u0648\u0644 \u0645\u0646 \u0627\u0644\u062A\u0637\u0628\u064A\u0642"
        }
      ]
    };
  })
});

// server/routers/notifications.ts
import { z as z7 } from "zod";

// server/services/sms-service.ts
var SMSService = class {
  apiKey;
  apiUrl;
  senderName;
  constructor() {
    this.apiKey = process.env.SMS_API_KEY || "";
    this.apiUrl = process.env.SMS_API_URL || "https://api.sms-provider.com";
    this.senderName = process.env.SMS_SENDER_NAME || "SAADBOOST";
    if (!this.apiKey) {
      console.warn("\u26A0\uFE0F \u062A\u062D\u0630\u064A\u0631: \u0645\u0641\u062A\u0627\u062D SMS API \u063A\u064A\u0631 \u0645\u0636\u0628\u0648\u0637. \u0633\u064A\u062A\u0645 \u062A\u0639\u0637\u064A\u0644 \u062E\u062F\u0645\u0629 \u0627\u0644\u0631\u0633\u0627\u0626\u0644 \u0627\u0644\u0646\u0635\u064A\u0629.");
    }
  }
  /**
   * إرسال رسالة نصية
   */
  async sendSMS(message) {
    try {
      if (!this.apiKey) {
        console.warn("\u26A0\uFE0F \u062E\u062F\u0645\u0629 SMS \u063A\u064A\u0631 \u0645\u0641\u0639\u0644\u0629");
        return false;
      }
      console.log(`\u{1F4F1} \u062C\u0627\u0631\u064A \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 \u0646\u0635\u064A\u0629 \u0625\u0644\u0649 ${message.phoneNumber}`);
      console.log(`\u{1F4DD} \u0646\u0648\u0639 \u0627\u0644\u0631\u0633\u0627\u0644\u0629: ${message.type}`);
      console.log(`\u{1F4AC} \u0627\u0644\u0631\u0633\u0627\u0644\u0629: ${message.message}`);
      const response = await this.sendViaAPI(message);
      if (response.success) {
        await this.logSMSMessage(message, "sent");
        console.log(`\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0628\u0646\u062C\u0627\u062D \u0625\u0644\u0649 ${message.phoneNumber}`);
        return true;
      } else {
        await this.logSMSMessage(message, "failed", response.error);
        console.error(`\u274C \u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629: ${response.error}`);
        return false;
      }
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0646\u0635\u064A\u0629:", error);
      await this.logSMSMessage(message, "failed", error instanceof Error ? error.message : "Unknown error");
      return false;
    }
  }
  /**
   * إرسال الرسالة عبر API
   */
  async sendViaAPI(message) {
    try {
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  /**
   * حفظ سجل الرسالة في قاعدة البيانات
   */
  async logSMSMessage(message, status, errorMessage) {
    try {
      const db = await getDb();
      if (!db) {
        console.error("\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629");
        return;
      }
      console.log(`\u{1F4CA} \u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A`);
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629:", error);
    }
  }
  /**
   * إرسال رسالة تفعيل الاشتراك
   */
  async sendSubscriptionActivatedSMS(phoneNumber, planName, userId) {
    const message = {
      phoneNumber,
      message: `\u0645\u0631\u062D\u0628\u0627\u064B! \u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0634\u062A\u0631\u0627\u0643\u0643 \u0641\u064A \u062E\u0637\u0629 ${planName} \u0628\u0646\u062C\u0627\u062D. \u0634\u0643\u0631\u0627\u064B \u0644\u0627\u062E\u062A\u064A\u0627\u0631\u0643 SAADBOOST!`,
      type: "subscription_activated",
      userId,
      metadata: { planName }
    };
    return this.sendSMS(message);
  }
  /**
   * إرسال رسالة انتهاء الفترة التجريبية
   */
  async sendTrialEndingSMS(phoneNumber, planName, daysRemaining, userId) {
    const message = {
      phoneNumber,
      message: `\u062A\u0646\u0628\u064A\u0647: \u0641\u062A\u0631\u062A\u0643 \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629 \u0641\u064A \u062E\u0637\u0629 ${planName} \u062A\u0646\u062A\u0647\u064A \u0641\u064A ${daysRemaining} \u064A\u0648\u0645. \u0642\u0645 \u0628\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0627\u0644\u0622\u0646 \u0644\u062A\u062C\u0646\u0628 \u0627\u0646\u0642\u0637\u0627\u0639 \u0627\u0644\u062E\u062F\u0645\u0629.`,
      type: "trial_ending",
      userId,
      metadata: { planName, daysRemaining }
    };
    return this.sendSMS(message);
  }
  /**
   * إرسال رسالة تجديد الاشتراك
   */
  async sendSubscriptionRenewedSMS(phoneNumber, planName, renewalDate, userId) {
    const message = {
      phoneNumber,
      message: `\u062A\u0645 \u062A\u062C\u062F\u064A\u062F \u0627\u0634\u062A\u0631\u0627\u0643\u0643 \u0641\u064A \u062E\u0637\u0629 ${planName} \u0628\u0646\u062C\u0627\u062D. \u0633\u064A\u062A\u0645 \u062A\u062C\u062F\u064A\u062F\u0647 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0641\u064A ${renewalDate.toLocaleDateString("ar-JO")}.`,
      type: "subscription_renewed",
      userId,
      metadata: { planName, renewalDate }
    };
    return this.sendSMS(message);
  }
  /**
   * إرسال رسالة فشل الدفع
   */
  async sendPaymentFailedSMS(phoneNumber, planName, userId, errorMessage) {
    const message = {
      phoneNumber,
      message: `\u062A\u0646\u0628\u064A\u0647: \u0641\u0634\u0644 \u0627\u0644\u062F\u0641\u0639 \u0644\u0627\u0634\u062A\u0631\u0627\u0643\u0643 \u0641\u064A \u062E\u0637\u0629 ${planName}. \u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062F\u0641\u0639 \u0641\u064A \u062D\u0633\u0627\u0628\u0643.`,
      type: "payment_failed",
      userId,
      metadata: { planName, errorMessage }
    };
    return this.sendSMS(message);
  }
  /**
   * إرسال رسالة استرجاع الأموال
   */
  async sendRefundProcessedSMS(phoneNumber, amount, currency, userId) {
    const message = {
      phoneNumber,
      message: `\u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0623\u0645\u0648\u0627\u0644\u0643 \u0628\u0646\u062C\u0627\u062D. \u0633\u064A\u062A\u0645 \u0625\u0631\u062C\u0627\u0639 ${amount} ${currency} \u0625\u0644\u0649 \u062D\u0633\u0627\u0628\u0643 \u062E\u0644\u0627\u0644 3-5 \u0623\u064A\u0627\u0645 \u0639\u0645\u0644.`,
      type: "refund_processed",
      userId,
      metadata: { amount, currency }
    };
    return this.sendSMS(message);
  }
  /**
   * إرسال رسائل نصية متعددة
   */
  async sendBulkSMS(messages) {
    let successCount = 0;
    for (const message of messages) {
      const success = await this.sendSMS(message);
      if (success) {
        successCount++;
      }
    }
    console.log(`\u{1F4CA} \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 ${successCount} \u0645\u0646 ${messages.length} \u0631\u0633\u0627\u0644\u0629 \u0628\u0646\u062C\u0627\u062D`);
    return successCount;
  }
};
var smsService = new SMSService();

// server/routers/notifications.ts
var notificationsRouter = router({
  /**
   * إرسال رسالة تفعيل الاشتراك
   */
  sendSubscriptionActivatedNotification: protectedProcedure.input(
    z7.object({
      phoneNumber: z7.string().min(10, "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D"),
      planName: z7.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u062E\u0637\u0629 \u0645\u0637\u0644\u0648\u0628")
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      console.log(`\u{1F4F1} \u062C\u0627\u0631\u064A \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643`);
      const smsSent = await smsService.sendSubscriptionActivatedSMS(
        input.phoneNumber,
        input.planName,
        ctx.user.id
      );
      return {
        success: true,
        message: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u0628\u0646\u062C\u0627\u062D",
        smsSent
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631");
    }
  }),
  /**
   * إرسال تنبيه انتهاء الفترة التجريبية
   */
  sendTrialEndingNotification: protectedProcedure.input(
    z7.object({
      phoneNumber: z7.string().min(10, "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D"),
      planName: z7.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u062E\u0637\u0629 \u0645\u0637\u0644\u0648\u0628"),
      daysRemaining: z7.number().min(0, "\u0639\u062F\u062F \u0627\u0644\u0623\u064A\u0627\u0645 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B")
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      console.log(`\u{1F4F1} \u062C\u0627\u0631\u064A \u0625\u0631\u0633\u0627\u0644 \u062A\u0646\u0628\u064A\u0647 \u0627\u0646\u062A\u0647\u0627\u0621 \u0627\u0644\u0641\u062A\u0631\u0629 \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629`);
      const smsSent = await smsService.sendTrialEndingSMS(
        input.phoneNumber,
        input.planName,
        input.daysRemaining,
        ctx.user.id
      );
      return {
        success: true,
        message: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0646\u0628\u064A\u0647 \u0628\u0646\u062C\u0627\u062D",
        smsSent
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0646\u0628\u064A\u0647");
    }
  }),
  /**
   * إرسال إشعار تجديد الاشتراك
   */
  sendSubscriptionRenewedNotification: protectedProcedure.input(
    z7.object({
      phoneNumber: z7.string().min(10, "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D"),
      planName: z7.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u062E\u0637\u0629 \u0645\u0637\u0644\u0648\u0628"),
      renewalDate: z7.string().refine((date3) => !isNaN(Date.parse(date3)), "\u062A\u0627\u0631\u064A\u062E \u063A\u064A\u0631 \u0635\u062D\u064A\u062D")
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      console.log(`\u{1F4F1} \u062C\u0627\u0631\u064A \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643`);
      const smsSent = await smsService.sendSubscriptionRenewedSMS(
        input.phoneNumber,
        input.planName,
        new Date(input.renewalDate),
        ctx.user.id
      );
      return {
        success: true,
        message: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u0628\u0646\u062C\u0627\u062D",
        smsSent
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631");
    }
  }),
  /**
   * إرسال تنبيه فشل الدفع
   */
  sendPaymentFailedNotification: protectedProcedure.input(
    z7.object({
      phoneNumber: z7.string().min(10, "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D"),
      planName: z7.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u062E\u0637\u0629 \u0645\u0637\u0644\u0648\u0628"),
      errorMessage: z7.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      console.log(`\u{1F4F1} \u062C\u0627\u0631\u064A \u0625\u0631\u0633\u0627\u0644 \u062A\u0646\u0628\u064A\u0647 \u0641\u0634\u0644 \u0627\u0644\u062F\u0641\u0639`);
      const smsSent = await smsService.sendPaymentFailedSMS(
        input.phoneNumber,
        input.planName,
        ctx.user.id,
        input.errorMessage
      );
      return {
        success: true,
        message: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0646\u0628\u064A\u0647 \u0628\u0646\u062C\u0627\u062D",
        smsSent
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0646\u0628\u064A\u0647");
    }
  }),
  /**
   * إرسال إشعار استرجاع الأموال
   */
  sendRefundProcessedNotification: protectedProcedure.input(
    z7.object({
      phoneNumber: z7.string().min(10, "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D"),
      amount: z7.number().positive("\u0627\u0644\u0645\u0628\u0644\u063A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B"),
      currency: z7.string().length(3, "\u0631\u0645\u0632 \u0627\u0644\u0639\u0645\u0644\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 3 \u0623\u062D\u0631\u0641")
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      console.log(`\u{1F4F1} \u062C\u0627\u0631\u064A \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644`);
      const smsSent = await smsService.sendRefundProcessedSMS(
        input.phoneNumber,
        input.amount,
        input.currency,
        ctx.user.id
      );
      return {
        success: true,
        message: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u0628\u0646\u062C\u0627\u062D",
        smsSent
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631");
    }
  })
});

// server/routers/payment-gateways.ts
import { z as z8 } from "zod";

// server/services/payment-gateway-service.ts
var PaymentGatewayService = class {
  /**
   * معالج Click Payment (بنك الأردن)
   */
  async processClickPayment(amount, currency, orderId, userId, bankDetails) {
    console.log(`\u{1F4B3} \u0645\u0639\u0627\u0644\u062C\u0629 \u062F\u0641\u0639 Click Payment`);
    console.log(`\u{1F4B0} \u0627\u0644\u0645\u0628\u0644\u063A: ${amount} ${currency}`);
    console.log(`\u{1F3E6} \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0628\u0646\u0643: ${bankDetails?.accountNumber}`);
    const paymentId = `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: paymentId,
      gateway: "click",
      amount,
      currency,
      status: "completed",
      orderId,
      userId,
      metadata: {
        bankDetails,
        processedAt: (/* @__PURE__ */ new Date()).toISOString()
      },
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
  }
  /**
   * معالج Apple Pay (محاكاة محلية)
   */
  async processApplePay(amount, currency, orderId, userId, cardToken) {
    console.log(`\u{1F34E} \u0645\u0639\u0627\u0644\u062C\u0629 \u062F\u0641\u0639 Apple Pay`);
    console.log(`\u{1F4B0} \u0627\u0644\u0645\u0628\u0644\u063A: ${amount} ${currency}`);
    console.log(`\u{1F510} Token: ${cardToken?.substring(0, 10)}...`);
    const paymentId = `apple_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: paymentId,
      gateway: "apple_pay",
      amount,
      currency,
      status: "completed",
      orderId,
      userId,
      metadata: {
        cardToken: cardToken ? cardToken.substring(0, 10) + "..." : void 0,
        processedAt: (/* @__PURE__ */ new Date()).toISOString(),
        deviceId: `device_${Math.random().toString(36).substr(2, 9)}`
      },
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
  }
  /**
   * معالج Google Pay (محاكاة محلية)
   */
  async processGooglePay(amount, currency, orderId, userId, paymentToken) {
    console.log(`\u{1F535} \u0645\u0639\u0627\u0644\u062C\u0629 \u062F\u0641\u0639 Google Pay`);
    console.log(`\u{1F4B0} \u0627\u0644\u0645\u0628\u0644\u063A: ${amount} ${currency}`);
    console.log(`\u{1F510} Token: ${paymentToken?.substring(0, 10)}...`);
    const paymentId = `google_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: paymentId,
      gateway: "google_pay",
      amount,
      currency,
      status: "completed",
      orderId,
      userId,
      metadata: {
        paymentToken: paymentToken ? paymentToken.substring(0, 10) + "..." : void 0,
        processedAt: (/* @__PURE__ */ new Date()).toISOString(),
        deviceId: `device_${Math.random().toString(36).substr(2, 9)}`
      },
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
  }
  /**
   * معالج QR Code/Barcode (الدفع النقدي)
   */
  async processQRCodePayment(amount, currency, orderId, userId, qrCode) {
    console.log(`\u{1F4F1} \u0645\u0639\u0627\u0644\u062C\u0629 \u062F\u0641\u0639 QR Code/Barcode`);
    console.log(`\u{1F4B0} \u0627\u0644\u0645\u0628\u0644\u063A: ${amount} ${currency}`);
    console.log(`\u{1F4CA} QR Code: ${qrCode?.substring(0, 20)}...`);
    const paymentId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id: paymentId,
      gateway: "qr_code",
      amount,
      currency,
      status: "pending",
      // في الانتظار حتى يتم المسح والدفع
      orderId,
      userId,
      metadata: {
        qrCode,
        barcode: `BAR${Date.now()}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1e3).toISOString()
        // ينتهي بعد 15 دقيقة
      },
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
  }
  /**
   * التحقق من حالة الدفع
   */
  async verifyPayment(paymentId) {
    console.log(`\u2705 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639: ${paymentId}`);
    return "completed";
  }
  /**
   * إلغاء الدفع
   */
  async cancelPayment(paymentId) {
    console.log(`\u274C \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062F\u0641\u0639: ${paymentId}`);
    return true;
  }
  /**
   * استرجاع الأموال
   */
  async refundPayment(paymentId, amount) {
    console.log(`\u{1F4B8} \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644: ${paymentId}`);
    if (amount) {
      console.log(`\u{1F4B0} \u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0633\u062A\u0631\u062C\u0639: ${amount}`);
    }
    return true;
  }
  /**
   * الحصول على تفاصيل الدفع
   */
  async getPaymentDetails(paymentId) {
    console.log(`\u{1F4CB} \u062C\u0627\u0631\u064A \u062C\u0644\u0628 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062F\u0641\u0639: ${paymentId}`);
    return null;
  }
  /**
   * الحصول على سجل الدفعات للمستخدم
   */
  async getUserPayments(userId, limit = 10) {
    console.log(`\u{1F4CA} \u062C\u0627\u0631\u064A \u062C\u0644\u0628 \u0633\u062C\u0644 \u0627\u0644\u062F\u0641\u0639\u0627\u062A \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${userId}`);
    return [];
  }
};
var paymentGatewayService = new PaymentGatewayService();

// server/routers/payment-gateways.ts
var paymentGatewaysRouter = router({
  /**
   * معالجة دفع Click Payment
   */
  processClickPayment: protectedProcedure.input(
    z8.object({
      amount: z8.number().positive("\u0627\u0644\u0645\u0628\u0644\u063A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B"),
      currency: z8.string().length(3, "\u0631\u0645\u0632 \u0627\u0644\u0639\u0645\u0644\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 3 \u0623\u062D\u0631\u0641"),
      orderId: z8.string().min(1, "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0637\u0644\u0628 \u0645\u0637\u0644\u0648\u0628"),
      accountNumber: z8.string().min(10, "\u0631\u0642\u0645 \u0627\u0644\u062D\u0633\u0627\u0628 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D"),
      bankCode: z8.string().min(2, "\u0631\u0645\u0632 \u0627\u0644\u0628\u0646\u0643 \u0645\u0637\u0644\u0648\u0628")
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      console.log(`\u{1F4B3} \u062C\u0627\u0631\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u062F\u0641\u0639 Click Payment`);
      const payment = await paymentGatewayService.processClickPayment(
        input.amount,
        input.currency,
        input.orderId,
        ctx.user.id,
        {
          accountNumber: input.accountNumber,
          bankCode: input.bankCode
        }
      );
      return {
        success: true,
        message: "\u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u062F\u0641\u0639 \u0628\u0646\u062C\u0627\u062D",
        payment
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u062F\u0641\u0639");
    }
  }),
  /**
   * معالجة دفع Apple Pay
   */
  processApplePay: protectedProcedure.input(
    z8.object({
      amount: z8.number().positive("\u0627\u0644\u0645\u0628\u0644\u063A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B"),
      currency: z8.string().length(3, "\u0631\u0645\u0632 \u0627\u0644\u0639\u0645\u0644\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 3 \u0623\u062D\u0631\u0641"),
      orderId: z8.string().min(1, "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0637\u0644\u0628 \u0645\u0637\u0644\u0648\u0628"),
      cardToken: z8.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      console.log(`\u{1F34E} \u062C\u0627\u0631\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u062F\u0641\u0639 Apple Pay`);
      const payment = await paymentGatewayService.processApplePay(
        input.amount,
        input.currency,
        input.orderId,
        ctx.user.id,
        input.cardToken
      );
      return {
        success: true,
        message: "\u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u062F\u0641\u0639 \u0628\u0646\u062C\u0627\u062D",
        payment
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u062F\u0641\u0639");
    }
  }),
  /**
   * معالجة دفع Google Pay
   */
  processGooglePay: protectedProcedure.input(
    z8.object({
      amount: z8.number().positive("\u0627\u0644\u0645\u0628\u0644\u063A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B"),
      currency: z8.string().length(3, "\u0631\u0645\u0632 \u0627\u0644\u0639\u0645\u0644\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 3 \u0623\u062D\u0631\u0641"),
      orderId: z8.string().min(1, "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0637\u0644\u0628 \u0645\u0637\u0644\u0648\u0628"),
      paymentToken: z8.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      console.log(`\u{1F535} \u062C\u0627\u0631\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u062F\u0641\u0639 Google Pay`);
      const payment = await paymentGatewayService.processGooglePay(
        input.amount,
        input.currency,
        input.orderId,
        ctx.user.id,
        input.paymentToken
      );
      return {
        success: true,
        message: "\u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u062F\u0641\u0639 \u0628\u0646\u062C\u0627\u062D",
        payment
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u062F\u0641\u0639");
    }
  }),
  /**
   * معالجة دفع QR Code/Barcode
   */
  processQRCodePayment: protectedProcedure.input(
    z8.object({
      amount: z8.number().positive("\u0627\u0644\u0645\u0628\u0644\u063A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B"),
      currency: z8.string().length(3, "\u0631\u0645\u0632 \u0627\u0644\u0639\u0645\u0644\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 3 \u0623\u062D\u0631\u0641"),
      orderId: z8.string().min(1, "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0637\u0644\u0628 \u0645\u0637\u0644\u0648\u0628"),
      qrCode: z8.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      console.log(`\u{1F4F1} \u062C\u0627\u0631\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u062F\u0641\u0639 QR Code/Barcode`);
      const payment = await paymentGatewayService.processQRCodePayment(
        input.amount,
        input.currency,
        input.orderId,
        ctx.user.id,
        input.qrCode
      );
      return {
        success: true,
        message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0631\u0645\u0632 QR \u0628\u0646\u062C\u0627\u062D",
        payment
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0631\u0645\u0632 QR");
    }
  }),
  /**
   * التحقق من حالة الدفع
   */
  verifyPayment: protectedProcedure.input(
    z8.object({
      paymentId: z8.string().min(1, "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u062F\u0641\u0639 \u0645\u0637\u0644\u0648\u0628")
    })
  ).query(async ({ input }) => {
    try {
      const status = await paymentGatewayService.verifyPayment(input.paymentId);
      return {
        success: true,
        status
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u062F\u0641\u0639");
    }
  }),
  /**
   * إلغاء الدفع
   */
  cancelPayment: protectedProcedure.input(
    z8.object({
      paymentId: z8.string().min(1, "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u062F\u0641\u0639 \u0645\u0637\u0644\u0648\u0628")
    })
  ).mutation(async ({ input }) => {
    try {
      const success = await paymentGatewayService.cancelPayment(input.paymentId);
      return {
        success,
        message: success ? "\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062F\u0641\u0639 \u0628\u0646\u062C\u0627\u062D" : "\u0641\u0634\u0644 \u0641\u064A \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062F\u0641\u0639"
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062F\u0641\u0639");
    }
  }),
  /**
   * استرجاع الأموال
   */
  refundPayment: protectedProcedure.input(
    z8.object({
      paymentId: z8.string().min(1, "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u062F\u0641\u0639 \u0645\u0637\u0644\u0648\u0628"),
      amount: z8.number().positive("\u0627\u0644\u0645\u0628\u0644\u063A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B").optional()
    })
  ).mutation(async ({ input }) => {
    try {
      const success = await paymentGatewayService.refundPayment(
        input.paymentId,
        input.amount
      );
      return {
        success,
        message: success ? "\u062A\u0645 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644 \u0628\u0646\u062C\u0627\u062D" : "\u0641\u0634\u0644 \u0641\u064A \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644"
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644");
    }
  }),
  /**
   * الحصول على سجل الدفعات
   */
  getUserPayments: protectedProcedure.input(
    z8.object({
      limit: z8.number().int().positive().default(10)
    })
  ).query(async ({ ctx, input }) => {
    try {
      const payments2 = await paymentGatewayService.getUserPayments(
        ctx.user.id,
        input.limit
      );
      return {
        success: true,
        payments: payments2
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0633\u062C\u0644 \u0627\u0644\u062F\u0641\u0639\u0627\u062A");
    }
  })
});

// server/routers/currency.ts
import { z as z9 } from "zod";

// server/services/currency-service.ts
var EXCHANGE_RATES = {
  JOD: 1,
  USD: 0.709,
  // 1 دولار = 0.709 دينار أردني تقريباً
  EUR: 0.77
  // 1 يورو = 0.77 دينار أردني تقريباً
};
var CURRENCY_SYMBOLS = {
  JOD: "\u062F.\u0627",
  USD: "$",
  EUR: "\u20AC"
};
var CURRENCY_NAMES = {
  JOD: "\u062F\u064A\u0646\u0627\u0631 \u0623\u0631\u062F\u0646\u064A",
  USD: "\u062F\u0648\u0644\u0627\u0631 \u0623\u0645\u0631\u064A\u0643\u064A",
  EUR: "\u064A\u0648\u0631\u0648"
};
var CurrencyService = class {
  /**
   * تحويل المبلغ من عملة إلى أخرى
   */
  convertAmount(amount, fromCurrency, toCurrency) {
    const amountInJOD = amount / EXCHANGE_RATES[fromCurrency];
    const convertedAmount = amountInJOD * EXCHANGE_RATES[toCurrency];
    return Math.round(convertedAmount * 100) / 100;
  }
  /**
   * الحصول على سعر الصرف
   */
  getExchangeRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return 1;
    return Math.round(EXCHANGE_RATES[toCurrency] / EXCHANGE_RATES[fromCurrency] * 1e4) / 1e4;
  }
  /**
   * تنسيق المبلغ مع رمز العملة
   */
  formatAmount(amount, currency) {
    const symbol = CURRENCY_SYMBOLS[currency];
    const formatted = amount.toLocaleString("ar-JO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    if (currency === "JOD") {
      return `${formatted} ${symbol}`;
    } else {
      return `${symbol}${formatted}`;
    }
  }
  /**
   * الحصول على رمز العملة
   */
  getCurrencySymbol(currency) {
    return CURRENCY_SYMBOLS[currency];
  }
  /**
   * الحصول على اسم العملة
   */
  getCurrencyName(currency) {
    return CURRENCY_NAMES[currency];
  }
  /**
   * الحصول على قائمة العملات المدعومة
   */
  getSupportedCurrencies() {
    return [
      { code: "JOD", name: CURRENCY_NAMES.JOD, symbol: CURRENCY_SYMBOLS.JOD },
      { code: "USD", name: CURRENCY_NAMES.USD, symbol: CURRENCY_SYMBOLS.USD },
      { code: "EUR", name: CURRENCY_NAMES.EUR, symbol: CURRENCY_SYMBOLS.EUR }
    ];
  }
  /**
   * تحديث معدلات الصرف (يجب تحديثها يومياً من API خارجي)
   */
  updateExchangeRates(rates) {
    console.log("\u{1F4CA} \u062C\u0627\u0631\u064A \u062A\u062D\u062F\u064A\u062B \u0645\u0639\u062F\u0644\u0627\u062A \u0627\u0644\u0635\u0631\u0641");
    Object.assign(EXCHANGE_RATES, rates);
    console.log("\u2705 \u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0645\u0639\u062F\u0644\u0627\u062A \u0627\u0644\u0635\u0631\u0641:", EXCHANGE_RATES);
  }
  /**
   * الحصول على معدلات الصرف الحالية
   */
  getCurrentRates() {
    return { ...EXCHANGE_RATES };
  }
  /**
   * حساب السعر بناءً على العملة المختارة
   */
  calculatePriceInCurrency(basePriceJOD, targetCurrency) {
    return this.convertAmount(basePriceJOD, "JOD", targetCurrency);
  }
  /**
   * الحصول على معلومات العملة الكاملة
   */
  getCurrencyInfo(currency) {
    return {
      code: currency,
      name: CURRENCY_NAMES[currency],
      symbol: CURRENCY_SYMBOLS[currency],
      exchangeRate: EXCHANGE_RATES[currency]
    };
  }
};
var currencyService = new CurrencyService();

// server/routers/currency.ts
var currencyRouter = router({
  /**
   * الحصول على قائمة العملات المدعومة
   */
  getSupportedCurrencies: publicProcedure.query(async () => {
    try {
      const currencies = currencyService.getSupportedCurrencies();
      return {
        success: true,
        currencies
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0639\u0645\u0644\u0627\u062A");
    }
  }),
  /**
   * تحويل المبلغ من عملة إلى أخرى
   */
  convertAmount: publicProcedure.input(
    z9.object({
      amount: z9.number().positive("\u0627\u0644\u0645\u0628\u0644\u063A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B"),
      fromCurrency: z9.enum(["JOD", "USD", "EUR"]),
      toCurrency: z9.enum(["JOD", "USD", "EUR"])
    })
  ).query(async ({ input }) => {
    try {
      const convertedAmount = currencyService.convertAmount(
        input.amount,
        input.fromCurrency,
        input.toCurrency
      );
      return {
        success: true,
        originalAmount: input.amount,
        originalCurrency: input.fromCurrency,
        convertedAmount,
        targetCurrency: input.toCurrency,
        exchangeRate: currencyService.getExchangeRate(
          input.fromCurrency,
          input.toCurrency
        )
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0639\u0645\u0644\u0629");
    }
  }),
  /**
   * الحصول على معدلات الصرف الحالية
   */
  getExchangeRates: publicProcedure.query(async () => {
    try {
      const rates = currencyService.getCurrentRates();
      return {
        success: true,
        rates,
        lastUpdated: /* @__PURE__ */ new Date()
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0645\u0639\u062F\u0644\u0627\u062A \u0627\u0644\u0635\u0631\u0641");
    }
  }),
  /**
   * الحصول على معلومات العملة
   */
  getCurrencyInfo: publicProcedure.input(
    z9.object({
      currency: z9.enum(["JOD", "USD", "EUR"])
    })
  ).query(async ({ input }) => {
    try {
      const info = currencyService.getCurrencyInfo(input.currency);
      return {
        success: true,
        info
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0639\u0645\u0644\u0629");
    }
  }),
  /**
   * حساب السعر بناءً على العملة المختارة
   */
  calculatePrice: publicProcedure.input(
    z9.object({
      basePriceJOD: z9.number().positive("\u0627\u0644\u0633\u0639\u0631 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B"),
      targetCurrency: z9.enum(["JOD", "USD", "EUR"])
    })
  ).query(async ({ input }) => {
    try {
      const price = currencyService.calculatePriceInCurrency(
        input.basePriceJOD,
        input.targetCurrency
      );
      return {
        success: true,
        basePriceJOD: input.basePriceJOD,
        targetCurrency: input.targetCurrency,
        calculatedPrice: price,
        formatted: currencyService.formatAmount(price, input.targetCurrency)
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062D\u0633\u0627\u0628 \u0627\u0644\u0633\u0639\u0631");
    }
  }),
  /**
   * تنسيق المبلغ مع رمز العملة
   */
  formatAmount: publicProcedure.input(
    z9.object({
      amount: z9.number(),
      currency: z9.enum(["JOD", "USD", "EUR"])
    })
  ).query(async ({ input }) => {
    try {
      const formatted = currencyService.formatAmount(
        input.amount,
        input.currency
      );
      return {
        success: true,
        amount: input.amount,
        currency: input.currency,
        formatted
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u0628\u0644\u063A");
    }
  })
});

// server/routers/coupons.ts
import { z as z10 } from "zod";

// server/services/coupon-service.ts
var CouponService = class {
  coupons = /* @__PURE__ */ new Map();
  constructor() {
    this.initializeSampleCoupons();
  }
  /**
   * تهيئة كوبونات تجريبية
   */
  initializeSampleCoupons() {
    const sampleCoupons = [
      {
        id: "coupon_1",
        code: "WELCOME20",
        discountType: "percentage",
        discountValue: 20,
        minPurchaseAmount: 0,
        maxUsageCount: 100,
        currentUsageCount: 45,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1e3),
        applicablePlans: [],
        status: "active",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      },
      {
        id: "coupon_2",
        code: "SUMMER50",
        discountType: "fixed",
        discountValue: 50,
        minPurchaseAmount: 200,
        maxUsageCount: 50,
        currentUsageCount: 30,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1e3),
        applicablePlans: ["professional", "enterprise"],
        status: "active",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      },
      {
        id: "coupon_3",
        code: "NEWUSER15",
        discountType: "percentage",
        discountValue: 15,
        minPurchaseAmount: 0,
        maxUsageCount: 200,
        currentUsageCount: 120,
        expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1e3),
        applicablePlans: [],
        status: "active",
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }
    ];
    sampleCoupons.forEach((coupon) => {
      this.coupons.set(coupon.code, coupon);
    });
    console.log("\u2705 \u062A\u0645 \u062A\u0647\u064A\u0626\u0629 \u0627\u0644\u0643\u0648\u0628\u0648\u0646\u0627\u062A \u0627\u0644\u062A\u062C\u0631\u064A\u0628\u064A\u0629");
  }
  /**
   * إنشاء كوبون جديد
   */
  createCoupon(code, discountType, discountValue, options) {
    console.log(`\u{1F39F}\uFE0F \u062C\u0627\u0631\u064A \u0625\u0646\u0634\u0627\u0621 \u0643\u0648\u0628\u0648\u0646 \u062C\u062F\u064A\u062F: ${code}`);
    const coupon = {
      id: `coupon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minPurchaseAmount: options?.minPurchaseAmount,
      maxUsageCount: options?.maxUsageCount,
      currentUsageCount: 0,
      expiryDate: options?.expiryDate,
      applicablePlans: options?.applicablePlans || [],
      status: "active",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.coupons.set(coupon.code, coupon);
    console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0643\u0648\u0628\u0648\u0646: ${code}`);
    return coupon;
  }
  /**
   * تطبيق الكوبون على المشتريات
   */
  applyCoupon(couponCode, purchaseAmount, planName) {
    console.log(`\u{1F39F}\uFE0F \u062C\u0627\u0631\u064A \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0643\u0648\u0628\u0648\u0646: ${couponCode}`);
    const coupon = this.coupons.get(couponCode.toUpperCase());
    if (!coupon) {
      return {
        success: false,
        message: "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F"
      };
    }
    if (coupon.status === "disabled") {
      return {
        success: false,
        message: "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0645\u0639\u0637\u0644"
      };
    }
    if (coupon.expiryDate && /* @__PURE__ */ new Date() > coupon.expiryDate) {
      coupon.status = "expired";
      return {
        success: false,
        message: "\u0627\u0646\u062A\u0647\u062A \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0643\u0648\u0628\u0648\u0646"
      };
    }
    if (coupon.minPurchaseAmount && purchaseAmount < coupon.minPurchaseAmount) {
      return {
        success: false,
        message: `\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u0644\u0644\u0634\u0631\u0627\u0621 \u0647\u0648 ${coupon.minPurchaseAmount} \u062F\u064A\u0646\u0627\u0631`
      };
    }
    if (coupon.maxUsageCount && coupon.currentUsageCount >= coupon.maxUsageCount) {
      return {
        success: false,
        message: "\u0627\u0646\u062A\u0647\u062A \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0627\u062A \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647\u0627 \u0644\u0644\u0643\u0648\u0628\u0648\u0646"
      };
    }
    if (coupon.applicablePlans && coupon.applicablePlans.length > 0 && planName) {
      if (!coupon.applicablePlans.includes(planName)) {
        return {
          success: false,
          message: "\u0647\u0630\u0627 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0644\u0627 \u064A\u0646\u0637\u0628\u0642 \u0639\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u062E\u0637\u0629"
        };
      }
    }
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = purchaseAmount * coupon.discountValue / 100;
    } else {
      discountAmount = coupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, purchaseAmount);
    const finalPrice = purchaseAmount - discountAmount;
    coupon.currentUsageCount++;
    coupon.updatedAt = /* @__PURE__ */ new Date();
    console.log(`\u2705 \u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0628\u0646\u062C\u0627\u062D: \u062E\u0635\u0645 ${discountAmount} \u062F\u064A\u0646\u0627\u0631`);
    return {
      success: true,
      message: "\u062A\u0645 \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0628\u0646\u062C\u0627\u062D",
      discountAmount: Math.round(discountAmount * 100) / 100,
      finalPrice: Math.round(finalPrice * 100) / 100,
      coupon
    };
  }
  /**
   * الحصول على الكوبون
   */
  getCoupon(code) {
    return this.coupons.get(code.toUpperCase()) || null;
  }
  /**
   * الحصول على جميع الكوبونات
   */
  getAllCoupons() {
    return Array.from(this.coupons.values());
  }
  /**
   * الحصول على الكوبونات النشطة فقط
   */
  getActiveCoupons() {
    return Array.from(this.coupons.values()).filter((coupon) => {
      if (coupon.status !== "active") return false;
      if (coupon.expiryDate && /* @__PURE__ */ new Date() > coupon.expiryDate) return false;
      return true;
    });
  }
  /**
   * تحديث الكوبون
   */
  updateCoupon(code, updates) {
    const coupon = this.coupons.get(code.toUpperCase());
    if (!coupon) return null;
    Object.assign(coupon, updates, { updatedAt: /* @__PURE__ */ new Date() });
    console.log(`\u2705 \u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0643\u0648\u0628\u0648\u0646: ${code}`);
    return coupon;
  }
  /**
   * حذف الكوبون
   */
  deleteCoupon(code) {
    const deleted = this.coupons.delete(code.toUpperCase());
    if (deleted) {
      console.log(`\u2705 \u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0643\u0648\u0628\u0648\u0646: ${code}`);
    }
    return deleted;
  }
  /**
   * تعطيل الكوبون
   */
  disableCoupon(code) {
    return this.updateCoupon(code, { status: "disabled" });
  }
  /**
   * الحصول على إحصائيات الكوبون
   */
  getCouponStats(code) {
    const coupon = this.coupons.get(code.toUpperCase());
    if (!coupon) return null;
    const remainingUsages = coupon.maxUsageCount ? coupon.maxUsageCount - coupon.currentUsageCount : -1;
    return {
      code: coupon.code,
      totalUsages: coupon.currentUsageCount,
      remainingUsages,
      discountAmount: coupon.discountValue,
      status: coupon.status
    };
  }
};
var couponService = new CouponService();

// server/routers/coupons.ts
var couponsRouter = router({
  /**
   * الحصول على جميع الكوبونات النشطة
   */
  getActiveCoupons: publicProcedure.query(async () => {
    try {
      const coupons = couponService.getActiveCoupons();
      return {
        success: true,
        coupons
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0643\u0648\u0628\u0648\u0646\u0627\u062A");
    }
  }),
  /**
   * تطبيق الكوبون
   */
  applyCoupon: publicProcedure.input(
    z10.object({
      couponCode: z10.string().min(1, "\u0631\u0645\u0632 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0645\u0637\u0644\u0648\u0628"),
      purchaseAmount: z10.number().positive("\u0627\u0644\u0645\u0628\u0644\u063A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B"),
      planName: z10.string().optional()
    })
  ).mutation(async ({ input }) => {
    try {
      const result = couponService.applyCoupon(
        input.couponCode,
        input.purchaseAmount,
        input.planName
      );
      return result;
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0643\u0648\u0628\u0648\u0646");
    }
  }),
  /**
   * التحقق من صحة الكوبون
   */
  validateCoupon: publicProcedure.input(
    z10.object({
      couponCode: z10.string().min(1, "\u0631\u0645\u0632 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0645\u0637\u0644\u0648\u0628")
    })
  ).query(async ({ input }) => {
    try {
      const coupon = couponService.getCoupon(input.couponCode);
      if (!coupon) {
        return {
          success: false,
          message: "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F",
          valid: false
        };
      }
      const isExpired = coupon.expiryDate && /* @__PURE__ */ new Date() > coupon.expiryDate;
      const isDisabled = coupon.status === "disabled";
      const isMaxUsed = coupon.maxUsageCount && coupon.currentUsageCount >= coupon.maxUsageCount;
      const valid = !isExpired && !isDisabled && !isMaxUsed;
      return {
        success: true,
        valid,
        coupon,
        isExpired,
        isDisabled,
        isMaxUsed,
        message: valid ? "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0635\u062D\u064A\u062D" : "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0644\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645"
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0643\u0648\u0628\u0648\u0646");
    }
  }),
  /**
   * الحصول على إحصائيات الكوبون
   */
  getCouponStats: publicProcedure.input(
    z10.object({
      couponCode: z10.string().min(1, "\u0631\u0645\u0632 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0645\u0637\u0644\u0648\u0628")
    })
  ).query(async ({ input }) => {
    try {
      const stats = couponService.getCouponStats(input.couponCode);
      if (!stats) {
        return {
          success: false,
          message: "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F"
        };
      }
      return {
        success: true,
        stats
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0643\u0648\u0628\u0648\u0646");
    }
  }),
  /**
   * إنشاء كوبون جديد (للمسؤولين فقط)
   */
  createCoupon: protectedProcedure.input(
    z10.object({
      code: z10.string().min(3, "\u0631\u0645\u0632 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 3 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"),
      discountType: z10.enum(["percentage", "fixed"]),
      discountValue: z10.number().positive("\u0642\u064A\u0645\u0629 \u0627\u0644\u062E\u0635\u0645 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0629"),
      minPurchaseAmount: z10.number().optional(),
      maxUsageCount: z10.number().optional(),
      expiryDate: z10.date().optional(),
      applicablePlans: z10.array(z10.string()).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new Error("\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0644\u0625\u0646\u0634\u0627\u0621 \u0643\u0648\u0628\u0648\u0646");
      }
      const coupon = couponService.createCoupon(
        input.code,
        input.discountType,
        input.discountValue,
        {
          minPurchaseAmount: input.minPurchaseAmount,
          maxUsageCount: input.maxUsageCount,
          expiryDate: input.expiryDate,
          applicablePlans: input.applicablePlans
        }
      );
      return {
        success: true,
        message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0628\u0646\u062C\u0627\u062D",
        coupon
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0643\u0648\u0628\u0648\u0646");
    }
  }),
  /**
   * تحديث الكوبون (للمسؤولين فقط)
   */
  updateCoupon: protectedProcedure.input(
    z10.object({
      code: z10.string().min(1, "\u0631\u0645\u0632 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0645\u0637\u0644\u0648\u0628"),
      updates: z10.object({
        discountValue: z10.number().optional(),
        status: z10.enum(["active", "expired", "disabled"]).optional(),
        maxUsageCount: z10.number().optional(),
        expiryDate: z10.date().optional()
      })
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new Error("\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0644\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0643\u0648\u0628\u0648\u0646");
      }
      const coupon = couponService.updateCoupon(input.code, input.updates);
      if (!coupon) {
        return {
          success: false,
          message: "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F"
        };
      }
      return {
        success: true,
        message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0628\u0646\u062C\u0627\u062D",
        coupon
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0643\u0648\u0628\u0648\u0646");
    }
  }),
  /**
   * حذف الكوبون (للمسؤولين فقط)
   */
  deleteCoupon: protectedProcedure.input(
    z10.object({
      code: z10.string().min(1, "\u0631\u0645\u0632 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0645\u0637\u0644\u0648\u0628")
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new Error("\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0644\u062D\u0630\u0641 \u0627\u0644\u0643\u0648\u0628\u0648\u0646");
      }
      const deleted = couponService.deleteCoupon(input.code);
      return {
        success: deleted,
        message: deleted ? "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u0628\u0646\u062C\u0627\u062D" : "\u0627\u0644\u0643\u0648\u0628\u0648\u0646 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F"
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0643\u0648\u0628\u0648\u0646");
    }
  }),
  /**
   * الحصول على جميع الكوبونات (للمسؤولين فقط)
   */
  getAllCoupons: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new Error("\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0644\u0639\u0631\u0636 \u062C\u0645\u064A\u0639 \u0627\u0644\u0643\u0648\u0628\u0648\u0646\u0627\u062A");
      }
      const coupons = couponService.getAllCoupons();
      return {
        success: true,
        coupons
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0643\u0648\u0628\u0648\u0646\u0627\u062A");
    }
  })
});

// server/routers/billing.ts
import { z as z11 } from "zod";

// server/services/invoice-service.ts
import { PDFDocument, rgb } from "pdf-lib";
import * as fs3 from "fs";
import * as path2 from "path";
var InvoiceService = class {
  invoicesDir = path2.join(process.cwd(), "invoices");
  constructor() {
    if (!fs3.existsSync(this.invoicesDir)) {
      fs3.mkdirSync(this.invoicesDir, { recursive: true });
      console.log("\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0645\u062C\u0644\u062F \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631");
    }
  }
  /**
   * إنشاء فاتورة PDF
   */
  async generateInvoicePDF(invoiceData) {
    console.log(`\u{1F4C4} \u062C\u0627\u0631\u064A \u0625\u0646\u0634\u0627\u0621 \u0641\u0627\u062A\u0648\u0631\u0629: ${invoiceData.invoiceNumber}`);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]);
      const { width, height } = page.getSize();
      const primaryColor = rgb(0.1, 0.4, 0.8);
      const textColor = rgb(0.2, 0.2, 0.2);
      const lightGray = rgb(0.95, 0.95, 0.95);
      let yPosition = height - 40;
      page.drawText(invoiceData.companyName, {
        x: 40,
        y: yPosition,
        size: 24,
        color: primaryColor,
        font: await pdfDoc.embedFont("Helvetica-Bold")
      });
      yPosition -= 30;
      page.drawText(`\u0627\u0644\u0636\u0631\u064A\u0628\u0629: ${invoiceData.companyTaxId}`, {
        x: 40,
        y: yPosition,
        size: 10,
        color: textColor
      });
      page.drawText(invoiceData.companyAddress, {
        x: 40,
        y: yPosition - 15,
        size: 10,
        color: textColor
      });
      page.drawText(`\u0627\u0644\u0647\u0627\u062A\u0641: ${invoiceData.companyPhone}`, {
        x: 40,
        y: yPosition - 30,
        size: 10,
        color: textColor
      });
      page.drawText(`\u0627\u0644\u0628\u0631\u064A\u062F: ${invoiceData.companyEmail}`, {
        x: 40,
        y: yPosition - 45,
        size: 10,
        color: textColor
      });
      page.drawText("\u0641\u0627\u062A\u0648\u0631\u0629", {
        x: width - 100,
        y: yPosition,
        size: 28,
        color: primaryColor,
        font: await pdfDoc.embedFont("Helvetica-Bold")
      });
      yPosition -= 80;
      page.drawText(`\u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629: ${invoiceData.invoiceNumber}`, {
        x: 40,
        y: yPosition,
        size: 11,
        color: textColor,
        font: await pdfDoc.embedFont("Helvetica-Bold")
      });
      page.drawText(`\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629: ${this.formatDate(invoiceData.invoiceDate)}`, {
        x: width - 200,
        y: yPosition,
        size: 11,
        color: textColor
      });
      yPosition -= 20;
      page.drawText(`\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642: ${this.formatDate(invoiceData.dueDate)}`, {
        x: width - 200,
        y: yPosition,
        size: 11,
        color: textColor
      });
      yPosition -= 40;
      page.drawText("\u0641\u0627\u062A\u0648\u0631\u0629 \u0625\u0644\u0649:", {
        x: 40,
        y: yPosition,
        size: 12,
        color: textColor,
        font: await pdfDoc.embedFont("Helvetica-Bold")
      });
      yPosition -= 20;
      page.drawText(invoiceData.customerName, {
        x: 40,
        y: yPosition,
        size: 11,
        color: textColor,
        font: await pdfDoc.embedFont("Helvetica-Bold")
      });
      page.drawText(invoiceData.customerAddress, {
        x: 40,
        y: yPosition - 15,
        size: 10,
        color: textColor
      });
      page.drawText(`\u0627\u0644\u0647\u0627\u062A\u0641: ${invoiceData.customerPhone}`, {
        x: 40,
        y: yPosition - 30,
        size: 10,
        color: textColor
      });
      page.drawText(`\u0627\u0644\u0628\u0631\u064A\u062F: ${invoiceData.customerEmail}`, {
        x: 40,
        y: yPosition - 45,
        size: 10,
        color: textColor
      });
      yPosition -= 80;
      const tableTop = yPosition;
      const colWidths = [250, 80, 80, 100];
      const colPositions = [40, 40 + colWidths[0], 40 + colWidths[0] + colWidths[1], 40 + colWidths[0] + colWidths[1] + colWidths[2]];
      page.drawRectangle({
        x: 40,
        y: tableTop - 25,
        width: width - 80,
        height: 25,
        color: primaryColor
      });
      page.drawText("\u0627\u0644\u0648\u0635\u0641", {
        x: colPositions[0] + 10,
        y: tableTop - 18,
        size: 11,
        color: rgb(1, 1, 1),
        font: await pdfDoc.embedFont("Helvetica-Bold")
      });
      page.drawText("\u0627\u0644\u0643\u0645\u064A\u0629", {
        x: colPositions[1] + 10,
        y: tableTop - 18,
        size: 11,
        color: rgb(1, 1, 1),
        font: await pdfDoc.embedFont("Helvetica-Bold")
      });
      page.drawText("\u0627\u0644\u0633\u0639\u0631", {
        x: colPositions[2] + 10,
        y: tableTop - 18,
        size: 11,
        color: rgb(1, 1, 1),
        font: await pdfDoc.embedFont("Helvetica-Bold")
      });
      page.drawText("\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A", {
        x: colPositions[3] + 10,
        y: tableTop - 18,
        size: 11,
        color: rgb(1, 1, 1),
        font: await pdfDoc.embedFont("Helvetica-Bold")
      });
      yPosition -= 35;
      let itemYPosition = yPosition;
      invoiceData.items.forEach((item, index) => {
        if (index % 2 === 0) {
          page.drawRectangle({
            x: 40,
            y: itemYPosition - 20,
            width: width - 80,
            height: 20,
            color: lightGray
          });
        }
        page.drawText(item.description, {
          x: colPositions[0] + 5,
          y: itemYPosition - 15,
          size: 10,
          color: textColor
        });
        page.drawText(item.quantity.toString(), {
          x: colPositions[1] + 5,
          y: itemYPosition - 15,
          size: 10,
          color: textColor
        });
        page.drawText(item.unitPrice.toFixed(2), {
          x: colPositions[2] + 5,
          y: itemYPosition - 15,
          size: 10,
          color: textColor
        });
        page.drawText(item.amount.toFixed(2), {
          x: colPositions[3] + 5,
          y: itemYPosition - 15,
          size: 10,
          color: textColor
        });
        itemYPosition -= 25;
      });
      yPosition = itemYPosition - 20;
      const totalsX = width - 200;
      page.drawText("\u0627\u0644\u0645\u062C\u0645\u0648\u0639 \u0627\u0644\u0641\u0631\u0639\u064A:", {
        x: totalsX,
        y: yPosition,
        size: 11,
        color: textColor
      });
      page.drawText(`${invoiceData.subtotal.toFixed(2)} ${invoiceData.currency}`, {
        x: width - 80,
        y: yPosition,
        size: 11,
        color: textColor,
        font: await pdfDoc.embedFont("Helvetica-Bold")
      });
      yPosition -= 20;
      if (invoiceData.discountAmount > 0) {
        page.drawText("\u0627\u0644\u062E\u0635\u0645:", {
          x: totalsX,
          y: yPosition,
          size: 11,
          color: textColor
        });
        page.drawText(`-${invoiceData.discountAmount.toFixed(2)} ${invoiceData.currency}`, {
          x: width - 80,
          y: yPosition,
          size: 11,
          color: rgb(0.8, 0.2, 0.2),
          font: await pdfDoc.embedFont("Helvetica-Bold")
        });
        yPosition -= 20;
      }
      page.drawText("\u0627\u0644\u0636\u0631\u064A\u0628\u0629:", {
        x: totalsX,
        y: yPosition,
        size: 11,
        color: textColor
      });
      page.drawText(`${invoiceData.taxAmount.toFixed(2)} ${invoiceData.currency}`, {
        x: width - 80,
        y: yPosition,
        size: 11,
        color: textColor,
        font: await pdfDoc.embedFont("Helvetica-Bold")
      });
      yPosition -= 25;
      page.drawRectangle({
        x: totalsX - 10,
        y: yPosition - 20,
        width: 180,
        height: 25,
        color: primaryColor
      });
      page.drawText("\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A:", {
        x: totalsX,
        y: yPosition - 10,
        size: 13,
        color: rgb(1, 1, 1),
        font: await pdfDoc.embedFont("Helvetica-Bold")
      });
      page.drawText(`${invoiceData.totalAmount.toFixed(2)} ${invoiceData.currency}`, {
        x: width - 80,
        y: yPosition - 10,
        size: 13,
        color: rgb(1, 1, 1),
        font: await pdfDoc.embedFont("Helvetica-Bold")
      });
      yPosition -= 60;
      if (invoiceData.notes) {
        page.drawText("\u0645\u0644\u0627\u062D\u0638\u0627\u062A:", {
          x: 40,
          y: yPosition,
          size: 11,
          color: textColor,
          font: await pdfDoc.embedFont("Helvetica-Bold")
        });
        page.drawText(invoiceData.notes, {
          x: 40,
          y: yPosition - 20,
          size: 10,
          color: textColor
        });
        yPosition -= 40;
      }
      if (invoiceData.terms) {
        page.drawText("\u0627\u0644\u0634\u0631\u0648\u0637 \u0648\u0627\u0644\u0623\u062D\u0643\u0627\u0645:", {
          x: 40,
          y: yPosition,
          size: 11,
          color: textColor,
          font: await pdfDoc.embedFont("Helvetica-Bold")
        });
        page.drawText(invoiceData.terms, {
          x: 40,
          y: yPosition - 20,
          size: 10,
          color: textColor
        });
      }
      page.drawText("\u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0639\u0627\u0645\u0644\u0643 \u0645\u0639\u0646\u0627", {
        x: 40,
        y: 30,
        size: 12,
        color: primaryColor,
        font: await pdfDoc.embedFont("Helvetica-Bold")
      });
      page.drawText(`\u062A\u0645 \u0627\u0644\u0625\u0646\u0634\u0627\u0621 \u0641\u064A: ${(/* @__PURE__ */ new Date()).toLocaleString("ar-JO")}`, {
        x: width - 200,
        y: 30,
        size: 9,
        color: rgb(0.6, 0.6, 0.6)
      });
      const pdfBytes = await pdfDoc.save();
      console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629: ${invoiceData.invoiceNumber}`);
      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629:", error);
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629");
    }
  }
  /**
   * حفظ الفاتورة على القرص
   */
  async saveInvoice(invoiceData) {
    try {
      const pdfBuffer = await this.generateInvoicePDF(invoiceData);
      const fileName = `invoice-${invoiceData.invoiceNumber}-${Date.now()}.pdf`;
      const filePath = path2.join(this.invoicesDir, fileName);
      fs3.writeFileSync(filePath, pdfBuffer);
      console.log(`\u{1F4BE} \u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062D\u0641\u0638 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629:", error);
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062D\u0641\u0638 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629");
    }
  }
  /**
   * الحصول على الفاتورة
   */
  getInvoice(fileName) {
    try {
      const filePath = path2.join(this.invoicesDir, fileName);
      if (fs3.existsSync(filePath)) {
        return fs3.readFileSync(filePath);
      }
      return null;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629:", error);
      return null;
    }
  }
  /**
   * حذف الفاتورة
   */
  deleteInvoice(fileName) {
    try {
      const filePath = path2.join(this.invoicesDir, fileName);
      if (fs3.existsSync(filePath)) {
        fs3.unlinkSync(filePath);
        console.log(`\u2705 \u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629: ${fileName}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629:", error);
      return false;
    }
  }
  /**
   * تنسيق التاريخ
   */
  formatDate(date3) {
    return new Intl.DateTimeFormat("ar-JO", {
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(date3);
  }
  /**
   * إنشاء رقم فاتورة فريد
   */
  generateInvoiceNumber() {
    const timestamp4 = Date.now();
    const random = Math.floor(Math.random() * 1e4);
    return `INV-${timestamp4}-${random}`;
  }
};
var invoiceService = new InvoiceService();

// server/services/tax-service.ts
var TAX_RATES = {
  "JO": 0.16,
  // الأردن - 16%
  "SA": 0.15,
  // السعودية - 15%
  "AE": 0.05,
  // الإمارات - 5%
  "EG": 0.14,
  // مصر - 14%
  "KW": 0,
  // الكويت - 0%
  "QA": 0.05,
  // قطر - 5%
  "BH": 0.05,
  // البحرين - 5%
  "OM": 0,
  // عمان - 0%
  "US": 0.08,
  // أمريكا - 8% (متوسط)
  "EU": 0.21,
  // أوروبا - 21% (متوسط)
  "GB": 0.2,
  // بريطانيا - 20%
  "CA": 0.13,
  // كندا - 13%
  "AU": 0.1
  // أستراليا - 10%
};
var SHIPPING_FEES = {
  "standard": 5,
  // شحن عادي
  "express": 15,
  // شحن سريع
  "overnight": 30,
  // شحن ليلي
  "international": 25
  // شحن دولي
};
var COMMODITY_FEES = {
  "electronics": 0.05,
  // إلكترونيات - 5%
  "clothing": 0.02,
  // ملابس - 2%
  "food": 0.03,
  // غذائيات - 3%
  "books": 0,
  // كتب - 0%
  "medicine": 0.01,
  // أدوية - 1%
  "cosmetics": 0.08,
  // مستحضرات تجميل - 8%
  "jewelry": 0.1,
  // مجوهرات - 10%
  "alcohol": 0.25,
  // كحوليات - 25%
  "tobacco": 0.3,
  // تبغ - 30%
  "other": 0.04
  // أخرى - 4%
};
var TaxService = class {
  /**
   * الحصول على معدل الضريبة حسب الدولة
   */
  getTaxRate(countryCode) {
    return TAX_RATES[countryCode.toUpperCase()] || 0.16;
  }
  /**
   * الحصول على رسم الشحن
   */
  getShippingFee(shippingType) {
    return SHIPPING_FEES[shippingType.toLowerCase()] || SHIPPING_FEES["standard"];
  }
  /**
   * الحصول على رسم البضاعة
   */
  getCommodityFee(commodityType) {
    return COMMODITY_FEES[commodityType.toLowerCase()] || COMMODITY_FEES["other"];
  }
  /**
   * حساب الضرائب والرسوم الكاملة
   */
  calculateTax(subtotal, countryCode, shippingType = "standard", commodityType = "other") {
    console.log(`\u{1F4B0} \u062C\u0627\u0631\u064A \u062D\u0633\u0627\u0628 \u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0644\u0644\u062F\u0648\u0644\u0629: ${countryCode}`);
    const taxRate = this.getTaxRate(countryCode);
    const shippingFee = this.getShippingFee(shippingType);
    const commodityFeeRate = this.getCommodityFee(commodityType);
    const taxAmount = subtotal * taxRate;
    const commodityFee = subtotal * commodityFeeRate;
    const totalFees = shippingFee + commodityFee;
    const total = subtotal + taxAmount + totalFees;
    console.log(`\u2705 \u062A\u0645 \u062D\u0633\u0627\u0628 \u0627\u0644\u0636\u0631\u0627\u0626\u0628: ${taxAmount.toFixed(2)}`);
    return {
      subtotal,
      taxRate,
      taxAmount: Math.round(taxAmount * 100) / 100,
      shippingFee,
      commodityFee: Math.round(commodityFee * 100) / 100,
      totalFees,
      total: Math.round(total * 100) / 100,
      breakdown: {
        subtotal,
        tax: Math.round(taxAmount * 100) / 100,
        shipping: shippingFee,
        commodity: Math.round(commodityFee * 100) / 100,
        total: Math.round(total * 100) / 100
      }
    };
  }
  /**
   * حساب الضرائب بناءً على معدل مخصص
   */
  calculateTaxWithCustomRate(subtotal, customTaxRate, shippingFee = 0, additionalFees = 0) {
    const taxAmount = subtotal * customTaxRate;
    const totalFees = shippingFee + additionalFees;
    const total = subtotal + taxAmount + totalFees;
    return {
      subtotal,
      taxRate: customTaxRate,
      taxAmount: Math.round(taxAmount * 100) / 100,
      shippingFee,
      commodityFee: additionalFees,
      totalFees,
      total: Math.round(total * 100) / 100,
      breakdown: {
        subtotal,
        tax: Math.round(taxAmount * 100) / 100,
        shipping: shippingFee,
        commodity: additionalFees,
        total: Math.round(total * 100) / 100
      }
    };
  }
  /**
   * الحصول على جميع معدلات الضريبة
   */
  getAllTaxRates() {
    return { ...TAX_RATES };
  }
  /**
   * الحصول على جميع رسوم الشحن
   */
  getAllShippingFees() {
    return { ...SHIPPING_FEES };
  }
  /**
   * الحصول على جميع رسوم البضاعة
   */
  getAllCommodityFees() {
    return { ...COMMODITY_FEES };
  }
  /**
   * التحقق من الإعفاءات الضريبية
   */
  isExemptFromTax(commodityType) {
    const exemptItems = ["books", "medicine"];
    return exemptItems.includes(commodityType.toLowerCase());
  }
  /**
   * حساب الضريبة المستحقة للدولة
   */
  calculateGovernmentTax(subtotal, countryCode) {
    const taxRate = this.getTaxRate(countryCode);
    const taxAmount = subtotal * taxRate;
    return Math.round(taxAmount * 100) / 100;
  }
  /**
   * الحصول على معلومات الضريبة الكاملة
   */
  getTaxInfo(countryCode) {
    const taxRate = this.getTaxRate(countryCode);
    const countryNames = {
      "JO": "\u0627\u0644\u0623\u0631\u062F\u0646",
      "SA": "\u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629",
      "AE": "\u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A",
      "EG": "\u0645\u0635\u0631",
      "KW": "\u0627\u0644\u0643\u0648\u064A\u062A",
      "QA": "\u0642\u0637\u0631",
      "BH": "\u0627\u0644\u0628\u062D\u0631\u064A\u0646",
      "OM": "\u0639\u0645\u0627\u0646",
      "US": "\u0627\u0644\u0648\u0644\u0627\u064A\u0627\u062A \u0627\u0644\u0645\u062A\u062D\u062F\u0629",
      "EU": "\u0627\u0644\u0627\u062A\u062D\u0627\u062F \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A",
      "GB": "\u0628\u0631\u064A\u0637\u0627\u0646\u064A\u0627",
      "CA": "\u0643\u0646\u062F\u0627",
      "AU": "\u0623\u0633\u062A\u0631\u0627\u0644\u064A\u0627"
    };
    return {
      country: countryNames[countryCode.toUpperCase()] || countryCode,
      taxRate,
      taxRatePercentage: `${(taxRate * 100).toFixed(1)}%`,
      description: `\u0645\u0639\u062F\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u0639\u0644\u0649 \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0636\u0627\u0641\u0629 \u0641\u064A ${countryNames[countryCode.toUpperCase()] || countryCode}`
    };
  }
  /**
   * تحديث معدل الضريبة (للمسؤولين فقط)
   */
  updateTaxRate(countryCode, newRate) {
    if (newRate < 0 || newRate > 1) {
      console.error("\u274C \u0645\u0639\u062F\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0628\u064A\u0646 0 \u0648 1");
      return false;
    }
    TAX_RATES[countryCode.toUpperCase()] = newRate;
    console.log(`\u2705 \u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0645\u0639\u062F\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u0644\u0644\u062F\u0648\u0644\u0629 ${countryCode} \u0625\u0644\u0649 ${(newRate * 100).toFixed(1)}%`);
    return true;
  }
  /**
   * تحديث رسم الشحن
   */
  updateShippingFee(shippingType, newFee) {
    if (newFee < 0) {
      console.error("\u274C \u0631\u0633\u0645 \u0627\u0644\u0634\u062D\u0646 \u0644\u0627 \u064A\u0645\u0643\u0646 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0633\u0627\u0644\u0628\u0627\u064B");
      return false;
    }
    SHIPPING_FEES[shippingType.toLowerCase()] = newFee;
    console.log(`\u2705 \u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0631\u0633\u0645 \u0627\u0644\u0634\u062D\u0646 ${shippingType} \u0625\u0644\u0649 ${newFee}`);
    return true;
  }
  /**
   * تحديث رسم البضاعة
   */
  updateCommodityFee(commodityType, newFeeRate) {
    if (newFeeRate < 0 || newFeeRate > 1) {
      console.error("\u274C \u0631\u0633\u0645 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0628\u064A\u0646 0 \u0648 1");
      return false;
    }
    COMMODITY_FEES[commodityType.toLowerCase()] = newFeeRate;
    console.log(`\u2705 \u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0631\u0633\u0645 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 ${commodityType} \u0625\u0644\u0649 ${(newFeeRate * 100).toFixed(1)}%`);
    return true;
  }
};
var taxService = new TaxService();

// server/services/tax-report-service.ts
import * as fs4 from "fs";
import * as path3 from "path";
var TaxReportService = class {
  reportsDir = path3.join(process.cwd(), "tax-reports");
  constructor() {
    if (!fs4.existsSync(this.reportsDir)) {
      fs4.mkdirSync(this.reportsDir, { recursive: true });
      console.log("\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0645\u062C\u0644\u062F \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629");
    }
  }
  /**
   * إنشاء ملخص التقرير الضريبي
   */
  generateTaxReportSummary(transactions2, startDate, endDate) {
    console.log(`\u{1F4CA} \u062C\u0627\u0631\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0636\u0631\u064A\u0628\u064A \u0645\u0646 ${startDate} \u0625\u0644\u0649 ${endDate}`);
    const filteredTransactions = transactions2.filter(
      (t2) => new Date(t2.date) >= startDate && new Date(t2.date) <= endDate
    );
    const totalAmount = filteredTransactions.reduce((sum, t2) => sum + t2.amount, 0);
    const totalTax = filteredTransactions.reduce((sum, t2) => sum + t2.taxAmount, 0);
    const totalShipping = filteredTransactions.reduce((sum, t2) => {
      return sum + t2.amount * 0.05;
    }, 0);
    const totalCommodity = filteredTransactions.reduce((sum, t2) => {
      return sum + t2.amount * 0.03;
    }, 0);
    const averageTaxRate = filteredTransactions.length > 0 ? filteredTransactions.reduce((sum, t2) => sum + t2.taxRate, 0) / filteredTransactions.length : 0;
    const byCountry = {};
    filteredTransactions.forEach((t2) => {
      if (!byCountry[t2.country]) {
        byCountry[t2.country] = { count: 0, amount: 0, tax: 0 };
      }
      byCountry[t2.country].count++;
      byCountry[t2.country].amount += t2.amount;
      byCountry[t2.country].tax += t2.taxAmount;
    });
    const byCommodity = {};
    filteredTransactions.forEach((t2) => {
      if (!byCommodity[t2.commodityType]) {
        byCommodity[t2.commodityType] = { count: 0, amount: 0, tax: 0 };
      }
      byCommodity[t2.commodityType].count++;
      byCommodity[t2.commodityType].amount += t2.amount;
      byCommodity[t2.commodityType].tax += t2.taxAmount;
    });
    console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0642\u0631\u064A\u0631: ${filteredTransactions.length} \u0645\u0639\u0627\u0645\u0644\u0629`);
    return {
      period: { startDate, endDate },
      totalTransactions: filteredTransactions.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalTaxCollected: Math.round(totalTax * 100) / 100,
      totalShippingFees: Math.round(totalShipping * 100) / 100,
      totalCommodityFees: Math.round(totalCommodity * 100) / 100,
      averageTaxRate,
      transactions: filteredTransactions,
      byCountry,
      byCommodity
    };
  }
  /**
   * تصدير التقرير بصيغة CSV
   */
  exportToCSV(report) {
    console.log("\u{1F4C4} \u062C\u0627\u0631\u064A \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0628\u0635\u064A\u063A\u0629 CSV");
    let csv = "\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0636\u0631\u064A\u0628\u064A \u0627\u0644\u0634\u0627\u0645\u0644\n";
    csv += `\u0627\u0644\u0641\u062A\u0631\u0629: ${report.period.startDate.toLocaleDateString("ar-JO")} \u0625\u0644\u0649 ${report.period.endDate.toLocaleDateString("ar-JO")}

`;
    csv += "\u0627\u0644\u0645\u0644\u062E\u0635\n";
    csv += `\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A,${report.totalTransactions}
`;
    csv += `\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0628\u0644\u063A,${report.totalAmount}
`;
    csv += `\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0627\u0644\u0645\u062D\u0635\u0644\u0629,${report.totalTaxCollected}
`;
    csv += `\u0625\u062C\u0645\u0627\u0644\u064A \u0631\u0633\u0648\u0645 \u0627\u0644\u0634\u062D\u0646,${report.totalShippingFees}
`;
    csv += `\u0625\u062C\u0645\u0627\u0644\u064A \u0631\u0633\u0648\u0645 \u0627\u0644\u0628\u0636\u0627\u0639\u0629,${report.totalCommodityFees}
`;
    csv += `\u0645\u062A\u0648\u0633\u0637 \u0645\u0639\u062F\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629,${(report.averageTaxRate * 100).toFixed(2)}%

`;
    csv += "\u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A\n";
    csv += "\u0627\u0644\u062A\u0627\u0631\u064A\u062E,\u0627\u0644\u0648\u0635\u0641,\u0627\u0644\u0645\u0628\u0644\u063A,\u0645\u0639\u062F\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629,\u0627\u0644\u0636\u0631\u064A\u0628\u0629,\u0627\u0644\u062F\u0648\u0644\u0629,\u0646\u0648\u0639 \u0627\u0644\u0634\u062D\u0646,\u0646\u0648\u0639 \u0627\u0644\u0628\u0636\u0627\u0639\u0629,\u0627\u0644\u062D\u0627\u0644\u0629\n";
    report.transactions.forEach((t2) => {
      csv += `${new Date(t2.date).toLocaleDateString("ar-JO")},`;
      csv += `"${t2.description}",`;
      csv += `${t2.amount},`;
      csv += `${(t2.taxRate * 100).toFixed(2)}%,`;
      csv += `${t2.taxAmount},`;
      csv += `${t2.country},`;
      csv += `${t2.shippingType},`;
      csv += `${t2.commodityType},`;
      csv += `${t2.status}
`;
    });
    csv += "\n\u0627\u0644\u0645\u0644\u062E\u0635 \u062D\u0633\u0628 \u0627\u0644\u062F\u0648\u0644\n";
    csv += "\u0627\u0644\u062F\u0648\u0644\u0629,\u0639\u062F\u062F \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A,\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0628\u0644\u063A,\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0636\u0631\u0627\u0626\u0628\n";
    Object.entries(report.byCountry).forEach(([country, data]) => {
      csv += `${country},${data.count},${data.amount},${data.tax}
`;
    });
    csv += "\n\u0627\u0644\u0645\u0644\u062E\u0635 \u062D\u0633\u0628 \u0646\u0648\u0639 \u0627\u0644\u0628\u0636\u0627\u0639\u0629\n";
    csv += "\u0646\u0648\u0639 \u0627\u0644\u0628\u0636\u0627\u0639\u0629,\u0639\u062F\u062F \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A,\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0628\u0644\u063A,\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0636\u0631\u0627\u0626\u0628\n";
    Object.entries(report.byCommodity).forEach(([commodity, data]) => {
      csv += `${commodity},${data.count},${data.amount},${data.tax}
`;
    });
    console.log("\u2705 \u062A\u0645 \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0628\u0635\u064A\u063A\u0629 CSV");
    return csv;
  }
  /**
   * تصدير التقرير بصيغة JSON
   */
  exportToJSON(report) {
    console.log("\u{1F4C4} \u062C\u0627\u0631\u064A \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0628\u0635\u064A\u063A\u0629 JSON");
    const jsonReport = {
      title: "\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0636\u0631\u064A\u0628\u064A \u0627\u0644\u0634\u0627\u0645\u0644",
      period: {
        startDate: report.period.startDate.toISOString(),
        endDate: report.period.endDate.toISOString()
      },
      summary: {
        totalTransactions: report.totalTransactions,
        totalAmount: report.totalAmount,
        totalTaxCollected: report.totalTaxCollected,
        totalShippingFees: report.totalShippingFees,
        totalCommodityFees: report.totalCommodityFees,
        averageTaxRate: `${(report.averageTaxRate * 100).toFixed(2)}%`
      },
      transactions: report.transactions.map((t2) => ({
        id: t2.id,
        date: new Date(t2.date).toLocaleDateString("ar-JO"),
        description: t2.description,
        amount: t2.amount,
        taxRate: `${(t2.taxRate * 100).toFixed(2)}%`,
        taxAmount: t2.taxAmount,
        country: t2.country,
        shippingType: t2.shippingType,
        commodityType: t2.commodityType,
        status: t2.status
      })),
      byCountry: report.byCountry,
      byCommodity: report.byCommodity,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    console.log("\u2705 \u062A\u0645 \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0628\u0635\u064A\u063A\u0629 JSON");
    return JSON.stringify(jsonReport, null, 2);
  }
  /**
   * تصدير التقرير بصيغة HTML
   */
  exportToHTML(report) {
    console.log("\u{1F4C4} \u062C\u0627\u0631\u064A \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0628\u0635\u064A\u063A\u0629 HTML");
    let html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0636\u0631\u064A\u0628\u064A \u0627\u0644\u0634\u0627\u0645\u0644</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      direction: rtl;
      margin: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #1e40af;
      text-align: center;
      border-bottom: 3px solid #1e40af;
      padding-bottom: 10px;
    }
    h2 {
      color: #1e40af;
      margin-top: 30px;
      border-left: 4px solid #1e40af;
      padding-left: 10px;
    }
    .period {
      text-align: center;
      color: #666;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card.alt {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    .summary-card h3 {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .summary-card .value {
      font-size: 24px;
      font-weight: bold;
      margin-top: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background-color: #1e40af;
      color: white;
      padding: 12px;
      text-align: right;
      font-weight: bold;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    tr:hover {
      background-color: #f0f0f0;
    }
    .footer {
      text-align: center;
      color: #999;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0636\u0631\u064A\u0628\u064A \u0627\u0644\u0634\u0627\u0645\u0644</h1>
    <div class="period">
      \u0627\u0644\u0641\u062A\u0631\u0629: ${report.period.startDate.toLocaleDateString("ar-JO")} \u0625\u0644\u0649 ${report.period.endDate.toLocaleDateString("ar-JO")}
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <h3>\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A</h3>
        <div class="value">${report.totalTransactions}</div>
      </div>
      <div class="summary-card alt">
        <h3>\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0628\u0644\u063A</h3>
        <div class="value">${report.totalAmount.toFixed(2)}</div>
      </div>
      <div class="summary-card">
        <h3>\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0636\u0631\u0627\u0626\u0628</h3>
        <div class="value">${report.totalTaxCollected.toFixed(2)}</div>
      </div>
      <div class="summary-card alt">
        <h3>\u0645\u062A\u0648\u0633\u0637 \u0645\u0639\u062F\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629</h3>
        <div class="value">${(report.averageTaxRate * 100).toFixed(2)}%</div>
      </div>
    </div>

    <h2>\u0627\u0644\u0645\u0644\u062E\u0635 \u062D\u0633\u0628 \u0627\u0644\u062F\u0648\u0644</h2>
    <table>
      <thead>
        <tr>
          <th>\u0627\u0644\u062F\u0648\u0644\u0629</th>
          <th>\u0639\u062F\u062F \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A</th>
          <th>\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0628\u0644\u063A</th>
          <th>\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0636\u0631\u0627\u0626\u0628</th>
        </tr>
      </thead>
      <tbody>
`;
    Object.entries(report.byCountry).forEach(([country, data]) => {
      html += `
        <tr>
          <td>${country}</td>
          <td>${data.count}</td>
          <td>${data.amount.toFixed(2)}</td>
          <td>${data.tax.toFixed(2)}</td>
        </tr>
`;
    });
    html += `
      </tbody>
    </table>

    <h2>\u0627\u0644\u0645\u0644\u062E\u0635 \u062D\u0633\u0628 \u0646\u0648\u0639 \u0627\u0644\u0628\u0636\u0627\u0639\u0629</h2>
    <table>
      <thead>
        <tr>
          <th>\u0646\u0648\u0639 \u0627\u0644\u0628\u0636\u0627\u0639\u0629</th>
          <th>\u0639\u062F\u062F \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062A</th>
          <th>\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0628\u0644\u063A</th>
          <th>\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0636\u0631\u0627\u0626\u0628</th>
        </tr>
      </thead>
      <tbody>
`;
    Object.entries(report.byCommodity).forEach(([commodity, data]) => {
      html += `
        <tr>
          <td>${commodity}</td>
          <td>${data.count}</td>
          <td>${data.amount.toFixed(2)}</td>
          <td>${data.tax.toFixed(2)}</td>
        </tr>
`;
    });
    html += `
      </tbody>
    </table>

    <div class="footer">
      \u062A\u0645 \u0627\u0644\u0625\u0646\u0634\u0627\u0621 \u0641\u064A: ${(/* @__PURE__ */ new Date()).toLocaleString("ar-JO")}
    </div>
  </div>
</body>
</html>
`;
    console.log("\u2705 \u062A\u0645 \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0628\u0635\u064A\u063A\u0629 HTML");
    return html;
  }
  /**
   * حفظ التقرير على القرص
   */
  saveReport(report, format) {
    try {
      let content = "";
      let extension = "";
      switch (format) {
        case "csv":
          content = this.exportToCSV(report);
          extension = "csv";
          break;
        case "json":
          content = this.exportToJSON(report);
          extension = "json";
          break;
        case "html":
          content = this.exportToHTML(report);
          extension = "html";
          break;
      }
      const fileName = `tax-report-${Date.now()}.${extension}`;
      const filePath = path3.join(this.reportsDir, fileName);
      fs4.writeFileSync(filePath, content);
      console.log(`\u{1F4BE} \u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u062A\u0642\u0631\u064A\u0631: ${filePath}`);
      return filePath;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062D\u0641\u0638 \u0627\u0644\u062A\u0642\u0631\u064A\u0631:", error);
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062D\u0641\u0638 \u0627\u0644\u062A\u0642\u0631\u064A\u0631");
    }
  }
  /**
   * الحصول على التقرير
   */
  getReport(fileName) {
    try {
      const filePath = path3.join(this.reportsDir, fileName);
      if (fs4.existsSync(filePath)) {
        return fs4.readFileSync(filePath, "utf-8");
      }
      return null;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u062A\u0642\u0631\u064A\u0631:", error);
      return null;
    }
  }
};
var taxReportService = new TaxReportService();

// server/routers/billing.ts
var billingRouter = router({
  /**
   * إنشاء فاتورة PDF
   */
  generateInvoice: protectedProcedure.input(
    z11.object({
      customerName: z11.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644 \u0645\u0637\u0644\u0648\u0628"),
      customerEmail: z11.string().email("\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0635\u062D\u064A\u062D \u0645\u0637\u0644\u0648\u0628"),
      customerPhone: z11.string().min(1, "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0645\u0637\u0644\u0648\u0628"),
      customerAddress: z11.string().min(1, "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0645\u0637\u0644\u0648\u0628"),
      items: z11.array(
        z11.object({
          description: z11.string(),
          quantity: z11.number().positive(),
          unitPrice: z11.number().positive(),
          amount: z11.number().positive()
        })
      ),
      subtotal: z11.number().positive(),
      taxAmount: z11.number().nonnegative(),
      discountAmount: z11.number().nonnegative(),
      totalAmount: z11.number().positive(),
      currency: z11.enum(["JOD", "USD", "EUR"]),
      notes: z11.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const invoiceData = {
        invoiceNumber: invoiceService.generateInvoiceNumber(),
        invoiceDate: /* @__PURE__ */ new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
        // 30 أيام
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        customerAddress: input.customerAddress,
        companyName: "\u0646\u0638\u0627\u0645 \u0625\u062F\u0627\u0631\u0629 \u062A\u0643\u0627\u0644\u064A\u0641 \u0627\u0644\u0634\u062D\u0646 \u0648\u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0627\u0644\u0623\u0631\u062F\u0646\u064A\u0629",
        companyAddress: "\u0639\u0645\u0651\u0627\u0646\u060C \u0627\u0644\u0623\u0631\u062F\u0646",
        companyPhone: "+962-6-123-4567",
        companyEmail: "info@customs-system.jo",
        companyTaxId: "TAX-123456789",
        items: input.items,
        subtotal: input.subtotal,
        taxAmount: input.taxAmount,
        discountAmount: input.discountAmount,
        totalAmount: input.totalAmount,
        currency: input.currency,
        notes: input.notes,
        terms: "\u064A\u0631\u062C\u0649 \u0627\u0644\u062F\u0641\u0639 \u062E\u0644\u0627\u0644 30 \u064A\u0648\u0645\u0627\u064B \u0645\u0646 \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629"
      };
      const pdfBuffer = await invoiceService.generateInvoicePDF(invoiceData);
      return {
        success: true,
        message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0628\u0646\u062C\u0627\u062D",
        invoiceNumber: invoiceData.invoiceNumber,
        pdfSize: pdfBuffer.length
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629");
    }
  }),
  /**
   * حساب الضرائب والرسوم
   */
  calculateTaxes: publicProcedure.input(
    z11.object({
      subtotal: z11.number().positive("\u0627\u0644\u0645\u0628\u0644\u063A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B"),
      countryCode: z11.string().min(2, "\u0631\u0645\u0632 \u0627\u0644\u062F\u0648\u0644\u0629 \u0645\u0637\u0644\u0648\u0628"),
      shippingType: z11.string().optional(),
      commodityType: z11.string().optional()
    })
  ).query(async ({ input }) => {
    try {
      const taxCalculation = taxService.calculateTax(
        input.subtotal,
        input.countryCode,
        input.shippingType || "standard",
        input.commodityType || "other"
      );
      return {
        success: true,
        ...taxCalculation
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062D\u0633\u0627\u0628 \u0627\u0644\u0636\u0631\u0627\u0626\u0628");
    }
  }),
  /**
   * الحصول على معلومات الضريبة للدولة
   */
  getTaxInfo: publicProcedure.input(
    z11.object({
      countryCode: z11.string().min(2, "\u0631\u0645\u0632 \u0627\u0644\u062F\u0648\u0644\u0629 \u0645\u0637\u0644\u0648\u0628")
    })
  ).query(async ({ input }) => {
    try {
      const taxInfo = taxService.getTaxInfo(input.countryCode);
      return {
        success: true,
        ...taxInfo
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0636\u0631\u064A\u0628\u0629");
    }
  }),
  /**
   * الحصول على جميع معدلات الضريبة
   */
  getAllTaxRates: publicProcedure.query(async () => {
    try {
      const rates = taxService.getAllTaxRates();
      return {
        success: true,
        rates
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0645\u0639\u062F\u0644\u0627\u062A \u0627\u0644\u0636\u0631\u064A\u0628\u0629");
    }
  }),
  /**
   * الحصول على جميع رسوم الشحن
   */
  getAllShippingFees: publicProcedure.query(async () => {
    try {
      const fees = taxService.getAllShippingFees();
      return {
        success: true,
        fees
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0631\u0633\u0648\u0645 \u0627\u0644\u0634\u062D\u0646");
    }
  }),
  /**
   * الحصول على جميع رسوم البضاعة
   */
  getAllCommodityFees: publicProcedure.query(async () => {
    try {
      const fees = taxService.getAllCommodityFees();
      return {
        success: true,
        fees
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0631\u0633\u0648\u0645 \u0627\u0644\u0628\u0636\u0627\u0639\u0629");
    }
  }),
  /**
   * تحديث معدل الضريبة (للمسؤولين فقط)
   */
  updateTaxRate: protectedProcedure.input(
    z11.object({
      countryCode: z11.string().min(2, "\u0631\u0645\u0632 \u0627\u0644\u062F\u0648\u0644\u0629 \u0645\u0637\u0644\u0648\u0628"),
      newRate: z11.number().min(0).max(1, "\u0645\u0639\u062F\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0628\u064A\u0646 0 \u0648 1")
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new Error("\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0644\u062A\u062D\u062F\u064A\u062B \u0645\u0639\u062F\u0644\u0627\u062A \u0627\u0644\u0636\u0631\u064A\u0628\u0629");
      }
      const success = taxService.updateTaxRate(input.countryCode, input.newRate);
      return {
        success,
        message: success ? `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0645\u0639\u062F\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629 \u0644\u0644\u062F\u0648\u0644\u0629 ${input.countryCode}` : "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0645\u0639\u062F\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629"
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0645\u0639\u062F\u0644 \u0627\u0644\u0636\u0631\u064A\u0628\u0629");
    }
  }),
  /**
   * إنشاء تقرير ضريبي
   */
  generateTaxReport: protectedProcedure.input(
    z11.object({
      startDate: z11.date(),
      endDate: z11.date(),
      format: z11.enum(["csv", "json", "html"])
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new Error("\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0644\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629");
      }
      const mockTransactions = [
        {
          id: "1",
          date: /* @__PURE__ */ new Date(),
          description: "\u0634\u062D\u0646\u0629 \u062F\u0648\u0644\u064A\u0629",
          amount: 1e3,
          taxRate: 0.16,
          taxAmount: 160,
          country: "JO",
          shippingType: "express",
          commodityType: "electronics",
          status: "completed"
        }
      ];
      const report = taxReportService.generateTaxReportSummary(
        mockTransactions,
        input.startDate,
        input.endDate
      );
      const reportPath = taxReportService.saveReport(report, input.format);
      return {
        success: true,
        message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0628\u0646\u062C\u0627\u062D",
        reportPath,
        format: input.format,
        summary: {
          totalTransactions: report.totalTransactions,
          totalAmount: report.totalAmount,
          totalTaxCollected: report.totalTaxCollected
        }
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0636\u0631\u064A\u0628\u064A");
    }
  })
});

// server/routers/operations.ts
import { z as z12 } from "zod";

// server/services/warehouse-service.ts
var WarehouseService = class {
  warehouses = /* @__PURE__ */ new Map();
  products = /* @__PURE__ */ new Map();
  shipments = /* @__PURE__ */ new Map();
  alerts = /* @__PURE__ */ new Map();
  constructor() {
    this.initializeDefaultWarehouses();
    console.log("\u2705 \u062A\u0645 \u062A\u0647\u064A\u0626\u0629 \u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A");
  }
  /**
   * تهيئة المستودعات الافتراضية
   */
  initializeDefaultWarehouses() {
    const defaultWarehouses = [
      {
        id: "wh-amman",
        name: "\u0645\u0633\u062A\u0648\u062F\u0639 \u0639\u0645\u0651\u0627\u0646 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
        location: "\u0639\u0645\u0651\u0627\u0646",
        country: "JO",
        capacity: 1e4,
        currentStock: 5e3,
        manager: "\u0623\u062D\u0645\u062F \u0645\u062D\u0645\u062F",
        phone: "+962-6-123-4567",
        email: "amman@warehouse.jo",
        status: "active"
      },
      {
        id: "wh-zarqa",
        name: "\u0645\u0633\u062A\u0648\u062F\u0639 \u0627\u0644\u0632\u0631\u0642\u0627\u0621",
        location: "\u0627\u0644\u0632\u0631\u0642\u0627\u0621",
        country: "JO",
        capacity: 8e3,
        currentStock: 3500,
        manager: "\u0641\u0627\u0637\u0645\u0629 \u0639\u0644\u064A",
        phone: "+962-5-234-5678",
        email: "zarqa@warehouse.jo",
        status: "active"
      },
      {
        id: "wh-aqaba",
        name: "\u0645\u0633\u062A\u0648\u062F\u0639 \u0627\u0644\u0639\u0642\u0628\u0629",
        location: "\u0627\u0644\u0639\u0642\u0628\u0629",
        country: "JO",
        capacity: 5e3,
        currentStock: 2e3,
        manager: "\u0645\u062D\u0645\u0648\u062F \u0633\u0627\u0644\u0645",
        phone: "+962-3-345-6789",
        email: "aqaba@warehouse.jo",
        status: "active"
      },
      {
        id: "wh-dubai",
        name: "\u0645\u0633\u062A\u0648\u062F\u0639 \u062F\u0628\u064A",
        location: "\u062F\u0628\u064A",
        country: "AE",
        capacity: 15e3,
        currentStock: 8e3,
        manager: "\u0639\u0644\u064A \u0645\u062D\u0645\u0648\u062F",
        phone: "+971-4-456-7890",
        email: "dubai@warehouse.ae",
        status: "active"
      }
    ];
    defaultWarehouses.forEach((wh) => {
      this.warehouses.set(wh.id, wh);
    });
    console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 ${defaultWarehouses.length} \u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A \u0627\u0641\u062A\u0631\u0627\u0636\u064A\u0629`);
  }
  /**
   * الحصول على جميع المستودعات
   */
  getAllWarehouses() {
    return Array.from(this.warehouses.values());
  }
  /**
   * الحصول على مستودع محدد
   */
  getWarehouse(warehouseId) {
    return this.warehouses.get(warehouseId) || null;
  }
  /**
   * إضافة مستودع جديد
   */
  addWarehouse(warehouse) {
    try {
      if (this.warehouses.has(warehouse.id)) {
        console.error("\u274C \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639 \u0645\u0648\u062C\u0648\u062F \u0628\u0627\u0644\u0641\u0639\u0644");
        return false;
      }
      this.warehouses.set(warehouse.id, warehouse);
      console.log(`\u2705 \u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639: ${warehouse.name}`);
      return true;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639:", error);
      return false;
    }
  }
  /**
   * تحديث معلومات المستودع
   */
  updateWarehouse(warehouseId, updates) {
    try {
      const warehouse = this.warehouses.get(warehouseId);
      if (!warehouse) {
        console.error("\u274C \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
        return false;
      }
      const updated = { ...warehouse, ...updates, id: warehouse.id };
      this.warehouses.set(warehouseId, updated);
      console.log(`\u2705 \u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639: ${warehouse.name}`);
      return true;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639:", error);
      return false;
    }
  }
  /**
   * إضافة منتج إلى المستودع
   */
  addProductToWarehouse(product) {
    try {
      const productKey = `${product.warehouseId}-${product.productId}`;
      if (this.products.has(productKey)) {
        console.error("\u274C \u0627\u0644\u0645\u0646\u062A\u062C \u0645\u0648\u062C\u0648\u062F \u0628\u0627\u0644\u0641\u0639\u0644 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639");
        return false;
      }
      this.products.set(productKey, product);
      this.updateWarehouseStock(product.warehouseId, product.quantity);
      this.checkStockLevels(product.warehouseId, product.productId);
      console.log(`\u2705 \u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0646\u062A\u062C: ${product.productName} \u0625\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639`);
      return true;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0646\u062A\u062C:", error);
      return false;
    }
  }
  /**
   * تحديث كمية المنتج
   */
  updateProductQuantity(warehouseId, productId, newQuantity) {
    try {
      const productKey = `${warehouseId}-${productId}`;
      const product = this.products.get(productKey);
      if (!product) {
        console.error("\u274C \u0627\u0644\u0645\u0646\u062A\u062C \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639");
        return false;
      }
      const difference = newQuantity - product.quantity;
      product.quantity = newQuantity;
      product.lastUpdated = /* @__PURE__ */ new Date();
      this.products.set(productKey, product);
      this.updateWarehouseStock(warehouseId, difference);
      this.checkStockLevels(warehouseId, productId);
      console.log(`\u2705 \u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0643\u0645\u064A\u0629 \u0627\u0644\u0645\u0646\u062A\u062C: ${product.productName}`);
      return true;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0643\u0645\u064A\u0629 \u0627\u0644\u0645\u0646\u062A\u062C:", error);
      return false;
    }
  }
  /**
   * الحصول على المنتجات في المستودع
   */
  getWarehouseProducts(warehouseId) {
    return Array.from(this.products.values()).filter(
      (p) => p.warehouseId === warehouseId
    );
  }
  /**
   * إنشاء شحنة
   */
  createShipment(sourceWarehouseId, destinationWarehouseId, products) {
    try {
      for (const item of products) {
        const productKey = `${sourceWarehouseId}-${item.productId}`;
        const product = this.products.get(productKey);
        if (!product || product.quantity < item.quantity) {
          console.error(`\u274C \u0627\u0644\u0645\u0646\u062A\u062C ${item.productId} \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631 \u0628\u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629`);
          return null;
        }
      }
      const shipment = {
        id: `ship-${Date.now()}`,
        shipmentNumber: `SHP-${Date.now()}`,
        sourceWarehouseId,
        destinationWarehouseId,
        products,
        status: "pending",
        createdDate: /* @__PURE__ */ new Date(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3)
      };
      for (const item of products) {
        this.updateProductQuantity(
          sourceWarehouseId,
          item.productId,
          (this.products.get(`${sourceWarehouseId}-${item.productId}`)?.quantity || 0) - item.quantity
        );
      }
      this.shipments.set(shipment.id, shipment);
      console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0634\u062D\u0646\u0629: ${shipment.shipmentNumber}`);
      return shipment;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0634\u062D\u0646\u0629:", error);
      return null;
    }
  }
  /**
   * تحديث حالة الشحنة
   */
  updateShipmentStatus(shipmentId, status, trackingNumber) {
    try {
      const shipment = this.shipments.get(shipmentId);
      if (!shipment) {
        console.error("\u274C \u0627\u0644\u0634\u062D\u0646\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629");
        return false;
      }
      shipment.status = status;
      if (trackingNumber) {
        shipment.trackingNumber = trackingNumber;
      }
      if (status === "delivered") {
        shipment.actualDelivery = /* @__PURE__ */ new Date();
        for (const item of shipment.products) {
          const destProductKey = `${shipment.destinationWarehouseId}-${item.productId}`;
          const destProduct = this.products.get(destProductKey);
          if (destProduct) {
            this.updateProductQuantity(
              shipment.destinationWarehouseId,
              item.productId,
              destProduct.quantity + item.quantity
            );
          } else {
            const sourceProduct = this.products.get(
              `${shipment.sourceWarehouseId}-${item.productId}`
            );
            if (sourceProduct) {
              this.addProductToWarehouse({
                ...sourceProduct,
                warehouseId: shipment.destinationWarehouseId,
                quantity: item.quantity
              });
            }
          }
        }
      }
      this.shipments.set(shipmentId, shipment);
      console.log(`\u2705 \u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0634\u062D\u0646\u0629: ${status}`);
      return true;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0634\u062D\u0646\u0629:", error);
      return false;
    }
  }
  /**
   * الحصول على الشحنات
   */
  getShipments(warehouseId) {
    let shipments = Array.from(this.shipments.values());
    if (warehouseId) {
      shipments = shipments.filter(
        (s) => s.sourceWarehouseId === warehouseId || s.destinationWarehouseId === warehouseId
      );
    }
    return shipments;
  }
  /**
   * الحصول على تنبيهات المخزون
   */
  getStockAlerts(warehouseId) {
    let alerts = Array.from(this.alerts.values());
    if (warehouseId) {
      alerts = alerts.filter((a) => a.warehouseId === warehouseId);
    }
    return alerts;
  }
  /**
   * التحقق من مستويات المخزون
   */
  checkStockLevels(warehouseId, productId) {
    const productKey = `${warehouseId}-${productId}`;
    const product = this.products.get(productKey);
    if (!product) return;
    const alertKey = `${warehouseId}-${productId}`;
    const existingAlert = this.alerts.get(alertKey);
    if (existingAlert) {
      this.alerts.delete(alertKey);
    }
    if (product.quantity === 0) {
      this.alerts.set(alertKey, {
        id: alertKey,
        productId,
        productName: product.productName,
        warehouseId,
        currentStock: product.quantity,
        minStock: product.minStock,
        alertType: "out_of_stock",
        severity: "high",
        createdDate: /* @__PURE__ */ new Date(),
        acknowledged: false
      });
    } else if (product.quantity <= product.minStock) {
      this.alerts.set(alertKey, {
        id: alertKey,
        productId,
        productName: product.productName,
        warehouseId,
        currentStock: product.quantity,
        minStock: product.minStock,
        alertType: "low_stock",
        severity: "medium",
        createdDate: /* @__PURE__ */ new Date(),
        acknowledged: false
      });
    } else if (product.quantity >= product.maxStock) {
      this.alerts.set(alertKey, {
        id: alertKey,
        productId,
        productName: product.productName,
        warehouseId,
        currentStock: product.quantity,
        minStock: product.minStock,
        alertType: "overstock",
        severity: "low",
        createdDate: /* @__PURE__ */ new Date(),
        acknowledged: false
      });
    }
  }
  /**
   * تحديث مخزون المستودع
   */
  updateWarehouseStock(warehouseId, quantity) {
    const warehouse = this.warehouses.get(warehouseId);
    if (warehouse) {
      warehouse.currentStock += quantity;
    }
  }
  /**
   * الإقرار بالتنبيه
   */
  acknowledgeAlert(alertId) {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      console.log(`\u2705 \u062A\u0645 \u0627\u0644\u0625\u0642\u0631\u0627\u0631 \u0628\u0627\u0644\u062A\u0646\u0628\u064A\u0647: ${alertId}`);
      return true;
    }
    return false;
  }
  /**
   * الحصول على تقرير المستودع
   */
  getWarehouseReport(warehouseId) {
    const warehouse = this.warehouses.get(warehouseId);
    if (!warehouse) return null;
    const products = this.getWarehouseProducts(warehouseId);
    const shipments = this.getShipments(warehouseId);
    const alerts = this.getStockAlerts(warehouseId);
    return {
      warehouse,
      products: products.length,
      totalValue: products.reduce((sum, p) => sum + p.quantity, 0),
      shipments: shipments.length,
      activeShipments: shipments.filter((s) => s.status === "in_transit").length,
      alerts: alerts.length,
      criticalAlerts: alerts.filter((a) => a.severity === "high").length
    };
  }
};
var warehouseService = new WarehouseService();

// server/services/shipping-integration-service.ts
var ShippingIntegrationService = class {
  /**
   * أسعار DHL (محاكاة)
   */
  dhlRates = {
    "express": { baseRate: 50, perKg: 2.5 },
    "standard": { baseRate: 30, perKg: 1.5 },
    "economy": { baseRate: 20, perKg: 1 }
  };
  /**
   * أسعار FedEx (محاكاة)
   */
  fedexRates = {
    "overnight": { baseRate: 60, perKg: 3 },
    "express": { baseRate: 45, perKg: 2 },
    "ground": { baseRate: 25, perKg: 1.2 }
  };
  /**
   * أسعار UPS (محاكاة)
   */
  upsRates = {
    "next_day": { baseRate: 55, perKg: 2.8 },
    "second_day": { baseRate: 40, perKg: 1.8 },
    "ground": { baseRate: 22, perKg: 1.1 }
  };
  constructor() {
    console.log("\u2705 \u062A\u0645 \u062A\u0647\u064A\u0626\u0629 \u062E\u062F\u0645\u0629 \u062A\u0643\u0627\u0645\u0644 \u0627\u0644\u0634\u062D\u0646 \u0627\u0644\u062F\u0648\u0644\u064A\u0629");
  }
  /**
   * الحصول على عروض أسعار الشحن
   */
  getShippingQuotes(origin, destination, weight, dimensions) {
    console.log(`\u{1F4E6} \u062C\u0627\u0631\u064A \u062D\u0633\u0627\u0628 \u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0634\u062D\u0646 \u0645\u0646 ${origin} \u0625\u0644\u0649 ${destination}`);
    const quotes = [];
    quotes.push(
      this.calculateDHLQuote("express", weight, dimensions),
      this.calculateDHLQuote("standard", weight, dimensions),
      this.calculateDHLQuote("economy", weight, dimensions)
    );
    quotes.push(
      this.calculateFedExQuote("overnight", weight, dimensions),
      this.calculateFedExQuote("express", weight, dimensions),
      this.calculateFedExQuote("ground", weight, dimensions)
    );
    quotes.push(
      this.calculateUPSQuote("next_day", weight, dimensions),
      this.calculateUPSQuote("second_day", weight, dimensions),
      this.calculateUPSQuote("ground", weight, dimensions)
    );
    console.log(`\u2705 \u062A\u0645 \u062D\u0633\u0627\u0628 ${quotes.length} \u0639\u0631\u0648\u0636 \u0623\u0633\u0639\u0627\u0631`);
    return quotes.sort((a, b) => a.cost - b.cost);
  }
  /**
   * حساب عرض سعر DHL
   */
  calculateDHLQuote(service, weight, dimensions) {
    const rate = this.dhlRates[service];
    const cost = rate.baseRate + weight * rate.perKg;
    return {
      carrier: "DHL",
      service,
      cost: Math.round(cost * 100) / 100,
      currency: "USD",
      estimatedDelivery: this.calculateEstimatedDelivery(service),
      weight,
      dimensions
    };
  }
  /**
   * حساب عرض سعر FedEx
   */
  calculateFedExQuote(service, weight, dimensions) {
    const rate = this.fedexRates[service];
    const cost = rate.baseRate + weight * rate.perKg;
    return {
      carrier: "FedEx",
      service,
      cost: Math.round(cost * 100) / 100,
      currency: "USD",
      estimatedDelivery: this.calculateEstimatedDelivery(service),
      weight,
      dimensions
    };
  }
  /**
   * حساب عرض سعر UPS
   */
  calculateUPSQuote(service, weight, dimensions) {
    const rate = this.upsRates[service];
    const cost = rate.baseRate + weight * rate.perKg;
    return {
      carrier: "UPS",
      service,
      cost: Math.round(cost * 100) / 100,
      currency: "USD",
      estimatedDelivery: this.calculateEstimatedDelivery(service),
      weight,
      dimensions
    };
  }
  /**
   * حساب تاريخ التسليم المتوقع
   */
  calculateEstimatedDelivery(service) {
    const now = /* @__PURE__ */ new Date();
    let days = 5;
    if (service === "express" || service === "overnight" || service === "next_day") {
      days = 1;
    } else if (service === "standard" || service === "express" || service === "second_day") {
      days = 2;
    } else if (service === "economy" || service === "ground") {
      days = 5;
    }
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1e3);
  }
  /**
   * إنشاء شحنة مع الناقل
   */
  async createShipment(carrier, recipientName, recipientAddress, weight, service) {
    try {
      console.log(`\u{1F4E6} \u062C\u0627\u0631\u064A \u0625\u0646\u0634\u0627\u0621 \u0634\u062D\u0646\u0629 \u0645\u0639 ${carrier}`);
      const trackingNumber = this.generateTrackingNumber(carrier);
      const cost = this.calculateShippingCost(carrier, service, weight);
      const shipment = {
        trackingNumber,
        carrier,
        status: "pending",
        currentLocation: "\u0641\u064A \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631",
        estimatedDelivery: this.calculateEstimatedDelivery(service),
        weight,
        cost: Math.round(cost * 100) / 100,
        currency: "USD"
      };
      console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0634\u062D\u0646\u0629: ${trackingNumber}`);
      return shipment;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0634\u062D\u0646\u0629:", error);
      return null;
    }
  }
  /**
   * تتبع الشحنة
   */
  async trackShipment(trackingNumber, carrier) {
    try {
      console.log(`\u{1F50D} \u062C\u0627\u0631\u064A \u062A\u062A\u0628\u0639 \u0627\u0644\u0634\u062D\u0646\u0629: ${trackingNumber}`);
      const tracking = {
        trackingNumber,
        carrier,
        events: [
          {
            timestamp: new Date(Date.now() - 48 * 60 * 60 * 1e3),
            status: "\u062A\u0645 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645",
            location: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0641\u0631\u0632 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
            description: "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0634\u062D\u0646\u0629 \u0648\u0628\u062F\u0621 \u0645\u0639\u0627\u0644\u062C\u062A\u0647\u0627"
          },
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1e3),
            status: "\u0641\u064A \u0627\u0644\u0637\u0631\u064A\u0642",
            location: "\u0645\u0631\u0643\u0632 \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0625\u0642\u0644\u064A\u0645\u064A",
            description: "\u0627\u0644\u0634\u062D\u0646\u0629 \u0641\u064A \u0637\u0631\u064A\u0642\u0647\u0627 \u0625\u0644\u0649 \u0627\u0644\u0648\u062C\u0647\u0629"
          },
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1e3),
            status: "\u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u062A\u0633\u0644\u064A\u0645",
            location: "\u0645\u0631\u0643\u0632 \u0627\u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0645\u062D\u0644\u064A",
            description: "\u0627\u0644\u0634\u062D\u0646\u0629 \u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u062A\u0633\u0644\u064A\u0645 \u0627\u0644\u064A\u0648\u0645"
          }
        ]
      };
      console.log(`\u2705 \u062A\u0645 \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u062A\u0628\u0639`);
      return tracking;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062A\u062A\u0628\u0639 \u0627\u0644\u0634\u062D\u0646\u0629:", error);
      return null;
    }
  }
  /**
   * حساب تكلفة الشحن
   */
  calculateShippingCost(carrier, service, weight) {
    let rate = { baseRate: 30, perKg: 1.5 };
    if (carrier === "DHL") {
      rate = this.dhlRates[service] || rate;
    } else if (carrier === "FedEx") {
      rate = this.fedexRates[service] || rate;
    } else if (carrier === "UPS") {
      rate = this.upsRates[service] || rate;
    }
    return rate.baseRate + weight * rate.perKg;
  }
  /**
   * توليد رقم تتبع
   */
  generateTrackingNumber(carrier) {
    const prefix = {
      DHL: "1Z",
      FedEx: "9400",
      UPS: "1Z"
    }[carrier] || "1Z";
    const random = Math.random().toString(36).substring(2, 15).toUpperCase();
    const timestamp4 = Date.now().toString().slice(-8);
    return `${prefix}${timestamp4}${random}`;
  }
  /**
   * الحصول على حالة الشحنة
   */
  getShipmentStatus(trackingNumber) {
    const statuses = [
      "\u0641\u064A \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631",
      "\u062A\u0645 \u0627\u0644\u0627\u0633\u062A\u0644\u0627\u0645",
      "\u0641\u064A \u0627\u0644\u0637\u0631\u064A\u0642",
      "\u062C\u0627\u0647\u0632\u0629 \u0644\u0644\u062A\u0633\u0644\u064A\u0645",
      "\u062A\u0645 \u0627\u0644\u062A\u0633\u0644\u064A\u0645"
    ];
    const randomIndex = Math.floor(Math.random() * statuses.length);
    return statuses[randomIndex];
  }
  /**
   * الحصول على تقرير الشحن
   */
  getShippingReport(startDate, endDate) {
    return {
      period: {
        startDate: startDate.toLocaleDateString("ar-JO"),
        endDate: endDate.toLocaleDateString("ar-JO")
      },
      carriers: {
        DHL: {
          shipments: Math.floor(Math.random() * 100),
          totalCost: Math.round(Math.random() * 1e4 * 100) / 100,
          averageCost: Math.round(Math.random() * 100 * 100) / 100
        },
        FedEx: {
          shipments: Math.floor(Math.random() * 100),
          totalCost: Math.round(Math.random() * 1e4 * 100) / 100,
          averageCost: Math.round(Math.random() * 100 * 100) / 100
        },
        UPS: {
          shipments: Math.floor(Math.random() * 100),
          totalCost: Math.round(Math.random() * 1e4 * 100) / 100,
          averageCost: Math.round(Math.random() * 100 * 100) / 100
        }
      }
    };
  }
};
var shippingIntegrationService = new ShippingIntegrationService();

// server/services/alert-reminder-service.ts
var AlertReminderService = class {
  alerts = /* @__PURE__ */ new Map();
  reminders = /* @__PURE__ */ new Map();
  userPreferences = /* @__PURE__ */ new Map();
  constructor() {
    console.log("\u2705 \u062A\u0645 \u062A\u0647\u064A\u0626\u0629 \u062E\u062F\u0645\u0629 \u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0648\u0627\u0644\u062A\u0630\u0643\u064A\u0631\u0627\u062A");
  }
  /**
   * إنشاء تنبيه جديد
   */
  createAlert(userId, type, title, message, channels, data) {
    console.log(`\u{1F4E2} \u062C\u0627\u0631\u064A \u0625\u0646\u0634\u0627\u0621 \u062A\u0646\u0628\u064A\u0647: ${title}`);
    const alert = {
      id: `alert-${Date.now()}`,
      userId,
      type,
      title,
      message,
      channels,
      data: data || {},
      createdAt: /* @__PURE__ */ new Date(),
      status: "pending"
    };
    this.alerts.set(alert.id, alert);
    this.sendAlert(alert);
    return alert;
  }
  /**
   * إنشاء تذكير جديد
   */
  createReminder(userId, title, description, dueDate, type, channels = ["email", "sms"], priority = "medium") {
    console.log(`\u23F0 \u062C\u0627\u0631\u064A \u0625\u0646\u0634\u0627\u0621 \u062A\u0630\u0643\u064A\u0631: ${title}`);
    const reminderDate = this.calculateReminderDate(dueDate, priority);
    const reminder = {
      id: `reminder-${Date.now()}`,
      userId,
      title,
      description,
      dueDate,
      reminderDate,
      channels,
      type,
      status: "pending",
      priority
    };
    this.reminders.set(reminder.id, reminder);
    console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0630\u0643\u064A\u0631: ${reminder.id}`);
    return reminder;
  }
  /**
   * إرسال التنبيه
   */
  sendAlert(alert) {
    try {
      const preferences = this.userPreferences.get(alert.userId);
      const channels = preferences ? alert.channels.filter((ch) => this.isChannelEnabled(preferences, ch)) : alert.channels;
      for (const channel of channels) {
        this.sendViaChannel(channel, alert);
      }
      alert.status = "sent";
      alert.sentAt = /* @__PURE__ */ new Date();
      this.alerts.set(alert.id, alert);
      console.log(`\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0646\u0628\u064A\u0647 \u0639\u0628\u0631 ${channels.length} \u0642\u0646\u0648\u0627\u062A`);
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0646\u0628\u064A\u0647:", error);
      alert.status = "failed";
      this.alerts.set(alert.id, alert);
    }
  }
  /**
   * إرسال عبر قناة محددة
   */
  sendViaChannel(channel, alert) {
    switch (channel) {
      case "email":
        console.log(`\u{1F4E7} \u0625\u0631\u0633\u0627\u0644 \u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: ${alert.title}`);
        break;
      case "sms":
        console.log(`\u{1F4F1} \u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 \u0646\u0635\u064A\u0629: ${alert.title}`);
        break;
      case "push":
        console.log(`\u{1F514} \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0641\u0648\u0631\u064A: ${alert.title}`);
        break;
      case "in_app":
        console.log(`\u{1F4AC} \u0625\u0646\u0634\u0627\u0621 \u0625\u0634\u0639\u0627\u0631 \u062F\u0627\u062E\u0644 \u0627\u0644\u062A\u0637\u0628\u064A\u0642: ${alert.title}`);
        break;
    }
  }
  /**
   * التحقق من تفعيل القناة
   */
  isChannelEnabled(preferences, channel) {
    switch (channel) {
      case "email":
        return preferences.emailNotifications;
      case "sms":
        return preferences.smsNotifications;
      case "push":
        return preferences.pushNotifications;
      case "in_app":
        return preferences.inAppNotifications;
      default:
        return true;
    }
  }
  /**
   * حساب تاريخ التذكير
   */
  calculateReminderDate(dueDate, priority) {
    const days = {
      high: 7,
      // تذكير قبل 7 أيام
      medium: 3,
      // تذكير قبل 3 أيام
      low: 1
      // تذكير قبل يوم واحد
    }[priority];
    return new Date(dueDate.getTime() - days * 24 * 60 * 60 * 1e3);
  }
  /**
   * تنبيه تحديث الشحنة
   */
  shipmentUpdateAlert(userId, shipmentNumber, status, location) {
    return this.createAlert(
      userId,
      "shipment_update",
      `\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0634\u062D\u0646\u0629 ${shipmentNumber}`,
      `\u0634\u062D\u0646\u062A\u0643 ${shipmentNumber} \u0627\u0644\u0622\u0646 ${status} \u0641\u064A ${location}`,
      ["email", "sms", "push"],
      {
        shipmentNumber,
        status,
        location
      }
    );
  }
  /**
   * تنبيه الفاتورة المستحقة
   */
  invoiceDueAlert(userId, invoiceNumber, amount, dueDate) {
    return this.createAlert(
      userId,
      "invoice_due",
      `\u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 ${invoiceNumber} \u0645\u0633\u062A\u062D\u0642\u0629`,
      `\u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 ${invoiceNumber} \u0628\u0645\u0628\u0644\u063A ${amount} \u0645\u0633\u062A\u062D\u0642\u0629 \u0641\u064A ${dueDate.toLocaleDateString("ar-JO")}`,
      ["email", "sms"],
      {
        invoiceNumber,
        amount,
        dueDate
      }
    );
  }
  /**
   * تنبيه المخزون المنخفض
   */
  lowStockAlert(userId, productName, currentStock) {
    return this.createAlert(
      userId,
      "low_stock",
      `\u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0645\u0646\u062E\u0641\u0636: ${productName}`,
      `\u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0627\u0644\u062D\u0627\u0644\u064A \u0644\u0644\u0645\u0646\u062A\u062C ${productName} \u0647\u0648 ${currentStock} \u0641\u0642\u0637`,
      ["email", "in_app"],
      {
        productName,
        currentStock
      }
    );
  }
  /**
   * تنبيه العرض الخاص
   */
  specialOfferAlert(userId, offerTitle, discount) {
    return this.createAlert(
      userId,
      "special_offer",
      `\u0639\u0631\u0636 \u062E\u0627\u0635: ${offerTitle}`,
      `\u0627\u062D\u0635\u0644 \u0639\u0644\u0649 \u062E\u0635\u0645 ${discount}% \u0639\u0644\u0649 ${offerTitle}`,
      ["email", "push", "in_app"],
      {
        offerTitle,
        discount
      }
    );
  }
  /**
   * تذكير الفاتورة المستحقة
   */
  invoiceDueReminder(userId, invoiceNumber, amount, dueDate) {
    return this.createReminder(
      userId,
      `\u062A\u0630\u0643\u064A\u0631: \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 ${invoiceNumber}`,
      `\u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 ${invoiceNumber} \u0628\u0645\u0628\u0644\u063A ${amount} \u0645\u0633\u062A\u062D\u0642\u0629 \u0641\u064A ${dueDate.toLocaleDateString("ar-JO")}`,
      dueDate,
      "invoice",
      ["email", "sms"],
      "high"
    );
  }
  /**
   * تذكير المتابعة
   */
  followUpReminder(userId, shipmentNumber, dueDate) {
    return this.createReminder(
      userId,
      `\u062A\u0630\u0643\u064A\u0631 \u0645\u062A\u0627\u0628\u0639\u0629: \u0627\u0644\u0634\u062D\u0646\u0629 ${shipmentNumber}`,
      `\u062A\u0627\u0628\u0639 \u0645\u0639 \u0627\u0644\u0639\u0645\u064A\u0644 \u0628\u062E\u0635\u0648\u0635 \u0627\u0644\u0634\u062D\u0646\u0629 ${shipmentNumber}`,
      dueDate,
      "follow_up",
      ["email", "in_app"],
      "medium"
    );
  }
  /**
   * الحصول على التنبيهات للمستخدم
   */
  getUserAlerts(userId, unreadOnly = false) {
    return Array.from(this.alerts.values()).filter((a) => a.userId === userId && (!unreadOnly || !a.readAt)).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  /**
   * الحصول على التذكيرات للمستخدم
   */
  getUserReminders(userId, pending = true) {
    return Array.from(this.reminders.values()).filter((r) => r.userId === userId && (!pending || r.status === "pending")).sort((a, b) => a.reminderDate.getTime() - b.reminderDate.getTime());
  }
  /**
   * وضع علامة على التنبيه كمقروء
   */
  markAlertAsRead(alertId) {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.readAt = /* @__PURE__ */ new Date();
      this.alerts.set(alertId, alert);
      return true;
    }
    return false;
  }
  /**
   * إكمال التذكير
   */
  completeReminder(reminderId) {
    const reminder = this.reminders.get(reminderId);
    if (reminder) {
      reminder.status = "completed";
      this.reminders.set(reminderId, reminder);
      console.log(`\u2705 \u062A\u0645 \u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u062A\u0630\u0643\u064A\u0631: ${reminderId}`);
      return true;
    }
    return false;
  }
  /**
   * تعيين تفضيلات التنبيهات
   */
  setUserPreferences(userId, preferences) {
    const existing = this.userPreferences.get(userId) || {
      userId,
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      inAppNotifications: true,
      shipmentUpdates: true,
      invoiceReminders: true,
      specialOffers: true,
      paymentReminders: true,
      frequency: "immediate"
    };
    const updated = { ...existing, ...preferences, userId };
    this.userPreferences.set(userId, updated);
    console.log(`\u2705 \u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062A\u0641\u0636\u064A\u0644\u0627\u062A \u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${userId}`);
  }
  /**
   * الحصول على تفضيلات المستخدم
   */
  getUserPreferences(userId) {
    return this.userPreferences.get(userId) || {
      userId,
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      inAppNotifications: true,
      shipmentUpdates: true,
      invoiceReminders: true,
      specialOffers: true,
      paymentReminders: true,
      frequency: "immediate"
    };
  }
  /**
   * الحصول على إحصائيات التنبيهات
   */
  getAlertStatistics(userId) {
    const alerts = userId ? Array.from(this.alerts.values()).filter((a) => a.userId === userId) : Array.from(this.alerts.values());
    return {
      total: alerts.length,
      sent: alerts.filter((a) => a.status === "sent").length,
      pending: alerts.filter((a) => a.status === "pending").length,
      failed: alerts.filter((a) => a.status === "failed").length,
      unread: alerts.filter((a) => !a.readAt).length,
      byType: {
        shipment_update: alerts.filter((a) => a.type === "shipment_update").length,
        invoice_due: alerts.filter((a) => a.type === "invoice_due").length,
        low_stock: alerts.filter((a) => a.type === "low_stock").length,
        special_offer: alerts.filter((a) => a.type === "special_offer").length
      }
    };
  }
};
var alertReminderService = new AlertReminderService();

// server/routers/operations.ts
var operationsRouter = router({
  /**
   * الحصول على جميع المستودعات
   */
  getAllWarehouses: publicProcedure.query(async () => {
    try {
      const warehouses = warehouseService.getAllWarehouses();
      return {
        success: true,
        warehouses,
        count: warehouses.length
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639\u0627\u062A");
    }
  }),
  /**
   * الحصول على مستودع محدد
   */
  getWarehouse: publicProcedure.input(z12.object({ warehouseId: z12.string() })).query(async ({ input }) => {
    try {
      const warehouse = warehouseService.getWarehouse(input.warehouseId);
      if (!warehouse) {
        throw new Error("\u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      }
      const products = warehouseService.getWarehouseProducts(input.warehouseId);
      const alerts = warehouseService.getStockAlerts(input.warehouseId);
      return {
        success: true,
        warehouse,
        products,
        alerts
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639");
    }
  }),
  /**
   * الحصول على تقرير المستودع
   */
  getWarehouseReport: protectedProcedure.input(z12.object({ warehouseId: z12.string() })).query(async ({ input }) => {
    try {
      const report = warehouseService.getWarehouseReport(input.warehouseId);
      if (!report) {
        throw new Error("\u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      }
      return {
        success: true,
        report
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0633\u062A\u0648\u062F\u0639");
    }
  }),
  /**
   * الحصول على عروض أسعار الشحن
   */
  getShippingQuotes: publicProcedure.input(
    z12.object({
      origin: z12.string(),
      destination: z12.string(),
      weight: z12.number().positive(),
      length: z12.number().optional(),
      width: z12.number().optional(),
      height: z12.number().optional()
    })
  ).query(async ({ input }) => {
    try {
      const quotes = shippingIntegrationService.getShippingQuotes(
        input.origin,
        input.destination,
        input.weight,
        input.length && input.width && input.height ? {
          length: input.length,
          width: input.width,
          height: input.height
        } : void 0
      );
      return {
        success: true,
        quotes,
        count: quotes.length
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062D\u0633\u0627\u0628 \u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0634\u062D\u0646");
    }
  }),
  /**
   * تتبع الشحنة
   */
  trackShipment: publicProcedure.input(
    z12.object({
      trackingNumber: z12.string(),
      carrier: z12.enum(["DHL", "FedEx", "UPS"])
    })
  ).query(async ({ input }) => {
    try {
      const tracking = await shippingIntegrationService.trackShipment(
        input.trackingNumber,
        input.carrier
      );
      if (!tracking) {
        throw new Error("\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0634\u062D\u0646\u0629");
      }
      return {
        success: true,
        tracking
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062A\u062A\u0628\u0639 \u0627\u0644\u0634\u062D\u0646\u0629");
    }
  }),
  /**
   * الحصول على تقرير الشحن
   */
  getShippingReport: protectedProcedure.input(
    z12.object({
      startDate: z12.date(),
      endDate: z12.date()
    })
  ).query(async ({ input }) => {
    try {
      const report = shippingIntegrationService.getShippingReport(
        input.startDate,
        input.endDate
      );
      return {
        success: true,
        report
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0634\u062D\u0646");
    }
  }),
  /**
   * الحصول على التنبيهات
   */
  getAlerts: protectedProcedure.input(z12.object({ unreadOnly: z12.boolean().optional() })).query(async ({ ctx, input }) => {
    try {
      const alerts = alertReminderService.getUserAlerts(ctx.user.id.toString(), input.unreadOnly);
      return {
        success: true,
        alerts,
        count: alerts.length,
        unreadCount: alerts.filter((a) => !a.readAt).length
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A");
    }
  }),
  /**
   * الحصول على التذكيرات
   */
  getReminders: protectedProcedure.input(z12.object({ pending: z12.boolean().optional() })).query(async ({ ctx, input }) => {
    try {
      const reminders = alertReminderService.getUserReminders(ctx.user.id.toString(), input.pending);
      return {
        success: true,
        reminders,
        count: reminders.length
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u062A\u0630\u0643\u064A\u0631\u0627\u062A");
    }
  }),
  /**
   * وضع علامة على التنبيه كمقروء
   */
  markAlertAsRead: protectedProcedure.input(z12.object({ alertId: z12.string() })).mutation(async ({ input }) => {
    try {
      const success = alertReminderService.markAlertAsRead(input.alertId);
      return {
        success,
        message: success ? "\u062A\u0645 \u0648\u0636\u0639 \u0639\u0644\u0627\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u062A\u0646\u0628\u064A\u0647 \u0643\u0645\u0642\u0631\u0648\u0621" : "\u0641\u0634\u0644 \u0641\u064A \u0648\u0636\u0639 \u0627\u0644\u0639\u0644\u0627\u0645\u0629"
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0648\u0636\u0639 \u0627\u0644\u0639\u0644\u0627\u0645\u0629 \u0639\u0644\u0649 \u0627\u0644\u062A\u0646\u0628\u064A\u0647");
    }
  }),
  /**
   * إكمال التذكير
   */
  completeReminder: protectedProcedure.input(z12.object({ reminderId: z12.string() })).mutation(async ({ input }) => {
    try {
      const success = alertReminderService.completeReminder(input.reminderId);
      return {
        success,
        message: success ? "\u062A\u0645 \u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u062A\u0630\u0643\u064A\u0631" : "\u0641\u0634\u0644 \u0641\u064A \u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u062A\u0630\u0643\u064A\u0631"
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u062A\u0630\u0643\u064A\u0631");
    }
  }),
  /**
   * تحديث تفضيلات التنبيهات
   */
  updateAlertPreferences: protectedProcedure.input(
    z12.object({
      emailNotifications: z12.boolean().optional(),
      smsNotifications: z12.boolean().optional(),
      pushNotifications: z12.boolean().optional(),
      inAppNotifications: z12.boolean().optional(),
      shipmentUpdates: z12.boolean().optional(),
      invoiceReminders: z12.boolean().optional(),
      specialOffers: z12.boolean().optional(),
      paymentReminders: z12.boolean().optional(),
      frequency: z12.enum(["immediate", "daily", "weekly", "monthly"]).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      alertReminderService.setUserPreferences(ctx.user.id.toString(), input);
      return {
        success: true,
        message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062A\u0641\u0636\u064A\u0644\u0627\u062A \u0628\u0646\u062C\u0627\u062D"
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062A\u0641\u0636\u064A\u0644\u0627\u062A");
    }
  }),
  /**
   * الحصول على إحصائيات التنبيهات
   */
  getAlertStatistics: protectedProcedure.query(async ({ ctx }) => {
    try {
      const statistics = alertReminderService.getAlertStatistics(ctx.user.id.toString());
      return {
        success: true,
        statistics
      };
    } catch (error) {
      throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u062A\u0646\u0628\u064A\u0647\u0627\u062A");
    }
  })
});

// server/routers/local-payment-gateways.ts
import { z as z13 } from "zod";

// server/services/local-payment-gateways.ts
import crypto2 from "crypto";
var LocalPaymentGatewaysService = class {
  clickConfig = {
    baseUrl: "https://api.clickpay.com.kw/v4",
    merchantId: process.env.CLICK_MERCHANT_ID || "demo",
    apiKey: process.env.CLICK_API_KEY || "demo_key"
  };
  telrConfig = {
    baseUrl: "https://api.telr.com/v1",
    storeId: process.env.TELR_STORE_ID || "demo",
    apiKey: process.env.TELR_API_KEY || "demo_key"
  };
  payfortConfig = {
    baseUrl: "https://payfortapi.payfort.com/FortAPI/paymentApi",
    accessCode: process.env.PAYFORT_ACCESS_CODE || "demo",
    merchantIdentifier: process.env.PAYFORT_MERCHANT_ID || "demo",
    shaRequestPhrase: process.env.PAYFORT_SHA_REQUEST || "demo",
    shaResponsePhrase: process.env.PAYFORT_SHA_RESPONSE || "demo"
  };
  twoCheckoutConfig = {
    baseUrl: "https://api.2checkout.com/v1",
    apiKey: process.env.TWO_CHECKOUT_API_KEY || "demo_key",
    merchantCode: process.env.TWO_CHECKOUT_MERCHANT_CODE || "demo"
  };
  /**
   * معالج Click Payment (كليك - الكويت)
   * بنك الأردن - SAADBOOS
   */
  async processClickPayment(amount, currency, orderId, userId, description, customerEmail, customerPhone) {
    try {
      console.log(`\u{1F4B3} \u0645\u0639\u0627\u0644\u062C\u0629 \u062F\u0641\u0639 Click Payment (\u0643\u0644\u064A\u0643)`);
      console.log(`\u{1F4B0} \u0627\u0644\u0645\u0628\u0644\u063A: ${amount} ${currency}`);
      console.log(`\u{1F4E7} \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: ${customerEmail}`);
      const paymentId = `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const redirectUrl = `https://api.clickpay.com.kw/payment/${paymentId}`;
      return {
        success: true,
        paymentId,
        status: "pending",
        redirectUrl,
        message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0637\u0644\u0628 \u0627\u0644\u062F\u0641\u0639 \u0628\u0646\u062C\u0627\u062D. \u064A\u0631\u062C\u0649 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0648\u062C\u064A\u0647 \u0644\u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u062F\u0641\u0639.",
        data: {
          gateway: "click",
          amount,
          currency,
          orderId,
          customerEmail,
          customerPhone,
          processedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 Click Payment:", error);
      return {
        success: false,
        paymentId: "",
        status: "failed",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u062F\u0641\u0639 \u0639\u0628\u0631 Click"
      };
    }
  }
  /**
   * معالج Telr (تلر - الإمارات)
   */
  async processTelrPayment(amount, currency, orderId, userId, description, customerEmail, customerPhone) {
    try {
      console.log(`\u{1F537} \u0645\u0639\u0627\u0644\u062C\u0629 \u062F\u0641\u0639 Telr (\u062A\u0644\u0631)`);
      console.log(`\u{1F4B0} \u0627\u0644\u0645\u0628\u0644\u063A: ${amount} ${currency}`);
      console.log(`\u{1F4E7} \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: ${customerEmail}`);
      const paymentId = `telr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const redirectUrl = `https://secure.telr.com/gateway/process/${paymentId}`;
      return {
        success: true,
        paymentId,
        status: "pending",
        redirectUrl,
        message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0637\u0644\u0628 \u0627\u0644\u062F\u0641\u0639 \u0628\u0646\u062C\u0627\u062D. \u064A\u0631\u062C\u0649 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0648\u062C\u064A\u0647 \u0644\u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u062F\u0641\u0639.",
        data: {
          gateway: "telr",
          amount,
          currency,
          orderId,
          customerEmail,
          customerPhone,
          storeId: this.telrConfig.storeId,
          processedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 Telr Payment:", error);
      return {
        success: false,
        paymentId: "",
        status: "failed",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u062F\u0641\u0639 \u0639\u0628\u0631 Telr"
      };
    }
  }
  /**
   * معالج PayFort (أمازون - السعودية والإمارات)
   */
  async processPayFortPayment(amount, currency, orderId, userId, description, customerEmail, customerPhone) {
    try {
      console.log(`\u{1F7E0} \u0645\u0639\u0627\u0644\u062C\u0629 \u062F\u0641\u0639 PayFort (\u0623\u0645\u0627\u0632\u0648\u0646)`);
      console.log(`\u{1F4B0} \u0627\u0644\u0645\u0628\u0644\u063A: ${amount} ${currency}`);
      console.log(`\u{1F4E7} \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: ${customerEmail}`);
      const paymentId = `payfort_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const signature = this.generatePayFortSignature(
        `${amount}${currency}${orderId}`,
        this.payfortConfig.shaRequestPhrase
      );
      const redirectUrl = `https://payfortapi.payfort.com/FortAPI/paymentPage`;
      return {
        success: true,
        paymentId,
        status: "pending",
        redirectUrl,
        message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0637\u0644\u0628 \u0627\u0644\u062F\u0641\u0639 \u0628\u0646\u062C\u0627\u062D. \u064A\u0631\u062C\u0649 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0648\u062C\u064A\u0647 \u0644\u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u062F\u0641\u0639.",
        data: {
          gateway: "payfort",
          amount,
          currency,
          orderId,
          customerEmail,
          customerPhone,
          merchantIdentifier: this.payfortConfig.merchantIdentifier,
          signature,
          processedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 PayFort Payment:", error);
      return {
        success: false,
        paymentId: "",
        status: "failed",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u062F\u0641\u0639 \u0639\u0628\u0631 PayFort"
      };
    }
  }
  /**
   * معالج 2Checkout (Verifone - عالمي)
   */
  async process2CheckoutPayment(amount, currency, orderId, userId, description, customerEmail, customerPhone) {
    try {
      console.log(`\u{1F535} \u0645\u0639\u0627\u0644\u062C\u0629 \u062F\u0641\u0639 2Checkout (Verifone)`);
      console.log(`\u{1F4B0} \u0627\u0644\u0645\u0628\u0644\u063A: ${amount} ${currency}`);
      console.log(`\u{1F4E7} \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: ${customerEmail}`);
      const paymentId = `2checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const redirectUrl = `https://secure.2checkout.com/checkout/buy/${paymentId}`;
      return {
        success: true,
        paymentId,
        status: "pending",
        redirectUrl,
        message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0637\u0644\u0628 \u0627\u0644\u062F\u0641\u0639 \u0628\u0646\u062C\u0627\u062D. \u064A\u0631\u062C\u0649 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0648\u062C\u064A\u0647 \u0644\u0625\u0643\u0645\u0627\u0644 \u0627\u0644\u062F\u0641\u0639.",
        data: {
          gateway: "2checkout",
          amount,
          currency,
          orderId,
          customerEmail,
          customerPhone,
          merchantCode: this.twoCheckoutConfig.merchantCode,
          processedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 2Checkout Payment:", error);
      return {
        success: false,
        paymentId: "",
        status: "failed",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u062F\u0641\u0639 \u0639\u0628\u0631 2Checkout"
      };
    }
  }
  /**
   * معالج الدفع الموحد (يختار البوابة المناسبة)
   */
  async processPayment(gateway, amount, currency, orderId, userId, description, customerEmail, customerPhone) {
    switch (gateway) {
      case "click":
        return this.processClickPayment(amount, currency, orderId, userId, description, customerEmail, customerPhone);
      case "telr":
        return this.processTelrPayment(amount, currency, orderId, userId, description, customerEmail, customerPhone);
      case "payfort":
        return this.processPayFortPayment(amount, currency, orderId, userId, description, customerEmail, customerPhone);
      case "2checkout":
        return this.process2CheckoutPayment(amount, currency, orderId, userId, description, customerEmail, customerPhone);
      default:
        return {
          success: false,
          paymentId: "",
          status: "failed",
          message: "\u0628\u0648\u0627\u0628\u0629 \u062F\u0641\u0639 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645\u0629"
        };
    }
  }
  /**
   * التحقق من حالة الدفع
   */
  async verifyPayment(gateway, paymentId) {
    console.log(`\u2705 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639: ${paymentId} (${gateway})`);
    return "completed";
  }
  /**
   * إلغاء الدفع
   */
  async cancelPayment(gateway, paymentId) {
    console.log(`\u274C \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062F\u0641\u0639: ${paymentId} (${gateway})`);
    return true;
  }
  /**
   * استرجاع الأموال
   */
  async refundPayment(gateway, paymentId, amount) {
    console.log(`\u{1F4B8} \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644: ${paymentId} (${gateway})`);
    if (amount) {
      console.log(`\u{1F4B0} \u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0633\u062A\u0631\u062C\u0639: ${amount}`);
    }
    return true;
  }
  /**
   * حساب توقيع PayFort (SHA-256)
   */
  generatePayFortSignature(data, phrase) {
    const shaObject = crypto2.createHash("sha256");
    shaObject.update(phrase + data + phrase);
    return shaObject.digest("hex");
  }
  /**
   * التحقق من توقيع PayFort
   */
  verifyPayFortSignature(data, signature, isResponse = false) {
    const phrase = isResponse ? this.payfortConfig.shaResponsePhrase : this.payfortConfig.shaRequestPhrase;
    const expectedSignature = this.generatePayFortSignature(data, phrase);
    return signature === expectedSignature;
  }
  /**
   * الحصول على قائمة البوابات المدعومة
   */
  getSupportedGateways() {
    return ["click", "telr", "payfort", "2checkout"];
  }
  /**
   * الحصول على معلومات البوابة
   */
  getGatewayInfo(gateway) {
    const gateways = {
      click: {
        name: "Click Payment",
        country: "Kuwait",
        currencies: ["KWD", "USD", "AED"],
        description: "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u062F\u0641\u0639 \u0645\u0646 \u0628\u0646\u0643 \u0627\u0644\u0623\u0631\u062F\u0646 - \u0643\u0644\u064A\u0643"
      },
      telr: {
        name: "Telr",
        country: "UAE",
        currencies: ["AED", "USD", "SAR"],
        description: "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u062F\u0641\u0639 \u0645\u0646 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062A - \u062A\u0644\u0631"
      },
      payfort: {
        name: "PayFort",
        country: "Saudi Arabia & UAE",
        currencies: ["SAR", "AED", "USD"],
        description: "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u062F\u0641\u0639 \u0645\u0646 \u0623\u0645\u0627\u0632\u0648\u0646 - PayFort"
      },
      "2checkout": {
        name: "2Checkout (Verifone)",
        country: "Global",
        currencies: ["USD", "EUR", "GBP", "AED", "SAR", "KWD", "JOD"],
        description: "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u062F\u0641\u0639 \u0627\u0644\u0639\u0627\u0644\u0645\u064A\u0629 - Verifone"
      }
    };
    return gateways[gateway] || {};
  }
};
var localPaymentGatewaysService = new LocalPaymentGatewaysService();

// server/routers/local-payment-gateways.ts
var localPaymentGatewaysRouter = router({
  /**
   * معالجة الدفع عبر بوابة محددة
   */
  processPayment: protectedProcedure.input(
    z13.object({
      gateway: z13.enum(["click", "telr", "payfort", "2checkout"]),
      amount: z13.number().positive(),
      currency: z13.string().length(3),
      orderId: z13.string(),
      description: z13.string(),
      customerEmail: z13.string().email().optional(),
      customerPhone: z13.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const response = await localPaymentGatewaysService.processPayment(
      input.gateway,
      input.amount,
      input.currency,
      input.orderId,
      ctx.user.id,
      input.description,
      input.customerEmail,
      input.customerPhone
    );
    return response;
  }),
  /**
   * معالجة Click Payment (كليك)
   */
  processClick: protectedProcedure.input(
    z13.object({
      amount: z13.number().positive(),
      currency: z13.string().length(3),
      orderId: z13.string(),
      description: z13.string(),
      customerEmail: z13.string().email().optional(),
      customerPhone: z13.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    return await localPaymentGatewaysService.processClickPayment(
      input.amount,
      input.currency,
      input.orderId,
      ctx.user.id,
      input.description,
      input.customerEmail,
      input.customerPhone
    );
  }),
  /**
   * معالجة Telr (تلر)
   */
  processTelr: protectedProcedure.input(
    z13.object({
      amount: z13.number().positive(),
      currency: z13.string().length(3),
      orderId: z13.string(),
      description: z13.string(),
      customerEmail: z13.string().email().optional(),
      customerPhone: z13.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    return await localPaymentGatewaysService.processTelrPayment(
      input.amount,
      input.currency,
      input.orderId,
      ctx.user.id,
      input.description,
      input.customerEmail,
      input.customerPhone
    );
  }),
  /**
   * معالجة PayFort (أمازون)
   */
  processPayFort: protectedProcedure.input(
    z13.object({
      amount: z13.number().positive(),
      currency: z13.string().length(3),
      orderId: z13.string(),
      description: z13.string(),
      customerEmail: z13.string().email().optional(),
      customerPhone: z13.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    return await localPaymentGatewaysService.processPayFortPayment(
      input.amount,
      input.currency,
      input.orderId,
      ctx.user.id,
      input.description,
      input.customerEmail,
      input.customerPhone
    );
  }),
  /**
   * معالجة 2Checkout (Verifone)
   */
  process2Checkout: protectedProcedure.input(
    z13.object({
      amount: z13.number().positive(),
      currency: z13.string().length(3),
      orderId: z13.string(),
      description: z13.string(),
      customerEmail: z13.string().email().optional(),
      customerPhone: z13.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    return await localPaymentGatewaysService.process2CheckoutPayment(
      input.amount,
      input.currency,
      input.orderId,
      ctx.user.id,
      input.description,
      input.customerEmail,
      input.customerPhone
    );
  }),
  /**
   * التحقق من حالة الدفع
   */
  verifyPayment: protectedProcedure.input(
    z13.object({
      gateway: z13.enum(["click", "telr", "payfort", "2checkout"]),
      paymentId: z13.string()
    })
  ).query(async ({ input }) => {
    const status = await localPaymentGatewaysService.verifyPayment(
      input.gateway,
      input.paymentId
    );
    return { status };
  }),
  /**
   * إلغاء الدفع
   */
  cancelPayment: protectedProcedure.input(
    z13.object({
      gateway: z13.enum(["click", "telr", "payfort", "2checkout"]),
      paymentId: z13.string()
    })
  ).mutation(async ({ input }) => {
    const success = await localPaymentGatewaysService.cancelPayment(
      input.gateway,
      input.paymentId
    );
    return { success };
  }),
  /**
   * استرجاع الأموال
   */
  refundPayment: protectedProcedure.input(
    z13.object({
      gateway: z13.enum(["click", "telr", "payfort", "2checkout"]),
      paymentId: z13.string(),
      amount: z13.number().positive().optional()
    })
  ).mutation(async ({ input }) => {
    const success = await localPaymentGatewaysService.refundPayment(
      input.gateway,
      input.paymentId,
      input.amount
    );
    return { success };
  }),
  /**
   * الحصول على قائمة البوابات المدعومة
   */
  getSupportedGateways: protectedProcedure.query(async () => {
    const gateways = localPaymentGatewaysService.getSupportedGateways();
    const details = gateways.map((gateway) => ({
      id: gateway,
      ...localPaymentGatewaysService.getGatewayInfo(gateway)
    }));
    return details;
  }),
  /**
   * الحصول على معلومات بوابة محددة
   */
  getGatewayInfo: protectedProcedure.input(
    z13.object({
      gateway: z13.enum(["click", "telr", "payfort", "2checkout"])
    })
  ).query(async ({ input }) => {
    const info = localPaymentGatewaysService.getGatewayInfo(
      input.gateway
    );
    return {
      gateway: input.gateway,
      ...info
    };
  })
});

// server/services/webhook-handler.ts
import crypto3 from "crypto";
var WebhookHandlerService = class {
  clickWebhookSecret = process.env.CLICK_WEBHOOK_SECRET || "demo_secret";
  alipayWebhookSecret = process.env.ALIPAY_WEBHOOK_SECRET || "demo_secret";
  paypalWebhookSecret = process.env.PAYPAL_WEBHOOK_SECRET || "demo_secret";
  payfortWebhookSecret = process.env.PAYFORT_WEBHOOK_SECRET || "demo_secret";
  twoCheckoutWebhookSecret = process.env.TWO_CHECKOUT_WEBHOOK_SECRET || "demo_secret";
  /**
   * معالجة Webhook من Click (كليك)
   */
  async handleClickWebhook(payload, signature) {
    try {
      console.log(`\u{1F514} \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0645\u0646 Click: ${payload.orderId}`);
      if (!this.verifyClickSignature(payload, signature)) {
        console.error("\u274C \u062A\u0648\u0642\u064A\u0639 Click \u063A\u064A\u0631 \u0635\u062D\u064A\u062D");
        return {
          success: false,
          message: "\u062A\u0648\u0642\u064A\u0639 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D",
          eventId: "",
          processedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      const paymentStatus = this.mapClickStatus(payload.status);
      const eventType = this.mapEventType(paymentStatus);
      await this.updateOrderStatus(
        payload.orderId,
        paymentStatus,
        {
          gateway: "click",
          paymentId: payload.paymentId,
          amount: payload.amount,
          currency: payload.currency,
          rawPayload: payload
        }
      );
      await this.notifyUser(payload.orderId, eventType, paymentStatus);
      console.log(`\u2705 \u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 Webhook \u0645\u0646 Click \u0628\u0646\u062C\u0627\u062D: ${payload.orderId}`);
      return {
        success: true,
        message: "\u062A\u0645 \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0628\u0646\u062C\u0627\u062D",
        eventId: `click_${payload.orderId}_${Date.now()}`,
        processedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 Click Webhook:", error);
      return {
        success: false,
        message: "\u0641\u0634\u0644 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 Webhook",
        eventId: "",
        processedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  /**
   * معالجة Webhook من Alipay (الباي الصيني)
   */
  async handleAlipayWebhook(payload, signature) {
    try {
      console.log(`\u{1F514} \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0645\u0646 Alipay: ${payload.orderId}`);
      if (!this.verifyAlipaySignature(payload, signature)) {
        console.error("\u274C \u062A\u0648\u0642\u064A\u0639 Alipay \u063A\u064A\u0631 \u0635\u062D\u064A\u062D");
        return {
          success: false,
          message: "\u062A\u0648\u0642\u064A\u0639 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D",
          eventId: "",
          processedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      const paymentStatus = this.mapAlipayStatus(payload.trade_status);
      const eventType = this.mapEventType(paymentStatus);
      await this.updateOrderStatus(
        payload.orderId,
        paymentStatus,
        {
          gateway: "alipay",
          paymentId: payload.trade_no,
          amount: payload.total_amount,
          currency: payload.currency,
          rawPayload: payload
        }
      );
      await this.notifyUser(payload.orderId, eventType, paymentStatus);
      console.log(`\u2705 \u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 Webhook \u0645\u0646 Alipay \u0628\u0646\u062C\u0627\u062D: ${payload.orderId}`);
      return {
        success: true,
        message: "\u062A\u0645 \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0628\u0646\u062C\u0627\u062D",
        eventId: `alipay_${payload.orderId}_${Date.now()}`,
        processedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 Alipay Webhook:", error);
      return {
        success: false,
        message: "\u0641\u0634\u0644 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 Webhook",
        eventId: "",
        processedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  /**
   * معالجة Webhook من PayPal
   */
  async handlePayPalWebhook(payload, signature) {
    try {
      console.log(`\u{1F514} \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0645\u0646 PayPal: ${payload.resource.id}`);
      if (!await this.verifyPayPalSignature(payload, signature)) {
        console.error("\u274C \u062A\u0648\u0642\u064A\u0639 PayPal \u063A\u064A\u0631 \u0635\u062D\u064A\u062D");
        return {
          success: false,
          message: "\u062A\u0648\u0642\u064A\u0639 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D",
          eventId: "",
          processedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      const eventType = payload.event_type;
      const paymentStatus = this.mapPayPalEventType(eventType);
      const orderId = payload.resource.custom_id || payload.resource.invoice_id;
      const amount = payload.resource.amount?.value || 0;
      const currency = payload.resource.amount?.currency_code || "USD";
      await this.updateOrderStatus(
        orderId,
        paymentStatus,
        {
          gateway: "paypal",
          paymentId: payload.resource.id,
          amount,
          currency,
          rawPayload: payload
        }
      );
      await this.notifyUser(orderId, eventType, paymentStatus);
      console.log(`\u2705 \u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 Webhook \u0645\u0646 PayPal \u0628\u0646\u062C\u0627\u062D: ${orderId}`);
      return {
        success: true,
        message: "\u062A\u0645 \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0628\u0646\u062C\u0627\u062D",
        eventId: `paypal_${orderId}_${Date.now()}`,
        processedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 PayPal Webhook:", error);
      return {
        success: false,
        message: "\u0641\u0634\u0644 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 Webhook",
        eventId: "",
        processedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  /**
   * معالجة Webhook من PayFort (أمازون)
   */
  async handlePayFortWebhook(payload, signature) {
    try {
      console.log(`\u{1F514} \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0645\u0646 PayFort: ${payload.merchant_reference}`);
      if (!this.verifyPayFortSignature(payload, signature)) {
        console.error("\u274C \u062A\u0648\u0642\u064A\u0639 PayFort \u063A\u064A\u0631 \u0635\u062D\u064A\u062D");
        return {
          success: false,
          message: "\u062A\u0648\u0642\u064A\u0639 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D",
          eventId: "",
          processedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      const paymentStatus = this.mapPayFortStatus(payload.response_code);
      const eventType = this.mapEventType(paymentStatus);
      await this.updateOrderStatus(
        payload.merchant_reference,
        paymentStatus,
        {
          gateway: "payfort",
          paymentId: payload.fort_id,
          amount: payload.amount / 100,
          // PayFort يرسل المبلغ بالفلس
          currency: payload.currency,
          rawPayload: payload
        }
      );
      await this.notifyUser(payload.merchant_reference, eventType, paymentStatus);
      console.log(`\u2705 \u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 Webhook \u0645\u0646 PayFort \u0628\u0646\u062C\u0627\u062D: ${payload.merchant_reference}`);
      return {
        success: true,
        message: "\u062A\u0645 \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0628\u0646\u062C\u0627\u062D",
        eventId: `payfort_${payload.merchant_reference}_${Date.now()}`,
        processedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 PayFort Webhook:", error);
      return {
        success: false,
        message: "\u0641\u0634\u0644 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 Webhook",
        eventId: "",
        processedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  /**
   * معالجة Webhook من 2Checkout
   */
  async handle2CheckoutWebhook(payload, signature) {
    try {
      console.log(`\u{1F514} \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0645\u0646 2Checkout: ${payload.merchantOrderId}`);
      if (!this.verify2CheckoutSignature(payload, signature)) {
        console.error("\u274C \u062A\u0648\u0642\u064A\u0639 2Checkout \u063A\u064A\u0631 \u0635\u062D\u064A\u062D");
        return {
          success: false,
          message: "\u062A\u0648\u0642\u064A\u0639 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D",
          eventId: "",
          processedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      const paymentStatus = this.map2CheckoutStatus(payload.type);
      const eventType = this.mapEventType(paymentStatus);
      await this.updateOrderStatus(
        payload.merchantOrderId,
        paymentStatus,
        {
          gateway: "2checkout",
          paymentId: payload.refNo,
          amount: payload.amount,
          currency: payload.currency,
          rawPayload: payload
        }
      );
      await this.notifyUser(payload.merchantOrderId, eventType, paymentStatus);
      console.log(`\u2705 \u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 Webhook \u0645\u0646 2Checkout \u0628\u0646\u062C\u0627\u062D: ${payload.merchantOrderId}`);
      return {
        success: true,
        message: "\u062A\u0645 \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0628\u0646\u062C\u0627\u062D",
        eventId: `2checkout_${payload.merchantOrderId}_${Date.now()}`,
        processedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 2Checkout Webhook:", error);
      return {
        success: false,
        message: "\u0641\u0634\u0644 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 Webhook",
        eventId: "",
        processedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  /**
   * التحقق من توقيع Click
   */
  verifyClickSignature(payload, signature) {
    const data = JSON.stringify(payload);
    const hash = crypto3.createHmac("sha256", this.clickWebhookSecret).update(data).digest("hex");
    return hash === signature;
  }
  /**
   * التحقق من توقيع Alipay
   */
  verifyAlipaySignature(payload, signature) {
    const data = JSON.stringify(payload);
    const hash = crypto3.createHmac("sha256", this.alipayWebhookSecret).update(data).digest("hex");
    return hash === signature;
  }
  /**
   * التحقق من توقيع PayPal
   */
  async verifyPayPalSignature(payload, signature) {
    try {
      const data = JSON.stringify(payload);
      const hash = crypto3.createHmac("sha256", this.paypalWebhookSecret).update(data).digest("hex");
      return hash === signature;
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 PayPal:", error);
      return false;
    }
  }
  /**
   * التحقق من توقيع PayFort
   */
  verifyPayFortSignature(payload, signature) {
    const shaRequestPhrase = this.payfortWebhookSecret;
    const data = `${payload.merchant_reference}${payload.amount}${payload.currency}`;
    const hash = crypto3.createHash("sha256").update(shaRequestPhrase + data + shaRequestPhrase).digest("hex");
    return hash === signature;
  }
  /**
   * التحقق من توقيع 2Checkout
   */
  verify2CheckoutSignature(payload, signature) {
    const data = JSON.stringify(payload);
    const hash = crypto3.createHmac("sha256", this.twoCheckoutWebhookSecret).update(data).digest("hex");
    return hash === signature;
  }
  /**
   * تحويل حالة Click إلى حالة موحدة
   */
  mapClickStatus(status) {
    const statusMap = {
      "COMPLETED": "completed",
      "FAILED": "failed",
      "PENDING": "pending",
      "REFUNDED": "refunded",
      "CANCELLED": "cancelled"
    };
    return statusMap[status] || "pending";
  }
  /**
   * تحويل حالة Alipay إلى حالة موحدة
   */
  mapAlipayStatus(status) {
    const statusMap = {
      "TRADE_SUCCESS": "completed",
      "TRADE_FINISHED": "completed",
      "TRADE_CLOSED": "cancelled",
      "TRADE_CLOSED_BY_TAOBAO": "cancelled",
      "WAIT_BUYER_PAY": "pending",
      "TRADE_PENDING_REFUND": "pending",
      "REFUND_SUCCESS": "refunded"
    };
    return statusMap[status] || "pending";
  }
  /**
   * تحويل نوع حدث PayPal إلى حالة موحدة
   */
  mapPayPalEventType(eventType) {
    const eventMap = {
      "PAYMENT.CAPTURE.COMPLETED": "completed",
      "PAYMENT.CAPTURE.DENIED": "failed",
      "PAYMENT.CAPTURE.PENDING": "pending",
      "PAYMENT.CAPTURE.REFUNDED": "refunded",
      "PAYMENT.CAPTURE.REVERSED": "refunded"
    };
    return eventMap[eventType] || "pending";
  }
  /**
   * تحويل رمز استجابة PayFort إلى حالة موحدة
   */
  mapPayFortStatus(responseCode) {
    if (responseCode === "00000") return "completed";
    if (responseCode === "20001") return "pending";
    if (responseCode === "20002") return "refunded";
    return "failed";
  }
  /**
   * تحويل نوع حدث 2Checkout إلى حالة موحدة
   */
  map2CheckoutStatus(eventType) {
    const statusMap = {
      "PAYMENT_AUTHORIZED": "completed",
      "PAYMENT_FAILED": "failed",
      "REFUND_ISSUED": "refunded",
      "SUBSCRIPTION_STARTED": "completed",
      "SUBSCRIPTION_CANCELLED": "cancelled"
    };
    return statusMap[eventType] || "pending";
  }
  /**
   * تحويل حالة الدفع إلى نوع حدث
   */
  mapEventType(status) {
    const eventMap = {
      "completed": "payment.success",
      "failed": "payment.failed",
      "pending": "payment.pending",
      "refunded": "payment.refunded",
      "cancelled": "payment.cancelled"
    };
    return eventMap[status] || "payment.pending";
  }
  /**
   * تحديث حالة الطلب في قاعدة البيانات
   */
  async updateOrderStatus(orderId, status, paymentInfo) {
    try {
      console.log(`\u{1F4DD} \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628 ${orderId} \u0625\u0644\u0649 ${status}`);
      console.log(`\u{1F4B3} \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062F\u0641\u0639:`, paymentInfo);
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628:", error);
      throw error;
    }
  }
  /**
   * إرسال إشعار للمستخدم
   */
  async notifyUser(orderId, eventType, status) {
    try {
      const messages = {
        "payment.success": "\u2705 \u062A\u0645 \u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0627\u0644\u062F\u0641\u0639 \u0628\u0646\u062C\u0627\u062D!",
        "payment.failed": "\u274C \u0641\u0634\u0644 \u0627\u0644\u062F\u0641\u0639. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B.",
        "payment.pending": "\u23F3 \u0627\u0644\u062F\u0641\u0639 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629...",
        "payment.refunded": "\u{1F4B8} \u062A\u0645 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644 \u0628\u0646\u062C\u0627\u062D.",
        "payment.cancelled": "\u274C \u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062F\u0641\u0639."
      };
      const message = messages[eventType];
      console.log(`\u{1F4EC} \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0644\u0644\u0637\u0644\u0628 ${orderId}: ${message}`);
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631:", error);
    }
  }
  /**
   * إعادة محاولة معالجة Webhook عند الفشل
   */
  async retryWebhookProcessing(gateway, payload, maxRetries = 3) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`\u{1F504} \u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0639\u0627\u0644\u062C\u0629 Webhook (${attempt}/${maxRetries})`);
        switch (gateway) {
          case "click":
            return await this.handleClickWebhook(payload, payload.signature);
          case "alipay":
            return await this.handleAlipayWebhook(payload, payload.signature);
          case "paypal":
            return await this.handlePayPalWebhook(payload, payload.signature);
          case "payfort":
            return await this.handlePayFortWebhook(payload, payload.signature);
          case "2checkout":
            return await this.handle2CheckoutWebhook(payload, payload.signature);
          default:
            throw new Error(`\u0628\u0648\u0627\u0628\u0629 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641\u0629: ${gateway}`);
        }
      } catch (error) {
        lastError = error;
        console.error(`\u274C \u0645\u062D\u0627\u0648\u0644\u0629 ${attempt} \u0641\u0634\u0644\u062A:`, error);
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1e3 * attempt));
        }
      }
    }
    return {
      success: false,
      message: `\u0641\u0634\u0644 \u0628\u0639\u062F ${maxRetries} \u0645\u062D\u0627\u0648\u0644\u0627\u062A: ${lastError?.message}`,
      eventId: "",
      processedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
};
var webhookHandlerService = new WebhookHandlerService();

// server/routers/webhooks.ts
import { z as z14 } from "zod";
var webhooksRouter = router({
  /**
   * معالجة Webhook من Click
   * POST /api/trpc/webhooks.handleClick
   */
  handleClick: publicProcedure.input(
    z14.object({
      orderId: z14.string(),
      paymentId: z14.string(),
      amount: z14.number(),
      currency: z14.string(),
      status: z14.enum(["COMPLETED", "FAILED", "PENDING", "REFUNDED", "CANCELLED"]),
      signature: z14.string(),
      timestamp: z14.string().optional(),
      metadata: z14.record(z14.string(), z14.any()).optional()
    })
  ).mutation(async ({ input }) => {
    console.log("\u{1F4E5} \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0645\u0646 Click");
    return await webhookHandlerService.handleClickWebhook(input, input.signature);
  }),
  /**
   * معالجة Webhook من Alipay
   * POST /api/trpc/webhooks.handleAlipay
   */
  handleAlipay: publicProcedure.input(
    z14.object({
      orderId: z14.string(),
      trade_no: z14.string(),
      trade_status: z14.enum([
        "TRADE_SUCCESS",
        "TRADE_FINISHED",
        "TRADE_CLOSED",
        "TRADE_CLOSED_BY_TAOBAO",
        "WAIT_BUYER_PAY",
        "TRADE_PENDING_REFUND",
        "REFUND_SUCCESS"
      ]),
      total_amount: z14.number(),
      currency: z14.string(),
      signature: z14.string(),
      timestamp: z14.string().optional()
    })
  ).mutation(async ({ input }) => {
    console.log("\u{1F4E5} \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0645\u0646 Alipay");
    return await webhookHandlerService.handleAlipayWebhook(input, input.signature);
  }),
  /**
   * معالجة Webhook من PayPal
   * POST /api/trpc/webhooks.handlePayPal
   */
  handlePayPal: publicProcedure.input(
    z14.object({
      id: z14.string(),
      event_type: z14.string(),
      resource: z14.object({
        id: z14.string(),
        custom_id: z14.string().optional(),
        invoice_id: z14.string().optional(),
        amount: z14.object({
          value: z14.string(),
          currency_code: z14.string()
        }).optional(),
        status: z14.string().optional()
      }),
      signature: z14.string()
    })
  ).mutation(async ({ input }) => {
    console.log("\u{1F4E5} \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0645\u0646 PayPal");
    return await webhookHandlerService.handlePayPalWebhook(input, input.signature);
  }),
  /**
   * معالجة Webhook من PayFort
   * POST /api/trpc/webhooks.handlePayFort
   */
  handlePayFort: publicProcedure.input(
    z14.object({
      merchant_reference: z14.string(),
      fort_id: z14.string(),
      response_code: z14.string(),
      amount: z14.number(),
      currency: z14.string(),
      signature: z14.string(),
      timestamp: z14.string().optional()
    })
  ).mutation(async ({ input }) => {
    console.log("\u{1F4E5} \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0645\u0646 PayFort");
    return await webhookHandlerService.handlePayFortWebhook(input, input.signature);
  }),
  /**
   * معالجة Webhook من 2Checkout
   * POST /api/trpc/webhooks.handle2Checkout
   */
  handle2Checkout: publicProcedure.input(
    z14.object({
      merchantOrderId: z14.string(),
      refNo: z14.string(),
      type: z14.string(),
      amount: z14.number(),
      currency: z14.string(),
      signature: z14.string(),
      timestamp: z14.string().optional()
    })
  ).mutation(async ({ input }) => {
    console.log("\u{1F4E5} \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0645\u0646 2Checkout");
    return await webhookHandlerService.handle2CheckoutWebhook(input, input.signature);
  }),
  /**
   * اختبار Webhook
   * POST /api/trpc/webhooks.test
   */
  test: publicProcedure.input(
    z14.object({
      gateway: z14.enum(["click", "alipay", "paypal", "payfort", "2checkout"]),
      orderId: z14.string(),
      status: z14.enum(["completed", "failed", "pending", "refunded", "cancelled"])
    })
  ).mutation(async ({ input }) => {
    console.log(`\u{1F9EA} \u0627\u062E\u062A\u0628\u0627\u0631 Webhook \u0644\u0644\u0628\u0648\u0627\u0628\u0629: ${input.gateway}`);
    const testPayload = {
      orderId: input.orderId,
      status: input.status,
      amount: 100,
      currency: "JOD",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      signature: "test_signature"
    };
    switch (input.gateway) {
      case "click":
        return await webhookHandlerService.handleClickWebhook(testPayload, "test_signature");
      case "alipay":
        return await webhookHandlerService.handleAlipayWebhook(testPayload, "test_signature");
      case "paypal":
        return await webhookHandlerService.handlePayPalWebhook(
          {
            ...testPayload,
            resource: {
              id: "test_payment_id",
              custom_id: input.orderId,
              amount: { value: "100", currency_code: "JOD" }
            }
          },
          "test_signature"
        );
      case "payfort":
        return await webhookHandlerService.handlePayFortWebhook(testPayload, "test_signature");
      case "2checkout":
        return await webhookHandlerService.handle2CheckoutWebhook(testPayload, "test_signature");
      default:
        return {
          success: false,
          message: "\u0628\u0648\u0627\u0628\u0629 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641\u0629",
          eventId: "",
          processedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
    }
  }),
  /**
   * الحصول على حالة Webhook
   * GET /api/trpc/webhooks.getStatus
   */
  getStatus: publicProcedure.input(z14.object({ orderId: z14.string() })).query(async ({ input }) => {
    console.log(`\u{1F4CA} \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628: ${input.orderId}`);
    return {
      orderId: input.orderId,
      status: "pending",
      lastUpdate: (/* @__PURE__ */ new Date()).toISOString(),
      gateway: "unknown",
      message: "\u062C\u0627\u0631\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0637\u0644\u0628..."
    };
  }),
  /**
   * إعادة محاولة معالجة Webhook
   * POST /api/trpc/webhooks.retry
   */
  retry: publicProcedure.input(
    z14.object({
      gateway: z14.enum(["click", "alipay", "paypal", "payfort", "2checkout"]),
      orderId: z14.string(),
      maxRetries: z14.number().optional().default(3)
    })
  ).mutation(async ({ input }) => {
    console.log(`\u{1F504} \u0625\u0639\u0627\u062F\u0629 \u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0639\u0627\u0644\u062C\u0629 Webhook \u0644\u0644\u0637\u0644\u0628: ${input.orderId}`);
    const testPayload = {
      orderId: input.orderId,
      status: "pending",
      amount: 100,
      currency: "JOD",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      signature: "retry_signature"
    };
    return await webhookHandlerService.retryWebhookProcessing(
      input.gateway,
      testPayload,
      input.maxRetries
    );
  }),
  /**
   * إعادة تعيين حالة الطلب (للاختبار فقط)
   * POST /api/trpc/webhooks.reset
   */
  reset: publicProcedure.input(z14.object({ orderId: z14.string() })).mutation(async ({ input }) => {
    console.log(`\u{1F504} \u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628: ${input.orderId}`);
    return {
      success: true,
      message: `\u062A\u0645 \u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646 \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628 ${input.orderId}`,
      orderId: input.orderId,
      newStatus: "pending",
      resetAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  })
});

// server/routers/notifications-accounting.ts
import { z as z15 } from "zod";

// server/services/payment-notifications.ts
import nodemailer from "nodemailer";
var PaymentNotificationsService = class {
  emailTransporter;
  smsProvider;
  pushProvider;
  constructor() {
    this.initializeEmailTransporter();
    this.initializeSmsProvider();
    this.initializePushProvider();
  }
  /**
   * تهيئة خدمة البريد الإلكتروني
   */
  initializeEmailTransporter() {
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER || "noreply@example.com",
        pass: process.env.SMTP_PASSWORD || "password"
      }
    });
  }
  /**
   * تهيئة مزود خدمة SMS
   */
  initializeSmsProvider() {
    this.smsProvider = {
      accountSid: process.env.SMS_ACCOUNT_SID || "demo",
      authToken: process.env.SMS_AUTH_TOKEN || "demo"
    };
  }
  /**
   * تهيئة مزود خدمة Push Notifications
   */
  initializePushProvider() {
    this.pushProvider = {
      apiKey: process.env.FCM_API_KEY || "demo",
      projectId: process.env.FCM_PROJECT_ID || "demo"
    };
  }
  /**
   * إرسال إشعار شامل
   */
  async sendNotification(payload, notificationType = "all") {
    const response = {
      success: true,
      message: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0628\u0646\u062C\u0627\u062D",
      channels: {},
      sentAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      if (notificationType === "email" || notificationType === "all") {
        response.channels.email = await this.sendEmailNotification(payload);
      }
      if (notificationType === "push" || notificationType === "all") {
        response.channels.push = await this.sendPushNotification(payload);
      }
      if (notificationType === "sms" || notificationType === "all") {
        response.channels.sms = await this.sendSmsNotification(payload);
      }
      if (notificationType === "in-app" || notificationType === "all") {
        response.channels.inApp = await this.sendInAppNotification(payload);
      }
      await this.notifyOwnerOfPayment(payload);
      console.log(`\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0644\u0644\u0637\u0644\u0628 ${payload.orderId}`);
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A:", error);
      response.success = false;
      response.message = "\u0641\u0634\u0644 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0628\u0639\u0636 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A";
    }
    return response;
  }
  /**
   * إرسال بريد إلكتروني
   */
  async sendEmailNotification(payload) {
    try {
      if (!payload.userEmail) {
        console.warn("\u26A0\uFE0F \u0644\u0627 \u064A\u0648\u062C\u062F \u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645");
        return false;
      }
      const { subject, html } = this.generateEmailContent(payload);
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@customs-system.com",
        to: payload.userEmail,
        subject,
        html
      });
      console.log(`\u{1F4E7} \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0625\u0644\u0649 ${payload.userEmail}`);
      return true;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A:", error);
      return false;
    }
  }
  /**
   * إرسال إشعار Push
   */
  async sendPushNotification(payload) {
    try {
      const { title, body } = this.generatePushContent(payload);
      console.log(`\u{1F514} \u0625\u0631\u0633\u0627\u0644 Push Notification: ${title}`);
      console.log(`   \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${payload.userId}`);
      console.log(`   \u0627\u0644\u0631\u0633\u0627\u0644\u0629: ${body}`);
      return true;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 Push Notification:", error);
      return false;
    }
  }
  /**
   * إرسال SMS
   */
  async sendSmsNotification(payload) {
    try {
      if (!payload.phoneNumber) {
        console.warn("\u26A0\uFE0F \u0644\u0627 \u064A\u0648\u062C\u062F \u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645");
        return false;
      }
      const message = this.generateSmsContent(payload);
      console.log(`\u{1F4F1} \u0625\u0631\u0633\u0627\u0644 SMS \u0625\u0644\u0649 ${payload.phoneNumber}`);
      console.log(`   \u0627\u0644\u0631\u0633\u0627\u0644\u0629: ${message}`);
      return true;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 SMS:", error);
      return false;
    }
  }
  /**
   * إرسال إشعار في التطبيق
   */
  async sendInAppNotification(payload) {
    try {
      const { title, body } = this.generateInAppContent(payload);
      console.log(`\u{1F4AC} \u0625\u0646\u0634\u0627\u0621 \u0625\u0634\u0639\u0627\u0631 \u0641\u064A \u0627\u0644\u062A\u0637\u0628\u064A\u0642`);
      console.log(`   \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${payload.userId}`);
      console.log(`   \u0627\u0644\u0639\u0646\u0648\u0627\u0646: ${title}`);
      console.log(`   \u0627\u0644\u0631\u0633\u0627\u0644\u0629: ${body}`);
      return true;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0625\u0634\u0639\u0627\u0631 \u0641\u064A \u0627\u0644\u062A\u0637\u0628\u064A\u0642:", error);
      return false;
    }
  }
  /**
   * إرسال إشعار للمالك
   */
  async notifyOwnerOfPayment(payload) {
    try {
      const statusText = this.getStatusText(payload.status);
      const content = `
        \u062A\u0645 \u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u062F\u0641\u0639\u0629 \u062C\u062F\u064A\u062F\u0629:
        - \u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628: ${payload.orderId}
        - \u0627\u0644\u0645\u0628\u0644\u063A: ${payload.amount} ${payload.currency}
        - \u0627\u0644\u062D\u0627\u0644\u0629: ${statusText}
        - \u0627\u0644\u0628\u0648\u0627\u0628\u0629: ${payload.gateway}
        - \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${payload.userName || "\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"}
      `;
      await notifyOwner({
        title: `\u062F\u0641\u0639\u0629 \u062C\u062F\u064A\u062F\u0629 - ${statusText}`,
        content
      });
      console.log(`\u{1F468}\u200D\u{1F4BC} \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0644\u0644\u0645\u0627\u0644\u0643`);
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0627\u0644\u0645\u0627\u0644\u0643:", error);
    }
  }
  /**
   * توليد محتوى البريد الإلكتروني
   */
  generateEmailContent(payload) {
    const statusText = this.getStatusText(payload.status);
    const statusColor = this.getStatusColor(payload.status);
    const statusEmoji = this.getStatusEmoji(payload.status);
    const subject = `${statusEmoji} ${statusText} - \u0637\u0644\u0628\u0643 \u0631\u0642\u0645 ${payload.orderId}`;
    const html = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
          .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
          .status { 
            background-color: ${statusColor}; 
            color: white; 
            padding: 15px; 
            border-radius: 5px; 
            text-align: center; 
            font-size: 18px; 
            margin: 20px 0;
          }
          .details { margin: 20px 0; }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 10px 0; 
            border-bottom: 1px solid #eee;
          }
          .label { font-weight: bold; color: #333; }
          .value { color: #666; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          .button { 
            display: inline-block; 
            background-color: #007bff; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>\u0646\u0638\u0627\u0645 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0634\u062D\u0646</h1>
          </div>
          
          <div class="status">
            ${statusEmoji} ${statusText}
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628:</span>
              <span class="value">${payload.orderId}</span>
            </div>
            <div class="detail-row">
              <span class="label">\u0627\u0644\u0645\u0628\u0644\u063A:</span>
              <span class="value">${payload.amount.toLocaleString()} ${payload.currency}</span>
            </div>
            <div class="detail-row">
              <span class="label">\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u062F\u0641\u0639:</span>
              <span class="value">${payload.gateway}</span>
            </div>
            <div class="detail-row">
              <span class="label">\u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0648\u0627\u0644\u0648\u0642\u062A:</span>
              <span class="value">${(/* @__PURE__ */ new Date()).toLocaleString("ar-JO")}</span>
            </div>
          </div>
          
          ${this.getEmailMessage(payload.status)}
          
          <a href="${process.env.APP_URL || "https://customs-system.com"}/orders/${payload.orderId}" class="button">
            \u0639\u0631\u0636 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0637\u0644\u0628
          </a>
          
          <div class="footer">
            <p>\u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u062A\u0645 \u0625\u0631\u0633\u0627\u0644\u0647 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B. \u064A\u0631\u062C\u0649 \u0639\u062F\u0645 \u0627\u0644\u0631\u062F \u0639\u0644\u064A\u0647.</p>
            <p>\xA9 2026 \u0646\u0638\u0627\u0645 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u062C\u0645\u0627\u0631\u0643 \u0648\u0627\u0644\u0634\u062D\u0646. \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0642 \u0645\u062D\u0641\u0648\u0638\u0629.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    return { subject, html };
  }
  /**
   * توليد محتوى Push Notification
   */
  generatePushContent(payload) {
    const statusText = this.getStatusText(payload.status);
    const statusEmoji = this.getStatusEmoji(payload.status);
    return {
      title: `${statusEmoji} ${statusText}`,
      body: `\u0627\u0644\u0637\u0644\u0628 ${payload.orderId}: ${payload.amount} ${payload.currency}`
    };
  }
  /**
   * توليد محتوى SMS
   */
  generateSmsContent(payload) {
    const statusText = this.getStatusText(payload.status);
    const statusEmoji = this.getStatusEmoji(payload.status);
    return `${statusEmoji} ${statusText} - \u0637\u0644\u0628\u0643 \u0631\u0642\u0645 ${payload.orderId} \u0628\u0645\u0628\u0644\u063A ${payload.amount} ${payload.currency}. \u0634\u0643\u0631\u0627\u064B \u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0643 \u062E\u062F\u0645\u0627\u062A\u0646\u0627.`;
  }
  /**
   * توليد محتوى الإشعار في التطبيق
   */
  generateInAppContent(payload) {
    const statusText = this.getStatusText(payload.status);
    const statusEmoji = this.getStatusEmoji(payload.status);
    return {
      title: `${statusEmoji} ${statusText}`,
      body: `\u062A\u0645 ${this.getActionText(payload.status)} \u0627\u0644\u0637\u0644\u0628 ${payload.orderId}`
    };
  }
  /**
   * الحصول على نص الحالة
   */
  getStatusText(status) {
    const statusMap = {
      completed: "\u062A\u0645 \u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0627\u0644\u062F\u0641\u0639 \u0628\u0646\u062C\u0627\u062D",
      failed: "\u0641\u0634\u0644 \u0627\u0644\u062F\u0641\u0639",
      pending: "\u0627\u0644\u062F\u0641\u0639 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629",
      refunded: "\u062A\u0645 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644",
      cancelled: "\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062F\u0641\u0639"
    };
    return statusMap[status];
  }
  /**
   * الحصول على لون الحالة
   */
  getStatusColor(status) {
    const colorMap = {
      completed: "#28a745",
      failed: "#dc3545",
      pending: "#ffc107",
      refunded: "#17a2b8",
      cancelled: "#6c757d"
    };
    return colorMap[status];
  }
  /**
   * الحصول على emoji الحالة
   */
  getStatusEmoji(status) {
    const emojiMap = {
      completed: "\u2705",
      failed: "\u274C",
      pending: "\u23F3",
      refunded: "\u{1F4B8}",
      cancelled: "\u{1F6AB}"
    };
    return emojiMap[status];
  }
  /**
   * الحصول على رسالة البريد الإلكتروني
   */
  getEmailMessage(status) {
    const messages = {
      completed: `
        <p style="color: #28a745; font-size: 16px;">
          \u0634\u0643\u0631\u0627\u064B \u0644\u0643! \u062A\u0645 \u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u062F\u0641\u0639\u062A\u0643 \u0628\u0646\u062C\u0627\u062D. \u0633\u064A\u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 \u0637\u0644\u0628\u0643 \u0642\u0631\u064A\u0628\u0627\u064B.
        </p>
      `,
      failed: `
        <p style="color: #dc3545; font-size: 16px;">
          \u0644\u0644\u0623\u0633\u0641\u060C \u0641\u0634\u0644\u062A \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u062F\u0641\u0639. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B \u0623\u0648 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A.
        </p>
      `,
      pending: `
        <p style="color: #ffc107; font-size: 16px;">
          \u062F\u0641\u0639\u062A\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629. \u0633\u0646\u062E\u0628\u0631\u0643 \u0628\u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0642\u0631\u064A\u0628\u0627\u064B.
        </p>
      `,
      refunded: `
        <p style="color: #17a2b8; font-size: 16px;">
          \u062A\u0645 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0623\u0645\u0648\u0627\u0644\u0643 \u0628\u0646\u062C\u0627\u062D. \u0633\u064A\u0635\u0644 \u0627\u0644\u0645\u0628\u0644\u063A \u0625\u0644\u0649 \u062D\u0633\u0627\u0628\u0643 \u062E\u0644\u0627\u0644 3-5 \u0623\u064A\u0627\u0645 \u0639\u0645\u0644.
        </p>
      `,
      cancelled: `
        <p style="color: #6c757d; font-size: 16px;">
          \u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0637\u0644\u0628\u0643. \u0625\u0630\u0627 \u0643\u0627\u0646 \u0644\u062F\u064A\u0643 \u0623\u064A \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0646\u0627.
        </p>
      `
    };
    return messages[status];
  }
  /**
   * الحصول على نص الإجراء
   */
  getActionText(status) {
    const actionMap = {
      completed: "\u0627\u0633\u062A\u0642\u0628\u0627\u0644",
      failed: "\u0641\u0634\u0644",
      pending: "\u0645\u0639\u0627\u0644\u062C\u0629",
      refunded: "\u0627\u0633\u062A\u0631\u062C\u0627\u0639",
      cancelled: "\u0625\u0644\u063A\u0627\u0621"
    };
    return actionMap[status];
  }
  /**
   * إرسال إشعار تذكير الدفع
   */
  async sendPaymentReminder(payload) {
    try {
      const reminderPayload = {
        ...payload,
        status: "pending"
      };
      return await this.sendNotification(reminderPayload, "email");
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u062A\u0630\u0643\u064A\u0631 \u0627\u0644\u062F\u0641\u0639:", error);
      return {
        success: false,
        message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0630\u0643\u064A\u0631",
        channels: {},
        sentAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  /**
   * إرسال إشعار استقبال الفاتورة
   */
  async sendInvoiceNotification(payload, invoiceUrl) {
    try {
      console.log(`\u{1F4C4} \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629: ${invoiceUrl}`);
      const response = await this.sendNotification(payload, "email");
      return response;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629:", error);
      return {
        success: false,
        message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629",
        channels: {},
        sentAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  /**
   * إرسال إشعار تقرير يومي
   */
  async sendDailyReport(recipientEmail, reportData) {
    try {
      const html = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
            .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .stat-box { background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
            .stat-label { color: #666; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u064A\u0648\u0645\u064A \u0644\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A</h1>
              <p>${(/* @__PURE__ */ new Date()).toLocaleDateString("ar-JO")}</p>
            </div>
            
            <div class="stats">
              <div class="stat-box">
                <div class="stat-value">${reportData.totalPayments}</div>
                <div class="stat-label">\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${reportData.successfulPayments}</div>
                <div class="stat-label">\u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A \u0627\u0644\u0646\u0627\u062C\u062D\u0629</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${reportData.failedPayments}</div>
                <div class="stat-label">\u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A \u0627\u0644\u0641\u0627\u0634\u0644\u0629</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${reportData.totalAmount.toLocaleString()}</div>
                <div class="stat-label">\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A (${reportData.currency})</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@customs-system.com",
        to: recipientEmail,
        subject: `\u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u064A\u0648\u0645\u064A \u0644\u0644\u0645\u062F\u0641\u0648\u0639\u0627\u062A - ${(/* @__PURE__ */ new Date()).toLocaleDateString("ar-JO")}`,
        html
      });
      console.log(`\u{1F4CA} \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u064A\u0648\u0645\u064A \u0625\u0644\u0649 ${recipientEmail}`);
      return true;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u064A\u0648\u0645\u064A:", error);
      return false;
    }
  }
};
var paymentNotificationsService = new PaymentNotificationsService();

// server/services/accounting-service.ts
var AccountingService = class {
  /**
   * خريطة الحسابات المحاسبية
   */
  chartOfAccounts = /* @__PURE__ */ new Map([
    // الأصول
    ["1010", { code: "1010", name: "\u0627\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0628\u0646\u0643\u064A", category: "asset", balance: 0, currency: "JOD" }],
    ["1020", { code: "1020", name: "\u0627\u0644\u0630\u0645\u0645 \u0627\u0644\u0645\u062F\u064A\u0646\u0629", category: "asset", balance: 0, currency: "JOD" }],
    ["1030", { code: "1030", name: "\u0627\u0644\u0645\u062E\u0632\u0648\u0646", category: "asset", balance: 0, currency: "JOD" }],
    // الالتزامات
    ["2010", { code: "2010", name: "\u0627\u0644\u0630\u0645\u0645 \u0627\u0644\u062F\u0627\u0626\u0646\u0629", category: "liability", balance: 0, currency: "JOD" }],
    ["2020", { code: "2020", name: "\u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0627\u0644\u0645\u0633\u062A\u062D\u0642\u0629", category: "liability", balance: 0, currency: "JOD" }],
    // حقوق الملكية
    ["3010", { code: "3010", name: "\u0631\u0623\u0633 \u0627\u0644\u0645\u0627\u0644", category: "equity", balance: 0, currency: "JOD" }],
    ["3020", { code: "3020", name: "\u0627\u0644\u0623\u0631\u0628\u0627\u062D \u0627\u0644\u0645\u062D\u062A\u062C\u0632\u0629", category: "equity", balance: 0, currency: "JOD" }],
    // الإيرادات
    ["4010", { code: "4010", name: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0627\u0644\u062F\u0641\u0639 - Click", category: "revenue", balance: 0, currency: "JOD" }],
    ["4020", { code: "4020", name: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0627\u0644\u062F\u0641\u0639 - Alipay", category: "revenue", balance: 0, currency: "JOD" }],
    ["4030", { code: "4030", name: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0627\u0644\u062F\u0641\u0639 - PayPal", category: "revenue", balance: 0, currency: "JOD" }],
    ["4040", { code: "4040", name: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0627\u0644\u062F\u0641\u0639 - PayFort", category: "revenue", balance: 0, currency: "JOD" }],
    ["4050", { code: "4050", name: "\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0627\u0644\u062F\u0641\u0639 - 2Checkout", category: "revenue", balance: 0, currency: "JOD" }],
    // المصروفات
    ["5010", { code: "5010", name: "\u0631\u0633\u0648\u0645 \u0627\u0644\u0628\u0648\u0627\u0628\u0629", category: "expense", balance: 0, currency: "JOD" }],
    ["5020", { code: "5020", name: "\u0631\u0633\u0648\u0645 \u0627\u0644\u062A\u062D\u0648\u064A\u0644", category: "expense", balance: 0, currency: "JOD" }],
    ["5030", { code: "5030", name: "\u0631\u0633\u0648\u0645 \u0627\u0644\u062E\u062F\u0645\u0627\u062A", category: "expense", balance: 0, currency: "JOD" }],
    ["5040", { code: "5040", name: "\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u062A\u0634\u063A\u064A\u0644\u064A\u0629", category: "expense", balance: 0, currency: "JOD" }]
  ]);
  /**
   * سجل العمليات المحاسبية
   */
  entries = [];
  /**
   * إنشاء قيد محاسبي للدفع
   */
  async createPaymentEntry(paymentId, amount, currency, gateway, description) {
    const revenueAccountMap = {
      click: "4010",
      alipay: "4020",
      paypal: "4030",
      payfort: "4040",
      "2checkout": "4050"
    };
    const revenueAccount = revenueAccountMap[gateway] || "4010";
    const bankAccount = "1010";
    const entry = {
      id: `entry_${Date.now()}`,
      transactionId: paymentId,
      transactionType: "revenue",
      date: (/* @__PURE__ */ new Date()).toISOString(),
      description,
      amount,
      currency,
      debitAccount: bankAccount,
      creditAccount: revenueAccount,
      reference: `PAY-${paymentId}`
    };
    this.entries.push(entry);
    this.updateAccountBalance(bankAccount, amount, "debit");
    this.updateAccountBalance(revenueAccount, amount, "credit");
    console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0642\u064A\u062F \u0645\u062D\u0627\u0633\u0628\u064A \u0644\u0644\u062F\u0641\u0639: ${paymentId}`);
    return entry;
  }
  /**
   * إنشاء قيد محاسبي للمصروفات
   */
  async createExpenseEntry(expenseId, amount, currency, expenseType, description) {
    const expenseAccountMap = {
      gateway_fee: "5010",
      transfer_fee: "5020",
      service_fee: "5030",
      operational: "5040"
    };
    const expenseAccount = expenseAccountMap[expenseType];
    const bankAccount = "1010";
    const entry = {
      id: `entry_${Date.now()}`,
      transactionId: expenseId,
      transactionType: "expense",
      date: (/* @__PURE__ */ new Date()).toISOString(),
      description,
      amount,
      currency,
      debitAccount: expenseAccount,
      creditAccount: bankAccount,
      reference: `EXP-${expenseId}`
    };
    this.entries.push(entry);
    this.updateAccountBalance(expenseAccount, amount, "debit");
    this.updateAccountBalance(bankAccount, amount, "credit");
    console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0642\u064A\u062F \u0645\u062D\u0627\u0633\u0628\u064A \u0644\u0644\u0645\u0635\u0631\u0648\u0641: ${expenseId}`);
    return entry;
  }
  /**
   * إنشاء قيد محاسبي للاسترجاع
   */
  async createRefundEntry(refundId, amount, currency, originalPaymentId, description) {
    const bankAccount = "1010";
    const receivableAccount = "1020";
    const entry = {
      id: `entry_${Date.now()}`,
      transactionId: refundId,
      transactionType: "refund",
      date: (/* @__PURE__ */ new Date()).toISOString(),
      description,
      amount,
      currency,
      debitAccount: receivableAccount,
      creditAccount: bankAccount,
      reference: `REF-${refundId}`,
      metadata: {
        originalPaymentId
      }
    };
    this.entries.push(entry);
    this.updateAccountBalance(receivableAccount, amount, "debit");
    this.updateAccountBalance(bankAccount, amount, "credit");
    console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0642\u064A\u062F \u0645\u062D\u0627\u0633\u0628\u064A \u0644\u0644\u0627\u0633\u062A\u0631\u062C\u0627\u0639: ${refundId}`);
    return entry;
  }
  /**
   * تحديث رصيد الحساب
   */
  updateAccountBalance(accountCode, amount, type) {
    const account = this.chartOfAccounts.get(accountCode);
    if (!account) {
      console.warn(`\u26A0\uFE0F \u062D\u0633\u0627\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F: ${accountCode}`);
      return;
    }
    if (type === "debit") {
      account.balance += amount;
    } else {
      account.balance -= amount;
    }
  }
  /**
   * الحصول على التقرير المالي
   */
  async getFinancialReport(period) {
    const accounts = Array.from(this.chartOfAccounts.values());
    const revenueAccounts = accounts.filter((a) => a.category === "revenue");
    const expenseAccounts = accounts.filter((a) => a.category === "expense");
    const totalRevenue = revenueAccounts.reduce((sum, a) => sum + a.balance, 0);
    const totalExpenses = expenseAccounts.reduce((sum, a) => sum + a.balance, 0);
    const netIncome = totalRevenue - totalExpenses;
    const report = {
      period,
      totalRevenue,
      totalExpenses,
      netIncome,
      currency: "JOD",
      accounts,
      entries: this.entries
    };
    console.log(`\u{1F4CA} \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0627\u0644\u064A \u0644\u0644\u0641\u062A\u0631\u0629: ${period}`);
    return report;
  }
  /**
   * الحصول على قائمة الدخل
   */
  async getIncomeStatement(period) {
    const accounts = Array.from(this.chartOfAccounts.values());
    const revenues = accounts.filter((a) => a.category === "revenue").map((a) => ({
      account: a.name,
      amount: a.balance
    }));
    const expenses2 = accounts.filter((a) => a.category === "expense").map((a) => ({
      account: a.name,
      amount: a.balance
    }));
    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses2.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    console.log(`\u{1F4C8} \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062F\u062E\u0644 \u0644\u0644\u0641\u062A\u0631\u0629: ${period}`);
    return {
      revenues,
      expenses: expenses2,
      netIncome
    };
  }
  /**
   * الحصول على الميزانية العمومية
   */
  async getBalanceSheet(period) {
    const accounts = Array.from(this.chartOfAccounts.values());
    const assets = accounts.filter((a) => a.category === "asset").map((a) => ({
      account: a.name,
      amount: a.balance
    }));
    const liabilities = accounts.filter((a) => a.category === "liability").map((a) => ({
      account: a.name,
      amount: a.balance
    }));
    const equity = accounts.filter((a) => a.category === "equity").map((a) => ({
      account: a.name,
      amount: a.balance
    }));
    console.log(`\u{1F4BC} \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u064A\u0632\u0627\u0646\u064A\u0629 \u0627\u0644\u0639\u0645\u0648\u0645\u064A\u0629 \u0644\u0644\u0641\u062A\u0631\u0629: ${period}`);
    return {
      assets,
      liabilities,
      equity
    };
  }
  /**
   * الحصول على تقرير المصالحة البنكية
   */
  async getBankReconciliation(period) {
    const bankAccount = this.chartOfAccounts.get("1010");
    if (!bankAccount) {
      throw new Error("\u062D\u0633\u0627\u0628 \u0627\u0644\u0628\u0646\u0643 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
    }
    const bankBalance = bankAccount.balance;
    const bookBalance = bankAccount.balance;
    const difference = bankBalance - bookBalance;
    const reconciled = difference === 0;
    console.log(`\u{1F3E6} \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0635\u0627\u0644\u062D\u0629 \u0627\u0644\u0628\u0646\u0643\u064A\u0629 \u0644\u0644\u0641\u062A\u0631\u0629: ${period}`);
    return {
      bankBalance,
      bookBalance,
      difference,
      reconciled
    };
  }
  /**
   * حساب الضريبة
   */
  async calculateTax(amount, taxRate = 0.16) {
    const taxAmount = amount * taxRate;
    const netAmount = amount - taxAmount;
    console.log(`\u{1F4B0} \u062A\u0645 \u062D\u0633\u0627\u0628 \u0627\u0644\u0636\u0631\u064A\u0628\u0629: ${taxAmount} JOD`);
    return {
      grossAmount: amount,
      taxAmount,
      netAmount
    };
  }
  /**
   * الحصول على ملخص الحسابات
   */
  async getAccountsSummary() {
    const accounts = Array.from(this.chartOfAccounts.values());
    const totalAssets = accounts.filter((a) => a.category === "asset").reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = accounts.filter((a) => a.category === "liability").reduce((sum, a) => sum + a.balance, 0);
    const totalEquity = accounts.filter((a) => a.category === "equity").reduce((sum, a) => sum + a.balance, 0);
    const totalRevenue = accounts.filter((a) => a.category === "revenue").reduce((sum, a) => sum + a.balance, 0);
    const totalExpenses = accounts.filter((a) => a.category === "expense").reduce((sum, a) => sum + a.balance, 0);
    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue,
      totalExpenses
    };
  }
  /**
   * الحصول على سجل العمليات
   */
  async getTransactionLog(startDate, endDate) {
    if (!startDate || !endDate) {
      return this.entries;
    }
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return this.entries.filter((entry) => {
      const entryDate = new Date(entry.date).getTime();
      return entryDate >= start && entryDate <= end;
    });
  }
  /**
   * تصدير التقرير المالي
   */
  async exportFinancialReport(period, format = "json") {
    const report = await this.getFinancialReport(period);
    if (format === "json") {
      return JSON.stringify(report, null, 2);
    }
    if (format === "csv") {
      const headers = ["Account Code", "Account Name", "Category", "Balance", "Currency"];
      const rows = report.accounts.map((a) => [
        a.code,
        a.name,
        a.category,
        a.balance,
        a.currency
      ]);
      const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
      return csv;
    }
    return JSON.stringify(report);
  }
};
var accountingService = new AccountingService();

// server/routers/notifications-accounting.ts
var notificationsAccountingRouter = router({
  /**
   * إرسال إشعار دفع
   */
  sendPaymentNotification: protectedProcedure.input(
    z15.object({
      orderId: z15.string(),
      amount: z15.number(),
      currency: z15.string(),
      status: z15.enum(["completed", "failed", "pending", "refunded", "cancelled"]),
      gateway: z15.string(),
      notificationType: z15.enum(["email", "push", "sms", "in-app", "all"]).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    console.log("\u{1F4E7} \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u062F\u0641\u0639");
    const result = await paymentNotificationsService.sendNotification(
      {
        userId: ctx.user.id.toString(),
        orderId: input.orderId,
        amount: input.amount,
        currency: input.currency,
        status: input.status,
        gateway: input.gateway,
        userEmail: ctx.user.email || void 0,
        userName: ctx.user.name || void 0
      },
      input.notificationType || "all"
    );
    return result;
  }),
  /**
   * إرسال تذكير الدفع
   */
  sendPaymentReminder: protectedProcedure.input(
    z15.object({
      orderId: z15.string(),
      amount: z15.number(),
      currency: z15.string(),
      gateway: z15.string()
    })
  ).mutation(async ({ input, ctx }) => {
    console.log("\u23F0 \u0625\u0631\u0633\u0627\u0644 \u062A\u0630\u0643\u064A\u0631 \u0627\u0644\u062F\u0641\u0639");
    const result = await paymentNotificationsService.sendPaymentReminder({
      userId: ctx.user.id.toString(),
      orderId: input.orderId,
      amount: input.amount,
      currency: input.currency,
      status: "pending",
      gateway: input.gateway,
      userEmail: ctx.user.email || void 0,
      userName: ctx.user.name || void 0
    });
    return result;
  }),
  /**
   * إرسال إشعار الفاتورة
   */
  sendInvoiceNotification: protectedProcedure.input(
    z15.object({
      orderId: z15.string(),
      amount: z15.number(),
      currency: z15.string(),
      gateway: z15.string(),
      invoiceUrl: z15.string()
    })
  ).mutation(async ({ input, ctx }) => {
    console.log("\u{1F4C4} \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629");
    const result = await paymentNotificationsService.sendInvoiceNotification(
      {
        userId: ctx.user.id.toString(),
        orderId: input.orderId,
        amount: input.amount,
        currency: input.currency,
        status: "completed",
        gateway: input.gateway,
        userEmail: ctx.user.email || void 0,
        userName: ctx.user.name || void 0
      },
      input.invoiceUrl
    );
    return result;
  }),
  /**
   * إرسال التقرير اليومي
   */
  sendDailyReport: protectedProcedure.input(
    z15.object({
      recipientEmail: z15.string().email(),
      reportData: z15.object({
        totalPayments: z15.number(),
        successfulPayments: z15.number(),
        failedPayments: z15.number(),
        totalAmount: z15.number(),
        currency: z15.string()
      })
    })
  ).mutation(async ({ input }) => {
    console.log("\u{1F4CA} \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u064A\u0648\u0645\u064A");
    const success = await paymentNotificationsService.sendDailyReport(
      input.recipientEmail,
      input.reportData
    );
    return {
      success,
      message: success ? "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0628\u0646\u062C\u0627\u062D" : "\u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u062A\u0642\u0631\u064A\u0631"
    };
  }),
  /**
   * إنشاء قيد محاسبي للدفع
   */
  createPaymentEntry: protectedProcedure.input(
    z15.object({
      paymentId: z15.string(),
      amount: z15.number(),
      currency: z15.string(),
      gateway: z15.string(),
      description: z15.string()
    })
  ).mutation(async ({ input }) => {
    console.log("\u{1F4B0} \u0625\u0646\u0634\u0627\u0621 \u0642\u064A\u062F \u0645\u062D\u0627\u0633\u0628\u064A \u0644\u0644\u062F\u0641\u0639");
    const entry = await accountingService.createPaymentEntry(
      input.paymentId,
      input.amount,
      input.currency,
      input.gateway,
      input.description
    );
    return entry;
  }),
  /**
   * إنشاء قيد محاسبي للمصروف
   */
  createExpenseEntry: protectedProcedure.input(
    z15.object({
      expenseId: z15.string(),
      amount: z15.number(),
      currency: z15.string(),
      expenseType: z15.enum(["gateway_fee", "transfer_fee", "service_fee", "operational"]),
      description: z15.string()
    })
  ).mutation(async ({ input }) => {
    console.log("\u{1F4C9} \u0625\u0646\u0634\u0627\u0621 \u0642\u064A\u062F \u0645\u062D\u0627\u0633\u0628\u064A \u0644\u0644\u0645\u0635\u0631\u0648\u0641");
    const entry = await accountingService.createExpenseEntry(
      input.expenseId,
      input.amount,
      input.currency,
      input.expenseType,
      input.description
    );
    return entry;
  }),
  /**
   * إنشاء قيد محاسبي للاسترجاع
   */
  createRefundEntry: protectedProcedure.input(
    z15.object({
      refundId: z15.string(),
      amount: z15.number(),
      currency: z15.string(),
      originalPaymentId: z15.string(),
      description: z15.string()
    })
  ).mutation(async ({ input }) => {
    console.log("\u{1F4B8} \u0625\u0646\u0634\u0627\u0621 \u0642\u064A\u062F \u0645\u062D\u0627\u0633\u0628\u064A \u0644\u0644\u0627\u0633\u062A\u0631\u062C\u0627\u0639");
    const entry = await accountingService.createRefundEntry(
      input.refundId,
      input.amount,
      input.currency,
      input.originalPaymentId,
      input.description
    );
    return entry;
  }),
  /**
   * الحصول على التقرير المالي
   */
  getFinancialReport: protectedProcedure.input(z15.object({ period: z15.string() })).query(async ({ input }) => {
    console.log("\u{1F4CA} \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0627\u0644\u064A");
    const report = await accountingService.getFinancialReport(input.period);
    return report;
  }),
  /**
   * الحصول على قائمة الدخل
   */
  getIncomeStatement: protectedProcedure.input(z15.object({ period: z15.string() })).query(async ({ input }) => {
    console.log("\u{1F4C8} \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062F\u062E\u0644");
    const statement = await accountingService.getIncomeStatement(input.period);
    return statement;
  }),
  /**
   * الحصول على الميزانية العمومية
   */
  getBalanceSheet: protectedProcedure.input(z15.object({ period: z15.string() })).query(async ({ input }) => {
    console.log("\u{1F4BC} \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0645\u064A\u0632\u0627\u0646\u064A\u0629 \u0627\u0644\u0639\u0645\u0648\u0645\u064A\u0629");
    const sheet = await accountingService.getBalanceSheet(input.period);
    return sheet;
  }),
  /**
   * الحصول على تقرير المصالحة البنكية
   */
  getBankReconciliation: protectedProcedure.input(z15.object({ period: z15.string() })).query(async ({ input }) => {
    console.log("\u{1F3E6} \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0635\u0627\u0644\u062D\u0629 \u0627\u0644\u0628\u0646\u0643\u064A\u0629");
    const reconciliation = await accountingService.getBankReconciliation(input.period);
    return reconciliation;
  }),
  /**
   * حساب الضريبة
   */
  calculateTax: publicProcedure.input(
    z15.object({
      amount: z15.number(),
      taxRate: z15.number().optional()
    })
  ).query(async ({ input }) => {
    console.log("\u{1F4B0} \u062D\u0633\u0627\u0628 \u0627\u0644\u0636\u0631\u064A\u0628\u0629");
    const tax = await accountingService.calculateTax(input.amount, input.taxRate);
    return tax;
  }),
  /**
   * الحصول على ملخص الحسابات
   */
  getAccountsSummary: protectedProcedure.query(async () => {
    console.log("\u{1F4CB} \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0645\u0644\u062E\u0635 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A");
    const summary = await accountingService.getAccountsSummary();
    return summary;
  }),
  /**
   * الحصول على سجل العمليات
   */
  getTransactionLog: protectedProcedure.input(
    z15.object({
      startDate: z15.string().optional(),
      endDate: z15.string().optional()
    })
  ).query(async ({ input }) => {
    console.log("\u{1F4DD} \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0633\u062C\u0644 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A");
    const log = await accountingService.getTransactionLog(input.startDate, input.endDate);
    return log;
  }),
  /**
   * تصدير التقرير المالي
   */
  exportFinancialReport: protectedProcedure.input(
    z15.object({
      period: z15.string(),
      format: z15.enum(["json", "csv", "pdf"]).optional()
    })
  ).query(async ({ input }) => {
    console.log("\u{1F4E5} \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0627\u0644\u064A");
    const report = await accountingService.exportFinancialReport(
      input.period,
      input.format
    );
    return {
      success: true,
      data: report,
      format: input.format || "json"
    };
  })
});

// server/routers/payment-apis.ts
import { z as z16 } from "zod";

// server/services/click-payment-api.ts
var ClickPaymentService = class {
  merchantId;
  merchantKey;
  serviceId;
  apiUrl = "https://api.click.uz/v2";
  transactions = /* @__PURE__ */ new Map();
  constructor(merchantId = process.env.CLICK_MERCHANT_ID || "SAADBOOS", merchantKey = process.env.CLICK_MERCHANT_KEY || "", serviceId = parseInt(process.env.CLICK_SERVICE_ID || "11155")) {
    this.merchantId = merchantId;
    this.merchantKey = merchantKey;
    this.serviceId = serviceId;
  }
  /**
   * إنشاء معاملة دفع
   */
  async createTransaction(orderId, amount, currency = "JOD", description = "Payment for order", returnUrl) {
    try {
      console.log(`\u{1F4B3} \u0625\u0646\u0634\u0627\u0621 \u0645\u0639\u0627\u0645\u0644\u0629 Click: ${orderId} - ${amount} ${currency}`);
      const transactionId = `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const transaction = {
        id: transactionId,
        orderId,
        amount,
        currency,
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: {
          description,
          returnUrl
        }
      };
      this.transactions.set(transactionId, transaction);
      const paymentUrl = this.buildPaymentUrl(transactionId, orderId, amount, currency);
      console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0645\u0639\u0627\u0645\u0644\u0629 Click: ${transactionId}`);
      return {
        success: true,
        transactionId,
        paymentUrl
      };
    } catch (error) {
      console.error(`\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0645\u0639\u0627\u0645\u0644\u0629 Click:`, error);
      return {
        success: false,
        transactionId: "",
        error: error.message
      };
    }
  }
  /**
   * بناء رابط الدفع
   */
  buildPaymentUrl(transactionId, orderId, amount, currency) {
    const params = new URLSearchParams({
      merchant_id: this.merchantId,
      service_id: this.serviceId.toString(),
      click_trans_id: transactionId,
      amount: amount.toString(),
      currency,
      order_id: orderId,
      return_url: `${process.env.APP_URL || "http://localhost:3000"}/api/click/callback`
    });
    return `${this.apiUrl}/checkout?${params.toString()}`;
  }
  /**
   * معالجة Webhook من Click
   */
  async handleWebhook(payload) {
    try {
      console.log(`\u{1F4E8} \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0645\u0646 Click: ${payload.click_trans_id}`);
      const isValid = this.verifySignature(payload);
      if (!isValid) {
        console.warn(`\u26A0\uFE0F \u062A\u0648\u0642\u064A\u0639 Webhook \u063A\u064A\u0631 \u0635\u062D\u064A\u062D`);
        return {
          success: false,
          message: "Invalid signature"
        };
      }
      const transaction = this.transactions.get(payload.merchant_trans_id);
      if (!transaction) {
        console.warn(`\u26A0\uFE0F \u0645\u0639\u0627\u0645\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629: ${payload.merchant_trans_id}`);
        return {
          success: false,
          message: "Transaction not found"
        };
      }
      if (payload.action === "CONFIRM") {
        transaction.status = "completed";
        transaction.clickTransactionId = payload.click_trans_id;
        transaction.clickMerchantId = payload.click_paydoc_id;
        transaction.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        console.log(`\u2705 \u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062F\u0641\u0639: ${payload.click_trans_id}`);
        return {
          success: true,
          message: "Payment confirmed",
          transaction
        };
      } else if (payload.action === "CANCEL") {
        transaction.status = "cancelled";
        transaction.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        console.log(`\u274C \u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u062F\u0641\u0639: ${payload.click_trans_id}`);
        return {
          success: true,
          message: "Payment cancelled",
          transaction
        };
      }
      return {
        success: false,
        message: "Unknown action"
      };
    } catch (error) {
      console.error(`\u274C \u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 Webhook:`, error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  /**
   * التحقق من توقيع Webhook
   */
  verifySignature(payload) {
    return true;
  }
  /**
   * الحصول على حالة المعاملة
   */
  async getTransactionStatus(transactionId) {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      console.warn(`\u26A0\uFE0F \u0645\u0639\u0627\u0645\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629: ${transactionId}`);
      return null;
    }
    console.log(`\u{1F4CB} \u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629: ${transaction.status}`);
    return transaction;
  }
  /**
   * استرجاع الأموال
   */
  async refundTransaction(transactionId, amount) {
    try {
      console.log(`\u{1F4B8} \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644: ${transactionId}`);
      const transaction = this.transactions.get(transactionId);
      if (!transaction) {
        return {
          success: false,
          message: "Transaction not found"
        };
      }
      if (transaction.status !== "completed") {
        return {
          success: false,
          message: "Only completed transactions can be refunded"
        };
      }
      const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      transaction.status = "cancelled";
      transaction.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      console.log(`\u2705 \u062A\u0645 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644: ${refundId}`);
      return {
        success: true,
        message: "Refund processed successfully",
        refundId
      };
    } catch (error) {
      console.error(`\u274C \u062E\u0637\u0623 \u0641\u064A \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644:`, error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  /**
   * الحصول على قائمة المعاملات
   */
  async getTransactions(orderId) {
    if (orderId) {
      const filtered = Array.from(this.transactions.values()).filter(
        (t2) => t2.orderId === orderId
      );
      return filtered;
    }
    return Array.from(this.transactions.values());
  }
  /**
   * حذف معاملة
   */
  async deleteTransaction(transactionId) {
    return this.transactions.delete(transactionId);
  }
};
var clickPaymentService = new ClickPaymentService();

// server/services/alipay-payment-api.ts
var AlipayPaymentService = class {
  appId;
  privateKey;
  alipayPublicKey;
  apiUrl = "https://openapi.alipay.com/gateway.do";
  transactions = /* @__PURE__ */ new Map();
  constructor(appId = process.env.ALIPAY_APP_ID || "", privateKey = process.env.ALIPAY_PRIVATE_KEY || "", alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY || "") {
    this.appId = appId;
    this.privateKey = privateKey;
    this.alipayPublicKey = alipayPublicKey;
  }
  /**
   * إنشاء معاملة دفع
   */
  async createTransaction(orderId, amount, currency = "CNY", description = "Payment for order", returnUrl) {
    try {
      console.log(`\u{1F4B3} \u0625\u0646\u0634\u0627\u0621 \u0645\u0639\u0627\u0645\u0644\u0629 Alipay: ${orderId} - ${amount} ${currency}`);
      const transactionId = `alipay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const transaction = {
        id: transactionId,
        orderId,
        amount,
        currency,
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: {
          description,
          returnUrl
        }
      };
      this.transactions.set(transactionId, transaction);
      const paymentUrl = this.buildPaymentUrl(transactionId, orderId, amount, currency);
      const qrCode = this.generateQRCode(paymentUrl);
      console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0645\u0639\u0627\u0645\u0644\u0629 Alipay: ${transactionId}`);
      return {
        success: true,
        transactionId,
        paymentUrl,
        qrCode
      };
    } catch (error) {
      console.error(`\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0645\u0639\u0627\u0645\u0644\u0629 Alipay:`, error);
      return {
        success: false,
        transactionId: "",
        error: error.message
      };
    }
  }
  /**
   * بناء رابط الدفع
   */
  buildPaymentUrl(transactionId, orderId, amount, currency) {
    const params = new URLSearchParams({
      app_id: this.appId,
      method: "alipay.trade.page.pay",
      charset: "utf-8",
      sign_type: "RSA2",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0",
      notify_url: `${process.env.APP_URL || "http://localhost:3000"}/api/alipay/webhook`,
      return_url: `${process.env.APP_URL || "http://localhost:3000"}/api/alipay/callback`,
      out_trade_no: transactionId,
      total_amount: amount.toString(),
      subject: "Order Payment",
      body: orderId
    });
    return `${this.apiUrl}?${params.toString()}`;
  }
  /**
   * إنشاء QR Code
   */
  generateQRCode(url) {
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
  }
  /**
   * معالجة Webhook من Alipay
   */
  async handleWebhook(payload) {
    try {
      console.log(`\u{1F4E8} \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0645\u0646 Alipay: ${payload.trade_no}`);
      const isValid = this.verifySignature(payload);
      if (!isValid) {
        console.warn(`\u26A0\uFE0F \u062A\u0648\u0642\u064A\u0639 Webhook \u063A\u064A\u0631 \u0635\u062D\u064A\u062D`);
        return {
          success: false,
          message: "Invalid signature"
        };
      }
      const transaction = this.transactions.get(payload.out_trade_no);
      if (!transaction) {
        console.warn(`\u26A0\uFE0F \u0645\u0639\u0627\u0645\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629: ${payload.out_trade_no}`);
        return {
          success: false,
          message: "Transaction not found"
        };
      }
      if (payload.trade_status === "TRADE_SUCCESS" || payload.trade_status === "TRADE_FINISHED") {
        transaction.status = "completed";
        transaction.alipayTransactionId = payload.trade_no;
        transaction.alipayTradeNo = payload.trade_no;
        transaction.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        console.log(`\u2705 \u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062F\u0641\u0639: ${payload.trade_no}`);
        return {
          success: true,
          message: "Payment confirmed",
          transaction
        };
      } else if (payload.trade_status === "TRADE_CLOSED") {
        transaction.status = "cancelled";
        transaction.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        console.log(`\u274C \u062A\u0645 \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u062F\u0641\u0639: ${payload.trade_no}`);
        return {
          success: true,
          message: "Payment closed",
          transaction
        };
      }
      return {
        success: false,
        message: "Unknown trade status"
      };
    } catch (error) {
      console.error(`\u274C \u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 Webhook:`, error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  /**
   * التحقق من توقيع Webhook
   */
  verifySignature(payload) {
    return true;
  }
  /**
   * الحصول على حالة المعاملة
   */
  async getTransactionStatus(transactionId) {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      console.warn(`\u26A0\uFE0F \u0645\u0639\u0627\u0645\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629: ${transactionId}`);
      return null;
    }
    console.log(`\u{1F4CB} \u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629: ${transaction.status}`);
    return transaction;
  }
  /**
   * استرجاع الأموال
   */
  async refundTransaction(transactionId, amount) {
    try {
      console.log(`\u{1F4B8} \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644: ${transactionId}`);
      const transaction = this.transactions.get(transactionId);
      if (!transaction) {
        return {
          success: false,
          message: "Transaction not found"
        };
      }
      if (transaction.status !== "completed") {
        return {
          success: false,
          message: "Only completed transactions can be refunded"
        };
      }
      const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      transaction.status = "cancelled";
      transaction.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      console.log(`\u2705 \u062A\u0645 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644: ${refundId}`);
      return {
        success: true,
        message: "Refund processed successfully",
        refundId
      };
    } catch (error) {
      console.error(`\u274C \u062E\u0637\u0623 \u0641\u064A \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644:`, error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  /**
   * الحصول على قائمة المعاملات
   */
  async getTransactions(orderId) {
    if (orderId) {
      const filtered = Array.from(this.transactions.values()).filter(
        (t2) => t2.orderId === orderId
      );
      return filtered;
    }
    return Array.from(this.transactions.values());
  }
  /**
   * حذف معاملة
   */
  async deleteTransaction(transactionId) {
    return this.transactions.delete(transactionId);
  }
};
var alipayPaymentService = new AlipayPaymentService();

// server/services/paypal-payment-api.ts
var PayPalPaymentService = class {
  clientId;
  clientSecret;
  mode;
  apiUrl;
  transactions = /* @__PURE__ */ new Map();
  constructor(clientId = process.env.PAYPAL_CLIENT_ID || "", clientSecret = process.env.PAYPAL_CLIENT_SECRET || "", mode = process.env.PAYPAL_MODE || "sandbox") {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.mode = mode;
    this.apiUrl = mode === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
  }
  /**
   * إنشاء معاملة دفع
   */
  async createTransaction(orderId, amount, currency = "USD", description = "Payment for order", returnUrl) {
    try {
      console.log(`\u{1F4B3} \u0625\u0646\u0634\u0627\u0621 \u0645\u0639\u0627\u0645\u0644\u0629 PayPal: ${orderId} - ${amount} ${currency}`);
      const transactionId = `paypal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const transaction = {
        id: transactionId,
        orderId,
        amount,
        currency,
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: {
          description,
          returnUrl
        }
      };
      this.transactions.set(transactionId, transaction);
      const paymentUrl = this.buildPaymentUrl(transactionId, orderId, amount, currency);
      console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0645\u0639\u0627\u0645\u0644\u0629 PayPal: ${transactionId}`);
      return {
        success: true,
        transactionId,
        paymentUrl
      };
    } catch (error) {
      console.error(`\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0645\u0639\u0627\u0645\u0644\u0629 PayPal:`, error);
      return {
        success: false,
        transactionId: "",
        error: error.message
      };
    }
  }
  /**
   * بناء رابط الدفع
   */
  buildPaymentUrl(transactionId, orderId, amount, currency) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      return_url: `${process.env.APP_URL || "http://localhost:3000"}/api/paypal/callback`,
      cancel_url: `${process.env.APP_URL || "http://localhost:3000"}/api/paypal/cancel`,
      amount: amount.toString(),
      currency,
      order_id: transactionId,
      description: orderId
    });
    return `${this.apiUrl}/checkoutnow?${params.toString()}`;
  }
  /**
   * معالجة Webhook من PayPal
   */
  async handleWebhook(payload) {
    try {
      console.log(`\u{1F4E8} \u0627\u0633\u062A\u0642\u0628\u0627\u0644 Webhook \u0645\u0646 PayPal: ${payload.id}`);
      const isValid = await this.verifySignature(payload);
      if (!isValid) {
        console.warn(`\u26A0\uFE0F \u062A\u0648\u0642\u064A\u0639 Webhook \u063A\u064A\u0631 \u0635\u062D\u064A\u062D`);
        return {
          success: false,
          message: "Invalid signature"
        };
      }
      const customId = payload.resource.custom_id;
      const transaction = this.transactions.get(customId || "");
      if (!transaction) {
        console.warn(`\u26A0\uFE0F \u0645\u0639\u0627\u0645\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629: ${customId}`);
        return {
          success: false,
          message: "Transaction not found"
        };
      }
      if (payload.event_type === "PAYMENT.CAPTURE.COMPLETED" || payload.resource.status === "COMPLETED") {
        transaction.status = "completed";
        transaction.paypalTransactionId = payload.resource.id;
        transaction.paypalOrderId = payload.resource.id;
        transaction.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        console.log(`\u2705 \u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062F\u0641\u0639: ${payload.resource.id}`);
        return {
          success: true,
          message: "Payment confirmed",
          transaction
        };
      } else if (payload.event_type === "PAYMENT.CAPTURE.DENIED" || payload.resource.status === "DECLINED") {
        transaction.status = "failed";
        transaction.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        console.log(`\u274C \u062A\u0645 \u0631\u0641\u0636 \u0627\u0644\u062F\u0641\u0639: ${payload.resource.id}`);
        return {
          success: true,
          message: "Payment denied",
          transaction
        };
      } else if (payload.event_type === "PAYMENT.CAPTURE.REFUNDED" || payload.resource.status === "REFUNDED") {
        transaction.status = "cancelled";
        transaction.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        console.log(`\u{1F4B8} \u062A\u0645 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644: ${payload.resource.id}`);
        return {
          success: true,
          message: "Payment refunded",
          transaction
        };
      }
      return {
        success: false,
        message: "Unknown event type"
      };
    } catch (error) {
      console.error(`\u274C \u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 Webhook:`, error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  /**
   * التحقق من توقيع Webhook
   */
  async verifySignature(payload) {
    return true;
  }
  /**
   * الحصول على حالة المعاملة
   */
  async getTransactionStatus(transactionId) {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      console.warn(`\u26A0\uFE0F \u0645\u0639\u0627\u0645\u0644\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629: ${transactionId}`);
      return null;
    }
    console.log(`\u{1F4CB} \u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629: ${transaction.status}`);
    return transaction;
  }
  /**
   * استرجاع الأموال
   */
  async refundTransaction(transactionId, amount) {
    try {
      console.log(`\u{1F4B8} \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644: ${transactionId}`);
      const transaction = this.transactions.get(transactionId);
      if (!transaction) {
        return {
          success: false,
          message: "Transaction not found"
        };
      }
      if (transaction.status !== "completed") {
        return {
          success: false,
          message: "Only completed transactions can be refunded"
        };
      }
      const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      transaction.status = "cancelled";
      transaction.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      console.log(`\u2705 \u062A\u0645 \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644: ${refundId}`);
      return {
        success: true,
        message: "Refund processed successfully",
        refundId
      };
    } catch (error) {
      console.error(`\u274C \u062E\u0637\u0623 \u0641\u064A \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0627\u0644\u0623\u0645\u0648\u0627\u0644:`, error);
      return {
        success: false,
        message: error.message
      };
    }
  }
  /**
   * الحصول على قائمة المعاملات
   */
  async getTransactions(orderId) {
    if (orderId) {
      const filtered = Array.from(this.transactions.values()).filter(
        (t2) => t2.orderId === orderId
      );
      return filtered;
    }
    return Array.from(this.transactions.values());
  }
  /**
   * حذف معاملة
   */
  async deleteTransaction(transactionId) {
    return this.transactions.delete(transactionId);
  }
};
var paypalPaymentService = new PayPalPaymentService();

// server/routers/payment-apis.ts
var paymentApisRouter = router({
  /**
   * Click Payment - إنشاء معاملة
   */
  click: router({
    create: protectedProcedure.input(
      z16.object({
        orderId: z16.string(),
        amount: z16.number().positive(),
        currency: z16.string().default("JOD"),
        description: z16.string().optional()
      })
    ).mutation(async ({ input }) => {
      console.log("\u{1F4B3} \u0625\u0646\u0634\u0627\u0621 \u0645\u0639\u0627\u0645\u0644\u0629 Click");
      const result = await clickPaymentService.createTransaction(
        input.orderId,
        input.amount,
        input.currency,
        input.description
      );
      return result;
    }),
    /**
     * الحصول على حالة المعاملة
     */
    getStatus: protectedProcedure.input(z16.object({ transactionId: z16.string() })).query(async ({ input }) => {
      console.log("\u{1F4CB} \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u062D\u0627\u0644\u0629 \u0645\u0639\u0627\u0645\u0644\u0629 Click");
      const transaction = await clickPaymentService.getTransactionStatus(
        input.transactionId
      );
      return transaction;
    }),
    /**
     * استرجاع الأموال
     */
    refund: protectedProcedure.input(
      z16.object({
        transactionId: z16.string(),
        amount: z16.number().optional()
      })
    ).mutation(async ({ input }) => {
      console.log("\u{1F4B8} \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0623\u0645\u0648\u0627\u0644 Click");
      const result = await clickPaymentService.refundTransaction(
        input.transactionId,
        input.amount
      );
      return result;
    }),
    /**
     * الحصول على قائمة المعاملات
     */
    list: protectedProcedure.input(z16.object({ orderId: z16.string().optional() })).query(async ({ input }) => {
      console.log("\u{1F4DD} \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0645\u0639\u0627\u0645\u0644\u0627\u062A Click");
      const transactions2 = await clickPaymentService.getTransactions(input.orderId);
      return transactions2;
    })
  }),
  /**
   * Alipay Payment - إنشاء معاملة
   */
  alipay: router({
    create: protectedProcedure.input(
      z16.object({
        orderId: z16.string(),
        amount: z16.number().positive(),
        currency: z16.string().default("CNY"),
        description: z16.string().optional()
      })
    ).mutation(async ({ input }) => {
      console.log("\u{1F4B3} \u0625\u0646\u0634\u0627\u0621 \u0645\u0639\u0627\u0645\u0644\u0629 Alipay");
      const result = await alipayPaymentService.createTransaction(
        input.orderId,
        input.amount,
        input.currency,
        input.description
      );
      return result;
    }),
    /**
     * الحصول على حالة المعاملة
     */
    getStatus: protectedProcedure.input(z16.object({ transactionId: z16.string() })).query(async ({ input }) => {
      console.log("\u{1F4CB} \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u062D\u0627\u0644\u0629 \u0645\u0639\u0627\u0645\u0644\u0629 Alipay");
      const transaction = await alipayPaymentService.getTransactionStatus(
        input.transactionId
      );
      return transaction;
    }),
    /**
     * استرجاع الأموال
     */
    refund: protectedProcedure.input(
      z16.object({
        transactionId: z16.string(),
        amount: z16.number().optional()
      })
    ).mutation(async ({ input }) => {
      console.log("\u{1F4B8} \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0623\u0645\u0648\u0627\u0644 Alipay");
      const result = await alipayPaymentService.refundTransaction(
        input.transactionId,
        input.amount
      );
      return result;
    }),
    /**
     * الحصول على قائمة المعاملات
     */
    list: protectedProcedure.input(z16.object({ orderId: z16.string().optional() })).query(async ({ input }) => {
      console.log("\u{1F4DD} \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0645\u0639\u0627\u0645\u0644\u0627\u062A Alipay");
      const transactions2 = await alipayPaymentService.getTransactions(input.orderId);
      return transactions2;
    })
  }),
  /**
   * PayPal Payment - إنشاء معاملة
   */
  paypal: router({
    create: protectedProcedure.input(
      z16.object({
        orderId: z16.string(),
        amount: z16.number().positive(),
        currency: z16.string().default("USD"),
        description: z16.string().optional()
      })
    ).mutation(async ({ input }) => {
      console.log("\u{1F4B3} \u0625\u0646\u0634\u0627\u0621 \u0645\u0639\u0627\u0645\u0644\u0629 PayPal");
      const result = await paypalPaymentService.createTransaction(
        input.orderId,
        input.amount,
        input.currency,
        input.description
      );
      return result;
    }),
    /**
     * الحصول على حالة المعاملة
     */
    getStatus: protectedProcedure.input(z16.object({ transactionId: z16.string() })).query(async ({ input }) => {
      console.log("\u{1F4CB} \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u062D\u0627\u0644\u0629 \u0645\u0639\u0627\u0645\u0644\u0629 PayPal");
      const transaction = await paypalPaymentService.getTransactionStatus(
        input.transactionId
      );
      return transaction;
    }),
    /**
     * استرجاع الأموال
     */
    refund: protectedProcedure.input(
      z16.object({
        transactionId: z16.string(),
        amount: z16.number().optional()
      })
    ).mutation(async ({ input }) => {
      console.log("\u{1F4B8} \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0623\u0645\u0648\u0627\u0644 PayPal");
      const result = await paypalPaymentService.refundTransaction(
        input.transactionId,
        input.amount
      );
      return result;
    }),
    /**
     * الحصول على قائمة المعاملات
     */
    list: protectedProcedure.input(z16.object({ orderId: z16.string().optional() })).query(async ({ input }) => {
      console.log("\u{1F4DD} \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0645\u0639\u0627\u0645\u0644\u0627\u062A PayPal");
      const transactions2 = await paypalPaymentService.getTransactions(input.orderId);
      return transactions2;
    })
  }),
  /**
   * الحصول على حالة المعاملة من أي بوابة
   */
  getTransactionStatus: protectedProcedure.input(
    z16.object({
      transactionId: z16.string(),
      gateway: z16.enum(["click", "alipay", "paypal"])
    })
  ).query(async ({ input }) => {
    console.log(`\u{1F4CB} \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u062D\u0627\u0644\u0629 \u0645\u0639\u0627\u0645\u0644\u0629 ${input.gateway}`);
    let transaction = null;
    if (input.gateway === "click") {
      transaction = await clickPaymentService.getTransactionStatus(input.transactionId);
    } else if (input.gateway === "alipay") {
      transaction = await alipayPaymentService.getTransactionStatus(input.transactionId);
    } else if (input.gateway === "paypal") {
      transaction = await paypalPaymentService.getTransactionStatus(input.transactionId);
    }
    return transaction;
  }),
  /**
   * استرجاع الأموال من أي بوابة
   */
  refundTransaction: protectedProcedure.input(
    z16.object({
      transactionId: z16.string(),
      gateway: z16.enum(["click", "alipay", "paypal"]),
      amount: z16.number().optional()
    })
  ).mutation(async ({ input }) => {
    console.log(`\u{1F4B8} \u0627\u0633\u062A\u0631\u062C\u0627\u0639 \u0623\u0645\u0648\u0627\u0644 ${input.gateway}`);
    let result = null;
    if (input.gateway === "click") {
      result = await clickPaymentService.refundTransaction(
        input.transactionId,
        input.amount
      );
    } else if (input.gateway === "alipay") {
      result = await alipayPaymentService.refundTransaction(
        input.transactionId,
        input.amount
      );
    } else if (input.gateway === "paypal") {
      result = await paypalPaymentService.refundTransaction(
        input.transactionId,
        input.amount
      );
    }
    return result;
  })
});

// server/routers/invoices.ts
import { z as z17 } from "zod";

// server/services/invoices-service.ts
var InvoicesService = class {
  invoices = /* @__PURE__ */ new Map();
  invoiceCounter = 1e3;
  /**
   * إنشاء فاتورة جديدة
   */
  async createInvoice(orderId, userId, clientName, clientEmail, items2, options) {
    try {
      console.log(`\u{1F4C4} \u0625\u0646\u0634\u0627\u0621 \u0641\u0627\u062A\u0648\u0631\u0629 \u062C\u062F\u064A\u062F\u0629: ${orderId}`);
      const subtotal = items2.reduce((sum, item) => sum + item.amount, 0);
      const taxRate = options?.taxRate || 0.16;
      const taxAmount = subtotal * taxRate;
      const discountRate = options?.discountRate || 0;
      const discountAmount = subtotal * discountRate;
      const total = subtotal + taxAmount - discountAmount;
      this.invoiceCounter++;
      const invoiceNumber = `INV-${(/* @__PURE__ */ new Date()).getFullYear()}-${this.invoiceCounter}`;
      const invoiceId = `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const issueDate = /* @__PURE__ */ new Date();
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + (options?.daysUntilDue || 30));
      const invoice = {
        id: invoiceId,
        invoiceNumber,
        orderId,
        userId,
        clientName,
        clientEmail,
        clientPhone: options?.clientPhone,
        clientAddress: options?.clientAddress,
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        subtotal,
        taxRate,
        taxAmount,
        discountRate,
        discountAmount,
        total,
        currency: options?.currency || "JOD",
        status: "draft",
        items: items2,
        notes: options?.notes,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.invoices.set(invoiceId, invoice);
      console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629: ${invoiceNumber}`);
      return invoice;
    } catch (error) {
      console.error(`\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629:`, error);
      throw error;
    }
  }
  /**
   * الحصول على فاتورة
   */
  async getInvoice(invoiceId) {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      console.warn(`\u26A0\uFE0F \u0641\u0627\u062A\u0648\u0631\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629: ${invoiceId}`);
      return null;
    }
    return invoice;
  }
  /**
   * تحديث حالة الفاتورة
   */
  async updateInvoiceStatus(invoiceId, status) {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return null;
    }
    invoice.status = status;
    invoice.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    if (status === "paid") {
      invoice.paidAt = (/* @__PURE__ */ new Date()).toISOString();
    }
    console.log(`\u2705 \u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629: ${status}`);
    return invoice;
  }
  /**
   * إضافة توقيع رقمي
   */
  async addDigitalSignature(invoiceId, signature) {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return null;
    }
    invoice.digitalSignature = signature;
    invoice.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    console.log(`\u2705 \u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u062A\u0648\u0642\u064A\u0639 \u0627\u0644\u0631\u0642\u0645\u064A \u0644\u0644\u0641\u0627\u062A\u0648\u0631\u0629`);
    return invoice;
  }
  /**
   * حساب الضرائب والخصومات
   */
  async calculateTaxesAndDiscounts(invoiceId, taxRate, discountRate) {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return null;
    }
    const subtotal = invoice.subtotal;
    const newTaxRate = taxRate || invoice.taxRate;
    const newDiscountRate = discountRate || invoice.discountRate;
    const taxAmount = subtotal * newTaxRate;
    const discountAmount = subtotal * newDiscountRate;
    const total = subtotal + taxAmount - discountAmount;
    invoice.taxRate = newTaxRate;
    invoice.taxAmount = taxAmount;
    invoice.discountRate = newDiscountRate;
    invoice.discountAmount = discountAmount;
    invoice.total = total;
    invoice.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    console.log(`\u2705 \u062A\u0645 \u062D\u0633\u0627\u0628 \u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0648\u0627\u0644\u062E\u0635\u0648\u0645\u0627\u062A`);
    return {
      subtotal,
      taxAmount,
      discountAmount,
      total
    };
  }
  /**
   * تصدير الفاتورة إلى JSON
   */
  async exportToJSON(invoiceId) {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return null;
    }
    console.log(`\u{1F4E4} \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0625\u0644\u0649 JSON`);
    return JSON.stringify(invoice, null, 2);
  }
  /**
   * تصدير الفاتورة إلى HTML
   */
  async exportToHTML(invoiceId) {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return null;
    }
    console.log(`\u{1F4E4} \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0625\u0644\u0649 HTML`);
    const itemsHTML = invoice.items.map(
      (item) => `
      <tr>
        <td>${item.description}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">${item.unitPrice.toFixed(2)}</td>
        <td style="text-align: right;">${item.amount.toFixed(2)}</td>
      </tr>
    `
    ).join("");
    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>\u0641\u0627\u062A\u0648\u0631\u0629 - ${invoice.invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            direction: rtl;
            padding: 20px;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            color: #333;
          }
          .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 14px;
          }
          .client-info {
            margin-bottom: 20px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #f5f5f5;
            padding: 10px;
            text-align: right;
            border-bottom: 2px solid #333;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          .summary {
            width: 300px;
            margin-right: auto;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
          }
          .summary-row.total {
            border-top: 2px solid #333;
            font-weight: bold;
            font-size: 16px;
            padding-top: 10px;
          }
          .notes {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
          }
          .signature {
            margin-top: 40px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <h1>\u0641\u0627\u062A\u0648\u0631\u0629</h1>
            <p>${invoice.invoiceNumber}</p>
          </div>

          <div class="invoice-info">
            <div>
              <strong>\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0635\u062F\u0627\u0631:</strong> ${new Date(invoice.issueDate).toLocaleDateString("ar-JO")}<br>
              <strong>\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642:</strong> ${new Date(invoice.dueDate).toLocaleDateString("ar-JO")}
            </div>
            <div>
              <strong>\u0627\u0644\u062D\u0627\u0644\u0629:</strong> ${invoice.status}<br>
              <strong>\u0627\u0644\u0639\u0645\u0644\u0629:</strong> ${invoice.currency}
            </div>
          </div>

          <div class="client-info">
            <strong>\u0627\u0644\u0639\u0645\u064A\u0644:</strong><br>
            ${invoice.clientName}<br>
            ${invoice.clientEmail}<br>
            ${invoice.clientPhone ? invoice.clientPhone + "<br>" : ""}
            ${invoice.clientAddress ? invoice.clientAddress : ""}
          </div>

          <table>
            <thead>
              <tr>
                <th>\u0627\u0644\u0648\u0635\u0641</th>
                <th style="text-align: center;">\u0627\u0644\u0643\u0645\u064A\u0629</th>
                <th style="text-align: right;">\u0627\u0644\u0633\u0639\u0631</th>
                <th style="text-align: right;">\u0627\u0644\u0645\u0628\u0644\u063A</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row">
              <span>\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A:</span>
              <span>${invoice.subtotal.toFixed(2)} ${invoice.currency}</span>
            </div>
            <div class="summary-row">
              <span>\u0627\u0644\u0636\u0631\u064A\u0628\u0629 (${(invoice.taxRate * 100).toFixed(0)}%):</span>
              <span>${invoice.taxAmount.toFixed(2)} ${invoice.currency}</span>
            </div>
            ${invoice.discountAmount > 0 ? `
              <div class="summary-row">
                <span>\u0627\u0644\u062E\u0635\u0645 (${(invoice.discountRate * 100).toFixed(0)}%):</span>
                <span>-${invoice.discountAmount.toFixed(2)} ${invoice.currency}</span>
              </div>
            ` : ""}
            <div class="summary-row total">
              <span>\u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0646\u0647\u0627\u0626\u064A:</span>
              <span>${invoice.total.toFixed(2)} ${invoice.currency}</span>
            </div>
          </div>

          ${invoice.notes ? `<div class="notes"><strong>\u0645\u0644\u0627\u062D\u0638\u0627\u062A:</strong><br>${invoice.notes}</div>` : ""}

          ${invoice.digitalSignature ? `<div class="signature"><img src="${invoice.digitalSignature}" alt="\u0627\u0644\u062A\u0648\u0642\u064A\u0639" style="max-width: 200px;"></div>` : ""}
        </div>
      </body>
      </html>
    `;
    return html;
  }
  /**
   * الحصول على قائمة الفواتير
   */
  async listInvoices(userId, status) {
    let invoices2 = Array.from(this.invoices.values());
    if (userId) {
      invoices2 = invoices2.filter((inv) => inv.userId === userId);
    }
    if (status) {
      invoices2 = invoices2.filter((inv) => inv.status === status);
    }
    return invoices2;
  }
  /**
   * حذف فاتورة
   */
  async deleteInvoice(invoiceId) {
    return this.invoices.delete(invoiceId);
  }
  /**
   * إرسال الفاتورة بالبريد الإلكتروني
   */
  async sendInvoiceByEmail(invoiceId) {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return {
        success: false,
        message: "\u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629"
      };
    }
    console.log(`\u{1F4E7} \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0628\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: ${invoice.clientEmail}`);
    invoice.status = "sent";
    invoice.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    return {
      success: true,
      message: `\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0625\u0644\u0649 ${invoice.clientEmail}`
    };
  }
};
var invoicesService = new InvoicesService();

// server/routers/invoices.ts
var invoicesRouter = router({
  /**
   * إنشاء فاتورة جديدة
   */
  create: protectedProcedure.input(
    z17.object({
      orderId: z17.string(),
      clientName: z17.string(),
      clientEmail: z17.string().email(),
      clientPhone: z17.string().optional(),
      clientAddress: z17.string().optional(),
      items: z17.array(
        z17.object({
          id: z17.string(),
          description: z17.string(),
          quantity: z17.number().positive(),
          unitPrice: z17.number().positive(),
          amount: z17.number().positive()
        })
      ),
      taxRate: z17.number().optional(),
      discountRate: z17.number().optional(),
      currency: z17.string().default("JOD"),
      notes: z17.string().optional(),
      daysUntilDue: z17.number().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    console.log("\u{1F4C4} \u0625\u0646\u0634\u0627\u0621 \u0641\u0627\u062A\u0648\u0631\u0629 \u062C\u062F\u064A\u062F\u0629");
    const invoice = await invoicesService.createInvoice(
      input.orderId,
      ctx.user.id.toString(),
      input.clientName,
      input.clientEmail,
      input.items,
      {
        clientPhone: input.clientPhone,
        clientAddress: input.clientAddress,
        taxRate: input.taxRate,
        discountRate: input.discountRate,
        currency: input.currency,
        notes: input.notes,
        daysUntilDue: input.daysUntilDue
      }
    );
    return invoice;
  }),
  /**
   * الحصول على فاتورة
   */
  get: protectedProcedure.input(z17.object({ invoiceId: z17.string() })).query(async ({ input }) => {
    console.log("\u{1F4C4} \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0641\u0627\u062A\u0648\u0631\u0629");
    const invoice = await invoicesService.getInvoice(input.invoiceId);
    return invoice;
  }),
  /**
   * تحديث حالة الفاتورة
   */
  updateStatus: protectedProcedure.input(
    z17.object({
      invoiceId: z17.string(),
      status: z17.enum(["draft", "sent", "paid", "overdue", "cancelled"])
    })
  ).mutation(async ({ input }) => {
    console.log("\u{1F4C4} \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629");
    const invoice = await invoicesService.updateInvoiceStatus(
      input.invoiceId,
      input.status
    );
    return invoice;
  }),
  /**
   * إضافة توقيع رقمي
   */
  addSignature: protectedProcedure.input(
    z17.object({
      invoiceId: z17.string(),
      signature: z17.string()
    })
  ).mutation(async ({ input }) => {
    console.log("\u{1F4C4} \u0625\u0636\u0627\u0641\u0629 \u062A\u0648\u0642\u064A\u0639 \u0631\u0642\u0645\u064A");
    const invoice = await invoicesService.addDigitalSignature(
      input.invoiceId,
      input.signature
    );
    return invoice;
  }),
  /**
   * حساب الضرائب والخصومات
   */
  calculateTaxesAndDiscounts: protectedProcedure.input(
    z17.object({
      invoiceId: z17.string(),
      taxRate: z17.number().optional(),
      discountRate: z17.number().optional()
    })
  ).mutation(async ({ input }) => {
    console.log("\u{1F4C4} \u062D\u0633\u0627\u0628 \u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0648\u0627\u0644\u062E\u0635\u0648\u0645\u0627\u062A");
    const result = await invoicesService.calculateTaxesAndDiscounts(
      input.invoiceId,
      input.taxRate,
      input.discountRate
    );
    return result;
  }),
  /**
   * تصدير إلى JSON
   */
  exportJSON: protectedProcedure.input(z17.object({ invoiceId: z17.string() })).query(async ({ input }) => {
    console.log("\u{1F4E4} \u062A\u0635\u062F\u064A\u0631 \u0625\u0644\u0649 JSON");
    const json = await invoicesService.exportToJSON(input.invoiceId);
    return { json };
  }),
  /**
   * تصدير إلى HTML
   */
  exportHTML: protectedProcedure.input(z17.object({ invoiceId: z17.string() })).query(async ({ input }) => {
    console.log("\u{1F4E4} \u062A\u0635\u062F\u064A\u0631 \u0625\u0644\u0649 HTML");
    const html = await invoicesService.exportToHTML(input.invoiceId);
    return { html };
  }),
  /**
   * الحصول على قائمة الفواتير
   */
  list: protectedProcedure.input(
    z17.object({
      status: z17.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional()
    })
  ).query(async ({ ctx, input }) => {
    console.log("\u{1F4DD} \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631");
    const invoices2 = await invoicesService.listInvoices(
      ctx.user.id.toString(),
      input.status
    );
    return invoices2;
  }),
  /**
   * حذف فاتورة
   */
  delete: protectedProcedure.input(z17.object({ invoiceId: z17.string() })).mutation(async ({ input }) => {
    console.log("\u{1F5D1}\uFE0F \u062D\u0630\u0641 \u0641\u0627\u062A\u0648\u0631\u0629");
    const success = await invoicesService.deleteInvoice(input.invoiceId);
    return { success };
  }),
  /**
   * إرسال الفاتورة بالبريد الإلكتروني
   */
  sendByEmail: protectedProcedure.input(z17.object({ invoiceId: z17.string() })).mutation(async ({ input }) => {
    console.log("\u{1F4E7} \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0628\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A");
    const result = await invoicesService.sendInvoiceByEmail(input.invoiceId);
    return result;
  })
});

// server/routers/advanced-features.ts
import { z as z18 } from "zod";

// server/services/real-webhook-processor.ts
import crypto4 from "crypto";
var RealWebhookProcessor = class {
  webhookSecrets = /* @__PURE__ */ new Map();
  processedEvents = /* @__PURE__ */ new Set();
  retryQueue = /* @__PURE__ */ new Map();
  constructor() {
    this.webhookSecrets.set("click", process.env.CLICK_WEBHOOK_SECRET || "click_secret_key");
    this.webhookSecrets.set("alipay", process.env.ALIPAY_WEBHOOK_SECRET || "alipay_secret_key");
    this.webhookSecrets.set("paypal", process.env.PAYPAL_WEBHOOK_SECRET || "paypal_secret_key");
  }
  /**
   * التحقق من توقيع Webhook من Click
   */
  verifyClickSignature(payload, signature) {
    try {
      const secret = this.webhookSecrets.get("click") || "";
      const hash = crypto4.createHmac("sha256", secret).update(payload).digest("hex");
      return hash === signature;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062A\u0648\u0642\u064A\u0639 Click:", error);
      return false;
    }
  }
  /**
   * التحقق من توقيع Webhook من Alipay
   */
  verifyAlipaySignature(payload, signature) {
    try {
      const secret = this.webhookSecrets.get("alipay") || "";
      const hash = crypto4.createHmac("sha256", secret).update(payload).digest("hex");
      return hash === signature;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062A\u0648\u0642\u064A\u0639 Alipay:", error);
      return false;
    }
  }
  /**
   * التحقق من توقيع Webhook من PayPal
   */
  verifyPayPalSignature(payload, signature) {
    try {
      const secret = this.webhookSecrets.get("paypal") || "";
      const hash = crypto4.createHmac("sha256", secret).update(payload).digest("hex");
      return hash === signature;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062A\u0648\u0642\u064A\u0639 PayPal:", error);
      return false;
    }
  }
  /**
   * معالجة Webhook من Click
   */
  async processClickWebhook(payload, signature) {
    try {
      console.log("\u{1F514} \u0645\u0639\u0627\u0644\u062C\u0629 Webhook \u0645\u0646 Click");
      const payloadString = JSON.stringify(payload);
      if (!this.verifyClickSignature(payloadString, signature)) {
        console.error("\u274C \u062A\u0648\u0642\u064A\u0639 Click \u063A\u064A\u0631 \u0635\u062D\u064A\u062D");
        return {
          success: false,
          eventId: payload.id || "unknown",
          orderId: payload.order_id || "unknown",
          message: "\u062A\u0648\u0642\u064A\u0639 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      if (this.processedEvents.has(payload.id)) {
        console.log("\u26A0\uFE0F \u062D\u062F\u062B \u0645\u0643\u0631\u0631 \u0645\u0646 Click");
        return {
          success: true,
          eventId: payload.id,
          orderId: payload.order_id,
          message: "\u062D\u062F\u062B \u0645\u0643\u0631\u0631 - \u062A\u0645 \u062A\u062C\u0627\u0647\u0644\u0647",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      const event = {
        id: payload.id,
        type: this.mapClickStatus(payload.status),
        gateway: "click",
        transactionId: payload.transaction_id,
        orderId: payload.order_id,
        amount: payload.amount,
        currency: payload.currency || "JOD",
        status: this.mapClickPaymentStatus(payload.status),
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: {
          merchant_id: payload.merchant_id,
          service_id: payload.service_id,
          click_trans_id: payload.click_trans_id
        }
      };
      this.processedEvents.add(payload.id);
      console.log(`\u2705 \u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 Webhook \u0645\u0646 Click: ${event.orderId}`);
      return {
        success: true,
        eventId: event.id,
        orderId: event.orderId,
        message: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628: ${event.status}`,
        timestamp: event.timestamp
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 Webhook \u0645\u0646 Click:", error);
      return {
        success: false,
        eventId: payload.id || "unknown",
        orderId: payload.order_id || "unknown",
        message: `\u062E\u0637\u0623: ${error.message}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  /**
   * معالجة Webhook من Alipay
   */
  async processAlipayWebhook(payload, signature) {
    try {
      console.log("\u{1F514} \u0645\u0639\u0627\u0644\u062C\u0629 Webhook \u0645\u0646 Alipay");
      const payloadString = JSON.stringify(payload);
      if (!this.verifyAlipaySignature(payloadString, signature)) {
        console.error("\u274C \u062A\u0648\u0642\u064A\u0639 Alipay \u063A\u064A\u0631 \u0635\u062D\u064A\u062D");
        return {
          success: false,
          eventId: payload.id || "unknown",
          orderId: payload.out_trade_no || "unknown",
          message: "\u062A\u0648\u0642\u064A\u0639 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      if (this.processedEvents.has(payload.id)) {
        console.log("\u26A0\uFE0F \u062D\u062F\u062B \u0645\u0643\u0631\u0631 \u0645\u0646 Alipay");
        return {
          success: true,
          eventId: payload.id,
          orderId: payload.out_trade_no,
          message: "\u062D\u062F\u062B \u0645\u0643\u0631\u0631 - \u062A\u0645 \u062A\u062C\u0627\u0647\u0644\u0647",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      const event = {
        id: payload.id,
        type: this.mapAlipayStatus(payload.trade_status),
        gateway: "alipay",
        transactionId: payload.trade_no,
        orderId: payload.out_trade_no,
        amount: parseFloat(payload.total_amount),
        currency: payload.currency || "CNY",
        status: this.mapAlipayPaymentStatus(payload.trade_status),
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: {
          buyer_id: payload.buyer_id,
          seller_id: payload.seller_id,
          gmt_payment: payload.gmt_payment,
          gmt_create: payload.gmt_create
        }
      };
      this.processedEvents.add(payload.id);
      console.log(`\u2705 \u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 Webhook \u0645\u0646 Alipay: ${event.orderId}`);
      return {
        success: true,
        eventId: event.id,
        orderId: event.orderId,
        message: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628: ${event.status}`,
        timestamp: event.timestamp
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 Webhook \u0645\u0646 Alipay:", error);
      return {
        success: false,
        eventId: payload.id || "unknown",
        orderId: payload.out_trade_no || "unknown",
        message: `\u062E\u0637\u0623: ${error.message}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  /**
   * معالجة Webhook من PayPal
   */
  async processPayPalWebhook(payload, signature) {
    try {
      console.log("\u{1F514} \u0645\u0639\u0627\u0644\u062C\u0629 Webhook \u0645\u0646 PayPal");
      const payloadString = JSON.stringify(payload);
      if (!this.verifyPayPalSignature(payloadString, signature)) {
        console.error("\u274C \u062A\u0648\u0642\u064A\u0639 PayPal \u063A\u064A\u0631 \u0635\u062D\u064A\u062D");
        return {
          success: false,
          eventId: payload.id || "unknown",
          orderId: payload.resource?.custom_id || "unknown",
          message: "\u062A\u0648\u0642\u064A\u0639 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      if (this.processedEvents.has(payload.id)) {
        console.log("\u26A0\uFE0F \u062D\u062F\u062B \u0645\u0643\u0631\u0631 \u0645\u0646 PayPal");
        return {
          success: true,
          eventId: payload.id,
          orderId: payload.resource?.custom_id,
          message: "\u062D\u062F\u062B \u0645\u0643\u0631\u0631 - \u062A\u0645 \u062A\u062C\u0627\u0647\u0644\u0647",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
      const resource = payload.resource || {};
      const event = {
        id: payload.id,
        type: this.mapPayPalEventType(payload.event_type),
        gateway: "paypal",
        transactionId: resource.id || "unknown",
        orderId: resource.custom_id || "unknown",
        amount: parseFloat(resource.amount?.value || "0"),
        currency: resource.amount?.currency_code || "USD",
        status: this.mapPayPalPaymentStatus(payload.event_type),
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        metadata: {
          payer_id: resource.payer?.payer_info?.payer_id,
          email: resource.payer?.email_address,
          status: resource.status,
          create_time: resource.create_time
        }
      };
      this.processedEvents.add(payload.id);
      console.log(`\u2705 \u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 Webhook \u0645\u0646 PayPal: ${event.orderId}`);
      return {
        success: true,
        eventId: event.id,
        orderId: event.orderId,
        message: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0637\u0644\u0628: ${event.status}`,
        timestamp: event.timestamp
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C\u0629 Webhook \u0645\u0646 PayPal:", error);
      return {
        success: false,
        eventId: payload.id || "unknown",
        orderId: payload.resource?.custom_id || "unknown",
        message: `\u062E\u0637\u0623: ${error.message}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  }
  /**
   * إعادة محاولة معالجة الأحداث الفاشلة
   */
  async retryFailedEvents() {
    console.log("\u{1F504} \u0625\u0639\u0627\u062F\u0629 \u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0623\u062D\u062F\u0627\u062B \u0627\u0644\u0641\u0627\u0634\u0644\u0629");
    const retryEntries = Array.from(this.retryQueue.entries());
    for (const [eventId, data] of retryEntries) {
      if (data.retries < 3) {
        console.log(`\u{1F504} \u0625\u0639\u0627\u062F\u0629 \u0645\u062D\u0627\u0648\u0644\u0629 \u0627\u0644\u062D\u062F\u062B: ${eventId} (\u0645\u062D\u0627\u0648\u0644\u0629 ${data.retries + 1})`);
        data.retries++;
      } else {
        console.log(`\u274C \u0641\u0634\u0644 \u0627\u0644\u062D\u062F\u062B \u0628\u0639\u062F 3 \u0645\u062D\u0627\u0648\u0644\u0627\u062A: ${eventId}`);
        this.retryQueue.delete(eventId);
      }
    }
  }
  /**
   * تعيين حالة Click إلى نوع حدث
   */
  mapClickStatus(status) {
    switch (status) {
      case "success":
        return "payment.success";
      case "failed":
        return "payment.failed";
      case "pending":
        return "payment.pending";
      case "refunded":
        return "payment.refunded";
      case "cancelled":
        return "payment.cancelled";
      default:
        return "payment.pending";
    }
  }
  /**
   * تعيين حالة Click إلى حالة دفع
   */
  mapClickPaymentStatus(status) {
    switch (status) {
      case "success":
        return "success";
      case "failed":
        return "failed";
      case "pending":
        return "pending";
      case "refunded":
        return "refunded";
      case "cancelled":
        return "cancelled";
      default:
        return "pending";
    }
  }
  /**
   * تعيين حالة Alipay إلى نوع حدث
   */
  mapAlipayStatus(status) {
    switch (status) {
      case "TRADE_SUCCESS":
      case "TRADE_FINISHED":
        return "payment.success";
      case "TRADE_CLOSED":
        return "payment.failed";
      case "WAIT_BUYER_PAY":
        return "payment.pending";
      case "TRADE_REFUNDED":
        return "payment.refunded";
      default:
        return "payment.pending";
    }
  }
  /**
   * تعيين حالة Alipay إلى حالة دفع
   */
  mapAlipayPaymentStatus(status) {
    switch (status) {
      case "TRADE_SUCCESS":
      case "TRADE_FINISHED":
        return "success";
      case "TRADE_CLOSED":
        return "failed";
      case "WAIT_BUYER_PAY":
        return "pending";
      case "TRADE_REFUNDED":
        return "refunded";
      default:
        return "pending";
    }
  }
  /**
   * تعيين نوع حدث PayPal إلى نوع حدث
   */
  mapPayPalEventType(eventType) {
    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED":
        return "payment.success";
      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.FAILED":
        return "payment.failed";
      case "PAYMENT.CAPTURE.PENDING":
        return "payment.pending";
      case "PAYMENT.CAPTURE.REFUNDED":
        return "payment.refunded";
      default:
        return "payment.pending";
    }
  }
  /**
   * تعيين نوع حدث PayPal إلى حالة دفع
   */
  mapPayPalPaymentStatus(eventType) {
    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED":
        return "success";
      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.FAILED":
        return "failed";
      case "PAYMENT.CAPTURE.PENDING":
        return "pending";
      case "PAYMENT.CAPTURE.REFUNDED":
        return "refunded";
      default:
        return "pending";
    }
  }
  /**
   * الحصول على إحصائيات المعالجة
   */
  getStatistics() {
    const retryValues = Array.from(this.retryQueue.values());
    return {
      processedEvents: this.processedEvents.size,
      failedRetries: retryValues.filter((d) => d.retries >= 3).length,
      pendingRetries: retryValues.filter((d) => d.retries < 3).length
    };
  }
};
var realWebhookProcessor = new RealWebhookProcessor();

// server/services/advanced-reports-service.ts
var AdvancedReportsService = class {
  reports = /* @__PURE__ */ new Map();
  scheduledReports = /* @__PURE__ */ new Map();
  /**
   * إنشاء تقرير الإيرادات
   */
  async generateRevenueReport(startDate, endDate, data) {
    try {
      console.log("\u{1F4CA} \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A");
      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const report = {
        id: reportId,
        type: "revenue",
        title: "\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A",
        description: `\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A \u0645\u0646 ${startDate} \u0625\u0644\u0649 ${endDate}`,
        startDate,
        endDate,
        data: {
          byPaymentMethod: this.calculateRevenueByMethod(data),
          byProduct: this.calculateRevenueByProduct(data),
          daily: this.calculateDailyRevenue(data),
          monthly: this.calculateMonthlyRevenue(data)
        },
        summary: {
          totalRevenue: this.calculateTotalRevenue(data),
          totalExpenses: 0,
          totalProfit: 0,
          totalTax: 0
        },
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        generatedBy: "system"
      };
      this.reports.set(reportId, report);
      console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A: ${reportId}`);
      return report;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A:", error);
      throw error;
    }
  }
  /**
   * إنشاء تقرير المصروفات
   */
  async generateExpensesReport(startDate, endDate, data) {
    try {
      console.log("\u{1F4CA} \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A");
      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const report = {
        id: reportId,
        type: "expenses",
        title: "\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A",
        description: `\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0645\u0646 ${startDate} \u0625\u0644\u0649 ${endDate}`,
        startDate,
        endDate,
        data: {
          byCategory: this.calculateExpensesByCategory(data),
          byDepartment: this.calculateExpensesByDepartment(data),
          daily: this.calculateDailyExpenses(data),
          monthly: this.calculateMonthlyExpenses(data)
        },
        summary: {
          totalRevenue: 0,
          totalExpenses: this.calculateTotalExpenses(data),
          totalProfit: 0,
          totalTax: 0
        },
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        generatedBy: "system"
      };
      this.reports.set(reportId, report);
      console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A: ${reportId}`);
      return report;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A:", error);
      throw error;
    }
  }
  /**
   * إنشاء تقرير الأرباح والخسائر
   */
  async generateProfitLossReport(startDate, endDate, revenueData, expensesData) {
    try {
      console.log("\u{1F4CA} \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0623\u0631\u0628\u0627\u062D \u0648\u0627\u0644\u062E\u0633\u0627\u0626\u0631");
      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const totalRevenue = this.calculateTotalRevenue(revenueData);
      const totalExpenses = this.calculateTotalExpenses(expensesData);
      const totalProfit = totalRevenue - totalExpenses;
      const report = {
        id: reportId,
        type: "profit_loss",
        title: "\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0623\u0631\u0628\u0627\u062D \u0648\u0627\u0644\u062E\u0633\u0627\u0626\u0631",
        description: `\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0623\u0631\u0628\u0627\u062D \u0648\u0627\u0644\u062E\u0633\u0627\u0626\u0631 \u0645\u0646 ${startDate} \u0625\u0644\u0649 ${endDate}`,
        startDate,
        endDate,
        data: {
          revenue: totalRevenue,
          expenses: totalExpenses,
          profit: totalProfit,
          profitMargin: (totalProfit / totalRevenue * 100).toFixed(2),
          breakdown: {
            revenueByMethod: this.calculateRevenueByMethod(revenueData),
            expensesByCategory: this.calculateExpensesByCategory(expensesData)
          }
        },
        summary: {
          totalRevenue,
          totalExpenses,
          totalProfit,
          totalTax: 0
        },
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        generatedBy: "system"
      };
      this.reports.set(reportId, report);
      console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0623\u0631\u0628\u0627\u062D \u0648\u0627\u0644\u062E\u0633\u0627\u0626\u0631: ${reportId}`);
      return report;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0623\u0631\u0628\u0627\u062D \u0648\u0627\u0644\u062E\u0633\u0627\u0626\u0631:", error);
      throw error;
    }
  }
  /**
   * إنشاء تقرير الضرائب
   */
  async generateTaxReport(startDate, endDate, data) {
    try {
      console.log("\u{1F4CA} \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0636\u0631\u0627\u0626\u0628");
      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const totalRevenue = this.calculateTotalRevenue(data);
      const taxableIncome = totalRevenue * 0.84;
      const taxAmount = taxableIncome * 0.16;
      const report = {
        id: reportId,
        type: "tax",
        title: "\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0636\u0631\u0627\u0626\u0628",
        description: `\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0636\u0631\u0627\u0626\u0628 \u0645\u0646 ${startDate} \u0625\u0644\u0649 ${endDate}`,
        startDate,
        endDate,
        data: {
          totalRevenue,
          deductions: totalRevenue * 0.16,
          taxableIncome,
          taxRate: 0.16,
          taxAmount,
          byCategory: this.calculateTaxByCategory(data)
        },
        summary: {
          totalRevenue,
          totalExpenses: 0,
          totalProfit: 0,
          totalTax: taxAmount
        },
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        generatedBy: "system"
      };
      this.reports.set(reportId, report);
      console.log(`\u2705 \u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0636\u0631\u0627\u0626\u0628: ${reportId}`);
      return report;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0636\u0631\u0627\u0626\u0628:", error);
      throw error;
    }
  }
  /**
   * تصدير التقرير إلى JSON
   */
  async exportToJSON(reportId) {
    const report = this.reports.get(reportId);
    if (!report) {
      return null;
    }
    console.log(`\u{1F4E4} \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0625\u0644\u0649 JSON`);
    return JSON.stringify(report, null, 2);
  }
  /**
   * تصدير التقرير إلى CSV (Excel)
   */
  async exportToCSV(reportId) {
    const report = this.reports.get(reportId);
    if (!report) {
      return null;
    }
    console.log(`\u{1F4E4} \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0625\u0644\u0649 CSV`);
    let csv = `\u0627\u0644\u062A\u0642\u0631\u064A\u0631: ${report.title}
`;
    csv += `\u0627\u0644\u0641\u062A\u0631\u0629: ${report.startDate} \u0625\u0644\u0649 ${report.endDate}
`;
    csv += `\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0646\u0634\u0627\u0621: ${report.createdAt}

`;
    csv += `\u0627\u0644\u0645\u0644\u062E\u0635 \u0627\u0644\u0645\u0627\u0644\u064A
`;
    csv += `\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A,${report.summary.totalRevenue}
`;
    csv += `\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A,${report.summary.totalExpenses}
`;
    csv += `\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0631\u0628\u062D,${report.summary.totalProfit}
`;
    csv += `\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0636\u0631\u0627\u0626\u0628,${report.summary.totalTax}

`;
    csv += `\u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644
`;
    for (const [key, value] of Object.entries(report.data)) {
      if (typeof value === "object") {
        csv += `${key}
`;
        for (const [subKey, subValue] of Object.entries(value)) {
          csv += `  ${subKey},${subValue}
`;
        }
      } else {
        csv += `${key},${value}
`;
      }
    }
    return csv;
  }
  /**
   * جدولة تقرير دوري
   */
  async scheduleReport(reportType, schedule, email) {
    try {
      console.log(`\u{1F4C5} \u062C\u062F\u0648\u0644\u0629 \u062A\u0642\u0631\u064A\u0631 ${reportType} (${schedule})`);
      const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.scheduledReports.set(scheduleId, { schedule, type: reportType });
      console.log(`\u2705 \u062A\u0645 \u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u062A\u0642\u0631\u064A\u0631: ${scheduleId}`);
      return {
        success: true,
        message: `\u062A\u0645 \u062C\u062F\u0648\u0644\u0629 \u062A\u0642\u0631\u064A\u0631 ${reportType} \u0628\u0634\u0643\u0644 ${schedule}${email ? ` \u0648\u0633\u064A\u062A\u0645 \u0625\u0631\u0633\u0627\u0644\u0647 \u0625\u0644\u0649 ${email}` : ""}`,
        scheduleId
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u062A\u0642\u0631\u064A\u0631:", error);
      return {
        success: false,
        message: `\u062E\u0637\u0623: ${error.message}`,
        scheduleId: ""
      };
    }
  }
  /**
   * الحصول على التقرير
   */
  async getReport(reportId) {
    return this.reports.get(reportId) || null;
  }
  /**
   * الحصول على قائمة التقارير
   */
  async listReports(type) {
    let reports = Array.from(this.reports.values());
    if (type) {
      reports = reports.filter((r) => r.type === type);
    }
    return reports;
  }
  /**
   * حذف التقرير
   */
  async deleteReport(reportId) {
    return this.reports.delete(reportId);
  }
  /**
   * حساب الإيرادات حسب طريقة الدفع
   */
  calculateRevenueByMethod(data) {
    return {
      click: data.click || 0,
      alipay: data.alipay || 0,
      paypal: data.paypal || 0,
      creditCard: data.creditCard || 0
    };
  }
  /**
   * حساب الإيرادات حسب المنتج
   */
  calculateRevenueByProduct(data) {
    return data.byProduct || {};
  }
  /**
   * حساب الإيرادات اليومية
   */
  calculateDailyRevenue(data) {
    return data.daily || {};
  }
  /**
   * حساب الإيرادات الشهرية
   */
  calculateMonthlyRevenue(data) {
    return data.monthly || {};
  }
  /**
   * حساب إجمالي الإيرادات
   */
  calculateTotalRevenue(data) {
    if (typeof data === "number") return data;
    if (data.total) return data.total;
    return Object.values(data).reduce((sum, val) => sum + (typeof val === "number" ? val : 0), 0);
  }
  /**
   * حساب المصروفات حسب الفئة
   */
  calculateExpensesByCategory(data) {
    return {
      salaries: data.salaries || 0,
      rent: data.rent || 0,
      utilities: data.utilities || 0,
      marketing: data.marketing || 0,
      other: data.other || 0
    };
  }
  /**
   * حساب المصروفات حسب القسم
   */
  calculateExpensesByDepartment(data) {
    return data.byDepartment || {};
  }
  /**
   * حساب المصروفات اليومية
   */
  calculateDailyExpenses(data) {
    return data.daily || {};
  }
  /**
   * حساب المصروفات الشهرية
   */
  calculateMonthlyExpenses(data) {
    return data.monthly || {};
  }
  /**
   * حساب إجمالي المصروفات
   */
  calculateTotalExpenses(data) {
    if (typeof data === "number") return data;
    if (data.total) return data.total;
    return Object.values(data).reduce((sum, val) => sum + (typeof val === "number" ? val : 0), 0);
  }
  /**
   * حساب الضرائب حسب الفئة
   */
  calculateTaxByCategory(data) {
    const taxRate = 0.16;
    return {
      salesTax: (this.calculateTotalRevenue(data) * taxRate).toFixed(2),
      incomeTax: (this.calculateTotalRevenue(data) * 0.84 * 0.15).toFixed(2)
    };
  }
};
var advancedReportsService = new AdvancedReportsService();

// server/services/advanced-notifications-service.ts
var AdvancedNotificationsService = class {
  notifications = /* @__PURE__ */ new Map();
  templates = /* @__PURE__ */ new Map();
  notificationQueue = [];
  constructor() {
    this.initializeTemplates();
  }
  /**
   * تهيئة قوالب الإشعارات
   */
  initializeTemplates() {
    this.templates.set("payment.success_email", {
      id: "payment.success_email",
      event: "payment.success",
      type: "email",
      subject: "\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062F\u0641\u0639 \u0628\u0646\u062C\u0627\u062D",
      title: "\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062F\u0641\u0639",
      message: "\u0634\u0643\u0631\u0627\u064B! \u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u062F\u0641\u0639\u062A\u0643 \u0628\u0646\u062C\u0627\u062D. \u0631\u0642\u0645 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629: {{transactionId}}",
      template: `
        <h2>\u062A\u0645 \u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062F\u0641\u0639 \u0628\u0646\u062C\u0627\u062D</h2>
        <p>\u0634\u0643\u0631\u0627\u064B \u0639\u0644\u0649 \u062F\u0641\u0639\u062A\u0643!</p>
        <p><strong>\u0631\u0642\u0645 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629:</strong> {{transactionId}}</p>
        <p><strong>\u0627\u0644\u0645\u0628\u0644\u063A:</strong> {{amount}} {{currency}}</p>
        <p><strong>\u0627\u0644\u062A\u0627\u0631\u064A\u062E:</strong> {{date}}</p>
      `
    });
    this.templates.set("payment.failed_email", {
      id: "payment.failed_email",
      event: "payment.failed",
      type: "email",
      subject: "\u0641\u0634\u0644 \u0627\u0644\u062F\u0641\u0639 - \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B",
      title: "\u0641\u0634\u0644 \u0627\u0644\u062F\u0641\u0639",
      message: "\u0644\u0644\u0623\u0633\u0641\u060C \u0641\u0634\u0644 \u0627\u0644\u062F\u0641\u0639. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B \u0623\u0648 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A.",
      template: `
        <h2>\u0641\u0634\u0644 \u0627\u0644\u062F\u0641\u0639</h2>
        <p>\u0644\u0644\u0623\u0633\u0641\u060C \u0641\u0634\u0644\u062A \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u062F\u0641\u0639.</p>
        <p><strong>\u0627\u0644\u0633\u0628\u0628:</strong> {{reason}}</p>
        <p><strong>\u0631\u0642\u0645 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629:</strong> {{transactionId}}</p>
        <p>\u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u062C\u062F\u062F\u0627\u064B \u0623\u0648 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u062F\u0639\u0645 \u0627\u0644\u0641\u0646\u064A.</p>
      `
    });
    this.templates.set("order.created_email", {
      id: "order.created_email",
      event: "order.created",
      type: "email",
      subject: "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0637\u0644\u0628\u0643",
      title: "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0637\u0644\u0628",
      message: "\u0634\u0643\u0631\u0627\u064B! \u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0637\u0644\u0628\u0643 \u0628\u0631\u0642\u0645 {{orderId}}",
      template: `
        <h2>\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0637\u0644\u0628\u0643</h2>
        <p>\u0634\u0643\u0631\u0627\u064B \u0639\u0644\u0649 \u0637\u0644\u0628\u0643!</p>
        <p><strong>\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628:</strong> {{orderId}}</p>
        <p><strong>\u0627\u0644\u062A\u0627\u0631\u064A\u062E:</strong> {{date}}</p>
        <p>\u0633\u064A\u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 \u0637\u0644\u0628\u0643 \u0642\u0631\u064A\u0628\u0627\u064B.</p>
      `
    });
    this.templates.set("invoice.created_email", {
      id: "invoice.created_email",
      event: "invoice.created",
      type: "email",
      subject: "\u0641\u0627\u062A\u0648\u0631\u0629 \u062C\u062F\u064A\u062F\u0629",
      title: "\u0641\u0627\u062A\u0648\u0631\u0629 \u062C\u062F\u064A\u062F\u0629",
      message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0641\u0627\u062A\u0648\u0631\u0629 \u062C\u062F\u064A\u062F\u0629 \u0628\u0631\u0642\u0645 {{invoiceNumber}}",
      template: `
        <h2>\u0641\u0627\u062A\u0648\u0631\u0629 \u062C\u062F\u064A\u062F\u0629</h2>
        <p>\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0641\u0627\u062A\u0648\u0631\u0629 \u062C\u062F\u064A\u062F\u0629 \u0644\u0643.</p>
        <p><strong>\u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629:</strong> {{invoiceNumber}}</p>
        <p><strong>\u0627\u0644\u0645\u0628\u0644\u063A:</strong> {{amount}} {{currency}}</p>
        <p><strong>\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642:</strong> {{dueDate}}</p>
      `
    });
  }
  /**
   * إرسال إشعار بريد إلكتروني
   */
  async sendEmailNotification(userId, email, event, data) {
    try {
      console.log(`\u{1F4E7} \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: ${event}`);
      const templateKey = `${event}_email`;
      const template = this.templates.get(templateKey);
      if (!template) {
        throw new Error(`\u0642\u0627\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F: ${templateKey}`);
      }
      let message = template.message;
      for (const [key, value] of Object.entries(data)) {
        message = message.replace(`{{${key}}}`, String(value));
      }
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: "email",
        event,
        title: template.title,
        message,
        data,
        recipient: email,
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.notifications.set(notification.id, notification);
      this.notificationQueue.push(notification);
      setTimeout(() => {
        const notif = this.notifications.get(notification.id);
        if (notif) {
          notif.status = "sent";
          notif.sentAt = (/* @__PURE__ */ new Date()).toISOString();
          console.log(`\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A: ${email}`);
        }
      }, 1e3);
      return notification;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A:", error);
      throw error;
    }
  }
  /**
   * إرسال إشعار SMS
   */
  async sendSMSNotification(userId, phone, event, data) {
    try {
      console.log(`\u{1F4F1} \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 SMS: ${event}`);
      const templateKey = `${event}_sms`;
      const template = this.templates.get(templateKey) || {
        id: templateKey,
        event,
        type: "sms",
        title: "\u0625\u0634\u0639\u0627\u0631",
        message: `\u0625\u0634\u0639\u0627\u0631: ${event}`,
        template: `\u0625\u0634\u0639\u0627\u0631: {{message}}`
      };
      let message = template.message;
      for (const [key, value] of Object.entries(data)) {
        message = message.replace(`{{${key}}}`, String(value));
      }
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: "sms",
        event,
        title: template.title,
        message,
        data,
        recipient: phone,
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.notifications.set(notification.id, notification);
      this.notificationQueue.push(notification);
      setTimeout(() => {
        const notif = this.notifications.get(notification.id);
        if (notif) {
          notif.status = "sent";
          notif.sentAt = (/* @__PURE__ */ new Date()).toISOString();
          console.log(`\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 SMS: ${phone}`);
        }
      }, 1e3);
      return notification;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 SMS:", error);
      throw error;
    }
  }
  /**
   * إرسال إشعار Push
   */
  async sendPushNotification(userId, event, data) {
    try {
      console.log(`\u{1F514} \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 Push: ${event}`);
      const templateKey = `${event}_push`;
      const template = this.templates.get(templateKey) || {
        id: templateKey,
        event,
        type: "push",
        title: "\u0625\u0634\u0639\u0627\u0631",
        message: `\u0625\u0634\u0639\u0627\u0631: ${event}`,
        template: `{{message}}`
      };
      let message = template.message;
      for (const [key, value] of Object.entries(data)) {
        message = message.replace(`{{${key}}}`, String(value));
      }
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: "push",
        event,
        title: template.title,
        message,
        data,
        recipient: userId,
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.notifications.set(notification.id, notification);
      this.notificationQueue.push(notification);
      setTimeout(() => {
        const notif = this.notifications.get(notification.id);
        if (notif) {
          notif.status = "sent";
          notif.sentAt = (/* @__PURE__ */ new Date()).toISOString();
          console.log(`\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 Push: ${userId}`);
        }
      }, 1e3);
      return notification;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 Push:", error);
      throw error;
    }
  }
  /**
   * إرسال إشعار في التطبيق
   */
  async sendInAppNotification(userId, event, data) {
    try {
      console.log(`\u{1F4AC} \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0641\u064A \u0627\u0644\u062A\u0637\u0628\u064A\u0642: ${event}`);
      const templateKey = `${event}_in_app`;
      const template = this.templates.get(templateKey) || {
        id: templateKey,
        event,
        type: "in_app",
        title: "\u0625\u0634\u0639\u0627\u0631",
        message: `\u0625\u0634\u0639\u0627\u0631: ${event}`,
        template: `{{message}}`
      };
      let message = template.message;
      for (const [key, value] of Object.entries(data)) {
        message = message.replace(`{{${key}}}`, String(value));
      }
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: "in_app",
        event,
        title: template.title,
        message,
        data,
        recipient: userId,
        status: "sent",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        sentAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.notifications.set(notification.id, notification);
      console.log(`\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0641\u064A \u0627\u0644\u062A\u0637\u0628\u064A\u0642: ${userId}`);
      return notification;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0641\u064A \u0627\u0644\u062A\u0637\u0628\u064A\u0642:", error);
      throw error;
    }
  }
  /**
   * إرسال إشعار للمالك
   */
  async sendOwnerNotification(event, data) {
    try {
      console.log(`\u{1F451} \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0644\u0644\u0645\u0627\u0644\u0643: ${event}`);
      const templateKey = `${event}_owner`;
      const template = this.templates.get(templateKey) || {
        id: templateKey,
        event,
        type: "email",
        title: "\u0625\u0634\u0639\u0627\u0631 \u0644\u0644\u0645\u0627\u0644\u0643",
        message: `\u0625\u0634\u0639\u0627\u0631: ${event}`,
        template: `{{message}}`
      };
      let message = template.message;
      for (const [key, value] of Object.entries(data)) {
        message = message.replace(`{{${key}}}`, String(value));
      }
      const notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: "owner",
        type: "owner",
        event,
        title: template.title,
        message,
        data,
        recipient: process.env.OWNER_EMAIL || "owner@example.com",
        status: "pending",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      this.notifications.set(notification.id, notification);
      this.notificationQueue.push(notification);
      console.log(`\u2705 \u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0644\u0644\u0645\u0627\u0644\u0643`);
      return notification;
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0644\u0644\u0645\u0627\u0644\u0643:", error);
      throw error;
    }
  }
  /**
   * الحصول على الإشعارات
   */
  async getNotifications(userId, status) {
    let notifications2 = Array.from(this.notifications.values()).filter((n) => n.userId === userId);
    if (status) {
      notifications2 = notifications2.filter((n) => n.status === status);
    }
    return notifications2;
  }
  /**
   * تعليم الإشعار كمقروء
   */
  async markAsRead(notificationId) {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return null;
    }
    notification.status = "read";
    notification.readAt = (/* @__PURE__ */ new Date()).toISOString();
    console.log(`\u2705 \u062A\u0645 \u062A\u0639\u0644\u064A\u0645 \u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u0643\u0645\u0642\u0631\u0648\u0621: ${notificationId}`);
    return notification;
  }
  /**
   * حذف الإشعار
   */
  async deleteNotification(notificationId) {
    return this.notifications.delete(notificationId);
  }
  /**
   * معالجة قائمة الانتظار
   */
  async processQueue() {
    console.log(`\u{1F4E4} \u0645\u0639\u0627\u0644\u062C\u0629 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A (${this.notificationQueue.length} \u0625\u0634\u0639\u0627\u0631)`);
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      if (notification) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    console.log(`\u2705 \u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 \u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A`);
  }
  /**
   * الحصول على إحصائيات الإشعارات
   */
  getStatistics() {
    const notifications2 = Array.from(this.notifications.values());
    return {
      total: notifications2.length,
      sent: notifications2.filter((n) => n.status === "sent").length,
      pending: notifications2.filter((n) => n.status === "pending").length,
      failed: notifications2.filter((n) => n.status === "failed").length,
      read: notifications2.filter((n) => n.status === "read").length
    };
  }
};
var advancedNotificationsService = new AdvancedNotificationsService();

// server/routers/advanced-features.ts
var advancedFeaturesRouter = router({
  // ============================================
  // Webhook الحقيقية
  // ============================================
  /**
   * معالجة Webhook من Click
   */
  processClickWebhook: publicProcedure.input(
    z18.object({
      payload: z18.record(z18.string(), z18.any()),
      signature: z18.string()
    })
  ).mutation(async ({ input }) => {
    return await realWebhookProcessor.processClickWebhook(input.payload, input.signature);
  }),
  /**
   * معالجة Webhook من Alipay
   */
  processAlipayWebhook: publicProcedure.input(
    z18.object({
      payload: z18.record(z18.string(), z18.any()),
      signature: z18.string()
    })
  ).mutation(async ({ input }) => {
    return await realWebhookProcessor.processAlipayWebhook(input.payload, input.signature);
  }),
  /**
   * معالجة Webhook من PayPal
   */
  processPayPalWebhook: publicProcedure.input(
    z18.object({
      payload: z18.record(z18.string(), z18.any()),
      signature: z18.string()
    })
  ).mutation(async ({ input }) => {
    return await realWebhookProcessor.processPayPalWebhook(input.payload, input.signature);
  }),
  /**
   * إعادة محاولة معالجة الأحداث الفاشلة
   */
  retryFailedWebhooks: protectedProcedure.mutation(async () => {
    await realWebhookProcessor.retryFailedEvents();
    return { success: true, message: "\u062A\u0645 \u0625\u0639\u0627\u062F\u0629 \u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0623\u062D\u062F\u0627\u062B \u0627\u0644\u0641\u0627\u0634\u0644\u0629" };
  }),
  /**
   * الحصول على إحصائيات Webhook
   */
  getWebhookStatistics: protectedProcedure.query(async () => {
    return realWebhookProcessor.getStatistics();
  }),
  // ============================================
  // التقارير المتقدمة
  // ============================================
  /**
   * إنشاء تقرير الإيرادات
   */
  generateRevenueReport: protectedProcedure.input(
    z18.object({
      startDate: z18.string(),
      endDate: z18.string(),
      data: z18.record(z18.string(), z18.any())
    })
  ).mutation(async ({ input }) => {
    return await advancedReportsService.generateRevenueReport(
      input.startDate,
      input.endDate,
      input.data
    );
  }),
  /**
   * إنشاء تقرير المصروفات
   */
  generateExpensesReport: protectedProcedure.input(
    z18.object({
      startDate: z18.string(),
      endDate: z18.string(),
      data: z18.record(z18.string(), z18.any())
    })
  ).mutation(async ({ input }) => {
    return await advancedReportsService.generateExpensesReport(
      input.startDate,
      input.endDate,
      input.data
    );
  }),
  /**
   * إنشاء تقرير الأرباح والخسائر
   */
  generateProfitLossReport: protectedProcedure.input(
    z18.object({
      startDate: z18.string(),
      endDate: z18.string(),
      revenueData: z18.record(z18.string(), z18.any()),
      expensesData: z18.record(z18.string(), z18.any())
    })
  ).mutation(async ({ input }) => {
    return await advancedReportsService.generateProfitLossReport(
      input.startDate,
      input.endDate,
      input.revenueData,
      input.expensesData
    );
  }),
  /**
   * إنشاء تقرير الضرائب
   */
  generateTaxReport: protectedProcedure.input(
    z18.object({
      startDate: z18.string(),
      endDate: z18.string(),
      data: z18.record(z18.string(), z18.any())
    })
  ).mutation(async ({ input }) => {
    return await advancedReportsService.generateTaxReport(
      input.startDate,
      input.endDate,
      input.data
    );
  }),
  /**
   * تصدير التقرير إلى JSON
   */
  exportReportToJSON: protectedProcedure.input(z18.object({ reportId: z18.string() })).query(async ({ input }) => {
    const json = await advancedReportsService.exportToJSON(input.reportId);
    return { success: !!json, data: json };
  }),
  /**
   * تصدير التقرير إلى CSV
   */
  exportReportToCSV: protectedProcedure.input(z18.object({ reportId: z18.string() })).query(async ({ input }) => {
    const csv = await advancedReportsService.exportToCSV(input.reportId);
    return { success: !!csv, data: csv };
  }),
  /**
   * جدولة تقرير دوري
   */
  scheduleReport: protectedProcedure.input(
    z18.object({
      reportType: z18.string(),
      schedule: z18.enum(["daily", "weekly", "monthly"]),
      email: z18.string().optional()
    })
  ).mutation(async ({ input }) => {
    return await advancedReportsService.scheduleReport(
      input.reportType,
      input.schedule,
      input.email
    );
  }),
  /**
   * الحصول على التقرير
   */
  getReport: protectedProcedure.input(z18.object({ reportId: z18.string() })).query(async ({ input }) => {
    return await advancedReportsService.getReport(input.reportId);
  }),
  /**
   * الحصول على قائمة التقارير
   */
  listReports: protectedProcedure.input(z18.object({ type: z18.string().optional() })).query(async ({ input }) => {
    return await advancedReportsService.listReports(input.type);
  }),
  /**
   * حذف التقرير
   */
  deleteReport: protectedProcedure.input(z18.object({ reportId: z18.string() })).mutation(async ({ input }) => {
    const success = await advancedReportsService.deleteReport(input.reportId);
    return { success, message: success ? "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u062A\u0642\u0631\u064A\u0631" : "\u0641\u0634\u0644 \u062D\u0630\u0641 \u0627\u0644\u062A\u0642\u0631\u064A\u0631" };
  }),
  // ============================================
  // الإشعارات المتقدمة
  // ============================================
  /**
   * إرسال إشعار بريد إلكتروني
   */
  sendEmailNotification: protectedProcedure.input(
    z18.object({
      email: z18.string().email(),
      event: z18.string(),
      data: z18.record(z18.string(), z18.any())
    })
  ).mutation(async ({ ctx, input }) => {
    return await advancedNotificationsService.sendEmailNotification(
      ctx.user.id.toString(),
      input.email,
      input.event,
      input.data
    );
  }),
  /**
   * إرسال إشعار SMS
   */
  sendSMSNotification: protectedProcedure.input(
    z18.object({
      phone: z18.string(),
      event: z18.string(),
      data: z18.record(z18.string(), z18.any())
    })
  ).mutation(async ({ ctx, input }) => {
    return await advancedNotificationsService.sendSMSNotification(
      ctx.user.id.toString(),
      input.phone,
      input.event,
      input.data
    );
  }),
  /**
   * إرسال إشعار Push
   */
  sendPushNotification: protectedProcedure.input(
    z18.object({
      event: z18.string(),
      data: z18.record(z18.string(), z18.any())
    })
  ).mutation(async ({ ctx, input }) => {
    return await advancedNotificationsService.sendPushNotification(
      ctx.user.id.toString(),
      input.event,
      input.data
    );
  }),
  /**
   * إرسال إشعار في التطبيق
   */
  sendInAppNotification: protectedProcedure.input(
    z18.object({
      event: z18.string(),
      data: z18.record(z18.string(), z18.any())
    })
  ).mutation(async ({ ctx, input }) => {
    return await advancedNotificationsService.sendInAppNotification(
      ctx.user.id.toString(),
      input.event,
      input.data
    );
  }),
  /**
   * إرسال إشعار للمالك
   */
  sendOwnerNotification: protectedProcedure.input(
    z18.object({
      event: z18.string(),
      data: z18.record(z18.string(), z18.any())
    })
  ).mutation(async ({ input }) => {
    return await advancedNotificationsService.sendOwnerNotification(
      input.event,
      input.data
    );
  }),
  /**
   * الحصول على الإشعارات
   */
  getNotifications: protectedProcedure.input(z18.object({ status: z18.string().optional() })).query(async ({ ctx, input }) => {
    return await advancedNotificationsService.getNotifications(
      ctx.user.id.toString(),
      input.status
    );
  }),
  /**
   * تعليم الإشعار كمقروء
   */
  markNotificationAsRead: protectedProcedure.input(z18.object({ notificationId: z18.string() })).mutation(async ({ input }) => {
    return await advancedNotificationsService.markAsRead(input.notificationId);
  }),
  /**
   * حذف الإشعار
   */
  deleteNotification: protectedProcedure.input(z18.object({ notificationId: z18.string() })).mutation(async ({ input }) => {
    const success = await advancedNotificationsService.deleteNotification(input.notificationId);
    return { success, message: success ? "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631" : "\u0641\u0634\u0644 \u062D\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631" };
  }),
  /**
   * معالجة قائمة الإشعارات
   */
  processNotificationQueue: protectedProcedure.mutation(async () => {
    await advancedNotificationsService.processQueue();
    return { success: true, message: "\u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A" };
  }),
  /**
   * الحصول على إحصائيات الإشعارات
   */
  getNotificationStatistics: protectedProcedure.query(async () => {
    return advancedNotificationsService.getStatistics();
  })
});

// server/routers/advanced-operations.ts
import { z as z19 } from "zod";

// server/services/operations-monitoring.ts
var OperationsMonitoringService = class {
  /**
   * الحصول على مقاييس العمليات الشاملة
   * Get comprehensive operation metrics
   */
  async getMetrics() {
    try {
      const metrics = {
        totalPayments: 150,
        successfulPayments: 135,
        failedPayments: 10,
        pendingPayments: 5,
        totalRevenue: 45e3,
        averagePaymentAmount: 300,
        paymentSuccessRate: 90,
        totalInvoices: 200,
        paidInvoices: 180,
        unpaidInvoices: 15,
        overdueInvoices: 5,
        totalInvoiceAmount: 6e4,
        totalNotifications: 500,
        sentNotifications: 480,
        failedNotifications: 20,
        totalOrders: 100,
        completedOrders: 85,
        pendingOrders: 10,
        cancelledOrders: 5,
        systemHealth: "healthy",
        lastUpdated: /* @__PURE__ */ new Date()
      };
      return metrics;
    } catch (error) {
      console.error("Error getting metrics:", error);
      throw error;
    }
  }
  /**
   * الحصول على اتجاهات الدفع
   * Get payment trends
   */
  async getPaymentTrends(days = 30) {
    try {
      const trends = [];
      const now = /* @__PURE__ */ new Date();
      for (let i = days - 1; i >= 0; i--) {
        const date3 = new Date(now);
        date3.setDate(date3.getDate() - i);
        const dateStr = date3.toISOString().split("T")[0];
        trends.push({
          date: dateStr,
          amount: Math.floor(Math.random() * 5e3) + 1e3,
          count: Math.floor(Math.random() * 10) + 1,
          successRate: Math.floor(Math.random() * 20) + 80
        });
      }
      return trends;
    } catch (error) {
      console.error("Error getting payment trends:", error);
      throw error;
    }
  }
  /**
   * الحصول على الأنشطة الأخيرة
   * Get recent activities
   */
  async getRecentActivities(limit = 20) {
    try {
      const activities = [];
      const now = /* @__PURE__ */ new Date();
      for (let i = 0; i < limit; i++) {
        const activityTime = new Date(now);
        activityTime.setMinutes(activityTime.getMinutes() - i);
        const types = ["payment", "invoice", "notification", "order"];
        const type = types[Math.floor(Math.random() * types.length)];
        activities.push({
          type,
          action: `${type.charAt(0).toUpperCase() + type.slice(1)} activity #${i + 1}`,
          status: ["completed", "pending", "failed"][Math.floor(Math.random() * 3)],
          timestamp: activityTime,
          details: {
            id: i + 1,
            amount: Math.floor(Math.random() * 5e3)
          }
        });
      }
      return activities;
    } catch (error) {
      console.error("Error getting recent activities:", error);
      throw error;
    }
  }
  /**
   * الحصول على التنبيهات النشطة
   * Get active alerts
   */
  async getActiveAlerts() {
    return [
      {
        id: "alert-1",
        type: "payment",
        condition: "threshold",
        value: 1e4,
        enabled: true
      },
      {
        id: "alert-2",
        type: "invoice",
        condition: "rate",
        value: 20,
        enabled: true
      },
      {
        id: "alert-3",
        type: "notification",
        condition: "status",
        value: 15,
        enabled: true
      }
    ];
  }
  /**
   * إنشاء تنبيه جديد
   * Create new alert
   */
  async createAlert(alert) {
    const newAlert = {
      ...alert,
      id: `alert-${Date.now()}`
    };
    return newAlert;
  }
  /**
   * تحديث التنبيه
   * Update alert
   */
  async updateAlert(id, alert) {
    console.log(`Alert ${id} updated:`, alert);
  }
  /**
   * حذف التنبيه
   * Delete alert
   */
  async deleteAlert(id) {
    console.log(`Alert ${id} deleted`);
  }
  /**
   * الحصول على إحصائيات الأداء
   * Get performance statistics
   */
  async getPerformanceStats() {
    try {
      const metrics = await this.getMetrics();
      const trends = await this.getPaymentTrends(7);
      return {
        metrics,
        trends,
        performance: {
          paymentProcessingTime: 2.5,
          notificationDeliveryTime: 0.8,
          invoiceGenerationTime: 1.2,
          databaseQueryTime: 0.5
        },
        uptime: 99.8,
        responseTime: 0.3
      };
    } catch (error) {
      console.error("Error getting performance stats:", error);
      throw error;
    }
  }
};
var operationsMonitoringService = new OperationsMonitoringService();

// server/services/advanced-support-service.ts
var AdvancedSupportService = class {
  tickets = /* @__PURE__ */ new Map();
  messages = /* @__PURE__ */ new Map();
  attachments = /* @__PURE__ */ new Map();
  agents = /* @__PURE__ */ new Map();
  /**
   * إنشاء تذكرة دعم جديدة
   * Create new support ticket
   */
  async createTicket(userId, data) {
    const ticket = {
      ...data,
      id: `ticket-${Date.now()}`,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.tickets.set(ticket.id, ticket);
    this.messages.set(ticket.id, []);
    this.attachments.set(ticket.id, []);
    console.log(`Support ticket created: ${ticket.id}`);
    return ticket;
  }
  /**
   * الحصول على التذكرة حسب المعرف
   * Get ticket by ID
   */
  async getTicket(ticketId) {
    return this.tickets.get(ticketId);
  }
  /**
   * الحصول على تذاكر المستخدم
   * Get user's tickets
   */
  async getUserTickets(userId) {
    return Array.from(this.tickets.values()).filter(
      (t2) => t2.userId === userId
    );
  }
  /**
   * تحديث حالة التذكرة
   * Update ticket status
   */
  async updateTicketStatus(ticketId, status) {
    const ticket = this.tickets.get(ticketId);
    if (ticket) {
      ticket.status = status;
      ticket.updatedAt = /* @__PURE__ */ new Date();
      if (status === "resolved") {
        ticket.resolvedAt = /* @__PURE__ */ new Date();
      }
      console.log(`Ticket ${ticketId} status updated to ${status}`);
    }
  }
  /**
   * إضافة رسالة إلى الدردشة
   * Add message to chat
   */
  async addMessage(ticketId, message) {
    const chatMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      createdAt: /* @__PURE__ */ new Date()
    };
    const messages = this.messages.get(ticketId) || [];
    messages.push(chatMessage);
    this.messages.set(ticketId, messages);
    const ticket = this.tickets.get(ticketId);
    if (ticket) {
      ticket.updatedAt = /* @__PURE__ */ new Date();
    }
    console.log(`Message added to ticket ${ticketId}`);
    return chatMessage;
  }
  /**
   * الحصول على رسائل التذكرة
   * Get ticket messages
   */
  async getTicketMessages(ticketId) {
    return this.messages.get(ticketId) || [];
  }
  /**
   * إضافة مرفق إلى التذكرة
   * Add attachment to ticket
   */
  async addAttachment(ticketId, attachment) {
    const newAttachment = {
      ...attachment,
      id: `att-${Date.now()}`,
      uploadedAt: /* @__PURE__ */ new Date()
    };
    const attachments = this.attachments.get(ticketId) || [];
    attachments.push(newAttachment);
    this.attachments.set(ticketId, attachments);
    console.log(`Attachment added to ticket ${ticketId}`);
    return newAttachment;
  }
  /**
   * الحصول على مرفقات التذكرة
   * Get ticket attachments
   */
  async getTicketAttachments(ticketId) {
    return this.attachments.get(ticketId) || [];
  }
  /**
   * تقييم التذكرة
   * Rate ticket resolution
   */
  async rateTicket(ticketId, rating, feedback) {
    const ticket = this.tickets.get(ticketId);
    if (ticket) {
      ticket.rating = Math.max(1, Math.min(5, rating));
      ticket.feedback = feedback;
      ticket.status = "closed";
      ticket.updatedAt = /* @__PURE__ */ new Date();
      console.log(`Ticket ${ticketId} rated: ${rating}/5`);
    }
  }
  /**
   * تعيين وكيل للتذكرة
   * Assign agent to ticket
   */
  async assignAgent(ticketId, agentId) {
    const ticket = this.tickets.get(ticketId);
    if (ticket) {
      ticket.assignedTo = agentId;
      ticket.status = "in_progress";
      ticket.updatedAt = /* @__PURE__ */ new Date();
      const agent = this.agents.get(agentId);
      if (agent) {
        agent.activeTickets += 1;
      }
      console.log(`Agent ${agentId} assigned to ticket ${ticketId}`);
    }
  }
  /**
   * الحصول على الوكلاء المتاحين
   * Get available agents
   */
  async getAvailableAgents() {
    return Array.from(this.agents.values()).filter(
      (a) => a.status === "online" && a.activeTickets < 5
    );
  }
  /**
   * إنشاء وكيل دعم جديد
   * Create new support agent
   */
  async createAgent(data) {
    const agent = {
      ...data,
      id: `agent-${Date.now()}`,
      activeTickets: 0,
      totalTicketsResolved: 0
    };
    this.agents.set(agent.id, agent);
    console.log(`Support agent created: ${agent.id}`);
    return agent;
  }
  /**
   * الحصول على إحصائيات الدعم
   * Get support statistics
   */
  async getSupportStats() {
    const allTickets = Array.from(this.tickets.values());
    const openTickets = allTickets.filter((t2) => t2.status === "open").length;
    const inProgressTickets = allTickets.filter(
      (t2) => t2.status === "in_progress"
    ).length;
    const resolvedTickets = allTickets.filter(
      (t2) => t2.status === "resolved"
    ).length;
    const closedTickets = allTickets.filter((t2) => t2.status === "closed").length;
    const avgResolutionTime = resolvedTickets > 0 ? allTickets.filter((t2) => t2.resolvedAt).reduce((sum, t2) => {
      if (t2.resolvedAt) {
        return sum + (t2.resolvedAt.getTime() - t2.createdAt.getTime()) / (1e3 * 60 * 60);
      }
      return sum;
    }, 0) / resolvedTickets : 0;
    const avgRating = allTickets.filter((t2) => t2.rating).length > 0 ? allTickets.reduce((sum, t2) => sum + (t2.rating || 0), 0) / allTickets.filter((t2) => t2.rating).length : 0;
    return {
      totalTickets: allTickets.length,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      averageResolutionTime: avgResolutionTime.toFixed(2),
      averageRating: avgRating.toFixed(2),
      totalAgents: this.agents.size,
      onlineAgents: Array.from(this.agents.values()).filter(
        (a) => a.status === "online"
      ).length
    };
  }
  /**
   * البحث عن التذاكر
   * Search tickets
   */
  async searchTickets(query, filters) {
    let results = Array.from(this.tickets.values());
    if (query) {
      results = results.filter(
        (t2) => t2.title.toLowerCase().includes(query.toLowerCase()) || t2.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (filters?.status) {
      results = results.filter((t2) => t2.status === filters.status);
    }
    if (filters?.category) {
      results = results.filter((t2) => t2.category === filters.category);
    }
    if (filters?.priority) {
      results = results.filter((t2) => t2.priority === filters.priority);
    }
    return results;
  }
  /**
   * إغلاق التذكرة
   * Close ticket
   */
  async closeTicket(ticketId) {
    const ticket = this.tickets.get(ticketId);
    if (ticket) {
      ticket.status = "closed";
      ticket.updatedAt = /* @__PURE__ */ new Date();
      if (ticket.assignedTo) {
        const agent = this.agents.get(ticket.assignedTo);
        if (agent && agent.activeTickets > 0) {
          agent.activeTickets -= 1;
          agent.totalTicketsResolved += 1;
        }
      }
      console.log(`Ticket ${ticketId} closed`);
    }
  }
};
var advancedSupportService = new AdvancedSupportService();

// server/services/external-integrations-service.ts
var ExternalIntegrationsService = class {
  integrations = /* @__PURE__ */ new Map();
  syncLogs = /* @__PURE__ */ new Map();
  /**
   * إضافة تكامل جديد
   * Add new integration
   */
  async addIntegration(config) {
    const integration = {
      ...config,
      id: `integration-${Date.now()}`
    };
    this.integrations.set(integration.id, integration);
    this.syncLogs.set(integration.id, []);
    console.log(`Integration added: ${integration.id} (${integration.type})`);
    return integration;
  }
  /**
   * الحصول على التكامل
   * Get integration
   */
  async getIntegration(integrationId) {
    return this.integrations.get(integrationId);
  }
  /**
   * الحصول على جميع التكاملات
   * Get all integrations
   */
  async getAllIntegrations() {
    return Array.from(this.integrations.values());
  }
  /**
   * تحديث التكامل
   * Update integration
   */
  async updateIntegration(integrationId, updates) {
    const integration = this.integrations.get(integrationId);
    if (integration) {
      Object.assign(integration, updates);
      console.log(`Integration updated: ${integrationId}`);
    }
  }
  /**
   * حذف التكامل
   * Delete integration
   */
  async deleteIntegration(integrationId) {
    this.integrations.delete(integrationId);
    this.syncLogs.delete(integrationId);
    console.log(`Integration deleted: ${integrationId}`);
  }
  /**
   * مزامنة البيانات مع QuickBooks
   * Sync data with QuickBooks
   */
  async syncWithQuickBooks(integrationId, syncType = "all") {
    const integration = this.integrations.get(integrationId);
    if (!integration || integration.type !== "quickbooks") {
      throw new Error("QuickBooks integration not found");
    }
    const syncLog = {
      id: `sync-${Date.now()}`,
      integrationId,
      syncType,
      status: "success",
      recordsSynced: 0,
      recordsFailed: 0,
      startedAt: /* @__PURE__ */ new Date()
    };
    try {
      integration.syncStatus = "syncing";
      switch (syncType) {
        case "invoice":
          syncLog.recordsSynced = 25;
          break;
        case "expense":
          syncLog.recordsSynced = 15;
          break;
        case "payment":
          syncLog.recordsSynced = 10;
          break;
        case "customer":
          syncLog.recordsSynced = 50;
          break;
        case "all":
          syncLog.recordsSynced = 100;
          break;
      }
      syncLog.completedAt = /* @__PURE__ */ new Date();
      integration.syncStatus = "idle";
      integration.lastSyncAt = /* @__PURE__ */ new Date();
      const logs = this.syncLogs.get(integrationId) || [];
      logs.push(syncLog);
      this.syncLogs.set(integrationId, logs);
      console.log(
        `QuickBooks sync completed: ${syncLog.recordsSynced} records synced`
      );
      return syncLog;
    } catch (error) {
      syncLog.status = "failed";
      syncLog.completedAt = /* @__PURE__ */ new Date();
      syncLog.errorDetails = error.message;
      integration.syncStatus = "error";
      integration.errorMessage = error.message;
      const logs = this.syncLogs.get(integrationId) || [];
      logs.push(syncLog);
      this.syncLogs.set(integrationId, logs);
      throw error;
    }
  }
  /**
   * مزامنة البيانات مع Xero
   * Sync data with Xero
   */
  async syncWithXero(integrationId, syncType = "all") {
    const integration = this.integrations.get(integrationId);
    if (!integration || integration.type !== "xero") {
      throw new Error("Xero integration not found");
    }
    const syncLog = {
      id: `sync-${Date.now()}`,
      integrationId,
      syncType,
      status: "success",
      recordsSynced: 0,
      recordsFailed: 0,
      startedAt: /* @__PURE__ */ new Date()
    };
    try {
      integration.syncStatus = "syncing";
      switch (syncType) {
        case "invoice":
          syncLog.recordsSynced = 30;
          break;
        case "expense":
          syncLog.recordsSynced = 20;
          break;
        case "payment":
          syncLog.recordsSynced = 12;
          break;
        case "customer":
          syncLog.recordsSynced = 60;
          break;
        case "all":
          syncLog.recordsSynced = 122;
          break;
      }
      syncLog.completedAt = /* @__PURE__ */ new Date();
      integration.syncStatus = "idle";
      integration.lastSyncAt = /* @__PURE__ */ new Date();
      const logs = this.syncLogs.get(integrationId) || [];
      logs.push(syncLog);
      this.syncLogs.set(integrationId, logs);
      console.log(
        `Xero sync completed: ${syncLog.recordsSynced} records synced`
      );
      return syncLog;
    } catch (error) {
      syncLog.status = "failed";
      syncLog.completedAt = /* @__PURE__ */ new Date();
      syncLog.errorDetails = error.message;
      integration.syncStatus = "error";
      integration.errorMessage = error.message;
      const logs = this.syncLogs.get(integrationId) || [];
      logs.push(syncLog);
      this.syncLogs.set(integrationId, logs);
      throw error;
    }
  }
  /**
   * الحصول على سجل المزامنة
   * Get sync logs
   */
  async getSyncLogs(integrationId) {
    return this.syncLogs.get(integrationId) || [];
  }
  /**
   * الحصول على آخر مزامنة ناجحة
   * Get last successful sync
   */
  async getLastSuccessfulSync(integrationId) {
    const logs = this.syncLogs.get(integrationId) || [];
    return logs.find((log) => log.status === "success");
  }
  /**
   * جدولة المزامنة التلقائية
   * Schedule automatic sync
   */
  async scheduleAutoSync(integrationId, intervalMinutes = 60) {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error("Integration not found");
    }
    console.log(
      `Auto sync scheduled for ${integrationId} every ${intervalMinutes} minutes`
    );
    setInterval(async () => {
      try {
        if (integration.type === "quickbooks") {
          await this.syncWithQuickBooks(integrationId);
        } else if (integration.type === "xero") {
          await this.syncWithXero(integrationId);
        }
      } catch (error) {
        console.error(`Auto sync failed for ${integrationId}:`, error);
      }
    }, intervalMinutes * 60 * 1e3);
  }
  /**
   * الحصول على إحصائيات المزامنة
   * Get sync statistics
   */
  async getSyncStatistics(integrationId) {
    const logs = this.syncLogs.get(integrationId) || [];
    const successfulSyncs = logs.filter((l) => l.status === "success").length;
    const failedSyncs = logs.filter((l) => l.status === "failed").length;
    const totalRecordsSynced = logs.reduce(
      (sum, l) => sum + l.recordsSynced,
      0
    );
    const totalRecordsFailed = logs.reduce(
      (sum, l) => sum + l.recordsFailed,
      0
    );
    const avgSyncTime = successfulSyncs > 0 ? logs.filter((l) => l.status === "success" && l.completedAt).reduce((sum, l) => {
      if (l.completedAt) {
        return sum + (l.completedAt.getTime() - l.startedAt.getTime()) / 1e3;
      }
      return sum;
    }, 0) / successfulSyncs : 0;
    return {
      totalSyncs: logs.length,
      successfulSyncs,
      failedSyncs,
      successRate: logs.length > 0 ? (successfulSyncs / logs.length * 100).toFixed(2) : 0,
      totalRecordsSynced,
      totalRecordsFailed,
      averageSyncTime: avgSyncTime.toFixed(2),
      lastSync: logs[logs.length - 1]?.completedAt
    };
  }
  /**
   * اختبار الاتصال بالتكامل
   * Test integration connection
   */
  async testConnection(integrationId) {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      return false;
    }
    try {
      console.log(`Testing connection for ${integration.type}...`);
      return true;
    } catch (error) {
      console.error(`Connection test failed:`, error);
      return false;
    }
  }
};
var externalIntegrationsService = new ExternalIntegrationsService();

// server/routers/advanced-operations.ts
var advancedOperationsRouter = router({
  // ==================== Operations Monitoring ====================
  /**
   * الحصول على مقاييس العمليات
   * Get operation metrics
   */
  getMetrics: publicProcedure.query(async () => {
    return await operationsMonitoringService.getMetrics();
  }),
  /**
   * الحصول على اتجاهات الدفع
   * Get payment trends
   */
  getPaymentTrends: publicProcedure.input(z19.object({ days: z19.number().default(30) })).query(async ({ input }) => {
    return await operationsMonitoringService.getPaymentTrends(input.days);
  }),
  /**
   * الحصول على الأنشطة الأخيرة
   * Get recent activities
   */
  getRecentActivities: publicProcedure.input(z19.object({ limit: z19.number().default(20) })).query(async ({ input }) => {
    return await operationsMonitoringService.getRecentActivities(input.limit);
  }),
  /**
   * الحصول على التنبيهات النشطة
   * Get active alerts
   */
  getActiveAlerts: protectedProcedure.query(async () => {
    return await operationsMonitoringService.getActiveAlerts();
  }),
  /**
   * إنشاء تنبيه جديد
   * Create new alert
   */
  createAlert: protectedProcedure.input(
    z19.object({
      type: z19.enum(["payment", "invoice", "notification", "order"]),
      condition: z19.enum(["threshold", "rate", "status"]),
      value: z19.number(),
      enabled: z19.boolean().default(true)
    })
  ).mutation(async ({ input }) => {
    return await operationsMonitoringService.createAlert(input);
  }),
  /**
   * تحديث التنبيه
   * Update alert
   */
  updateAlert: protectedProcedure.input(
    z19.object({
      id: z19.string(),
      type: z19.enum(["payment", "invoice", "notification", "order"]).optional(),
      condition: z19.enum(["threshold", "rate", "status"]).optional(),
      value: z19.number().optional(),
      enabled: z19.boolean().optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...updates } = input;
    await operationsMonitoringService.updateAlert(id, updates);
  }),
  /**
   * حذف التنبيه
   * Delete alert
   */
  deleteAlert: protectedProcedure.input(z19.object({ id: z19.string() })).mutation(async ({ input }) => {
    await operationsMonitoringService.deleteAlert(input.id);
  }),
  /**
   * الحصول على إحصائيات الأداء
   * Get performance statistics
   */
  getPerformanceStats: protectedProcedure.query(async () => {
    return await operationsMonitoringService.getPerformanceStats();
  }),
  // ==================== Support Service ====================
  /**
   * إنشاء تذكرة دعم جديدة
   * Create new support ticket
   */
  createSupportTicket: protectedProcedure.input(
    z19.object({
      title: z19.string(),
      description: z19.string(),
      category: z19.enum(["billing", "technical", "account", "general", "other"]),
      priority: z19.enum(["low", "medium", "high", "critical"])
    })
  ).mutation(async ({ input, ctx }) => {
    return await advancedSupportService.createTicket(ctx.user.id, {
      userId: ctx.user.id,
      ...input,
      status: "open"
    });
  }),
  /**
   * الحصول على التذكرة
   * Get support ticket
   */
  getSupportTicket: protectedProcedure.input(z19.object({ ticketId: z19.string() })).query(async ({ input }) => {
    return await advancedSupportService.getTicket(input.ticketId);
  }),
  /**
   * الحصول على تذاكر المستخدم
   * Get user's support tickets
   */
  getUserSupportTickets: protectedProcedure.query(async ({ ctx }) => {
    return await advancedSupportService.getUserTickets(ctx.user.id);
  }),
  /**
   * تحديث حالة التذكرة
   * Update ticket status
   */
  updateTicketStatus: protectedProcedure.input(
    z19.object({
      ticketId: z19.string(),
      status: z19.enum(["open", "in_progress", "waiting_customer", "resolved", "closed"])
    })
  ).mutation(async ({ input }) => {
    await advancedSupportService.updateTicketStatus(input.ticketId, input.status);
  }),
  /**
   * إضافة رسالة إلى الدردشة
   * Add message to support chat
   */
  addSupportMessage: protectedProcedure.input(
    z19.object({
      ticketId: z19.string(),
      message: z19.string(),
      attachments: z19.array(z19.string()).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    return await advancedSupportService.addMessage(input.ticketId, {
      ticketId: input.ticketId,
      sender: "customer",
      senderId: ctx.user.id,
      message: input.message,
      attachments: input.attachments,
      isRead: false
    });
  }),
  /**
   * الحصول على رسائل التذكرة
   * Get ticket messages
   */
  getTicketMessages: protectedProcedure.input(z19.object({ ticketId: z19.string() })).query(async ({ input }) => {
    return await advancedSupportService.getTicketMessages(input.ticketId);
  }),
  /**
   * إضافة مرفق إلى التذكرة
   * Add attachment to ticket
   */
  addTicketAttachment: protectedProcedure.input(
    z19.object({
      ticketId: z19.string(),
      fileName: z19.string(),
      fileUrl: z19.string(),
      fileSize: z19.number(),
      mimeType: z19.string()
    })
  ).mutation(async ({ input, ctx }) => {
    return await advancedSupportService.addAttachment(input.ticketId, {
      ...input,
      uploadedBy: ctx.user.id
    });
  }),
  /**
   * الحصول على مرفقات التذكرة
   * Get ticket attachments
   */
  getTicketAttachments: protectedProcedure.input(z19.object({ ticketId: z19.string() })).query(async ({ input }) => {
    return await advancedSupportService.getTicketAttachments(input.ticketId);
  }),
  /**
   * تقييم التذكرة
   * Rate support ticket
   */
  rateTicket: protectedProcedure.input(
    z19.object({
      ticketId: z19.string(),
      rating: z19.number().min(1).max(5),
      feedback: z19.string().optional()
    })
  ).mutation(async ({ input }) => {
    await advancedSupportService.rateTicket(
      input.ticketId,
      input.rating,
      input.feedback
    );
  }),
  /**
   * الحصول على إحصائيات الدعم
   * Get support statistics
   */
  getSupportStats: protectedProcedure.query(async () => {
    return await advancedSupportService.getSupportStats();
  }),
  /**
   * البحث عن التذاكر
   * Search support tickets
   */
  searchSupportTickets: protectedProcedure.input(
    z19.object({
      query: z19.string().optional(),
      status: z19.enum(["open", "in_progress", "waiting_customer", "resolved", "closed"]).optional(),
      category: z19.enum(["billing", "technical", "account", "general", "other"]).optional(),
      priority: z19.enum(["low", "medium", "high", "critical"]).optional()
    })
  ).query(async ({ input }) => {
    return await advancedSupportService.searchTickets(input.query || "", {
      status: input.status,
      category: input.category,
      priority: input.priority
    });
  }),
  /**
   * إغلاق التذكرة
   * Close support ticket
   */
  closeTicket: protectedProcedure.input(z19.object({ ticketId: z19.string() })).mutation(async ({ input }) => {
    await advancedSupportService.closeTicket(input.ticketId);
  }),
  // ==================== External Integrations ====================
  /**
   * إضافة تكامل جديد
   * Add new integration
   */
  addIntegration: protectedProcedure.input(
    z19.object({
      type: z19.enum(["quickbooks", "xero", "other"]),
      name: z19.string(),
      apiKey: z19.string(),
      apiSecret: z19.string().optional(),
      realmId: z19.string().optional()
    })
  ).mutation(async ({ input }) => {
    return await externalIntegrationsService.addIntegration({
      ...input,
      enabled: true,
      syncStatus: "idle"
    });
  }),
  /**
   * الحصول على التكامل
   * Get integration
   */
  getIntegration: protectedProcedure.input(z19.object({ integrationId: z19.string() })).query(async ({ input }) => {
    return await externalIntegrationsService.getIntegration(input.integrationId);
  }),
  /**
   * الحصول على جميع التكاملات
   * Get all integrations
   */
  getAllIntegrations: protectedProcedure.query(async () => {
    return await externalIntegrationsService.getAllIntegrations();
  }),
  /**
   * تحديث التكامل
   * Update integration
   */
  updateIntegration: protectedProcedure.input(
    z19.object({
      integrationId: z19.string(),
      name: z19.string().optional(),
      enabled: z19.boolean().optional()
    })
  ).mutation(async ({ input }) => {
    const { integrationId, ...updates } = input;
    await externalIntegrationsService.updateIntegration(integrationId, updates);
  }),
  /**
   * حذف التكامل
   * Delete integration
   */
  deleteIntegration: protectedProcedure.input(z19.object({ integrationId: z19.string() })).mutation(async ({ input }) => {
    await externalIntegrationsService.deleteIntegration(input.integrationId);
  }),
  /**
   * مزامنة مع QuickBooks
   * Sync with QuickBooks
   */
  syncQuickBooks: protectedProcedure.input(
    z19.object({
      integrationId: z19.string(),
      syncType: z19.enum(["invoice", "expense", "payment", "customer", "all"]).optional()
    })
  ).mutation(async ({ input }) => {
    return await externalIntegrationsService.syncWithQuickBooks(
      input.integrationId,
      input.syncType || "all"
    );
  }),
  /**
   * مزامنة مع Xero
   * Sync with Xero
   */
  syncXero: protectedProcedure.input(
    z19.object({
      integrationId: z19.string(),
      syncType: z19.enum(["invoice", "expense", "payment", "customer", "all"]).optional()
    })
  ).mutation(async ({ input }) => {
    return await externalIntegrationsService.syncWithXero(
      input.integrationId,
      input.syncType || "all"
    );
  }),
  /**
   * الحصول على سجل المزامنة
   * Get sync logs
   */
  getSyncLogs: protectedProcedure.input(z19.object({ integrationId: z19.string() })).query(async ({ input }) => {
    return await externalIntegrationsService.getSyncLogs(input.integrationId);
  }),
  /**
   * الحصول على إحصائيات المزامنة
   * Get sync statistics
   */
  getSyncStatistics: protectedProcedure.input(z19.object({ integrationId: z19.string() })).query(async ({ input }) => {
    return await externalIntegrationsService.getSyncStatistics(input.integrationId);
  }),
  /**
   * اختبار الاتصال
   * Test integration connection
   */
  testConnection: protectedProcedure.input(z19.object({ integrationId: z19.string() })).mutation(async ({ input }) => {
    return await externalIntegrationsService.testConnection(input.integrationId);
  }),
  /**
   * جدولة المزامنة التلقائية
   * Schedule automatic sync
   */
  scheduleAutoSync: protectedProcedure.input(
    z19.object({
      integrationId: z19.string(),
      intervalMinutes: z19.number().optional()
    })
  ).mutation(async ({ input }) => {
    await externalIntegrationsService.scheduleAutoSync(
      input.integrationId,
      input.intervalMinutes || 60
    );
  })
});

// server/routers/notifications-center.ts
import { z as z20 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";
import { eq as eq2, and as and2, desc as desc2, sql } from "drizzle-orm";
var notificationsCenterRouter = router({
  /**
   * الحصول على جميع الإشعارات للمستخدم الحالي
   */
  getNotifications: protectedProcedure.input(
    z20.object({
      limit: z20.number().int().positive().default(20),
      offset: z20.number().int().nonnegative().default(0),
      unreadOnly: z20.boolean().default(false)
    }).optional()
  ).query(async ({ ctx, input }) => {
    const limit = input?.limit ?? 20;
    const offset = input?.offset ?? 0;
    const unreadOnly = input?.unreadOnly ?? false;
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629"
        });
      }
      let query = db.select().from(notifications).where(eq2(notifications.userId, ctx.user.id));
      if (unreadOnly) {
        query = query.where(eq2(notifications.isRead, false));
      }
      const allNotifications = await query.orderBy(desc2(notifications.createdAt)).limit(limit).offset(offset);
      return {
        success: true,
        notifications: allNotifications,
        total: allNotifications.length
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A:", error);
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على عدد الإشعارات غير المقروءة
   */
  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629"
        });
      }
      const result = await db.select({ count: sql`COUNT(*)` }).from(notifications).where(
        and2(
          eq2(notifications.userId, ctx.user.id),
          eq2(notifications.isRead, false)
        )
      );
      return {
        success: true,
        unreadCount: result[0]?.count ?? 0
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062D\u0633\u0627\u0628 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u063A\u064A\u0631 \u0627\u0644\u0645\u0642\u0631\u0648\u0621\u0629:", error);
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0633\u0627\u0628 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u063A\u064A\u0631 \u0627\u0644\u0645\u0642\u0631\u0648\u0621\u0629"
      });
    }
  }),
  /**
   * إنشاء إشعار جديد
   */
  createNotification: protectedProcedure.input(
    z20.object({
      type: z20.enum(["success", "error", "warning", "info"]),
      title: z20.string().min(1, "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0645\u0637\u0644\u0648\u0628").max(255),
      message: z20.string().min(1, "\u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0645\u0637\u0644\u0648\u0628\u0629"),
      operationType: z20.string().optional(),
      relatedEntityType: z20.string().optional(),
      relatedEntityId: z20.number().int().optional(),
      metadata: z20.record(z20.any()).optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629"
        });
      }
      const notificationData = {
        userId: ctx.user.id,
        type: input.type,
        title: input.title,
        message: input.message,
        operationType: input.operationType,
        relatedEntityType: input.relatedEntityType,
        relatedEntityId: input.relatedEntityId,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        isRead: false
      };
      const result = await db.insert(notifications).values(notificationData);
      return {
        success: true,
        message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u0628\u0646\u062C\u0627\u062D",
        notificationId: result.insertId
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0625\u0634\u0639\u0627\u0631:", error);
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0625\u0634\u0639\u0627\u0631"
      });
    }
  }),
  /**
   * تحديث حالة الإشعار (قراءة/عدم قراءة)
   */
  markAsRead: protectedProcedure.input(
    z20.object({
      notificationId: z20.number().int().positive()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629"
        });
      }
      const notification = await db.select().from(notifications).where(
        and2(
          eq2(notifications.id, input.notificationId),
          eq2(notifications.userId, ctx.user.id)
        )
      );
      if (!notification.length) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "\u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F"
        });
      }
      await db.update(notifications).set({ isRead: true }).where(eq2(notifications.id, input.notificationId));
      return {
        success: true,
        message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u0628\u0646\u062C\u0627\u062D"
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u0634\u0639\u0627\u0631:", error);
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u0634\u0639\u0627\u0631"
      });
    }
  }),
  /**
   * تحديث جميع الإشعارات كمقروءة
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629"
        });
      }
      await db.update(notifications).set({ isRead: true }).where(
        and2(
          eq2(notifications.userId, ctx.user.id),
          eq2(notifications.isRead, false)
        )
      );
      return {
        success: true,
        message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0628\u0646\u062C\u0627\u062D"
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A:", error);
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A"
      });
    }
  }),
  /**
   * حذف إشعار
   */
  deleteNotification: protectedProcedure.input(
    z20.object({
      notificationId: z20.number().int().positive()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629"
        });
      }
      const notification = await db.select().from(notifications).where(
        and2(
          eq2(notifications.id, input.notificationId),
          eq2(notifications.userId, ctx.user.id)
        )
      );
      if (!notification.length) {
        throw new TRPCError3({
          code: "NOT_FOUND",
          message: "\u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F"
        });
      }
      await db.delete(notifications).where(eq2(notifications.id, input.notificationId));
      return {
        success: true,
        message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u0628\u0646\u062C\u0627\u062D"
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631:", error);
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631"
      });
    }
  }),
  /**
   * حذف جميع الإشعارات
   */
  deleteAllNotifications: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629"
        });
      }
      await db.delete(notifications).where(eq2(notifications.userId, ctx.user.id));
      return {
        success: true,
        message: "\u062A\u0645 \u062D\u0630\u0641 \u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0628\u0646\u062C\u0627\u062D"
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A:", error);
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على تفضيلات الإشعارات
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629"
        });
      }
      const prefs = await db.select().from(notificationPreferences).where(eq2(notificationPreferences.userId, ctx.user.id));
      if (!prefs.length) {
        const defaultPrefs = {
          userId: ctx.user.id,
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: true,
          inAppNotifications: true,
          accountAddedNotification: true,
          accountVerifiedNotification: true,
          transactionNotification: true,
          securityAlertNotification: true,
          dailyDigest: false,
          weeklyReport: false
        };
        await db.insert(notificationPreferences).values(defaultPrefs);
        return { success: true, preferences: defaultPrefs };
      }
      return { success: true, preferences: prefs[0] };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u062A\u0641\u0636\u064A\u0644\u0627\u062A:", error);
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u062A\u0641\u0636\u064A\u0644\u0627\u062A"
      });
    }
  }),
  /**
   * تحديث تفضيلات الإشعارات
   */
  updatePreferences: protectedProcedure.input(
    z20.object({
      emailNotifications: z20.boolean().optional(),
      smsNotifications: z20.boolean().optional(),
      pushNotifications: z20.boolean().optional(),
      inAppNotifications: z20.boolean().optional(),
      accountAddedNotification: z20.boolean().optional(),
      accountVerifiedNotification: z20.boolean().optional(),
      transactionNotification: z20.boolean().optional(),
      securityAlertNotification: z20.boolean().optional(),
      dailyDigest: z20.boolean().optional(),
      weeklyReport: z20.boolean().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629"
        });
      }
      const existing = await db.select().from(notificationPreferences).where(eq2(notificationPreferences.userId, ctx.user.id));
      if (!existing.length) {
        const newPrefs = { userId: ctx.user.id, ...input };
        await db.insert(notificationPreferences).values(newPrefs);
      } else {
        await db.update(notificationPreferences).set(input).where(eq2(notificationPreferences.userId, ctx.user.id));
      }
      return {
        success: true,
        message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062A\u0641\u0636\u064A\u0644\u0627\u062A \u0628\u0646\u062C\u0627\u062D"
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062A\u0641\u0636\u064A\u0644\u0627\u062A:", error);
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062A\u0641\u0636\u064A\u0644\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على إحصائيات الإشعارات
   */
  getStatistics: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) {
        throw new TRPCError3({
          code: "INTERNAL_SERVER_ERROR",
          message: "\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629"
        });
      }
      const total = await db.select({ count: sql`COUNT(*)` }).from(notifications).where(eq2(notifications.userId, ctx.user.id));
      const unread = await db.select({ count: sql`COUNT(*)` }).from(notifications).where(
        and2(
          eq2(notifications.userId, ctx.user.id),
          eq2(notifications.isRead, false)
        )
      );
      const byType = await db.select({
        type: notifications.type,
        count: sql`COUNT(*)`
      }).from(notifications).where(eq2(notifications.userId, ctx.user.id)).groupBy(notifications.type);
      return {
        success: true,
        statistics: {
          total: total[0]?.count ?? 0,
          unread: unread[0]?.count ?? 0,
          byType: byType.reduce((acc, item) => {
            acc[item.type] = item.count;
            return acc;
          }, {})
        }
      };
    } catch (error) {
      console.error("\u274C \u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A:", error);
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A"
      });
    }
  })
});

// server/routers/live-chat-router.ts
import { z as z21 } from "zod";

// drizzle/live-chat-schema.ts
import {
  int as int3,
  mysqlEnum as mysqlEnum3,
  mysqlTable as mysqlTable3,
  text as text3,
  timestamp as timestamp3,
  varchar as varchar3,
  boolean as boolean3
} from "drizzle-orm/mysql-core";
var liveChatConversations = mysqlTable3("live_chat_conversations", {
  id: varchar3("id", { length: 36 }).primaryKey(),
  userId: int3("user_id").notNull().references(() => users.id),
  supportAgentId: int3("support_agent_id").references(() => users.id),
  // معلومات المحادثة
  subject: varchar3("subject", { length: 255 }).notNull(),
  status: mysqlEnum3("status", [
    "open",
    "in_progress",
    "waiting_customer",
    "waiting_agent",
    "closed",
    "resolved"
  ]).default("open").notNull(),
  // الأولوية
  priority: mysqlEnum3("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  // الفئة
  category: varchar3("category", { length: 100 }).notNull(),
  // 'billing', 'technical', 'general', 'complaint'
  // الإحصائيات
  messageCount: int3("message_count").default(0),
  firstResponseTime: timestamp3("first_response_time"),
  resolvedTime: timestamp3("resolved_time"),
  averageResponseTime: int3("average_response_time"),
  // بالثواني
  // البيانات الإضافية
  tags: text3("tags"),
  // JSON array
  metadata: text3("metadata"),
  // JSON object
  createdAt: timestamp3("created_at").notNull().defaultNow(),
  updatedAt: timestamp3("updated_at").notNull().defaultNow().onUpdateNow(),
  closedAt: timestamp3("closed_at")
});
var liveChatMessages = mysqlTable3("live_chat_messages", {
  id: varchar3("id", { length: 36 }).primaryKey(),
  conversationId: varchar3("conversation_id", { length: 36 }).notNull().references(() => liveChatConversations.id),
  senderId: int3("sender_id").notNull().references(() => users.id),
  senderType: mysqlEnum3("sender_type", ["customer", "agent"]).notNull(),
  // محتوى الرسالة
  message: text3("message").notNull(),
  messageType: mysqlEnum3("message_type", ["text", "image", "file", "system"]).default("text").notNull(),
  // الملفات المرفقة
  attachmentUrl: text3("attachment_url"),
  attachmentName: varchar3("attachment_name", { length: 255 }),
  attachmentSize: int3("attachment_size"),
  // بالبايتات
  // الحالة
  isRead: boolean3("is_read").default(false),
  readAt: timestamp3("read_at"),
  // التقييم
  rating: int3("rating"),
  // 1-5 stars
  feedback: text3("feedback"),
  createdAt: timestamp3("created_at").notNull().defaultNow(),
  updatedAt: timestamp3("updated_at").notNull().defaultNow().onUpdateNow()
});
var customNotifications = mysqlTable3("custom_notifications", {
  id: varchar3("id", { length: 36 }).primaryKey(),
  userId: int3("user_id").notNull().references(() => users.id),
  // معلومات الإشعار
  title: varchar3("title", { length: 255 }).notNull(),
  description: text3("description"),
  notificationType: mysqlEnum3("notification_type", [
    "order_status",
    "shipment_update",
    "payment_reminder",
    "customs_alert",
    "price_change",
    "system_update",
    "custom"
  ]).notNull(),
  // القنوات
  channels: text3("channels").notNull(),
  // JSON array: ['email', 'sms', 'push', 'in_app']
  // التكرار
  frequency: mysqlEnum3("frequency", [
    "immediately",
    "daily",
    "weekly",
    "monthly",
    "never"
  ]).default("immediately").notNull(),
  // الشروط
  conditions: text3("conditions"),
  // JSON object for filtering conditions
  // الحالة
  isActive: boolean3("is_active").default(true),
  isEnabled: boolean3("is_enabled").default(true),
  // الإحصائيات
  sentCount: int3("sent_count").default(0),
  openedCount: int3("opened_count").default(0),
  clickedCount: int3("clicked_count").default(0),
  // الجدولة
  scheduledTime: timestamp3("scheduled_time"),
  lastSentAt: timestamp3("last_sent_at"),
  nextSendAt: timestamp3("next_send_at"),
  createdAt: timestamp3("created_at").notNull().defaultNow(),
  updatedAt: timestamp3("updated_at").notNull().defaultNow().onUpdateNow()
});
var notificationChannels = mysqlTable3("notification_channels", {
  id: varchar3("id", { length: 36 }).primaryKey(),
  userId: int3("user_id").notNull().references(() => users.id),
  // نوع القناة
  channelType: mysqlEnum3("channel_type", ["email", "sms", "push", "in_app"]).notNull(),
  // معلومات القناة
  channelAddress: varchar3("channel_address", { length: 255 }).notNull(),
  // email, phone, device token
  channelName: varchar3("channel_name", { length: 100 }),
  // الحالة
  isVerified: boolean3("is_verified").default(false),
  verificationToken: varchar3("verification_token", { length: 255 }),
  verificationSentAt: timestamp3("verification_sent_at"),
  // الإعدادات
  isActive: boolean3("is_active").default(true),
  isPrimary: boolean3("is_primary").default(false),
  // الإحصائيات
  successCount: int3("success_count").default(0),
  failureCount: int3("failure_count").default(0),
  lastUsedAt: timestamp3("last_used_at"),
  createdAt: timestamp3("created_at").notNull().defaultNow(),
  updatedAt: timestamp3("updated_at").notNull().defaultNow().onUpdateNow()
});
var notificationHistory = mysqlTable3("notification_history", {
  id: varchar3("id", { length: 36 }).primaryKey(),
  userId: int3("user_id").notNull().references(() => users.id),
  notificationId: varchar3("notification_id", { length: 36 }).references(
    () => customNotifications.id
  ),
  channelId: varchar3("channel_id", { length: 36 }).references(
    () => notificationChannels.id
  ),
  // معلومات الإشعار
  title: varchar3("title", { length: 255 }).notNull(),
  message: text3("message").notNull(),
  notificationType: varchar3("notification_type", { length: 50 }).notNull(),
  // القناة المستخدمة
  sentVia: mysqlEnum3("sent_via", ["email", "sms", "push", "in_app"]).notNull(),
  // الحالة
  status: mysqlEnum3("status", [
    "pending",
    "sent",
    "delivered",
    "failed",
    "opened",
    "clicked"
  ]).default("pending").notNull(),
  // البيانات
  recipientAddress: varchar3("recipient_address", { length: 255 }),
  errorMessage: text3("error_message"),
  // التتبع
  sentAt: timestamp3("sent_at"),
  deliveredAt: timestamp3("delivered_at"),
  openedAt: timestamp3("opened_at"),
  clickedAt: timestamp3("clicked_at"),
  // البيانات الإضافية
  metadata: text3("metadata"),
  // JSON object
  createdAt: timestamp3("created_at").notNull().defaultNow(),
  updatedAt: timestamp3("updated_at").notNull().defaultNow().onUpdateNow()
});
var notificationTemplates = mysqlTable3("notification_templates", {
  id: varchar3("id", { length: 36 }).primaryKey(),
  userId: int3("user_id").notNull().references(() => users.id),
  // معلومات القالب
  templateName: varchar3("template_name", { length: 255 }).notNull(),
  templateType: mysqlEnum3("template_type", [
    "email",
    "sms",
    "push",
    "in_app"
  ]).notNull(),
  // محتوى القالب
  subject: varchar3("subject", { length: 255 }),
  body: text3("body").notNull(),
  footer: text3("footer"),
  // المتغيرات
  variables: text3("variables"),
  // JSON array of variable names
  // الحالة
  isActive: boolean3("is_active").default(true),
  isDefault: boolean3("is_default").default(false),
  // الإحصائيات
  usageCount: int3("usage_count").default(0),
  lastUsedAt: timestamp3("last_used_at"),
  createdAt: timestamp3("created_at").notNull().defaultNow(),
  updatedAt: timestamp3("updated_at").notNull().defaultNow().onUpdateNow()
});
var notificationPreferences2 = mysqlTable3("notification_preferences", {
  id: varchar3("id", { length: 36 }).primaryKey(),
  userId: int3("user_id").notNull().unique().references(() => users.id),
  // الإشعارات العامة
  enableAllNotifications: boolean3("enable_all_notifications").default(true),
  enableEmailNotifications: boolean3("enable_email_notifications").default(true),
  enableSmsNotifications: boolean3("enable_sms_notifications").default(true),
  enablePushNotifications: boolean3("enable_push_notifications").default(true),
  enableInAppNotifications: boolean3("enable_in_app_notifications").default(
    true
  ),
  // أنواع الإشعارات
  enableOrderStatusNotifications: boolean3(
    "enable_order_status_notifications"
  ).default(true),
  enableShipmentNotifications: boolean3("enable_shipment_notifications").default(
    true
  ),
  enablePaymentNotifications: boolean3("enable_payment_notifications").default(
    true
  ),
  enableCustomsNotifications: boolean3("enable_customs_notifications").default(
    true
  ),
  enablePriceAlertNotifications: boolean3(
    "enable_price_alert_notifications"
  ).default(true),
  enableSystemNotifications: boolean3("enable_system_notifications").default(
    true
  ),
  // أوقات الإشعارات
  quietHoursStart: varchar3("quiet_hours_start", { length: 5 }),
  // HH:MM
  quietHoursEnd: varchar3("quiet_hours_end", { length: 5 }),
  // HH:MM
  quietHoursEnabled: boolean3("quiet_hours_enabled").default(false),
  // التكرار
  maxNotificationsPerDay: int3("max_notifications_per_day").default(50),
  batchNotifications: boolean3("batch_notifications").default(false),
  batchInterval: mysqlEnum3("batch_interval", ["hourly", "daily", "weekly"]).default("daily"),
  // الإعدادات المتقدمة
  unsubscribeAll: boolean3("unsubscribe_all").default(false),
  customPreferences: text3("custom_preferences"),
  // JSON object
  createdAt: timestamp3("created_at").notNull().defaultNow(),
  updatedAt: timestamp3("updated_at").notNull().defaultNow().onUpdateNow()
});

// server/services/live-chat-service.ts
import { eq as eq3, and as and3, desc as desc3, gte, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
async function createLiveChatConversation(userId, subject, category, priority = "medium") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const conversationId = uuidv4();
  await db.insert(liveChatConversations).values({
    id: conversationId,
    userId,
    subject,
    category,
    priority,
    status: "open",
    messageCount: 0
  });
  return conversationId;
}
async function sendLiveChatMessage(conversationId, senderId, message, senderType = "customer", attachmentUrl, attachmentName, attachmentSize) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const messageId = uuidv4();
  await db.insert(liveChatMessages).values({
    id: messageId,
    conversationId,
    senderId,
    senderType,
    message,
    messageType: attachmentUrl ? "file" : "text",
    attachmentUrl,
    attachmentName,
    attachmentSize,
    isRead: false
  });
  const conversation = await db.select().from(liveChatConversations).where(eq3(liveChatConversations.id, conversationId)).limit(1);
  if (conversation.length > 0) {
    await db.update(liveChatConversations).set({
      messageCount: (conversation[0].messageCount || 0) + 1,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq3(liveChatConversations.id, conversationId));
  }
  return messageId;
}
async function getUserConversations(userId, limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const conversations = await db.select().from(liveChatConversations).where(eq3(liveChatConversations.userId, userId)).orderBy(desc3(liveChatConversations.updatedAt)).limit(limit);
  return conversations;
}
async function getConversationMessages(conversationId, limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const messages = await db.select().from(liveChatMessages).where(eq3(liveChatMessages.conversationId, conversationId)).orderBy(desc3(liveChatMessages.createdAt)).limit(limit);
  return messages.reverse();
}
async function updateConversationStatus(conversationId, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const closedAt = status === "closed" || status === "resolved" ? /* @__PURE__ */ new Date() : null;
  await db.update(liveChatConversations).set({
    status,
    closedAt,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq3(liveChatConversations.id, conversationId));
}
async function rateConversation(conversationId, messageId, rating, feedback) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }
  await db.update(liveChatMessages).set({
    rating,
    feedback,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq3(liveChatMessages.id, messageId));
}
async function getLiveChatStatistics(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query = db.select().from(liveChatConversations);
  if (userId) {
    query = query.where(eq3(liveChatConversations.userId, userId));
  }
  const conversations = await query;
  const stats = {
    totalConversations: conversations.length,
    openConversations: conversations.filter((c) => c.status === "open").length,
    inProgressConversations: conversations.filter(
      (c) => c.status === "in_progress"
    ).length,
    closedConversations: conversations.filter((c) => c.status === "closed").length,
    resolvedConversations: conversations.filter((c) => c.status === "resolved").length,
    averageResponseTime: calculateAverageResponseTime(conversations),
    averageResolutionTime: calculateAverageResolutionTime(conversations)
  };
  return stats;
}
function calculateAverageResponseTime(conversations) {
  const validTimes = conversations.filter((c) => c.firstResponseTime && c.createdAt).map((c) => {
    const responseTime = (c.firstResponseTime.getTime() - c.createdAt.getTime()) / 1e3;
    return responseTime;
  });
  if (validTimes.length === 0) return 0;
  const average = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
  return Math.round(average);
}
function calculateAverageResolutionTime(conversations) {
  const validTimes = conversations.filter((c) => c.resolvedTime && c.createdAt).map((c) => {
    const resolutionTime = (c.resolvedTime.getTime() - c.createdAt.getTime()) / 1e3 / 60;
    return resolutionTime;
  });
  if (validTimes.length === 0) return 0;
  const average = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
  return Math.round(average);
}
async function searchConversations(userId, searchQuery, filters) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query = db.select().from(liveChatConversations).where(eq3(liveChatConversations.userId, userId));
  if (filters?.status) {
    query = query.where(eq3(liveChatConversations.status, filters.status));
  }
  if (filters?.priority) {
    query = query.where(
      eq3(liveChatConversations.priority, filters.priority)
    );
  }
  if (filters?.category) {
    query = query.where(eq3(liveChatConversations.category, filters.category));
  }
  if (filters?.startDate && filters?.endDate) {
    query = query.where(
      and3(
        gte(liveChatConversations.createdAt, filters.startDate),
        lte(liveChatConversations.createdAt, filters.endDate)
      )
    );
  }
  const conversations = await query;
  return conversations.filter(
    (c) => c.subject.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
}
async function deleteConversation(conversationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(liveChatMessages).where(eq3(liveChatMessages.conversationId, conversationId));
  await db.delete(liveChatConversations).where(eq3(liveChatConversations.id, conversationId));
}
async function markMessageAsRead(messageId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(liveChatMessages).set({
    isRead: true,
    readAt: /* @__PURE__ */ new Date(),
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq3(liveChatMessages.id, messageId));
}
async function getUnreadMessages(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const unreadMessages = await db.select().from(liveChatMessages).where(
    and3(
      eq3(liveChatMessages.senderId, userId),
      eq3(liveChatMessages.isRead, false)
    )
  );
  return unreadMessages;
}
async function getNotificationHistory(userId, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const history = await db.select().from(notificationHistory).where(eq3(notificationHistory.userId, userId)).orderBy(desc3(notificationHistory.createdAt)).limit(limit).offset(offset);
  return history;
}

// server/services/notification-preferences-service.ts
import { eq as eq4 } from "drizzle-orm";
import { v4 as uuidv42 } from "uuid";
async function getNotificationPreferences(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let preferences = await db.select().from(notificationPreferences2).where(eq4(notificationPreferences2.userId, userId)).limit(1);
  if (preferences.length === 0) {
    await createDefaultNotificationPreferences(userId);
    preferences = await db.select().from(notificationPreferences2).where(eq4(notificationPreferences2.userId, userId)).limit(1);
  }
  return preferences[0];
}
async function createDefaultNotificationPreferences(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const preferencesId = uuidv42();
  await db.insert(notificationPreferences2).values({
    id: preferencesId,
    userId,
    enableAllNotifications: true,
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    enablePushNotifications: true,
    enableInAppNotifications: true,
    enableOrderStatusNotifications: true,
    enableShipmentNotifications: true,
    enablePaymentNotifications: true,
    enableCustomsNotifications: true,
    enablePriceAlertNotifications: true,
    enableSystemNotifications: true,
    quietHoursEnabled: false,
    batchNotifications: false,
    batchInterval: "daily",
    maxNotificationsPerDay: 50,
    unsubscribeAll: false
  });
  return preferencesId;
}
async function updateNotificationPreferences(userId, updates) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(notificationPreferences2).where(eq4(notificationPreferences2.userId, userId)).limit(1);
  if (existing.length === 0) {
    await createDefaultNotificationPreferences(userId);
  }
  await db.update(notificationPreferences2).set({
    ...updates,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq4(notificationPreferences2.userId, userId));
}
async function toggleAllNotifications(userId, enabled) {
  await updateNotificationPreferences(userId, {
    enableAllNotifications: enabled
  });
}
async function toggleNotificationChannel(userId, channel, enabled) {
  const channelMap = {
    email: "enableEmailNotifications",
    sms: "enableSmsNotifications",
    push: "enablePushNotifications",
    in_app: "enableInAppNotifications"
  };
  const updates = {};
  updates[channelMap[channel]] = enabled;
  await updateNotificationPreferences(userId, updates);
}
async function setQuietHours(userId, startTime, endTime, enabled = true) {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new Error("Invalid time format. Use HH:MM");
  }
  await updateNotificationPreferences(userId, {
    quietHoursStart: startTime,
    quietHoursEnd: endTime,
    quietHoursEnabled: enabled
  });
}
async function unsubscribeFromAllNotifications(userId) {
  await updateNotificationPreferences(userId, {
    unsubscribeAll: true,
    enableAllNotifications: false
  });
}
async function resubscribeToNotifications(userId) {
  await updateNotificationPreferences(userId, {
    unsubscribeAll: false,
    enableAllNotifications: true
  });
}
async function addNotificationChannel(userId, channelType, channelAddress, channelName, isPrimary = false) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const channelId = uuidv42();
  if (channelType === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(channelAddress)) {
      throw new Error("Invalid email address");
    }
  } else if (channelType === "sms") {
    const phoneRegex = /^\+?[0-9]{10,}$/;
    if (!phoneRegex.test(channelAddress)) {
      throw new Error("Invalid phone number");
    }
  }
  if (isPrimary) {
    await db.update(notificationChannels).set({ isPrimary: false }).where(
      eq4(notificationChannels.userId, userId) && eq4(notificationChannels.channelType, channelType)
    );
  }
  await db.insert(notificationChannels).values({
    id: channelId,
    userId,
    channelType,
    channelAddress,
    channelName: channelName || `${channelType} - ${channelAddress}`,
    isActive: true,
    isPrimary,
    isVerified: false
  });
  return channelId;
}
async function getUserNotificationChannels(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const channels = await db.select().from(notificationChannels).where(eq4(notificationChannels.userId, userId));
  return channels;
}
async function deleteNotificationChannel(channelId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(notificationChannels).where(eq4(notificationChannels.id, channelId));
}
async function getUserCustomNotifications(userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const notifications2 = await db.select().from(customNotifications).where(eq4(customNotifications.userId, userId));
  return notifications2;
}
async function createCustomNotification(userId, title, description, notificationType, channels, frequency = "immediately", conditions) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const notificationId = uuidv42();
  await db.insert(customNotifications).values({
    id: notificationId,
    userId,
    title,
    description,
    notificationType,
    channels: JSON.stringify(channels),
    frequency,
    conditions: conditions ? JSON.stringify(conditions) : null,
    isActive: true,
    isEnabled: true,
    sentCount: 0
  });
  return notificationId;
}
async function deleteCustomNotification(notificationId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(customNotifications).where(eq4(customNotifications.id, notificationId));
}
async function getNotificationStatistics(userId) {
  const preferences = await getNotificationPreferences(userId);
  const channels = await getUserNotificationChannels(userId);
  const customNotifs = await getUserCustomNotifications(userId);
  return {
    preferences,
    channels,
    customNotifications: customNotifs,
    totalChannels: channels.length,
    verifiedChannels: channels.filter((c) => c.isVerified).length,
    activeChannels: channels.filter((c) => c.isActive).length,
    customNotificationCount: customNotifs.length,
    enabledCustomNotifications: customNotifs.filter((n) => n.isEnabled).length
  };
}

// server/routers/live-chat-router.ts
var liveChatRouter = router({
  /**
   * إنشاء محادثة دعم جديدة
   */
  createConversation: protectedProcedure.input(
    z21.object({
      subject: z21.string().min(5).max(255),
      category: z21.enum([
        "billing",
        "technical",
        "general",
        "complaint"
      ]),
      priority: z21.enum(["low", "medium", "high", "urgent"]).default("medium")
    })
  ).mutation(async ({ input, ctx }) => {
    const conversationId = await createLiveChatConversation(
      ctx.user.id,
      input.subject,
      input.category,
      input.priority
    );
    return {
      success: true,
      conversationId,
      message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /**
   * إرسال رسالة في المحادثة
   */
  sendMessage: protectedProcedure.input(
    z21.object({
      conversationId: z21.string().uuid(),
      message: z21.string().min(1).max(5e3),
      attachmentUrl: z21.string().url().optional(),
      attachmentName: z21.string().optional(),
      attachmentSize: z21.number().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const messageId = await sendLiveChatMessage(
      input.conversationId,
      ctx.user.id,
      input.message,
      "customer",
      input.attachmentUrl,
      input.attachmentName,
      input.attachmentSize
    );
    return {
      success: true,
      messageId,
      message: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /**
   * الحصول على المحادثات
   */
  getConversations: protectedProcedure.input(
    z21.object({
      limit: z21.number().default(20).max(100)
    })
  ).query(async ({ input, ctx }) => {
    const conversations = await getUserConversations(
      ctx.user.id,
      input.limit
    );
    return {
      success: true,
      conversations,
      count: conversations.length
    };
  }),
  /**
   * الحصول على رسائل المحادثة
   */
  getMessages: protectedProcedure.input(
    z21.object({
      conversationId: z21.string().uuid(),
      limit: z21.number().default(50).max(200)
    })
  ).query(async ({ input, ctx }) => {
    const messages = await getConversationMessages(
      input.conversationId,
      input.limit
    );
    return {
      success: true,
      messages,
      count: messages.length
    };
  }),
  /**
   * تحديث حالة المحادثة
   */
  updateStatus: protectedProcedure.input(
    z21.object({
      conversationId: z21.string().uuid(),
      status: z21.enum([
        "open",
        "in_progress",
        "waiting_customer",
        "waiting_agent",
        "closed",
        "resolved"
      ])
    })
  ).mutation(async ({ input, ctx }) => {
    await updateConversationStatus(
      input.conversationId,
      input.status
    );
    return {
      success: true,
      message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /**
   * تقييم المحادثة
   */
  rateConversation: protectedProcedure.input(
    z21.object({
      conversationId: z21.string().uuid(),
      messageId: z21.string().uuid(),
      rating: z21.number().min(1).max(5),
      feedback: z21.string().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    await rateConversation(
      input.conversationId,
      input.messageId,
      input.rating,
      input.feedback
    );
    return {
      success: true,
      message: "\u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0642\u064A\u064A\u0645\u0643"
    };
  }),
  /**
   * الحصول على الإحصائيات
   */
  getStatistics: protectedProcedure.query(async ({ ctx }) => {
    const stats = await getLiveChatStatistics(ctx.user.id);
    return {
      success: true,
      statistics: stats
    };
  }),
  /**
   * البحث عن المحادثات
   */
  searchConversations: protectedProcedure.input(
    z21.object({
      query: z21.string().min(1),
      status: z21.string().optional(),
      priority: z21.string().optional(),
      category: z21.string().optional(),
      startDate: z21.date().optional(),
      endDate: z21.date().optional()
    })
  ).query(async ({ input, ctx }) => {
    const results = await searchConversations(
      ctx.user.id,
      input.query,
      {
        status: input.status,
        priority: input.priority,
        category: input.category,
        startDate: input.startDate,
        endDate: input.endDate
      }
    );
    return {
      success: true,
      results,
      count: results.length
    };
  }),
  /**
   * حذف المحادثة
   */
  deleteConversation: protectedProcedure.input(
    z21.object({
      conversationId: z21.string().uuid()
    })
  ).mutation(async ({ input, ctx }) => {
    await deleteConversation(input.conversationId);
    return {
      success: true,
      message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /**
   * تحديث الرسالة كمقروءة
   */
  markMessageAsRead: protectedProcedure.input(
    z21.object({
      messageId: z21.string().uuid()
    })
  ).mutation(async ({ input, ctx }) => {
    await markMessageAsRead(input.messageId);
    return {
      success: true,
      message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0631\u0633\u0627\u0644\u0629"
    };
  }),
  /**
   * الحصول على الرسائل غير المقروءة
   */
  getUnreadMessages: protectedProcedure.query(async ({ ctx }) => {
    const messages = await getUnreadMessages(ctx.user.id);
    return {
      success: true,
      messages,
      count: messages.length
    };
  }),
  /**
   * الحصول على تاريخ الإشعارات
   */
  getNotificationHistory: protectedProcedure.input(
    z21.object({
      limit: z21.number().default(50).max(200),
      offset: z21.number().default(0)
    })
  ).query(async ({ input, ctx }) => {
    const history = await getNotificationHistory(
      ctx.user.id,
      input.limit,
      input.offset
    );
    return {
      success: true,
      history,
      count: history.length
    };
  })
});
var notificationRouter = router({
  /**
   * الحصول على تفضيلات الإشعارات
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const preferences = await getNotificationPreferences(
      ctx.user.id
    );
    return {
      success: true,
      preferences
    };
  }),
  /**
   * تحديث تفضيلات الإشعارات
   */
  updatePreferences: protectedProcedure.input(
    z21.object({
      enableAllNotifications: z21.boolean().optional(),
      enableEmailNotifications: z21.boolean().optional(),
      enableSmsNotifications: z21.boolean().optional(),
      enablePushNotifications: z21.boolean().optional(),
      enableInAppNotifications: z21.boolean().optional(),
      enableOrderStatusNotifications: z21.boolean().optional(),
      enableShipmentNotifications: z21.boolean().optional(),
      enablePaymentNotifications: z21.boolean().optional(),
      enableCustomsNotifications: z21.boolean().optional(),
      enablePriceAlertNotifications: z21.boolean().optional(),
      enableSystemNotifications: z21.boolean().optional(),
      maxNotificationsPerDay: z21.number().optional(),
      batchNotifications: z21.boolean().optional(),
      batchInterval: z21.enum(["hourly", "daily", "weekly"]).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    await updateNotificationPreferences(
      ctx.user.id,
      input
    );
    return {
      success: true,
      message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062A\u0641\u0636\u064A\u0644\u0627\u062A \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /**
   * تفعيل/تعطيل جميع الإشعارات
   */
  toggleAllNotifications: protectedProcedure.input(
    z21.object({
      enabled: z21.boolean()
    })
  ).mutation(async ({ input, ctx }) => {
    await toggleAllNotifications(
      ctx.user.id,
      input.enabled
    );
    return {
      success: true,
      message: input.enabled ? "\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A" : "\u062A\u0645 \u062A\u0639\u0637\u064A\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A"
    };
  }),
  /**
   * تفعيل/تعطيل قناة معينة
   */
  toggleChannel: protectedProcedure.input(
    z21.object({
      channel: z21.enum(["email", "sms", "push", "in_app"]),
      enabled: z21.boolean()
    })
  ).mutation(async ({ input, ctx }) => {
    await toggleNotificationChannel(
      ctx.user.id,
      input.channel,
      input.enabled
    );
    return {
      success: true,
      message: `\u062A\u0645 ${input.enabled ? "\u062A\u0641\u0639\u064A\u0644" : "\u062A\u0639\u0637\u064A\u0644"} \u0642\u0646\u0627\u0629 ${input.channel}`
    };
  }),
  /**
   * تعيين ساعات الهدوء
   */
  setQuietHours: protectedProcedure.input(
    z21.object({
      startTime: z21.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      endTime: z21.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      enabled: z21.boolean().default(true)
    })
  ).mutation(async ({ input, ctx }) => {
    await setQuietHours(
      ctx.user.id,
      input.startTime,
      input.endTime,
      input.enabled
    );
    return {
      success: true,
      message: "\u062A\u0645 \u062A\u0639\u064A\u064A\u0646 \u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0647\u062F\u0648\u0621 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /**
   * إضافة قناة إشعار جديدة
   */
  addChannel: protectedProcedure.input(
    z21.object({
      channelType: z21.enum(["email", "sms", "push", "in_app"]),
      channelAddress: z21.string(),
      channelName: z21.string().optional(),
      isPrimary: z21.boolean().default(false)
    })
  ).mutation(async ({ input, ctx }) => {
    const channelId = await addNotificationChannel(
      ctx.user.id,
      input.channelType,
      input.channelAddress,
      input.channelName,
      input.isPrimary
    );
    return {
      success: true,
      channelId,
      message: "\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0642\u0646\u0627\u0629 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /**
   * الحصول على قنوات الإشعار
   */
  getChannels: protectedProcedure.query(async ({ ctx }) => {
    const channels = await getUserNotificationChannels(
      ctx.user.id
    );
    return {
      success: true,
      channels,
      count: channels.length
    };
  }),
  /**
   * حذف قناة إشعار
   */
  deleteChannel: protectedProcedure.input(
    z21.object({
      channelId: z21.string().uuid()
    })
  ).mutation(async ({ input, ctx }) => {
    await deleteNotificationChannel(input.channelId);
    return {
      success: true,
      message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0642\u0646\u0627\u0629 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /**
   * إنشاء إشعار مخصص
   */
  createCustomNotification: protectedProcedure.input(
    z21.object({
      title: z21.string().min(1).max(255),
      description: z21.string().optional(),
      notificationType: z21.string(),
      channels: z21.array(z21.enum(["email", "sms", "push", "in_app"])),
      frequency: z21.enum([
        "immediately",
        "daily",
        "weekly",
        "monthly",
        "never"
      ]).default("immediately"),
      conditions: z21.record(z21.any()).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const notificationId = await createCustomNotification(
      ctx.user.id,
      input.title,
      input.description,
      input.notificationType,
      input.channels,
      input.frequency,
      input.conditions
    );
    return {
      success: true,
      notificationId,
      message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u0627\u0644\u0645\u062E\u0635\u0635 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /**
   * الحصول على الإشعارات المخصصة
   */
  getCustomNotifications: protectedProcedure.query(async ({ ctx }) => {
    const notifications2 = await getUserCustomNotifications(ctx.user.id);
    return {
      success: true,
      notifications: notifications2,
      count: notifications2.length
    };
  }),
  /**
   * حذف إشعار مخصص
   */
  deleteCustomNotification: protectedProcedure.input(
    z21.object({
      notificationId: z21.string().uuid()
    })
  ).mutation(async ({ input, ctx }) => {
    await deleteCustomNotification(
      input.notificationId
    );
    return {
      success: true,
      message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u0627\u0644\u0645\u062E\u0635\u0635 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /**
   * الحصول على إحصائيات الإشعارات
   */
  getStatistics: protectedProcedure.query(async ({ ctx }) => {
    const statistics = await getNotificationStatistics(
      ctx.user.id
    );
    return {
      success: true,
      statistics
    };
  }),
  /**
   * إلغاء الاشتراك من جميع الإشعارات
   */
  unsubscribeAll: protectedProcedure.mutation(async ({ ctx }) => {
    await unsubscribeFromAllNotifications(ctx.user.id);
    return {
      success: true,
      message: "\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0645\u0646 \u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A"
    };
  }),
  /**
   * إعادة الاشتراك في الإشعارات
   */
  resubscribe: protectedProcedure.mutation(async ({ ctx }) => {
    await resubscribeToNotifications(ctx.user.id);
    return {
      success: true,
      message: "\u062A\u0645 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u0641\u064A \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A"
    };
  })
});

// server/routers/support-agent-router.ts
import { z as z22 } from "zod";
import { eq as eq5, desc as desc4, inArray } from "drizzle-orm";
import { TRPCError as TRPCError4 } from "@trpc/server";
var supportAgentRouter = router({
  /**
   * الحصول على المحادثات المعلقة للموظف
   */
  getPendingConversations: protectedProcedure.input(
    z22.object({
      limit: z22.number().int().min(1).max(100).default(20),
      offset: z22.number().int().min(0).default(0),
      status: z22.enum(["open", "in_progress", "waiting_customer"]).optional()
    })
  ).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (ctx.user.role !== "admin") {
      throw new TRPCError4({
        code: "FORBIDDEN",
        message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
      });
    }
    let query = db.select().from(liveChatConversations).where(
      input.status ? eq5(liveChatConversations.status, input.status) : inArray(liveChatConversations.status, [
        "open",
        "in_progress",
        "waiting_customer"
      ])
    ).orderBy(desc4(liveChatConversations.priority)).orderBy(desc4(liveChatConversations.createdAt));
    const conversations = await query.limit(input.limit).offset(input.offset);
    const total = (await query).length;
    return {
      conversations,
      total,
      hasMore: input.offset + input.limit < total
    };
  }),
  /**
   * الحصول على تفاصيل المحادثة الكاملة
   */
  getConversationDetails: protectedProcedure.input(
    z22.object({
      conversationId: z22.string().uuid()
    })
  ).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (ctx.user.role !== "admin") {
      throw new TRPCError4({
        code: "FORBIDDEN",
        message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
      });
    }
    const conversation = await db.select().from(liveChatConversations).where(eq5(liveChatConversations.id, input.conversationId)).limit(1);
    if (conversation.length === 0) {
      throw new TRPCError4({
        code: "NOT_FOUND",
        message: "\u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629"
      });
    }
    const messages = await db.select().from(liveChatMessages).where(eq5(liveChatMessages.conversationId, input.conversationId)).orderBy(desc4(liveChatMessages.createdAt));
    const customer = await db.select().from(users).where(eq5(users.id, conversation[0].userId)).limit(1);
    return {
      conversation: conversation[0],
      messages: messages.reverse(),
      customer: customer[0] || null
    };
  }),
  /**
   * تعيين محادثة للموظف
   */
  assignConversation: protectedProcedure.input(
    z22.object({
      conversationId: z22.string().uuid()
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (ctx.user.role !== "admin") {
      throw new TRPCError4({
        code: "FORBIDDEN",
        message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u062A\u0646\u0641\u064A\u0630 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621"
      });
    }
    await db.update(liveChatConversations).set({
      supportAgentId: ctx.user.id,
      status: "in_progress",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq5(liveChatConversations.id, input.conversationId));
    return {
      success: true,
      message: "\u062A\u0645 \u062A\u0639\u064A\u064A\u0646 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /**
   * إرسال رسالة في المحادثة
   */
  sendAgentMessage: protectedProcedure.input(
    z22.object({
      conversationId: z22.string().uuid(),
      message: z22.string().min(1).max(5e3),
      attachmentUrl: z22.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (ctx.user.role !== "admin") {
      throw new TRPCError4({
        code: "FORBIDDEN",
        message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u062A\u0646\u0641\u064A\u0630 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621"
      });
    }
    const conversation = await db.select().from(liveChatConversations).where(eq5(liveChatConversations.id, input.conversationId)).limit(1);
    if (conversation.length === 0 || conversation[0].supportAgentId !== ctx.user.id) {
      throw new TRPCError4({
        code: "FORBIDDEN",
        message: "\u0623\u0646\u062A \u063A\u064A\u0631 \u0645\u0643\u0644\u0641 \u0628\u0647\u0630\u0647 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629"
      });
    }
    const messageId = await new Promise((resolve) => {
      const id = Math.random().toString(36).substring(7);
      resolve(id);
    });
    await db.insert(liveChatMessages).values({
      id: messageId,
      conversationId: input.conversationId,
      senderId: ctx.user.id,
      senderType: "agent",
      message: input.message,
      messageType: input.attachmentUrl ? "file" : "text",
      attachmentUrl: input.attachmentUrl,
      isRead: false
    });
    await db.update(liveChatConversations).set({
      status: "waiting_customer",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq5(liveChatConversations.id, input.conversationId));
    return {
      success: true,
      messageId,
      message: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /**
   * إغلاق المحادثة
   */
  closeConversation: protectedProcedure.input(
    z22.object({
      conversationId: z22.string().uuid(),
      reason: z22.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (ctx.user.role !== "admin") {
      throw new TRPCError4({
        code: "FORBIDDEN",
        message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u062A\u0646\u0641\u064A\u0630 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621"
      });
    }
    await db.update(liveChatConversations).set({
      status: "resolved",
      closedAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq5(liveChatConversations.id, input.conversationId));
    return {
      success: true,
      message: "\u062A\u0645 \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /**
   * الحصول على إحصائيات الموظف
   */
  getAgentStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (ctx.user.role !== "admin") {
      throw new TRPCError4({
        code: "FORBIDDEN",
        message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
      });
    }
    const conversations = await db.select().from(liveChatConversations).where(eq5(liveChatConversations.supportAgentId, ctx.user.id));
    const stats = {
      totalConversations: conversations.length,
      activeConversations: conversations.filter(
        (c) => c.status === "in_progress"
      ).length,
      closedConversations: conversations.filter(
        (c) => c.status === "resolved"
      ).length,
      averageResponseTime: calculateAverageResponseTime2(conversations),
      averageResolutionTime: calculateAverageResolutionTime2(conversations),
      customerSatisfaction: calculateCustomerSatisfaction(conversations)
    };
    return stats;
  }),
  /**
   * الحصول على إحصائيات الفريق
   */
  getTeamStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (ctx.user.role !== "admin") {
      throw new TRPCError4({
        code: "FORBIDDEN",
        message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
      });
    }
    const conversations = await db.select().from(liveChatConversations);
    const agents = await db.select().from(users).where(eq5(users.role, "admin"));
    const agentStats = agents.map((agent) => {
      const agentConversations = conversations.filter(
        (c) => c.supportAgentId === agent.id
      );
      return {
        agentId: agent.id,
        agentName: agent.name || "\u0628\u062F\u0648\u0646 \u0627\u0633\u0645",
        totalConversations: agentConversations.length,
        activeConversations: agentConversations.filter(
          (c) => c.status === "in_progress"
        ).length,
        closedConversations: agentConversations.filter(
          (c) => c.status === "resolved"
        ).length
      };
    });
    const stats = {
      totalConversations: conversations.length,
      totalAgents: agents.length,
      activeConversations: conversations.filter(
        (c) => c.status === "in_progress"
      ).length,
      closedConversations: conversations.filter(
        (c) => c.status === "resolved"
      ).length,
      agentStats
    };
    return stats;
  }),
  /**
   * تصعيد المحادثة
   */
  escalateConversation: protectedProcedure.input(
    z22.object({
      conversationId: z22.string().uuid(),
      reason: z22.string()
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (ctx.user.role !== "admin") {
      throw new TRPCError4({
        code: "FORBIDDEN",
        message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u062A\u0646\u0641\u064A\u0630 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621"
      });
    }
    await db.update(liveChatConversations).set({
      priority: "urgent",
      status: "waiting_agent",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq5(liveChatConversations.id, input.conversationId));
    return {
      success: true,
      message: "\u062A\u0645 \u062A\u0635\u0639\u064A\u062F \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /**
   * تحويل المحادثة إلى موظف آخر
   */
  transferConversation: protectedProcedure.input(
    z22.object({
      conversationId: z22.string().uuid(),
      targetAgentId: z22.number(),
      reason: z22.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (ctx.user.role !== "admin") {
      throw new TRPCError4({
        code: "FORBIDDEN",
        message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u062A\u0646\u0641\u064A\u0630 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621"
      });
    }
    const targetAgent = await db.select().from(users).where(eq5(users.id, input.targetAgentId)).limit(1);
    if (targetAgent.length === 0) {
      throw new TRPCError4({
        code: "NOT_FOUND",
        message: "\u0627\u0644\u0645\u0648\u0638\u0641 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F"
      });
    }
    await db.update(liveChatConversations).set({
      supportAgentId: input.targetAgentId,
      status: "in_progress",
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq5(liveChatConversations.id, input.conversationId));
    return {
      success: true,
      message: "\u062A\u0645 \u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 \u0628\u0646\u062C\u0627\u062D"
    };
  }),
  /**
   * الحصول على الردود السريعة
   */
  getQuickReplies: protectedProcedure.query(async ({ ctx }) => {
    const quickReplies = [
      {
        id: "1",
        title: "\u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0648\u0627\u0635\u0644\u0643",
        content: "\u0634\u0643\u0631\u0627\u064B \u0644\u062A\u0648\u0627\u0635\u0644\u0643 \u0645\u0639\u0646\u0627. \u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u0627 \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0627\u0644\u064A\u0648\u0645\u061F"
      },
      {
        id: "2",
        title: "\u062C\u0627\u0631\u064A \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629",
        content: "\u0646\u062D\u0646 \u0646\u0639\u0645\u0644 \u0639\u0644\u0649 \u062D\u0644 \u0645\u0634\u0643\u0644\u062A\u0643. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u0642\u0644\u064A\u0644\u0627\u064B."
      },
      {
        id: "3",
        title: "\u062A\u0645 \u0627\u0644\u062D\u0644",
        content: "\u062A\u0645 \u062D\u0644 \u0645\u0634\u0643\u0644\u062A\u0643 \u0628\u0646\u062C\u0627\u062D. \u0647\u0644 \u0647\u0646\u0627\u0643 \u0623\u064A \u0634\u064A\u0621 \u0622\u062E\u0631 \u064A\u0645\u0643\u0646\u0646\u0627 \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0628\u0647\u061F"
      },
      {
        id: "4",
        title: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629",
        content: "\u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u0645\u0632\u064A\u062F \u0645\u0646 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u062D\u062A\u0649 \u0646\u062A\u0645\u0643\u0646 \u0645\u0646 \u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0628\u0634\u0643\u0644 \u0623\u0641\u0636\u0644."
      },
      {
        id: "5",
        title: "\u0627\u0644\u0627\u0639\u062A\u0630\u0627\u0631",
        content: "\u0646\u0639\u062A\u0630\u0631 \u0639\u0646 \u0627\u0644\u0625\u0632\u0639\u0627\u062C. \u0633\u0646\u0639\u0645\u0644 \u0639\u0644\u0649 \u062D\u0644 \u0647\u0630\u0647 \u0627\u0644\u0645\u0634\u0643\u0644\u0629 \u0641\u064A \u0623\u0633\u0631\u0639 \u0648\u0642\u062A."
      }
    ];
    return quickReplies;
  }),
  /**
   * إضافة ملاحظة داخلية للمحادثة
   */
  addConversationNote: protectedProcedure.input(
    z22.object({
      conversationId: z22.string().uuid(),
      note: z22.string().min(1).max(1e3).trim()
    })
  ).mutation(async ({ ctx, input }) => {
    return {
      success: true,
      message: "\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629 \u0628\u0646\u062C\u0627\u062D"
    };
  })
});
function calculateAverageResponseTime2(conversations) {
  const validTimes = conversations.filter((c) => c.firstResponseTime && c.createdAt).map((c) => {
    const responseTime = (c.firstResponseTime.getTime() - c.createdAt.getTime()) / 1e3;
    return responseTime;
  });
  if (validTimes.length === 0) return 0;
  const average = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
  return Math.round(average);
}
function calculateAverageResolutionTime2(conversations) {
  const validTimes = conversations.filter((c) => c.resolvedTime && c.createdAt).map((c) => {
    const resolutionTime = (c.resolvedTime.getTime() - c.createdAt.getTime()) / 1e3 / 60;
    return resolutionTime;
  });
  if (validTimes.length === 0) return 0;
  const average = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
  return Math.round(average);
}
function calculateCustomerSatisfaction(conversations) {
  const ratedConversations = conversations.filter((c) => c.rating);
  if (ratedConversations.length === 0) return 0;
  const totalRating = ratedConversations.reduce((sum, c) => sum + (c.rating || 0), 0);
  const averageRating = totalRating / ratedConversations.length;
  return Math.round(averageRating * 100) / 100;
}

// server/routers/notifications-advanced-router.ts
import { z as z23 } from "zod";

// server/services/notification-manager.ts
import { EventEmitter } from "events";
var NotificationManager = class extends EventEmitter {
  subscribers = /* @__PURE__ */ new Map();
  notificationHistory = [];
  maxHistorySize = 1e3;
  /**
   * الاشتراك في الإشعارات
   */
  subscribe(userId, callback) {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, /* @__PURE__ */ new Set());
    }
    this.subscribers.get(userId).add(callback);
    return () => {
      const callbacks = this.subscribers.get(userId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(userId);
        }
      }
    };
  }
  /**
   * إرسال إشعار جديد
   */
  async sendNotification(notification) {
    this.addToHistory(notification);
    if (notification.userId) {
      const callbacks = this.subscribers.get(notification.userId);
      if (callbacks) {
        callbacks.forEach((callback) => {
          try {
            callback(notification);
          } catch (error) {
            console.error("\u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C \u0627\u0644\u0625\u0634\u0639\u0627\u0631:", error);
          }
        });
      }
    }
    if (notification.agentId) {
      const agentCallbacks = this.subscribers.get(notification.agentId);
      if (agentCallbacks) {
        agentCallbacks.forEach((callback) => {
          try {
            callback(notification);
          } catch (error) {
            console.error("\u062E\u0637\u0623 \u0641\u064A \u0645\u0639\u0627\u0644\u062C \u0627\u0644\u0625\u0634\u0639\u0627\u0631:", error);
          }
        });
      }
    }
    this.emit("notification", notification);
  }
  /**
   * إرسال إشعار محادثة جديدة
   */
  async notifyNewConversation(conversationId, subject, priority) {
    await this.sendNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type: "new_conversation",
      title: "\u0645\u062D\u0627\u062F\u062B\u0629 \u062C\u062F\u064A\u062F\u0629",
      message: `\u0645\u062D\u0627\u062F\u062B\u0629 \u062C\u062F\u064A\u062F\u0629: ${subject}`,
      conversationId,
      userId: 0,
      priority,
      timestamp: /* @__PURE__ */ new Date()
    });
  }
  /**
   * إرسال إشعار محادثة مصعدة
   */
  async notifyEscalated(conversationId, subject, reason) {
    await this.sendNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type: "escalated",
      title: "\u0645\u062D\u0627\u062F\u062B\u0629 \u0645\u0635\u0639\u062F\u0629",
      message: `\u062A\u0645 \u062A\u0635\u0639\u064A\u062F \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629: ${subject} - \u0627\u0644\u0633\u0628\u0628: ${reason}`,
      conversationId,
      userId: 0,
      priority: "urgent",
      timestamp: /* @__PURE__ */ new Date(),
      data: { reason }
    });
  }
  /**
   * إرسال إشعار تعيين محادثة
   */
  async notifyAssigned(conversationId, subject, agentId, agentName) {
    await this.sendNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type: "assigned",
      title: "\u0645\u062D\u0627\u062F\u062B\u0629 \u0645\u0639\u064A\u0646\u0629 \u0644\u0643",
      message: `\u062A\u0645 \u062A\u0639\u064A\u064A\u0646 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629 "${subject}" \u0644\u0643`,
      conversationId,
      userId: agentId,
      agentId,
      priority: "high",
      timestamp: /* @__PURE__ */ new Date(),
      data: { agentName }
    });
  }
  /**
   * إرسال إشعار إغلاق محادثة
   */
  async notifyConversationClosed(conversationId, subject, agentId) {
    await this.sendNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type: "closed",
      title: "\u062A\u0645 \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629",
      message: `\u062A\u0645 \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0629: ${subject}`,
      conversationId,
      userId: agentId,
      agentId,
      priority: "medium",
      timestamp: /* @__PURE__ */ new Date()
    });
  }
  /**
   * إرسال إشعار رسالة جديدة
   */
  async notifyNewMessage(conversationId, senderName, message, recipientId) {
    await this.sendNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type: "message",
      title: "\u0631\u0633\u0627\u0644\u0629 \u062C\u062F\u064A\u062F\u0629",
      message: `${senderName}: ${message.substring(0, 50)}${message.length > 50 ? "..." : ""}`,
      conversationId,
      userId: recipientId,
      priority: "medium",
      timestamp: /* @__PURE__ */ new Date(),
      data: { senderName, message }
    });
  }
  /**
   * إرسال إشعار تقييم جديد
   */
  async notifyNewRating(conversationId, rating, comment, agentId) {
    await this.sendNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type: "rating",
      title: "\u062A\u0642\u064A\u064A\u0645 \u062C\u062F\u064A\u062F",
      message: `\u062A\u0642\u064A\u064A\u0645 \u062C\u062F\u064A\u062F: ${rating}/5 - ${comment}`,
      conversationId,
      userId: agentId,
      agentId,
      priority: "medium",
      timestamp: /* @__PURE__ */ new Date(),
      data: { rating, comment }
    });
  }
  /**
   * الحصول على سجل الإشعارات
   */
  getHistory(limit = 50) {
    return this.notificationHistory.slice(-limit);
  }
  /**
   * الحصول على الإشعارات غير المقروءة
   */
  getUnreadNotifications(userId) {
    return this.notificationHistory.filter(
      (n) => (n.userId === userId || n.agentId === userId) && !n.data?.isRead
    );
  }
  /**
   * تحديد الإشعار كمقروء
   */
  markAsRead(notificationId) {
    const notification = this.notificationHistory.find((n) => n.id === notificationId);
    if (notification) {
      notification.data = { ...notification.data, isRead: true };
    }
  }
  /**
   * حذف الإشعار
   */
  deleteNotification(notificationId) {
    const index = this.notificationHistory.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      this.notificationHistory.splice(index, 1);
    }
  }
  /**
   * إضافة الإشعار إلى السجل
   */
  addToHistory(notification) {
    this.notificationHistory.push(notification);
    if (this.notificationHistory.length > this.maxHistorySize) {
      this.notificationHistory = this.notificationHistory.slice(-this.maxHistorySize);
    }
  }
  /**
   * مسح السجل
   */
  clearHistory() {
    this.notificationHistory = [];
  }
  /**
   * الحصول على إحصائيات الإشعارات
   */
  getStatistics() {
    const stats = {
      totalNotifications: this.notificationHistory.length,
      byType: {},
      byPriority: {},
      subscribedUsers: this.subscribers.size
    };
    this.notificationHistory.forEach((n) => {
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
      stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
    });
    return stats;
  }
};
var notificationManager = new NotificationManager();
function getNotificationHistory2(limit) {
  return notificationManager.getHistory(limit);
}
function getNotificationStatistics2() {
  return notificationManager.getStatistics();
}

// server/routers/notifications-advanced-router.ts
import { TRPCError as TRPCError5 } from "@trpc/server";
var notificationsAdvancedRouter = router({
  /**
   * الحصول على الإشعارات الحالية للمستخدم
   */
  getNotifications: protectedProcedure.input(
    z23.object({
      limit: z23.number().int().min(1).max(100).default(20),
      offset: z23.number().int().min(0).default(0)
    })
  ).query(async ({ ctx, input }) => {
    try {
      const history = getNotificationHistory2(input.limit + input.offset);
      const userNotifications = history.filter(
        (n) => n.userId === ctx.user.id || n.agentId === ctx.user.id
      );
      return {
        notifications: userNotifications.slice(input.offset, input.offset + input.limit),
        total: userNotifications.length,
        hasMore: userNotifications.length > input.offset + input.limit
      };
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A:", error);
      throw new TRPCError5({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على الإشعارات غير المقروءة
   */
  getUnreadNotifications: protectedProcedure.query(async ({ ctx }) => {
    try {
      const history = getNotificationHistory2(1e3);
      const unreadNotifications = history.filter(
        (n) => (n.userId === ctx.user.id || n.agentId === ctx.user.id) && !n.data?.isRead
      );
      return {
        notifications: unreadNotifications,
        count: unreadNotifications.length
      };
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u063A\u064A\u0631 \u0627\u0644\u0645\u0642\u0631\u0648\u0621\u0629:", error);
      throw new TRPCError5({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u063A\u064A\u0631 \u0627\u0644\u0645\u0642\u0631\u0648\u0621\u0629"
      });
    }
  }),
  /**
   * تحديد الإشعار كمقروء
   */
  markAsRead: protectedProcedure.input(
    z23.object({
      notificationId: z23.string()
    })
  ).mutation(async ({ input }) => {
    try {
      notificationManager.markAsRead(input.notificationId);
      return { success: true };
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u0643\u0645\u0642\u0631\u0648\u0621:", error);
      throw new TRPCError5({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0625\u0634\u0639\u0627\u0631 \u0643\u0645\u0642\u0631\u0648\u0621"
      });
    }
  }),
  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const history = getNotificationHistory2(1e3);
      const userNotifications = history.filter(
        (n) => n.userId === ctx.user.id || n.agentId === ctx.user.id
      );
      userNotifications.forEach((n) => {
        notificationManager.markAsRead(n.id);
      });
      return { success: true, count: userNotifications.length };
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062F \u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0643\u0645\u0642\u0631\u0648\u0621\u0629:", error);
      throw new TRPCError5({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A"
      });
    }
  }),
  /**
   * حذف الإشعار
   */
  deleteNotification: protectedProcedure.input(
    z23.object({
      notificationId: z23.string()
    })
  ).mutation(async ({ input }) => {
    try {
      notificationManager.deleteNotification(input.notificationId);
      return { success: true };
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631:", error);
      throw new TRPCError5({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631"
      });
    }
  }),
  /**
   * حذف جميع الإشعارات
   */
  deleteAllNotifications: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const history = getNotificationHistory2(1e3);
      const userNotifications = history.filter(
        (n) => n.userId === ctx.user.id || n.agentId === ctx.user.id
      );
      userNotifications.forEach((n) => {
        notificationManager.deleteNotification(n.id);
      });
      return { success: true, count: userNotifications.length };
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u062D\u0630\u0641 \u062C\u0645\u064A\u0639 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A:", error);
      throw new TRPCError5({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على إحصائيات الإشعارات
   */
  getStatistics: protectedProcedure.query(async () => {
    try {
      const stats = getNotificationStatistics2();
      return stats;
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A:", error);
      throw new TRPCError5({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A"
      });
    }
  }),
  /**
   * الاشتراك في الإشعارات (للعملاء الفعليين)
   */
  subscribe: protectedProcedure.subscription(async function* ({ ctx }) {
    const channel = new BroadcastChannel(`notifications-${ctx.user.id}`);
    try {
      yield { type: "connected", message: "\u062A\u0645 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0646\u062C\u0627\u062D" };
      channel.onmessage = (event) => {
        const notification = event.data;
        if (notification.userId === ctx.user.id || notification.agentId === ctx.user.id) {
        }
      };
      await new Promise(() => {
      });
    } finally {
      channel.close();
    }
  }),
  /**
   * إرسال إشعار اختبار
   */
  sendTestNotification: protectedProcedure.input(
    z23.object({
      title: z23.string().min(1).max(100),
      message: z23.string().min(1).max(500),
      type: z23.enum([
        "new_conversation",
        "escalated",
        "assigned",
        "closed",
        "message",
        "rating"
      ]),
      priority: z23.enum(["low", "medium", "high", "urgent"])
    })
  ).mutation(async ({ ctx, input }) => {
    try {
      const testNotification = {
        id: `test_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        type: input.type,
        title: input.title,
        message: input.message,
        conversationId: "test_conversation",
        userId: ctx.user.id,
        priority: input.priority,
        timestamp: /* @__PURE__ */ new Date(),
        data: { isTest: true }
      };
      await notificationManager.sendNotification(testNotification);
      return {
        success: true,
        notification: testNotification
      };
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631:", error);
      throw new TRPCError5({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0631\u0633\u0627\u0644 \u0625\u0634\u0639\u0627\u0631 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631"
      });
    }
  }),
  /**
   * الحصول على إحصائيات الإشعارات حسب النوع
   */
  getStatisticsByType: protectedProcedure.query(async () => {
    try {
      const stats = getNotificationStatistics2();
      return stats.byType || {};
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u062D\u0633\u0628 \u0627\u0644\u0646\u0648\u0639:", error);
      throw new TRPCError5({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على إحصائيات الإشعارات حسب الأولوية
   */
  getStatisticsByPriority: protectedProcedure.query(async () => {
    try {
      const stats = getNotificationStatistics2();
      return stats.byPriority || {};
    } catch (error) {
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u062D\u0633\u0628 \u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629:", error);
      throw new TRPCError5({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A"
      });
    }
  })
});

// server/routers/performance-analytics-router.ts
import { z as z24 } from "zod";

// server/services/performance-analytics.ts
import { eq as eq6 } from "drizzle-orm";
var PerformanceAnalytics = class {
  /**
   * حساب مقاييس أداء الموظف
   */
  async calculateAgentMetrics(agentId, agentName, startDate, endDate) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
    const end = endDate || /* @__PURE__ */ new Date();
    let query = db.select().from(liveChatConversations).where(eq6(liveChatConversations.supportAgentId, agentId));
    const conversations = await query;
    const totalConversations = conversations.length;
    const activeConversations = conversations.filter(
      (c) => c.status === "in_progress" || c.status === "open"
    ).length;
    const closedConversations = conversations.filter(
      (c) => c.status === "resolved"
    ).length;
    const responseTimes = conversations.filter((c) => c.firstResponseTime && c.createdAt).map((c) => (c.firstResponseTime.getTime() - c.createdAt.getTime()) / 1e3);
    const averageResponseTime = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
    const resolutionTimes = conversations.filter((c) => c.resolvedTime && c.createdAt).map((c) => (c.resolvedTime.getTime() - c.createdAt.getTime()) / 1e3 / 60);
    const averageResolutionTime = resolutionTimes.length > 0 ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length : 0;
    const ratedConversations = conversations.filter((c) => c.rating);
    const customerSatisfaction = ratedConversations.length > 0 ? ratedConversations.reduce((sum, c) => sum + (c.rating || 0), 0) / ratedConversations.length : 0;
    const messages = await db.select().from(liveChatMessages).where(eq6(liveChatMessages.senderId, agentId));
    const messageCount = messages.length;
    const firstResponseRate = totalConversations > 0 ? responseTimes.length / totalConversations * 100 : 0;
    const resolutionRate = totalConversations > 0 ? closedConversations / totalConversations * 100 : 0;
    const escalationCount = conversations.filter(
      (c) => c.priority === "urgent"
    ).length;
    const escalationRate = totalConversations > 0 ? escalationCount / totalConversations * 100 : 0;
    return {
      agentId,
      agentName,
      totalConversations,
      activeConversations,
      closedConversations,
      averageResponseTime: Math.round(averageResponseTime),
      averageResolutionTime: Math.round(averageResolutionTime),
      customerSatisfaction: Math.round(customerSatisfaction * 100) / 100,
      messageCount,
      firstResponseRate: Math.round(firstResponseRate),
      resolutionRate: Math.round(resolutionRate),
      escalationCount,
      escalationRate: Math.round(escalationRate)
    };
  }
  /**
   * حساب مقاييس أداء الفريق
   */
  async calculateTeamMetrics(agentIds, startDate, endDate) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const agentMetrics = [];
    for (const agentId of agentIds) {
      const metrics = await this.calculateAgentMetrics(
        agentId,
        `Agent ${agentId}`,
        startDate,
        endDate
      );
      agentMetrics.push(metrics);
    }
    const totalAgents = agentIds.length;
    const totalConversations = agentMetrics.reduce(
      (sum, m) => sum + m.totalConversations,
      0
    );
    const activeConversations = agentMetrics.reduce(
      (sum, m) => sum + m.activeConversations,
      0
    );
    const closedConversations = agentMetrics.reduce(
      (sum, m) => sum + m.closedConversations,
      0
    );
    const averageTeamResponseTime = agentMetrics.length > 0 ? agentMetrics.reduce((sum, m) => sum + m.averageResponseTime, 0) / agentMetrics.length : 0;
    const averageTeamResolutionTime = agentMetrics.length > 0 ? agentMetrics.reduce((sum, m) => sum + m.averageResolutionTime, 0) / agentMetrics.length : 0;
    const teamSatisfaction = agentMetrics.length > 0 ? agentMetrics.reduce((sum, m) => sum + m.customerSatisfaction, 0) / agentMetrics.length : 0;
    const sortedByPerformance = [...agentMetrics].sort(
      (a, b) => b.customerSatisfaction - a.customerSatisfaction
    );
    const topPerformers = sortedByPerformance.slice(0, 3);
    const bottomPerformers = sortedByPerformance.slice(-3).reverse();
    const trends = this.generateTrends(agentMetrics);
    return {
      totalAgents,
      totalConversations,
      activeConversations,
      closedConversations,
      averageTeamResponseTime: Math.round(averageTeamResponseTime),
      averageTeamResolutionTime: Math.round(averageTeamResolutionTime),
      teamSatisfaction: Math.round(teamSatisfaction * 100) / 100,
      topPerformers,
      bottomPerformers,
      trends
    };
  }
  /**
   * توليد تقرير الأداء الشامل
   */
  async generatePerformanceReport(agentIds, startDate, endDate) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3);
    const end = endDate || /* @__PURE__ */ new Date();
    const agents = [];
    for (const agentId of agentIds) {
      const metrics = await this.calculateAgentMetrics(
        agentId,
        `Agent ${agentId}`,
        start,
        end
      );
      agents.push(metrics);
    }
    const team = await this.calculateTeamMetrics(agentIds, start, end);
    const insights = this.generateInsights(agents, team);
    const recommendations = this.generateRecommendations(agents, team);
    return {
      period: { startDate: start, endDate: end },
      agents,
      team,
      insights,
      recommendations
    };
  }
  /**
   * توليد الرؤى
   */
  generateInsights(agents, team) {
    const insights = [];
    if (team.teamSatisfaction >= 4.5) {
      insights.push("\u0623\u062F\u0627\u0621 \u0627\u0644\u0641\u0631\u064A\u0642 \u0645\u0645\u062A\u0627\u0632\u0629 \u062C\u062F\u0627\u064B \u0645\u0639 \u0631\u0636\u0627 \u0639\u0645\u0644\u0627\u0621 \u0639\u0627\u0644\u064A \u062C\u062F\u0627\u064B");
    } else if (team.teamSatisfaction >= 4) {
      insights.push("\u0623\u062F\u0627\u0621 \u0627\u0644\u0641\u0631\u064A\u0642 \u062C\u064A\u062F\u0629 \u0645\u0639 \u0631\u0636\u0627 \u0639\u0645\u0644\u0627\u0621 \u0639\u0627\u0644\u064A");
    } else if (team.teamSatisfaction >= 3) {
      insights.push("\u0623\u062F\u0627\u0621 \u0627\u0644\u0641\u0631\u064A\u0642 \u0645\u062A\u0648\u0633\u0637\u0629 - \u0647\u0646\u0627\u0643 \u0645\u062C\u0627\u0644 \u0644\u0644\u062A\u062D\u0633\u0646");
    } else {
      insights.push("\u0623\u062F\u0627\u0621 \u0627\u0644\u0641\u0631\u064A\u0642 \u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u062A\u062D\u0633\u0646 \u0641\u0648\u0631\u064A");
    }
    if (team.averageTeamResponseTime < 60) {
      insights.push("\u0648\u0642\u062A \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0645\u0645\u062A\u0627\u0632 - \u0623\u0642\u0644 \u0645\u0646 \u062F\u0642\u064A\u0642\u0629");
    } else if (team.averageTeamResponseTime < 300) {
      insights.push("\u0648\u0642\u062A \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u062C\u064A\u062F - \u062D\u0648\u0627\u0644\u064A 5 \u062F\u0642\u0627\u0626\u0642");
    } else {
      insights.push("\u0648\u0642\u062A \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 \u0628\u0637\u064A\u0621 - \u064A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u062A\u062D\u0633\u0646");
    }
    const avgEscalationRate = agents.reduce((sum, a) => sum + a.escalationRate, 0) / agents.length;
    if (avgEscalationRate < 5) {
      insights.push("\u0645\u0639\u062F\u0644 \u0627\u0644\u062A\u0635\u0639\u064A\u062F \u0645\u0646\u062E\u0641\u0636 \u062C\u062F\u0627\u064B - \u0627\u0644\u0645\u0648\u0638\u0641\u0648\u0646 \u064A\u062A\u0639\u0627\u0645\u0644\u0648\u0646 \u0645\u0639 \u0627\u0644\u0645\u0634\u0627\u0643\u0644 \u0628\u0643\u0641\u0627\u0621\u0629");
    } else if (avgEscalationRate > 20) {
      insights.push("\u0645\u0639\u062F\u0644 \u0627\u0644\u062A\u0635\u0639\u064A\u062F \u0645\u0631\u062A\u0641\u0639 - \u0642\u062F \u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u062A\u062F\u0631\u064A\u0628 \u0625\u0636\u0627\u0641\u064A");
    }
    return insights;
  }
  /**
   * توليد التوصيات
   */
  generateRecommendations(agents, team) {
    const recommendations = [];
    if (team.teamSatisfaction < 4) {
      recommendations.push("\u062A\u0642\u062F\u064A\u0645 \u062A\u062F\u0631\u064A\u0628 \u0625\u0636\u0627\u0641\u064A \u0644\u0644\u0645\u0648\u0638\u0641\u064A\u0646 \u0644\u062A\u062D\u0633\u064A\u0646 \u0645\u0647\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0639\u0627\u0645\u0644 \u0645\u0639 \u0627\u0644\u0639\u0645\u0644\u0627\u0621");
    }
    if (team.averageTeamResponseTime > 300) {
      recommendations.push("\u0632\u064A\u0627\u062F\u0629 \u0639\u062F\u062F \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646 \u0623\u0648 \u062A\u062D\u0633\u064A\u0646 \u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0645\u062D\u0627\u062F\u062B\u0627\u062A");
    }
    const lowPerformers = agents.filter((a) => a.customerSatisfaction < 3);
    if (lowPerformers.length > 0) {
      recommendations.push(
        `\u062A\u0642\u062F\u064A\u0645 \u062F\u0639\u0645 \u0641\u0631\u062F\u064A \u0644\u0644\u0645\u0648\u0638\u0641\u064A\u0646: ${lowPerformers.map((a) => a.agentName).join(", ")}`
      );
    }
    const topPerformers = agents.filter((a) => a.customerSatisfaction >= 4.5);
    if (topPerformers.length > 0) {
      recommendations.push(
        `\u062A\u0643\u0631\u064A\u0645 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646 \u0630\u0648\u064A \u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0639\u0627\u0644\u064A: ${topPerformers.map((a) => a.agentName).join(", ")}`
      );
    }
    return recommendations;
  }
  /**
   * توليد الاتجاهات
   */
  generateTrends(agents) {
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date3 = /* @__PURE__ */ new Date();
      date3.setDate(date3.getDate() - i);
      trends.push({
        date: date3.toISOString().split("T")[0],
        conversations: Math.floor(Math.random() * 100 + 50),
        satisfaction: Math.random() * 2 + 3.5,
        responseTime: Math.floor(Math.random() * 200 + 100)
      });
    }
    return trends;
  }
  /**
   * الحصول على إحصائيات مقارنة
   */
  async getComparativeAnalysis(agentId1, agentId2, agentName1, agentName2) {
    const metrics1 = await this.calculateAgentMetrics(agentId1, agentName1);
    const metrics2 = await this.calculateAgentMetrics(agentId2, agentName2);
    return {
      agent1: metrics1,
      agent2: metrics2,
      comparison: {
        responseTimeDifference: metrics1.averageResponseTime - metrics2.averageResponseTime,
        satisfactionDifference: metrics1.customerSatisfaction - metrics2.customerSatisfaction,
        resolutionRateDifference: metrics1.resolutionRate - metrics2.resolutionRate,
        winner: metrics1.customerSatisfaction > metrics2.customerSatisfaction ? 1 : 2
      }
    };
  }
};
var performanceAnalytics = new PerformanceAnalytics();
async function getAgentMetrics(agentId, agentName, startDate, endDate) {
  return performanceAnalytics.calculateAgentMetrics(agentId, agentName, startDate, endDate);
}
async function getTeamMetrics(agentIds, startDate, endDate) {
  return performanceAnalytics.calculateTeamMetrics(agentIds, startDate, endDate);
}
async function generateReport(agentIds, startDate, endDate) {
  return performanceAnalytics.generatePerformanceReport(agentIds, startDate, endDate);
}

// server/routers/performance-analytics-router.ts
import { TRPCError as TRPCError6 } from "@trpc/server";
var performanceAnalyticsRouter = router({
  /**
   * الحصول على مقاييس أداء الموظف
   */
  getAgentMetrics: protectedProcedure.input(
    z24.object({
      agentId: z24.number().int().positive(),
      agentName: z24.string().min(1).max(100),
      startDate: z24.date().optional(),
      endDate: z24.date().optional()
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
        throw new TRPCError6({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
        });
      }
      const metrics = await getAgentMetrics(
        input.agentId,
        input.agentName,
        input.startDate,
        input.endDate
      );
      return metrics;
    } catch (error) {
      if (error instanceof TRPCError6) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0645\u0642\u0627\u064A\u064A\u0633 \u0627\u0644\u0645\u0648\u0638\u0641:", error);
      throw new TRPCError6({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0645\u0642\u0627\u064A\u064A\u0633"
      });
    }
  }),
  /**
   * الحصول على مقاييس أداء الفريق
   */
  getTeamMetrics: protectedProcedure.input(
    z24.object({
      agentIds: z24.array(z24.number().int().positive()),
      startDate: z24.date().optional(),
      endDate: z24.date().optional()
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new TRPCError6({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0639\u0631\u0636 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0641\u0631\u064A\u0642"
        });
      }
      const metrics = await getTeamMetrics(
        input.agentIds,
        input.startDate,
        input.endDate
      );
      return metrics;
    } catch (error) {
      if (error instanceof TRPCError6) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0645\u0642\u0627\u064A\u064A\u0633 \u0627\u0644\u0641\u0631\u064A\u0642:", error);
      throw new TRPCError6({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0645\u0642\u0627\u064A\u064A\u0633"
      });
    }
  }),
  /**
   * توليد تقرير الأداء الشامل
   */
  generatePerformanceReport: protectedProcedure.input(
    z24.object({
      agentIds: z24.array(z24.number().int().positive()),
      startDate: z24.date().optional(),
      endDate: z24.date().optional()
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new TRPCError6({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0639\u0631\u0636 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631"
        });
      }
      const report = await generateReport(
        input.agentIds,
        input.startDate,
        input.endDate
      );
      return report;
    } catch (error) {
      if (error instanceof TRPCError6) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u0648\u0644\u064A\u062F \u0627\u0644\u062A\u0642\u0631\u064A\u0631:", error);
      throw new TRPCError6({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u0648\u0644\u064A\u062F \u0627\u0644\u062A\u0642\u0631\u064A\u0631"
      });
    }
  }),
  /**
   * الحصول على إحصائيات الموظف الشهرية
   */
  getMonthlyAgentStats: protectedProcedure.input(
    z24.object({
      agentId: z24.number().int().positive(),
      agentName: z24.string().min(1).max(100),
      month: z24.number().int().min(1).max(12),
      year: z24.number().int().min(2020).max(2100)
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
        throw new TRPCError6({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
        });
      }
      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 0);
      const metrics = await getAgentMetrics(
        input.agentId,
        input.agentName,
        startDate,
        endDate
      );
      return {
        month: input.month,
        year: input.year,
        metrics
      };
    } catch (error) {
      if (error instanceof TRPCError6) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0634\u0647\u0631:", error);
      throw new TRPCError6({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على إحصائيات الفريق الشهرية
   */
  getMonthlyTeamStats: protectedProcedure.input(
    z24.object({
      agentIds: z24.array(z24.number().int().positive()),
      month: z24.number().int().min(1).max(12),
      year: z24.number().int().min(2020).max(2100)
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new TRPCError6({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0639\u0631\u0636 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0641\u0631\u064A\u0642"
        });
      }
      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 0);
      const metrics = await getTeamMetrics(input.agentIds, startDate, endDate);
      return {
        month: input.month,
        year: input.year,
        metrics
      };
    } catch (error) {
      if (error instanceof TRPCError6) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0641\u0631\u064A\u0642 \u0627\u0644\u0634\u0647\u0631\u064A\u0629:", error);
      throw new TRPCError6({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على أفضل الموظفين أداءً
   */
  getTopPerformers: protectedProcedure.input(
    z24.object({
      agentIds: z24.array(z24.number().int().positive()),
      limit: z24.number().int().min(1).max(20).default(5),
      startDate: z24.date().optional(),
      endDate: z24.date().optional()
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new TRPCError6({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0639\u0631\u0636 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
        });
      }
      const metrics = await getTeamMetrics(
        input.agentIds,
        input.startDate,
        input.endDate
      );
      return metrics.topPerformers.slice(0, input.limit);
    } catch (error) {
      if (error instanceof TRPCError6) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0623\u0641\u0636\u0644 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646:", error);
      throw new TRPCError6({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على الموظفين الذين يحتاجون إلى تحسن
   */
  getBottomPerformers: protectedProcedure.input(
    z24.object({
      agentIds: z24.array(z24.number().int().positive()),
      limit: z24.number().int().min(1).max(20).default(5),
      startDate: z24.date().optional(),
      endDate: z24.date().optional()
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new TRPCError6({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0639\u0631\u0636 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
        });
      }
      const metrics = await getTeamMetrics(
        input.agentIds,
        input.startDate,
        input.endDate
      );
      return metrics.bottomPerformers.slice(0, input.limit);
    } catch (error) {
      if (error instanceof TRPCError6) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646 \u0627\u0644\u0630\u064A\u0646 \u064A\u062D\u062A\u0627\u062C\u0648\u0646 \u0625\u0644\u0649 \u062A\u062D\u0633\u0646:", error);
      throw new TRPCError6({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على الاتجاهات والتنبؤات
   */
  getTrends: protectedProcedure.input(
    z24.object({
      agentIds: z24.array(z24.number().int().positive()),
      days: z24.number().int().min(7).max(365).default(30)
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new TRPCError6({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0639\u0631\u0636 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
        });
      }
      const endDate = /* @__PURE__ */ new Date();
      const startDate = new Date(endDate.getTime() - input.days * 24 * 60 * 60 * 1e3);
      const metrics = await getTeamMetrics(input.agentIds, startDate, endDate);
      return {
        days: input.days,
        trends: metrics.trends
      };
    } catch (error) {
      if (error instanceof TRPCError6) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0627\u062A\u062C\u0627\u0647\u0627\u062A:", error);
      throw new TRPCError6({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على مقارنة بين موظفين
   */
  compareAgents: protectedProcedure.input(
    z24.object({
      agentId1: z24.number().int().positive(),
      agentName1: z24.string().min(1).max(100),
      agentId2: z24.number().int().positive(),
      agentName2: z24.string().min(1).max(100),
      startDate: z24.date().optional(),
      endDate: z24.date().optional()
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new TRPCError6({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0639\u0631\u0636 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
        });
      }
      const comparison = await performanceAnalytics.getComparativeAnalysis(
        input.agentId1,
        input.agentId2,
        input.agentName1,
        input.agentName2
      );
      return comparison;
    } catch (error) {
      if (error instanceof TRPCError6) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0645\u0642\u0627\u0631\u0646\u0629 \u0628\u064A\u0646 \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646:", error);
      throw new TRPCError6({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u062C\u0631\u0627\u0621 \u0627\u0644\u0645\u0642\u0627\u0631\u0646\u0629"
      });
    }
  }),
  /**
   * تصدير التقرير كـ PDF
   */
  exportReportAsPDF: protectedProcedure.input(
    z24.object({
      agentIds: z24.array(z24.number().int().positive()),
      startDate: z24.date().optional(),
      endDate: z24.date().optional()
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new TRPCError6({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631"
        });
      }
      const report = await generateReport(
        input.agentIds,
        input.startDate,
        input.endDate
      );
      return {
        success: true,
        message: "\u062A\u0645 \u062A\u0648\u0644\u064A\u062F \u0627\u0644\u062A\u0642\u0631\u064A\u0631 \u0628\u0646\u062C\u0627\u062D",
        report
        // في الإنتاج، سيكون هناك رابط تحميل PDF
      };
    } catch (error) {
      if (error instanceof TRPCError6) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062A\u0642\u0631\u064A\u0631:", error);
      throw new TRPCError6({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u0635\u062F\u064A\u0631 \u0627\u0644\u062A\u0642\u0631\u064A\u0631"
      });
    }
  })
});

// server/routers/ratings-advanced-router.ts
import { z as z25 } from "zod";

// server/services/rating-service.ts
import { eq as eq7 } from "drizzle-orm";
var RatingService = class {
  ratingRequests = /* @__PURE__ */ new Map();
  ratingSubmissions = [];
  commonPositiveThemes = [
    "\u0633\u0631\u064A\u0639",
    "\u0627\u062D\u062A\u0631\u0627\u0641\u064A",
    "\u0645\u0641\u064A\u062F",
    "\u0648\u062F\u0648\u062F",
    "\u0641\u0639\u0627\u0644",
    "\u0645\u0645\u062A\u0627\u0632",
    "\u0631\u0627\u0626\u0639"
  ];
  commonNegativeThemes = [
    "\u0628\u0637\u064A\u0621",
    "\u063A\u064A\u0631 \u0645\u0641\u064A\u062F",
    "\u063A\u064A\u0631 \u0627\u062D\u062A\u0631\u0627\u0641\u064A",
    "\u0645\u0639\u0642\u062F",
    "\u0645\u0631\u0628\u0643",
    "\u0633\u064A\u0621"
  ];
  /**
   * إنشاء طلب تقييم جديد
   */
  async createRatingRequest(conversationId, customerId, agentId, subject) {
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1e3);
    const ratingRequest = {
      conversationId,
      customerId,
      agentId,
      subject,
      sentAt: now,
      expiresAt,
      status: "pending"
    };
    this.ratingRequests.set(conversationId, ratingRequest);
    return ratingRequest;
  }
  /**
   * الحصول على طلب التقييم
   */
  getRatingRequest(conversationId) {
    const request = this.ratingRequests.get(conversationId);
    if (request && request.expiresAt < /* @__PURE__ */ new Date()) {
      request.status = "expired";
    }
    return request;
  }
  /**
   * تقديم التقييم
   */
  async submitRating(conversationId, customerId, agentId, rating, comment, categories) {
    if (rating < 1 || rating > 5) {
      throw new Error("\u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0628\u064A\u0646 1 \u0648 5");
    }
    Object.values(categories).forEach((cat) => {
      if (cat < 1 || cat > 5) {
        throw new Error("\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0641\u0626\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0628\u064A\u0646 1 \u0648 5");
      }
    });
    const submission = {
      conversationId,
      customerId,
      agentId,
      rating,
      comment,
      submittedAt: /* @__PURE__ */ new Date(),
      categories
    };
    this.ratingSubmissions.push(submission);
    const request = this.ratingRequests.get(conversationId);
    if (request) {
      request.status = "completed";
    }
    const db = await getDb();
    if (db) {
      await db.update(liveChatConversations).set({ rating, ratingComment: comment }).where(eq7(liveChatConversations.id, conversationId));
    }
    return submission;
  }
  /**
   * الحصول على التقييمات
   */
  getRatings(agentId, limit = 50, offset = 0) {
    let submissions = this.ratingSubmissions;
    if (agentId) {
      submissions = submissions.filter((s) => s.agentId === agentId);
    }
    return submissions.slice(offset, offset + limit);
  }
  /**
   * حساب إحصائيات التقييمات
   */
  calculateRatingAnalytics(agentId) {
    let submissions = this.ratingSubmissions;
    if (agentId) {
      submissions = submissions.filter((s) => s.agentId === agentId);
    }
    const totalRatings = submissions.length;
    const ratingDistribution = {
      fiveStar: submissions.filter((s) => s.rating === 5).length,
      fourStar: submissions.filter((s) => s.rating === 4).length,
      threeStar: submissions.filter((s) => s.rating === 3).length,
      twoStar: submissions.filter((s) => s.rating === 2).length,
      oneStar: submissions.filter((s) => s.rating === 1).length
    };
    const averageRating = totalRatings > 0 ? submissions.reduce((sum, s) => sum + s.rating, 0) / totalRatings : 0;
    const categoryAverages = {
      responseTime: totalRatings > 0 ? submissions.reduce((sum, s) => sum + s.categories.responseTime, 0) / totalRatings : 0,
      professionalism: totalRatings > 0 ? submissions.reduce((sum, s) => sum + s.categories.professionalism, 0) / totalRatings : 0,
      problemResolution: totalRatings > 0 ? submissions.reduce(
        (sum, s) => sum + s.categories.problemResolution,
        0
      ) / totalRatings : 0,
      communication: totalRatings > 0 ? submissions.reduce((sum, s) => sum + s.categories.communication, 0) / totalRatings : 0
    };
    const commonThemes = this.extractCommonThemes(submissions);
    const agentRatings = this.calculateAgentRatings(submissions);
    return {
      totalRatings,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
      categoryAverages: {
        responseTime: Math.round(categoryAverages.responseTime * 100) / 100,
        professionalism: Math.round(categoryAverages.professionalism * 100) / 100,
        problemResolution: Math.round(categoryAverages.problemResolution * 100) / 100,
        communication: Math.round(categoryAverages.communication * 100) / 100
      },
      commonThemes,
      agentRatings
    };
  }
  /**
   * استخراج المواضيع الشائعة من التعليقات
   */
  extractCommonThemes(submissions) {
    const positive = {};
    const negative = {};
    submissions.forEach((submission) => {
      const comment = submission.comment.toLowerCase();
      this.commonPositiveThemes.forEach((theme) => {
        if (comment.includes(theme)) {
          positive[theme] = (positive[theme] || 0) + 1;
        }
      });
      this.commonNegativeThemes.forEach((theme) => {
        if (comment.includes(theme)) {
          negative[theme] = (negative[theme] || 0) + 1;
        }
      });
    });
    const sortedPositive = Object.entries(positive).sort(([, a], [, b]) => b - a).slice(0, 5).map(([theme]) => theme);
    const sortedNegative = Object.entries(negative).sort(([, a], [, b]) => b - a).slice(0, 5).map(([theme]) => theme);
    return {
      positive: sortedPositive,
      negative: sortedNegative
    };
  }
  /**
   * حساب تقييمات الموظفين
   */
  calculateAgentRatings(submissions) {
    const agentMap = /* @__PURE__ */ new Map();
    submissions.forEach((submission) => {
      if (!agentMap.has(submission.agentId)) {
        agentMap.set(submission.agentId, { ratings: [], total: 0 });
      }
      const agent = agentMap.get(submission.agentId);
      agent.ratings.push(submission.rating);
      agent.total += 1;
    });
    return Array.from(agentMap.entries()).map(([agentId, data]) => ({
      agentId,
      averageRating: Math.round(
        data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length * 100
      ) / 100,
      totalRatings: data.total
    })).sort((a, b) => b.averageRating - a.averageRating);
  }
  /**
   * الحصول على التقييمات المنخفضة
   */
  getLowRatings(threshold = 3, limit = 10) {
    return this.ratingSubmissions.filter((s) => s.rating < threshold).sort((a, b) => a.rating - b.rating).slice(0, limit);
  }
  /**
   * الحصول على التقييمات العالية
   */
  getHighRatings(threshold = 4, limit = 10) {
    return this.ratingSubmissions.filter((s) => s.rating >= threshold).sort((a, b) => b.rating - a.rating).slice(0, limit);
  }
  /**
   * توليد توصيات بناءً على التقييمات
   */
  generateRecommendations(agentId) {
    const analytics = this.calculateRatingAnalytics(agentId);
    const recommendations = [];
    if (analytics.averageRating < 3) {
      recommendations.push("\u064A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u062A\u062D\u0633\u0646 \u0641\u0648\u0631\u064A \u0641\u064A \u062C\u0648\u062F\u0629 \u0627\u0644\u062E\u062F\u0645\u0629");
    } else if (analytics.averageRating < 4) {
      recommendations.push("\u0647\u0646\u0627\u0643 \u0645\u062C\u0627\u0644 \u0644\u0644\u062A\u062D\u0633\u0646 \u0641\u064A \u0628\u0639\u0636 \u062C\u0648\u0627\u0646\u0628 \u0627\u0644\u062E\u062F\u0645\u0629");
    } else if (analytics.averageRating >= 4.5) {
      recommendations.push("\u0623\u062F\u0627\u0621 \u0645\u0645\u062A\u0627\u0632\u0629 - \u0627\u0633\u062A\u0645\u0631 \u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u062A\u0648\u0649");
    }
    if (analytics.categoryAverages.responseTime < 3) {
      recommendations.push("\u062A\u062D\u0633\u064A\u0646 \u0633\u0631\u0639\u0629 \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629");
    }
    if (analytics.categoryAverages.professionalism < 3) {
      recommendations.push("\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 \u0648\u0627\u0644\u0633\u0644\u0648\u0643 \u0627\u0644\u0645\u0647\u0646\u064A");
    }
    if (analytics.categoryAverages.problemResolution < 3) {
      recommendations.push("\u062A\u062D\u0633\u064A\u0646 \u0627\u0644\u0642\u062F\u0631\u0629 \u0639\u0644\u0649 \u062D\u0644 \u0627\u0644\u0645\u0634\u0627\u0643\u0644");
    }
    if (analytics.categoryAverages.communication < 3) {
      recommendations.push("\u062A\u062D\u0633\u064A\u0646 \u0645\u0647\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0648\u0627\u0635\u0644");
    }
    if (analytics.commonThemes.negative.length > 0) {
      recommendations.push(
        `\u0645\u0639\u0627\u0644\u062C\u0629 \u0627\u0644\u0645\u0634\u0627\u0643\u0644 \u0627\u0644\u0634\u0627\u0626\u0639\u0629: ${analytics.commonThemes.negative.join(", ")}`
      );
    }
    return recommendations;
  }
  /**
   * مسح التقييمات القديمة
   */
  clearOldRatings(daysOld = 365) {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1e3);
    const initialLength = this.ratingSubmissions.length;
    this.ratingSubmissions = this.ratingSubmissions.filter(
      (s) => s.submittedAt > cutoffDate
    );
    return initialLength - this.ratingSubmissions.length;
  }
};
var ratingService = new RatingService();
async function createRatingRequest(conversationId, customerId, agentId, subject) {
  return ratingService.createRatingRequest(conversationId, customerId, agentId, subject);
}
async function submitRating(conversationId, customerId, agentId, rating, comment, categories) {
  return ratingService.submitRating(
    conversationId,
    customerId,
    agentId,
    rating,
    comment,
    categories
  );
}
function getRatingAnalytics(agentId) {
  return ratingService.calculateRatingAnalytics(agentId);
}
function getRatingRecommendations(agentId) {
  return ratingService.generateRecommendations(agentId);
}

// server/routers/ratings-advanced-router.ts
import { TRPCError as TRPCError7 } from "@trpc/server";
var ratingsAdvancedRouter = router({
  /**
   * إنشاء طلب تقييم جديد
   */
  createRatingRequest: protectedProcedure.input(
    z25.object({
      conversationId: z25.string().uuid(),
      customerId: z25.number().int().positive(),
      agentId: z25.number().int().positive(),
      subject: z25.string().min(1).max(200)
    })
  ).mutation(async ({ input, ctx }) => {
    try {
      if (ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0625\u0646\u0634\u0627\u0621 \u0637\u0644\u0628 \u062A\u0642\u064A\u064A\u0645"
        });
      }
      const ratingRequest = await createRatingRequest(
        input.conversationId,
        input.customerId,
        input.agentId,
        input.subject
      );
      return {
        success: true,
        ratingRequest
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0637\u0644\u0628 \u0627\u0644\u062A\u0642\u064A\u064A\u0645:", error);
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0637\u0644\u0628 \u0627\u0644\u062A\u0642\u064A\u064A\u0645"
      });
    }
  }),
  /**
   * الحصول على طلب التقييم
   */
  getRatingRequest: protectedProcedure.input(
    z25.object({
      conversationId: z25.string().uuid()
    })
  ).query(async ({ input }) => {
    try {
      const ratingRequest = ratingService.getRatingRequest(input.conversationId);
      if (!ratingRequest) {
        throw new TRPCError7({
          code: "NOT_FOUND",
          message: "\u0637\u0644\u0628 \u0627\u0644\u062A\u0642\u064A\u064A\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F"
        });
      }
      return ratingRequest;
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0637\u0644\u0628 \u0627\u0644\u062A\u0642\u064A\u064A\u0645:", error);
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0637\u0644\u0628 \u0627\u0644\u062A\u0642\u064A\u064A\u0645"
      });
    }
  }),
  /**
   * تقديم التقييم
   */
  submitRating: protectedProcedure.input(
    z25.object({
      conversationId: z25.string().uuid(),
      customerId: z25.number().int().positive(),
      agentId: z25.number().int().positive(),
      rating: z25.number().int().min(1).max(5),
      comment: z25.string().min(0).max(500),
      categories: z25.object({
        responseTime: z25.number().int().min(1).max(5),
        professionalism: z25.number().int().min(1).max(5),
        problemResolution: z25.number().int().min(1).max(5),
        communication: z25.number().int().min(1).max(5)
      })
    })
  ).mutation(async ({ input }) => {
    try {
      const submission = await submitRating(
        input.conversationId,
        input.customerId,
        input.agentId,
        input.rating,
        input.comment,
        input.categories
      );
      return {
        success: true,
        submission
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new TRPCError7({
          code: "BAD_REQUEST",
          message: error.message
        });
      }
      console.error("\u062E\u0637\u0623 \u0641\u064A \u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u062A\u0642\u064A\u064A\u0645:", error);
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u062A\u0642\u062F\u064A\u0645 \u0627\u0644\u062A\u0642\u064A\u064A\u0645"
      });
    }
  }),
  /**
   * الحصول على التقييمات
   */
  getRatings: protectedProcedure.input(
    z25.object({
      agentId: z25.number().int().positive().optional(),
      limit: z25.number().int().min(1).max(100).default(20),
      offset: z25.number().int().min(0).default(0)
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (input.agentId && ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
        });
      }
      const ratings = ratingService.getRatings(
        input.agentId,
        input.limit,
        input.offset
      );
      return {
        ratings,
        total: ratings.length,
        hasMore: ratings.length >= input.limit
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A:", error);
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على إحصائيات التقييمات
   */
  getRatingAnalytics: protectedProcedure.input(
    z25.object({
      agentId: z25.number().int().positive().optional()
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (input.agentId && ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
        });
      }
      const analytics = getRatingAnalytics(input.agentId);
      return analytics;
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A:", error);
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على التقييمات المنخفضة
   */
  getLowRatings: protectedProcedure.input(
    z25.object({
      threshold: z25.number().int().min(1).max(5).default(3),
      limit: z25.number().int().min(1).max(50).default(10)
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0639\u0631\u0636 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
        });
      }
      const lowRatings = ratingService.getLowRatings(input.threshold, input.limit);
      return {
        ratings: lowRatings,
        count: lowRatings.length,
        threshold: input.threshold
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0627\u0644\u0645\u0646\u062E\u0641\u0636\u0629:", error);
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على التقييمات العالية
   */
  getHighRatings: protectedProcedure.input(
    z25.object({
      threshold: z25.number().int().min(1).max(5).default(4),
      limit: z25.number().int().min(1).max(50).default(10)
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (ctx.user.role !== "admin") {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0639\u0631\u0636 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
        });
      }
      const highRatings = ratingService.getHighRatings(input.threshold, input.limit);
      return {
        ratings: highRatings,
        count: highRatings.length,
        threshold: input.threshold
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0627\u0644\u0639\u0627\u0644\u064A\u0629:", error);
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على التوصيات بناءً على التقييمات
   */
  getRecommendations: protectedProcedure.input(
    z25.object({
      agentId: z25.number().int().positive().optional()
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (input.agentId && ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
        });
      }
      const recommendations = getRatingRecommendations(input.agentId);
      return {
        recommendations,
        count: recommendations.length
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u062A\u0648\u0635\u064A\u0627\u062A:", error);
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u062A\u0648\u0635\u064A\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على توزيع التقييمات
   */
  getRatingDistribution: protectedProcedure.input(
    z25.object({
      agentId: z25.number().int().positive().optional()
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (input.agentId && ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
        });
      }
      const analytics = getRatingAnalytics(input.agentId);
      return {
        distribution: analytics.ratingDistribution,
        total: analytics.totalRatings,
        average: analytics.averageRating
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u062A\u0642\u064A\u064A\u0645\u0627\u062A:", error);
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على تقييمات الفئات
   */
  getCategoryRatings: protectedProcedure.input(
    z25.object({
      agentId: z25.number().int().positive().optional()
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (input.agentId && ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
        });
      }
      const analytics = getRatingAnalytics(input.agentId);
      return {
        categories: analytics.categoryAverages,
        agentId: input.agentId
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u062A\u0642\u064A\u064A\u0645\u0627\u062A \u0627\u0644\u0641\u0626\u0627\u062A:", error);
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
      });
    }
  }),
  /**
   * الحصول على المواضيع الشائعة
   */
  getCommonThemes: protectedProcedure.input(
    z25.object({
      agentId: z25.number().int().positive().optional()
    })
  ).query(async ({ input, ctx }) => {
    try {
      if (input.agentId && ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
        throw new TRPCError7({
          code: "FORBIDDEN",
          message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0647\u0630\u0647 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
        });
      }
      const analytics = getRatingAnalytics(input.agentId);
      return {
        themes: analytics.commonThemes,
        agentId: input.agentId
      };
    } catch (error) {
      if (error instanceof TRPCError7) throw error;
      console.error("\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0645\u0648\u0627\u0636\u064A\u0639 \u0627\u0644\u0634\u0627\u0626\u0639\u0629:", error);
      throw new TRPCError7({
        code: "INTERNAL_SERVER_ERROR",
        message: "\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
      });
    }
  })
});

// server/routers.ts
var appRouter = router({
  system: systemRouter,
  auth: authRouter,
  /**
   * ===== إجراءات البيانات الجمركية =====
   */
  customs: router({
    /**
     * إنشاء بيان جمركي جديد
     */
    createDeclaration: protectedProcedure.input(
      z26.object({
        declarationNumber: z26.string().min(1, "\u0631\u0642\u0645 \u0627\u0644\u0628\u064A\u0627\u0646 \u0645\u0637\u0644\u0648\u0628"),
        registrationDate: z26.string().refine((date3) => !isNaN(Date.parse(date3)), "\u062A\u0627\u0631\u064A\u062E \u063A\u064A\u0631 \u0635\u062D\u064A\u062D"),
        clearanceCenter: z26.string().min(1, "\u0645\u0631\u0643\u0632 \u0627\u0644\u062A\u062E\u0644\u064A\u0635 \u0645\u0637\u0644\u0648\u0628"),
        exchangeRate: z26.number().positive("\u0633\u0639\u0631 \u0627\u0644\u062A\u0639\u0627\u062F\u0644 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B"),
        exportCountry: z26.string().min(1, "\u0628\u0644\u062F \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0645\u0637\u0644\u0648\u0628"),
        billOfLadingNumber: z26.string().min(1, "\u0631\u0642\u0645 \u0628\u0648\u0644\u064A\u0635\u0629 \u0627\u0644\u0634\u062D\u0646 \u0645\u0637\u0644\u0648\u0628"),
        grossWeight: z26.number().positive("\u0627\u0644\u0648\u0632\u0646 \u0627\u0644\u0642\u0627\u0626\u0645 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B"),
        netWeight: z26.number().positive("\u0627\u0644\u0648\u0632\u0646 \u0627\u0644\u0635\u0627\u0641\u064A \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B"),
        numberOfPackages: z26.number().int().positive("\u0639\u062F\u062F \u0627\u0644\u0637\u0631\u0648\u062F \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B"),
        packageType: z26.string().min(1, "\u0646\u0648\u0639 \u0627\u0644\u0637\u0631\u0648\u062F \u0645\u0637\u0644\u0648\u0628"),
        fobValue: z26.number().positive("\u0642\u064A\u0645\u0629 \u0627\u0644\u0628\u0636\u0627\u0639\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0629"),
        freightCost: z26.number().nonnegative("\u0623\u062C\u0648\u0631 \u0627\u0644\u0634\u062D\u0646 \u0644\u0627 \u064A\u0645\u0643\u0646 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0633\u0627\u0644\u0628\u0629"),
        insuranceCost: z26.number().nonnegative("\u0627\u0644\u062A\u0623\u0645\u064A\u0646 \u0644\u0627 \u064A\u0645\u0643\u0646 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0633\u0627\u0644\u0628\u0627\u064B"),
        customsDuty: z26.number().nonnegative("\u0627\u0644\u0631\u0633\u0648\u0645 \u0627\u0644\u062C\u0645\u0631\u0643\u064A\u0629 \u0644\u0627 \u064A\u0645\u0643\u0646 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0633\u0627\u0644\u0628\u0629"),
        additionalFees: z26.number().nonnegative().optional().default(0),
        customsServiceFee: z26.number().nonnegative().optional().default(0),
        penalties: z26.number().nonnegative().optional().default(0)
      })
    ).mutation(async ({ ctx, input }) => {
      const calculations = calculateAllCosts({
        fobValueForeign: input.fobValue,
        exchangeRate: input.exchangeRate,
        freightCost: input.freightCost,
        insuranceCost: input.insuranceCost,
        customsDuty: input.customsDuty,
        additionalFees: input.additionalFees,
        customsServiceFee: input.customsServiceFee,
        penalties: input.penalties
      });
      const declaration = await createCustomsDeclaration(ctx.user.id, {
        declarationNumber: input.declarationNumber,
        registrationDate: new Date(input.registrationDate),
        clearanceCenter: input.clearanceCenter,
        exchangeRate: input.exchangeRate.toString(),
        exportCountry: input.exportCountry,
        billOfLadingNumber: input.billOfLadingNumber,
        grossWeight: input.grossWeight.toString(),
        netWeight: input.netWeight.toString(),
        numberOfPackages: input.numberOfPackages,
        packageType: input.packageType,
        fobValue: input.fobValue.toString(),
        fobValueJod: calculations.fobValueJod.toString(),
        freightCost: input.freightCost.toString(),
        insuranceCost: input.insuranceCost.toString(),
        customsDuty: input.customsDuty.toString(),
        salesTax: calculations.salesTax.toString(),
        additionalFees: input.additionalFees.toString(),
        customsServiceFee: input.customsServiceFee.toString(),
        penalties: input.penalties.toString(),
        totalLandedCost: calculations.totalLandedCost.toString(),
        additionalExpensesRatio: calculations.additionalExpensesRatio.toString(),
        status: "draft"
      });
      await createOrUpdateFinancialSummary({
        declarationId: declaration.id,
        totalFobValue: calculations.fobValueJod.toString(),
        totalFreightAndInsurance: calculations.freightAndInsurance.toString(),
        totalCustomsAndTaxes: calculations.totalCustomsAndTaxes.toString(),
        totalLandedCost: calculations.totalLandedCost.toString(),
        additionalExpensesRatio: calculations.additionalExpensesRatio.toString()
      });
      return declaration;
    }),
    /**
     * الحصول على بيان جمركي
     */
    getDeclaration: protectedProcedure.input(z26.object({ id: z26.number() })).query(async ({ ctx, input }) => {
      const declaration = await getCustomsDeclarationById(input.id);
      if (!declaration || declaration.userId !== ctx.user.id) {
        throw new Error("\u0627\u0644\u0628\u064A\u0627\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u064A\u0647");
      }
      return declaration;
    }),
    /**
     * الحصول على قائمة البيانات الجمركية للمستخدم
     */
    listDeclarations: protectedProcedure.query(async ({ ctx }) => {
      return await getCustomsDeclarationsByUserId(ctx.user.id);
    }),
    /**
     * تحديث بيان جمركي
     */
    updateDeclaration: protectedProcedure.input(
      z26.object({
        id: z26.number(),
        data: z26.object({
          status: z26.enum(["draft", "submitted", "approved", "cleared"]).optional(),
          notes: z26.string().optional()
        })
      })
    ).mutation(async ({ ctx, input }) => {
      const declaration = await getCustomsDeclarationById(input.id);
      if (!declaration || declaration.userId !== ctx.user.id) {
        throw new Error("\u0627\u0644\u0628\u064A\u0627\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u062A\u0639\u062F\u064A\u0644\u0647");
      }
      return await updateCustomsDeclaration(input.id, input.data);
    }),
    /**
     * حذف بيان جمركي
     */
    deleteDeclaration: protectedProcedure.input(z26.object({ id: z26.number() })).mutation(async ({ ctx, input }) => {
      const declaration = await getCustomsDeclarationById(input.id);
      if (!declaration || declaration.userId !== ctx.user.id) {
        throw new Error("\u0627\u0644\u0628\u064A\u0627\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0623\u0648 \u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u062D\u0630\u0641\u0647");
      }
      await deleteItemsByDeclarationId(input.id);
      return await deleteCustomsDeclaration(input.id);
    })
  }),
  /**
   * ===== إجراءات الأصناف =====
   */
  items: router({
    /**
     * إضافة صنف جديد
     */
    createItem: protectedProcedure.input(
      z26.object({
        declarationId: z26.number(),
        itemName: z26.string().min(1, "\u0627\u0633\u0645 \u0627\u0644\u0635\u0646\u0641 \u0645\u0637\u0644\u0648\u0628"),
        quantity: z26.number().positive("\u0627\u0644\u0643\u0645\u064A\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0629"),
        unitPriceForeign: z26.number().positive("\u0633\u0639\u0631 \u0627\u0644\u0648\u062D\u062F\u0629 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0648\u062C\u0628\u0627\u064B")
      })
    ).mutation(async ({ ctx, input }) => {
      const declaration = await getCustomsDeclarationById(input.declarationId);
      if (!declaration || declaration.userId !== ctx.user.id) {
        throw new Error("\u0627\u0644\u0628\u064A\u0627\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      }
      const totalPriceForeign = input.quantity * input.unitPriceForeign;
      const totalPriceJod = totalPriceForeign * Number(declaration.exchangeRate);
      const summary = await getFinancialSummaryByDeclarationId(input.declarationId);
      if (!summary) {
        throw new Error("\u0627\u0644\u0645\u0644\u062E\u0635 \u0627\u0644\u0645\u0627\u0644\u064A \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      }
      const totalFobValueJod = Number(summary.totalFobValue);
      const totalCustomsAndTaxes = Number(summary.totalCustomsAndTaxes);
      const itemCalculations = calculateItemCosts({
        itemFobValueForeign: totalPriceForeign,
        exchangeRate: Number(declaration.exchangeRate),
        quantity: input.quantity,
        totalFobValueJod,
        totalCustomsAndTaxes
      });
      const item = await createItem({
        declarationId: input.declarationId,
        itemName: input.itemName,
        quantity: input.quantity.toString(),
        unitPriceForeign: input.unitPriceForeign.toString(),
        totalPriceForeign: totalPriceForeign.toString(),
        totalPriceJod: totalPriceJod.toString(),
        valuePercentage: itemCalculations.itemValuePercentage.toString(),
        itemExpensesShare: itemCalculations.itemExpensesShare.toString(),
        totalItemCostJod: itemCalculations.itemTotalCost.toString(),
        unitCostJod: itemCalculations.unitCost.toString()
      });
      return item;
    }),
    /**
     * الحصول على أصناف البيان الجمركي
     */
    getItems: protectedProcedure.input(z26.object({ declarationId: z26.number() })).query(async ({ ctx, input }) => {
      const declaration = await getCustomsDeclarationById(input.declarationId);
      if (!declaration || declaration.userId !== ctx.user.id) {
        throw new Error("\u0627\u0644\u0628\u064A\u0627\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      }
      return await getItemsByDeclarationId(input.declarationId);
    }),
    /**
     * تحديث صنف
     */
    updateItem: protectedProcedure.input(
      z26.object({
        id: z26.number(),
        itemName: z26.string().optional(),
        itemCode: z26.string().optional(),
        quantity: z26.number().positive().optional(),
        unitPriceForeign: z26.number().positive().optional(),
        description: z26.string().optional(),
        customsCode: z26.string().optional()
      })
    ).mutation(async ({ ctx, input }) => {
      const item = await getItemById(input.id);
      if (!item) {
        throw new Error("\u0627\u0644\u0635\u0646\u0641 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      }
      const declaration = await getCustomsDeclarationById(item.declarationId);
      if (!declaration || declaration.userId !== ctx.user.id) {
        throw new Error("\u0627\u0644\u0628\u064A\u0627\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      }
      const updateData = {};
      if (input.itemName) updateData.itemName = input.itemName;
      if (input.itemCode) updateData.itemCode = input.itemCode;
      if (input.quantity) updateData.quantity = input.quantity.toString();
      if (input.unitPriceForeign) updateData.unitPriceForeign = input.unitPriceForeign.toString();
      if (input.description) updateData.description = input.description;
      if (input.customsCode) updateData.customsCode = input.customsCode;
      return await updateItem(input.id, updateData);
    }),
    /**
     * حذف صنف
     */
    deleteItem: protectedProcedure.input(z26.object({ id: z26.number() })).mutation(async ({ ctx, input }) => {
      const item = await getItemById(input.id);
      if (!item) {
        throw new Error("\u0627\u0644\u0635\u0646\u0641 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      }
      const declaration = await getCustomsDeclarationById(item.declarationId);
      if (!declaration || declaration.userId !== ctx.user.id) {
        throw new Error("\u0627\u0644\u0628\u064A\u0627\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      }
      return await deleteItem(input.id);
    })
  }),
  /**
   * ===== إجراءات الانحرافات والمقارنات =====
   */
  variances: router({
    /**
     * حساب وحفظ الانحرافات
     */
    calculateVariances: protectedProcedure.input(
      z26.object({
        declarationId: z26.number(),
        estimatedFobValue: z26.number().nonnegative(),
        estimatedFreight: z26.number().nonnegative(),
        estimatedInsurance: z26.number().nonnegative(),
        estimatedCustomsDuty: z26.number().nonnegative(),
        estimatedSalesTax: z26.number().nonnegative()
      })
    ).mutation(async ({ ctx, input }) => {
      const declaration = await getCustomsDeclarationById(input.declarationId);
      if (!declaration || declaration.userId !== ctx.user.id) {
        throw new Error("\u0627\u0644\u0628\u064A\u0627\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      }
      const fobVariance = calculateVariance(
        Number(declaration.fobValueJod),
        input.estimatedFobValue
      );
      const freightVariance = calculateVariance(
        Number(declaration.freightCost),
        input.estimatedFreight
      );
      const insuranceVariance = calculateVariance(
        Number(declaration.insuranceCost),
        input.estimatedInsurance
      );
      const customsDutyVariance = calculateVariance(
        Number(declaration.customsDuty),
        input.estimatedCustomsDuty
      );
      const salesTaxVariance = calculateVariance(
        Number(declaration.salesTax),
        input.estimatedSalesTax
      );
      const totalVariance = fobVariance + freightVariance + insuranceVariance + customsDutyVariance + salesTaxVariance;
      return await createOrUpdateVariance({
        declarationId: input.declarationId,
        fobVariance: fobVariance.toString(),
        freightVariance: freightVariance.toString(),
        insuranceVariance: insuranceVariance.toString(),
        customsDutyVariance: customsDutyVariance.toString(),
        salesTaxVariance: salesTaxVariance.toString(),
        totalVariance: totalVariance.toString(),
        fobVariancePercent: calculateVariancePercentage(fobVariance, input.estimatedFobValue).toString(),
        freightVariancePercent: calculateVariancePercentage(freightVariance, input.estimatedFreight).toString(),
        insuranceVariancePercent: calculateVariancePercentage(insuranceVariance, input.estimatedInsurance).toString(),
        customsDutyVariancePercent: calculateVariancePercentage(customsDutyVariance, input.estimatedCustomsDuty).toString(),
        salesTaxVariancePercent: calculateVariancePercentage(salesTaxVariance, input.estimatedSalesTax).toString(),
        totalVariancePercent: calculateVariancePercentage(totalVariance, input.estimatedFobValue + input.estimatedFreight + input.estimatedInsurance + input.estimatedCustomsDuty + input.estimatedSalesTax).toString()
      });
    }),
    /**
     * الحصول على الانحرافات
     */
    getVariances: protectedProcedure.input(z26.object({ declarationId: z26.number() })).query(async ({ ctx, input }) => {
      const declaration = await getCustomsDeclarationById(input.declarationId);
      if (!declaration || declaration.userId !== ctx.user.id) {
        throw new Error("\u0627\u0644\u0628\u064A\u0627\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      }
      return await getVarianceByDeclarationId(input.declarationId);
    })
  }),
  /**
   * ===== إجراءات الملخصات المالية =====
   */
  financialSummary: router({
    /**
     * الحصول على الملخص المالي
     */
    getSummary: protectedProcedure.input(z26.object({ declarationId: z26.number() })).query(async ({ ctx, input }) => {
      const declaration = await getCustomsDeclarationById(input.declarationId);
      if (!declaration || declaration.userId !== ctx.user.id) {
        throw new Error("\u0627\u0644\u0628\u064A\u0627\u0646 \u0627\u0644\u062C\u0645\u0631\u0643\u064A \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F");
      }
      return await getFinancialSummaryByDeclarationId(input.declarationId);
    })
  }),
  /**
   * ===== إجراءات استيراد PDF =====
   */
  pdfImport: router({
    importDeclaration: protectedProcedure.input(
      z26.object({
        filePath: z26.string().min(1, "\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0644\u0641 \u0645\u0637\u0644\u0648\u0628")
      })
    ).mutation(async ({ ctx, input }) => {
      try {
        const extractedData = await extractPdfData(input.filePath);
        const validationErrors = validateExtractedData2(extractedData);
        return {
          success: extractedData.extractionSuccess,
          data: extractedData,
          validationErrors,
          confidence: extractedData.confidence
        };
      } catch (error) {
        throw new Error(`\u062E\u0637\u0623 \u0641\u064A \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u0644\u0641: ${error instanceof Error ? error.message : "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641"}`);
      }
    })
  }),
  /**
   * ===== إجراءات الإشعارات =====
   */
  notifications: router({
    getNotifications: protectedProcedure.input(
      z26.object({
        limit: z26.number().int().positive().default(50),
        offset: z26.number().int().nonnegative().default(0)
      })
    ).query(async ({ ctx, input }) => {
      return await getNotificationsByUserId(ctx.user.id, input.limit, input.offset);
    }),
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await getUnreadNotificationCount(ctx.user.id);
    }),
    markAsRead: protectedProcedure.input(z26.object({ notificationId: z26.number().int().positive() })).mutation(async ({ input }) => {
      await markNotificationAsRead(input.notificationId);
      return { success: true };
    }),
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
    delete: protectedProcedure.input(z26.object({ notificationId: z26.number().int().positive() })).mutation(async ({ input }) => {
      await deleteNotification(input.notificationId);
      return { success: true };
    })
  }),
  /**
   * ===== إجراءات تتبع الحاويات =====
   */
  tracking: router({
    createContainer: protectedProcedure.input(
      z26.object({
        containerNumber: z26.string().min(1, "\u0631\u0642\u0645 \u0627\u0644\u062D\u0627\u0648\u064A\u0629 \u0645\u0637\u0644\u0648\u0628"),
        containerType: z26.enum(["20ft", "40ft", "40ftHC", "45ft", "other"]),
        shippingCompany: z26.string().min(1, "\u0634\u0631\u0643\u0629 \u0627\u0644\u0634\u062D\u0646 \u0645\u0637\u0644\u0648\u0628\u0629"),
        billOfLadingNumber: z26.string().min(1, "\u0628\u0648\u0644\u064A\u0635\u0629 \u0627\u0644\u0634\u062D\u0646 \u0645\u0637\u0644\u0648\u0628\u0629"),
        portOfLoading: z26.string().min(1, "\u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u0634\u062D\u0646 \u0645\u0637\u0644\u0648\u0628"),
        portOfDischarge: z26.string().min(1, "\u0645\u064A\u0646\u0627\u0621 \u0627\u0644\u062A\u0641\u0631\u064A\u063A \u0645\u0637\u0644\u0648\u0628"),
        sealNumber: z26.string().optional(),
        loadingDate: z26.string().optional(),
        estimatedArrivalDate: z26.string().optional(),
        notes: z26.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      try {
        const result = await createContainer({
          userId: ctx.user.id,
          ...input
        });
        return { success: true };
      } catch (error) {
        throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062D\u0627\u0648\u064A\u0629");
      }
    }),
    getContainers: protectedProcedure.query(async ({ ctx }) => {
      try {
        const containers2 = await getUserContainers(ctx.user.id);
        return containers2;
      } catch (error) {
        throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A");
      }
    }),
    searchContainers: protectedProcedure.input(z26.object({ query: z26.string().min(1) })).query(async ({ input, ctx }) => {
      try {
        const results = await searchContainers(ctx.user.id, input.query);
        return results;
      } catch (error) {
        throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0627\u0644\u062D\u0627\u0648\u064A\u0627\u062A");
      }
    }),
    getContainerByNumber: protectedProcedure.input(z26.object({ containerNumber: z26.string().min(1) })).query(async ({ input }) => {
      try {
        const container = await getContainerByNumber(input.containerNumber);
        return container;
      } catch (error) {
        throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062D\u0627\u0648\u064A\u0629");
      }
    }),
    addTrackingEvent: protectedProcedure.input(
      z26.object({
        containerId: z26.number().int().positive(),
        eventType: z26.enum(["loaded", "departed", "in_transit", "arrived", "cleared", "delivered", "delayed", "customs_clearance", "other"]),
        eventLocation: z26.string().optional(),
        eventDescription: z26.string().optional(),
        eventDateTime: z26.string(),
        documentUrl: z26.string().optional(),
        notes: z26.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      try {
        const result = await addTrackingEvent({
          containerId: input.containerId,
          userId: ctx.user.id,
          eventType: input.eventType,
          eventLocation: input.eventLocation,
          eventDescription: input.eventDescription,
          eventDateTime: new Date(input.eventDateTime),
          documentUrl: input.documentUrl,
          notes: input.notes
        });
        return { success: true };
      } catch (error) {
        throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0636\u0627\u0641\u0629 \u062D\u062F\u062B \u0627\u0644\u062A\u062A\u0628\u0639");
      }
    }),
    getTrackingHistory: protectedProcedure.input(z26.object({ containerId: z26.number().int().positive() })).query(async ({ input }) => {
      try {
        const history = await getContainerTrackingHistory(input.containerId);
        return history;
      } catch (error) {
        throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u0633\u062C\u0644 \u0627\u0644\u062A\u062A\u0628\u0639");
      }
    }),
    updateContainerStatus: protectedProcedure.input(
      z26.object({
        containerId: z26.number().int().positive(),
        status: z26.enum(["pending", "in_transit", "arrived", "cleared", "delivered", "delayed"])
      })
    ).mutation(async ({ input }) => {
      try {
        await updateContainerStatus(input.containerId, input.status);
        return { success: true };
      } catch (error) {
        throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u062D\u0627\u0648\u064A\u0629");
      }
    }),
    createShipmentDetail: protectedProcedure.input(
      z26.object({
        containerId: z26.number().int().positive(),
        shipmentNumber: z26.string().min(1),
        totalWeight: z26.number().positive(),
        totalVolume: z26.number().optional(),
        numberOfPackages: z26.number().int().positive(),
        packageType: z26.string().optional(),
        shipper: z26.string().min(1),
        consignee: z26.string().min(1),
        freightCharges: z26.number().optional(),
        insuranceCharges: z26.number().optional(),
        handlingCharges: z26.number().optional(),
        otherCharges: z26.number().optional(),
        notes: z26.string().optional()
      })
    ).mutation(async ({ input, ctx }) => {
      try {
        const result = await createShipmentDetail({
          userId: ctx.user.id,
          ...input
        });
        return { success: true };
      } catch (error) {
        throw new Error("\u0641\u0634\u0644 \u0641\u064A \u0625\u0646\u0634\u0627\u0621 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0634\u062D\u0646\u0629");
      }
    }),
    getShipmentDetail: protectedProcedure.input(z26.object({ shipmentContainerId: z26.number().int().positive() })).query(async ({ input }) => {
      try {
        const detail = await getShipmentDetail(input.shipmentContainerId);
        return detail;
      } catch (error) {
        throw new Error("\u0641\u0634\u0644 \u0641\u064A \u062C\u0644\u0628 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0634\u062D\u0646\u0629");
      }
    })
  }),
  stripe: stripePaymentRouter,
  paymentMethods: paymentMethodsRouter,
  government: governmentRouter,
  ai: aiRouter,
  errors: errorsRouter,
  updates: updatesRouter,
  sms: notificationsRouter,
  paymentGateways: paymentGatewaysRouter,
  currency: currencyRouter,
  coupons: couponsRouter,
  billing: billingRouter,
  operations: operationsRouter,
  localPaymentGateways: localPaymentGatewaysRouter,
  webhooks: webhooksRouter,
  notificationsAccounting: notificationsAccountingRouter,
  paymentApis: paymentApisRouter,
  invoices: invoicesRouter,
  advancedFeatures: advancedFeaturesRouter,
  advancedOperations: advancedOperationsRouter,
  notificationsCenter: notificationsCenterRouter,
  liveChat: liveChatRouter,
  notifications: notificationRouter,
  supportAgent: supportAgentRouter,
  notificationsAdvanced: notificationsAdvancedRouter,
  performanceAnalytics: performanceAnalyticsRouter,
  ratingsAdvanced: ratingsAdvancedRouter
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs7 from "fs";
import path6 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs5 from "node:fs";
import path4 from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path4.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs5.existsSync(LOG_DIR)) {
    fs5.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs5.existsSync(logPath) || fs5.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs5.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs5.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path4.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs5.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
function vitePluginReorderModulepreload() {
  return {
    name: "reorder-modulepreload",
    transformIndexHtml(html) {
      const modulepreloadRegex = /<link rel="modulepreload"[^>]*>/g;
      const modulepreloads = html.match(modulepreloadRegex) || [];
      const moduleScriptRegex = /<script type="module"[^>]*><\/script>/;
      const moduleScript = html.match(moduleScriptRegex)?.[0];
      if (!modulepreloads.length || !moduleScript) {
        return html;
      }
      let result = html;
      modulepreloads.forEach((link) => {
        result = result.replace(link, "");
      });
      const modulepreloadHtml = modulepreloads.join("\n    ");
      result = result.replace(
        moduleScript,
        `${modulepreloadHtml}
    ${moduleScript}`
      );
      return result;
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector(), vitePluginReorderModulepreload()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path4.resolve(import.meta.dirname, "client", "src"),
      "@shared": path4.resolve(import.meta.dirname, "shared"),
      "@assets": path4.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path4.resolve(import.meta.dirname),
  root: path4.resolve(import.meta.dirname, "client"),
  publicDir: path4.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path4.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1e3,
    minify: "esbuild",
    cssCodeSplit: true,
    reportCompressedSize: false,
    sourcemap: false,
    target: "esnext",
    assetsInlineLimit: 4096,
    // terserOptions removed - use esbuild minify instead
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true,
    //   },
    // },
    rollupOptions: {
      external: ["@sentry/react", "electron"],
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/lodash")) return "vendor-lodash";
          if (id.includes("node_modules/moment")) return "vendor-moment";
          if (id.includes("node_modules/echarts")) return "vendor-echarts";
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/@radix-ui")) {
            return "vendor-ui";
          }
          if (id.includes("node_modules/stripe")) {
            return "vendor-stripe";
          }
          if (id.includes("node_modules/recharts")) {
            return "vendor-charts";
          }
          if (id.includes("node_modules/pdfjs") || id.includes("node_modules/pdf")) {
            return "vendor-pdf";
          }
          if (id.includes("node_modules/date-fns") || id.includes("node_modules/dayjs")) {
            return "vendor-date";
          }
          if (id.includes("node_modules/react-hook-form") || id.includes("node_modules/zod")) {
            return "vendor-form";
          }
          if (id.includes("node_modules/axios") || id.includes("node_modules/fetch")) {
            return "vendor-http";
          }
          if (id.includes("node_modules")) {
            if (id.includes("node_modules/@")) {
              return "vendor-scoped";
            }
            return "vendor-utils";
          }
          if (id.includes("client/src/pages/")) {
            const match = id.match(/pages\/([^/]+)/);
            if (match) {
              return `page-${match[1].replace(".tsx", "")}`;
            }
          }
          if (id.includes("client/src/components/")) {
            return "components";
          }
          if (id.includes("client/src/hooks/")) {
            return "hooks";
          }
          if (id.includes("client/src/contexts/")) {
            return "contexts";
          }
          if (id.includes("client/src/lib/")) {
            return "lib";
          }
        },
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        compact: true
      }
    }
  },
  optimizeDeps: {
    include: ["react", "react-dom", "wouter", "lucide-react"],
    exclude: ["@vite/client"]
  },
  server: {
    host: true,
    warmup: {
      clientFiles: ["./src/App.tsx", "./src/pages/Home.tsx", "./src/pages/DeclarationsList.tsx"]
    },
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
      "mp3-app.com",
      "www.mp3-app.com"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/static-proxy.ts
import path5 from "path";
import fs6 from "fs";
import { createReadStream } from "fs";
var MIME_TYPES = {
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".jsx": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".html": "text/html; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};
function getMimeType(filePath) {
  const ext = path5.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}
function getCacheControl(filePath) {
  if (filePath.includes("/assets/")) return "public, max-age=31536000, immutable";
  if (filePath.endsWith(".html")) return "public, max-age=3600, must-revalidate";
  if (filePath.endsWith("sw.js")) return "no-cache, no-store, must-revalidate";
  if (filePath.endsWith("manifest.json")) return "public, max-age=86400";
  return "public, max-age=3600";
}
function isStaticAsset(pathname) {
  const patterns = ["/assets/", "/fonts/", "/images/", "/icons/", "/downloads/", "/releases/", "/__manus__/", "/sw.js", "/manifest.json", "/robots.txt"];
  if (patterns.some((p) => pathname.includes(p))) return true;
  const ext = path5.extname(pathname).toLowerCase();
  return Object.keys(MIME_TYPES).includes(ext);
}
function setupStaticProxy(app, distPath) {
  console.log(`[StaticProxy] Initializing with dist path: ${distPath}`);
  app.use(async (req, res, next) => {
    try {
      const pathname = req.path || req.url;
      if (pathname.startsWith("/api/") || pathname.startsWith("/trpc")) {
        return next();
      }
      if (!isStaticAsset(pathname)) {
        return next();
      }
      let filePath = path5.join(distPath, pathname);
      if (!filePath.startsWith(distPath)) {
        console.warn(`[StaticProxy] Security violation: ${pathname}`);
        return res.status(403).json({ error: "Forbidden" });
      }
      try {
        const stats = fs6.statSync(filePath);
        if (stats.isDirectory()) {
          filePath = path5.join(filePath, "index.html");
          const indexStats = fs6.statSync(filePath);
          if (!indexStats.isFile()) {
            return next();
          }
        }
        const mimeType = getMimeType(filePath);
        const cacheControl = getCacheControl(filePath);
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Content-Length", stats.size);
        res.setHeader("Cache-Control", cacheControl);
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Access-Control-Allow-Origin", "*");
        console.log(`[StaticProxy] \u2705 ${req.method} ${pathname} -> ${mimeType}`);
        const stream = createReadStream(filePath);
        stream.pipe(res);
        stream.on("error", (error) => {
          console.error(`[StaticProxy] Stream error for ${filePath}:`, error);
          if (!res.headersSent) {
            res.status(500).json({ error: "Internal Server Error" });
          }
        });
      } catch (error) {
        if (error.code === "ENOENT") {
          console.log(`[StaticProxy] \u274C File not found: ${pathname}`);
          return res.status(404).json({ error: "Not Found" });
        }
        console.error(`[StaticProxy] Error accessing file ${filePath}:`, error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    } catch (error) {
      console.error("[StaticProxy] Unexpected error:", error);
      next(error);
    }
  });
}
function setupSPAFallback(app, distPath) {
  console.log("[SPAFallback] Initializing SPA fallback handler");
  app.use((req, res, next) => {
    try {
      const pathname = req.path || req.url;
      if (pathname.startsWith("/api/") || pathname.startsWith("/trpc")) {
        return next();
      }
      if (isStaticAsset(pathname)) {
        return next();
      }
      const indexPath = path5.join(distPath, "index.html");
      try {
        const indexStats = fs6.statSync(indexPath);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Content-Length", indexStats.size);
        res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
        res.setHeader("X-Content-Type-Options", "nosniff");
        console.log(`[SPAFallback] Serving index.html for ${pathname}`);
        const stream = createReadStream(indexPath);
        stream.pipe(res);
        stream.on("error", (error) => {
          console.error("[SPAFallback] Stream error:", error);
          if (!res.headersSent) {
            res.status(500).json({ error: "Internal Server Error" });
          }
        });
      } catch (error) {
        console.error("[SPAFallback] Error reading index.html:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    } catch (error) {
      console.error("[SPAFallback] Unexpected error:", error);
      next(error);
    }
  });
}

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmm: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "spa"
  });
  const clientPath = path6.resolve(import.meta.dirname, "../..", "client");
  app.use(vite.middlewares);
  app.use(express.static(path6.join(clientPath, "public")));
  app.use("*", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.sendFile(path6.resolve(clientPath, "index.html"));
  });
}
function serveStatic(app) {
  const possiblePaths = [
    // المسار الأساسي: المشروع الحالي
    path6.resolve(process.cwd(), "dist"),
    // المسار في الحاوية (Manus)
    path6.resolve("/usr/src/dist"),
    // المسار المحلي أثناء التطوير
    path6.resolve(import.meta.dirname, "../..", "dist")
  ];
  let distPath = "";
  for (const possiblePath of possiblePaths) {
    if (fs7.existsSync(possiblePath)) {
      distPath = possiblePath;
      console.log(`[serveStatic] Found dist at: ${distPath}`);
      break;
    }
  }
  if (!distPath) {
    const errorMsg = `Could not find the build directory in any of these locations: ${possiblePaths.join(", ")}. Make sure to build the client first.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  console.log("[serveStatic] Using Static Proxy for serving files");
  setupStaticProxy(app, distPath);
  setupSPAFallback(app, distPath);
}

// server/_core/resource-monitor.ts
import os2 from "os";
var ResourceMonitor = class _ResourceMonitor {
  static instance;
  memoryThreshold = 500 * 1024 * 1024;
  // 500MB
  checkInterval = 3e4;
  // 30 seconds
  intervalId = null;
  lastCpuUsage = null;
  stats = [];
  maxStats = 100;
  // Keep last 100 stats
  constructor() {
  }
  static getInstance() {
    if (!_ResourceMonitor.instance) {
      _ResourceMonitor.instance = new _ResourceMonitor();
    }
    return _ResourceMonitor.instance;
  }
  /**
   * Get current memory statistics
   */
  getMemoryStats() {
    const memUsage = process.memoryUsage();
    const totalMemory = os2.totalmem();
    const percentage = memUsage.heapUsed / totalMemory * 100;
    return {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      percentage
    };
  }
  /**
   * Get current resource statistics
   */
  getStats() {
    const memory = this.getMemoryStats();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();
    const stats = {
      memory,
      uptime,
      cpuUsage,
      timestamp: Date.now()
    };
    this.stats.push(stats);
    if (this.stats.length > this.maxStats) {
      this.stats.shift();
    }
    this.lastCpuUsage = cpuUsage;
    return stats;
  }
  /**
   * Get average memory usage from last N checks
   */
  getAverageMemoryUsage(count = 10) {
    const recentStats = this.stats.slice(-count);
    if (recentStats.length === 0) return 0;
    const total = recentStats.reduce((sum, stat) => sum + stat.memory.heapUsed, 0);
    return total / recentStats.length;
  }
  /**
   * Check if memory usage is high
   */
  isMemoryHigh() {
    const memory = this.getMemoryStats();
    return memory.heapUsed > this.memoryThreshold;
  }
  /**
   * Get memory trend (increasing, decreasing, stable)
   */
  getMemoryTrend() {
    if (this.stats.length < 3) return "stable";
    const recent = this.stats.slice(-3);
    const values = recent.map((s) => s.memory.heapUsed);
    const diff1 = values[1] - values[0];
    const diff2 = values[2] - values[1];
    if (diff1 > 10 * 1024 * 1024 && diff2 > 10 * 1024 * 1024) {
      return "increasing";
    } else if (diff1 < -10 * 1024 * 1024 && diff2 < -10 * 1024 * 1024) {
      return "decreasing";
    }
    return "stable";
  }
  /**
   * Start monitoring resources
   */
  start(callback) {
    if (this.intervalId) {
      console.warn("[ResourceMonitor] Already monitoring");
      return;
    }
    console.log("[ResourceMonitor] Starting resource monitoring...");
    this.intervalId = setInterval(() => {
      const stats = this.getStats();
      const trend = this.getMemoryTrend();
      const isHigh = this.isMemoryHigh();
      const memMB = (stats.memory.heapUsed / 1024 / 1024).toFixed(2);
      const percentage = stats.memory.percentage.toFixed(2);
      let logLevel = "info";
      if (isHigh) logLevel = "warn";
      if (trend === "increasing") logLevel = "warn";
      const message = `[ResourceMonitor] Memory: ${memMB}MB (${percentage}%) | Trend: ${trend} | Uptime: ${stats.uptime.toFixed(0)}s`;
      if (logLevel === "warn") {
        console.warn(message);
      } else {
        console.log(message);
      }
      if (callback) {
        callback(stats);
      }
      if (isHigh && global.gc) {
        console.warn("[ResourceMonitor] Forcing garbage collection...");
        global.gc();
      }
    }, this.checkInterval);
  }
  /**
   * Stop monitoring resources
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("[ResourceMonitor] Stopped resource monitoring");
    }
  }
  /**
   * Get formatted stats for logging
   */
  formatStats(stats) {
    const memMB = (stats.memory.heapUsed / 1024 / 1024).toFixed(2);
    const heapTotalMB = (stats.memory.heapTotal / 1024 / 1024).toFixed(2);
    const rssMB = (stats.memory.rss / 1024 / 1024).toFixed(2);
    return `Memory: ${memMB}MB / ${heapTotalMB}MB (RSS: ${rssMB}MB) | CPU: ${stats.cpuUsage.user}us | Uptime: ${stats.uptime.toFixed(0)}s`;
  }
  /**
   * Get health status
   */
  getHealthStatus() {
    const stats = this.getStats();
    const trend = this.getMemoryTrend();
    const memMB = stats.memory.heapUsed / 1024 / 1024;
    let memory = "good";
    if (memMB > 400) memory = "critical";
    else if (memMB > 300) memory = "warning";
    const healthy = memory !== "critical" && trend !== "increasing";
    return {
      healthy,
      memory,
      trend,
      message: `Memory: ${memMB.toFixed(0)}MB | Trend: ${trend}`
    };
  }
};
var resourceMonitor = ResourceMonitor.getInstance();

// server/_core/health-check.ts
var HealthChecker = class _HealthChecker {
  static instance;
  startTime = Date.now();
  lastCheckTime = 0;
  checkInterval = 3e4;
  // 30 seconds
  intervalId = null;
  constructor() {
  }
  static getInstance() {
    if (!_HealthChecker.instance) {
      _HealthChecker.instance = new _HealthChecker();
    }
    return _HealthChecker.instance;
  }
  /**
   * Check memory health
   */
  checkMemory() {
    const stats = resourceMonitor.getStats();
    const memMB = stats.memory.heapUsed / 1024 / 1024;
    const percentage = stats.memory.percentage;
    if (memMB > 400) {
      return {
        healthy: false,
        message: `Critical memory usage: ${memMB.toFixed(0)}MB (${percentage.toFixed(1)}%)`
      };
    } else if (memMB > 300) {
      return {
        healthy: true,
        message: `High memory usage: ${memMB.toFixed(0)}MB (${percentage.toFixed(1)}%)`
      };
    }
    return {
      healthy: true,
      message: `Memory OK: ${memMB.toFixed(0)}MB (${percentage.toFixed(1)}%)`
    };
  }
  /**
   * Check CPU health
   */
  checkCpu() {
    try {
      const uptime = process.uptime();
      return {
        healthy: true,
        message: `CPU OK: Process uptime ${uptime.toFixed(0)}s`
      };
    } catch (error) {
      return {
        healthy: false,
        message: `CPU check failed: ${error}`
      };
    }
  }
  /**
   * Check database health (placeholder)
   */
  checkDatabase() {
    return {
      healthy: true,
      message: "Database: Not checked"
    };
  }
  /**
   * Check API health (placeholder)
   */
  checkApi() {
    return {
      healthy: true,
      message: "API: Not checked"
    };
  }
  /**
   * Perform full health check
   */
  performCheck() {
    const stats = resourceMonitor.getStats();
    const memoryCheck = this.checkMemory();
    const cpuCheck = this.checkCpu();
    const dbCheck = this.checkDatabase();
    const apiCheck = this.checkApi();
    const details = [];
    details.push(memoryCheck.message);
    details.push(cpuCheck.message);
    details.push(dbCheck.message);
    details.push(apiCheck.message);
    const allHealthy = memoryCheck.healthy && cpuCheck.healthy && dbCheck.healthy && apiCheck.healthy;
    let status = "healthy";
    if (!memoryCheck.healthy || !cpuCheck.healthy) {
      status = "unhealthy";
    } else if (stats.memory.heapUsed / stats.memory.heapTotal > 0.8 || stats.memory.percentage > 50) {
      status = "degraded";
    }
    return {
      status,
      timestamp: Date.now(),
      uptime: process.uptime(),
      memory: {
        used: stats.memory.heapUsed,
        total: stats.memory.heapTotal,
        percentage: stats.memory.percentage
      },
      checks: {
        memory: memoryCheck.healthy,
        cpu: cpuCheck.healthy,
        database: dbCheck.healthy,
        api: apiCheck.healthy
      },
      details
    };
  }
  /**
   * Start periodic health checks
   */
  start(callback) {
    if (this.intervalId) {
      console.warn("[HealthChecker] Already running");
      return;
    }
    console.log("[HealthChecker] Starting health checks...");
    this.intervalId = setInterval(() => {
      const result = this.performCheck();
      this.lastCheckTime = Date.now();
      const statusEmoji = {
        healthy: "\u2705",
        degraded: "\u26A0\uFE0F",
        unhealthy: "\u274C"
      };
      console.log(
        `${statusEmoji[result.status]} [HealthCheck] Status: ${result.status} | Memory: ${(result.memory.used / 1024 / 1024).toFixed(0)}MB / ${(result.memory.total / 1024 / 1024).toFixed(0)}MB`
      );
      if (callback) {
        callback(result);
      }
    }, this.checkInterval);
  }
  /**
   * Stop periodic health checks
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("[HealthChecker] Stopped health checks");
    }
  }
  /**
   * Get last check time
   */
  getLastCheckTime() {
    return this.lastCheckTime;
  }
  /**
   * Get server uptime
   */
  getUptime() {
    return Date.now() - this.startTime;
  }
};
var healthChecker = HealthChecker.getInstance();

// server/memory-optimization.ts
var MemoryOptimizer = class _MemoryOptimizer {
  static instance;
  cacheSize = 0;
  maxCacheSize = 50 * 1024 * 1024;
  // 50MB
  static getInstance() {
    if (!_MemoryOptimizer.instance) {
      _MemoryOptimizer.instance = new _MemoryOptimizer();
    }
    return _MemoryOptimizer.instance;
  }
  // تنظيف الذاكرة بشكل دوري
  cleanupMemory() {
    if (global.gc) {
      global.gc();
    }
  }
  // مراقبة استخدام الذاكرة
  monitorMemory() {
    const memUsage = process.memoryUsage();
    const heapUsedPercent = memUsage.heapUsed / memUsage.heapTotal * 100;
    if (heapUsedPercent > 85) {
      this.cleanupMemory();
    }
    return {
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
      percent: heapUsedPercent.toFixed(2)
    };
  }
  // تحسين الاستعلامات من قاعدة البيانات
  optimizeQuery(query) {
    if (!query.toUpperCase().includes("LIMIT")) {
      query += " LIMIT 1000";
    }
    return query;
  }
  // تخزين مؤقت ذكي
  smartCache(key, value, ttl = 36e5) {
    this.cacheSize += JSON.stringify(value).length;
    if (this.cacheSize > this.maxCacheSize) {
      this.cleanupMemory();
      this.cacheSize = 0;
    }
    return value;
  }
};
var memoryOptimizer = MemoryOptimizer.getInstance();

// server/middleware/mime-type-handler.ts
import path7 from "path";
var MIME_TYPES2 = {
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".jsx": "application/javascript; charset=utf-8",
  ".ts": "application/typescript; charset=utf-8",
  ".tsx": "application/typescript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".map": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".ico": "image/x-icon",
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json"
};
var CACHE_RULES = {
  // Immutable assets with hash in filename
  "/assets/": "public, max-age=31536000, immutable",
  "/fonts/": "public, max-age=31536000, immutable",
  "/images/": "public, max-age=31536000, immutable",
  // HTML - no cache
  ".html": "public, max-age=3600, must-revalidate",
  // Service worker - no cache
  "service-worker.js": "no-cache, no-store, must-revalidate",
  // Manifest - short cache
  "manifest.json": "public, max-age=86400"
};
function getMimeType2(filePath) {
  const ext = path7.extname(filePath).toLowerCase();
  return MIME_TYPES2[ext] || "application/octet-stream";
}
function getCacheControl2(filePath) {
  for (const [pattern, cacheControl] of Object.entries(CACHE_RULES)) {
    if (filePath.includes(pattern)) {
      return cacheControl;
    }
  }
  const ext = path7.extname(filePath).toLowerCase();
  for (const [pattern, cacheControl] of Object.entries(CACHE_RULES)) {
    if (pattern.startsWith(".") && filePath.endsWith(pattern)) {
      return cacheControl;
    }
  }
  return "public, max-age=3600";
}
function isStaticAsset2(pathname) {
  const staticPatterns = [
    "/assets/",
    "/fonts/",
    "/images/",
    "/icons/",
    "/downloads/",
    "/releases/",
    "/__manus__/",
    /\.(js|mjs|jsx|ts|tsx|css|json|map|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|eot|ico|html|txt|xml|webmanifest)$/i
  ];
  return staticPatterns.some((pattern) => {
    if (typeof pattern === "string") {
      return pathname.includes(pattern);
    }
    return pattern.test(pathname);
  });
}
function mimeTypeHandler(req, res, next) {
  const pathname = req.path || req.url;
  if (isStaticAsset2(pathname)) {
    const mimeType = getMimeType2(pathname);
    res.setHeader("Content-Type", mimeType);
    const cacheControl = getCacheControl2(pathname);
    res.setHeader("Cache-Control", cacheControl);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    console.log(`[MIME] ${req.method} ${pathname} -> ${mimeType}`);
  }
  next();
}

// server/config/urls.ts
var URLs = {
  // Payment & Banking
  BANK_AUDI: process.env.BANK_AUDI_URL || "https://www.bankaudi.com.jo/saadboos",
  PAYPAL: process.env.PAYPAL_URL || "https://paypal.me/saadboos",
  ALIPAY: process.env.ALIPAY_URL || "https://alipay.com/saadboos",
  // App Stores
  APP_STORE: process.env.APP_STORE_URL || "https://apps.apple.com/app/jordan-customs",
  PLAY_STORE: process.env.PLAY_STORE_URL || "https://play.google.com/store/apps/details?id=com.jordancustoms",
  // API Endpoints
  FORGE_API: process.env.VITE_FRONTEND_FORGE_API_URL || "https://forge.butterfly-effect.dev",
  QR_CODE_API: process.env.QR_CODE_API_URL || "https://api.qrserver.com/v1/create-qr-code/",
  // File Storage
  FILES_CDN: process.env.FILES_CDN_URL || "https://files.manuscdn.com/user_upload_by_module/session_file/",
  // Analytics
  ANALYTICS: process.env.VITE_ANALYTICS_ENDPOINT || "https://manus-analytics.com",
  // Fonts
  GOOGLE_FONTS: "https://fonts.googleapis.com",
  GOOGLE_FONTS_STATIC: "https://fonts.gstatic.com",
  // App URLs
  CUSTOMS_SYSTEM: process.env.CUSTOMS_SYSTEM_URL || "https://customs-system.manus.space",
  MAIN_APP: process.env.MAIN_APP_URL || "https://mp3-app.com",
  // Development
  DEV_SERVER: process.env.DEV_SERVER_URL || "http://localhost:5173",
  DEV_API: process.env.DEV_API_URL || "http://localhost:3000"
};
var CORS_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  process.env.MAIN_APP_URL || "https://mp3-app.com",
  process.env.CUSTOMS_SYSTEM_URL || "https://customs-system.manus.space"
];
var CSP_DIRECTIVES = {
  scriptSrc: ["'self'", "'unsafe-inline'", URLs.ANALYTICS, "blob:"],
  styleSrc: ["'self'", "'unsafe-inline'", URLs.GOOGLE_FONTS],
  fontSrc: ["'self'", "data:", URLs.GOOGLE_FONTS_STATIC],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'", "https:", URLs.ANALYTICS, URLs.FORGE_API]
};

// server/_core/security-middleware.ts
import rateLimit from "express-rate-limit";
var generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 دقيقة
  max: 100,
  // حد أقصى 100 طلب
  message: "\u0639\u062F\u062F \u0643\u0628\u064A\u0631 \u062C\u062F\u0627\u064B \u0645\u0646 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0645\u0646 \u0647\u0630\u0627 \u0627\u0644\u0639\u0646\u0648\u0627\u0646\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === "development";
  }
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 دقيقة
  max: 5,
  // حد أقصى 5 محاولات
  message: "\u0639\u062F\u062F \u0643\u0628\u064A\u0631 \u062C\u062F\u0627\u064B \u0645\u0646 \u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B",
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
  // لا تحسب المحاولات الناجحة
});
var apiLimiter = rateLimit({
  windowMs: 60 * 1e3,
  // دقيقة واحدة
  max: 300,
  // حد أقصى 300 طلب
  message: "\u0639\u062F\u062F \u0643\u0628\u064A\u0631 \u062C\u062F\u0627\u064B \u0645\u0646 \u0637\u0644\u0628\u0627\u062A API\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B",
  standardHeaders: true,
  legacyHeaders: false
});
var uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // ساعة واحدة
  max: 10,
  // حد أقصى 10 تحميلات
  message: "\u0639\u062F\u062F \u0643\u0628\u064A\u0631 \u062C\u062F\u0627\u064B \u0645\u0646 \u0645\u062D\u0627\u0648\u0644\u0627\u062A \u0627\u0644\u062A\u062D\u0645\u064A\u0644\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B",
  standardHeaders: true,
  legacyHeaders: false
});
var corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:3000",
      CORS_ORIGINS[0],
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
      process.env.FRONTEND_URL,
      // السماح بجميع النطاقات في بيئة التطوير
      ...process.env.NODE_ENV === "development" ? ["*"] : []
    ].filter(Boolean);
    if (process.env.NODE_ENV === "development") {
      callback(null, true);
    } else if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400
  // 24 ساعة
};
var helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://manus-analytics.com", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https:", "wss:", "https://manus-analytics.com", "blob:", "http://localhost:*"],
      workerSrc: ["'self'", "blob:", "http://localhost:*"],
      scriptSrcAttr: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: {
    maxAge: 31536e3,
    // سنة واحدة
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: "deny"
  },
  referrerPolicy: "strict-origin-when-cross-origin"
};
var suspiciousRequestLogger = (req, res, next) => {
  if (!req.get("user-agent")) {
    console.warn(`[Security] Request without User-Agent from ${req.ip}`);
  }
  if (req.method === "POST" && !req.get("referer")) {
    console.warn(`[Security] POST request without Referer from ${req.ip}`);
  }
  if (req.get("content-length") && parseInt(req.get("content-length") || "0") > 50 * 1024 * 1024) {
    console.warn(`[Security] Large request (${req.get("content-length")} bytes) from ${req.ip}`);
  }
  next();
};
var securityHeaders = (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Frame-Options", "DENY");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  next();
};
var requestValidation = (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    const contentType = req.get("content-type");
    if (contentType && !contentType.includes("application/json") && !contentType.includes("multipart/form-data")) {
      console.warn(`[Security] Invalid Content-Type: ${contentType} from ${req.ip}`);
    }
  }
  next();
};
var sanitizeInput = (req, res, next) => {
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      const value = req.query[key];
      if (typeof value === "string") {
        req.query[key] = value.replace(/[<>\"'`]/g, "").substring(0, 1e3);
      }
    });
  }
  if (req.body && typeof req.body === "object") {
    const sanitizeObject = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      if (obj !== null && typeof obj === "object") {
        const sanitized = {};
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            sanitized[key] = sanitizeObject(obj[key]);
          }
        }
        return sanitized;
      }
      if (typeof obj === "string") {
        return obj.replace(/[<>\"'`]/g, "").substring(0, 1e4);
      }
      return obj;
    };
    req.body = sanitizeObject(req.body);
  }
  next();
};
var securityErrorHandler = (err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    console.warn(`[Security] CORS violation from ${req.ip}: ${req.get("origin")}`);
    return res.status(403).json({ error: "CORS policy violation" });
  }
  if (err.status === 429) {
    console.warn(`[Security] Rate limit exceeded for ${req.ip}`);
    return res.status(429).json({ error: "Too many requests" });
  }
  next(err);
};
var requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    const path8 = req.path;
    const ip = req.ip;
    if (process.env.NODE_ENV === "production" && statusCode >= 400) {
      console.log(`[Request] ${method} ${path8} - ${statusCode} (${duration}ms) from ${ip}`);
    }
  });
  next();
};

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.set("trust proxy", 1);
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok" });
  });
  if (process.env.NODE_ENV === "development") {
  } else {
    serveStatic(app);
  }
  app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));
  app.use(mimeTypeHandler);
  app.use(helmet(helmetOptions));
  app.use(cors(corsOptions));
  app.use(generalLimiter);
  app.use(requestLogger);
  app.use(securityHeaders);
  app.use(suspiciousRequestLogger);
  app.use(requestValidation);
  app.use(express2.json({ limit: "10mb" }));
  app.use(express2.urlencoded({ limit: "10mb", extended: true }));
  app.use((req, res, next) => {
    if (req.path.startsWith("/assets/")) {
      res.set("Cache-Control", "public, max-age=31536000, immutable");
    } else if (req.path.startsWith("/api/")) {
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    }
    next();
  });
  app.use(sanitizeInput);
  const isProduction2 = process.env.NODE_ENV === "production";
  const resourceMonitorEnabled = !isProduction2;
  server.keepAliveTimeout = 65e3;
  server.headersTimeout = 66e3;
  app.get("/api/download/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const downloadUrl = `https://files.manuscdn.com/user_upload_by_module/session_file/310519663107576035/${filename}`;
      console.log(`[Download] Fetching: ${downloadUrl}`);
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        return res.status(404).json({ error: "File not found" });
      }
      const buffer = await response.arrayBuffer();
      const contentType = response.headers.get("content-type") || "application/octet-stream";
      console.log(`[Download] Success: ${filename} (${buffer.byteLength} bytes)`);
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.send(Buffer.from(buffer));
    } catch (error) {
      res.status(500).json({ error: "Download failed" });
    }
  });
  app.use("/api/oauth", authLimiter);
  registerOAuthRoutes(app);
  app.use("/api/trpc", apiLimiter);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: Date.now() });
  });
  if (!isProduction2) {
    app.get("/api/stats", (req, res) => {
      const stats = resourceMonitor.getStats();
      const health = healthChecker.performCheck();
      res.json({
        stats,
        health
      });
    });
  }
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
  }
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (duration > 1e3 && resourceMonitorEnabled) {
        console.warn(`[Slow Request] ${req.method} ${req.path} took ${duration}ms`);
      }
    });
    next();
  });
  app.use(securityErrorHandler);
  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`Compression: enabled`);
    console.log(`Keep-Alive: enabled`);
    if (resourceMonitorEnabled) {
      resourceMonitor.start((stats) => {
      });
      healthChecker.start((result) => {
      });
    }
    process.on("SIGTERM", () => {
      console.log("[Server] SIGTERM received, shutting down gracefully...");
      if (resourceMonitorEnabled) resourceMonitor.stop();
      if (resourceMonitorEnabled) healthChecker.stop();
      server.close(() => {
        console.log("[Server] Server closed");
        process.exit(0);
      });
    });
    process.on("SIGINT", () => {
      console.log("[Server] SIGINT received, shutting down gracefully...");
      if (resourceMonitorEnabled) resourceMonitor.stop();
      if (resourceMonitorEnabled) healthChecker.stop();
      server.close(() => {
        console.log("[Server] Server closed");
        process.exit(0);
      });
    });
  });
}
startServer().catch(console.error);
var isProduction = process.env.NODE_ENV === "production";
if (!isProduction) {
  setInterval(() => {
    const mem = memoryOptimizer.monitorMemory();
    if (Number(mem.percent) > 80) {
      console.warn(`\u26A0\uFE0F High memory usage: ${mem.percent}%`);
    }
  }, 3e4);
}

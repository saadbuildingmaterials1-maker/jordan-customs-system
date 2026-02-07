/**
 * accounting-schema
 * 
 * @module ./drizzle/accounting-schema
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
 * جدول الحسابات (Chart of Accounts)
 * يحتوي على جميع الحسابات المحاسبية
 */
export const chartOfAccounts = mysqlTable("chart_of_accounts", {
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
    "expense",
  ]).notNull(),

  // التصنيفات
  mainCategory: varchar("mainCategory", { length: 100 }).notNull(),
  subCategory: varchar("subCategory", { length: 100 }),
  description: text("description"),

  // الخصائص
  isActive: boolean("isActive").default(true).notNull(),
  parentAccountId: int("parentAccountId"), // للحسابات الفرعية

  // الأرصدة
  openingBalance: decimal("openingBalance", { precision: 15, scale: 3 }).default("0"),
  currentBalance: decimal("currentBalance", { precision: 15, scale: 3 }).default("0"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type InsertChartOfAccount = typeof chartOfAccounts.$inferInsert;

/**
 * جدول الحركات المحاسبية (Transactions)
 * يحتوي على جميع العمليات المالية
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  declarationId: int("declarationId"), // ربط مع البيان الجمركي
  invoiceId: int("invoiceId"), // ربط مع الفاتورة

  // معلومات الحركة
  transactionNumber: varchar("transactionNumber", { length: 50 }).notNull().unique(),
  transactionDate: date("transactionDate").notNull(),
  transactionType: mysqlEnum("transactionType", [
    "purchase",
    "sale",
    "expense",
    "revenue",
    "adjustment",
    "transfer",
  ]).notNull(),

  // الحسابات المدينة والدائنة
  debitAccountId: int("debitAccountId").notNull(),
  creditAccountId: int("creditAccountId").notNull(),

  // المبالغ
  amount: decimal("amount", { precision: 15, scale: 3 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("JOD").notNull(),

  // الوصف والملاحظات
  description: text("description"),
  reference: varchar("reference", { length: 100 }), // رقم المرجع (رقم فاتورة، إلخ)
  notes: text("notes"),

  // الحالة
  status: mysqlEnum("status", ["pending", "approved", "posted", "reversed"]).default("pending").notNull(),
  approvedBy: int("approvedBy"), // معرف المستخدم الذي وافق
  approvedAt: timestamp("approvedAt"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * جدول دفتر الأستاذ (General Ledger)
 * يحتوي على حركات كل حساب
 */
export const generalLedger = mysqlTable("general_ledger", {
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

  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GeneralLedgerEntry = typeof generalLedger.$inferSelect;
export type InsertGeneralLedgerEntry = typeof generalLedger.$inferInsert;

/**
 * جدول الميزانية التجريبية (Trial Balance)
 * يحتوي على أرصدة الحسابات في تاريخ معين
 */
export const trialBalance = mysqlTable("trial_balance", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),

  // معلومات الميزانية
  balanceDate: date("balanceDate").notNull(),
  balancePeriod: varchar("balancePeriod", { length: 50 }).notNull(), // مثل "2024-01" للشهر والسنة

  // الحسابات والأرصدة
  accountId: int("accountId").notNull(),
  accountCode: varchar("accountCode", { length: 20 }).notNull(),
  accountName: varchar("accountName", { length: 255 }).notNull(),

  // الأرصدة
  debitBalance: decimal("debitBalance", { precision: 15, scale: 3 }).default("0"),
  creditBalance: decimal("creditBalance", { precision: 15, scale: 3 }).default("0"),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrialBalance = typeof trialBalance.$inferSelect;
export type InsertTrialBalance = typeof trialBalance.$inferInsert;

/**
 * جدول التقارير المالية (Financial Reports)
 * يحتوي على التقارير المالية المختلفة
 */
export const financialReports = mysqlTable("financial_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),

  // معلومات التقرير
  reportType: mysqlEnum("reportType", [
    "balance_sheet",
    "income_statement",
    "cash_flow",
    "trial_balance",
    "general_ledger",
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
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialReport = typeof financialReports.$inferSelect;
export type InsertFinancialReport = typeof financialReports.$inferInsert;

/**
 * جدول سجل التدقيق (Audit Log)
 * يحتوي على جميع التغييرات والعمليات
 */
export const auditLog = mysqlTable("audit_log", {
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

  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

/**
 * accounting-full-schema
 * 
 * @module ./drizzle/accounting-full-schema
 */
import {
  int,
  varchar,
  decimal,
  text,
  timestamp,
  mysqlTable,
  mysqlEnum,
  boolean,
  index,
  foreignKey,
} from "drizzle-orm/mysql-core";

/**
 * نظام المحاسبة المتكامل لشركات الاستيراد والتصدير
 * شجرة الحسابات الكاملة مع ربط مباشر بالعمليات التشغيلية
 */

// ============================================
// 1️⃣ جدول الحسابات الرئيسي (Chart of Accounts)
// ============================================
export const chartOfAccounts = mysqlTable(
  "chart_of_accounts",
  {
    id: int("id").autoincrement().primaryKey(),
    accountCode: varchar("account_code", { length: 20 }).notNull().unique(), // مثل: 101, 301, 601
    accountName: varchar("account_name", { length: 255 }).notNull(), // اسم الحساب
    accountNameEn: varchar("account_name_en", { length: 255 }), // الاسم بالإنجليزية
    accountType: mysqlEnum("account_type", [
      "asset",
      "liability",
      "equity",
      "revenue",
      "expense",
      "cogs",
    ]).notNull(), // نوع الحساب
    subType: varchar("sub_type", { length: 100 }), // النوع الفرعي (متداول، ثابت، إلخ)
    description: text("description"), // وصف الحساب
    parentAccountId: int("parent_account_id"), // الحساب الأب (للحسابات الفرعية)
    isActive: boolean("is_active").default(true), // هل الحساب نشط
    openingBalance: decimal("opening_balance", { precision: 15, scale: 3 }).default("0"), // الرصيد الافتتاحي
    currency: mysqlEnum("currency", ["JOD", "USD", "EUR", "AED"]).default("JOD"), // العملة
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    parentAccountIdx: index("parent_account_idx").on(table.parentAccountId),
    accountTypeIdx: index("account_type_idx").on(table.accountType),
    accountCodeIdx: index("account_code_idx").on(table.accountCode),
  })
);

// ============================================
// 2️⃣ جدول الحركات المحاسبية (General Journal)
// ============================================
export const generalJournal = mysqlTable(
  "general_journal",
  {
    id: int("id").autoincrement().primaryKey(),
    journalDate: timestamp("journal_date").notNull(), // تاريخ القيد
    journalNumber: varchar("journal_number", { length: 50 }).notNull().unique(), // رقم القيد
    description: text("description").notNull(), // وصف الحركة
    referenceType: mysqlEnum("reference_type", [
      "invoice",
      "customs_declaration",
      "payment",
      "expense",
      "transfer",
      "adjustment",
      "other",
    ]).notNull(), // نوع المرجع
    referenceId: int("reference_id"), // رقم المرجع (رقم الفاتورة، البيان، إلخ)
    referenceNumber: varchar("reference_number", { length: 100 }), // رقم المرجع النصي
    debitAccountId: int("debit_account_id").notNull(), // حساب المدين
    creditAccountId: int("credit_account_id").notNull(), // حساب الدائن
    amount: decimal("amount", { precision: 15, scale: 3 }).notNull(), // المبلغ
    currency: mysqlEnum("currency", ["JOD", "USD", "EUR", "AED"]).default("JOD"), // العملة
    exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }).default("1"), // سعر الصرف
    amountJOD: decimal("amount_jod", { precision: 15, scale: 3 }).notNull(), // المبلغ بالدينار الأردني
    status: mysqlEnum("status", ["draft", "posted", "reversed"]).default("draft"), // حالة القيد
    approvedBy: int("approved_by"), // معرّف المستخدم الذي وافق على القيد
    approvedAt: timestamp("approved_at"), // تاريخ الموافقة
    createdBy: int("created_by").notNull(), // معرّف المستخدم الذي أنشأ القيد
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    journalDateIdx: index("journal_date_idx").on(table.journalDate),
    debitAccountIdx: index("debit_account_idx").on(table.debitAccountId),
    creditAccountIdx: index("credit_account_idx").on(table.creditAccountId),
    referenceIdx: index("reference_idx").on(table.referenceType, table.referenceId),
    statusIdx: index("status_idx").on(table.status),
  })
);

// ============================================
// 3️⃣ جدول دفتر الأستاذ (General Ledger)
// ============================================
export const generalLedger = mysqlTable(
  "general_ledger",
  {
    id: int("id").autoincrement().primaryKey(),
    accountId: int("account_id").notNull(), // معرّف الحساب
    journalId: int("journal_id").notNull(), // معرّف القيد
    ledgerDate: timestamp("ledger_date").notNull(), // تاريخ القيد
    debitAmount: decimal("debit_amount", { precision: 15, scale: 3 }).default("0"), // المبلغ المدين
    creditAmount: decimal("credit_amount", { precision: 15, scale: 3 }).default("0"), // المبلغ الدائن
    balance: decimal("balance", { precision: 15, scale: 3 }).notNull(), // الرصيد
    currency: mysqlEnum("currency", ["JOD", "USD", "EUR", "AED"]).default("JOD"), // العملة
    description: text("description"), // وصف الحركة
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    accountIdx: index("account_idx").on(table.accountId),
    journalIdx: index("journal_idx").on(table.journalId),
    ledgerDateIdx: index("ledger_date_idx").on(table.ledgerDate),
  })
);

// ============================================
// 4️⃣ جدول الميزانية التجريبية (Trial Balance)
// ============================================
export const trialBalance = mysqlTable(
  "trial_balance",
  {
    id: int("id").autoincrement().primaryKey(),
    accountId: int("account_id").notNull(), // معرّف الحساب
    asOfDate: timestamp("as_of_date").notNull(), // تاريخ الميزانية
    debitTotal: decimal("debit_total", { precision: 15, scale: 3 }).default("0"), // إجمالي المدين
    creditTotal: decimal("credit_total", { precision: 15, scale: 3 }).default("0"), // إجمالي الدائن
    balance: decimal("balance", { precision: 15, scale: 3 }).notNull(), // الرصيد
    currency: mysqlEnum("currency", ["JOD", "USD", "EUR", "AED"]).default("JOD"), // العملة
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    accountDateIdx: index("account_date_idx").on(table.accountId, table.asOfDate),
  })
);

// ============================================
// 5️⃣ جدول التقارير المالية (Financial Reports)
// ============================================
export const financialReports = mysqlTable(
  "financial_reports",
  {
    id: int("id").autoincrement().primaryKey(),
    reportType: mysqlEnum("report_type", [
      "income_statement",
      "balance_sheet",
      "cash_flow",
      "trial_balance",
      "general_ledger",
      "customs_summary",
      "import_export_summary",
    ]).notNull(), // نوع التقرير
    reportName: varchar("report_name", { length: 255 }).notNull(), // اسم التقرير
    reportDate: timestamp("report_date").notNull(), // تاريخ التقرير
    fromDate: timestamp("from_date"), // من تاريخ
    toDate: timestamp("to_date"), // إلى تاريخ
    reportData: text("report_data"), // بيانات التقرير (JSON)
    totalAssets: decimal("total_assets", { precision: 15, scale: 3 }), // إجمالي الأصول
    totalLiabilities: decimal("total_liabilities", { precision: 15, scale: 3 }), // إجمالي الالتزامات
    totalEquity: decimal("total_equity", { precision: 15, scale: 3 }), // إجمالي حقوق الملكية
    totalRevenue: decimal("total_revenue", { precision: 15, scale: 3 }), // إجمالي الإيرادات
    totalExpenses: decimal("total_expenses", { precision: 15, scale: 3 }), // إجمالي المصاريف
    netProfit: decimal("net_profit", { precision: 15, scale: 3 }), // صافي الربح/الخسارة
    currency: mysqlEnum("currency", ["JOD", "USD", "EUR", "AED"]).default("JOD"), // العملة
    createdBy: int("created_by").notNull(), // معرّف المستخدم الذي أنشأ التقرير
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    reportTypeIdx: index("report_type_idx").on(table.reportType),
    reportDateIdx: index("report_date_idx").on(table.reportDate),
  })
);

// ============================================
// 6️⃣ جدول سجل التدقيق (Audit Log)
// ============================================
export const auditLog = mysqlTable(
  "audit_log",
  {
    id: int("id").autoincrement().primaryKey(),
    actionType: mysqlEnum("action_type", [
      "create",
      "update",
      "delete",
      "approve",
      "reject",
      "post",
      "reverse",
      "export",
      "print",
    ]).notNull(), // نوع الإجراء
    entityType: varchar("entity_type", { length: 100 }).notNull(), // نوع الكيان (حساب، قيد، إلخ)
    entityId: int("entity_id"), // معرّف الكيان
    entityName: varchar("entity_name", { length: 255 }), // اسم الكيان
    oldValues: text("old_values"), // القيم القديمة (JSON)
    newValues: text("new_values"), // القيم الجديدة (JSON)
    changes: text("changes"), // الحقول التي تغيرت
    reason: text("reason"), // السبب/الملاحظات
    userId: int("user_id").notNull(), // معرّف المستخدم
    userName: varchar("user_name", { length: 255 }), // اسم المستخدم
    ipAddress: varchar("ip_address", { length: 50 }), // عنوان IP
    timestamp: timestamp("timestamp").defaultNow().notNull(), // الوقت
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    entityIdx: index("entity_idx").on(table.entityType, table.entityId),
    timestampIdx: index("timestamp_idx").on(table.timestamp),
  })
);

// ============================================
// 7️⃣ جدول ربط الحسابات بالعمليات
// ============================================
export const accountOperationMapping = mysqlTable(
  "account_operation_mapping",
  {
    id: int("id").autoincrement().primaryKey(),
    operationType: mysqlEnum("operation_type", [
      "import",
      "export",
      "local_sale",
      "local_purchase",
      "payment",
      "receipt",
      "expense",
      "customs_clearance",
      "freight",
      "insurance",
      "other",
    ]).notNull(), // نوع العملية
    operationStep: varchar("operation_step", { length: 100 }).notNull(), // خطوة العملية
    debitAccountId: int("debit_account_id"), // حساب المدين
    creditAccountId: int("credit_account_id"), // حساب الدائن
    description: text("description"), // وصف الربط
    isAutomatic: boolean("is_automatic").default(true), // هل يتم القيد تلقائياً
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    operationTypeIdx: index("operation_type_idx").on(table.operationType),
  })
);

// ============================================
// 8️⃣ جدول الأرصدة الدورية (Period Balances)
// ============================================
export const periodBalances = mysqlTable(
  "period_balances",
  {
    id: int("id").autoincrement().primaryKey(),
    accountId: int("account_id").notNull(), // معرّف الحساب
    periodYear: int("period_year").notNull(), // السنة
    periodMonth: int("period_month").notNull(), // الشهر
    openingBalance: decimal("opening_balance", { precision: 15, scale: 3 }).default("0"), // الرصيد الافتتاحي
    debitAmount: decimal("debit_amount", { precision: 15, scale: 3 }).default("0"), // المبلغ المدين
    creditAmount: decimal("credit_amount", { precision: 15, scale: 3 }).default("0"), // المبلغ الدائن
    closingBalance: decimal("closing_balance", { precision: 15, scale: 3 }).notNull(), // الرصيد الختامي
    currency: mysqlEnum("currency", ["JOD", "USD", "EUR", "AED"]).default("JOD"), // العملة
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    accountPeriodIdx: index("account_period_idx").on(
      table.accountId,
      table.periodYear,
      table.periodMonth
    ),
  })
);

// ============================================
// أنواع الحسابات
// ============================================
export type ChartOfAccounts = typeof chartOfAccounts.$inferSelect;
export type InsertChartOfAccounts = typeof chartOfAccounts.$inferInsert;

export type GeneralJournal = typeof generalJournal.$inferSelect;
export type InsertGeneralJournal = typeof generalJournal.$inferInsert;

export type GeneralLedger = typeof generalLedger.$inferSelect;
export type InsertGeneralLedger = typeof generalLedger.$inferInsert;

export type TrialBalance = typeof trialBalance.$inferSelect;
export type InsertTrialBalance = typeof trialBalance.$inferInsert;

export type FinancialReports = typeof financialReports.$inferSelect;
export type InsertFinancialReports = typeof financialReports.$inferInsert;

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

export type AccountOperationMapping = typeof accountOperationMapping.$inferSelect;
export type InsertAccountOperationMapping = typeof accountOperationMapping.$inferInsert;

export type PeriodBalances = typeof periodBalances.$inferSelect;
export type InsertPeriodBalances = typeof periodBalances.$inferInsert;

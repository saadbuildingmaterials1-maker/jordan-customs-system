import { mysqlTable, varchar, int, decimal, datetime, text, boolean, json, index, unique, mysqlEnum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { users, invoices } from './schema';

/**
 * نظام الدفع الإلكتروني المتكامل
 * Integrated Electronic Payment System
 * يدعم البنوك الأردنية الرئيسية
 */

// ==================== البنوك الأردنية المدعومة ====================

export const supportedBanks = mysqlTable('supported_banks', {
  id: int('id').primaryKey().autoincrement(),
  bankCode: varchar('bank_code', { length: 20 }).notNull().unique(),
  bankName: varchar('bank_name', { length: 255 }).notNull(),
  bankNameAr: varchar('bank_name_ar', { length: 255 }).notNull(),
  
  // معلومات البوابة
  gatewayType: mysqlEnum('gateway_type', ['redirect', 'api', 'hosted_page', 'mobile_wallet']).notNull(),
  gatewayUrl: text('gateway_url').notNull(),
  apiEndpoint: text('api_endpoint'),
  
  // بيانات الاتصال
  merchantId: varchar('merchant_id', { length: 100 }),
  apiKey: text('api_key'),
  apiSecret: text('api_secret'),
  
  // معايير الدعم
  supportedCurrencies: json('supported_currencies').default(JSON.stringify(['JOD', 'USD', 'EUR'])),
  minAmount: decimal('min_amount', { precision: 12, scale: 2 }).default('0.01'),
  maxAmount: decimal('max_amount', { precision: 12, scale: 2 }).default('999999.99'),
  
  // معلومات إضافية
  isActive: boolean('is_active').default(true),
  isTestMode: boolean('is_test_mode').default(true),
  supportedPaymentMethods: json('supported_payment_methods').default(JSON.stringify(['credit_card', 'debit_card', 'bank_transfer'])),
  
  // التتبع
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
}, (table) => ({
  bankCodeIdx: index('bank_code_idx').on(table.bankCode),
  isActiveIdx: index('is_active_idx').on(table.isActive),
}));

// ==================== معاملات الدفع ====================

export const paymentTransactions = mysqlTable('payment_transactions', {
  id: int('id').primaryKey().autoincrement(),
  transactionId: varchar('transaction_id', { length: 100 }).notNull().unique(),
  referenceNumber: varchar('reference_number', { length: 100 }).notNull().unique(),
  
  // معلومات الدفع
  userId: int('user_id').notNull().references(() => users.id),
  invoiceId: int('invoice_id').references(() => invoices.id),
  bankId: int('bank_id').notNull().references(() => supportedBanks.id),
  
  // المبالغ
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('JOD'),
  
  // حالة المعاملة
  status: mysqlEnum('status', [
    'pending',
    'processing',
    'authorized',
    'captured',
    'completed',
    'failed',
    'cancelled',
    'refunded',
    'disputed',
  ]).default('pending').notNull(),
  
  // طريقة الدفع
  paymentMethod: mysqlEnum('payment_method', [
    'credit_card',
    'debit_card',
    'bank_transfer',
    'mobile_wallet',
    'installment',
  ]).notNull(),
  
  // بيانات البطاقة (مشفرة)
  cardLastFour: varchar('card_last_four', { length: 4 }),
  cardBrand: varchar('card_brand', { length: 50 }),
  cardExpiryMonth: int('card_expiry_month'),
  cardExpiryYear: int('card_expiry_year'),
  
  // بيانات التحويل البنكي
  bankAccountNumber: varchar('bank_account_number', { length: 50 }),
  bankAccountName: varchar('bank_account_name', { length: 255 }),
  bankTransferReference: varchar('bank_transfer_reference', { length: 100 }),
  
  // معلومات المحفظة الرقمية
  walletProvider: varchar('wallet_provider', { length: 50 }),
  walletId: varchar('wallet_id', { length: 100 }),
  
  // معلومات التقسيط
  installmentPlan: varchar('installment_plan', { length: 50 }),
  installmentCount: int('installment_count'),
  installmentAmount: decimal('installment_amount', { precision: 12, scale: 2 }),
  
  // رموز الاستجابة
  authorizationCode: varchar('authorization_code', { length: 100 }),
  responseCode: varchar('response_code', { length: 50 }),
  responseMessage: text('response_message'),
  
  // التواريخ
  transactionDate: datetime('transaction_date').notNull(),
  authorizedDate: datetime('authorized_date'),
  capturedDate: datetime('captured_date'),
  completedDate: datetime('completed_date'),
  failedDate: datetime('failed_date'),
  refundedDate: datetime('refunded_date'),
  
  // معلومات إضافية
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  deviceId: varchar('device_id', { length: 100 }),
  metadata: json('metadata'),
  notes: text('notes'),
  
  // التتبع
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
  createdBy: int('created_by').notNull().references(() => users.id),
}, (table) => ({
  transactionIdIdx: index('transaction_id_idx').on(table.transactionId),
  referenceNumberIdx: index('reference_number_idx').on(table.referenceNumber),
  userIdIdx: index('user_id_idx').on(table.userId),
  invoiceIdIdx: index('invoice_id_idx').on(table.invoiceId),
  bankIdIdx: index('bank_id_idx').on(table.bankId),
  statusIdx: index('status_idx').on(table.status),
  transactionDateIdx: index('transaction_date_idx').on(table.transactionDate),
}));

// ==================== المبالغ المستردة ====================

export const refunds = mysqlTable('refunds', {
  id: int('id').primaryKey().autoincrement(),
  refundId: varchar('refund_id', { length: 100 }).notNull().unique(),
  transactionId: int('transaction_id').notNull().references(() => paymentTransactions.id),
  
  // معلومات الاسترجاع
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('JOD'),
  reason: mysqlEnum('reason', [
    'customer_request',
    'duplicate_charge',
    'fraudulent',
    'product_not_received',
    'product_defective',
    'service_not_provided',
    'other',
  ]).notNull(),
  
  // حالة الاسترجاع
  status: mysqlEnum('status', [
    'pending',
    'processing',
    'completed',
    'failed',
    'rejected',
  ]).default('pending').notNull(),
  
  // معلومات المعالجة
  requestedDate: datetime('requested_date').notNull(),
  processedDate: datetime('processed_date'),
  completedDate: datetime('completed_date'),
  
  // بيانات إضافية
  description: text('description'),
  notes: text('notes'),
  metadata: json('metadata'),
  
  // التتبع
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
  createdBy: int('created_by').notNull().references(() => users.id),
}, (table) => ({
  refundIdIdx: index('refund_id_idx').on(table.refundId),
  transactionIdIdx: index('transaction_id_idx').on(table.transactionId),
  statusIdx: index('status_idx').on(table.status),
}));

// ==================== سجل المحاولات ====================

export const paymentAttempts = mysqlTable('payment_attempts', {
  id: int('id').primaryKey().autoincrement(),
  attemptId: varchar('attempt_id', { length: 100 }).notNull().unique(),
  
  // معلومات المحاولة
  userId: int('user_id').notNull().references(() => users.id),
  invoiceId: int('invoice_id').references(() => invoices.id),
  bankId: int('bank_id').notNull().references(() => supportedBanks.id),
  
  // بيانات المحاولة
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('JOD'),
  
  // حالة المحاولة
  status: mysqlEnum('status', [
    'initiated',
    'redirected',
    'submitted',
    'completed',
    'failed',
    'cancelled',
  ]).default('initiated').notNull(),
  
  // معلومات الخطأ
  errorCode: varchar('error_code', { length: 50 }),
  errorMessage: text('error_message'),
  
  // معلومات الجلسة
  sessionId: varchar('session_id', { length: 100 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  
  // التتبع
  attemptedAt: datetime('attempted_at').notNull(),
  completedAt: datetime('completed_at'),
  createdAt: datetime('created_at').notNull(),
}, (table) => ({
  attemptIdIdx: index('attempt_id_idx').on(table.attemptId),
  userIdIdx: index('user_id_idx').on(table.userId),
  invoiceIdIdx: index('invoice_id_idx').on(table.invoiceId),
  statusIdx: index('status_idx').on(table.status),
}));

// ==================== الفواتير المعلقة ====================

export const pendingPayments = mysqlTable('pending_payments', {
  id: int('id').primaryKey().autoincrement(),
  invoiceId: int('invoice_id').notNull().references(() => invoices.id).unique(),
  userId: int('user_id').notNull().references(() => users.id),
  
  // معلومات الدفع
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('JOD'),
  
  // حالة الانتظار
  status: mysqlEnum('status', [
    'awaiting_payment',
    'payment_initiated',
    'payment_processing',
    'payment_failed',
    'payment_cancelled',
  ]).default('awaiting_payment').notNull(),
  
  // تواريخ الاستحقاق
  dueDate: datetime('due_date').notNull(),
  reminderSentDate: datetime('reminder_sent_date'),
  overdueDate: datetime('overdue_date'),
  
  // معلومات إضافية
  reminderCount: int('reminder_count').default(0),
  lastReminderDate: datetime('last_reminder_date'),
  notes: text('notes'),
  
  // التتبع
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
}, (table) => ({
  invoiceIdIdx: index('invoice_id_idx').on(table.invoiceId),
  userIdIdx: index('user_id_idx').on(table.userId),
  statusIdx: index('status_idx').on(table.status),
  dueDateIdx: index('due_date_idx').on(table.dueDate),
}));

// ==================== إعدادات الدفع ====================

export const paymentSettings = mysqlTable('payment_settings', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id).unique(),
  
  // البنوك المفضلة
  preferredBanks: json('preferred_banks').default(JSON.stringify([])),
  
  // إعدادات التنبيهات
  enablePaymentNotifications: boolean('enable_payment_notifications').default(true),
  enableEmailNotifications: boolean('enable_email_notifications').default(true),
  enableSmsNotifications: boolean('enable_sms_notifications').default(false),
  
  // إعدادات الأمان
  enableTwoFactorAuth: boolean('enable_two_factor_auth').default(false),
  enableBiometricAuth: boolean('enable_biometric_auth').default(false),
  
  // حدود المعاملات
  dailyTransactionLimit: decimal('daily_transaction_limit', { precision: 12, scale: 2 }).default('100000'),
  monthlyTransactionLimit: decimal('monthly_transaction_limit', { precision: 12, scale: 2 }).default('500000'),
  
  // إعدادات التقسيط
  enableInstallments: boolean('enable_installments').default(true),
  maxInstallmentMonths: int('max_installment_months').default(12),
  
  // التتبع
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
});

// ==================== سجل التدقيق ====================

export const paymentAuditLog = mysqlTable('payment_audit_log', {
  id: int('id').primaryKey().autoincrement(),
  logId: varchar('log_id', { length: 100 }).notNull().unique(),
  
  // معلومات الإجراء
  action: varchar('action', { length: 100 }).notNull(),
  description: text('description').notNull(),
  
  // المرجع
  transactionId: int('transaction_id').references(() => paymentTransactions.id),
  refundId: int('refund_id').references(() => refunds.id),
  
  // معلومات المستخدم
  userId: int('user_id').notNull().references(() => users.id),
  performedBy: int('performed_by').references(() => users.id),
  
  // التفاصيل
  details: json('details'),
  metadata: json('metadata'),
  
  // معلومات الوصول
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  
  // التتبع
  createdAt: datetime('created_at').notNull(),
}, (table) => ({
  logIdIdx: index('log_id_idx').on(table.logId),
  transactionIdIdx: index('transaction_id_idx').on(table.transactionId),
  userIdIdx: index('user_id_idx').on(table.userId),
  actionIdx: index('action_idx').on(table.action),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
}));

// ==================== العلاقات ====================

export const supportedBanksRelations = relations(supportedBanks, ({ many }) => ({
  transactions: many(paymentTransactions),
  attempts: many(paymentAttempts),
}));

export const paymentTransactionsRelations = relations(paymentTransactions, ({ one, many }) => ({
  user: one(users, {
    fields: [paymentTransactions.userId],
    references: [users.id],
  }),
  invoice: one(invoices, {
    fields: [paymentTransactions.invoiceId],
    references: [invoices.id],
  }),
  bank: one(supportedBanks, {
    fields: [paymentTransactions.bankId],
    references: [supportedBanks.id],
  }),
  refunds: many(refunds),
  auditLogs: many(paymentAuditLog),
}));

export const refundsRelations = relations(refunds, ({ one }) => ({
  transaction: one(paymentTransactions, {
    fields: [refunds.transactionId],
    references: [paymentTransactions.id],
  }),
  createdByUser: one(users, {
    fields: [refunds.createdBy],
    references: [users.id],
  }),
}));

export const paymentAttemptsRelations = relations(paymentAttempts, ({ one }) => ({
  user: one(users, {
    fields: [paymentAttempts.userId],
    references: [users.id],
  }),
  invoice: one(invoices, {
    fields: [paymentAttempts.invoiceId],
    references: [invoices.id],
  }),
  bank: one(supportedBanks, {
    fields: [paymentAttempts.bankId],
    references: [supportedBanks.id],
  }),
}));

export const pendingPaymentsRelations = relations(pendingPayments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [pendingPayments.invoiceId],
    references: [invoices.id],
  }),
  user: one(users, {
    fields: [pendingPayments.userId],
    references: [users.id],
  }),
}));

export const paymentSettingsRelations = relations(paymentSettings, ({ one }) => ({
  user: one(users, {
    fields: [paymentSettings.userId],
    references: [users.id],
  }),
}));

export const paymentAuditLogRelations = relations(paymentAuditLog, ({ one }) => ({
  transaction: one(paymentTransactions, {
    fields: [paymentAuditLog.transactionId],
    references: [paymentTransactions.id],
  }),
  refund: one(refunds, {
    fields: [paymentAuditLog.refundId],
    references: [refunds.id],
  }),
  user: one(users, {
    fields: [paymentAuditLog.userId],
    references: [users.id],
  }),
  performer: one(users, {
    fields: [paymentAuditLog.performedBy],
    references: [users.id],
  }),
}));

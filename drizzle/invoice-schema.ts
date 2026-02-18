import { mysqlTable, varchar, int, decimal, datetime, text, boolean, json, index, unique, mysqlEnum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { users } from './schema';

/**
 * نظام الفواتير الإلكترونية المتقدم
 * Advanced Electronic Invoicing System
 */

// ==================== الفواتير الرئيسية ====================

export const invoices = mysqlTable('invoices', {
  id: int('id').primaryKey().autoincrement(),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),
  invoiceDate: datetime('invoice_date').notNull(),
  dueDate: datetime('due_date').notNull(),
  
  // معلومات المرسل والمستقبل
  senderId: int('sender_id').notNull().references(() => users.id),
  recipientName: varchar('recipient_name', { length: 255 }).notNull(),
  recipientEmail: varchar('recipient_email', { length: 255 }).notNull(),
  recipientPhone: varchar('recipient_phone', { length: 20 }),
  recipientAddress: text('recipient_address'),
  
  // معلومات الفاتورة
  description: text('description'),
  status: mysqlEnum('status', ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled']).default('draft').notNull(),
  paymentStatus: mysqlEnum('payment_status', ['unpaid', 'partial', 'paid', 'refunded']).default('unpaid').notNull(),
  
  // الأسعار والضرائب
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  customsDuties: decimal('customs_duties', { precision: 12, scale: 2 }).notNull().default('0'),
  shippingCost: decimal('shipping_cost', { precision: 12, scale: 2 }).notNull().default('0'),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  
  // معلومات الدفع
  paymentMethod: mysqlEnum('payment_method', ['bank_transfer', 'credit_card', 'paypal', 'check', 'cash', 'other']).default('bank_transfer'),
  paymentDate: datetime('payment_date'),
  
  // معلومات الشحنة
  shippingNumber: varchar('shipping_number', { length: 100 }),
  trackingNumber: varchar('tracking_number', { length: 100 }),
  
  // التوقيع الرقمي
  digitalSignature: text('digital_signature'),
  signatureDate: datetime('signature_date'),
  signatureAlgorithm: varchar('signature_algorithm', { length: 50 }),
  
  // الأرشفة والنسخ الاحتياطي
  isArchived: boolean('is_archived').default(false),
  archiveDate: datetime('archive_date'),
  backupLocation: varchar('backup_location', { length: 255 }),
  
  // بيانات إضافية
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  customMetadata: json('custom_metadata'),
  
  // التتبع والتدقيق
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
  createdBy: int('created_by').notNull().references(() => users.id),
  updatedBy: int('updated_by').references(() => users.id),
  
  // الحذف المنطقي
  deletedAt: datetime('deleted_at'),
}, (table) => ({
  invoiceNumberIdx: index('invoice_number_idx').on(table.invoiceNumber),
  senderIdIdx: index('sender_id_idx').on(table.senderId),
  statusIdx: index('status_idx').on(table.status),
  paymentStatusIdx: index('payment_status_idx').on(table.paymentStatus),
  invoiceDateIdx: index('invoice_date_idx').on(table.invoiceDate),
  dueDateIdx: index('due_date_idx').on(table.dueDate),
}));

// ==================== عناصر الفاتورة ====================

export const invoiceItems = mysqlTable('invoice_items', {
  id: int('id').primaryKey().autoincrement(),
  invoiceId: int('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  
  // معلومات العنصر
  itemNumber: int('item_number').notNull(),
  description: text('description').notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 50 }).notNull(),
  unitPrice: decimal('unit_price', { precision: 12, scale: 2 }).notNull(),
  
  // الحسابات
  lineTotal: decimal('line_total', { precision: 12, scale: 2 }).notNull(),
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0'),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0'),
  discountRate: decimal('discount_rate', { precision: 5, scale: 2 }).default('0'),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0'),
  
  // معلومات الجمارك
  hsCode: varchar('hs_code', { length: 20 }),
  customsDutyRate: decimal('customs_duty_rate', { precision: 5, scale: 2 }).default('0'),
  customsDutyAmount: decimal('customs_duty_amount', { precision: 12, scale: 2 }).default('0'),
  
  // معلومات إضافية
  sku: varchar('sku', { length: 100 }),
  category: varchar('category', { length: 100 }),
  notes: text('notes'),
  
  // التتبع
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
}, (table) => ({
  invoiceIdIdx: index('invoice_id_idx').on(table.invoiceId),
}));

// ==================== قوالب الفواتير ====================

export const invoiceTemplates = mysqlTable('invoice_templates', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id),
  
  // معلومات القالب
  templateName: varchar('template_name', { length: 255 }).notNull(),
  description: text('description'),
  isDefault: boolean('is_default').default(false),
  
  // تخطيط القالب
  templateHtml: text('template_html').notNull(),
  templateCss: text('template_css'),
  logoUrl: varchar('logo_url', { length: 255 }),
  
  // إعدادات الفاتورة
  defaultTaxRate: decimal('default_tax_rate', { precision: 5, scale: 2 }).default('0'),
  defaultPaymentTerms: int('default_payment_terms').default(30),
  defaultCurrency: varchar('default_currency', { length: 3 }).default('JOD'),
  
  // الألوان والخطوط
  primaryColor: varchar('primary_color', { length: 7 }),
  secondaryColor: varchar('secondary_color', { length: 7 }),
  fontFamily: varchar('font_family', { length: 100 }),
  
  // معلومات الشركة
  companyName: varchar('company_name', { length: 255 }),
  companyEmail: varchar('company_email', { length: 255 }),
  companyPhone: varchar('company_phone', { length: 20 }),
  companyAddress: text('company_address'),
  companyLicense: varchar('company_license', { length: 100 }),
  
  // التتبع
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  isDefaultIdx: index('is_default_idx').on(table.isDefault),
}));

// ==================== التوقيعات الرقمية ====================

export const digitalSignatures = mysqlTable('digital_signatures', {
  id: int('id').primaryKey().autoincrement(),
  invoiceId: int('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  userId: int('user_id').notNull().references(() => users.id),
  
  // معلومات التوقيع
  signatureValue: text('signature_value').notNull(),
  signatureAlgorithm: varchar('signature_algorithm', { length: 50 }).notNull(),
  certificateChain: text('certificate_chain'),
  
  // معلومات التوقيع الزمنية
  signedAt: datetime('signed_at').notNull(),
  expiresAt: datetime('expires_at'),
  
  // التحقق من الصحة
  isValid: boolean('is_valid').default(true),
  validationStatus: mysqlEnum('validation_status', ['valid', 'invalid', 'expired', 'revoked']).default('valid'),
  
  // معلومات المُوقّع
  signerName: varchar('signer_name', { length: 255 }).notNull(),
  signerEmail: varchar('signer_email', { length: 255 }).notNull(),
  signerTitle: varchar('signer_title', { length: 100 }),
  
  // التتبع
  createdAt: datetime('created_at').notNull(),
}, (table) => ({
  invoiceIdIdx: index('invoice_id_idx').on(table.invoiceId),
  userIdIdx: index('user_id_idx').on(table.userId),
}));

// ==================== الأرشفة الآمنة ====================

export const invoiceArchive = mysqlTable('invoice_archive', {
  id: int('id').primaryKey().autoincrement(),
  invoiceId: int('invoice_id').notNull().references(() => invoices.id),
  
  // معلومات الأرشفة
  archiveDate: datetime('archive_date').notNull(),
  archiveReason: varchar('archive_reason', { length: 255 }),
  archiveLocation: varchar('archive_location', { length: 255 }).notNull(),
  
  // التشفير والأمان
  encryptionMethod: varchar('encryption_method', { length: 50 }).notNull(),
  encryptionKey: text('encryption_key').notNull(),
  checksum: varchar('checksum', { length: 255 }).notNull(),
  
  // النسخ الاحتياطية
  backupLocation1: varchar('backup_location_1', { length: 255 }),
  backupLocation2: varchar('backup_location_2', { length: 255 }),
  backupLocation3: varchar('backup_location_3', { length: 255 }),
  
  // معلومات الاسترجاع
  canRestore: boolean('can_restore').default(true),
  restoreCount: int('restore_count').default(0),
  lastRestoreDate: datetime('last_restore_date'),
  
  // التتبع
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
}, (table) => ({
  invoiceIdIdx: index('invoice_id_idx').on(table.invoiceId),
  archiveDateIdx: index('archive_date_idx').on(table.archiveDate),
}));

// ==================== سجل التدقيق ====================

export const invoiceAuditLog = mysqlTable('invoice_audit_log', {
  id: int('id').primaryKey().autoincrement(),
  invoiceId: int('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  userId: int('user_id').notNull().references(() => users.id),
  
  // معلومات الإجراء
  action: mysqlEnum('action', ['created', 'updated', 'sent', 'viewed', 'paid', 'archived', 'restored', 'deleted', 'signed']).notNull(),
  description: text('description'),
  
  // البيانات القديمة والجديدة
  oldData: json('old_data'),
  newData: json('new_data'),
  
  // معلومات الوصول
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  
  // التتبع
  createdAt: datetime('created_at').notNull(),
}, (table) => ({
  invoiceIdIdx: index('invoice_id_idx').on(table.invoiceId),
  userIdIdx: index('user_id_idx').on(table.userId),
  actionIdx: index('action_idx').on(table.action),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
}));

// ==================== إعدادات الفواتير ====================

export const invoiceSettings = mysqlTable('invoice_settings', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().unique().references(() => users.id),
  
  // إعدادات الترقيم
  invoicePrefix: varchar('invoice_prefix', { length: 20 }).default('INV'),
  invoiceStartNumber: int('invoice_start_number').default(1001),
  invoiceNextNumber: int('invoice_next_number').default(1001),
  
  // إعدادات الضرائب
  defaultTaxRate: decimal('default_tax_rate', { precision: 5, scale: 2 }).default('0'),
  enableCustomsDuties: boolean('enable_customs_duties').default(true),
  customsDutyRate: decimal('customs_duty_rate', { precision: 5, scale: 2 }).default('0'),
  
  // إعدادات الدفع
  defaultPaymentTerms: int('default_payment_terms').default(30),
  defaultCurrency: varchar('default_currency', { length: 3 }).default('JOD'),
  enableRecurringInvoices: boolean('enable_recurring_invoices').default(true),
  
  // إعدادات البريد الإلكتروني
  enableEmailNotifications: boolean('enable_email_notifications').default(true),
  emailTemplate: varchar('email_template', { length: 100 }),
  
  // إعدادات التوقيع الرقمي
  enableDigitalSignature: boolean('enable_digital_signature').default(true),
  signatureAlgorithm: varchar('signature_algorithm', { length: 50 }).default('RSA-SHA256'),
  
  // إعدادات الأرشفة
  enableArchiving: boolean('enable_archiving').default(true),
  archiveAfterDays: int('archive_after_days').default(365),
  encryptionMethod: varchar('encryption_method', { length: 50 }).default('AES-256'),
  
  // التتبع
  createdAt: datetime('created_at').notNull(),
  updatedAt: datetime('updated_at').notNull(),
});

// ==================== العلاقات ====================

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  sender: one(users, {
    fields: [invoices.senderId],
    references: [users.id],
  }),
  items: many(invoiceItems),
  signature: one(digitalSignatures),
  archive: one(invoiceArchive),
  auditLogs: many(invoiceAuditLog),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const invoiceTemplatesRelations = relations(invoiceTemplates, ({ one }) => ({
  user: one(users, {
    fields: [invoiceTemplates.userId],
    references: [users.id],
  }),
}));

export const digitalSignaturesRelations = relations(digitalSignatures, ({ one }) => ({
  invoice: one(invoices, {
    fields: [digitalSignatures.invoiceId],
    references: [invoices.id],
  }),
  user: one(users, {
    fields: [digitalSignatures.userId],
    references: [users.id],
  }),
}));

export const invoiceArchiveRelations = relations(invoiceArchive, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceArchive.invoiceId],
    references: [invoices.id],
  }),
}));

export const invoiceAuditLogRelations = relations(invoiceAuditLog, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceAuditLog.invoiceId],
    references: [invoices.id],
  }),
  user: one(users, {
    fields: [invoiceAuditLog.userId],
    references: [users.id],
  }),
}));

export const invoiceSettingsRelations = relations(invoiceSettings, ({ one }) => ({
  user: one(users, {
    fields: [invoiceSettings.userId],
    references: [users.id],
  }),
}));

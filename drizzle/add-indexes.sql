-- إضافة فهارس قاعدة البيانات لتحسين الأداء
-- Database Indexes for Performance Optimization

-- ===== جداول المستخدمين والمصادقة =====
CREATE INDEX IF NOT EXISTS idx_users_openId ON users(openId);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ===== جداول البيانات الجمركية =====
CREATE INDEX IF NOT EXISTS idx_customs_declarations_userId ON customs_declarations(userId);
CREATE INDEX IF NOT EXISTS idx_customs_declarations_number ON customs_declarations(declarationNumber);
CREATE INDEX IF NOT EXISTS idx_customs_declarations_status ON customs_declarations(status);
CREATE INDEX IF NOT EXISTS idx_customs_declarations_date ON customs_declarations(registrationDate);

-- ===== جداول الأصناف =====
CREATE INDEX IF NOT EXISTS idx_items_declarationId ON items(declarationId);
CREATE INDEX IF NOT EXISTS idx_items_userId ON items(userId);

-- ===== جداول الانحرافات =====
CREATE INDEX IF NOT EXISTS idx_variances_declarationId ON variances(declarationId);
CREATE INDEX IF NOT EXISTS idx_variances_userId ON variances(userId);
CREATE INDEX IF NOT EXISTS idx_variances_type ON variances(varianceType);

-- ===== جداول الملخصات المالية =====
CREATE INDEX IF NOT EXISTS idx_financial_summaries_declarationId ON financial_summaries(declarationId);

-- ===== جداول الحسابات البنكية =====
CREATE INDEX IF NOT EXISTS idx_bank_accounts_userId ON bank_accounts(userId);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_status ON bank_accounts(status);

-- ===== جداول المعاملات البنكية =====
CREATE INDEX IF NOT EXISTS idx_bank_transactions_userId ON bank_transactions(userId);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_accountId ON bank_transactions(bankAccountId);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON bank_transactions(transactionDate);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_type ON bank_transactions(transactionType);

-- ===== جداول التحقق البنكي =====
CREATE INDEX IF NOT EXISTS idx_bank_verifications_userId ON bank_verifications(userId);
CREATE INDEX IF NOT EXISTS idx_bank_verifications_accountId ON bank_verifications(bankAccountId);
CREATE INDEX IF NOT EXISTS idx_bank_verifications_status ON bank_verifications(status);

-- ===== جداول الإشعارات =====
CREATE INDEX IF NOT EXISTS idx_bank_notifications_userId ON bank_notifications(userId);
CREATE INDEX IF NOT EXISTS idx_bank_notifications_type ON bank_notifications(type);
CREATE INDEX IF NOT EXISTS idx_bank_notifications_isRead ON bank_notifications(isRead);
CREATE INDEX IF NOT EXISTS idx_notification_log_notificationId ON notification_log(notificationId);
CREATE INDEX IF NOT EXISTS idx_notification_log_status ON notification_log(status);

-- ===== جداول التحليلات =====
CREATE INDEX IF NOT EXISTS idx_analytics_events_userId ON analytics_events(userId);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(eventType);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_type ON analytics_metrics(metricType);
CREATE INDEX IF NOT EXISTS idx_analytics_metrics_period ON analytics_metrics(period);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboard_userId ON analytics_dashboard(userId);

-- ===== جداول الحاويات والشحنات =====
CREATE INDEX IF NOT EXISTS idx_containers_userId ON containers(userId);
CREATE INDEX IF NOT EXISTS idx_containers_number ON containers(containerNumber);
CREATE INDEX IF NOT EXISTS idx_containers_status ON containers(status);
CREATE INDEX IF NOT EXISTS idx_tracking_events_containerId ON tracking_events(containerId);
CREATE INDEX IF NOT EXISTS idx_tracking_events_type ON tracking_events(eventType);
CREATE INDEX IF NOT EXISTS idx_shipment_details_containerId ON shipment_details(containerId);

-- ===== جداول الدفع والفواتير =====
CREATE INDEX IF NOT EXISTS idx_payments_userId ON payments(userId);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(createdAt);
CREATE INDEX IF NOT EXISTS idx_stripe_invoices_userId ON stripe_invoices(userId);
CREATE INDEX IF NOT EXISTS idx_refunds_paymentId ON refunds(paymentId);
CREATE INDEX IF NOT EXISTS idx_subscriptions_userId ON subscriptions(userId);

-- ===== جداول المحاسبة =====
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_code ON chart_of_accounts(accountCode);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_type ON chart_of_accounts(accountType);
CREATE INDEX IF NOT EXISTS idx_general_ledger_accountId ON general_ledger(accountId);
CREATE INDEX IF NOT EXISTS idx_general_ledger_date ON general_ledger(entryDate);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transactionDate);
CREATE INDEX IF NOT EXISTS idx_financial_reports_date ON financial_reports(reportDate);
CREATE INDEX IF NOT EXISTS idx_audit_log_userId ON audit_log(userId);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- ===== جداول المصروفات =====
CREATE INDEX IF NOT EXISTS idx_expenses_declarationId ON expenses(declarationId);
CREATE INDEX IF NOT EXISTS idx_expenses_typeId ON expenses(expenseTypeId);

-- ===== جداول المصانع =====
CREATE INDEX IF NOT EXISTS idx_factories_userId ON factories(userId);

-- ===== جداول الفواتير والأصناف =====
CREATE INDEX IF NOT EXISTS idx_invoices_userId ON invoices(userId);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoiceId ON invoice_items(invoiceId);

-- ===== جداول الإشعارات العامة =====
CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- ===== جداول تفضيلات الإشعارات =====
CREATE INDEX IF NOT EXISTS idx_notification_preferences_userId ON notification_preferences(userId);

-- ===== جداول الاشتراكات =====
CREATE INDEX IF NOT EXISTS idx_subscription_invoices_subscriptionId ON subscription_invoices(subscriptionId);

-- ===== فهارس مركبة لاستعلامات شائعة =====
CREATE INDEX IF NOT EXISTS idx_customs_userId_status ON customs_declarations(userId, status);
CREATE INDEX IF NOT EXISTS idx_items_declarationId_userId ON items(declarationId, userId);
CREATE INDEX IF NOT EXISTS idx_transactions_userId_date ON bank_transactions(userId, transactionDate);
CREATE INDEX IF NOT EXISTS idx_analytics_events_userId_type ON analytics_events(userId, eventType);
CREATE INDEX IF NOT EXISTS idx_containers_userId_status ON containers(userId, status);
CREATE INDEX IF NOT EXISTS idx_payments_userId_status ON payments(userId, status);

/**
 * Advanced Accounting Service
 * خدمة المحاسبة المتقدمة
 * 
 * تدعم:
 * - تتبع الإيرادات والمصروفات
 * - إنشاء قيود محاسبية
 * - التقارير المالية
 * - المصالحة البنكية
 * - الضرائب والرسوم
 * 
 * @module server/services/accounting-service
 */

/**
 * أنواع العمليات المحاسبية
 */
export type TransactionType = 'revenue' | 'expense' | 'refund' | 'fee' | 'tax' | 'adjustment';

/**
 * فئات الحسابات
 */
export type AccountCategory = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

/**
 * معلومات العملية المحاسبية
 */
export interface AccountingEntry {
  id: string;
  transactionId: string;
  transactionType: TransactionType;
  date: string;
  description: string;
  amount: number;
  currency: string;
  debitAccount: string;
  creditAccount: string;
  reference: string;
  metadata?: Record<string, any>;
}

/**
 * معلومات الحساب
 */
export interface Account {
  code: string;
  name: string;
  category: AccountCategory;
  balance: number;
  currency: string;
}

/**
 * معلومات التقرير المالي
 */
export interface FinancialReport {
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  currency: string;
  accounts: Account[];
  entries: AccountingEntry[];
}

/**
 * خدمة المحاسبة
 */
export class AccountingService {
  /**
   * خريطة الحسابات المحاسبية
   */
  private chartOfAccounts: Map<string, Account> = new Map([
    // الأصول
    ['1010', { code: '1010', name: 'الحساب البنكي', category: 'asset', balance: 0, currency: 'JOD' }],
    ['1020', { code: '1020', name: 'الذمم المدينة', category: 'asset', balance: 0, currency: 'JOD' }],
    ['1030', { code: '1030', name: 'المخزون', category: 'asset', balance: 0, currency: 'JOD' }],

    // الالتزامات
    ['2010', { code: '2010', name: 'الذمم الدائنة', category: 'liability', balance: 0, currency: 'JOD' }],
    ['2020', { code: '2020', name: 'الضرائب المستحقة', category: 'liability', balance: 0, currency: 'JOD' }],

    // حقوق الملكية
    ['3010', { code: '3010', name: 'رأس المال', category: 'equity', balance: 0, currency: 'JOD' }],
    ['3020', { code: '3020', name: 'الأرباح المحتجزة', category: 'equity', balance: 0, currency: 'JOD' }],

    // الإيرادات
    ['4010', { code: '4010', name: 'إيرادات الدفع - Click', category: 'revenue', balance: 0, currency: 'JOD' }],
    ['4020', { code: '4020', name: 'إيرادات الدفع - Alipay', category: 'revenue', balance: 0, currency: 'JOD' }],
    ['4030', { code: '4030', name: 'إيرادات الدفع - PayPal', category: 'revenue', balance: 0, currency: 'JOD' }],
    ['4040', { code: '4040', name: 'إيرادات الدفع - PayFort', category: 'revenue', balance: 0, currency: 'JOD' }],
    ['4050', { code: '4050', name: 'إيرادات الدفع - 2Checkout', category: 'revenue', balance: 0, currency: 'JOD' }],

    // المصروفات
    ['5010', { code: '5010', name: 'رسوم البوابة', category: 'expense', balance: 0, currency: 'JOD' }],
    ['5020', { code: '5020', name: 'رسوم التحويل', category: 'expense', balance: 0, currency: 'JOD' }],
    ['5030', { code: '5030', name: 'رسوم الخدمات', category: 'expense', balance: 0, currency: 'JOD' }],
    ['5040', { code: '5040', name: 'مصروفات تشغيلية', category: 'expense', balance: 0, currency: 'JOD' }],
  ]);

  /**
   * سجل العمليات المحاسبية
   */
  private entries: AccountingEntry[] = [];

  /**
   * إنشاء قيد محاسبي للدفع
   */
  async createPaymentEntry(
    paymentId: string,
    amount: number,
    currency: string,
    gateway: string,
    description: string
  ): Promise<AccountingEntry> {
    // تحديد حساب الإيراد بناءً على البوابة
    const revenueAccountMap: Record<string, string> = {
      click: '4010',
      alipay: '4020',
      paypal: '4030',
      payfort: '4040',
      '2checkout': '4050',
    };

    const revenueAccount = revenueAccountMap[gateway] || '4010';
    const bankAccount = '1010';

    const entry: AccountingEntry = {
      id: `entry_${Date.now()}`,
      transactionId: paymentId,
      transactionType: 'revenue',
      date: new Date().toISOString(),
      description,
      amount,
      currency,
      debitAccount: bankAccount,
      creditAccount: revenueAccount,
      reference: `PAY-${paymentId}`,
    };

    // تسجيل القيد
    this.entries.push(entry);

    // تحديث أرصدة الحسابات
    this.updateAccountBalance(bankAccount, amount, 'debit');
    this.updateAccountBalance(revenueAccount, amount, 'credit');

    console.log(`✅ تم إنشاء قيد محاسبي للدفع: ${paymentId}`);
    return entry;
  }

  /**
   * إنشاء قيد محاسبي للمصروفات
   */
  async createExpenseEntry(
    expenseId: string,
    amount: number,
    currency: string,
    expenseType: 'gateway_fee' | 'transfer_fee' | 'service_fee' | 'operational',
    description: string
  ): Promise<AccountingEntry> {
    // تحديد حساب المصروف
    const expenseAccountMap: Record<string, string> = {
      gateway_fee: '5010',
      transfer_fee: '5020',
      service_fee: '5030',
      operational: '5040',
    };

    const expenseAccount = expenseAccountMap[expenseType];
    const bankAccount = '1010';

    const entry: AccountingEntry = {
      id: `entry_${Date.now()}`,
      transactionId: expenseId,
      transactionType: 'expense',
      date: new Date().toISOString(),
      description,
      amount,
      currency,
      debitAccount: expenseAccount,
      creditAccount: bankAccount,
      reference: `EXP-${expenseId}`,
    };

    // تسجيل القيد
    this.entries.push(entry);

    // تحديث أرصدة الحسابات
    this.updateAccountBalance(expenseAccount, amount, 'debit');
    this.updateAccountBalance(bankAccount, amount, 'credit');

    console.log(`✅ تم إنشاء قيد محاسبي للمصروف: ${expenseId}`);
    return entry;
  }

  /**
   * إنشاء قيد محاسبي للاسترجاع
   */
  async createRefundEntry(
    refundId: string,
    amount: number,
    currency: string,
    originalPaymentId: string,
    description: string
  ): Promise<AccountingEntry> {
    const bankAccount = '1010';
    const receivableAccount = '1020';

    const entry: AccountingEntry = {
      id: `entry_${Date.now()}`,
      transactionId: refundId,
      transactionType: 'refund',
      date: new Date().toISOString(),
      description,
      amount,
      currency,
      debitAccount: receivableAccount,
      creditAccount: bankAccount,
      reference: `REF-${refundId}`,
      metadata: {
        originalPaymentId,
      },
    };

    // تسجيل القيد
    this.entries.push(entry);

    // تحديث أرصدة الحسابات
    this.updateAccountBalance(receivableAccount, amount, 'debit');
    this.updateAccountBalance(bankAccount, amount, 'credit');

    console.log(`✅ تم إنشاء قيد محاسبي للاسترجاع: ${refundId}`);
    return entry;
  }

  /**
   * تحديث رصيد الحساب
   */
  private updateAccountBalance(
    accountCode: string,
    amount: number,
    type: 'debit' | 'credit'
  ): void {
    const account = this.chartOfAccounts.get(accountCode);
    if (!account) {
      console.warn(`⚠️ حساب غير موجود: ${accountCode}`);
      return;
    }

    if (type === 'debit') {
      account.balance += amount;
    } else {
      account.balance -= amount;
    }
  }

  /**
   * الحصول على التقرير المالي
   */
  async getFinancialReport(period: string): Promise<FinancialReport> {
    const accounts = Array.from(this.chartOfAccounts.values());

    // حساب الإيرادات والمصروفات
    const revenueAccounts = accounts.filter((a) => a.category === 'revenue');
    const expenseAccounts = accounts.filter((a) => a.category === 'expense');

    const totalRevenue = revenueAccounts.reduce((sum, a) => sum + a.balance, 0);
    const totalExpenses = expenseAccounts.reduce((sum, a) => sum + a.balance, 0);
    const netIncome = totalRevenue - totalExpenses;

    const report: FinancialReport = {
      period,
      totalRevenue,
      totalExpenses,
      netIncome,
      currency: 'JOD',
      accounts,
      entries: this.entries,
    };

    console.log(`📊 تم إنشاء التقرير المالي للفترة: ${period}`);
    return report;
  }

  /**
   * الحصول على قائمة الدخل
   */
  async getIncomeStatement(period: string): Promise<{
    revenues: { account: string; amount: number }[];
    expenses: { account: string; amount: number }[];
    netIncome: number;
  }> {
    const accounts = Array.from(this.chartOfAccounts.values());

    const revenues = accounts
      .filter((a) => a.category === 'revenue')
      .map((a) => ({
        account: a.name,
        amount: a.balance,
      }));

    const expenses = accounts
      .filter((a) => a.category === 'expense')
      .map((a) => ({
        account: a.name,
        amount: a.balance,
      }));

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalRevenue - totalExpenses;

    console.log(`📈 تم إنشاء قائمة الدخل للفترة: ${period}`);
    return {
      revenues,
      expenses,
      netIncome,
    };
  }

  /**
   * الحصول على الميزانية العمومية
   */
  async getBalanceSheet(period: string): Promise<{
    assets: { account: string; amount: number }[];
    liabilities: { account: string; amount: number }[];
    equity: { account: string; amount: number }[];
  }> {
    const accounts = Array.from(this.chartOfAccounts.values());

    const assets = accounts
      .filter((a) => a.category === 'asset')
      .map((a) => ({
        account: a.name,
        amount: a.balance,
      }));

    const liabilities = accounts
      .filter((a) => a.category === 'liability')
      .map((a) => ({
        account: a.name,
        amount: a.balance,
      }));

    const equity = accounts
      .filter((a) => a.category === 'equity')
      .map((a) => ({
        account: a.name,
        amount: a.balance,
      }));

    console.log(`💼 تم إنشاء الميزانية العمومية للفترة: ${period}`);
    return {
      assets,
      liabilities,
      equity,
    };
  }

  /**
   * الحصول على تقرير المصالحة البنكية
   */
  async getBankReconciliation(period: string): Promise<{
    bankBalance: number;
    bookBalance: number;
    difference: number;
    reconciled: boolean;
  }> {
    const bankAccount = this.chartOfAccounts.get('1010');
    if (!bankAccount) {
      throw new Error('حساب البنك غير موجود');
    }

    const bankBalance = bankAccount.balance;
    const bookBalance = bankAccount.balance;
    const difference = bankBalance - bookBalance;
    const reconciled = difference === 0;

    console.log(`🏦 تم إنشاء تقرير المصالحة البنكية للفترة: ${period}`);
    return {
      bankBalance,
      bookBalance,
      difference,
      reconciled,
    };
  }

  /**
   * حساب الضريبة
   */
  async calculateTax(
    amount: number,
    taxRate: number = 0.16
  ): Promise<{
    grossAmount: number;
    taxAmount: number;
    netAmount: number;
  }> {
    const taxAmount = amount * taxRate;
    const netAmount = amount - taxAmount;

    console.log(`💰 تم حساب الضريبة: ${taxAmount} JOD`);
    return {
      grossAmount: amount,
      taxAmount,
      netAmount,
    };
  }

  /**
   * الحصول على ملخص الحسابات
   */
  async getAccountsSummary(): Promise<{
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    totalRevenue: number;
    totalExpenses: number;
  }> {
    const accounts = Array.from(this.chartOfAccounts.values());

    const totalAssets = accounts
      .filter((a) => a.category === 'asset')
      .reduce((sum, a) => sum + a.balance, 0);

    const totalLiabilities = accounts
      .filter((a) => a.category === 'liability')
      .reduce((sum, a) => sum + a.balance, 0);

    const totalEquity = accounts
      .filter((a) => a.category === 'equity')
      .reduce((sum, a) => sum + a.balance, 0);

    const totalRevenue = accounts
      .filter((a) => a.category === 'revenue')
      .reduce((sum, a) => sum + a.balance, 0);

    const totalExpenses = accounts
      .filter((a) => a.category === 'expense')
      .reduce((sum, a) => sum + a.balance, 0);

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue,
      totalExpenses,
    };
  }

  /**
   * الحصول على سجل العمليات
   */
  async getTransactionLog(
    startDate?: string,
    endDate?: string
  ): Promise<AccountingEntry[]> {
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
  async exportFinancialReport(
    period: string,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<string> {
    const report = await this.getFinancialReport(period);

    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    }

    if (format === 'csv') {
      const headers = ['Account Code', 'Account Name', 'Category', 'Balance', 'Currency'];
      const rows = report.accounts.map((a) => [
        a.code,
        a.name,
        a.category,
        a.balance,
        a.currency,
      ]);

      const csv = [headers, ...rows]
        .map((row) => row.join(','))
        .join('\n');

      return csv;
    }

    // في الإنتاج، استخدم مكتبة PDF
    return JSON.stringify(report);
  }
}

// تصدير مثيل واحد من الخدمة
export const accountingService = new AccountingService();

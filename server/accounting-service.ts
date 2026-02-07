/**
 * accounting-service
 * 
 * @module ./server/accounting-service
 */
import { eq, and, gte, lte, sum } from "drizzle-orm";
import { getDb } from "./db";
import {
  chartOfAccounts,
  generalJournal,
  generalLedger,
  trialBalance,
  financialReports,
  auditLog,
  periodBalances,
} from "../drizzle/accounting-full-schema";

/**
 * خدمة المحاسبة المتكاملة
 * تدير جميع العمليات المحاسبية والتقارير المالية
 */

// ============================================
// 1️⃣ إدارة الحسابات
// ============================================

export async function createAccount(
  accountCode: string,
  accountName: string,
  accountType: string,
  currency: string = "JOD",
  openingBalance: number = 0
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(chartOfAccounts).values({
      accountCode,
      accountName,
      accountType: accountType as any,
      currency: currency as any,
      openingBalance: openingBalance.toString(),
      isActive: true,
    });

    return result;
  } catch (error) {
    console.error("[Accounting] Failed to create account:", error);
    throw error;
  }
}

export async function getAccount(accountCode: string) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db
      .select()
      .from(chartOfAccounts)
      .where(eq(chartOfAccounts.accountCode, accountCode))
      .limit(1);

    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Accounting] Failed to get account:", error);
    return undefined;
  }
}

export async function getAllAccounts(accountType?: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    let whereCondition: any = eq(chartOfAccounts.isActive, true);

    if (accountType) {
      whereCondition = and(
        eq(chartOfAccounts.isActive, true),
        eq(chartOfAccounts.accountType, accountType as any)
      );
    }

    return await db.select().from(chartOfAccounts).where(whereCondition);
  } catch (error) {
    console.error("[Accounting] Failed to get accounts:", error);
    return [];
  }
}

// ============================================
// 2️⃣ تسجيل الحركات المحاسبية
// ============================================

export async function postJournalEntry(
  journalDate: Date,
  description: string,
  referenceType: string,
  debitAccountCode: string,
  creditAccountCode: string,
  amount: number,
  currency: string = "JOD",
  exchangeRate: number = 1,
  userId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // الحصول على الحسابات
    const debitAccount = await getAccount(debitAccountCode);
    const creditAccount = await getAccount(creditAccountCode);

    if (!debitAccount || !creditAccount) {
      throw new Error("One or both accounts not found");
    }

    // حساب المبلغ بالدينار الأردني
    const amountJOD = amount * exchangeRate;

    // إنشاء القيد
    const journalNumber = `JNL-${Date.now()}`;

    const result = await db.insert(generalJournal).values({
      journalDate,
      journalNumber,
      description,
      referenceType: referenceType as any,
      debitAccountId: debitAccount.id,
      creditAccountId: creditAccount.id,
      amount: amount.toString(),
      currency: currency as any,
      exchangeRate: exchangeRate.toString(),
      amountJOD: amountJOD.toString(),
      status: "posted",
      createdBy: userId,
    });

    // تحديث دفتر الأستاذ
    await updateLedger(debitAccount.id, journalNumber, amount, 0, amountJOD);
    await updateLedger(creditAccount.id, journalNumber, 0, amount, -amountJOD);

    return result;
  } catch (error) {
    console.error("[Accounting] Failed to post journal entry:", error);
    throw error;
  }
}

// ============================================
// 3️⃣ إدارة دفتر الأستاذ
// ============================================

export async function updateLedger(
  accountId: number,
  journalNumber: string,
  debitAmount: number,
  creditAmount: number,
  balanceChange: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // الحصول على آخر رصيد
    const lastEntry = await db
      .select()
      .from(generalLedger)
      .where(eq(generalLedger.accountId, accountId))
      .orderBy((t) => t.id)
      .limit(1);

    const previousBalance = lastEntry.length > 0 ? parseFloat(lastEntry[0].balance) : 0;
    const newBalance = previousBalance + balanceChange;

    // إضافة القيد إلى دفتر الأستاذ
    const result = await db.insert(generalLedger).values({
      accountId,
      journalId: 0, // سيتم تحديثه لاحقاً
      ledgerDate: new Date(),
      debitAmount: debitAmount.toString(),
      creditAmount: creditAmount.toString(),
      balance: newBalance.toString(),
      description: journalNumber,
    });

    return result;
  } catch (error) {
    console.error("[Accounting] Failed to update ledger:", error);
    throw error;
  }
}

export async function getAccountBalance(accountCode: string, asOfDate?: Date) {
  const db = await getDb();
  if (!db) return 0;

  try {
    const account = await getAccount(accountCode);
    if (!account) return 0;

    let whereCondition: any = eq(generalLedger.accountId, account.id);

    if (asOfDate) {
      whereCondition = and(
        eq(generalLedger.accountId, account.id),
        lte(generalLedger.ledgerDate, asOfDate)
      );
    }

    const entries = await db
      .select()
      .from(generalLedger)
      .where(whereCondition)
      .orderBy((t) => t.id);

    if (entries.length === 0) {
      const balance = account.openingBalance || "0";
      return parseFloat(balance);
    }

    const lastBalance = entries[entries.length - 1].balance || "0";
    return parseFloat(lastBalance);
  } catch (error) {
    console.error("[Accounting] Failed to get account balance:", error);
    return 0;
  }
}

// ============================================
// 4️⃣ الميزانية التجريبية
// ============================================

export async function generateTrialBalance(asOfDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const accounts = await getAllAccounts();
    const balances: any[] = [];

    for (const account of accounts) {
      const balance = await getAccountBalance(account.accountCode, asOfDate);

      balances.push({
        accountId: account.id,
        asOfDate,
        debitTotal: balance > 0 ? balance : 0,
        creditTotal: balance < 0 ? Math.abs(balance) : 0,
        balance: balance.toString(),
        currency: account.currency,
      });
    }

    // حفظ الميزانية التجريبية
    await db.insert(trialBalance).values(balances);

    return balances;
  } catch (error) {
    console.error("[Accounting] Failed to generate trial balance:", error);
    throw error;
  }
}

// ============================================
// 5️⃣ التقارير المالية
// ============================================

export async function generateIncomeStatement(fromDate: Date, toDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // الحصول على الإيرادات
    const revenues = await getAllAccounts("revenue");
    let totalRevenue = 0;

    for (const revenue of revenues) {
      const balance = await getAccountBalance(revenue.accountCode, toDate);
      totalRevenue += balance;
    }

    // الحصول على المصاريف
    const expenses = await getAllAccounts("expense");
    let totalExpenses = 0;

    for (const expense of expenses) {
      const balance = await getAccountBalance(expense.accountCode, toDate);
      totalExpenses += Math.abs(balance);
    }

    // الحصول على تكلفة البضاعة المباعة
    const cogs = await getAllAccounts("cogs");
    let totalCOGS = 0;

    for (const item of cogs) {
      const balance = await getAccountBalance(item.accountCode, toDate);
      totalCOGS += Math.abs(balance);
    }

    const netProfit = totalRevenue - totalCOGS - totalExpenses;

    const reportData = {
      revenues: totalRevenue,
      cogs: totalCOGS,
      grossProfit: totalRevenue - totalCOGS,
      expenses: totalExpenses,
      netProfit,
    };

    // حفظ التقرير
    await db.insert(financialReports).values({
      reportType: "income_statement",
      reportName: `Income Statement ${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`,
      reportDate: new Date(),
      fromDate,
      toDate,
      reportData: JSON.stringify(reportData),
      totalRevenue: totalRevenue.toString(),
      totalExpenses: totalExpenses.toString(),
      netProfit: netProfit.toString(),
      createdBy: 1, // Admin user
    });

    return reportData;
  } catch (error) {
    console.error("[Accounting] Failed to generate income statement:", error);
    throw error;
  }
}

export async function generateBalanceSheet(asOfDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // الأصول
    const assets = await getAllAccounts("asset");
    let totalAssets = 0;

    for (const asset of assets) {
      const balance = await getAccountBalance(asset.accountCode, asOfDate);
      totalAssets += balance;
    }

    // الالتزامات
    const liabilities = await getAllAccounts("liability");
    let totalLiabilities = 0;

    for (const liability of liabilities) {
      const balance = await getAccountBalance(liability.accountCode, asOfDate);
      totalLiabilities += Math.abs(balance);
    }

    // حقوق الملكية
    const equity = await getAllAccounts("equity");
    let totalEquity = 0;

    for (const eq of equity) {
      const balance = await getAccountBalance(eq.accountCode, asOfDate);
      totalEquity += balance;
    }

    const reportData = {
      assets: totalAssets,
      liabilities: totalLiabilities,
      equity: totalEquity,
    };

    // حفظ التقرير
    await db.insert(financialReports).values({
      reportType: "balance_sheet",
      reportName: `Balance Sheet as of ${asOfDate.toLocaleDateString()}`,
      reportDate: new Date(),
      toDate: asOfDate,
      reportData: JSON.stringify(reportData),
      totalAssets: totalAssets.toString(),
      totalLiabilities: totalLiabilities.toString(),
      totalEquity: totalEquity.toString(),
      createdBy: 1, // Admin user
    });

    return reportData;
  } catch (error) {
    console.error("[Accounting] Failed to generate balance sheet:", error);
    throw error;
  }
}

// ============================================
// 6️⃣ سجل التدقيق
// ============================================

export async function logAuditEvent(
  actionType: string,
  entityType: string,
  entityId: number,
  entityName: string,
  oldValues: any,
  newValues: any,
  userId: number,
  userName: string,
  reason?: string
) {
  const db = await getDb();
  if (!db) return;

  try {
    const changes = Object.keys(newValues || {}).filter(
      (key) => oldValues?.[key] !== newValues?.[key]
    );

    await db.insert(auditLog).values({
      actionType: actionType as any,
      entityType,
      entityId,
      entityName,
      oldValues: JSON.stringify(oldValues),
      newValues: JSON.stringify(newValues),
      changes: changes.join(", "),
      reason,
      userId,
      userName,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("[Accounting] Failed to log audit event:", error);
  }
}

// ============================================
// 7️⃣ الأرصدة الدورية
// ============================================

export async function closePeriod(year: number, month: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const accounts = await getAllAccounts();
    const balances: any[] = [];

    for (const account of accounts) {
      const openingBalance = await getAccountBalance(
        account.accountCode,
        new Date(year, month - 1, 1)
      );
      const closingBalance = await getAccountBalance(
        account.accountCode,
        new Date(year, month, 0)
      );

      balances.push({
        accountId: account.id,
        periodYear: year,
        periodMonth: month,
        openingBalance: openingBalance.toString(),
        debitAmount: "0",
        creditAmount: "0",
        closingBalance: closingBalance.toString(),
        currency: account.currency,
      });
    }

    await db.insert(periodBalances).values(balances);

    return balances;
  } catch (error) {
    console.error("[Accounting] Failed to close period:", error);
    throw error;
  }
}

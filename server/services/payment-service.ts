import { getDb } from '../db'; const db = await getDb();
import { paymentTransactions, refunds, paymentAttempts, pendingPayments, paymentSettings, paymentAuditLog, supportedBanks } from '../../drizzle/payment-schema';
import { invoices } from '../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * خدمة الدفع الإلكترونية المتكاملة
 * Integrated Electronic Payment Service
 * يدعم البنوك الأردنية الرئيسية
 */

// ==================== البنوك الأردنية المدعومة ====================

const JORDANIAN_BANKS = {
  // البنك الأهلي الأردني
  ARAB_BANK: {
    code: 'ARAB_BANK',
    name: 'Arab Bank',
    nameAr: 'البنك العربي',
    gatewayType: 'api' as const,
    gatewayUrl: 'https://gateway.arabbank.com.jo/payment',
    apiEndpoint: 'https://api.arabbank.com.jo/v1',
  },
  // بنك الإسكان للتجارة والتمويل
  HOUSING_BANK: {
    code: 'HOUSING_BANK',
    name: 'Housing Bank for Trade and Finance',
    nameAr: 'بنك الإسكان للتجارة والتمويل',
    gatewayType: 'redirect' as const,
    gatewayUrl: 'https://payment.hbtf.com.jo/gateway',
    apiEndpoint: 'https://api.hbtf.com.jo/v1',
  },
  // البنك الأردني الكويتي
  JORDAN_KUWAIT_BANK: {
    code: 'JORDAN_KUWAIT_BANK',
    name: 'Jordan Kuwait Bank',
    nameAr: 'البنك الأردني الكويتي',
    gatewayType: 'hosted_page' as const,
    gatewayUrl: 'https://pay.jkb.com.jo',
    apiEndpoint: 'https://api.jkb.com.jo/v1',
  },
  // بنك البتراء
  PETRA_BANK: {
    code: 'PETRA_BANK',
    name: 'Petra Bank',
    nameAr: 'بنك البتراء',
    gatewayType: 'api' as const,
    gatewayUrl: 'https://gateway.petrabank.com.jo/payment',
    apiEndpoint: 'https://api.petrabank.com.jo/v1',
  },
  // بنك الأردن
  BANK_OF_JORDAN: {
    code: 'BANK_OF_JORDAN',
    name: 'Bank of Jordan',
    nameAr: 'بنك الأردن',
    gatewayType: 'redirect' as const,
    gatewayUrl: 'https://pay.bankofjordan.com.jo',
    apiEndpoint: 'https://api.bankofjordan.com.jo/v1',
  },
  // بنك الإنماء الأردني
  JORDAN_AHLI_BANK: {
    code: 'JORDAN_AHLI_BANK',
    name: 'Jordan Ahli Bank',
    nameAr: 'بنك الأردن الأهلي',
    gatewayType: 'mobile_wallet' as const,
    gatewayUrl: 'https://wallet.jordanahli.com.jo',
    apiEndpoint: 'https://api.jordanahli.com.jo/v1',
  },
};

// ==================== إنشاء معاملة دفع ====================

export async function initiatePayment(input: {
  userId: number;
  invoiceId?: number;
  amount: number;
  currency: string;
  bankCode: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'bank_transfer' | 'mobile_wallet' | 'installment';
  description?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    // التحقق من البنك
    const bank = await db.query.supportedBanks.findFirst({
      where: eq(supportedBanks.bankCode, input.bankCode),
    });

    if (!bank) {
      throw new Error(`البنك ${input.bankCode} غير مدعوم`);
    }

    // إنشاء معرف فريد للمعاملة
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const referenceNumber = `REF-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // إنشاء سجل المحاولة
    const attemptId = `ATT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(paymentAttempts).values({
      attemptId,
      userId: input.userId,
      invoiceId: input.invoiceId,
      bankId: bank.id,
      amount: input.amount.toString(),
      currency: input.currency,
      status: 'initiated',
      sessionId: crypto.randomBytes(16).toString('hex'),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      attemptedAt: new Date(),
      createdAt: new Date(),
    });

    // إنشاء معاملة الدفع
    const [transaction] = await db.insert(paymentTransactions).values({
      transactionId,
      referenceNumber,
      userId: input.userId,
      invoiceId: input.invoiceId,
      bankId: bank.id,
      amount: input.amount.toString(),
      currency: input.currency,
      status: 'pending',
      paymentMethod: input.paymentMethod,
      transactionDate: new Date(),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: input.userId,
    });

    // تسجيل في سجل التدقيق
    await logAuditEvent(input.userId, 'payment_initiated', {
      transactionId,
      referenceNumber,
      amount: input.amount,
      bankCode: input.bankCode,
      paymentMethod: input.paymentMethod,
    });

    // إرجاع معلومات المعاملة
    return {
      transactionId,
      referenceNumber,
      bankGatewayUrl: bank.gatewayUrl,
      bankCode: bank.bankCode,
      bankName: bank.bankName,
      amount: input.amount,
      currency: input.currency,
      paymentMethod: input.paymentMethod,
    };
  } catch (error) {
    console.error('Error initiating payment:', error);
    throw error;
  }
}

// ==================== معالجة رد الاستدعاء من البنك ====================

export async function handleBankCallback(input: {
  transactionId: string;
  referenceNumber: string;
  status: 'success' | 'failed' | 'cancelled';
  authorizationCode?: string;
  responseCode?: string;
  responseMessage?: string;
  cardLastFour?: string;
  cardBrand?: string;
  metadata?: Record<string, any>;
}) {
  try {
    // البحث عن المعاملة
    const transaction = await db.query.paymentTransactions.findFirst({
      where: eq(paymentTransactions.transactionId, input.transactionId),
    });

    if (!transaction) {
      throw new Error('المعاملة غير موجودة');
    }

    // تحديث حالة المعاملة
    let newStatus: typeof transaction.status = 'failed';
    let completedDate: Date | null = null;

    if (input.status === 'success') {
      newStatus = 'completed';
      completedDate = new Date();

      // تحديث حالة الفاتورة إذا كانت موجودة
      if (transaction.invoiceId) {
        await db.update(invoices).set({
          paymentStatus: 'paid',
          paymentDate: new Date(),
        }).where(eq(invoices.id, transaction.invoiceId));

        // حذف من المدفوعات المعلقة
        await db.delete(pendingPayments).where(
          eq(pendingPayments.invoiceId, transaction.invoiceId)
        );
      }
    } else if (input.status === 'failed') {
      newStatus = 'failed';
      completedDate = new Date();
    } else if (input.status === 'cancelled') {
      newStatus = 'cancelled';
      completedDate = new Date();
    }

    // تحديث المعاملة
    await db.update(paymentTransactions).set({
      status: newStatus,
      authorizationCode: input.authorizationCode,
      responseCode: input.responseCode,
      responseMessage: input.responseMessage,
      cardLastFour: input.cardLastFour,
      cardBrand: input.cardBrand,
      completedDate,
      metadata: input.metadata,
      updatedAt: new Date(),
    }).where(eq(paymentTransactions.id, transaction.id));

    // تسجيل في سجل التدقيق
    await logAuditEvent(transaction.userId, 'payment_callback_received', {
      transactionId: input.transactionId,
      status: input.status,
      authorizationCode: input.authorizationCode,
      responseCode: input.responseCode,
    });

    return {
      success: input.status === 'success',
      transactionId: input.transactionId,
      newStatus,
      message: input.responseMessage,
    };
  } catch (error) {
    console.error('Error handling bank callback:', error);
    throw error;
  }
}

// ==================== استرجاع المبلغ ====================

export async function initiateRefund(input: {
  transactionId: number;
  amount: number;
  reason: 'customer_request' | 'duplicate_charge' | 'fraudulent' | 'product_not_received' | 'product_defective' | 'service_not_provided' | 'other';
  description?: string;
  userId: number;
}) {
  try {
    // البحث عن المعاملة
    const transaction = await db.query.paymentTransactions.findFirst({
      where: eq(paymentTransactions.id, input.transactionId),
    });

    if (!transaction) {
      throw new Error('المعاملة غير موجودة');
    }

    if (transaction.status !== 'completed') {
      throw new Error('لا يمكن استرجاع مبلغ من معاملة لم تكتمل');
    }

    // إنشاء معرف الاسترجاع
    const refundId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // إنشاء سجل الاسترجاع
    const [refund] = await db.insert(refunds).values({
      refundId,
      transactionId: input.transactionId,
      amount: input.amount.toString(),
      currency: transaction.currency,
      reason: input.reason,
      status: 'pending',
      requestedDate: new Date(),
      description: input.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: input.userId,
    });

    // تسجيل في سجل التدقيق
    await logAuditEvent(input.userId, 'refund_initiated', {
      refundId,
      transactionId: input.transactionId,
      amount: input.amount,
      reason: input.reason,
    });

    return {
      refundId,
      transactionId: input.transactionId,
      amount: input.amount,
      status: 'pending',
      message: 'تم بدء عملية الاسترجاع',
    };
  } catch (error) {
    console.error('Error initiating refund:', error);
    throw error;
  }
}

// ==================== الحصول على معاملات المستخدم ====================

export async function getUserTransactions(userId: number, filters?: {
  status?: string;
  bankCode?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  try {
    const conditions = [eq(paymentTransactions.userId, userId)];

    if (filters?.status) {
      conditions.push(eq(paymentTransactions.status, filters.status as any));
    }

    if (filters?.bankCode) {
      const bank = await db.query.supportedBanks.findFirst({
        where: eq(supportedBanks.bankCode, filters.bankCode),
      });
      if (bank) {
        conditions.push(eq(paymentTransactions.bankId, bank.id));
      }
    }

    if (filters?.startDate) {
      conditions.push(
        // @ts-ignore
        sql`${paymentTransactions.transactionDate} >= ${filters.startDate}`
      );
    }

    if (filters?.endDate) {
      conditions.push(
        // @ts-ignore
        sql`${paymentTransactions.transactionDate} <= ${filters.endDate}`
      );
    }

    const transactions = await db.query.paymentTransactions.findMany({
      where: and(...conditions),
      with: {
        bank: true,
        invoice: true,
      },
      orderBy: desc(paymentTransactions.transactionDate),
      limit: filters?.limit || 20,
      offset: filters?.offset || 0,
    });

    return transactions;
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw error;
  }
}

// ==================== الحصول على تفاصيل المعاملة ====================

export async function getTransactionDetails(transactionId: number) {
  try {
    const transaction = await db.query.paymentTransactions.findFirst({
      where: eq(paymentTransactions.id, transactionId),
      with: {
        user: true,
        bank: true,
        invoice: true,
        refunds: true,
        auditLogs: true,
      },
    });

    if (!transaction) {
      throw new Error('المعاملة غير موجودة');
    }

    return transaction;
  } catch (error) {
    console.error('Error getting transaction details:', error);
    throw error;
  }
}

// ==================== تحديث حالة المعاملة ====================

export async function updateTransactionStatus(
  transactionId: number,
  newStatus: string,
  userId: number,
  metadata?: Record<string, any>
) {
  try {
    await db.update(paymentTransactions).set({
      status: newStatus as any,
      metadata,
      updatedAt: new Date(),
    }).where(eq(paymentTransactions.id, transactionId));

    // تسجيل في سجل التدقيق
    await logAuditEvent(userId, 'transaction_status_updated', {
      transactionId,
      newStatus,
      metadata,
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
}

// ==================== الحصول على إعدادات الدفع ====================

export async function getPaymentSettings(userId: number) {
  try {
    let settings = await db.query.paymentSettings.findFirst({
      where: eq(paymentSettings.userId, userId),
    });

    if (!settings) {
      // إنشاء إعدادات افتراضية
      const [newSettings] = await db.insert(paymentSettings).values({
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      settings = newSettings;
    }

    return settings;
  } catch (error) {
    console.error('Error getting payment settings:', error);
    throw error;
  }
}

// ==================== تحديث إعدادات الدفع ====================

export async function updatePaymentSettings(
  userId: number,
  updates: {
    preferredBanks?: string[];
    enablePaymentNotifications?: boolean;
    enableEmailNotifications?: boolean;
    enableSmsNotifications?: boolean;
    dailyTransactionLimit?: number;
    monthlyTransactionLimit?: number;
  }
) {
  try {
    const settings = await getPaymentSettings(userId);

    await db.update(paymentSettings).set({
      ...updates,
      updatedAt: new Date(),
    }).where(eq(paymentSettings.userId, userId));

    // تسجيل في سجل التدقيق
    await logAuditEvent(userId, 'payment_settings_updated', updates);

    return { success: true };
  } catch (error) {
    console.error('Error updating payment settings:', error);
    throw error;
  }
}

// ==================== الحصول على المدفوعات المعلقة ====================

export async function getPendingPayments(userId: number) {
  try {
    const pending = await db.query.pendingPayments.findMany({
      where: eq(pendingPayments.userId, userId),
      with: {
        invoice: true,
      },
      orderBy: desc(pendingPayments.dueDate),
    });

    return pending;
  } catch (error) {
    console.error('Error getting pending payments:', error);
    throw error;
  }
}

// ==================== تسجيل حدث في سجل التدقيق ====================

async function logAuditEvent(
  userId: number,
  action: string,
  details?: Record<string, any>
) {
  try {
    const logId = `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(paymentAuditLog).values({
      logId,
      action,
      description: `${action} by user ${userId}`,
      userId,
      details,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
}

// ==================== الحصول على البنوك المدعومة ====================

export async function getSupportedBanks() {
  try {
    const banks = await db.query.supportedBanks.findMany({
      where: eq(supportedBanks.isActive, true),
    });

    return banks;
  } catch (error) {
    console.error('Error getting supported banks:', error);
    throw error;
  }
}

// ==================== إضافة بنك جديد ====================

export async function addBank(input: {
  bankCode: string;
  bankName: string;
  bankNameAr: string;
  gatewayType: 'redirect' | 'api' | 'hosted_page' | 'mobile_wallet';
  gatewayUrl: string;
  apiEndpoint?: string;
  merchantId?: string;
  apiKey?: string;
  apiSecret?: string;
}) {
  try {
    const [bank] = await db.insert(supportedBanks).values({
      bankCode: input.bankCode,
      bankName: input.bankName,
      bankNameAr: input.bankNameAr,
      gatewayType: input.gatewayType,
      gatewayUrl: input.gatewayUrl,
      apiEndpoint: input.apiEndpoint,
      merchantId: input.merchantId,
      apiKey: input.apiKey,
      apiSecret: input.apiSecret,
      isActive: true,
      isTestMode: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return bank;
  } catch (error) {
    console.error('Error adding bank:', error);
    throw error;
  }
}

// ==================== إحصائيات الدفع ====================

export async function getPaymentStatistics(userId: number, period: 'day' | 'week' | 'month' | 'year' = 'month') {
  try {
    const transactions = await db.query.paymentTransactions.findMany({
      where: eq(paymentTransactions.userId, userId),
    });

    const completed = transactions.filter((t) => t.status === 'completed');
    const failed = transactions.filter((t) => t.status === 'failed');
    const pending = transactions.filter((t) => t.status === 'pending');

    const totalAmount = completed.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    const failedAmount = failed.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    const pendingAmount = pending.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    return {
      totalTransactions: transactions.length,
      completedTransactions: completed.length,
      failedTransactions: failed.length,
      pendingTransactions: pending.length,
      totalAmount,
      failedAmount,
      pendingAmount,
      successRate: transactions.length > 0 ? (completed.length / transactions.length) * 100 : 0,
    };
  } catch (error) {
    console.error('Error getting payment statistics:', error);
    throw error;
  }
}

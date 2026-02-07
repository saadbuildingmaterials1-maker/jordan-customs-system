/**
 * payment-service
 * @module ./server/payment-service
 */
import { z } from 'zod';
/**
 * Payment Service Module
 * 
 * يحتوي على جميع عمليات معالجة الدفعات
 * والفواتير والاسترجاعات
 * 
 * @module server/payment-service
 * @requires server/db
 */

import * as db from './db';

/**
 * أنواع الدفع المدعومة
 */
export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  WALLET = 'wallet',
  CASH = 'cash',
}

/**
 * حالات الدفع
 */
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

/**
 * نوع معلومات الدفع
 */
export interface PaymentInfo {
  id: string;
  userId: number;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  description: string;
  invoiceNumber: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * نوع الفاتورة
 */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  userId: number;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * نوع عنصر الفاتورة
 */
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  tax?: number;
}

/**
 * خدمة معالجة الدفع
 */
export class PaymentService {
  /**
   * إنشاء دفعة جديدة
   */
  static async createPayment(
    userId: number,
    amount: number,
    currency: string,
    method: PaymentMethod,
    description: string,
    metadata?: Record<string, any>
  ): Promise<PaymentInfo> {
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const invoiceNumber = await this.generateInvoiceNumber();

    const payment: PaymentInfo = {
      id: paymentId,
      userId,
      amount,
      currency,
      method,
      status: PaymentStatus.PENDING,
      description,
      invoiceNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata,
    };

    // حفظ في قاعدة البيانات
    await this.savePayment(payment);

    return payment;
  }

  /**
   * معالجة الدفع
   */
  static async processPayment(
    paymentId: string,
    stripePaymentIntentId?: string
  ): Promise<PaymentInfo> {
    const payment = await this.getPayment(paymentId);
    if (!payment) {
      throw new Error('الدفعة غير موجودة');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new Error('لا يمكن معالجة هذه الدفعة');
    }

    // تحديث الحالة
    payment.status = PaymentStatus.PROCESSING;
    payment.updatedAt = new Date();
    if (stripePaymentIntentId) {
      payment.metadata = {
        ...payment.metadata,
        stripePaymentIntentId,
      };
    }

    await this.savePayment(payment);
    return payment;
  }

  /**
   * تأكيد الدفع
   */
  static async confirmPayment(paymentId: string): Promise<PaymentInfo> {
    const payment = await this.getPayment(paymentId);
    if (!payment) {
      throw new Error('الدفعة غير موجودة');
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.updatedAt = new Date();

    await this.savePayment(payment);

    // إنشاء فاتورة
    await this.createInvoiceFromPayment(payment);

    return payment;
  }

  /**
   * رفض الدفع
   */
  static async failPayment(paymentId: string, reason: string): Promise<PaymentInfo> {
    const payment = await this.getPayment(paymentId);
    if (!payment) {
      throw new Error('الدفعة غير موجودة');
    }

    payment.status = PaymentStatus.FAILED;
    payment.updatedAt = new Date();
    payment.metadata = {
      ...payment.metadata,
      failureReason: reason,
    };

    await this.savePayment(payment);
    return payment;
  }

  /**
   * استرجاع الدفعة
   */
  static async refundPayment(paymentId: string, reason: string): Promise<PaymentInfo> {
    const payment = await this.getPayment(paymentId);
    if (!payment) {
      throw new Error('الدفعة غير موجودة');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new Error('لا يمكن استرجاع هذه الدفعة');
    }

    payment.status = PaymentStatus.REFUNDED;
    payment.updatedAt = new Date();
    payment.metadata = {
      ...payment.metadata,
      refundReason: reason,
      refundDate: new Date().toISOString(),
    };

    await this.savePayment(payment);
    return payment;
  }

  /**
   * الحصول على الدفعة
   */
  static async getPayment(paymentId: string): Promise<PaymentInfo | null> {
    // محاكاة جلب من قاعدة البيانات
    // في التطبيق الحقيقي، سيتم جلبها من قاعدة البيانات
    return null;
  }

  /**
   * حفظ الدفعة
   */
  private static async savePayment(payment: PaymentInfo): Promise<void> {
    // محاكاة حفظ في قاعدة البيانات
    console.log('[Payment Service] حفظ الدفعة:', payment.id);
  }

  /**
   * توليد رقم الفاتورة
   */
  private static async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `INV-${year}${month}-${random}`;
  }

  /**
   * إنشاء فاتورة من الدفعة
   */
  private static async createInvoiceFromPayment(payment: PaymentInfo): Promise<Invoice> {
    const invoice: Invoice = {
      id: `INV-${Date.now()}`,
      invoiceNumber: payment.invoiceNumber,
      userId: payment.userId,
      amount: payment.amount,
      currency: payment.currency,
      status: 'paid',
      items: [
        {
          id: '1',
          description: payment.description,
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount,
        },
      ],
      issueDate: payment.createdAt,
      dueDate: new Date(payment.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
      paidDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('[Payment Service] إنشاء فاتورة:', invoice.invoiceNumber);
    return invoice;
  }

  /**
   * الحصول على سجل الدفعات للمستخدم
   */
  static async getUserPayments(userId: number, limit: number = 50): Promise<PaymentInfo[]> {
    // محاكاة جلب من قاعدة البيانات
    console.log(`[Payment Service] جلب دفعات المستخدم ${userId}`);
    return [];
  }

  /**
   * حساب إجمالي الدفعات
   */
  static async getTotalPayments(userId: number): Promise<number> {
    const payments = await this.getUserPayments(userId, 1000);
    return payments
      .filter(p => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + p.amount, 0);
  }

  /**
   * التحقق من صحة بيانات الدفع
   */
  static validatePaymentData(data: any): boolean {
    const schema = z.object({
      amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
      currency: z.string().min(3).max(3),
      method: z.enum([
        PaymentMethod.CARD,
        PaymentMethod.BANK_TRANSFER,
        PaymentMethod.WALLET,
        PaymentMethod.CASH,
      ]),
      description: z.string().min(1).max(500),
    });

    try {
      schema.parse(data);
      return true;
    } catch (error) {
      console.error('[Payment Service] خطأ في التحقق:', error);
      return false;
    }
  }

  /**
   * الحصول على إحصائيات الدفع
   */
  static async getPaymentStats(userId: number): Promise<{
    totalPayments: number;
    completedPayments: number;
    pendingPayments: number;
    failedPayments: number;
    totalAmount: number;
    averageAmount: number;
  }> {
    const payments = await this.getUserPayments(userId, 1000);

    const completed = payments.filter(p => p.status === PaymentStatus.COMPLETED);
    const pending = payments.filter(p => p.status === PaymentStatus.PENDING);
    const failed = payments.filter(p => p.status === PaymentStatus.FAILED);

    const totalAmount = completed.reduce((sum, p) => sum + p.amount, 0);
    const averageAmount = completed.length > 0 ? totalAmount / completed.length : 0;

    return {
      totalPayments: payments.length,
      completedPayments: completed.length,
      pendingPayments: pending.length,
      failedPayments: failed.length,
      totalAmount,
      averageAmount,
    };
  }

  /**
   * تصدير الفواتير إلى PDF
   */
  static async exportInvoiceToPDF(invoiceId: string): Promise<Buffer> {
    // محاكاة تصدير PDF
    console.log('[Payment Service] تصدير الفاتورة إلى PDF:', invoiceId);
    return Buffer.from('PDF content');
  }

  /**
   * إرسال الفاتورة عبر البريد الإلكتروني
   */
  static async sendInvoiceByEmail(invoiceId: string, email: string): Promise<boolean> {
    // محاكاة إرسال البريد
    console.log(`[Payment Service] إرسال الفاتورة ${invoiceId} إلى ${email}`);
    return true;
  }

  /**
   * حساب الضرائب
   */
  static calculateTax(amount: number, taxRate: number = 0.16): number {
    return amount * (taxRate / 100);
  }

  /**
   * حساب الخصم
   */
  static calculateDiscount(amount: number, discountPercent: number): number {
    return amount * (discountPercent / 100);
  }

  /**
   * حساب المبلغ النهائي
   */
  static calculateFinalAmount(
    amount: number,
    taxRate: number = 0.16,
    discountPercent: number = 0
  ): number {
    const tax = this.calculateTax(amount, taxRate);
    const discount = this.calculateDiscount(amount, discountPercent);
    return amount + tax - discount;
  }
}

export default PaymentService;

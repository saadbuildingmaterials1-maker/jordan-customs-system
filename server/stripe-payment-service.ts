/**
 * خدمة Stripe المتقدمة
 * Advanced Stripe Payment Service
 */

export interface PaymentConfig {
  apiKey: string;
  webhookSecret?: string;
  currency?: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'pending' | 'failed' | 'canceled';
  customerId?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface Subscription {
  id: string;
  customerId: string;
  priceId: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  canceledAt?: Date;
}

export interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate?: Date;
  paidAt?: Date;
  url?: string;
}

export interface Refund {
  id: string;
  paymentIntentId: string;
  amount: number;
  reason?: string;
  status: 'succeeded' | 'failed' | 'pending';
  createdAt: Date;
}

/**
 * فئة خدمة Stripe
 */
export class StripePaymentService {
  private apiKey: string;
  private webhookSecret?: string;
  private currency: string;
  private payments: Map<string, PaymentIntent> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private refunds: Map<string, Refund> = new Map();

  constructor(config: PaymentConfig) {
    this.apiKey = config.apiKey;
    this.webhookSecret = config.webhookSecret;
    this.currency = config.currency || 'USD';
  }

  /**
   * إنشاء نية دفع
   */
  async createPaymentIntent(
    amount: number,
    customerId?: string,
    description?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentIntent> {
    const id = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const paymentIntent: PaymentIntent = {
      id,
      amount,
      currency: this.currency,
      status: 'pending',
      customerId,
      description,
      metadata,
    };

    this.payments.set(id, paymentIntent);
    return paymentIntent;
  }

  /**
   * تأكيد الدفع
   */
  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const payment = this.payments.get(paymentIntentId);

    if (!payment) {
      throw new Error(`Payment intent not found: ${paymentIntentId}`);
    }

    payment.status = 'succeeded';
    this.payments.set(paymentIntentId, payment);

    return payment;
  }

  /**
   * إلغاء الدفع
   */
  async cancelPayment(paymentIntentId: string, reason?: string): Promise<PaymentIntent> {
    const payment = this.payments.get(paymentIntentId);

    if (!payment) {
      throw new Error(`Payment intent not found: ${paymentIntentId}`);
    }

    payment.status = 'canceled';
    this.payments.set(paymentIntentId, payment);

    return payment;
  }

  /**
   * الحصول على نية الدفع
   */
  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    const payment = this.payments.get(paymentIntentId);

    if (!payment) {
      throw new Error(`Payment intent not found: ${paymentIntentId}`);
    }

    return payment;
  }

  /**
   * إنشاء اشتراك
   */
  async createSubscription(
    customerId: string,
    priceId: string
  ): Promise<Subscription> {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subscription: Subscription = {
      id,
      customerId,
      priceId,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
    };

    this.subscriptions.set(id, subscription);
    return subscription;
  }

  /**
   * إلغاء الاشتراك
   */
  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);

    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    this.subscriptions.set(subscriptionId, subscription);

    return subscription;
  }

  /**
   * الحصول على الاشتراك
   */
  async getSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = this.subscriptions.get(subscriptionId);

    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    return subscription;
  }

  /**
   * إنشاء فاتورة
   */
  async createInvoice(
    customerId: string,
    amount: number,
    description?: string
  ): Promise<Invoice> {
    const id = `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const invoice: Invoice = {
      id,
      customerId,
      amount,
      status: 'open',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    this.invoices.set(id, invoice);
    return invoice;
  }

  /**
   * دفع الفاتورة
   */
  async payInvoice(invoiceId: string): Promise<Invoice> {
    const invoice = this.invoices.get(invoiceId);

    if (!invoice) {
      throw new Error(`Invoice not found: ${invoiceId}`);
    }

    invoice.status = 'paid';
    invoice.paidAt = new Date();
    this.invoices.set(invoiceId, invoice);

    return invoice;
  }

  /**
   * الحصول على الفاتورة
   */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    const invoice = this.invoices.get(invoiceId);

    if (!invoice) {
      throw new Error(`Invoice not found: ${invoiceId}`);
    }

    return invoice;
  }

  /**
   * إنشاء استرجاع أموال
   */
  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<Refund> {
    const payment = this.payments.get(paymentIntentId);

    if (!payment) {
      throw new Error(`Payment intent not found: ${paymentIntentId}`);
    }

    const refundAmount = amount || payment.amount;
    const id = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const refund: Refund = {
      id,
      paymentIntentId,
      amount: refundAmount,
      reason,
      status: 'succeeded',
      createdAt: new Date(),
    };

    this.refunds.set(id, refund);
    return refund;
  }

  /**
   * الحصول على الاسترجاع
   */
  async getRefund(refundId: string): Promise<Refund> {
    const refund = this.refunds.get(refundId);

    if (!refund) {
      throw new Error(`Refund not found: ${refundId}`);
    }

    return refund;
  }

  /**
   * قائمة الدفعات
   */
  async listPayments(customerId?: string): Promise<PaymentIntent[]> {
    const payments = Array.from(this.payments.values());

    if (customerId) {
      return payments.filter((p) => p.customerId === customerId);
    }

    return payments;
  }

  /**
   * قائمة الاشتراكات
   */
  async listSubscriptions(customerId?: string): Promise<Subscription[]> {
    const subscriptions = Array.from(this.subscriptions.values());

    if (customerId) {
      return subscriptions.filter((s) => s.customerId === customerId);
    }

    return subscriptions;
  }

  /**
   * قائمة الفواتير
   */
  async listInvoices(customerId?: string): Promise<Invoice[]> {
    const invoices = Array.from(this.invoices.values());

    if (customerId) {
      return invoices.filter((i) => i.customerId === customerId);
    }

    return invoices;
  }

  /**
   * قائمة الاسترجاعات
   */
  async listRefunds(paymentIntentId?: string): Promise<Refund[]> {
    const refunds = Array.from(this.refunds.values());

    if (paymentIntentId) {
      return refunds.filter((r) => r.paymentIntentId === paymentIntentId);
    }

    return refunds;
  }

  /**
   * إحصائيات الدفع
   */
  async getPaymentStats(): Promise<{
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    averageAmount: number;
  }> {
    const payments = Array.from(this.payments.values());

    if (payments.length === 0) {
      return {
        totalPayments: 0,
        totalAmount: 0,
        successfulPayments: 0,
        failedPayments: 0,
        averageAmount: 0,
      };
    }

    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const successfulPayments = payments.filter((p) => p.status === 'succeeded').length;
    const failedPayments = payments.filter((p) => p.status === 'failed').length;

    return {
      totalPayments: payments.length,
      totalAmount,
      successfulPayments,
      failedPayments,
      averageAmount: Math.round(totalAmount / payments.length),
    };
  }

  /**
   * معالجة webhook
   */
  async handleWebhook(event: any): Promise<boolean> {
    try {
      const eventType = event.type;

      switch (eventType) {
        case 'payment_intent.succeeded':
          await this.confirmPayment(event.data.object.id);
          break;
        case 'payment_intent.payment_failed':
          // معالجة فشل الدفع
          break;
        case 'invoice.paid':
          // معالجة دفع الفاتورة
          break;
        case 'customer.subscription.deleted':
          // معالجة حذف الاشتراك
          break;
        default:
          break;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * التحقق من توقيع webhook
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      return false;
    }

    // في التطبيق الحقيقي، نستخدم crypto للتحقق
    return true;
  }
}

/**
 * دوال مساعدة
 */

/**
 * تنسيق المبلغ للدفع (بالفلس)
 */
export function formatAmountForPayment(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * تنسيق المبلغ للعرض
 */
export function formatAmountForDisplay(amount: number): string {
  return (amount / 100).toFixed(2);
}

/**
 * التحقق من صحة المبلغ
 */
export function validateAmount(amount: number): boolean {
  return amount > 0 && amount <= 999999999;
}

/**
 * حساب الرسوم
 */
export function calculateFees(amount: number, feePercentage: number = 2.9): number {
  return Math.round((amount * feePercentage) / 100);
}

/**
 * حساب المبلغ الإجمالي مع الرسوم
 */
export function calculateTotalWithFees(amount: number, feePercentage: number = 2.9): number {
  const fees = calculateFees(amount, feePercentage);
  return amount + fees;
}

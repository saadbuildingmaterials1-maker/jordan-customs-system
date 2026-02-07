/**
 * Stripe Payment Service
 * 
 * خدمة معالجة الدفع بـ Stripe API
 * 
 * @module server/services/stripe-payment-service
 */

import Stripe from 'stripe';

/**
 * معلومات جلسة الدفع
 */
export interface CheckoutSessionInfo {
  sessionId: string;
  url: string;
  status: 'open' | 'complete' | 'expired';
  customerId: string;
  subscriptionId?: string;
  amount: number;
  currency: string;
  createdAt: Date;
}

/**
 * معلومات الفاتورة
 */
export interface InvoiceInfo {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  pdfUrl?: string;
  hostedUrl?: string;
  createdAt: Date;
  dueDate?: Date;
  paidAt?: Date;
}

/**
 * معلومات الاشتراك
 */
export interface StripeSubscriptionInfo {
  id: string;
  customerId: string;
  priceId: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialStart?: Date;
  trialEnd?: Date;
  canceledAt?: Date;
  amount: number;
  currency: string;
  interval: 'day' | 'week' | 'month' | 'year';
}

/**
 * معلومات العميل
 */
export interface StripeCustomerInfo {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  createdAt: Date;
  metadata?: Record<string, string>;
}

/**
 * خدمة الدفع بـ Stripe
 */
export class StripePaymentService {
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey);
  }

  /**
   * إنشاء عميل جديد
   */
  async createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, string>
  ): Promise<StripeCustomerInfo> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata,
      });

      console.log(`✅ تم إنشاء عميل Stripe جديد`);
      console.log(`👤 البريد الإلكتروني: ${email}`);
      console.log(`🆔 معرّف العميل: ${customer.id}`);

      return {
        id: customer.id,
        email: customer.email || '',
        name: customer.name || undefined,
        phone: customer.phone || undefined,
        createdAt: new Date(customer.created * 1000),
        metadata: customer.metadata || undefined,
      };
    } catch (error) {
      console.error('❌ خطأ في إنشاء عميل Stripe:', error);
      throw new Error('فشل في إنشاء عميل Stripe');
    }
  }

  /**
   * إنشاء جلسة دفع (Checkout Session)
   */
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    metadata?: Record<string, string>
  ): Promise<CheckoutSessionInfo> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
        allow_promotion_codes: true,
      });

      console.log(`✅ تم إنشاء جلسة دفع جديدة`);
      console.log(`🆔 معرّف الجلسة: ${session.id}`);
      console.log(`💳 معرّف العميل: ${customerId}`);
      console.log(`📊 الحالة: ${session.payment_status}`);

      return {
        sessionId: session.id,
        url: session.url || '',
        status: session.payment_status as 'open' | 'complete' | 'expired',
        customerId,
        amount: session.amount_total || 0,
        currency: session.currency || 'jod',
        createdAt: new Date(session.created * 1000),
      };
    } catch (error) {
      console.error('❌ خطأ في إنشاء جلسة الدفع:', error);
      throw new Error('فشل في إنشاء جلسة الدفع');
    }
  }

  /**
   * الحصول على معلومات الاشتراك
   */
  async getSubscription(subscriptionId: string): Promise<StripeSubscriptionInfo> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;

      console.log(`✅ تم جلب معلومات الاشتراك`);
      console.log(`🆔 معرّف الاشتراك: ${subscriptionId}`);
      console.log(`📊 الحالة: ${subscription.status}`);

      const startDate = new Date((subscription as any).current_period_start * 1000);
      const endDate = new Date((subscription as any).current_period_end * 1000);

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        priceId: (subscription.items.data[0]?.price.id) || '',
        status: subscription.status as StripeSubscriptionInfo['status'],
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : undefined,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : undefined,
        amount: (subscription.items.data[0]?.price.unit_amount || 0) / 100,
        currency: subscription.items.data[0]?.price.currency || 'jod',
        interval: (subscription.items.data[0]?.price.recurring?.interval || 'month') as any,
      };
    } catch (error) {
      console.error('❌ خطأ في جلب معلومات الاشتراك:', error);
      throw new Error('فشل في جلب معلومات الاشتراك');
    }
  }

  /**
   * إلغاء الاشتراك
   */
  async cancelSubscription(subscriptionId: string): Promise<StripeSubscriptionInfo> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true }) as Stripe.Subscription;

      console.log(`✅ تم إلغاء الاشتراك`);
      console.log(`🆔 معرّف الاشتراك: ${subscriptionId}`);
      console.log(`📊 الحالة: ${subscription.status}`);

      const startDate = new Date((subscription as any).current_period_start * 1000);
      const endDate = new Date((subscription as any).current_period_end * 1000);

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        priceId: (subscription.items.data[0]?.price.id) || '',
        status: subscription.status as StripeSubscriptionInfo['status'],
        currentPeriodStart: startDate,
        currentPeriodEnd: endDate,
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : undefined,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : undefined,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : undefined,
        amount: (subscription.items.data[0]?.price.unit_amount || 0) / 100,
        currency: subscription.items.data[0]?.price.currency || 'jod',
        interval: (subscription.items.data[0]?.price.recurring?.interval || 'month') as any,
      };
    } catch (error) {
      console.error('❌ خطأ في إلغاء الاشتراك:', error);
      throw new Error('فشل في إلغاء الاشتراك');
    }
  }

  /**
   * الحصول على الفاتورة
   */
  async getInvoice(invoiceId: string): Promise<InvoiceInfo> {
    try {
      const invoice = await this.stripe.invoices.retrieve(invoiceId);

      console.log(`✅ تم جلب معلومات الفاتورة`);
      console.log(`🆔 معرّف الفاتورة: ${invoiceId}`);
      console.log(`📊 الحالة: ${invoice.status}`);

      return {
        id: invoice.id,
        number: invoice.number || '',
        amount: (invoice.total || 0) / 100,
        currency: invoice.currency || 'jod',
        status: invoice.status as InvoiceInfo['status'],
        pdfUrl: (invoice as any).pdf || undefined,
        hostedUrl: invoice.hosted_invoice_url || undefined,
        createdAt: new Date(invoice.created * 1000),
        dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : undefined,
        paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : undefined,
      };
    } catch (error) {
      console.error('❌ خطأ في جلب معلومات الفاتورة:', error);
      throw new Error('فشل في جلب معلومات الفاتورة');
    }
  }

  /**
   * الحصول على قائمة الفواتير
   */
  async listInvoices(customerId: string, limit: number = 10): Promise<InvoiceInfo[]> {
    try {
      const invoices = await this.stripe.invoices.list({
        customer: customerId,
        limit,
      });

      console.log(`✅ تم جلب قائمة الفواتير`);
      console.log(`👤 معرّف العميل: ${customerId}`);
      console.log(`📊 عدد الفواتير: ${invoices.data.length}`);

      return invoices.data.map(invoice => ({
        id: invoice.id,
        number: invoice.number || '',
        amount: (invoice.total || 0) / 100,
        currency: invoice.currency || 'jod',
        status: invoice.status as InvoiceInfo['status'],
        pdfUrl: (invoice as any).pdf || undefined,
        hostedUrl: invoice.hosted_invoice_url || undefined,
        createdAt: new Date(invoice.created * 1000),
        dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : undefined,
        paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions.paid_at * 1000) : undefined,
      }));
    } catch (error) {
      console.error('❌ خطأ في جلب قائمة الفواتير:', error);
      throw new Error('فشل في جلب قائمة الفواتير');
    }
  }

  /**
   * إنشاء استرجاع (Refund)
   */
  async createRefund(chargeId: string, amount?: number): Promise<{
    refundId: string;
    amount: number;
    status: string;
    createdAt: Date;
  }> {
    try {
      const refund = await this.stripe.refunds.create({
        charge: chargeId,
        amount,
      });

      console.log(`✅ تم إنشاء استرجاع جديد`);
      console.log(`🆔 معرّف الاسترجاع: ${refund.id}`);
      console.log(`💰 المبلغ: ${(refund.amount || 0) / 100}`);
      console.log(`📊 الحالة: ${refund.status}`);

      return {
        refundId: refund.id,
        amount: (refund.amount || 0) / 100,
        status: refund.status || 'succeeded',
        createdAt: new Date(refund.created * 1000),
      };
    } catch (error) {
      console.error('❌ خطأ في إنشاء الاسترجاع:', error);
      throw new Error('فشل في إنشاء الاسترجاع');
    }
  }

  /**
   * التحقق من توقيع Webhook
   */
  verifyWebhookSignature(
    body: string,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
      console.log(`✅ تم التحقق من توقيع Webhook`);
      console.log(`📊 نوع الحدث: ${event.type}`);
      return event;
    } catch (error) {
      console.error('❌ خطأ في التحقق من توقيع Webhook:', error);
      throw new Error('فشل في التحقق من توقيع Webhook');
    }
  }

  /**
   * معالجة حدث الدفع الناجح
   */
  async handlePaymentSuccess(event: Stripe.Event): Promise<{
    customerId: string;
    subscriptionId: string;
    status: string;
  }> {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log(`✅ تم معالجة حدث الدفع الناجح`);
    console.log(`🆔 معرّف الجلسة: ${session.id}`);
    console.log(`👤 معرّف العميل: ${session.customer}`);
    console.log(`📊 حالة الدفع: ${session.payment_status}`);

    return {
      customerId: session.customer as string,
      subscriptionId: session.subscription as string,
      status: 'succeeded',
    };
  }

  /**
   * معالجة حدث فشل الدفع
   */
  async handlePaymentFailed(event: Stripe.Event): Promise<{
    customerId: string;
    status: string;
    error: string;
  }> {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log(`❌ تم معالجة حدث فشل الدفع`);
    console.log(`🆔 معرّف الجلسة: ${session.id}`);
    console.log(`👤 معرّف العميل: ${session.customer}`);
    console.log(`📊 حالة الدفع: ${session.payment_status}`);

    return {
      customerId: session.customer as string,
      status: 'failed',
      error: 'فشل في معالجة الدفع',
    };
  }

  /**
   * معالجة حدث تجديد الاشتراك
   */
  async handleSubscriptionRenewed(event: Stripe.Event): Promise<{
    subscriptionId: string;
    customerId: string;
    status: string;
  }> {
    const subscription = event.data.object as Stripe.Subscription;

    console.log(`✅ تم معالجة حدث تجديد الاشتراك`);
    console.log(`🆔 معرّف الاشتراك: ${subscription.id}`);
    console.log(`👤 معرّف العميل: ${subscription.customer}`);
    console.log(`📊 الحالة: ${subscription.status}`);

    return {
      subscriptionId: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status,
    };
  }

  /**
   * معالجة حدث إلغاء الاشتراك
   */
  async handleSubscriptionCanceled(event: Stripe.Event): Promise<{
    subscriptionId: string;
    customerId: string;
    status: string;
  }> {
    const subscription = event.data.object as Stripe.Subscription;

    console.log(`✅ تم معالجة حدث إلغاء الاشتراك`);
    console.log(`🆔 معرّف الاشتراك: ${subscription.id}`);
    console.log(`👤 معرّف العميل: ${subscription.customer}`);
    console.log(`📊 الحالة: ${subscription.status}`);

    return {
      subscriptionId: subscription.id,
      customerId: subscription.customer as string,
      status: subscription.status,
    };
  }
}

/**
 * إنشاء خدمة الدفع
 */
export const createStripePaymentService = (apiKey: string): StripePaymentService => {
  return new StripePaymentService(apiKey);
};

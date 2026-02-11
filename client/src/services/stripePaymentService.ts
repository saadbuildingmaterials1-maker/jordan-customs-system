/**
 * Stripe Payment Integration Service
 * خدمة دمج الدفع عبر Stripe
 * 
 * الميزات:
 * - إنشاء جلسات الدفع
 * - معالجة الدفع الآمنة
 * - إدارة العملاء
 * - تتبع المدفوعات
 * - دعم العملات المختلفة
 * - الفواتير التلقائية
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

interface StripeConfig {
  publishableKey: string;
  secretKey?: string;
}

interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'processing' | 'requires_action' | 'requires_payment_method' | 'canceled';
}

interface CheckoutSession {
  id: string;
  url: string;
  amount: number;
  currency: string;
  status: 'open' | 'complete' | 'expired';
}

interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate?: Date;
  pdfUrl?: string;
}

class StripePaymentService {
  private stripe: Stripe | null = null;
  private config: StripeConfig;

  constructor(config: StripeConfig) {
    this.config = config;
    this.initializeStripe();
  }

  /**
   * تهيئة Stripe
   */
  private async initializeStripe(): Promise<void> {
    if (!this.config.publishableKey) {
      console.error('Stripe publishable key is not configured');
      return;
    }

    this.stripe = await loadStripe(this.config.publishableKey);
  }

  /**
   * إنشاء جلسة دفع (Checkout Session)
   */
  async createCheckoutSession(options: {
    items: Array<{
      name: string;
      description?: string;
      amount: number;
      currency: string;
      quantity: number;
    }>;
    customerEmail?: string;
    customerName?: string;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
  }): Promise<CheckoutSession> {
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const session = await response.json();
      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * إعادة توجيه إلى صفحة الدفع
   * ملاحظة: redirectToCheckout لم تعد مدعومة في Stripe.js v3
   * استخدم بدلاً منها فتح الرابط مباشرة
   */
  async redirectToCheckout(checkoutUrl: string): Promise<void> {
    if (!checkoutUrl) {
      throw new Error('Checkout URL is required');
    }

    // فتح صفحة الدفع في نفس النافذة
    window.location.href = checkoutUrl;
  }

  /**
   * فتح صفحة الدفع في نافذة جديدة
   */
  async openCheckoutInNewWindow(sessionUrl: string): Promise<Window | null> {
    return window.open(sessionUrl, '_blank');
  }

  /**
   * إنشاء نية دفع (Payment Intent)
   */
  async createPaymentIntent(options: {
    amount: number;
    currency: string;
    customerEmail?: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentIntent> {
    try {
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const intent = await response.json();
      return intent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * تأكيد نية الدفع
   */
  async confirmPaymentIntent(
    clientSecret: string,
    paymentMethod: any
  ): Promise<PaymentIntent> {
    try {
      if (!this.stripe) {
        throw new Error('Stripe not initialized');
      }

      const { paymentIntent, error } = await this.stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod,
        }
      );

      if (error) {
        throw error;
      }

      if (!paymentIntent) {
        throw new Error('Payment intent not returned');
      }

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret || '',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status as any,
      };
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      throw error;
    }
  }

  /**
   * إنشاء عميل (Customer)
   */
  async createCustomer(options: {
    email: string;
    name: string;
    phone?: string;
    description?: string;
  }): Promise<Customer> {
    try {
      const response = await fetch('/api/stripe/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      const customer = await response.json();
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * الحصول على عميل
   */
  async getCustomer(customerId: string): Promise<Customer> {
    try {
      const response = await fetch(`/api/stripe/customer/${customerId}`);

      if (!response.ok) {
        throw new Error('Failed to get customer');
      }

      const customer = await response.json();
      return customer;
    } catch (error) {
      console.error('Error getting customer:', error);
      throw error;
    }
  }

  /**
   * تحديث عميل
   */
  async updateCustomer(
    customerId: string,
    options: Partial<Customer>
  ): Promise<Customer> {
    try {
      const response = await fetch(`/api/stripe/customer/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Failed to update customer');
      }

      const customer = await response.json();
      return customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  /**
   * إنشاء فاتورة
   */
  async createInvoice(options: {
    customerId: string;
    items: Array<{
      description: string;
      amount: number;
      quantity: number;
    }>;
    currency: string;
    dueDate?: Date;
    description?: string;
  }): Promise<Invoice> {
    try {
      const response = await fetch('/api/stripe/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      const invoice = await response.json();
      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * الحصول على فاتورة
   */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const response = await fetch(`/api/stripe/invoice/${invoiceId}`);

      if (!response.ok) {
        throw new Error('Failed to get invoice');
      }

      const invoice = await response.json();
      return invoice;
    } catch (error) {
      console.error('Error getting invoice:', error);
      throw error;
    }
  }

  /**
   * إرسال فاتورة
   */
  async sendInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const response = await fetch(`/api/stripe/invoice/${invoiceId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }

      const invoice = await response.json();
      return invoice;
    } catch (error) {
      console.error('Error sending invoice:', error);
      throw error;
    }
  }

  /**
   * الحصول على رابط PDF للفاتورة
   */
  async getInvoicePdfUrl(invoiceId: string): Promise<string> {
    try {
      const response = await fetch(`/api/stripe/invoice/${invoiceId}/pdf`);

      if (!response.ok) {
        throw new Error('Failed to get invoice PDF');
      }

      const data = await response.json();
      return data.pdfUrl;
    } catch (error) {
      console.error('Error getting invoice PDF:', error);
      throw error;
    }
  }

  /**
   * الحصول على سجل الدفعات
   */
  async getPaymentHistory(
    customerId: string,
    options?: {
      limit?: number;
      startingAfter?: string;
    }
  ): Promise<PaymentIntent[]> {
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.startingAfter) params.append('starting_after', options.startingAfter);

      const response = await fetch(
        `/api/stripe/customer/${customerId}/payments?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to get payment history');
      }

      const payments = await response.json();
      return payments;
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  }

  /**
   * إلغاء الدفع
   */
  async cancelPayment(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const response = await fetch(
        `/api/stripe/payment-intent/${paymentIntentId}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel payment');
      }

      const intent = await response.json();
      return intent;
    } catch (error) {
      console.error('Error canceling payment:', error);
      throw error;
    }
  }

  /**
   * استرجاع الدفع
   */
  async refundPayment(paymentIntentId: string, amount?: number): Promise<any> {
    try {
      const response = await fetch(
        `/api/stripe/payment-intent/${paymentIntentId}/refund`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to refund payment');
      }

      const refund = await response.json();
      return refund;
    } catch (error) {
      console.error('Error refunding payment:', error);
      throw error;
    }
  }

  /**
   * الحصول على حالة الدفع
   */
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const response = await fetch(
        `/api/stripe/payment-intent/${paymentIntentId}`
      );

      if (!response.ok) {
        throw new Error('Failed to get payment status');
      }

      const intent = await response.json();
      return intent;
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw error;
    }
  }
}

// إنشاء مثيل من الخدمة
const stripeConfig: StripeConfig = {
  publishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
};

export const stripePaymentService = new StripePaymentService(stripeConfig);

export default stripePaymentService;

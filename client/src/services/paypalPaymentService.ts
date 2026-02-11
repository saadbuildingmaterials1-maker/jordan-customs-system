/**
 * PayPal Payment Integration Service
 * خدمة دمج الدفع عبر PayPal
 * 
 * الميزات:
 * - إنشاء طلبات الدفع
 * - معالجة الدفع الآمنة
 * - إدارة الاشتراكات
 * - تتبع المدفوعات
 * - دعم العملات المختلفة
 * - الفواتير التلقائية
 */

interface PayPalConfig {
  clientId: string;
  secretKey?: string;
  environment: 'sandbox' | 'production';
}

interface PayPalOrder {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  payer: {
    email: string;
    name: {
      given_name: string;
      surname: string;
    };
  };
  purchase_units: Array<{
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
    };
  }>;
  links: Array<{
    rel: string;
    href: string;
    method?: string;
  }>;
}

interface PayPalPayment {
  id: string;
  status: 'CREATED' | 'APPROVED' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'PENDING' | 'COMPLETED';
  amount: number;
  currency: string;
  payer: {
    email: string;
    name: string;
  };
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PayPalSubscription {
  id: string;
  status: 'APPROVAL_PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  planId: string;
  subscriber: {
    email: string;
    name: string;
  };
  startDate: Date;
  nextBillingDate?: Date;
}

interface PayPalPlan {
  id: string;
  name: string;
  description?: string;
  type: 'INFINITE' | 'FINITE';
  paymentPreferences: {
    serviceDuration?: number;
    frequency: 'WEEK' | 'MONTH' | 'YEAR';
    frequencyInterval: number;
    cycleExecutions?: number;
    totalCycles?: number;
  };
  taxes?: {
    percentage: string;
  };
}

class PayPalPaymentService {
  private config: PayPalConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: PayPalConfig) {
    this.config = config;
    this.initializeAccessToken();
  }

  /**
   * تهيئة رمز الوصول
   */
  private async initializeAccessToken(): Promise<void> {
    await this.getAccessToken();
  }

  /**
   * الحصول على رمز الوصول
   */
  private async getAccessToken(): Promise<string> {
    // إذا كان الرمز صحيحاً ولم ينته، استخدمه
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken as string;
    }

    try {
      const auth = Buffer.from(
        `${this.config.clientId}:${this.config.secretKey}`
      ).toString('base64');

      const response = await fetch(
        `https://api.${
          this.config.environment === 'sandbox' ? 'sandbox.' : ''
        }paypal.com/v1/oauth2/token`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get PayPal access token');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);

      return this.accessToken as string;
    } catch (error) {
      console.error('Error getting PayPal access token:', error);
      throw error;
    }
  }

  /**
   * إنشاء طلب دفع
   */
  async createOrder(options: {
    items: Array<{
      name: string;
      description?: string;
      unitAmount: {
        currencyCode: string;
        value: string;
      };
      quantity: string;
    }>;
    amount: {
      currencyCode: string;
      value: string;
    };
    payerEmail?: string;
    payerName?: string;
    returnUrl: string;
    cancelUrl: string;
    description?: string;
  }): Promise<PayPalOrder> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `https://api.${
          this.config.environment === 'sandbox' ? 'sandbox.' : ''
        }paypal.com/v2/checkout/orders`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            payer: {
              email_address: options.payerEmail,
              name: {
                given_name: options.payerName?.split(' ')[0] || 'Customer',
                surname: options.payerName?.split(' ')[1] || '',
              },
            },
            purchase_units: [
              {
                reference_id: `order-${Date.now()}`,
                description: options.description,
                amount: {
                  currency_code: options.amount.currencyCode,
                  value: options.amount.value,
                  breakdown: {
                    item_total: {
                      currency_code: options.amount.currencyCode,
                      value: options.amount.value,
                    },
                  },
                },
                items: options.items,
              },
            ],
            application_context: {
              return_url: options.returnUrl,
              cancel_url: options.cancelUrl,
              brand_name: 'Jordan Customs System',
              locale: 'ar_SA',
              landing_page: 'BILLING',
              user_action: 'PAY_NOW',
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create PayPal order');
      }

      const order = await response.json();
      return order;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  }

  /**
   * تأكيد طلب الدفع
   */
  async captureOrder(orderId: string): Promise<PayPalOrder> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `https://api.${
          this.config.environment === 'sandbox' ? 'sandbox.' : ''
        }paypal.com/v2/checkout/orders/${orderId}/capture`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to capture PayPal order');
      }

      const order = await response.json();
      return order;
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      throw error;
    }
  }

  /**
   * الحصول على طلب
   */
  async getOrder(orderId: string): Promise<PayPalOrder> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `https://api.${
          this.config.environment === 'sandbox' ? 'sandbox.' : ''
        }paypal.com/v2/checkout/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get PayPal order');
      }

      const order = await response.json();
      return order;
    } catch (error) {
      console.error('Error getting PayPal order:', error);
      throw error;
    }
  }

  /**
   * إلغاء طلب
   */
  async cancelOrder(orderId: string): Promise<void> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `https://api.${
          this.config.environment === 'sandbox' ? 'sandbox.' : ''
        }paypal.com/v2/checkout/orders/${orderId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel PayPal order');
      }
    } catch (error) {
      console.error('Error canceling PayPal order:', error);
      throw error;
    }
  }

  /**
   * استرجاع الدفع
   */
  async refundCapture(captureId: string, amount?: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `https://api.${
          this.config.environment === 'sandbox' ? 'sandbox.' : ''
        }paypal.com/v2/payments/captures/${captureId}/refund`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            amount
              ? {
                  amount: {
                    value: amount,
                    currency_code: 'USD',
                  },
                }
              : {}
          ),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to refund PayPal capture');
      }

      const refund = await response.json();
      return refund;
    } catch (error) {
      console.error('Error refunding PayPal capture:', error);
      throw error;
    }
  }

  /**
   * إنشاء خطة الاشتراك
   */
  async createBillingPlan(options: {
    name: string;
    description?: string;
    type: 'INFINITE' | 'FINITE';
    frequency: 'WEEK' | 'MONTH' | 'YEAR';
    frequencyInterval: number;
    price: {
      currencyCode: string;
      value: string;
    };
    cycleExecutions?: number;
    totalCycles?: number;
  }): Promise<PayPalPlan> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `https://api.${
          this.config.environment === 'sandbox' ? 'sandbox.' : ''
        }paypal.com/v1/billing/plans`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: options.name,
            description: options.description,
            type: options.type,
            payment_preferences: {
              service_duration: 12,
              frequency: options.frequency,
              frequency_interval: options.frequencyInterval,
              cycle_executions: options.cycleExecutions,
              total_cycles: options.totalCycles,
              setup_fee: {
                currency_code: options.price.currencyCode,
                value: '0',
              },
              setup_fee_failure_action: 'CONTINUE',
              payment_failure_threshold: 3,
            },
            taxes: {
              percentage: '0',
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create PayPal billing plan');
      }

      const plan = await response.json();
      return plan;
    } catch (error) {
      console.error('Error creating PayPal billing plan:', error);
      throw error;
    }
  }

  /**
   * إنشاء اشتراك
   */
  async createSubscription(options: {
    planId: string;
    subscriberEmail: string;
    subscriberName: string;
    startDate?: Date;
    returnUrl: string;
    cancelUrl: string;
  }): Promise<PayPalSubscription> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `https://api.${
          this.config.environment === 'sandbox' ? 'sandbox.' : ''
        }paypal.com/v1/billing/subscriptions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan_id: options.planId,
            subscriber: {
              email_address: options.subscriberEmail,
              name: {
                given_name: options.subscriberName.split(' ')[0],
                surname: options.subscriberName.split(' ')[1] || '',
              },
            },
            start_time: options.startDate?.toISOString() || new Date().toISOString(),
            application_context: {
              brand_name: 'Jordan Customs System',
              locale: 'ar_SA',
              return_url: options.returnUrl,
              cancel_url: options.cancelUrl,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create PayPal subscription');
      }

      const subscription = await response.json();
      return subscription;
    } catch (error) {
      console.error('Error creating PayPal subscription:', error);
      throw error;
    }
  }

  /**
   * الحصول على اشتراك
   */
  async getSubscription(subscriptionId: string): Promise<PayPalSubscription> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `https://api.${
          this.config.environment === 'sandbox' ? 'sandbox.' : ''
        }paypal.com/v1/billing/subscriptions/${subscriptionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get PayPal subscription');
      }

      const subscription = await response.json();
      return subscription;
    } catch (error) {
      console.error('Error getting PayPal subscription:', error);
      throw error;
    }
  }

  /**
   * إلغاء الاشتراك
   */
  async cancelSubscription(subscriptionId: string, reason?: string): Promise<void> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `https://api.${
          this.config.environment === 'sandbox' ? 'sandbox.' : ''
        }paypal.com/v1/billing/subscriptions/${subscriptionId}/cancel`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: reason || 'Customer requested cancellation',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel PayPal subscription');
      }
    } catch (error) {
      console.error('Error canceling PayPal subscription:', error);
      throw error;
    }
  }
}

// إنشاء مثيل من الخدمة
const paypalConfig: PayPalConfig = {
  clientId: process.env.VITE_PAYPAL_CLIENT_ID || '',
  secretKey: process.env.PAYPAL_SECRET_KEY,
  environment: (process.env.PAYPAL_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
};

export const paypalPaymentService = new PayPalPaymentService(paypalConfig);

export default paypalPaymentService;

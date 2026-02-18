import axios from 'axios';

/**
 * HyperPay Service - معالجة الدفع بالدينار الأردني
 * بوابة دفع محلية أردنية موثوقة وآمنة
 */

interface HyperPayConfig {
  apiKey: string;
  merchantId: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

interface PaymentRequest {
  amount: number;
  currency: 'JOD' | 'USD' | 'EUR';
  orderId: string;
  customerEmail: string;
  customerPhone: string;
  description: string;
  returnUrl: string;
}

interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
  message: string;
}

interface PaymentStatus {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  timestamp: Date;
}

export class HyperPayService {
  private config: HyperPayConfig;
  private client: axios.AxiosInstance;

  constructor(config: HyperPayConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  /**
   * إنشاء طلب دفع جديد
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const payload = {
        amount: this.formatAmount(request.amount),
        currency: request.currency,
        orderId: request.orderId,
        customer: {
          email: request.customerEmail,
          phone: request.customerPhone,
        },
        description: request.description,
        returnUrl: request.returnUrl,
        notificationUrl: `${process.env.API_URL}/api/hyperpay/webhook`,
      };

      const response = await this.client.post('/payments/create', payload);

      if (response.data.success) {
        return {
          success: true,
          transactionId: response.data.transactionId,
          paymentUrl: response.data.paymentUrl,
          message: 'تم إنشاء طلب الدفع بنجاح',
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'فشل إنشاء طلب الدفع',
          message: 'حدث خطأ أثناء إنشاء طلب الدفع',
        };
      }
    } catch (error) {
      console.error('HyperPay Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف',
        message: 'فشل الاتصال بخدمة الدفع',
      };
    }
  }

  /**
   * التحقق من حالة الدفع
   */
  async checkPaymentStatus(transactionId: string): Promise<PaymentStatus | null> {
    try {
      const response = await this.client.get(`/payments/${transactionId}/status`);

      if (response.data) {
        return {
          transactionId,
          status: response.data.status,
          amount: response.data.amount,
          currency: response.data.currency,
          timestamp: new Date(response.data.timestamp),
        };
      }
      return null;
    } catch (error) {
      console.error('HyperPay Status Check Error:', error);
      return null;
    }
  }

  /**
   * استرجاع المبلغ (Refund)
   */
  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse> {
    try {
      const payload = {
        transactionId,
        ...(amount && { amount: this.formatAmount(amount) }),
      };

      const response = await this.client.post('/payments/refund', payload);

      if (response.data.success) {
        return {
          success: true,
          message: 'تم استرجاع المبلغ بنجاح',
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'فشل استرجاع المبلغ',
          message: 'حدث خطأ أثناء استرجاع المبلغ',
        };
      }
    } catch (error) {
      console.error('HyperPay Refund Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطأ غير معروف',
        message: 'فشل الاتصال بخدمة الاسترجاع',
      };
    }
  }

  /**
   * التحقق من توقيع Webhook
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.config.apiKey)
        .update(payload)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Webhook Signature Verification Error:', error);
      return false;
    }
  }

  /**
   * تنسيق المبلغ (تحويل إلى فلس)
   */
  private formatAmount(amount: number): number {
    return Math.round(amount * 1000); // تحويل إلى فلس (3 منازل عشرية)
  }

  /**
   * الحصول على حالة الخدمة
   */
  async getServiceStatus(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('HyperPay Service Status Error:', error);
      return false;
    }
  }
}

// إنشاء instance من الخدمة
export const hyperPayService = new HyperPayService({
  apiKey: process.env.HYPERPAY_API_KEY || '',
  merchantId: process.env.HYPERPAY_MERCHANT_ID || '',
  baseUrl: process.env.HYPERPAY_BASE_URL || 'https://api.hyperpay.com',
  environment: (process.env.HYPERPAY_ENV as 'sandbox' | 'production') || 'sandbox',
});

import axios from 'axios';

/**
 * Telr Service - بوابة دفع محلية أردنية
 * خدمة دفع آمنة وموثوقة للتجار في الشرق الأوسط
 */

interface TelrConfig {
  storeId: string;
  apiKey: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

interface PaymentRequest {
  amount: number;
  currency: 'JOD' | 'USD' | 'EUR' | 'AED';
  orderId: string;
  customerEmail: string;
  customerName: string;
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

export class TelrService {
  private config: TelrConfig;
  private client: axios.AxiosInstance;

  constructor(config: TelrConfig) {
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
        storeId: this.config.storeId,
        amount: request.amount,
        currency: request.currency,
        orderId: request.orderId,
        customer: {
          email: request.customerEmail,
          name: request.customerName,
        },
        description: request.description,
        returnUrl: request.returnUrl,
        notificationUrl: `${process.env.API_URL}/api/telr/webhook`,
        language: 'ar',
      };

      const response = await this.client.post('/transactions/create', payload);

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
      console.error('Telr Error:', error);
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
      const response = await this.client.get(`/transactions/${transactionId}`);

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
      console.error('Telr Status Check Error:', error);
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
        ...(amount && { amount }),
      };

      const response = await this.client.post('/transactions/refund', payload);

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
      console.error('Telr Refund Error:', error);
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
   * الحصول على حالة الخدمة
   */
  async getServiceStatus(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Telr Service Status Error:', error);
      return false;
    }
  }
}

// إنشاء instance من الخدمة
export const telrService = new TelrService({
  storeId: process.env.TELR_STORE_ID || '',
  apiKey: process.env.TELR_API_KEY || '',
  baseUrl: process.env.TELR_BASE_URL || 'https://api.telr.com',
  environment: (process.env.TELR_ENV as 'sandbox' | 'production') || 'sandbox',
});

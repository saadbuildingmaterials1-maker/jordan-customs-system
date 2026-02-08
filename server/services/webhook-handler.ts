/**
 * Webhook Handler Service
 * خدمة معالجة Webhook لتأكيد الدفع
 * 
 * تدعم:
 * - Click (كليك) Webhook
 * - Alipay (الباي الصيني) Webhook
 * - PayPal Webhook
 * - معالجة آمنة مع التحقق من التوقيعات
 * 
 * @module server/services/webhook-handler
 */

import crypto from 'crypto';
import axios from 'axios';
import * as db from '../db';

/**
 * أنواع أحداث الدفع
 */
export type PaymentEvent = 
  | 'payment.success' 
  | 'payment.failed' 
  | 'payment.pending' 
  | 'payment.refunded' 
  | 'payment.cancelled';

/**
 * معلومات حدث الدفع
 */
export interface WebhookPayload {
  eventType: PaymentEvent;
  gateway: 'click' | 'alipay' | 'paypal' | 'payfort' | '2checkout';
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed' | 'pending' | 'refunded' | 'cancelled';
  timestamp: string;
  signature?: string;
  metadata?: Record<string, any>;
}

/**
 * استجابة معالجة Webhook
 */
export interface WebhookResponse {
  success: boolean;
  message: string;
  eventId: string;
  processedAt: string;
}

/**
 * خدمة معالجة Webhook
 */
export class WebhookHandlerService {
  private clickWebhookSecret = process.env.CLICK_WEBHOOK_SECRET || 'demo_secret';
  private alipayWebhookSecret = process.env.ALIPAY_WEBHOOK_SECRET || 'demo_secret';
  private paypalWebhookSecret = process.env.PAYPAL_WEBHOOK_SECRET || 'demo_secret';
  private payfortWebhookSecret = process.env.PAYFORT_WEBHOOK_SECRET || 'demo_secret';
  private twoCheckoutWebhookSecret = process.env.TWO_CHECKOUT_WEBHOOK_SECRET || 'demo_secret';

  /**
   * معالجة Webhook من Click (كليك)
   */
  async handleClickWebhook(payload: any, signature: string): Promise<WebhookResponse> {
    try {
      console.log(`🔔 استقبال Webhook من Click: ${payload.orderId}`);

      // التحقق من التوقيع
      if (!this.verifyClickSignature(payload, signature)) {
        console.error('❌ توقيع Click غير صحيح');
        return {
          success: false,
          message: 'توقيع غير صحيح',
          eventId: '',
          processedAt: new Date().toISOString(),
        };
      }

      // تحديد حالة الدفع
      const paymentStatus = this.mapClickStatus(payload.status);
      const eventType = this.mapEventType(paymentStatus);

      // تحديث حالة الطلب في قاعدة البيانات
      await this.updateOrderStatus(
        payload.orderId,
        paymentStatus,
        {
          gateway: 'click',
          paymentId: payload.paymentId,
          amount: payload.amount,
          currency: payload.currency,
          rawPayload: payload,
        }
      );

      // إرسال إشعار للمستخدم
      await this.notifyUser(payload.orderId, eventType, paymentStatus);

      console.log(`✅ تم معالجة Webhook من Click بنجاح: ${payload.orderId}`);

      return {
        success: true,
        message: 'تم استقبال Webhook بنجاح',
        eventId: `click_${payload.orderId}_${Date.now()}`,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ خطأ في معالجة Click Webhook:', error);
      return {
        success: false,
        message: 'فشل في معالجة Webhook',
        eventId: '',
        processedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * معالجة Webhook من Alipay (الباي الصيني)
   */
  async handleAlipayWebhook(payload: any, signature: string): Promise<WebhookResponse> {
    try {
      console.log(`🔔 استقبال Webhook من Alipay: ${payload.orderId}`);

      // التحقق من التوقيع
      if (!this.verifyAlipaySignature(payload, signature)) {
        console.error('❌ توقيع Alipay غير صحيح');
        return {
          success: false,
          message: 'توقيع غير صحيح',
          eventId: '',
          processedAt: new Date().toISOString(),
        };
      }

      // تحديد حالة الدفع
      const paymentStatus = this.mapAlipayStatus(payload.trade_status);
      const eventType = this.mapEventType(paymentStatus);

      // تحديث حالة الطلب
      await this.updateOrderStatus(
        payload.orderId,
        paymentStatus,
        {
          gateway: 'alipay',
          paymentId: payload.trade_no,
          amount: payload.total_amount,
          currency: payload.currency,
          rawPayload: payload,
        }
      );

      // إرسال إشعار
      await this.notifyUser(payload.orderId, eventType, paymentStatus);

      console.log(`✅ تم معالجة Webhook من Alipay بنجاح: ${payload.orderId}`);

      return {
        success: true,
        message: 'تم استقبال Webhook بنجاح',
        eventId: `alipay_${payload.orderId}_${Date.now()}`,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ خطأ في معالجة Alipay Webhook:', error);
      return {
        success: false,
        message: 'فشل في معالجة Webhook',
        eventId: '',
        processedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * معالجة Webhook من PayPal
   */
  async handlePayPalWebhook(payload: any, signature: string): Promise<WebhookResponse> {
    try {
      console.log(`🔔 استقبال Webhook من PayPal: ${payload.resource.id}`);

      // التحقق من التوقيع
      if (!await this.verifyPayPalSignature(payload, signature)) {
        console.error('❌ توقيع PayPal غير صحيح');
        return {
          success: false,
          message: 'توقيع غير صحيح',
          eventId: '',
          processedAt: new Date().toISOString(),
        };
      }

      // تحديد نوع الحدث
      const eventType = payload.event_type;
      const paymentStatus = this.mapPayPalEventType(eventType);

      // استخراج معلومات الطلب
      const orderId = payload.resource.custom_id || payload.resource.invoice_id;
      const amount = payload.resource.amount?.value || 0;
      const currency = payload.resource.amount?.currency_code || 'USD';

      // تحديث حالة الطلب
      await this.updateOrderStatus(
        orderId,
        paymentStatus,
        {
          gateway: 'paypal',
          paymentId: payload.resource.id,
          amount,
          currency,
          rawPayload: payload,
        }
      );

      // إرسال إشعار
      await this.notifyUser(orderId, eventType, paymentStatus);

      console.log(`✅ تم معالجة Webhook من PayPal بنجاح: ${orderId}`);

      return {
        success: true,
        message: 'تم استقبال Webhook بنجاح',
        eventId: `paypal_${orderId}_${Date.now()}`,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ خطأ في معالجة PayPal Webhook:', error);
      return {
        success: false,
        message: 'فشل في معالجة Webhook',
        eventId: '',
        processedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * معالجة Webhook من PayFort (أمازون)
   */
  async handlePayFortWebhook(payload: any, signature: string): Promise<WebhookResponse> {
    try {
      console.log(`🔔 استقبال Webhook من PayFort: ${payload.merchant_reference}`);

      // التحقق من التوقيع
      if (!this.verifyPayFortSignature(payload, signature)) {
        console.error('❌ توقيع PayFort غير صحيح');
        return {
          success: false,
          message: 'توقيع غير صحيح',
          eventId: '',
          processedAt: new Date().toISOString(),
        };
      }

      // تحديد حالة الدفع
      const paymentStatus = this.mapPayFortStatus(payload.response_code);
      const eventType = this.mapEventType(paymentStatus);

      // تحديث حالة الطلب
      await this.updateOrderStatus(
        payload.merchant_reference,
        paymentStatus,
        {
          gateway: 'payfort',
          paymentId: payload.fort_id,
          amount: payload.amount / 100, // PayFort يرسل المبلغ بالفلس
          currency: payload.currency,
          rawPayload: payload,
        }
      );

      // إرسال إشعار
      await this.notifyUser(payload.merchant_reference, eventType, paymentStatus);

      console.log(`✅ تم معالجة Webhook من PayFort بنجاح: ${payload.merchant_reference}`);

      return {
        success: true,
        message: 'تم استقبال Webhook بنجاح',
        eventId: `payfort_${payload.merchant_reference}_${Date.now()}`,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ خطأ في معالجة PayFort Webhook:', error);
      return {
        success: false,
        message: 'فشل في معالجة Webhook',
        eventId: '',
        processedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * معالجة Webhook من 2Checkout
   */
  async handle2CheckoutWebhook(payload: any, signature: string): Promise<WebhookResponse> {
    try {
      console.log(`🔔 استقبال Webhook من 2Checkout: ${payload.merchantOrderId}`);

      // التحقق من التوقيع
      if (!this.verify2CheckoutSignature(payload, signature)) {
        console.error('❌ توقيع 2Checkout غير صحيح');
        return {
          success: false,
          message: 'توقيع غير صحيح',
          eventId: '',
          processedAt: new Date().toISOString(),
        };
      }

      // تحديد حالة الدفع
      const paymentStatus = this.map2CheckoutStatus(payload.type);
      const eventType = this.mapEventType(paymentStatus);

      // تحديث حالة الطلب
      await this.updateOrderStatus(
        payload.merchantOrderId,
        paymentStatus,
        {
          gateway: '2checkout',
          paymentId: payload.refNo,
          amount: payload.amount,
          currency: payload.currency,
          rawPayload: payload,
        }
      );

      // إرسال إشعار
      await this.notifyUser(payload.merchantOrderId, eventType, paymentStatus);

      console.log(`✅ تم معالجة Webhook من 2Checkout بنجاح: ${payload.merchantOrderId}`);

      return {
        success: true,
        message: 'تم استقبال Webhook بنجاح',
        eventId: `2checkout_${payload.merchantOrderId}_${Date.now()}`,
        processedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ خطأ في معالجة 2Checkout Webhook:', error);
      return {
        success: false,
        message: 'فشل في معالجة Webhook',
        eventId: '',
        processedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * التحقق من توقيع Click
   */
  private verifyClickSignature(payload: any, signature: string): boolean {
    const data = JSON.stringify(payload);
    const hash = crypto
      .createHmac('sha256', this.clickWebhookSecret)
      .update(data)
      .digest('hex');
    return hash === signature;
  }

  /**
   * التحقق من توقيع Alipay
   */
  private verifyAlipaySignature(payload: any, signature: string): boolean {
    // Alipay يستخدم RSA-SHA256
    // هنا محاكاة بسيطة
    const data = JSON.stringify(payload);
    const hash = crypto
      .createHmac('sha256', this.alipayWebhookSecret)
      .update(data)
      .digest('hex');
    return hash === signature;
  }

  /**
   * التحقق من توقيع PayPal
   */
  private async verifyPayPalSignature(payload: any, signature: string): Promise<boolean> {
    try {
      // في الإنتاج، يتم التحقق من PayPal API
      // هنا محاكاة بسيطة
      const data = JSON.stringify(payload);
      const hash = crypto
        .createHmac('sha256', this.paypalWebhookSecret)
        .update(data)
        .digest('hex');
      return hash === signature;
    } catch (error) {
      console.error('خطأ في التحقق من PayPal:', error);
      return false;
    }
  }

  /**
   * التحقق من توقيع PayFort
   */
  private verifyPayFortSignature(payload: any, signature: string): boolean {
    const shaRequestPhrase = this.payfortWebhookSecret;
    const data = `${payload.merchant_reference}${payload.amount}${payload.currency}`;
    const hash = crypto
      .createHash('sha256')
      .update(shaRequestPhrase + data + shaRequestPhrase)
      .digest('hex');
    return hash === signature;
  }

  /**
   * التحقق من توقيع 2Checkout
   */
  private verify2CheckoutSignature(payload: any, signature: string): boolean {
    const data = JSON.stringify(payload);
    const hash = crypto
      .createHmac('sha256', this.twoCheckoutWebhookSecret)
      .update(data)
      .digest('hex');
    return hash === signature;
  }

  /**
   * تحويل حالة Click إلى حالة موحدة
   */
  private mapClickStatus(status: string): 'completed' | 'failed' | 'pending' | 'refunded' | 'cancelled' {
    const statusMap: Record<string, any> = {
      'COMPLETED': 'completed',
      'FAILED': 'failed',
      'PENDING': 'pending',
      'REFUNDED': 'refunded',
      'CANCELLED': 'cancelled',
    };
    return statusMap[status] || 'pending';
  }

  /**
   * تحويل حالة Alipay إلى حالة موحدة
   */
  private mapAlipayStatus(status: string): 'completed' | 'failed' | 'pending' | 'refunded' | 'cancelled' {
    const statusMap: Record<string, any> = {
      'TRADE_SUCCESS': 'completed',
      'TRADE_FINISHED': 'completed',
      'TRADE_CLOSED': 'cancelled',
      'TRADE_CLOSED_BY_TAOBAO': 'cancelled',
      'WAIT_BUYER_PAY': 'pending',
      'TRADE_PENDING_REFUND': 'pending',
      'REFUND_SUCCESS': 'refunded',
    };
    return statusMap[status] || 'pending';
  }

  /**
   * تحويل نوع حدث PayPal إلى حالة موحدة
   */
  private mapPayPalEventType(eventType: string): 'completed' | 'failed' | 'pending' | 'refunded' | 'cancelled' {
    const eventMap: Record<string, any> = {
      'PAYMENT.CAPTURE.COMPLETED': 'completed',
      'PAYMENT.CAPTURE.DENIED': 'failed',
      'PAYMENT.CAPTURE.PENDING': 'pending',
      'PAYMENT.CAPTURE.REFUNDED': 'refunded',
      'PAYMENT.CAPTURE.REVERSED': 'refunded',
    };
    return eventMap[eventType] || 'pending';
  }

  /**
   * تحويل رمز استجابة PayFort إلى حالة موحدة
   */
  private mapPayFortStatus(responseCode: string): 'completed' | 'failed' | 'pending' | 'refunded' | 'cancelled' {
    if (responseCode === '00000') return 'completed';
    if (responseCode === '20001') return 'pending';
    if (responseCode === '20002') return 'refunded';
    return 'failed';
  }

  /**
   * تحويل نوع حدث 2Checkout إلى حالة موحدة
   */
  private map2CheckoutStatus(eventType: string): 'completed' | 'failed' | 'pending' | 'refunded' | 'cancelled' {
    const statusMap: Record<string, any> = {
      'PAYMENT_AUTHORIZED': 'completed',
      'PAYMENT_FAILED': 'failed',
      'REFUND_ISSUED': 'refunded',
      'SUBSCRIPTION_STARTED': 'completed',
      'SUBSCRIPTION_CANCELLED': 'cancelled',
    };
    return statusMap[eventType] || 'pending';
  }

  /**
   * تحويل حالة الدفع إلى نوع حدث
   */
  private mapEventType(status: 'completed' | 'failed' | 'pending' | 'refunded' | 'cancelled'): PaymentEvent {
    const eventMap: Record<string, PaymentEvent> = {
      'completed': 'payment.success',
      'failed': 'payment.failed',
      'pending': 'payment.pending',
      'refunded': 'payment.refunded',
      'cancelled': 'payment.cancelled',
    };
    return eventMap[status] || 'payment.pending';
  }

  /**
   * تحديث حالة الطلب في قاعدة البيانات
   */
  private async updateOrderStatus(
    orderId: string,
    status: 'completed' | 'failed' | 'pending' | 'refunded' | 'cancelled',
    paymentInfo: Record<string, any>
  ): Promise<void> {
    try {
      // هنا يتم تحديث قاعدة البيانات
      // يمكن إضافة جدول للطلبات والدفعات
      console.log(`📝 تحديث حالة الطلب ${orderId} إلى ${status}`);
      console.log(`💳 معلومات الدفع:`, paymentInfo);

      // في الإنتاج، سيتم تحديث قاعدة البيانات هنا
      // await db.updateOrder(orderId, { paymentStatus: status, ...paymentInfo });
    } catch (error) {
      console.error('❌ خطأ في تحديث حالة الطلب:', error);
      throw error;
    }
  }

  /**
   * إرسال إشعار للمستخدم
   */
  private async notifyUser(
    orderId: string,
    eventType: PaymentEvent,
    status: 'completed' | 'failed' | 'pending' | 'refunded' | 'cancelled'
  ): Promise<void> {
    try {
      const messages: Record<PaymentEvent, string> = {
        'payment.success': '✅ تم استقبال الدفع بنجاح!',
        'payment.failed': '❌ فشل الدفع. يرجى المحاولة مجدداً.',
        'payment.pending': '⏳ الدفع قيد المعالجة...',
        'payment.refunded': '💸 تم استرجاع الأموال بنجاح.',
        'payment.cancelled': '❌ تم إلغاء الدفع.',
      };

      const message = messages[eventType];
      console.log(`📬 إرسال إشعار للطلب ${orderId}: ${message}`);

      // في الإنتاج، سيتم إرسال البريد الإلكتروني والإشعارات هنا
      // await notificationService.sendEmail(userId, message);
      // await notificationService.sendPushNotification(userId, message);
    } catch (error) {
      console.error('❌ خطأ في إرسال الإشعار:', error);
    }
  }

  /**
   * إعادة محاولة معالجة Webhook عند الفشل
   */
  async retryWebhookProcessing(
    gateway: string,
    payload: any,
    maxRetries: number = 3
  ): Promise<WebhookResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 محاولة معالجة Webhook (${attempt}/${maxRetries})`);

        switch (gateway) {
          case 'click':
            return await this.handleClickWebhook(payload, payload.signature);
          case 'alipay':
            return await this.handleAlipayWebhook(payload, payload.signature);
          case 'paypal':
            return await this.handlePayPalWebhook(payload, payload.signature);
          case 'payfort':
            return await this.handlePayFortWebhook(payload, payload.signature);
          case '2checkout':
            return await this.handle2CheckoutWebhook(payload, payload.signature);
          default:
            throw new Error(`بوابة غير معروفة: ${gateway}`);
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ محاولة ${attempt} فشلت:`, error);

        // انتظر قبل إعادة المحاولة
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    return {
      success: false,
      message: `فشل بعد ${maxRetries} محاولات: ${lastError?.message}`,
      eventId: '',
      processedAt: new Date().toISOString(),
    };
  }
}

// تصدير مثيل واحد من الخدمة
export const webhookHandlerService = new WebhookHandlerService();

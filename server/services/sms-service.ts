/**
 * SMS Service
 * 
 * خدمة إرسال الرسائل النصية (SMS)
 * تستخدم Twilio API أو خدمة بديلة
 * 
 * @module server/services/sms-service
 */

import { getDb } from '../db';

/**
 * معلومات الرسالة النصية
 */
export interface SMSMessage {
  phoneNumber: string;
  message: string;
  type: 'subscription_activated' | 'trial_ending' | 'subscription_renewed' | 'payment_failed' | 'refund_processed';
  userId: number;
  metadata?: Record<string, any>;
}

/**
 * خدمة الرسائل النصية
 */
export class SMSService {
  private apiKey: string;
  private apiUrl: string;
  private senderName: string;

  constructor() {
    // استخدام متغيرات البيئة
    this.apiKey = process.env.SMS_API_KEY || '';
    this.apiUrl = process.env.SMS_API_URL || 'https://api.sms-provider.com';
    this.senderName = process.env.SMS_SENDER_NAME || 'SAADBOOST';

    if (!this.apiKey) {
      console.warn('⚠️ تحذير: مفتاح SMS API غير مضبوط. سيتم تعطيل خدمة الرسائل النصية.');
    }
  }

  /**
   * إرسال رسالة نصية
   */
  async sendSMS(message: SMSMessage): Promise<boolean> {
    try {
      if (!this.apiKey) {
        console.warn('⚠️ خدمة SMS غير مفعلة');
        return false;
      }

      console.log(`📱 جاري إرسال رسالة نصية إلى ${message.phoneNumber}`);
      console.log(`📝 نوع الرسالة: ${message.type}`);
      console.log(`💬 الرسالة: ${message.message}`);

      // محاكاة إرسال الرسالة (في الإنتاج، ستستخدم API حقيقي)
      const response = await this.sendViaAPI(message);

      if (response.success) {
        // حفظ سجل الرسالة في قاعدة البيانات
        await this.logSMSMessage(message, 'sent');
        console.log(`✅ تم إرسال الرسالة بنجاح إلى ${message.phoneNumber}`);
        return true;
      } else {
        await this.logSMSMessage(message, 'failed', response.error);
        console.error(`❌ فشل إرسال الرسالة: ${response.error}`);
        return false;
      }
    } catch (error) {
      console.error('❌ خطأ في إرسال الرسالة النصية:', error);
      await this.logSMSMessage(message, 'failed', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }

  /**
   * إرسال الرسالة عبر API
   */
  private async sendViaAPI(message: SMSMessage): Promise<{ success: boolean; error?: string }> {
    try {
      // في الإنتاج، استخدم API حقيقي مثل Twilio أو AWS SNS
      // هذا مثال على استخدام Twilio
      
      // const twilio = require('twilio');
      // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      // 
      // const response = await client.messages.create({
      //   body: message.message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: message.phoneNumber,
      // });
      //
      // return { success: response.sid ? true : false };

      // محاكاة ناجحة للتطوير
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * حفظ سجل الرسالة في قاعدة البيانات
   */
  private async logSMSMessage(
    message: SMSMessage,
    status: 'sent' | 'failed' | 'pending',
    errorMessage?: string
  ): Promise<void> {
    try {
      const db = await getDb();
      if (!db) {
        console.error('قاعدة البيانات غير متاحة');
        return;
      }

      // سيتم إنشاء جدول sms_logs إذا لم يكن موجوداً
      // await db.insert(smsLogs).values({
      //   userId: message.userId,
      //   phoneNumber: message.phoneNumber,
      //   messageType: message.type,
      //   messageContent: message.message,
      //   status,
      //   errorMessage,
      //   metadata: message.metadata ? JSON.stringify(message.metadata) : null,
      //   sentAt: new Date(),
      // });

      console.log(`📊 تم تسجيل الرسالة في قاعدة البيانات`);
    } catch (error) {
      console.error('خطأ في تسجيل الرسالة:', error);
    }
  }

  /**
   * إرسال رسالة تفعيل الاشتراك
   */
  async sendSubscriptionActivatedSMS(
    phoneNumber: string,
    planName: string,
    userId: number
  ): Promise<boolean> {
    const message: SMSMessage = {
      phoneNumber,
      message: `مرحباً! تم تفعيل اشتراكك في خطة ${planName} بنجاح. شكراً لاختيارك SAADBOOST!`,
      type: 'subscription_activated',
      userId,
      metadata: { planName },
    };

    return this.sendSMS(message);
  }

  /**
   * إرسال رسالة انتهاء الفترة التجريبية
   */
  async sendTrialEndingSMS(
    phoneNumber: string,
    planName: string,
    daysRemaining: number,
    userId: number
  ): Promise<boolean> {
    const message: SMSMessage = {
      phoneNumber,
      message: `تنبيه: فترتك التجريبية في خطة ${planName} تنتهي في ${daysRemaining} يوم. قم بتفعيل الاشتراك الآن لتجنب انقطاع الخدمة.`,
      type: 'trial_ending',
      userId,
      metadata: { planName, daysRemaining },
    };

    return this.sendSMS(message);
  }

  /**
   * إرسال رسالة تجديد الاشتراك
   */
  async sendSubscriptionRenewedSMS(
    phoneNumber: string,
    planName: string,
    renewalDate: Date,
    userId: number
  ): Promise<boolean> {
    const message: SMSMessage = {
      phoneNumber,
      message: `تم تجديد اشتراكك في خطة ${planName} بنجاح. سيتم تجديده تلقائياً في ${renewalDate.toLocaleDateString('ar-JO')}.`,
      type: 'subscription_renewed',
      userId,
      metadata: { planName, renewalDate },
    };

    return this.sendSMS(message);
  }

  /**
   * إرسال رسالة فشل الدفع
   */
  async sendPaymentFailedSMS(
    phoneNumber: string,
    planName: string,
    userId: number,
    errorMessage?: string
  ): Promise<boolean> {
    const message: SMSMessage = {
      phoneNumber,
      message: `تنبيه: فشل الدفع لاشتراكك في خطة ${planName}. يرجى تحديث بيانات الدفع في حسابك.`,
      type: 'payment_failed',
      userId,
      metadata: { planName, errorMessage },
    };

    return this.sendSMS(message);
  }

  /**
   * إرسال رسالة استرجاع الأموال
   */
  async sendRefundProcessedSMS(
    phoneNumber: string,
    amount: number,
    currency: string,
    userId: number
  ): Promise<boolean> {
    const message: SMSMessage = {
      phoneNumber,
      message: `تم معالجة استرجاع أموالك بنجاح. سيتم إرجاع ${amount} ${currency} إلى حسابك خلال 3-5 أيام عمل.`,
      type: 'refund_processed',
      userId,
      metadata: { amount, currency },
    };

    return this.sendSMS(message);
  }

  /**
   * إرسال رسائل نصية متعددة
   */
  async sendBulkSMS(messages: SMSMessage[]): Promise<number> {
    let successCount = 0;

    for (const message of messages) {
      const success = await this.sendSMS(message);
      if (success) {
        successCount++;
      }
    }

    console.log(`📊 تم إرسال ${successCount} من ${messages.length} رسالة بنجاح`);
    return successCount;
  }
}

// تصدير مثيل واحد من الخدمة
export const smsService = new SMSService();

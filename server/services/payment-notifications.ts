/**
 * Payment Notifications Service
 * خدمة الإشعارات المتقدمة للدفع
 * 
 * تدعم:
 * - إرسال بريد إلكتروني
 * - إشعارات فورية (Push Notifications)
 * - إشعارات SMS
 * - إشعارات في التطبيق
 * 
 * @module server/services/payment-notifications
 */

import nodemailer from 'nodemailer';
import { notifyOwner } from '../_core/notification';

/**
 * أنواع الإشعارات
 */
export type NotificationType = 'email' | 'push' | 'sms' | 'in-app' | 'all';

/**
 * حالات الدفع
 */
export type PaymentStatus = 'completed' | 'failed' | 'pending' | 'refunded' | 'cancelled';

/**
 * معلومات الإشعار
 */
export interface NotificationPayload {
  userId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway: string;
  userEmail?: string;
  userName?: string;
  phoneNumber?: string;
  metadata?: Record<string, any>;
}

/**
 * استجابة الإشعار
 */
export interface NotificationResponse {
  success: boolean;
  message: string;
  channels: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    inApp?: boolean;
  };
  sentAt: string;
}

/**
 * خدمة الإشعارات
 */
export class PaymentNotificationsService {
  private emailTransporter: any;
  private smsProvider: any;
  private pushProvider: any;

  constructor() {
    this.initializeEmailTransporter();
    this.initializeSmsProvider();
    this.initializePushProvider();
  }

  /**
   * تهيئة خدمة البريد الإلكتروني
   */
  private initializeEmailTransporter() {
    // في الإنتاج، استخدم بيانات اعتماد حقيقية
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'noreply@example.com',
        pass: process.env.SMTP_PASSWORD || 'password',
      },
    });
  }

  /**
   * تهيئة مزود خدمة SMS
   */
  private initializeSmsProvider() {
    // يمكن استخدام Twilio أو خدمة أخرى
    this.smsProvider = {
      accountSid: process.env.SMS_ACCOUNT_SID || 'demo',
      authToken: process.env.SMS_AUTH_TOKEN || 'demo',
    };
  }

  /**
   * تهيئة مزود خدمة Push Notifications
   */
  private initializePushProvider() {
    // يمكن استخدام Firebase Cloud Messaging
    this.pushProvider = {
      apiKey: process.env.FCM_API_KEY || 'demo',
      projectId: process.env.FCM_PROJECT_ID || 'demo',
    };
  }

  /**
   * إرسال إشعار شامل
   */
  async sendNotification(
    payload: NotificationPayload,
    notificationType: NotificationType = 'all'
  ): Promise<NotificationResponse> {
    const response: NotificationResponse = {
      success: true,
      message: 'تم إرسال الإشعارات بنجاح',
      channels: {},
      sentAt: new Date().toISOString(),
    };

    try {
      // إرسال البريد الإلكتروني
      if (notificationType === 'email' || notificationType === 'all') {
        response.channels.email = await this.sendEmailNotification(payload);
      }

      // إرسال إشعار Push
      if (notificationType === 'push' || notificationType === 'all') {
        response.channels.push = await this.sendPushNotification(payload);
      }

      // إرسال SMS
      if (notificationType === 'sms' || notificationType === 'all') {
        response.channels.sms = await this.sendSmsNotification(payload);
      }

      // إرسال إشعار في التطبيق
      if (notificationType === 'in-app' || notificationType === 'all') {
        response.channels.inApp = await this.sendInAppNotification(payload);
      }

      // إرسال إشعار للمالك
      await this.notifyOwnerOfPayment(payload);

      console.log(`✅ تم إرسال الإشعارات للطلب ${payload.orderId}`);
    } catch (error) {
      console.error('❌ خطأ في إرسال الإشعارات:', error);
      response.success = false;
      response.message = 'فشل في إرسال بعض الإشعارات';
    }

    return response;
  }

  /**
   * إرسال بريد إلكتروني
   */
  private async sendEmailNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      if (!payload.userEmail) {
        console.warn('⚠️ لا يوجد بريد إلكتروني للمستخدم');
        return false;
      }

      const { subject, html } = this.generateEmailContent(payload);

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@customs-system.com',
        to: payload.userEmail,
        subject,
        html,
      });

      console.log(`📧 تم إرسال بريد إلكتروني إلى ${payload.userEmail}`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في إرسال البريد الإلكتروني:', error);
      return false;
    }
  }

  /**
   * إرسال إشعار Push
   */
  private async sendPushNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      const { title, body } = this.generatePushContent(payload);

      // في الإنتاج، استخدم Firebase Cloud Messaging
      console.log(`🔔 إرسال Push Notification: ${title}`);
      console.log(`   المستخدم: ${payload.userId}`);
      console.log(`   الرسالة: ${body}`);

      return true;
    } catch (error) {
      console.error('❌ خطأ في إرسال Push Notification:', error);
      return false;
    }
  }

  /**
   * إرسال SMS
   */
  private async sendSmsNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      if (!payload.phoneNumber) {
        console.warn('⚠️ لا يوجد رقم هاتف للمستخدم');
        return false;
      }

      const message = this.generateSmsContent(payload);

      // في الإنتاج، استخدم Twilio أو خدمة أخرى
      console.log(`📱 إرسال SMS إلى ${payload.phoneNumber}`);
      console.log(`   الرسالة: ${message}`);

      return true;
    } catch (error) {
      console.error('❌ خطأ في إرسال SMS:', error);
      return false;
    }
  }

  /**
   * إرسال إشعار في التطبيق
   */
  private async sendInAppNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      const { title, body } = this.generateInAppContent(payload);

      // في الإنتاج، احفظ في قاعدة البيانات
      console.log(`💬 إنشاء إشعار في التطبيق`);
      console.log(`   المستخدم: ${payload.userId}`);
      console.log(`   العنوان: ${title}`);
      console.log(`   الرسالة: ${body}`);

      return true;
    } catch (error) {
      console.error('❌ خطأ في إنشاء إشعار في التطبيق:', error);
      return false;
    }
  }

  /**
   * إرسال إشعار للمالك
   */
  private async notifyOwnerOfPayment(payload: NotificationPayload): Promise<void> {
    try {
      const statusText = this.getStatusText(payload.status);
      const content = `
        تم استقبال دفعة جديدة:
        - رقم الطلب: ${payload.orderId}
        - المبلغ: ${payload.amount} ${payload.currency}
        - الحالة: ${statusText}
        - البوابة: ${payload.gateway}
        - المستخدم: ${payload.userName || 'غير معروف'}
      `;

      await notifyOwner({
        title: `دفعة جديدة - ${statusText}`,
        content,
      });

      console.log(`👨‍💼 تم إرسال إشعار للمالك`);
    } catch (error) {
      console.error('❌ خطأ في إرسال إشعار المالك:', error);
    }
  }

  /**
   * توليد محتوى البريد الإلكتروني
   */
  private generateEmailContent(payload: NotificationPayload): {
    subject: string;
    html: string;
  } {
    const statusText = this.getStatusText(payload.status);
    const statusColor = this.getStatusColor(payload.status);
    const statusEmoji = this.getStatusEmoji(payload.status);

    const subject = `${statusEmoji} ${statusText} - طلبك رقم ${payload.orderId}`;

    const html = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
          .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
          .status { 
            background-color: ${statusColor}; 
            color: white; 
            padding: 15px; 
            border-radius: 5px; 
            text-align: center; 
            font-size: 18px; 
            margin: 20px 0;
          }
          .details { margin: 20px 0; }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 10px 0; 
            border-bottom: 1px solid #eee;
          }
          .label { font-weight: bold; color: #333; }
          .value { color: #666; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          .button { 
            display: inline-block; 
            background-color: #007bff; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>نظام إدارة الجمارك والشحن</h1>
          </div>
          
          <div class="status">
            ${statusEmoji} ${statusText}
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">رقم الطلب:</span>
              <span class="value">${payload.orderId}</span>
            </div>
            <div class="detail-row">
              <span class="label">المبلغ:</span>
              <span class="value">${payload.amount.toLocaleString()} ${payload.currency}</span>
            </div>
            <div class="detail-row">
              <span class="label">بوابة الدفع:</span>
              <span class="value">${payload.gateway}</span>
            </div>
            <div class="detail-row">
              <span class="label">التاريخ والوقت:</span>
              <span class="value">${new Date().toLocaleString('ar-JO')}</span>
            </div>
          </div>
          
          ${this.getEmailMessage(payload.status)}
          
          <a href="${process.env.APP_URL || 'https://customs-system.com'}/orders/${payload.orderId}" class="button">
            عرض تفاصيل الطلب
          </a>
          
          <div class="footer">
            <p>هذا البريد الإلكتروني تم إرساله تلقائياً. يرجى عدم الرد عليه.</p>
            <p>© 2026 نظام إدارة الجمارك والشحن. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return { subject, html };
  }

  /**
   * توليد محتوى Push Notification
   */
  private generatePushContent(payload: NotificationPayload): {
    title: string;
    body: string;
  } {
    const statusText = this.getStatusText(payload.status);
    const statusEmoji = this.getStatusEmoji(payload.status);

    return {
      title: `${statusEmoji} ${statusText}`,
      body: `الطلب ${payload.orderId}: ${payload.amount} ${payload.currency}`,
    };
  }

  /**
   * توليد محتوى SMS
   */
  private generateSmsContent(payload: NotificationPayload): string {
    const statusText = this.getStatusText(payload.status);
    const statusEmoji = this.getStatusEmoji(payload.status);

    return `${statusEmoji} ${statusText} - طلبك رقم ${payload.orderId} بمبلغ ${payload.amount} ${payload.currency}. شكراً لاستخدامك خدماتنا.`;
  }

  /**
   * توليد محتوى الإشعار في التطبيق
   */
  private generateInAppContent(payload: NotificationPayload): {
    title: string;
    body: string;
  } {
    const statusText = this.getStatusText(payload.status);
    const statusEmoji = this.getStatusEmoji(payload.status);

    return {
      title: `${statusEmoji} ${statusText}`,
      body: `تم ${this.getActionText(payload.status)} الطلب ${payload.orderId}`,
    };
  }

  /**
   * الحصول على نص الحالة
   */
  private getStatusText(status: PaymentStatus): string {
    const statusMap: Record<PaymentStatus, string> = {
      completed: 'تم استقبال الدفع بنجاح',
      failed: 'فشل الدفع',
      pending: 'الدفع قيد المعالجة',
      refunded: 'تم استرجاع الأموال',
      cancelled: 'تم إلغاء الدفع',
    };
    return statusMap[status];
  }

  /**
   * الحصول على لون الحالة
   */
  private getStatusColor(status: PaymentStatus): string {
    const colorMap: Record<PaymentStatus, string> = {
      completed: '#28a745',
      failed: '#dc3545',
      pending: '#ffc107',
      refunded: '#17a2b8',
      cancelled: '#6c757d',
    };
    return colorMap[status];
  }

  /**
   * الحصول على emoji الحالة
   */
  private getStatusEmoji(status: PaymentStatus): string {
    const emojiMap: Record<PaymentStatus, string> = {
      completed: '✅',
      failed: '❌',
      pending: '⏳',
      refunded: '💸',
      cancelled: '🚫',
    };
    return emojiMap[status];
  }

  /**
   * الحصول على رسالة البريد الإلكتروني
   */
  private getEmailMessage(status: PaymentStatus): string {
    const messages: Record<PaymentStatus, string> = {
      completed: `
        <p style="color: #28a745; font-size: 16px;">
          شكراً لك! تم استقبال دفعتك بنجاح. سيتم معالجة طلبك قريباً.
        </p>
      `,
      failed: `
        <p style="color: #dc3545; font-size: 16px;">
          للأسف، فشلت عملية الدفع. يرجى المحاولة مجدداً أو الاتصال بالدعم الفني.
        </p>
      `,
      pending: `
        <p style="color: #ffc107; font-size: 16px;">
          دفعتك قيد المعالجة. سنخبرك بالنتيجة قريباً.
        </p>
      `,
      refunded: `
        <p style="color: #17a2b8; font-size: 16px;">
          تم استرجاع أموالك بنجاح. سيصل المبلغ إلى حسابك خلال 3-5 أيام عمل.
        </p>
      `,
      cancelled: `
        <p style="color: #6c757d; font-size: 16px;">
          تم إلغاء طلبك. إذا كان لديك أي استفسارات، يرجى الاتصال بنا.
        </p>
      `,
    };
    return messages[status];
  }

  /**
   * الحصول على نص الإجراء
   */
  private getActionText(status: PaymentStatus): string {
    const actionMap: Record<PaymentStatus, string> = {
      completed: 'استقبال',
      failed: 'فشل',
      pending: 'معالجة',
      refunded: 'استرجاع',
      cancelled: 'إلغاء',
    };
    return actionMap[status];
  }

  /**
   * إرسال إشعار تذكير الدفع
   */
  async sendPaymentReminder(payload: NotificationPayload): Promise<NotificationResponse> {
    try {
      const reminderPayload = {
        ...payload,
        status: 'pending' as PaymentStatus,
      };

      return await this.sendNotification(reminderPayload, 'email');
    } catch (error) {
      console.error('❌ خطأ في إرسال تذكير الدفع:', error);
      return {
        success: false,
        message: 'فشل في إرسال التذكير',
        channels: {},
        sentAt: new Date().toISOString(),
      };
    }
  }

  /**
   * إرسال إشعار استقبال الفاتورة
   */
  async sendInvoiceNotification(
    payload: NotificationPayload,
    invoiceUrl: string
  ): Promise<NotificationResponse> {
    try {
      console.log(`📄 إرسال إشعار الفاتورة: ${invoiceUrl}`);

      const response = await this.sendNotification(payload, 'email');
      return response;
    } catch (error) {
      console.error('❌ خطأ في إرسال إشعار الفاتورة:', error);
      return {
        success: false,
        message: 'فشل في إرسال الفاتورة',
        channels: {},
        sentAt: new Date().toISOString(),
      };
    }
  }

  /**
   * إرسال إشعار تقرير يومي
   */
  async sendDailyReport(
    recipientEmail: string,
    reportData: {
      totalPayments: number;
      successfulPayments: number;
      failedPayments: number;
      totalAmount: number;
      currency: string;
    }
  ): Promise<boolean> {
    try {
      const html = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
            .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .stat-box { background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #007bff; }
            .stat-label { color: #666; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>التقرير اليومي للمدفوعات</h1>
              <p>${new Date().toLocaleDateString('ar-JO')}</p>
            </div>
            
            <div class="stats">
              <div class="stat-box">
                <div class="stat-value">${reportData.totalPayments}</div>
                <div class="stat-label">إجمالي المدفوعات</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${reportData.successfulPayments}</div>
                <div class="stat-label">المدفوعات الناجحة</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${reportData.failedPayments}</div>
                <div class="stat-label">المدفوعات الفاشلة</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${reportData.totalAmount.toLocaleString()}</div>
                <div class="stat-label">المبلغ الإجمالي (${reportData.currency})</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@customs-system.com',
        to: recipientEmail,
        subject: `التقرير اليومي للمدفوعات - ${new Date().toLocaleDateString('ar-JO')}`,
        html,
      });

      console.log(`📊 تم إرسال التقرير اليومي إلى ${recipientEmail}`);
      return true;
    } catch (error) {
      console.error('❌ خطأ في إرسال التقرير اليومي:', error);
      return false;
    }
  }
}

// تصدير مثيل واحد من الخدمة
export const paymentNotificationsService = new PaymentNotificationsService();

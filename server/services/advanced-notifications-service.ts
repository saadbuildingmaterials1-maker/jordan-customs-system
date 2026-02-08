/**
 * Advanced Notifications Service
 * خدمة الإشعارات المتقدمة
 * 
 * تدعم:
 * - إشعارات البريد الإلكتروني
 * - إشعارات SMS
 * - إشعارات Push
 * - إشعارات في التطبيق
 * - إشعارات للمالك
 * 
 * @module server/services/advanced-notifications-service
 */

/**
 * أنواع الإشعارات
 */
export type NotificationType = 'email' | 'sms' | 'push' | 'in_app' | 'owner';

/**
 * أنواع أحداث الإشعارات
 */
export type NotificationEvent =
  | 'payment.success'
  | 'payment.failed'
  | 'payment.pending'
  | 'order.created'
  | 'order.updated'
  | 'order.completed'
  | 'invoice.created'
  | 'invoice.paid'
  | 'report.generated';

/**
 * بيانات الإشعار
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  event: NotificationEvent;
  title: string;
  message: string;
  data?: Record<string, any>;
  recipient: string; // email, phone, or user ID
  status: 'pending' | 'sent' | 'failed' | 'read';
  createdAt: string;
  sentAt?: string;
  readAt?: string;
}

/**
 * قالب الإشعار
 */
export interface NotificationTemplate {
  id: string;
  event: NotificationEvent;
  type: NotificationType;
  subject?: string;
  title: string;
  message: string;
  template: string;
}

/**
 * خدمة الإشعارات المتقدمة
 */
export class AdvancedNotificationsService {
  private notifications: Map<string, Notification> = new Map();
  private templates: Map<string, NotificationTemplate> = new Map();
  private notificationQueue: Notification[] = [];

  constructor() {
    this.initializeTemplates();
  }

  /**
   * تهيئة قوالب الإشعارات
   */
  private initializeTemplates(): void {
    // قالب إشعار نجاح الدفع
    this.templates.set('payment.success_email', {
      id: 'payment.success_email',
      event: 'payment.success',
      type: 'email',
      subject: 'تم تأكيد الدفع بنجاح',
      title: 'تم تأكيد الدفع',
      message: 'شكراً! تم استلام دفعتك بنجاح. رقم المعاملة: {{transactionId}}',
      template: `
        <h2>تم تأكيد الدفع بنجاح</h2>
        <p>شكراً على دفعتك!</p>
        <p><strong>رقم المعاملة:</strong> {{transactionId}}</p>
        <p><strong>المبلغ:</strong> {{amount}} {{currency}}</p>
        <p><strong>التاريخ:</strong> {{date}}</p>
      `,
    });

    // قالب إشعار فشل الدفع
    this.templates.set('payment.failed_email', {
      id: 'payment.failed_email',
      event: 'payment.failed',
      type: 'email',
      subject: 'فشل الدفع - يرجى المحاولة مجدداً',
      title: 'فشل الدفع',
      message: 'للأسف، فشل الدفع. يرجى المحاولة مجدداً أو الاتصال بالدعم الفني.',
      template: `
        <h2>فشل الدفع</h2>
        <p>للأسف، فشلت عملية الدفع.</p>
        <p><strong>السبب:</strong> {{reason}}</p>
        <p><strong>رقم المعاملة:</strong> {{transactionId}}</p>
        <p>يرجى المحاولة مجدداً أو الاتصال بالدعم الفني.</p>
      `,
    });

    // قالب إشعار إنشاء الطلب
    this.templates.set('order.created_email', {
      id: 'order.created_email',
      event: 'order.created',
      type: 'email',
      subject: 'تم استلام طلبك',
      title: 'تم استلام الطلب',
      message: 'شكراً! تم استلام طلبك برقم {{orderId}}',
      template: `
        <h2>تم استلام طلبك</h2>
        <p>شكراً على طلبك!</p>
        <p><strong>رقم الطلب:</strong> {{orderId}}</p>
        <p><strong>التاريخ:</strong> {{date}}</p>
        <p>سيتم معالجة طلبك قريباً.</p>
      `,
    });

    // قالب إشعار الفاتورة
    this.templates.set('invoice.created_email', {
      id: 'invoice.created_email',
      event: 'invoice.created',
      type: 'email',
      subject: 'فاتورة جديدة',
      title: 'فاتورة جديدة',
      message: 'تم إنشاء فاتورة جديدة برقم {{invoiceNumber}}',
      template: `
        <h2>فاتورة جديدة</h2>
        <p>تم إنشاء فاتورة جديدة لك.</p>
        <p><strong>رقم الفاتورة:</strong> {{invoiceNumber}}</p>
        <p><strong>المبلغ:</strong> {{amount}} {{currency}}</p>
        <p><strong>تاريخ الاستحقاق:</strong> {{dueDate}}</p>
      `,
    });
  }

  /**
   * إرسال إشعار بريد إلكتروني
   */
  async sendEmailNotification(
    userId: string,
    email: string,
    event: NotificationEvent,
    data: Record<string, any>
  ): Promise<Notification> {
    try {
      console.log(`📧 إرسال إشعار بريد إلكتروني: ${event}`);

      const templateKey = `${event}_email`;
      const template = this.templates.get(templateKey);

      if (!template) {
        throw new Error(`قالب غير موجود: ${templateKey}`);
      }

      // استبدال المتغيرات في الرسالة
      let message = template.message;
      for (const [key, value] of Object.entries(data)) {
        message = message.replace(`{{${key}}}`, String(value));
      }

      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: 'email',
        event,
        title: template.title,
        message,
        data,
        recipient: email,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      this.notifications.set(notification.id, notification);
      this.notificationQueue.push(notification);

      // محاكاة إرسال البريد الإلكتروني
      setTimeout(() => {
        const notif = this.notifications.get(notification.id);
        if (notif) {
          notif.status = 'sent';
          notif.sentAt = new Date().toISOString();
          console.log(`✅ تم إرسال البريد الإلكتروني: ${email}`);
        }
      }, 1000);

      return notification;
    } catch (error: any) {
      console.error('❌ خطأ في إرسال البريد الإلكتروني:', error);
      throw error;
    }
  }

  /**
   * إرسال إشعار SMS
   */
  async sendSMSNotification(
    userId: string,
    phone: string,
    event: NotificationEvent,
    data: Record<string, any>
  ): Promise<Notification> {
    try {
      console.log(`📱 إرسال إشعار SMS: ${event}`);

      const templateKey = `${event}_sms`;
      const template = this.templates.get(templateKey) || {
        id: templateKey,
        event,
        type: 'sms',
        title: 'إشعار',
        message: `إشعار: ${event}`,
        template: `إشعار: {{message}}`,
      };

      // استبدال المتغيرات في الرسالة
      let message = template.message;
      for (const [key, value] of Object.entries(data)) {
        message = message.replace(`{{${key}}}`, String(value));
      }

      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: 'sms',
        event,
        title: template.title,
        message,
        data,
        recipient: phone,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      this.notifications.set(notification.id, notification);
      this.notificationQueue.push(notification);

      // محاكاة إرسال SMS
      setTimeout(() => {
        const notif = this.notifications.get(notification.id);
        if (notif) {
          notif.status = 'sent';
          notif.sentAt = new Date().toISOString();
          console.log(`✅ تم إرسال SMS: ${phone}`);
        }
      }, 1000);

      return notification;
    } catch (error: any) {
      console.error('❌ خطأ في إرسال SMS:', error);
      throw error;
    }
  }

  /**
   * إرسال إشعار Push
   */
  async sendPushNotification(
    userId: string,
    event: NotificationEvent,
    data: Record<string, any>
  ): Promise<Notification> {
    try {
      console.log(`🔔 إرسال إشعار Push: ${event}`);

      const templateKey = `${event}_push`;
      const template = this.templates.get(templateKey) || {
        id: templateKey,
        event,
        type: 'push',
        title: 'إشعار',
        message: `إشعار: ${event}`,
        template: `{{message}}`,
      };

      // استبدال المتغيرات في الرسالة
      let message = template.message;
      for (const [key, value] of Object.entries(data)) {
        message = message.replace(`{{${key}}}`, String(value));
      }

      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: 'push',
        event,
        title: template.title,
        message,
        data,
        recipient: userId,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      this.notifications.set(notification.id, notification);
      this.notificationQueue.push(notification);

      // محاكاة إرسال Push
      setTimeout(() => {
        const notif = this.notifications.get(notification.id);
        if (notif) {
          notif.status = 'sent';
          notif.sentAt = new Date().toISOString();
          console.log(`✅ تم إرسال إشعار Push: ${userId}`);
        }
      }, 1000);

      return notification;
    } catch (error: any) {
      console.error('❌ خطأ في إرسال إشعار Push:', error);
      throw error;
    }
  }

  /**
   * إرسال إشعار في التطبيق
   */
  async sendInAppNotification(
    userId: string,
    event: NotificationEvent,
    data: Record<string, any>
  ): Promise<Notification> {
    try {
      console.log(`💬 إرسال إشعار في التطبيق: ${event}`);

      const templateKey = `${event}_in_app`;
      const template = this.templates.get(templateKey) || {
        id: templateKey,
        event,
        type: 'in_app',
        title: 'إشعار',
        message: `إشعار: ${event}`,
        template: `{{message}}`,
      };

      // استبدال المتغيرات في الرسالة
      let message = template.message;
      for (const [key, value] of Object.entries(data)) {
        message = message.replace(`{{${key}}}`, String(value));
      }

      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: 'in_app',
        event,
        title: template.title,
        message,
        data,
        recipient: userId,
        status: 'sent',
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
      };

      this.notifications.set(notification.id, notification);

      console.log(`✅ تم إرسال إشعار في التطبيق: ${userId}`);

      return notification;
    } catch (error: any) {
      console.error('❌ خطأ في إرسال إشعار في التطبيق:', error);
      throw error;
    }
  }

  /**
   * إرسال إشعار للمالك
   */
  async sendOwnerNotification(
    event: NotificationEvent,
    data: Record<string, any>
  ): Promise<Notification> {
    try {
      console.log(`👑 إرسال إشعار للمالك: ${event}`);

      const templateKey = `${event}_owner`;
      const template = this.templates.get(templateKey) || {
        id: templateKey,
        event,
        type: 'email',
        title: 'إشعار للمالك',
        message: `إشعار: ${event}`,
        template: `{{message}}`,
      };

      // استبدال المتغيرات في الرسالة
      let message = template.message;
      for (const [key, value] of Object.entries(data)) {
        message = message.replace(`{{${key}}}`, String(value));
      }

      const notification: Notification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'owner',
        type: 'owner',
        event,
        title: template.title,
        message,
        data,
        recipient: process.env.OWNER_EMAIL || 'owner@example.com',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      this.notifications.set(notification.id, notification);
      this.notificationQueue.push(notification);

      console.log(`✅ تم إرسال إشعار للمالك`);

      return notification;
    } catch (error: any) {
      console.error('❌ خطأ في إرسال إشعار للمالك:', error);
      throw error;
    }
  }

  /**
   * الحصول على الإشعارات
   */
  async getNotifications(userId: string, status?: string): Promise<Notification[]> {
    let notifications = Array.from(this.notifications.values()).filter((n) => n.userId === userId);

    if (status) {
      notifications = notifications.filter((n) => n.status === status);
    }

    return notifications;
  }

  /**
   * تعليم الإشعار كمقروء
   */
  async markAsRead(notificationId: string): Promise<Notification | null> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return null;
    }

    notification.status = 'read';
    notification.readAt = new Date().toISOString();

    console.log(`✅ تم تعليم الإشعار كمقروء: ${notificationId}`);

    return notification;
  }

  /**
   * حذف الإشعار
   */
  async deleteNotification(notificationId: string): Promise<boolean> {
    return this.notifications.delete(notificationId);
  }

  /**
   * معالجة قائمة الانتظار
   */
  async processQueue(): Promise<void> {
    console.log(`📤 معالجة قائمة الإشعارات (${this.notificationQueue.length} إشعار)`);

    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      if (notification) {
        // محاكاة معالجة الإشعار
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(`✅ تم معالجة جميع الإشعارات`);
  }

  /**
   * الحصول على إحصائيات الإشعارات
   */
  getStatistics(): {
    total: number;
    sent: number;
    pending: number;
    failed: number;
    read: number;
  } {
    const notifications = Array.from(this.notifications.values());
    return {
      total: notifications.length,
      sent: notifications.filter((n) => n.status === 'sent').length,
      pending: notifications.filter((n) => n.status === 'pending').length,
      failed: notifications.filter((n) => n.status === 'failed').length,
      read: notifications.filter((n) => n.status === 'read').length,
    };
  }
}

// تصدير مثيل واحد من الخدمة
export const advancedNotificationsService = new AdvancedNotificationsService();

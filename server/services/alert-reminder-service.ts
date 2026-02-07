/**
 * Alert & Reminder Service
 * 
 * خدمة التنبيهات والتذكيرات المتقدمة
 * إرسال تنبيهات للعملاء عند تحديثات الشحنات والفواتير والعروض
 * 
 * @module server/services/alert-reminder-service
 */

/**
 * أنواع التنبيهات
 */
export type AlertType =
  | 'shipment_update'
  | 'invoice_due'
  | 'low_stock'
  | 'special_offer'
  | 'delivery_confirmation'
  | 'payment_reminder'
  | 'order_confirmation';

/**
 * قنوات التنبيه
 */
export type AlertChannel = 'email' | 'sms' | 'push' | 'in_app';

/**
 * معلومات التنبيه
 */
export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  channels: AlertChannel[];
  data: Record<string, any>;
  createdAt: Date;
  sentAt?: Date;
  readAt?: Date;
  status: 'pending' | 'sent' | 'failed';
}

/**
 * معلومات التذكير
 */
export interface Reminder {
  id: string;
  userId: string;
  title: string;
  description: string;
  dueDate: Date;
  reminderDate: Date;
  channels: AlertChannel[];
  type: 'invoice' | 'shipment' | 'follow_up' | 'custom';
  status: 'pending' | 'sent' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
}

/**
 * إعدادات التنبيهات للمستخدم
 */
export interface UserAlertPreferences {
  userId: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  shipmentUpdates: boolean;
  invoiceReminders: boolean;
  specialOffers: boolean;
  paymentReminders: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
}

/**
 * خدمة التنبيهات والتذكيرات
 */
export class AlertReminderService {
  private alerts: Map<string, Alert> = new Map();
  private reminders: Map<string, Reminder> = new Map();
  private userPreferences: Map<string, UserAlertPreferences> = new Map();

  constructor() {
    console.log('✅ تم تهيئة خدمة التنبيهات والتذكيرات');
  }

  /**
   * إنشاء تنبيه جديد
   */
  createAlert(
    userId: string,
    type: AlertType,
    title: string,
    message: string,
    channels: AlertChannel[],
    data?: Record<string, any>
  ): Alert {
    console.log(`📢 جاري إنشاء تنبيه: ${title}`);

    const alert: Alert = {
      id: `alert-${Date.now()}`,
      userId,
      type,
      title,
      message,
      channels,
      data: data || {},
      createdAt: new Date(),
      status: 'pending',
    };

    this.alerts.set(alert.id, alert);
    this.sendAlert(alert);

    return alert;
  }

  /**
   * إنشاء تذكير جديد
   */
  createReminder(
    userId: string,
    title: string,
    description: string,
    dueDate: Date,
    type: Reminder['type'],
    channels: AlertChannel[] = ['email', 'sms'],
    priority: Reminder['priority'] = 'medium'
  ): Reminder {
    console.log(`⏰ جاري إنشاء تذكير: ${title}`);

    const reminderDate = this.calculateReminderDate(dueDate, priority);

    const reminder: Reminder = {
      id: `reminder-${Date.now()}`,
      userId,
      title,
      description,
      dueDate,
      reminderDate,
      channels,
      type,
      status: 'pending',
      priority,
    };

    this.reminders.set(reminder.id, reminder);
    console.log(`✅ تم إنشاء التذكير: ${reminder.id}`);

    return reminder;
  }

  /**
   * إرسال التنبيه
   */
  private sendAlert(alert: Alert): void {
    try {
      const preferences = this.userPreferences.get(alert.userId);
      const channels = preferences
        ? alert.channels.filter((ch) => this.isChannelEnabled(preferences, ch))
        : alert.channels;

      for (const channel of channels) {
        this.sendViaChannel(channel, alert);
      }

      alert.status = 'sent';
      alert.sentAt = new Date();
      this.alerts.set(alert.id, alert);

      console.log(`✅ تم إرسال التنبيه عبر ${channels.length} قنوات`);
    } catch (error) {
      console.error('❌ خطأ في إرسال التنبيه:', error);
      alert.status = 'failed';
      this.alerts.set(alert.id, alert);
    }
  }

  /**
   * إرسال عبر قناة محددة
   */
  private sendViaChannel(channel: AlertChannel, alert: Alert): void {
    switch (channel) {
      case 'email':
        console.log(`📧 إرسال بريد إلكتروني: ${alert.title}`);
        // محاكاة إرسال البريد
        break;
      case 'sms':
        console.log(`📱 إرسال رسالة نصية: ${alert.title}`);
        // محاكاة إرسال SMS
        break;
      case 'push':
        console.log(`🔔 إرسال إشعار فوري: ${alert.title}`);
        // محاكاة إرسال push notification
        break;
      case 'in_app':
        console.log(`💬 إنشاء إشعار داخل التطبيق: ${alert.title}`);
        // محاكاة إنشاء إشعار داخل التطبيق
        break;
    }
  }

  /**
   * التحقق من تفعيل القناة
   */
  private isChannelEnabled(preferences: UserAlertPreferences, channel: AlertChannel): boolean {
    switch (channel) {
      case 'email':
        return preferences.emailNotifications;
      case 'sms':
        return preferences.smsNotifications;
      case 'push':
        return preferences.pushNotifications;
      case 'in_app':
        return preferences.inAppNotifications;
      default:
        return true;
    }
  }

  /**
   * حساب تاريخ التذكير
   */
  private calculateReminderDate(dueDate: Date, priority: Reminder['priority']): Date {
    const days = {
      high: 7,    // تذكير قبل 7 أيام
      medium: 3,  // تذكير قبل 3 أيام
      low: 1,     // تذكير قبل يوم واحد
    }[priority];

    return new Date(dueDate.getTime() - days * 24 * 60 * 60 * 1000);
  }

  /**
   * تنبيه تحديث الشحنة
   */
  shipmentUpdateAlert(
    userId: string,
    shipmentNumber: string,
    status: string,
    location: string
  ): Alert {
    return this.createAlert(
      userId,
      'shipment_update',
      `تحديث الشحنة ${shipmentNumber}`,
      `شحنتك ${shipmentNumber} الآن ${status} في ${location}`,
      ['email', 'sms', 'push'],
      {
        shipmentNumber,
        status,
        location,
      }
    );
  }

  /**
   * تنبيه الفاتورة المستحقة
   */
  invoiceDueAlert(userId: string, invoiceNumber: string, amount: number, dueDate: Date): Alert {
    return this.createAlert(
      userId,
      'invoice_due',
      `الفاتورة ${invoiceNumber} مستحقة`,
      `الفاتورة ${invoiceNumber} بمبلغ ${amount} مستحقة في ${dueDate.toLocaleDateString('ar-JO')}`,
      ['email', 'sms'],
      {
        invoiceNumber,
        amount,
        dueDate,
      }
    );
  }

  /**
   * تنبيه المخزون المنخفض
   */
  lowStockAlert(userId: string, productName: string, currentStock: number): Alert {
    return this.createAlert(
      userId,
      'low_stock',
      `المخزون منخفض: ${productName}`,
      `المخزون الحالي للمنتج ${productName} هو ${currentStock} فقط`,
      ['email', 'in_app'],
      {
        productName,
        currentStock,
      }
    );
  }

  /**
   * تنبيه العرض الخاص
   */
  specialOfferAlert(userId: string, offerTitle: string, discount: number): Alert {
    return this.createAlert(
      userId,
      'special_offer',
      `عرض خاص: ${offerTitle}`,
      `احصل على خصم ${discount}% على ${offerTitle}`,
      ['email', 'push', 'in_app'],
      {
        offerTitle,
        discount,
      }
    );
  }

  /**
   * تذكير الفاتورة المستحقة
   */
  invoiceDueReminder(
    userId: string,
    invoiceNumber: string,
    amount: number,
    dueDate: Date
  ): Reminder {
    return this.createReminder(
      userId,
      `تذكير: الفاتورة ${invoiceNumber}`,
      `الفاتورة ${invoiceNumber} بمبلغ ${amount} مستحقة في ${dueDate.toLocaleDateString('ar-JO')}`,
      dueDate,
      'invoice',
      ['email', 'sms'],
      'high'
    );
  }

  /**
   * تذكير المتابعة
   */
  followUpReminder(userId: string, shipmentNumber: string, dueDate: Date): Reminder {
    return this.createReminder(
      userId,
      `تذكير متابعة: الشحنة ${shipmentNumber}`,
      `تابع مع العميل بخصوص الشحنة ${shipmentNumber}`,
      dueDate,
      'follow_up',
      ['email', 'in_app'],
      'medium'
    );
  }

  /**
   * الحصول على التنبيهات للمستخدم
   */
  getUserAlerts(userId: string, unreadOnly: boolean = false): Alert[] {
    return Array.from(this.alerts.values())
      .filter((a) => a.userId === userId && (!unreadOnly || !a.readAt))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * الحصول على التذكيرات للمستخدم
   */
  getUserReminders(userId: string, pending: boolean = true): Reminder[] {
    return Array.from(this.reminders.values())
      .filter((r) => r.userId === userId && (!pending || r.status === 'pending'))
      .sort((a, b) => a.reminderDate.getTime() - b.reminderDate.getTime());
  }

  /**
   * وضع علامة على التنبيه كمقروء
   */
  markAlertAsRead(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.readAt = new Date();
      this.alerts.set(alertId, alert);
      return true;
    }
    return false;
  }

  /**
   * إكمال التذكير
   */
  completeReminder(reminderId: string): boolean {
    const reminder = this.reminders.get(reminderId);
    if (reminder) {
      reminder.status = 'completed';
      this.reminders.set(reminderId, reminder);
      console.log(`✅ تم إكمال التذكير: ${reminderId}`);
      return true;
    }
    return false;
  }

  /**
   * تعيين تفضيلات التنبيهات
   */
  setUserPreferences(userId: string, preferences: Partial<UserAlertPreferences>): void {
    const existing = this.userPreferences.get(userId) || {
      userId,
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
      inAppNotifications: true,
      shipmentUpdates: true,
      invoiceReminders: true,
      specialOffers: true,
      paymentReminders: true,
      frequency: 'immediate',
    };

    const updated = { ...existing, ...preferences, userId };
    this.userPreferences.set(userId, updated);
    console.log(`✅ تم تحديث تفضيلات التنبيهات للمستخدم: ${userId}`);
  }

  /**
   * الحصول على تفضيلات المستخدم
   */
  getUserPreferences(userId: string): UserAlertPreferences {
    return (
      this.userPreferences.get(userId) || {
        userId,
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        inAppNotifications: true,
        shipmentUpdates: true,
        invoiceReminders: true,
        specialOffers: true,
        paymentReminders: true,
        frequency: 'immediate',
      }
    );
  }

  /**
   * الحصول على إحصائيات التنبيهات
   */
  getAlertStatistics(userId?: string): any {
    const alerts = userId
      ? Array.from(this.alerts.values()).filter((a) => a.userId === userId)
      : Array.from(this.alerts.values());

    return {
      total: alerts.length,
      sent: alerts.filter((a) => a.status === 'sent').length,
      pending: alerts.filter((a) => a.status === 'pending').length,
      failed: alerts.filter((a) => a.status === 'failed').length,
      unread: alerts.filter((a) => !a.readAt).length,
      byType: {
        shipment_update: alerts.filter((a) => a.type === 'shipment_update').length,
        invoice_due: alerts.filter((a) => a.type === 'invoice_due').length,
        low_stock: alerts.filter((a) => a.type === 'low_stock').length,
        special_offer: alerts.filter((a) => a.type === 'special_offer').length,
      },
    };
  }
}

// تصدير مثيل واحد من الخدمة
export const alertReminderService = new AlertReminderService();

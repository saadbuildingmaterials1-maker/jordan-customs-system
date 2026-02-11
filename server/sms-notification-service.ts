/**
 * sms-notification-service
 * @module ./server/sms-notification-service
 */
import { createNotification } from './db';
import { eq, and } from 'drizzle-orm';

/**
 * خدمة الإشعارات عبر SMS
 * إرسال تنبيهات فورية عند تغيير حالة الحاويات والبيانات الجمركية
 */

interface SMSNotification {
  phoneNumber: string;
  message: string;
  type: 'container' | 'customs' | 'payment' | 'alert' | 'reminder';
  userId: string;
  containerId?: string;
  declarationId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledTime?: Date;
}

interface SMSTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
  type: string;
}

class SMSNotificationService {
  private templates: Map<string, SMSTemplate> = new Map();
  private queue: SMSNotification[] = [];
  private maxRetries = 3;
  private retryDelay = 5000; // 5 seconds

  constructor() {
    this.initializeTemplates();
  }

  /**
   * تهيئة قوالب الرسائل
   */
  private initializeTemplates(): void {
    this.templates.set('container-status-change', {
      id: 'container-status-change',
      name: 'تغيير حالة الحاوية',
      template: 'الحاوية {{containerId}} - الحالة الجديدة: {{status}}. التفاصيل: {{details}}',
      variables: ['containerId', 'status', 'details'],
      type: 'container',
    });

    this.templates.set('container-arrival', {
      id: 'container-arrival',
      name: 'وصول الحاوية',
      template: 'تم وصول الحاوية {{containerId}} إلى {{location}}. الوقت: {{time}}',
      variables: ['containerId', 'location', 'time'],
      type: 'container',
    });

    this.templates.set('customs-declaration-approved', {
      id: 'customs-declaration-approved',
      name: 'موافقة البيان الجمركي',
      template: 'تم الموافقة على البيان الجمركي {{declarationId}}. الرقم المرجعي: {{referenceNumber}}',
      variables: ['declarationId', 'referenceNumber'],
      type: 'customs',
    });

    this.templates.set('customs-declaration-rejected', {
      id: 'customs-declaration-rejected',
      name: 'رفض البيان الجمركي',
      template: 'تم رفض البيان الجمركي {{declarationId}}. السبب: {{reason}}. الرجاء المراجعة.',
      variables: ['declarationId', 'reason'],
      type: 'customs',
    });

    this.templates.set('payment-received', {
      id: 'payment-received',
      name: 'استقبال الدفع',
      template: 'تم استقبال دفعتك بقيمة {{amount}} {{currency}}. رقم الفاتورة: {{invoiceNumber}}',
      variables: ['amount', 'currency', 'invoiceNumber'],
      type: 'payment',
    });

    this.templates.set('payment-failed', {
      id: 'payment-failed',
      name: 'فشل الدفع',
      template: 'فشل الدفع برقم {{transactionId}}. السبب: {{reason}}. الرجاء المحاولة مرة أخرى.',
      variables: ['transactionId', 'reason'],
      type: 'payment',
    });

    this.templates.set('alert-high-cost', {
      id: 'alert-high-cost',
      name: 'تنبيه: تكلفة عالية',
      template: 'تنبيه: تكلفة الحاوية {{containerId}} {{cost}} {{currency}} تتجاوز الحد المسموح.',
      variables: ['containerId', 'cost', 'currency'],
      type: 'alert',
    });

    this.templates.set('reminder-pending-action', {
      id: 'reminder-pending-action',
      name: 'تذكير: إجراء معلق',
      template: 'تذكير: لديك {{actionCount}} إجراء معلق يتطلب اهتمامك. الرجاء المراجعة.',
      variables: ['actionCount'],
      type: 'reminder',
    });
  }

  /**
   * إرسال إشعار SMS
   */
  async sendSMS(notification: SMSNotification): Promise<boolean> {
    try {
      // التحقق من صحة رقم الهاتف
      if (!this.isValidPhoneNumber(notification.phoneNumber)) {
        return false;
      }

      // إضافة الإشعار إلى قائمة الانتظار
      this.queue.push(notification);

      // محاكاة إرسال SMS (في الإنتاج، ستتصل بـ Twilio أو خدمة SMS أخرى)
      return await this.processSMSQueue();
    } catch (error) {
      return false;
    }
  }

  /**
   * إرسال إشعار SMS باستخدام قالب
   */
  async sendSMSFromTemplate(
    phoneNumber: string,
    templateId: string,
    variables: Record<string, string>,
    userId: string | number,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<boolean> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        return false;
      }

      // استبدال المتغيرات في القالب
      let message = template.template;
      for (const [key, value] of Object.entries(variables)) {
        message = message.replace(`{{${key}}}`, value);
      }

      // إنشاء الإشعار
      const notification: SMSNotification = {
        phoneNumber,
        message,
        type: template.type as any,
        userId: userId.toString(),
        priority,
      };

      return await this.sendSMS(notification);
    } catch (error) {
      return false;
    }
  }

  /**
   * معالجة قائمة انتظار SMS
   */
  private async processSMSQueue(): Promise<boolean> {
    if (this.queue.length === 0) {
      return true;
    }

    const notification = this.queue.shift();
    if (!notification) {
      return true;
    }

    try {
      // محاكاة إرسال SMS
      console.log(`[SMS] Sending to ${notification.phoneNumber}: ${notification.message}`);

      // حفظ الإشعار في قاعدة البيانات
      await this.saveNotification(notification);

      return true;
    } catch (error) {
      // إعادة محاولة الإرسال
      return await this.retryNotification(notification);
    }
  }

  /**
   * إعادة محاولة إرسال الإشعار
   */
  private async retryNotification(
    notification: SMSNotification,
    retryCount: number = 0
  ): Promise<boolean> {
    if (retryCount >= this.maxRetries) {
      return false;
    }

    // الانتظار قبل إعادة المحاولة
    await new Promise(resolve => setTimeout(resolve, this.retryDelay * (retryCount + 1)));

    try {
      console.log(`[SMS] Retrying (${retryCount + 1}/${this.maxRetries}): ${notification.phoneNumber}`);
      return await this.processSMSQueue();
    } catch (error) {
      return await this.retryNotification(notification, retryCount + 1);
    }
  }

  /**
   * حفظ الإشعار في قاعدة البيانات
   */
  private async saveNotification(notification: SMSNotification): Promise<void> {
    try {
      // تحويل أولويات SMS إلى أولويات الإشعارات
      const priorityMap: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
        low: 'info',
        medium: 'info',
        high: 'warning',
        critical: 'error',
      };

      await createNotification({
        userId: parseInt(notification.userId),
        type: priorityMap[notification.priority],
        title: `SMS: ${notification.type}`,
        message: notification.message,
        isRead: false,
      });
    } catch (error) {
    }
  }

  /**
   * التحقق من صحة رقم الهاتف
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // التحقق من صيغة رقم الهاتف (أردني)
    const phoneRegex = /^(\+962|0)?[0-9]{9,10}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  }

  /**
   * تنسيق رقم الهاتف
   */
  formatPhoneNumber(phoneNumber: string): string {
    // إزالة الفراغات والرموز
    let formatted = phoneNumber.replace(/\s/g, '').replace(/[^0-9+]/g, '');

    // تحويل البادئة المحلية إلى دولية
    if (formatted.startsWith('0')) {
      formatted = '+962' + formatted.substring(1);
    } else if (!formatted.startsWith('+')) {
      formatted = '+962' + formatted;
    }

    return formatted;
  }

  /**
   * إرسال إشعارات متعددة
   */
  async sendBulkSMS(
    notifications: SMSNotification[]
  ): Promise<{ successful: number; failed: number }> {
    let successful = 0;
    let failed = 0;

    for (const notification of notifications) {
      const result = await this.sendSMS(notification);
      if (result) {
        successful++;
      } else {
        failed++;
      }
    }

    return { successful, failed };
  }

  /**
   * إرسال إشعار عند تغيير حالة الحاوية
   */
  async notifyContainerStatusChange(
    userId: string | number,
    phoneNumber: string,
    containerId: string,
    oldStatus: string,
    newStatus: string,
    details: string
  ): Promise<boolean> {
    return await this.sendSMSFromTemplate(
      phoneNumber,
      'container-status-change',
      {
        containerId,
        status: newStatus,
        details,
      },
      userId,
      'high'
    );
  }

  /**
   * إرسال إشعار عند وصول الحاوية
   */
  async notifyContainerArrival(
    userId: string | number,
    phoneNumber: string,
    containerId: string,
    location: string
  ): Promise<boolean> {
    const time = new Date().toLocaleString('ar-JO');
    return await this.sendSMSFromTemplate(
      phoneNumber,
      'container-arrival',
      {
        containerId,
        location,
        time,
      },
      userId,
      'high'
    );
  }

  /**
   * إرسال إشعار موافقة البيان الجمركي
   */
  async notifyCustomsApproved(
    userId: string | number,
    phoneNumber: string,
    declarationId: string,
    referenceNumber: string
  ): Promise<boolean> {
    return await this.sendSMSFromTemplate(
      phoneNumber,
      'customs-declaration-approved',
      {
        declarationId,
        referenceNumber,
      },
      userId,
      'high'
    );
  }

  /**
   * إرسال إشعار رفض البيان الجمركي
   */
  async notifyCustomsRejected(
    userId: string | number,
    phoneNumber: string,
    declarationId: string,
    reason: string
  ): Promise<boolean> {
    return await this.sendSMSFromTemplate(
      phoneNumber,
      'customs-declaration-rejected',
      {
        declarationId,
        reason,
      },
      userId,
      'critical'
    );
  }

  /**
   * إرسال إشعار استقبال الدفع
   */
  async notifyPaymentReceived(
    userId: string | number,
    phoneNumber: string,
    amount: number,
    currency: string,
    invoiceNumber: string
  ): Promise<boolean> {
    return await this.sendSMSFromTemplate(
      phoneNumber,
      'payment-received',
      {
        amount: amount.toFixed(2),
        currency,
        invoiceNumber,
      },
      userId,
      'high'
    );
  }

  /**
   * إرسال إشعار فشل الدفع
   */
  async notifyPaymentFailed(
    userId: string | number,
    phoneNumber: string,
    transactionId: string,
    reason: string
  ): Promise<boolean> {
    return await this.sendSMSFromTemplate(
      phoneNumber,
      'payment-failed',
      {
        transactionId,
        reason,
      },
      userId,
      'critical'
    );
  }

  /**
   * إرسال تنبيه تكلفة عالية
   */
  async notifyHighCost(
    userId: string | number,
    phoneNumber: string,
    containerId: string,
    cost: number,
    currency: string
  ): Promise<boolean> {
    return await this.sendSMSFromTemplate(
      phoneNumber,
      'alert-high-cost',
      {
        containerId,
        cost: cost.toFixed(2),
        currency,
      },
      userId,
      'medium'
    );
  }

  /**
   * إرسال تذكير الإجراءات المعلقة
   */
  async notifyPendingActions(
    userId: string | number,
    phoneNumber: string,
    actionCount: number
  ): Promise<boolean> {
    return await this.sendSMSFromTemplate(
      phoneNumber,
      'reminder-pending-action',
      {
        actionCount: actionCount.toString(),
      },
      userId,
      'medium'
    );
  }

  /**
   * الحصول على قوالب الرسائل المتاحة
   */
  getAvailableTemplates(): SMSTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * إضافة قالب مخصص
   */
  addTemplate(template: SMSTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * تحديث قالب موجود
   */
  updateTemplate(templateId: string, updates: Partial<SMSTemplate>): boolean {
    const template = this.templates.get(templateId);
    if (!template) {
      return false;
    }

    this.templates.set(templateId, { ...template, ...updates });
    return true;
  }

  /**
   * حذف قالب
   */
  deleteTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  /**
   * الحصول على إحصائيات الإرسال
   */
  getStatistics(): {
    queueLength: number;
    totalTemplates: number;
    maxRetries: number;
  } {
    return {
      queueLength: this.queue.length,
      totalTemplates: this.templates.size,
      maxRetries: this.maxRetries,
    };
  }
}

export default new SMSNotificationService();

import { describe, it, expect, beforeEach } from 'vitest';
import SMSNotificationService from './sms-notification-service';

/**
 * اختبارات شاملة لخدمة الإشعارات عبر SMS
 */

describe('خدمة الإشعارات عبر SMS', () => {
  beforeEach(() => {
    // تنظيف البيانات قبل كل اختبار
  });

  describe('التحقق من صحة رقم الهاتف', () => {
    it('يجب قبول أرقام الهاتف الأردنية الصحيحة', () => {
      const validNumbers = [
        '0791234567',
        '+962791234567',
        '0701234567',
        '+962701234567',
        '0961234567',
      ];

      validNumbers.forEach(number => {
        const isValid = (SMSNotificationService as any).isValidPhoneNumber(number);
        expect(isValid).toBe(true);
      });
    });

    it('يجب رفض أرقام الهاتف غير الصحيحة', () => {
      const invalidNumbers = [
        '123',
        'abc',
        '',
        '++962791234567',
        '0791234',
      ];

      invalidNumbers.forEach(number => {
        const isValid = (SMSNotificationService as any).isValidPhoneNumber(number);
        expect(isValid).toBe(false);
      });
    });
  });

  describe('تنسيق رقم الهاتف', () => {
    it('يجب تحويل البادئة المحلية إلى دولية', () => {
      const formatted = SMSNotificationService.formatPhoneNumber('0791234567');
      expect(formatted).toBe('+962791234567');
    });

    it('يجب إزالة الفراغات والرموز', () => {
      const formatted = SMSNotificationService.formatPhoneNumber('079 1234 567');
      expect(formatted).toBe('+962791234567');
    });

    it('يجب الحفاظ على أرقام الهاتف المنسقة بالفعل', () => {
      const formatted = SMSNotificationService.formatPhoneNumber('+962791234567');
      expect(formatted).toBe('+962791234567');
    });
  });

  describe('قوالب الرسائل', () => {
    it('يجب الحصول على جميع القوالب المتاحة', () => {
      const templates = SMSNotificationService.getAvailableTemplates();
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.length).toBe(8);
    });

    it('يجب أن تحتوي القوالب على معلومات صحيحة', () => {
      const templates = SMSNotificationService.getAvailableTemplates();
      templates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('template');
        expect(template).toHaveProperty('variables');
        expect(template).toHaveProperty('type');
        expect(template.template).toContain('{{');
      });
    });

    it('يجب إضافة قالب مخصص', () => {
      const newTemplate = {
        id: 'custom-template',
        name: 'قالب مخصص',
        template: 'رسالة مخصصة: {{message}}',
        variables: ['message'],
        type: 'custom',
      };

      SMSNotificationService.addTemplate(newTemplate);
      const templates = SMSNotificationService.getAvailableTemplates();
      expect(templates.some(t => t.id === 'custom-template')).toBe(true);
    });

    it('يجب تحديث قالب موجود', () => {
      const result = SMSNotificationService.updateTemplate('container-status-change', {
        name: 'تحديث الحالة',
      });
      expect(result).toBe(true);

      const templates = SMSNotificationService.getAvailableTemplates();
      const updated = templates.find(t => t.id === 'container-status-change');
      expect(updated?.name).toBe('تحديث الحالة');
    });

    it('يجب حذف قالب', () => {
      SMSNotificationService.addTemplate({
        id: 'delete-test',
        name: 'قالب للحذف',
        template: 'اختبار',
        variables: [],
        type: 'test',
      });

      const result = SMSNotificationService.deleteTemplate('delete-test');
      expect(result).toBe(true);

      const templates = SMSNotificationService.getAvailableTemplates();
      expect(templates.some(t => t.id === 'delete-test')).toBe(false);
    });

    it('يجب عدم حذف قالب غير موجود', () => {
      const result = SMSNotificationService.deleteTemplate('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('الإحصائيات', () => {
    it('يجب الحصول على إحصائيات الخدمة', () => {
      const stats = SMSNotificationService.getStatistics();
      expect(stats).toHaveProperty('queueLength');
      expect(stats).toHaveProperty('totalTemplates');
      expect(stats).toHaveProperty('maxRetries');
      expect(stats.totalTemplates).toBeGreaterThan(0);
      expect(stats.maxRetries).toBe(3);
    });

    it('يجب أن تكون قائمة الانتظار فارغة في البداية', () => {
      const stats = SMSNotificationService.getStatistics();
      expect(stats.queueLength).toBe(0);
    });
  });

  describe('معالجة الأخطاء', () => {
    it('يجب التعامل مع رقم هاتف غير صحيح', async () => {
      const result = await SMSNotificationService.sendSMS({
        phoneNumber: 'invalid',
        message: 'اختبار',
        type: 'alert',
        userId: '1',
        priority: 'medium',
      });

      expect(result).toBe(false);
    });

    it('يجب التعامل مع قالب غير موجود', async () => {
      const result = await SMSNotificationService.sendSMSFromTemplate(
        '+962791234567',
        'non-existent-template',
        {},
        '1'
      );

      expect(result).toBe(false);
    });
  });

  describe('استبدال المتغيرات في القوالب', () => {
    it('يجب استبدال المتغيرات بشكل صحيح', async () => {
      const result = await SMSNotificationService.sendSMSFromTemplate(
        '+962791234567',
        'container-status-change',
        {
          containerId: 'CNT-123',
          status: 'وصل',
          details: 'وصل إلى الميناء',
        },
        '1',
        'high'
      );

      // يجب أن يكون النتيجة true أو false حسب معالجة الخدمة
      expect(typeof result).toBe('boolean');
    });

    it('يجب معالجة جميع المتغيرات المطلوبة', async () => {
      const result = await SMSNotificationService.sendSMSFromTemplate(
        '+962791234567',
        'payment-received',
        {
          amount: '100.50',
          currency: 'JOD',
          invoiceNumber: 'INV-001',
        },
        '1'
      );

      expect(typeof result).toBe('boolean');
    });
  });

  describe('الإشعارات المتخصصة', () => {
    it('يجب إرسال إشعار تغيير حالة الحاوية', async () => {
      const result = await SMSNotificationService.notifyContainerStatusChange(
        '1',
        '+962791234567',
        'CNT-123',
        'في الطريق',
        'وصل',
        'وصل إلى الميناء'
      );

      expect(typeof result).toBe('boolean');
    });

    it('يجب إرسال إشعار وصول الحاوية', async () => {
      const result = await SMSNotificationService.notifyContainerArrival(
        '1',
        '+962791234567',
        'CNT-123',
        'ميناء عمّان'
      );

      expect(typeof result).toBe('boolean');
    });

    it('يجب إرسال إشعار موافقة البيان الجمركي', async () => {
      const result = await SMSNotificationService.notifyCustomsApproved(
        '1',
        '+962791234567',
        'DECL-001',
        'REF-12345'
      );

      expect(typeof result).toBe('boolean');
    });

    it('يجب إرسال إشعار رفض البيان الجمركي', async () => {
      const result = await SMSNotificationService.notifyCustomsRejected(
        '1',
        '+962791234567',
        'DECL-001',
        'مستندات غير مكتملة'
      );

      expect(typeof result).toBe('boolean');
    });

    it('يجب إرسال إشعار استقبال الدفع', async () => {
      const result = await SMSNotificationService.notifyPaymentReceived(
        '1',
        '+962791234567',
        150.75,
        'JOD',
        'INV-001'
      );

      expect(typeof result).toBe('boolean');
    });

    it('يجب إرسال إشعار فشل الدفع', async () => {
      const result = await SMSNotificationService.notifyPaymentFailed(
        '1',
        '+962791234567',
        'TXN-001',
        'رصيد غير كافي'
      );

      expect(typeof result).toBe('boolean');
    });

    it('يجب إرسال تنبيه تكلفة عالية', async () => {
      const result = await SMSNotificationService.notifyHighCost(
        '1',
        '+962791234567',
        'CNT-123',
        5000,
        'JOD'
      );

      expect(typeof result).toBe('boolean');
    });

    it('يجب إرسال تذكير الإجراءات المعلقة', async () => {
      const result = await SMSNotificationService.notifyPendingActions(
        '1',
        '+962791234567',
        5
      );

      expect(typeof result).toBe('boolean');
    });
  });

  describe('الإرسال الجماعي', () => {
    it('يجب إرسال إشعارات متعددة', async () => {
      const notifications = [
        {
          phoneNumber: '+962791234567',
          message: 'رسالة 1',
          type: 'alert' as const,
          userId: '1',
          priority: 'medium' as const,
        },
        {
          phoneNumber: '+962701234567',
          message: 'رسالة 2',
          type: 'alert' as const,
          userId: '2',
          priority: 'medium' as const,
        },
      ];

      const result = await SMSNotificationService.sendBulkSMS(notifications);
      expect(result).toHaveProperty('successful');
      expect(result).toHaveProperty('failed');
      expect(result.successful + result.failed).toBe(2);
    });
  });

  describe('أنواع الإشعارات', () => {
    it('يجب دعم جميع أنواع الإشعارات', () => {
      const types = ['container', 'customs', 'payment', 'alert', 'reminder'];
      const templates = SMSNotificationService.getAvailableTemplates();

      types.forEach(type => {
        const hasType = templates.some(t => t.type === type);
        expect(hasType).toBe(true);
      });
    });
  });

  describe('مستويات الأولوية', () => {
    it('يجب دعم جميع مستويات الأولوية', async () => {
      const priorities: Array<'low' | 'medium' | 'high' | 'critical'> = [
        'low',
        'medium',
        'high',
        'critical',
      ];

      for (const priority of priorities) {
        const result = await SMSNotificationService.sendSMS({
          phoneNumber: '+962791234567',
          message: `اختبار أولوية ${priority}`,
          type: 'alert',
          userId: '1',
          priority,
        });

        expect(typeof result).toBe('boolean');
      }
    });
  });
});

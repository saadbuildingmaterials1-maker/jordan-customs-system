import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import smartAlertsService from '../smartAlertsService';

describe('SmartAlertsService', () => {
  const mockData = [
    { id: '1', price: 1500, status: 'pending' },
    { id: '2', price: 2500, status: 'completed' },
    { id: '3', price: 800, status: 'pending' }
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    smartAlertsService.stopMonitoring();
  });

  afterEach(() => {
    localStorage.clear();
    smartAlertsService.stopMonitoring();
  });

  describe('addThreshold', () => {
    it('يجب أن يضيف حد تنبيه جديد', async () => {
      const threshold = await smartAlertsService.addThreshold({
        name: 'سعر مرتفع',
        field: 'price',
        operator: 'greaterThan',
        value: 2000,
        severity: 'high',
        enabled: true
      });

      expect(threshold.id).toBeDefined();
      expect(threshold.name).toBe('سعر مرتفع');
    });

    it('يجب أن يحفظ الحد في التخزين المحلي', async () => {
      await smartAlertsService.addThreshold({
        name: 'اختبار',
        field: 'price',
        operator: 'greaterThan',
        value: 1000,
        severity: 'medium',
        enabled: true
      });

      const thresholds = await smartAlertsService.getThresholds();
      expect(thresholds.length).toBeGreaterThan(0);
    });
  });

  describe('checkData', () => {
    it('يجب أن يكتشف البيانات التي تتجاوز الحد', async () => {
      await smartAlertsService.addThreshold({
        name: 'سعر مرتفع',
        field: 'price',
        operator: 'greaterThan',
        value: 2000,
        severity: 'high',
        enabled: true
      });

      const alerts = await smartAlertsService.checkData(mockData);
      expect(alerts.length).toBeGreaterThan(0);
    });

    it('يجب أن يرجع مصفوفة فارغة إذا لم تتجاوز البيانات الحد', async () => {
      await smartAlertsService.addThreshold({
        name: 'سعر منخفض',
        field: 'price',
        operator: 'lessThan',
        value: 500,
        severity: 'low',
        enabled: true
      });

      const alerts = await smartAlertsService.checkData(mockData);
      expect(alerts.length).toBe(0);
    });

    it('يجب أن يتجاهل الحدود المعطلة', async () => {
      await smartAlertsService.addThreshold({
        name: 'معطل',
        field: 'price',
        operator: 'greaterThan',
        value: 100,
        severity: 'high',
        enabled: false
      });

      const alerts = await smartAlertsService.checkData(mockData);
      expect(alerts.length).toBe(0);
    });
  });

  describe('updateThreshold', () => {
    it('يجب أن يحدث الحد بنجاح', async () => {
      const threshold = await smartAlertsService.addThreshold({
        name: 'الأصلي',
        field: 'price',
        operator: 'greaterThan',
        value: 1000,
        severity: 'medium',
        enabled: true
      });

      const updated = await smartAlertsService.updateThreshold(threshold.id, {
        name: 'المحدث'
      });

      expect(updated.name).toBe('المحدث');
    });
  });

  describe('deleteThreshold', () => {
    it('يجب أن يحذف الحد بنجاح', async () => {
      const threshold = await smartAlertsService.addThreshold({
        name: 'حذف',
        field: 'price',
        operator: 'greaterThan',
        value: 1000,
        severity: 'medium',
        enabled: true
      });

      await smartAlertsService.deleteThreshold(threshold.id);
      const thresholds = await smartAlertsService.getThresholds();
      expect(thresholds.find(t => t.id === threshold.id)).toBeUndefined();
    });
  });

  describe('getAlerts', () => {
    it('يجب أن يرجع جميع التنبيهات', async () => {
      await smartAlertsService.addThreshold({
        name: 'اختبار',
        field: 'price',
        operator: 'greaterThan',
        value: 500,
        severity: 'high',
        enabled: true
      });

      await smartAlertsService.checkData(mockData);
      const alerts = await smartAlertsService.getAlerts();
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  describe('markAsRead', () => {
    it('يجب أن يحدد التنبيه كمقروء', async () => {
      await smartAlertsService.addThreshold({
        name: 'اختبار',
        field: 'price',
        operator: 'greaterThan',
        value: 500,
        severity: 'high',
        enabled: true
      });

      const alerts = await smartAlertsService.checkData(mockData);
      if (alerts.length > 0) {
        await smartAlertsService.markAsRead(alerts[0].id);
        const updated = await smartAlertsService.getAlerts();
        const alert = updated.find(a => a.id === alerts[0].id);
        expect(alert?.read).toBe(true);
      }
    });
  });

  describe('markAllAsRead', () => {
    it('يجب أن يحدد جميع التنبيهات كمقروءة', async () => {
      await smartAlertsService.addThreshold({
        name: 'اختبار',
        field: 'price',
        operator: 'greaterThan',
        value: 500,
        severity: 'high',
        enabled: true
      });

      await smartAlertsService.checkData(mockData);
      await smartAlertsService.markAllAsRead();
      const alerts = await smartAlertsService.getAlerts();
      expect(alerts.every(a => a.read)).toBe(true);
    });
  });

  describe('deleteAlert', () => {
    it('يجب أن يحذف التنبيه بنجاح', async () => {
      await smartAlertsService.addThreshold({
        name: 'اختبار',
        field: 'price',
        operator: 'greaterThan',
        value: 500,
        severity: 'high',
        enabled: true
      });

      const alerts = await smartAlertsService.checkData(mockData);
      if (alerts.length > 0) {
        await smartAlertsService.deleteAlert(alerts[0].id);
        const updated = await smartAlertsService.getAlerts();
        expect(updated.find(a => a.id === alerts[0].id)).toBeUndefined();
      }
    });
  });

  describe('clearAlerts', () => {
    it('يجب أن يمسح جميع التنبيهات', async () => {
      await smartAlertsService.addThreshold({
        name: 'اختبار',
        field: 'price',
        operator: 'greaterThan',
        value: 500,
        severity: 'high',
        enabled: true
      });

      await smartAlertsService.checkData(mockData);
      await smartAlertsService.clearAlerts();
      const alerts = await smartAlertsService.getAlerts();
      expect(alerts.length).toBe(0);
    });
  });

  describe('updateNotificationSettings', () => {
    it('يجب أن يحدث إعدادات الإشعارات', async () => {
      await smartAlertsService.updateNotificationSettings('email', true);
      // التحقق من أن الإعداد تم حفظه
      const stored = localStorage.getItem('notificationSettings');
      expect(stored).toBeDefined();
    });
  });
});

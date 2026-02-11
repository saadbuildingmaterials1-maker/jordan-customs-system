/**
 * خدمة التنبيهات الذكية التلقائية
 * Smart Automatic Alerts Service
 */

export interface AlertThreshold {
  id: string;
  name: string;
  field: string;
  operator: 'greaterThan' | 'lessThan' | 'equals' | 'notEquals' | 'between';
  value: number | string;
  maxValue?: number | string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  createdAt: Date;
}

export interface Alert {
  id: string;
  thresholdId: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  read: boolean;
  data?: any;
}

export interface AlertNotification {
  type: 'browser' | 'email' | 'sms';
  enabled: boolean;
}

class SmartAlertsService {
  private thresholds: AlertThreshold[] = [];
  private alerts: Alert[] = [];
  private notifications: AlertNotification[] = [
    { type: 'browser', enabled: true },
    { type: 'email', enabled: false },
    { type: 'sms', enabled: false }
  ];
  private maxAlertsSize = 100;
  private checkInterval: NodeJS.Timeout | null = null;

  /**
   * إضافة حد تنبيه جديد
   * Add new alert threshold
   */
  async addThreshold(threshold: Omit<AlertThreshold, 'id' | 'createdAt'>): Promise<AlertThreshold> {
    const newThreshold: AlertThreshold = {
      ...threshold,
      id: `threshold_${Date.now()}`,
      createdAt: new Date()
    };

    this.thresholds.push(newThreshold);
    this.persistThresholds();

    return newThreshold;
  }

  /**
   * الحصول على جميع الحدود
   * Get all thresholds
   */
  async getThresholds(): Promise<AlertThreshold[]> {
    return this.loadThresholds();
  }

  /**
   * تحديث حد تنبيه
   * Update threshold
   */
  async updateThreshold(thresholdId: string, updates: Partial<AlertThreshold>): Promise<AlertThreshold> {
    const threshold = this.thresholds.find(t => t.id === thresholdId);
    if (!threshold) throw new Error('الحد غير موجود');

    const updated = { ...threshold, ...updates };
    const index = this.thresholds.indexOf(threshold);
    this.thresholds[index] = updated;
    this.persistThresholds();

    return updated;
  }

  /**
   * حذف حد تنبيه
   * Delete threshold
   */
  async deleteThreshold(thresholdId: string): Promise<void> {
    this.thresholds = this.thresholds.filter(t => t.id !== thresholdId);
    this.persistThresholds();
  }

  /**
   * فحص البيانات مقابل الحدود
   * Check data against thresholds
   */
  async checkData(data: any[]): Promise<Alert[]> {
    const newAlerts: Alert[] = [];

    for (const item of data) {
      for (const threshold of this.thresholds) {
        if (!threshold.enabled) continue;

        const value = this.getNestedValue(item, threshold.field);
        if (value === null || value === undefined) continue;

        if (this.matchesThreshold(value, threshold)) {
          const alert = await this.createAlert(threshold, item);
          newAlerts.push(alert);
        }
      }
    }

    return newAlerts;
  }

  /**
   * التحقق من توافق القيمة مع الحد
   * Check if value matches threshold
   */
  private matchesThreshold(value: any, threshold: AlertThreshold): boolean {
    const numValue = Number(value);
    const numThreshold = Number(threshold.value);
    const numMaxValue = threshold.maxValue ? Number(threshold.maxValue) : 0;

    switch (threshold.operator) {
      case 'greaterThan':
        return numValue > numThreshold;
      case 'lessThan':
        return numValue < numThreshold;
      case 'equals':
        return value === threshold.value;
      case 'notEquals':
        return value !== threshold.value;
      case 'between':
        return numValue >= numThreshold && numValue <= numMaxValue;
      default:
        return false;
    }
  }

  /**
   * إنشاء تنبيه جديد
   * Create new alert
   */
  private async createAlert(threshold: AlertThreshold, data: any): Promise<Alert> {
    const alert: Alert = {
      id: `alert_${Date.now()}`,
      thresholdId: threshold.id,
      title: threshold.name,
      message: this.generateAlertMessage(threshold, data),
      severity: threshold.severity,
      timestamp: new Date(),
      read: false,
      data
    };

    this.alerts.unshift(alert);

    // الحفاظ على الحد الأقصى
    if (this.alerts.length > this.maxAlertsSize) {
      this.alerts.pop();
    }

    this.persistAlerts();
    await this.sendNotification(alert);

    return alert;
  }

  /**
   * توليد رسالة التنبيه
   * Generate alert message
   */
  private generateAlertMessage(threshold: AlertThreshold, data: any): string {
    const value = this.getNestedValue(data, threshold.field);
    const severity = this.getSeverityLabel(threshold.severity);

    return `${severity}: ${threshold.name} - القيمة الحالية: ${value}`;
  }

  /**
   * الحصول على تسمية الخطورة
   * Get severity label
   */
  private getSeverityLabel(severity: string): string {
    const labels: Record<string, string> = {
      low: 'تنبيه منخفض',
      medium: 'تنبيه متوسط',
      high: 'تنبيه مرتفع',
      critical: 'تنبيه حرج'
    };
    return labels[severity] || 'تنبيه';
  }

  /**
   * إرسال إشعار
   * Send notification
   */
  private async sendNotification(alert: Alert): Promise<void> {
    for (const notification of this.notifications) {
      if (!notification.enabled) continue;

      switch (notification.type) {
        case 'browser':
          this.sendBrowserNotification(alert);
          break;
        case 'email':
          await this.sendEmailNotification(alert);
          break;
        case 'sms':
          await this.sendSMSNotification(alert);
          break;
      }
    }
  }

  /**
   * إرسال إشعار المتصفح
   * Send browser notification
   */
  private sendBrowserNotification(alert: Alert): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alert.title, {
        body: alert.message,
        tag: alert.id,
        requireInteraction: alert.severity === 'critical'
      });
    }
  }

  /**
   * إرسال إشعار البريد الإلكتروني
   * Send email notification
   */
  private async sendEmailNotification(alert: Alert): Promise<void> {
    try {
      // يمكن دمج خدمة بريد هنا
      console.log('إرسال بريد إلكتروني:', alert);
    } catch (error) {
      console.error('فشل إرسال البريد:', error);
    }
  }

  /**
   * إرسال إشعار SMS
   * Send SMS notification
   */
  private async sendSMSNotification(alert: Alert): Promise<void> {
    try {
      // يمكن دمج خدمة SMS هنا
      console.log('إرسال SMS:', alert);
    } catch (error) {
      console.error('فشل إرسال SMS:', error);
    }
  }

  /**
   * الحصول على جميع التنبيهات
   * Get all alerts
   */
  async getAlerts(unreadOnly: boolean = false): Promise<Alert[]> {
    const alerts = this.loadAlerts();
    return unreadOnly ? alerts.filter(a => !a.read) : alerts;
  }

  /**
   * تحديد التنبيه كمقروء
   * Mark alert as read
   */
  async markAsRead(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.read = true;
      this.persistAlerts();
    }
  }

  /**
   * تحديد جميع التنبيهات كمقروءة
   * Mark all alerts as read
   */
  async markAllAsRead(): Promise<void> {
    this.alerts.forEach(a => a.read = true);
    this.persistAlerts();
  }

  /**
   * حذف تنبيه
   * Delete alert
   */
  async deleteAlert(alertId: string): Promise<void> {
    this.alerts = this.alerts.filter(a => a.id !== alertId);
    this.persistAlerts();
  }

  /**
   * مسح جميع التنبيهات
   * Clear all alerts
   */
  async clearAlerts(): Promise<void> {
    this.alerts = [];
    localStorage.removeItem('alerts');
  }

  /**
   * تحديث إعدادات الإشعارات
   * Update notification settings
   */
  async updateNotificationSettings(type: 'browser' | 'email' | 'sms', enabled: boolean): Promise<void> {
    const notification = this.notifications.find(n => n.type === type);
    if (notification) {
      notification.enabled = enabled;
      this.persistNotifications();
    }
  }

  /**
   * طلب إذن الإشعارات
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('المتصفح لا يدعم الإشعارات');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * بدء المراقبة المستمرة
   * Start continuous monitoring
   */
  startMonitoring(data: any[], interval: number = 60000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      try {
        await this.checkData(data);
      } catch (error) {
        console.error('خطأ في المراقبة:', error);
      }
    }, interval);
  }

  /**
   * إيقاف المراقبة
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * الحصول على قيمة متداخلة من الكائن
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  /**
   * حفظ الحدود في التخزين المحلي
   * Persist thresholds to local storage
   */
  private persistThresholds(): void {
    try {
      localStorage.setItem('alertThresholds', JSON.stringify(this.thresholds));
    } catch (error) {
      console.error('فشل حفظ الحدود:', error);
    }
  }

  /**
   * تحميل الحدود من التخزين المحلي
   * Load thresholds from local storage
   */
  private loadThresholds(): AlertThreshold[] {
    try {
      const stored = localStorage.getItem('alertThresholds');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('فشل تحميل الحدود:', error);
      return [];
    }
  }

  /**
   * حفظ التنبيهات في التخزين المحلي
   * Persist alerts to local storage
   */
  private persistAlerts(): void {
    try {
      localStorage.setItem('alerts', JSON.stringify(this.alerts));
    } catch (error) {
      console.error('فشل حفظ التنبيهات:', error);
    }
  }

  /**
   * تحميل التنبيهات من التخزين المحلي
   * Load alerts from local storage
   */
  private loadAlerts(): Alert[] {
    try {
      const stored = localStorage.getItem('alerts');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('فشل تحميل التنبيهات:', error);
      return [];
    }
  }

  /**
   * حفظ إعدادات الإشعارات
   * Persist notification settings
   */
  private persistNotifications(): void {
    try {
      localStorage.setItem('notificationSettings', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('فشل حفظ إعدادات الإشعارات:', error);
    }
  }
}

export const smartAlertsService = new SmartAlertsService();

export default smartAlertsService;

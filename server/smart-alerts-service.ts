import { db } from './db';
import { declarations, items, variances } from '../drizzle/schema';
import { notificationService } from './advanced-notifications-service';

/**
 * خدمة التنبيهات الذكية - تنبيهات تلقائية بناءً على القواعد
 */

interface AlertRule {
  id: string;
  name: string;
  condition: (data: any) => boolean;
  message: (data: any) => string;
  severity: 'info' | 'warning' | 'error';
}

export class SmartAlertsService {
  private rules: AlertRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * تهيئة القواعس الافتراضية
   */
  private initializeDefaultRules() {
    // تنبيه: انحراف كبير
    this.addRule({
      id: 'high-variance',
      name: 'انحراف كبير',
      condition: (data) => data.variance && Math.abs(data.variance) > 15,
      message: (data) => `تم اكتشاف انحراف كبير: ${data.variance.toFixed(2)}%`,
      severity: 'warning',
    });

    // تنبيه: رسوم جمركية عالية
    this.addRule({
      id: 'high-customs-duty',
      name: 'رسوم جمركية عالية',
      condition: (data) => data.customsDuty && data.customsDuty > data.fobValue * 0.5,
      message: (data) => `الرسوم الجمركية عالية جداً: د.ا ${data.customsDuty}`,
      severity: 'warning',
    });

    // تنبيه: وزن غير متطابق
    this.addRule({
      id: 'weight-mismatch',
      name: 'عدم تطابق الأوزان',
      condition: (data) => {
        const difference = Math.abs(data.grossWeight - data.netWeight);
        const percentage = (difference / data.grossWeight) * 100;
        return percentage > 30;
      },
      message: (data) => `الفرق بين الوزن الإجمالي والصافي كبير جداً`,
      severity: 'warning',
    });

    // تنبيه: عدد طرود غير عادي
    this.addRule({
      id: 'unusual-packages',
      name: 'عدد طرود غير عادي',
      condition: (data) => data.numberOfPackages > 1000 || data.numberOfPackages < 1,
      message: (data) => `عدد الطرود غير عادي: ${data.numberOfPackages}`,
      severity: 'info',
    });

    // تنبيه: قيمة FOB منخفضة جداً
    this.addRule({
      id: 'low-fob-value',
      name: 'قيمة FOB منخفضة جداً',
      condition: (data) => data.fobValue < 100,
      message: (data) => `قيمة FOB منخفضة جداً: د.ا ${data.fobValue}`,
      severity: 'info',
    });

    // تنبيه: أصناف بدون وصف
    this.addRule({
      id: 'missing-item-description',
      name: 'أصناف بدون وصف',
      condition: (data) => data.items && data.items.some((item: any) => !item.itemName),
      message: (data) => `يوجد أصناف بدون وصف`,
      severity: 'warning',
    });

    // تنبيه: غرامات مرتفعة
    this.addRule({
      id: 'high-penalties',
      name: 'غرامات مرتفعة',
      condition: (data) => data.penalties && data.penalties > 0,
      message: (data) => `توجد غرامات: د.ا ${data.penalties}`,
      severity: 'error',
    });

    // تنبيه: تأمين غير كافي
    this.addRule({
      id: 'low-insurance',
      name: 'تأمين غير كافي',
      condition: (data) => {
        const insurancePercentage = (data.insuranceCost / data.fobValue) * 100;
        return insurancePercentage < 0.5;
      },
      message: (data) => `التأمين قد يكون غير كافي`,
      severity: 'warning',
    });
  }

  /**
   * إضافة قاعدة تنبيه جديدة
   */
  addRule(rule: AlertRule) {
    this.rules.push(rule);
  }

  /**
   * إزالة قاعدة تنبيه
   */
  removeRule(ruleId: string) {
    this.rules = this.rules.filter((r) => r.id !== ruleId);
  }

  /**
   * فحص البيان الجمركي وإرسال التنبيهات
   */
  async checkDeclaration(declarationId: number, userId: number) {
    try {
      const declaration = await db.query.declarations.findFirst({
        where: (d) => d.id === declarationId,
      });

      if (!declaration) {
        throw new Error('البيان الجمركي غير موجود');
      }

      const itemsList = await db.query.items.findMany({
        where: (i) => i.declarationId === declarationId,
      });

      const variancesList = await db.query.variances.findMany({
        where: (v) => v.declarationId === declarationId,
      });

      const data = {
        ...declaration,
        items: itemsList,
        variances: variancesList,
        variance: variancesList[0]?.variancePercentage || 0,
      };

      // تطبيق جميع القواعس
      const alerts: any[] = [];
      for (const rule of this.rules) {
        try {
          if (rule.condition(data)) {
            const message = rule.message(data);
            alerts.push({
              ruleId: rule.id,
              ruleName: rule.name,
              message,
              severity: rule.severity,
            });

            // إرسال إشعار
            await notificationService.createNotification(
              userId,
              `تنبيه: ${rule.name}`,
              message,
              rule.severity === 'error' ? 'error' : rule.severity === 'warning' ? 'warning' : 'info'
            );
          }
        } catch (error) {
          console.error(`[Smart Alerts] Error applying rule ${rule.id}:`, error);
        }
      }

      return alerts;
    } catch (error) {
      console.error('[Smart Alerts] Error checking declaration:', error);
      throw error;
    }
  }

  /**
   * فحص جميع البيانات الجمركية
   */
  async checkAllDeclarations(userId: number) {
    try {
      const allDeclarations = await db.query.declarations.findMany();

      const allAlerts: any[] = [];
      for (const declaration of allDeclarations) {
        const alerts = await this.checkDeclaration(declaration.id, userId);
        allAlerts.push(...alerts);
      }

      return allAlerts;
    } catch (error) {
      console.error('[Smart Alerts] Error checking all declarations:', error);
      throw error;
    }
  }

  /**
   * الحصول على القواعس النشطة
   */
  getActiveRules() {
    return this.rules.map((r) => ({
      id: r.id,
      name: r.name,
      severity: r.severity,
    }));
  }

  /**
   * تعطيل قاعدة مؤقتاً
   */
  disableRule(ruleId: string) {
    const rule = this.rules.find((r) => r.id === ruleId);
    if (rule) {
      this.removeRule(ruleId);
    }
  }

  /**
   * إعادة تفعيل قاعدة
   */
  enableRule(ruleId: string) {
    // يمكن إعادة تفعيل القاعسة من القائمة الافتراضية
    this.initializeDefaultRules();
  }

  /**
   * الحصول على إحصائيات التنبيهات
   */
  async getAlertStats(userId: number, days = 30) {
    try {
      // هنا يمكن إضافة استعلام لقاعدة البيانات لجلب إحصائيات التنبيهات
      // مثال مبسط:
      return {
        totalAlerts: 0,
        criticalAlerts: 0,
        warningAlerts: 0,
        infoAlerts: 0,
        topAlerts: [],
      };
    } catch (error) {
      console.error('[Smart Alerts] Error getting stats:', error);
      throw error;
    }
  }
}

// إنشاء مثيل واحد من الخدمة
export const smartAlertsService = new SmartAlertsService();

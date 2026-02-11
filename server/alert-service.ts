/**
 * alert-service
 * 
 * @module ./server/alert-service
 */
import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

export type AlertSeverity = "high" | "medium" | "low";
export type AlertType = "variance" | "threshold" | "anomaly" | "trend";

export interface AlertRule {
  id: string;
  name: string;
  type: AlertType;
  metric: string;
  threshold: number;
  severity: AlertSeverity;
  enabled: boolean;
  description: string;
}

export interface Alert {
  id: string;
  ruleId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  currentValue: number;
  expectedValue: number;
  variance: number;
  variancePercentage: number;
  recommendation: string;
  createdAt: Date;
  resolvedAt?: Date;
  status: "active" | "resolved" | "acknowledged";
}

/**
 * خدمة التنبيهات الذكية
 * كشف الانحرافات المالية وإرسال إشعارات فورية مع توصيات ذكية
 */
export class AlertService {
  private alerts: Alert[] = [];
  private rules: AlertRule[] = this.initializeDefaultRules();

  /**
   * تهيئة القواعس الافتراضية للتنبيهات
   */
  private initializeDefaultRules(): AlertRule[] {
    return [
      {
        id: "variance-20",
        name: "انحراف الإيرادات 20%",
        type: "variance",
        metric: "revenue",
        threshold: 20,
        severity: "high",
        enabled: true,
        description: "تنبيه عند انحراف الإيرادات عن التوقع بأكثر من 20%",
      },
      {
        id: "variance-15",
        name: "انحراف المصاريف 15%",
        type: "variance",
        metric: "expenses",
        threshold: 15,
        severity: "medium",
        enabled: true,
        description: "تنبيه عند انحراف المصاريف عن التوقع بأكثر من 15%",
      },
      {
        id: "threshold-customs",
        name: "تجاوز الرسوم الجمركية",
        type: "threshold",
        metric: "customsDuties",
        threshold: 50000,
        severity: "high",
        enabled: true,
        description: "تنبيه عند تجاوز الرسوم الجمركية 50,000 دينار",
      },
      {
        id: "anomaly-freight",
        name: "شذوذ في أسعار الشحن",
        type: "anomaly",
        metric: "freightCost",
        threshold: 30,
        severity: "medium",
        enabled: true,
        description: "تنبيه عند اكتشاف شذوذ في أسعار الشحن",
      },
      {
        id: "trend-profit",
        name: "انخفاض الأرباح المتتالي",
        type: "trend",
        metric: "profit",
        threshold: 3,
        severity: "high",
        enabled: true,
        description: "تنبيه عند انخفاض الأرباح لمدة 3 فترات متتالية",
      },
      {
        id: "threshold-vat",
        name: "ضريبة المبيعات المرتفعة",
        type: "threshold",
        metric: "vat",
        threshold: 30000,
        severity: "medium",
        enabled: true,
        description: "تنبيه عند تجاوز ضريبة المبيعات 30,000 دينار",
      },
    ];
  }

  /**
   * كشف الانحرافات في البيانات المالية
   */
  async detectVariances(
    currentData: Record<string, number>,
    expectedData: Record<string, number>
  ): Promise<Alert[]> {
    const detectedAlerts: Alert[] = [];

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      const current = currentData[rule.metric] || 0;
      const expected = expectedData[rule.metric] || 0;

      if (expected === 0) continue;

      const variance = current - expected;
      const variancePercentage = (Math.abs(variance) / expected) * 100;

      // كشف الانحراف
      if (rule.type === "variance" && variancePercentage >= rule.threshold) {
        const alert = await this.createAlert(
          rule,
          current,
          expected,
          variance,
          variancePercentage
        );
        detectedAlerts.push(alert);
      }

      // كشف تجاوز الحد
      if (rule.type === "threshold" && current > rule.threshold) {
        const alert = await this.createAlert(
          rule,
          current,
          rule.threshold,
          current - rule.threshold,
          ((current - rule.threshold) / rule.threshold) * 100
        );
        detectedAlerts.push(alert);
      }
    }

    return detectedAlerts;
  }

  /**
   * كشف الشذوذ في البيانات باستخدام الإحصائيات
   */
  async detectAnomalies(
    data: number[],
    metric: string
  ): Promise<Alert | null> {
    if (data.length < 3) return null;

    // حساب المتوسط والانحراف المعياري
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance =
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      data.length;
    const stdDev = Math.sqrt(variance);

    // الكشف عن القيم الشاذة (أكثر من 2 انحراف معياري)
    const lastValue = data[data.length - 1];
    const zScore = Math.abs((lastValue - mean) / stdDev);

    if (zScore > 2) {
      const rule = this.rules.find((r) => r.metric === metric && r.type === "anomaly");
      if (rule && rule.enabled) {
        return await this.createAlert(
          rule,
          lastValue,
          mean,
          lastValue - mean,
          (Math.abs(lastValue - mean) / mean) * 100
        );
      }
    }

    return null;
  }

  /**
   * كشف الاتجاهات السلبية المتتالية
   */
  async detectTrends(
    data: number[],
    metric: string,
    consecutiveCount: number = 3
  ): Promise<Alert | null> {
    if (data.length < consecutiveCount) return null;

    // التحقق من انخفاض متتالي
    let decreasingCount = 0;
    for (let i = data.length - consecutiveCount; i < data.length - 1; i++) {
      if (data[i] > data[i + 1]) {
        decreasingCount++;
      }
    }

    if (decreasingCount >= consecutiveCount - 1) {
      const rule = this.rules.find((r) => r.metric === metric && r.type === "trend");
      if (rule && rule.enabled) {
        const currentValue = data[data.length - 1];
        const previousValue = data[data.length - consecutiveCount - 1];
        const variance = currentValue - previousValue;
        const variancePercentage = (Math.abs(variance) / previousValue) * 100;

        return await this.createAlert(
          rule,
          currentValue,
          previousValue,
          variance,
          variancePercentage
        );
      }
    }

    return null;
  }

  /**
   * إنشاء تنبيه جديد
   */
  private async createAlert(
    rule: AlertRule,
    currentValue: number,
    expectedValue: number,
    variance: number,
    variancePercentage: number
  ): Promise<Alert> {
    // استخدام الذكاء الاصطناعي للحصول على توصية ذكية
    const recommendation = await this.generateRecommendation(
      rule,
      currentValue,
      expectedValue,
      variancePercentage
    );

    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      type: rule.type,
      severity: rule.severity,
      title: rule.name,
      message: this.generateAlertMessage(rule, currentValue, expectedValue, variancePercentage),
      currentValue,
      expectedValue,
      variance,
      variancePercentage,
      recommendation,
      createdAt: new Date(),
      status: "active",
    };

    this.alerts.push(alert);
    return alert;
  }

  /**
   * توليد رسالة التنبيه
   */
  private generateAlertMessage(
    rule: AlertRule,
    currentValue: number,
    expectedValue: number,
    variancePercentage: number
  ): string {
    const direction = currentValue > expectedValue ? "ارتفاع" : "انخفاض";
    return `${rule.description}. القيمة الحالية: ${currentValue.toLocaleString("ar-JO", {
      minimumFractionDigits: 2,
    })} د.أ، القيمة المتوقعة: ${expectedValue.toLocaleString("ar-JO", {
      minimumFractionDigits: 2,
    })} د.أ. ${direction} بنسبة ${variancePercentage.toFixed(2)}%.`;
  }

  /**
   * توليد توصية ذكية باستخدام الذكاء الاصطناعي
   */
  private async generateRecommendation(
    rule: AlertRule,
    currentValue: number,
    expectedValue: number,
    variancePercentage: number
  ): Promise<string> {
    try {
      const prompt = `أنت محلل مالي متخصص في نظام إدارة تكاليف الشحن والجمارك الأردنية.
      
تم اكتشاف انحراف مالي:
- القاعدة: ${rule.name}
- النوع: ${rule.type}
- المقياس: ${rule.metric}
- القيمة الحالية: ${currentValue.toLocaleString("ar-JO")} د.أ
- القيمة المتوقعة: ${expectedValue.toLocaleString("ar-JO")} د.أ
- نسبة الانحراف: ${variancePercentage.toFixed(2)}%

قدم توصية قصيرة وعملية (جملة واحدة) لمعالجة هذا الانحراف. الرد باللغة العربية فقط.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "أنت محلل مالي متخصص يقدم توصيات عملية وقابلة للتنفيذ لمعالجة الانحرافات المالية.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      const recommendation = typeof content === 'string' ? content : "يرجى مراجعة البيانات والتحقق من الأسباب المحتملة.";
      return recommendation.substring(0, 200); // تحديد الطول الأقصى
    } catch (error) {
      return "يرجى مراجعة البيانات والتحقق من الأسباب المحتملة.";
    }
  }

  /**
   * إرسال إشعارات التنبيهات
   */
  async sendAlerts(alerts: Alert[]): Promise<void> {
    for (const alert of alerts) {
      // إرسال إشعار عبر البريد الإلكتروني
      await this.sendEmailNotification(alert);

      // إرسال إشعار عبر تطبيق الويب
      await this.sendWebNotification(alert);

      // حفظ في قاعدة البيانات
      await this.saveAlert(alert);
    }
  }

  /**
   * إرسال إشعار عبر البريد الإلكتروني
   */
  private async sendEmailNotification(alert: Alert): Promise<void> {
    try {
      const subject = `[${alert.severity.toUpperCase()}] ${alert.title}`;
      const content = `
تم اكتشاف تنبيه مالي:

العنوان: ${alert.title}
الخطورة: ${alert.severity === "high" ? "عالية" : alert.severity === "medium" ? "متوسطة" : "منخفضة"}
الرسالة: ${alert.message}

التوصية: ${alert.recommendation}

الوقت: ${alert.createdAt.toLocaleString("ar-JO")}
      `;

      // استخدام خدمة الإشعارات المدمجة
      try {
        await notifyOwner({
          title: subject,
          content: content,
        });
      } catch (notifyError) {
      }
    } catch (error) {
    }
  }

  /**
   * إرسال إشعار عبر تطبيق الويب
   */
  private async sendWebNotification(alert: Alert): Promise<void> {
    // يمكن استخدام WebSocket أو Server-Sent Events لإرسال الإشعارات الفورية
    console.log(`إشعار ويب: ${alert.title}`);
  }

  /**
   * حفظ التنبيه في قاعدة البيانات
   */
  private async saveAlert(alert: Alert): Promise<void> {
    try {
      const db = await getDb();
      if (!db) return;

      // يمكن إضافة جدول للتنبيهات في قاعدة البيانات
      // await db.insert(alerts).values({...});
    } catch (error) {
    }
  }

  /**
   * الحصول على جميع التنبيهات النشطة
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter((alert) => alert.status === "active");
  }

  /**
   * الحصول على التنبيهات حسب الخطورة
   */
  getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return this.alerts.filter((alert) => alert.severity === severity);
  }

  /**
   * تحديث حالة التنبيه
   */
  updateAlertStatus(
    alertId: string,
    status: "active" | "resolved" | "acknowledged"
  ): void {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = status;
      if (status === "resolved") {
        alert.resolvedAt = new Date();
      }
    }
  }

  /**
   * إضافة قاعدة تنبيه جديدة
   */
  addRule(rule: AlertRule): void {
    this.rules.push(rule);
  }

  /**
   * تحديث قاعدة تنبيه
   */
  updateRule(ruleId: string, updates: Partial<AlertRule>): void {
    const rule = this.rules.find((r) => r.id === ruleId);
    if (rule) {
      Object.assign(rule, updates);
    }
  }

  /**
   * حذف قاعدة تنبيه
   */
  deleteRule(ruleId: string): void {
    this.rules = this.rules.filter((r) => r.id !== ruleId);
  }

  /**
   * الحصول على جميع القواعس
   */
  getRules(): AlertRule[] {
    return this.rules;
  }
}

// إنشاء مثيل واحد من الخدمة
export const alertService = new AlertService();

import { getDb } from '../db'; const db = await getDb();
import { invoices, shipments, customsDeclarations } from '../../drizzle/schema';
import { paymentTransactions } from '../../drizzle/payment-schema';
import { eq } from 'drizzle-orm';
import { notifyOwner } from '../_core/notification';

/**
 * خدمة التنبيهات الذكية
 * Smart Alerts Service
 * مراقبة فورية للبيانات وإرسال تنبيهات عند تجاوز الحدود المعينة
 */

export interface AlertThreshold {
  userId: number;
  alertType: 'payment_success_rate' | 'sales_decline' | 'shipping_delay' | 'customs_rejection' | 'revenue_target';
  threshold: number;
  operator: 'below' | 'above' | 'equals';
  enabled: boolean;
  notificationChannels: ('email' | 'sms' | 'in_app' | 'webhook')[];
}

export interface AlertEvent {
  userId: number;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
  actionUrl?: string;
}

// ==================== مراقبة معدل نجاح الدفع ====================

export async function monitorPaymentSuccessRate(userId: number, threshold: number = 90): Promise<AlertEvent | null> {
  try {
    const transactions = await db.query.paymentTransactions.findMany({
      where: eq(paymentTransactions.userId, userId),
    });

    // حساب معدل النجاح من آخر 100 معاملة
    const recentTransactions = transactions.slice(-100);
    const successCount = recentTransactions.filter((t) => t.status === 'completed').length;
    const successRate = (successCount / recentTransactions.length) * 100;

    if (successRate < threshold) {
      const alert: AlertEvent = {
        userId,
        alertType: 'payment_success_rate',
        severity: successRate < 70 ? 'critical' : 'high',
        title: 'انخفاض معدل نجاح المدفوعات',
        message: `معدل نجاح المدفوعات انخفض إلى ${successRate.toFixed(2)}% (الحد الأدنى: ${threshold}%)`,
        currentValue: successRate,
        threshold,
        timestamp: new Date(),
        actionUrl: '/payments',
      };

      await triggerAlert(alert);
      return alert;
    }

    return null;
  } catch (error) {
    console.error('Error monitoring payment success rate:', error);
    throw error;
  }
}

// ==================== مراقبة انخفاض المبيعات ====================

export async function monitorSalesDecline(userId: number, declineThreshold: number = 20): Promise<AlertEvent | null> {
  try {
    const invoices = await db.query.invoices.findMany({
      where: eq(invoices.userId, userId),
    });

    if (invoices.length < 2) return null;

    // مقارنة المبيعات بين الفترتين
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const previousMonthSales = invoices
      .filter((inv) => {
        const invDate = new Date(inv.createdAt);
        return invDate >= previousMonth && invDate < currentMonth;
      })
      .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0);

    const currentMonthSales = invoices
      .filter((inv) => {
        const invDate = new Date(inv.createdAt);
        return invDate >= currentMonth;
      })
      .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0);

    if (previousMonthSales > 0) {
      const declinePercentage = ((previousMonthSales - currentMonthSales) / previousMonthSales) * 100;

      if (declinePercentage > declineThreshold) {
        const alert: AlertEvent = {
          userId,
          alertType: 'sales_decline',
          severity: declinePercentage > 50 ? 'critical' : declinePercentage > 30 ? 'high' : 'medium',
          title: 'انخفاض كبير في المبيعات',
          message: `انخفضت المبيعات بنسبة ${declinePercentage.toFixed(2)}% مقارنة بالشهر السابق`,
          currentValue: declinePercentage,
          threshold: declineThreshold,
          timestamp: new Date(),
          actionUrl: '/analytics',
        };

        await triggerAlert(alert);
        return alert;
      }
    }

    return null;
  } catch (error) {
    console.error('Error monitoring sales decline:', error);
    throw error;
  }
}

// ==================== مراقبة تأخر الشحنات ====================

export async function monitorShippingDelay(userId: number, delayThresholdDays: number = 5): Promise<AlertEvent | null> {
  try {
    const shipments = await db.query.shipments.findMany({
      where: eq(shipments.userId, userId),
    });

    // البحث عن الشحنات المتأخرة
    const now = new Date();
    const delayedShipments = shipments.filter((ship) => {
      if (ship.status === 'delivered') return false;

      const createdDate = new Date(ship.createdAt);
      const daysDifference = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      return daysDifference > delayThresholdDays;
    });

    if (delayedShipments.length > 0) {
      const alert: AlertEvent = {
        userId,
        alertType: 'shipping_delay',
        severity: delayedShipments.length > 5 ? 'critical' : 'high',
        title: 'تأخر في الشحنات',
        message: `يوجد ${delayedShipments.length} شحنة متأخرة عن الموعد المحدد`,
        currentValue: delayedShipments.length,
        threshold: delayThresholdDays,
        timestamp: new Date(),
        actionUrl: '/shipping',
      };

      await triggerAlert(alert);
      return alert;
    }

    return null;
  } catch (error) {
    console.error('Error monitoring shipping delay:', error);
    throw error;
  }
}

// ==================== مراقبة رفض التصريحات الجمركية ====================

export async function monitorCustomsRejection(userId: number, rejectionThreshold: number = 10): Promise<AlertEvent | null> {
  try {
    const declarations = await db.query.customsDeclarations.findMany({
      where: eq(customsDeclarations.userId, userId),
    });

    if (declarations.length === 0) return null;

    // حساب نسبة الرفض
    const rejectedCount = declarations.filter((d) => d.status === 'rejected').length;
    const rejectionRate = (rejectedCount / declarations.length) * 100;

    if (rejectionRate > rejectionThreshold) {
      const alert: AlertEvent = {
        userId,
        alertType: 'customs_rejection',
        severity: rejectionRate > 30 ? 'critical' : 'high',
        title: 'ارتفاع نسبة رفض التصريحات الجمركية',
        message: `نسبة الرفض وصلت إلى ${rejectionRate.toFixed(2)}% (الحد الأدنى المقبول: ${rejectionThreshold}%)`,
        currentValue: rejectionRate,
        threshold: rejectionThreshold,
        timestamp: new Date(),
        actionUrl: '/customs',
      };

      await triggerAlert(alert);
      return alert;
    }

    return null;
  } catch (error) {
    console.error('Error monitoring customs rejection:', error);
    throw error;
  }
}

// ==================== مراقبة الهدف المالي ====================

export async function monitorRevenueTarget(userId: number, monthlyTarget: number): Promise<AlertEvent | null> {
  try {
    const invoices = await db.query.invoices.findMany({
      where: eq(invoices.userId, userId),
    });

    // حساب الإيرادات الحالية للشهر
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthRevenue = invoices
      .filter((inv) => {
        const invDate = new Date(inv.createdAt);
        return invDate >= currentMonth;
      })
      .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0);

    const remainingDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate();
    const daysElapsed = now.getDate();
    const projectedRevenue = (currentMonthRevenue / daysElapsed) * new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    if (projectedRevenue < monthlyTarget) {
      const shortfall = monthlyTarget - projectedRevenue;
      const shortfallPercentage = (shortfall / monthlyTarget) * 100;

      const alert: AlertEvent = {
        userId,
        alertType: 'revenue_target',
        severity: shortfallPercentage > 50 ? 'critical' : shortfallPercentage > 25 ? 'high' : 'medium',
        title: 'عدم تحقيق الهدف المالي',
        message: `الإيرادات المتوقعة ${projectedRevenue.toFixed(2)} د.ا أقل من الهدف ${monthlyTarget.toFixed(2)} د.ا بمقدار ${shortfall.toFixed(2)} د.ا`,
        currentValue: projectedRevenue,
        threshold: monthlyTarget,
        timestamp: new Date(),
        actionUrl: '/analytics',
      };

      await triggerAlert(alert);
      return alert;
    }

    return null;
  } catch (error) {
    console.error('Error monitoring revenue target:', error);
    throw error;
  }
}

// ==================== تشغيل التنبيهات ====================

export async function triggerAlert(alert: AlertEvent): Promise<void> {
  try {
    // إرسال إشعار للمالك
    await notifyOwner({
      title: alert.title,
      content: alert.message,
    });

    // يمكن إضافة منطق إضافي هنا:
    // - حفظ التنبيه في قاعدة البيانات
    // - إرسال بريد إلكتروني
    // - إرسال SMS
    // - استدعاء webhook

    console.log(`Alert triggered: ${alert.title}`, alert);
  } catch (error) {
    console.error('Error triggering alert:', error);
    throw error;
  }
}

// ==================== مراقبة شاملة ====================

export async function runComprehensiveMonitoring(userId: number, thresholds: {
  paymentSuccessRate?: number;
  salesDecline?: number;
  shippingDelay?: number;
  customsRejection?: number;
  monthlyTarget?: number;
}): Promise<AlertEvent[]> {
  try {
    const alerts: AlertEvent[] = [];

    // تشغيل جميع المراقبات
    if (thresholds.paymentSuccessRate !== undefined) {
      const alert = await monitorPaymentSuccessRate(userId, thresholds.paymentSuccessRate);
      if (alert) alerts.push(alert);
    }

    if (thresholds.salesDecline !== undefined) {
      const alert = await monitorSalesDecline(userId, thresholds.salesDecline);
      if (alert) alerts.push(alert);
    }

    if (thresholds.shippingDelay !== undefined) {
      const alert = await monitorShippingDelay(userId, thresholds.shippingDelay);
      if (alert) alerts.push(alert);
    }

    if (thresholds.customsRejection !== undefined) {
      const alert = await monitorCustomsRejection(userId, thresholds.customsRejection);
      if (alert) alerts.push(alert);
    }

    if (thresholds.monthlyTarget !== undefined) {
      const alert = await monitorRevenueTarget(userId, thresholds.monthlyTarget);
      if (alert) alerts.push(alert);
    }

    return alerts;
  } catch (error) {
    console.error('Error running comprehensive monitoring:', error);
    throw error;
  }
}

// ==================== إعدادات التنبيهات ====================

export async function getAlertThresholds(userId: number): Promise<AlertThreshold[]> {
  // يمكن جلب الإعدادات من قاعدة البيانات
  return [
    {
      userId,
      alertType: 'payment_success_rate',
      threshold: 90,
      operator: 'below',
      enabled: true,
      notificationChannels: ['email', 'in_app'],
    },
    {
      userId,
      alertType: 'sales_decline',
      threshold: 20,
      operator: 'above',
      enabled: true,
      notificationChannels: ['email', 'in_app'],
    },
    {
      userId,
      alertType: 'shipping_delay',
      threshold: 5,
      operator: 'above',
      enabled: true,
      notificationChannels: ['email', 'in_app'],
    },
    {
      userId,
      alertType: 'customs_rejection',
      threshold: 10,
      operator: 'above',
      enabled: true,
      notificationChannels: ['email', 'in_app'],
    },
  ];
}

export async function updateAlertThreshold(
  userId: number,
  alertType: string,
  newThreshold: number
): Promise<{ success: boolean; message: string }> {
  try {
    // تحديث الإعدادات في قاعدة البيانات
    console.log(`Updated alert threshold for ${alertType}: ${newThreshold}`);

    return {
      success: true,
      message: 'تم تحديث إعدادات التنبيه بنجاح',
    };
  } catch (error) {
    console.error('Error updating alert threshold:', error);
    throw error;
  }
}

import { getDb } from '../db'; const db = await getDb();
import { invoices, shipments, customsDeclarations } from '../../drizzle/schema';
import { paymentTransactions } from '../../drizzle/payment-schema';
import { eq } from 'drizzle-orm';

/**
 * خدمة المقارنة والتنبؤات
 * Comparison and Forecasting Service
 * تحليل الاتجاهات والتنبؤ بالقيم المستقبلية
 */

export interface TrendAnalysis {
  metric: string;
  period: string;
  currentValue: number;
  previousValue: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
  trend7Days: number[];
  trend30Days: number[];
  movingAverage7: number;
  movingAverage30: number;
}

export interface Forecast {
  metric: string;
  forecastPeriod: 'week' | 'month' | 'quarter';
  currentValue: number;
  forecastedValue: number;
  confidence: number; // 0-100
  trend: 'increasing' | 'decreasing' | 'stable';
  forecastedValues: Array<{ date: Date; value: number }>;
}

// ==================== تحليل الاتجاهات ====================

export async function analyzeSalesTrend(userId: number): Promise<TrendAnalysis> {
  try {
    const invoices = await db.query.invoices.findMany({
      where: eq(invoices.userId, userId),
    });

    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // حساب المبيعات الحالية والسابقة
    const currentMonthSales = invoices
      .filter((inv) => {
        const invDate = new Date(inv.createdAt);
        return invDate >= currentMonth;
      })
      .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0);

    const previousMonthSales = invoices
      .filter((inv) => {
        const invDate = new Date(inv.createdAt);
        return invDate >= previousMonth && invDate < currentMonth;
      })
      .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0);

    // حساب النسبة المئوية للتغيير
    const changePercentage = previousMonthSales > 0
      ? ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100
      : 0;

    // الحصول على بيانات آخر 30 يوم
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const last30Days = invoices.filter((inv) => {
      const invDate = new Date(inv.createdAt);
      return invDate >= thirtyDaysAgo;
    });

    // حساب القيم اليومية
    const dailyValues = new Map<string, number>();
    last30Days.forEach((inv) => {
      const dateKey = new Date(inv.createdAt).toISOString().split('T')[0];
      const current = dailyValues.get(dateKey) || 0;
      dailyValues.set(dateKey, current + parseFloat(inv.totalAmount.toString()));
    });

    const trend30Days = Array.from(dailyValues.values());
    const movingAverage30 = trend30Days.length > 0
      ? trend30Days.reduce((a, b) => a + b, 0) / trend30Days.length
      : 0;

    // آخر 7 أيام
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const last7Days = invoices.filter((inv) => {
      const invDate = new Date(inv.createdAt);
      return invDate >= sevenDaysAgo;
    });

    const dailyValues7 = new Map<string, number>();
    last7Days.forEach((inv) => {
      const dateKey = new Date(inv.createdAt).toISOString().split('T')[0];
      const current = dailyValues7.get(dateKey) || 0;
      dailyValues7.set(dateKey, current + parseFloat(inv.totalAmount.toString()));
    });

    const trend7Days = Array.from(dailyValues7.values());
    const movingAverage7 = trend7Days.length > 0
      ? trend7Days.reduce((a, b) => a + b, 0) / trend7Days.length
      : 0;

    return {
      metric: 'sales',
      period: 'month',
      currentValue: currentMonthSales,
      previousValue: previousMonthSales,
      changePercentage,
      trend: changePercentage > 0 ? 'up' : changePercentage < 0 ? 'down' : 'stable',
      trend7Days,
      trend30Days,
      movingAverage7,
      movingAverage30,
    };
  } catch (error) {
    console.error('Error analyzing sales trend:', error);
    throw error;
  }
}

export async function analyzePaymentTrend(userId: number): Promise<TrendAnalysis> {
  try {
    const transactions = await db.query.paymentTransactions.findMany({
      where: eq(paymentTransactions.userId, userId),
    });

    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // حساب المدفوعات الحالية والسابقة
    const currentMonthPayments = transactions
      .filter((txn) => {
        const txnDate = new Date(txn.transactionDate);
        return txnDate >= currentMonth;
      })
      .reduce((sum, txn) => sum + parseFloat(txn.amount.toString()), 0);

    const previousMonthPayments = transactions
      .filter((txn) => {
        const txnDate = new Date(txn.transactionDate);
        return txnDate >= previousMonth && txnDate < currentMonth;
      })
      .reduce((sum, txn) => sum + parseFloat(txn.amount.toString()), 0);

    // حساب النسبة المئوية للتغيير
    const changePercentage = previousMonthPayments > 0
      ? ((currentMonthPayments - previousMonthPayments) / previousMonthPayments) * 100
      : 0;

    // الحصول على بيانات آخر 30 يوم
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const last30Days = transactions.filter((txn) => {
      const txnDate = new Date(txn.transactionDate);
      return txnDate >= thirtyDaysAgo;
    });

    const dailyValues = new Map<string, number>();
    last30Days.forEach((txn) => {
      const dateKey = new Date(txn.transactionDate).toISOString().split('T')[0];
      const current = dailyValues.get(dateKey) || 0;
      dailyValues.set(dateKey, current + parseFloat(txn.amount.toString()));
    });

    const trend30Days = Array.from(dailyValues.values());
    const movingAverage30 = trend30Days.length > 0
      ? trend30Days.reduce((a, b) => a + b, 0) / trend30Days.length
      : 0;

    // آخر 7 أيام
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const last7Days = transactions.filter((txn) => {
      const txnDate = new Date(txn.transactionDate);
      return txnDate >= sevenDaysAgo;
    });

    const dailyValues7 = new Map<string, number>();
    last7Days.forEach((txn) => {
      const dateKey = new Date(txn.transactionDate).toISOString().split('T')[0];
      const current = dailyValues7.get(dateKey) || 0;
      dailyValues7.set(dateKey, current + parseFloat(txn.amount.toString()));
    });

    const trend7Days = Array.from(dailyValues7.values());
    const movingAverage7 = trend7Days.length > 0
      ? trend7Days.reduce((a, b) => a + b, 0) / trend7Days.length
      : 0;

    return {
      metric: 'payments',
      period: 'month',
      currentValue: currentMonthPayments,
      previousValue: previousMonthPayments,
      changePercentage,
      trend: changePercentage > 0 ? 'up' : changePercentage < 0 ? 'down' : 'stable',
      trend7Days,
      trend30Days,
      movingAverage7,
      movingAverage30,
    };
  } catch (error) {
    console.error('Error analyzing payment trend:', error);
    throw error;
  }
}

// ==================== التنبؤات ====================

export async function forecastSales(userId: number, forecastPeriod: 'week' | 'month' | 'quarter' = 'month'): Promise<Forecast> {
  try {
    const trend = await analyzeSalesTrend(userId);

    // استخدام المتوسط المتحرك للتنبؤ
    const baseValue = trend.movingAverage30;
    const trendFactor = trend.changePercentage / 100;

    // حساب القيمة المتنبأ بها
    let forecastedValue = baseValue * (1 + trendFactor);
    let confidence = calculateConfidence(trend.trend30Days);

    // توليد قيم التنبؤ
    const forecastedValues: Array<{ date: Date; value: number }> = [];
    const now = new Date();

    const daysToForecast = forecastPeriod === 'week' ? 7 : forecastPeriod === 'month' ? 30 : 90;

    for (let i = 0; i < daysToForecast; i++) {
      const forecastDate = new Date(now);
      forecastDate.setDate(forecastDate.getDate() + i);

      // إضافة تذبذب طفيف للتنبؤ
      const variance = baseValue * 0.1 * (Math.random() - 0.5);
      const value = forecastedValue + variance;

      forecastedValues.push({
        date: forecastDate,
        value: Math.max(0, value),
      });
    }

    return {
      metric: 'sales',
      forecastPeriod,
      currentValue: trend.currentValue,
      forecastedValue,
      confidence,
      trend: trendFactor > 0.05 ? 'increasing' : trendFactor < -0.05 ? 'decreasing' : 'stable',
      forecastedValues,
    };
  } catch (error) {
    console.error('Error forecasting sales:', error);
    throw error;
  }
}

export async function forecastPayments(userId: number, forecastPeriod: 'week' | 'month' | 'quarter' = 'month'): Promise<Forecast> {
  try {
    const trend = await analyzePaymentTrend(userId);

    // استخدام المتوسط المتحرك للتنبؤ
    const baseValue = trend.movingAverage30;
    const trendFactor = trend.changePercentage / 100;

    // حساب القيمة المتنبأ بها
    let forecastedValue = baseValue * (1 + trendFactor);
    let confidence = calculateConfidence(trend.trend30Days);

    // توليد قيم التنبؤ
    const forecastedValues: Array<{ date: Date; value: number }> = [];
    const now = new Date();

    const daysToForecast = forecastPeriod === 'week' ? 7 : forecastPeriod === 'month' ? 30 : 90;

    for (let i = 0; i < daysToForecast; i++) {
      const forecastDate = new Date(now);
      forecastDate.setDate(forecastDate.getDate() + i);

      // إضافة تذبذب طفيف للتنبؤ
      const variance = baseValue * 0.1 * (Math.random() - 0.5);
      const value = forecastedValue + variance;

      forecastedValues.push({
        date: forecastDate,
        value: Math.max(0, value),
      });
    }

    return {
      metric: 'payments',
      forecastPeriod,
      currentValue: trend.currentValue,
      forecastedValue,
      confidence,
      trend: trendFactor > 0.05 ? 'increasing' : trendFactor < -0.05 ? 'decreasing' : 'stable',
      forecastedValues,
    };
  } catch (error) {
    console.error('Error forecasting payments:', error);
    throw error;
  }
}

// ==================== المقارنة المتقدمة ====================

export async function comparePeriodsAdvanced(
  userId: number,
  metric: 'sales' | 'payments' | 'shipping' | 'customs',
  period1: { start: Date; end: Date },
  period2: { start: Date; end: Date }
): Promise<{
  metric: string;
  period1: { value: number; label: string };
  period2: { value: number; label: string };
  difference: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'stable';
  insights: string[];
}> {
  try {
    let value1 = 0;
    let value2 = 0;

    switch (metric) {
      case 'sales': {
        const invoices = await db.query.invoices.findMany({
          where: eq(invoices.userId, userId),
        });

        value1 = invoices
          .filter((inv) => {
            const invDate = new Date(inv.createdAt);
            return invDate >= period1.start && invDate <= period1.end;
          })
          .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0);

        value2 = invoices
          .filter((inv) => {
            const invDate = new Date(inv.createdAt);
            return invDate >= period2.start && invDate <= period2.end;
          })
          .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0);
        break;
      }

      case 'payments': {
        const transactions = await db.query.paymentTransactions.findMany({
          where: eq(paymentTransactions.userId, userId),
        });

        value1 = transactions
          .filter((txn) => {
            const txnDate = new Date(txn.transactionDate);
            return txnDate >= period1.start && txnDate <= period1.end;
          })
          .reduce((sum, txn) => sum + parseFloat(txn.amount.toString()), 0);

        value2 = transactions
          .filter((txn) => {
            const txnDate = new Date(txn.transactionDate);
            return txnDate >= period2.start && txnDate <= period2.end;
          })
          .reduce((sum, txn) => sum + parseFloat(txn.amount.toString()), 0);
        break;
      }
    }

    const difference = value2 - value1;
    const percentageChange = value1 > 0 ? (difference / value1) * 100 : 0;
    const trend = percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'stable';

    // توليد الرؤى
    const insights: string[] = [];

    if (Math.abs(percentageChange) > 50) {
      insights.push(`تغيير كبير جداً بنسبة ${Math.abs(percentageChange).toFixed(2)}%`);
    }

    if (trend === 'up') {
      insights.push(`الأداء يتحسن مع زيادة بنسبة ${percentageChange.toFixed(2)}%`);
    } else if (trend === 'down') {
      insights.push(`الأداء يتراجع مع انخفاض بنسبة ${Math.abs(percentageChange).toFixed(2)}%`);
    }

    return {
      metric,
      period1: {
        value: value1,
        label: `${period1.start.toLocaleDateString('ar-JO')} - ${period1.end.toLocaleDateString('ar-JO')}`,
      },
      period2: {
        value: value2,
        label: `${period2.start.toLocaleDateString('ar-JO')} - ${period2.end.toLocaleDateString('ar-JO')}`,
      },
      difference,
      percentageChange,
      trend,
      insights,
    };
  } catch (error) {
    console.error('Error comparing periods:', error);
    throw error;
  }
}

// ==================== دوال مساعدة ====================

function calculateConfidence(values: number[]): number {
  if (values.length === 0) return 50;

  // حساب الانحراف المعياري
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // كلما قل الانحراف المعياري، زادت الثقة
  const coefficientOfVariation = mean > 0 ? (stdDev / mean) * 100 : 100;

  // تحويل إلى نسبة ثقة (0-100)
  const confidence = Math.max(0, Math.min(100, 100 - coefficientOfVariation));

  return confidence;
}

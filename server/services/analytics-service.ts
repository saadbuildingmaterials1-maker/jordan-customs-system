import { db } from '../db';
import { invoices, shipments, customsDeclarations } from '../../drizzle/schema';
import { paymentTransactions } from '../../drizzle/payment-schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

/**
 * خدمة التحليلات المتقدمة
 * Advanced Analytics Service
 * توفر بيانات تحليلية فورية للمبيعات والمدفوعات والشحنات
 */

// ==================== إحصائيات المبيعات ====================

export async function getSalesStatistics(userId: number, period: 'day' | 'week' | 'month' | 'year' = 'month') {
  try {
    const startDate = getStartDate(period);
    const endDate = new Date();

    // جلب الفواتير
    const allInvoices = await db.query.invoices.findMany({
      where: eq(invoices.userId, userId),
    });

    const periodInvoices = allInvoices.filter((inv) => {
      const invDate = new Date(inv.createdAt);
      return invDate >= startDate && invDate <= endDate;
    });

    // حساب الإحصائيات
    const totalSales = periodInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0);
    const paidSales = periodInvoices
      .filter((inv) => inv.paymentStatus === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0);
    const pendingSales = periodInvoices
      .filter((inv) => inv.paymentStatus === 'pending')
      .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0);

    // حساب الرسوم الجمركية
    const customsDuties = periodInvoices.reduce((sum, inv) => sum + parseFloat(inv.customsDuties.toString()), 0);
    const taxes = periodInvoices.reduce((sum, inv) => sum + parseFloat(inv.taxes.toString()), 0);

    // حساب متوسط قيمة الفاتورة
    const averageInvoiceValue = periodInvoices.length > 0 ? totalSales / periodInvoices.length : 0;

    // توزيع الفواتير حسب الحالة
    const statusDistribution = {
      draft: periodInvoices.filter((inv) => inv.status === 'draft').length,
      issued: periodInvoices.filter((inv) => inv.status === 'issued').length,
      approved: periodInvoices.filter((inv) => inv.status === 'approved').length,
      cancelled: periodInvoices.filter((inv) => inv.status === 'cancelled').length,
    };

    return {
      period,
      startDate,
      endDate,
      totalInvoices: periodInvoices.length,
      totalSales,
      paidSales,
      pendingSales,
      customsDuties,
      taxes,
      averageInvoiceValue,
      statusDistribution,
    };
  } catch (error) {
    console.error('Error getting sales statistics:', error);
    throw error;
  }
}

// ==================== إحصائيات الدفع ====================

export async function getPaymentStatistics(userId: number, period: 'day' | 'week' | 'month' | 'year' = 'month') {
  try {
    const startDate = getStartDate(period);
    const endDate = new Date();

    // جلب المعاملات
    const allTransactions = await db.query.paymentTransactions.findMany({
      where: eq(paymentTransactions.userId, userId),
    });

    const periodTransactions = allTransactions.filter((txn) => {
      const txnDate = new Date(txn.transactionDate);
      return txnDate >= startDate && txnDate <= endDate;
    });

    // حساب الإحصائيات
    const totalPayments = periodTransactions.reduce((sum, txn) => sum + parseFloat(txn.amount.toString()), 0);
    const completedPayments = periodTransactions
      .filter((txn) => txn.status === 'completed')
      .reduce((sum, txn) => sum + parseFloat(txn.amount.toString()), 0);
    const failedPayments = periodTransactions
      .filter((txn) => txn.status === 'failed')
      .reduce((sum, txn) => sum + parseFloat(txn.amount.toString()), 0);

    // توزيع طرق الدفع
    const paymentMethodDistribution = {
      credit_card: periodTransactions.filter((txn) => txn.paymentMethod === 'credit_card').length,
      debit_card: periodTransactions.filter((txn) => txn.paymentMethod === 'debit_card').length,
      bank_transfer: periodTransactions.filter((txn) => txn.paymentMethod === 'bank_transfer').length,
      mobile_wallet: periodTransactions.filter((txn) => txn.paymentMethod === 'mobile_wallet').length,
      installment: periodTransactions.filter((txn) => txn.paymentMethod === 'installment').length,
    };

    // توزيع البنوك
    const bankDistribution = periodTransactions.reduce((acc: Record<string, number>, txn) => {
      const bankName = txn.bank?.bankNameAr || 'Unknown';
      acc[bankName] = (acc[bankName] || 0) + 1;
      return acc;
    }, {});

    // معدل النجاح
    const successRate = periodTransactions.length > 0
      ? (periodTransactions.filter((txn) => txn.status === 'completed').length / periodTransactions.length) * 100
      : 0;

    // متوسط قيمة المعاملة
    const averageTransactionValue = periodTransactions.length > 0 ? totalPayments / periodTransactions.length : 0;

    return {
      period,
      startDate,
      endDate,
      totalTransactions: periodTransactions.length,
      totalPayments,
      completedPayments,
      failedPayments,
      successRate,
      averageTransactionValue,
      paymentMethodDistribution,
      bankDistribution,
    };
  } catch (error) {
    console.error('Error getting payment statistics:', error);
    throw error;
  }
}

// ==================== إحصائيات الشحنات ====================

export async function getShippingStatistics(userId: number, period: 'day' | 'week' | 'month' | 'year' = 'month') {
  try {
    const startDate = getStartDate(period);
    const endDate = new Date();

    // جلب الشحنات
    const allShipments = await db.query.shipments.findMany({
      where: eq(shipments.userId, userId),
    });

    const periodShipments = allShipments.filter((ship) => {
      const shipDate = new Date(ship.createdAt);
      return shipDate >= startDate && shipDate <= endDate;
    });

    // حساب الإحصائيات
    const totalShipments = periodShipments.length;
    const totalWeight = periodShipments.reduce((sum, ship) => sum + parseFloat(ship.weight.toString()), 0);
    const totalValue = periodShipments.reduce((sum, ship) => sum + parseFloat(ship.declaredValue.toString()), 0);

    // توزيع حسب الحالة
    const statusDistribution = {
      pending: periodShipments.filter((ship) => ship.status === 'pending').length,
      in_transit: periodShipments.filter((ship) => ship.status === 'in_transit').length,
      delivered: periodShipments.filter((ship) => ship.status === 'delivered').length,
      cancelled: periodShipments.filter((ship) => ship.status === 'cancelled').length,
    };

    // توزيع حسب الوجهة
    const destinationDistribution = periodShipments.reduce((acc: Record<string, number>, ship) => {
      const destination = ship.destination || 'Unknown';
      acc[destination] = (acc[destination] || 0) + 1;
      return acc;
    }, {});

    // متوسط قيمة الشحنة
    const averageShipmentValue = totalShipments > 0 ? totalValue / totalShipments : 0;

    return {
      period,
      startDate,
      endDate,
      totalShipments,
      totalWeight,
      totalValue,
      averageShipmentValue,
      statusDistribution,
      destinationDistribution,
    };
  } catch (error) {
    console.error('Error getting shipping statistics:', error);
    throw error;
  }
}

// ==================== إحصائيات الجمارك ====================

export async function getCustomsStatistics(userId: number, period: 'day' | 'week' | 'month' | 'year' = 'month') {
  try {
    const startDate = getStartDate(period);
    const endDate = new Date();

    // جلب التصريحات الجمركية
    const allDeclarations = await db.query.customsDeclarations.findMany({
      where: eq(customsDeclarations.userId, userId),
    });

    const periodDeclarations = allDeclarations.filter((decl) => {
      const declDate = new Date(decl.createdAt);
      return declDate >= startDate && declDate <= endDate;
    });

    // حساب الإحصائيات
    const totalDeclarations = periodDeclarations.length;
    const totalDeclaredValue = periodDeclarations.reduce((sum, decl) => sum + parseFloat(decl.declaredValue.toString()), 0);
    const totalDuties = periodDeclarations.reduce((sum, decl) => sum + parseFloat(decl.customsDuties.toString()), 0);
    const totalTaxes = periodDeclarations.reduce((sum, decl) => sum + parseFloat(decl.taxes.toString()), 0);

    // توزيع حسب الحالة
    const statusDistribution = {
      draft: periodDeclarations.filter((decl) => decl.status === 'draft').length,
      submitted: periodDeclarations.filter((decl) => decl.status === 'submitted').length,
      approved: periodDeclarations.filter((decl) => decl.status === 'approved').length,
      rejected: periodDeclarations.filter((decl) => decl.status === 'rejected').length,
      cleared: periodDeclarations.filter((decl) => decl.status === 'cleared').length,
    };

    // توزيع حسب نوع الرسوم
    const dutyTypeDistribution = periodDeclarations.reduce((acc: Record<string, number>, decl) => {
      const dutyType = decl.dutyType || 'standard';
      acc[dutyType] = (acc[dutyType] || 0) + 1;
      return acc;
    }, {});

    // متوسط الرسوم والضرائب
    const averageDuties = totalDeclarations > 0 ? totalDuties / totalDeclarations : 0;
    const averageTaxes = totalDeclarations > 0 ? totalTaxes / totalDeclarations : 0;

    // نسبة الموافقة
    const approvalRate = totalDeclarations > 0
      ? (periodDeclarations.filter((decl) => decl.status === 'approved' || decl.status === 'cleared').length / totalDeclarations) * 100
      : 0;

    return {
      period,
      startDate,
      endDate,
      totalDeclarations,
      totalDeclaredValue,
      totalDuties,
      totalTaxes,
      averageDuties,
      averageTaxes,
      approvalRate,
      statusDistribution,
      dutyTypeDistribution,
    };
  } catch (error) {
    console.error('Error getting customs statistics:', error);
    throw error;
  }
}

// ==================== البيانات الزمنية ====================

export async function getTimeSeriesData(userId: number, metric: 'sales' | 'payments' | 'shipments' | 'customs', period: 'day' | 'week' | 'month' | 'year' = 'month') {
  try {
    const startDate = getStartDate(period);
    const endDate = new Date();
    const timePoints = generateTimePoints(startDate, endDate, period);

    const data = timePoints.map((point) => {
      const pointStart = point.start;
      const pointEnd = point.end;

      let value = 0;

      switch (metric) {
        case 'sales': {
          const invoices = db.query.invoices.findMany({
            where: eq(invoices.userId, userId),
          });
          // Filter by date range
          value = 0; // Placeholder
          break;
        }
        case 'payments': {
          // Similar logic for payments
          value = 0; // Placeholder
          break;
        }
        case 'shipments': {
          // Similar logic for shipments
          value = 0; // Placeholder
          break;
        }
        case 'customs': {
          // Similar logic for customs
          value = 0; // Placeholder
          break;
        }
      }

      return {
        date: point.label,
        value,
      };
    });

    return data;
  } catch (error) {
    console.error('Error getting time series data:', error);
    throw error;
  }
}

// ==================== مقارنة الفترات ====================

export async function comparePeriods(userId: number, metric: 'sales' | 'payments' | 'shipments' | 'customs', currentPeriod: 'day' | 'week' | 'month' | 'year', previousPeriod: 'day' | 'week' | 'month' | 'year') {
  try {
    let currentStats: any;
    let previousStats: any;

    switch (metric) {
      case 'sales':
        currentStats = await getSalesStatistics(userId, currentPeriod);
        previousStats = await getSalesStatistics(userId, previousPeriod);
        break;
      case 'payments':
        currentStats = await getPaymentStatistics(userId, currentPeriod);
        previousStats = await getPaymentStatistics(userId, previousPeriod);
        break;
      case 'shipments':
        currentStats = await getShippingStatistics(userId, currentPeriod);
        previousStats = await getShippingStatistics(userId, previousPeriod);
        break;
      case 'customs':
        currentStats = await getCustomsStatistics(userId, currentPeriod);
        previousStats = await getCustomsStatistics(userId, previousPeriod);
        break;
    }

    // حساب النسبة المئوية للتغيير
    const currentValue = currentStats.totalSales || currentStats.totalPayments || currentStats.totalShipments || currentStats.totalDeclaredValue || 0;
    const previousValue = previousStats.totalSales || previousStats.totalPayments || previousStats.totalShipments || previousStats.totalDeclaredValue || 0;

    const percentageChange = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
    const trend = percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'stable';

    return {
      metric,
      currentPeriod,
      previousPeriod,
      currentValue,
      previousValue,
      percentageChange,
      trend,
      currentStats,
      previousStats,
    };
  } catch (error) {
    console.error('Error comparing periods:', error);
    throw error;
  }
}

// ==================== الإحصائيات الشاملة ====================

export async function getDashboardSummary(userId: number, period: 'day' | 'week' | 'month' | 'year' = 'month') {
  try {
    const [sales, payments, shipping, customs] = await Promise.all([
      getSalesStatistics(userId, period),
      getPaymentStatistics(userId, period),
      getShippingStatistics(userId, period),
      getCustomsStatistics(userId, period),
    ]);

    return {
      period,
      sales,
      payments,
      shipping,
      customs,
      summary: {
        totalRevenue: sales.totalSales,
        totalPaymentsProcessed: payments.totalPayments,
        totalShipments: shipping.totalShipments,
        totalCustomsDeclarations: customs.totalDeclarations,
        paymentSuccessRate: payments.successRate,
        customsApprovalRate: customs.approvalRate,
      },
    };
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    throw error;
  }
}

// ==================== دوال مساعدة ====================

function getStartDate(period: 'day' | 'week' | 'month' | 'year'): Date {
  const now = new Date();
  const startDate = new Date(now);

  switch (period) {
    case 'day':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      const day = startDate.getDay();
      const diff = startDate.getDate() - day;
      startDate.setDate(diff);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'year':
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  return startDate;
}

function generateTimePoints(startDate: Date, endDate: Date, period: 'day' | 'week' | 'month' | 'year') {
  const points = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const point = {
      start: new Date(current),
      end: new Date(current),
      label: '',
    };

    switch (period) {
      case 'day':
        point.end.setHours(23, 59, 59, 999);
        point.label = current.toLocaleDateString('ar-JO');
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        point.end.setDate(current.getDate() + 6);
        point.end.setHours(23, 59, 59, 999);
        point.label = `أسبوع ${current.toLocaleDateString('ar-JO')}`;
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        point.end.setMonth(current.getMonth() + 1, 0);
        point.end.setHours(23, 59, 59, 999);
        point.label = current.toLocaleDateString('ar-JO', { month: 'long', year: 'numeric' });
        current.setMonth(current.getMonth() + 1);
        break;
      case 'year':
        point.end.setFullYear(current.getFullYear(), 11, 31);
        point.end.setHours(23, 59, 59, 999);
        point.label = current.getFullYear().toString();
        current.setFullYear(current.getFullYear() + 1);
        break;
    }

    points.push(point);
  }

  return points;
}

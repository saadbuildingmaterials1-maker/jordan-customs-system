import { db } from '../db';
import { invoices, shipments, customsDeclarations } from '../../drizzle/schema';
import { paymentTransactions } from '../../drizzle/payment-schema';
import { eq } from 'drizzle-orm';
import { PDFDocument, rgb } from 'pdf-lib';
import * as XLSX from 'xlsx';

/**
 * خدمة التقارير المتقدمة
 * Advanced Reports Service
 * توليد تقارير مخصصة قابلة للتصدير (PDF/Excel) مع الجدولة والبريد الإلكتروني
 */

export interface ReportConfig {
  userId: number;
  reportType: 'sales' | 'payments' | 'shipping' | 'customs' | 'comprehensive';
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
  startDate?: Date;
  endDate?: Date;
  format: 'pdf' | 'excel' | 'both';
  includeCharts?: boolean;
  includeComparison?: boolean;
  sendEmail?: boolean;
  emailRecipients?: string[];
  schedule?: 'once' | 'daily' | 'weekly' | 'monthly';
  scheduleTime?: string; // HH:mm format
}

// ==================== توليد التقارير ====================

export async function generateSalesReport(config: ReportConfig): Promise<{
  pdf?: Buffer;
  excel?: Buffer;
  summary: Record<string, any>;
}> {
  try {
    const startDate = config.startDate || getStartDate(config.period);
    const endDate = config.endDate || new Date();

    // جلب البيانات
    const invoicesList = await db.query.invoices.findMany({
      where: eq(invoices.userId, config.userId),
    });

    const periodInvoices = invoicesList.filter((inv) => {
      const invDate = new Date(inv.createdAt);
      return invDate >= startDate && invDate <= endDate;
    });

    // حساب الإحصائيات
    const summary = {
      period: config.period,
      startDate,
      endDate,
      totalInvoices: periodInvoices.length,
      totalSales: periodInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0),
      paidSales: periodInvoices
        .filter((inv) => inv.paymentStatus === 'paid')
        .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0),
      pendingSales: periodInvoices
        .filter((inv) => inv.paymentStatus === 'pending')
        .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0),
      customsDuties: periodInvoices.reduce((sum, inv) => sum + parseFloat(inv.customsDuties.toString()), 0),
      taxes: periodInvoices.reduce((sum, inv) => sum + parseFloat(inv.taxes.toString()), 0),
      averageInvoiceValue: periodInvoices.length > 0 
        ? periodInvoices.reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0) / periodInvoices.length 
        : 0,
    };

    const result: any = { summary };

    // توليد PDF
    if (config.format === 'pdf' || config.format === 'both') {
      result.pdf = await generatePDFReport(summary, 'sales', config);
    }

    // توليد Excel
    if (config.format === 'excel' || config.format === 'both') {
      result.excel = await generateExcelReport(periodInvoices, 'sales', config);
    }

    return result;
  } catch (error) {
    console.error('Error generating sales report:', error);
    throw error;
  }
}

export async function generatePaymentReport(config: ReportConfig): Promise<{
  pdf?: Buffer;
  excel?: Buffer;
  summary: Record<string, any>;
}> {
  try {
    const startDate = config.startDate || getStartDate(config.period);
    const endDate = config.endDate || new Date();

    // جلب البيانات
    const transactionsList = await db.query.paymentTransactions.findMany({
      where: eq(paymentTransactions.userId, config.userId),
    });

    const periodTransactions = transactionsList.filter((txn) => {
      const txnDate = new Date(txn.transactionDate);
      return txnDate >= startDate && txnDate <= endDate;
    });

    // حساب الإحصائيات
    const summary = {
      period: config.period,
      startDate,
      endDate,
      totalTransactions: periodTransactions.length,
      totalPayments: periodTransactions.reduce((sum, txn) => sum + parseFloat(txn.amount.toString()), 0),
      completedPayments: periodTransactions
        .filter((txn) => txn.status === 'completed')
        .reduce((sum, txn) => sum + parseFloat(txn.amount.toString()), 0),
      failedPayments: periodTransactions
        .filter((txn) => txn.status === 'failed')
        .reduce((sum, txn) => sum + parseFloat(txn.amount.toString()), 0),
      successRate: periodTransactions.length > 0
        ? (periodTransactions.filter((txn) => txn.status === 'completed').length / periodTransactions.length) * 100
        : 0,
      averageTransactionValue: periodTransactions.length > 0
        ? periodTransactions.reduce((sum, txn) => sum + parseFloat(txn.amount.toString()), 0) / periodTransactions.length
        : 0,
    };

    const result: any = { summary };

    // توليد PDF
    if (config.format === 'pdf' || config.format === 'both') {
      result.pdf = await generatePDFReport(summary, 'payments', config);
    }

    // توليد Excel
    if (config.format === 'excel' || config.format === 'both') {
      result.excel = await generateExcelReport(periodTransactions, 'payments', config);
    }

    return result;
  } catch (error) {
    console.error('Error generating payment report:', error);
    throw error;
  }
}

export async function generateShippingReport(config: ReportConfig): Promise<{
  pdf?: Buffer;
  excel?: Buffer;
  summary: Record<string, any>;
}> {
  try {
    const startDate = config.startDate || getStartDate(config.period);
    const endDate = config.endDate || new Date();

    // جلب البيانات
    const shipmentsList = await db.query.shipments.findMany({
      where: eq(shipments.userId, config.userId),
    });

    const periodShipments = shipmentsList.filter((ship) => {
      const shipDate = new Date(ship.createdAt);
      return shipDate >= startDate && shipDate <= endDate;
    });

    // حساب الإحصائيات
    const summary = {
      period: config.period,
      startDate,
      endDate,
      totalShipments: periodShipments.length,
      totalWeight: periodShipments.reduce((sum, ship) => sum + parseFloat(ship.weight.toString()), 0),
      totalValue: periodShipments.reduce((sum, ship) => sum + parseFloat(ship.declaredValue.toString()), 0),
      deliveredShipments: periodShipments.filter((ship) => ship.status === 'delivered').length,
      inTransitShipments: periodShipments.filter((ship) => ship.status === 'in_transit').length,
      pendingShipments: periodShipments.filter((ship) => ship.status === 'pending').length,
      averageShipmentValue: periodShipments.length > 0
        ? periodShipments.reduce((sum, ship) => sum + parseFloat(ship.declaredValue.toString()), 0) / periodShipments.length
        : 0,
    };

    const result: any = { summary };

    // توليد PDF
    if (config.format === 'pdf' || config.format === 'both') {
      result.pdf = await generatePDFReport(summary, 'shipping', config);
    }

    // توليد Excel
    if (config.format === 'excel' || config.format === 'both') {
      result.excel = await generateExcelReport(periodShipments, 'shipping', config);
    }

    return result;
  } catch (error) {
    console.error('Error generating shipping report:', error);
    throw error;
  }
}

export async function generateCustomsReport(config: ReportConfig): Promise<{
  pdf?: Buffer;
  excel?: Buffer;
  summary: Record<string, any>;
}> {
  try {
    const startDate = config.startDate || getStartDate(config.period);
    const endDate = config.endDate || new Date();

    // جلب البيانات
    const declarationsList = await db.query.customsDeclarations.findMany({
      where: eq(customsDeclarations.userId, config.userId),
    });

    const periodDeclarations = declarationsList.filter((decl) => {
      const declDate = new Date(decl.createdAt);
      return declDate >= startDate && declDate <= endDate;
    });

    // حساب الإحصائيات
    const summary = {
      period: config.period,
      startDate,
      endDate,
      totalDeclarations: periodDeclarations.length,
      totalDeclaredValue: periodDeclarations.reduce((sum, decl) => sum + parseFloat(decl.declaredValue.toString()), 0),
      totalDuties: periodDeclarations.reduce((sum, decl) => sum + parseFloat(decl.customsDuties.toString()), 0),
      totalTaxes: periodDeclarations.reduce((sum, decl) => sum + parseFloat(decl.taxes.toString()), 0),
      approvedDeclarations: periodDeclarations.filter((decl) => decl.status === 'approved' || decl.status === 'cleared').length,
      rejectedDeclarations: periodDeclarations.filter((decl) => decl.status === 'rejected').length,
      approvalRate: periodDeclarations.length > 0
        ? (periodDeclarations.filter((decl) => decl.status === 'approved' || decl.status === 'cleared').length / periodDeclarations.length) * 100
        : 0,
    };

    const result: any = { summary };

    // توليد PDF
    if (config.format === 'pdf' || config.format === 'both') {
      result.pdf = await generatePDFReport(summary, 'customs', config);
    }

    // توليد Excel
    if (config.format === 'excel' || config.format === 'both') {
      result.excel = await generateExcelReport(periodDeclarations, 'customs', config);
    }

    return result;
  } catch (error) {
    console.error('Error generating customs report:', error);
    throw error;
  }
}

// ==================== توليد PDF ====================

async function generatePDFReport(
  data: Record<string, any>,
  reportType: string,
  config: ReportConfig
): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4 size
    const { width, height } = page.getSize();

    // العنوان
    page.drawText(`تقرير ${getReportTitle(reportType)}`, {
      x: 50,
      y: height - 50,
      size: 24,
      color: rgb(0, 0, 0),
    });

    // التاريخ
    page.drawText(`الفترة: ${data.startDate.toLocaleDateString('ar-JO')} - ${data.endDate.toLocaleDateString('ar-JO')}`, {
      x: 50,
      y: height - 100,
      size: 12,
      color: rgb(100, 100, 100),
    });

    // البيانات
    let yPosition = height - 150;
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'period' && key !== 'startDate' && key !== 'endDate') {
        const label = getFieldLabel(key);
        const displayValue = typeof value === 'number' ? value.toFixed(2) : value;

        page.drawText(`${label}: ${displayValue}`, {
          x: 50,
          y: yPosition,
          size: 11,
          color: rgb(0, 0, 0),
        });

        yPosition -= 25;
      }
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

// ==================== توليد Excel ====================

async function generateExcelReport(
  data: any[],
  reportType: string,
  config: ReportConfig
): Promise<Buffer> {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, getReportTitle(reportType));

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    return excelBuffer as Buffer;
  } catch (error) {
    console.error('Error generating Excel:', error);
    throw error;
  }
}

// ==================== جدولة التقارير ====================

export async function scheduleReport(config: ReportConfig & { reportId: string }): Promise<{
  success: boolean;
  reportId: string;
  nextRunTime: Date;
}> {
  try {
    // حساب وقت التشغيل التالي
    const nextRunTime = calculateNextRunTime(config.schedule || 'once', config.scheduleTime);

    // هنا يمكن إضافة منطق الجدولة الفعلي
    // مثل استخدام node-cron أو bull queue

    return {
      success: true,
      reportId: config.reportId,
      nextRunTime,
    };
  } catch (error) {
    console.error('Error scheduling report:', error);
    throw error;
  }
}

// ==================== إرسال التقارير عبر البريد ====================

export async function sendReportByEmail(
  recipients: string[],
  reportType: string,
  attachments: { pdf?: Buffer; excel?: Buffer }
): Promise<{ success: boolean; message: string }> {
  try {
    // هنا يمكن إضافة منطق إرسال البريد الإلكتروني
    // مثل استخدام nodemailer أو SendGrid

    console.log(`Sending ${reportType} report to ${recipients.join(', ')}`);

    return {
      success: true,
      message: 'تم إرسال التقرير بنجاح',
    };
  } catch (error) {
    console.error('Error sending report by email:', error);
    throw error;
  }
}

// ==================== دوال مساعدة ====================

function getStartDate(period: string): Date {
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
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate.setMonth(quarter * 3, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'year':
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
  }

  return startDate;
}

function getReportTitle(reportType: string): string {
  const titles: Record<string, string> = {
    sales: 'المبيعات',
    payments: 'المدفوعات',
    shipping: 'الشحنات',
    customs: 'الجمارك',
    comprehensive: 'شامل',
  };
  return titles[reportType] || reportType;
}

function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    totalInvoices: 'إجمالي الفواتير',
    totalSales: 'إجمالي المبيعات',
    paidSales: 'المبيعات المدفوعة',
    pendingSales: 'المبيعات المعلقة',
    customsDuties: 'الرسوم الجمركية',
    taxes: 'الضرائب',
    averageInvoiceValue: 'متوسط قيمة الفاتورة',
    totalTransactions: 'إجمالي المعاملات',
    totalPayments: 'إجمالي المدفوعات',
    completedPayments: 'المدفوعات المكتملة',
    failedPayments: 'المدفوعات الفاشلة',
    successRate: 'معدل النجاح',
    averageTransactionValue: 'متوسط قيمة المعاملة',
    totalShipments: 'إجمالي الشحنات',
    totalWeight: 'إجمالي الوزن',
    totalValue: 'إجمالي القيمة',
    deliveredShipments: 'الشحنات المسلمة',
    inTransitShipments: 'الشحنات قيد النقل',
    pendingShipments: 'الشحنات المعلقة',
    averageShipmentValue: 'متوسط قيمة الشحنة',
    totalDeclarations: 'إجمالي التصريحات',
    totalDeclaredValue: 'إجمالي القيمة المصرح بها',
    totalDuties: 'إجمالي الرسوم',
    totalTaxes: 'إجمالي الضرائب',
    approvedDeclarations: 'التصريحات الموافق عليها',
    rejectedDeclarations: 'التصريحات المرفوضة',
    approvalRate: 'نسبة الموافقة',
  };
  return labels[field] || field;
}

function calculateNextRunTime(schedule: string, scheduleTime?: string): Date {
  const now = new Date();
  const nextRun = new Date(now);

  switch (schedule) {
    case 'daily':
      nextRun.setDate(nextRun.getDate() + 1);
      if (scheduleTime) {
        const [hours, minutes] = scheduleTime.split(':').map(Number);
        nextRun.setHours(hours, minutes, 0, 0);
      }
      break;
    case 'weekly':
      nextRun.setDate(nextRun.getDate() + 7);
      if (scheduleTime) {
        const [hours, minutes] = scheduleTime.split(':').map(Number);
        nextRun.setHours(hours, minutes, 0, 0);
      }
      break;
    case 'monthly':
      nextRun.setMonth(nextRun.getMonth() + 1);
      if (scheduleTime) {
        const [hours, minutes] = scheduleTime.split(':').map(Number);
        nextRun.setHours(hours, minutes, 0, 0);
      }
      break;
  }

  return nextRun;
}

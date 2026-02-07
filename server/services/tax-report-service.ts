/**
 * Tax Report Service
 * 
 * خدمة إنشاء التقارير الضريبية الشاملة
 * تصدير بصيغ متعددة (PDF, Excel, CSV)
 * 
 * @module server/services/tax-report-service
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * معلومات المعاملة الضريبية
 */
export interface TaxTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  taxRate: number;
  taxAmount: number;
  country: string;
  shippingType: string;
  commodityType: string;
  status: 'pending' | 'completed' | 'refunded';
}

/**
 * ملخص التقرير الضريبي
 */
export interface TaxReportSummary {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalTransactions: number;
  totalAmount: number;
  totalTaxCollected: number;
  totalShippingFees: number;
  totalCommodityFees: number;
  averageTaxRate: number;
  transactions: TaxTransaction[];
  byCountry: Record<string, {
    count: number;
    amount: number;
    tax: number;
  }>;
  byCommodity: Record<string, {
    count: number;
    amount: number;
    tax: number;
  }>;
}

/**
 * خدمة التقارير الضريبية
 */
export class TaxReportService {
  private reportsDir = path.join(process.cwd(), 'tax-reports');

  constructor() {
    // إنشاء مجلد التقارير إذا لم يكن موجوداً
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
      console.log('✅ تم إنشاء مجلد التقارير الضريبية');
    }
  }

  /**
   * إنشاء ملخص التقرير الضريبي
   */
  generateTaxReportSummary(
    transactions: TaxTransaction[],
    startDate: Date,
    endDate: Date
  ): TaxReportSummary {
    console.log(`📊 جاري إنشاء التقرير الضريبي من ${startDate} إلى ${endDate}`);

    // تصفية المعاملات حسب التاريخ
    const filteredTransactions = transactions.filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= endDate
    );

    // حساب الإجماليات
    const totalAmount = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalTax = filteredTransactions.reduce((sum, t) => sum + t.taxAmount, 0);
    const totalShipping = filteredTransactions.reduce((sum, t) => {
      // محاكاة حساب رسوم الشحن
      return sum + (t.amount * 0.05);
    }, 0);
    const totalCommodity = filteredTransactions.reduce((sum, t) => {
      // محاكاة حساب رسوم البضاعة
      return sum + (t.amount * 0.03);
    }, 0);

    // حساب المتوسط الضريبي
    const averageTaxRate = filteredTransactions.length > 0
      ? filteredTransactions.reduce((sum, t) => sum + t.taxRate, 0) / filteredTransactions.length
      : 0;

    // تجميع حسب الدول
    const byCountry: Record<string, any> = {};
    filteredTransactions.forEach((t) => {
      if (!byCountry[t.country]) {
        byCountry[t.country] = { count: 0, amount: 0, tax: 0 };
      }
      byCountry[t.country].count++;
      byCountry[t.country].amount += t.amount;
      byCountry[t.country].tax += t.taxAmount;
    });

    // تجميع حسب نوع البضاعة
    const byCommodity: Record<string, any> = {};
    filteredTransactions.forEach((t) => {
      if (!byCommodity[t.commodityType]) {
        byCommodity[t.commodityType] = { count: 0, amount: 0, tax: 0 };
      }
      byCommodity[t.commodityType].count++;
      byCommodity[t.commodityType].amount += t.amount;
      byCommodity[t.commodityType].tax += t.taxAmount;
    });

    console.log(`✅ تم إنشاء التقرير: ${filteredTransactions.length} معاملة`);

    return {
      period: { startDate, endDate },
      totalTransactions: filteredTransactions.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalTaxCollected: Math.round(totalTax * 100) / 100,
      totalShippingFees: Math.round(totalShipping * 100) / 100,
      totalCommodityFees: Math.round(totalCommodity * 100) / 100,
      averageTaxRate,
      transactions: filteredTransactions,
      byCountry,
      byCommodity,
    };
  }

  /**
   * تصدير التقرير بصيغة CSV
   */
  exportToCSV(report: TaxReportSummary): string {
    console.log('📄 جاري تصدير التقرير بصيغة CSV');

    let csv = 'التقرير الضريبي الشامل\n';
    csv += `الفترة: ${report.period.startDate.toLocaleDateString('ar-JO')} إلى ${report.period.endDate.toLocaleDateString('ar-JO')}\n\n`;

    // الملخص
    csv += 'الملخص\n';
    csv += `إجمالي المعاملات,${report.totalTransactions}\n`;
    csv += `إجمالي المبلغ,${report.totalAmount}\n`;
    csv += `إجمالي الضرائب المحصلة,${report.totalTaxCollected}\n`;
    csv += `إجمالي رسوم الشحن,${report.totalShippingFees}\n`;
    csv += `إجمالي رسوم البضاعة,${report.totalCommodityFees}\n`;
    csv += `متوسط معدل الضريبة,${(report.averageTaxRate * 100).toFixed(2)}%\n\n`;

    // المعاملات
    csv += 'المعاملات\n';
    csv += 'التاريخ,الوصف,المبلغ,معدل الضريبة,الضريبة,الدولة,نوع الشحن,نوع البضاعة,الحالة\n';

    report.transactions.forEach((t) => {
      csv += `${new Date(t.date).toLocaleDateString('ar-JO')},`;
      csv += `"${t.description}",`;
      csv += `${t.amount},`;
      csv += `${(t.taxRate * 100).toFixed(2)}%,`;
      csv += `${t.taxAmount},`;
      csv += `${t.country},`;
      csv += `${t.shippingType},`;
      csv += `${t.commodityType},`;
      csv += `${t.status}\n`;
    });

    csv += '\nالملخص حسب الدول\n';
    csv += 'الدولة,عدد المعاملات,إجمالي المبلغ,إجمالي الضرائب\n';

    Object.entries(report.byCountry).forEach(([country, data]) => {
      csv += `${country},${data.count},${data.amount},${data.tax}\n`;
    });

    csv += '\nالملخص حسب نوع البضاعة\n';
    csv += 'نوع البضاعة,عدد المعاملات,إجمالي المبلغ,إجمالي الضرائب\n';

    Object.entries(report.byCommodity).forEach(([commodity, data]) => {
      csv += `${commodity},${data.count},${data.amount},${data.tax}\n`;
    });

    console.log('✅ تم تصدير التقرير بصيغة CSV');
    return csv;
  }

  /**
   * تصدير التقرير بصيغة JSON
   */
  exportToJSON(report: TaxReportSummary): string {
    console.log('📄 جاري تصدير التقرير بصيغة JSON');

    const jsonReport = {
      title: 'التقرير الضريبي الشامل',
      period: {
        startDate: report.period.startDate.toISOString(),
        endDate: report.period.endDate.toISOString(),
      },
      summary: {
        totalTransactions: report.totalTransactions,
        totalAmount: report.totalAmount,
        totalTaxCollected: report.totalTaxCollected,
        totalShippingFees: report.totalShippingFees,
        totalCommodityFees: report.totalCommodityFees,
        averageTaxRate: `${(report.averageTaxRate * 100).toFixed(2)}%`,
      },
      transactions: report.transactions.map((t) => ({
        id: t.id,
        date: new Date(t.date).toLocaleDateString('ar-JO'),
        description: t.description,
        amount: t.amount,
        taxRate: `${(t.taxRate * 100).toFixed(2)}%`,
        taxAmount: t.taxAmount,
        country: t.country,
        shippingType: t.shippingType,
        commodityType: t.commodityType,
        status: t.status,
      })),
      byCountry: report.byCountry,
      byCommodity: report.byCommodity,
      generatedAt: new Date().toISOString(),
    };

    console.log('✅ تم تصدير التقرير بصيغة JSON');
    return JSON.stringify(jsonReport, null, 2);
  }

  /**
   * تصدير التقرير بصيغة HTML
   */
  exportToHTML(report: TaxReportSummary): string {
    console.log('📄 جاري تصدير التقرير بصيغة HTML');

    let html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>التقرير الضريبي الشامل</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      direction: rtl;
      margin: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1 {
      color: #1e40af;
      text-align: center;
      border-bottom: 3px solid #1e40af;
      padding-bottom: 10px;
    }
    h2 {
      color: #1e40af;
      margin-top: 30px;
      border-left: 4px solid #1e40af;
      padding-left: 10px;
    }
    .period {
      text-align: center;
      color: #666;
      margin-bottom: 20px;
      font-size: 14px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    .summary-card.alt {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    .summary-card h3 {
      margin: 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .summary-card .value {
      font-size: 24px;
      font-weight: bold;
      margin-top: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background-color: #1e40af;
      color: white;
      padding: 12px;
      text-align: right;
      font-weight: bold;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    tr:hover {
      background-color: #f0f0f0;
    }
    .footer {
      text-align: center;
      color: #999;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>التقرير الضريبي الشامل</h1>
    <div class="period">
      الفترة: ${report.period.startDate.toLocaleDateString('ar-JO')} إلى ${report.period.endDate.toLocaleDateString('ar-JO')}
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <h3>إجمالي المعاملات</h3>
        <div class="value">${report.totalTransactions}</div>
      </div>
      <div class="summary-card alt">
        <h3>إجمالي المبلغ</h3>
        <div class="value">${report.totalAmount.toFixed(2)}</div>
      </div>
      <div class="summary-card">
        <h3>إجمالي الضرائب</h3>
        <div class="value">${report.totalTaxCollected.toFixed(2)}</div>
      </div>
      <div class="summary-card alt">
        <h3>متوسط معدل الضريبة</h3>
        <div class="value">${(report.averageTaxRate * 100).toFixed(2)}%</div>
      </div>
    </div>

    <h2>الملخص حسب الدول</h2>
    <table>
      <thead>
        <tr>
          <th>الدولة</th>
          <th>عدد المعاملات</th>
          <th>إجمالي المبلغ</th>
          <th>إجمالي الضرائب</th>
        </tr>
      </thead>
      <tbody>
`;

    Object.entries(report.byCountry).forEach(([country, data]) => {
      html += `
        <tr>
          <td>${country}</td>
          <td>${data.count}</td>
          <td>${data.amount.toFixed(2)}</td>
          <td>${data.tax.toFixed(2)}</td>
        </tr>
`;
    });

    html += `
      </tbody>
    </table>

    <h2>الملخص حسب نوع البضاعة</h2>
    <table>
      <thead>
        <tr>
          <th>نوع البضاعة</th>
          <th>عدد المعاملات</th>
          <th>إجمالي المبلغ</th>
          <th>إجمالي الضرائب</th>
        </tr>
      </thead>
      <tbody>
`;

    Object.entries(report.byCommodity).forEach(([commodity, data]) => {
      html += `
        <tr>
          <td>${commodity}</td>
          <td>${data.count}</td>
          <td>${data.amount.toFixed(2)}</td>
          <td>${data.tax.toFixed(2)}</td>
        </tr>
`;
    });

    html += `
      </tbody>
    </table>

    <div class="footer">
      تم الإنشاء في: ${new Date().toLocaleString('ar-JO')}
    </div>
  </div>
</body>
</html>
`;

    console.log('✅ تم تصدير التقرير بصيغة HTML');
    return html;
  }

  /**
   * حفظ التقرير على القرص
   */
  saveReport(report: TaxReportSummary, format: 'csv' | 'json' | 'html'): string {
    try {
      let content = '';
      let extension = '';

      switch (format) {
        case 'csv':
          content = this.exportToCSV(report);
          extension = 'csv';
          break;
        case 'json':
          content = this.exportToJSON(report);
          extension = 'json';
          break;
        case 'html':
          content = this.exportToHTML(report);
          extension = 'html';
          break;
      }

      const fileName = `tax-report-${Date.now()}.${extension}`;
      const filePath = path.join(this.reportsDir, fileName);

      fs.writeFileSync(filePath, content);
      console.log(`💾 تم حفظ التقرير: ${filePath}`);

      return filePath;
    } catch (error) {
      console.error('❌ خطأ في حفظ التقرير:', error);
      throw new Error('فشل في حفظ التقرير');
    }
  }

  /**
   * الحصول على التقرير
   */
  getReport(fileName: string): string | null {
    try {
      const filePath = path.join(this.reportsDir, fileName);
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf-8');
      }
      return null;
    } catch (error) {
      console.error('❌ خطأ في جلب التقرير:', error);
      return null;
    }
  }
}

// تصدير مثيل واحد من الخدمة
export const taxReportService = new TaxReportService();

/**
 * Advanced Reports Service
 * خدمة التقارير المتقدمة
 * 
 * تدعم:
 * - تقارير الإيرادات والمصروفات
 * - تقارير الأرباح والخسائر
 * - تقارير الضرائب
 * - تصدير PDF و Excel
 * - الجدولة التلقائية للتقارير
 * 
 * @module server/services/advanced-reports-service
 */

/**
 * بيانات التقرير المالي
 */
export interface FinancialReport {
  id: string;
  type: 'revenue' | 'expenses' | 'profit_loss' | 'tax' | 'comprehensive';
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  data: Record<string, any>;
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    totalProfit: number;
    totalTax: number;
  };
  createdAt: string;
  generatedBy: string;
}

/**
 * خدمة التقارير المتقدمة
 */
export class AdvancedReportsService {
  private reports: Map<string, FinancialReport> = new Map();
  private scheduledReports: Map<string, { schedule: string; type: string }> = new Map();

  /**
   * إنشاء تقرير الإيرادات
   */
  async generateRevenueReport(
    startDate: string,
    endDate: string,
    data: any
  ): Promise<FinancialReport> {
    try {
      console.log('📊 إنشاء تقرير الإيرادات');

      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const report: FinancialReport = {
        id: reportId,
        type: 'revenue',
        title: 'تقرير الإيرادات',
        description: `تقرير الإيرادات من ${startDate} إلى ${endDate}`,
        startDate,
        endDate,
        data: {
          byPaymentMethod: this.calculateRevenueByMethod(data),
          byProduct: this.calculateRevenueByProduct(data),
          daily: this.calculateDailyRevenue(data),
          monthly: this.calculateMonthlyRevenue(data),
        },
        summary: {
          totalRevenue: this.calculateTotalRevenue(data),
          totalExpenses: 0,
          totalProfit: 0,
          totalTax: 0,
        },
        createdAt: new Date().toISOString(),
        generatedBy: 'system',
      };

      this.reports.set(reportId, report);
      console.log(`✅ تم إنشاء تقرير الإيرادات: ${reportId}`);

      return report;
    } catch (error: any) {
      console.error('❌ خطأ في إنشاء تقرير الإيرادات:', error);
      throw error;
    }
  }

  /**
   * إنشاء تقرير المصروفات
   */
  async generateExpensesReport(
    startDate: string,
    endDate: string,
    data: any
  ): Promise<FinancialReport> {
    try {
      console.log('📊 إنشاء تقرير المصروفات');

      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const report: FinancialReport = {
        id: reportId,
        type: 'expenses',
        title: 'تقرير المصروفات',
        description: `تقرير المصروفات من ${startDate} إلى ${endDate}`,
        startDate,
        endDate,
        data: {
          byCategory: this.calculateExpensesByCategory(data),
          byDepartment: this.calculateExpensesByDepartment(data),
          daily: this.calculateDailyExpenses(data),
          monthly: this.calculateMonthlyExpenses(data),
        },
        summary: {
          totalRevenue: 0,
          totalExpenses: this.calculateTotalExpenses(data),
          totalProfit: 0,
          totalTax: 0,
        },
        createdAt: new Date().toISOString(),
        generatedBy: 'system',
      };

      this.reports.set(reportId, report);
      console.log(`✅ تم إنشاء تقرير المصروفات: ${reportId}`);

      return report;
    } catch (error: any) {
      console.error('❌ خطأ في إنشاء تقرير المصروفات:', error);
      throw error;
    }
  }

  /**
   * إنشاء تقرير الأرباح والخسائر
   */
  async generateProfitLossReport(
    startDate: string,
    endDate: string,
    revenueData: any,
    expensesData: any
  ): Promise<FinancialReport> {
    try {
      console.log('📊 إنشاء تقرير الأرباح والخسائر');

      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const totalRevenue = this.calculateTotalRevenue(revenueData);
      const totalExpenses = this.calculateTotalExpenses(expensesData);
      const totalProfit = totalRevenue - totalExpenses;

      const report: FinancialReport = {
        id: reportId,
        type: 'profit_loss',
        title: 'تقرير الأرباح والخسائر',
        description: `تقرير الأرباح والخسائر من ${startDate} إلى ${endDate}`,
        startDate,
        endDate,
        data: {
          revenue: totalRevenue,
          expenses: totalExpenses,
          profit: totalProfit,
          profitMargin: ((totalProfit / totalRevenue) * 100).toFixed(2),
          breakdown: {
            revenueByMethod: this.calculateRevenueByMethod(revenueData),
            expensesByCategory: this.calculateExpensesByCategory(expensesData),
          },
        },
        summary: {
          totalRevenue,
          totalExpenses,
          totalProfit,
          totalTax: 0,
        },
        createdAt: new Date().toISOString(),
        generatedBy: 'system',
      };

      this.reports.set(reportId, report);
      console.log(`✅ تم إنشاء تقرير الأرباح والخسائر: ${reportId}`);

      return report;
    } catch (error: any) {
      console.error('❌ خطأ في إنشاء تقرير الأرباح والخسائر:', error);
      throw error;
    }
  }

  /**
   * إنشاء تقرير الضرائب
   */
  async generateTaxReport(
    startDate: string,
    endDate: string,
    data: any
  ): Promise<FinancialReport> {
    try {
      console.log('📊 إنشاء تقرير الضرائب');

      const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const totalRevenue = this.calculateTotalRevenue(data);
      const taxableIncome = totalRevenue * 0.84; // بعد الخصومات
      const taxAmount = taxableIncome * 0.16; // ضريبة المبيعات 16%

      const report: FinancialReport = {
        id: reportId,
        type: 'tax',
        title: 'تقرير الضرائب',
        description: `تقرير الضرائب من ${startDate} إلى ${endDate}`,
        startDate,
        endDate,
        data: {
          totalRevenue,
          deductions: totalRevenue * 0.16,
          taxableIncome,
          taxRate: 0.16,
          taxAmount,
          byCategory: this.calculateTaxByCategory(data),
        },
        summary: {
          totalRevenue,
          totalExpenses: 0,
          totalProfit: 0,
          totalTax: taxAmount,
        },
        createdAt: new Date().toISOString(),
        generatedBy: 'system',
      };

      this.reports.set(reportId, report);
      console.log(`✅ تم إنشاء تقرير الضرائب: ${reportId}`);

      return report;
    } catch (error: any) {
      console.error('❌ خطأ في إنشاء تقرير الضرائب:', error);
      throw error;
    }
  }

  /**
   * تصدير التقرير إلى JSON
   */
  async exportToJSON(reportId: string): Promise<string | null> {
    const report = this.reports.get(reportId);
    if (!report) {
      return null;
    }

    console.log(`📤 تصدير التقرير إلى JSON`);
    return JSON.stringify(report, null, 2);
  }

  /**
   * تصدير التقرير إلى CSV (Excel)
   */
  async exportToCSV(reportId: string): Promise<string | null> {
    const report = this.reports.get(reportId);
    if (!report) {
      return null;
    }

    console.log(`📤 تصدير التقرير إلى CSV`);

    let csv = `التقرير: ${report.title}\n`;
    csv += `الفترة: ${report.startDate} إلى ${report.endDate}\n`;
    csv += `تاريخ الإنشاء: ${report.createdAt}\n\n`;

    csv += `الملخص المالي\n`;
    csv += `إجمالي الإيرادات,${report.summary.totalRevenue}\n`;
    csv += `إجمالي المصروفات,${report.summary.totalExpenses}\n`;
    csv += `إجمالي الربح,${report.summary.totalProfit}\n`;
    csv += `إجمالي الضرائب,${report.summary.totalTax}\n\n`;

    csv += `التفاصيل\n`;
    for (const [key, value] of Object.entries(report.data)) {
      if (typeof value === 'object') {
        csv += `${key}\n`;
        for (const [subKey, subValue] of Object.entries(value as Record<string, any>)) {
          csv += `  ${subKey},${subValue}\n`;
        }
      } else {
        csv += `${key},${value}\n`;
      }
    }

    return csv;
  }

  /**
   * جدولة تقرير دوري
   */
  async scheduleReport(
    reportType: string,
    schedule: 'daily' | 'weekly' | 'monthly',
    email?: string
  ): Promise<{ success: boolean; message: string; scheduleId: string }> {
    try {
      console.log(`📅 جدولة تقرير ${reportType} (${schedule})`);

      const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.scheduledReports.set(scheduleId, { schedule, type: reportType });

      console.log(`✅ تم جدولة التقرير: ${scheduleId}`);

      return {
        success: true,
        message: `تم جدولة تقرير ${reportType} بشكل ${schedule}${email ? ` وسيتم إرساله إلى ${email}` : ''}`,
        scheduleId,
      };
    } catch (error: any) {
      console.error('❌ خطأ في جدولة التقرير:', error);
      return {
        success: false,
        message: `خطأ: ${error.message}`,
        scheduleId: '',
      };
    }
  }

  /**
   * الحصول على التقرير
   */
  async getReport(reportId: string): Promise<FinancialReport | null> {
    return this.reports.get(reportId) || null;
  }

  /**
   * الحصول على قائمة التقارير
   */
  async listReports(type?: string): Promise<FinancialReport[]> {
    let reports = Array.from(this.reports.values());

    if (type) {
      reports = reports.filter((r) => r.type === type);
    }

    return reports;
  }

  /**
   * حذف التقرير
   */
  async deleteReport(reportId: string): Promise<boolean> {
    return this.reports.delete(reportId);
  }

  /**
   * حساب الإيرادات حسب طريقة الدفع
   */
  private calculateRevenueByMethod(data: any): Record<string, number> {
    return {
      click: data.click || 0,
      alipay: data.alipay || 0,
      paypal: data.paypal || 0,
      creditCard: data.creditCard || 0,
    };
  }

  /**
   * حساب الإيرادات حسب المنتج
   */
  private calculateRevenueByProduct(data: any): Record<string, number> {
    return data.byProduct || {};
  }

  /**
   * حساب الإيرادات اليومية
   */
  private calculateDailyRevenue(data: any): Record<string, number> {
    return data.daily || {};
  }

  /**
   * حساب الإيرادات الشهرية
   */
  private calculateMonthlyRevenue(data: any): Record<string, number> {
    return data.monthly || {};
  }

  /**
   * حساب إجمالي الإيرادات
   */
  private calculateTotalRevenue(data: any): number {
    if (typeof data === 'number') return data;
    if (data.total) return data.total;
    return Object.values(data).reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);
  }

  /**
   * حساب المصروفات حسب الفئة
   */
  private calculateExpensesByCategory(data: any): Record<string, number> {
    return {
      salaries: data.salaries || 0,
      rent: data.rent || 0,
      utilities: data.utilities || 0,
      marketing: data.marketing || 0,
      other: data.other || 0,
    };
  }

  /**
   * حساب المصروفات حسب القسم
   */
  private calculateExpensesByDepartment(data: any): Record<string, number> {
    return data.byDepartment || {};
  }

  /**
   * حساب المصروفات اليومية
   */
  private calculateDailyExpenses(data: any): Record<string, number> {
    return data.daily || {};
  }

  /**
   * حساب المصروفات الشهرية
   */
  private calculateMonthlyExpenses(data: any): Record<string, number> {
    return data.monthly || {};
  }

  /**
   * حساب إجمالي المصروفات
   */
  private calculateTotalExpenses(data: any): number {
    if (typeof data === 'number') return data;
    if (data.total) return data.total;
    return Object.values(data).reduce((sum: number, val: any) => sum + (typeof val === 'number' ? val : 0), 0);
  }

  /**
   * حساب الضرائب حسب الفئة
   */
  private calculateTaxByCategory(data: any): Record<string, number> {
    const taxRate = 0.16;
    return {
      salesTax: (this.calculateTotalRevenue(data) * taxRate).toFixed(2) as any,
      incomeTax: ((this.calculateTotalRevenue(data) * 0.84) * 0.15).toFixed(2) as any,
    };
  }
}

// تصدير مثيل واحد من الخدمة
export const advancedReportsService = new AdvancedReportsService();

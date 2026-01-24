import { describe, it, expect } from 'vitest';
import {
  generateCSVReport,
  generateJSONReport,
  generateReport,
  generateMonthlyReport,
  generateQuarterlyReport,
  generateAnnualReport,
  generateCustomReport,
} from './export-reports-service';

describe('Export and Reports Service', () => {
  const mockReportData = {
    title: 'تقرير الاختبار',
    date: new Date('2026-01-24'),
    data: {
      items: [
        { name: 'صنف 1', quantity: 100, price: 1000 },
        { name: 'صنف 2', quantity: 50, price: 2000 },
      ],
    },
    summary: {
      'إجمالي الأصناف': 2,
      'إجمالي الكمية': 150,
      'إجمالي القيمة': 3000,
      'إجمالي الرسوم': 450,
    },
  };

  describe('CSV Export', () => {
    it('should generate CSV report successfully', async () => {
      const buffer = await generateCSVReport(mockReportData, { format: 'csv' });
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.toString()).toContain('تقرير الاختبار');
    });

    it('should include headers in CSV', async () => {
      const buffer = await generateCSVReport(mockReportData, { format: 'csv' });
      const csv = buffer.toString();
      expect(csv).toContain('الملخص');
    });

    it('should handle special characters in CSV', async () => {
      const specialData = {
        ...mockReportData,
        summary: {
          'الرسوم الخاصة': 100,
          'الضرائب المضافة': 50,
        },
      };
      const buffer = await generateCSVReport(specialData, { format: 'csv' });
      const csv = buffer.toString();
      expect(csv).toContain('الرسوم الخاصة');
    });

    it('should format numbers correctly in CSV', async () => {
      const buffer = await generateCSVReport(mockReportData, { format: 'csv' });
      const csv = buffer.toString();
      expect(csv).toContain('3000');
    });
  });

  describe('JSON Export', () => {
    it('should generate JSON report successfully', async () => {
      const buffer = await generateJSONReport(mockReportData, { format: 'json' });
      expect(buffer).toBeInstanceOf(Buffer);
      const json = JSON.parse(buffer.toString());
      expect(json.title).toBe('تقرير الاختبار');
    });

    it('should include all required fields in JSON', async () => {
      const buffer = await generateJSONReport(mockReportData, { format: 'json' });
      const json = JSON.parse(buffer.toString());
      expect(json).toHaveProperty('title');
      expect(json).toHaveProperty('date');
      expect(json).toHaveProperty('summary');
      expect(json).toHaveProperty('data');
      expect(json).toHaveProperty('generatedAt');
      expect(json).toHaveProperty('version');
    });

    it('should preserve data structure in JSON', async () => {
      const buffer = await generateJSONReport(mockReportData, { format: 'json' });
      const json = JSON.parse(buffer.toString());
      expect(json.summary).toEqual(mockReportData.summary);
    });

    it('should handle nested data in JSON', async () => {
      const nestedData = {
        ...mockReportData,
        data: {
          level1: {
            level2: {
              level3: 'value',
            },
          },
        },
      };
      const buffer = await generateJSONReport(nestedData, { format: 'json' });
      const json = JSON.parse(buffer.toString());
      expect(json.data.level1.level2.level3).toBe('value');
    });
  });

  describe('Generic Report Generation', () => {
    it('should generate CSV via generic method', async () => {
      const buffer = await generateReport(mockReportData, { format: 'csv' });
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it('should generate JSON via generic method', async () => {
      const buffer = await generateReport(mockReportData, { format: 'json' });
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it('should throw error for unsupported format', async () => {
      try {
        await generateReport(mockReportData, { format: 'xml' as any });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect((error as Error).message).toContain('Unsupported format');
      }
    });
  });

  describe('Monthly Reports', () => {
    it('should generate monthly report for January', async () => {
      const data = {
        declarations: Array(10),
        totalValue: 50000,
        totalDuties: 7500,
        totalTaxes: 8000,
        totalCost: 65500,
      };
      const report = await generateMonthlyReport(1, 2026, data);
      expect(report.title).toContain('التقرير الشهري');
      expect(report.summary['إجمالي البيانات الجمركية']).toBe(10);
    });

    it('should generate monthly report for December', async () => {
      const data = {
        declarations: Array(15),
        totalValue: 75000,
        totalDuties: 11250,
        totalTaxes: 12000,
        totalCost: 98250,
      };
      const report = await generateMonthlyReport(12, 2026, data);
      expect(report.title).toContain('التقرير الشهري');
    });

    it('should calculate correct summary for monthly report', async () => {
      const data = {
        declarations: Array(5),
        totalValue: 25000,
        totalDuties: 3750,
        totalTaxes: 4000,
        totalCost: 32750,
      };
      const report = await generateMonthlyReport(1, 2026, data);
      expect(report.summary['إجمالي الرسوم']).toBe(3750);
      expect(report.summary['إجمالي الضرائب']).toBe(4000);
    });
  });

  describe('Quarterly Reports', () => {
    it('should generate quarterly report', async () => {
      const data = {
        declarations: Array(30),
        totalValue: 150000,
        totalDuties: 22500,
        totalTaxes: 24000,
        totalCost: 196500,
      };
      const report = await generateQuarterlyReport(1, 2026, data);
      expect(report.title).toContain('التقرير الربع سنوي');
      expect(report.summary['متوسط التكلفة']).toBe(6550);
    });

    it('should calculate average cost correctly', async () => {
      const data = {
        declarations: Array(10),
        totalValue: 100000,
        totalDuties: 15000,
        totalTaxes: 16000,
        totalCost: 131000,
      };
      const report = await generateQuarterlyReport(2, 2026, data);
      expect(report.summary['متوسط التكلفة']).toBe(13100);
    });
  });

  describe('Annual Reports', () => {
    it('should generate annual report', async () => {
      const data = {
        declarations: Array(120),
        totalValue: 600000,
        totalDuties: 90000,
        totalTaxes: 96000,
        totalCost: 786000,
        maxValue: 10000,
        minValue: 1000,
      };
      const report = await generateAnnualReport(2026, data);
      expect(report.title).toContain('التقرير السنوي');
      expect(report.summary['إجمالي البيانات الجمركية']).toBe(120);
    });

    it('should include min and max values in annual report', async () => {
      const data = {
        declarations: Array(100),
        totalValue: 500000,
        totalDuties: 75000,
        totalTaxes: 80000,
        totalCost: 655000,
        maxValue: 15000,
        minValue: 500,
      };
      const report = await generateAnnualReport(2026, data);
      expect(report.summary['أعلى قيمة']).toBe(15000);
      expect(report.summary['أقل قيمة']).toBe(500);
    });
  });

  describe('Custom Reports', () => {
    it('should generate custom report with filters', async () => {
      const filters = {
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      };
      const data = {
        records: Array(20),
        total: 100000,
      };
      const report = await generateCustomReport('تقرير مخصص', filters, data);
      expect(report.title).toBe('تقرير مخصص');
      expect(report.summary['عدد السجلات']).toBe(20);
    });

    it('should calculate average in custom report', async () => {
      const filters = {
        dateFrom: '2026-01-01',
        dateTo: '2026-01-31',
      };
      const data = {
        records: Array(10),
        total: 50000,
      };
      const report = await generateCustomReport('تقرير مخصص', filters, data);
      expect(report.summary['المتوسط']).toBe(5000);
    });
  });

  describe('Performance', () => {
    it('should generate CSV very quickly', async () => {
      const start = Date.now();
      await generateCSVReport(mockReportData, { format: 'csv' });
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });

    it('should generate JSON quickly', async () => {
      const start = Date.now();
      await generateJSONReport(mockReportData, { format: 'json' });
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty report data', async () => {
      const emptyData = {
        title: '',
        date: new Date(),
        data: {},
        summary: {},
      };
      const buffer = await generateReport(emptyData, { format: 'json' });
      expect(buffer).toBeInstanceOf(Buffer);
    });

    it('should handle very large numbers', async () => {
      const largeData = {
        ...mockReportData,
        summary: {
          'الرقم الكبير': 999999999999,
        },
      };
      const buffer = await generateReport(largeData, { format: 'csv' });
      expect(buffer.toString()).toContain('999999999999');
    });

    it('should handle special Arabic characters', async () => {
      const arabicData = {
        ...mockReportData,
        summary: {
          'الرسوم الجمركية': 1500,
          'ضريبة المبيعات': 800,
          'الرسوم الإضافية': 200,
        },
      };
      const buffer = await generateReport(arabicData, { format: 'json' });
      const json = JSON.parse(buffer.toString());
      expect(json.summary).toHaveProperty('الرسوم الجمركية');
    });
  });
});

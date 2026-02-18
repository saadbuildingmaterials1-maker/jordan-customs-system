import { describe, it, expect } from 'vitest';
import {
  processCustomsDeclaration,
  calculateDutiesByHSCode,
  validateDeclarationNumber,
  generateDeclarationNumber,
  calculateCostRatios,
  checkCommonErrors,
} from './customs-processing-service';

/**
 * اختبارات شاملة لخدمة معالجة البيانات الجمركية
 */

describe('Customs Processing Service', () => {
  const mockDeclarationData = {
    declarationNumber: 'CD-2026-00001',
    importerName: 'شركة الاستيراد',
    exporterName: 'شركة التصدير',
    exportCountry: 'الصين',
    items: [
      {
        name: 'منتج أ',
        quantity: 100,
        unitPrice: 10,
        hsCode: '8401',
        weight: 500,
      },
      {
        name: 'منتج ب',
        quantity: 50,
        unitPrice: 20,
        hsCode: '8501',
        weight: 300,
      },
    ],
    fobValue: 2000,
    freightCost: 200,
    insuranceCost: 50,
  };

  describe('Process Declaration', () => {
    it('should process valid declaration', async () => {
      const result = await processCustomsDeclaration(mockDeclarationData);

      expect(result.declarationNumber).toBe('CD-2026-00001');
      expect(result.itemsProcessed).toBe(2);
      expect(result.totalWeight).toBe(800);
      expect(result.validationStatus).toBe('valid');
    });

    it('should calculate CIF value correctly', async () => {
      const result = await processCustomsDeclaration(mockDeclarationData);

      const expectedCIF = 2000 + 200 + 50;
      expect(result.cifValue).toBe(expectedCIF);
    });

    it('should calculate customs duty correctly', async () => {
      const result = await processCustomsDeclaration(mockDeclarationData);

      const expectedCIF = 2250;
      const expectedDuty = expectedCIF * 0.15;
      expect(result.customsDuty).toBe(expectedDuty);
    });

    it('should calculate sales tax correctly', async () => {
      const result = await processCustomsDeclaration(mockDeclarationData);

      const expectedCIF = 2250;
      const expectedDuty = expectedCIF * 0.15;
      const subtotal = expectedCIF + expectedDuty;
      const expectedTax = subtotal * 0.16;
      expect(result.salesTax).toBe(expectedTax);
    });

    it('should detect missing declaration number', async () => {
      const invalidData = { ...mockDeclarationData, declarationNumber: '' };
      const result = await processCustomsDeclaration(invalidData);

      expect(result.validationStatus).toBe('error');
      expect(result.validationMessages).toContain('رقم البيان مفقود');
    });

    it('should detect missing importer name', async () => {
      const invalidData = { ...mockDeclarationData, importerName: '' };
      const result = await processCustomsDeclaration(invalidData);

      expect(result.validationStatus).toBe('error');
      expect(result.validationMessages).toContain('اسم المستورد مفقود');
    });

    it('should detect missing items', async () => {
      const invalidData = { ...mockDeclarationData, items: [] };
      const result = await processCustomsDeclaration(invalidData);

      expect(result.validationStatus).toBe('error');
      expect(result.validationMessages).toContain('لا توجد أصناف في البيان');
    });

    it('should detect missing HS code as warning', async () => {
      const invalidData = {
        ...mockDeclarationData,
        items: [
          {
            name: 'منتج',
            quantity: 10,
            unitPrice: 100,
            hsCode: '',
            weight: 50,
          },
        ],
      };
      const result = await processCustomsDeclaration(invalidData);

      expect(result.validationStatus).toBe('warning');
      expect(result.validationMessages.some((msg) => msg.includes('الرمز الجمركي'))).toBe(true);
    });
  });

  describe('Calculate Duties by HS Code', () => {
    it('should calculate duty for animals (01xx)', async () => {
      const duty = await calculateDutiesByHSCode('0101', 1000);
      expect(duty).toBe(50); // 5% of 1000
    });

    it('should calculate duty for meat (02xx)', async () => {
      const duty = await calculateDutiesByHSCode('0201', 1000);
      expect(duty).toBe(100); // 10% of 1000
    });

    it('should calculate duty for machinery (84xx)', async () => {
      const duty = await calculateDutiesByHSCode('8401', 1000);
      expect(duty).toBe(80); // 8% of 1000
    });

    it('should calculate duty for vehicles (87xx)', async () => {
      const duty = await calculateDutiesByHSCode('8701', 1000);
      expect(duty).toBe(80); // 8% of 1000
    });

    it('should calculate duty for weapons (93xx)', async () => {
      const duty = await calculateDutiesByHSCode('9301', 1000);
      expect(duty).toBe(200); // 20% of 1000
    });

    it('should use default rate for unknown code', async () => {
      const duty = await calculateDutiesByHSCode('9999', 1000);
      expect(duty).toBe(50); // 5% default (99 category)
    });

    it('should handle large values', async () => {
      const duty = await calculateDutiesByHSCode('0101', 1000000);
      expect(duty).toBe(50000); // 5% of 1000000
    });
  });

  describe('Validate Declaration Number', () => {
    it('should validate correct format', async () => {
      const isValid = await validateDeclarationNumber('CD-2026-00001');
      expect(isValid).toBe(true);
    });

    it('should reject invalid format', async () => {
      const isValid = await validateDeclarationNumber('INVALID-123');
      expect(isValid).toBe(false);
    });

    it('should reject missing prefix', async () => {
      const isValid = await validateDeclarationNumber('2026-00001');
      expect(isValid).toBe(false);
    });

    it('should reject missing year', async () => {
      const isValid = await validateDeclarationNumber('CD-00001');
      expect(isValid).toBe(false);
    });

    it('should reject missing sequence', async () => {
      const isValid = await validateDeclarationNumber('CD-2026');
      expect(isValid).toBe(false);
    });
  });

  describe('Generate Declaration Number', () => {
    it('should generate valid format', async () => {
      const number = await generateDeclarationNumber();
      const isValid = await validateDeclarationNumber(number);
      expect(isValid).toBe(true);
    });

    it('should include current year', async () => {
      const number = await generateDeclarationNumber();
      const currentYear = new Date().getFullYear();
      expect(number).toContain(currentYear.toString());
    });

    it('should generate unique numbers', async () => {
      const number1 = await generateDeclarationNumber();
      const number2 = await generateDeclarationNumber();
      expect(number1).not.toBe(number2);
    });

    it('should start with CD prefix', async () => {
      const number = await generateDeclarationNumber();
      expect(number.startsWith('CD-')).toBe(true);
    });
  });

  describe('Calculate Cost Ratios', () => {
    it('should calculate freight ratio', async () => {
      const ratios = await calculateCostRatios(1000, 100, 50, 150, 240);
      expect(ratios.freightRatio).toBe(10); // 100/1000 * 100
    });

    it('should calculate insurance ratio', async () => {
      const ratios = await calculateCostRatios(1000, 100, 50, 150, 240);
      expect(ratios.insuranceRatio).toBe(5); // 50/1000 * 100
    });

    it('should calculate duty ratio', async () => {
      const ratios = await calculateCostRatios(1000, 100, 50, 150, 240);
      const cifValue = 1150;
      const expectedRatio = (150 / cifValue) * 100;
      expect(ratios.dutyRatio).toBeCloseTo(expectedRatio, 1);
    });

    it('should calculate tax ratio', async () => {
      const ratios = await calculateCostRatios(1000, 100, 50, 150, 240);
      const cifValue = 1150;
      const subtotal = cifValue + 150;
      const expectedRatio = (240 / subtotal) * 100;
      expect(ratios.taxRatio).toBeCloseTo(expectedRatio, 1);
    });
  });

  describe('Check Common Errors', () => {
    it('should detect negative FOB value', async () => {
      const invalidData = { ...mockDeclarationData, fobValue: -100 };
      const errors = await checkCommonErrors(invalidData);
      expect(errors).toContain('قيمة FOB لا يمكن أن تكون سالبة');
    });

    it('should detect negative freight cost', async () => {
      const invalidData = { ...mockDeclarationData, freightCost: -50 };
      const errors = await checkCommonErrors(invalidData);
      expect(errors).toContain('أجور الشحن لا يمكن أن تكون سالبة');
    });

    it('should detect negative insurance cost', async () => {
      const invalidData = { ...mockDeclarationData, insuranceCost: -25 };
      const errors = await checkCommonErrors(invalidData);
      expect(errors).toContain('التأمين لا يمكن أن يكون سالباً');
    });

    it('should detect duplicate items', async () => {
      const invalidData = {
        ...mockDeclarationData,
        items: [
          { name: 'منتج', quantity: 10, unitPrice: 100, hsCode: '0101', weight: 50 },
          { name: 'منتج', quantity: 20, unitPrice: 200, hsCode: '0102', weight: 100 },
        ],
      };
      const errors = await checkCommonErrors(invalidData);
      expect(errors.some((err) => err.includes('أصناف مكررة'))).toBe(true);
    });

    it('should detect unreasonably high weight', async () => {
      const invalidData = {
        ...mockDeclarationData,
        items: [
          { name: 'منتج', quantity: 10, unitPrice: 100, hsCode: '0101', weight: 50000 },
        ],
      };
      const errors = await checkCommonErrors(invalidData);
      expect(errors.some((err) => err.includes('الوزن يبدو مرتفعاً'))).toBe(true);
    });

    it('should detect unreasonably high quantity', async () => {
      const invalidData = {
        ...mockDeclarationData,
        items: [
          { name: 'منتج', quantity: 10000000, unitPrice: 100, hsCode: '0101', weight: 50 },
        ],
      };
      const errors = await checkCommonErrors(invalidData);
      expect(errors.some((err) => err.includes('الكمية تبدو مرتفعة'))).toBe(true);
    });

    it('should return empty array for valid data', async () => {
      const errors = await checkCommonErrors(mockDeclarationData);
      expect(errors.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values', async () => {
      const zeroData = {
        ...mockDeclarationData,
        fobValue: 0,
        freightCost: 0,
        insuranceCost: 0,
      };
      const result = await processCustomsDeclaration(zeroData);
      // When fobValue is 0, it calculates from items
      const itemsTotal = mockDeclarationData.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      const expectedCIF = itemsTotal + 0 + 0;
      expect(result.cifValue).toBe(expectedCIF);
    });

    it('should handle very small values', async () => {
      const smallData = {
        ...mockDeclarationData,
        fobValue: 0.01,
        freightCost: 0.001,
        insuranceCost: 0.001,
      };
      const result = await processCustomsDeclaration(smallData);
      expect(result.cifValue).toBeGreaterThan(0);
    });

    it('should handle many items', async () => {
      const manyItemsData = {
        ...mockDeclarationData,
        items: Array(100)
          .fill(null)
          .map((_, i) => ({
            name: `منتج ${i}`,
            quantity: 10,
            unitPrice: 100,
            hsCode: '0101',
            weight: 50,
          })),
      };
      const result = await processCustomsDeclaration(manyItemsData);
      expect(result.itemsProcessed).toBe(100);
    });
  });

  describe('Performance', () => {
    it('should process declaration quickly', async () => {
      const start = Date.now();
      await processCustomsDeclaration(mockDeclarationData);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should validate declaration number quickly', async () => {
      const start = Date.now();
      await validateDeclarationNumber('CD-2026-00001');
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(50);
    });

    it('should generate declaration number quickly', async () => {
      const start = Date.now();
      await generateDeclarationNumber();
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(50);
    });
  });
});

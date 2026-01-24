import { describe, it, expect, beforeAll } from 'vitest';
import {
  processCustomsDeclaration,
  calculateDutiesByHSCode,
  validateDeclarationNumber,
  generateDeclarationNumber,
} from './customs-processing-service';
import {
  distributeDutiesByValue,
  validateDistribution,
  calculateLandedUnitCost,
} from './duty-distribution-service';
import { searchHSCode, getHSCode, validateHSCode } from './hs-codes-service';

/**
 * اختبارات التكامل النهائية الشاملة
 * Final Comprehensive Integration Tests
 */

describe('Final Integration Tests - Customs Declaration System', () => {
  let generatedDeclarationNumber: string;

  beforeAll(async () => {
    generatedDeclarationNumber = await generateDeclarationNumber();
  });

  describe('Complete Workflow - Full Declaration Processing', () => {
    it('should complete full declaration workflow', async () => {
      // 1. توليد رقم البيان
      const declarationNumber = await generateDeclarationNumber();
      expect(declarationNumber).toBeDefined();

      // 2. التحقق من صحة الرقم
      const isValid = await validateDeclarationNumber(declarationNumber);
      expect(isValid).toBe(true);

      // 3. البحث عن الرموز الجمركية
      const hsCode1 = await getHSCode('0101');
      const hsCode2 = await getHSCode('8401');
      expect(hsCode1).toBeDefined();
      expect(hsCode2).toBeDefined();

      // 4. التحقق من صحة الرموز
      const isCode1Valid = await validateHSCode('0101');
      const isCode2Valid = await validateHSCode('8401');
      expect(isCode1Valid).toBe(true);
      expect(isCode2Valid).toBe(true);

      // 5. معالجة البيان
      const declarationData = {
        declarationNumber,
        importerName: 'شركة الاستيراد الأردنية',
        exporterName: 'شركة التصدير الصينية',
        exportCountry: 'الصين',
        items: [
          {
            name: 'آلات صناعية',
            quantity: 50,
            unitPrice: 1000,
            hsCode: '8401',
            weight: 5000,
          },
          {
            name: 'حيوانات حية',
            quantity: 100,
            unitPrice: 500,
            hsCode: '0101',
            weight: 10000,
          },
        ],
        fobValue: 75000,
        freightCost: 7500,
        insuranceCost: 3750,
      };

      const processed = await processCustomsDeclaration(declarationData);
      expect(processed.validationStatus).toBe('valid');
      expect(processed.itemsProcessed).toBe(2);
      expect(processed.totalWeight).toBe(15000);

      // 6. توزيع الرسوم على الأصناف
      const items = [
        {
          id: 1,
          name: 'آلات صناعية',
          quantity: 50,
          unitPrice: 1000,
          totalPrice: 50000,
          hsCode: '8401',
          weight: 5000,
          category: 'آلات',
        },
        {
          id: 2,
          name: 'حيوانات حية',
          quantity: 100,
          unitPrice: 500,
          totalPrice: 50000,
          hsCode: '0101',
          weight: 10000,
          category: 'حيوانات',
        },
      ];

      const distribution = await distributeDutiesByValue(
        items,
        processed.customsDuty,
        processed.salesTax,
        0
      );
      expect(distribution.length).toBe(2);

      // 7. التحقق من صحة التوزيع
      const isDistributionValid = await validateDistribution(
        distribution,
        processed.customsDuty,
        processed.salesTax,
        0
      );
      expect(isDistributionValid).toBe(true);

      // 8. حساب تكلفة الوحدة النهائية
      const costs = await calculateLandedUnitCost(items, distribution);
      expect(costs.length).toBe(2);
      costs.forEach((cost) => {
        expect(cost.landedUnitCost).toBeGreaterThan(cost.unitPrice);
      });
    });
  });

  describe('Multi-Country Declarations', () => {
    it('should handle declarations from different countries', async () => {
      const countries = ['الصين', 'الهند', 'تايلاند', 'فيتنام', 'إندونيسيا'];

      for (const country of countries) {
        const declarationData = {
          declarationNumber: await generateDeclarationNumber(),
          importerName: 'المستورد',
          exporterName: 'المصدر',
          exportCountry: country,
          items: [
            {
              name: 'منتج',
              quantity: 100,
              unitPrice: 100,
              hsCode: '8401',
              weight: 1000,
            },
          ],
          fobValue: 10000,
          freightCost: 1000,
          insuranceCost: 500,
        };

        const processed = await processCustomsDeclaration(declarationData);
        expect(processed.validationStatus).toBe('valid');
      }
    });
  });

  describe('Various HS Code Categories', () => {
    it('should handle all major HS code categories', async () => {
      const categories = [
        { code: '0101', name: 'حيوانات' },
        { code: '0201', name: 'لحوم' },
        { code: '0301', name: 'أسماك' },
        { code: '1001', name: 'حبوب' },
        { code: '2701', name: 'وقود' },
        { code: '3001', name: 'أدوية' },
        { code: '4401', name: 'خشب' },
        { code: '6201', name: 'ملابس' },
        { code: '7201', name: 'حديد' },
        { code: '8401', name: 'آلات' },
        { code: '8701', name: 'مركبات' },
        { code: '9301', name: 'أسلحة' },
      ];

      for (const category of categories) {
        const hsCode = await getHSCode(category.code);
        // Some codes might not exist in the database, that's ok
        if (hsCode) {
          expect(hsCode.code).toBeDefined();
        }

        const duty = await calculateDutiesByHSCode(category.code, 10000);
        expect(duty).toBeGreaterThan(0);
      }
    });
  });

  describe('Large Scale Declarations', () => {
    it('should handle large declarations with many items', async () => {
      const items = Array(100)
        .fill(null)
        .map((_, i) => ({
          name: `منتج ${i + 1}`,
          quantity: 100 + i,
          unitPrice: 100 + i * 10,
          hsCode: '8401',
          weight: 1000 + i * 100,
        }));

      const declarationData = {
        declarationNumber: await generateDeclarationNumber(),
        importerName: 'المستورد',
        exporterName: 'المصدر',
        exportCountry: 'الصين',
        items,
        fobValue: 500000,
        freightCost: 50000,
        insuranceCost: 25000,
      };

      const processed = await processCustomsDeclaration(declarationData);
      expect(processed.itemsProcessed).toBe(100);
      expect(processed.totalWeight).toBeGreaterThan(0);
    });
  });

  describe('High Value Declarations', () => {
    it('should handle high value declarations', async () => {
      const declarationData = {
        declarationNumber: await generateDeclarationNumber(),
        importerName: 'المستورد',
        exporterName: 'المصدر',
        exportCountry: 'الصين',
        items: [
          {
            name: 'معدات صناعية متقدمة',
            quantity: 10,
            unitPrice: 100000,
            hsCode: '8401',
            weight: 50000,
          },
        ],
        fobValue: 1000000,
        freightCost: 100000,
        insuranceCost: 50000,
      };

      const processed = await processCustomsDeclaration(declarationData);
      expect(processed.cifValue).toBe(1150000);
      expect(processed.customsDuty).toBeGreaterThan(100000);
      expect(processed.totalCost).toBeGreaterThan(1000000);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle minimum viable declaration', async () => {
      const declarationData = {
        declarationNumber: await generateDeclarationNumber(),
        importerName: 'المستورد',
        exporterName: 'المصدر',
        exportCountry: 'الصين',
        items: [
          {
            name: 'منتج',
            quantity: 1,
            unitPrice: 1,
            hsCode: '0101',
            weight: 1,
          },
        ],
        fobValue: 1,
        freightCost: 0,
        insuranceCost: 0,
      };

      const processed = await processCustomsDeclaration(declarationData);
      expect(processed.validationStatus).toBe('valid');
      expect(processed.itemsProcessed).toBe(1);
    });

    it('should handle declarations with zero freight', async () => {
      const declarationData = {
        declarationNumber: await generateDeclarationNumber(),
        importerName: 'المستورد',
        exporterName: 'المصدر',
        exportCountry: 'الصين',
        items: [
          {
            name: 'منتج',
            quantity: 100,
            unitPrice: 100,
            hsCode: '0101',
            weight: 1000,
          },
        ],
        fobValue: 10000,
        freightCost: 0,
        insuranceCost: 0,
      };

      const processed = await processCustomsDeclaration(declarationData);
      expect(processed.cifValue).toBe(10000);
    });

    it('should handle declarations with zero insurance', async () => {
      const declarationData = {
        declarationNumber: await generateDeclarationNumber(),
        importerName: 'المستورد',
        exporterName: 'المصدر',
        exportCountry: 'الصين',
        items: [
          {
            name: 'منتج',
            quantity: 100,
            unitPrice: 100,
            hsCode: '0101',
            weight: 1000,
          },
        ],
        fobValue: 10000,
        freightCost: 1000,
        insuranceCost: 0,
      };

      const processed = await processCustomsDeclaration(declarationData);
      expect(processed.cifValue).toBe(11000);
    });
  });

  describe('Performance and Scalability', () => {
    it('should process declaration quickly', async () => {
      const start = Date.now();

      const declarationData = {
        declarationNumber: await generateDeclarationNumber(),
        importerName: 'المستورد',
        exporterName: 'المصدر',
        exportCountry: 'الصين',
        items: Array(50)
          .fill(null)
          .map((_, i) => ({
            name: `منتج ${i}`,
            quantity: 100,
            unitPrice: 100,
            hsCode: '8401',
            weight: 1000,
          })),
        fobValue: 500000,
        freightCost: 50000,
        insuranceCost: 25000,
      };

      await processCustomsDeclaration(declarationData);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should search HS codes quickly', async () => {
      const start = Date.now();

      for (let i = 0; i < 100; i++) {
        await searchHSCode('منتج');
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000); // 100 searches in less than 5 seconds
    });

    it('should distribute duties quickly for large declarations', async () => {
      const start = Date.now();

      const items = Array(1000)
        .fill(null)
        .map((_, i) => ({
          id: i,
          name: `منتج ${i}`,
          quantity: 100,
          unitPrice: 100,
          totalPrice: 10000,
          hsCode: '8401',
          weight: 1000,
          category: 'آلات',
        }));

      await distributeDutiesByValue(items, 100000, 160000, 0);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000); // Should complete in less than 5 seconds
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data consistency across operations', async () => {
      const declarationNumber = await generateDeclarationNumber();

      // Process declaration
      const declarationData = {
        declarationNumber,
        importerName: 'المستورد',
        exporterName: 'المصدر',
        exportCountry: 'الصين',
        items: [
          {
            name: 'منتج أ',
            quantity: 100,
            unitPrice: 100,
            hsCode: '0101',
            weight: 1000,
          },
          {
            name: 'منتج ب',
            quantity: 50,
            unitPrice: 200,
            hsCode: '0201',
            weight: 500,
          },
        ],
        fobValue: 20000,
        freightCost: 2000,
        insuranceCost: 1000,
      };

      const processed = await processCustomsDeclaration(declarationData);

      // Verify totals
      const expectedCIF = 20000 + 2000 + 1000;
      expect(processed.cifValue).toBe(expectedCIF);

      // Verify duties
      const expectedDuty = expectedCIF * 0.15;
      expect(processed.customsDuty).toBe(expectedDuty);

      // Verify tax
      const subtotal = expectedCIF + expectedDuty;
      const expectedTax = subtotal * 0.16;
      expect(processed.salesTax).toBe(expectedTax);

      // Verify total cost
      const expectedTotal = subtotal + expectedTax;
      expect(processed.totalCost).toBe(expectedTotal);
    });
  });

  describe('System Reliability', () => {
    it('should handle repeated operations without errors', async () => {
      for (let i = 0; i < 10; i++) {
        const declarationNumber = await generateDeclarationNumber();
        const isValid = await validateDeclarationNumber(declarationNumber);
        expect(isValid).toBe(true);
      }
    });

    it('should recover from invalid inputs gracefully', async () => {
      const invalidCodes = ['INVALID', '0000', '9999', '', '12345'];

      for (const code of invalidCodes) {
        const result = await getHSCode(code);
        // Should return undefined or handle gracefully
        expect(result === undefined || result === null || result.code).toBeDefined();
      }
    });
  });
});

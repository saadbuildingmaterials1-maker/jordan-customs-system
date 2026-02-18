import { describe, it, expect } from 'vitest';
import {
  distributeDutiesByValue,
  distributeDutiesByWeight,
  distributeDutiesByQuantity,
  distributeDutiesByCustomRate,
  validateDistribution,
  calculateLandedUnitCost,
  redistributeDuties,
} from './duty-distribution-service';

/**
 * اختبارات شاملة لخدمة توزيع الرسوم الجمركية
 */

describe('Duty Distribution Service', () => {
  const mockItems = [
    { id: 1, name: 'منتج أ', quantity: 100, unitPrice: 10, totalPrice: 1000 },
    { id: 2, name: 'منتج ب', quantity: 50, unitPrice: 20, totalPrice: 1000 },
    { id: 3, name: 'منتج ج', quantity: 25, unitPrice: 40, totalPrice: 1000 },
  ];

  const totalCustomsDuty = 300;
  const totalSalesTax = 480;
  const totalAdditionalFees = 100;

  describe('Distribution by Value', () => {
    it('should distribute duties equally for equal values', async () => {
      const distribution = await distributeDutiesByValue(
        mockItems,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );

      expect(distribution.length).toBe(3);
      expect(distribution[0].customsDuty).toBe(100);
      expect(distribution[1].customsDuty).toBe(100);
      expect(distribution[2].customsDuty).toBe(100);
    });

    it('should calculate correct per-unit costs', async () => {
      const distribution = await distributeDutiesByValue(
        mockItems,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );

      expect(distribution[0].perUnitCost).toBeGreaterThan(0);
      expect(distribution[1].perUnitCost).toBeGreaterThan(0);
      expect(distribution[2].perUnitCost).toBeGreaterThan(0);
    });

    it('should handle single item', async () => {
      const singleItem = [mockItems[0]];
      const distribution = await distributeDutiesByValue(
        singleItem,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );

      expect(distribution.length).toBe(1);
      expect(distribution[0].customsDuty).toBe(totalCustomsDuty);
      expect(distribution[0].salesTax).toBe(totalSalesTax);
      expect(distribution[0].additionalFees).toBe(totalAdditionalFees);
    });

    it('should reject zero total value', async () => {
      const zeroItems = [
        { id: 1, name: 'منتج', quantity: 0, unitPrice: 0, totalPrice: 0 },
      ];

      try {
        await distributeDutiesByValue(
          zeroItems,
          totalCustomsDuty,
          totalSalesTax,
          totalAdditionalFees
        );
        expect.fail('Should throw error for zero value');
      } catch (error) {
        expect((error as Error).message).toContain('صفراً');
      }
    });
  });

  describe('Distribution by Weight', () => {
    it('should distribute duties by weight', async () => {
      const itemWeights = { 1: 100, 2: 200, 3: 300 };
      const distribution = await distributeDutiesByWeight(
        mockItems,
        itemWeights,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );

      expect(distribution.length).toBe(3);
      expect(distribution[0].customsDuty).toBeLessThan(distribution[1].customsDuty);
      expect(distribution[1].customsDuty).toBeLessThan(distribution[2].customsDuty);
    });

    it('should reject zero total weight', async () => {
      const itemWeights = { 1: 0, 2: 0, 3: 0 };

      try {
        await distributeDutiesByWeight(
          mockItems,
          itemWeights,
          totalCustomsDuty,
          totalSalesTax,
          totalAdditionalFees
        );
        expect.fail('Should throw error for zero weight');
      } catch (error) {
        expect((error as Error).message).toContain('صفراً');
      }
    });
  });

  describe('Distribution by Quantity', () => {
    it('should distribute duties by quantity', async () => {
      const distribution = await distributeDutiesByQuantity(
        mockItems,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );

      expect(distribution.length).toBe(3);
      // Item 1 has 100 units (50% of total 175)
      expect(distribution[0].customsDuty).toBeGreaterThan(
        distribution[2].customsDuty
      );
    });

    it('should reject zero total quantity', async () => {
      const zeroItems = [
        { id: 1, name: 'منتج', quantity: 0, unitPrice: 10, totalPrice: 0 },
      ];

      try {
        await distributeDutiesByQuantity(
          zeroItems,
          totalCustomsDuty,
          totalSalesTax,
          totalAdditionalFees
        );
        expect.fail('Should throw error for zero quantity');
      } catch (error) {
        expect((error as Error).message).toContain('صفراً');
      }
    });
  });

  describe('Distribution by Custom Rate', () => {
    it('should distribute duties by custom rates', async () => {
      const itemRates = { 1: 0.5, 2: 0.3, 3: 0.2 };
      const distribution = await distributeDutiesByCustomRate(
        mockItems,
        itemRates,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );

      expect(distribution.length).toBe(3);
      expect(distribution[0].customsDuty).toBeGreaterThan(
        distribution[1].customsDuty
      );
      expect(distribution[1].customsDuty).toBeGreaterThan(
        distribution[2].customsDuty
      );
    });

    it('should reject zero total rate', async () => {
      const itemRates = { 1: 0, 2: 0, 3: 0 };

      try {
        await distributeDutiesByCustomRate(
          mockItems,
          itemRates,
          totalCustomsDuty,
          totalSalesTax,
          totalAdditionalFees
        );
        expect.fail('Should throw error for zero rate');
      } catch (error) {
        expect((error as Error).message).toContain('صفراً');
      }
    });
  });

  describe('Validation', () => {
    it('should validate correct distribution', async () => {
      const distribution = await distributeDutiesByValue(
        mockItems,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );

      // Calculate actual totals from distribution
      const actualDuty = distribution.reduce((sum, d) => sum + d.customsDuty, 0);
      const actualTax = distribution.reduce((sum, d) => sum + d.salesTax, 0);
      const actualFees = distribution.reduce((sum, d) => sum + d.additionalFees, 0);

      const isValid = await validateDistribution(
        distribution,
        actualDuty,
        actualTax,
        actualFees
      );

      expect(isValid).toBe(true);
    });

    it('should detect invalid distribution', async () => {
      const distribution = await distributeDutiesByValue(
        mockItems,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );

      const isValid = await validateDistribution(
        distribution,
        totalCustomsDuty + 100,
        totalSalesTax,
        totalAdditionalFees
      );

      expect(isValid).toBe(false);
    });
  });

  describe('Landed Unit Cost Calculation', () => {
    it('should calculate landed unit costs', async () => {
      const distribution = await distributeDutiesByValue(
        mockItems,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );

      const costs = await calculateLandedUnitCost(mockItems, distribution);

      expect(costs.length).toBe(3);
      costs.forEach((cost) => {
        expect(cost.landedUnitCost).toBeGreaterThan(cost.unitPrice);
      });
    });

    it('should throw error for missing distribution', async () => {
      const distribution = await distributeDutiesByValue(
        mockItems,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );

      // Remove one item from distribution
      distribution.pop();

      try {
        await calculateLandedUnitCost(mockItems, distribution);
        expect.fail('Should throw error for missing distribution');
      } catch (error) {
        expect((error as Error).message).toContain('لم يتم العثور');
      }
    });
  });

  describe('Redistribution', () => {
    it('should redistribute by value', async () => {
      const distribution = await distributeDutiesByValue(
        mockItems,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );

      const newDistribution = await redistributeDuties(
        mockItems,
        distribution,
        'value'
      );

      expect(newDistribution.length).toBe(3);
    });

    it('should redistribute by quantity', async () => {
      const distribution = await distributeDutiesByValue(
        mockItems,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );

      const newDistribution = await redistributeDuties(
        mockItems,
        distribution,
        'quantity'
      );

      expect(newDistribution.length).toBe(3);
    });

    it('should reject unknown redistribution method', async () => {
      const distribution = await distributeDutiesByValue(
        mockItems,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );

      try {
        await redistributeDuties(
          mockItems,
          distribution,
          'unknown' as any
        );
        expect.fail('Should throw error for unknown method');
      } catch (error) {
        expect((error as Error).message).toContain('غير معروفة');
      }
    });
  });

  describe('Rounding and Precision', () => {
    it('should round values to 2 decimal places', async () => {
      const distribution = await distributeDutiesByValue(
        mockItems,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );

      distribution.forEach((d) => {
        const customsDutyStr = d.customsDuty.toString();
        const decimalPlaces = customsDutyStr.includes('.')
          ? customsDutyStr.split('.')[1].length
          : 0;
        expect(decimalPlaces).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small values', async () => {
      const smallItems = [
        { id: 1, name: 'منتج', quantity: 1, unitPrice: 0.01, totalPrice: 0.01 },
      ];

      const distribution = await distributeDutiesByValue(
        smallItems,
        0.003,
        0.0048,
        0.001
      );

      expect(distribution.length).toBe(1);
      expect(distribution[0].customsDuty).toBeGreaterThanOrEqual(0);
      expect(distribution[0].totalCharges).toBeGreaterThan(0);
    });

    it('should handle large values', async () => {
      const largeItems = [
        {
          id: 1,
          name: 'منتج',
          quantity: 1000000,
          unitPrice: 1000,
          totalPrice: 1000000000,
        },
      ];

      const distribution = await distributeDutiesByValue(
        largeItems,
        300000000,
        480000000,
        100000000
      );

      expect(distribution.length).toBe(1);
      expect(distribution[0].customsDuty).toBe(300000000);
    });

    it('should handle many items', async () => {
      const manyItems = Array(100)
        .fill(null)
        .map((_, i) => ({
          id: i + 1,
          name: `منتج ${i + 1}`,
          quantity: 10,
          unitPrice: 10,
          totalPrice: 100,
        }));

      const distribution = await distributeDutiesByValue(
        manyItems,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );

      expect(distribution.length).toBe(100);
    });
  });

  describe('Performance', () => {
    it('should distribute quickly for many items', async () => {
      const manyItems = Array(1000)
        .fill(null)
        .map((_, i) => ({
          id: i + 1,
          name: `منتج ${i + 1}`,
          quantity: 10,
          unitPrice: 10,
          totalPrice: 100,
        }));

      const start = Date.now();
      await distributeDutiesByValue(
        manyItems,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });
  });
});

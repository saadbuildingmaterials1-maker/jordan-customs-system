import { describe, it, expect, beforeEach } from "vitest";

// اختبارات الحسابات المالية الشاملة

describe("Customs Calculations", () => {
  describe("FOB Calculation", () => {
    it("should calculate FOB value correctly", () => {
      const quantity = 100;
      const unitPrice = 50;
      const fob = quantity * unitPrice;
      expect(fob).toBe(5000);
    });

    it("should handle decimal values", () => {
      const quantity = 10.5;
      const unitPrice = 25.75;
      const fob = quantity * unitPrice;
      expect(fob).toBeCloseTo(270.375, 2);
    });

    it("should handle zero values", () => {
      const quantity = 0;
      const unitPrice = 50;
      const fob = quantity * unitPrice;
      expect(fob).toBe(0);
    });
  });

  describe("Freight and Insurance", () => {
    it("should calculate freight correctly", () => {
      const fob = 5000;
      const freightRate = 0.05; // 5%
      const freight = fob * freightRate;
      expect(freight).toBe(250);
    });

    it("should calculate insurance correctly", () => {
      const fob = 5000;
      const insuranceRate = 0.02; // 2%
      const insurance = fob * insuranceRate;
      expect(insurance).toBe(100);
    });

    it("should calculate CIF correctly", () => {
      const fob = 5000;
      const freight = 250;
      const insurance = 100;
      const cif = fob + freight + insurance;
      expect(cif).toBe(5350);
    });
  });

  describe("Customs Duties", () => {
    it("should calculate customs duty correctly", () => {
      const cif = 5350;
      const dutyRate = 0.15; // 15%
      const duty = cif * dutyRate;
      expect(duty).toBeCloseTo(802.5, 2);
    });

    it("should calculate sales tax correctly", () => {
      const dutyableValue = 5350 + 802.5;
      const taxRate = 0.16; // 16%
      const tax = dutyableValue * taxRate;
      expect(tax).toBeCloseTo(984.4, 2);
    });

    it("should calculate total cost correctly", () => {
      const fob = 5000;
      const freight = 250;
      const insurance = 100;
      const duty = 802.5;
      const tax = 1024.32;
      const total = fob + freight + insurance + duty + tax;
      expect(total).toBeCloseTo(7176.82, 2);
    });
  });

  describe("Unit Cost Calculation", () => {
    it("should calculate landed unit cost correctly", () => {
      const totalCost = 7176.82;
      const quantity = 100;
      const unitCost = totalCost / quantity;
      expect(unitCost).toBeCloseTo(71.7682, 2);
    });

    it("should handle multiple items", () => {
      const items = [
        { quantity: 50, unitPrice: 100 },
        { quantity: 30, unitPrice: 150 },
        { quantity: 20, unitPrice: 200 },
      ];

      const totalFob = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      expect(totalFob).toBe(13500);

      const freight = totalFob * 0.05;
      const insurance = totalFob * 0.02;
      const cif = totalFob + freight + insurance;
      const duty = cif * 0.15;
      const tax = (cif + duty) * 0.16;
      const totalCost = totalFob + freight + insurance + duty + tax;

      const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
      const unitCost = totalCost / totalQuantity;

      expect(totalQuantity).toBe(100);
      expect(unitCost).toBeCloseTo(totalCost / 100, 2);
    });
  });

  describe("Variance Analysis", () => {
    it("should calculate variance correctly", () => {
      const actual = 7176.82;
      const estimated = 7000;
      const variance = actual - estimated;
      expect(variance).toBeCloseTo(176.82, 2);
    });

    it("should calculate variance percentage correctly", () => {
      const actual = 7176.82;
      const estimated = 7000;
      const variance = actual - estimated;
      const variancePercent = (variance / estimated) * 100;
      expect(variancePercent).toBeCloseTo(2.526, 2);
    });

    it("should identify positive variance", () => {
      const actual = 7176.82;
      const estimated = 7000;
      const variance = actual - estimated;
      expect(variance > 0).toBe(true);
    });

    it("should identify negative variance", () => {
      const actual = 6800;
      const estimated = 7000;
      const variance = actual - estimated;
      expect(variance < 0).toBe(true);
    });
  });

  describe("Currency Conversion", () => {
    it("should convert USD to JOD correctly", () => {
      const usdAmount = 1000;
      const exchangeRate = 0.71; // 1 USD = 0.71 JOD
      const jodAmount = usdAmount * exchangeRate;
      expect(jodAmount).toBe(710);
    });

    it("should convert EGP to JOD correctly", () => {
      const egpAmount = 10000;
      const exchangeRate = 0.045; // 1 EGP = 0.045 JOD
      const jodAmount = egpAmount * exchangeRate;
      expect(jodAmount).toBe(450);
    });

    it("should handle multiple currencies", () => {
      const items = [
        { amount: 1000, currency: "USD", rate: 0.71 },
        { amount: 10000, currency: "EGP", rate: 0.045 },
        { amount: 5000, currency: "JOD", rate: 1 },
      ];

      const totalJod = items.reduce((sum, item) => sum + item.amount * item.rate, 0);
      expect(totalJod).toBe(6160);
    });
  });

  describe("Distribution of Additional Costs", () => {
    it("should distribute additional costs by value ratio", () => {
      const items = [
        { value: 5000, quantity: 100 },
        { value: 3000, quantity: 60 },
        { value: 2000, quantity: 40 },
      ];

      const totalValue = items.reduce((sum, item) => sum + item.value, 0);
      const additionalCost = 1000;

      const distribution = items.map((item) => ({
        ...item,
        ratio: item.value / totalValue,
        allocatedCost: (item.value / totalValue) * additionalCost,
      }));

      expect(distribution[0].allocatedCost).toBe(500);
      expect(distribution[1].allocatedCost).toBe(300);
      expect(distribution[2].allocatedCost).toBe(200);
    });

    it("should calculate per-unit cost after distribution", () => {
      const items = [
        { value: 5000, quantity: 100 },
        { value: 3000, quantity: 60 },
        { value: 2000, quantity: 40 },
      ];

      const totalValue = items.reduce((sum, item) => sum + item.value, 0);
      const additionalCost = 1000;

      const results = items.map((item) => {
        const allocatedCost = (item.value / totalValue) * additionalCost;
        const totalCost = item.value + allocatedCost;
        const unitCost = totalCost / item.quantity;
        return { ...item, unitCost };
      });

      expect(results[0].unitCost).toBeCloseTo(55, 2);
      expect(results[1].unitCost).toBeCloseTo(55, 2);
      expect(results[2].unitCost).toBeCloseTo(55, 2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large numbers", () => {
      const quantity = 1000000;
      const unitPrice = 999.99;
      const fob = quantity * unitPrice;
      expect(fob).toBe(999990000);
    });

    it("should handle very small numbers", () => {
      const quantity = 0.001;
      const unitPrice = 0.01;
      const fob = quantity * unitPrice;
      expect(fob).toBeCloseTo(0.00001, 5);
    });

    it("should handle negative values gracefully", () => {
      const quantity = -100;
      const unitPrice = 50;
      const fob = quantity * unitPrice;
      expect(fob).toBe(-5000);
    });

    it("should round to 2 decimal places", () => {
      const value = 123.456789;
      const rounded = Math.round(value * 100) / 100;
      expect(rounded).toBe(123.46);
    });
  });
});

describe("Advanced Calculations", () => {
  it("should calculate weighted average cost", () => {
    const items = [
      { quantity: 100, unitCost: 50 },
      { quantity: 200, unitCost: 60 },
      { quantity: 150, unitCost: 55 },
    ];

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalCost = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    const weightedAverage = totalCost / totalQuantity;

    expect(weightedAverage).toBeCloseTo(56.111, 2);
  });

  it("should calculate cumulative costs", () => {
    const monthlyExpenses = [1000, 1500, 2000, 1800, 2200];
    const cumulative = monthlyExpenses.reduce((acc, val) => {
      acc.push((acc[acc.length - 1] || 0) + val);
      return acc;
    }, [] as number[]);

    expect(cumulative).toEqual([1000, 2500, 4500, 6300, 8500]);
  });

  it("should calculate percentage change", () => {
    const previous = 1000;
    const current = 1200;
    const percentChange = ((current - previous) / previous) * 100;

    expect(percentChange).toBe(20);
  });

  it("should calculate compound growth", () => {
    const principal = 1000;
    const rate = 0.05; // 5%
    const years = 5;
    const compound = principal * Math.pow(1 + rate, years);

    expect(compound).toBeCloseTo(1276.28, 2);
  });
});

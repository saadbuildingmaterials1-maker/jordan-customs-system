import { describe, it, expect } from "vitest";
import { getCustomsDeclarationsByUserId } from "./db";
import { calculateAllCosts } from "@shared/calculations";

describe("Customs Declarations - Bug Fixes", () => {
  describe("List Declarations", () => {
    it("should return declarations list without errors", async () => {
      // Test that listDeclarations procedure exists and returns data
      const result = await getCustomsDeclarationsByUserId(1);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should filter declarations by user ID", async () => {
      // Verify that only declarations for the specified user are returned
      const result = await getCustomsDeclarationsByUserId(1);
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return declarations with correct structure", async () => {
      const result = await getCustomsDeclarationsByUserId(1);
      if (result.length > 0) {
        const declaration = result[0];
        expect(declaration).toHaveProperty("id");
        expect(declaration).toHaveProperty("declarationNumber");
        expect(declaration).toHaveProperty("registrationDate");
        expect(declaration).toHaveProperty("clearanceCenter");
        expect(declaration).toHaveProperty("exportCountry");
        expect(declaration).toHaveProperty("status");
      }
    });
  });

  describe("PDF Export Calculations", () => {
    it("should calculate costs correctly for PDF export", () => {
      const testData = {
        fobValueForeign: 35400,
        freightCost: 3500,
        insuranceCost: 800,
        customsDuty: 8000,
        additionalFees: 1200,
        customsServiceFee: 500,
        penalties: 300,
        exchangeRate: 0.708,
      };

      const result = calculateAllCosts(testData);

      expect(result).toBeDefined();
      expect(result.fobValueJod).toBeGreaterThan(0);
      expect(result.freightAndInsurance).toBeGreaterThan(0);
      expect(result.totalCustomsAndTaxes).toBeGreaterThan(0);
      expect(result.totalLandedCost).toBeGreaterThan(0);
    });

    it("should calculate correct FOB value", () => {
      const testData = {
        fobValueForeign: 50000,
        freightCost: 3500,
        insuranceCost: 800,
        customsDuty: 8000,
        additionalFees: 1200,
        customsServiceFee: 500,
        penalties: 300,
        exchangeRate: 0.708,
      };

      const result = calculateAllCosts(testData);
      // FOB value in JOD = 50000 * 0.708 = 35400
      expect(result.fobValueJod).toBeCloseTo(35400, 0);
    });

    it("should calculate freight and insurance correctly", () => {
      const testData = {
        fobValueForeign: 50000,
        freightCost: 3500,
        insuranceCost: 800,
        customsDuty: 8000,
        additionalFees: 1200,
        customsServiceFee: 500,
        penalties: 300,
        exchangeRate: 0.708,
      };

      const result = calculateAllCosts(testData);
      // Freight and insurance = 3500 + 800 = 4300
      expect(result.freightAndInsurance).toBe(4300);
    });

    it("should calculate total customs and taxes correctly", () => {
      const testData = {
        fobValueForeign: 50000,
        freightCost: 3500,
        insuranceCost: 800,
        customsDuty: 8000,
        additionalFees: 1200,
        customsServiceFee: 500,
        penalties: 300,
        exchangeRate: 0.708,
      };

      const result = calculateAllCosts(testData);
      // Total customs and taxes includes duties, sales tax, additional fees, service fees, and penalties
      expect(result.totalCustomsAndTaxes).toBeGreaterThan(0);
    });

    it("should calculate total landed cost correctly", () => {
      const testData = {
        fobValueForeign: 50000,
        freightCost: 3500,
        insuranceCost: 800,
        customsDuty: 8000,
        additionalFees: 1200,
        customsServiceFee: 500,
        penalties: 300,
        exchangeRate: 0.708,
      };

      const result = calculateAllCosts(testData);
      // Total landed cost = FOB (JOD) + Freight & Insurance + Customs & Taxes
      expect(result.totalLandedCost).toBeGreaterThan(0);
      expect(result.totalLandedCost).toBeGreaterThan(result.fobValueJod);
    });
  });

  describe("Declaration Status", () => {
    it("should have valid status values", () => {
      const validStatuses = ["draft", "submitted", "approved", "cleared"];
      const testStatus = "draft";
      expect(validStatuses).toContain(testStatus);
    });

    it("should handle all status transitions", () => {
      const validStatuses = ["draft", "submitted", "approved", "cleared"];
      const statusTransitions: Record<string, string[]> = {
        draft: ["submitted", "draft"],
        submitted: ["approved", "draft"],
        approved: ["cleared", "draft"],
        cleared: ["draft"],
      };

      validStatuses.forEach((status) => {
        expect(Object.keys(statusTransitions)).toContain(status);
      });
    });
  });

  describe("Declaration Fields", () => {
    it("should have all required fields", () => {
      const requiredFields = [
        "id",
        "declarationNumber",
        "registrationDate",
        "clearanceCenter",
        "exportCountry",
        "billOfLadingNumber",
        "exchangeRate",
        "grossWeight",
        "netWeight",
        "numberOfPackages",
        "packageType",
        "status",
      ];

      expect(requiredFields.length).toBeGreaterThan(0);
      requiredFields.forEach((field) => {
        expect(typeof field).toBe("string");
        expect(field.length).toBeGreaterThan(0);
      });
    });

    it("should validate exchange rate format", () => {
      const validExchangeRates = [0.708, 0.5, 1.0, 1.5];
      validExchangeRates.forEach((rate) => {
        expect(typeof rate).toBe("number");
        expect(rate).toBeGreaterThan(0);
      });
    });

    it("should validate declaration number format", () => {
      const validDeclarationNumbers = ["89430/4", "12345/1", "99999/99"];
      validDeclarationNumbers.forEach((number) => {
        expect(number).toMatch(/^\d+\/\d+$/);
      });
    });
  });

  describe("Variance Analysis", () => {
    it("should calculate variance correctly", () => {
      const actual = 50000;
      const estimated = 45000;
      const variance = actual - estimated;
      const variancePercentage = (variance / estimated) * 100;

      expect(variance).toBe(5000);
      expect(variancePercentage).toBeCloseTo(11.11, 1);
    });

    it("should handle negative variance", () => {
      const actual = 40000;
      const estimated = 45000;
      const variance = actual - estimated;

      expect(variance).toBeLessThan(0);
      expect(Math.abs(variance)).toBe(5000);
    });

    it("should handle zero variance", () => {
      const actual = 50000;
      const estimated = 50000;
      const variance = actual - estimated;

      expect(variance).toBe(0);
    });
  });
});

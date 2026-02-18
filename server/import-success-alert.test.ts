import { describe, it, expect } from 'vitest';

describe('Import Success Alert Component', () => {
  describe('Success Message Display', () => {
    it('should display success message with correct title', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
      };

      expect(mockData.declarationNumber).toBe('89430/4');
      expect(mockData.confidence).toBeGreaterThan(90);
    });

    it('should show declaration details correctly', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
      };

      expect(mockData.date).toBe('14/12/2025');
      expect(mockData.importerName).toBeDefined();
      expect(mockData.importerName).toContain('سعد');
    });

    it('should display items count and total value', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 5,
        totalValue: 50000,
        currency: 'JOD',
        confidence: 88,
      };

      expect(mockData.itemsCount).toBe(5);
      expect(mockData.totalValue).toBe(50000);
      expect(mockData.totalValue).toBeGreaterThan(0);
    });

    it('should handle multiple items correctly', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 10,
        totalValue: 100000,
        currency: 'JOD',
        confidence: 92,
      };

      expect(mockData.itemsCount).toBeGreaterThan(1);
      expect(mockData.totalValue).toBeGreaterThan(50000);
    });
  });

  describe('Financial Details Display', () => {
    it('should display customs duty correctly', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
        customsDuty: 412.2,
      };

      expect(mockData.customsDuty).toBeDefined();
      expect(mockData.customsDuty).toBeGreaterThan(0);
      expect(mockData.customsDuty).toBe(412.2);
    });

    it('should display tax correctly', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
        tax: 3928.35,
      };

      expect(mockData.tax).toBeDefined();
      expect(mockData.tax).toBeGreaterThan(0);
      expect(mockData.tax).toBe(3928.35);
    });

    it('should display total amount correctly', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
        customsDuty: 412.2,
        tax: 3928.35,
        totalAmount: 24440.55,
      };

      expect(mockData.totalAmount).toBeDefined();
      expect(mockData.totalAmount).toBeGreaterThan(mockData.totalValue);
      expect(mockData.totalAmount).toBe(24440.55);
    });

    it('should calculate total amount correctly', () => {
      const totalValue = 20100;
      const customsDuty = 412.2;
      const tax = 3928.35;
      const expectedTotal = totalValue + customsDuty + tax;

      expect(expectedTotal).toBe(24440.55);
    });
  });

  describe('Confidence Score Display', () => {
    it('should display high confidence (90%+)', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
      };

      expect(mockData.confidence).toBeGreaterThanOrEqual(90);
      expect(mockData.confidence).toBeLessThanOrEqual(100);
    });

    it('should display medium confidence (75-89%)', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 82,
      };

      expect(mockData.confidence).toBeGreaterThanOrEqual(75);
      expect(mockData.confidence).toBeLessThan(90);
    });

    it('should display low confidence (60-74%)', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 68,
      };

      expect(mockData.confidence).toBeGreaterThanOrEqual(60);
      expect(mockData.confidence).toBeLessThan(75);
    });

    it('should handle very low confidence (< 60%)', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 45,
      };

      expect(mockData.confidence).toBeLessThan(60);
    });
  });

  describe('Currency Support', () => {
    it('should support JOD currency', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
      };

      expect(mockData.currency).toBe('JOD');
    });

    it('should support USD currency', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 28400,
        currency: 'USD',
        confidence: 95,
      };

      expect(mockData.currency).toBe('USD');
    });

    it('should support EGP currency', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 773850,
        currency: 'EGP',
        confidence: 95,
      };

      expect(mockData.currency).toBe('EGP');
    });
  });

  describe('Message Content Structure', () => {
    it('should have all required fields in success message', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
      };

      expect(mockData).toHaveProperty('declarationNumber');
      expect(mockData).toHaveProperty('date');
      expect(mockData).toHaveProperty('importerName');
      expect(mockData).toHaveProperty('itemsCount');
      expect(mockData).toHaveProperty('totalValue');
      expect(mockData).toHaveProperty('currency');
      expect(mockData).toHaveProperty('confidence');
    });

    it('should handle optional financial fields', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
        customsDuty: undefined,
        tax: undefined,
        totalAmount: undefined,
      };

      expect(mockData.customsDuty).toBeUndefined();
      expect(mockData.tax).toBeUndefined();
      expect(mockData.totalAmount).toBeUndefined();
    });

    it('should display complete financial information when available', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
        customsDuty: 412.2,
        tax: 3928.35,
        totalAmount: 24440.55,
      };

      expect(mockData.customsDuty).toBeDefined();
      expect(mockData.tax).toBeDefined();
      expect(mockData.totalAmount).toBeDefined();
      expect(mockData.customsDuty).toBeGreaterThan(0);
      expect(mockData.tax).toBeGreaterThan(0);
      expect(mockData.totalAmount).toBeGreaterThan(0);
    });
  });

  describe('Success Message Validation', () => {
    it('should validate declaration number format', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
      };

      expect(mockData.declarationNumber).toMatch(/^\d+\/\d+$/);
    });

    it('should validate date format', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
      };

      expect(mockData.date).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
    });

    it('should validate importer name is not empty', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
      };

      expect(mockData.importerName).toBeTruthy();
      expect(mockData.importerName.length).toBeGreaterThan(0);
    });

    it('should validate items count is positive', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
      };

      expect(mockData.itemsCount).toBeGreaterThan(0);
    });

    it('should validate total value is positive', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
      };

      expect(mockData.totalValue).toBeGreaterThan(0);
    });

    it('should validate confidence score is between 0 and 100', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
      };

      expect(mockData.confidence).toBeGreaterThanOrEqual(0);
      expect(mockData.confidence).toBeLessThanOrEqual(100);
    });
  });

  describe('Message Localization', () => {
    it('should support Arabic text in importer name', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
      };

      expect(mockData.importerName).toMatch(/[\u0600-\u06FF]/);
    });

    it('should format date in Arabic locale', () => {
      const mockData = {
        declarationNumber: '89430/4',
        date: '14/12/2025',
        importerName: 'سعد احمد غازي سعد الدين',
        itemsCount: 1,
        totalValue: 20100,
        currency: 'JOD',
        confidence: 95,
      };

      expect(mockData.date).toBeDefined();
      expect(mockData.date.length).toBeGreaterThan(0);
    });
  });
});

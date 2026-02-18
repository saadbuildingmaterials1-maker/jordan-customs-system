import { describe, it, expect, vi } from 'vitest';
import {
  validateExtractedData,
  ExtractedData,
} from './ai-data-extraction';

describe('AI Data Extraction Service', () => {
  describe('Data Validation', () => {
    it('should validate complete and correct data', () => {
      const data: ExtractedData = {
        declarationNumber: 'DEC001',
        exportCountry: 'China',
        billOfLadingNumber: 'BL001',
        grossWeight: 1000,
        netWeight: 900,
        numberOfPackages: 10,
        packageType: 'Box',
        fobValue: 5000,
        freightCost: 500,
        insuranceCost: 100,
        customsDuty: 1000,
        salesTax: 800,
        containerNumber: 'CONT001',
        containerType: '20ft',
        shippingCompany: 'Shipping Co',
        portOfLoading: 'Shanghai',
        portOfDischarge: 'Aqaba',
        confidence: 95,
      };

      const result = validateExtractedData(data);
      expect(result.valid).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    it('should detect low confidence score', () => {
      const data: ExtractedData = {
        confidence: 30,
      };

      const result = validateExtractedData(data);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('درجة الثقة منخفضة جداً');
    });

    it('should detect missing bill of lading number', () => {
      const data: ExtractedData = {
        confidence: 85,
      };

      const result = validateExtractedData(data);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('رقم بوليصة الشحن مفقود');
    });

    it('should detect missing export country', () => {
      const data: ExtractedData = {
        billOfLadingNumber: 'BL001',
        confidence: 85,
      };

      const result = validateExtractedData(data);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('دولة التصدير مفقودة');
    });

    it('should detect invalid weight relationship', () => {
      const data: ExtractedData = {
        billOfLadingNumber: 'BL001',
        exportCountry: 'China',
        grossWeight: 500,
        netWeight: 1000,
        confidence: 85,
      };

      const result = validateExtractedData(data);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('الوزن الإجمالي أقل من الوزن الصافي');
    });

    it('should detect negative FOB value', () => {
      const data: ExtractedData = {
        billOfLadingNumber: 'BL001',
        exportCountry: 'China',
        fobValue: -1000,
        confidence: 85,
      };

      const result = validateExtractedData(data);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('قيمة FOB سالبة');
    });

    it('should detect negative freight cost', () => {
      const data: ExtractedData = {
        billOfLadingNumber: 'BL001',
        exportCountry: 'China',
        freightCost: -500,
        confidence: 85,
      };

      const result = validateExtractedData(data);
      expect(result.valid).toBe(false);
      expect(result.issues).toContain('تكلفة الشحن سالبة');
    });

    it('should detect missing item description', () => {
      const data: ExtractedData = {
        billOfLadingNumber: 'BL001',
        exportCountry: 'China',
        confidence: 85,
        items: [
          {
            description: '',
            quantity: 10,
          },
        ],
      };

      const result = validateExtractedData(data);
      expect(result.valid).toBe(false);
      expect(result.issues.some(issue => issue.includes('الوصف مفقود'))).toBe(true);
    });

    it('should detect invalid item quantity', () => {
      const data: ExtractedData = {
        billOfLadingNumber: 'BL001',
        exportCountry: 'China',
        confidence: 85,
        items: [
          {
            description: 'Product A',
            quantity: -5,
          },
        ],
      };

      const result = validateExtractedData(data);
      expect(result.valid).toBe(false);
      expect(result.issues.some(issue => issue.includes('الكمية يجب أن تكون موجبة'))).toBe(true);
    });

    it('should detect zero item quantity', () => {
      const data: ExtractedData = {
        billOfLadingNumber: 'BL001',
        exportCountry: 'China',
        confidence: 85,
        items: [
          {
            description: 'Product A',
            quantity: 0,
          },
        ],
      };

      const result = validateExtractedData(data);
      expect(result.valid).toBe(false);
      expect(result.issues.some(issue => issue.includes('الكمية يجب أن تكون موجبة'))).toBe(true);
    });

    it('should handle multiple items validation', () => {
      const data: ExtractedData = {
        billOfLadingNumber: 'BL001',
        exportCountry: 'China',
        confidence: 85,
        items: [
          {
            description: 'Product A',
            quantity: 10,
          },
          {
            description: '',
            quantity: 20,
          },
          {
            description: 'Product C',
            quantity: -5,
          },
        ],
      };

      const result = validateExtractedData(data);
      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Data Structure', () => {
    it('should have correct extracted data structure', () => {
      const data: ExtractedData = {
        declarationNumber: 'DEC001',
        exportCountry: 'China',
        billOfLadingNumber: 'BL001',
        grossWeight: 1000,
        netWeight: 900,
        numberOfPackages: 10,
        packageType: 'Box',
        fobValue: 5000,
        freightCost: 500,
        insuranceCost: 100,
        customsDuty: 1000,
        salesTax: 800,
        containerNumber: 'CONT001',
        containerType: '20ft',
        shippingCompany: 'Shipping Co',
        portOfLoading: 'Shanghai',
        portOfDischarge: 'Aqaba',
        items: [
          {
            description: 'Product A',
            hsCode: '1234567890',
            quantity: 100,
            unit: 'pcs',
            unitPrice: 50,
            totalPrice: 5000,
            origin: 'China',
          },
        ],
        confidence: 95,
      };

      expect(data.declarationNumber).toBe('DEC001');
      expect(data.exportCountry).toBe('China');
      expect(data.billOfLadingNumber).toBe('BL001');
      expect(data.grossWeight).toBe(1000);
      expect(data.netWeight).toBe(900);
      expect(data.numberOfPackages).toBe(10);
      expect(data.packageType).toBe('Box');
      expect(data.fobValue).toBe(5000);
      expect(data.freightCost).toBe(500);
      expect(data.insuranceCost).toBe(100);
      expect(data.customsDuty).toBe(1000);
      expect(data.salesTax).toBe(800);
      expect(data.containerNumber).toBe('CONT001');
      expect(data.containerType).toBe('20ft');
      expect(data.shippingCompany).toBe('Shipping Co');
      expect(data.portOfLoading).toBe('Shanghai');
      expect(data.portOfDischarge).toBe('Aqaba');
      expect(data.items).toHaveLength(1);
      expect(data.items![0].description).toBe('Product A');
      expect(data.items![0].hsCode).toBe('1234567890');
      expect(data.items![0].quantity).toBe(100);
      expect(data.items![0].unit).toBe('pcs');
      expect(data.items![0].unitPrice).toBe(50);
      expect(data.items![0].totalPrice).toBe(5000);
      expect(data.items![0].origin).toBe('China');
      expect(data.confidence).toBe(95);
    });

    it('should handle optional fields', () => {
      const data: ExtractedData = {
        billOfLadingNumber: 'BL001',
        exportCountry: 'China',
        confidence: 75,
      };

      expect(data.declarationNumber).toBeUndefined();
      expect(data.containerNumber).toBeUndefined();
      expect(data.items).toBeUndefined();
      expect(data.errors).toBeUndefined();
    });

    it('should handle error messages', () => {
      const data: ExtractedData = {
        confidence: 0,
        errors: [
          'فشل استخراج البيانات',
          'ملف غير صحيح',
        ],
      };

      expect(data.errors).toHaveLength(2);
      expect(data.errors![0]).toBe('فشل استخراج البيانات');
      expect(data.errors![1]).toBe('ملف غير صحيح');
    });
  });

  describe('Confidence Score', () => {
    it('should accept high confidence score', () => {
      const data: ExtractedData = {
        billOfLadingNumber: 'BL001',
        exportCountry: 'China',
        confidence: 95,
      };

      const result = validateExtractedData(data);
      expect(result.issues).not.toContain('درجة الثقة منخفضة جداً');
    });

    it('should accept medium confidence score', () => {
      const data: ExtractedData = {
        billOfLadingNumber: 'BL001',
        exportCountry: 'China',
        confidence: 50,
      };

      const result = validateExtractedData(data);
      expect(result.issues).not.toContain('درجة الثقة منخفضة جداً');
    });

    it('should reject low confidence score', () => {
      const data: ExtractedData = {
        billOfLadingNumber: 'BL001',
        exportCountry: 'China',
        confidence: 45,
      };

      const result = validateExtractedData(data);
      expect(result.issues).toContain('درجة الثقة منخفضة جداً');
    });

    it('should handle zero confidence score', () => {
      const data: ExtractedData = {
        confidence: 0,
      };

      const result = validateExtractedData(data);
      expect(result.valid).toBe(false);
    });

    it('should handle undefined confidence score', () => {
      const data: ExtractedData = {};

      const result = validateExtractedData(data);
      expect(result.valid).toBe(false);
    });
  });

  describe('Container Type Validation', () => {
    it('should accept valid container types', () => {
      const validTypes = ['20ft', '40ft', '40ftHC', '45ft'];
      
      validTypes.forEach(type => {
        const data: ExtractedData = {
          billOfLadingNumber: 'BL001',
          exportCountry: 'China',
          containerType: type,
          confidence: 85,
        };

        const result = validateExtractedData(data);
        // يجب ألا يكون هناك خطأ متعلق بنوع الحاوية
        expect(result.issues.filter(i => i.includes('حاوية'))).toHaveLength(0);
      });
    });
  });

  describe('Price Calculations', () => {
    it('should validate item price calculations', () => {
      const data: ExtractedData = {
        billOfLadingNumber: 'BL001',
        exportCountry: 'China',
        confidence: 85,
        items: [
          {
            description: 'Product A',
            quantity: 100,
            unitPrice: 50,
            totalPrice: 5000, // 100 * 50
          },
        ],
      };

      const result = validateExtractedData(data);
      expect(result.valid).toBe(true);
    });

    it('should handle items with missing prices', () => {
      const data: ExtractedData = {
        billOfLadingNumber: 'BL001',
        exportCountry: 'China',
        confidence: 85,
        items: [
          {
            description: 'Product A',
            quantity: 100,
          },
        ],
      };

      const result = validateExtractedData(data);
      expect(result.valid).toBe(true); // لا يجب أن يكون هناك خطأ للأسعار المفقودة
    });
  });
});

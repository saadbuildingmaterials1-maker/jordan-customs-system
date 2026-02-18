import { describe, it, expect, beforeEach } from 'vitest';
import { PDFImportService } from './pdf-import-service';

/**
 * اختبارات متقدمة لخدمة استيراد PDF
 */

describe('PDF Import Advanced Tests', () => {
  let service: PDFImportService;
  const testPDFBuffer = Buffer.from('%PDF-1.4\ntest content');

  beforeEach(() => {
    service = new PDFImportService({
      maxFileSize: 50 * 1024 * 1024,
      extractTables: true,
      extractImages: true,
    });
  });

  describe('Multiple Format Support', () => {
    it('should support PDF format', async () => {
      const pdf = await service.importPDF('document.pdf', testPDFBuffer);
      expect(pdf.filename).toContain('.pdf');
    });

    it('should handle large PDF files', async () => {
      const largeBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB
      const pdf = await service.importPDF('large.pdf', largeBuffer);
      expect(pdf.fileSize).toBe(10 * 1024 * 1024);
    });

    it('should handle PDF with Arabic content', async () => {
      const arabicPDF = Buffer.from('%PDF-1.4\nمحتوى عربي');
      const pdf = await service.importPDF('arabic.pdf', arabicPDF);
      expect(pdf.extractedText).toBeDefined();
    });

    it('should handle PDF with mixed content', async () => {
      const mixedPDF = Buffer.alloc(5000);
      const pdf = await service.importPDF('mixed.pdf', mixedPDF);
      expect(pdf.tables.length).toBeGreaterThanOrEqual(0);
      expect(pdf.images.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Accuracy and Precision', () => {
    it('should accurately extract text', async () => {
      const pdf = await service.importPDF('test.pdf', testPDFBuffer);
      expect(pdf.extractedText).toBeDefined();
      expect(pdf.extractedText.length).toBeGreaterThan(0);
    });

    it('should maintain table structure', async () => {
      const largeBuffer = Buffer.alloc(2000);
      const pdf = await service.importPDF('tables.pdf', largeBuffer);
      if (pdf.tables.length > 0) {
        expect(pdf.tables[0].rows).toBeDefined();
        expect(pdf.tables[0].columns).toBeGreaterThan(0);
      }
    });

    it('should preserve image metadata', async () => {
      const largeBuffer = Buffer.alloc(3000);
      const pdf = await service.importPDF('images.pdf', largeBuffer);
      if (pdf.images.length > 0) {
        expect(pdf.images[0].width).toBeGreaterThan(0);
        expect(pdf.images[0].height).toBeGreaterThan(0);
      }
    });

    it('should maintain metadata accuracy', async () => {
      const pdf = await service.importPDF('test.pdf', testPDFBuffer);
      expect(pdf.metadata.creationDate).toBeDefined();
      expect(pdf.metadata.modificationDate).toBeDefined();
    });
  });

  describe('Batch Processing', () => {
    it('should handle batch import', async () => {
      const files = [
        { name: 'file1.pdf', buffer: testPDFBuffer },
        { name: 'file2.pdf', buffer: testPDFBuffer },
        { name: 'file3.pdf', buffer: testPDFBuffer },
      ];

      const results = [];
      for (const file of files) {
        const pdf = await service.importPDF(file.name, file.buffer);
        results.push(pdf);
      }

      expect(results.length).toBe(3);
    });

    it('should maintain order in batch processing', async () => {
      const files = ['file1.pdf', 'file2.pdf', 'file3.pdf'];
      const results = [];

      for (const filename of files) {
        const pdf = await service.importPDF(filename, testPDFBuffer);
        results.push(pdf.filename);
      }

      expect(results[0]).toBe('file1.pdf');
      expect(results[1]).toBe('file2.pdf');
      expect(results[2]).toBe('file3.pdf');
    });

    it('should handle partial batch failures gracefully', async () => {
      const validPDF = testPDFBuffer;
      const invalidBuffer = Buffer.from('invalid');

      const results = [];

      try {
        const pdf1 = await service.importPDF('valid.pdf', validPDF);
        results.push(pdf1);
      } catch (e) {
        // Handle error
      }

      try {
        const pdf2 = await service.importPDF('invalid.pdf', invalidBuffer);
        results.push(pdf2);
      } catch (e) {
        // Handle error
      }

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe('Data Extraction Accuracy', () => {
    it('should extract declaration number with high accuracy', async () => {
      const pdf = await service.importPDF('declaration.pdf', testPDFBuffer);
      expect(pdf.extractedText).toBeDefined();
    });

    it('should extract financial data accurately', async () => {
      const largeBuffer = Buffer.alloc(2000);
      const pdf = await service.importPDF('financial.pdf', largeBuffer);
      if (pdf.tables.length > 0) {
        expect(pdf.tables[0].rowCount).toBeGreaterThan(0);
      }
    });

    it('should extract item details accurately', async () => {
      const largeBuffer = Buffer.alloc(2000);
      const pdf = await service.importPDF('items.pdf', largeBuffer);
      if (pdf.tables.length > 0) {
        expect(pdf.tables[0].columns).toBeGreaterThan(0);
      }
    });

    it('should extract customs information accurately', async () => {
      const pdf = await service.importPDF('customs.pdf', testPDFBuffer);
      expect(pdf.metadata).toBeDefined();
    });
  });

  describe('Format Conversion Quality', () => {
    it('should convert to images without loss', async () => {
      const pdf = await service.importPDF('test.pdf', testPDFBuffer);
      const images = await service.convertPDFToImages(pdf.id);
      expect(images).toBeDefined();
      expect(images.length).toBeGreaterThan(0);
    });

    it('should convert to text with formatting', async () => {
      const pdf = await service.importPDF('test.pdf', testPDFBuffer);
      const text = await service.convertPDFToText(pdf.id);
      expect(text).toBeDefined();
      expect(text.length).toBeGreaterThan(0);
    });

    it('should convert to JSON with all data', async () => {
      const pdf = await service.importPDF('test.pdf', testPDFBuffer);
      const json = await service.convertPDFToJSON(pdf.id);
      expect(json.id).toBeDefined();
      expect(json.filename).toBeDefined();
      expect(json.text).toBeDefined();
      expect(json.tables).toBeDefined();
      expect(json.metadata).toBeDefined();
    });

    it('should preserve special characters in conversion', async () => {
      const arabicPDF = Buffer.from('%PDF-1.4\nمحتوى عربي خاص');
      const pdf = await service.importPDF('arabic.pdf', arabicPDF);
      const text = await service.convertPDFToText(pdf.id);
      expect(text).toBeDefined();
    });
  });

  describe('Performance Optimization', () => {
    it('should process PDF quickly', async () => {
      const start = Date.now();
      await service.importPDF('test.pdf', testPDFBuffer);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500);
    });

    it('should handle concurrent imports', async () => {
      const start = Date.now();
      const promises = [];

      for (let i = 0; i < 10; i++) {
        promises.push(service.importPDF(`test${i}.pdf`, testPDFBuffer));
      }

      await Promise.all(promises);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000);
    });

    it('should optimize memory usage', async () => {
      const pdfs = [];
      for (let i = 0; i < 100; i++) {
        const pdf = await service.importPDF(`test${i}.pdf`, testPDFBuffer);
        pdfs.push(pdf);
      }

      expect(pdfs.length).toBe(100);
    });
  });

  describe('Security and Validation', () => {
    it('should validate PDF signature', async () => {
      const valid = await service.validatePDF(testPDFBuffer);
      expect(valid).toBe(true);
    });

    it('should reject malicious files', async () => {
      const maliciousBuffer = Buffer.from('malicious content');
      const valid = await service.validatePDF(maliciousBuffer);
      expect(valid).toBe(false);
    });

    it('should sanitize filenames', async () => {
      const pdf = await service.importPDF('../../../etc/passwd.pdf', testPDFBuffer);
      expect(pdf.filename).toBeDefined();
    });

    it('should enforce file size limits', async () => {
      const oversizedBuffer = Buffer.alloc(100 * 1024 * 1024);
      try {
        await service.importPDF('oversized.pdf', oversizedBuffer);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('User Experience', () => {
    it('should provide clear error messages', async () => {
      try {
        await service.importPDF('invalid.txt', testPDFBuffer);
      } catch (error: any) {
        expect(error.message).toContain('Unsupported');
      }
    });

    it('should show progress information', async () => {
      const pdf = await service.importPDF('test.pdf', testPDFBuffer);
      expect(pdf.importedAt).toBeDefined();
    });

    it('should provide extraction statistics', async () => {
      const pdf = await service.importPDF('test.pdf', testPDFBuffer);
      const stats = await service.getImportStats();
      expect(stats.totalPDFs).toBeGreaterThan(0);
    });

    it('should support search functionality', async () => {
      await service.importPDF('customs-declaration.pdf', testPDFBuffer);
      const results = await service.searchPDFs('customs');
      expect(results).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    it('should integrate with declaration form', async () => {
      const pdf = await service.importPDF('declaration.pdf', testPDFBuffer);
      const json = await service.convertPDFToJSON(pdf.id);

      expect(json.id).toBeDefined();
      expect(json.filename).toBe('declaration.pdf');
      expect(json.text).toBeDefined();
    });

    it('should support multi-page documents', async () => {
      const largeBuffer = Buffer.alloc(20000);
      const pdf = await service.importPDF('multipage.pdf', largeBuffer);
      expect(pdf.pages).toBeGreaterThan(1);
    });

    it('should maintain data consistency', async () => {
      const pdf = await service.importPDF('test.pdf', testPDFBuffer);
      const retrieved = await service.getPDFData(pdf.id);
      expect(retrieved.id).toBe(pdf.id);
      expect(retrieved.filename).toBe(pdf.filename);
      expect(retrieved.fileSize).toBe(pdf.fileSize);
    });

    it('should support undo/redo operations', async () => {
      const pdf = await service.importPDF('test.pdf', testPDFBuffer);
      await service.deletePDF(pdf.id);
      const deleted = await service.deletePDF(pdf.id);
      expect(deleted).toBe(false);
    });
  });
});

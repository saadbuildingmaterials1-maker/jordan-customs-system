/**
 * خدمة التصدير والتشفير المتقدمة
 * Export and Encryption Service
 */

import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';
import CryptoJS from 'crypto-js';
import { Buffer } from 'buffer';

/**
 * تصدير البيانات إلى PDF
 * Export data to PDF
 */
export async function exportToPDF(data: any, filename: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // إضافة العنوان
      doc.fontSize(20).text(filename, { align: 'center' });
      doc.moveDown();

      // إضافة البيانات
      if (Array.isArray(data)) {
        data.forEach((item, index) => {
          doc.fontSize(12).text(`العنصر ${index + 1}:`, { underline: true });
          Object.entries(item).forEach(([key, value]) => {
            doc.fontSize(10).text(`${key}: ${value}`);
          });
          doc.moveDown();
        });
      } else {
        Object.entries(data).forEach(([key, value]) => {
          doc.fontSize(11).text(`${key}: ${value}`);
        });
      }

      // إضافة التاريخ
      doc.moveDown();
      doc.fontSize(9).text(`تم الإنشاء في: ${new Date().toLocaleString('ar-JO')}`, {
        align: 'right',
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * تصدير البيانات إلى Excel
 * Export data to Excel
 */
export function exportToExcel(data: any[], filename: string): Buffer {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'البيانات');

    // تعيين عرض الأعمدة
    const maxWidth = 20;
    const colWidths = Object.keys(data[0] || {}).map(() => maxWidth);
    worksheet['!cols'] = colWidths.map((w) => ({ wch: w }));

    // إنشاء Buffer
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    return buffer as Buffer;
  } catch (error) {
    throw new Error(`فشل تصدير Excel: ${error}`);
  }
}

/**
 * تصدير البيانات إلى CSV
 * Export data to CSV
 */
export function exportToCSV(data: any[], filename: string): string {
  try {
    const headers = Object.keys(data[0] || {});
    const csv = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    return csv;
  } catch (error) {
    throw new Error(`فشل تصدير CSV: ${error}`);
  }
}

/**
 * تشفير البيانات
 * Encrypt data
 */
export function encryptData(data: string, secretKey: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString();
    return encrypted;
  } catch (error) {
    throw new Error(`فشل التشفير: ${error}`);
  }
}

/**
 * فك تشفير البيانات
 * Decrypt data
 */
export function decryptData(encryptedData: string, secretKey: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, secretKey).toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    throw new Error(`فشل فك التشفير: ${error}`);
  }
}

/**
 * إنشاء بصمة SHA256
 * Create SHA256 hash
 */
export function createHash(data: string): string {
  try {
    const hash = CryptoJS.SHA256(data).toString();
    return hash;
  } catch (error) {
    throw new Error(`فشل إنشاء البصمة: ${error}`);
  }
}

/**
 * التحقق من سلامة البيانات
 * Verify data integrity
 */
export function verifyDataIntegrity(data: string, hash: string): boolean {
  try {
    const calculatedHash = createHash(data);
    return calculatedHash === hash;
  } catch (error) {
    console.error('فشل التحقق من السلامة:', error);
    return false;
  }
}

/**
 * ضغط البيانات
 * Compress data
 */
export function compressData(data: string): string {
  try {
    return Buffer.from(data).toString('base64');
  } catch (error) {
    throw new Error(`فشل الضغط: ${error}`);
  }
}

/**
 * فك ضغط البيانات
 * Decompress data
 */
export function decompressData(compressedData: string): string {
  try {
    return Buffer.from(compressedData, 'base64').toString('utf-8');
  } catch (error) {
    throw new Error(`فشل فك الضغط: ${error}`);
  }
}

/**
 * إنشاء نسخة احتياطية مشفرة
 * Create encrypted backup
 */
export async function createEncryptedBackup(
  data: any,
  secretKey: string,
  filename: string
): Promise<{ encrypted: string; hash: string; timestamp: string }> {
  try {
    const dataString = JSON.stringify(data);
    const encrypted = encryptData(dataString, secretKey);
    const hash = createHash(encrypted);
    const timestamp = new Date().toISOString();

    return {
      encrypted,
      hash,
      timestamp,
    };
  } catch (error) {
    throw new Error(`فشل إنشاء النسخة الاحتياطية: ${error}`);
  }
}

/**
 * استعادة النسخة الاحتياطية المشفرة
 * Restore encrypted backup
 */
export async function restoreEncryptedBackup(
  backup: { encrypted: string; hash: string; timestamp: string },
  secretKey: string
): Promise<any> {
  try {
    // التحقق من السلامة
    const isValid = verifyDataIntegrity(backup.encrypted, backup.hash);
    if (!isValid) {
      throw new Error('فشل التحقق من سلامة النسخة الاحتياطية');
    }

    // فك التشفير
    const decrypted = decryptData(backup.encrypted, secretKey);
    const data = JSON.parse(decrypted);

    return data;
  } catch (error) {
    throw new Error(`فشل استعادة النسخة الاحتياطية: ${error}`);
  }
}

export default {
  exportToPDF,
  exportToExcel,
  exportToCSV,
  encryptData,
  decryptData,
  createHash,
  verifyDataIntegrity,
  compressData,
  decompressData,
  createEncryptedBackup,
  restoreEncryptedBackup,
};

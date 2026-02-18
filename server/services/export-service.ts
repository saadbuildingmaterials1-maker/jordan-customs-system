import { db } from '../db';
import { invoices, shipments, customsDeclarations } from '../../drizzle/schema';
import { paymentTransactions } from '../../drizzle/payment-schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import * as XLSX from 'xlsx';
import * as xml2js from 'xml2js';
import { createGzip } from 'zlib';
import { promisify } from 'util';
import { pipeline } from 'stream';

/**
 * خدمة التصدير المتقدمة
 * Advanced Export Service
 * تصدير البيانات بصيغ متعددة (CSV, JSON, XML) مع خيارات متقدمة
 */

export interface ExportOptions {
  userId: number;
  dataType: 'invoices' | 'payments' | 'shipments' | 'customs' | 'all';
  format: 'csv' | 'json' | 'xml' | 'excel';
  startDate?: Date;
  endDate?: Date;
  fields?: string[];
  includeMetadata?: boolean;
  compress?: boolean;
  delimiter?: string;
  encoding?: string;
}

export interface ExportResult {
  success: boolean;
  format: string;
  dataType: string;
  recordCount: number;
  fileSize: number;
  fileName: string;
  data: Buffer;
  mimeType: string;
}

// ==================== التصدير إلى CSV ====================

export async function exportToCSV(options: ExportOptions): Promise<ExportResult> {
  try {
    const data = await fetchData(options);
    const csv = convertToCSV(data, options.delimiter || ',', options.fields);

    let buffer = Buffer.from(csv, options.encoding || 'utf-8');

    if (options.compress) {
      buffer = await compressBuffer(buffer);
    }

    const fileName = `${options.dataType}_${new Date().getTime()}.${options.compress ? 'csv.gz' : 'csv'}`;

    return {
      success: true,
      format: 'csv',
      dataType: options.dataType,
      recordCount: data.length,
      fileSize: buffer.length,
      fileName,
      data: buffer,
      mimeType: options.compress ? 'application/gzip' : 'text/csv',
    };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
}

// ==================== التصدير إلى JSON ====================

export async function exportToJSON(options: ExportOptions): Promise<ExportResult> {
  try {
    const data = await fetchData(options);

    const exportData: any = {
      metadata: options.includeMetadata
        ? {
            exportDate: new Date().toISOString(),
            dataType: options.dataType,
            recordCount: data.length,
            startDate: options.startDate?.toISOString(),
            endDate: options.endDate?.toISOString(),
          }
        : undefined,
      data: options.fields ? filterFields(data, options.fields) : data,
    };

    // إزالة undefined
    if (!options.includeMetadata) {
      delete exportData.metadata;
    }

    const json = JSON.stringify(exportData, null, 2);
    let buffer = Buffer.from(json, options.encoding || 'utf-8');

    if (options.compress) {
      buffer = await compressBuffer(buffer);
    }

    const fileName = `${options.dataType}_${new Date().getTime()}.${options.compress ? 'json.gz' : 'json'}`;

    return {
      success: true,
      format: 'json',
      dataType: options.dataType,
      recordCount: data.length,
      fileSize: buffer.length,
      fileName,
      data: buffer,
      mimeType: options.compress ? 'application/gzip' : 'application/json',
    };
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw error;
  }
}

// ==================== التصدير إلى XML ====================

export async function exportToXML(options: ExportOptions): Promise<ExportResult> {
  try {
    const data = await fetchData(options);
    const builder = new xml2js.Builder({
      rootName: options.dataType,
      xmldec: { version: '1.0', encoding: options.encoding || 'UTF-8' },
    });

    const xmlData = {
      metadata: options.includeMetadata
        ? {
            exportDate: new Date().toISOString(),
            dataType: options.dataType,
            recordCount: data.length,
            startDate: options.startDate?.toISOString(),
            endDate: options.endDate?.toISOString(),
          }
        : undefined,
      records: {
        record: options.fields ? filterFields(data, options.fields) : data,
      },
    };

    // إزالة undefined
    if (!options.includeMetadata) {
      delete xmlData.metadata;
    }

    const xml = builder.buildObject(xmlData);
    let buffer = Buffer.from(xml, options.encoding || 'utf-8');

    if (options.compress) {
      buffer = await compressBuffer(buffer);
    }

    const fileName = `${options.dataType}_${new Date().getTime()}.${options.compress ? 'xml.gz' : 'xml'}`;

    return {
      success: true,
      format: 'xml',
      dataType: options.dataType,
      recordCount: data.length,
      fileSize: buffer.length,
      fileName,
      data: buffer,
      mimeType: options.compress ? 'application/gzip' : 'application/xml',
    };
  } catch (error) {
    console.error('Error exporting to XML:', error);
    throw error;
  }
}

// ==================== التصدير إلى Excel ====================

export async function exportToExcel(options: ExportOptions): Promise<ExportResult> {
  try {
    const data = await fetchData(options);
    const filteredData = options.fields ? filterFields(data, options.fields) : data;

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, options.dataType);

    // إضافة ورقة البيانات الوصفية إذا لزم الأمر
    if (options.includeMetadata) {
      const metadata = [
        { Key: 'تاريخ التصدير', Value: new Date().toLocaleString('ar-JO') },
        { Key: 'نوع البيانات', Value: options.dataType },
        { Key: 'عدد السجلات', Value: data.length },
        { Key: 'تاريخ البداية', Value: options.startDate?.toLocaleDateString('ar-JO') },
        { Key: 'تاريخ النهاية', Value: options.endDate?.toLocaleDateString('ar-JO') },
      ];

      const metadataSheet = XLSX.utils.json_to_sheet(metadata);
      XLSX.utils.book_append_sheet(workbook, metadataSheet, 'البيانات الوصفية');
    }

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    let buffer = excelBuffer as Buffer;

    if (options.compress) {
      buffer = await compressBuffer(buffer);
    }

    const fileName = `${options.dataType}_${new Date().getTime()}.${options.compress ? 'xlsx.gz' : 'xlsx'}`;

    return {
      success: true,
      format: 'excel',
      dataType: options.dataType,
      recordCount: data.length,
      fileSize: buffer.length,
      fileName,
      data: buffer,
      mimeType: options.compress ? 'application/gzip' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

// ==================== التصدير الشامل ====================

export async function exportData(options: ExportOptions): Promise<ExportResult> {
  try {
    switch (options.format) {
      case 'csv':
        return await exportToCSV(options);
      case 'json':
        return await exportToJSON(options);
      case 'xml':
        return await exportToXML(options);
      case 'excel':
        return await exportToExcel(options);
      default:
        throw new Error(`صيغة التصدير غير مدعومة: ${options.format}`);
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}

// ==================== دوال مساعدة ====================

async function fetchData(options: ExportOptions): Promise<any[]> {
  try {
    const filters: any[] = [eq(invoices.userId, options.userId) || eq(paymentTransactions.userId, options.userId)];

    if (options.startDate && options.endDate) {
      // يمكن إضافة فلاتر التاريخ هنا
    }

    let data: any[] = [];

    switch (options.dataType) {
      case 'invoices':
        data = await db.query.invoices.findMany({
          where: eq(invoices.userId, options.userId),
        });
        break;

      case 'payments':
        data = await db.query.paymentTransactions.findMany({
          where: eq(paymentTransactions.userId, options.userId),
        });
        break;

      case 'shipments':
        data = await db.query.shipments.findMany({
          where: eq(shipments.userId, options.userId),
        });
        break;

      case 'customs':
        data = await db.query.customsDeclarations.findMany({
          where: eq(customsDeclarations.userId, options.userId),
        });
        break;

      case 'all':
        const [invoicesList, paymentsList, shipmentsList, customsList] = await Promise.all([
          db.query.invoices.findMany({ where: eq(invoices.userId, options.userId) }),
          db.query.paymentTransactions.findMany({ where: eq(paymentTransactions.userId, options.userId) }),
          db.query.shipments.findMany({ where: eq(shipments.userId, options.userId) }),
          db.query.customsDeclarations.findMany({ where: eq(customsDeclarations.userId, options.userId) }),
        ]);

        data = {
          invoices: invoicesList,
          payments: paymentsList,
          shipments: shipmentsList,
          customs: customsList,
        } as any;
        break;
    }

    // تطبيق فلاتر التاريخ
    if (options.startDate && options.endDate && Array.isArray(data)) {
      data = data.filter((item) => {
        const itemDate = new Date(item.createdAt || item.transactionDate);
        return itemDate >= options.startDate! && itemDate <= options.endDate!;
      });
    }

    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

function convertToCSV(data: any[], delimiter: string = ',', fields?: string[]): string {
  if (data.length === 0) return '';

  // الحصول على رؤوس الأعمدة
  const headers = fields || Object.keys(data[0]);

  // إنشاء صف الرؤوس
  const headerRow = headers.map((h) => escapeCSVField(h)).join(delimiter);

  // إنشاء صفوف البيانات
  const rows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        return escapeCSVField(String(value || ''));
      })
      .join(delimiter)
  );

  return [headerRow, ...rows].join('\n');
}

function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function filterFields(data: any[], fields: string[]): any[] {
  return data.map((item) => {
    const filtered: any = {};
    fields.forEach((field) => {
      filtered[field] = item[field];
    });
    return filtered;
  });
}

async function compressBuffer(buffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const gzip = createGzip();
    const chunks: Buffer[] = [];

    gzip.on('data', (chunk) => chunks.push(chunk));
    gzip.on('end', () => resolve(Buffer.concat(chunks)));
    gzip.on('error', reject);

    gzip.write(buffer);
    gzip.end();
  });
}

// ==================== معالجة البيانات الكبيرة ====================

export async function exportLargeDataset(
  options: ExportOptions,
  chunkSize: number = 1000
): Promise<ExportResult> {
  try {
    const data = await fetchData(options);
    const chunks = [];

    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }

    // معالجة الأجزاء
    let processedData = [];
    for (const chunk of chunks) {
      processedData = processedData.concat(chunk);
    }

    // إعادة تعيين البيانات المعالجة
    options.dataType = options.dataType;

    return await exportData({
      ...options,
      dataType: options.dataType,
    });
  } catch (error) {
    console.error('Error exporting large dataset:', error);
    throw error;
  }
}

// ==================== إحصائيات التصدير ====================

export async function getExportStatistics(userId: number): Promise<{
  totalExports: number;
  lastExportDate: Date | null;
  mostUsedFormat: string;
  averageFileSize: number;
}> {
  try {
    // يمكن جلب الإحصائيات من قاعدة البيانات إذا كانت مسجلة
    return {
      totalExports: 0,
      lastExportDate: null,
      mostUsedFormat: 'json',
      averageFileSize: 0,
    };
  } catch (error) {
    console.error('Error getting export statistics:', error);
    throw error;
  }
}

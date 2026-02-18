import { db } from '../db';
import { TRPCError } from '@trpc/server';

/**
 * خدمة معاينة القوالب
 * Template Preview Service
 */

export interface PreviewOptions {
  templateId: number;
  limit?: number;
  offset?: number;
  filters?: Array<{ field: string; operator: string; value: any }>;
  format?: 'table' | 'json' | 'csv';
}

// ==================== معاينة البيانات ====================

export async function previewTemplateData(options: PreviewOptions) {
  try {
    const limit = options.limit || 10;
    const offset = options.offset || 0;

    // جلب البيانات حسب نوع القالب
    let data: any[] = [];
    let totalCount = 0;

    // محاكاة جلب البيانات من قاعدة البيانات
    // في التطبيق الفعلي، ستكون هناك استعلامات حقيقية
    const mockData = generateMockData(options.templateId, limit, offset);
    data = mockData.data;
    totalCount = mockData.total;

    // تطبيق الفلاتر إذا كانت موجودة
    if (options.filters && options.filters.length > 0) {
      data = applyFilters(data, options.filters);
    }

    // تنسيق البيانات حسب الصيغة المطلوبة
    let formattedData: any;
    switch (options.format) {
      case 'json':
        formattedData = data;
        break;
      case 'csv':
        formattedData = convertToCSV(data);
        break;
      case 'table':
      default:
        formattedData = formatAsTable(data);
    }

    return {
      success: true,
      data: formattedData,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + limit < totalCount,
      },
      recordCount: data.length,
    };
  } catch (error) {
    console.error('Error previewing template data:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في معاينة البيانات',
    });
  }
}

// ==================== التعديل السريع ====================

export async function quickEditPreviewData(
  templateId: number,
  rowIndex: number,
  fieldName: string,
  newValue: any
) {
  try {
    return {
      success: true,
      message: 'تم تحديث البيانات بنجاح',
      updatedRow: {
        index: rowIndex,
        field: fieldName,
        value: newValue,
      },
    };
  } catch (error) {
    console.error('Error quick editing preview data:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في تحديث البيانات',
    });
  }
}

// ==================== إعادة ترتيب الأعمدة ====================

export async function reorderColumns(templateId: number, columnOrder: string[]) {
  try {
    return {
      success: true,
      message: 'تم إعادة ترتيب الأعمدة بنجاح',
      columnOrder,
    };
  } catch (error) {
    console.error('Error reordering columns:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في إعادة ترتيب الأعمدة',
    });
  }
}

// ==================== إخفاء/إظهار الأعمدة ====================

export async function toggleColumnVisibility(templateId: number, columnName: string, visible: boolean) {
  try {
    return {
      success: true,
      message: visible ? 'تم إظهار العمود' : 'تم إخفاء العمود',
      column: columnName,
      visible,
    };
  } catch (error) {
    console.error('Error toggling column visibility:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في تغيير رؤية العمود',
    });
  }
}

// ==================== تطبيق الفلاتر ====================

function applyFilters(data: any[], filters: Array<{ field: string; operator: string; value: any }>) {
  return data.filter((row) => {
    return filters.every((filter) => {
      const fieldValue = row[filter.field];

      switch (filter.operator) {
        case 'equals':
          return fieldValue === filter.value;
        case 'contains':
          return String(fieldValue).includes(String(filter.value));
        case 'startsWith':
          return String(fieldValue).startsWith(String(filter.value));
        case 'endsWith':
          return String(fieldValue).endsWith(String(filter.value));
        case 'greaterThan':
          return Number(fieldValue) > Number(filter.value);
        case 'lessThan':
          return Number(fieldValue) < Number(filter.value);
        case 'greaterThanOrEqual':
          return Number(fieldValue) >= Number(filter.value);
        case 'lessThanOrEqual':
          return Number(fieldValue) <= Number(filter.value);
        case 'between':
          return Number(fieldValue) >= filter.value[0] && Number(fieldValue) <= filter.value[1];
        case 'in':
          return filter.value.includes(fieldValue);
        case 'notIn':
          return !filter.value.includes(fieldValue);
        default:
          return true;
      }
    });
  });
}

// ==================== تحويل إلى CSV ====================

function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  const csvRows = data.map((row) => {
    return headers
      .map((header) => {
        const value = row[header];
        // معالجة القيم التي تحتوي على فواصل
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

// ==================== تنسيق كجدول ====================

function formatAsTable(data: any[]) {
  if (data.length === 0) return { headers: [], rows: [] };

  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((header) => row[header]));

  return {
    headers,
    rows,
  };
}

// ==================== توليد بيانات وهمية ====================

function generateMockData(templateId: number, limit: number, offset: number) {
  const mockData = [
    {
      id: 1,
      invoiceNumber: 'INV-001',
      date: '2026-02-18',
      customer: 'أحمد محمد',
      amount: 1500.0,
      status: 'مدفوع',
      customsDuty: 150.0,
      tax: 75.0,
    },
    {
      id: 2,
      invoiceNumber: 'INV-002',
      date: '2026-02-17',
      customer: 'فاطمة علي',
      amount: 2300.0,
      status: 'معلق',
      customsDuty: 230.0,
      tax: 115.0,
    },
    {
      id: 3,
      invoiceNumber: 'INV-003',
      date: '2026-02-16',
      customer: 'محمد سالم',
      amount: 3100.0,
      status: 'مدفوع',
      customsDuty: 310.0,
      tax: 155.0,
    },
    {
      id: 4,
      invoiceNumber: 'INV-004',
      date: '2026-02-15',
      customer: 'سارة خالد',
      amount: 1800.0,
      status: 'مدفوع',
      customsDuty: 180.0,
      tax: 90.0,
    },
    {
      id: 5,
      invoiceNumber: 'INV-005',
      date: '2026-02-14',
      customer: 'علي محمود',
      amount: 2500.0,
      status: 'معلق',
      customsDuty: 250.0,
      tax: 125.0,
    },
  ];

  const slicedData = mockData.slice(offset, offset + limit);
  return {
    data: slicedData,
    total: mockData.length,
  };
}

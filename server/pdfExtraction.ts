import { logger } from './_core/logger-service';
/**
 * pdfExtraction
 * @module ./server/pdfExtraction
 */
import * as fs from 'fs';
import * as path from 'path';
import * as pdfParse from 'pdf-parse';

/**
 * واجهة لبيانات الفاتورة المستخرجة من PDF
 */
export interface ExtractedInvoiceData {
  invoiceNumber?: string;
  invoiceDate?: string;
  shippingCompany?: string;
  billOfLadingNumber?: string;
  containerNumber?: string;
  containerType?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  totalAmount?: number;
  currency?: string;
  items?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  rawText: string;
}

/**
 * استخراج النص من ملف PDF
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const pdfData = await (pdfParse as any).default(fileBuffer);
    return pdfData.text;
  } catch (error) {
    logger.error('Error extracting text from PDF:', error);
    throw new Error('فشل استخراج النص من ملف PDF');
  }
}

/**
 * استخراج البيانات من نص الفاتورة
 */
export function parseInvoiceText(text: string): ExtractedInvoiceData {
  const data: ExtractedInvoiceData = {
    rawText: text,
    items: [],
  };

  // استخراج رقم الفاتورة
  const invoiceMatch = text.match(/(?:Invoice|رقم الفاتورة)[:\s#]*([A-Z0-9\-]+)/i);
  if (invoiceMatch) {
    data.invoiceNumber = invoiceMatch[1];
  }

  // استخراج تاريخ الفاتورة
  const dateMatch = text.match(/(?:Date|التاريخ)[:\s]*(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i);
  if (dateMatch) {
    data.invoiceDate = dateMatch[1];
  }

  // استخراج رقم بوليصة الشحن
  const bolMatch = text.match(/(?:Bill of Lading|بوليصة الشحن)[:\s#]*([A-Z0-9\-]+)/i);
  if (bolMatch) {
    data.billOfLadingNumber = bolMatch[1];
  }

  // استخراج رقم الحاوية
  const containerMatch = text.match(/(?:Container|الحاوية)[:\s#]*([A-Z0-9]{11})/i);
  if (containerMatch) {
    data.containerNumber = containerMatch[1];
  }

  // استخراج نوع الحاوية
  const typeMatch = text.match(/(?:Type|النوع)[:\s]*(\d+ft)/i);
  if (typeMatch) {
    data.containerType = typeMatch[1];
  }

  // استخراج ميناء الشحن
  const portLoadMatch = text.match(/(?:Port of Loading|ميناء الشحن)[:\s]*([A-Za-z\s]+?)(?:\n|,|$)/i);
  if (portLoadMatch) {
    data.portOfLoading = portLoadMatch[1].trim();
  }

  // استخراج ميناء التفريغ
  const portDischargeMatch = text.match(/(?:Port of Discharge|ميناء التفريغ)[:\s]*([A-Za-z\s]+?)(?:\n|,|$)/i);
  if (portDischargeMatch) {
    data.portOfDischarge = portDischargeMatch[1].trim();
  }

  // استخراج المبلغ الإجمالي
  const amountMatch = text.match(/(?:Total|الإجمالي)[:\s]*([A-Z]{3})?[\s]*([0-9,]+\.?\d*)/i);
  if (amountMatch) {
    data.currency = amountMatch[1] || 'USD';
    data.totalAmount = parseFloat(amountMatch[2].replace(/,/g, ''));
  }

  // استخراج شركة الشحن
  const companyMatch = text.match(/(?:Shipping Company|شركة الشحن)[:\s]*([A-Za-z0-9\s&]+?)(?:\n|,|$)/i);
  if (companyMatch) {
    data.shippingCompany = companyMatch[1].trim();
  }

  return data;
}

/**
 * استخراج البيانات من ملف PDF كاملاً
 */
export async function extractInvoiceDataFromPDF(filePath: string): Promise<ExtractedInvoiceData> {
  try {
    const text = await extractTextFromPDF(filePath);
    return parseInvoiceText(text);
  } catch (error) {
    logger.error('Error extracting invoice data:', error);
    throw error;
  }
}

/**
 * التحقق من صحة البيانات المستخرجة
 */
export function validateExtractedData(data: ExtractedInvoiceData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.invoiceNumber) {
    errors.push('رقم الفاتورة مطلوب');
  }

  if (!data.billOfLadingNumber) {
    errors.push('رقم بوليصة الشحن مطلوب');
  }

  if (!data.containerNumber) {
    errors.push('رقم الحاوية مطلوب');
  }

  if (!data.portOfLoading) {
    errors.push('ميناء الشحن مطلوب');
  }

  if (!data.portOfDischarge) {
    errors.push('ميناء التفريغ مطلوب');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

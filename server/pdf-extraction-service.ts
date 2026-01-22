/**
 * PDF Extraction Service
 * استخراج البيانات من ملفات البيان الجمركي PDF
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ExtractedDeclarationData {
  // معلومات البيان الأساسية
  declarationNumber?: string;
  declarationDate?: string;
  clearanceCenter?: string;
  exchangeRate?: number;
  
  // معلومات المستورد
  importerName?: string;
  importerTaxNumber?: string;
  importerLicense?: string;
  
  // معلومات الشركة المصدرة
  exporterCompany?: string;
  exporterCountry?: string;
  
  // معلومات الشحنة
  containerNumber?: string;
  billOfLading?: string;
  shippingCompany?: string;
  
  // الأوزان والطرود
  grossWeight?: number;
  netWeight?: number;
  numberOfPackages?: number;
  packageType?: string;
  
  // الأصناف والبنود
  items?: ExtractedItem[];
  
  // الملخص المالي
  totalValue?: number;
  totalDuties?: number;
  totalTaxes?: number;
  totalCost?: number;
  
  // معلومات إضافية
  notes?: string;
  currency?: string;
  
  // حالة الاستخراج
  extractionSuccess: boolean;
  extractionErrors: string[];
  confidence: number; // 0-100
}

export interface ExtractedItem {
  itemNumber?: number;
  hsCode?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  totalPrice?: number;
  dutyRate?: number;
  taxRate?: number;
  currency?: string;
}

/**
 * استخراج البيانات من ملف PDF
 * يتم استخدام regex والتحليل النصي لاستخراج المعلومات
 */
export async function extractPdfData(filePath: string): Promise<ExtractedDeclarationData> {
  const result: ExtractedDeclarationData = {
    extractionSuccess: false,
    extractionErrors: [],
    confidence: 0,
    items: [],
  };

  try {
    // قراءة محتوى الملف
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    
    // استخراج معلومات البيان الأساسية
    extractBasicInfo(fileContent, result);
    
    // استخراج معلومات المستورد
    extractImporterInfo(fileContent, result);
    
    // استخراج معلومات الشركة المصدرة
    extractExporterInfo(fileContent, result);
    
    // استخراج معلومات الشحنة
    extractShippingInfo(fileContent, result);
    
    // استخراج الأوزان والطرود
    extractWeightInfo(fileContent, result);
    
    // استخراج الأصناف والبنود
    extractItems(fileContent, result);
    
    // استخراج الملخص المالي
    extractFinancialSummary(fileContent, result);
    
    // حساب درجة الثقة
    calculateConfidence(result);
    
    result.extractionSuccess = result.extractionErrors.length === 0;
    
  } catch (error) {
    result.extractionErrors.push(`خطأ في قراءة الملف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    result.extractionSuccess = false;
  }

  return result;
}

/**
 * استخراج معلومات البيان الأساسية
 */
function extractBasicInfo(content: string, result: ExtractedDeclarationData): void {
  // البحث عن رقم البيان
  const declarationMatch = content.match(/البيان\s*(?:رقم)?\s*[:=]?\s*(\d+\/\d+)/i);
  if (declarationMatch) {
    result.declarationNumber = declarationMatch[1];
  } else {
    result.extractionErrors.push('لم يتم العثور على رقم البيان');
  }

  // البحث عن التاريخ
  const dateMatch = content.match(/التاريخ\s*[:=]?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i);
  if (dateMatch) {
    result.declarationDate = dateMatch[1];
  }

  // البحث عن مركز التخليص
  const clearanceMatch = content.match(/مركز\s*التخليص\s*[:=]?\s*([^\n]+)/i);
  if (clearanceMatch) {
    result.clearanceCenter = clearanceMatch[1].trim();
  }

  // البحث عن سعر التعادل
  const exchangeMatch = content.match(/سعر\s*التعادل\s*[:=]?\s*([\d.]+)/i);
  if (exchangeMatch) {
    result.exchangeRate = parseFloat(exchangeMatch[1]);
  }
}

/**
 * استخراج معلومات المستورد
 */
function extractImporterInfo(content: string, result: ExtractedDeclarationData): void {
  // البحث عن اسم المستورد
  const importerMatch = content.match(/المستورد\s*[:=]?\s*([^\n]+)/i);
  if (importerMatch) {
    result.importerName = importerMatch[1].trim();
  }

  // البحث عن الرقم الضريبي
  const taxMatch = content.match(/الرقم\s*الضريبي\s*[:=]?\s*(\d+)/i);
  if (taxMatch) {
    result.importerTaxNumber = taxMatch[1];
  }

  // البحث عن رقم الترخيص
  const licenseMatch = content.match(/رقم\s*الترخيص\s*[:=]?\s*([^\n]+)/i);
  if (licenseMatch) {
    result.importerLicense = licenseMatch[1].trim();
  }
}

/**
 * استخراج معلومات الشركة المصدرة
 */
function extractExporterInfo(content: string, result: ExtractedDeclarationData): void {
  // البحث عن اسم الشركة المصدرة
  const exporterMatch = content.match(/الشركة\s*المصدرة\s*[:=]?\s*([^\n]+)/i);
  if (exporterMatch) {
    result.exporterCompany = exporterMatch[1].trim();
  }

  // البحث عن دولة التصدير
  const countryMatch = content.match(/دولة\s*التصدير\s*[:=]?\s*([^\n]+)/i);
  if (countryMatch) {
    result.exporterCountry = countryMatch[1].trim();
  }
}

/**
 * استخراج معلومات الشحنة
 */
function extractShippingInfo(content: string, result: ExtractedDeclarationData): void {
  // البحث عن رقم الحاوية
  const containerMatch = content.match(/رقم\s*الحاوية\s*[:=]?\s*([A-Z0-9]+)/i);
  if (containerMatch) {
    result.containerNumber = containerMatch[1];
  }

  // البحث عن بوليصة الشحن
  const bolMatch = content.match(/بوليصة\s*الشحن\s*[:=]?\s*([^\n]+)/i);
  if (bolMatch) {
    result.billOfLading = bolMatch[1].trim();
  }

  // البحث عن شركة الشحن
  const companyMatch = content.match(/شركة\s*الشحن\s*[:=]?\s*([^\n]+)/i);
  if (companyMatch) {
    result.shippingCompany = companyMatch[1].trim();
  }
}

/**
 * استخراج معلومات الأوزان والطرود
 */
function extractWeightInfo(content: string, result: ExtractedDeclarationData): void {
  // البحث عن الوزن القائم
  const grossMatch = content.match(/الوزن\s*القائم\s*[:=]?\s*([\d.]+)/i);
  if (grossMatch) {
    result.grossWeight = parseFloat(grossMatch[1]);
  }

  // البحث عن الوزن الصافي
  const netMatch = content.match(/الوزن\s*الصافي\s*[:=]?\s*([\d.]+)/i);
  if (netMatch) {
    result.netWeight = parseFloat(netMatch[1]);
  }

  // البحث عن عدد الطرود
  const packagesMatch = content.match(/عدد\s*الطرود\s*[:=]?\s*(\d+)/i);
  if (packagesMatch) {
    result.numberOfPackages = parseInt(packagesMatch[1]);
  }

  // البحث عن نوع الطرود
  const typeMatch = content.match(/نوع\s*الطرود\s*[:=]?\s*([^\n]+)/i);
  if (typeMatch) {
    result.packageType = typeMatch[1].trim();
  }
}

/**
 * استخراج الأصناف والبنود
 */
function extractItems(content: string, result: ExtractedDeclarationData): void {
  // البحث عن جدول الأصناف
  // هذا مثال بسيط - في الواقع قد تحتاج إلى معالجة أكثر تعقيداً
  const itemPattern = /(\d+)\s+([A-Z0-9]+)\s+([^\n]+?)\s+([\d.]+)\s+([\d.]+)/g;
  let match;

  while ((match = itemPattern.exec(content)) !== null) {
    const item: ExtractedItem = {
      itemNumber: parseInt(match[1]),
      hsCode: match[2],
      description: match[3].trim(),
      quantity: parseFloat(match[4]),
      totalPrice: parseFloat(match[5]),
    };
    result.items!.push(item);
  }

  if (result.items!.length === 0) {
    result.extractionErrors.push('لم يتم العثور على أصناف في الملف');
  }
}

/**
 * استخراج الملخص المالي
 */
function extractFinancialSummary(content: string, result: ExtractedDeclarationData): void {
  // البحث عن إجمالي القيمة
  const valueMatch = content.match(/إجمالي\s*القيمة\s*[:=]?\s*([\d.]+)/i);
  if (valueMatch) {
    result.totalValue = parseFloat(valueMatch[1]);
  }

  // البحث عن إجمالي الرسوم
  const dutiesMatch = content.match(/إجمالي\s*الرسوم\s*[:=]?\s*([\d.]+)/i);
  if (dutiesMatch) {
    result.totalDuties = parseFloat(dutiesMatch[1]);
  }

  // البحث عن إجمالي الضرائب
  const taxesMatch = content.match(/إجمالي\s*الضرائب\s*[:=]?\s*([\d.]+)/i);
  if (taxesMatch) {
    result.totalTaxes = parseFloat(taxesMatch[1]);
  }

  // البحث عن الإجمالي النهائي
  const totalMatch = content.match(/الإجمالي\s*النهائي\s*[:=]?\s*([\d.]+)/i);
  if (totalMatch) {
    result.totalCost = parseFloat(totalMatch[1]);
  }

  // البحث عن العملة
  const currencyMatch = content.match(/العملة\s*[:=]?\s*([A-Z]+)/i);
  if (currencyMatch) {
    result.currency = currencyMatch[1];
  }
}

/**
 * حساب درجة الثقة في البيانات المستخرجة
 */
function calculateConfidence(result: ExtractedDeclarationData): void {
  let extractedFields = 0;
  const totalFields = 15; // عدد الحقول الرئيسية

  if (result.declarationNumber) extractedFields++;
  if (result.declarationDate) extractedFields++;
  if (result.clearanceCenter) extractedFields++;
  if (result.exchangeRate) extractedFields++;
  if (result.importerName) extractedFields++;
  if (result.importerTaxNumber) extractedFields++;
  if (result.exporterCompany) extractedFields++;
  if (result.exporterCountry) extractedFields++;
  if (result.containerNumber) extractedFields++;
  if (result.billOfLading) extractedFields++;
  if (result.grossWeight) extractedFields++;
  if (result.netWeight) extractedFields++;
  if (result.numberOfPackages) extractedFields++;
  if (result.items && result.items.length > 0) extractedFields++;
  if (result.totalValue) extractedFields++;

  result.confidence = Math.round((extractedFields / totalFields) * 100);
}

/**
 * التحقق من صحة البيانات المستخرجة
 */
export function validateExtractedData(data: ExtractedDeclarationData): string[] {
  const errors: string[] = [];

  if (!data.declarationNumber) {
    errors.push('رقم البيان مفقود');
  }

  if (!data.importerName) {
    errors.push('اسم المستورد مفقود');
  }

  if (!data.items || data.items.length === 0) {
    errors.push('لا توجد أصناف في البيان');
  }

  if (data.exchangeRate && data.exchangeRate <= 0) {
    errors.push('سعر التعادل غير صحيح');
  }

  if (data.grossWeight && data.netWeight && data.grossWeight < data.netWeight) {
    errors.push('الوزن القائم أقل من الوزن الصافي');
  }

  return errors;
}

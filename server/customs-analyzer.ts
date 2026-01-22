/**
 * خدمة تحليل البيانات الجمركية
 * تقوم بتحليل بيانات البيان الجمركي وتوزيع القيم والرسوم
 */

export interface CustomsDeclarationData {
  // معلومات البيان الأساسية
  declarationNumber: string;
  declarationDate: string;
  clearanceCenter: string;
  
  // معلومات المستورد
  importerName: string;
  importerTaxNumber: string;
  
  // معلومات الشركة المصدرة
  exporterCompany: string;
  exporterCountry: string;
  
  // معلومات الشحنة
  containerNumber: string;
  billOfLadingNumber: string;
  shippingCompany: string;
  
  // الأصناف والبنود
  items: CustomsItem[];
  
  // الملخص المالي
  financialSummary: FinancialSummary;
  
  // توزيع القيم
  distribution: ValueDistribution;
}

export interface CustomsItem {
  itemNumber: number;
  hsCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  currency: 'USD' | 'EGP' | 'JOD';
  tariffBand: string;
  customsDutyRate: number;
  customsDutyAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  percentageOfTotal: number;
}

export interface FinancialSummary {
  totalGoodsValue: number;
  shippingCost: number;
  insurance: number;
  customsDuty: number;
  tax: number;
  additionalFees: number;
  totalAmount: number;
  currency: 'USD' | 'EGP' | 'JOD';
}

export interface ValueDistribution {
  items: DistributedItem[];
  totalDistributed: number;
  currency: 'USD' | 'EGP' | 'JOD';
}

export interface DistributedItem {
  itemNumber: number;
  hsCode: string;
  description: string;
  quantity: number;
  unit: string;
  
  // القيم الأصلية
  originalUnitPrice: number;
  originalTotalPrice: number;
  
  // توزيع الرسوم والضرائب
  allocatedShippingCost: number;
  allocatedInsurance: number;
  allocatedCustomsDuty: number;
  allocatedTax: number;
  allocatedAdditionalFees: number;
  
  // السعر النهائي
  finalUnitPrice: number;
  finalTotalPrice: number;
  
  // معلومات إضافية
  percentageOfTotal: number;
  currency: 'USD' | 'EGP' | 'JOD';
}

/**
 * تحليل البيان الجمركي وتوزيع القيم
 */
export function analyzeCustomsDeclaration(
  declaration: any
): CustomsDeclarationData {
  // استخراج المعلومات الأساسية
  const basicInfo = extractBasicInfo(declaration);
  
  // استخراج الأصناف
  const items = extractItems(declaration);
  
  // استخراج الملخص المالي
  const financialSummary = extractFinancialSummary(declaration);
  
  // توزيع القيم والرسوم
  const distribution = distributeValues(items, financialSummary);
  
  return {
    ...basicInfo,
    items,
    financialSummary,
    distribution,
  };
}

/**
 * استخراج المعلومات الأساسية
 */
function extractBasicInfo(declaration: any) {
  return {
    declarationNumber: declaration.declarationNumber || '',
    declarationDate: declaration.declarationDate || '',
    clearanceCenter: declaration.clearanceCenter || '',
    importerName: declaration.importerName || '',
    importerTaxNumber: declaration.importerTaxNumber || '',
    exporterCompany: declaration.exporterCompany || '',
    exporterCountry: declaration.exporterCountry || '',
    containerNumber: declaration.containerNumber || '',
    billOfLadingNumber: declaration.billOfLadingNumber || '',
    shippingCompany: declaration.shippingCompany || '',
  };
}

/**
 * استخراج الأصناف
 */
function extractItems(declaration: any): CustomsItem[] {
  const items = declaration.items || [];
  
  return items.map((item: any, index: number) => ({
    itemNumber: index + 1,
    hsCode: item.hsCode || '',
    description: item.description || '',
    quantity: item.quantity || 0,
    unit: item.unit || 'UNIT',
    unitPrice: item.unitPrice || 0,
    totalPrice: (item.quantity || 0) * (item.unitPrice || 0),
    currency: item.currency || 'JOD',
    tariffBand: item.tariffBand || '',
    customsDutyRate: item.customsDutyRate || 0.05,
    customsDutyAmount: 0,
    taxRate: item.taxRate || 0.16,
    taxAmount: 0,
    totalAmount: 0,
    percentageOfTotal: 0,
  }));
}

/**
 * استخراج الملخص المالي
 */
function extractFinancialSummary(declaration: any): FinancialSummary {
  const summary = declaration.financialSummary || {};
  
  return {
    totalGoodsValue: summary.totalGoodsValue || 0,
    shippingCost: summary.shippingCost || 0,
    insurance: summary.insurance || 0,
    customsDuty: summary.customsDuty || 0,
    tax: summary.tax || 0,
    additionalFees: summary.additionalFees || 0,
    totalAmount: summary.totalAmount || 0,
    currency: summary.currency || 'JOD',
  };
}

/**
 * توزيع القيم والرسوم على الأصناف
 */
export function distributeValues(
  items: CustomsItem[],
  financialSummary: FinancialSummary
): ValueDistribution {
  // حساب إجمالي قيمة البضاعة
  const totalGoodsValue = items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  if (totalGoodsValue === 0) {
    return {
      items: [],
      totalDistributed: 0,
      currency: financialSummary.currency,
    };
  }
  
  // توزيع القيم على كل صنف
  const distributedItems: DistributedItem[] = items.map((item) => {
    // نسبة هذا الصنف من إجمالي القيمة
    const percentage = item.totalPrice / totalGoodsValue;
    
    // توزيع الرسوم والضرائب
    const allocatedShippingCost = financialSummary.shippingCost * percentage;
    const allocatedInsurance = financialSummary.insurance * percentage;
    const allocatedCustomsDuty = financialSummary.customsDuty * percentage;
    const allocatedTax = financialSummary.tax * percentage;
    const allocatedAdditionalFees = financialSummary.additionalFees * percentage;
    
    // السعر النهائي
    const finalTotalPrice =
      item.totalPrice +
      allocatedShippingCost +
      allocatedInsurance +
      allocatedCustomsDuty +
      allocatedTax +
      allocatedAdditionalFees;
    
    const finalUnitPrice = item.quantity > 0 ? finalTotalPrice / item.quantity : 0;
    
    return {
      itemNumber: item.itemNumber,
      hsCode: item.hsCode,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      
      originalUnitPrice: item.unitPrice,
      originalTotalPrice: item.totalPrice,
      
      allocatedShippingCost,
      allocatedInsurance,
      allocatedCustomsDuty,
      allocatedTax,
      allocatedAdditionalFees,
      
      finalUnitPrice,
      finalTotalPrice,
      
      percentageOfTotal: percentage * 100,
      currency: item.currency,
    };
  });
  
  // حساب إجمالي القيم الموزعة
  const totalDistributed = distributedItems.reduce(
    (sum, item) => sum + item.finalTotalPrice,
    0
  );
  
  return {
    items: distributedItems,
    totalDistributed,
    currency: financialSummary.currency,
  };
}

/**
 * تحويل العملات
 */
export function convertCurrency(
  amount: number,
  fromCurrency: 'USD' | 'EGP' | 'JOD',
  toCurrency: 'USD' | 'EGP' | 'JOD',
  exchangeRates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // تحويل إلى USD أولاً
  let amountInUSD = amount;
  
  if (fromCurrency === 'EGP') {
    amountInUSD = amount / exchangeRates.EGP_TO_USD;
  } else if (fromCurrency === 'JOD') {
    amountInUSD = amount / exchangeRates.JOD_TO_USD;
  }
  
  // تحويل من USD إلى العملة المطلوبة
  if (toCurrency === 'EGP') {
    return amountInUSD * exchangeRates.EGP_TO_USD;
  } else if (toCurrency === 'JOD') {
    return amountInUSD * exchangeRates.JOD_TO_USD;
  }
  
  return amountInUSD;
}

export interface ExchangeRates {
  USD_TO_USD: number; // 1
  EGP_TO_USD: number; // 0.0225
  JOD_TO_USD: number; // 1.41
  USD_TO_EGP: number; // 44.44
  USD_TO_JOD: number; // 0.708
  EGP_TO_JOD: number; // 0.0159
  JOD_TO_EGP: number; // 62.89
}

/**
 * أسعار الصرف الافتراضية
 */
export const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  USD_TO_USD: 1,
  EGP_TO_USD: 0.0225,
  JOD_TO_USD: 1.41,
  USD_TO_EGP: 44.44,
  USD_TO_JOD: 0.708,
  EGP_TO_JOD: 0.0159,
  JOD_TO_EGP: 62.89,
};

/**
 * حساب الرسوم الجمركية
 */
export function calculateCustomsDuty(
  goodsValue: number,
  dutyRate: number
): number {
  return goodsValue * dutyRate;
}

/**
 * حساب الضريبة
 */
export function calculateTax(
  baseAmount: number,
  taxRate: number
): number {
  return baseAmount * taxRate;
}

/**
 * حساب التكلفة الإجمالية
 */
export function calculateTotalCost(
  goodsValue: number,
  shippingCost: number,
  insurance: number,
  dutyRate: number,
  taxRate: number,
  additionalFees: number = 0
): number {
  const duty = calculateCustomsDuty(goodsValue, dutyRate);
  const taxBase = goodsValue + shippingCost + insurance + duty + additionalFees;
  const tax = calculateTax(taxBase, taxRate);
  
  return taxBase + tax;
}

/**
 * Calculation Utilities
 * 
 * دوال حسابية مشتركة
 * 
 * @module shared/calculations
 */
import { SALES_TAX_RATE, DECIMAL_PLACES } from "./constants";

/**
 * دالة تقريب الأرقام إلى عدد محدد من المنازل العشرية
 */
export function roundToDecimals(num: number, decimals: number = DECIMAL_PLACES): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/**
 * حساب قيمة البضاعة بالدينار الأردني
 */
export function calculateFobValueJod(
  fobValueForeign: number,
  exchangeRate: number
): number {
  return roundToDecimals(fobValueForeign * exchangeRate);
}

/**
 * حساب إجمالي قيمة الشحن والتأمين
 */
export function calculateFreightAndInsurance(
  freightCost: number,
  insuranceCost: number
): number {
  return roundToDecimals(freightCost + insuranceCost);
}

/**
 * حساب القيمة الخاضعة للضريبة (FOB + Freight + Insurance)
 */
export function calculateTaxableValue(
  fobValueJod: number,
  freightAndInsurance: number
): number {
  return roundToDecimals(fobValueJod + freightAndInsurance);
}

/**
 * حساب الرسوم الجمركية (عادة نسبة من القيمة الخاضعة للضريبة)
 */
export function calculateCustomsDutyIfNeeded(
  taxableValue: number,
  customsDutyRate: number = 0.05
): number {
  return roundToDecimals(taxableValue * customsDutyRate);
}

/**
 * حساب ضريبة المبيعات 16% (على القيمة الخاضعة + الرسوم الجمركية)
 */
export function calculateSalesTax(
  taxableValue: number,
  customsDuty: number,
  taxRate: number = SALES_TAX_RATE
): number {
  const baseForTax = roundToDecimals(taxableValue + customsDuty);
  return roundToDecimals(baseForTax * taxRate);
}

/**
 * حساب إجمالي الرسوم والضرائب الجمركية
 */
export function calculateTotalCustomsAndTaxes(
  customsDuty: number,
  salesTax: number,
  additionalFees: number = 0,
  customsServiceFee: number = 0,
  penalties: number = 0
): number {
  return roundToDecimals(
    customsDuty + salesTax + additionalFees + customsServiceFee + penalties
  );
}

/**
 * حساب التكلفة الكلية النهائية للشحنة (Landed Cost)
 */
export function calculateTotalLandedCost(
  fobValueJod: number,
  freightAndInsurance: number,
  totalCustomsAndTaxes: number
): number {
  return roundToDecimals(fobValueJod + freightAndInsurance + totalCustomsAndTaxes);
}

/**
 * حساب نسبة المصاريف الإضافية من إجمالي القيمة
 */
export function calculateAdditionalExpensesRatio(
  totalCustomsAndTaxes: number,
  fobValueJod: number
): number {
  if (fobValueJod === 0) return 0;
  const ratio = (totalCustomsAndTaxes / fobValueJod) * 100;
  return roundToDecimals(ratio, 2);
}

/**
 * حساب نسبة قيمة الصنف من إجمالي الشحنة
 */
export function calculateItemValuePercentage(
  itemValue: number,
  totalFobValue: number
): number {
  if (totalFobValue === 0) return 0;
  const percentage = (itemValue / totalFobValue) * 100;
  return roundToDecimals(percentage, 2);
}

/**
 * حساب حصة الصنف من المصاريف الإضافية
 */
export function calculateItemExpensesShare(
  itemValuePercentage: number,
  totalCustomsAndTaxes: number
): number {
  const share = (itemValuePercentage / 100) * totalCustomsAndTaxes;
  return roundToDecimals(share);
}

/**
 * حساب إجمالي تكلفة الصنف واصل (Landed Cost للصنف)
 */
export function calculateItemTotalCost(
  itemFobValueJod: number,
  itemExpensesShare: number
): number {
  return roundToDecimals(itemFobValueJod + itemExpensesShare);
}

/**
 * حساب تكلفة الوحدة الواحدة من الصنف
 */
export function calculateUnitCost(
  itemTotalCost: number,
  quantity: number
): number {
  if (quantity === 0) return 0;
  return roundToDecimals(itemTotalCost / quantity);
}

/**
 * حساب الانحراف (Variance) بين القيمة الفعلية والتقديرية
 */
export function calculateVariance(
  actualValue: number,
  estimatedValue: number
): number {
  return roundToDecimals(actualValue - estimatedValue);
}

/**
 * حساب نسبة الانحراف المئوية
 */
export function calculateVariancePercentage(
  variance: number,
  estimatedValue: number
): number {
  if (estimatedValue === 0) return 0;
  const percentage = (variance / estimatedValue) * 100;
  return roundToDecimals(percentage, 2);
}

/**
 * دالة شاملة لحساب جميع التكاليف
 */
export interface CalculationInputs {
  fobValueForeign: number;
  exchangeRate: number;
  freightCost: number;
  insuranceCost: number;
  customsDuty: number;
  additionalFees?: number;
  customsServiceFee?: number;
  penalties?: number;
}

export interface CalculationResults {
  fobValueJod: number;
  freightAndInsurance: number;
  taxableValue: number;
  salesTax: number;
  totalCustomsAndTaxes: number;
  totalLandedCost: number;
  additionalExpensesRatio: number;
}

export function calculateAllCosts(inputs: CalculationInputs): CalculationResults {
  const {
    fobValueForeign,
    exchangeRate,
    freightCost,
    insuranceCost,
    customsDuty,
    additionalFees = 0,
    customsServiceFee = 0,
    penalties = 0,
  } = inputs;

  const fobValueJod = calculateFobValueJod(fobValueForeign, exchangeRate);
  const freightAndInsurance = calculateFreightAndInsurance(freightCost, insuranceCost);
  const taxableValue = calculateTaxableValue(fobValueJod, freightAndInsurance);
  const salesTax = calculateSalesTax(taxableValue, customsDuty);
  const totalCustomsAndTaxes = calculateTotalCustomsAndTaxes(
    customsDuty,
    salesTax,
    additionalFees,
    customsServiceFee,
    penalties
  );
  const totalLandedCost = calculateTotalLandedCost(
    fobValueJod,
    freightAndInsurance,
    totalCustomsAndTaxes
  );
  const additionalExpensesRatio = calculateAdditionalExpensesRatio(
    totalCustomsAndTaxes,
    fobValueJod
  );

  return {
    fobValueJod,
    freightAndInsurance,
    taxableValue,
    salesTax,
    totalCustomsAndTaxes,
    totalLandedCost,
    additionalExpensesRatio,
  };
}

/**
 * دالة شاملة لحساب تكاليف الصنف
 */
export interface ItemCalculationInputs {
  itemFobValueForeign: number;
  exchangeRate: number;
  quantity: number;
  totalFobValueJod: number;
  totalCustomsAndTaxes: number;
}

export interface ItemCalculationResults {
  itemFobValueJod: number;
  itemValuePercentage: number;
  itemExpensesShare: number;
  itemTotalCost: number;
  unitCost: number;
}

export function calculateItemCosts(inputs: ItemCalculationInputs): ItemCalculationResults {
  const {
    itemFobValueForeign,
    exchangeRate,
    quantity,
    totalFobValueJod,
    totalCustomsAndTaxes,
  } = inputs;

  const itemFobValueJod = calculateFobValueJod(itemFobValueForeign, exchangeRate);
  const itemValuePercentage = calculateItemValuePercentage(itemFobValueJod, totalFobValueJod);
  const itemExpensesShare = calculateItemExpensesShare(itemValuePercentage, totalCustomsAndTaxes);
  const itemTotalCost = calculateItemTotalCost(itemFobValueJod, itemExpensesShare);
  const unitCost = calculateUnitCost(itemTotalCost, quantity);

  return {
    itemFobValueJod,
    itemValuePercentage,
    itemExpensesShare,
    itemTotalCost,
    unitCost,
  };
}

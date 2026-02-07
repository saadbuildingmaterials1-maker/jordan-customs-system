/**
 * value-distribution Service
 * خدمة
 * @module ./server/services/value-distribution
 */
// خدمة توزيع القيم والرسوم المحاسبية

/**
 * حساب نسبة كل صنف من إجمالي القيمة
 */
export function calculateItemValuePercentage(
  itemValue: number,
  totalValue: number
): number {
  if (totalValue === 0) return 0;
  return (itemValue / totalValue) * 100;
}

/**
 * توزيع الرسوم الجمركية على الأصناف حسب النسبة المئوية
 */
export function distributeCustomsDuties(
  items: Array<{ id: number; totalPrice: number }>,
  totalDuties: number,
  totalValue: number
): Array<{ itemId: number; distributedDuties: number }> {
  return items.map(item => {
    const percentage = calculateItemValuePercentage(item.totalPrice, totalValue);
    const distributedDuties = (totalDuties * percentage) / 100;
    return {
      itemId: item.id,
      distributedDuties,
    };
  });
}

/**
 * توزيع الضرائب على الأصناف حسب النسبة المئوية
 */
export function distributeTaxes(
  items: Array<{ id: number; totalPrice: number }>,
  totalTaxes: number,
  totalValue: number
): Array<{ itemId: number; distributedTaxes: number }> {
  return items.map(item => {
    const percentage = calculateItemValuePercentage(item.totalPrice, totalValue);
    const distributedTaxes = (totalTaxes * percentage) / 100;
    return {
      itemId: item.id,
      distributedTaxes,
    };
  });
}

/**
 * توزيع المصاريف الإضافية على الأصناف
 */
export function distributeAdditionalExpenses(
  items: Array<{ id: number; totalPrice: number }>,
  additionalExpenses: number,
  totalValue: number
): Array<{ itemId: number; distributedExpenses: number }> {
  return items.map(item => {
    const percentage = calculateItemValuePercentage(item.totalPrice, totalValue);
    const distributedExpenses = (additionalExpenses * percentage) / 100;
    return {
      itemId: item.id,
      distributedExpenses,
    };
  });
}

/**
 * حساب السعر النهائي لكل صنف (Landed Cost)
 */
export interface ItemLandedCost {
  itemId: number;
  originalPrice: number;
  distributedDuties: number;
  distributedTaxes: number;
  distributedExpenses: number;
  landedCost: number;
  landedCostPerUnit: number;
  quantity: number;
}

export function calculateLandedCost(
  items: Array<{
    id: number;
    totalPrice: number;
    quantity: number;
    unitPrice: number;
  }>,
  distributedDuties: Array<{ itemId: number; distributedDuties: number }>,
  distributedTaxes: Array<{ itemId: number; distributedTaxes: number }>,
  distributedExpenses: Array<{ itemId: number; distributedExpenses: number }>
): ItemLandedCost[] {
  return items.map(item => {
    const duties = distributedDuties.find(d => d.itemId === item.id)?.distributedDuties || 0;
    const taxes = distributedTaxes.find(t => t.itemId === item.id)?.distributedTaxes || 0;
    const expenses = distributedExpenses.find(e => e.itemId === item.id)?.distributedExpenses || 0;

    const landedCost = item.totalPrice + duties + taxes + expenses;
    const landedCostPerUnit = item.quantity > 0 ? landedCost / item.quantity : 0;

    return {
      itemId: item.id,
      originalPrice: item.totalPrice,
      distributedDuties: duties,
      distributedTaxes: taxes,
      distributedExpenses: expenses,
      landedCost,
      landedCostPerUnit,
      quantity: item.quantity,
    };
  });
}

/**
 * حساب ملخص التوزيع الكامل
 */
export interface DistributionSummary {
  totalOriginalValue: number;
  totalDistributedDuties: number;
  totalDistributedTaxes: number;
  totalDistributedExpenses: number;
  totalLandedCost: number;
  averageLandedCostPerUnit: number;
  itemCount: number;
  totalQuantity: number;
}

export function calculateDistributionSummary(
  items: ItemLandedCost[]
): DistributionSummary {
  const totalOriginalValue = items.reduce((sum, item) => sum + item.originalPrice, 0);
  const totalDistributedDuties = items.reduce((sum, item) => sum + item.distributedDuties, 0);
  const totalDistributedTaxes = items.reduce((sum, item) => sum + item.distributedTaxes, 0);
  const totalDistributedExpenses = items.reduce((sum, item) => sum + item.distributedExpenses, 0);
  const totalLandedCost = items.reduce((sum, item) => sum + item.landedCost, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    totalOriginalValue,
    totalDistributedDuties,
    totalDistributedTaxes,
    totalDistributedExpenses,
    totalLandedCost,
    averageLandedCostPerUnit: totalQuantity > 0 ? totalLandedCost / totalQuantity : 0,
    itemCount: items.length,
    totalQuantity,
  };
}

/**
 * تحويل العملات
 */
export const exchangeRates = {
  USD: 0.71,
  EGP: 0.023,
  JOD: 1.0, // العملة الأساسية
};

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string = 'JOD'
): number {
  const fromRate = (exchangeRates as any)[fromCurrency] || 1;
  const toRate = (exchangeRates as any)[toCurrency] || 1;
  return (amount / fromRate) * toRate;
}

/**
 * حساب التوزيع الكامل مع تحويل العملات
 */
export interface CompleteDistribution {
  items: ItemLandedCost[];
  summary: DistributionSummary;
  timestamp: Date;
}

export function calculateCompleteDistribution(
  items: Array<{
    id: number;
    totalPrice: number;
    quantity: number;
    unitPrice: number;
    currency: string;
  }>,
  totalDuties: number,
  totalTaxes: number,
  totalExpenses: number,
  dutyPercentage: number = 0,
  taxPercentage: number = 16,
  expensePercentage: number = 0
): CompleteDistribution {
  // تحويل جميع الأسعار إلى الدينار الأردني
  const convertedItems = items.map(item => ({
    ...item,
    totalPrice: convertCurrency(item.totalPrice, item.currency),
    unitPrice: convertCurrency(item.unitPrice, item.currency),
  }));

  const totalValue = convertedItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // حساب الرسوم والضرائب والمصاريف إذا كانت نسبة مئوية
  const calculatedDuties = dutyPercentage > 0 ? (totalValue * dutyPercentage) / 100 : totalDuties;
  const calculatedTaxes = taxPercentage > 0 ? (totalValue * taxPercentage) / 100 : totalTaxes;
  const calculatedExpenses = expensePercentage > 0 ? (totalValue * expensePercentage) / 100 : totalExpenses;

  // توزيع الرسوم والضرائب والمصاريف
  const distributedDuties = distributeCustomsDuties(convertedItems, calculatedDuties, totalValue);
  const distributedTaxes = distributeTaxes(convertedItems, calculatedTaxes, totalValue);
  const distributedExpenses = distributeAdditionalExpenses(convertedItems, calculatedExpenses, totalValue);

  // حساب السعر النهائي لكل صنف
  const itemsWithLandedCost = calculateLandedCost(
    convertedItems,
    distributedDuties,
    distributedTaxes,
    distributedExpenses
  );

  // حساب الملخص
  const summary = calculateDistributionSummary(itemsWithLandedCost);

  return {
    items: itemsWithLandedCost,
    summary,
    timestamp: new Date(),
  };
}

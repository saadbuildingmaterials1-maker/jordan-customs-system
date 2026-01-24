/**
 * خدمة توزيع الرسوم الجمركية على الأصناف
 * Distribution of Customs Duties to Items
 */

interface Item {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface DutyDistribution {
  itemId: number;
  itemName: string;
  customsDuty: number;
  salesTax: number;
  additionalFees: number;
  totalCharges: number;
  perUnitCost: number;
}

/**
 * توزيع الرسوم الجمركية على الأصناف بناءً على القيمة
 */
export async function distributeDutiesByValue(
  items: Item[],
  totalCustomsDuty: number,
  totalSalesTax: number,
  totalAdditionalFees: number
): Promise<DutyDistribution[]> {
  // حساب إجمالي القيمة
  const totalValue = items.reduce((sum, item) => sum + item.totalPrice, 0);

  if (totalValue === 0) {
    throw new Error('إجمالي القيمة لا يمكن أن يكون صفراً');
  }

  // توزيع الرسوم بناءً على نسبة كل صنف من الإجمالي
  return items.map((item) => {
    const valueRatio = item.totalPrice / totalValue;

    const itemCustomsDuty = totalCustomsDuty * valueRatio;
    const itemSalesTax = totalSalesTax * valueRatio;
    const itemAdditionalFees = totalAdditionalFees * valueRatio;
    const itemTotalCharges = itemCustomsDuty + itemSalesTax + itemAdditionalFees;

    const perUnitCost = item.quantity > 0 ? itemTotalCharges / item.quantity : 0;

    return {
      itemId: item.id,
      itemName: item.name,
      customsDuty: Math.round(itemCustomsDuty * 100) / 100,
      salesTax: Math.round(itemSalesTax * 100) / 100,
      additionalFees: Math.round(itemAdditionalFees * 100) / 100,
      totalCharges: Math.round(itemTotalCharges * 100) / 100,
      perUnitCost: Math.round(perUnitCost * 100) / 100,
    };
  });
}

/**
 * توزيع الرسوم الجمركية على الأصناف بناءً على الوزن
 */
export async function distributeDutiesByWeight(
  items: Item[],
  itemWeights: Record<number, number>, // itemId -> weight
  totalCustomsDuty: number,
  totalSalesTax: number,
  totalAdditionalFees: number
): Promise<DutyDistribution[]> {
  // حساب إجمالي الوزن
  const totalWeight = Object.values(itemWeights).reduce((sum, w) => sum + w, 0);

  if (totalWeight === 0) {
    throw new Error('إجمالي الوزن لا يمكن أن يكون صفراً');
  }

  // توزيع الرسوم بناءً على نسبة وزن كل صنف
  return items.map((item) => {
    const itemWeight = itemWeights[item.id] || 0;
    const weightRatio = itemWeight / totalWeight;

    const itemCustomsDuty = totalCustomsDuty * weightRatio;
    const itemSalesTax = totalSalesTax * weightRatio;
    const itemAdditionalFees = totalAdditionalFees * weightRatio;
    const itemTotalCharges = itemCustomsDuty + itemSalesTax + itemAdditionalFees;

    const perUnitCost = item.quantity > 0 ? itemTotalCharges / item.quantity : 0;

    return {
      itemId: item.id,
      itemName: item.name,
      customsDuty: Math.round(itemCustomsDuty * 100) / 100,
      salesTax: Math.round(itemSalesTax * 100) / 100,
      additionalFees: Math.round(itemAdditionalFees * 100) / 100,
      totalCharges: Math.round(itemTotalCharges * 100) / 100,
      perUnitCost: Math.round(perUnitCost * 100) / 100,
    };
  });
}

/**
 * توزيع الرسوم الجمركية على الأصناف بناءً على الكمية
 */
export async function distributeDutiesByQuantity(
  items: Item[],
  totalCustomsDuty: number,
  totalSalesTax: number,
  totalAdditionalFees: number
): Promise<DutyDistribution[]> {
  // حساب إجمالي الكمية
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity === 0) {
    throw new Error('إجمالي الكمية لا يمكن أن يكون صفراً');
  }

  // توزيع الرسوم بناءً على نسبة كمية كل صنف
  return items.map((item) => {
    const quantityRatio = item.quantity / totalQuantity;

    const itemCustomsDuty = totalCustomsDuty * quantityRatio;
    const itemSalesTax = totalSalesTax * quantityRatio;
    const itemAdditionalFees = totalAdditionalFees * quantityRatio;
    const itemTotalCharges = itemCustomsDuty + itemSalesTax + itemAdditionalFees;

    const perUnitCost = item.quantity > 0 ? itemTotalCharges / item.quantity : 0;

    return {
      itemId: item.id,
      itemName: item.name,
      customsDuty: Math.round(itemCustomsDuty * 100) / 100,
      salesTax: Math.round(itemSalesTax * 100) / 100,
      additionalFees: Math.round(itemAdditionalFees * 100) / 100,
      totalCharges: Math.round(itemTotalCharges * 100) / 100,
      perUnitCost: Math.round(perUnitCost * 100) / 100,
    };
  });
}

/**
 * توزيع الرسوم الجمركية على الأصناف بناءً على معدل مخصص
 */
export async function distributeDutiesByCustomRate(
  items: Item[],
  itemRates: Record<number, number>, // itemId -> rate (0-1)
  totalCustomsDuty: number,
  totalSalesTax: number,
  totalAdditionalFees: number
): Promise<DutyDistribution[]> {
  // حساب مجموع المعدلات
  const totalRate = Object.values(itemRates).reduce((sum, r) => sum + r, 0);

  if (totalRate === 0) {
    throw new Error('مجموع المعدلات لا يمكن أن يكون صفراً');
  }

  // توزيع الرسوم بناءً على المعدلات المخصصة
  return items.map((item) => {
    const itemRate = itemRates[item.id] || 0;
    const rateRatio = itemRate / totalRate;

    const itemCustomsDuty = totalCustomsDuty * rateRatio;
    const itemSalesTax = totalSalesTax * rateRatio;
    const itemAdditionalFees = totalAdditionalFees * rateRatio;
    const itemTotalCharges = itemCustomsDuty + itemSalesTax + itemAdditionalFees;

    const perUnitCost = item.quantity > 0 ? itemTotalCharges / item.quantity : 0;

    return {
      itemId: item.id,
      itemName: item.name,
      customsDuty: Math.round(itemCustomsDuty * 100) / 100,
      salesTax: Math.round(itemSalesTax * 100) / 100,
      additionalFees: Math.round(itemAdditionalFees * 100) / 100,
      totalCharges: Math.round(itemTotalCharges * 100) / 100,
      perUnitCost: Math.round(perUnitCost * 100) / 100,
    };
  });
}

/**
 * التحقق من صحة التوزيع
 */
export async function validateDistribution(
  distribution: DutyDistribution[],
  expectedCustomsDuty: number,
  expectedSalesTax: number,
  expectedAdditionalFees: number
): Promise<boolean> {
  const tolerance = 0.01; // تسامح 0.01 بسبب التقريب

  const totalCustomsDuty = distribution.reduce((sum, d) => sum + d.customsDuty, 0);
  const totalSalesTax = distribution.reduce((sum, d) => sum + d.salesTax, 0);
  const totalAdditionalFees = distribution.reduce(
    (sum, d) => sum + d.additionalFees,
    0
  );

  const dutiesMatch = Math.abs(totalCustomsDuty - expectedCustomsDuty) < tolerance;
  const taxMatch = Math.abs(totalSalesTax - expectedSalesTax) < tolerance;
  const feesMatch = Math.abs(totalAdditionalFees - expectedAdditionalFees) < tolerance;

  return dutiesMatch && taxMatch && feesMatch;
}

/**
 * حساب تكلفة الوحدة النهائية لكل صنف
 */
export async function calculateLandedUnitCost(
  items: Item[],
  distribution: DutyDistribution[]
): Promise<
  Array<{
    itemId: number;
    itemName: string;
    unitPrice: number;
    chargesPerUnit: number;
    landedUnitCost: number;
  }>
> {
  return items.map((item) => {
    const dist = distribution.find((d) => d.itemId === item.id);
    if (!dist) {
      throw new Error(`لم يتم العثور على توزيع للصنف ${item.id}`);
    }

    const chargesPerUnit = dist.perUnitCost;
    const landedUnitCost = item.unitPrice + chargesPerUnit;

    return {
      itemId: item.id,
      itemName: item.name,
      unitPrice: Math.round(item.unitPrice * 100) / 100,
      chargesPerUnit: Math.round(chargesPerUnit * 100) / 100,
      landedUnitCost: Math.round(landedUnitCost * 100) / 100,
    };
  });
}

/**
 * إعادة توزيع الرسوم (في حالة تغيير البيانات)
 */
export async function redistributeDuties(
  items: Item[],
  distribution: DutyDistribution[],
  method: 'value' | 'weight' | 'quantity' | 'custom',
  itemWeights?: Record<number, number>,
  itemRates?: Record<number, number>
): Promise<DutyDistribution[]> {
  const totalCustomsDuty = distribution.reduce((sum, d) => sum + d.customsDuty, 0);
  const totalSalesTax = distribution.reduce((sum, d) => sum + d.salesTax, 0);
  const totalAdditionalFees = distribution.reduce(
    (sum, d) => sum + d.additionalFees,
    0
  );

  switch (method) {
    case 'value':
      return await distributeDutiesByValue(
        items,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );
    case 'weight':
      if (!itemWeights) {
        throw new Error('يجب توفير أوزان الأصناف');
      }
      return await distributeDutiesByWeight(
        items,
        itemWeights,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );
    case 'quantity':
      return await distributeDutiesByQuantity(
        items,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );
    case 'custom':
      if (!itemRates) {
        throw new Error('يجب توفير معدلات مخصصة');
      }
      return await distributeDutiesByCustomRate(
        items,
        itemRates,
        totalCustomsDuty,
        totalSalesTax,
        totalAdditionalFees
      );
    default:
      throw new Error('طريقة توزيع غير معروفة');
  }
}

export default {
  distributeDutiesByValue,
  distributeDutiesByWeight,
  distributeDutiesByQuantity,
  distributeDutiesByCustomRate,
  validateDistribution,
  calculateLandedUnitCost,
  redistributeDuties,
};

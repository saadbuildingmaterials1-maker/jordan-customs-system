/**
 * Tax Service
 * 
 * خدمة إدارة الضرائب والرسوم
 * حساب تلقائي للضرائب حسب الدول والشحنات
 * 
 * @module server/services/tax-service
 */

/**
 * معدلات الضريبة حسب الدول
 */
const TAX_RATES: Record<string, number> = {
  'JO': 0.16, // الأردن - 16%
  'SA': 0.15, // السعودية - 15%
  'AE': 0.05, // الإمارات - 5%
  'EG': 0.14, // مصر - 14%
  'KW': 0.00, // الكويت - 0%
  'QA': 0.05, // قطر - 5%
  'BH': 0.05, // البحرين - 5%
  'OM': 0.00, // عمان - 0%
  'US': 0.08, // أمريكا - 8% (متوسط)
  'EU': 0.21, // أوروبا - 21% (متوسط)
  'GB': 0.20, // بريطانيا - 20%
  'CA': 0.13, // كندا - 13%
  'AU': 0.10, // أستراليا - 10%
};

/**
 * رسوم الشحن حسب النوع
 */
const SHIPPING_FEES: Record<string, number> = {
  'standard': 5.00,      // شحن عادي
  'express': 15.00,      // شحن سريع
  'overnight': 30.00,    // شحن ليلي
  'international': 25.00, // شحن دولي
};

/**
 * رسوم إضافية حسب نوع البضاعة
 */
const COMMODITY_FEES: Record<string, number> = {
  'electronics': 0.05,   // إلكترونيات - 5%
  'clothing': 0.02,      // ملابس - 2%
  'food': 0.03,          // غذائيات - 3%
  'books': 0.00,         // كتب - 0%
  'medicine': 0.01,      // أدوية - 1%
  'cosmetics': 0.08,     // مستحضرات تجميل - 8%
  'jewelry': 0.10,       // مجوهرات - 10%
  'alcohol': 0.25,       // كحوليات - 25%
  'tobacco': 0.30,       // تبغ - 30%
  'other': 0.04,         // أخرى - 4%
};

/**
 * معلومات الضريبة والرسوم
 */
export interface TaxCalculation {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  shippingFee: number;
  commodityFee: number;
  totalFees: number;
  total: number;
  breakdown: {
    subtotal: number;
    tax: number;
    shipping: number;
    commodity: number;
    total: number;
  };
}

/**
 * خدمة الضرائب
 */
export class TaxService {
  /**
   * الحصول على معدل الضريبة حسب الدولة
   */
  getTaxRate(countryCode: string): number {
    return TAX_RATES[countryCode.toUpperCase()] || 0.16; // الافتراضي 16%
  }

  /**
   * الحصول على رسم الشحن
   */
  getShippingFee(shippingType: string): number {
    return SHIPPING_FEES[shippingType.toLowerCase()] || SHIPPING_FEES['standard'];
  }

  /**
   * الحصول على رسم البضاعة
   */
  getCommodityFee(commodityType: string): number {
    return COMMODITY_FEES[commodityType.toLowerCase()] || COMMODITY_FEES['other'];
  }

  /**
   * حساب الضرائب والرسوم الكاملة
   */
  calculateTax(
    subtotal: number,
    countryCode: string,
    shippingType: string = 'standard',
    commodityType: string = 'other'
  ): TaxCalculation {
    console.log(`💰 جاري حساب الضرائب للدولة: ${countryCode}`);

    // الحصول على المعدلات
    const taxRate = this.getTaxRate(countryCode);
    const shippingFee = this.getShippingFee(shippingType);
    const commodityFeeRate = this.getCommodityFee(commodityType);

    // حساب المبالغ
    const taxAmount = subtotal * taxRate;
    const commodityFee = subtotal * commodityFeeRate;
    const totalFees = shippingFee + commodityFee;
    const total = subtotal + taxAmount + totalFees;

    console.log(`✅ تم حساب الضرائب: ${taxAmount.toFixed(2)}`);

    return {
      subtotal,
      taxRate,
      taxAmount: Math.round(taxAmount * 100) / 100,
      shippingFee,
      commodityFee: Math.round(commodityFee * 100) / 100,
      totalFees,
      total: Math.round(total * 100) / 100,
      breakdown: {
        subtotal,
        tax: Math.round(taxAmount * 100) / 100,
        shipping: shippingFee,
        commodity: Math.round(commodityFee * 100) / 100,
        total: Math.round(total * 100) / 100,
      },
    };
  }

  /**
   * حساب الضرائب بناءً على معدل مخصص
   */
  calculateTaxWithCustomRate(
    subtotal: number,
    customTaxRate: number,
    shippingFee: number = 0,
    additionalFees: number = 0
  ): TaxCalculation {
    const taxAmount = subtotal * customTaxRate;
    const totalFees = shippingFee + additionalFees;
    const total = subtotal + taxAmount + totalFees;

    return {
      subtotal,
      taxRate: customTaxRate,
      taxAmount: Math.round(taxAmount * 100) / 100,
      shippingFee,
      commodityFee: additionalFees,
      totalFees,
      total: Math.round(total * 100) / 100,
      breakdown: {
        subtotal,
        tax: Math.round(taxAmount * 100) / 100,
        shipping: shippingFee,
        commodity: additionalFees,
        total: Math.round(total * 100) / 100,
      },
    };
  }

  /**
   * الحصول على جميع معدلات الضريبة
   */
  getAllTaxRates(): Record<string, number> {
    return { ...TAX_RATES };
  }

  /**
   * الحصول على جميع رسوم الشحن
   */
  getAllShippingFees(): Record<string, number> {
    return { ...SHIPPING_FEES };
  }

  /**
   * الحصول على جميع رسوم البضاعة
   */
  getAllCommodityFees(): Record<string, number> {
    return { ...COMMODITY_FEES };
  }

  /**
   * التحقق من الإعفاءات الضريبية
   */
  isExemptFromTax(commodityType: string): boolean {
    const exemptItems = ['books', 'medicine'];
    return exemptItems.includes(commodityType.toLowerCase());
  }

  /**
   * حساب الضريبة المستحقة للدولة
   */
  calculateGovernmentTax(
    subtotal: number,
    countryCode: string
  ): number {
    const taxRate = this.getTaxRate(countryCode);
    const taxAmount = subtotal * taxRate;
    return Math.round(taxAmount * 100) / 100;
  }

  /**
   * الحصول على معلومات الضريبة الكاملة
   */
  getTaxInfo(countryCode: string): {
    country: string;
    taxRate: number;
    taxRatePercentage: string;
    description: string;
  } {
    const taxRate = this.getTaxRate(countryCode);
    const countryNames: Record<string, string> = {
      'JO': 'الأردن',
      'SA': 'السعودية',
      'AE': 'الإمارات',
      'EG': 'مصر',
      'KW': 'الكويت',
      'QA': 'قطر',
      'BH': 'البحرين',
      'OM': 'عمان',
      'US': 'الولايات المتحدة',
      'EU': 'الاتحاد الأوروبي',
      'GB': 'بريطانيا',
      'CA': 'كندا',
      'AU': 'أستراليا',
    };

    return {
      country: countryNames[countryCode.toUpperCase()] || countryCode,
      taxRate,
      taxRatePercentage: `${(taxRate * 100).toFixed(1)}%`,
      description: `معدل الضريبة على القيمة المضافة في ${countryNames[countryCode.toUpperCase()] || countryCode}`,
    };
  }

  /**
   * تحديث معدل الضريبة (للمسؤولين فقط)
   */
  updateTaxRate(countryCode: string, newRate: number): boolean {
    if (newRate < 0 || newRate > 1) {
      console.error('❌ معدل الضريبة يجب أن يكون بين 0 و 1');
      return false;
    }

    TAX_RATES[countryCode.toUpperCase()] = newRate;
    console.log(`✅ تم تحديث معدل الضريبة للدولة ${countryCode} إلى ${(newRate * 100).toFixed(1)}%`);
    return true;
  }

  /**
   * تحديث رسم الشحن
   */
  updateShippingFee(shippingType: string, newFee: number): boolean {
    if (newFee < 0) {
      console.error('❌ رسم الشحن لا يمكن أن يكون سالباً');
      return false;
    }

    SHIPPING_FEES[shippingType.toLowerCase()] = newFee;
    console.log(`✅ تم تحديث رسم الشحن ${shippingType} إلى ${newFee}`);
    return true;
  }

  /**
   * تحديث رسم البضاعة
   */
  updateCommodityFee(commodityType: string, newFeeRate: number): boolean {
    if (newFeeRate < 0 || newFeeRate > 1) {
      console.error('❌ رسم البضاعة يجب أن يكون بين 0 و 1');
      return false;
    }

    COMMODITY_FEES[commodityType.toLowerCase()] = newFeeRate;
    console.log(`✅ تم تحديث رسم البضاعة ${commodityType} إلى ${(newFeeRate * 100).toFixed(1)}%`);
    return true;
  }
}

// تصدير مثيل واحد من الخدمة
export const taxService = new TaxService();

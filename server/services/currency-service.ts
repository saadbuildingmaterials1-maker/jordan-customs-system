/**
 * Currency Service
 * 
 * خدمة إدارة العملات المتعددة
 * تدعم: JOD (دينار أردني)، USD (دولار)، EUR (يورو)
 * 
 * @module server/services/currency-service
 */

/**
 * أنواع العملات المدعومة
 */
export type Currency = 'JOD' | 'USD' | 'EUR';

/**
 * معدلات الصرف (مقابل الدينار الأردني)
 * تحديث يومي موصى به
 */
const EXCHANGE_RATES: Record<Currency, number> = {
  JOD: 1.0,
  USD: 0.709, // 1 دولار = 0.709 دينار أردني تقريباً
  EUR: 0.77,  // 1 يورو = 0.77 دينار أردني تقريباً
};

/**
 * رموز العملات
 */
const CURRENCY_SYMBOLS: Record<Currency, string> = {
  JOD: 'د.ا',
  USD: '$',
  EUR: '€',
};

/**
 * أسماء العملات
 */
const CURRENCY_NAMES: Record<Currency, string> = {
  JOD: 'دينار أردني',
  USD: 'دولار أمريكي',
  EUR: 'يورو',
};

/**
 * خدمة العملات
 */
export class CurrencyService {
  /**
   * تحويل المبلغ من عملة إلى أخرى
   */
  convertAmount(
    amount: number,
    fromCurrency: Currency,
    toCurrency: Currency
  ): number {
    // تحويل إلى JOD أولاً
    const amountInJOD = amount / EXCHANGE_RATES[fromCurrency];
    // ثم تحويل من JOD إلى العملة المطلوبة
    const convertedAmount = amountInJOD * EXCHANGE_RATES[toCurrency];
    return Math.round(convertedAmount * 100) / 100; // تقريب إلى منزلتين عشريتين
  }

  /**
   * الحصول على سعر الصرف
   */
  getExchangeRate(fromCurrency: Currency, toCurrency: Currency): number {
    if (fromCurrency === toCurrency) return 1;
    return Math.round((EXCHANGE_RATES[toCurrency] / EXCHANGE_RATES[fromCurrency]) * 10000) / 10000;
  }

  /**
   * تنسيق المبلغ مع رمز العملة
   */
  formatAmount(amount: number, currency: Currency): string {
    const symbol = CURRENCY_SYMBOLS[currency];
    const formatted = amount.toLocaleString('ar-JO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // وضع الرمز حسب العملة
    if (currency === 'JOD') {
      return `${formatted} ${symbol}`;
    } else {
      return `${symbol}${formatted}`;
    }
  }

  /**
   * الحصول على رمز العملة
   */
  getCurrencySymbol(currency: Currency): string {
    return CURRENCY_SYMBOLS[currency];
  }

  /**
   * الحصول على اسم العملة
   */
  getCurrencyName(currency: Currency): string {
    return CURRENCY_NAMES[currency];
  }

  /**
   * الحصول على قائمة العملات المدعومة
   */
  getSupportedCurrencies(): Array<{ code: Currency; name: string; symbol: string }> {
    return [
      { code: 'JOD', name: CURRENCY_NAMES.JOD, symbol: CURRENCY_SYMBOLS.JOD },
      { code: 'USD', name: CURRENCY_NAMES.USD, symbol: CURRENCY_SYMBOLS.USD },
      { code: 'EUR', name: CURRENCY_NAMES.EUR, symbol: CURRENCY_SYMBOLS.EUR },
    ];
  }

  /**
   * تحديث معدلات الصرف (يجب تحديثها يومياً من API خارجي)
   */
  updateExchangeRates(rates: Partial<Record<Currency, number>>): void {
    console.log('📊 جاري تحديث معدلات الصرف');
    Object.assign(EXCHANGE_RATES, rates);
    console.log('✅ تم تحديث معدلات الصرف:', EXCHANGE_RATES);
  }

  /**
   * الحصول على معدلات الصرف الحالية
   */
  getCurrentRates(): Record<Currency, number> {
    return { ...EXCHANGE_RATES };
  }

  /**
   * حساب السعر بناءً على العملة المختارة
   */
  calculatePriceInCurrency(
    basePriceJOD: number,
    targetCurrency: Currency
  ): number {
    return this.convertAmount(basePriceJOD, 'JOD', targetCurrency);
  }

  /**
   * الحصول على معلومات العملة الكاملة
   */
  getCurrencyInfo(currency: Currency): {
    code: Currency;
    name: string;
    symbol: string;
    exchangeRate: number;
  } {
    return {
      code: currency,
      name: CURRENCY_NAMES[currency],
      symbol: CURRENCY_SYMBOLS[currency],
      exchangeRate: EXCHANGE_RATES[currency],
    };
  }
}

// تصدير مثيل واحد من الخدمة
export const currencyService = new CurrencyService();

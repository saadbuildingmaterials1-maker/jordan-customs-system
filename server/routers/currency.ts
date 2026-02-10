import { logger } from '../_core/logger-service';
/**
 * Currency Router
 * 
 * إجراءات tRPC لإدارة العملات
 * 
 * @module server/routers/currency
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { currencyService, type Currency } from '../services/currency-service';

/**
 * Currency Router
 */
export const currencyRouter = router({
  /**
   * الحصول على قائمة العملات المدعومة
   */
  getSupportedCurrencies: publicProcedure.query(async () => {
    try {
      const currencies = currencyService.getSupportedCurrencies();
      return {
        success: true,
        currencies,
      };
    } catch (error) {
      logger.error('❌ خطأ في جلب العملات:', error);
      throw new Error('فشل في جلب العملات');
    }
  }),

  /**
   * تحويل المبلغ من عملة إلى أخرى
   */
  convertAmount: publicProcedure
    .input(
      z.object({
        amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
        fromCurrency: z.enum(['JOD', 'USD', 'EUR']),
        toCurrency: z.enum(['JOD', 'USD', 'EUR']),
      })
    )
    .query(async ({ input }) => {
      try {
        const convertedAmount = currencyService.convertAmount(
          input.amount,
          input.fromCurrency as Currency,
          input.toCurrency as Currency
        );

        return {
          success: true,
          originalAmount: input.amount,
          originalCurrency: input.fromCurrency,
          convertedAmount,
          targetCurrency: input.toCurrency,
          exchangeRate: currencyService.getExchangeRate(
            input.fromCurrency as Currency,
            input.toCurrency as Currency
          ),
        };
      } catch (error) {
        logger.error('❌ خطأ في تحويل العملة:', error);
        throw new Error('فشل في تحويل العملة');
      }
    }),

  /**
   * الحصول على معدلات الصرف الحالية
   */
  getExchangeRates: publicProcedure.query(async () => {
    try {
      const rates = currencyService.getCurrentRates();
      return {
        success: true,
        rates,
        lastUpdated: new Date(),
      };
    } catch (error) {
      logger.error('❌ خطأ في جلب معدلات الصرف:', error);
      throw new Error('فشل في جلب معدلات الصرف');
    }
  }),

  /**
   * الحصول على معلومات العملة
   */
  getCurrencyInfo: publicProcedure
    .input(
      z.object({
        currency: z.enum(['JOD', 'USD', 'EUR']),
      })
    )
    .query(async ({ input }) => {
      try {
        const info = currencyService.getCurrencyInfo(input.currency as Currency);
        return {
          success: true,
          info,
        };
      } catch (error) {
        logger.error('❌ خطأ في جلب معلومات العملة:', error);
        throw new Error('فشل في جلب معلومات العملة');
      }
    }),

  /**
   * حساب السعر بناءً على العملة المختارة
   */
  calculatePrice: publicProcedure
    .input(
      z.object({
        basePriceJOD: z.number().positive('السعر يجب أن يكون موجباً'),
        targetCurrency: z.enum(['JOD', 'USD', 'EUR']),
      })
    )
    .query(async ({ input }) => {
      try {
        const price = currencyService.calculatePriceInCurrency(
          input.basePriceJOD,
          input.targetCurrency as Currency
        );

        return {
          success: true,
          basePriceJOD: input.basePriceJOD,
          targetCurrency: input.targetCurrency,
          calculatedPrice: price,
          formatted: currencyService.formatAmount(price, input.targetCurrency as Currency),
        };
      } catch (error) {
        logger.error('❌ خطأ في حساب السعر:', error);
        throw new Error('فشل في حساب السعر');
      }
    }),

  /**
   * تنسيق المبلغ مع رمز العملة
   */
  formatAmount: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        currency: z.enum(['JOD', 'USD', 'EUR']),
      })
    )
    .query(async ({ input }) => {
      try {
        const formatted = currencyService.formatAmount(
          input.amount,
          input.currency as Currency
        );

        return {
          success: true,
          amount: input.amount,
          currency: input.currency,
          formatted,
        };
      } catch (error) {
        logger.error('❌ خطأ في تنسيق المبلغ:', error);
        throw new Error('فشل في تنسيق المبلغ');
      }
    }),
});

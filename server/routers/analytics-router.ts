import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  getSalesStatistics,
  getPaymentStatistics,
  getShippingStatistics,
  getCustomsStatistics,
  getTimeSeriesData,
  comparePeriods,
  getDashboardSummary,
} from '../services/analytics-service';
import { TRPCError } from '@trpc/server';

/**
 * مسارات tRPC لخدمات التحليلات
 * Analytics tRPC Routes
 */

export const analyticsRouter = router({
  /**
   * الحصول على ملخص لوحة التحكم
   * Get dashboard summary
   */
  getDashboardSummary: protectedProcedure
    .input(
      z.object({
        period: z.enum(['day', 'week', 'month', 'year']).optional().default('month'),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const summary = await getDashboardSummary(ctx.user.id, input.period);
        return summary;
      } catch (error) {
        console.error('Error getting dashboard summary:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في جلب ملخص لوحة التحكم',
        });
      }
    }),

  /**
   * الحصول على إحصائيات المبيعات
   * Get sales statistics
   */
  getSalesStatistics: protectedProcedure
    .input(
      z.object({
        period: z.enum(['day', 'week', 'month', 'year']).optional().default('month'),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const stats = await getSalesStatistics(ctx.user.id, input.period);
        return stats;
      } catch (error) {
        console.error('Error getting sales statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في جلب إحصائيات المبيعات',
        });
      }
    }),

  /**
   * الحصول على إحصائيات الدفع
   * Get payment statistics
   */
  getPaymentStatistics: protectedProcedure
    .input(
      z.object({
        period: z.enum(['day', 'week', 'month', 'year']).optional().default('month'),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const stats = await getPaymentStatistics(ctx.user.id, input.period);
        return stats;
      } catch (error) {
        console.error('Error getting payment statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في جلب إحصائيات الدفع',
        });
      }
    }),

  /**
   * الحصول على إحصائيات الشحنات
   * Get shipping statistics
   */
  getShippingStatistics: protectedProcedure
    .input(
      z.object({
        period: z.enum(['day', 'week', 'month', 'year']).optional().default('month'),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const stats = await getShippingStatistics(ctx.user.id, input.period);
        return stats;
      } catch (error) {
        console.error('Error getting shipping statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في جلب إحصائيات الشحنات',
        });
      }
    }),

  /**
   * الحصول على إحصائيات الجمارك
   * Get customs statistics
   */
  getCustomsStatistics: protectedProcedure
    .input(
      z.object({
        period: z.enum(['day', 'week', 'month', 'year']).optional().default('month'),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const stats = await getCustomsStatistics(ctx.user.id, input.period);
        return stats;
      } catch (error) {
        console.error('Error getting customs statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في جلب إحصائيات الجمارك',
        });
      }
    }),

  /**
   * الحصول على بيانات السلاسل الزمنية
   * Get time series data
   */
  getTimeSeriesData: protectedProcedure
    .input(
      z.object({
        metric: z.enum(['sales', 'payments', 'shipments', 'customs']),
        period: z.enum(['day', 'week', 'month', 'year']).optional().default('month'),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const data = await getTimeSeriesData(ctx.user.id, input.metric, input.period);
        return data;
      } catch (error) {
        console.error('Error getting time series data:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في جلب بيانات السلاسل الزمنية',
        });
      }
    }),

  /**
   * مقارنة الفترات
   * Compare periods
   */
  comparePeriods: protectedProcedure
    .input(
      z.object({
        metric: z.enum(['sales', 'payments', 'shipments', 'customs']),
        currentPeriod: z.enum(['day', 'week', 'month', 'year']),
        previousPeriod: z.enum(['day', 'week', 'month', 'year']),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const comparison = await comparePeriods(
          ctx.user.id,
          input.metric,
          input.currentPeriod,
          input.previousPeriod
        );
        return comparison;
      } catch (error) {
        console.error('Error comparing periods:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في مقارنة الفترات',
        });
      }
    }),
});

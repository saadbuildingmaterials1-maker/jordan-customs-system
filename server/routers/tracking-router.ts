import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  getRealTimeTracking,
  getTrackingHistory,
  getTrackingNotifications,
  estimateDeliveryTime,
  checkForDelays,
  getTrackingStatistics,
} from '../services/advanced-tracking-service';
import { getTrackingData, validateTrackingNumber, calculateCustomsDuty, getNearestWarehouse, getAvailableCompanies } from '../services/shipping-integration-service';

/**
 * مسارات tRPC لنظام التتبع
 * Tracking tRPC Routes
 */

export const trackingRouter = router({
  /**
   * الحصول على بيانات التتبع الفورية
   * Get real-time tracking data
   */
  getRealTime: publicProcedure
    .input(
      z.object({
        trackingNumber: z.string(),
        companyCode: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      // التحقق من صحة رقم التتبع
      if (input.companyCode && !(await validateTrackingNumber(input.companyCode, input.trackingNumber))) {
        throw new Error('رقم التتبع غير صحيح');
      }

      return await getRealTimeTracking(input.trackingNumber);
    }),

  /**
   * الحصول على سجل التتبع الكامل
   * Get tracking history
   */
  getHistory: publicProcedure
    .input(z.object({ trackingNumber: z.string() }))
    .query(async ({ input }) => {
      return await getTrackingHistory(input.trackingNumber);
    }),

  /**
   * الحصول على إشعارات التتبع
   * Get tracking notifications
   */
  getNotifications: protectedProcedure
    .input(
      z.object({
        trackingNumber: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      return await getTrackingNotifications(ctx.user.id, input.trackingNumber);
    }),

  /**
   * حساب وقت التسليم المتوقع
   * Estimate delivery time
   */
  estimateDelivery: publicProcedure
    .input(
      z.object({
        origin: z.string(),
        destination: z.string(),
        shippingMethod: z.enum(['express', 'fast', 'standard', 'economy']),
      })
    )
    .query(async ({ input }) => {
      return await estimateDeliveryTime(input.origin, input.destination, input.shippingMethod);
    }),

  /**
   * التحقق من التأخيرات
   * Check for delays
   */
  checkDelays: publicProcedure
    .input(z.object({ trackingNumber: z.string() }))
    .query(async ({ input }) => {
      return await checkForDelays(input.trackingNumber);
    }),

  /**
   * الحصول على إحصائيات التتبع
   * Get tracking statistics
   */
  getStatistics: protectedProcedure.query(async ({ ctx }) => {
    return await getTrackingStatistics(ctx.user.id);
  }),

  /**
   * الحصول على شركات الشحن المتاحة
   * Get available shipping companies
   */
  getAvailableCompanies: publicProcedure.query(async () => {
    return await getAvailableCompanies();
  }),

  /**
   * التحقق من صحة رقم التتبع
   * Validate tracking number
   */
  validateTrackingNumber: publicProcedure
    .input(
      z.object({
        companyCode: z.string(),
        trackingNumber: z.string(),
      })
    )
    .query(async ({ input }) => {
      const isValid = await validateTrackingNumber(input.companyCode, input.trackingNumber);
      return { isValid, trackingNumber: input.trackingNumber };
    }),

  /**
   * حساب الرسوم الجمركية
   * Calculate customs duty
   */
  calculateCustomsDuty: publicProcedure
    .input(
      z.object({
        value: z.number(),
        origin: z.string(),
        destination: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await calculateCustomsDuty(input.value, input.origin, input.destination);
    }),

  /**
   * الحصول على أقرب مستودع
   * Get nearest warehouse
   */
  getNearestWarehouse: publicProcedure
    .input(
      z.object({
        companyCode: z.string(),
        latitude: z.number(),
        longitude: z.number(),
      })
    )
    .query(async ({ input }) => {
      return await getNearestWarehouse(input.companyCode, input.latitude, input.longitude);
    }),

  /**
   * الحصول على بيانات التتبع من شركة الشحن
   * Get tracking data from shipping company
   */
  getCompanyTrackingData: publicProcedure
    .input(
      z.object({
        companyCode: z.string(),
        trackingNumber: z.string(),
        apiKey: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await getTrackingData(input.companyCode, input.trackingNumber, input.apiKey);
    }),
});

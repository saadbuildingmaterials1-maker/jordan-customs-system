/**
 * Coupons Router
 * 
 * إجراءات tRPC لإدارة الكوبونات والخصومات
 * 
 * @module server/routers/coupons
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { couponService, type DiscountType } from '../services/coupon-service';

/**
 * Coupons Router
 */
export const couponsRouter = router({
  /**
   * الحصول على جميع الكوبونات النشطة
   */
  getActiveCoupons: publicProcedure.query(async () => {
    try {
      const coupons = couponService.getActiveCoupons();
      return {
        success: true,
        coupons,
      };
    } catch (error) {
      throw new Error('فشل في جلب الكوبونات');
    }
  }),

  /**
   * تطبيق الكوبون
   */
  applyCoupon: publicProcedure
    .input(
      z.object({
        couponCode: z.string().min(1, 'رمز الكوبون مطلوب'),
        purchaseAmount: z.number().positive('المبلغ يجب أن يكون موجباً'),
        planName: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = couponService.applyCoupon(
          input.couponCode,
          input.purchaseAmount,
          input.planName
        );

        return result;
      } catch (error) {
        throw new Error('فشل في تطبيق الكوبون');
      }
    }),

  /**
   * التحقق من صحة الكوبون
   */
  validateCoupon: publicProcedure
    .input(
      z.object({
        couponCode: z.string().min(1, 'رمز الكوبون مطلوب'),
      })
    )
    .query(async ({ input }) => {
      try {
        const coupon = couponService.getCoupon(input.couponCode);

        if (!coupon) {
          return {
            success: false,
            message: 'الكوبون غير موجود',
            valid: false,
          };
        }

        const isExpired = coupon.expiryDate && new Date() > coupon.expiryDate;
        const isDisabled = coupon.status === 'disabled';
        const isMaxUsed = coupon.maxUsageCount && coupon.currentUsageCount >= coupon.maxUsageCount;

        const valid = !isExpired && !isDisabled && !isMaxUsed;

        return {
          success: true,
          valid,
          coupon,
          isExpired,
          isDisabled,
          isMaxUsed,
          message: valid ? 'الكوبون صحيح' : 'الكوبون غير صالح للاستخدام',
        };
      } catch (error) {
        throw new Error('فشل في التحقق من الكوبون');
      }
    }),

  /**
   * الحصول على إحصائيات الكوبون
   */
  getCouponStats: publicProcedure
    .input(
      z.object({
        couponCode: z.string().min(1, 'رمز الكوبون مطلوب'),
      })
    )
    .query(async ({ input }) => {
      try {
        const stats = couponService.getCouponStats(input.couponCode);

        if (!stats) {
          return {
            success: false,
            message: 'الكوبون غير موجود',
          };
        }

        return {
          success: true,
          stats,
        };
      } catch (error) {
        throw new Error('فشل في جلب إحصائيات الكوبون');
      }
    }),

  /**
   * إنشاء كوبون جديد (للمسؤولين فقط)
   */
  createCoupon: protectedProcedure
    .input(
      z.object({
        code: z.string().min(3, 'رمز الكوبون يجب أن يكون 3 أحرف على الأقل'),
        discountType: z.enum(['percentage', 'fixed'] as const),
        discountValue: z.number().positive('قيمة الخصم يجب أن تكون موجبة'),
        minPurchaseAmount: z.number().optional(),
        maxUsageCount: z.number().optional(),
        expiryDate: z.date().optional(),
        applicablePlans: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // التحقق من أن المستخدم مسؤول
        if (ctx.user.role !== 'admin') {
          throw new Error('ليس لديك صلاحيات لإنشاء كوبون');
        }

        const coupon = couponService.createCoupon(
          input.code,
          input.discountType as DiscountType,
          input.discountValue,
          {
            minPurchaseAmount: input.minPurchaseAmount,
            maxUsageCount: input.maxUsageCount,
            expiryDate: input.expiryDate,
            applicablePlans: input.applicablePlans,
          }
        );

        return {
          success: true,
          message: 'تم إنشاء الكوبون بنجاح',
          coupon,
        };
      } catch (error) {
        throw new Error('فشل في إنشاء الكوبون');
      }
    }),

  /**
   * تحديث الكوبون (للمسؤولين فقط)
   */
  updateCoupon: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1, 'رمز الكوبون مطلوب'),
        updates: z.object({
          discountValue: z.number().optional(),
          status: z.enum(['active', 'expired', 'disabled']).optional(),
          maxUsageCount: z.number().optional(),
          expiryDate: z.date().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // التحقق من أن المستخدم مسؤول
        if (ctx.user.role !== 'admin') {
          throw new Error('ليس لديك صلاحيات لتحديث الكوبون');
        }

        const coupon = couponService.updateCoupon(input.code, input.updates);

        if (!coupon) {
          return {
            success: false,
            message: 'الكوبون غير موجود',
          };
        }

        return {
          success: true,
          message: 'تم تحديث الكوبون بنجاح',
          coupon,
        };
      } catch (error) {
        throw new Error('فشل في تحديث الكوبون');
      }
    }),

  /**
   * حذف الكوبون (للمسؤولين فقط)
   */
  deleteCoupon: protectedProcedure
    .input(
      z.object({
        code: z.string().min(1, 'رمز الكوبون مطلوب'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // التحقق من أن المستخدم مسؤول
        if (ctx.user.role !== 'admin') {
          throw new Error('ليس لديك صلاحيات لحذف الكوبون');
        }

        const deleted = couponService.deleteCoupon(input.code);

        return {
          success: deleted,
          message: deleted ? 'تم حذف الكوبون بنجاح' : 'الكوبون غير موجود',
        };
      } catch (error) {
        throw new Error('فشل في حذف الكوبون');
      }
    }),

  /**
   * الحصول على جميع الكوبونات (للمسؤولين فقط)
   */
  getAllCoupons: protectedProcedure.query(async ({ ctx }) => {
    try {
      // التحقق من أن المستخدم مسؤول
      if (ctx.user.role !== 'admin') {
        throw new Error('ليس لديك صلاحيات لعرض جميع الكوبونات');
      }

      const coupons = couponService.getAllCoupons();
      return {
        success: true,
        coupons,
      };
    } catch (error) {
      throw new Error('فشل في جلب الكوبونات');
    }
  }),
});

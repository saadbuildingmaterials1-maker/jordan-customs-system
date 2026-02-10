import { logger } from './_core/logger-service';
/**
 * Subscription Router
 * 
 * إجراءات tRPC لإدارة الاشتراكات والفترات التجريبية
 * 
 * @module server/subscription-router
 */

import { router, publicProcedure, protectedProcedure } from './_core/trpc';
import { z } from 'zod';
import { subscriptionService } from './services/subscription-service';

/**
 * إجراءات الاشتراكات
 */
export const subscriptionRouter = router({
  /**
   * الحصول على قائمة الخطط المتاحة
   */
  getPlans: publicProcedure.query(async () => {
    try {
      const plans = subscriptionService.getPlans();
      return {
        success: true,
        plans,
        message: 'تم جلب الخطط بنجاح',
      };
    } catch (error) {
      logger.error('❌ خطأ في جلب الخطط:', error);
      throw new Error('فشل في جلب الخطط');
    }
  }),

  /**
   * الحصول على خطة محددة
   */
  getPlan: publicProcedure
    .input(z.object({ planId: z.number() }))
    .query(async ({ input: { planId } }) => {
      try {
        const plan = subscriptionService.getPlan(planId);
        if (!plan) {
          throw new Error(`الخطة ${planId} غير موجودة`);
        }
        return {
          success: true,
          plan,
          message: 'تم جلب الخطة بنجاح',
        };
      } catch (error) {
        logger.error('❌ خطأ في جلب الخطة:', error);
        throw new Error('فشل في جلب الخطة');
      }
    }),

  /**
   * إنشاء فترة تجريبية
   */
  createTrialPeriod: protectedProcedure
    .input(
      z.object({
        planId: z.number().min(1),
      })
    )
    .mutation(async ({ ctx, input: { planId } }) => {
      try {
        const userId = ctx.user.id;
        const trialPeriod = await subscriptionService.createTrialPeriod(userId, planId);

        // إرسال إشعار بتفعيل الفترة التجريبية
        const plan = subscriptionService.getPlan(planId);
        if (plan) {
          await subscriptionService.sendSubscriptionActivatedNotification(
            userId,
            `${plan.name} (تجريبي)`,
            0
          );
        }

        return {
          success: true,
          trialPeriod,
          message: `تم تفعيل الفترة التجريبية لمدة ${plan?.trialDays} أيام بنجاح`,
        };
      } catch (error) {
        logger.error('❌ خطأ في إنشاء الفترة التجريبية:', error);
        throw new Error('فشل في إنشاء الفترة التجريبية');
      }
    }),

  /**
   * التحقق من حالة الفترة التجريبية
   */
  checkTrialStatus: protectedProcedure
    .input(
      z.object({
        trialPeriodId: z.number(),
        endDate: z.string(),
      })
    )
    .query(async ({ ctx, input: { endDate } }) => {
      try {
        const trialPeriod = {
          id: 1,
          userId: ctx.user.id,
          planId: 1,
          startDate: new Date(),
          endDate: new Date(endDate),
          daysRemaining: 5,
          status: 'active' as const,
          autoConvertToSubscription: true,
        };

        const status = subscriptionService.checkTrialStatus(trialPeriod);

        if (status === 'ending_soon') {
          await subscriptionService.sendTrialEndingNotification(ctx.user.id, trialPeriod.daysRemaining);
        }

        return {
          success: true,
          status,
          daysRemaining: trialPeriod.daysRemaining,
          message: `حالة الفترة التجريبية: ${status}`,
        };
      } catch (error) {
        logger.error('❌ خطأ في التحقق من حالة الفترة التجريبية:', error);
        throw new Error('فشل في التحقق من حالة الفترة التجريبية');
      }
    }),

  /**
   * تحويل الفترة التجريبية إلى اشتراك
   */
  convertTrialToSubscription: protectedProcedure
    .input(
      z.object({
        trialPeriodId: z.number(),
        planId: z.number(),
        interval: z.enum(['month', 'year']),
      })
    )
    .mutation(async ({ ctx, input: { trialPeriodId, planId, interval } }) => {
      try {
        const userId = ctx.user.id;
        const subscription = await subscriptionService.convertTrialToSubscription(
          userId,
          trialPeriodId,
          planId,
          interval
        );

        // إرسال إشعار بتفعيل الاشتراك
        await subscriptionService.sendSubscriptionActivatedNotification(
          userId,
          subscription.planName,
          subscription.amount
        );

        return {
          success: true,
          subscription,
          message: `تم تحويل الفترة التجريبية إلى اشتراك ${interval === 'month' ? 'شهري' : 'سنوي'} بنجاح`,
        };
      } catch (error) {
        logger.error('❌ خطأ في تحويل الفترة التجريبية:', error);
        throw new Error('فشل في تحويل الفترة التجريبية');
      }
    }),

  /**
   * إلغاء الاشتراك واسترجاع المبلغ
   */
  cancelSubscriptionAndRefund: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.number(),
        trialPeriodId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input: { subscriptionId, trialPeriodId, reason } }) => {
      try {
        const userId = ctx.user.id;
        const refundInfo = await subscriptionService.cancelSubscriptionAndRefund(
          userId,
          subscriptionId,
          trialPeriodId,
          reason || 'trial_period_cancellation'
        );

        // إرسال إشعار بالاسترجاع
        await subscriptionService.sendRefundNotification(
          userId,
          refundInfo.refundAmount,
          'الخطة المختارة'
        );

        return {
          success: true,
          refund: refundInfo,
          message: refundInfo.message,
        };
      } catch (error) {
        logger.error('❌ خطأ في إلغاء الاشتراك:', error);
        throw new Error('فشل في إلغاء الاشتراك');
      }
    }),

  /**
   * تجديد الاشتراك تلقائياً
   */
  autoRenewSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.number(),
      })
    )
    .mutation(async ({ ctx, input: { subscriptionId } }) => {
      try {
        const userId = ctx.user.id;
        const subscription = await subscriptionService.autoRenewSubscription(
          userId,
          subscriptionId
        );

        return {
          success: true,
          subscription,
          message: 'تم تجديد الاشتراك بنجاح',
        };
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        logger.error('❌ خطأ في تجديد الاشتراك:', errMsg);
        throw new Error('فشل في تجديد الاشتراك');
      }
    }),

  /**
   * الحصول على معلومات الاشتراك الحالي
   */
  getSubscriptionInfo: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = ctx.user.id;
      const subscription = await subscriptionService.getSubscriptionInfo(userId);

      if (!subscription) {
        return {
          success: false,
          subscription: null,
          message: 'لا يوجد اشتراك نشط',
        };
      }

      return {
        success: true,
        subscription,
        message: 'تم جلب معلومات الاشتراك بنجاح',
      };
    } catch (error) {
      logger.error('❌ خطأ في جلب معلومات الاشتراك:', error);
      throw new Error('فشل في جلب معلومات الاشتراك');
    }
  }),

  /**
   * الحصول على سعر الخطة
   */
  getPlanPrice: publicProcedure
    .input(
      z.object({
        planId: z.number(),
        interval: z.enum(['month', 'year']),
      })
    )
    .query(async ({ input: { planId, interval } }) => {
      try {
        const plan = subscriptionService.getPlan(planId);
        if (!plan) {
          throw new Error(`الخطة ${planId} غير موجودة`);
        }

        const price = interval === 'month' ? plan.priceMonthly : plan.priceYearly;
        const savings = interval === 'year' ? (plan.priceMonthly * 12 - plan.priceYearly) : 0;

        return {
          success: true,
          price,
          currency: plan.currency,
          interval,
          savings,
          savingsPercentage: savings > 0 ? Math.round((savings / (plan.priceMonthly * 12)) * 100) : 0,
          message: 'تم جلب السعر بنجاح',
        };
      } catch (error) {
        logger.error('❌ خطأ في جلب السعر:', error);
        throw new Error('فشل في جلب السعر');
      }
    }),

  /**
   * مقارنة الخطط
   */
  comparePlans: publicProcedure.query(async () => {
    try {
      const plans = subscriptionService.getPlans();
      
      return {
        success: true,
        plans,
        comparison: {
          basicVsProfessional: {
            priceMonthly: plans[1].priceMonthly - plans[0].priceMonthly,
            additionalFeatures: plans[1].features.length - plans[0].features.length,
            maxUsers: plans[1].maxUsers - plans[0].maxUsers,
            storage: plans[1].maxStorageGb - plans[0].maxStorageGb,
          },
          professionalVsEnterprise: {
            priceMonthly: plans[2].priceMonthly - plans[1].priceMonthly,
            additionalFeatures: plans[2].features.length - plans[1].features.length,
            maxUsers: plans[2].maxUsers - plans[1].maxUsers,
            storage: plans[2].maxStorageGb - plans[1].maxStorageGb,
          },
        },
        message: 'تم جلب مقارنة الخطط بنجاح',
      };
    } catch (error) {
      logger.error('❌ خطأ في جلب مقارنة الخطط:', error);
      throw new Error('فشل في جلب مقارنة الخطط');
    }
  }),
});

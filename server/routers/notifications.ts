/**
 * Notifications Router
 * 
 * إجراءات tRPC لإدارة الإشعارات والرسائل النصية
 * 
 * @module server/routers/notifications
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { smsService } from '../services/sms-service';

/**
 * Notifications Router
 */
export const notificationsRouter = router({
  /**
   * إرسال رسالة تفعيل الاشتراك
   */
  sendSubscriptionActivatedNotification: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string().min(10, 'رقم الهاتف غير صحيح'),
        planName: z.string().min(1, 'اسم الخطة مطلوب'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log(`📱 جاري إرسال إشعار تفعيل الاشتراك`);

        // إرسال رسالة SMS
        const smsSent = await smsService.sendSubscriptionActivatedSMS(
          input.phoneNumber,
          input.planName,
          ctx.user.id
        );

        return {
          success: true,
          message: 'تم إرسال الإشعار بنجاح',
          smsSent,
        };
      } catch (error) {
        throw new Error('فشل في إرسال الإشعار');
      }
    }),

  /**
   * إرسال تنبيه انتهاء الفترة التجريبية
   */
  sendTrialEndingNotification: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string().min(10, 'رقم الهاتف غير صحيح'),
        planName: z.string().min(1, 'اسم الخطة مطلوب'),
        daysRemaining: z.number().min(0, 'عدد الأيام يجب أن يكون موجباً'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log(`📱 جاري إرسال تنبيه انتهاء الفترة التجريبية`);

        // إرسال رسالة SMS
        const smsSent = await smsService.sendTrialEndingSMS(
          input.phoneNumber,
          input.planName,
          input.daysRemaining,
          ctx.user.id
        );

        return {
          success: true,
          message: 'تم إرسال التنبيه بنجاح',
          smsSent,
        };
      } catch (error) {
        throw new Error('فشل في إرسال التنبيه');
      }
    }),

  /**
   * إرسال إشعار تجديد الاشتراك
   */
  sendSubscriptionRenewedNotification: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string().min(10, 'رقم الهاتف غير صحيح'),
        planName: z.string().min(1, 'اسم الخطة مطلوب'),
        renewalDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'تاريخ غير صحيح'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log(`📱 جاري إرسال إشعار تجديد الاشتراك`);

        // إرسال رسالة SMS
        const smsSent = await smsService.sendSubscriptionRenewedSMS(
          input.phoneNumber,
          input.planName,
          new Date(input.renewalDate),
          ctx.user.id
        );

        return {
          success: true,
          message: 'تم إرسال الإشعار بنجاح',
          smsSent,
        };
      } catch (error) {
        throw new Error('فشل في إرسال الإشعار');
      }
    }),

  /**
   * إرسال تنبيه فشل الدفع
   */
  sendPaymentFailedNotification: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string().min(10, 'رقم الهاتف غير صحيح'),
        planName: z.string().min(1, 'اسم الخطة مطلوب'),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log(`📱 جاري إرسال تنبيه فشل الدفع`);

        // إرسال رسالة SMS
        const smsSent = await smsService.sendPaymentFailedSMS(
          input.phoneNumber,
          input.planName,
          ctx.user.id,
          input.errorMessage
        );

        return {
          success: true,
          message: 'تم إرسال التنبيه بنجاح',
          smsSent,
        };
      } catch (error) {
        throw new Error('فشل في إرسال التنبيه');
      }
    }),

  /**
   * إرسال إشعار استرجاع الأموال
   */
  sendRefundProcessedNotification: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string().min(10, 'رقم الهاتف غير صحيح'),
        amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
        currency: z.string().length(3, 'رمز العملة يجب أن يكون 3 أحرف'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log(`📱 جاري إرسال إشعار استرجاع الأموال`);

        // إرسال رسالة SMS
        const smsSent = await smsService.sendRefundProcessedSMS(
          input.phoneNumber,
          input.amount,
          input.currency,
          ctx.user.id
        );

        return {
          success: true,
          message: 'تم إرسال الإشعار بنجاح',
          smsSent,
        };
      } catch (error) {
        throw new Error('فشل في إرسال الإشعار');
      }
    }),
});

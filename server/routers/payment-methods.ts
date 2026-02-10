import { logger } from '../_core/logger-service';
/**
 * Payment Methods Router
 * 
 * إدارة طرق الدفع المختلفة
 * 
 * @module server/routers/payment-methods
 */
import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import {
  createApplePayPaymentMethod,
  createGooglePayPaymentMethod,
  createApplePayCheckoutSession,
  createGooglePayCheckoutSession,
  getUserPaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  createPaymentWithSavedMethod,
  updatePaymentMethod,
} from '../services/stripe-payment-methods';

export const paymentMethodsRouter = router({
  /**
   * إنشاء Apple Pay
   */
  createApplePayMethod: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createApplePayPaymentMethod({
        userId: ctx.user.id,
        token: input.token,
        email: input.email,
      });
    }),

  /**
   * إنشاء Google Pay
   */
  createGooglePayMethod: protectedProcedure
    .input(
      z.object({
        token: z.string(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createGooglePayPaymentMethod({
        userId: ctx.user.id,
        token: input.token,
        email: input.email,
      });
    }),

  /**
   * إنشاء جلسة دفع Apple Pay
   */
  createApplePayCheckoutSession: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        currency: z.string().default('JOD'),
        description: z.string(),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createApplePayCheckoutSession({
        userId: ctx.user.id,
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        customerEmail: ctx.user.email || '',
        customerName: ctx.user.name || 'Customer',
        successUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
      });
    }),

  /**
   * إنشاء جلسة دفع Google Pay
   */
  createGooglePayCheckoutSession: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        currency: z.string().default('JOD'),
        description: z.string(),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createGooglePayCheckoutSession({
        userId: ctx.user.id,
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        customerEmail: ctx.user.email || '',
        customerName: ctx.user.name || 'Customer',
        successUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
      });
    }),

  /**
   * جلب طرق الدفع
   */
  getPaymentMethods: protectedProcedure.query(async ({ ctx }) => {
    try {
      const methods = await getUserPaymentMethods(ctx.user.id);
      return methods.map((m: any) => ({
        id: m.id,
        type: m.type,
        card: m.card,
        billingDetails: m.billing_details,
        created: m.created,
      }));
    } catch (error) {
      logger.error('خطأ في جلب طرق الدفع:', error);
      return [];
    }
  }),

  /**
   * حذف طريقة دفع
   */
  deletePaymentMethod: protectedProcedure
    .input(z.object({ paymentMethodId: z.string() }))
    .mutation(async ({ input }) => {
      return await deletePaymentMethod(input.paymentMethodId);
    }),

  /**
   * تعيين طريقة دفع افتراضية
   */
  setDefaultPaymentMethod: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        paymentMethodId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await setDefaultPaymentMethod(
        input.customerId,
        input.paymentMethodId
      );
    }),

  /**
   * الدفع باستخدام طريقة محفوظة
   */
  payWithSavedMethod: protectedProcedure
    .input(
      z.object({
        paymentMethodId: z.string(),
        amount: z.number().positive(),
        currency: z.string().default('JOD'),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createPaymentWithSavedMethod({
        userId: ctx.user.id,
        paymentMethodId: input.paymentMethodId,
        amount: input.amount,
        currency: input.currency,
        description: input.description,
      });
    }),

  /**
   * تحديث طريقة الدفع
   */
  updatePaymentMethod: protectedProcedure
    .input(
      z.object({
        paymentMethodId: z.string(),
        billingDetails: z
          .object({
            name: z.string().optional(),
            email: z.string().email().optional(),
            phone: z.string().optional(),
            address: z
              .object({
                line1: z.string().optional(),
                line2: z.string().optional(),
                city: z.string().optional(),
                state: z.string().optional(),
                postal_code: z.string().optional(),
                country: z.string().optional(),
              })
              .optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await updatePaymentMethod(input.paymentMethodId, {
        billingDetails: input.billingDetails as any,
      });
    }),
});

/**
 * Local Payment Gateways Router
 * موجه بوابات الدفع المحلية
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { localPaymentGatewaysService, LocalPaymentGateway } from '../services/local-payment-gateways';

export const localPaymentGatewaysRouter = router({
  /**
   * معالجة الدفع عبر بوابة محددة
   */
  processPayment: protectedProcedure
    .input(
      z.object({
        gateway: z.enum(['click', 'telr', 'payfort', '2checkout']),
        amount: z.number().positive(),
        currency: z.string().length(3),
        orderId: z.string(),
        description: z.string(),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const response = await localPaymentGatewaysService.processPayment(
        input.gateway as LocalPaymentGateway,
        input.amount,
        input.currency,
        input.orderId,
        ctx.user.id,
        input.description,
        input.customerEmail,
        input.customerPhone
      );

      return response;
    }),

  /**
   * معالجة Click Payment (كليك)
   */
  processClick: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        currency: z.string().length(3),
        orderId: z.string(),
        description: z.string(),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await localPaymentGatewaysService.processClickPayment(
        input.amount,
        input.currency,
        input.orderId,
        ctx.user.id,
        input.description,
        input.customerEmail,
        input.customerPhone
      );
    }),

  /**
   * معالجة Telr (تلر)
   */
  processTelr: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        currency: z.string().length(3),
        orderId: z.string(),
        description: z.string(),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await localPaymentGatewaysService.processTelrPayment(
        input.amount,
        input.currency,
        input.orderId,
        ctx.user.id,
        input.description,
        input.customerEmail,
        input.customerPhone
      );
    }),

  /**
   * معالجة PayFort (أمازون)
   */
  processPayFort: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        currency: z.string().length(3),
        orderId: z.string(),
        description: z.string(),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await localPaymentGatewaysService.processPayFortPayment(
        input.amount,
        input.currency,
        input.orderId,
        ctx.user.id,
        input.description,
        input.customerEmail,
        input.customerPhone
      );
    }),

  /**
   * معالجة 2Checkout (Verifone)
   */
  process2Checkout: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        currency: z.string().length(3),
        orderId: z.string(),
        description: z.string(),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await localPaymentGatewaysService.process2CheckoutPayment(
        input.amount,
        input.currency,
        input.orderId,
        ctx.user.id,
        input.description,
        input.customerEmail,
        input.customerPhone
      );
    }),

  /**
   * التحقق من حالة الدفع
   */
  verifyPayment: protectedProcedure
    .input(
      z.object({
        gateway: z.enum(['click', 'telr', 'payfort', '2checkout']),
        paymentId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const status = await localPaymentGatewaysService.verifyPayment(
        input.gateway as LocalPaymentGateway,
        input.paymentId
      );

      return { status };
    }),

  /**
   * إلغاء الدفع
   */
  cancelPayment: protectedProcedure
    .input(
      z.object({
        gateway: z.enum(['click', 'telr', 'payfort', '2checkout']),
        paymentId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await localPaymentGatewaysService.cancelPayment(
        input.gateway as LocalPaymentGateway,
        input.paymentId
      );

      return { success };
    }),

  /**
   * استرجاع الأموال
   */
  refundPayment: protectedProcedure
    .input(
      z.object({
        gateway: z.enum(['click', 'telr', 'payfort', '2checkout']),
        paymentId: z.string(),
        amount: z.number().positive().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await localPaymentGatewaysService.refundPayment(
        input.gateway as LocalPaymentGateway,
        input.paymentId,
        input.amount
      );

      return { success };
    }),

  /**
   * الحصول على قائمة البوابات المدعومة
   */
  getSupportedGateways: protectedProcedure.query(async () => {
    const gateways = localPaymentGatewaysService.getSupportedGateways();
    const details = gateways.map((gateway) => ({
      id: gateway,
      ...localPaymentGatewaysService.getGatewayInfo(gateway),
    }));

    return details;
  }),

  /**
   * الحصول على معلومات بوابة محددة
   */
  getGatewayInfo: protectedProcedure
    .input(
      z.object({
        gateway: z.enum(['click', 'telr', 'payfort', '2checkout']),
      })
    )
    .query(async ({ input }) => {
      const info = localPaymentGatewaysService.getGatewayInfo(
        input.gateway as LocalPaymentGateway
      );

      return {
        gateway: input.gateway,
        ...info,
      };
    }),
});

/**
 * Payment Gateways Router
 * 
 * إجراءات tRPC لمعالجة بوابات الدفع المختلفة
 * 
 * @module server/routers/payment-gateways
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { paymentGatewayService } from '../services/payment-gateway-service';

/**
 * Payment Gateways Router
 */
export const paymentGatewaysRouter = router({
  /**
   * معالجة دفع Click Payment
   */
  processClickPayment: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
        currency: z.string().length(3, 'رمز العملة يجب أن يكون 3 أحرف'),
        orderId: z.string().min(1, 'معرّف الطلب مطلوب'),
        accountNumber: z.string().min(10, 'رقم الحساب غير صحيح'),
        bankCode: z.string().min(2, 'رمز البنك مطلوب'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log(`💳 جاري معالجة دفع Click Payment`);

        const payment = await paymentGatewayService.processClickPayment(
          input.amount,
          input.currency,
          input.orderId,
          ctx.user.id,
          {
            accountNumber: input.accountNumber,
            bankCode: input.bankCode,
          }
        );

        return {
          success: true,
          message: 'تم معالجة الدفع بنجاح',
          payment,
        };
      } catch (error) {
        throw new Error('فشل في معالجة الدفع');
      }
    }),

  /**
   * معالجة دفع Apple Pay
   */
  processApplePay: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
        currency: z.string().length(3, 'رمز العملة يجب أن يكون 3 أحرف'),
        orderId: z.string().min(1, 'معرّف الطلب مطلوب'),
        cardToken: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log(`🍎 جاري معالجة دفع Apple Pay`);

        const payment = await paymentGatewayService.processApplePay(
          input.amount,
          input.currency,
          input.orderId,
          ctx.user.id,
          input.cardToken
        );

        return {
          success: true,
          message: 'تم معالجة الدفع بنجاح',
          payment,
        };
      } catch (error) {
        throw new Error('فشل في معالجة الدفع');
      }
    }),

  /**
   * معالجة دفع Google Pay
   */
  processGooglePay: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
        currency: z.string().length(3, 'رمز العملة يجب أن يكون 3 أحرف'),
        orderId: z.string().min(1, 'معرّف الطلب مطلوب'),
        paymentToken: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log(`🔵 جاري معالجة دفع Google Pay`);

        const payment = await paymentGatewayService.processGooglePay(
          input.amount,
          input.currency,
          input.orderId,
          ctx.user.id,
          input.paymentToken
        );

        return {
          success: true,
          message: 'تم معالجة الدفع بنجاح',
          payment,
        };
      } catch (error) {
        throw new Error('فشل في معالجة الدفع');
      }
    }),

  /**
   * معالجة دفع QR Code/Barcode
   */
  processQRCodePayment: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
        currency: z.string().length(3, 'رمز العملة يجب أن يكون 3 أحرف'),
        orderId: z.string().min(1, 'معرّف الطلب مطلوب'),
        qrCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        console.log(`📱 جاري معالجة دفع QR Code/Barcode`);

        const payment = await paymentGatewayService.processQRCodePayment(
          input.amount,
          input.currency,
          input.orderId,
          ctx.user.id,
          input.qrCode
        );

        return {
          success: true,
          message: 'تم إنشاء رمز QR بنجاح',
          payment,
        };
      } catch (error) {
        throw new Error('فشل في إنشاء رمز QR');
      }
    }),

  /**
   * التحقق من حالة الدفع
   */
  verifyPayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.string().min(1, 'معرّف الدفع مطلوب'),
      })
    )
    .query(async ({ input }) => {
      try {
        const status = await paymentGatewayService.verifyPayment(input.paymentId);

        return {
          success: true,
          status,
        };
      } catch (error) {
        throw new Error('فشل في التحقق من الدفع');
      }
    }),

  /**
   * إلغاء الدفع
   */
  cancelPayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.string().min(1, 'معرّف الدفع مطلوب'),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const success = await paymentGatewayService.cancelPayment(input.paymentId);

        return {
          success,
          message: success ? 'تم إلغاء الدفع بنجاح' : 'فشل في إلغاء الدفع',
        };
      } catch (error) {
        throw new Error('فشل في إلغاء الدفع');
      }
    }),

  /**
   * استرجاع الأموال
   */
  refundPayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.string().min(1, 'معرّف الدفع مطلوب'),
        amount: z.number().positive('المبلغ يجب أن يكون موجباً').optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const success = await paymentGatewayService.refundPayment(
          input.paymentId,
          input.amount
        );

        return {
          success,
          message: success ? 'تم استرجاع الأموال بنجاح' : 'فشل في استرجاع الأموال',
        };
      } catch (error) {
        throw new Error('فشل في استرجاع الأموال');
      }
    }),

  /**
   * الحصول على سجل الدفعات
   */
  getUserPayments: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const payments = await paymentGatewayService.getUserPayments(
          ctx.user.id,
          input.limit
        );

        return {
          success: true,
          payments,
        };
      } catch (error) {
        throw new Error('فشل في جلب سجل الدفعات');
      }
    }),
});

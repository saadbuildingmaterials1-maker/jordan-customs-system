import { z } from 'zod';
import { router, protectedProcedure } from './_core/trpc';
import type { AnyData } from '../shared/types';
import PaymentService, { PaymentMethod, PaymentStatus } from './payment-service';

/**
 * Payment Router - إجراءات الدفع
 */
export const paymentRouter = router({
  /**
   * إنشاء دفعة جديدة
   */
  createPayment: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
        currency: z.string().min(3).max(3),
        method: z.enum(['card', 'bank_transfer', 'wallet', 'cash']),
        description: z.string().min(1).max(500),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const payment = await PaymentService.createPayment(
          ctx.user.id,
          input.amount,
          input.currency,
          input.method as PaymentMethod,
          input.description,
          input.metadata
        );

        return {
          success: true,
          payment,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`فشل إنشاء الدفعة: ${message}`);
      }
    }),

  /**
   * معالجة الدفع
   */
  processPayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.string(),
        stripePaymentIntentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const payment = await PaymentService.processPayment(
          input.paymentId,
          input.stripePaymentIntentId
        );

        return {
          success: true,
          payment,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`فشل معالجة الدفعة: ${message}`);
      }
    }),

  /**
   * تأكيد الدفع
   */
  confirmPayment: protectedProcedure
    .input(z.object({ paymentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const payment = await PaymentService.confirmPayment(input.paymentId);

        return {
          success: true,
          payment,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`فشل تأكيد الدفعة: ${message}`);
      }
    }),

  /**
   * رفض الدفع
   */
  failPayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const payment = await PaymentService.failPayment(input.paymentId, input.reason);

        return {
          success: true,
          payment,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`فشل رفع الدفعة: ${message}`);
      }
    }),

  /**
   * استرجاع الدفعة
   */
  refundPayment: protectedProcedure
    .input(
      z.object({
        paymentId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const payment = await PaymentService.refundPayment(input.paymentId, input.reason);

        return {
          success: true,
          payment,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`فشل استرجاع الدفعة: ${message}`);
      }
    }),

  /**
   * الحصول على سجل الدفعات
   */
  getUserPayments: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const payments = await PaymentService.getUserPayments(
          ctx.user.id,
          input.limit || 50
        );

        return {
          success: true,
          payments,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`فشل جلب الدفعات: ${message}`);
      }
    }),

  /**
   * الحصول على إحصائيات الدفع
   */
  getPaymentStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const stats = await PaymentService.getPaymentStats(ctx.user.id);

      return {
        success: true,
        stats,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`فشل جلب الإحصائيات: ${message}`);
    }
  }),

  /**
   * تصدير الفاتورة إلى PDF
   */
  exportInvoiceToPDF: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const pdf = await PaymentService.exportInvoiceToPDF(input.invoiceId);

        return {
          success: true,
          pdf: pdf.toString('base64'),
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`فشل تصدير الفاتورة: ${message}`);
      }
    }),

  /**
   * إرسال الفاتورة عبر البريد الإلكتروني
   */
  sendInvoiceByEmail: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        email: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await PaymentService.sendInvoiceByEmail(
          input.invoiceId,
          input.email
        );

        return {
          success: result,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`فشل إرسال الفاتورة: ${message}`);
      }
    }),

  /**
   * حساب المبلغ النهائي مع الضرائب والخصم
   */
  calculateFinalAmount: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        taxRate: z.number().optional(),
        discountPercent: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const finalAmount = PaymentService.calculateFinalAmount(
          input.amount,
          input.taxRate || 0.16,
          input.discountPercent || 0
        );

        const tax = PaymentService.calculateTax(input.amount, input.taxRate || 0.16);
        const discount = PaymentService.calculateDiscount(
          input.amount,
          input.discountPercent || 0
        );

        return {
          success: true,
          originalAmount: input.amount,
          tax,
          discount,
          finalAmount,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`فشل حساب المبلغ: ${message}`);
      }
    }),
});

export default paymentRouter;

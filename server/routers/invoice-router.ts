import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  createInvoice,
  calculateInvoice,
  signInvoice,
  archiveInvoice,
  sendInvoiceEmail,
  updateInvoiceStatus,
  recordPayment,
  getInvoiceDetails,
  listInvoices,
  deleteInvoice,
} from '../services/advanced-invoice-service';
import { TRPCError } from '@trpc/server';

/**
 * مسارات tRPC لإدارة الفواتير
 * Invoice Management tRPC Routes
 */

export const invoiceRouter = router({
  /**
   * إنشاء فاتورة جديدة تلقائياً
   * Create new invoice automatically
   */
  create: protectedProcedure
    .input(
      z.object({
        recipientName: z.string().min(1, 'اسم المستقبل مطلوب'),
        recipientEmail: z.string().email('البريد الإلكتروني غير صحيح'),
        recipientPhone: z.string().optional(),
        recipientAddress: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.date(),
        items: z.array(
          z.object({
            description: z.string().min(1, 'وصف العنصر مطلوب'),
            quantity: z.number().positive('الكمية يجب أن تكون موجبة'),
            unit: z.string().min(1, 'الوحدة مطلوبة'),
            unitPrice: z.number().positive('السعر يجب أن يكون موجباً'),
            taxRate: z.number().optional(),
            discountRate: z.number().optional(),
            hsCode: z.string().optional(),
            customsDutyRate: z.number().optional(),
            sku: z.string().optional(),
            category: z.string().optional(),
          })
        ),
        paymentMethod: z.enum(['bank_transfer', 'credit_card', 'paypal', 'check', 'cash', 'other']).optional(),
        shippingCost: z.number().optional(),
        discountAmount: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const invoiceId = await createInvoice(input, ctx.user.id);
        return {
          success: true,
          invoiceId,
          message: 'تم إنشاء الفاتورة بنجاح',
        };
      } catch (error) {
        console.error('Error creating invoice:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في إنشاء الفاتورة',
        });
      }
    }),

  /**
   * حساب الفاتورة مسبقاً
   * Calculate invoice preview
   */
  calculate: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            description: z.string(),
            quantity: z.number(),
            unit: z.string(),
            unitPrice: z.number(),
            taxRate: z.number().optional(),
            discountRate: z.number().optional(),
            hsCode: z.string().optional(),
            customsDutyRate: z.number().optional(),
            sku: z.string().optional(),
            category: z.string().optional(),
          })
        ),
        shippingCost: z.number().optional(),
        discountAmount: z.number().optional(),
        dueDate: z.date(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const calculations = await calculateInvoice(
          {
            senderId: ctx.user.id,
            recipientName: '',
            recipientEmail: '',
            dueDate: input.dueDate,
            items: input.items,
            shippingCost: input.shippingCost,
            discountAmount: input.discountAmount,
          },
          ctx.user.id
        );
        return calculations;
      } catch (error) {
        console.error('Error calculating invoice:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في حساب الفاتورة',
        });
      }
    }),

  /**
   * توقيع الفاتورة رقمياً
   * Sign invoice digitally
   */
  sign: protectedProcedure
    .input(
      z.object({
        invoiceId: z.number(),
        signerName: z.string().min(1, 'اسم الموقّع مطلوب'),
        signerEmail: z.string().email('البريد الإلكتروني غير صحيح'),
        signerTitle: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await signInvoice(
          input.invoiceId,
          ctx.user.id,
          input.signerName,
          input.signerEmail,
          input.signerTitle
        );
        return {
          success: true,
          message: 'تم توقيع الفاتورة بنجاح',
        };
      } catch (error) {
        console.error('Error signing invoice:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في توقيع الفاتورة',
        });
      }
    }),

  /**
   * أرشفة الفاتورة
   * Archive invoice
   */
  archive: protectedProcedure
    .input(
      z.object({
        invoiceId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await archiveInvoice(input.invoiceId, ctx.user.id, input.reason);
        return {
          success: true,
          message: 'تم أرشفة الفاتورة بنجاح',
        };
      } catch (error) {
        console.error('Error archiving invoice:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في أرشفة الفاتورة',
        });
      }
    }),

  /**
   * إرسال الفاتورة عبر البريد الإلكتروني
   * Send invoice via email
   */
  send: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await sendInvoiceEmail(input.invoiceId, ctx.user.id);
        return {
          success: true,
          message: 'تم إرسال الفاتورة بنجاح',
        };
      } catch (error) {
        console.error('Error sending invoice:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في إرسال الفاتورة',
        });
      }
    }),

  /**
   * تحديث حالة الفاتورة
   * Update invoice status
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        invoiceId: z.number(),
        status: z.enum(['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await updateInvoiceStatus(input.invoiceId, input.status, ctx.user.id);
        return {
          success: true,
          message: 'تم تحديث حالة الفاتورة بنجاح',
        };
      } catch (error) {
        console.error('Error updating invoice status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في تحديث حالة الفاتورة',
        });
      }
    }),

  /**
   * تسجيل دفع الفاتورة
   * Record invoice payment
   */
  recordPayment: protectedProcedure
    .input(
      z.object({
        invoiceId: z.number(),
        amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
        paymentDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await recordPayment(input.invoiceId, input.amount, ctx.user.id, input.paymentDate);
        return {
          success: true,
          message: 'تم تسجيل الدفع بنجاح',
        };
      } catch (error) {
        console.error('Error recording payment:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في تسجيل الدفع',
        });
      }
    }),

  /**
   * الحصول على تفاصيل الفاتورة
   * Get invoice details
   */
  getDetails: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .query(async ({ input }) => {
      try {
        const invoice = await getInvoiceDetails(input.invoiceId);
        if (!invoice) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'الفاتورة غير موجودة',
          });
        }
        return invoice;
      } catch (error) {
        console.error('Error getting invoice details:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في جلب تفاصيل الفاتورة',
        });
      }
    }),

  /**
   * قائمة الفواتير
   * List invoices
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        paymentStatus: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const invoicesList = await listInvoices(ctx.user.id, input);
        return invoicesList;
      } catch (error) {
        console.error('Error listing invoices:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في جلب قائمة الفواتير',
        });
      }
    }),

  /**
   * حذف الفاتورة
   * Delete invoice
   */
  delete: protectedProcedure
    .input(z.object({ invoiceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await deleteInvoice(input.invoiceId, ctx.user.id);
        return {
          success: true,
          message: 'تم حذف الفاتورة بنجاح',
        };
      } catch (error) {
        console.error('Error deleting invoice:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في حذف الفاتورة',
        });
      }
    }),
});

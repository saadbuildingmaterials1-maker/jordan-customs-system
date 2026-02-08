/**
 * Invoices Router
 * موجه إدارة الفواتير
 * 
 * @module server/routers/invoices
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { invoicesService } from '../services/invoices-service';

/**
 * موجه الفواتير
 */
export const invoicesRouter = router({
  /**
   * إنشاء فاتورة جديدة
   */
  create: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        clientName: z.string(),
        clientEmail: z.string().email(),
        clientPhone: z.string().optional(),
        clientAddress: z.string().optional(),
        items: z.array(
          z.object({
            id: z.string(),
            description: z.string(),
            quantity: z.number().positive(),
            unitPrice: z.number().positive(),
            amount: z.number().positive(),
          })
        ),
        taxRate: z.number().optional(),
        discountRate: z.number().optional(),
        currency: z.string().default('JOD'),
        notes: z.string().optional(),
        daysUntilDue: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log('📄 إنشاء فاتورة جديدة');

      const invoice = await invoicesService.createInvoice(
        input.orderId,
        ctx.user.id.toString(),
        input.clientName,
        input.clientEmail,
        input.items,
        {
          clientPhone: input.clientPhone,
          clientAddress: input.clientAddress,
          taxRate: input.taxRate,
          discountRate: input.discountRate,
          currency: input.currency,
          notes: input.notes,
          daysUntilDue: input.daysUntilDue,
        }
      );

      return invoice;
    }),

  /**
   * الحصول على فاتورة
   */
  get: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ input }) => {
      console.log('📄 الحصول على فاتورة');

      const invoice = await invoicesService.getInvoice(input.invoiceId);
      return invoice;
    }),

  /**
   * تحديث حالة الفاتورة
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']),
      })
    )
    .mutation(async ({ input }) => {
      console.log('📄 تحديث حالة الفاتورة');

      const invoice = await invoicesService.updateInvoiceStatus(
        input.invoiceId,
        input.status
      );
      return invoice;
    }),

  /**
   * إضافة توقيع رقمي
   */
  addSignature: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        signature: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('📄 إضافة توقيع رقمي');

      const invoice = await invoicesService.addDigitalSignature(
        input.invoiceId,
        input.signature
      );
      return invoice;
    }),

  /**
   * حساب الضرائب والخصومات
   */
  calculateTaxesAndDiscounts: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        taxRate: z.number().optional(),
        discountRate: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('📄 حساب الضرائب والخصومات');

      const result = await invoicesService.calculateTaxesAndDiscounts(
        input.invoiceId,
        input.taxRate,
        input.discountRate
      );
      return result;
    }),

  /**
   * تصدير إلى JSON
   */
  exportJSON: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ input }) => {
      console.log('📤 تصدير إلى JSON');

      const json = await invoicesService.exportToJSON(input.invoiceId);
      return { json };
    }),

  /**
   * تصدير إلى HTML
   */
  exportHTML: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .query(async ({ input }) => {
      console.log('📤 تصدير إلى HTML');

      const html = await invoicesService.exportToHTML(input.invoiceId);
      return { html };
    }),

  /**
   * الحصول على قائمة الفواتير
   */
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      console.log('📝 الحصول على قائمة الفواتير');

      const invoices = await invoicesService.listInvoices(
        ctx.user.id.toString(),
        input.status
      );
      return invoices;
    }),

  /**
   * حذف فاتورة
   */
  delete: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ input }) => {
      console.log('🗑️ حذف فاتورة');

      const success = await invoicesService.deleteInvoice(input.invoiceId);
      return { success };
    }),

  /**
   * إرسال الفاتورة بالبريد الإلكتروني
   */
  sendByEmail: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ input }) => {
      console.log('📧 إرسال الفاتورة بالبريد الإلكتروني');

      const result = await invoicesService.sendInvoiceByEmail(input.invoiceId);
      return result;
    }),
});

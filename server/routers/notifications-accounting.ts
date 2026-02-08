/**
 * Notifications & Accounting Router
 * موجه الإشعارات والمحاسبة
 * 
 * @module server/routers/notifications-accounting
 */

import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { paymentNotificationsService } from '../services/payment-notifications';
import { accountingService } from '../services/accounting-service';

/**
 * موجه الإشعارات والمحاسبة
 */
export const notificationsAccountingRouter = router({
  /**
   * إرسال إشعار دفع
   */
  sendPaymentNotification: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        amount: z.number(),
        currency: z.string(),
        status: z.enum(['completed', 'failed', 'pending', 'refunded', 'cancelled']),
        gateway: z.string(),
        notificationType: z.enum(['email', 'push', 'sms', 'in-app', 'all']).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log('📧 إرسال إشعار دفع');

      const result = await paymentNotificationsService.sendNotification(
        {
          userId: ctx.user.id.toString(),
          orderId: input.orderId,
          amount: input.amount,
          currency: input.currency,
          status: input.status,
          gateway: input.gateway,
          userEmail: ctx.user.email || undefined,
          userName: ctx.user.name || undefined,
        },
        input.notificationType || 'all'
      );

      return result;
    }),

  /**
   * إرسال تذكير الدفع
   */
  sendPaymentReminder: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        amount: z.number(),
        currency: z.string(),
        gateway: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log('⏰ إرسال تذكير الدفع');

      const result = await paymentNotificationsService.sendPaymentReminder({
        userId: ctx.user.id.toString(),
        orderId: input.orderId,
        amount: input.amount,
        currency: input.currency,
        status: 'pending',
        gateway: input.gateway,
        userEmail: ctx.user.email || undefined,
        userName: ctx.user.name || undefined,
      });

      return result;
    }),

  /**
   * إرسال إشعار الفاتورة
   */
  sendInvoiceNotification: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        amount: z.number(),
        currency: z.string(),
        gateway: z.string(),
        invoiceUrl: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log('📄 إرسال إشعار الفاتورة');

      const result = await paymentNotificationsService.sendInvoiceNotification(
        {
          userId: ctx.user.id.toString(),
          orderId: input.orderId,
          amount: input.amount,
          currency: input.currency,
          status: 'completed',
          gateway: input.gateway,
          userEmail: ctx.user.email || undefined,
          userName: ctx.user.name || undefined,
        },
        input.invoiceUrl
      );

      return result;
    }),

  /**
   * إرسال التقرير اليومي
   */
  sendDailyReport: protectedProcedure
    .input(
      z.object({
        recipientEmail: z.string().email(),
        reportData: z.object({
          totalPayments: z.number(),
          successfulPayments: z.number(),
          failedPayments: z.number(),
          totalAmount: z.number(),
          currency: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      console.log('📊 إرسال التقرير اليومي');

      const success = await paymentNotificationsService.sendDailyReport(
        input.recipientEmail,
        input.reportData
      );

      return {
        success,
        message: success ? 'تم إرسال التقرير بنجاح' : 'فشل إرسال التقرير',
      };
    }),

  /**
   * إنشاء قيد محاسبي للدفع
   */
  createPaymentEntry: protectedProcedure
    .input(
      z.object({
        paymentId: z.string(),
        amount: z.number(),
        currency: z.string(),
        gateway: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('💰 إنشاء قيد محاسبي للدفع');

      const entry = await accountingService.createPaymentEntry(
        input.paymentId,
        input.amount,
        input.currency,
        input.gateway,
        input.description
      );

      return entry;
    }),

  /**
   * إنشاء قيد محاسبي للمصروف
   */
  createExpenseEntry: protectedProcedure
    .input(
      z.object({
        expenseId: z.string(),
        amount: z.number(),
        currency: z.string(),
        expenseType: z.enum(['gateway_fee', 'transfer_fee', 'service_fee', 'operational']),
        description: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('📉 إنشاء قيد محاسبي للمصروف');

      const entry = await accountingService.createExpenseEntry(
        input.expenseId,
        input.amount,
        input.currency,
        input.expenseType,
        input.description
      );

      return entry;
    }),

  /**
   * إنشاء قيد محاسبي للاسترجاع
   */
  createRefundEntry: protectedProcedure
    .input(
      z.object({
        refundId: z.string(),
        amount: z.number(),
        currency: z.string(),
        originalPaymentId: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('💸 إنشاء قيد محاسبي للاسترجاع');

      const entry = await accountingService.createRefundEntry(
        input.refundId,
        input.amount,
        input.currency,
        input.originalPaymentId,
        input.description
      );

      return entry;
    }),

  /**
   * الحصول على التقرير المالي
   */
  getFinancialReport: protectedProcedure
    .input(z.object({ period: z.string() }))
    .query(async ({ input }) => {
      console.log('📊 الحصول على التقرير المالي');

      const report = await accountingService.getFinancialReport(input.period);
      return report;
    }),

  /**
   * الحصول على قائمة الدخل
   */
  getIncomeStatement: protectedProcedure
    .input(z.object({ period: z.string() }))
    .query(async ({ input }) => {
      console.log('📈 الحصول على قائمة الدخل');

      const statement = await accountingService.getIncomeStatement(input.period);
      return statement;
    }),

  /**
   * الحصول على الميزانية العمومية
   */
  getBalanceSheet: protectedProcedure
    .input(z.object({ period: z.string() }))
    .query(async ({ input }) => {
      console.log('💼 الحصول على الميزانية العمومية');

      const sheet = await accountingService.getBalanceSheet(input.period);
      return sheet;
    }),

  /**
   * الحصول على تقرير المصالحة البنكية
   */
  getBankReconciliation: protectedProcedure
    .input(z.object({ period: z.string() }))
    .query(async ({ input }) => {
      console.log('🏦 الحصول على تقرير المصالحة البنكية');

      const reconciliation = await accountingService.getBankReconciliation(input.period);
      return reconciliation;
    }),

  /**
   * حساب الضريبة
   */
  calculateTax: publicProcedure
    .input(
      z.object({
        amount: z.number(),
        taxRate: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      console.log('💰 حساب الضريبة');

      const tax = await accountingService.calculateTax(input.amount, input.taxRate);
      return tax;
    }),

  /**
   * الحصول على ملخص الحسابات
   */
  getAccountsSummary: protectedProcedure.query(async () => {
    console.log('📋 الحصول على ملخص الحسابات');

    const summary = await accountingService.getAccountsSummary();
    return summary;
  }),

  /**
   * الحصول على سجل العمليات
   */
  getTransactionLog: protectedProcedure
    .input(
      z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      console.log('📝 الحصول على سجل العمليات');

      const log = await accountingService.getTransactionLog(input.startDate, input.endDate);
      return log;
    }),

  /**
   * تصدير التقرير المالي
   */
  exportFinancialReport: protectedProcedure
    .input(
      z.object({
        period: z.string(),
        format: z.enum(['json', 'csv', 'pdf']).optional(),
      })
    )
    .query(async ({ input }) => {
      console.log('📥 تصدير التقرير المالي');

      const report = await accountingService.exportFinancialReport(
        input.period,
        input.format as 'json' | 'csv' | 'pdf'
      );
      return {
        success: true,
        data: report,
        format: input.format || 'json',
      };
    }),
});

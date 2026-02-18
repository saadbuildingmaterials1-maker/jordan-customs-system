import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  initiatePayment,
  handleBankCallback,
  initiateRefund,
  getUserTransactions,
  getTransactionDetails,
  updateTransactionStatus,
  getPaymentSettings,
  updatePaymentSettings,
  getPendingPayments,
  getSupportedBanks,
  addBank,
  getPaymentStatistics,
} from '../services/payment-service';
import { TRPCError } from '@trpc/server';

/**
 * مسارات tRPC لإدارة الدفع
 * Payment Management tRPC Routes
 */

export const paymentRouter = router({
  /**
   * الحصول على البنوك المدعومة
   * Get supported banks
   */
  getSupportedBanks: publicProcedure.query(async () => {
    try {
      const banks = await getSupportedBanks();
      return banks;
    } catch (error) {
      console.error('Error getting supported banks:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'فشل في جلب البنوك المدعومة',
      });
    }
  }),

  /**
   * بدء معاملة دفع
   * Initiate payment transaction
   */
  initiatePayment: protectedProcedure
    .input(
      z.object({
        invoiceId: z.number().optional(),
        amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
        currency: z.string().default('JOD'),
        bankCode: z.string().min(1, 'اختر بنكاً'),
        paymentMethod: z.enum(['credit_card', 'debit_card', 'bank_transfer', 'mobile_wallet', 'installment']),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await initiatePayment({
          userId: ctx.user.id,
          invoiceId: input.invoiceId,
          amount: input.amount,
          currency: input.currency,
          bankCode: input.bankCode,
          paymentMethod: input.paymentMethod,
          description: input.description,
          ipAddress: ctx.req?.ip,
          userAgent: ctx.req?.headers['user-agent'],
        });

        return {
          success: true,
          ...result,
        };
      } catch (error) {
        console.error('Error initiating payment:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'فشل في بدء المعاملة',
        });
      }
    }),

  /**
   * معالجة رد الاستدعاء من البنك
   * Handle bank callback
   */
  handleBankCallback: publicProcedure
    .input(
      z.object({
        transactionId: z.string(),
        referenceNumber: z.string(),
        status: z.enum(['success', 'failed', 'cancelled']),
        authorizationCode: z.string().optional(),
        responseCode: z.string().optional(),
        responseMessage: z.string().optional(),
        cardLastFour: z.string().optional(),
        cardBrand: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await handleBankCallback(input);
        return result;
      } catch (error) {
        console.error('Error handling bank callback:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في معالجة رد الاستدعاء',
        });
      }
    }),

  /**
   * بدء عملية استرجاع المبلغ
   * Initiate refund
   */
  initiateRefund: protectedProcedure
    .input(
      z.object({
        transactionId: z.number(),
        amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
        reason: z.enum([
          'customer_request',
          'duplicate_charge',
          'fraudulent',
          'product_not_received',
          'product_defective',
          'service_not_provided',
          'other',
        ]),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await initiateRefund({
          transactionId: input.transactionId,
          amount: input.amount,
          reason: input.reason,
          description: input.description,
          userId: ctx.user.id,
        });

        return {
          success: true,
          ...result,
        };
      } catch (error) {
        console.error('Error initiating refund:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'فشل في بدء عملية الاسترجاع',
        });
      }
    }),

  /**
   * الحصول على معاملات المستخدم
   * Get user transactions
   */
  getUserTransactions: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        bankCode: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().optional().default(20),
        offset: z.number().optional().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const transactions = await getUserTransactions(ctx.user.id, input);
        return transactions;
      } catch (error) {
        console.error('Error getting user transactions:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في جلب المعاملات',
        });
      }
    }),

  /**
   * الحصول على تفاصيل المعاملة
   * Get transaction details
   */
  getTransactionDetails: protectedProcedure
    .input(z.object({ transactionId: z.number() }))
    .query(async ({ input }) => {
      try {
        const transaction = await getTransactionDetails(input.transactionId);
        return transaction;
      } catch (error) {
        console.error('Error getting transaction details:', error);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'المعاملة غير موجودة',
        });
      }
    }),

  /**
   * الحصول على إعدادات الدفع
   * Get payment settings
   */
  getPaymentSettings: protectedProcedure.query(async ({ ctx }) => {
    try {
      const settings = await getPaymentSettings(ctx.user.id);
      return settings;
    } catch (error) {
      console.error('Error getting payment settings:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'فشل في جلب إعدادات الدفع',
      });
    }
  }),

  /**
   * تحديث إعدادات الدفع
   * Update payment settings
   */
  updatePaymentSettings: protectedProcedure
    .input(
      z.object({
        preferredBanks: z.array(z.string()).optional(),
        enablePaymentNotifications: z.boolean().optional(),
        enableEmailNotifications: z.boolean().optional(),
        enableSmsNotifications: z.boolean().optional(),
        dailyTransactionLimit: z.number().optional(),
        monthlyTransactionLimit: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await updatePaymentSettings(ctx.user.id, input);
        return { success: true, message: 'تم تحديث الإعدادات بنجاح' };
      } catch (error) {
        console.error('Error updating payment settings:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في تحديث الإعدادات',
        });
      }
    }),

  /**
   * الحصول على المدفوعات المعلقة
   * Get pending payments
   */
  getPendingPayments: protectedProcedure.query(async ({ ctx }) => {
    try {
      const pending = await getPendingPayments(ctx.user.id);
      return pending;
    } catch (error) {
      console.error('Error getting pending payments:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'فشل في جلب المدفوعات المعلقة',
      });
    }
  }),

  /**
   * إحصائيات الدفع
   * Payment statistics
   */
  getPaymentStatistics: protectedProcedure
    .input(
      z.object({
        period: z.enum(['day', 'week', 'month', 'year']).optional().default('month'),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const stats = await getPaymentStatistics(ctx.user.id, input.period);
        return stats;
      } catch (error) {
        console.error('Error getting payment statistics:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في جلب إحصائيات الدفع',
        });
      }
    }),

  /**
   * إضافة بنك جديد (للمسؤولين فقط)
   * Add new bank (admin only)
   */
  addBank: protectedProcedure
    .input(
      z.object({
        bankCode: z.string().min(1, 'رمز البنك مطلوب'),
        bankName: z.string().min(1, 'اسم البنك مطلوب'),
        bankNameAr: z.string().min(1, 'اسم البنك بالعربية مطلوب'),
        gatewayType: z.enum(['redirect', 'api', 'hosted_page', 'mobile_wallet']),
        gatewayUrl: z.string().url('رابط البوابة غير صحيح'),
        apiEndpoint: z.string().url().optional(),
        merchantId: z.string().optional(),
        apiKey: z.string().optional(),
        apiSecret: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // التحقق من صلاحيات المسؤول
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'ليس لديك صلاحيات كافية',
        });
      }

      try {
        const bank = await addBank(input);
        return {
          success: true,
          bank,
          message: 'تم إضافة البنك بنجاح',
        };
      } catch (error) {
        console.error('Error adding bank:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في إضافة البنك',
        });
      }
    }),
});

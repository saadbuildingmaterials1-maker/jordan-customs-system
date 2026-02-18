/**
 * Local Payment Gateway Router
 * راوتر بوابات الدفع المحلية الأردنية (HyperPay و Telr)
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { hyperPayService } from '../services/hyperpay-service';
import { telrService } from '../services/telr-service';
import * as db from '../db';

export const localPaymentGatewayRouter = router({
  /**
   * الحصول على قائمة البوابات المدعومة
   */
  getSupportedGateways: publicProcedure.query(async () => {
    return [
      {
        id: 'hyperpay',
        name: 'HyperPay',
        description: 'بوابة دفع آمنة بالدينار الأردني',
        currencies: ['JOD', 'USD', 'EUR'],
        isActive: true,
      },
      {
        id: 'telr',
        name: 'Telr',
        description: 'خدمة دفع محلية أردنية موثوقة',
        currencies: ['JOD', 'USD', 'EUR', 'AED'],
        isActive: true,
      },
    ];
  }),

  /**
   * إنشاء طلب دفع جديد عبر HyperPay
   */
  createHyperPayPayment: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
        currency: z.enum(['JOD', 'USD', 'EUR']),
        orderId: z.string().min(1, 'رقم الطلب مطلوب'),
        description: z.string().min(1, 'الوصف مطلوب'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await hyperPayService.createPayment({
          amount: input.amount,
          currency: input.currency,
          orderId: input.orderId,
          customerEmail: ctx.user.email,
          customerPhone: ctx.user.phone || '+962',
          description: input.description,
          returnUrl: `${process.env.FRONTEND_URL}/payment/callback?gateway=hyperpay&orderId=${input.orderId}`,
        });

        if (response.success) {
          // حفظ معاملة الدفع في قاعدة البيانات
          await db.savePaymentTransaction({
            userId: ctx.user.id,
            gateway: 'hyperpay',
            transactionId: response.transactionId || '',
            orderId: input.orderId,
            amount: input.amount,
            currency: input.currency,
            status: 'pending',
          });
        }

        return response;
      } catch (error) {
        console.error('HyperPay Payment Error:', error);
        return {
          success: false,
          error: 'فشل إنشاء طلب الدفع',
          message: 'حدث خطأ أثناء معالجة طلب الدفع',
        };
      }
    }),

  /**
   * إنشاء طلب دفع جديد عبر Telr
   */
  createTelrPayment: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
        currency: z.enum(['JOD', 'USD', 'EUR', 'AED']),
        orderId: z.string().min(1, 'رقم الطلب مطلوب'),
        description: z.string().min(1, 'الوصف مطلوب'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const response = await telrService.createPayment({
          amount: input.amount,
          currency: input.currency,
          orderId: input.orderId,
          customerEmail: ctx.user.email,
          customerName: ctx.user.name || 'Customer',
          description: input.description,
          returnUrl: `${process.env.FRONTEND_URL}/payment/callback?gateway=telr&orderId=${input.orderId}`,
        });

        if (response.success) {
          // حفظ معاملة الدفع في قاعدة البيانات
          await db.savePaymentTransaction({
            userId: ctx.user.id,
            gateway: 'telr',
            transactionId: response.transactionId || '',
            orderId: input.orderId,
            amount: input.amount,
            currency: input.currency,
            status: 'pending',
          });
        }

        return response;
      } catch (error) {
        console.error('Telr Payment Error:', error);
        return {
          success: false,
          error: 'فشل إنشاء طلب الدفع',
          message: 'حدث خطأ أثناء معالجة طلب الدفع',
        };
      }
    }),

  /**
   * التحقق من حالة الدفع
   */
  checkPaymentStatus: protectedProcedure
    .input(
      z.object({
        transactionId: z.string().min(1, 'رقم المعاملة مطلوب'),
        gateway: z.enum(['hyperpay', 'telr']),
      })
    )
    .query(async ({ input }) => {
      try {
        if (input.gateway === 'hyperpay') {
          return await hyperPayService.checkPaymentStatus(input.transactionId);
        } else {
          return await telrService.checkPaymentStatus(input.transactionId);
        }
      } catch (error) {
        console.error('Payment Status Check Error:', error);
        return null;
      }
    }),

  /**
   * استرجاع المبلغ (Refund)
   */
  refundPayment: protectedProcedure
    .input(
      z.object({
        transactionId: z.string().min(1, 'رقم المعاملة مطلوب'),
        gateway: z.enum(['hyperpay', 'telr']),
        amount: z.number().positive('المبلغ يجب أن يكون موجباً').optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (input.gateway === 'hyperpay') {
          return await hyperPayService.refundPayment(input.transactionId, input.amount);
        } else {
          return await telrService.refundPayment(input.transactionId, input.amount);
        }
      } catch (error) {
        console.error('Refund Error:', error);
        return {
          success: false,
          error: 'فشل استرجاع المبلغ',
          message: 'حدث خطأ أثناء معالجة الاسترجاع',
        };
      }
    }),

  /**
   * الحصول على سجل المعاملات
   */
  getPaymentHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().default(10),
        offset: z.number().int().nonnegative().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await db.getPaymentTransactions(ctx.user.id, input.limit, input.offset);
      } catch (error) {
        console.error('Payment History Error:', error);
        return [];
      }
    }),

  /**
   * الحصول على تفاصيل معاملة محددة
   */
  getPaymentDetails: protectedProcedure
    .input(
      z.object({
        transactionId: z.string().min(1, 'رقم المعاملة مطلوب'),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        return await db.getPaymentTransaction(ctx.user.id, input.transactionId);
      } catch (error) {
        console.error('Payment Details Error:', error);
        return null;
      }
    }),

  /**
   * التحقق من حالة الخدمة
   */
  checkServiceStatus: publicProcedure.query(async () => {
    try {
      const hyperPayStatus = await hyperPayService.getServiceStatus();
      const telrStatus = await telrService.getServiceStatus();

      return {
        hyperpay: hyperPayStatus ? 'online' : 'offline',
        telr: telrStatus ? 'online' : 'offline',
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Service Status Check Error:', error);
      return {
        hyperpay: 'unknown',
        telr: 'unknown',
        timestamp: new Date(),
      };
    }
  }),
});

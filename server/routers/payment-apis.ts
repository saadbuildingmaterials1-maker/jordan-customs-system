/**
 * Payment APIs Router
 * موجه خدمات الدفع الحقيقية
 * 
 * @module server/routers/payment-apis
 */

import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { clickPaymentService } from '../services/click-payment-api';
import { alipayPaymentService } from '../services/alipay-payment-api';
import { paypalPaymentService } from '../services/paypal-payment-api';

/**
 * موجه خدمات الدفع الحقيقية
 */
export const paymentApisRouter = router({
  /**
   * Click Payment - إنشاء معاملة
   */
  click: router({
    create: protectedProcedure
      .input(
        z.object({
          orderId: z.string(),
          amount: z.number().positive(),
          currency: z.string().default('JOD'),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        console.log('💳 إنشاء معاملة Click');

        const result = await clickPaymentService.createTransaction(
          input.orderId,
          input.amount,
          input.currency,
          input.description
        );

        return result;
      }),

    /**
     * الحصول على حالة المعاملة
     */
    getStatus: protectedProcedure
      .input(z.object({ transactionId: z.string() }))
      .query(async ({ input }) => {
        console.log('📋 الحصول على حالة معاملة Click');

        const transaction = await clickPaymentService.getTransactionStatus(
          input.transactionId
        );
        return transaction;
      }),

    /**
     * استرجاع الأموال
     */
    refund: protectedProcedure
      .input(
        z.object({
          transactionId: z.string(),
          amount: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        console.log('💸 استرجاع أموال Click');

        const result = await clickPaymentService.refundTransaction(
          input.transactionId,
          input.amount
        );

        return result;
      }),

    /**
     * الحصول على قائمة المعاملات
     */
    list: protectedProcedure
      .input(z.object({ orderId: z.string().optional() }))
      .query(async ({ input }) => {
        console.log('📝 الحصول على قائمة معاملات Click');

        const transactions = await clickPaymentService.getTransactions(input.orderId);
        return transactions;
      }),
  }),

  /**
   * Alipay Payment - إنشاء معاملة
   */
  alipay: router({
    create: protectedProcedure
      .input(
        z.object({
          orderId: z.string(),
          amount: z.number().positive(),
          currency: z.string().default('CNY'),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        console.log('💳 إنشاء معاملة Alipay');

        const result = await alipayPaymentService.createTransaction(
          input.orderId,
          input.amount,
          input.currency,
          input.description
        );

        return result;
      }),

    /**
     * الحصول على حالة المعاملة
     */
    getStatus: protectedProcedure
      .input(z.object({ transactionId: z.string() }))
      .query(async ({ input }) => {
        console.log('📋 الحصول على حالة معاملة Alipay');

        const transaction = await alipayPaymentService.getTransactionStatus(
          input.transactionId
        );
        return transaction;
      }),

    /**
     * استرجاع الأموال
     */
    refund: protectedProcedure
      .input(
        z.object({
          transactionId: z.string(),
          amount: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        console.log('💸 استرجاع أموال Alipay');

        const result = await alipayPaymentService.refundTransaction(
          input.transactionId,
          input.amount
        );

        return result;
      }),

    /**
     * الحصول على قائمة المعاملات
     */
    list: protectedProcedure
      .input(z.object({ orderId: z.string().optional() }))
      .query(async ({ input }) => {
        console.log('📝 الحصول على قائمة معاملات Alipay');

        const transactions = await alipayPaymentService.getTransactions(input.orderId);
        return transactions;
      }),
  }),

  /**
   * PayPal Payment - إنشاء معاملة
   */
  paypal: router({
    create: protectedProcedure
      .input(
        z.object({
          orderId: z.string(),
          amount: z.number().positive(),
          currency: z.string().default('USD'),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        console.log('💳 إنشاء معاملة PayPal');

        const result = await paypalPaymentService.createTransaction(
          input.orderId,
          input.amount,
          input.currency,
          input.description
        );

        return result;
      }),

    /**
     * الحصول على حالة المعاملة
     */
    getStatus: protectedProcedure
      .input(z.object({ transactionId: z.string() }))
      .query(async ({ input }) => {
        console.log('📋 الحصول على حالة معاملة PayPal');

        const transaction = await paypalPaymentService.getTransactionStatus(
          input.transactionId
        );
        return transaction;
      }),

    /**
     * استرجاع الأموال
     */
    refund: protectedProcedure
      .input(
        z.object({
          transactionId: z.string(),
          amount: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        console.log('💸 استرجاع أموال PayPal');

        const result = await paypalPaymentService.refundTransaction(
          input.transactionId,
          input.amount
        );

        return result;
      }),

    /**
     * الحصول على قائمة المعاملات
     */
    list: protectedProcedure
      .input(z.object({ orderId: z.string().optional() }))
      .query(async ({ input }) => {
        console.log('📝 الحصول على قائمة معاملات PayPal');

        const transactions = await paypalPaymentService.getTransactions(input.orderId);
        return transactions;
      }),
  }),

  /**
   * الحصول على حالة المعاملة من أي بوابة
   */
  getTransactionStatus: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
        gateway: z.enum(['click', 'alipay', 'paypal']),
      })
    )
    .query(async ({ input }) => {
      console.log(`📋 الحصول على حالة معاملة ${input.gateway}`);

      let transaction = null;

      if (input.gateway === 'click') {
        transaction = await clickPaymentService.getTransactionStatus(input.transactionId);
      } else if (input.gateway === 'alipay') {
        transaction = await alipayPaymentService.getTransactionStatus(input.transactionId);
      } else if (input.gateway === 'paypal') {
        transaction = await paypalPaymentService.getTransactionStatus(input.transactionId);
      }

      return transaction;
    }),

  /**
   * استرجاع الأموال من أي بوابة
   */
  refundTransaction: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
        gateway: z.enum(['click', 'alipay', 'paypal']),
        amount: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log(`💸 استرجاع أموال ${input.gateway}`);

      let result = null;

      if (input.gateway === 'click') {
        result = await clickPaymentService.refundTransaction(
          input.transactionId,
          input.amount
        );
      } else if (input.gateway === 'alipay') {
        result = await alipayPaymentService.refundTransaction(
          input.transactionId,
          input.amount
        );
      } else if (input.gateway === 'paypal') {
        result = await paypalPaymentService.refundTransaction(
          input.transactionId,
          input.amount
        );
      }

      return result;
    }),
});

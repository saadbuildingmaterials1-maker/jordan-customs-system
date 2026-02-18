/**
 * Payment tRPC Procedures
 * إجراءات الدفع عبر tRPC
 */

import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from './_core/trpc';
import {
  processPaymentMultiGateway,
  verifyPaymentStatus,
  refundPayment,
  PaymentRequest,
} from './payment-gateway';

export const paymentRouter = router({
  /**
   * Create Payment Intent
   */
  createPaymentIntent: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        currency: z.string().length(3),
        description: z.string(),
        gateway: z.enum(['stripe', 'hyperpay', 'telr']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const paymentRequest: PaymentRequest = {
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        userId: ctx.user.id.toString(),
        email: ctx.user.email || '',
        metadata: {
          userId: ctx.user.id.toString(),
          userName: ctx.user.name || '',
        },
      };

      const result = await processPaymentMultiGateway(
        paymentRequest,
        input.gateway ? [input.gateway] : undefined
      );

      return {
        success: result.success,
        transactionId: result.transactionId,
        status: result.status,
        gateway: result.gateway,
      };
    }),

  /**
   * Verify Payment Status
   */
  verifyPayment: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
        gateway: z.enum(['stripe', 'hyperpay', 'telr']),
      })
    )
    .query(async ({ input }) => {
      const result = await verifyPaymentStatus(input.transactionId, input.gateway);
      return result || { success: false };
    }),

  /**
   * Process Refund
   */
  refundPayment: protectedProcedure
    .input(
      z.object({
        transactionId: z.string(),
        gateway: z.enum(['stripe', 'hyperpay', 'telr']),
        amount: z.number().positive().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only allow refunds for the user's own transactions
      const success = await refundPayment(
        input.transactionId,
        input.gateway,
        input.amount
      );

      return { success };
    }),

  /**
   * Get Payment History
   */
  getPaymentHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // This would typically query from a database
      // For now, returning mock data
      return {
        payments: [
          {
            id: '1',
            amount: 100,
            currency: 'USD',
            status: 'completed',
            gateway: 'stripe',
            date: new Date(),
            description: 'Customs Declaration Fee',
          },
          {
            id: '2',
            amount: 50,
            currency: 'JOD',
            status: 'completed',
            gateway: 'hyperpay',
            date: new Date(),
            description: 'Shipping Fee',
          },
        ],
        total: 2,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Calculate Payment Fee
   */
  calculatePaymentFee: publicProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        gateway: z.enum(['stripe', 'hyperpay', 'telr']),
        currency: z.string().length(3),
      })
    )
    .query(({ input }) => {
      // Calculate fees based on gateway
      const feePercentages: Record<string, number> = {
        stripe: 0.029, // 2.9%
        hyperpay: 0.025, // 2.5%
        telr: 0.022, // 2.2%
      };

      const feePercentage = feePercentages[input.gateway] || 0.03;
      const fee = input.amount * feePercentage;
      const total = input.amount + fee;

      return {
        amount: input.amount,
        fee: Math.round(fee * 100) / 100,
        total: Math.round(total * 100) / 100,
        currency: input.currency,
        gateway: input.gateway,
      };
    }),

  /**
   * Get Available Gateways
   */
  getAvailableGateways: publicProcedure.query(() => {
    return {
      gateways: [
        {
          id: 'stripe',
          name: 'Stripe',
          description: 'International Payment Gateway',
          icon: '💳',
          supported: true,
        },
        {
          id: 'hyperpay',
          name: 'HyperPay',
          description: 'Middle East Payment Gateway',
          icon: '🏦',
          supported: true,
        },
        {
          id: 'telr',
          name: 'Telr',
          description: 'UAE Payment Gateway',
          icon: '💰',
          supported: true,
        },
      ],
    };
  }),
});

export default paymentRouter;

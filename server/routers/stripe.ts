/**
 * Stripe Payment Router
 * 
 * عمليات الدفع عبر Stripe
 * 
 * @module server/routers/stripe
 */
import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import {
  createCheckoutSession,
  createPaymentIntent,
  getPaymentDetails,
  createRefund,
  createInvoice,
  sendInvoice,
  createCustomer,
  createSubscription,
  cancelSubscription,
  getUserPayments,
  getUserInvoices,
  getUserSubscriptions,
} from '../services/stripe-service';

export const stripeRouter = router({
  /**
   * إنشاء جلسة دفع Checkout
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        declarationId: z.number().optional(),
        amount: z.number().positive(),
        currency: z.string().default('JOD'),
        description: z.string(),
        successUrl: z.string().url(),
        cancelUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createCheckoutSession({
        userId: ctx.user.id,
        declarationId: input.declarationId,
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        customerEmail: ctx.user.email || '',
        customerName: ctx.user.name || 'Customer',
        successUrl: input.successUrl,
        cancelUrl: input.cancelUrl,
      });
    }),

  /**
   * إنشاء نية دفع
   */
  createPaymentIntent: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        currency: z.string().default('JOD'),
        description: z.string(),
        metadata: z.record(z.string(), z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createPaymentIntent({
        userId: ctx.user.id,
        amount: input.amount,
        currency: input.currency,
        description: input.description,
        customerEmail: ctx.user.email || '',
        metadata: input.metadata as Record<string, string> | undefined,
      });
    }),

  /**
   * جلب تفاصيل الدفع
   */
  getPaymentDetails: protectedProcedure
    .input(z.object({ paymentId: z.number() }))
    .query(async ({ input }) => {
      return await getPaymentDetails(input.paymentId.toString());
    }),

  /**
   * إنشاء استرجاع
   */
  createRefund: protectedProcedure
    .input(
      z.object({
        paymentId: z.number(),
        chargeId: z.string(),
        amount: z.number().positive().optional(),
        reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createRefund({
        paymentId: input.paymentId,
        userId: ctx.user.id,
        chargeId: input.chargeId,
        amount: input.amount,
        reason: input.reason,
        notes: input.notes,
      });
    }),

  /**
   * إنشاء فاتورة
   */
  createInvoice: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        paymentId: z.number().optional(),
        description: z.string(),
        amount: z.number().positive(),
        currency: z.string().default('JOD'),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createInvoice({
        userId: ctx.user.id,
        customerId: input.customerId,
        paymentId: input.paymentId,
        description: input.description,
        amount: input.amount,
        currency: input.currency,
        dueDate: input.dueDate,
      });
    }),

  /**
   * إرسال فاتورة
   */
  sendInvoice: protectedProcedure
    .input(z.object({ invoiceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await sendInvoice(input.invoiceId);
    }),

  /**
   * إنشاء عميل
   */
  createCustomer: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        name: z.string().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createCustomer({
        userId: ctx.user.id,
        email: input.email,
        name: input.name || 'Customer',
        phone: input.phone,
      });
    }),

  /**
   * إنشاء اشتراك
   */
  createSubscription: protectedProcedure
    .input(
      z.object({
        customerId: z.string(),
        priceId: z.string(),
        planName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await createSubscription({
        userId: ctx.user.id,
        customerId: input.customerId,
        priceId: input.priceId,
        planName: input.planName,
      });
    }),

  /**
   * إلغاء الاشتراك
   */
  cancelSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        cancelAtPeriodEnd: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await cancelSubscription(
        input.subscriptionId,
        input.cancelAtPeriodEnd
      );
    }),

  /**
   * جلب الدفعات
   */
  getPayments: protectedProcedure.query(async ({ ctx }) => {
    try {
      const payments = await getUserPayments(ctx.user.id);
      return payments.map((p: any) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        description: p.description,
        createdAt: p.createdAt,
        paidAt: p.paidAt,
      }));
    } catch (error) {
      console.error('خطأ في جلب الدفعات:', error);
      return [];
    }
  }),

  /**
   * جلب الفواتير
   */
  getInvoices: protectedProcedure.query(async ({ ctx }) => {
    try {
      const invoices = await getUserInvoices(ctx.user.id);
      return invoices.map((i: any) => ({
        id: i.id,
        invoiceNumber: i.invoiceNumber,
        amount: i.amount,
        currency: i.currency,
        status: i.status,
        description: i.description,
        createdAt: i.createdAt,
        dueDate: i.dueDate,
      }));
    } catch (error) {
      console.error('خطأ في جلب الفواتير:', error);
      return [];
    }
  }),

  /**
   * جلب الاشتراكات
   */
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    try {
      const subscriptions = await getUserSubscriptions(ctx.user.id);
      return subscriptions.map((s: any) => ({
        id: s.id,
        planName: s.planName,
        amount: s.amount,
        currency: s.currency,
        interval: s.interval,
        status: s.status,
        currentPeriodStart: s.currentPeriodStart,
        currentPeriodEnd: s.currentPeriodEnd,
        canceledAt: s.canceledAt,
        createdAt: s.createdAt,
      }));
    } catch (error) {
      console.error('خطأ في جلب الاشتراكات:', error);
      return [];
    }
  }),
});

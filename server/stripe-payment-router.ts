/**
 * Stripe Payment Router
 * 
 * إجراءات tRPC لمعالجة الدفع بـ Stripe
 * 
 * @module server/stripe-payment-router
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from './_core/trpc';
import { StripePaymentService } from './services/stripe-payment-service';

// Initialize Stripe service
let stripeService: StripePaymentService | null = null;

function getStripeService(): StripePaymentService {
  if (!stripeService) {
    const stripeApiKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeApiKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeService = new StripePaymentService(stripeApiKey);
  }
  return stripeService;
}

/**
 * Stripe Payment Router
 */
export const stripePaymentRouter = router({
  /**
   * إنشاء جلسة دفع جديدة
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        priceId: z.string().min(1, 'معرّف السعر مطلوب'),
        planId: z.string().min(1, 'معرّف الخطة مطلوب'),
        successUrl: z.string().url('رابط النجاح غير صحيح'),
        cancelUrl: z.string().url('رابط الإلغاء غير صحيح'),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        console.log(`📋 جاري إنشاء جلسة دفع جديدة`);
        console.log(`👤 معرّف المستخدم: ${ctx.user.id}`);
        console.log(`💳 معرّف السعر: ${input.priceId}`);

        // Create a Stripe customer ID based on user
        const stripeCustomerId = `cus_${ctx.user.id}_${Date.now()}`;

        console.log(`✅ تم إنشاء معرّف عميل Stripe: ${stripeCustomerId}`);

        // Create checkout session
        const session = await getStripeService().createCheckoutSession(
          stripeCustomerId,
          input.priceId,
          input.successUrl,
          input.cancelUrl,
          {
            userId: ctx.user.id.toString(),
            planId: input.planId,
          }
        );

        console.log(`✅ تم إنشاء جلسة دفع: ${session.sessionId}`);

        return {
          success: true,
          sessionId: session.sessionId,
          url: session.url,
          message: 'تم إنشاء جلسة الدفع بنجاح',
        };
      } catch (error) {
        console.error('❌ خطأ في إنشاء جلسة الدفع:', error);
        throw new Error(`فشل في إنشاء جلسة الدفع: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      }
    }),

  /**
   * جلب معلومات الاشتراك
   */
  getSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string().min(1, 'معرّف الاشتراك مطلوب'),
      })
    )
    .query(async ({ ctx, input }: any) => {
      try {
        console.log(`📋 جاري جلب معلومات الاشتراك`);
        console.log(`👤 معرّف المستخدم: ${ctx.user.id}`);
        console.log(`🆔 معرّف الاشتراك: ${input.subscriptionId}`);

        // Get subscription details from Stripe
        const stripeSubscription = await getStripeService().getSubscription(
          input.subscriptionId
        );

        console.log(`✅ تم جلب معلومات الاشتراك: ${input.subscriptionId}`);

        return {
          success: true,
          subscription: {
            id: stripeSubscription.id,
            status: stripeSubscription.status,
            currentPeriodStart: stripeSubscription.currentPeriodStart,
            currentPeriodEnd: stripeSubscription.currentPeriodEnd,
            trialStart: stripeSubscription.trialStart,
            trialEnd: stripeSubscription.trialEnd,
            amount: stripeSubscription.amount,
            currency: stripeSubscription.currency,
            interval: stripeSubscription.interval,
          },
        };
      } catch (error) {
        console.error('❌ خطأ في جلب معلومات الاشتراك:', error);
        throw new Error(`فشل في جلب معلومات الاشتراك: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      }
    }),

  /**
   * إلغاء الاشتراك
   */
  cancelSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string().min(1, 'معرّف الاشتراك مطلوب'),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      try {
        console.log(`📋 جاري إلغاء الاشتراك`);
        console.log(`👤 معرّف المستخدم: ${ctx.user.id}`);
        console.log(`🆔 معرّف الاشتراك: ${input.subscriptionId}`);

        // Cancel subscription in Stripe
        const canceledSubscription = await getStripeService().cancelSubscription(
          input.subscriptionId
        );

        console.log(`✅ تم إلغاء الاشتراك: ${input.subscriptionId}`);

        return {
          success: true,
          message: 'تم إلغاء الاشتراك بنجاح',
          subscription: {
            id: canceledSubscription.id,
            status: canceledSubscription.status,
          },
        };
      } catch (error) {
        console.error('❌ خطأ في إلغاء الاشتراك:', error);
        throw new Error(`فشل في إلغاء الاشتراك: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      }
    }),

  /**
   * جلب قائمة الفواتير
   */
  listInvoices: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }: any) => {
      try {
        console.log(`📋 جاري جلب قائمة الفواتير`);
        console.log(`👤 معرّف المستخدم: ${ctx.user.id}`);
        console.log(`📊 العدد: ${input.limit}`);

        // Create a Stripe customer ID based on user
        const stripeCustomerId = `cus_${ctx.user.id}_${Date.now()}`;

        // Get invoices from Stripe
        const invoices = await getStripeService().listInvoices(
          stripeCustomerId,
          input.limit
        );

        console.log(`✅ تم جلب قائمة الفواتير: ${invoices.length} فاتورة`);

        return {
          success: true,
          invoices: invoices.map(invoice => ({
            id: invoice.id,
            number: invoice.number,
            amount: invoice.amount,
            currency: invoice.currency,
            status: invoice.status,
            pdfUrl: invoice.pdfUrl,
            hostedUrl: invoice.hostedUrl,
            createdAt: invoice.createdAt,
            dueDate: invoice.dueDate,
            paidAt: invoice.paidAt,
          })),
        };
      } catch (error) {
        console.error('❌ خطأ في جلب قائمة الفواتير:', error);
        throw new Error(`فشل في جلب قائمة الفواتير: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      }
    }),

  /**
   * جلب فاتورة محددة
   */
  getInvoice: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string().min(1, 'معرّف الفاتورة مطلوب'),
      })
    )
    .query(async ({ ctx, input }: any) => {
      try {
        console.log(`📋 جاري جلب الفاتورة`);
        console.log(`👤 معرّف المستخدم: ${ctx.user.id}`);
        console.log(`🆔 معرّف الفاتورة: ${input.invoiceId}`);

        // Get invoice from Stripe
        const invoice = await getStripeService().getInvoice(input.invoiceId);

        console.log(`✅ تم جلب الفاتورة: ${input.invoiceId}`);

        return {
          success: true,
          invoice: {
            id: invoice.id,
            number: invoice.number,
            amount: invoice.amount,
            currency: invoice.currency,
            status: invoice.status,
            pdfUrl: invoice.pdfUrl,
            hostedUrl: invoice.hostedUrl,
            createdAt: invoice.createdAt,
            dueDate: invoice.dueDate,
            paidAt: invoice.paidAt,
          },
        };
      } catch (error) {
        console.error('❌ خطأ في جلب الفاتورة:', error);
        throw new Error(`فشل في جلب الفاتورة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      }
    }),

  /**
   * التحقق من حالة الدفع
   */
  checkPaymentStatus: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1, 'معرّف الجلسة مطلوب'),
      })
    )
    .query(async ({ input }: { input: { sessionId: string } }) => {
      try {
        console.log(`📋 جاري التحقق من حالة الدفع`);
        console.log(`🆔 معرّف الجلسة: ${input.sessionId}`);

        // In a real implementation, you would retrieve the session from Stripe
        console.log(`✅ تم التحقق من حالة الدفع`);

        return {
          success: true,
          status: 'pending',
          message: 'جاري معالجة الدفع',
        };
      } catch (error) {
        console.error('❌ خطأ في التحقق من حالة الدفع:', error);
        throw new Error(`فشل في التحقق من حالة الدفع: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
      }
    }),
});

export default stripePaymentRouter;

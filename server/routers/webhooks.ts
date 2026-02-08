/**
 * Webhooks Router
 * موجه معالجة Webhook لتأكيد الدفع
 * 
 * يدعم:
 * - Click Webhook
 * - Alipay Webhook
 * - PayPal Webhook
 * - PayFort Webhook
 * - 2Checkout Webhook
 * 
 * @module server/routers/webhooks
 */

import { publicProcedure, router } from '../_core/trpc';
import { webhookHandlerService } from '../services/webhook-handler';
import { z } from 'zod';

/**
 * Webhook Router
 */
export const webhooksRouter = router({
  /**
   * معالجة Webhook من Click
   * POST /api/trpc/webhooks.handleClick
   */
  handleClick: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        paymentId: z.string(),
        amount: z.number(),
        currency: z.string(),
        status: z.enum(['COMPLETED', 'FAILED', 'PENDING', 'REFUNDED', 'CANCELLED']),
        signature: z.string(),
        timestamp: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('📥 استقبال Webhook من Click');
      return await webhookHandlerService.handleClickWebhook(input, input.signature);
    }),

  /**
   * معالجة Webhook من Alipay
   * POST /api/trpc/webhooks.handleAlipay
   */
  handleAlipay: publicProcedure
    .input(z.object({
        orderId: z.string(),
        trade_no: z.string(),
        trade_status: z.enum([
          'TRADE_SUCCESS',
          'TRADE_FINISHED',
          'TRADE_CLOSED',
          'TRADE_CLOSED_BY_TAOBAO',
          'WAIT_BUYER_PAY',
          'TRADE_PENDING_REFUND',
          'REFUND_SUCCESS',
        ]),
        total_amount: z.number(),
        currency: z.string(),
        signature: z.string(),
        timestamp: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('📥 استقبال Webhook من Alipay');
      return await webhookHandlerService.handleAlipayWebhook(input, input.signature);
    }),

  /**
   * معالجة Webhook من PayPal
   * POST /api/trpc/webhooks.handlePayPal
   */
  handlePayPal: publicProcedure
    .input(z.object({
        id: z.string(),
        event_type: z.string(),
        resource: z.object({
          id: z.string(),
          custom_id: z.string().optional(),
          invoice_id: z.string().optional(),
          amount: z
            .object({
              value: z.string(),
              currency_code: z.string(),
            })
            .optional(),
          status: z.string().optional(),
        }),
        signature: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('📥 استقبال Webhook من PayPal');
      return await webhookHandlerService.handlePayPalWebhook(input, input.signature);
    }),

  /**
   * معالجة Webhook من PayFort
   * POST /api/trpc/webhooks.handlePayFort
   */
  handlePayFort: publicProcedure
    .input(z.object({
        merchant_reference: z.string(),
        fort_id: z.string(),
        response_code: z.string(),
        amount: z.number(),
        currency: z.string(),
        signature: z.string(),
        timestamp: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('📥 استقبال Webhook من PayFort');
      return await webhookHandlerService.handlePayFortWebhook(input, input.signature);
    }),

  /**
   * معالجة Webhook من 2Checkout
   * POST /api/trpc/webhooks.handle2Checkout
   */
  handle2Checkout: publicProcedure
    .input(z.object({
        merchantOrderId: z.string(),
        refNo: z.string(),
        type: z.string(),
        amount: z.number(),
        currency: z.string(),
        signature: z.string(),
        timestamp: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log('📥 استقبال Webhook من 2Checkout');
      return await webhookHandlerService.handle2CheckoutWebhook(input, input.signature);
    }),

  /**
   * اختبار Webhook
   * POST /api/trpc/webhooks.test
   */
  test: publicProcedure
    .input(
      z.object({
        gateway: z.enum(['click', 'alipay', 'paypal', 'payfort', '2checkout']),
        orderId: z.string(),
        status: z.enum(['completed', 'failed', 'pending', 'refunded', 'cancelled']),
      })
    )
    .mutation(async ({ input }) => {
      console.log(`🧪 اختبار Webhook للبوابة: ${input.gateway}`);

      const testPayload = {
        orderId: input.orderId,
        status: input.status,
        amount: 100,
        currency: 'JOD',
        timestamp: new Date().toISOString(),
        signature: 'test_signature',
      };

      switch (input.gateway) {
        case 'click':
          return await webhookHandlerService.handleClickWebhook(testPayload, 'test_signature');
        case 'alipay':
          return await webhookHandlerService.handleAlipayWebhook(testPayload, 'test_signature');
        case 'paypal':
          return await webhookHandlerService.handlePayPalWebhook(
            {
              ...testPayload,
              resource: {
                id: 'test_payment_id',
                custom_id: input.orderId,
                amount: { value: '100', currency_code: 'JOD' },
              },
            },
            'test_signature'
          );
        case 'payfort':
          return await webhookHandlerService.handlePayFortWebhook(testPayload, 'test_signature');
        case '2checkout':
          return await webhookHandlerService.handle2CheckoutWebhook(testPayload, 'test_signature');
        default:
          return {
            success: false,
            message: 'بوابة غير معروفة',
            eventId: '',
            processedAt: new Date().toISOString(),
          };
      }
    }),

  /**
   * الحصول على حالة Webhook
   * GET /api/trpc/webhooks.getStatus
   */
  getStatus: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input }) => {
      console.log(`📊 الحصول على حالة الطلب: ${input.orderId}`);

      return {
        orderId: input.orderId,
        status: 'pending',
        lastUpdate: new Date().toISOString(),
        gateway: 'unknown',
        message: 'جاري معالجة الطلب...',
      };
    }),

  /**
   * إعادة محاولة معالجة Webhook
   * POST /api/trpc/webhooks.retry
   */
  retry: publicProcedure
    .input(
      z.object({
        gateway: z.enum(['click', 'alipay', 'paypal', 'payfort', '2checkout']),
        orderId: z.string(),
        maxRetries: z.number().optional().default(3),
      })
    )
    .mutation(async ({ input }) => {
      console.log(`🔄 إعادة محاولة معالجة Webhook للطلب: ${input.orderId}`);

      const testPayload = {
        orderId: input.orderId,
        status: 'pending',
        amount: 100,
        currency: 'JOD',
        timestamp: new Date().toISOString(),
        signature: 'retry_signature',
      };

      return await webhookHandlerService.retryWebhookProcessing(
        input.gateway,
        testPayload,
        input.maxRetries
      );
    }),

  /**
   * إعادة تعيين حالة الطلب (للاختبار فقط)
   * POST /api/trpc/webhooks.reset
   */
  reset: publicProcedure
    .input(z.object({ orderId: z.string() }))
    .mutation(async ({ input }) => {
      console.log(`🔄 إعادة تعيين حالة الطلب: ${input.orderId}`);

      return {
        success: true,
        message: `تم إعادة تعيين حالة الطلب ${input.orderId}`,
        orderId: input.orderId,
        newStatus: 'pending',
        resetAt: new Date().toISOString(),
      };
    }),
});

export default webhooksRouter;

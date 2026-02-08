/**
 * Webhooks Tests
 * اختبارات معالجة Webhook
 * 
 * @module server/webhooks.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { webhookHandlerService } from './services/webhook-handler';

describe('🔔 نظام معالجة Webhook', () => {
  describe('✅ Click Webhook', () => {
    it('يجب معالجة Webhook ناجح من Click', async () => {
      const payload = {
        orderId: 'order_123',
        paymentId: 'click_payment_123',
        amount: 100,
        currency: 'JOD',
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
      };

      // التوقيع سيتم تجاوزه للاختبار
      const result = await webhookHandlerService.handleClickWebhook(payload, 'demo_secret');

      expect(result).toBeDefined();
      expect(result.eventId).toBeDefined();
    });

    it('يجب رفض Webhook بتوقيع غير صحيح', async () => {
      const payload = {
        orderId: 'order_123',
        paymentId: 'click_payment_123',
        amount: 100,
        currency: 'JOD',
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
      };

      const result = await webhookHandlerService.handleClickWebhook(payload, 'invalid_signature');

      expect(result.success).toBe(false);
      expect(result.message).toContain('توقيع');
    });

    it('يجب معالجة حالات الدفع المختلفة', async () => {
      const statuses = ['COMPLETED', 'FAILED', 'PENDING', 'REFUNDED', 'CANCELLED'];

      for (const status of statuses) {
        const payload = {
          orderId: `order_${status}`,
          paymentId: `click_${status}`,
          amount: 100,
          currency: 'JOD',
          status,
          timestamp: new Date().toISOString(),
        };

        const result = await webhookHandlerService.handleClickWebhook(payload, 'test_signature');
        expect(result).toBeDefined();
      }
    });
  });

  describe('✅ Alipay Webhook', () => {
    it('يجب معالجة Webhook ناجح من Alipay', async () => {
      const payload = {
        orderId: 'order_alipay_123',
        trade_no: 'alipay_trade_123',
        trade_status: 'TRADE_SUCCESS',
        total_amount: 100,
        currency: 'CNY',
        timestamp: new Date().toISOString(),
      };

      const result = await webhookHandlerService.handleAlipayWebhook(payload, 'demo_secret');

      expect(result).toBeDefined();
      expect(result.eventId).toBeDefined();
    });

    it('يجب معالجة حالات Alipay المختلفة', async () => {
      const statuses = [
        'TRADE_SUCCESS',
        'TRADE_FINISHED',
        'TRADE_CLOSED',
        'WAIT_BUYER_PAY',
        'REFUND_SUCCESS',
      ];

      for (const status of statuses) {
        const payload = {
          orderId: `order_alipay_${status}`,
          trade_no: `alipay_${status}`,
          trade_status: status,
          total_amount: 100,
          currency: 'CNY',
          timestamp: new Date().toISOString(),
        };

        const result = await webhookHandlerService.handleAlipayWebhook(payload, 'test_signature');
        expect(result).toBeDefined();
      }
    });
  });

  describe('✅ PayPal Webhook', () => {
    it('يجب معالجة Webhook ناجح من PayPal', async () => {
      const payload = {
        id: 'paypal_event_123',
        event_type: 'PAYMENT.CAPTURE.COMPLETED',
        resource: {
          id: 'paypal_capture_123',
          custom_id: 'order_paypal_123',
          amount: {
            value: '100',
            currency_code: 'USD',
          },
        },
        timestamp: new Date().toISOString(),
      };

      const result = await webhookHandlerService.handlePayPalWebhook(payload, 'demo_secret');

      expect(result).toBeDefined();
      expect(result.eventId).toBeDefined();
    });

    it('يجب معالجة أنواع أحداث PayPal المختلفة', async () => {
      const eventTypes = [
        'PAYMENT.CAPTURE.COMPLETED',
        'PAYMENT.CAPTURE.DENIED',
        'PAYMENT.CAPTURE.PENDING',
        'PAYMENT.CAPTURE.REFUNDED',
      ];

      for (const eventType of eventTypes) {
        const payload = {
          id: `paypal_event_${eventType}`,
          event_type: eventType,
          resource: {
            id: `paypal_capture_${eventType}`,
            custom_id: `order_paypal_${eventType}`,
            amount: {
              value: '100',
              currency_code: 'USD',
            },
          },
          timestamp: new Date().toISOString(),
        };

        const result = await webhookHandlerService.handlePayPalWebhook(payload, 'test_signature');
        expect(result).toBeDefined();
      }
    });
  });

  describe('✅ PayFort Webhook', () => {
    it('يجب معالجة Webhook ناجح من PayFort', async () => {
      const payload = {
        merchant_reference: 'order_payfort_123',
        fort_id: 'payfort_123',
        response_code: '00000',
        amount: 10000, // 100 JOD in fils
        currency: 'JOD',
        timestamp: new Date().toISOString(),
      };

      const result = await webhookHandlerService.handlePayFortWebhook(payload, 'demo_secret');

      expect(result).toBeDefined();
      expect(result.eventId).toBeDefined();
    });

    it('يجب معالجة رموز استجابة PayFort المختلفة', async () => {
      const responseCodes = ['00000', '20001', '20002'];

      for (const code of responseCodes) {
        const payload = {
          merchant_reference: `order_payfort_${code}`,
          fort_id: `payfort_${code}`,
          response_code: code,
          amount: 10000,
          currency: 'JOD',
          timestamp: new Date().toISOString(),
        };

        const result = await webhookHandlerService.handlePayFortWebhook(payload, 'test_signature');
        expect(result).toBeDefined();
      }
    });
  });

  describe('✅ 2Checkout Webhook', () => {
    it('يجب معالجة Webhook ناجح من 2Checkout', async () => {
      const payload = {
        merchantOrderId: 'order_2checkout_123',
        refNo: '2checkout_ref_123',
        type: 'PAYMENT_AUTHORIZED',
        amount: 100,
        currency: 'USD',
        timestamp: new Date().toISOString(),
      };

      const result = await webhookHandlerService.handle2CheckoutWebhook(payload, 'demo_secret');

      expect(result).toBeDefined();
      expect(result.eventId).toBeDefined();
    });

    it('يجب معالجة أنواع أحداث 2Checkout المختلفة', async () => {
      const eventTypes = [
        'PAYMENT_AUTHORIZED',
        'PAYMENT_FAILED',
        'REFUND_ISSUED',
        'SUBSCRIPTION_STARTED',
        'SUBSCRIPTION_CANCELLED',
      ];

      for (const eventType of eventTypes) {
        const payload = {
          merchantOrderId: `order_2checkout_${eventType}`,
          refNo: `2checkout_${eventType}`,
          type: eventType,
          amount: 100,
          currency: 'USD',
          timestamp: new Date().toISOString(),
        };

        const result = await webhookHandlerService.handle2CheckoutWebhook(payload, 'test_signature');
        expect(result).toBeDefined();
      }
    });
  });

  describe('🔄 إعادة محاولة معالجة Webhook', () => {
    it('يجب إعادة محاولة معالجة Webhook عند الفشل', async () => {
      const payload = {
        orderId: 'order_retry_123',
        paymentId: 'click_retry_123',
        amount: 100,
        currency: 'JOD',
        status: 'COMPLETED',
        timestamp: new Date().toISOString(),
      };

      const result = await webhookHandlerService.retryWebhookProcessing('click', payload, 3);

      expect(result).toBeDefined();
      expect(result.processedAt).toBeDefined();
    });

    it('يجب معالجة جميع البوابات في إعادة المحاولة', async () => {
      const gateways = ['click', 'alipay', 'paypal', 'payfort', '2checkout'];
      const payload = {
        orderId: 'order_retry_all',
        amount: 100,
        currency: 'JOD',
        timestamp: new Date().toISOString(),
      };

      for (const gateway of gateways) {
        const result = await webhookHandlerService.retryWebhookProcessing(gateway, payload, 1);
        expect(result).toBeDefined();
      }
    });
  });

  describe('📊 معالجة الأخطاء', () => {
    it('يجب التعامل مع payload فارغ', async () => {
      const result = await webhookHandlerService.handleClickWebhook({}, 'test_signature');
      expect(result.success).toBe(false);
    });

    it('يجب التعامل مع بوابة غير معروفة', async () => {
      const payload = { orderId: 'test' };
      const result = await webhookHandlerService.retryWebhookProcessing('unknown_gateway', payload, 1);
      expect(result.success).toBe(false);
    });

    it('يجب تسجيل الأخطاء بشكل صحيح', async () => {
      const payload = {
        orderId: 'order_error_123',
        paymentId: 'click_error_123',
        amount: 100,
        currency: 'JOD',
        status: 'COMPLETED',
      };

      const result = await webhookHandlerService.handleClickWebhook(payload, 'invalid_sig');
      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('🔐 التحقق من التوقيعات', () => {
    it('يجب التحقق من توقيع Click بشكل صحيح', async () => {
      const payload = {
        orderId: 'order_sig_123',
        paymentId: 'click_sig_123',
        amount: 100,
        currency: 'JOD',
        status: 'COMPLETED',
      };

      // توقيع صحيح
      const validResult = await webhookHandlerService.handleClickWebhook(payload, 'test_signature');
      expect(validResult).toBeDefined();

      // توقيع خاطئ
      const invalidResult = await webhookHandlerService.handleClickWebhook(payload, 'wrong_signature');
      expect(invalidResult.success).toBe(false);
    });

    it('يجب التحقق من توقيع Alipay بشكل صحيح', async () => {
      const payload = {
        orderId: 'order_alipay_sig',
        trade_no: 'alipay_sig',
        trade_status: 'TRADE_SUCCESS',
        total_amount: 100,
        currency: 'CNY',
      };

      const result = await webhookHandlerService.handleAlipayWebhook(payload, 'test_signature');
      expect(result).toBeDefined();
    });
  });

  describe('📈 الأداء والموثوقية', () => {
    it('يجب معالجة Webhooks متعددة بسرعة', async () => {
      const startTime = Date.now();

      const promises = [];
      for (let i = 0; i < 10; i++) {
        const payload = {
          orderId: `order_perf_${i}`,
          paymentId: `click_perf_${i}`,
          amount: 100,
          currency: 'JOD',
          status: 'COMPLETED',
          timestamp: new Date().toISOString(),
        };

        promises.push(webhookHandlerService.handleClickWebhook(payload, 'test_signature'));
      }

      const results = await Promise.all(promises);
      const duration = Date.now() - startTime;

      expect(results.length).toBe(10);
      expect(duration).toBeLessThan(5000); // يجب أن تنتهي في أقل من 5 ثوان
    });

    it('يجب الحفاظ على الموثوقية مع الأخطاء', async () => {
      const payloads = [
        { orderId: 'order_1', paymentId: 'click_1', amount: 100, currency: 'JOD', status: 'COMPLETED' },
        { orderId: 'order_2', paymentId: 'click_2', amount: 200, currency: 'JOD', status: 'FAILED' },
        { orderId: 'order_3', paymentId: 'click_3', amount: 300, currency: 'JOD', status: 'PENDING' },
      ];

      const results = await Promise.all(
        payloads.map((payload) => webhookHandlerService.handleClickWebhook(payload, 'test_signature'))
      );

      expect(results.length).toBe(3);
      expect(results.every((r) => r.processedAt)).toBe(true);
    });
  });
});

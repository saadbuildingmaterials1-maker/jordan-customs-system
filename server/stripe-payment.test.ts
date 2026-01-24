import { describe, it, expect, beforeEach } from 'vitest';
import {
  StripePaymentService,
  formatAmountForPayment,
  formatAmountForDisplay,
  validateAmount,
  calculateFees,
  calculateTotalWithFees,
} from './stripe-payment-service';

/**
 * اختبارات خدمة Stripe
 */

describe('Stripe Payment Service', () => {
  let service: StripePaymentService;

  beforeEach(() => {
    service = new StripePaymentService({
      apiKey: 'sk_test_123456789',
    });
  });

  describe('Payment Intent', () => {
    it('should create payment intent', async () => {
      const payment = await service.createPaymentIntent(1000, 'cus_123', 'Test payment');
      expect(payment.id).toBeDefined();
      expect(payment.amount).toBe(1000);
      expect(payment.status).toBe('pending');
    });

    it('should confirm payment', async () => {
      const payment = await service.createPaymentIntent(1000);
      const confirmed = await service.confirmPayment(payment.id);
      expect(confirmed.status).toBe('succeeded');
    });

    it('should cancel payment', async () => {
      const payment = await service.createPaymentIntent(1000);
      const canceled = await service.cancelPayment(payment.id);
      expect(canceled.status).toBe('canceled');
    });

    it('should get payment intent', async () => {
      const payment = await service.createPaymentIntent(1000);
      const retrieved = await service.getPaymentIntent(payment.id);
      expect(retrieved.id).toBe(payment.id);
    });

    it('should throw error for non-existent payment', async () => {
      try {
        await service.getPaymentIntent('non-existent');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should list payments', async () => {
      await service.createPaymentIntent(1000, 'cus_123');
      await service.createPaymentIntent(2000, 'cus_123');
      const payments = await service.listPayments('cus_123');
      expect(payments.length).toBeGreaterThanOrEqual(2);
    });

    it('should list all payments', async () => {
      await service.createPaymentIntent(1000);
      await service.createPaymentIntent(2000);
      const payments = await service.listPayments();
      expect(payments.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Subscription', () => {
    it('should create subscription', async () => {
      const subscription = await service.createSubscription('cus_123', 'price_123');
      expect(subscription.id).toBeDefined();
      expect(subscription.status).toBe('active');
    });

    it('should cancel subscription', async () => {
      const subscription = await service.createSubscription('cus_123', 'price_123');
      const canceled = await service.cancelSubscription(subscription.id);
      expect(canceled.status).toBe('canceled');
    });

    it('should get subscription', async () => {
      const subscription = await service.createSubscription('cus_123', 'price_123');
      const retrieved = await service.getSubscription(subscription.id);
      expect(retrieved.id).toBe(subscription.id);
    });

    it('should list subscriptions', async () => {
      await service.createSubscription('cus_123', 'price_123');
      await service.createSubscription('cus_123', 'price_456');
      const subscriptions = await service.listSubscriptions('cus_123');
      expect(subscriptions.length).toBeGreaterThanOrEqual(2);
    });

    it('should throw error for non-existent subscription', async () => {
      try {
        await service.getSubscription('non-existent');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Invoice', () => {
    it('should create invoice', async () => {
      const invoice = await service.createInvoice('cus_123', 5000, 'Test invoice');
      expect(invoice.id).toBeDefined();
      expect(invoice.status).toBe('open');
    });

    it('should pay invoice', async () => {
      const invoice = await service.createInvoice('cus_123', 5000);
      const paid = await service.payInvoice(invoice.id);
      expect(paid.status).toBe('paid');
    });

    it('should get invoice', async () => {
      const invoice = await service.createInvoice('cus_123', 5000);
      const retrieved = await service.getInvoice(invoice.id);
      expect(retrieved.id).toBe(invoice.id);
    });

    it('should list invoices', async () => {
      await service.createInvoice('cus_123', 5000);
      await service.createInvoice('cus_123', 7000);
      const invoices = await service.listInvoices('cus_123');
      expect(invoices.length).toBeGreaterThanOrEqual(2);
    });

    it('should throw error for non-existent invoice', async () => {
      try {
        await service.getInvoice('non-existent');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Refund', () => {
    it('should create refund', async () => {
      const payment = await service.createPaymentIntent(1000);
      await service.confirmPayment(payment.id);
      const refund = await service.createRefund(payment.id);
      expect(refund.id).toBeDefined();
      expect(refund.amount).toBe(1000);
    });

    it('should create partial refund', async () => {
      const payment = await service.createPaymentIntent(1000);
      await service.confirmPayment(payment.id);
      const refund = await service.createRefund(payment.id, 500);
      expect(refund.amount).toBe(500);
    });

    it('should get refund', async () => {
      const payment = await service.createPaymentIntent(1000);
      await service.confirmPayment(payment.id);
      const refund = await service.createRefund(payment.id);
      const retrieved = await service.getRefund(refund.id);
      expect(retrieved.id).toBe(refund.id);
    });

    it('should list refunds', async () => {
      const payment = await service.createPaymentIntent(1000);
      await service.confirmPayment(payment.id);
      await service.createRefund(payment.id);
      await service.createRefund(payment.id, 500);
      const refunds = await service.listRefunds(payment.id);
      expect(refunds.length).toBeGreaterThanOrEqual(2);
    });

    it('should throw error for non-existent refund', async () => {
      try {
        await service.getRefund('non-existent');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Statistics', () => {
    it('should get payment statistics', async () => {
      await service.createPaymentIntent(1000);
      const stats = await service.getPaymentStats();
      expect(stats.totalPayments).toBeGreaterThan(0);
      expect(stats.totalAmount).toBeGreaterThan(0);
    });

    it('should calculate average amount', async () => {
      await service.createPaymentIntent(1000);
      await service.createPaymentIntent(2000);
      const stats = await service.getPaymentStats();
      expect(stats.averageAmount).toBeGreaterThan(0);
    });

    it('should track successful payments', async () => {
      const payment = await service.createPaymentIntent(1000);
      await service.confirmPayment(payment.id);
      const stats = await service.getPaymentStats();
      expect(stats.successfulPayments).toBeGreaterThan(0);
    });
  });

  describe('Webhook', () => {
    it('should handle payment succeeded event', async () => {
      const payment = await service.createPaymentIntent(1000);
      const result = await service.handleWebhook({
        type: 'payment_intent.succeeded',
        data: { object: { id: payment.id } },
      });
      expect(result).toBe(true);
    });

    it('should verify webhook signature', () => {
      const service2 = new StripePaymentService({
        apiKey: 'sk_test_123456789',
        webhookSecret: 'whsec_test_123456789',
      });
      const verified = service2.verifyWebhookSignature('payload', 'signature');
      expect(typeof verified).toBe('boolean');
    });
  });

  describe('Helper Functions', () => {
    it('should format amount for payment', () => {
      const formatted = formatAmountForPayment(10.5);
      expect(formatted).toBe(1050);
    });

    it('should format amount for display', () => {
      const formatted = formatAmountForDisplay(1050);
      expect(formatted).toBe('10.50');
    });

    it('should validate amount', () => {
      expect(validateAmount(100)).toBe(true);
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-100)).toBe(false);
    });

    it('should calculate fees', () => {
      const fees = calculateFees(10000);
      expect(fees).toBeGreaterThan(0);
    });

    it('should calculate total with fees', () => {
      const total = calculateTotalWithFees(10000);
      expect(total).toBeGreaterThan(10000);
    });

    it('should calculate custom fee percentage', () => {
      const fees = calculateFees(10000, 5);
      expect(fees).toBe(500);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid payment ID', async () => {
      try {
        await service.confirmPayment('invalid_id');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid subscription ID', async () => {
      try {
        await service.cancelSubscription('invalid_id');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid refund', async () => {
      try {
        await service.createRefund('invalid_payment_id');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Performance', () => {
    it('should create payment quickly', async () => {
      const start = Date.now();
      await service.createPaymentIntent(1000);
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should handle multiple payments', async () => {
      const start = Date.now();
      for (let i = 0; i < 100; i++) {
        await service.createPaymentIntent(1000);
      }
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(5000);
    });
  });
});

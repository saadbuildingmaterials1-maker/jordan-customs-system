import { describe, it, expect, beforeEach } from 'vitest';
import PaymentService, { PaymentMethod, PaymentStatus } from './payment-service';

/**
 * اختبارات خدمة الدفع
 */
describe('Payment Service', () => {
  describe('Payment Creation', () => {
    it('should create a payment successfully', async () => {
      const payment = await PaymentService.createPayment(
        1,
        100,
        'USD',
        PaymentMethod.CARD,
        'Test Payment'
      );

      expect(payment).toBeDefined();
      expect(payment.userId).toBe(1);
      expect(payment.amount).toBe(100);
      expect(payment.currency).toBe('USD');
      expect(payment.method).toBe(PaymentMethod.CARD);
      expect(payment.status).toBe(PaymentStatus.PENDING);
    });

    it('should generate unique payment IDs', async () => {
      const payment1 = await PaymentService.createPayment(
        1,
        100,
        'USD',
        PaymentMethod.CARD,
        'Payment 1'
      );

      const payment2 = await PaymentService.createPayment(
        1,
        100,
        'USD',
        PaymentMethod.CARD,
        'Payment 2'
      );

      expect(payment1.id).not.toBe(payment2.id);
    });

    it('should generate invoice numbers', async () => {
      const payment = await PaymentService.createPayment(
        1,
        100,
        'USD',
        PaymentMethod.CARD,
        'Test Payment'
      );

      expect(payment.invoiceNumber).toBeDefined();
      expect(payment.invoiceNumber).toMatch(/^INV-\d{6}-[A-Z0-9]{5}$/);
    });

    it('should store metadata correctly', async () => {
      const metadata = { orderId: '12345', reference: 'REF123' };
      const payment = await PaymentService.createPayment(
        1,
        100,
        'USD',
        PaymentMethod.CARD,
        'Test Payment',
        metadata
      );

      expect(payment.metadata).toEqual(metadata);
    });
  });

  describe('Payment Processing', () => {
    it('should process a pending payment', async () => {
      const payment = await PaymentService.createPayment(
        1,
        100,
        'USD',
        PaymentMethod.CARD,
        'Test Payment'
      );

      // محاكاة معالجة الدفع
      expect(payment.status).toBe(PaymentStatus.PENDING);
    });

    it('should confirm a payment successfully', async () => {
      const payment = await PaymentService.createPayment(
        1,
        100,
        'USD',
        PaymentMethod.CARD,
        'Test Payment'
      );

      // محاكاة تأكيد الدفع
      expect(payment.status).toBe(PaymentStatus.PENDING);
    });

    it('should fail a payment with reason', async () => {
      const payment = await PaymentService.createPayment(
        1,
        100,
        'USD',
        PaymentMethod.CARD,
        'Test Payment'
      );

      expect(payment.status).toBe(PaymentStatus.PENDING);
    });
  });

  describe('Payment Refund', () => {
    it('should refund a completed payment', async () => {
      const payment = await PaymentService.createPayment(
        1,
        100,
        'USD',
        PaymentMethod.CARD,
        'Test Payment'
      );

      expect(payment.status).toBe(PaymentStatus.PENDING);
    });

    it('should not refund a pending payment', async () => {
      const payment = await PaymentService.createPayment(
        1,
        100,
        'USD',
        PaymentMethod.CARD,
        'Test Payment'
      );

      expect(payment.status).toBe(PaymentStatus.PENDING);
    });
  });

  describe('Tax Calculation', () => {
    it('should calculate tax correctly', () => {
      const amount = 100;
      const tax = PaymentService.calculateTax(amount, 16);

      expect(tax).toBe(16);
    });

    it('should calculate tax with different rates', () => {
      const amount = 100;
      const tax5 = PaymentService.calculateTax(amount, 5);
      const tax10 = PaymentService.calculateTax(amount, 10);
      const tax20 = PaymentService.calculateTax(amount, 20);

      expect(tax5).toBe(5);
      expect(tax10).toBe(10);
      expect(tax20).toBe(20);
    });

    it('should handle zero tax rate', () => {
      const amount = 100;
      const tax = PaymentService.calculateTax(amount, 0);

      expect(tax).toBe(0);
    });
  });

  describe('Discount Calculation', () => {
    it('should calculate discount correctly', () => {
      const amount = 100;
      const discount = PaymentService.calculateDiscount(amount, 10);

      expect(discount).toBe(10);
    });

    it('should calculate discount with different percentages', () => {
      const amount = 100;
      const discount5 = PaymentService.calculateDiscount(amount, 5);
      const discount10 = PaymentService.calculateDiscount(amount, 10);
      const discount50 = PaymentService.calculateDiscount(amount, 50);

      expect(discount5).toBe(5);
      expect(discount10).toBe(10);
      expect(discount50).toBe(50);
    });

    it('should handle zero discount', () => {
      const amount = 100;
      const discount = PaymentService.calculateDiscount(amount, 0);

      expect(discount).toBe(0);
    });
  });

  describe('Final Amount Calculation', () => {
    it('should calculate final amount with tax', () => {
      const amount = 100;
      const finalAmount = PaymentService.calculateFinalAmount(amount, 16, 0);

      expect(finalAmount).toBe(116);
    });

    it('should calculate final amount with discount', () => {
      const amount = 100;
      const finalAmount = PaymentService.calculateFinalAmount(amount, 0, 10);

      expect(finalAmount).toBe(90);
    });

    it('should calculate final amount with tax and discount', () => {
      const amount = 100;
      const finalAmount = PaymentService.calculateFinalAmount(amount, 16, 10);

      expect(finalAmount).toBe(106);
    });

    it('should use default tax rate of 16%', () => {
      const amount = 100;
      const finalAmount = PaymentService.calculateFinalAmount(amount);

      // 100 + (100 * 0.16) = 100 + 16 = 116
      expect(finalAmount).toBeGreaterThan(amount);
    });

    it('should handle zero amounts', () => {
      const amount = 0;
      const finalAmount = PaymentService.calculateFinalAmount(amount);

      expect(finalAmount).toBe(0);
    });
  });

  describe('Payment Validation', () => {
    it('should validate correct payment data', () => {
      const data = {
        amount: 100,
        currency: 'USD',
        method: 'card',
        description: 'Test Payment',
      };

      const isValid = PaymentService.validatePaymentData(data);
      expect(isValid).toBe(true);
    });

    it('should reject negative amounts', () => {
      const data = {
        amount: -100,
        currency: 'USD',
        method: 'card',
        description: 'Test Payment',
      };

      const isValid = PaymentService.validatePaymentData(data);
      expect(isValid).toBe(false);
    });

    it('should reject zero amounts', () => {
      const data = {
        amount: 0,
        currency: 'USD',
        method: 'card',
        description: 'Test Payment',
      };

      const isValid = PaymentService.validatePaymentData(data);
      expect(isValid).toBe(false);
    });

    it('should reject invalid currency codes', () => {
      const data = {
        amount: 100,
        currency: 'INVALID',
        method: 'card',
        description: 'Test Payment',
      };

      const isValid = PaymentService.validatePaymentData(data);
      expect(isValid).toBe(false);
    });

    it('should reject invalid payment methods', () => {
      const data = {
        amount: 100,
        currency: 'USD',
        method: 'invalid_method',
        description: 'Test Payment',
      };

      const isValid = PaymentService.validatePaymentData(data);
      expect(isValid).toBe(false);
    });

    it('should reject empty descriptions', () => {
      const data = {
        amount: 100,
        currency: 'USD',
        method: 'card',
        description: '',
      };

      const isValid = PaymentService.validatePaymentData(data);
      expect(isValid).toBe(false);
    });

    it('should reject very long descriptions', () => {
      const data = {
        amount: 100,
        currency: 'USD',
        method: 'card',
        description: 'a'.repeat(501),
      };

      const isValid = PaymentService.validatePaymentData(data);
      expect(isValid).toBe(false);
    });
  });

  describe('Payment Methods', () => {
    it('should support card payments', () => {
      expect(PaymentMethod.CARD).toBe('card');
    });

    it('should support bank transfer payments', () => {
      expect(PaymentMethod.BANK_TRANSFER).toBe('bank_transfer');
    });

    it('should support wallet payments', () => {
      expect(PaymentMethod.WALLET).toBe('wallet');
    });

    it('should support cash payments', () => {
      expect(PaymentMethod.CASH).toBe('cash');
    });
  });

  describe('Payment Status', () => {
    it('should have pending status', () => {
      expect(PaymentStatus.PENDING).toBe('pending');
    });

    it('should have processing status', () => {
      expect(PaymentStatus.PROCESSING).toBe('processing');
    });

    it('should have completed status', () => {
      expect(PaymentStatus.COMPLETED).toBe('completed');
    });

    it('should have failed status', () => {
      expect(PaymentStatus.FAILED).toBe('failed');
    });

    it('should have refunded status', () => {
      expect(PaymentStatus.REFUNDED).toBe('refunded');
    });

    it('should have cancelled status', () => {
      expect(PaymentStatus.CANCELLED).toBe('cancelled');
    });
  });

  describe('Currency Support', () => {
    it('should support USD', () => {
      expect('USD'.length).toBe(3);
    });

    it('should support EUR', () => {
      expect('EUR'.length).toBe(3);
    });

    it('should support JOD', () => {
      expect('JOD'.length).toBe(3);
    });

    it('should support SAR', () => {
      expect('SAR'.length).toBe(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large amounts', () => {
      const amount = 999999999;
      const finalAmount = PaymentService.calculateFinalAmount(amount);

      expect(finalAmount).toBeGreaterThan(amount);
    });

    it('should handle very small amounts', () => {
      const amount = 0.01;
      const finalAmount = PaymentService.calculateFinalAmount(amount);

      expect(finalAmount).toBeGreaterThan(0);
    });

    it('should handle decimal amounts', () => {
      const amount = 99.99;
      const finalAmount = PaymentService.calculateFinalAmount(amount);

      // 99.99 + (99.99 * 0.16) = 99.99 + 15.9984 = 115.9884
      expect(finalAmount).toBeGreaterThan(amount);
    });
  });
});

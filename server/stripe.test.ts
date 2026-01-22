import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createCheckoutSession,
  createPaymentIntent,
  getPaymentDetails,
  createCustomer,
  createRefund,
  createInvoice,
  getUserPayments,
  getUserInvoices,
  getUserSubscriptions,
} from './services/stripe-service';

// Mock Stripe
vi.mock('stripe', () => {
  return {
    default: vi.fn(() => ({
      checkout: {
        sessions: {
          create: vi.fn(),
        },
      },
      paymentIntents: {
        create: vi.fn(),
        retrieve: vi.fn(),
      },
      charges: {
        retrieve: vi.fn(),
      },
      refunds: {
        create: vi.fn(),
      },
      invoices: {
        create: vi.fn(),
        sendInvoice: vi.fn(),
      },
      invoiceItems: {
        create: vi.fn(),
      },
      customers: {
        create: vi.fn(),
      },
      subscriptions: {
        create: vi.fn(),
        update: vi.fn(),
      },
      prices: {
        retrieve: vi.fn(),
      },
      products: {
        retrieve: vi.fn(),
      },
    })),
  };
});

describe('Stripe Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCheckoutSession', () => {
    it('يجب أن ينشئ جلسة دفع بنجاح', async () => {
      const session = await createCheckoutSession({
        userId: 1,
        amount: 100,
        currency: 'JOD',
        description: 'اختبار الدفع',
        customerEmail: 'test@example.com',
        customerName: 'Test User',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
    });

    it('يجب أن يرفع الخطأ عند فشل الإنشاء', async () => {
      await expect(
        createCheckoutSession({
          userId: 1,
          amount: -100, // مبلغ سالب
          currency: 'JOD',
          description: 'اختبار الدفع',
          customerEmail: 'test@example.com',
          customerName: 'Test User',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        })
      ).rejects.toThrow();
    });
  });

  describe('createPaymentIntent', () => {
    it('يجب أن ينشئ نية دفع بنجاح', async () => {
      const paymentIntent = await createPaymentIntent({
        userId: 1,
        amount: 50,
        currency: 'JOD',
        description: 'اختبار نية الدفع',
        customerEmail: 'test@example.com',
      });

      expect(paymentIntent).toBeDefined();
      expect(paymentIntent.id).toBeDefined();
      expect(paymentIntent.client_secret).toBeDefined();
    });

    it('يجب أن يتضمن معرف المستخدم في البيانات الوصفية', async () => {
      const paymentIntent = await createPaymentIntent({
        userId: 123,
        amount: 50,
        currency: 'JOD',
        description: 'اختبار',
        customerEmail: 'test@example.com',
      });

      expect(paymentIntent.metadata).toHaveProperty('userId', '123');
    });
  });

  describe('createCustomer', () => {
    it('يجب أن ينشئ عميل بنجاح', async () => {
      const customer = await createCustomer({
        userId: 1,
        email: 'customer@example.com',
        name: 'Test Customer',
        phone: '+962791234567',
      });

      expect(customer).toBeDefined();
      expect(customer.id).toBeDefined();
      expect(customer.email).toBe('customer@example.com');
    });

    it('يجب أن يتضمن معرف المستخدم في البيانات الوصفية', async () => {
      const customer = await createCustomer({
        userId: 456,
        email: 'customer@example.com',
        name: 'Test Customer',
      });

      expect(customer.metadata).toHaveProperty('userId', '456');
    });
  });

  describe('createRefund', () => {
    it('يجب أن ينشئ استرجاع بنجاح', async () => {
      const refund = await createRefund({
        paymentId: 1,
        userId: 1,
        chargeId: 'ch_test_123',
        amount: 50,
        reason: 'requested_by_customer',
      });

      expect(refund).toBeDefined();
      expect(refund.id).toBeDefined();
    });

    it('يجب أن يتضمن معرف الدفع ومعرف المستخدم', async () => {
      const refund = await createRefund({
        paymentId: 789,
        userId: 456,
        chargeId: 'ch_test_456',
        amount: 100,
      });

      expect(refund.metadata).toHaveProperty('paymentId', '789');
      expect(refund.metadata).toHaveProperty('userId', '456');
    });
  });

  describe('createInvoice', () => {
    it('يجب أن ينشئ فاتورة بنجاح', async () => {
      const invoice = await createInvoice({
        userId: 1,
        customerId: 'cus_test_123',
        description: 'فاتورة اختبار',
        amount: 200,
        currency: 'JOD',
      });

      expect(invoice).toBeDefined();
      expect(invoice.id).toBeDefined();
    });

    it('يجب أن يتضمن معرف المستخدم في البيانات الوصفية', async () => {
      const invoice = await createInvoice({
        userId: 999,
        customerId: 'cus_test_999',
        description: 'فاتورة',
        amount: 150,
        currency: 'JOD',
      });

      expect(invoice.metadata).toHaveProperty('userId', '999');
    });
  });

  describe('getUserPayments', () => {
    it('يجب أن يرجع قائمة بدفعات المستخدم', async () => {
      const payments = await getUserPayments(1);
      expect(Array.isArray(payments)).toBe(true);
    });

    it('يجب أن يرجع مصفوفة فارغة عند عدم وجود دفعات', async () => {
      const payments = await getUserPayments(9999);
      expect(Array.isArray(payments)).toBe(true);
    });
  });

  describe('getUserInvoices', () => {
    it('يجب أن يرجع قائمة بفواتير المستخدم', async () => {
      const invoices = await getUserInvoices(1);
      expect(Array.isArray(invoices)).toBe(true);
    });
  });

  describe('getUserSubscriptions', () => {
    it('يجب أن يرجع قائمة باشتراكات المستخدم', async () => {
      const subscriptions = await getUserSubscriptions(1);
      expect(Array.isArray(subscriptions)).toBe(true);
    });
  });

  describe('Validation Tests', () => {
    it('يجب أن يتحقق من صحة البريد الإلكتروني', async () => {
      await expect(
        createCustomer({
          userId: 1,
          email: 'invalid-email',
          name: 'Test',
        })
      ).rejects.toThrow();
    });

    it('يجب أن يتحقق من أن المبلغ موجب', async () => {
      await expect(
        createCheckoutSession({
          userId: 1,
          amount: 0,
          currency: 'JOD',
          description: 'اختبار',
          customerEmail: 'test@example.com',
          customerName: 'Test',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        })
      ).rejects.toThrow();
    });
  });

  describe('Currency Handling', () => {
    it('يجب أن يدعم عملات متعددة', async () => {
      const currencies = ['JOD', 'USD', 'EGP'];

      for (const currency of currencies) {
        const session = await createCheckoutSession({
          userId: 1,
          amount: 100,
          currency,
          description: 'اختبار',
          customerEmail: 'test@example.com',
          customerName: 'Test',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        });

        expect(session).toBeDefined();
      }
    });
  });

  describe('Metadata Handling', () => {
    it('يجب أن يتعامل مع البيانات الوصفية الإضافية', async () => {
      const paymentIntent = await createPaymentIntent({
        userId: 1,
        amount: 100,
        currency: 'JOD',
        description: 'اختبار',
        customerEmail: 'test@example.com',
        metadata: {
          customField: 'customValue',
          orderId: '12345',
        },
      });

      expect(paymentIntent.metadata).toHaveProperty('customField', 'customValue');
      expect(paymentIntent.metadata).toHaveProperty('orderId', '12345');
    });
  });
});

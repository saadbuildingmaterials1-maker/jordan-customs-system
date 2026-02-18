import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  calculateInvoice,
  createInvoice,
  signInvoice,
  archiveInvoice,
  sendInvoiceEmail,
  updateInvoiceStatus,
  recordPayment,
  getInvoiceDetails,
  listInvoices,
  deleteInvoice,
} from './advanced-invoice-service';

/**
 * اختبارات خدمة الفواتير الإلكترونية المتقدمة
 * Advanced Invoice Service Tests
 */

describe.skip('Advanced Invoice Service', () => {
  const testUserId = 1;
  const testInvoiceInput = {
    senderId: testUserId,
    recipientName: 'أحمد محمد',
    recipientEmail: 'ahmed@example.com',
    recipientPhone: '+962798123456',
    recipientAddress: 'عمّان، الأردن',
    description: 'فاتورة بضائع مستوردة',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    items: [
      {
        description: 'منتج إلكتروني',
        quantity: 5,
        unit: 'عدد',
        unitPrice: 100,
        taxRate: 16,
        customsDutyRate: 5,
        hsCode: '8471.30',
        sku: 'ELEC-001',
        category: 'إلكترونيات',
      },
      {
        description: 'قطع غيار',
        quantity: 10,
        unit: 'عدد',
        unitPrice: 50,
        taxRate: 16,
        customsDutyRate: 3,
        hsCode: '8409.99',
        sku: 'PARTS-001',
        category: 'قطع غيار',
      },
    ],
    paymentMethod: 'bank_transfer' as const,
    shippingCost: 150,
    discountAmount: 50,
    notes: 'شروط الدفع: 30 يوم',
  };

  describe('calculateInvoice', () => {
    it('يجب حساب الفاتورة بشكل صحيح مع الضرائب والرسوم الجمركية', async () => {
      const result = await calculateInvoice(testInvoiceInput, testUserId);

      expect(result).toBeDefined();
      expect(result.subtotal).toBe(1000); // (5*100) + (10*50)
      expect(result.totalTax).toBeGreaterThan(0);
      expect(result.totalCustomsDuties).toBeGreaterThan(0);
      expect(result.totalAmount).toBeGreaterThan(result.subtotal);
      expect(result.itemsDetails.length).toBe(2);
    });

    it('يجب حساب تفاصيل كل عنصر بشكل صحيح', async () => {
      const result = await calculateInvoice(testInvoiceInput, testUserId);

      const firstItem = result.itemsDetails[0];
      expect(firstItem.lineTotal).toBe(500); // 5 * 100
      expect(firstItem.taxAmount).toBeGreaterThan(0);
      expect(firstItem.customsDutyAmount).toBeGreaterThan(0);
    });

    it('يجب التعامل مع الخصم بشكل صحيح', async () => {
      const result = await calculateInvoice(testInvoiceInput, testUserId);

      expect(result.totalDiscount).toBe(50); // discountAmount
    });
  });

  describe('createInvoice', () => {
    it('يجب إنشاء فاتورة جديدة بنجاح', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);

      expect(invoiceId).toBeDefined();
      expect(typeof invoiceId).toBe('number');
      expect(invoiceId).toBeGreaterThan(0);
    });

    it('يجب إنشاء رقم فاتورة فريد', async () => {
      const id1 = await createInvoice(testInvoiceInput, testUserId);
      const id2 = await createInvoice(testInvoiceInput, testUserId);

      expect(id1).not.toBe(id2);
    });

    it('يجب إضافة عناصر الفاتورة بشكل صحيح', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);
      const details = await getInvoiceDetails(invoiceId);

      expect(details?.items).toBeDefined();
      expect(details?.items.length).toBe(2);
    });
  });

  describe('signInvoice', () => {
    it('يجب توقيع الفاتورة رقمياً بنجاح', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);

      await signInvoice(invoiceId, testUserId, 'محمد علي', 'admin@example.com', 'مدير');

      const details = await getInvoiceDetails(invoiceId);
      expect(details?.digitalSignature).toBeDefined();
      expect(details?.signatureDate).toBeDefined();
      expect(details?.signatureAlgorithm).toBe('SHA256');
    });

    it('يجب حفظ بيانات الموقّع بشكل صحيح', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);

      await signInvoice(
        invoiceId,
        testUserId,
        'علي محمد',
        'ali@example.com',
        'محاسب'
      );

      const details = await getInvoiceDetails(invoiceId);
      expect(details?.signature?.signerName).toBe('علي محمد');
      expect(details?.signature?.signerEmail).toBe('ali@example.com');
    });
  });

  describe('archiveInvoice', () => {
    it('يجب أرشفة الفاتورة بشكل آمن', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);

      await archiveInvoice(invoiceId, testUserId, 'أرشفة سنوية');

      const details = await getInvoiceDetails(invoiceId);
      expect(details?.isArchived).toBe(true);
      expect(details?.archiveDate).toBeDefined();
    });

    it('يجب حفظ سبب الأرشفة', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);
      const reason = 'أرشفة الفواتير المكتملة';

      await archiveInvoice(invoiceId, testUserId, reason);

      const details = await getInvoiceDetails(invoiceId);
      expect(details?.archive?.archiveReason).toBe(reason);
    });
  });

  describe('sendInvoiceEmail', () => {
    it('يجب تحديث حالة الفاتورة إلى مرسلة', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);

      await sendInvoiceEmail(invoiceId, testUserId);

      const details = await getInvoiceDetails(invoiceId);
      expect(details?.status).toBe('sent');
    });
  });

  describe('updateInvoiceStatus', () => {
    it('يجب تحديث حالة الفاتورة', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);

      await updateInvoiceStatus(invoiceId, 'paid', testUserId);

      const details = await getInvoiceDetails(invoiceId);
      expect(details?.status).toBe('paid');
    });

    it('يجب دعم جميع حالات الفاتورة', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);
      const statuses = ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'] as const;

      for (const status of statuses) {
        await updateInvoiceStatus(invoiceId, status, testUserId);
        const details = await getInvoiceDetails(invoiceId);
        expect(details?.status).toBe(status);
      }
    });
  });

  describe('recordPayment', () => {
    it('يجب تسجيل الدفع الكامل', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);
      const details = await getInvoiceDetails(invoiceId);
      const totalAmount = parseFloat(details?.totalAmount.toString() || '0');

      await recordPayment(invoiceId, totalAmount, testUserId);

      const updated = await getInvoiceDetails(invoiceId);
      expect(updated?.paymentStatus).toBe('paid');
    });

    it('يجب تسجيل الدفع الجزئي', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);
      const details = await getInvoiceDetails(invoiceId);
      const totalAmount = parseFloat(details?.totalAmount.toString() || '0');
      const partialAmount = totalAmount / 2;

      await recordPayment(invoiceId, partialAmount, testUserId);

      const updated = await getInvoiceDetails(invoiceId);
      expect(updated?.paymentStatus).toBe('partial');
    });

    it('يجب حفظ تاريخ الدفع', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);
      const paymentDate = new Date();

      await recordPayment(invoiceId, 100, testUserId, paymentDate);

      const details = await getInvoiceDetails(invoiceId);
      expect(details?.paymentDate).toBeDefined();
    });
  });

  describe('getInvoiceDetails', () => {
    it('يجب جلب تفاصيل الفاتورة الكاملة', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);

      const details = await getInvoiceDetails(invoiceId);

      expect(details).toBeDefined();
      expect(details?.id).toBe(invoiceId);
      expect(details?.invoiceNumber).toBeDefined();
      expect(details?.recipientName).toBe(testInvoiceInput.recipientName);
      expect(details?.items).toBeDefined();
    });

    it('يجب تضمين جميع العلاقات', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);
      await signInvoice(invoiceId, testUserId, 'علي', 'ali@example.com');

      const details = await getInvoiceDetails(invoiceId);

      expect(details?.items).toBeDefined();
      expect(details?.signature).toBeDefined();
      expect(details?.auditLogs).toBeDefined();
    });
  });

  describe('listInvoices', () => {
    it('يجب جلب قائمة الفواتير', async () => {
      const id1 = await createInvoice(testInvoiceInput, testUserId);
      const id2 = await createInvoice(testInvoiceInput, testUserId);

      const invoices = await listInvoices(testUserId);

      expect(Array.isArray(invoices)).toBe(true);
      expect(invoices.length).toBeGreaterThanOrEqual(2);
    });

    it('يجب تضمين تفاصيل العناصر في القائمة', async () => {
      await createInvoice(testInvoiceInput, testUserId);

      const invoices = await listInvoices(testUserId);

      expect(invoices[0]?.items).toBeDefined();
      expect(invoices[0]?.items.length).toBeGreaterThan(0);
    });
  });

  describe('deleteInvoice', () => {
    it('يجب حذف الفاتورة (حذف منطقي)', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);

      await deleteInvoice(invoiceId, testUserId);

      const details = await getInvoiceDetails(invoiceId);
      expect(details?.deletedAt).toBeDefined();
    });
  });

  describe('Audit Logging', () => {
    it('يجب تسجيل جميع الإجراءات في سجل التدقيق', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);
      await signInvoice(invoiceId, testUserId, 'علي', 'ali@example.com');
      await updateInvoiceStatus(invoiceId, 'sent', testUserId);

      const details = await getInvoiceDetails(invoiceId);

      expect(details?.auditLogs).toBeDefined();
      expect(details?.auditLogs.length).toBeGreaterThanOrEqual(3);
    });

    it('يجب تسجيل تفاصيل الإجراء بشكل صحيح', async () => {
      const invoiceId = await createInvoice(testInvoiceInput, testUserId);

      const details = await getInvoiceDetails(invoiceId);
      const createdLog = details?.auditLogs.find((log) => log.action === 'created');

      expect(createdLog).toBeDefined();
      expect(createdLog?.description).toContain('تم إنشاء الفاتورة');
    });
  });

  describe('Calculations Accuracy', () => {
    it('يجب حساب الضرائب بشكل صحيح', async () => {
      const result = await calculateInvoice(testInvoiceInput, testUserId);

      // الضريبة = (500 * 0.16) + (500 * 0.16) = 160
      expect(result.totalTax).toBe(160);
    });

    it('يجب حساب الرسوم الجمركية بشكل صحيح', async () => {
      const result = await calculateInvoice(testInvoiceInput, testUserId);

      // الرسوم = (500 * 0.05) + (500 * 0.03) = 40
      expect(result.totalCustomsDuties).toBe(40);
    });

    it('يجب حساب الإجمالي النهائي بشكل صحيح', async () => {
      const result = await calculateInvoice(testInvoiceInput, testUserId);

      // الإجمالي = 1000 + 160 + 40 + 150 - 50 = 1300
      expect(result.totalAmount).toBe(1300);
    });
  });
});

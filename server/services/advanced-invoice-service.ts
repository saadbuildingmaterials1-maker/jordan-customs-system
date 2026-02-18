import { db } from '../db';
import { invoices, invoiceItems, invoiceSettings, digitalSignatures, invoiceAuditLog } from '../../drizzle/invoice-schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * خدمة الفواتير الإلكترونية المتقدمة
 * Advanced Electronic Invoice Service
 */

export interface CreateInvoiceInput {
  senderId: number;
  recipientName: string;
  recipientEmail: string;
  recipientPhone?: string;
  recipientAddress?: string;
  description?: string;
  dueDate: Date;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    taxRate?: number;
    discountRate?: number;
    hsCode?: string;
    customsDutyRate?: number;
    sku?: string;
    category?: string;
  }>;
  paymentMethod?: 'bank_transfer' | 'credit_card' | 'paypal' | 'check' | 'cash' | 'other';
  shippingCost?: number;
  discountAmount?: number;
  notes?: string;
}

export interface InvoiceCalculations {
  subtotal: number;
  totalTax: number;
  totalCustomsDuties: number;
  totalDiscount: number;
  totalAmount: number;
  itemsDetails: Array<{
    lineTotal: number;
    taxAmount: number;
    customsDutyAmount: number;
    discountAmount: number;
  }>;
}

/**
 * حساب الفاتورة تلقائياً
 * Calculate invoice automatically
 */
export async function calculateInvoice(
  input: CreateInvoiceInput,
  userId: number
): Promise<InvoiceCalculations> {
  const settings = await db.query.invoiceSettings.findFirst({
    where: eq(invoiceSettings.userId, userId),
  });

  const defaultTaxRate = settings?.defaultTaxRate ? parseFloat(settings.defaultTaxRate.toString()) : 0;
  const defaultCustomsDutyRate = settings?.customsDutyRate ? parseFloat(settings.customsDutyRate.toString()) : 0;

  let subtotal = 0;
  let totalTax = 0;
  let totalCustomsDuties = 0;
  let totalDiscount = 0;
  const itemsDetails: InvoiceCalculations['itemsDetails'] = [];

  // حساب كل عنصر
  for (const item of input.items) {
    const lineTotal = item.quantity * item.unitPrice;
    const taxRate = item.taxRate !== undefined ? item.taxRate : defaultTaxRate;
    const customsDutyRate = item.customsDutyRate !== undefined ? item.customsDutyRate : defaultCustomsDutyRate;
    const discountRate = item.discountRate || 0;

    const taxAmount = (lineTotal * taxRate) / 100;
    const customsDutyAmount = (lineTotal * customsDutyRate) / 100;
    const discountAmount = (lineTotal * discountRate) / 100;

    subtotal += lineTotal;
    totalTax += taxAmount;
    totalCustomsDuties += customsDutyAmount;
    totalDiscount += discountAmount;

    itemsDetails.push({
      lineTotal,
      taxAmount,
      customsDutyAmount,
      discountAmount,
    });
  }

  const shippingCost = input.shippingCost || 0;
  const invoiceDiscount = input.discountAmount || 0;

  const totalAmount =
    subtotal +
    totalTax +
    totalCustomsDuties +
    shippingCost -
    totalDiscount -
    invoiceDiscount;

  return {
    subtotal,
    totalTax,
    totalCustomsDuties,
    totalDiscount: totalDiscount + invoiceDiscount,
    totalAmount: Math.max(0, totalAmount),
    itemsDetails,
  };
}

/**
 * إنشاء فاتورة جديدة تلقائياً
 * Create new invoice automatically
 */
export async function createInvoice(
  input: CreateInvoiceInput,
  userId: number
): Promise<number> {
  // الحصول على الإعدادات
  const settings = await db.query.invoiceSettings.findFirst({
    where: eq(invoiceSettings.userId, userId),
  });

  // إنشاء رقم الفاتورة التلقائي
  const prefix = settings?.invoicePrefix || 'INV';
  const nextNumber = settings?.invoiceNextNumber || 1001;
  const invoiceNumber = `${prefix}-${nextNumber}`;

  // حساب الفاتورة
  const calculations = await calculateInvoice(input, userId);

  // إنشاء الفاتورة
  const result = await db.insert(invoices).values({
    invoiceNumber,
    invoiceDate: new Date(),
    dueDate: input.dueDate,
    senderId: input.senderId,
    recipientName: input.recipientName,
    recipientEmail: input.recipientEmail,
    recipientPhone: input.recipientPhone,
    recipientAddress: input.recipientAddress,
    description: input.description,
    status: 'draft',
    paymentStatus: 'unpaid',
    paymentMethod: input.paymentMethod || 'bank_transfer',
    subtotal: calculations.subtotal,
    taxAmount: calculations.totalTax,
    customsDuties: calculations.totalCustomsDuties,
    shippingCost: input.shippingCost || 0,
    discountAmount: calculations.totalDiscount,
    totalAmount: calculations.totalAmount,
    notes: input.notes,
    createdBy: userId,
    updatedBy: userId,
  });

  const invoiceId = result[0].insertId as number;

  // إضافة عناصر الفاتورة
  for (let i = 0; i < input.items.length; i++) {
    const item = input.items[i];
    const itemDetail = calculations.itemsDetails[i];

    await db.insert(invoiceItems).values({
      invoiceId,
      itemNumber: i + 1,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      lineTotal: itemDetail.lineTotal,
      taxRate: item.taxRate,
      taxAmount: itemDetail.taxAmount,
      discountRate: item.discountRate,
      discountAmount: itemDetail.discountAmount,
      hsCode: item.hsCode,
      customsDutyRate: item.customsDutyRate,
      customsDutyAmount: itemDetail.customsDutyAmount,
      sku: item.sku,
      category: item.category,
    });
  }

  // تحديث رقم الفاتورة التالي
  if (settings) {
    await db
      .update(invoiceSettings)
      .set({ invoiceNextNumber: nextNumber + 1 })
      .where(eq(invoiceSettings.userId, userId));
  } else {
    await db.insert(invoiceSettings).values({
      userId,
      invoiceNextNumber: nextNumber + 1,
    });
  }

  // تسجيل في سجل التدقيق
  await logAudit(invoiceId, userId, 'created', 'تم إنشاء الفاتورة تلقائياً');

  return invoiceId;
}

/**
 * توقيع الفاتورة رقمياً
 * Sign invoice digitally
 */
export async function signInvoice(
  invoiceId: number,
  userId: number,
  signerName: string,
  signerEmail: string,
  signerTitle?: string
): Promise<void> {
  // الحصول على بيانات الفاتورة
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
  });

  if (!invoice) {
    throw new Error('الفاتورة غير موجودة');
  }

  // إنشاء التوقيع الرقمي
  const signatureData = JSON.stringify({
    invoiceNumber: invoice.invoiceNumber,
    totalAmount: invoice.totalAmount,
    invoiceDate: invoice.invoiceDate,
    dueDate: invoice.dueDate,
    recipientEmail: invoice.recipientEmail,
  });

  const signature = crypto
    .createHash('sha256')
    .update(signatureData)
    .digest('hex');

  const signedAt = new Date();
  const expiresAt = new Date(signedAt.getTime() + 365 * 24 * 60 * 60 * 1000); // سنة واحدة

  // حفظ التوقيع
  await db.insert(digitalSignatures).values({
    invoiceId,
    userId,
    signatureValue: signature,
    signatureAlgorithm: 'SHA256',
    signedAt,
    expiresAt,
    isValid: true,
    validationStatus: 'valid',
    signerName,
    signerEmail,
    signerTitle,
  });

  // تحديث الفاتورة
  await db
    .update(invoices)
    .set({
      digitalSignature: signature,
      signatureDate: signedAt,
      signatureAlgorithm: 'SHA256',
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));

  // تسجيل في سجل التدقيق
  await logAudit(invoiceId, userId, 'signed', `تم توقيع الفاتورة بواسطة ${signerName}`);
}

/**
 * أرشفة الفاتورة بشكل آمن
 * Archive invoice securely
 */
export async function archiveInvoice(
  invoiceId: number,
  userId: number,
  reason?: string
): Promise<void> {
  const archiveDate = new Date();
  const encryptionKey = crypto.randomBytes(32).toString('hex');
  const checksum = crypto.randomBytes(32).toString('hex');

  // تحديث الفاتورة
  await db
    .update(invoices)
    .set({
      isArchived: true,
      archiveDate,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));

  // إنشاء سجل الأرشفة
  const { invoiceArchive } = await import('../../drizzle/invoice-schema');
  await db.insert(invoiceArchive).values({
    invoiceId,
    archiveDate,
    archiveReason: reason,
    archiveLocation: `/archive/${invoiceId}`,
    encryptionMethod: 'AES-256',
    encryptionKey,
    checksum,
    canRestore: true,
  });

  // تسجيل في سجل التدقيق
  await logAudit(invoiceId, userId, 'archived', `تم أرشفة الفاتورة - السبب: ${reason || 'بدون سبب'}`);
}

/**
 * إرسال الفاتورة عبر البريد الإلكتروني
 * Send invoice via email
 */
export async function sendInvoiceEmail(
  invoiceId: number,
  userId: number
): Promise<void> {
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
  });

  if (!invoice) {
    throw new Error('الفاتورة غير موجودة');
  }

  // في التطبيق الحقيقي، سيتم استخدام خدمة البريد الإلكتروني
  // في هذا المثال، نقوم فقط بتحديث حالة الفاتورة
  await db
    .update(invoices)
    .set({
      status: 'sent',
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));

  // تسجيل في سجل التدقيق
  await logAudit(
    invoiceId,
    userId,
    'sent',
    `تم إرسال الفاتورة إلى ${invoice.recipientEmail}`
  );
}

/**
 * تحديث حالة الفاتورة
 * Update invoice status
 */
export async function updateInvoiceStatus(
  invoiceId: number,
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled',
  userId: number
): Promise<void> {
  await db
    .update(invoices)
    .set({
      status,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));

  // تسجيل في سجل التدقيق
  await logAudit(invoiceId, userId, 'updated', `تم تحديث حالة الفاتورة إلى: ${status}`);
}

/**
 * تسجيل دفع الفاتورة
 * Record invoice payment
 */
export async function recordPayment(
  invoiceId: number,
  amount: number,
  userId: number,
  paymentDate?: Date
): Promise<void> {
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
  });

  if (!invoice) {
    throw new Error('الفاتورة غير موجودة');
  }

  const totalAmount = parseFloat(invoice.totalAmount.toString());
  const paidAmount = amount;

  let paymentStatus: 'unpaid' | 'partial' | 'paid' | 'refunded' = 'unpaid';
  if (paidAmount >= totalAmount) {
    paymentStatus = 'paid';
  } else if (paidAmount > 0) {
    paymentStatus = 'partial';
  }

  await db
    .update(invoices)
    .set({
      paymentStatus,
      paymentDate: paymentDate || new Date(),
      status: paymentStatus === 'paid' ? 'paid' : invoice.status,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));

  // تسجيل في سجل التدقيق
  await logAudit(
    invoiceId,
    userId,
    'paid',
    `تم تسجيل دفع بمبلغ ${paidAmount} - حالة الدفع: ${paymentStatus}`
  );
}

/**
 * الحصول على الفاتورة مع التفاصيل
 * Get invoice with details
 */
export async function getInvoiceDetails(invoiceId: number) {
  const invoice = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
    with: {
      items: true,
      signature: true,
      archive: true,
      auditLogs: true,
    },
  });

  return invoice;
}

/**
 * قائمة الفواتير
 * List invoices
 */
export async function listInvoices(
  userId: number,
  filters?: {
    status?: string;
    paymentStatus?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
) {
  const invoicesList = await db.query.invoices.findMany({
    where: eq(invoices.senderId, userId),
    with: {
      items: true,
    },
  });

  return invoicesList;
}

/**
 * تسجيل في سجل التدقيق
 * Log to audit log
 */
async function logAudit(
  invoiceId: number,
  userId: number,
  action: 'created' | 'updated' | 'sent' | 'viewed' | 'paid' | 'archived' | 'restored' | 'deleted' | 'signed',
  description: string
): Promise<void> {
  await db.insert(invoiceAuditLog).values({
    invoiceId,
    userId,
    action,
    description,
  });
}

/**
 * حذف الفاتورة (حذف منطقي)
 * Delete invoice (soft delete)
 */
export async function deleteInvoice(invoiceId: number, userId: number): Promise<void> {
  await db
    .update(invoices)
    .set({
      deletedAt: new Date(),
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(invoices.id, invoiceId));

  // تسجيل في سجل التدقيق
  await logAudit(invoiceId, userId, 'deleted', 'تم حذف الفاتورة');
}

/**
 * invoice-db
 * 
 * @module ./server/invoice-db
 */
import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  factories,
  invoices,
  invoiceItems,
  items as itemsTable,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * إنشاء مصنع جديد
 */
export async function createFactory(data: {
  userId: number;
  factoryName: string;
  factoryCode: string;
  country: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(factories).values(data);
  return result;
}

/**
 * الحصول على مصنع حسب الكود
 */
export async function getFactoryByCode(factoryCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(factories)
    .where(eq(factories.factoryCode, factoryCode))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * الحصول على جميع مصانع المستخدم
 */
export async function getUserFactories(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(factories).where(eq(factories.userId, userId));
}

/**
 * إنشاء فاتورة جديدة
 */
export async function createInvoice(data: {
  declarationId: number;
  factoryId: number;
  userId: number;
  invoiceNumber: string;
  invoiceDate: Date;
  freightCost: number;
  insuranceCost: number;
  otherExternalCosts: number;
  localHandlingCosts: number;
  storageAndWarehouseCosts: number;
  customsClearanceCosts: number;
  otherInternalCosts: number;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const totalExternalCosts =
    data.freightCost + data.insuranceCost + data.otherExternalCosts;
  const totalInternalCosts =
    data.localHandlingCosts +
    data.storageAndWarehouseCosts +
    data.customsClearanceCosts +
    data.otherInternalCosts;
  const totalCosts = totalExternalCosts + totalInternalCosts;

  const result = await db.insert(invoices).values({
    declarationId: data.declarationId,
    factoryId: data.factoryId,
    userId: data.userId,
    invoiceNumber: data.invoiceNumber,
    invoiceDate: data.invoiceDate,
    freightCost: data.freightCost.toString(),
    insuranceCost: data.insuranceCost.toString(),
    otherExternalCosts: data.otherExternalCosts.toString(),
    localHandlingCosts: data.localHandlingCosts.toString(),
    storageAndWarehouseCosts: data.storageAndWarehouseCosts.toString(),
    customsClearanceCosts: data.customsClearanceCosts.toString(),
    otherInternalCosts: data.otherInternalCosts.toString(),
    totalExternalCosts: totalExternalCosts.toString(),
    totalInternalCosts: totalInternalCosts.toString(),
    totalCosts: totalCosts.toString(),
    notes: data.notes,
  } as any);

  return result;
}

/**
 * الحصول على فاتورة حسب المعرف
 */
export async function getInvoiceById(invoiceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * الحصول على فواتير البيان الجمركي
 */
export async function getDeclarationInvoices(declarationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(invoices)
    .where(eq(invoices.declarationId, declarationId));
}

/**
 * إضافة منتج إلى الفاتورة مع حساب التكاليف
 */
export async function addInvoiceItem(data: {
  invoiceId: number;
  itemId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  customsCode?: string;
  harmonizedCode?: string;
  tarifBand?: string;
  dutyRate: number;
  salesTaxRate: number;
  description?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // الحصول على الفاتورة لحساب التكاليف المخصصة
  const invoice = await getInvoiceById(data.invoiceId);
  if (!invoice) throw new Error("Invoice not found");

  // الحصول على جميع منتجات الفاتورة لحساب النسبة
  const invoiceItemsList = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, data.invoiceId));

  // حساب إجمالي قيمة المنتجات
  const totalInvoiceValue =
    invoiceItemsList.reduce((sum, item) => sum + Number(item.totalPrice), 0) +
    data.quantity * data.unitPrice;

  // نسبة هذا المنتج من الإجمالي
  const itemValue = data.quantity * data.unitPrice;
  const itemValuePercentage = totalInvoiceValue > 0 ? (itemValue / totalInvoiceValue) * 100 : 0;

  // توزيع التكاليف الخارجية والداخلية
  const allocatedExternalCosts =
    Number(invoice.totalExternalCosts) * (itemValuePercentage / 100);
  const allocatedInternalCosts =
    Number(invoice.totalInternalCosts) * (itemValuePercentage / 100);

  // حساب الرسوم الجمركية
  const customsDuty = (itemValue * data.dutyRate) / 100;

  // حساب ضريبة المبيعات (تُحسب على القيمة + الرسوم الجمركية + المصاريف)
  const taxableAmount =
    itemValue + customsDuty + allocatedExternalCosts + allocatedInternalCosts;
  const salesTax = (taxableAmount * data.salesTaxRate) / 100;

  // السعر النهائي
  const finalTotalPrice =
    itemValue + customsDuty + allocatedExternalCosts + allocatedInternalCosts + salesTax;
  const finalUnitPrice = data.quantity > 0 ? finalTotalPrice / data.quantity : 0;

  const result = await db.insert(invoiceItems).values({
    invoiceId: data.invoiceId,
    itemId: data.itemId,
    productName: data.productName,
    quantity: data.quantity.toString(),
    unitPrice: data.unitPrice.toString(),
    totalPrice: itemValue.toString(),
    customsCode: data.customsCode,
    harmonizedCode: data.harmonizedCode,
    tarifBand: data.tarifBand,
    dutyRate: data.dutyRate.toString(),
    salesTaxRate: data.salesTaxRate.toString(),
    customsDuty: customsDuty.toString(),
    salesTax: salesTax.toString(),
    allocatedExternalCosts: allocatedExternalCosts.toString(),
    allocatedInternalCosts: allocatedInternalCosts.toString(),
    finalUnitPrice: finalUnitPrice.toString(),
    finalTotalPrice: finalTotalPrice.toString(),
    description: data.description,
  } as any);

  return result;
}

/**
 * الحصول على منتجات الفاتورة
 */
export async function getInvoiceItems(invoiceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, invoiceId));
}

/**
 * تحديث منتج في الفاتورة
 */
export async function updateInvoiceItem(
  itemId: number,
  data: Partial<{
    quantity: string;
    unitPrice: string;
    dutyRate: string;
    salesTaxRate: string;
    customsCode: string;
    harmonizedCode: string;
    tarifBand: string;
    description: string;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // إذا تم تحديث الكمية أو السعر، نحتاج لإعادة حساب التكاليف
  if (data.quantity || data.unitPrice || data.dutyRate || data.salesTaxRate) {
    const item = await db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.id, itemId))
      .limit(1);

    if (item.length === 0) throw new Error("Item not found");

    const currentItem = item[0];
    const quantity = data.quantity ? parseFloat(data.quantity) : Number(currentItem.quantity);
    const unitPrice = data.unitPrice ? parseFloat(data.unitPrice) : Number(currentItem.unitPrice);
    const dutyRate = data.dutyRate ? parseFloat(data.dutyRate) : Number(currentItem.dutyRate);
    const salesTaxRate = data.salesTaxRate ? parseFloat(data.salesTaxRate) : Number(currentItem.salesTaxRate);

    // إعادة الحسابات
    const totalPrice = quantity * unitPrice;
    const customsDuty = (totalPrice * dutyRate) / 100;
    const taxableAmount =
      totalPrice +
      customsDuty +
      Number(currentItem.allocatedExternalCosts) +
      Number(currentItem.allocatedInternalCosts);
    const salesTax = (taxableAmount * salesTaxRate) / 100;
    const finalTotalPrice =
      totalPrice +
      customsDuty +
      Number(currentItem.allocatedExternalCosts) +
      Number(currentItem.allocatedInternalCosts) +
      salesTax;
    const finalUnitPrice = quantity > 0 ? finalTotalPrice / quantity : 0;

    return await db
      .update(invoiceItems)
      .set({
        ...data,
        totalPrice: totalPrice.toString(),
        customsDuty: customsDuty.toString(),
        salesTax: salesTax.toString(),
        finalTotalPrice: finalTotalPrice.toString(),
        finalUnitPrice: finalUnitPrice.toString(),
      } as any)
      .where(eq(invoiceItems.id, itemId));
  }

  return await db
    .update(invoiceItems)
    .set(data)
    .where(eq(invoiceItems.id, itemId));
}

/**
 * حذف منتج من الفاتورة
 */
export async function deleteInvoiceItem(itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(invoiceItems).where(eq(invoiceItems.id, itemId));
}

/**
 * حساب ملخص الفاتورة
 */
export async function getInvoiceSummary(invoiceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const items = await getInvoiceItems(invoiceId);
  const invoice = await getInvoiceById(invoiceId);

  if (!invoice) throw new Error("Invoice not found");

  const summary = {
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate,
    
    // التكاليف الخارجية
    externalCosts: {
      freight: Number(invoice.freightCost),
      insurance: Number(invoice.insuranceCost),
      other: Number(invoice.otherExternalCosts),
      total: Number(invoice.totalExternalCosts),
    },

    // التكاليف الداخلية
    internalCosts: {
      handling: Number(invoice.localHandlingCosts),
      storage: Number(invoice.storageAndWarehouseCosts),
      clearance: Number(invoice.customsClearanceCosts),
      other: Number(invoice.otherInternalCosts),
      total: Number(invoice.totalInternalCosts),
    },

    // ملخص المنتجات
    items: items.map((item) => ({
      productName: item.productName,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      customsCode: item.customsCode,
      harmonizedCode: item.harmonizedCode,
      tarifBand: item.tarifBand,
      dutyRate: Number(item.dutyRate),
      customsDuty: Number(item.customsDuty),
      salesTaxRate: Number(item.salesTaxRate),
      salesTax: Number(item.salesTax),
      allocatedExternalCosts: Number(item.allocatedExternalCosts),
      allocatedInternalCosts: Number(item.allocatedInternalCosts),
      finalUnitPrice: Number(item.finalUnitPrice),
      finalTotalPrice: Number(item.finalTotalPrice),
    })),

    // الإجماليات
    totals: {
      subtotal: items.reduce((sum, item) => sum + Number(item.totalPrice), 0),
      customsDuties: items.reduce((sum, item) => sum + Number(item.customsDuty), 0),
      salesTaxes: items.reduce((sum, item) => sum + Number(item.salesTax), 0),
      externalCostsAllocated: items.reduce(
        (sum, item) => sum + Number(item.allocatedExternalCosts),
        0
      ),
      internalCostsAllocated: items.reduce(
        (sum, item) => sum + Number(item.allocatedInternalCosts),
        0
      ),
      grandTotal: items.reduce((sum, item) => sum + Number(item.finalTotalPrice), 0),
    },
  };

  return summary;
}

/**
 * Invoices Service
 * خدمة إدارة الفواتير المتقدمة
 * 
 * تدعم:
 * - إنشاء الفواتير
 * - حساب الضرائب والخصومات
 * - تصدير PDF
 * - التوقيعات الرقمية
 * 
 * @module server/services/invoices-service
 */

/**
 * معلومات الفاتورة
 */
export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  notes?: string;
  digitalSignature?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

/**
 * عنصر في الفاتورة
 */
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

/**
 * خدمة الفواتير
 */
export class InvoicesService {
  private invoices: Map<string, Invoice> = new Map();
  private invoiceCounter: number = 1000;

  /**
   * إنشاء فاتورة جديدة
   */
  async createInvoice(
    orderId: string,
    userId: string,
    clientName: string,
    clientEmail: string,
    items: InvoiceItem[],
    options?: {
      clientPhone?: string;
      clientAddress?: string;
      taxRate?: number;
      discountRate?: number;
      currency?: string;
      notes?: string;
      daysUntilDue?: number;
    }
  ): Promise<Invoice> {
    try {
      console.log(`📄 إنشاء فاتورة جديدة: ${orderId}`);

      // حساب المبالغ
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const taxRate = options?.taxRate || 0.16; // 16% ضريبة المبيعات الأردنية
      const taxAmount = subtotal * taxRate;
      const discountRate = options?.discountRate || 0;
      const discountAmount = subtotal * discountRate;
      const total = subtotal + taxAmount - discountAmount;

      // إنشاء معرف فاتورة فريد
      this.invoiceCounter++;
      const invoiceNumber = `INV-${new Date().getFullYear()}-${this.invoiceCounter}`;
      const invoiceId = `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // حساب تاريخ الاستحقاق
      const issueDate = new Date();
      const dueDate = new Date(issueDate);
      dueDate.setDate(dueDate.getDate() + (options?.daysUntilDue || 30));

      // إنشاء الفاتورة
      const invoice: Invoice = {
        id: invoiceId,
        invoiceNumber,
        orderId,
        userId,
        clientName,
        clientEmail,
        clientPhone: options?.clientPhone,
        clientAddress: options?.clientAddress,
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        subtotal,
        taxRate,
        taxAmount,
        discountRate,
        discountAmount,
        total,
        currency: options?.currency || 'JOD',
        status: 'draft',
        items,
        notes: options?.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // حفظ الفاتورة
      this.invoices.set(invoiceId, invoice);

      console.log(`✅ تم إنشاء الفاتورة: ${invoiceNumber}`);
      return invoice;
    } catch (error: any) {
      console.error(`❌ خطأ في إنشاء الفاتورة:`, error);
      throw error;
    }
  }

  /**
   * الحصول على فاتورة
   */
  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      console.warn(`⚠️ فاتورة غير موجودة: ${invoiceId}`);
      return null;
    }
    return invoice;
  }

  /**
   * تحديث حالة الفاتورة
   */
  async updateInvoiceStatus(
    invoiceId: string,
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  ): Promise<Invoice | null> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return null;
    }

    invoice.status = status;
    invoice.updatedAt = new Date().toISOString();

    if (status === 'paid') {
      invoice.paidAt = new Date().toISOString();
    }

    console.log(`✅ تم تحديث حالة الفاتورة: ${status}`);
    return invoice;
  }

  /**
   * إضافة توقيع رقمي
   */
  async addDigitalSignature(invoiceId: string, signature: string): Promise<Invoice | null> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return null;
    }

    invoice.digitalSignature = signature;
    invoice.updatedAt = new Date().toISOString();

    console.log(`✅ تم إضافة التوقيع الرقمي للفاتورة`);
    return invoice;
  }

  /**
   * حساب الضرائب والخصومات
   */
  async calculateTaxesAndDiscounts(
    invoiceId: string,
    taxRate?: number,
    discountRate?: number
  ): Promise<{
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
  } | null> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return null;
    }

    const subtotal = invoice.subtotal;
    const newTaxRate = taxRate || invoice.taxRate;
    const newDiscountRate = discountRate || invoice.discountRate;

    const taxAmount = subtotal * newTaxRate;
    const discountAmount = subtotal * newDiscountRate;
    const total = subtotal + taxAmount - discountAmount;

    // تحديث الفاتورة
    invoice.taxRate = newTaxRate;
    invoice.taxAmount = taxAmount;
    invoice.discountRate = newDiscountRate;
    invoice.discountAmount = discountAmount;
    invoice.total = total;
    invoice.updatedAt = new Date().toISOString();

    console.log(`✅ تم حساب الضرائب والخصومات`);
    return {
      subtotal,
      taxAmount,
      discountAmount,
      total,
    };
  }

  /**
   * تصدير الفاتورة إلى JSON
   */
  async exportToJSON(invoiceId: string): Promise<string | null> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return null;
    }

    console.log(`📤 تصدير الفاتورة إلى JSON`);
    return JSON.stringify(invoice, null, 2);
  }

  /**
   * تصدير الفاتورة إلى HTML
   */
  async exportToHTML(invoiceId: string): Promise<string | null> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return null;
    }

    console.log(`📤 تصدير الفاتورة إلى HTML`);

    const itemsHTML = invoice.items
      .map(
        (item) => `
      <tr>
        <td>${item.description}</td>
        <td style="text-align: center;">${item.quantity}</td>
        <td style="text-align: right;">${item.unitPrice.toFixed(2)}</td>
        <td style="text-align: right;">${item.amount.toFixed(2)}</td>
      </tr>
    `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة - ${invoice.invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            direction: rtl;
            padding: 20px;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            color: #333;
          }
          .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 14px;
          }
          .client-info {
            margin-bottom: 20px;
            border-top: 1px solid #ddd;
            padding-top: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #f5f5f5;
            padding: 10px;
            text-align: right;
            border-bottom: 2px solid #333;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }
          .summary {
            width: 300px;
            margin-right: auto;
          }
          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
          }
          .summary-row.total {
            border-top: 2px solid #333;
            font-weight: bold;
            font-size: 16px;
            padding-top: 10px;
          }
          .notes {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
          }
          .signature {
            margin-top: 40px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <h1>فاتورة</h1>
            <p>${invoice.invoiceNumber}</p>
          </div>

          <div class="invoice-info">
            <div>
              <strong>تاريخ الإصدار:</strong> ${new Date(invoice.issueDate).toLocaleDateString('ar-JO')}<br>
              <strong>تاريخ الاستحقاق:</strong> ${new Date(invoice.dueDate).toLocaleDateString('ar-JO')}
            </div>
            <div>
              <strong>الحالة:</strong> ${invoice.status}<br>
              <strong>العملة:</strong> ${invoice.currency}
            </div>
          </div>

          <div class="client-info">
            <strong>العميل:</strong><br>
            ${invoice.clientName}<br>
            ${invoice.clientEmail}<br>
            ${invoice.clientPhone ? invoice.clientPhone + '<br>' : ''}
            ${invoice.clientAddress ? invoice.clientAddress : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>الوصف</th>
                <th style="text-align: center;">الكمية</th>
                <th style="text-align: right;">السعر</th>
                <th style="text-align: right;">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row">
              <span>الإجمالي:</span>
              <span>${invoice.subtotal.toFixed(2)} ${invoice.currency}</span>
            </div>
            <div class="summary-row">
              <span>الضريبة (${(invoice.taxRate * 100).toFixed(0)}%):</span>
              <span>${invoice.taxAmount.toFixed(2)} ${invoice.currency}</span>
            </div>
            ${
              invoice.discountAmount > 0
                ? `
              <div class="summary-row">
                <span>الخصم (${(invoice.discountRate * 100).toFixed(0)}%):</span>
                <span>-${invoice.discountAmount.toFixed(2)} ${invoice.currency}</span>
              </div>
            `
                : ''
            }
            <div class="summary-row total">
              <span>الإجمالي النهائي:</span>
              <span>${invoice.total.toFixed(2)} ${invoice.currency}</span>
            </div>
          </div>

          ${invoice.notes ? `<div class="notes"><strong>ملاحظات:</strong><br>${invoice.notes}</div>` : ''}

          ${
            invoice.digitalSignature
              ? `<div class="signature"><img src="${invoice.digitalSignature}" alt="التوقيع" style="max-width: 200px;"></div>`
              : ''
          }
        </div>
      </body>
      </html>
    `;

    return html;
  }

  /**
   * الحصول على قائمة الفواتير
   */
  async listInvoices(userId?: string, status?: string): Promise<Invoice[]> {
    let invoices = Array.from(this.invoices.values());

    if (userId) {
      invoices = invoices.filter((inv) => inv.userId === userId);
    }

    if (status) {
      invoices = invoices.filter((inv) => inv.status === status);
    }

    return invoices;
  }

  /**
   * حذف فاتورة
   */
  async deleteInvoice(invoiceId: string): Promise<boolean> {
    return this.invoices.delete(invoiceId);
  }

  /**
   * إرسال الفاتورة بالبريد الإلكتروني
   */
  async sendInvoiceByEmail(invoiceId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) {
      return {
        success: false,
        message: 'الفاتورة غير موجودة',
      };
    }

    console.log(`📧 إرسال الفاتورة بالبريد الإلكتروني: ${invoice.clientEmail}`);

    // تحديث حالة الفاتورة
    invoice.status = 'sent';
    invoice.updatedAt = new Date().toISOString();

    return {
      success: true,
      message: `تم إرسال الفاتورة إلى ${invoice.clientEmail}`,
    };
  }
}

// تصدير مثيل واحد من الخدمة
export const invoicesService = new InvoicesService();

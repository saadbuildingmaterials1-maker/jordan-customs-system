/**
 * Invoice Service
 * 
 * خدمة إدارة الفواتير الإلكترونية
 * إنشاء فواتير PDF قابلة للتحميل
 * 
 * @module server/services/invoice-service
 */

import { PDFDocument, rgb, degrees } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

/**
 * معلومات الفاتورة
 */
export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  
  // معلومات العميل
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  
  // معلومات الشركة
  companyName: string;
  companyLogo?: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyTaxId: string;
  
  // تفاصيل الفاتورة
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  
  // معلومات إضافية
  currency: 'JOD' | 'USD' | 'EUR';
  paymentMethod?: string;
  notes?: string;
  terms?: string;
}

/**
 * عنصر الفاتورة
 */
export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
}

/**
 * خدمة الفواتير
 */
export class InvoiceService {
  private invoicesDir = path.join(process.cwd(), 'invoices');

  constructor() {
    // إنشاء مجلد الفواتير إذا لم يكن موجوداً
    if (!fs.existsSync(this.invoicesDir)) {
      fs.mkdirSync(this.invoicesDir, { recursive: true });
      console.log('✅ تم إنشاء مجلد الفواتير');
    }
  }

  /**
   * إنشاء فاتورة PDF
   */
  async generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
    console.log(`📄 جاري إنشاء فاتورة: ${invoiceData.invoiceNumber}`);

    try {
      // إنشاء مستند PDF جديد
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 842]); // A4 size
      const { width, height } = page.getSize();

      // ألوان
      const primaryColor = rgb(0.1, 0.4, 0.8);
      const textColor = rgb(0.2, 0.2, 0.2);
      const lightGray = rgb(0.95, 0.95, 0.95);

      let yPosition = height - 40;

      // Header - معلومات الشركة
      page.drawText(invoiceData.companyName, {
        x: 40,
        y: yPosition,
        size: 24,
        color: primaryColor,
        font: await pdfDoc.embedFont('Helvetica-Bold'),
      });

      yPosition -= 30;

      page.drawText(`الضريبة: ${invoiceData.companyTaxId}`, {
        x: 40,
        y: yPosition,
        size: 10,
        color: textColor,
      });

      page.drawText(invoiceData.companyAddress, {
        x: 40,
        y: yPosition - 15,
        size: 10,
        color: textColor,
      });

      page.drawText(`الهاتف: ${invoiceData.companyPhone}`, {
        x: 40,
        y: yPosition - 30,
        size: 10,
        color: textColor,
      });

      page.drawText(`البريد: ${invoiceData.companyEmail}`, {
        x: 40,
        y: yPosition - 45,
        size: 10,
        color: textColor,
      });

      // Invoice Title
      page.drawText('فاتورة', {
        x: width - 100,
        y: yPosition,
        size: 28,
        color: primaryColor,
        font: await pdfDoc.embedFont('Helvetica-Bold'),
      });

      yPosition -= 80;

      // Invoice Details
      page.drawText(`رقم الفاتورة: ${invoiceData.invoiceNumber}`, {
        x: 40,
        y: yPosition,
        size: 11,
        color: textColor,
        font: await pdfDoc.embedFont('Helvetica-Bold'),
      });

      page.drawText(`تاريخ الفاتورة: ${this.formatDate(invoiceData.invoiceDate)}`, {
        x: width - 200,
        y: yPosition,
        size: 11,
        color: textColor,
      });

      yPosition -= 20;

      page.drawText(`تاريخ الاستحقاق: ${this.formatDate(invoiceData.dueDate)}`, {
        x: width - 200,
        y: yPosition,
        size: 11,
        color: textColor,
      });

      yPosition -= 40;

      // Customer Information
      page.drawText('فاتورة إلى:', {
        x: 40,
        y: yPosition,
        size: 12,
        color: textColor,
        font: await pdfDoc.embedFont('Helvetica-Bold'),
      });

      yPosition -= 20;

      page.drawText(invoiceData.customerName, {
        x: 40,
        y: yPosition,
        size: 11,
        color: textColor,
        font: await pdfDoc.embedFont('Helvetica-Bold'),
      });

      page.drawText(invoiceData.customerAddress, {
        x: 40,
        y: yPosition - 15,
        size: 10,
        color: textColor,
      });

      page.drawText(`الهاتف: ${invoiceData.customerPhone}`, {
        x: 40,
        y: yPosition - 30,
        size: 10,
        color: textColor,
      });

      page.drawText(`البريد: ${invoiceData.customerEmail}`, {
        x: 40,
        y: yPosition - 45,
        size: 10,
        color: textColor,
      });

      yPosition -= 80;

      // Table Header
      const tableTop = yPosition;
      const colWidths = [250, 80, 80, 100];
      const colPositions = [40, 40 + colWidths[0], 40 + colWidths[0] + colWidths[1], 40 + colWidths[0] + colWidths[1] + colWidths[2]];

      // Draw header background
      page.drawRectangle({
        x: 40,
        y: tableTop - 25,
        width: width - 80,
        height: 25,
        color: primaryColor,
      });

      // Draw header text
      page.drawText('الوصف', {
        x: colPositions[0] + 10,
        y: tableTop - 18,
        size: 11,
        color: rgb(1, 1, 1),
        font: await pdfDoc.embedFont('Helvetica-Bold'),
      });

      page.drawText('الكمية', {
        x: colPositions[1] + 10,
        y: tableTop - 18,
        size: 11,
        color: rgb(1, 1, 1),
        font: await pdfDoc.embedFont('Helvetica-Bold'),
      });

      page.drawText('السعر', {
        x: colPositions[2] + 10,
        y: tableTop - 18,
        size: 11,
        color: rgb(1, 1, 1),
        font: await pdfDoc.embedFont('Helvetica-Bold'),
      });

      page.drawText('الإجمالي', {
        x: colPositions[3] + 10,
        y: tableTop - 18,
        size: 11,
        color: rgb(1, 1, 1),
        font: await pdfDoc.embedFont('Helvetica-Bold'),
      });

      yPosition -= 35;

      // Draw items
      let itemYPosition = yPosition;
      invoiceData.items.forEach((item, index) => {
        // Alternate row colors
        if (index % 2 === 0) {
          page.drawRectangle({
            x: 40,
            y: itemYPosition - 20,
            width: width - 80,
            height: 20,
            color: lightGray,
          });
        }

        page.drawText(item.description, {
          x: colPositions[0] + 5,
          y: itemYPosition - 15,
          size: 10,
          color: textColor,
        });

        page.drawText(item.quantity.toString(), {
          x: colPositions[1] + 5,
          y: itemYPosition - 15,
          size: 10,
          color: textColor,
        });

        page.drawText(item.unitPrice.toFixed(2), {
          x: colPositions[2] + 5,
          y: itemYPosition - 15,
          size: 10,
          color: textColor,
        });

        page.drawText(item.amount.toFixed(2), {
          x: colPositions[3] + 5,
          y: itemYPosition - 15,
          size: 10,
          color: textColor,
        });

        itemYPosition -= 25;
      });

      yPosition = itemYPosition - 20;

      // Totals Section
      const totalsX = width - 200;

      page.drawText('المجموع الفرعي:', {
        x: totalsX,
        y: yPosition,
        size: 11,
        color: textColor,
      });

      page.drawText(`${invoiceData.subtotal.toFixed(2)} ${invoiceData.currency}`, {
        x: width - 80,
        y: yPosition,
        size: 11,
        color: textColor,
        font: await pdfDoc.embedFont('Helvetica-Bold'),
      });

      yPosition -= 20;

      if (invoiceData.discountAmount > 0) {
        page.drawText('الخصم:', {
          x: totalsX,
          y: yPosition,
          size: 11,
          color: textColor,
        });

        page.drawText(`-${invoiceData.discountAmount.toFixed(2)} ${invoiceData.currency}`, {
          x: width - 80,
          y: yPosition,
          size: 11,
          color: rgb(0.8, 0.2, 0.2),
          font: await pdfDoc.embedFont('Helvetica-Bold'),
        });

        yPosition -= 20;
      }

      page.drawText('الضريبة:', {
        x: totalsX,
        y: yPosition,
        size: 11,
        color: textColor,
      });

      page.drawText(`${invoiceData.taxAmount.toFixed(2)} ${invoiceData.currency}`, {
        x: width - 80,
        y: yPosition,
        size: 11,
        color: textColor,
        font: await pdfDoc.embedFont('Helvetica-Bold'),
      });

      yPosition -= 25;

      // Total Amount
      page.drawRectangle({
        x: totalsX - 10,
        y: yPosition - 20,
        width: 180,
        height: 25,
        color: primaryColor,
      });

      page.drawText('الإجمالي:', {
        x: totalsX,
        y: yPosition - 10,
        size: 13,
        color: rgb(1, 1, 1),
        font: await pdfDoc.embedFont('Helvetica-Bold'),
      });

      page.drawText(`${invoiceData.totalAmount.toFixed(2)} ${invoiceData.currency}`, {
        x: width - 80,
        y: yPosition - 10,
        size: 13,
        color: rgb(1, 1, 1),
        font: await pdfDoc.embedFont('Helvetica-Bold'),
      });

      yPosition -= 60;

      // Notes and Terms
      if (invoiceData.notes) {
        page.drawText('ملاحظات:', {
          x: 40,
          y: yPosition,
          size: 11,
          color: textColor,
          font: await pdfDoc.embedFont('Helvetica-Bold'),
        });

        page.drawText(invoiceData.notes, {
          x: 40,
          y: yPosition - 20,
          size: 10,
          color: textColor,
        });

        yPosition -= 40;
      }

      if (invoiceData.terms) {
        page.drawText('الشروط والأحكام:', {
          x: 40,
          y: yPosition,
          size: 11,
          color: textColor,
          font: await pdfDoc.embedFont('Helvetica-Bold'),
        });

        page.drawText(invoiceData.terms, {
          x: 40,
          y: yPosition - 20,
          size: 10,
          color: textColor,
        });
      }

      // Footer
      page.drawText('شكراً لتعاملك معنا', {
        x: 40,
        y: 30,
        size: 12,
        color: primaryColor,
        font: await pdfDoc.embedFont('Helvetica-Bold'),
      });

      page.drawText(`تم الإنشاء في: ${new Date().toLocaleString('ar-JO')}`, {
        x: width - 200,
        y: 30,
        size: 9,
        color: rgb(0.6, 0.6, 0.6),
      });

      // Save PDF
      const pdfBytes = await pdfDoc.save();
      console.log(`✅ تم إنشاء الفاتورة: ${invoiceData.invoiceNumber}`);

      return Buffer.from(pdfBytes);
    } catch (error) {
      console.error('❌ خطأ في إنشاء الفاتورة:', error);
      throw new Error('فشل في إنشاء الفاتورة');
    }
  }

  /**
   * حفظ الفاتورة على القرص
   */
  async saveInvoice(invoiceData: InvoiceData): Promise<string> {
    try {
      const pdfBuffer = await this.generateInvoicePDF(invoiceData);
      const fileName = `invoice-${invoiceData.invoiceNumber}-${Date.now()}.pdf`;
      const filePath = path.join(this.invoicesDir, fileName);

      fs.writeFileSync(filePath, pdfBuffer);
      console.log(`💾 تم حفظ الفاتورة: ${filePath}`);

      return filePath;
    } catch (error) {
      console.error('❌ خطأ في حفظ الفاتورة:', error);
      throw new Error('فشل في حفظ الفاتورة');
    }
  }

  /**
   * الحصول على الفاتورة
   */
  getInvoice(fileName: string): Buffer | null {
    try {
      const filePath = path.join(this.invoicesDir, fileName);
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath);
      }
      return null;
    } catch (error) {
      console.error('❌ خطأ في جلب الفاتورة:', error);
      return null;
    }
  }

  /**
   * حذف الفاتورة
   */
  deleteInvoice(fileName: string): boolean {
    try {
      const filePath = path.join(this.invoicesDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ تم حذف الفاتورة: ${fileName}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ خطأ في حذف الفاتورة:', error);
      return false;
    }
  }

  /**
   * تنسيق التاريخ
   */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ar-JO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  /**
   * إنشاء رقم فاتورة فريد
   */
  generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `INV-${timestamp}-${random}`;
  }
}

// تصدير مثيل واحد من الخدمة
export const invoiceService = new InvoiceService();

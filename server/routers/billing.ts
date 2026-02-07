/**
 * Billing Router
 * 
 * إجراءات tRPC لإدارة الفواتير والضرائب والتقارير
 * 
 * @module server/routers/billing
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { invoiceService, type InvoiceData } from '../services/invoice-service';
import { taxService } from '../services/tax-service';
import { taxReportService } from '../services/tax-report-service';

/**
 * Billing Router
 */
export const billingRouter = router({
  /**
   * إنشاء فاتورة PDF
   */
  generateInvoice: protectedProcedure
    .input(
      z.object({
        customerName: z.string().min(1, 'اسم العميل مطلوب'),
        customerEmail: z.string().email('بريد إلكتروني صحيح مطلوب'),
        customerPhone: z.string().min(1, 'رقم الهاتف مطلوب'),
        customerAddress: z.string().min(1, 'العنوان مطلوب'),
        items: z.array(
          z.object({
            description: z.string(),
            quantity: z.number().positive(),
            unitPrice: z.number().positive(),
            amount: z.number().positive(),
          })
        ),
        subtotal: z.number().positive(),
        taxAmount: z.number().nonnegative(),
        discountAmount: z.number().nonnegative(),
        totalAmount: z.number().positive(),
        currency: z.enum(['JOD', 'USD', 'EUR']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const invoiceData: InvoiceData = {
          invoiceNumber: invoiceService.generateInvoiceNumber(),
          invoiceDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 أيام
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          customerAddress: input.customerAddress,
          companyName: 'نظام إدارة تكاليف الشحن والجمارك الأردنية',
          companyAddress: 'عمّان، الأردن',
          companyPhone: '+962-6-123-4567',
          companyEmail: 'info@customs-system.jo',
          companyTaxId: 'TAX-123456789',
          items: input.items,
          subtotal: input.subtotal,
          taxAmount: input.taxAmount,
          discountAmount: input.discountAmount,
          totalAmount: input.totalAmount,
          currency: input.currency,
          notes: input.notes,
          terms: 'يرجى الدفع خلال 30 يوماً من تاريخ الفاتورة',
        };

        const pdfBuffer = await invoiceService.generateInvoicePDF(invoiceData);

        return {
          success: true,
          message: 'تم إنشاء الفاتورة بنجاح',
          invoiceNumber: invoiceData.invoiceNumber,
          pdfSize: pdfBuffer.length,
        };
      } catch (error) {
        console.error('❌ خطأ في إنشاء الفاتورة:', error);
        throw new Error('فشل في إنشاء الفاتورة');
      }
    }),

  /**
   * حساب الضرائب والرسوم
   */
  calculateTaxes: publicProcedure
    .input(
      z.object({
        subtotal: z.number().positive('المبلغ يجب أن يكون موجباً'),
        countryCode: z.string().min(2, 'رمز الدولة مطلوب'),
        shippingType: z.string().optional(),
        commodityType: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const taxCalculation = taxService.calculateTax(
          input.subtotal,
          input.countryCode,
          input.shippingType || 'standard',
          input.commodityType || 'other'
        );

        return {
          success: true,
          ...taxCalculation,
        };
      } catch (error) {
        console.error('❌ خطأ في حساب الضرائب:', error);
        throw new Error('فشل في حساب الضرائب');
      }
    }),

  /**
   * الحصول على معلومات الضريبة للدولة
   */
  getTaxInfo: publicProcedure
    .input(
      z.object({
        countryCode: z.string().min(2, 'رمز الدولة مطلوب'),
      })
    )
    .query(async ({ input }) => {
      try {
        const taxInfo = taxService.getTaxInfo(input.countryCode);

        return {
          success: true,
          ...taxInfo,
        };
      } catch (error) {
        console.error('❌ خطأ في جلب معلومات الضريبة:', error);
        throw new Error('فشل في جلب معلومات الضريبة');
      }
    }),

  /**
   * الحصول على جميع معدلات الضريبة
   */
  getAllTaxRates: publicProcedure.query(async () => {
    try {
      const rates = taxService.getAllTaxRates();

      return {
        success: true,
        rates,
      };
    } catch (error) {
      console.error('❌ خطأ في جلب معدلات الضريبة:', error);
      throw new Error('فشل في جلب معدلات الضريبة');
    }
  }),

  /**
   * الحصول على جميع رسوم الشحن
   */
  getAllShippingFees: publicProcedure.query(async () => {
    try {
      const fees = taxService.getAllShippingFees();

      return {
        success: true,
        fees,
      };
    } catch (error) {
      console.error('❌ خطأ في جلب رسوم الشحن:', error);
      throw new Error('فشل في جلب رسوم الشحن');
    }
  }),

  /**
   * الحصول على جميع رسوم البضاعة
   */
  getAllCommodityFees: publicProcedure.query(async () => {
    try {
      const fees = taxService.getAllCommodityFees();

      return {
        success: true,
        fees,
      };
    } catch (error) {
      console.error('❌ خطأ في جلب رسوم البضاعة:', error);
      throw new Error('فشل في جلب رسوم البضاعة');
    }
  }),

  /**
   * تحديث معدل الضريبة (للمسؤولين فقط)
   */
  updateTaxRate: protectedProcedure
    .input(
      z.object({
        countryCode: z.string().min(2, 'رمز الدولة مطلوب'),
        newRate: z.number().min(0).max(1, 'معدل الضريبة يجب أن يكون بين 0 و 1'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // التحقق من أن المستخدم مسؤول
        if (ctx.user.role !== 'admin') {
          throw new Error('ليس لديك صلاحيات لتحديث معدلات الضريبة');
        }

        const success = taxService.updateTaxRate(input.countryCode, input.newRate);

        return {
          success,
          message: success
            ? `تم تحديث معدل الضريبة للدولة ${input.countryCode}`
            : 'فشل في تحديث معدل الضريبة',
        };
      } catch (error) {
        console.error('❌ خطأ في تحديث معدل الضريبة:', error);
        throw new Error('فشل في تحديث معدل الضريبة');
      }
    }),

  /**
   * إنشاء تقرير ضريبي
   */
  generateTaxReport: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        format: z.enum(['csv', 'json', 'html']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // التحقق من أن المستخدم مسؤول
        if (ctx.user.role !== 'admin') {
          throw new Error('ليس لديك صلاحيات لإنشاء التقارير الضريبية');
        }

        // محاكاة بيانات المعاملات
        const mockTransactions = [
          {
            id: '1',
            date: new Date(),
            description: 'شحنة دولية',
            amount: 1000,
            taxRate: 0.16,
            taxAmount: 160,
            country: 'JO',
            shippingType: 'express',
            commodityType: 'electronics',
            status: 'completed' as const,
          },
        ];

        const report = taxReportService.generateTaxReportSummary(
          mockTransactions,
          input.startDate,
          input.endDate
        );

        const reportPath = taxReportService.saveReport(report, input.format);

        return {
          success: true,
          message: 'تم إنشاء التقرير بنجاح',
          reportPath,
          format: input.format,
          summary: {
            totalTransactions: report.totalTransactions,
            totalAmount: report.totalAmount,
            totalTaxCollected: report.totalTaxCollected,
          },
        };
      } catch (error) {
        console.error('❌ خطأ في إنشاء التقرير:', error);
        throw new Error('فشل في إنشاء التقرير الضريبي');
      }
    }),
});

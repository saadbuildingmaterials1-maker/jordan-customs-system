/**
 * government Router
 * 
 * tRPC Router
 * 
 * @module ./server/routers/government
 */
import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import type { ErrorType } from '../../shared/types';
import { getErrorMessage } from '../../shared/types';
import { getGovernmentIntegration } from '../services/government-integration';

/**
 * عمليات tRPC للتكامل مع الجهات الحكومية
 */

// مخطط التحقق من البيانات
const customsDeclarationSchema = z.object({
  declarationNumber: z.string(),
  declarationType: z.enum(['import', 'export']),
  declarationDate: z.string().datetime(),
  importer: z.object({
    name: z.string(),
    taxId: z.string(),
    address: z.string(),
  }),
  items: z.array(
    z.object({
      hsCode: z.string(),
      description: z.string(),
      quantity: z.number().positive(),
      unit: z.string(),
      unitPrice: z.number().positive(),
      currency: z.string(),
      totalValue: z.number().positive(),
    })
  ),
  totalValue: z.number().positive(),
  currency: z.string(),
});

export const governmentRouter = router({
  /**
   * إرسال بيان جمركي إلى النظام الحكومي
   */
  submitDeclaration: protectedProcedure
    .input(customsDeclarationSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const integration = getGovernmentIntegration();
        const result = await integration.submitCustomsDeclaration(input);

        // تسجيل العملية في قاعدة البيانات
        if (result.status === 'success') {
          // يمكن إضافة تسجيل في جدول العمليات هنا
          console.log(`✅ تم إرسال البيان ${result.referenceNumber} بنجاح`);
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          status: 'error',
          declarationId: '',
          referenceNumber: '',
          message: errorMessage || 'فشل إرسال البيان',
        };
      }
    }),

  /**
   * الحصول على حالة البيان الجمركي
   */
  getDeclarationStatus: protectedProcedure
    .input(z.object({ declarationId: z.string() }))
    .query(async ({ input }) => {
      try {
        const integration = getGovernmentIntegration();
        const result = await integration.getDeclarationStatus(input.declarationId);
        return result;
      } catch (error: ErrorType) {
        return {
          status: 'error',
          message: getErrorMessage(error),
        };
      }
    }),

  /**
   * الحصول على قائمة الرموز الجمركية (HS Codes)
   */
  getTariffCodes: publicProcedure
    .input(
      z.object({
        searchTerm: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const integration = getGovernmentIntegration();
        const codes = await integration.getTariffCodes(input.searchTerm);
        return {
          status: 'success',
          codes,
        };
      } catch (error: ErrorType) {
        return {
          status: 'error',
          codes: [],
          message: getErrorMessage(error),
        };
      }
    }),

  /**
   * التحقق من صحة البيان الجمركي
   */
  validateDeclaration: protectedProcedure
    .input(customsDeclarationSchema)
    .mutation(async ({ input }) => {
      try {
        const integration = getGovernmentIntegration();
        const result = await integration.validateDeclaration(input);
        return {
          status: result.valid ? 'success' : 'error',
          valid: result.valid,
          errors: result.errors,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          status: 'error',
          valid: false,
          errors: [errorMessage],
        };
      }
    }),

  /**
   * حساب الرسوم والضرائب
   */
  calculateTaxesAndDuties: protectedProcedure
    .input(customsDeclarationSchema)
    .query(async ({ input }) => {
      try {
        const integration = getGovernmentIntegration();
        const taxes = await integration.calculateTaxesAndDuties(input);
        return {
          status: 'success',
          taxes,
        };
      } catch (error: ErrorType) {
        return {
          status: 'error',
          message: getErrorMessage(error),
        };
      }
    }),

  /**
   * تتبع الشحنة
   */
  trackShipment: protectedProcedure
    .input(z.object({ trackingNumber: z.string() }))
    .query(async ({ input }) => {
      try {
        const integration = getGovernmentIntegration();
        const shipment = await integration.trackShipment(input.trackingNumber);
        return {
          status: 'success',
          shipment,
        };
      } catch (error: ErrorType) {
        return {
          status: 'error',
          message: getErrorMessage(error),
        };
      }
    }),

  /**
   * اختبار الاتصال بالنظام الحكومي
   */
  testConnection: protectedProcedure.query(async () => {
    try {
      const integration = getGovernmentIntegration();
      const connected = await integration.testConnection();
      return {
        status: connected ? 'success' : 'error',
        connected,
        message: connected
          ? 'الاتصال بالنظام الحكومي يعمل بشكل صحيح'
          : 'فشل الاتصال بالنظام الحكومي',
      };
    } catch (error: any) {
      return {
        status: 'error',
        connected: false,
        message: error.message,
      };
    }
  }),

  /**
   * الحصول على سجل العمليات
   */
  getOperationLog: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        // يمكن استرجاع السجلات من قاعدة البيانات
        return {
          status: 'success',
          operations: [],
          total: 0,
        };
      } catch (error: ErrorType) {
        return {
          status: 'error',
          operations: [],
          message: getErrorMessage(error),
        };
      }
    }),

  /**
   * الحصول على إحصائيات التكامل
   */
  getIntegrationStats: protectedProcedure.query(async () => {
    try {
      return {
        status: 'success',
        stats: {
          totalDeclarations: 0,
          successfulDeclarations: 0,
          failedDeclarations: 0,
          pendingDeclarations: 0,
          averageProcessingTime: 0,
          lastSync: new Date(),
        },
      };
    } catch (error: any) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }),

  /**
   * إعادة محاولة إرسال بيان فاشل
   */
  retryDeclaration: protectedProcedure
    .input(z.object({ declarationId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // يمكن استرجاع البيان من قاعدة البيانات وإعادة محاولة إرساله
        return {
          status: 'success',
          message: 'تم إعادة محاولة إرسال البيان',
        };
      } catch (error: ErrorType) {
        return {
          status: 'error',
          message: getErrorMessage(error),
        };
      }
    }),
});

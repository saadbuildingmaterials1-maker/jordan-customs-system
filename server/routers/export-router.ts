import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  exportToCSV,
  exportToJSON,
  exportToXML,
  exportToExcel,
  exportData,
  exportLargeDataset,
  getExportStatistics,
} from '../services/export-service';
import { TRPCError } from '@trpc/server';

/**
 * مسارات tRPC لخدمات التصدير
 * Export tRPC Routes
 */

export const exportRouter = router({
  /**
   * تصدير البيانات بصيغة محددة
   * Export data in specified format
   */
  exportData: protectedProcedure
    .input(
      z.object({
        dataType: z.enum(['invoices', 'payments', 'shipments', 'customs', 'all']),
        format: z.enum(['csv', 'json', 'xml', 'excel']),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        fields: z.array(z.string()).optional(),
        includeMetadata: z.boolean().optional().default(true),
        compress: z.boolean().optional().default(false),
        delimiter: z.string().optional(),
        encoding: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await exportData({
          userId: ctx.user.id,
          ...input,
        });

        return {
          success: result.success,
          format: result.format,
          dataType: result.dataType,
          recordCount: result.recordCount,
          fileSize: result.fileSize,
          fileName: result.fileName,
          mimeType: result.mimeType,
          // إرسال البيانات كـ base64 للنقل عبر الشبكة
          data: result.data.toString('base64'),
        };
      } catch (error) {
        console.error('Error exporting data:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في تصدير البيانات',
        });
      }
    }),

  /**
   * تصدير إلى CSV
   * Export to CSV
   */
  exportToCSV: protectedProcedure
    .input(
      z.object({
        dataType: z.enum(['invoices', 'payments', 'shipments', 'customs']),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        fields: z.array(z.string()).optional(),
        delimiter: z.string().optional().default(','),
        compress: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await exportToCSV({
          userId: ctx.user.id,
          ...input,
          format: 'csv',
        });

        return {
          success: result.success,
          fileName: result.fileName,
          recordCount: result.recordCount,
          fileSize: result.fileSize,
          data: result.data.toString('base64'),
          mimeType: result.mimeType,
        };
      } catch (error) {
        console.error('Error exporting to CSV:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في تصدير البيانات إلى CSV',
        });
      }
    }),

  /**
   * تصدير إلى JSON
   * Export to JSON
   */
  exportToJSON: protectedProcedure
    .input(
      z.object({
        dataType: z.enum(['invoices', 'payments', 'shipments', 'customs', 'all']),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        fields: z.array(z.string()).optional(),
        includeMetadata: z.boolean().optional().default(true),
        compress: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await exportToJSON({
          userId: ctx.user.id,
          ...input,
          format: 'json',
        });

        return {
          success: result.success,
          fileName: result.fileName,
          recordCount: result.recordCount,
          fileSize: result.fileSize,
          data: result.data.toString('base64'),
          mimeType: result.mimeType,
        };
      } catch (error) {
        console.error('Error exporting to JSON:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في تصدير البيانات إلى JSON',
        });
      }
    }),

  /**
   * تصدير إلى XML
   * Export to XML
   */
  exportToXML: protectedProcedure
    .input(
      z.object({
        dataType: z.enum(['invoices', 'payments', 'shipments', 'customs']),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        fields: z.array(z.string()).optional(),
        includeMetadata: z.boolean().optional().default(true),
        compress: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await exportToXML({
          userId: ctx.user.id,
          ...input,
          format: 'xml',
        });

        return {
          success: result.success,
          fileName: result.fileName,
          recordCount: result.recordCount,
          fileSize: result.fileSize,
          data: result.data.toString('base64'),
          mimeType: result.mimeType,
        };
      } catch (error) {
        console.error('Error exporting to XML:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في تصدير البيانات إلى XML',
        });
      }
    }),

  /**
   * تصدير إلى Excel
   * Export to Excel
   */
  exportToExcel: protectedProcedure
    .input(
      z.object({
        dataType: z.enum(['invoices', 'payments', 'shipments', 'customs', 'all']),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        fields: z.array(z.string()).optional(),
        includeMetadata: z.boolean().optional().default(true),
        compress: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await exportToExcel({
          userId: ctx.user.id,
          ...input,
          format: 'excel',
        });

        return {
          success: result.success,
          fileName: result.fileName,
          recordCount: result.recordCount,
          fileSize: result.fileSize,
          data: result.data.toString('base64'),
          mimeType: result.mimeType,
        };
      } catch (error) {
        console.error('Error exporting to Excel:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في تصدير البيانات إلى Excel',
        });
      }
    }),

  /**
   * تصدير مجموعة بيانات كبيرة
   * Export large dataset
   */
  exportLargeDataset: protectedProcedure
    .input(
      z.object({
        dataType: z.enum(['invoices', 'payments', 'shipments', 'customs', 'all']),
        format: z.enum(['csv', 'json', 'xml', 'excel']),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        chunkSize: z.number().optional().default(1000),
        compress: z.boolean().optional().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await exportLargeDataset({
          userId: ctx.user.id,
          ...input,
        });

        return {
          success: result.success,
          fileName: result.fileName,
          recordCount: result.recordCount,
          fileSize: result.fileSize,
          data: result.data.toString('base64'),
          mimeType: result.mimeType,
        };
      } catch (error) {
        console.error('Error exporting large dataset:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في تصدير مجموعة البيانات الكبيرة',
        });
      }
    }),

  /**
   * الحصول على إحصائيات التصدير
   * Get export statistics
   */
  getExportStatistics: protectedProcedure.query(async ({ ctx }) => {
    try {
      const stats = await getExportStatistics(ctx.user.id);
      return stats;
    } catch (error) {
      console.error('Error getting export statistics:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'فشل في جلب إحصائيات التصدير',
      });
    }
  }),
});

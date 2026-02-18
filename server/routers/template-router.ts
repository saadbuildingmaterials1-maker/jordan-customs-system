import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getTemplates,
  getTemplate,
  addToFavorites,
  removeFromFavorites,
  getFavoriteTemplates,
  shareTemplate,
  getSharedTemplates,
  createScheduledExport,
  getScheduledExports,
  recordTemplateUsage,
  getTemplateUsageHistory,
  getTemplateVersions,
  restoreTemplateVersion,
} from '../services/template-service';

/**
 * مسارات tRPC لإدارة القوالب
 * Template Management tRPC Routes
 */

export const templateRouter = router({
  /**
   * إنشاء قالب جديد
   * Create new template
   */
  createTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'اسم القالب مطلوب'),
        description: z.string().optional(),
        templateType: z.enum(['invoices', 'payments', 'shipments', 'customs', 'all']),
        exportFormat: z.enum(['csv', 'json', 'xml', 'excel']),
        selectedFields: z.array(z.string()).optional(),
        excludedFields: z.array(z.string()).optional(),
        includeMetadata: z.boolean().optional(),
        compress: z.boolean().optional(),
        delimiter: z.string().optional(),
        encoding: z.string().optional(),
        dateFormat: z.string().optional(),
        numberFormat: z.string().optional(),
        currencySymbol: z.string().optional(),
        sortBy: z.array(z.object({ field: z.string(), order: z.enum(['asc', 'desc']) })).optional(),
        filters: z.array(z.object({ field: z.string(), operator: z.string(), value: z.any() })).optional(),
        customFields: z
          .array(
            z.object({
              name: z.string(),
              label: z.string(),
              type: z.enum(['text', 'number', 'date', 'formula']),
              formula: z.string().optional(),
            })
          )
          .optional(),
        groupBy: z.array(z.string()).optional(),
        aggregations: z
          .array(z.object({ field: z.string(), function: z.enum(['sum', 'avg', 'count', 'min', 'max']) }))
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await createTemplate({
        userId: ctx.user.id,
        ...input,
      });
    }),

  /**
   * تحديث قالب
   * Update template
   */
  updateTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        data: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          selectedFields: z.array(z.string()).optional(),
          excludedFields: z.array(z.string()).optional(),
          includeMetadata: z.boolean().optional(),
          compress: z.boolean().optional(),
          delimiter: z.string().optional(),
          dateFormat: z.string().optional(),
          numberFormat: z.string().optional(),
          currencySymbol: z.string().optional(),
          sortBy: z.array(z.object({ field: z.string(), order: z.enum(['asc', 'desc']) })).optional(),
          filters: z.array(z.object({ field: z.string(), operator: z.string(), value: z.any() })).optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await updateTemplate(input.templateId, ctx.user.id, input.data);
    }),

  /**
   * حذف قالب
   * Delete template
   */
  deleteTemplate: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return await deleteTemplate(input.templateId, ctx.user.id);
    }),

  /**
   * جلب جميع القوالب
   * Get all templates
   */
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    return await getTemplates(ctx.user.id);
  }),

  /**
   * جلب قالب محدد
   * Get specific template
   */
  getTemplate: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input, ctx }) => {
      return await getTemplate(input.templateId, ctx.user.id);
    }),

  /**
   * إضافة إلى المفضلة
   * Add to favorites
   */
  addToFavorites: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return await addToFavorites(input.templateId, ctx.user.id);
    }),

  /**
   * إزالة من المفضلة
   * Remove from favorites
   */
  removeFromFavorites: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return await removeFromFavorites(input.templateId, ctx.user.id);
    }),

  /**
   * جلب القوالب المفضلة
   * Get favorite templates
   */
  getFavoriteTemplates: protectedProcedure.query(async ({ ctx }) => {
    return await getFavoriteTemplates(ctx.user.id);
  }),

  /**
   * مشاركة قالب
   * Share template
   */
  shareTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        shareWithUserId: z.number(),
        permissions: z.object({
          canView: z.boolean().optional(),
          canEdit: z.boolean().optional(),
          canDelete: z.boolean().optional(),
          canShare: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await shareTemplate(input.templateId, ctx.user.id, input.shareWithUserId, input.permissions);
    }),

  /**
   * جلب القوالب المشتركة
   * Get shared templates
   */
  getSharedTemplates: protectedProcedure.query(async ({ ctx }) => {
    return await getSharedTemplates(ctx.user.id);
  }),

  /**
   * إنشاء جدولة تصدير
   * Create scheduled export
   */
  createScheduledExport: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        frequency: z.enum(['once', 'daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
        time: z.string().optional(),
        dayOfWeek: z.number().optional(),
        dayOfMonth: z.number().optional(),
        timezone: z.string().optional(),
        sendViaEmail: z.boolean().optional(),
        emailRecipients: z.array(z.string()).optional(),
        emailSubject: z.string().optional(),
        emailMessage: z.string().optional(),
        saveToStorage: z.boolean().optional(),
        storagePath: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await createScheduledExport(input.templateId, ctx.user.id, input);
    }),

  /**
   * جلب جداول التصدير
   * Get scheduled exports
   */
  getScheduledExports: protectedProcedure.query(async ({ ctx }) => {
    return await getScheduledExports(ctx.user.id);
  }),

  /**
   * تسجيل استخدام القالب
   * Record template usage
   */
  recordTemplateUsage: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        usageType: z.enum(['preview', 'export', 'schedule']),
        recordCount: z.number().optional(),
        fileSize: z.number().optional(),
        status: z.enum(['success', 'failed', 'pending']),
        errorMessage: z.string().optional(),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await recordTemplateUsage(input.templateId, ctx.user.id, input);
    }),

  /**
   * جلب سجل الاستخدام
   * Get usage history
   */
  getTemplateUsageHistory: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input, ctx }) => {
      return await getTemplateUsageHistory(input.templateId, ctx.user.id);
    }),

  /**
   * جلب إصدارات القالب
   * Get template versions
   */
  getTemplateVersions: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input, ctx }) => {
      return await getTemplateVersions(input.templateId, ctx.user.id);
    }),

  /**
   * استعادة إصدار سابق
   * Restore previous version
   */
  restoreTemplateVersion: protectedProcedure
    .input(z.object({ templateId: z.number(), versionId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return await restoreTemplateVersion(input.templateId, input.versionId, ctx.user.id);
    }),
});

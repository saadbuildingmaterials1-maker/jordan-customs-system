import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  previewTemplateData,
  quickEditPreviewData,
  reorderColumns,
  toggleColumnVisibility,
} from '../services/template-preview-service';
import {
  getSmartTemplateRecommendations,
  suggestTemplatesByDataType,
  suggestTemplatesByFields,
  findSimilarTemplates,
  suggestTemplatesByTime,
  analyzeUsagePatterns,
} from '../services/smart-template-service';
import {
  createTeam,
  addTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
  shareTemplateWithTeam,
  updateTemplatePermissions,
  getTeamTemplates,
  getTeamMembers,
  getCollaborationLog,
  addTemplateComment,
  getTemplateComments,
  notifyTeamMembers,
} from '../services/team-collaboration-service';

/**
 * مسارات tRPC المتقدمة للقوالب
 * Advanced Template tRPC Routes
 */

// ==================== مسارات المعاينة ====================

export const previewRouter = router({
  /**
   * معاينة بيانات القالب
   * Preview template data
   */
  previewData: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        limit: z.number().optional(),
        offset: z.number().optional(),
        filters: z
          .array(z.object({ field: z.string(), operator: z.string(), value: z.any() }))
          .optional(),
        format: z.enum(['table', 'json', 'csv']).optional(),
      })
    )
    .query(async ({ input }) => {
      return await previewTemplateData(input);
    }),

  /**
   * التعديل السريع على البيانات
   * Quick edit preview data
   */
  quickEdit: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        rowIndex: z.number(),
        fieldName: z.string(),
        newValue: z.any(),
      })
    )
    .mutation(async ({ input }) => {
      return await quickEditPreviewData(input.templateId, input.rowIndex, input.fieldName, input.newValue);
    }),

  /**
   * إعادة ترتيب الأعمدة
   * Reorder columns
   */
  reorderColumns: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        columnOrder: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      return await reorderColumns(input.templateId, input.columnOrder);
    }),

  /**
   * إخفاء/إظهار الأعمدة
   * Toggle column visibility
   */
  toggleColumnVisibility: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        columnName: z.string(),
        visible: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      return await toggleColumnVisibility(input.templateId, input.columnName, input.visible);
    }),
});

// ==================== مسارات القوالب الذكية ====================

export const smartTemplateRouter = router({
  /**
   * الحصول على توصيات القوالب الذكية
   * Get smart template recommendations
   */
  getRecommendations: protectedProcedure.query(async ({ ctx }) => {
    return await getSmartTemplateRecommendations(ctx.user.id);
  }),

  /**
   * اقتراح قوالب حسب نوع البيانات
   * Suggest templates by data type
   */
  suggestByDataType: protectedProcedure
    .input(z.object({ dataType: z.string() }))
    .query(async ({ input, ctx }) => {
      return await suggestTemplatesByDataType(ctx.user.id, input.dataType);
    }),

  /**
   * اقتراح قوالب حسب الحقول
   * Suggest templates by fields
   */
  suggestByFields: protectedProcedure
    .input(z.object({ selectedFields: z.array(z.string()) }))
    .query(async ({ input, ctx }) => {
      return await suggestTemplatesByFields(ctx.user.id, input.selectedFields);
    }),

  /**
   * البحث عن قوالب مشابهة
   * Find similar templates
   */
  findSimilar: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input, ctx }) => {
      return await findSimilarTemplates(ctx.user.id, input.templateId);
    }),

  /**
   * اقتراح قوالب حسب الوقت
   * Suggest templates by time
   */
  suggestByTime: protectedProcedure.query(async ({ ctx }) => {
    return await suggestTemplatesByTime(ctx.user.id);
  }),

  /**
   * تحليل أنماط الاستخدام
   * Analyze usage patterns
   */
  analyzePatterns: protectedProcedure.query(async ({ ctx }) => {
    return await analyzeUsagePatterns(ctx.user.id);
  }),
});

// ==================== مسارات التعاون الفريقي ====================

export const teamCollaborationRouter = router({
  /**
   * إنشاء فريق جديد
   * Create new team
   */
  createTeam: protectedProcedure
    .input(
      z.object({
        teamName: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await createTeam(ctx.user.id, input.teamName, input.description);
    }),

  /**
   * إضافة عضو إلى الفريق
   * Add team member
   */
  addTeamMember: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        memberUserId: z.number(),
        role: z.enum(['editor', 'viewer']).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await addTeamMember(input.teamId, ctx.user.id, input.memberUserId, input.role);
    }),

  /**
   * إزالة عضو من الفريق
   * Remove team member
   */
  removeTeamMember: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        memberUserId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await removeTeamMember(input.teamId, ctx.user.id, input.memberUserId);
    }),

  /**
   * تحديث دور عضو الفريق
   * Update team member role
   */
  updateTeamMemberRole: protectedProcedure
    .input(
      z.object({
        teamId: z.number(),
        memberUserId: z.number(),
        newRole: z.enum(['editor', 'viewer']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await updateTeamMemberRole(input.teamId, ctx.user.id, input.memberUserId, input.newRole);
    }),

  /**
   * مشاركة القالب مع الفريق
   * Share template with team
   */
  shareWithTeam: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        teamId: z.number(),
        permissions: z
          .object({
            canEdit: z.boolean().optional(),
            canDelete: z.boolean().optional(),
            canShare: z.boolean().optional(),
            canManageTeam: z.boolean().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await shareTemplateWithTeam(input.templateId, ctx.user.id, input.teamId, input.permissions);
    }),

  /**
   * تحديث صلاحيات القالب
   * Update template permissions
   */
  updatePermissions: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        teamId: z.number(),
        permissions: z.object({
          canEdit: z.boolean().optional(),
          canDelete: z.boolean().optional(),
          canShare: z.boolean().optional(),
          canManageTeam: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await updateTemplatePermissions(input.templateId, ctx.user.id, input.teamId, input.permissions);
    }),

  /**
   * جلب قوالب الفريق
   * Get team templates
   */
  getTeamTemplates: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ input, ctx }) => {
      return await getTeamTemplates(input.teamId, ctx.user.id);
    }),

  /**
   * جلب أعضاء الفريق
   * Get team members
   */
  getTeamMembers: protectedProcedure
    .input(z.object({ teamId: z.number() }))
    .query(async ({ input, ctx }) => {
      return await getTeamMembers(input.teamId, ctx.user.id);
    }),

  /**
   * جلب سجل التعاون
   * Get collaboration log
   */
  getCollaborationLog: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input, ctx }) => {
      return await getCollaborationLog(input.templateId, ctx.user.id);
    }),

  /**
   * إضافة تعليق على القالب
   * Add template comment
   */
  addComment: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        comment: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await addTemplateComment(input.templateId, ctx.user.id, input.comment);
    }),

  /**
   * جلب تعليقات القالب
   * Get template comments
   */
  getComments: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input }) => {
      return await getTemplateComments(input.templateId);
    }),

  /**
   * إخطار أعضاء الفريق
   * Notify team members
   */
  notifyMembers: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        action: z.string(),
        details: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await notifyTeamMembers(input.templateId, ctx.user.id, input.action, input.details);
    }),
});

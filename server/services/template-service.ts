import { db } from '../db';
import {
  exportTemplates,
  templateUsageHistory,
  sharedTemplates,
  scheduledExports,
  favoriteTemplates,
  templateVersions,
} from '../../drizzle/export-template-schema';
import { eq, and } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

/**
 * خدمة إدارة قوالب التصدير
 * Template Management Service
 */

export interface CreateTemplateInput {
  userId: number;
  name: string;
  description?: string;
  templateType: 'invoices' | 'payments' | 'shipments' | 'customs' | 'all';
  exportFormat: 'csv' | 'json' | 'xml' | 'excel';
  selectedFields?: string[];
  excludedFields?: string[];
  includeMetadata?: boolean;
  compress?: boolean;
  delimiter?: string;
  encoding?: string;
  dateFormat?: string;
  numberFormat?: string;
  currencySymbol?: string;
  sortBy?: Array<{ field: string; order: 'asc' | 'desc' }>;
  filters?: Array<{ field: string; operator: string; value: any }>;
  customFields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'formula';
    formula?: string;
  }>;
  groupBy?: string[];
  aggregations?: Array<{ field: string; function: 'sum' | 'avg' | 'count' | 'min' | 'max' }>;
}

// ==================== إنشاء وحفظ القوالب ====================

export async function createTemplate(input: CreateTemplateInput) {
  try {
    const template = await db.insert(exportTemplates).values({
      userId: input.userId,
      name: input.name,
      description: input.description,
      templateType: input.templateType,
      exportFormat: input.exportFormat,
      selectedFields: input.selectedFields,
      excludedFields: input.excludedFields,
      includeMetadata: input.includeMetadata ?? true,
      compress: input.compress ?? false,
      delimiter: input.delimiter ?? ',',
      encoding: input.encoding ?? 'utf-8',
      dateFormat: input.dateFormat ?? 'YYYY-MM-DD',
      numberFormat: input.numberFormat ?? '0.00',
      currencySymbol: input.currencySymbol ?? 'د.ا',
      sortBy: input.sortBy,
      filters: input.filters,
      customFields: input.customFields,
      groupBy: input.groupBy,
      aggregations: input.aggregations,
    });

    return {
      success: true,
      message: 'تم إنشاء القالب بنجاح',
      templateId: template[0].insertId,
    };
  } catch (error) {
    console.error('Error creating template:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في إنشاء القالب',
    });
  }
}

export async function updateTemplate(templateId: number, userId: number, input: Partial<CreateTemplateInput>) {
  try {
    // التحقق من الملكية
    const template = await db.query.exportTemplates.findFirst({
      where: and(eq(exportTemplates.id, templateId), eq(exportTemplates.userId, userId)),
    });

    if (!template) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'القالب غير موجود',
      });
    }

    // حفظ نسخة قديمة
    await db.insert(templateVersions).values({
      templateId,
      userId,
      versionNumber: 1,
      changeDescription: 'تحديث القالب',
      templateData: template,
    });

    // تحديث القالب
    await db
      .update(exportTemplates)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(exportTemplates.id, templateId));

    return {
      success: true,
      message: 'تم تحديث القالب بنجاح',
    };
  } catch (error) {
    console.error('Error updating template:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في تحديث القالب',
    });
  }
}

export async function deleteTemplate(templateId: number, userId: number) {
  try {
    // التحقق من الملكية
    const template = await db.query.exportTemplates.findFirst({
      where: and(eq(exportTemplates.id, templateId), eq(exportTemplates.userId, userId)),
    });

    if (!template) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'القالب غير موجود',
      });
    }

    // حذف القالب
    await db.delete(exportTemplates).where(eq(exportTemplates.id, templateId));

    return {
      success: true,
      message: 'تم حذف القالب بنجاح',
    };
  } catch (error) {
    console.error('Error deleting template:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في حذف القالب',
    });
  }
}

// ==================== جلب القوالب ====================

export async function getTemplates(userId: number) {
  try {
    const templates = await db.query.exportTemplates.findMany({
      where: eq(exportTemplates.userId, userId),
    });

    return templates;
  } catch (error) {
    console.error('Error getting templates:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب القوالب',
    });
  }
}

export async function getTemplate(templateId: number, userId: number) {
  try {
    const template = await db.query.exportTemplates.findFirst({
      where: and(eq(exportTemplates.id, templateId), eq(exportTemplates.userId, userId)),
    });

    if (!template) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'القالب غير موجود',
      });
    }

    return template;
  } catch (error) {
    console.error('Error getting template:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب القالب',
    });
  }
}

// ==================== المفضلة ====================

export async function addToFavorites(templateId: number, userId: number) {
  try {
    const favorite = await db.insert(favoriteTemplates).values({
      templateId,
      userId,
    });

    return {
      success: true,
      message: 'تم إضافة القالب إلى المفضلة',
    };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في إضافة القالب إلى المفضلة',
    });
  }
}

export async function removeFromFavorites(templateId: number, userId: number) {
  try {
    await db
      .delete(favoriteTemplates)
      .where(and(eq(favoriteTemplates.templateId, templateId), eq(favoriteTemplates.userId, userId)));

    return {
      success: true,
      message: 'تم إزالة القالب من المفضلة',
    };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في إزالة القالب من المفضلة',
    });
  }
}

export async function getFavoriteTemplates(userId: number) {
  try {
    const favorites = await db.query.favoriteTemplates.findMany({
      where: eq(favoriteTemplates.userId, userId),
    });

    const templateIds = favorites.map((f) => f.templateId);
    const templates = await db.query.exportTemplates.findMany({
      where: (t) => t.id.inArray(templateIds),
    });

    return templates;
  } catch (error) {
    console.error('Error getting favorite templates:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب القوالب المفضلة',
    });
  }
}

// ==================== المشاركة ====================

export async function shareTemplate(
  templateId: number,
  userId: number,
  shareWithUserId: number,
  permissions: { canView?: boolean; canEdit?: boolean; canDelete?: boolean; canShare?: boolean }
) {
  try {
    // التحقق من الملكية
    const template = await db.query.exportTemplates.findFirst({
      where: and(eq(exportTemplates.id, templateId), eq(exportTemplates.userId, userId)),
    });

    if (!template) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'القالب غير موجود',
      });
    }

    // مشاركة القالب
    await db.insert(sharedTemplates).values({
      templateId,
      ownerId: userId,
      sharedWithUserId,
      shareType: 'user',
      canView: permissions.canView ?? true,
      canEdit: permissions.canEdit ?? false,
      canDelete: permissions.canDelete ?? false,
      canShare: permissions.canShare ?? false,
    });

    return {
      success: true,
      message: 'تم مشاركة القالب بنجاح',
    };
  } catch (error) {
    console.error('Error sharing template:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في مشاركة القالب',
    });
  }
}

export async function getSharedTemplates(userId: number) {
  try {
    const shared = await db.query.sharedTemplates.findMany({
      where: eq(sharedTemplates.sharedWithUserId, userId),
    });

    const templateIds = shared.map((s) => s.templateId);
    const templates = await db.query.exportTemplates.findMany({
      where: (t) => t.id.inArray(templateIds),
    });

    return templates;
  } catch (error) {
    console.error('Error getting shared templates:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب القوالب المشتركة',
    });
  }
}

// ==================== الجدولة ====================

export async function createScheduledExport(
  templateId: number,
  userId: number,
  input: {
    name: string;
    description?: string;
    frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    time?: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    timezone?: string;
    sendViaEmail?: boolean;
    emailRecipients?: string[];
    emailSubject?: string;
    emailMessage?: string;
    saveToStorage?: boolean;
    storagePath?: string;
  }
) {
  try {
    // التحقق من الملكية
    const template = await db.query.exportTemplates.findFirst({
      where: and(eq(exportTemplates.id, templateId), eq(exportTemplates.userId, userId)),
    });

    if (!template) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'القالب غير موجود',
      });
    }

    // إنشاء جدولة التصدير
    const scheduled = await db.insert(scheduledExports).values({
      templateId,
      userId,
      name: input.name,
      description: input.description,
      frequency: input.frequency,
      time: input.time ?? '09:00',
      dayOfWeek: input.dayOfWeek,
      dayOfMonth: input.dayOfMonth,
      timezone: input.timezone ?? 'Asia/Amman',
      sendViaEmail: input.sendViaEmail ?? true,
      emailRecipients: input.emailRecipients,
      emailSubject: input.emailSubject,
      emailMessage: input.emailMessage,
      saveToStorage: input.saveToStorage ?? false,
      storagePath: input.storagePath,
    });

    return {
      success: true,
      message: 'تم إنشاء جدولة التصدير بنجاح',
      scheduledId: scheduled[0].insertId,
    };
  } catch (error) {
    console.error('Error creating scheduled export:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في إنشاء جدولة التصدير',
    });
  }
}

export async function getScheduledExports(userId: number) {
  try {
    const scheduled = await db.query.scheduledExports.findMany({
      where: eq(scheduledExports.userId, userId),
    });

    return scheduled;
  } catch (error) {
    console.error('Error getting scheduled exports:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب جداول التصدير',
    });
  }
}

// ==================== سجل الاستخدام ====================

export async function recordTemplateUsage(
  templateId: number,
  userId: number,
  usageData: {
    usageType: 'preview' | 'export' | 'schedule';
    recordCount?: number;
    fileSize?: number;
    status: 'success' | 'failed' | 'pending';
    errorMessage?: string;
    duration?: number;
  }
) {
  try {
    await db.insert(templateUsageHistory).values({
      templateId,
      userId,
      ...usageData,
      startedAt: new Date(),
    });

    // تحديث عدد الاستخدامات
    await db
      .update(exportTemplates)
      .set({
        usageCount: (exportTemplates.usageCount || 0) + 1,
        lastUsedAt: new Date(),
      })
      .where(eq(exportTemplates.id, templateId));

    return {
      success: true,
      message: 'تم تسجيل الاستخدام',
    };
  } catch (error) {
    console.error('Error recording template usage:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في تسجيل الاستخدام',
    });
  }
}

export async function getTemplateUsageHistory(templateId: number, userId: number) {
  try {
    const history = await db.query.templateUsageHistory.findMany({
      where: and(eq(templateUsageHistory.templateId, templateId), eq(templateUsageHistory.userId, userId)),
    });

    return history;
  } catch (error) {
    console.error('Error getting template usage history:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب سجل الاستخدام',
    });
  }
}

// ==================== الإصدارات ====================

export async function getTemplateVersions(templateId: number, userId: number) {
  try {
    const versions = await db.query.templateVersions.findMany({
      where: and(eq(templateVersions.templateId, templateId), eq(templateVersions.userId, userId)),
    });

    return versions;
  } catch (error) {
    console.error('Error getting template versions:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب إصدارات القالب',
    });
  }
}

export async function restoreTemplateVersion(templateId: number, versionId: number, userId: number) {
  try {
    // جلب الإصدار
    const version = await db.query.templateVersions.findFirst({
      where: eq(templateVersions.id, versionId),
    });

    if (!version) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'الإصدار غير موجود',
      });
    }

    // استعادة البيانات
    await db
      .update(exportTemplates)
      .set({
        ...version.templateData,
        updatedAt: new Date(),
      })
      .where(eq(exportTemplates.id, templateId));

    return {
      success: true,
      message: 'تم استعادة الإصدار بنجاح',
    };
  } catch (error) {
    console.error('Error restoring template version:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في استعادة الإصدار',
    });
  }
}

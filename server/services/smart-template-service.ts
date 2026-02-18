import { getDb } from '../db'; const db = await getDb();
import { TRPCError } from '@trpc/server';

/**
 * خدمة القوالب الذكية
 * Smart Template Service
 */

export interface TemplateRecommendation {
  templateId: number;
  name: string;
  score: number;
  reason: string;
  usageFrequency: number;
  lastUsed: Date | null;
}

// ==================== توصيات القوالب ====================

export async function getSmartTemplateRecommendations(userId: number): Promise<TemplateRecommendation[]> {
  try {
    // جلب سجل الاستخدام للمستخدم
    const usageHistory = await db.query.templateUsageHistory.findMany({
      where: (h) => h.userId === userId,
    });

    // تحليل الأنماط
    const templateScores = new Map<number, { score: number; frequency: number; lastUsed: Date | null }>();

    usageHistory.forEach((usage) => {
      const current = templateScores.get(usage.templateId) || { score: 0, frequency: 0, lastUsed: null };

      // زيادة النقاط بناءً على نوع الاستخدام
      let scoreIncrease = 0;
      if (usage.usageType === 'export') scoreIncrease = 3;
      else if (usage.usageType === 'schedule') scoreIncrease = 2;
      else if (usage.usageType === 'preview') scoreIncrease = 1;

      // زيادة النقاط إذا كان التصدير ناجحاً
      if (usage.status === 'success') scoreIncrease += 2;

      templateScores.set(usage.templateId, {
        score: current.score + scoreIncrease,
        frequency: current.frequency + 1,
        lastUsed: usage.completedAt || current.lastUsed,
      });
    });

    // جلب تفاصيل القوالب
    const templates = await db.query.exportTemplates.findMany({
      where: (t) => t.userId === userId,
    });

    // بناء قائمة التوصيات
    const recommendations: TemplateRecommendation[] = templates
      .filter((template) => templateScores.has(template.id))
      .map((template) => {
        const score = templateScores.get(template.id)!;
        return {
          templateId: template.id,
          name: template.name,
          score: score.score,
          reason: generateRecommendationReason(score.frequency, score.score),
          usageFrequency: score.frequency,
          lastUsed: score.lastUsed,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // أعلى 5 توصيات

    return recommendations;
  } catch (error) {
    console.error('Error getting smart template recommendations:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب التوصيات',
    });
  }
}

// ==================== القوالب المقترحة بناءً على البيانات ====================

export async function suggestTemplatesByDataType(userId: number, dataType: string) {
  try {
    const templates = await db.query.exportTemplates.findMany({
      where: (t) => t.userId === userId && t.templateType === dataType,
    });

    return templates.map((template) => ({
      id: template.id,
      name: template.name,
      description: template.description,
      format: template.exportFormat,
      usageCount: template.usageCount || 0,
    }));
  } catch (error) {
    console.error('Error suggesting templates by data type:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في اقتراح القوالب',
    });
  }
}

// ==================== القوالب المقترحة بناءً على الحقول ====================

export async function suggestTemplatesByFields(userId: number, selectedFields: string[]) {
  try {
    const templates = await db.query.exportTemplates.findMany({
      where: (t) => t.userId === userId,
    });

    // حساب التشابه بين الحقول المختارة والقوالب الموجودة
    const suggestions = templates
      .map((template) => {
        const templateFields = template.selectedFields || [];
        const matchCount = selectedFields.filter((field) => templateFields.includes(field)).length;
        const similarity = matchCount / Math.max(selectedFields.length, templateFields.length);

        return {
          id: template.id,
          name: template.name,
          description: template.description,
          similarity: Math.round(similarity * 100),
          matchedFields: matchCount,
          totalFields: templateFields.length,
        };
      })
      .filter((suggestion) => suggestion.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    return suggestions;
  } catch (error) {
    console.error('Error suggesting templates by fields:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في اقتراح القوالب',
    });
  }
}

// ==================== القوالب المشابهة ====================

export async function findSimilarTemplates(userId: number, templateId: number) {
  try {
    // جلب القالب الحالي
    const currentTemplate = await db.query.exportTemplates.findFirst({
      where: (t) => t.id === templateId && t.userId === userId,
    });

    if (!currentTemplate) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'القالب غير موجود',
      });
    }

    // جلب جميع قوالب المستخدم
    const allTemplates = await db.query.exportTemplates.findMany({
      where: (t) => t.userId === userId && t.id !== templateId,
    });

    // حساب التشابه
    const similarTemplates = allTemplates
      .map((template) => {
        let similarity = 0;

        // تشابه نوع البيانات
        if (template.templateType === currentTemplate.templateType) similarity += 30;

        // تشابه صيغة التصدير
        if (template.exportFormat === currentTemplate.exportFormat) similarity += 20;

        // تشابه الحقول
        const currentFields = currentTemplate.selectedFields || [];
        const templateFields = template.selectedFields || [];
        const commonFields = currentFields.filter((f) => templateFields.includes(f)).length;
        const fieldSimilarity = (commonFields / Math.max(currentFields.length, templateFields.length)) * 50;
        similarity += fieldSimilarity;

        return {
          id: template.id,
          name: template.name,
          description: template.description,
          similarity: Math.round(similarity),
        };
      })
      .filter((template) => template.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    return similarTemplates;
  } catch (error) {
    console.error('Error finding similar templates:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في البحث عن قوالب مشابهة',
    });
  }
}

// ==================== التوصيات بناءً على الوقت ====================

export async function suggestTemplatesByTime(userId: number) {
  try {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // جلب القوالب المستخدمة في الأسبوع الماضي
    const recentUsage = await db.query.templateUsageHistory.findMany({
      where: (h) => h.userId === userId && h.completedAt! >= oneWeekAgo,
    });

    // عد استخدام كل قالب
    const usageMap = new Map<number, number>();
    recentUsage.forEach((usage) => {
      usageMap.set(usage.templateId, (usageMap.get(usage.templateId) || 0) + 1);
    });

    // جلب تفاصيل القوالب
    const templates = await db.query.exportTemplates.findMany({
      where: (t) => t.userId === userId,
    });

    const suggestions = templates
      .filter((template) => usageMap.has(template.id))
      .map((template) => ({
        id: template.id,
        name: template.name,
        description: template.description,
        recentUsageCount: usageMap.get(template.id) || 0,
        reason: 'استخدمت هذا القالب مؤخراً',
      }))
      .sort((a, b) => b.recentUsageCount - a.recentUsageCount);

    return suggestions;
  } catch (error) {
    console.error('Error suggesting templates by time:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في اقتراح القوالب',
    });
  }
}

// ==================== دوال مساعدة ====================

function generateRecommendationReason(frequency: number, score: number): string {
  if (frequency >= 10) {
    return 'قالب مستخدم بكثرة';
  } else if (frequency >= 5) {
    return 'قالب مستخدم بانتظام';
  } else if (score >= 10) {
    return 'قالب ناجح وموثوق';
  } else {
    return 'قالب موصى به';
  }
}

// ==================== تحليل أنماط الاستخدام ====================

export async function analyzeUsagePatterns(userId: number) {
  try {
    const usageHistory = await db.query.templateUsageHistory.findMany({
      where: (h) => h.userId === userId,
    });

    const patterns = {
      totalUsage: usageHistory.length,
      successRate: 0,
      averageDuration: 0,
      mostUsedFormat: '',
      preferredDataType: '',
    };

    if (usageHistory.length === 0) {
      return patterns;
    }

    // حساب معدل النجاح
    const successCount = usageHistory.filter((u) => u.status === 'success').length;
    patterns.successRate = Math.round((successCount / usageHistory.length) * 100);

    // حساب متوسط المدة
    const validDurations = usageHistory.filter((u: any) => u.duration).map((u: any) => u.duration || 0);
    if (validDurations.length > 0) {
      patterns.averageDuration = Math.round(validDurations.reduce((a: number, b: number) => a + b, 0) / validDurations.length);
    }

    return patterns;
  } catch (error) {
    console.error('Error analyzing usage patterns:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في تحليل أنماط الاستخدام',
    });
  }
}

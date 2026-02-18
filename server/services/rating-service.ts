/**
 * خدمة إدارة التقييمات (Rating Service)
 * 
 * @module ./server/services/rating-service
 * @description إدارة تقييمات العملاء والملاحظات التلقائية
 */

import { getDb } from "../db";
import { liveChatConversations } from "../../drizzle/live-chat-schema";
import { eq } from "drizzle-orm";

export interface RatingRequest {
  conversationId: string;
  customerId: number;
  agentId: number;
  subject: string;
  sentAt: Date;
  expiresAt: Date;
  status: "pending" | "completed" | "expired";
}

export interface RatingSubmission {
  conversationId: string;
  customerId: number;
  agentId: number;
  rating: number; // من 1 إلى 5
  comment: string;
  submittedAt: Date;
  categories: {
    responseTime: number;
    professionalism: number;
    problemResolution: number;
    communication: number;
  };
}

export interface RatingAnalytics {
  totalRatings: number;
  averageRating: number;
  ratingDistribution: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
  categoryAverages: {
    responseTime: number;
    professionalism: number;
    problemResolution: number;
    communication: number;
  };
  commonThemes: {
    positive: string[];
    negative: string[];
  };
  agentRatings: {
    agentId: number;
    averageRating: number;
    totalRatings: number;
  }[];
}

/**
 * فئة إدارة التقييمات
 */
class RatingService {
  private ratingRequests: Map<string, RatingRequest> = new Map();
  private ratingSubmissions: RatingSubmission[] = [];
  private commonPositiveThemes = [
    "سريع",
    "احترافي",
    "مفيد",
    "ودود",
    "فعال",
    "ممتاز",
    "رائع",
  ];
  private commonNegativeThemes = [
    "بطيء",
    "غير مفيد",
    "غير احترافي",
    "معقد",
    "مربك",
    "سيء",
  ];

  /**
   * إنشاء طلب تقييم جديد
   */
  async createRatingRequest(
    conversationId: string,
    customerId: number,
    agentId: number,
    subject: string
  ): Promise<RatingRequest> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 أيام

    const ratingRequest: RatingRequest = {
      conversationId,
      customerId,
      agentId,
      subject,
      sentAt: now,
      expiresAt,
      status: "pending",
    };

    this.ratingRequests.set(conversationId, ratingRequest);
    return ratingRequest;
  }

  /**
   * الحصول على طلب التقييم
   */
  getRatingRequest(conversationId: string): RatingRequest | undefined {
    const request = this.ratingRequests.get(conversationId);

    // التحقق من انتهاء صلاحية الطلب
    if (request && request.expiresAt < new Date()) {
      request.status = "expired";
    }

    return request;
  }

  /**
   * تقديم التقييم
   */
  async submitRating(
    conversationId: string,
    customerId: number,
    agentId: number,
    rating: number,
    comment: string,
    categories: {
      responseTime: number;
      professionalism: number;
      problemResolution: number;
      communication: number;
    }
  ): Promise<RatingSubmission> {
    // التحقق من صحة التقييم
    if (rating < 1 || rating > 5) {
      throw new Error("التقييم يجب أن يكون بين 1 و 5");
    }

    // التحقق من صحة فئات التقييم
    Object.values(categories).forEach((cat) => {
      if (cat < 1 || cat > 5) {
        throw new Error("تقييم الفئة يجب أن يكون بين 1 و 5");
      }
    });

    const submission: RatingSubmission = {
      conversationId,
      customerId,
      agentId,
      rating,
      comment,
      submittedAt: new Date(),
      categories,
    };

    this.ratingSubmissions.push(submission);

    // تحديث حالة طلب التقييم
    const request = this.ratingRequests.get(conversationId);
    if (request) {
      request.status = "completed";
    }

    // تحديث المحادثة في قاعدة البيانات
    const db = await getDb();
    if (db) {
      await db
        .update(liveChatConversations)
        .set({ rating, ratingComment: comment })
        .where(eq(liveChatConversations.id, conversationId));
    }

    return submission;
  }

  /**
   * الحصول على التقييمات
   */
  getRatings(
    agentId?: number,
    limit: number = 50,
    offset: number = 0
  ): RatingSubmission[] {
    let submissions = this.ratingSubmissions;

    if (agentId) {
      submissions = submissions.filter((s) => s.agentId === agentId);
    }

    return submissions.slice(offset, offset + limit);
  }

  /**
   * حساب إحصائيات التقييمات
   */
  calculateRatingAnalytics(agentId?: number): RatingAnalytics {
    let submissions = this.ratingSubmissions;

    if (agentId) {
      submissions = submissions.filter((s) => s.agentId === agentId);
    }

    const totalRatings = submissions.length;

    // توزيع التقييمات
    const ratingDistribution = {
      fiveStar: submissions.filter((s) => s.rating === 5).length,
      fourStar: submissions.filter((s) => s.rating === 4).length,
      threeStar: submissions.filter((s) => s.rating === 3).length,
      twoStar: submissions.filter((s) => s.rating === 2).length,
      oneStar: submissions.filter((s) => s.rating === 1).length,
    };

    // متوسط التقييم
    const averageRating =
      totalRatings > 0
        ? submissions.reduce((sum, s) => sum + s.rating, 0) / totalRatings
        : 0;

    // متوسط الفئات
    const categoryAverages = {
      responseTime:
        totalRatings > 0
          ? submissions.reduce((sum, s) => sum + s.categories.responseTime, 0) /
            totalRatings
          : 0,
      professionalism:
        totalRatings > 0
          ? submissions.reduce((sum, s) => sum + s.categories.professionalism, 0) /
            totalRatings
          : 0,
      problemResolution:
        totalRatings > 0
          ? submissions.reduce(
              (sum, s) => sum + s.categories.problemResolution,
              0
            ) / totalRatings
          : 0,
      communication:
        totalRatings > 0
          ? submissions.reduce((sum, s) => sum + s.categories.communication, 0) /
            totalRatings
          : 0,
    };

    // استخراج المواضيع الشائعة
    const commonThemes = this.extractCommonThemes(submissions);

    // تقييمات الموظفين
    const agentRatings = this.calculateAgentRatings(submissions);

    return {
      totalRatings,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
      categoryAverages: {
        responseTime: Math.round(categoryAverages.responseTime * 100) / 100,
        professionalism: Math.round(categoryAverages.professionalism * 100) / 100,
        problemResolution:
          Math.round(categoryAverages.problemResolution * 100) / 100,
        communication: Math.round(categoryAverages.communication * 100) / 100,
      },
      commonThemes,
      agentRatings,
    };
  }

  /**
   * استخراج المواضيع الشائعة من التعليقات
   */
  private extractCommonThemes(submissions: RatingSubmission[]): {
    positive: string[];
    negative: string[];
  } {
    const positive: { [key: string]: number } = {};
    const negative: { [key: string]: number } = {};

    submissions.forEach((submission) => {
      const comment = submission.comment.toLowerCase();

      // البحث عن المواضيع الإيجابية
      this.commonPositiveThemes.forEach((theme) => {
        if (comment.includes(theme)) {
          positive[theme] = (positive[theme] || 0) + 1;
        }
      });

      // البحث عن المواضيع السلبية
      this.commonNegativeThemes.forEach((theme) => {
        if (comment.includes(theme)) {
          negative[theme] = (negative[theme] || 0) + 1;
        }
      });
    });

    // ترتيب المواضيع حسب التكرار
    const sortedPositive = Object.entries(positive)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);

    const sortedNegative = Object.entries(negative)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);

    return {
      positive: sortedPositive,
      negative: sortedNegative,
    };
  }

  /**
   * حساب تقييمات الموظفين
   */
  private calculateAgentRatings(submissions: RatingSubmission[]): {
    agentId: number;
    averageRating: number;
    totalRatings: number;
  }[] {
    const agentMap = new Map<
      number,
      { ratings: number[]; total: number }
    >();

    submissions.forEach((submission) => {
      if (!agentMap.has(submission.agentId)) {
        agentMap.set(submission.agentId, { ratings: [], total: 0 });
      }

      const agent = agentMap.get(submission.agentId)!;
      agent.ratings.push(submission.rating);
      agent.total += 1;
    });

    return Array.from(agentMap.entries())
      .map(([agentId, data]) => ({
        agentId,
        averageRating:
          Math.round(
            (data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length) *
              100
          ) / 100,
        totalRatings: data.total,
      }))
      .sort((a, b) => b.averageRating - a.averageRating);
  }

  /**
   * الحصول على التقييمات المنخفضة
   */
  getLowRatings(threshold: number = 3, limit: number = 10): RatingSubmission[] {
    return this.ratingSubmissions
      .filter((s) => s.rating < threshold)
      .sort((a, b) => a.rating - b.rating)
      .slice(0, limit);
  }

  /**
   * الحصول على التقييمات العالية
   */
  getHighRatings(threshold: number = 4, limit: number = 10): RatingSubmission[] {
    return this.ratingSubmissions
      .filter((s) => s.rating >= threshold)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  /**
   * توليد توصيات بناءً على التقييمات
   */
  generateRecommendations(agentId?: number): string[] {
    const analytics = this.calculateRatingAnalytics(agentId);
    const recommendations: string[] = [];

    // توصيات بناءً على متوسط التقييم
    if (analytics.averageRating < 3) {
      recommendations.push("يحتاج إلى تحسن فوري في جودة الخدمة");
    } else if (analytics.averageRating < 4) {
      recommendations.push("هناك مجال للتحسن في بعض جوانب الخدمة");
    } else if (analytics.averageRating >= 4.5) {
      recommendations.push("أداء ممتازة - استمر في هذا المستوى");
    }

    // توصيات بناءً على الفئات
    if (analytics.categoryAverages.responseTime < 3) {
      recommendations.push("تحسين سرعة الاستجابة");
    }

    if (analytics.categoryAverages.professionalism < 3) {
      recommendations.push("تحسين الاحترافية والسلوك المهني");
    }

    if (analytics.categoryAverages.problemResolution < 3) {
      recommendations.push("تحسين القدرة على حل المشاكل");
    }

    if (analytics.categoryAverages.communication < 3) {
      recommendations.push("تحسين مهارات التواصل");
    }

    // توصيات بناءً على المواضيع الشائعة
    if (analytics.commonThemes.negative.length > 0) {
      recommendations.push(
        `معالجة المشاكل الشائعة: ${analytics.commonThemes.negative.join(", ")}`
      );
    }

    return recommendations;
  }

  /**
   * مسح التقييمات القديمة
   */
  clearOldRatings(daysOld: number = 365): number {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const initialLength = this.ratingSubmissions.length;

    this.ratingSubmissions = this.ratingSubmissions.filter(
      (s) => s.submittedAt > cutoffDate
    );

    return initialLength - this.ratingSubmissions.length;
  }
}

// إنشاء مثيل واحد من خدمة التقييمات
export const ratingService = new RatingService();

/**
 * دالة مساعدة لإنشاء طلب تقييم
 */
export async function createRatingRequest(
  conversationId: string,
  customerId: number,
  agentId: number,
  subject: string
): Promise<RatingRequest> {
  return ratingService.createRatingRequest(conversationId, customerId, agentId, subject);
}

/**
 * دالة مساعدة لتقديم التقييم
 */
export async function submitRating(
  conversationId: string,
  customerId: number,
  agentId: number,
  rating: number,
  comment: string,
  categories: {
    responseTime: number;
    professionalism: number;
    problemResolution: number;
    communication: number;
  }
): Promise<RatingSubmission> {
  return ratingService.submitRating(
    conversationId,
    customerId,
    agentId,
    rating,
    comment,
    categories
  );
}

/**
 * دالة مساعدة لحساب الإحصائيات
 */
export function getRatingAnalytics(agentId?: number): RatingAnalytics {
  return ratingService.calculateRatingAnalytics(agentId);
}

/**
 * دالة مساعدة للحصول على التوصيات
 */
export function getRatingRecommendations(agentId?: number): string[] {
  return ratingService.generateRecommendations(agentId);
}

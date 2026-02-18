import { TRPCError } from '@trpc/server';
import { db } from '@/server/db';
import { shipmentRatings, ratingStatistics, ratingImages, ratingReplies, ratingKeywords } from '@/drizzle/ratings-schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

/**
 * خدمة التقييمات
 * Ratings Service
 */

export interface CreateRatingInput {
  userId: number;
  shipmentId: number;
  trackingNumber: string;
  companyCode: string;
  overallRating: number;
  deliverySpeedRating: number;
  packageConditionRating: number;
  customerServiceRating: number;
  priceValueRating: number;
  comment?: string;
  wouldRecommend: boolean;
  images?: string[];
}

export interface RatingResponse {
  id: number;
  userId: number;
  shipmentId: number;
  trackingNumber: string;
  companyCode: string;
  overallRating: number;
  deliverySpeedRating: number;
  packageConditionRating: number;
  customerServiceRating: number;
  priceValueRating: number;
  comment?: string;
  wouldRecommend: boolean;
  status: string;
  createdAt: Date;
  averageRating: number;
}

// ==================== إنشاء تقييم جديد ====================

export async function createRating(input: CreateRatingInput): Promise<RatingResponse> {
  try {
    const averageRating =
      (input.overallRating +
        input.deliverySpeedRating +
        input.packageConditionRating +
        input.customerServiceRating +
        input.priceValueRating) /
      5;

    const [result] = await db.insert(shipmentRatings).values({
      userId: input.userId,
      shipmentId: input.shipmentId,
      trackingNumber: input.trackingNumber,
      companyCode: input.companyCode,
      overallRating: input.overallRating,
      deliverySpeedRating: input.deliverySpeedRating,
      packageConditionRating: input.packageConditionRating,
      customerServiceRating: input.customerServiceRating,
      priceValueRating: input.priceValueRating,
      comment: input.comment,
      wouldRecommend: input.wouldRecommend,
    });

    // إضافة الصور
    if (input.images && input.images.length > 0) {
      for (let i = 0; i < input.images.length; i++) {
        await db.insert(ratingImages).values({
          ratingId: result.insertId,
          imageUrl: input.images[i],
          imageKey: `rating-${result.insertId}-${i}`,
          displayOrder: i,
        });
      }
    }

    // تحديث الإحصائيات
    await updateRatingStatistics(input.companyCode);

    return {
      id: result.insertId,
      userId: input.userId,
      shipmentId: input.shipmentId,
      trackingNumber: input.trackingNumber,
      companyCode: input.companyCode,
      overallRating: input.overallRating,
      deliverySpeedRating: input.deliverySpeedRating,
      packageConditionRating: input.packageConditionRating,
      customerServiceRating: input.customerServiceRating,
      priceValueRating: input.priceValueRating,
      comment: input.comment,
      wouldRecommend: input.wouldRecommend,
      status: 'pending',
      createdAt: new Date(),
      averageRating,
    };
  } catch (error) {
    console.error('Error creating rating:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في إنشاء التقييم',
    });
  }
}

// ==================== جلب التقييمات ====================

export async function getRatings(
  companyCode: string,
  limit: number = 10,
  offset: number = 0,
  status?: string
) {
  try {
    const where = status ? and(eq(shipmentRatings.companyCode, companyCode), eq(shipmentRatings.status, status as any)) : eq(shipmentRatings.companyCode, companyCode);

    const ratings = await db
      .select()
      .from(shipmentRatings)
      .where(where)
      .orderBy(desc(shipmentRatings.createdAt))
      .limit(limit)
      .offset(offset);

    return ratings;
  } catch (error) {
    console.error('Error getting ratings:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب التقييمات',
    });
  }
}

// ==================== جلب تقييم واحد ====================

export async function getRatingById(ratingId: number) {
  try {
    const [rating] = await db.select().from(shipmentRatings).where(eq(shipmentRatings.id, ratingId));

    if (!rating) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'التقييم غير موجود',
      });
    }

    // جلب الصور
    const images = await db.select().from(ratingImages).where(eq(ratingImages.ratingId, ratingId));

    // جلب الردود
    const replies = await db.select().from(ratingReplies).where(eq(ratingReplies.ratingId, ratingId));

    return {
      ...rating,
      images,
      replies,
    };
  } catch (error) {
    console.error('Error getting rating:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب التقييم',
    });
  }
}

// ==================== تحديث حالة التقييم ====================

export async function updateRatingStatus(ratingId: number, status: string) {
  try {
    await db.update(shipmentRatings).set({ status: status as any }).where(eq(shipmentRatings.id, ratingId));

    return { success: true };
  } catch (error) {
    console.error('Error updating rating status:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في تحديث حالة التقييم',
    });
  }
}

// ==================== إضافة رد على التقييم ====================

export async function addRatingReply(ratingId: number, companyId: number, replyText: string) {
  try {
    const [result] = await db.insert(ratingReplies).values({
      ratingId,
      companyId,
      replyText,
    });

    return { id: result.insertId, success: true };
  } catch (error) {
    console.error('Error adding rating reply:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في إضافة الرد',
    });
  }
}

// ==================== جلب إحصائيات التقييمات ====================

export async function getRatingStatistics(companyCode: string) {
  try {
    const [stats] = await db.select().from(ratingStatistics).where(eq(ratingStatistics.companyCode, companyCode));

    if (!stats) {
      return {
        companyCode,
        totalRatings: 0,
        averageOverallRating: 0,
        recommendationPercentage: 0,
      };
    }

    return stats;
  } catch (error) {
    console.error('Error getting rating statistics:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في جلب الإحصائيات',
    });
  }
}

// ==================== تحديث الإحصائيات ====================

export async function updateRatingStatistics(companyCode: string) {
  try {
    const ratings = await db
      .select()
      .from(shipmentRatings)
      .where(and(eq(shipmentRatings.companyCode, companyCode), eq(shipmentRatings.status, 'approved')));

    if (ratings.length === 0) return;

    const totalRatings = ratings.length;
    const recommendedCount = ratings.filter((r) => r.wouldRecommend).length;

    const averageOverallRating = ratings.reduce((sum, r) => sum + r.overallRating, 0) / totalRatings;
    const averageDeliverySpeedRating = ratings.reduce((sum, r) => sum + r.deliverySpeedRating, 0) / totalRatings;
    const averagePackageConditionRating =
      ratings.reduce((sum, r) => sum + r.packageConditionRating, 0) / totalRatings;
    const averageCustomerServiceRating =
      ratings.reduce((sum, r) => sum + r.customerServiceRating, 0) / totalRatings;
    const averagePriceValueRating = ratings.reduce((sum, r) => sum + r.priceValueRating, 0) / totalRatings;

    const recommendationPercentage = (recommendedCount / totalRatings) * 100;

    // حساب التوزيع
    const fiveStarCount = ratings.filter((r) => r.overallRating === 5).length;
    const fourStarCount = ratings.filter((r) => r.overallRating === 4).length;
    const threeStarCount = ratings.filter((r) => r.overallRating === 3).length;
    const twoStarCount = ratings.filter((r) => r.overallRating === 2).length;
    const oneStarCount = ratings.filter((r) => r.overallRating === 1).length;

    // تحديث أو إنشاء الإحصائيات
    const existingStats = await db
      .select()
      .from(ratingStatistics)
      .where(eq(ratingStatistics.companyCode, companyCode));

    if (existingStats.length > 0) {
      await db
        .update(ratingStatistics)
        .set({
          totalRatings,
          averageOverallRating: averageOverallRating.toString(),
          averageDeliverySpeedRating: averageDeliverySpeedRating.toString(),
          averagePackageConditionRating: averagePackageConditionRating.toString(),
          averageCustomerServiceRating: averageCustomerServiceRating.toString(),
          averagePriceValueRating: averagePriceValueRating.toString(),
          recommendationPercentage: recommendationPercentage.toString(),
          fiveStarCount,
          fourStarCount,
          threeStarCount,
          twoStarCount,
          oneStarCount,
        })
        .where(eq(ratingStatistics.companyCode, companyCode));
    } else {
      await db.insert(ratingStatistics).values({
        companyCode,
        totalRatings,
        averageOverallRating: averageOverallRating.toString(),
        averageDeliverySpeedRating: averageDeliverySpeedRating.toString(),
        averagePackageConditionRating: averagePackageConditionRating.toString(),
        averageCustomerServiceRating: averageCustomerServiceRating.toString(),
        averagePriceValueRating: averagePriceValueRating.toString(),
        recommendationPercentage: recommendationPercentage.toString(),
        fiveStarCount,
        fourStarCount,
        threeStarCount,
        twoStarCount,
        oneStarCount,
      });
    }
  } catch (error) {
    console.error('Error updating rating statistics:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في تحديث الإحصائيات',
    });
  }
}

// ==================== حذف تقييم ====================

export async function deleteRating(ratingId: number) {
  try {
    await db.update(shipmentRatings).set({ deletedAt: new Date() }).where(eq(shipmentRatings.id, ratingId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting rating:', error);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في حذف التقييم',
    });
  }
}

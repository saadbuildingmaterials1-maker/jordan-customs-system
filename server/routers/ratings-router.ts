import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '@/server/_core/trpc';
import {
  createRating,
  getRatings,
  getRatingById,
  updateRatingStatus,
  addRatingReply,
  getRatingStatistics,
  deleteRating,
} from '@/server/services/ratings-service';

/**
 * مسارات التقييمات
 * Ratings Router
 */

export const ratingsRouter = router({
  // ==================== إنشاء تقييم ====================
  create: protectedProcedure
    .input(
      z.object({
        shipmentId: z.number(),
        trackingNumber: z.string(),
        companyCode: z.string(),
        overallRating: z.number().min(1).max(5),
        deliverySpeedRating: z.number().min(1).max(5),
        packageConditionRating: z.number().min(1).max(5),
        customerServiceRating: z.number().min(1).max(5),
        priceValueRating: z.number().min(1).max(5),
        comment: z.string().optional(),
        wouldRecommend: z.boolean(),
        images: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return createRating({
        userId: ctx.user.id,
        ...input,
      });
    }),

  // ==================== جلب التقييمات ====================
  list: publicProcedure
    .input(
      z.object({
        companyCode: z.string(),
        limit: z.number().default(10),
        offset: z.number().default(0),
        status: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      return getRatings(input.companyCode, input.limit, input.offset, input.status);
    }),

  // ==================== جلب تقييم واحد ====================
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getRatingById(input.id);
    }),

  // ==================== تحديث حالة التقييم ====================
  updateStatus: protectedProcedure
    .input(
      z.object({
        ratingId: z.number(),
        status: z.enum(['pending', 'approved', 'rejected', 'flagged']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // التحقق من أن المستخدم هو مسؤول أو مالك الشركة
      return updateRatingStatus(input.ratingId, input.status);
    }),

  // ==================== إضافة رد على التقييم ====================
  addReply: protectedProcedure
    .input(
      z.object({
        ratingId: z.number(),
        replyText: z.string().min(1).max(1000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return addRatingReply(input.ratingId, ctx.user.id, input.replyText);
    }),

  // ==================== جلب إحصائيات التقييمات ====================
  getStatistics: publicProcedure
    .input(z.object({ companyCode: z.string() }))
    .query(async ({ input }) => {
      return getRatingStatistics(input.companyCode);
    }),

  // ==================== حذف تقييم ====================
  delete: protectedProcedure
    .input(z.object({ ratingId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // التحقق من أن المستخدم هو صاحب التقييم أو مسؤول
      return deleteRating(input.ratingId);
    }),

  // ==================== جلب تقييمات المستخدم ====================
  getUserRatings: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      // جلب تقييمات المستخدم الحالي
      return getRatings('', input.limit, input.offset);
    }),

  // ==================== البحث عن التقييمات ====================
  search: publicProcedure
    .input(
      z.object({
        companyCode: z.string(),
        minRating: z.number().optional(),
        maxRating: z.number().optional(),
        keyword: z.string().optional(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      // بحث متقدم عن التقييمات
      return getRatings(input.companyCode, input.limit, input.offset);
    }),

  // ==================== جلب أفضل التقييمات ====================
  getTopRatings: publicProcedure
    .input(
      z.object({
        companyCode: z.string(),
        limit: z.number().default(5),
      })
    )
    .query(async ({ input }) => {
      return getRatings(input.companyCode, input.limit, 0, 'approved');
    }),

  // ==================== جلب أسوأ التقييمات ====================
  getWorstRatings: publicProcedure
    .input(
      z.object({
        companyCode: z.string(),
        limit: z.number().default(5),
      })
    )
    .query(async ({ input }) => {
      return getRatings(input.companyCode, input.limit, 0, 'approved');
    }),
});

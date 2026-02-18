/**
 * راوتر التقييمات المتقدم (Advanced Ratings Router)
 * 
 * @module ./server/routers/ratings-advanced-router
 * @description مسارات tRPC لإدارة التقييمات التلقائية والتحليلات
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  ratingService,
  createRatingRequest,
  submitRating,
  getRatingAnalytics,
  getRatingRecommendations,
} from "../services/rating-service";
import { TRPCError } from "@trpc/server";

export const ratingsAdvancedRouter = router({
  /**
   * إنشاء طلب تقييم جديد
   */
  createRatingRequest: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        customerId: z.number().int().positive(),
        agentId: z.number().int().positive(),
        subject: z.string().min(1).max(200),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // التحقق من الصلاحيات (يجب أن يكون الموظف نفسه أو مديراً)
        if (ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "ليس لديك صلاحية لإنشاء طلب تقييم",
          });
        }

        const ratingRequest = await createRatingRequest(
          input.conversationId,
          input.customerId,
          input.agentId,
          input.subject
        );

        return {
          success: true,
          ratingRequest,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في إنشاء طلب التقييم:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في إنشاء طلب التقييم",
        });
      }
    }),

  /**
   * الحصول على طلب التقييم
   */
  getRatingRequest: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      try {
        const ratingRequest = ratingService.getRatingRequest(input.conversationId);

        if (!ratingRequest) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "طلب التقييم غير موجود",
          });
        }

        return ratingRequest;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحصول على طلب التقييم:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على طلب التقييم",
        });
      }
    }),

  /**
   * تقديم التقييم
   */
  submitRating: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        customerId: z.number().int().positive(),
        agentId: z.number().int().positive(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().min(0).max(500),
        categories: z.object({
          responseTime: z.number().int().min(1).max(5),
          professionalism: z.number().int().min(1).max(5),
          problemResolution: z.number().int().min(1).max(5),
          communication: z.number().int().min(1).max(5),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const submission = await submitRating(
          input.conversationId,
          input.customerId,
          input.agentId,
          input.rating,
          input.comment,
          input.categories
        );

        return {
          success: true,
          submission,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        console.error("خطأ في تقديم التقييم:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في تقديم التقييم",
        });
      }
    }),

  /**
   * الحصول على التقييمات
   */
  getRatings: protectedProcedure
    .input(
      z.object({
        agentId: z.number().int().positive().optional(),
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // التحقق من الصلاحيات
        if (input.agentId && ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "ليس لديك صلاحية للوصول إلى هذه البيانات",
          });
        }

        const ratings = ratingService.getRatings(
          input.agentId,
          input.limit,
          input.offset
        );

        return {
          ratings,
          total: ratings.length,
          hasMore: ratings.length >= input.limit,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحصول على التقييمات:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على التقييمات",
        });
      }
    }),

  /**
   * الحصول على إحصائيات التقييمات
   */
  getRatingAnalytics: protectedProcedure
    .input(
      z.object({
        agentId: z.number().int().positive().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // التحقق من الصلاحيات
        if (input.agentId && ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "ليس لديك صلاحية للوصول إلى هذه البيانات",
          });
        }

        const analytics = getRatingAnalytics(input.agentId);

        return analytics;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحصول على إحصائيات التقييمات:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على الإحصائيات",
        });
      }
    }),

  /**
   * الحصول على التقييمات المنخفضة
   */
  getLowRatings: protectedProcedure
    .input(
      z.object({
        threshold: z.number().int().min(1).max(5).default(3),
        limit: z.number().int().min(1).max(50).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // التحقق من الصلاحيات
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "ليس لديك صلاحية لعرض هذه البيانات",
          });
        }

        const lowRatings = ratingService.getLowRatings(input.threshold, input.limit);

        return {
          ratings: lowRatings,
          count: lowRatings.length,
          threshold: input.threshold,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحصول على التقييمات المنخفضة:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على البيانات",
        });
      }
    }),

  /**
   * الحصول على التقييمات العالية
   */
  getHighRatings: protectedProcedure
    .input(
      z.object({
        threshold: z.number().int().min(1).max(5).default(4),
        limit: z.number().int().min(1).max(50).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // التحقق من الصلاحيات
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "ليس لديك صلاحية لعرض هذه البيانات",
          });
        }

        const highRatings = ratingService.getHighRatings(input.threshold, input.limit);

        return {
          ratings: highRatings,
          count: highRatings.length,
          threshold: input.threshold,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحصول على التقييمات العالية:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على البيانات",
        });
      }
    }),

  /**
   * الحصول على التوصيات بناءً على التقييمات
   */
  getRecommendations: protectedProcedure
    .input(
      z.object({
        agentId: z.number().int().positive().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // التحقق من الصلاحيات
        if (input.agentId && ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "ليس لديك صلاحية للوصول إلى هذه البيانات",
          });
        }

        const recommendations = getRatingRecommendations(input.agentId);

        return {
          recommendations,
          count: recommendations.length,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحصول على التوصيات:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على التوصيات",
        });
      }
    }),

  /**
   * الحصول على توزيع التقييمات
   */
  getRatingDistribution: protectedProcedure
    .input(
      z.object({
        agentId: z.number().int().positive().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // التحقق من الصلاحيات
        if (input.agentId && ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "ليس لديك صلاحية للوصول إلى هذه البيانات",
          });
        }

        const analytics = getRatingAnalytics(input.agentId);

        return {
          distribution: analytics.ratingDistribution,
          total: analytics.totalRatings,
          average: analytics.averageRating,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحصول على توزيع التقييمات:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على البيانات",
        });
      }
    }),

  /**
   * الحصول على تقييمات الفئات
   */
  getCategoryRatings: protectedProcedure
    .input(
      z.object({
        agentId: z.number().int().positive().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // التحقق من الصلاحيات
        if (input.agentId && ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "ليس لديك صلاحية للوصول إلى هذه البيانات",
          });
        }

        const analytics = getRatingAnalytics(input.agentId);

        return {
          categories: analytics.categoryAverages,
          agentId: input.agentId,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحصول على تقييمات الفئات:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على البيانات",
        });
      }
    }),

  /**
   * الحصول على المواضيع الشائعة
   */
  getCommonThemes: protectedProcedure
    .input(
      z.object({
        agentId: z.number().int().positive().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // التحقق من الصلاحيات
        if (input.agentId && ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "ليس لديك صلاحية للوصول إلى هذه البيانات",
          });
        }

        const analytics = getRatingAnalytics(input.agentId);

        return {
          themes: analytics.commonThemes,
          agentId: input.agentId,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحصول على المواضيع الشائعة:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على البيانات",
        });
      }
    }),
});

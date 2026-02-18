/**
 * راوتر تحليل الأداء (Performance Analytics Router)
 * 
 * @module ./server/routers/performance-analytics-router
 * @description مسارات tRPC لتقارير الأداء المتقدمة والإحصائيات
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  performanceAnalytics,
  getAgentMetrics,
  getTeamMetrics,
  generateReport,
} from "../services/performance-analytics";
import { TRPCError } from "@trpc/server";

export const performanceAnalyticsRouter = router({
  /**
   * الحصول على مقاييس أداء الموظف
   */
  getAgentMetrics: protectedProcedure
    .input(
      z.object({
        agentId: z.number().int().positive(),
        agentName: z.string().min(1).max(100),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // التحقق من الصلاحيات (يجب أن يكون المستخدم مديراً أو الموظف نفسه)
        if (ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "ليس لديك صلاحية للوصول إلى هذه البيانات",
          });
        }

        const metrics = await getAgentMetrics(
          input.agentId,
          input.agentName,
          input.startDate,
          input.endDate
        );

        return metrics;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحصول على مقاييس الموظف:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على المقاييس",
        });
      }
    }),

  /**
   * الحصول على مقاييس أداء الفريق
   */
  getTeamMetrics: protectedProcedure
    .input(
      z.object({
        agentIds: z.array(z.number().int().positive()),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // التحقق من الصلاحيات (يجب أن يكون المستخدم مديراً)
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "ليس لديك صلاحية لعرض إحصائيات الفريق",
          });
        }

        const metrics = await getTeamMetrics(
          input.agentIds,
          input.startDate,
          input.endDate
        );

        return metrics;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحصول على مقاييس الفريق:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على المقاييس",
        });
      }
    }),

  /**
   * توليد تقرير الأداء الشامل
   */
  generatePerformanceReport: protectedProcedure
    .input(
      z.object({
        agentIds: z.array(z.number().int().positive()),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // التحقق من الصلاحيات
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "ليس لديك صلاحية لعرض التقارير",
          });
        }

        const report = await generateReport(
          input.agentIds,
          input.startDate,
          input.endDate
        );

        return report;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في توليد التقرير:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في توليد التقرير",
        });
      }
    }),

  /**
   * الحصول على إحصائيات الموظف الشهرية
   */
  getMonthlyAgentStats: protectedProcedure
    .input(
      z.object({
        agentId: z.number().int().positive(),
        agentName: z.string().min(1).max(100),
        month: z.number().int().min(1).max(12),
        year: z.number().int().min(2020).max(2100),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // التحقق من الصلاحيات
        if (ctx.user.role !== "admin" && ctx.user.id !== input.agentId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "ليس لديك صلاحية للوصول إلى هذه البيانات",
          });
        }

        const startDate = new Date(input.year, input.month - 1, 1);
        const endDate = new Date(input.year, input.month, 0);

        const metrics = await getAgentMetrics(
          input.agentId,
          input.agentName,
          startDate,
          endDate
        );

        return {
          month: input.month,
          year: input.year,
          metrics,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحصول على إحصائيات الشهر:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على الإحصائيات",
        });
      }
    }),

  /**
   * الحصول على إحصائيات الفريق الشهرية
   */
  getMonthlyTeamStats: protectedProcedure
    .input(
      z.object({
        agentIds: z.array(z.number().int().positive()),
        month: z.number().int().min(1).max(12),
        year: z.number().int().min(2020).max(2100),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // التحقق من الصلاحيات
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "ليس لديك صلاحية لعرض إحصائيات الفريق",
          });
        }

        const startDate = new Date(input.year, input.month - 1, 1);
        const endDate = new Date(input.year, input.month, 0);

        const metrics = await getTeamMetrics(input.agentIds, startDate, endDate);

        return {
          month: input.month,
          year: input.year,
          metrics,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحصول على إحصائيات الفريق الشهرية:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على الإحصائيات",
        });
      }
    }),

  /**
   * الحصول على أفضل الموظفين أداءً
   */
  getTopPerformers: protectedProcedure
    .input(
      z.object({
        agentIds: z.array(z.number().int().positive()),
        limit: z.number().int().min(1).max(20).default(5),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
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

        const metrics = await getTeamMetrics(
          input.agentIds,
          input.startDate,
          input.endDate
        );

        return metrics.topPerformers.slice(0, input.limit);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحصول على أفضل الموظفين:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على البيانات",
        });
      }
    }),

  /**
   * الحصول على الموظفين الذين يحتاجون إلى تحسن
   */
  getBottomPerformers: protectedProcedure
    .input(
      z.object({
        agentIds: z.array(z.number().int().positive()),
        limit: z.number().int().min(1).max(20).default(5),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
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

        const metrics = await getTeamMetrics(
          input.agentIds,
          input.startDate,
          input.endDate
        );

        return metrics.bottomPerformers.slice(0, input.limit);
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحصول على الموظفين الذين يحتاجون إلى تحسن:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على البيانات",
        });
      }
    }),

  /**
   * الحصول على الاتجاهات والتنبؤات
   */
  getTrends: protectedProcedure
    .input(
      z.object({
        agentIds: z.array(z.number().int().positive()),
        days: z.number().int().min(7).max(365).default(30),
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

        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - input.days * 24 * 60 * 60 * 1000);

        const metrics = await getTeamMetrics(input.agentIds, startDate, endDate);

        return {
          days: input.days,
          trends: metrics.trends,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في الحصول على الاتجاهات:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على البيانات",
        });
      }
    }),

  /**
   * الحصول على مقارنة بين موظفين
   */
  compareAgents: protectedProcedure
    .input(
      z.object({
        agentId1: z.number().int().positive(),
        agentName1: z.string().min(1).max(100),
        agentId2: z.number().int().positive(),
        agentName2: z.string().min(1).max(100),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
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

        const comparison = await performanceAnalytics.getComparativeAnalysis(
          input.agentId1,
          input.agentId2,
          input.agentName1,
          input.agentName2
        );

        return comparison;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في المقارنة بين الموظفين:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في إجراء المقارنة",
        });
      }
    }),

  /**
   * تصدير التقرير كـ PDF
   */
  exportReportAsPDF: protectedProcedure
    .input(
      z.object({
        agentIds: z.array(z.number().int().positive()),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // التحقق من الصلاحيات
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "ليس لديك صلاحية لتصدير التقارير",
          });
        }

        const report = await generateReport(
          input.agentIds,
          input.startDate,
          input.endDate
        );

        // في الواقع، سيتم توليد PDF هنا
        return {
          success: true,
          message: "تم توليد التقرير بنجاح",
          report,
          // في الإنتاج، سيكون هناك رابط تحميل PDF
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("خطأ في تصدير التقرير:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في تصدير التقرير",
        });
      }
    }),
});

/**
 * راوتر الإشعارات المتقدم (Advanced Notifications Router)
 * 
 * @module ./server/routers/notifications-advanced-router
 * @description مسارات tRPC لإدارة الإشعارات الفورية والمتقدمة
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  notificationManager,
  getNotificationHistory,
  getNotificationStatistics,
  type NotificationPayload,
} from "../services/notification-manager";
import { TRPCError } from "@trpc/server";

export const notificationsAdvancedRouter = router({
  /**
   * الحصول على الإشعارات الحالية للمستخدم
   */
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const history = getNotificationHistory(input.limit + input.offset);
        const userNotifications = history.filter(
          (n) => n.userId === ctx.user.id || n.agentId === ctx.user.id
        );

        return {
          notifications: userNotifications.slice(input.offset, input.offset + input.limit),
          total: userNotifications.length,
          hasMore: userNotifications.length > input.offset + input.limit,
        };
      } catch (error) {
        console.error("خطأ في الحصول على الإشعارات:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في الحصول على الإشعارات",
        });
      }
    }),

  /**
   * الحصول على الإشعارات غير المقروءة
   */
  getUnreadNotifications: protectedProcedure.query(async ({ ctx }) => {
    try {
      const history = getNotificationHistory(1000);
      const unreadNotifications = history.filter(
        (n) =>
          (n.userId === ctx.user.id || n.agentId === ctx.user.id) &&
          !n.data?.isRead
      );

      return {
        notifications: unreadNotifications,
        count: unreadNotifications.length,
      };
    } catch (error) {
      console.error("خطأ في الحصول على الإشعارات غير المقروءة:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "فشل في الحصول على الإشعارات غير المقروءة",
      });
    }
  }),

  /**
   * تحديد الإشعار كمقروء
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        notificationManager.markAsRead(input.notificationId);
        return { success: true };
      } catch (error) {
        console.error("خطأ في تحديد الإشعار كمقروء:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في تحديد الإشعار كمقروء",
        });
      }
    }),

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const history = getNotificationHistory(1000);
      const userNotifications = history.filter(
        (n) => n.userId === ctx.user.id || n.agentId === ctx.user.id
      );

      userNotifications.forEach((n) => {
        notificationManager.markAsRead(n.id);
      });

      return { success: true, count: userNotifications.length };
    } catch (error) {
      console.error("خطأ في تحديد جميع الإشعارات كمقروءة:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "فشل في تحديث الإشعارات",
      });
    }
  }),

  /**
   * حذف الإشعار
   */
  deleteNotification: protectedProcedure
    .input(
      z.object({
        notificationId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        notificationManager.deleteNotification(input.notificationId);
        return { success: true };
      } catch (error) {
        console.error("خطأ في حذف الإشعار:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في حذف الإشعار",
        });
      }
    }),

  /**
   * حذف جميع الإشعارات
   */
  deleteAllNotifications: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const history = getNotificationHistory(1000);
      const userNotifications = history.filter(
        (n) => n.userId === ctx.user.id || n.agentId === ctx.user.id
      );

      userNotifications.forEach((n) => {
        notificationManager.deleteNotification(n.id);
      });

      return { success: true, count: userNotifications.length };
    } catch (error) {
      console.error("خطأ في حذف جميع الإشعارات:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "فشل في حذف الإشعارات",
      });
    }
  }),

  /**
   * الحصول على إحصائيات الإشعارات
   */
  getStatistics: protectedProcedure.query(async () => {
    try {
      const stats = getNotificationStatistics();
      return stats;
    } catch (error) {
      console.error("خطأ في الحصول على إحصائيات الإشعارات:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "فشل في الحصول على الإحصائيات",
      });
    }
  }),

  /**
   * الاشتراك في الإشعارات (للعملاء الفعليين)
   */
  subscribe: protectedProcedure.subscription(async function* ({ ctx }) {
    // إنشاء قناة للإشعارات
    const channel = new BroadcastChannel(`notifications-${ctx.user.id}`);

    try {
      yield { type: "connected", message: "تم الاتصال بنجاح" };

      // الاستماع للرسائل
      channel.onmessage = (event) => {
        const notification: NotificationPayload = event.data;
        if (notification.userId === ctx.user.id || notification.agentId === ctx.user.id) {
          // سيتم إرسال الإشعار
        }
      };

      // الانتظار إلى الأبد (حتى قطع الاتصال)
      await new Promise(() => {});
    } finally {
      channel.close();
    }
  }),

  /**
   * إرسال إشعار اختبار
   */
  sendTestNotification: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(100),
        message: z.string().min(1).max(500),
        type: z.enum([
          "new_conversation",
          "escalated",
          "assigned",
          "closed",
          "message",
          "rating",
        ]),
        priority: z.enum(["low", "medium", "high", "urgent"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const testNotification: NotificationPayload = {
          id: `test_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          type: input.type as any,
          title: input.title,
          message: input.message,
          conversationId: "test_conversation",
          userId: ctx.user.id,
          priority: input.priority,
          timestamp: new Date(),
          data: { isTest: true },
        };

        await notificationManager.sendNotification(testNotification);

        return {
          success: true,
          notification: testNotification,
        };
      } catch (error) {
        console.error("خطأ في إرسال إشعار الاختبار:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل في إرسال إشعار الاختبار",
        });
      }
    }),

  /**
   * الحصول على إحصائيات الإشعارات حسب النوع
   */
  getStatisticsByType: protectedProcedure.query(async () => {
    try {
      const stats = getNotificationStatistics();
      return stats.byType || {};
    } catch (error) {
      console.error("خطأ في الحصول على الإحصائيات حسب النوع:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "فشل في الحصول على الإحصائيات",
      });
    }
  }),

  /**
   * الحصول على إحصائيات الإشعارات حسب الأولوية
   */
  getStatisticsByPriority: protectedProcedure.query(async () => {
    try {
      const stats = getNotificationStatistics();
      return stats.byPriority || {};
    } catch (error) {
      console.error("خطأ في الحصول على الإحصائيات حسب الأولوية:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "فشل في الحصول على الإحصائيات",
      });
    }
  }),
});

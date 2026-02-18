/**
 * مسارات tRPC للدعم الحي والإشعارات
 * 
 * @module ./server/routers/live-chat-router
 * @description مسارات tRPC لإدارة المحادثات والإشعارات المخصصة
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as liveChatService from "../services/live-chat-service";
import * as notificationService from "../services/notification-preferences-service";

/**
 * مسارات الدعم الحي (Live Chat Routes)
 */
export const liveChatRouter = router({
  /**
   * إنشاء محادثة دعم جديدة
   */
  createConversation: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(5).max(255),
        category: z.enum([
          "billing",
          "technical",
          "general",
          "complaint",
        ]),
        priority: z
          .enum(["low", "medium", "high", "urgent"])
          .default("medium"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const conversationId = await liveChatService.createLiveChatConversation(
        ctx.user.id,
        input.subject,
        input.category,
        input.priority
      );

      return {
        success: true,
        conversationId,
        message: "تم إنشاء المحادثة بنجاح",
      };
    }),

  /**
   * إرسال رسالة في المحادثة
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        message: z.string().min(1).max(5000),
        attachmentUrl: z.string().url().optional(),
        attachmentName: z.string().optional(),
        attachmentSize: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const messageId = await liveChatService.sendLiveChatMessage(
        input.conversationId,
        ctx.user.id,
        input.message,
        "customer",
        input.attachmentUrl,
        input.attachmentName,
        input.attachmentSize
      );

      return {
        success: true,
        messageId,
        message: "تم إرسال الرسالة بنجاح",
      };
    }),

  /**
   * الحصول على المحادثات
   */
  getConversations: protectedProcedure
    .input(
      z.object({
        limit: z.number().max(100).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const conversations = await liveChatService.getUserConversations(
        ctx.user.id,
        input.limit
      );

      return {
        success: true,
        conversations,
        count: conversations.length,
      };
    }),

  /**
   * الحصول على رسائل المحادثة
   */
  getMessages: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        limit: z.number().max(200).default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const messages = await liveChatService.getConversationMessages(
        input.conversationId,
        input.limit
      );

      return {
        success: true,
        messages,
        count: messages.length,
      };
    }),

  /**
   * تحديث حالة المحادثة
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        status: z.enum([
          "open",
          "in_progress",
          "waiting_customer",
          "waiting_agent",
          "closed",
          "resolved",
        ]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await liveChatService.updateConversationStatus(
        input.conversationId,
        input.status
      );

      return {
        success: true,
        message: "تم تحديث حالة المحادثة بنجاح",
      };
    }),

  /**
   * تقييم المحادثة
   */
  rateConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        messageId: z.string().uuid(),
        rating: z.number().min(1).max(5),
        feedback: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await liveChatService.rateConversation(
        input.conversationId,
        input.messageId,
        input.rating,
        input.feedback
      );

      return {
        success: true,
        message: "شكراً لتقييمك",
      };
    }),

  /**
   * الحصول على الإحصائيات
   */
  getStatistics: protectedProcedure.query(async ({ ctx }) => {
    const stats = await liveChatService.getLiveChatStatistics(ctx.user.id);

    return {
      success: true,
      statistics: stats,
    };
  }),

  /**
   * البحث عن المحادثات
   */
  searchConversations: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        status: z.string().optional(),
        priority: z.string().optional(),
        category: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const results = await liveChatService.searchConversations(
        ctx.user.id,
        input.query,
        {
          status: input.status,
          priority: input.priority,
          category: input.category,
          startDate: input.startDate,
          endDate: input.endDate,
        }
      );

      return {
        success: true,
        results,
        count: results.length,
      };
    }),

  /**
   * حذف المحادثة
   */
  deleteConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await liveChatService.deleteConversation(input.conversationId);

      return {
        success: true,
        message: "تم حذف المحادثة بنجاح",
      };
    }),

  /**
   * تحديث الرسالة كمقروءة
   */
  markMessageAsRead: protectedProcedure
    .input(
      z.object({
        messageId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await liveChatService.markMessageAsRead(input.messageId);

      return {
        success: true,
        message: "تم تحديث الرسالة",
      };
    }),

  /**
   * الحصول على الرسائل غير المقروءة
   */
  getUnreadMessages: protectedProcedure.query(async ({ ctx }) => {
    const messages = await liveChatService.getUnreadMessages(ctx.user.id);

    return {
      success: true,
      messages,
      count: messages.length,
    };
  }),

  /**
   * الحصول على تاريخ الإشعارات
   */
  getNotificationHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().max(200).default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const history = await liveChatService.getNotificationHistory(
        ctx.user.id,
        input.limit,
        input.offset
      );

      return {
        success: true,
        history,
        count: history.length,
      };
    }),
});

/**
 * مسارات الإشعارات المخصصة (Notification Routes)
 */
export const notificationRouter = router({
  /**
   * الحصول على تفضيلات الإشعارات
   */
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const preferences = await notificationService.getNotificationPreferences(
      ctx.user.id
    );

    return {
      success: true,
      preferences,
    };
  }),

  /**
   * تحديث تفضيلات الإشعارات
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        enableAllNotifications: z.boolean().optional(),
        enableEmailNotifications: z.boolean().optional(),
        enableSmsNotifications: z.boolean().optional(),
        enablePushNotifications: z.boolean().optional(),
        enableInAppNotifications: z.boolean().optional(),
        enableOrderStatusNotifications: z.boolean().optional(),
        enableShipmentNotifications: z.boolean().optional(),
        enablePaymentNotifications: z.boolean().optional(),
        enableCustomsNotifications: z.boolean().optional(),
        enablePriceAlertNotifications: z.boolean().optional(),
        enableSystemNotifications: z.boolean().optional(),
        maxNotificationsPerDay: z.number().optional(),
        batchNotifications: z.boolean().optional(),
        batchInterval: z
          .enum(["hourly", "daily", "weekly"])
          .optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await notificationService.updateNotificationPreferences(
        ctx.user.id,
        input
      );

      return {
        success: true,
        message: "تم تحديث التفضيلات بنجاح",
      };
    }),

  /**
   * تفعيل/تعطيل جميع الإشعارات
   */
  toggleAllNotifications: protectedProcedure
    .input(
      z.object({
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await notificationService.toggleAllNotifications(
        ctx.user.id,
        input.enabled
      );

      return {
        success: true,
        message: input.enabled
          ? "تم تفعيل الإشعارات"
          : "تم تعطيل الإشعارات",
      };
    }),

  /**
   * تفعيل/تعطيل قناة معينة
   */
  toggleChannel: protectedProcedure
    .input(
      z.object({
        channel: z.enum(["email", "sms", "push", "in_app"]),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await notificationService.toggleNotificationChannel(
        ctx.user.id,
        input.channel,
        input.enabled
      );

      return {
        success: true,
        message: `تم ${input.enabled ? "تفعيل" : "تعطيل"} قناة ${input.channel}`,
      };
    }),

  /**
   * تعيين ساعات الهدوء
   */
  setQuietHours: protectedProcedure
    .input(
      z.object({
        startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        enabled: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await notificationService.setQuietHours(
        ctx.user.id,
        input.startTime,
        input.endTime,
        input.enabled
      );

      return {
        success: true,
        message: "تم تعيين ساعات الهدوء بنجاح",
      };
    }),

  /**
   * إضافة قناة إشعار جديدة
   */
  addChannel: protectedProcedure
    .input(
      z.object({
        channelType: z.enum(["email", "sms", "push", "in_app"]),
        channelAddress: z.string(),
        channelName: z.string().optional(),
        isPrimary: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const channelId = await notificationService.addNotificationChannel(
        ctx.user.id,
        input.channelType,
        input.channelAddress,
        input.channelName,
        input.isPrimary
      );

      return {
        success: true,
        channelId,
        message: "تم إضافة القناة بنجاح",
      };
    }),

  /**
   * الحصول على قنوات الإشعار
   */
  getChannels: protectedProcedure.query(async ({ ctx }) => {
    const channels = await notificationService.getUserNotificationChannels(
      ctx.user.id
    );

    return {
      success: true,
      channels,
      count: channels.length,
    };
  }),

  /**
   * حذف قناة إشعار
   */
  deleteChannel: protectedProcedure
    .input(
      z.object({
        channelId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await notificationService.deleteNotificationChannel(input.channelId);

      return {
        success: true,
        message: "تم حذف القناة بنجاح",
      };
    }),

  /**
   * إنشاء إشعار مخصص
   */
  createCustomNotification: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        notificationType: z.string(),
        channels: z.array(z.enum(["email", "sms", "push", "in_app"])),
        frequency: z
          .enum([
            "immediately",
            "daily",
            "weekly",
            "monthly",
            "never",
          ])
          .default("immediately"),
        conditions: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const notificationId =
        await notificationService.createCustomNotification(
          ctx.user.id,
          input.title,
          input.description,
          input.notificationType,
          input.channels,
          input.frequency,
          input.conditions
        );

      return {
        success: true,
        notificationId,
        message: "تم إنشاء الإشعار المخصص بنجاح",
      };
    }),

  /**
   * الحصول على الإشعارات المخصصة
   */
  getCustomNotifications: protectedProcedure.query(async ({ ctx }) => {
    const notifications =
      await notificationService.getUserCustomNotifications(ctx.user.id);

    return {
      success: true,
      notifications,
      count: notifications.length,
    };
  }),

  /**
   * حذف إشعار مخصص
   */
  deleteCustomNotification: protectedProcedure
    .input(
      z.object({
        notificationId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await notificationService.deleteCustomNotification(
        input.notificationId
      );

      return {
        success: true,
        message: "تم حذف الإشعار المخصص بنجاح",
      };
    }),

  /**
   * الحصول على إحصائيات الإشعارات
   */
  getStatistics: protectedProcedure.query(async ({ ctx }) => {
    const statistics = await notificationService.getNotificationStatistics(
      ctx.user.id
    );

    return {
      success: true,
      statistics,
    };
  }),

  /**
   * إلغاء الاشتراك من جميع الإشعارات
   */
  unsubscribeAll: protectedProcedure.mutation(async ({ ctx }) => {
    await notificationService.unsubscribeFromAllNotifications(ctx.user.id);

    return {
      success: true,
      message: "تم إلغاء الاشتراك من جميع الإشعارات",
    };
  }),

  /**
   * إعادة الاشتراك في الإشعارات
   */
  resubscribe: protectedProcedure.mutation(async ({ ctx }) => {
    await notificationService.resubscribeToNotifications(ctx.user.id);

    return {
      success: true,
      message: "تم إعادة الاشتراك في الإشعارات",
    };
  }),
});

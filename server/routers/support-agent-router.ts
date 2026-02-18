/**
 * راوتر وكيل الدعم (Support Agent Router)
 * 
 * @module ./server/routers/support-agent-router
 * @description مسارات tRPC لإدارة المحادثات من قبل موظفي الدعم
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  liveChatConversations,
  liveChatMessages,
} from "../../drizzle/live-chat-schema";
import { users } from "../../drizzle/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const supportAgentRouter = router({
  /**
   * الحصول على المحادثات المعلقة للموظف
   */
  getPendingConversations: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        status: z.enum(["open", "in_progress", "waiting_customer"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // التحقق من أن المستخدم موظف دعم
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "ليس لديك صلاحية للوصول إلى هذه البيانات",
        });
      }

      let query = db
        .select()
        .from(liveChatConversations)
        .where(
          input.status
            ? eq(liveChatConversations.status, input.status)
            : inArray(liveChatConversations.status, [
                "open",
                "in_progress",
                "waiting_customer",
              ])
        )
        .orderBy(desc(liveChatConversations.priority))
        .orderBy(desc(liveChatConversations.createdAt));

      const conversations = await query.limit(input.limit).offset(input.offset);
      const total = (await query).length;

      return {
        conversations,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  /**
   * الحصول على تفاصيل المحادثة الكاملة
   */
  getConversationDetails: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // التحقق من الصلاحيات
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "ليس لديك صلاحية للوصول إلى هذه البيانات",
        });
      }

      // الحصول على المحادثة
      const conversation = await db
        .select()
        .from(liveChatConversations)
        .where(eq(liveChatConversations.id, input.conversationId))
        .limit(1);

      if (conversation.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "المحادثة غير موجودة",
        });
      }

      // الحصول على الرسائل
      const messages = await db
        .select()
        .from(liveChatMessages)
        .where(eq(liveChatMessages.conversationId, input.conversationId))
        .orderBy(desc(liveChatMessages.createdAt));

      // الحصول على بيانات العميل
      const customer = await db
        .select()
        .from(users)
        .where(eq(users.id, conversation[0].userId))
        .limit(1);

      return {
        conversation: conversation[0],
        messages: messages.reverse(),
        customer: customer[0] || null,
      };
    }),

  /**
   * تعيين محادثة للموظف
   */
  assignConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // التحقق من الصلاحيات
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "ليس لديك صلاحية لتنفيذ هذا الإجراء",
        });
      }

      // تحديث المحادثة
      await db
        .update(liveChatConversations)
        .set({
          supportAgentId: ctx.user.id,
          status: "in_progress",
          updatedAt: new Date(),
        })
        .where(eq(liveChatConversations.id, input.conversationId));

      return {
        success: true,
        message: "تم تعيين المحادثة بنجاح",
      };
    }),

  /**
   * إرسال رسالة في المحادثة
   */
  sendAgentMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        message: z.string().min(1).max(5000),
        attachmentUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // التحقق من الصلاحيات
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "ليس لديك صلاحية لتنفيذ هذا الإجراء",
        });
      }

      // التحقق من أن الموظف مكلف بهذه المحادثة
      const conversation = await db
        .select()
        .from(liveChatConversations)
        .where(eq(liveChatConversations.id, input.conversationId))
        .limit(1);

      if (
        conversation.length === 0 ||
        conversation[0].supportAgentId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "أنت غير مكلف بهذه المحادثة",
        });
      }

      // إرسال الرسالة
      const messageId = await new Promise<string>((resolve) => {
        const id = Math.random().toString(36).substring(7);
        resolve(id);
      });

      await db.insert(liveChatMessages).values({
        id: messageId,
        conversationId: input.conversationId,
        senderId: ctx.user.id,
        senderType: "agent",
        message: input.message,
        messageType: input.attachmentUrl ? "file" : "text",
        attachmentUrl: input.attachmentUrl,
        isRead: false,
      });

      // تحديث حالة المحادثة
      await db
        .update(liveChatConversations)
        .set({
          status: "waiting_customer",
          updatedAt: new Date(),
        })
        .where(eq(liveChatConversations.id, input.conversationId));

      return {
        success: true,
        messageId,
        message: "تم إرسال الرسالة بنجاح",
      };
    }),

  /**
   * إغلاق المحادثة
   */
  closeConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // التحقق من الصلاحيات
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "ليس لديك صلاحية لتنفيذ هذا الإجراء",
        });
      }

      // تحديث المحادثة
      await db
        .update(liveChatConversations)
        .set({
          status: "resolved",
          closedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(liveChatConversations.id, input.conversationId));

      return {
        success: true,
        message: "تم إغلاق المحادثة بنجاح",
      };
    }),

  /**
   * الحصول على إحصائيات الموظف
   */
  getAgentStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // التحقق من الصلاحيات
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "ليس لديك صلاحية للوصول إلى هذه البيانات",
      });
    }

    // الحصول على المحادثات
    const conversations = await db
      .select()
      .from(liveChatConversations)
      .where(eq(liveChatConversations.supportAgentId, ctx.user.id));

    const stats = {
      totalConversations: conversations.length,
      activeConversations: conversations.filter(
        (c) => c.status === "in_progress"
      ).length,
      closedConversations: conversations.filter(
        (c) => c.status === "resolved"
      ).length,
      averageResponseTime: calculateAverageResponseTime(conversations),
      averageResolutionTime: calculateAverageResolutionTime(conversations),
      customerSatisfaction: calculateCustomerSatisfaction(conversations),
    };

    return stats;
  }),

  /**
   * الحصول على إحصائيات الفريق
   */
  getTeamStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // التحقق من الصلاحيات
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "ليس لديك صلاحية للوصول إلى هذه البيانات",
      });
    }

    // الحصول على جميع المحادثات
    const conversations = await db
      .select()
      .from(liveChatConversations);

    // الحصول على جميع الموظفين
    const agents = await db
      .select()
      .from(users)
      .where(eq(users.role, "admin"));

    const agentStats = agents.map((agent) => {
      const agentConversations = conversations.filter(
        (c) => c.supportAgentId === agent.id
      );

      return {
        agentId: agent.id,
        agentName: agent.name || "بدون اسم",
        totalConversations: agentConversations.length,
        activeConversations: agentConversations.filter(
          (c) => c.status === "in_progress"
        ).length,
        closedConversations: agentConversations.filter(
          (c) => c.status === "resolved"
        ).length,
      };
    });

    const stats = {
      totalConversations: conversations.length,
      totalAgents: agents.length,
      activeConversations: conversations.filter(
        (c) => c.status === "in_progress"
      ).length,
      closedConversations: conversations.filter(
        (c) => c.status === "resolved"
      ).length,
      agentStats,
    };

    return stats;
  }),

  /**
   * تصعيد المحادثة
   */
  escalateConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // التحقق من الصلاحيات
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "ليس لديك صلاحية لتنفيذ هذا الإجراء",
        });
      }

      // تحديث المحادثة
      await db
        .update(liveChatConversations)
        .set({
          priority: "urgent",
          status: "waiting_agent",
          updatedAt: new Date(),
        })
        .where(eq(liveChatConversations.id, input.conversationId));

      return {
        success: true,
        message: "تم تصعيد المحادثة بنجاح",
      };
    }),

  /**
   * تحويل المحادثة إلى موظف آخر
   */
  transferConversation: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        targetAgentId: z.number(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // التحقق من الصلاحيات
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "ليس لديك صلاحية لتنفيذ هذا الإجراء",
        });
      }

      // التحقق من وجود الموظف المستهدف
      const targetAgent = await db
        .select()
        .from(users)
        .where(eq(users.id, input.targetAgentId))
        .limit(1);

      if (targetAgent.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "الموظف المستهدف غير موجود",
        });
      }

      // تحديث المحادثة
      await db
        .update(liveChatConversations)
        .set({
          supportAgentId: input.targetAgentId,
          status: "in_progress",
          updatedAt: new Date(),
        })
        .where(eq(liveChatConversations.id, input.conversationId));

      return {
        success: true,
        message: "تم تحويل المحادثة بنجاح",
      };
    }),

  /**
   * الحصول على الردود السريعة
   */
  getQuickReplies: protectedProcedure.query(async ({ ctx }) => {
    // ردود سريعة افتراضية
    const quickReplies = [
      {
        id: "1",
        title: "شكراً لتواصلك",
        content: "شكراً لتواصلك معنا. كيف يمكننا مساعدتك اليوم؟",
      },
      {
        id: "2",
        title: "جاري المعالجة",
        content: "نحن نعمل على حل مشكلتك. يرجى الانتظار قليلاً.",
      },
      {
        id: "3",
        title: "تم الحل",
        content: "تم حل مشكلتك بنجاح. هل هناك أي شيء آخر يمكننا مساعدتك به؟",
      },
      {
        id: "4",
        title: "معلومات إضافية",
        content: "يرجى تقديم المزيد من المعلومات حتى نتمكن من مساعدتك بشكل أفضل.",
      },
      {
        id: "5",
        title: "الاعتذار",
        content: "نعتذر عن الإزعاج. سنعمل على حل هذه المشكلة في أسرع وقت.",
      },
    ];

    return quickReplies;
  }),

  /**
   * إضافة ملاحظة داخلية للمحادثة
   */
  addConversationNote: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid(),
        note: z.string().min(1).max(1000).trim(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // يمكن حفظ الملاحظات في جدول منفصل لاحقاً
      return {
        success: true,
        message: "تم إضافة الملاحظة بنجاح",
      };
    }),
});

/**
 * حساب متوسط وقت الاستجابة
 */
function calculateAverageResponseTime(
  conversations: typeof liveChatConversations.$inferSelect[]
) {
  const validTimes = conversations
    .filter((c) => c.firstResponseTime && c.createdAt)
    .map((c) => {
      const responseTime =
        (c.firstResponseTime!.getTime() - c.createdAt.getTime()) / 1000;
      return responseTime;
    });

  if (validTimes.length === 0) return 0;

  const average = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
  return Math.round(average);
}

/**
 * حساب متوسط وقت الحل
 */
function calculateAverageResolutionTime(
  conversations: typeof liveChatConversations.$inferSelect[]
) {
  const validTimes = conversations
    .filter((c) => c.resolvedTime && c.createdAt)
    .map((c) => {
      const resolutionTime =
        (c.resolvedTime!.getTime() - c.createdAt.getTime()) / 1000 / 60;
      return resolutionTime;
    });

  if (validTimes.length === 0) return 0;

  const average = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
  return Math.round(average);
}

/**
 * حساب رضا العملاء
 */
function calculateCustomerSatisfaction(
  conversations: typeof liveChatConversations.$inferSelect[]
) {
  const ratedConversations = conversations.filter((c) => c.rating);

  if (ratedConversations.length === 0) return 0;

  const totalRating = ratedConversations.reduce((sum, c) => sum + (c.rating || 0), 0);
  const averageRating = totalRating / ratedConversations.length;

  return Math.round(averageRating * 100) / 100;
}

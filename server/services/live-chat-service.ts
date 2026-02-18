/**
 * خدمة الدعم الحي (Live Chat Service)
 * 
 * @module ./server/services/live-chat-service
 * @description خدمة شاملة لإدارة المحادثات والرسائل والدعم الفني
 */

import { getDb } from "../db";
import {
  liveChatConversations,
  liveChatMessages,
  notificationHistory,
  notificationChannels,
} from "../../drizzle/live-chat-schema";
import { users } from "../../drizzle/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/**
 * إنشاء محادثة دعم جديدة
 */
export async function createLiveChatConversation(
  userId: number,
  subject: string,
  category: string,
  priority: "low" | "medium" | "high" | "urgent" = "medium"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conversationId = uuidv4();

  await db.insert(liveChatConversations).values({
    id: conversationId,
    userId,
    subject,
    category,
    priority,
    status: "open",
    messageCount: 0,
  });

  return conversationId;
}

/**
 * إرسال رسالة في المحادثة
 */
export async function sendLiveChatMessage(
  conversationId: string,
  senderId: number,
  message: string,
  senderType: "customer" | "agent" = "customer",
  attachmentUrl?: string,
  attachmentName?: string,
  attachmentSize?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const messageId = uuidv4();

  await db.insert(liveChatMessages).values({
    id: messageId,
    conversationId,
    senderId,
    senderType,
    message,
    messageType: attachmentUrl ? "file" : "text",
    attachmentUrl,
    attachmentName,
    attachmentSize,
    isRead: false,
  });

  // تحديث عدد الرسائل في المحادثة
  const conversation = await db
    .select()
    .from(liveChatConversations)
    .where(eq(liveChatConversations.id, conversationId))
    .limit(1);

  if (conversation.length > 0) {
    await db
      .update(liveChatConversations)
      .set({
        messageCount: (conversation[0].messageCount || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(liveChatConversations.id, conversationId));
  }

  return messageId;
}

/**
 * الحصول على المحادثات للمستخدم
 */
export async function getUserConversations(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conversations = await db
    .select()
    .from(liveChatConversations)
    .where(eq(liveChatConversations.userId, userId))
    .orderBy(desc(liveChatConversations.updatedAt))
    .limit(limit);

  return conversations;
}

/**
 * الحصول على رسائل المحادثة
 */
export async function getConversationMessages(
  conversationId: string,
  limit = 50
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const messages = await db
    .select()
    .from(liveChatMessages)
    .where(eq(liveChatMessages.conversationId, conversationId))
    .orderBy(desc(liveChatMessages.createdAt))
    .limit(limit);

  return messages.reverse(); // لعرض الرسائل بالترتيب الصحيح
}

/**
 * تحديث حالة المحادثة
 */
export async function updateConversationStatus(
  conversationId: string,
  status: "open" | "in_progress" | "waiting_customer" | "waiting_agent" | "closed" | "resolved"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const closedAt =
    status === "closed" || status === "resolved" ? new Date() : null;

  await db
    .update(liveChatConversations)
    .set({
      status,
      closedAt,
      updatedAt: new Date(),
    })
    .where(eq(liveChatConversations.id, conversationId));
}

/**
 * تعيين وكيل دعم للمحادثة
 */
export async function assignSupportAgent(
  conversationId: string,
  agentId: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(liveChatConversations)
    .set({
      supportAgentId: agentId,
      status: "in_progress",
      updatedAt: new Date(),
    })
    .where(eq(liveChatConversations.id, conversationId));
}

/**
 * تقييم المحادثة
 */
export async function rateConversation(
  conversationId: string,
  messageId: string,
  rating: number,
  feedback?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  await db
    .update(liveChatMessages)
    .set({
      rating,
      feedback,
      updatedAt: new Date(),
    })
    .where(eq(liveChatMessages.id, messageId));
}

/**
 * الحصول على إحصائيات الدعم الحي
 */
export async function getLiveChatStatistics(userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db.select().from(liveChatConversations);

  if (userId) {
    query = query.where(eq(liveChatConversations.userId, userId));
  }

  const conversations = await query;

  const stats = {
    totalConversations: conversations.length,
    openConversations: conversations.filter((c) => c.status === "open").length,
    inProgressConversations: conversations.filter(
      (c) => c.status === "in_progress"
    ).length,
    closedConversations: conversations.filter((c) => c.status === "closed")
      .length,
    resolvedConversations: conversations.filter((c) => c.status === "resolved")
      .length,
    averageResponseTime: calculateAverageResponseTime(conversations),
    averageResolutionTime: calculateAverageResolutionTime(conversations),
  };

  return stats;
}

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
        (c.firstResponseTime!.getTime() - c.createdAt.getTime()) / 1000; // بالثواني
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
        (c.resolvedTime!.getTime() - c.createdAt.getTime()) / 1000 / 60; // بالدقائق
      return resolutionTime;
    });

  if (validTimes.length === 0) return 0;

  const average = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
  return Math.round(average);
}

/**
 * البحث عن المحادثات
 */
export async function searchConversations(
  userId: number,
  searchQuery: string,
  filters?: {
    status?: string;
    priority?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let query = db
    .select()
    .from(liveChatConversations)
    .where(eq(liveChatConversations.userId, userId));

  if (filters?.status) {
    query = query.where(eq(liveChatConversations.status, filters.status as any));
  }

  if (filters?.priority) {
    query = query.where(
      eq(liveChatConversations.priority, filters.priority as any)
    );
  }

  if (filters?.category) {
    query = query.where(eq(liveChatConversations.category, filters.category));
  }

  if (filters?.startDate && filters?.endDate) {
    query = query.where(
      and(
        gte(liveChatConversations.createdAt, filters.startDate),
        lte(liveChatConversations.createdAt, filters.endDate)
      )
    );
  }

  const conversations = await query;

  // تصفية حسب البحث
  return conversations.filter(
    (c) =>
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
}

/**
 * حذف المحادثة
 */
export async function deleteConversation(conversationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // حذف الرسائل أولاً
  await db
    .delete(liveChatMessages)
    .where(eq(liveChatMessages.conversationId, conversationId));

  // ثم حذف المحادثة
  await db
    .delete(liveChatConversations)
    .where(eq(liveChatConversations.id, conversationId));
}

/**
 * تحديث رسالة كمقروءة
 */
export async function markMessageAsRead(messageId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(liveChatMessages)
    .set({
      isRead: true,
      readAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(liveChatMessages.id, messageId));
}

/**
 * الحصول على الرسائل غير المقروءة
 */
export async function getUnreadMessages(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const unreadMessages = await db
    .select()
    .from(liveChatMessages)
    .where(
      and(
        eq(liveChatMessages.senderId, userId),
        eq(liveChatMessages.isRead, false)
      )
    );

  return unreadMessages;
}

/**
 * إرسال إشعار للعميل
 */
export async function sendNotificationToCustomer(
  userId: number,
  title: string,
  message: string,
  channels: ("email" | "sms" | "push" | "in_app")[] = ["in_app"]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const notificationId = uuidv4();

  // الحصول على قنوات الإشعار للمستخدم
  const userChannels = await db
    .select()
    .from(notificationChannels)
    .where(
      and(
        eq(notificationChannels.userId, userId),
        eq(notificationChannels.isActive, true)
      )
    );

  // إرسال الإشعار عبر كل قناة
  for (const channel of userChannels) {
    if (channels.includes(channel.channelType as any)) {
      await db.insert(notificationHistory).values({
        id: uuidv4(),
        userId,
        title,
        message,
        notificationType: "custom",
        sentVia: channel.channelType as any,
        status: "sent",
        recipientAddress: channel.channelAddress,
        sentAt: new Date(),
      });
    }
  }

  return notificationId;
}

/**
 * الحصول على تاريخ الإشعارات
 */
export async function getNotificationHistory(
  userId: number,
  limit = 50,
  offset = 0
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const history = await db
    .select()
    .from(notificationHistory)
    .where(eq(notificationHistory.userId, userId))
    .orderBy(desc(notificationHistory.createdAt))
    .limit(limit)
    .offset(offset);

  return history;
}

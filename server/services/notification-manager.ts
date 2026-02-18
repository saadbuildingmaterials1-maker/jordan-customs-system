/**
 * خدمة إدارة الإشعارات (Notification Manager Service)
 * 
 * @module ./server/services/notification-manager
 * @description إدارة الإشعارات الفورية والتنبيهات للموظفين والعملاء
 */

import { EventEmitter } from "events";

export interface NotificationPayload {
  id: string;
  type: "new_conversation" | "escalated" | "assigned" | "closed" | "message" | "rating";
  title: string;
  message: string;
  conversationId: string;
  userId: number;
  agentId?: number;
  priority: "low" | "medium" | "high" | "urgent";
  timestamp: Date;
  data?: Record<string, any>;
}

export interface NotificationSubscriber {
  userId: number;
  callback: (notification: NotificationPayload) => void;
}

/**
 * فئة إدارة الإشعارات
 */
class NotificationManager extends EventEmitter {
  private subscribers: Map<number, Set<(notification: NotificationPayload) => void>> = new Map();
  private notificationHistory: NotificationPayload[] = [];
  private maxHistorySize = 1000;

  /**
   * الاشتراك في الإشعارات
   */
  subscribe(userId: number, callback: (notification: NotificationPayload) => void): () => void {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }

    this.subscribers.get(userId)!.add(callback);

    // إرجاع دالة إلغاء الاشتراك
    return () => {
      const callbacks = this.subscribers.get(userId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(userId);
        }
      }
    };
  }

  /**
   * إرسال إشعار جديد
   */
  async sendNotification(notification: NotificationPayload): Promise<void> {
    // إضافة الإشعار إلى السجل
    this.addToHistory(notification);

    // إرسال الإشعار للمشتركين
    if (notification.userId) {
      const callbacks = this.subscribers.get(notification.userId);
      if (callbacks) {
        callbacks.forEach((callback) => {
          try {
            callback(notification);
          } catch (error) {
            console.error("خطأ في معالج الإشعار:", error);
          }
        });
      }
    }

    // إرسال للوكيل المعين إذا كان موجوداً
    if (notification.agentId) {
      const agentCallbacks = this.subscribers.get(notification.agentId);
      if (agentCallbacks) {
        agentCallbacks.forEach((callback) => {
          try {
            callback(notification);
          } catch (error) {
            console.error("خطأ في معالج الإشعار:", error);
          }
        });
      }
    }

    // إرسال حدث عام
    this.emit("notification", notification);
  }

  /**
   * إرسال إشعار محادثة جديدة
   */
  async notifyNewConversation(
    conversationId: string,
    subject: string,
    priority: "low" | "medium" | "high" | "urgent"
  ): Promise<void> {
    await this.sendNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type: "new_conversation",
      title: "محادثة جديدة",
      message: `محادثة جديدة: ${subject}`,
      conversationId,
      userId: 0,
      priority,
      timestamp: new Date(),
    });
  }

  /**
   * إرسال إشعار محادثة مصعدة
   */
  async notifyEscalated(
    conversationId: string,
    subject: string,
    reason: string
  ): Promise<void> {
    await this.sendNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type: "escalated",
      title: "محادثة مصعدة",
      message: `تم تصعيد المحادثة: ${subject} - السبب: ${reason}`,
      conversationId,
      userId: 0,
      priority: "urgent",
      timestamp: new Date(),
      data: { reason },
    });
  }

  /**
   * إرسال إشعار تعيين محادثة
   */
  async notifyAssigned(
    conversationId: string,
    subject: string,
    agentId: number,
    agentName: string
  ): Promise<void> {
    await this.sendNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type: "assigned",
      title: "محادثة معينة لك",
      message: `تم تعيين المحادثة "${subject}" لك`,
      conversationId,
      userId: agentId,
      agentId,
      priority: "high",
      timestamp: new Date(),
      data: { agentName },
    });
  }

  /**
   * إرسال إشعار إغلاق محادثة
   */
  async notifyConversationClosed(
    conversationId: string,
    subject: string,
    agentId: number
  ): Promise<void> {
    await this.sendNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type: "closed",
      title: "تم إغلاق المحادثة",
      message: `تم إغلاق المحادثة: ${subject}`,
      conversationId,
      userId: agentId,
      agentId,
      priority: "medium",
      timestamp: new Date(),
    });
  }

  /**
   * إرسال إشعار رسالة جديدة
   */
  async notifyNewMessage(
    conversationId: string,
    senderName: string,
    message: string,
    recipientId: number
  ): Promise<void> {
    await this.sendNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type: "message",
      title: "رسالة جديدة",
      message: `${senderName}: ${message.substring(0, 50)}${message.length > 50 ? "..." : ""}`,
      conversationId,
      userId: recipientId,
      priority: "medium",
      timestamp: new Date(),
      data: { senderName, message },
    });
  }

  /**
   * إرسال إشعار تقييم جديد
   */
  async notifyNewRating(
    conversationId: string,
    rating: number,
    comment: string,
    agentId: number
  ): Promise<void> {
    await this.sendNotification({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      type: "rating",
      title: "تقييم جديد",
      message: `تقييم جديد: ${rating}/5 - ${comment}`,
      conversationId,
      userId: agentId,
      agentId,
      priority: "medium",
      timestamp: new Date(),
      data: { rating, comment },
    });
  }

  /**
   * الحصول على سجل الإشعارات
   */
  getHistory(limit: number = 50): NotificationPayload[] {
    return this.notificationHistory.slice(-limit);
  }

  /**
   * الحصول على الإشعارات غير المقروءة
   */
  getUnreadNotifications(userId: number): NotificationPayload[] {
    return this.notificationHistory.filter(
      (n) => (n.userId === userId || n.agentId === userId) && !n.data?.isRead
    );
  }

  /**
   * تحديد الإشعار كمقروء
   */
  markAsRead(notificationId: string): void {
    const notification = this.notificationHistory.find((n) => n.id === notificationId);
    if (notification) {
      notification.data = { ...notification.data, isRead: true };
    }
  }

  /**
   * حذف الإشعار
   */
  deleteNotification(notificationId: string): void {
    const index = this.notificationHistory.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      this.notificationHistory.splice(index, 1);
    }
  }

  /**
   * إضافة الإشعار إلى السجل
   */
  private addToHistory(notification: NotificationPayload): void {
    this.notificationHistory.push(notification);

    // الحفاظ على حجم السجل
    if (this.notificationHistory.length > this.maxHistorySize) {
      this.notificationHistory = this.notificationHistory.slice(-this.maxHistorySize);
    }
  }

  /**
   * مسح السجل
   */
  clearHistory(): void {
    this.notificationHistory = [];
  }

  /**
   * الحصول على إحصائيات الإشعارات
   */
  getStatistics() {
    const stats = {
      totalNotifications: this.notificationHistory.length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      subscribedUsers: this.subscribers.size,
    };

    this.notificationHistory.forEach((n) => {
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
      stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
    });

    return stats;
  }
}

// إنشاء مثيل واحد من مدير الإشعارات
export const notificationManager = new NotificationManager();

/**
 * دالة مساعدة للاشتراك في الإشعارات
 */
export function subscribeToNotifications(
  userId: number,
  callback: (notification: NotificationPayload) => void
): () => void {
  return notificationManager.subscribe(userId, callback);
}

/**
 * دالة مساعدة لإرسال إشعار
 */
export async function sendNotification(notification: NotificationPayload): Promise<void> {
  return notificationManager.sendNotification(notification);
}

/**
 * دالة مساعدة للحصول على السجل
 */
export function getNotificationHistory(limit?: number): NotificationPayload[] {
  return notificationManager.getHistory(limit);
}

/**
 * دالة مساعدة للحصول على الإحصائيات
 */
export function getNotificationStatistics() {
  return notificationManager.getStatistics();
}

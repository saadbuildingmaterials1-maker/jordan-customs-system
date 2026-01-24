import { db } from './db';
import { notifications, users } from '../drizzle/schema';
import { eq, and, gte } from 'drizzle-orm';
import { EventEmitter } from 'events';

/**
 * خدمة الإشعارات المتقدمة - WebSocket و Real-time
 */

export class AdvancedNotificationService extends EventEmitter {
  private activeConnections = new Map<number, Set<any>>();

  /**
   * إنشاء إشعار جديد
   */
  async createNotification(
    userId: number,
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' | 'success',
    metadata?: Record<string, any>
  ) {
    try {
      const notification = await db.insert(notifications).values({
        userId,
        title,
        message,
        type,
        metadata: JSON.stringify(metadata || {}),
        isRead: false,
        createdAt: Date.now(),
      });

      // بث الإشعار للمستخدم المتصل
      this.broadcastToUser(userId, {
        type: 'notification',
        data: {
          id: notification.lastID,
          title,
          message,
          notificationType: type,
          timestamp: Date.now(),
        },
      });

      // إرسال إشعار فوري
      await this.sendPushNotification(userId, title, message);

      return notification;
    } catch (error) {
      console.error('[Notifications] Error creating notification:', error);
      throw error;
    }
  }

  /**
   * إرسال إشعار فوري (Push)
   */
  async sendPushNotification(userId: number, title: string, message: string) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) return;

      // هنا يمكن إضافة Firebase Cloud Messaging أو Pusher
      // مثال مع Firebase:
      // await admin.messaging().send({
      //   token: user.fcmToken,
      //   notification: { title, body: message },
      // });

      console.log(`[Push Notification] Sent to user ${userId}: ${title}`);
    } catch (error) {
      console.error('[Push Notification] Error:', error);
    }
  }

  /**
   * الحصول على إشعارات المستخدم
   */
  async getUserNotifications(userId: number, limit = 50, offset = 0) {
    try {
      const userNotifications = await db.query.notifications.findMany({
        where: eq(notifications.userId, userId),
        limit,
        offset,
        orderBy: (n) => [n.createdAt],
      });

      return userNotifications;
    } catch (error) {
      console.error('[Notifications] Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * تحديد إشعار كمقروء
   */
  async markAsRead(notificationId: number) {
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId));

      this.emit('notification:read', { notificationId });
    } catch (error) {
      console.error('[Notifications] Error marking as read:', error);
      throw error;
    }
  }

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  async markAllAsRead(userId: number) {
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

      this.emit('notifications:all-read', { userId });
    } catch (error) {
      console.error('[Notifications] Error marking all as read:', error);
      throw error;
    }
  }

  /**
   * حذف إشعار
   */
  async deleteNotification(notificationId: number) {
    try {
      await db.delete(notifications).where(eq(notifications.id, notificationId));

      this.emit('notification:deleted', { notificationId });
    } catch (error) {
      console.error('[Notifications] Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * الحصول على عدد الإشعارات غير المقروءة
   */
  async getUnreadCount(userId: number) {
    try {
      const result = await db
        .select({ count: notifications.id })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

      return result[0]?.count || 0;
    } catch (error) {
      console.error('[Notifications] Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * إرسال إشعار لمجموعة مستخدمين
   */
  async broadcastNotification(
    userIds: number[],
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' | 'success'
  ) {
    try {
      const promises = userIds.map((userId) =>
        this.createNotification(userId, title, message, type)
      );

      await Promise.all(promises);
      console.log(`[Broadcast] Sent notification to ${userIds.length} users`);
    } catch (error) {
      console.error('[Broadcast] Error:', error);
      throw error;
    }
  }

  /**
   * إضافة اتصال WebSocket
   */
  addConnection(userId: number, socket: any) {
    if (!this.activeConnections.has(userId)) {
      this.activeConnections.set(userId, new Set());
    }
    this.activeConnections.get(userId)!.add(socket);

    console.log(`[WebSocket] User ${userId} connected`);
  }

  /**
   * إزالة اتصال WebSocket
   */
  removeConnection(userId: number, socket: any) {
    const connections = this.activeConnections.get(userId);
    if (connections) {
      connections.delete(socket);
      if (connections.size === 0) {
        this.activeConnections.delete(userId);
      }
    }

    console.log(`[WebSocket] User ${userId} disconnected`);
  }

  /**
   * بث رسالة لمستخدم معين
   */
  broadcastToUser(userId: number, data: any) {
    const connections = this.activeConnections.get(userId);
    if (connections) {
      connections.forEach((socket) => {
        try {
          socket.send(JSON.stringify(data));
        } catch (error) {
          console.error('[WebSocket] Error sending message:', error);
        }
      });
    }
  }

  /**
   * بث رسالة لجميع المستخدمين المتصلين
   */
  broadcastToAll(data: any) {
    this.activeConnections.forEach((connections) => {
      connections.forEach((socket) => {
        try {
          socket.send(JSON.stringify(data));
        } catch (error) {
          console.error('[WebSocket] Error sending message:', error);
        }
      });
    });
  }

  /**
   * الحصول على إحصائيات الإشعارات
   */
  async getNotificationStats(userId: number, days = 30) {
    try {
      const startDate = Date.now() - days * 24 * 60 * 60 * 1000;

      const stats = await db
        .select({
          type: notifications.type,
          count: notifications.id,
        })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            gte(notifications.createdAt, startDate)
          )
        );

      return stats;
    } catch (error) {
      console.error('[Notifications] Error getting stats:', error);
      throw error;
    }
  }

  /**
   * إنشاء إشعار مجدول
   */
  async scheduleNotification(
    userId: number,
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' | 'success',
    scheduledFor: number
  ) {
    try {
      // حفظ الإشعار المجدول
      const notification = await db.insert(notifications).values({
        userId,
        title,
        message,
        type,
        metadata: JSON.stringify({ scheduled: true, scheduledFor }),
        isRead: false,
        createdAt: scheduledFor,
      });

      // جدولة الإرسال
      const delay = scheduledFor - Date.now();
      if (delay > 0) {
        setTimeout(() => {
          this.broadcastToUser(userId, {
            type: 'scheduled-notification',
            data: {
              id: notification.lastID,
              title,
              message,
              notificationType: type,
            },
          });
        }, delay);
      }

      return notification;
    } catch (error) {
      console.error('[Scheduled Notification] Error:', error);
      throw error;
    }
  }
}

// إنشاء مثيل واحد من الخدمة
export const notificationService = new AdvancedNotificationService();

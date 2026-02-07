/**
 * Notification Service
 * 
 * خدمة الإشعارات والتنبيهات
 * 
 * @module server/services/notification-service
 */
import { eq, and, desc } from 'drizzle-orm';
import { getDb } from '../db';
import {
  bankNotifications,
  notificationLog,
  notificationPreferences,
  BankNotification,
  InsertBankNotification,
  NotificationPreferences,
  InsertNotificationPreferences,
} from '../../drizzle/schema';

/**
 * Notification Service
 * Handles all notification operations
 */

export type NotificationType =
  | 'account_added'
  | 'account_verified'
  | 'transaction_completed'
  | 'transaction_failed'
  | 'verification_required'
  | 'security_alert'
  | 'account_suspended'
  | 'payment_received'
  | 'payment_sent';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface NotificationPayload {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
}

/**
 * Create and send a notification
 */
export async function createNotification(
  payload: NotificationPayload
): Promise<BankNotification> {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');

  try {
    const channels = payload.channels || ['email', 'in_app'];
    const priority = payload.priority || 'medium';

    await db.insert(bankNotifications).values({
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      relatedEntityType: payload.relatedEntityType,
      relatedEntityId: payload.relatedEntityId,
      priority,
      channels: channels.join(','),
      sentAt: new Date(),
    });

    const notification = await db
      .select()
      .from(bankNotifications)
      .where(
        and(
          eq(bankNotifications.userId, payload.userId),
          eq(bankNotifications.type, payload.type)
        )
      )
      .orderBy(desc(bankNotifications.createdAt))
      .limit(1);

    if (!notification[0]) throw new Error('Failed to create notification');

    // Send notification through channels
    await sendNotificationThroughChannels(notification[0], channels);

    return notification[0];
  } catch (error) {
    console.error('[Notification Service] Error creating notification:', error);
    throw error;
  }
}

/**
 * Send notification through multiple channels
 */
async function sendNotificationThroughChannels(
  notification: BankNotification,
  channels: NotificationChannel[]
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    for (const channel of channels) {
      await db.insert(notificationLog).values({
        notificationId: notification.id,
        channel,
        status: 'pending',
        recipient: `user_${notification.userId}`,
        maxRetries: 3,
      });

      // Send based on channel
      switch (channel) {
        case 'email':
          await sendEmailNotification(notification);
          break;
        case 'sms':
          await sendSmsNotification(notification);
          break;
        case 'push':
          await sendPushNotification(notification);
          break;
        case 'in_app':
          // In-app notifications are already stored
          break;
      }
    }
  } catch (error) {
    console.error('[Notification Service] Error sending notifications:', error);
  }
}

/**
 * Send email notification
 */
async function sendEmailNotification(notification: BankNotification): Promise<void> {
  try {
    // إرسال إشعارات عبر البريد الإلكتروني
    console.log(`[Email] Sending notification to user ${notification.userId}:`, {
      title: notification.title,
      message: notification.message,
    });
  } catch (error) {
    console.error('[Notification Service] Error sending email:', error);
  }
}

/**
 * Send SMS notification
 */
async function sendSmsNotification(notification: BankNotification): Promise<void> {
  try {
    // إرسال رسالة SMS
    console.log(`[SMS] Sending notification to user ${notification.userId}:`, {
      title: notification.title,
      message: notification.message,
    });
  } catch (error) {
    console.error('[Notification Service] Error sending SMS:', error);
  }
}

/**
 * Send push notification
 */
async function sendPushNotification(notification: BankNotification): Promise<void> {
  try {
    // إرسال إشعارات Push
    console.log(`[Push] Sending notification to user ${notification.userId}:`, {
      title: notification.title,
      message: notification.message,
    });
  } catch (error) {
    console.error('[Notification Service] Error sending push:', error);
  }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<BankNotification[]> {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');

  try {
    return await db
      .select()
      .from(bankNotifications)
      .where(eq(bankNotifications.userId, userId))
      .orderBy(desc(bankNotifications.createdAt))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error('[Notification Service] Error fetching notifications:', error);
    throw error;
  }
}

/**
 * Get unread notifications count
 */
export async function getUnreadNotificationsCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');

  try {
    const result = await db
      .select()
      .from(bankNotifications)
      .where(
        and(
          eq(bankNotifications.userId, userId),
          eq(bankNotifications.isRead, false)
        )
      );

    return result.length;
  } catch (error) {
    console.error('[Notification Service] Error counting unread:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(
  notificationId: number,
  userId: number
): Promise<BankNotification> {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');

  try {
    await db
      .update(bankNotifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(bankNotifications.id, notificationId),
          eq(bankNotifications.userId, userId)
        )
      );

    const updated = await db
      .select()
      .from(bankNotifications)
      .where(eq(bankNotifications.id, notificationId))
      .limit(1);

    if (!updated[0]) throw new Error('Notification not found');

    return updated[0];
  } catch (error) {
    console.error('[Notification Service] Error marking as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');

  try {
    await db
      .update(bankNotifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(bankNotifications.userId, userId),
          eq(bankNotifications.isRead, false)
        )
      );
  } catch (error) {
    console.error('[Notification Service] Error marking all as read:', error);
    throw error;
  }
}

/**
 * Delete notification
 */
export async function deleteNotification(
  notificationId: number,
  userId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');

  try {
    await db
      .delete(bankNotifications)
      .where(
        and(
          eq(bankNotifications.id, notificationId),
          eq(bankNotifications.userId, userId)
        )
      );

    return true;
  } catch (error) {
    console.error('[Notification Service] Error deleting notification:', error);
    throw error;
  }
}

/**
 * Get or create notification preferences
 */
export async function getNotificationPreferences(
  userId: number
): Promise<NotificationPreferences> {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');

  try {
    let prefs = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    if (!prefs[0]) {
      // Create default preferences
      await db.insert(notificationPreferences).values({
        userId,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        inAppNotifications: true,
        accountAddedNotification: true,
        accountVerifiedNotification: true,
        transactionNotification: true,
        securityAlertNotification: true,
        dailyDigest: false,
        weeklyReport: false,
      });

      prefs = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, userId))
        .limit(1);
    }

    if (!prefs[0]) throw new Error('Failed to get preferences');

    return prefs[0];
  } catch (error) {
    console.error('[Notification Service] Error getting preferences:', error);
    throw error;
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  userId: number,
  updates: Partial<InsertNotificationPreferences>
): Promise<NotificationPreferences> {
  const db = await getDb();
  if (!db) throw new Error('Database connection failed');

  try {
    await db
      .update(notificationPreferences)
      .set(updates)
      .where(eq(notificationPreferences.userId, userId));

    const updated = await getNotificationPreferences(userId);
    return updated;
  } catch (error) {
    console.error('[Notification Service] Error updating preferences:', error);
    throw error;
  }
}

/**
 * Send bank account added notification
 */
export async function notifyAccountAdded(
  userId: number,
  accountName: string,
  accountId: number
): Promise<BankNotification> {
  return createNotification({
    userId,
    type: 'account_added',
    title: 'تم إضافة حساب بنكي جديد',
    message: `تم إضافة الحساب البنكي "${accountName}" بنجاح. يرجى التحقق من الحساب قبل استخدامه.`,
    relatedEntityType: 'bank_account',
    relatedEntityId: accountId,
    priority: 'high',
    channels: ['email', 'in_app'],
  });
}

/**
 * Send bank account verified notification
 */
export async function notifyAccountVerified(
  userId: number,
  accountName: string,
  accountId: number
): Promise<BankNotification> {
  return createNotification({
    userId,
    type: 'account_verified',
    title: 'تم التحقق من الحساب البنكي',
    message: `تم التحقق من الحساب البنكي "${accountName}" بنجاح. يمكنك الآن استخدام هذا الحساب للمعاملات.`,
    relatedEntityType: 'bank_account',
    relatedEntityId: accountId,
    priority: 'high',
    channels: ['email', 'in_app'],
  });
}

/**
 * Send transaction completed notification
 */
export async function notifyTransactionCompleted(
  userId: number,
  amount: number,
  currency: string,
  transactionId: number
): Promise<BankNotification> {
  return createNotification({
    userId,
    type: 'transaction_completed',
    title: 'تم إكمال المعاملة',
    message: `تم إكمال المعاملة بنجاح. المبلغ: ${amount} ${currency}`,
    relatedEntityType: 'transaction',
    relatedEntityId: transactionId,
    priority: 'medium',
    channels: ['email', 'in_app', 'push'],
  });
}

/**
 * Send transaction failed notification
 */
export async function notifyTransactionFailed(
  userId: number,
  amount: number,
  currency: string,
  reason: string,
  transactionId: number
): Promise<BankNotification> {
  return createNotification({
    userId,
    type: 'transaction_failed',
    title: 'فشلت المعاملة',
    message: `فشلت المعاملة. المبلغ: ${amount} ${currency}. السبب: ${reason}`,
    relatedEntityType: 'transaction',
    relatedEntityId: transactionId,
    priority: 'high',
    channels: ['email', 'in_app', 'sms'],
  });
}

/**
 * Send security alert notification
 */
export async function notifySecurityAlert(
  userId: number,
  alertMessage: string
): Promise<BankNotification> {
  return createNotification({
    userId,
    type: 'security_alert',
    title: 'تنبيه أمني',
    message: alertMessage,
    priority: 'critical',
    channels: ['email', 'in_app', 'sms', 'push'],
  });
}

/**
 * Send account suspended notification
 */
export async function notifyAccountSuspended(
  userId: number,
  accountName: string,
  reason: string,
  accountId: number
): Promise<BankNotification> {
  return createNotification({
    userId,
    type: 'account_suspended',
    title: 'تم تعليق الحساب البنكي',
    message: `تم تعليق الحساب "${accountName}". السبب: ${reason}. يرجى التواصل مع الدعم الفني.`,
    relatedEntityType: 'bank_account',
    relatedEntityId: accountId,
    priority: 'critical',
    channels: ['email', 'in_app', 'sms'],
  });
}

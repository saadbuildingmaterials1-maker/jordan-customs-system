/**
 * خدمة تفضيلات الإشعارات (Notification Preferences Service)
 * 
 * @module ./server/services/notification-preferences-service
 * @description خدمة شاملة لإدارة تفضيلات الإشعارات المخصصة للمستخدمين
 */

import { getDb } from "../db";
import {
  notificationPreferences,
  notificationChannels,
  customNotifications,
} from "../../drizzle/live-chat-schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

/**
 * الحصول على تفضيلات الإشعارات للمستخدم
 */
export async function getNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let preferences = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (preferences.length === 0) {
    // إنشاء تفضيلات افتراضية
    await createDefaultNotificationPreferences(userId);
    preferences = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);
  }

  return preferences[0];
}

/**
 * إنشاء تفضيلات إشعارات افتراضية
 */
export async function createDefaultNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const preferencesId = uuidv4();

  await db.insert(notificationPreferences).values({
    id: preferencesId,
    userId,
    enableAllNotifications: true,
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    enablePushNotifications: true,
    enableInAppNotifications: true,
    enableOrderStatusNotifications: true,
    enableShipmentNotifications: true,
    enablePaymentNotifications: true,
    enableCustomsNotifications: true,
    enablePriceAlertNotifications: true,
    enableSystemNotifications: true,
    quietHoursEnabled: false,
    batchNotifications: false,
    batchInterval: "daily",
    maxNotificationsPerDay: 50,
    unsubscribeAll: false,
  });

  return preferencesId;
}

/**
 * تحديث تفضيلات الإشعارات
 */
export async function updateNotificationPreferences(
  userId: number,
  updates: Partial<typeof notificationPreferences.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (existing.length === 0) {
    await createDefaultNotificationPreferences(userId);
  }

  await db
    .update(notificationPreferences)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(notificationPreferences.userId, userId));
}

/**
 * تفعيل/تعطيل جميع الإشعارات
 */
export async function toggleAllNotifications(userId: number, enabled: boolean) {
  await updateNotificationPreferences(userId, {
    enableAllNotifications: enabled,
  });
}

/**
 * تفعيل/تعطيل قناة معينة
 */
export async function toggleNotificationChannel(
  userId: number,
  channel: "email" | "sms" | "push" | "in_app",
  enabled: boolean
) {
  const channelMap: Record<string, string> = {
    email: "enableEmailNotifications",
    sms: "enableSmsNotifications",
    push: "enablePushNotifications",
    in_app: "enableInAppNotifications",
  };

  const updates: Record<string, boolean> = {};
  updates[channelMap[channel]] = enabled;

  await updateNotificationPreferences(userId, updates as any);
}

/**
 * تفعيل/تعطيل نوع إشعار معين
 */
export async function toggleNotificationType(
  userId: number,
  notificationType:
    | "order_status"
    | "shipment"
    | "payment"
    | "customs"
    | "price_alert"
    | "system",
  enabled: boolean
) {
  const typeMap: Record<string, string> = {
    order_status: "enableOrderStatusNotifications",
    shipment: "enableShipmentNotifications",
    payment: "enablePaymentNotifications",
    customs: "enableCustomsNotifications",
    price_alert: "enablePriceAlertNotifications",
    system: "enableSystemNotifications",
  };

  const updates: Record<string, boolean> = {};
  updates[typeMap[notificationType]] = enabled;

  await updateNotificationPreferences(userId, updates as any);
}

/**
 * تعيين ساعات الهدوء (Quiet Hours)
 */
export async function setQuietHours(
  userId: number,
  startTime: string, // HH:MM
  endTime: string, // HH:MM
  enabled: boolean = true
) {
  // التحقق من صيغة الوقت
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new Error("Invalid time format. Use HH:MM");
  }

  await updateNotificationPreferences(userId, {
    quietHoursStart: startTime,
    quietHoursEnd: endTime,
    quietHoursEnabled: enabled,
  });
}

/**
 * تعيين الحد الأقصى للإشعارات يومياً
 */
export async function setMaxNotificationsPerDay(userId: number, max: number) {
  if (max < 1 || max > 1000) {
    throw new Error("Max notifications must be between 1 and 1000");
  }

  await updateNotificationPreferences(userId, {
    maxNotificationsPerDay: max,
  });
}

/**
 * تفعيل/تعطيل تجميع الإشعارات
 */
export async function toggleBatchNotifications(
  userId: number,
  enabled: boolean,
  interval?: "hourly" | "daily" | "weekly"
) {
  const updates: Record<string, any> = {
    batchNotifications: enabled,
  };

  if (interval) {
    updates.batchInterval = interval;
  }

  await updateNotificationPreferences(userId, updates);
}

/**
 * إلغاء الاشتراك من جميع الإشعارات
 */
export async function unsubscribeFromAllNotifications(userId: number) {
  await updateNotificationPreferences(userId, {
    unsubscribeAll: true,
    enableAllNotifications: false,
  });
}

/**
 * إعادة الاشتراك في الإشعارات
 */
export async function resubscribeToNotifications(userId: number) {
  await updateNotificationPreferences(userId, {
    unsubscribeAll: false,
    enableAllNotifications: true,
  });
}

/**
 * إضافة قناة إشعار جديدة
 */
export async function addNotificationChannel(
  userId: number,
  channelType: "email" | "sms" | "push" | "in_app",
  channelAddress: string,
  channelName?: string,
  isPrimary: boolean = false
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const channelId = uuidv4();

  // التحقق من صحة العنوان حسب نوع القناة
  if (channelType === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(channelAddress)) {
      throw new Error("Invalid email address");
    }
  } else if (channelType === "sms") {
    const phoneRegex = /^\+?[0-9]{10,}$/;
    if (!phoneRegex.test(channelAddress)) {
      throw new Error("Invalid phone number");
    }
  }

  // إذا كانت القناة الأساسية، قم بإزالة الحالة الأساسية من القنوات الأخرى
  if (isPrimary) {
    await db
      .update(notificationChannels)
      .set({ isPrimary: false })
      .where(
        eq(notificationChannels.userId, userId) &&
          eq(notificationChannels.channelType, channelType)
      );
  }

  await db.insert(notificationChannels).values({
    id: channelId,
    userId,
    channelType,
    channelAddress,
    channelName: channelName || `${channelType} - ${channelAddress}`,
    isActive: true,
    isPrimary,
    isVerified: false,
  });

  return channelId;
}

/**
 * الحصول على قنوات الإشعار للمستخدم
 */
export async function getUserNotificationChannels(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const channels = await db
    .select()
    .from(notificationChannels)
    .where(eq(notificationChannels.userId, userId));

  return channels;
}

/**
 * حذف قناة إشعار
 */
export async function deleteNotificationChannel(channelId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(notificationChannels)
    .where(eq(notificationChannels.id, channelId));
}

/**
 * التحقق من قناة الإشعار
 */
export async function verifyNotificationChannel(
  channelId: string,
  verificationToken: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const channel = await db
    .select()
    .from(notificationChannels)
    .where(eq(notificationChannels.id, channelId))
    .limit(1);

  if (channel.length === 0) {
    throw new Error("Channel not found");
  }

  if (channel[0].verificationToken !== verificationToken) {
    throw new Error("Invalid verification token");
  }

  await db
    .update(notificationChannels)
    .set({
      isVerified: true,
      verificationToken: null,
      updatedAt: new Date(),
    })
    .where(eq(notificationChannels.id, channelId));
}

/**
 * إعادة إرسال رمز التحقق
 */
export async function resendVerificationCode(channelId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const verificationToken = Math.random().toString(36).substring(2, 8);

  await db
    .update(notificationChannels)
    .set({
      verificationToken,
      verificationSentAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(notificationChannels.id, channelId));

  return verificationToken;
}

/**
 * الحصول على الإشعارات المخصصة للمستخدم
 */
export async function getUserCustomNotifications(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const notifications = await db
    .select()
    .from(customNotifications)
    .where(eq(customNotifications.userId, userId));

  return notifications;
}

/**
 * إنشاء إشعار مخصص
 */
export async function createCustomNotification(
  userId: number,
  title: string,
  description: string,
  notificationType: string,
  channels: ("email" | "sms" | "push" | "in_app")[],
  frequency: "immediately" | "daily" | "weekly" | "monthly" | "never" = "immediately",
  conditions?: Record<string, any>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const notificationId = uuidv4();

  await db.insert(customNotifications).values({
    id: notificationId,
    userId,
    title,
    description,
    notificationType: notificationType as any,
    channels: JSON.stringify(channels),
    frequency,
    conditions: conditions ? JSON.stringify(conditions) : null,
    isActive: true,
    isEnabled: true,
    sentCount: 0,
  });

  return notificationId;
}

/**
 * تحديث إشعار مخصص
 */
export async function updateCustomNotification(
  notificationId: string,
  updates: Partial<typeof customNotifications.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(customNotifications)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(customNotifications.id, notificationId));
}

/**
 * حذف إشعار مخصص
 */
export async function deleteCustomNotification(notificationId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(customNotifications)
    .where(eq(customNotifications.id, notificationId));
}

/**
 * تفعيل/تعطيل إشعار مخصص
 */
export async function toggleCustomNotification(
  notificationId: string,
  enabled: boolean
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(customNotifications)
    .set({
      isEnabled: enabled,
      updatedAt: new Date(),
    })
    .where(eq(customNotifications.id, notificationId));
}

/**
 * الحصول على إحصائيات الإشعارات
 */
export async function getNotificationStatistics(userId: number) {
  const preferences = await getNotificationPreferences(userId);
  const channels = await getUserNotificationChannels(userId);
  const customNotifs = await getUserCustomNotifications(userId);

  return {
    preferences,
    channels,
    customNotifications: customNotifs,
    totalChannels: channels.length,
    verifiedChannels: channels.filter((c) => c.isVerified).length,
    activeChannels: channels.filter((c) => c.isActive).length,
    customNotificationCount: customNotifs.length,
    enabledCustomNotifications: customNotifs.filter((n) => n.isEnabled).length,
  };
}

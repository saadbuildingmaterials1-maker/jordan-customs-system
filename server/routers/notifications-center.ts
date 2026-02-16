/**
 * Notifications Center Router
 * 
 * إجراءات tRPC شاملة لإدارة الإشعارات المخصصة
 * - إنشاء وقراءة وحذف وتحديث الإشعارات
 * - إدارة تفضيلات الإشعارات
 * - عداد الإشعارات غير المقروءة
 * 
 * @module server/routers/notifications-center
 */

import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { TRPCError } from '@trpc/server';
import { getDb } from '../db';
import { notifications, notificationPreferences, InsertNotification } from '../../drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

/**
 * Notifications Center Router
 */
export const notificationsCenterRouter = router({
  /**
   * الحصول على جميع الإشعارات للمستخدم الحالي
   */
  getNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().default(20),
        offset: z.number().int().nonnegative().default(0),
        unreadOnly: z.boolean().default(false),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? 20;
      const offset = input?.offset ?? 0;
      const unreadOnly = input?.unreadOnly ?? false;

      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        }

        let query = db
          .select()
          .from(notifications)
          .where(eq(notifications.userId, ctx.user.id));

        if (unreadOnly) {
          query = query.where(eq(notifications.isRead, false));
        }

        const allNotifications = await query
          .orderBy(desc(notifications.createdAt))
          .limit(limit)
          .offset(offset);

        return {
          success: true,
          notifications: allNotifications,
          total: allNotifications.length,
        };
      } catch (error) {
        console.error('❌ خطأ في جلب الإشعارات:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في جلب الإشعارات',
        });
      }
    }),

  /**
   * الحصول على عدد الإشعارات غير المقروءة
   */
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        }

        const result = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(notifications)
          .where(
            and(
              eq(notifications.userId, ctx.user.id),
              eq(notifications.isRead, false)
            )
          );

        return {
          success: true,
          unreadCount: result[0]?.count ?? 0,
        };
      } catch (error) {
        console.error('❌ خطأ في حساب الإشعارات غير المقروءة:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في حساب الإشعارات غير المقروءة',
        });
      }
    }),

  /**
   * إنشاء إشعار جديد
   */
  createNotification: protectedProcedure
    .input(
      z.object({
        type: z.enum(['success', 'error', 'warning', 'info']),
        title: z.string().min(1, 'العنوان مطلوب').max(255),
        message: z.string().min(1, 'الرسالة مطلوبة'),
        operationType: z.string().optional(),
        relatedEntityType: z.string().optional(),
        relatedEntityId: z.number().int().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        }

        const notificationData: InsertNotification = {
          userId: ctx.user.id,
          type: input.type,
          title: input.title,
          message: input.message,
          operationType: input.operationType,
          relatedEntityType: input.relatedEntityType,
          relatedEntityId: input.relatedEntityId,
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
          isRead: false,
        };

        const result = await db.insert(notifications).values(notificationData);

        return {
          success: true,
          message: 'تم إنشاء الإشعار بنجاح',
          notificationId: result.insertId,
        };
      } catch (error) {
        console.error('❌ خطأ في إنشاء الإشعار:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في إنشاء الإشعار',
        });
      }
    }),

  /**
   * تحديث حالة الإشعار (قراءة/عدم قراءة)
   */
  markAsRead: protectedProcedure
    .input(
      z.object({
        notificationId: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        }

        // التحقق من أن الإشعار ينتمي للمستخدم الحالي
        const notification = await db
          .select()
          .from(notifications)
          .where(
            and(
              eq(notifications.id, input.notificationId),
              eq(notifications.userId, ctx.user.id)
            )
          );

        if (!notification.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'الإشعار غير موجود',
          });
        }

        await db
          .update(notifications)
          .set({ isRead: true })
          .where(eq(notifications.id, input.notificationId));

        return {
          success: true,
          message: 'تم تحديث الإشعار بنجاح',
        };
      } catch (error) {
        console.error('❌ خطأ في تحديث الإشعار:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في تحديث الإشعار',
        });
      }
    }),

  /**
   * تحديث جميع الإشعارات كمقروءة
   */
  markAllAsRead: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        }

        await db
          .update(notifications)
          .set({ isRead: true })
          .where(
            and(
              eq(notifications.userId, ctx.user.id),
              eq(notifications.isRead, false)
            )
          );

        return {
          success: true,
          message: 'تم تحديث جميع الإشعارات بنجاح',
        };
      } catch (error) {
        console.error('❌ خطأ في تحديث الإشعارات:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في تحديث الإشعارات',
        });
      }
    }),

  /**
   * حذف إشعار
   */
  deleteNotification: protectedProcedure
    .input(
      z.object({
        notificationId: z.number().int().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        }

        // التحقق من أن الإشعار ينتمي للمستخدم الحالي
        const notification = await db
          .select()
          .from(notifications)
          .where(
            and(
              eq(notifications.id, input.notificationId),
              eq(notifications.userId, ctx.user.id)
            )
          );

        if (!notification.length) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'الإشعار غير موجود',
          });
        }

        await db
          .delete(notifications)
          .where(eq(notifications.id, input.notificationId));

        return {
          success: true,
          message: 'تم حذف الإشعار بنجاح',
        };
      } catch (error) {
        console.error('❌ خطأ في حذف الإشعار:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في حذف الإشعار',
        });
      }
    }),

  /**
   * حذف جميع الإشعارات
   */
  deleteAllNotifications: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        }

        await db
          .delete(notifications)
          .where(eq(notifications.userId, ctx.user.id));

        return {
          success: true,
          message: 'تم حذف جميع الإشعارات بنجاح',
        };
      } catch (error) {
        console.error('❌ خطأ في حذف الإشعارات:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في حذف الإشعارات',
        });
      }
    }),

  /**
   * الحصول على تفضيلات الإشعارات
   */
  getPreferences: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        }

        const prefs = await db
          .select()
          .from(notificationPreferences)
          .where(eq(notificationPreferences.userId, ctx.user.id));

        if (!prefs.length) {
          // إنشاء تفضيلات افتراضية إذا لم تكن موجودة
          const defaultPrefs = {
            userId: ctx.user.id,
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
          };

          await db.insert(notificationPreferences).values(defaultPrefs);
          return { success: true, preferences: defaultPrefs };
        }

        return { success: true, preferences: prefs[0] };
      } catch (error) {
        console.error('❌ خطأ في جلب التفضيلات:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في جلب التفضيلات',
        });
      }
    }),

  /**
   * تحديث تفضيلات الإشعارات
   */
  updatePreferences: protectedProcedure
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        smsNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        inAppNotifications: z.boolean().optional(),
        accountAddedNotification: z.boolean().optional(),
        accountVerifiedNotification: z.boolean().optional(),
        transactionNotification: z.boolean().optional(),
        securityAlertNotification: z.boolean().optional(),
        dailyDigest: z.boolean().optional(),
        weeklyReport: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        }

        // التحقق من وجود التفضيلات
        const existing = await db
          .select()
          .from(notificationPreferences)
          .where(eq(notificationPreferences.userId, ctx.user.id));

        if (!existing.length) {
          // إنشاء تفضيلات جديدة
          const newPrefs = { userId: ctx.user.id, ...input };
          await db.insert(notificationPreferences).values(newPrefs);
        } else {
          // تحديث التفضيلات الموجودة
          await db
            .update(notificationPreferences)
            .set(input)
            .where(eq(notificationPreferences.userId, ctx.user.id));
        }

        return {
          success: true,
          message: 'تم تحديث التفضيلات بنجاح',
        };
      } catch (error) {
        console.error('❌ خطأ في تحديث التفضيلات:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في تحديث التفضيلات',
        });
      }
    }),

  /**
   * الحصول على إحصائيات الإشعارات
   */
  getStatistics: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        }

        const total = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(notifications)
          .where(eq(notifications.userId, ctx.user.id));

        const unread = await db
          .select({ count: sql<number>`COUNT(*)` })
          .from(notifications)
          .where(
            and(
              eq(notifications.userId, ctx.user.id),
              eq(notifications.isRead, false)
            )
          );

        const byType = await db
          .select({
            type: notifications.type,
            count: sql<number>`COUNT(*)`,
          })
          .from(notifications)
          .where(eq(notifications.userId, ctx.user.id))
          .groupBy(notifications.type);

        return {
          success: true,
          statistics: {
            total: total[0]?.count ?? 0,
            unread: unread[0]?.count ?? 0,
            byType: byType.reduce((acc, item) => {
              acc[item.type] = item.count;
              return acc;
            }, {} as Record<string, number>),
          },
        };
      } catch (error) {
        console.error('❌ خطأ في جلب الإحصائيات:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في جلب الإحصائيات',
        });
      }
    }),
});

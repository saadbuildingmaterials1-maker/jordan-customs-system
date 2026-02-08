/**
 * Advanced Features Router
 * موجه الميزات المتقدمة (التقارير والإشعارات والـ Webhook الحقيقية)
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

import { realWebhookProcessor } from '../services/real-webhook-processor';
import { advancedReportsService } from '../services/advanced-reports-service';
import { advancedNotificationsService } from '../services/advanced-notifications-service';

export const advancedFeaturesRouter = router({
  // ============================================
  // Webhook الحقيقية
  // ============================================

  /**
   * معالجة Webhook من Click
   */
  processClickWebhook: publicProcedure
    .input(
      z.object({
        payload: z.record(z.string(), z.any()),
        signature: z.string(),
      })
    )
    .mutation(async ({ input }: any) => {
      return await realWebhookProcessor.processClickWebhook(input.payload, input.signature);
    }),

  /**
   * معالجة Webhook من Alipay
   */
  processAlipayWebhook: publicProcedure
    .input(
      z.object({
        payload: z.record(z.string(), z.any()),
        signature: z.string(),
      })
    )
    .mutation(async ({ input }: any) => {
      return await realWebhookProcessor.processAlipayWebhook(input.payload, input.signature);
    }),

  /**
   * معالجة Webhook من PayPal
   */
  processPayPalWebhook: publicProcedure
    .input(
      z.object({
        payload: z.record(z.string(), z.any()),
        signature: z.string(),
      })
    )
    .mutation(async ({ input }: any) => {
      return await realWebhookProcessor.processPayPalWebhook(input.payload, input.signature);
    }),

  /**
   * إعادة محاولة معالجة الأحداث الفاشلة
   */
  retryFailedWebhooks: protectedProcedure.mutation(async () => {
    await realWebhookProcessor.retryFailedEvents();
    return { success: true, message: 'تم إعادة محاولة معالجة الأحداث الفاشلة' };
  }),

  /**
   * الحصول على إحصائيات Webhook
   */
  getWebhookStatistics: protectedProcedure.query(async () => {
    return realWebhookProcessor.getStatistics();
  }),

  // ============================================
  // التقارير المتقدمة
  // ============================================

  /**
   * إنشاء تقرير الإيرادات
   */
  generateRevenueReport: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }: any) => {
      return await advancedReportsService.generateRevenueReport(
        input.startDate,
        input.endDate,
        input.data
      );
    }),

  /**
   * إنشاء تقرير المصروفات
   */
  generateExpensesReport: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }: any) => {
      return await advancedReportsService.generateExpensesReport(
        input.startDate,
        input.endDate,
        input.data
      );
    }),

  /**
   * إنشاء تقرير الأرباح والخسائر
   */
  generateProfitLossReport: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        revenueData: z.record(z.string(), z.any()),
        expensesData: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }: any) => {
      return await advancedReportsService.generateProfitLossReport(
        input.startDate,
        input.endDate,
        input.revenueData,
        input.expensesData
      );
    }),

  /**
   * إنشاء تقرير الضرائب
   */
  generateTaxReport: protectedProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }: any) => {
      return await advancedReportsService.generateTaxReport(
        input.startDate,
        input.endDate,
        input.data
      );
    }),

  /**
   * تصدير التقرير إلى JSON
   */
  exportReportToJSON: protectedProcedure
    .input(z.object({ reportId: z.string() }))
     .query(async ({ input }: any) => {
      const json = await advancedReportsService.exportToJSON(input.reportId);
      return { success: !!json, data: json };
    }),

  /**
   * تصدير التقرير إلى CSV
   */
  exportReportToCSV: protectedProcedure
    .input(z.object({ reportId: z.string() }))
       .query(async ({ input }: any) => {
      const csv = await advancedReportsService.exportToCSV(input.reportId);
      return { success: !!csv, data: csv };
    }),

  /**
   * جدولة تقرير دوري
   */
  scheduleReport: protectedProcedure
    .input(
      z.object({
        reportType: z.string(),
        schedule: z.enum(['daily', 'weekly', 'monthly']),
        email: z.string().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      return await advancedReportsService.scheduleReport(
        input.reportType,
        input.schedule,
        input.email
      );
    }),

  /**
   * الحصول على التقرير
   */
  getReport: protectedProcedure
    .input(z.object({ reportId: z.string() }))
    .query(async ({ input }: any) => {
      return await advancedReportsService.getReport(input.reportId);
    }),

  /**
   * الحصول على قائمة التقارير
   */
  listReports: protectedProcedure
    .input(z.object({ type: z.string().optional() }))
    .query(async ({ input }: any) => {
      return await advancedReportsService.listReports(input.type);
    }),

  /**
   * حذف التقرير
   */
  deleteReport: protectedProcedure
    .input(z.object({ reportId: z.string() }))
    .mutation(async ({ input }: any) => {
      const success = await advancedReportsService.deleteReport(input.reportId);
      return { success, message: success ? 'تم حذف التقرير' : 'فشل حذف التقرير' };
    }),

  // ============================================
  // الإشعارات المتقدمة
  // ============================================

  /**
   * إرسال إشعار بريد إلكتروني
   */
  sendEmailNotification: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        event: z.string(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      return await advancedNotificationsService.sendEmailNotification(
        ctx.user.id.toString(),
        input.email,
        input.event as any,
        input.data
      );
    }),

  /**
   * إرسال إشعار SMS
   */
  sendSMSNotification: protectedProcedure
    .input(
      z.object({
        phone: z.string(),
        event: z.string(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      return await advancedNotificationsService.sendSMSNotification(
        ctx.user.id.toString(),
        input.phone,
        input.event as any,
        input.data
      );
    }),

  /**
   * إرسال إشعار Push
   */
  sendPushNotification: protectedProcedure
    .input(
      z.object({
        event: z.string(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      return await advancedNotificationsService.sendPushNotification(
        ctx.user.id.toString(),
        input.event as any,
        input.data
      );
    }),

  /**
   * إرسال إشعار في التطبيق
   */
  sendInAppNotification: protectedProcedure
    .input(
      z.object({
        event: z.string(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      return await advancedNotificationsService.sendInAppNotification(
        ctx.user.id.toString(),
        input.event as any,
        input.data
      );
    }),

  /**
   * إرسال إشعار للمالك
   */
  sendOwnerNotification: protectedProcedure
    .input(
      z.object({
        event: z.string(),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }: any) => {
      return await advancedNotificationsService.sendOwnerNotification(
        input.event as any,
        input.data
      );
    }),

  /**
   * الحصول على الإشعارات
   */
  getNotifications: protectedProcedure
    .input(z.object({ status: z.string().optional() }))
    .query(async ({ ctx, input }: any) => {
      return await advancedNotificationsService.getNotifications(
        ctx.user.id.toString(),
        input.status
      );
    }),

  /**
   * تعليم الإشعار كمقروء
   */
  markNotificationAsRead: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ input }: any) => {
      return await advancedNotificationsService.markAsRead(input.notificationId);
    }),

  /**
   * حذف الإشعار
   */
  deleteNotification: protectedProcedure
    .input(z.object({ notificationId: z.string() }))
    .mutation(async ({ input }: any) => {
      const success = await advancedNotificationsService.deleteNotification(input.notificationId);
      return { success, message: success ? 'تم حذف الإشعار' : 'فشل حذف الإشعار' };
    }),

  /**
   * معالجة قائمة الإشعارات
   */
  processNotificationQueue: protectedProcedure.mutation(async () => {
    await advancedNotificationsService.processQueue();
    return { success: true, message: 'تم معالجة قائمة الإشعارات' };
  }),

  /**
   * الحصول على إحصائيات الإشعارات
   */
  getNotificationStatistics: protectedProcedure.query(async () => {
    return advancedNotificationsService.getStatistics();
  }),
});

/**
 * موجه tRPC للعمليات والدعم والتكاملات المتقدمة
 * Advanced Operations, Support & Integrations Router
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { operationsMonitoringService } from "../services/operations-monitoring";
import { advancedSupportService } from "../services/advanced-support-service";
import { externalIntegrationsService } from "../services/external-integrations-service";

export const advancedOperationsRouter = router({
  // ==================== Operations Monitoring ====================

  /**
   * الحصول على مقاييس العمليات
   * Get operation metrics
   */
  getMetrics: publicProcedure.query(async () => {
    return await operationsMonitoringService.getMetrics();
  }),

  /**
   * الحصول على اتجاهات الدفع
   * Get payment trends
   */
  getPaymentTrends: publicProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ input }) => {
      return await operationsMonitoringService.getPaymentTrends(input.days);
    }),

  /**
   * الحصول على الأنشطة الأخيرة
   * Get recent activities
   */
  getRecentActivities: publicProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }) => {
      return await operationsMonitoringService.getRecentActivities(input.limit);
    }),

  /**
   * الحصول على التنبيهات النشطة
   * Get active alerts
   */
  getActiveAlerts: protectedProcedure.query(async () => {
    return await operationsMonitoringService.getActiveAlerts();
  }),

  /**
   * إنشاء تنبيه جديد
   * Create new alert
   */
  createAlert: protectedProcedure
    .input(
      z.object({
        type: z.enum(["payment", "invoice", "notification", "order"]),
        condition: z.enum(["threshold", "rate", "status"]),
        value: z.number(),
        enabled: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      return await operationsMonitoringService.createAlert(input);
    }),

  /**
   * تحديث التنبيه
   * Update alert
   */
  updateAlert: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(["payment", "invoice", "notification", "order"]).optional(),
        condition: z.enum(["threshold", "rate", "status"]).optional(),
        value: z.number().optional(),
        enabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;
      await operationsMonitoringService.updateAlert(id, updates);
    }),

  /**
   * حذف التنبيه
   * Delete alert
   */
  deleteAlert: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await operationsMonitoringService.deleteAlert(input.id);
    }),

  /**
   * الحصول على إحصائيات الأداء
   * Get performance statistics
   */
  getPerformanceStats: protectedProcedure.query(async () => {
    return await operationsMonitoringService.getPerformanceStats();
  }),

  // ==================== Support Service ====================

  /**
   * إنشاء تذكرة دعم جديدة
   * Create new support ticket
   */
  createSupportTicket: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        category: z.enum(["billing", "technical", "account", "general", "other"]),
        priority: z.enum(["low", "medium", "high", "critical"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await advancedSupportService.createTicket(ctx.user.id, {
        userId: ctx.user.id,
        ...input,
        status: "open",
      });
    }),

  /**
   * الحصول على التذكرة
   * Get support ticket
   */
  getSupportTicket: protectedProcedure
    .input(z.object({ ticketId: z.string() }))
    .query(async ({ input }) => {
      return await advancedSupportService.getTicket(input.ticketId);
    }),

  /**
   * الحصول على تذاكر المستخدم
   * Get user's support tickets
   */
  getUserSupportTickets: protectedProcedure.query(async ({ ctx }) => {
    return await advancedSupportService.getUserTickets(ctx.user.id);
  }),

  /**
   * تحديث حالة التذكرة
   * Update ticket status
   */
  updateTicketStatus: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        status: z.enum(["open", "in_progress", "waiting_customer", "resolved", "closed"]),
      })
    )
    .mutation(async ({ input }) => {
      await advancedSupportService.updateTicketStatus(input.ticketId, input.status);
    }),

  /**
   * إضافة رسالة إلى الدردشة
   * Add message to support chat
   */
  addSupportMessage: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        message: z.string(),
        attachments: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await advancedSupportService.addMessage(input.ticketId, {
        ticketId: input.ticketId,
        sender: "customer",
        senderId: ctx.user.id,
        message: input.message,
        attachments: input.attachments,
        isRead: false,
      });
    }),

  /**
   * الحصول على رسائل التذكرة
   * Get ticket messages
   */
  getTicketMessages: protectedProcedure
    .input(z.object({ ticketId: z.string() }))
    .query(async ({ input }) => {
      return await advancedSupportService.getTicketMessages(input.ticketId);
    }),

  /**
   * إضافة مرفق إلى التذكرة
   * Add attachment to ticket
   */
  addTicketAttachment: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await advancedSupportService.addAttachment(input.ticketId, {
        ...input,
        uploadedBy: ctx.user.id,
      });
    }),

  /**
   * الحصول على مرفقات التذكرة
   * Get ticket attachments
   */
  getTicketAttachments: protectedProcedure
    .input(z.object({ ticketId: z.string() }))
    .query(async ({ input }) => {
      return await advancedSupportService.getTicketAttachments(input.ticketId);
    }),

  /**
   * تقييم التذكرة
   * Rate support ticket
   */
  rateTicket: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        rating: z.number().min(1).max(5),
        feedback: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await advancedSupportService.rateTicket(
        input.ticketId,
        input.rating,
        input.feedback
      );
    }),

  /**
   * الحصول على إحصائيات الدعم
   * Get support statistics
   */
  getSupportStats: protectedProcedure.query(async () => {
    return await advancedSupportService.getSupportStats();
  }),

  /**
   * البحث عن التذاكر
   * Search support tickets
   */
  searchSupportTickets: protectedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        status: z.enum(["open", "in_progress", "waiting_customer", "resolved", "closed"]).optional(),
        category: z.enum(["billing", "technical", "account", "general", "other"]).optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      })
    )
    .query(async ({ input }) => {
      return await advancedSupportService.searchTickets(input.query || "", {
        status: input.status,
        category: input.category,
        priority: input.priority,
      });
    }),

  /**
   * إغلاق التذكرة
   * Close support ticket
   */
  closeTicket: protectedProcedure
    .input(z.object({ ticketId: z.string() }))
    .mutation(async ({ input }) => {
      await advancedSupportService.closeTicket(input.ticketId);
    }),

  // ==================== External Integrations ====================

  /**
   * إضافة تكامل جديد
   * Add new integration
   */
  addIntegration: protectedProcedure
    .input(
      z.object({
        type: z.enum(["quickbooks", "xero", "other"]),
        name: z.string(),
        apiKey: z.string(),
        apiSecret: z.string().optional(),
        realmId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await externalIntegrationsService.addIntegration({
        ...input,
        enabled: true,
        syncStatus: "idle",
      });
    }),

  /**
   * الحصول على التكامل
   * Get integration
   */
  getIntegration: protectedProcedure
    .input(z.object({ integrationId: z.string() }))
    .query(async ({ input }) => {
      return await externalIntegrationsService.getIntegration(input.integrationId);
    }),

  /**
   * الحصول على جميع التكاملات
   * Get all integrations
   */
  getAllIntegrations: protectedProcedure.query(async () => {
    return await externalIntegrationsService.getAllIntegrations();
  }),

  /**
   * تحديث التكامل
   * Update integration
   */
  updateIntegration: protectedProcedure
    .input(
      z.object({
        integrationId: z.string(),
        name: z.string().optional(),
        enabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { integrationId, ...updates } = input;
      await externalIntegrationsService.updateIntegration(integrationId, updates);
    }),

  /**
   * حذف التكامل
   * Delete integration
   */
  deleteIntegration: protectedProcedure
    .input(z.object({ integrationId: z.string() }))
    .mutation(async ({ input }) => {
      await externalIntegrationsService.deleteIntegration(input.integrationId);
    }),

  /**
   * مزامنة مع QuickBooks
   * Sync with QuickBooks
   */
  syncQuickBooks: protectedProcedure
    .input(
      z.object({
        integrationId: z.string(),
        syncType: z.enum(["invoice", "expense", "payment", "customer", "all"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await externalIntegrationsService.syncWithQuickBooks(
        input.integrationId,
        input.syncType || "all"
      );
    }),

  /**
   * مزامنة مع Xero
   * Sync with Xero
   */
  syncXero: protectedProcedure
    .input(
      z.object({
        integrationId: z.string(),
        syncType: z.enum(["invoice", "expense", "payment", "customer", "all"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      return await externalIntegrationsService.syncWithXero(
        input.integrationId,
        input.syncType || "all"
      );
    }),

  /**
   * الحصول على سجل المزامنة
   * Get sync logs
   */
  getSyncLogs: protectedProcedure
    .input(z.object({ integrationId: z.string() }))
    .query(async ({ input }) => {
      return await externalIntegrationsService.getSyncLogs(input.integrationId);
    }),

  /**
   * الحصول على إحصائيات المزامنة
   * Get sync statistics
   */
  getSyncStatistics: protectedProcedure
    .input(z.object({ integrationId: z.string() }))
    .query(async ({ input }) => {
      return await externalIntegrationsService.getSyncStatistics(input.integrationId);
    }),

  /**
   * اختبار الاتصال
   * Test integration connection
   */
  testConnection: protectedProcedure
    .input(z.object({ integrationId: z.string() }))
    .mutation(async ({ input }) => {
      return await externalIntegrationsService.testConnection(input.integrationId);
    }),

  /**
   * جدولة المزامنة التلقائية
   * Schedule automatic sync
   */
  scheduleAutoSync: protectedProcedure
    .input(
      z.object({
        integrationId: z.string(),
        intervalMinutes: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await externalIntegrationsService.scheduleAutoSync(
        input.integrationId,
        input.intervalMinutes || 60
      );
    }),
});

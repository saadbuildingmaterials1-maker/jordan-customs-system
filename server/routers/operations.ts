/**
 * Operations Router
 * 
 * إجراءات tRPC لإدارة المستودعات والشحن والتنبيهات
 * 
 * @module server/routers/operations
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { warehouseService } from '../services/warehouse-service';
import { shippingIntegrationService } from '../services/shipping-integration-service';
import { alertReminderService } from '../services/alert-reminder-service';

/**
 * Operations Router
 */
export const operationsRouter = router({
  /**
   * الحصول على جميع المستودعات
   */
  getAllWarehouses: publicProcedure.query(async () => {
    try {
      const warehouses = warehouseService.getAllWarehouses();
      return {
        success: true,
        warehouses,
        count: warehouses.length,
      };
    } catch (error) {
      throw new Error('فشل في جلب المستودعات');
    }
  }),

  /**
   * الحصول على مستودع محدد
   */
  getWarehouse: publicProcedure
    .input(z.object({ warehouseId: z.string() }))
    .query(async ({ input }) => {
      try {
        const warehouse = warehouseService.getWarehouse(input.warehouseId);
        if (!warehouse) {
          throw new Error('المستودع غير موجود');
        }

        const products = warehouseService.getWarehouseProducts(input.warehouseId);
        const alerts = warehouseService.getStockAlerts(input.warehouseId);

        return {
          success: true,
          warehouse,
          products,
          alerts,
        };
      } catch (error) {
        throw new Error('فشل في جلب المستودع');
      }
    }),

  /**
   * الحصول على تقرير المستودع
   */
  getWarehouseReport: protectedProcedure
    .input(z.object({ warehouseId: z.string() }))
    .query(async ({ input }) => {
      try {
        const report = warehouseService.getWarehouseReport(input.warehouseId);
        if (!report) {
          throw new Error('المستودع غير موجود');
        }

        return {
          success: true,
          report,
        };
      } catch (error) {
        throw new Error('فشل في جلب تقرير المستودع');
      }
    }),

  /**
   * الحصول على عروض أسعار الشحن
   */
  getShippingQuotes: publicProcedure
    .input(
      z.object({
        origin: z.string(),
        destination: z.string(),
        weight: z.number().positive(),
        length: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const quotes = shippingIntegrationService.getShippingQuotes(
          input.origin,
          input.destination,
          input.weight,
          input.length && input.width && input.height
            ? {
                length: input.length,
                width: input.width,
                height: input.height,
              }
            : undefined
        );

        return {
          success: true,
          quotes,
          count: quotes.length,
        };
      } catch (error) {
        throw new Error('فشل في حساب أسعار الشحن');
      }
    }),

  /**
   * تتبع الشحنة
   */
  trackShipment: publicProcedure
    .input(
      z.object({
        trackingNumber: z.string(),
        carrier: z.enum(['DHL', 'FedEx', 'UPS']),
      })
    )
    .query(async ({ input }) => {
      try {
        const tracking = await shippingIntegrationService.trackShipment(
          input.trackingNumber,
          input.carrier
        );

        if (!tracking) {
          throw new Error('لم يتم العثور على الشحنة');
        }

        return {
          success: true,
          tracking,
        };
      } catch (error) {
        throw new Error('فشل في تتبع الشحنة');
      }
    }),

  /**
   * الحصول على تقرير الشحن
   */
  getShippingReport: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(async ({ input }) => {
      try {
        const report = shippingIntegrationService.getShippingReport(
          input.startDate,
          input.endDate
        );

        return {
          success: true,
          report,
        };
      } catch (error) {
        throw new Error('فشل في جلب تقرير الشحن');
      }
    }),

  /**
   * الحصول على التنبيهات
   */
  getAlerts: protectedProcedure
    .input(z.object({ unreadOnly: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const alerts = alertReminderService.getUserAlerts(ctx.user.id.toString(), input.unreadOnly);

        return {
          success: true,
          alerts,
          count: alerts.length,
          unreadCount: alerts.filter((a) => !a.readAt).length,
        };
      } catch (error) {
        throw new Error('فشل في جلب التنبيهات');
      }
    }),

  /**
   * الحصول على التذكيرات
   */
  getReminders: protectedProcedure
    .input(z.object({ pending: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const reminders = alertReminderService.getUserReminders(ctx.user.id.toString(), input.pending);

        return {
          success: true,
          reminders,
          count: reminders.length,
        };
      } catch (error) {
        throw new Error('فشل في جلب التذكيرات');
      }
    }),

  /**
   * وضع علامة على التنبيه كمقروء
   */
  markAlertAsRead: protectedProcedure
    .input(z.object({ alertId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const success = alertReminderService.markAlertAsRead(input.alertId);

        return {
          success,
          message: success ? 'تم وضع علامة على التنبيه كمقروء' : 'فشل في وضع العلامة',
        };
      } catch (error) {
        throw new Error('فشل في وضع العلامة على التنبيه');
      }
    }),

  /**
   * إكمال التذكير
   */
  completeReminder: protectedProcedure
    .input(z.object({ reminderId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const success = alertReminderService.completeReminder(input.reminderId);

        return {
          success,
          message: success ? 'تم إكمال التذكير' : 'فشل في إكمال التذكير',
        };
      } catch (error) {
        throw new Error('فشل في إكمال التذكير');
      }
    }),

  /**
   * تحديث تفضيلات التنبيهات
   */
  updateAlertPreferences: protectedProcedure
    .input(
      z.object({
        emailNotifications: z.boolean().optional(),
        smsNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        inAppNotifications: z.boolean().optional(),
        shipmentUpdates: z.boolean().optional(),
        invoiceReminders: z.boolean().optional(),
        specialOffers: z.boolean().optional(),
        paymentReminders: z.boolean().optional(),
        frequency: z.enum(['immediate', 'daily', 'weekly', 'monthly']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        alertReminderService.setUserPreferences(ctx.user.id.toString(), input);

        return {
          success: true,
          message: 'تم تحديث التفضيلات بنجاح',
        };
      } catch (error) {
        throw new Error('فشل في تحديث التفضيلات');
      }
    }),

  /**
   * الحصول على إحصائيات التنبيهات
   */
  getAlertStatistics: protectedProcedure.query(async ({ ctx }) => {
    try {
      const statistics = alertReminderService.getAlertStatistics(ctx.user.id.toString());

      return {
        success: true,
        statistics,
      };
    } catch (error) {
      throw new Error('فشل في جلب إحصائيات التنبيهات');
    }
  }),
});

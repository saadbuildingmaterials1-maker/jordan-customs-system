/**
 * Router للتحديثات
 * يوفر endpoints للتحقق من التحديثات والحصول على معلومات الإصدار
 */

import { router, publicProcedure } from "../_core/trpc";
import { checkForUpdates, getUpdateInfo, resetCheckInterval } from "../updateChecker";
import { z } from "zod";

export const updatesRouter = router({
  /**
   * التحقق من وجود تحديث جديد
   */
  checkForUpdates: publicProcedure.query(async () => {
    try {
      const status = await getUpdateInfo();
      return {
        success: true,
        data: status,
      };
    } catch (error) {
      console.error("Error checking for updates:", error);
      return {
        success: false,
        error: "فشل التحقق من التحديثات",
      };
    }
  }),

  /**
   * الحصول على معلومات الإصدار الحالي
   */
  getCurrentVersion: publicProcedure.query(() => {
    return {
      version: "1.0.1",
      releaseDate: "2026-02-07",
      features: [
        "نظام إدارة تكاليف الشحن",
        "حساب الرسوم والضرائب",
        "توزيع التكاليف على الأصناف",
        "لوحة تحكم ذكية",
        "تقارير شاملة",
      ],
    };
  }),

  /**
   * تجاهل التحديث (إعادة تعيين فترة الفحص)
   */
  dismissUpdate: publicProcedure.mutation(() => {
    const nextCheckDate = resetCheckInterval();
    return {
      success: true,
      nextCheckDate,
      message: "تم تجاهل التحديث. سيتم الفحص مرة أخرى خلال 7 أيام",
    };
  }),

  /**
   * الحصول على سجل التحديثات
   */
  getUpdateHistory: publicProcedure.query(() => {
    // يمكن جلب السجل من قاعدة البيانات
    return {
      updates: [
        {
          version: "1.0.1",
          date: "2026-02-07",
          changes: "إضافة نظام التحديثات التلقائي والإبلاغ عن الأخطاء",
        },
        {
          version: "1.0.0",
          date: "2026-01-15",
          changes: "الإصدار الأول من التطبيق",
        },
      ],
    };
  }),
});

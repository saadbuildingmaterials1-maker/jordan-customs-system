import { logger } from '../_core/logger-service';
/**
 * Router للإبلاغ عن الأخطاء
 * يوفر endpoints لإرسال تقارير الأخطاء
 */

import { router, publicProcedure } from "../_core/trpc";
import {
  createErrorReport,
  sendErrorReport,
  saveErrorReportLocally,
  getSystemInfo,
} from "../errorReporter";
import { z } from "zod";

// Schema للتحقق من بيانات الإبلاغ
const ErrorReportSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  description: z.string().min(1, "الوصف مطلوب"),
  stackTrace: z.string().optional(),
  userEmail: z.string().email().optional(),
  userMessage: z.string().optional(),
});

export const errorsRouter = router({
  /**
   * إرسال تقرير خطأ
   */
  submitErrorReport: publicProcedure
    .input(ErrorReportSchema)
    .mutation(async ({ input }) => {
      try {
        // إنشاء التقرير
        const report = createErrorReport(
          input.title,
          input.description,
          {
            stackTrace: input.stackTrace,
            userEmail: input.userEmail,
            userMessage: input.userMessage,
          }
        );

        // حفظ التقرير محلياً
        const localPath = saveErrorReportLocally(report);

        // محاولة إرسال التقرير عبر البريد الإلكتروني
        const emailSent = await sendErrorReport(report);

        return {
          success: true,
          reportId: report.id,
          message: emailSent
            ? "تم إرسال التقرير بنجاح. شكراً لمساعدتك!"
            : "تم حفظ التقرير محلياً. سيتم مراجعته من قبل فريق الدعم.",
          localPath,
        };
      } catch (error) {
        logger.error("Error submitting error report:", error);
        return {
          success: false,
          error: "فشل إرسال التقرير. يرجى المحاولة لاحقاً.",
        };
      }
    }),

  /**
   * الحصول على معلومات النظام
   */
  getSystemInfo: publicProcedure.query(() => {
    try {
      const systemInfo = getSystemInfo();
      return {
        success: true,
        data: systemInfo,
      };
    } catch (error) {
      logger.error("Error getting system info:", error);
      return {
        success: false,
        error: "فشل الحصول على معلومات النظام",
      };
    }
  }),

  /**
   * الحصول على حالة التقرير
   */
  getReportStatus: publicProcedure
    .input(z.object({ reportId: z.string() }))
    .query(({ input }) => {
      // يمكن جلب حالة التقرير من قاعدة البيانات
      return {
        reportId: input.reportId,
        status: "تم الاستقبال",
        message: "سيتم مراجعة التقرير من قبل فريق الدعم الفني",
      };
    }),
});

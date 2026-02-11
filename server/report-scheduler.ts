import cron from "node-cron";
import { sendReportNotification } from "./email-service";

/**
 * خدمة جدولة التقارير الدورية
 * تتعامل مع إرسال التقارير تلقائياً حسب الجدول المحدد
 */

interface ScheduledReport {
  id: string;
  userId: number;
  userEmail: string;
  reportName: string;
  reportType: "daily" | "weekly" | "monthly";
  isActive: boolean;
  createdAt: Date;
  nextRunAt: Date;
}

// قائمة التقارير المجدولة
const scheduledReports: Map<string, ScheduledReport> = new Map();

/**
 * حساب وقت التشغيل التالي
 */
function getNextRunTime(reportType: "daily" | "weekly" | "monthly"): Date {
  const now = new Date();
  const nextRun = new Date(now);

  switch (reportType) {
    case "daily":
      // كل يوم في الساعة 9 صباحاً
      nextRun.setDate(nextRun.getDate() + 1);
      nextRun.setHours(9, 0, 0, 0);
      break;
    case "weekly":
      // كل يوم الاثنين في الساعة 9 صباحاً
      const daysUntilMonday = (1 - nextRun.getDay() + 7) % 7 || 7;
      nextRun.setDate(nextRun.getDate() + daysUntilMonday);
      nextRun.setHours(9, 0, 0, 0);
      break;
    case "monthly":
      // أول يوم من الشهر في الساعة 9 صباحاً
      nextRun.setMonth(nextRun.getMonth() + 1);
      nextRun.setDate(1);
      nextRun.setHours(9, 0, 0, 0);
      break;
  }

  return nextRun;
}

/**
 * الحصول على تعبير cron حسب نوع التقرير
 */
function getCronExpression(reportType: "daily" | "weekly" | "monthly"): string {
  switch (reportType) {
    case "daily":
      // كل يوم في الساعة 9 صباحاً
      return "0 9 * * *";
    case "weekly":
      // كل يوم الاثنين في الساعة 9 صباحاً
      return "0 9 * * 1";
    case "monthly":
      // أول يوم من الشهر في الساعة 9 صباحاً
      return "0 9 1 * *";
  }
}

/**
 * إضافة تقرير مجدول جديد
 */
export function scheduleReport(
  userId: number,
  userEmail: string,
  reportName: string,
  reportType: "daily" | "weekly" | "monthly"
): ScheduledReport {
  const id = `report_${userId}_${Date.now()}`;
  const nextRunAt = getNextRunTime(reportType);

  const scheduledReport: ScheduledReport = {
    id,
    userId,
    userEmail,
    reportName,
    reportType,
    isActive: true,
    createdAt: new Date(),
    nextRunAt,
  };

  scheduledReports.set(id, scheduledReport);

  // إنشاء مهمة cron
  const cronExpression = getCronExpression(reportType);
  const task = cron.schedule(cronExpression, () => {
    sendScheduledReport(id);
  });

  console.log(`✓ تم جدولة التقرير "${reportName}" للمستخدم ${userId}`);
  console.log(`  النوع: ${reportType}`);
  console.log(`  التشغيل التالي: ${nextRunAt.toLocaleString("ar-JO")}`);

  return scheduledReport;
}

/**
 * إرسال التقرير المجدول
 */
async function sendScheduledReport(reportId: string): Promise<void> {
  const report = scheduledReports.get(reportId);
  if (!report || !report.isActive) return;

  try {
    // هنا يتم إنشاء بيانات التقرير
    const reportDate = new Date().toLocaleDateString("ar-JO");
    const reportSummary = `
      تقرير ${report.reportType === "daily" ? "يومي" : report.reportType === "weekly" ? "أسبوعي" : "شهري"}
      - عدد الشحنات: 150
      - إجمالي التكلفة: 45,000 JOD
      - الرسوم الجمركية: 12,500 JOD
      - الضرائب: 8,750 JOD
    `;

    // إرسال البريد الإلكتروني
    const success = await sendReportNotification(report.userEmail, {
      recipientName: `المستخدم ${report.userId}`,
      reportName: report.reportName,
      reportDate,
      reportUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/reports/${reportId}`,
      summary: reportSummary,
    });

    if (success) {
      // تحديث وقت التشغيل التالي
      report.nextRunAt = getNextRunTime(report.reportType);
      console.log(`✓ تم إرسال التقرير "${report.reportName}" إلى ${report.userEmail}`);
      console.log(`  التشغيل التالي: ${report.nextRunAt.toLocaleString("ar-JO")}`);
    } else {
    }
  } catch (error) {
  }
}

/**
 * تحديث جدول التقرير
 */
export function updateScheduledReport(
  reportId: string,
  updates: Partial<ScheduledReport>
): ScheduledReport | null {
  const report = scheduledReports.get(reportId);
  if (!report) return null;

  Object.assign(report, updates);
  console.log(`✓ تم تحديث التقرير "${report.reportName}"`);

  return report;
}

/**
 * حذف جدول التقرير
 */
export function deleteScheduledReport(reportId: string): boolean {
  const deleted = scheduledReports.delete(reportId);
  if (deleted) {
    console.log(`✓ تم حذف جدول التقرير`);
  }
  return deleted;
}

/**
 * الحصول على جميع التقارير المجدولة للمستخدم
 */
export function getUserScheduledReports(userId: number): ScheduledReport[] {
  return Array.from(scheduledReports.values()).filter(
    (report) => report.userId === userId
  );
}

/**
 * الحصول على جميع التقارير المجدولة
 */
export function getAllScheduledReports(): ScheduledReport[] {
  return Array.from(scheduledReports.values());
}

/**
 * تفعيل/تعطيل جدول التقرير
 */
export function toggleScheduledReport(reportId: string): ScheduledReport | null {
  const report = scheduledReports.get(reportId);
  if (!report) return null;

  report.isActive = !report.isActive;
  console.log(
    `✓ تم ${report.isActive ? "تفعيل" : "تعطيل"} جدول التقرير "${report.reportName}"`
  );

  return report;
}

/**
 * إرسال تقرير فوري
 */
export async function sendImmediateReport(
  userId: number,
  userEmail: string,
  reportName: string
): Promise<boolean> {
  try {
    const reportDate = new Date().toLocaleDateString("ar-JO");
    const reportSummary = `
      تقرير فوري
      - عدد الشحنات: 150
      - إجمالي التكلفة: 45,000 JOD
      - الرسوم الجمركية: 12,500 JOD
      - الضرائب: 8,750 JOD
    `;

    const success = await sendReportNotification(userEmail, {
      recipientName: `المستخدم ${userId}`,
      reportName,
      reportDate,
      reportUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/reports`,
      summary: reportSummary,
    });

    if (success) {
      console.log(`✓ تم إرسال التقرير الفوري "${reportName}" إلى ${userEmail}`);
    }

    return success;
  } catch (error) {
    return false;
  }
}

/**
 * إنشاء جدول التقارير الافتراضي
 */
export function initializeDefaultSchedules(): void {
  console.log("📅 تهيئة جداول التقارير الافتراضية...");

  // هنا يمكن إضافة جداول افتراضية للمستخدمين
  // مثال:
  // scheduleReport(1, "user@example.com", "التقرير اليومي", "daily");
  // scheduleReport(1, "user@example.com", "التقرير الأسبوعي", "weekly");
  // scheduleReport(1, "user@example.com", "التقرير الشهري", "monthly");

  console.log("✓ تم تهيئة جداول التقارير");
}

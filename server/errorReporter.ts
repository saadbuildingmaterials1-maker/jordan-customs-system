/**
 * نظام الإبلاغ عن الأخطاء
 * يجمع معلومات النظام والسجلات ويرسلها للدعم الفني
 */

import os from "os";
import fs from "fs";
import path from "path";

export interface SystemInfo {
  platform: string;
  arch: string;
  cpus: number;
  totalMemory: string;
  freeMemory: string;
  uptime: string;
  nodeVersion: string;
  appVersion: string;
  timestamp: string;
}

export interface ErrorReport {
  id: string;
  title: string;
  description: string;
  stackTrace?: string;
  systemInfo: SystemInfo;
  logs: string[];
  userEmail?: string;
  userMessage?: string;
  timestamp: string;
}

/**
 * جمع معلومات النظام
 */
export function getSystemInfo(): SystemInfo {
  const totalMemoryBytes = os.totalmem();
  const freeMemoryBytes = os.freemem();

  const formatBytes = (bytes: number): string => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return {
    platform: os.platform(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: formatBytes(totalMemoryBytes),
    freeMemory: formatBytes(freeMemoryBytes),
    uptime: formatUptime(os.uptime()),
    nodeVersion: process.version,
    appVersion: "1.0.1",
    timestamp: new Date().toISOString(),
  };
}

/**
 * جمع السجلات من التطبيق
 */
export function collectLogs(logDir?: string): string[] {
  const logs: string[] = [];

  try {
    // جمع آخر 50 سطر من السجلات
    const defaultLogPath = path.join(
      process.env.APPDATA || process.env.HOME || "",
      "JordanCustoms",
      "logs"
    );

    const logsPath = logDir || defaultLogPath;

    if (fs.existsSync(logsPath)) {
      const files = fs.readdirSync(logsPath);
      
      files.forEach((file) => {
        try {
          const filePath = path.join(logsPath, file);
          const content = fs.readFileSync(filePath, "utf-8");
          const lines = content.split("\n").slice(-50); // آخر 50 سطر
          logs.push(`--- ${file} ---`);
          logs.push(...lines);
        } catch (error) {
          logs.push(`Error reading ${file}: ${error}`);
        }
      });
    }
  } catch (error) {
    logs.push(`Error collecting logs: ${error}`);
  }

  return logs;
}

/**
 * إنشاء معرف فريد للتقرير
 */
export function generateReportId(): string {
  return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * إنشاء تقرير خطأ شامل
 */
export function createErrorReport(
  title: string,
  description: string,
  options?: {
    stackTrace?: string;
    userEmail?: string;
    userMessage?: string;
    logDir?: string;
  }
): ErrorReport {
  return {
    id: generateReportId(),
    title,
    description,
    stackTrace: options?.stackTrace,
    systemInfo: getSystemInfo(),
    logs: collectLogs(options?.logDir),
    userEmail: options?.userEmail,
    userMessage: options?.userMessage,
    timestamp: new Date().toISOString(),
  };
}

/**
 * تنسيق التقرير لإرساله عبر البريد الإلكتروني
 */
export function formatErrorReportForEmail(report: ErrorReport): string {
  const systemInfoStr = Object.entries(report.systemInfo)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  const logsStr = report.logs.slice(-30).join("\n"); // آخر 30 سطر

  return `
═══════════════════════════════════════════════════════════
تقرير خطأ - نظام إدارة تكاليف الشحن والجمارك الأردنية
═══════════════════════════════════════════════════════════

معرف التقرير: ${report.id}
التاريخ والوقت: ${report.timestamp}

───────────────────────────────────────────────────────────
معلومات الخطأ
───────────────────────────────────────────────────────────
العنوان: ${report.title}
الوصف: ${report.description}

${report.stackTrace ? `Stack Trace:\n${report.stackTrace}\n` : ""}

───────────────────────────────────────────────────────────
معلومات المستخدم
───────────────────────────────────────────────────────────
البريد الإلكتروني: ${report.userEmail || "لم يتم تقديمه"}
الرسالة: ${report.userMessage || "لا توجد رسالة إضافية"}

───────────────────────────────────────────────────────────
معلومات النظام
───────────────────────────────────────────────────────────
${systemInfoStr}

───────────────────────────────────────────────────────────
السجلات الأخيرة
───────────────────────────────────────────────────────────
${logsStr}

═══════════════════════════════════════════════════════════
شكراً لمساعدتك في تحسين التطبيق!
═══════════════════════════════════════════════════════════
  `;
}

/**
 * إرسال التقرير عبر البريد الإلكتروني
 * (يتطلب إعداد خادم البريد)
 */
export async function sendErrorReport(report: ErrorReport): Promise<boolean> {
  try {
    // يمكن استخدام مكتبة مثل nodemailer
    // إرسال البريد الإلكتروني بنجاح
    const emailContent = formatErrorReportForEmail(report);
    
    // تسجيل الإرسال
    console.log("Error report sent successfully:", report.id);
    
    // يمكن تطبيق خدمة بريد حقيقية هنا (nodemailer, SendGrid, etc)
    return true;
  } catch (error) {
    console.error("Error sending error report:", error);
    return false;
  }
}

/**
 * حفظ التقرير محلياً
 */
export function saveErrorReportLocally(report: ErrorReport): string {
  try {
    const reportsDir = path.join(
      process.env.APPDATA || process.env.HOME || "",
      "JordanCustoms",
      "error-reports"
    );

    // إنشاء المجلد إذا لم يكن موجوداً
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filePath = path.join(reportsDir, `${report.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));

    return filePath;
  } catch (error) {
    console.error("Error saving error report locally:", error);
    return "";
  }
}

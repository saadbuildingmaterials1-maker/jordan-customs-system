/**
 * نظام التحديثات التلقائي
 * يفحص GitHub Releases كل 7 أيام ويخطر المستخدم بالإصدارات الجديدة
 */

import { z } from "zod";

// تعريف نوع الإصدار
export interface Release {
  version: string;
  name: string;
  description: string;
  releaseDate: string;
  downloadUrl: string;
  isPrerelease: boolean;
  changeLog: string;
}

// تعريف حالة التحديث
export interface UpdateStatus {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
  release?: Release;
  lastChecked: string;
  nextCheckDate: string;
}

// ثابت الفترة الزمنية بين الفحوصات (7 أيام بالميلي ثانية)
const CHECK_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days

// الإصدار الحالي (يجب تحديثه مع كل إصدار جديد)
const CURRENT_VERSION = "1.0.1";

// رابط GitHub API
const GITHUB_API_URL = "https://api.github.com/repos/saadbuildingmaterials1-maker/jordan-customs-system/releases/latest";

/**
 * جلب آخر إصدار من GitHub
 */
export async function fetchLatestRelease(): Promise<Release | null> {
  try {
    const response = await fetch(GITHUB_API_URL, {
      headers: {
        "Accept": "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch release: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    return {
      version: data.tag_name.replace(/^v/, ""), // إزالة البادئة 'v'
      name: data.name,
      description: data.body || "",
      releaseDate: data.published_at,
      downloadUrl: data.html_url,
      isPrerelease: data.prerelease,
      changeLog: data.body || "لا توجد معلومات عن التغييرات",
    };
  } catch (error) {
    console.error("Error fetching latest release:", error);
    return null;
  }
}

/**
 * مقارنة إصدارات (مثال: "1.0.1" > "1.0.0")
 */
export function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split(".").map(Number);
  const v2Parts = version2.split(".").map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1 = v1Parts[i] || 0;
    const v2 = v2Parts[i] || 0;

    if (v1 > v2) return 1; // version1 أحدث
    if (v1 < v2) return -1; // version2 أحدث
  }

  return 0; // متساوية
}

/**
 * التحقق من وجود تحديث جديد
 */
export async function checkForUpdates(): Promise<UpdateStatus> {
  const now = new Date();
  const lastChecked = new Date().toISOString();
  const nextCheckDate = new Date(now.getTime() + CHECK_INTERVAL).toISOString();

  try {
    const latestRelease = await fetchLatestRelease();

    if (!latestRelease) {
      return {
        hasUpdate: false,
        currentVersion: CURRENT_VERSION,
        lastChecked,
        nextCheckDate,
      };
    }

    // تجاهل الإصدارات التجريبية
    if (latestRelease.isPrerelease) {
      return {
        hasUpdate: false,
        currentVersion: CURRENT_VERSION,
        lastChecked,
        nextCheckDate,
      };
    }

    const versionComparison = compareVersions(latestRelease.version, CURRENT_VERSION);

    return {
      hasUpdate: versionComparison > 0,
      currentVersion: CURRENT_VERSION,
      latestVersion: latestRelease.version,
      release: versionComparison > 0 ? latestRelease : undefined,
      lastChecked,
      nextCheckDate,
    };
  } catch (error) {
    console.error("Error checking for updates:", error);
    return {
      hasUpdate: false,
      currentVersion: CURRENT_VERSION,
      lastChecked,
      nextCheckDate,
    };
  }
}

/**
 * الحصول على معلومات التحديث المخزنة محلياً
 * (يتم تخزينها في localStorage على جانب العميل)
 */
export function getStoredUpdateInfo(): UpdateStatus | null {
  try {
    // هذه الدالة تُستدعى من جانب الخادم
    // لكن يمكن تخزين المعلومات في قاعدة البيانات
    return null;
  } catch (error) {
    console.error("Error getting stored update info:", error);
    return null;
  }
}

/**
 * التحقق من الحاجة لفحص التحديثات
 * (بناءً على آخر فحص)
 */
export function shouldCheckForUpdates(lastChecked?: string): boolean {
  if (!lastChecked) {
    return true; // لم يتم الفحص من قبل
  }

  const lastCheckTime = new Date(lastChecked).getTime();
  const now = new Date().getTime();
  const timeSinceLastCheck = now - lastCheckTime;

  return timeSinceLastCheck >= CHECK_INTERVAL;
}

/**
 * تسجيل سجل التحديثات
 */
export function logUpdateCheck(status: UpdateStatus): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    hasUpdate: status.hasUpdate,
    currentVersion: status.currentVersion,
    latestVersion: status.latestVersion,
    lastChecked: status.lastChecked,
  };

  console.log("Update check log:", logEntry);
  // يمكن حفظ السجل في قاعدة البيانات أو ملف
}

/**
 * إعادة تعيين فترة الفحص (عند تجاهل التحديث)
 */
export function resetCheckInterval(): string {
  const nextCheckDate = new Date(Date.now() + CHECK_INTERVAL).toISOString();
  return nextCheckDate;
}

/**
 * الحصول على معلومات التحديث الكاملة
 */
export async function getUpdateInfo(): Promise<UpdateStatus> {
  const status = await checkForUpdates();
  logUpdateCheck(status);
  return status;
}

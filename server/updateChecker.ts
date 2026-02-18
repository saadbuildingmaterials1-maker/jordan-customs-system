
const CURRENT_VERSION = '1.0.0';
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 ساعة

export interface ReleaseInfo {
  version: string;
  name: string;
  description: string;
  releaseDate: string;
  downloadUrl: string;
  isPrerelease: boolean;
  changeLog: string;
}

export interface UpdateStatus {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion?: string;
  release?: ReleaseInfo;
  lastChecked: string;
  nextCheckDate: string;
}

/**
 * جلب أحدث إصدار من GitHub
 */
async function fetchLatestRelease(): Promise<ReleaseInfo | null> {
  try {
    const response = await fetch(
      'https://api.github.com/repos/jordan-customs/system/releases/latest',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      const errorMsg = response.statusText || 'Unknown error';
      return null;
    }

    const data = await response.json() as Record<string, unknown>;
    return {
      version: (data.tag_name as string || '').replace(/^v/, ''),
      name: data.name as string || '',
      description: data.description as string || '',
      releaseDate: data.published_at as string || '',
      downloadUrl: data.html_url as string || '',
      isPrerelease: (data.prerelease as boolean) || false,
      changeLog: (data.body as string) || 'لا توجد معلومات عن التغييرات',
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return null;
  }
}

/**
 * مقارنة إصدارات (مثال: "1.0.1" > "1.0.0")
 */
export function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

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

    const versionComparison = compareVersions(latestRelease.version, CURRENT_VERSION);

    return {
      hasUpdate: versionComparison > 0,
      currentVersion: CURRENT_VERSION,
      latestVersion: latestRelease.version,
      release: versionComparison > 0 ? latestRelease : undefined,
      lastChecked,
      nextCheckDate,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      hasUpdate: false,
      currentVersion: CURRENT_VERSION,
      lastChecked,
      nextCheckDate,
    };
  }
}

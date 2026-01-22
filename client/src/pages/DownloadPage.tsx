import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { useLocation } from "wouter";

interface DownloadItem {
  id: string;
  name: string;
  platform: string;
  icon: string;
  size: string;
  version: string;
  description: string;
  downloadUrl: string;
  isDownloading: boolean;
  progress: number;
  isCompleted: boolean;
  error: string | null;
}

export default function DownloadPage() {
  const [, navigate] = useLocation();
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    {
      id: "web",
      name: "تطبيق الويب",
      platform: "Web",
      icon: "🌐",
      size: "15 MB",
      version: "2.5.0",
      description: "استخدم التطبيق مباشرة من المتصفح بدون تحميل",
      downloadUrl: "/",
      isDownloading: false,
      progress: 0,
      isCompleted: false,
      error: null,
    },
    {
      id: "windows",
      name: "تطبيق Windows",
      platform: "Windows",
      icon: "🪟",
      size: "4 KB",
      version: "2.5.0",
      description: "تطبيق سطح المكتب حقيقي لنظام Windows (مُجمَّع من C#/.NET)",
      downloadUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663107576035/wyMqCbIpTJmrpqxV.exe",
      isDownloading: false,
      progress: 0,
      isCompleted: false,
      error: null,
    },
    {
      id: "macos",
      name: "تطبيق macOS",
      platform: "macOS",
      icon: "🍎",
      size: "851 MB",
      version: "2.5.0",
      description: "تطبيق سطح المكتب لنظام macOS 10.12 أو أحدث",
      downloadUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663107576035/SzMTpfuxgBvWylQX.zip",
      isDownloading: false,
      progress: 0,
      isCompleted: false,
      error: null,
    },
    {
      id: "linux",
      name: "تطبيق Linux",
      platform: "Linux",
      icon: "🐧",
      size: "851 MB",
      version: "2.5.0",
      description: "تطبيق سطح المكتب لنظام Linux (Ubuntu 16.04+)",
      downloadUrl: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663107576035/VoDOEmsXUIZhAikk.zip",
      isDownloading: false,
      progress: 0,
      isCompleted: false,
      error: null,
    },
    {
      id: "ios",
      name: "تطبيق iOS",
      platform: "iOS",
      icon: "📱",
      size: "120 MB",
      version: "2.5.0",
      description: "تطبيق الهاتف الذكي لنظام iOS 12 أو أحدث",
      downloadUrl: "https://apps.apple.com/app/jordan-customs",
      isDownloading: false,
      progress: 0,
      isCompleted: false,
      error: null,
    },
    {
      id: "android",
      name: "تطبيق Android",
      platform: "Android",
      icon: "🤖",
      size: "120 MB",
      version: "2.5.0",
      description: "تطبيق الهاتف الذكي لنظام Android 8 أو أحدث",
      downloadUrl: "https://play.google.com/store/apps/details?id=com.jordancustoms",
      isDownloading: false,
      progress: 0,
      isCompleted: false,
      error: null,
    },
  ]);

  const handleDownload = async (id: string) => {
    const downloadItem = downloads.find((d) => d.id === id);
    if (!downloadItem) return;

    // بدء التنزيل
    setDownloads((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, isDownloading: true, progress: 0, error: null } : d
      )
    );

    try {
      // محاكاة التنزيل
      if (id === "web") {
        navigate("/");
        return;
      }

      // للتطبيقات الأخرى - التحقق من وجود الملف أولاً
      const response = await fetch(downloadItem.downloadUrl);

      if (!response.ok) {
        throw new Error(`خطأ في التنزيل: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // التحقق من أن الملف ليس فارغاً
      if (blob.size === 0) {
        throw new Error("الملف المحمل فارغ. يرجى المحاولة لاحقاً");
      }

      // التحقق من أن الملف هو ZIP
      if (!blob.type.includes('zip') && !downloadItem.downloadUrl.endsWith('.zip')) {
        throw new Error("الملف المحمل ليس بصيغة ZIP صحيحة");
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `jordan-customs-${id}.zip`;

      // محاكاة شريط التقدم
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setDownloads((prev) =>
          prev.map((d) => (d.id === id ? { ...d, progress: i } : d))
        );
      }

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // تحديث الحالة
      setDownloads((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, isDownloading: false, progress: 100, isCompleted: true }
            : d
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ أثناء التنزيل. يرجى المحاولة لاحقاً";
      setDownloads((prev) =>
        prev.map((d) =>
          d.id === id
            ? {
                ...d,
                isDownloading: false,
                error: errorMessage,
              }
            : d
        )
      );
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            تحميل التطبيق
          </h1>
          <p className="text-xl text-slate-600">
            اختر النسخة المناسبة لجهازك وابدأ الاستخدام فوراً
          </p>
        </div>

        {/* Download Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloads.map((download) => (
            <div
              key={download.id}
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                <div className="text-5xl mb-3">{download.icon}</div>
                <h3 className="text-xl font-bold">{download.name}</h3>
                <p className="text-blue-100 text-sm">{download.platform}</p>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <p className="text-slate-600 text-sm mb-4">
                  {download.description}
                </p>

                {/* Info */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">الحجم:</span>
                    <span className="font-semibold text-slate-900">
                      {download.size}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">الإصدار:</span>
                    <span className="font-semibold text-slate-900">
                      {download.version}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                {download.isDownloading && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">
                        جاري التنزيل...
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {download.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${download.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {download.error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{download.error}</p>
                  </div>
                )}

                {/* Success Message */}
                {download.isCompleted && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-600">
                      تم التنزيل بنجاح!
                    </p>
                  </div>
                )}

                {/* Download Button */}
                <Button
                  onClick={() => handleDownload(download.id)}
                  disabled={download.isDownloading}
                  className={`w-full gap-2 ${
                    download.isCompleted
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {download.isDownloading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      جاري التنزيل...
                    </>
                  ) : download.isCompleted ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      تم التنزيل
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      تحميل الآن
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Installation Instructions */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            تعليمات التثبيت
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Desktop Apps */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                تطبيقات سطح المكتب
              </h3>
              <ol className="space-y-3 text-slate-600">
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>قم بتحميل الملف المناسب لنظام التشغيل الخاص بك</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>فك ضغط الملف ZIP إلى مجلد على جهازك</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>قم بتشغيل ملف التثبيت (Installer)</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">4.</span>
                  <span>اتبع خطوات التثبيت وأكمل التثبيت</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">5.</span>
                  <span>افتح التطبيق وقم بتسجيل الدخول</span>
                </li>
              </ol>
            </div>

            {/* Mobile Apps */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                تطبيقات الهاتف الذكي
              </h3>
              <ol className="space-y-3 text-slate-600">
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>اختر نظام التشغيل الخاص بك (iOS أو Android)</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>سيتم توجيهك إلى متجر التطبيقات</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>انقر على زر "تثبيت" أو "Get"</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">4.</span>
                  <span>انتظر اكتمال التثبيت</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">5.</span>
                  <span>افتح التطبيق وقم بتسجيل الدخول</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* System Requirements */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            متطلبات النظام
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">
                تطبيق الويب
              </h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>✓ متصفح حديث (Chrome, Firefox, Safari, Edge)</li>
                <li>✓ اتصال إنترنت</li>
                <li>✓ دقة شاشة: 1024x768 أو أعلى</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">
                تطبيق سطح المكتب
              </h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>✓ RAM: 4 GB أو أعلى</li>
                <li>✓ مساحة تخزين: 1 GB</li>
                <li>✓ Windows 7+ / macOS 10.12+ / Linux</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">
                تطبيق الهاتف
              </h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>✓ iOS 12+ أو Android 8+</li>
                <li>✓ RAM: 2 GB أو أعلى</li>
                <li>✓ مساحة تخزين: 500 MB</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 mb-4">
            هل تواجه مشكلة في التنزيل أو التثبيت؟
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              variant="outline"
              onClick={() => window.open("mailto:support@jordancustoms.com")}
            >
              البريد الإلكتروني
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open("tel:+962612345678")}
            >
              الهاتف
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              العودة إلى الرئيسية
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

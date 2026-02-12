import React from 'react';
import { DownloadCloud, Shield, Zap, Globe, Smartphone, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Download() {
  const downloadLinks = [
    {
      name: 'نسخة الويب (مباشر)',
      description: 'لا يحتاج تثبيت - يعمل من أي متصفح',
      icon: Globe,
      link: 'https://3000-iez20yhz3jlh0ce65dmdy-c99488f0.sg1.manus.computer',
      size: 'متاح على الإنترنت',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'نسخة محمولة (ZIP)',
      description: 'تطبيق مستقل - لا يحتاج تثبيت',
      icon: DownloadCloud,
      link: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663107576035/xFTHEDAkhcRcASZU.zip',
      size: '4.5 MB',
      color: 'from-green-500 to-emerald-500',
    },
    {
      name: 'نسخة مضغوطة (TAR.GZ)',
      description: 'للأنظمة الأخرى - Linux و macOS',
      icon: Code,
      link: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663107576035/BjEkPjLNOjKNRxQN.gz',
      size: '4.4 MB',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'أمان عالي',
      description: 'مصادقة آمنة وتشفير كامل للبيانات',
    },
    {
      icon: Zap,
      title: 'أداء ممتاز',
      description: 'سرعة عالية واستجابة فورية',
    },
    {
      icon: Globe,
      title: 'دعم كامل للعربية',
      description: 'واجهة عربية احترافية وسهلة الاستخدام',
    },
  ];

  const systemRequirements = [
    {
      title: 'نسخة الويب',
      requirements: [
        'متصفح حديث (Chrome, Firefox, Safari, Edge)',
        'اتصال بالإنترنت',
        'JavaScript مفعّل',
      ],
    },
    {
      title: 'نسخة سطح المكتب',
      requirements: [
        'Windows 10/11 (64-bit) أو Linux أو macOS',
        '500 MB مساحة حرة',
        '2 GB RAM (الحد الأدنى)',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            تحميل التطبيق
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl">
            نظام إدارة تكاليف الشحن والجمارك الأردنية - متاح الآن للتحميل والاستخدام
          </p>
        </div>
      </div>

      {/* Download Options */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {downloadLinks.map((option, index) => {
            const Icon = option.icon;
            return (
              <div
                key={index}
                className="group relative bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700 hover:border-slate-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity`} />
                <div className="relative">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${option.color} p-3 mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{option.name}</h3>
                  <p className="text-slate-400 mb-4">{option.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{option.size}</span>
                    <Button
                      asChild
                      className={`bg-gradient-to-r ${option.color} hover:shadow-lg`}
                    >
                      <a href={option.link}>تحميل</a>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            المميزات الرئيسية
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700 hover:border-slate-600 transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 p-3 mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Requirements */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            المتطلبات النظام
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {systemRequirements.map((req, index) => (
              <div
                key={index}
                className="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700"
              >
                <h3 className="text-xl font-bold text-white mb-4">{req.title}</h3>
                <ul className="space-y-3">
                  {req.requirements.map((requirement, i) => (
                    <li key={i} className="flex items-start text-slate-300">
                      <span className="text-green-400 mr-3 mt-1">✓</span>
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Checksums */}
        <div className="bg-slate-800/50 backdrop-blur rounded-xl p-8 border border-slate-700 mb-20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Shield className="w-6 h-6 mr-3 text-green-400" />
            التحقق من السلامة
          </h2>
          <p className="text-slate-300 mb-4">
            للتحقق من سلامة الملفات المحملة، استخدم الأوامر التالية:
          </p>
          <div className="bg-slate-900/50 rounded-lg p-4 mb-4 overflow-x-auto">
            <code className="text-green-400 font-mono text-sm">
              sha256sum -c SHA256SUMS.txt
            </code>
          </div>
          <div className="space-y-3">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-2">ZIP Checksum:</p>
              <code className="text-green-400 font-mono text-xs break-all">
                99e03f0197df09ed62631ffaba9f688b39ff25b75b9396d10b493a0ff15ce58a
              </code>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-slate-400 text-sm mb-2">TAR.GZ Checksum:</p>
              <code className="text-green-400 font-mono text-xs break-all">
                14f6772c10b9320a9552b9f7ba83a64326f751dc26c9de1371fc4b6da198418b
              </code>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-8 border border-blue-500/20">
          <h2 className="text-2xl font-bold text-white mb-6">معلومات التواصل</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <p className="text-slate-400 mb-2">اسم المطور</p>
              <p className="text-xl font-bold text-white">سعد النابلسي</p>
            </div>
            <div>
              <p className="text-slate-400 mb-2">البريد الإلكتروني</p>
              <a
                href="mailto:saad.building.materials1@gmail.com"
                className="text-xl font-bold text-blue-400 hover:text-blue-300"
              >
                saad.building.materials1@gmail.com
              </a>
            </div>
            <div>
              <p className="text-slate-400 mb-2">رقم الهاتف</p>
              <a
                href="tel:+962795917424"
                className="text-xl font-bold text-blue-400 hover:text-blue-300"
              >
                +962 795 917 424
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>© 2026 نظام إدارة تكاليف الشحن والجمارك الأردنية. جميع الحقوق محفوظة.</p>
          <p className="mt-2 text-sm">الإصدار 1.0.1 | آخر تحديث: 7 فبراير 2026</p>
        </div>
      </div>
    </div>
  );
}

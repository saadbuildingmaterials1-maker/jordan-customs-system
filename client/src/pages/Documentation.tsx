import { useLocation } from "wouter";
import { ArrowRight, BookOpen, Code, Users, Zap } from "lucide-react";
import { useState } from "react";

export default function Documentation() {
  const [, navigate] = useLocation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    {
      id: "getting-started",
      title: "البدء السريع",
      icon: Zap,
      content: "تعرف على كيفية البدء مع المنصة في دقائق معدودة. سنرشدك خطوة بخطوة عبر عملية التسجيل والإعدادات الأساسية."
    },
    {
      id: "user-guide",
      title: "دليل المستخدم",
      icon: Users,
      content: "دليل شامل يغطي جميع ميزات المنصة. تعرف على كيفية إنشاء البيانات الجمركية والتقارير والمزيد."
    },
    {
      id: "api-docs",
      title: "توثيق API",
      icon: Code,
      content: "توثيق تقنية شاملة للمطورين. تعرف على كيفية دمج المنصة مع أنظمتك الخاصة."
    },
    {
      id: "best-practices",
      title: "أفضل الممارسات",
      icon: BookOpen,
      content: "نصائح وتوصيات لاستخدام المنصة بكفاءة وأمان. تعرف على الطرق الموصى بها لإدارة البيانات."
    }
  ];

  const tutorials = [
    {
      title: "إنشاء بيان جمركي",
      steps: [
        "انتقل إلى قسم البيانات الجمركية",
        "اضغط على 'بيان جديد'",
        "ملأ بيانات الشحنة والمنتجات",
        "احسب الرسوم والضرائب تلقائياً",
        "احفظ البيان"
      ]
    },
    {
      title: "استيراد من PDF",
      steps: [
        "انتقل إلى قسم 'استيراد من PDF'",
        "رفع ملف PDF يحتوي على بيانات الشحنة",
        "تحقق من البيانات المستخرجة",
        "عدّل أي بيانات غير صحيحة",
        "احفظ البيانات"
      ]
    },
    {
      title: "تتبع الشحنات",
      steps: [
        "انتقل إلى قسم التتبع",
        "ابحث برقم الحاوية أو بوليصة الشحن",
        "شاهد حالة الشحنة الحالية",
        "اعرض الخريطة التفاعلية",
        "تلقي إشعارات التحديثات"
      ]
    },
    {
      title: "إنشاء تقرير",
      steps: [
        "انتقل إلى قسم التقارير",
        "اختر نوع التقرير المطلوب",
        "حدد الفترة الزمنية",
        "اختر المعايير والفلاتر",
        "صدّر أو اطبع التقرير"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <header className="relative py-12 px-4 md:px-8 lg:px-16 border-b border-white/10">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-200 hover:text-blue-100 mb-6 transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            العودة للرئيسية
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">التوثيق</h1>
          <p className="text-blue-100/70">دليل شامل لاستخدام جميع ميزات المنصة</p>
        </div>
      </header>

      {/* Content */}
      <main className="relative py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          {/* Documentation Sections */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">أقسام التوثيق</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    className="group p-6 rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-white/10 hover:border-white/30 transition-all text-left"
                  >
                    <Icon className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-bold text-white mb-2">{section.title}</h3>
                    <p className="text-blue-100/70 text-sm">{section.content}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Tutorials */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">الدروس التعليمية</h2>
            <div className="space-y-4">
              {tutorials.map((tutorial, idx) => (
                <details key={idx} className="group p-6 rounded-lg bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer">
                  <summary className="flex items-center justify-between font-semibold text-white text-lg">
                    <span>{tutorial.title}</span>
                    <span className="text-blue-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <div className="mt-4">
                    <ol className="space-y-2">
                      {tutorial.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="flex gap-4 text-blue-100/80">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/50 flex items-center justify-center text-sm font-semibold">
                            {stepIdx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* API Reference */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">مرجع API</h2>
            <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-white/10 rounded-lg p-6">
              <p className="text-blue-100/80 mb-4">
                توثيق API شاملة متاحة للمطورين. يمكنك دمج المنصة مع أنظمتك الخاصة باستخدام REST API.
              </p>
              <div className="space-y-4">
                <div className="bg-white/5 rounded p-4 font-mono text-sm">
                  <p className="text-blue-300">GET /api/declarations</p>
                  <p className="text-blue-100/70 mt-2">احصل على قائمة البيانات الجمركية</p>
                </div>
                <div className="bg-white/5 rounded p-4 font-mono text-sm">
                  <p className="text-blue-300">POST /api/declarations</p>
                  <p className="text-blue-100/70 mt-2">إنشاء بيان جمركي جديد</p>
                </div>
                <div className="bg-white/5 rounded p-4 font-mono text-sm">
                  <p className="text-blue-300">GET /api/tracking/:id</p>
                  <p className="text-blue-100/70 mt-2">تتبع حالة الشحنة</p>
                </div>
              </div>
            </div>
          </section>

          {/* Back Button */}
          <div className="pt-8 border-t border-white/10">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

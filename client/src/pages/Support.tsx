import { useLocation } from "wouter";
import { ArrowRight, HelpCircle, MessageSquare, BookOpen, AlertCircle } from "lucide-react";

export default function Support() {
  const [, navigate] = useLocation();

  const supportCategories = [
    {
      icon: HelpCircle,
      title: "الأسئلة الشائعة",
      description: "إجابات على الأسئلة الشائعة حول استخدام المنصة",
      action: () => navigate("/faq")
    },
    {
      icon: BookOpen,
      title: "التوثيق",
      description: "دليل شامل لاستخدام جميع ميزات المنصة",
      action: () => navigate("/documentation")
    },
    {
      icon: MessageSquare,
      title: "التواصل المباشر",
      description: "تواصل مع فريق الدعم الفني لدينا",
      action: () => navigate("/contact")
    },
    {
      icon: AlertCircle,
      title: "الإبلاغ عن مشكلة",
      description: "أخبرنا عن أي مشاكل تواجهها في المنصة",
      action: () => navigate("/contact")
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">الدعم الفني</h1>
          <p className="text-blue-100/70">نحن هنا لمساعدتك في حل أي مشاكل أو استفسارات</p>
        </div>
      </header>

      {/* Content */}
      <main className="relative py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          {/* Support Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {supportCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <button
                  key={idx}
                  onClick={category.action}
                  className="group p-6 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-white/10 hover:border-white/30 transition-all duration-300 hover:shadow-lg text-left"
                >
                  <Icon className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-white mb-2">{category.title}</h3>
                  <p className="text-blue-100/70">{category.description}</p>
                </button>
              );
            })}
          </div>

          {/* Support Info */}
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-white/10 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4">ساعات الدعم</h2>
            <div className="space-y-3 text-blue-100/80">
              <p>الأحد - الخميس: 8:00 صباحاً - 6:00 مساءً</p>
              <p>الجمعة - السبت: 10:00 صباحاً - 4:00 مساءً</p>
              <p className="text-sm text-blue-100/60">التوقيت: توقيت الأردن (GMT+2)</p>
            </div>
          </div>

          {/* Common Issues */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">المشاكل الشائعة</h2>
            <div className="space-y-4">
              {[
                {
                  question: "كيف أنشئ بيان جمركي جديد؟",
                  answer: "انتقل إلى صفحة البيانات الجمركية واضغط على 'بيان جديد' ثم ملأ النموذج بالبيانات المطلوبة."
                },
                {
                  question: "كيف أستورد البيانات من ملف PDF؟",
                  answer: "استخدم صفحة 'استيراد من PDF' وقم برفع الملف. سيتم استخراج البيانات تلقائياً."
                },
                {
                  question: "كيف أتتبع حالة الشحنة؟",
                  answer: "انتقل إلى صفحة التتبع وابحث برقم الحاوية أو بوليصة الشحن."
                },
                {
                  question: "كيف أصدر تقرير شامل؟",
                  answer: "استخدم صفحة التقارير واختر الفترة الزمنية المطلوبة ثم اضغط 'تحميل' أو 'طباعة'."
                }
              ].map((item, idx) => (
                <details key={idx} className="group p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer">
                  <summary className="flex items-center justify-between font-semibold text-white">
                    <span>{item.question}</span>
                    <span className="text-blue-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-blue-100/70">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>

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

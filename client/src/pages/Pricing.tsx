import { useLocation } from "wouter";
import { ArrowRight, Check } from "lucide-react";

export default function Pricing() {
  const [, navigate] = useLocation();

  const plans = [
    {
      name: "الخطة الأساسية",
      price: "99",
      description: "للشركات الصغيرة والناشئة",
      features: [
        "إدارة حتى 100 بيان جمركي شهرياً",
        "تقارير أساسية",
        "تتبع الشحنات",
        "دعم بريد إلكتروني",
        "نسخة احتياطية يومية"
      ],
      cta: "ابدأ الآن",
      highlighted: false
    },
    {
      name: "الخطة المتقدمة",
      price: "299",
      description: "للشركات المتوسطة",
      features: [
        "إدارة حتى 1000 بيان جمركي شهرياً",
        "تقارير متقدمة مع رسوم بيانية",
        "تتبع فوري للشحنات",
        "دعم أولويتي",
        "نسخة احتياطية كل ساعة",
        "استيراد من PDF",
        "إدارة المستخدمين"
      ],
      cta: "ابدأ الآن",
      highlighted: true
    },
    {
      name: "الخطة المؤسسية",
      price: "999",
      description: "للشركات الكبرى",
      features: [
        "إدارة غير محدودة للبيانات",
        "تقارير مخصصة وتحليلات عميقة",
        "تتبع متقدم مع خرائط تفاعلية",
        "دعم هاتفي 24/7",
        "نسخة احتياطية في الوقت الفعلي",
        "API مخصص",
        "إدارة متقدمة للمستخدمين",
        "تكامل مع الأنظمة الخارجية"
      ],
      cta: "اتصل بنا",
      highlighted: false
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">الأسعار والخطط</h1>
          <p className="text-blue-100/70">اختر الخطة المناسبة لاحتياجات شركتك</p>
        </div>
      </header>

      {/* Content */}
      <main className="relative py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-xl overflow-hidden transition-all duration-300 ${
                  plan.highlighted
                    ? "md:scale-105 bg-gradient-to-br from-blue-600 to-cyan-600 shadow-2xl shadow-blue-500/50"
                    : "bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-white/10"
                }`}
              >
                <div className="p-8">
                  {plan.highlighted && (
                    <div className="inline-block px-4 py-1 bg-white/20 rounded-full text-sm font-semibold mb-4">
                      الأكثر شهرة
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-white/70 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-white/70 mr-2">دينار/شهر</span>
                  </div>

                  <button
                    onClick={() => navigate("/contact")}
                    className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 mb-8 ${
                      plan.highlighted
                        ? "bg-white text-blue-600 hover:bg-white/90"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {plan.cta}
                  </button>

                  <div className="space-y-4">
                    {plan.features.map((feature, featureIdx) => (
                      <div key={featureIdx} className="flex gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-white/90">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-white/10 rounded-xl p-8 mb-12">
            <h2 className="text-2xl font-bold mb-6">أسئلة شائعة حول الأسعار</h2>
            <div className="space-y-4">
              {[
                {
                  q: "هل يمكن تغيير الخطة لاحقاً؟",
                  a: "نعم، يمكنك تغيير الخطة أو الترقية في أي وقت. سيتم احتساب الفرق بشكل متناسب."
                },
                {
                  q: "هل هناك فترة تجريبية مجانية؟",
                  a: "نعم، نقدم فترة تجريبية مجانية لمدة 14 يوم للخطط المتقدمة والمؤسسية."
                },
                {
                  q: "ما طرق الدفع المتاحة؟",
                  a: "نقبل التحويل البنكي والدفع عبر البطاقة الائتمانية والمحافظ الرقمية."
                },
                {
                  q: "هل هناك خصومات للعقود السنوية؟",
                  a: "نعم، نقدم خصم 20% على العقود السنوية."
                }
              ].map((item, idx) => (
                <details key={idx} className="group p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer">
                  <summary className="flex items-center justify-between font-semibold text-white">
                    <span>{item.q}</span>
                    <span className="text-blue-400 group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-4 text-blue-100/70">{item.a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600/40 to-cyan-600/40 border border-white/20 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">هل تحتاج إلى خطة مخصصة؟</h2>
            <p className="text-blue-100/80 mb-6">
              تواصل معنا لمناقشة احتياجاتك الخاصة والحصول على عرض مخصص
            </p>
            <button
              onClick={() => navigate("/contact")}
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              اتصل بنا الآن
            </button>
          </div>

          {/* Back Button */}
          <div className="mt-12 pt-8 border-t border-white/10">
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

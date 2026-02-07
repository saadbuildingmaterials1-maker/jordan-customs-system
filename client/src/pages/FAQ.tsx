import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";

export default function FAQ() {
  const [, navigate] = useLocation();

  const faqs = [
    {
      category: "الحساب والدخول",
      items: [
        {
          q: "كيف أنشئ حساباً جديداً؟",
          a: "انقر على زر 'ابدأ الآن' في الصفحة الرئيسية وتابع خطوات التسجيل."
        },
        {
          q: "هل يمكنني استخدام حساب واحد لعدة مستخدمين؟",
          a: "نعم، يمكنك إضافة مستخدمين إضافيين من إعدادات الحساب."
        },
        {
          q: "كيف أستعيد كلمة المرور المنسية؟",
          a: "انقر على 'نسيت كلمة المرور' في صفحة الدخول وتابع التعليمات."
        }
      ]
    },
    {
      category: "البيانات الجمركية",
      items: [
        {
          q: "كيف أنشئ بيان جمركي جديد؟",
          a: "انتقل إلى قسم البيانات الجمركية واضغط على 'بيان جديد' ثم ملأ النموذج."
        },
        {
          q: "هل يمكن تعديل بيان بعد إنشاؤه؟",
          a: "نعم، يمكنك تعديل البيان طالما لم يتم الموافقة عليه نهائياً."
        },
        {
          q: "كيف أستورد البيانات من ملف PDF؟",
          a: "استخدم صفحة 'استيراد من PDF' ورفع الملف. سيتم استخراج البيانات تلقائياً."
        }
      ]
    },
    {
      category: "التقارير والتحليلات",
      items: [
        {
          q: "كيف أنشئ تقرير شامل؟",
          a: "انتقل إلى قسم التقارير واختر الفترة الزمنية والمعايير المطلوبة."
        },
        {
          q: "هل يمكن تصدير التقارير؟",
          a: "نعم، يمكنك تصدير التقارير بصيغ متعددة (PDF, Excel, CSV)."
        },
        {
          q: "كيف أنشئ رسم بياني مخصص؟",
          a: "استخدم أداة الرسوم البيانية واختر نوع الرسم والبيانات المطلوبة."
        }
      ]
    },
    {
      category: "الدفع والفواتير",
      items: [
        {
          q: "ما طرق الدفع المتاحة؟",
          a: "نقبل التحويل البنكي والدفع عبر البطاقة الائتمانية والمحافظ الرقمية."
        },
        {
          q: "كيف أصدر فاتورة؟",
          a: "انتقل إلى قسم الفواتير واضغط على 'فاتورة جديدة' ثم ملأ البيانات."
        },
        {
          q: "هل يمكن إرسال الفواتير تلقائياً؟",
          a: "نعم، يمكنك تفعيل الإرسال التلقائي من إعدادات الفواتير."
        }
      ]
    },
    {
      category: "التتبع والشحنات",
      items: [
        {
          q: "كيف أتتبع حالة الشحنة؟",
          a: "انتقل إلى قسم التتبع وابحث برقم الحاوية أو بوليصة الشحن."
        },
        {
          q: "هل يمكن تلقي إشعارات عند تحديث الشحنة؟",
          a: "نعم، يمكنك تفعيل الإشعارات من إعدادات الحساب."
        },
        {
          q: "كيف أشاهد خريطة الشحنة؟",
          a: "انقر على الشحنة وستظهر خريطة تفاعلية توضح موقع الحاوية."
        }
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">الأسئلة الشائعة</h1>
          <p className="text-blue-100/70">إجابات على الأسئلة الشائعة حول استخدام المنصة</p>
        </div>
      </header>

      {/* Content */}
      <main className="relative py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {faqs.map((section, sectionIdx) => (
              <section key={sectionIdx}>
                <h2 className="text-2xl font-bold mb-6 text-blue-200">{section.category}</h2>
                <div className="space-y-4">
                  {section.items.map((item, itemIdx) => (
                    <details
                      key={itemIdx}
                      className="group p-6 rounded-lg bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                    >
                      <summary className="flex items-center justify-between font-semibold text-white text-lg">
                        <span>{item.q}</span>
                        <span className="text-blue-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4">▼</span>
                      </summary>
                      <p className="mt-4 text-blue-100/80 leading-relaxed">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 p-8 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-white/10">
            <h2 className="text-2xl font-bold mb-4">لم تجد إجابتك؟</h2>
            <p className="text-blue-100/80 mb-6">
              إذا لم تجد إجابة على سؤالك، يرجى التواصل معنا مباشرة.
            </p>
            <button
              onClick={() => navigate("/contact")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              اتصل بنا
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

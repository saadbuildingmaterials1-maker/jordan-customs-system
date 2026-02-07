import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Terms() {
  const [, navigate] = useLocation();

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">شروط الاستخدام</h1>
          <p className="text-blue-100/70">الشروط والأحكام التي تحكم استخدام المنصة</p>
        </div>
      </header>

      {/* Content */}
      <main className="relative py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">قبول الشروط</h2>
              <p className="text-blue-100/80 leading-relaxed">
                باستخدامك لمنصة نظام إدارة تكاليف الشحن والجمارك الأردنية، فإنك توافق على الالتزام بجميع الشروط والأحكام المذكورة هنا.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">الاستخدام المسموح</h2>
              <p className="text-blue-100/80 leading-relaxed mb-4">
                يسمح لك باستخدام المنصة للأغراض التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 text-blue-100/70">
                <li>إدارة البيانات الجمركية والشحنات</li>
                <li>حساب التكاليف والرسوم</li>
                <li>إنشاء التقارير والتحليلات</li>
                <li>تتبع الحاويات والشحنات</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">الاستخدام غير المسموح</h2>
              <p className="text-blue-100/80 leading-relaxed mb-4">
                لا يسمح بـ:
              </p>
              <ul className="list-disc list-inside space-y-2 text-blue-100/70">
                <li>استخدام المنصة لأغراض غير قانونية</li>
                <li>محاولة اختراق أو تعديل النظام</li>
                <li>مشاركة بيانات المستخدمين مع أطراف ثالثة</li>
                <li>استخدام المنصة بطريقة تضر بالخدمة</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">المسؤولية</h2>
              <p className="text-blue-100/80 leading-relaxed">
                نحن لا نتحمل مسؤولية عن أي خسائر أو أضرار ناشئة عن استخدام المنصة أو عدم القدرة على استخدامها.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">التعديلات</h2>
              <p className="text-blue-100/80 leading-relaxed">
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطارك بأي تغييرات جوهرية.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">الإنهاء</h2>
              <p className="text-blue-100/80 leading-relaxed">
                قد نقوم بإنهاء أو تعليق حسابك إذا انتهكت هذه الشروط أو استخدمت المنصة بطريقة غير قانونية.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">القانون الحاكم</h2>
              <p className="text-blue-100/80 leading-relaxed">
                تحكم هذه الشروط القوانين الأردنية ذات الصلة.
              </p>
            </section>
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

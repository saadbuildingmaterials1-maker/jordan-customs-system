import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";

export default function Privacy() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">سياسة الخصوصية</h1>
          <p className="text-blue-100/70">حماية بيانات المستخدمين وخصوصيتهم</p>
        </div>
      </header>

      {/* Content */}
      <main className="relative py-12 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">مقدمة</h2>
              <p className="text-blue-100/80 leading-relaxed">
                نحن نلتزم بحماية خصوصيتك وبيانات الشركة الخاصة بك. توضح هذه السياسة كيفية نجمع واستخدام وحماية المعلومات التي تقدمها لنا.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">جمع البيانات</h2>
              <p className="text-blue-100/80 leading-relaxed mb-4">
                نجمع المعلومات التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 text-blue-100/70">
                <li>معلومات الحساب (الاسم، البريد الإلكتروني، رقم الهاتف)</li>
                <li>بيانات الشركة والعمليات الجمركية</li>
                <li>سجل الأنشطة والعمليات</li>
                <li>معلومات الجهاز والمتصفح</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">استخدام البيانات</h2>
              <p className="text-blue-100/80 leading-relaxed mb-4">
                نستخدم البيانات المجمعة لـ:
              </p>
              <ul className="list-disc list-inside space-y-2 text-blue-100/70">
                <li>تقديم الخدمات والدعم الفني</li>
                <li>تحسين وتطوير المنصة</li>
                <li>الامتثال للمتطلبات القانونية</li>
                <li>الاتصال بك حول التحديثات والعروض</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">حماية البيانات</h2>
              <p className="text-blue-100/80 leading-relaxed">
                نستخدم تقنيات التشفير والحماية المتقدمة لحماية بيانات المستخدمين من الوصول غير المصرح به والفقدان والتعديل.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">حقوقك</h2>
              <p className="text-blue-100/80 leading-relaxed mb-4">
                لديك الحق في:
              </p>
              <ul className="list-disc list-inside space-y-2 text-blue-100/70">
                <li>الوصول إلى بيانات الشخصية</li>
                <li>تصحيح المعلومات غير الدقيقة</li>
                <li>حذف بيانات الشخصية</li>
                <li>الاعتراض على معالجة البيانات</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">التواصل معنا</h2>
              <p className="text-blue-100/80 leading-relaxed">
                إذا كان لديك أي استفسارات حول سياسة الخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني أو نموذج الاتصال.
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

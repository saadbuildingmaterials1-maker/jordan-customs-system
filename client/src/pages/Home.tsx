import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Plus, FileText, TrendingUp, DollarSign, Download, Smartphone, Monitor,
  ArrowRight, CheckCircle, Zap, BarChart3, Package, Truck, Clock, Shield
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [, navigate] = useLocation();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-16 px-4 md:py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              نظام إدارة تكاليف الشحن والجمارك الأردنية
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              منصة متكاملة لإدارة البيانات الجمركية والشحنات والتكاليف بكفاءة عالية وسهولة استخدام
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate("/declarations/new")} 
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-6 text-lg gap-2"
              >
                <Plus className="w-5 h-5" />
                ابدأ الآن
              </Button>
              <Button 
                onClick={() => navigate("/dashboard")} 
                className="bg-blue-500 hover:bg-blue-600 font-semibold px-8 py-6 text-lg gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                لوحة التحكم
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: FileText, label: "بيانات جمركية", color: "text-blue-600" },
              { icon: DollarSign, label: "حسابات مالية", color: "text-green-600" },
              { icon: Truck, label: "تتبع الشحنات", color: "text-orange-600" },
              { icon: Shield, label: "أمان عالي", color: "text-purple-600" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-2`} />
                <p className="text-gray-700 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Quick Actions */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">الإجراءات السريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Plus,
                title: "إنشاء بيان جمركي",
                description: "أضف بيان جمركي جديد باستخدام نموذج سهل وسريع",
                action: () => navigate("/declarations/new"),
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: FileText,
                title: "استيراد من PDF",
                description: "استخرج البيانات تلقائياً من ملفات PDF والفواتير",
                action: () => navigate("/pdf-import"),
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: Truck,
                title: "تتبع الحاويات",
                description: "تابع حالة الشحنات والحاويات في الوقت الفعلي",
                action: () => navigate("/tracking"),
                color: "from-green-500 to-green-600"
              }
            ].map((action, idx) => (
              <button
                key={idx}
                onClick={action.action}
                onMouseEnter={() => setHoveredCard(`action-${idx}`)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group text-left"
              >
                <div className={`bg-gradient-to-br ${action.color} text-white p-6 rounded-lg transition-all duration-300 ${
                  hoveredCard === `action-${idx}` ? 'shadow-lg scale-105' : 'shadow-md'
                }`}>
                  <action.icon className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                  <p className="text-white/90 text-sm mb-4">{action.description}</p>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    ابدأ الآن <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Core Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">المميزات الرئيسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: FileText,
                title: "إدارة البيانات الجمركية",
                description: "إدارة شاملة للبيانات الجمركية مع حساب الرسوم والضرائب تلقائياً",
                features: ["حساب تلقائي للرسوم", "ضرائب ديناميكية", "تقارير مفصلة"],
                action: () => navigate("/declarations"),
                color: "border-blue-200 bg-blue-50"
              },
              {
                icon: BarChart3,
                title: "التقارير والتحليلات",
                description: "تقارير شاملة مع رسوم بيانية متقدمة وتحليل البيانات",
                features: ["رسوم بيانية حية", "تصدير PDF/Excel", "تحليلات متقدمة"],
                action: () => navigate("/reports"),
                color: "border-green-200 bg-green-50"
              },
              {
                icon: DollarSign,
                title: "نظام الدفع والفواتير",
                description: "نظام دفع متكامل مع Stripe وإدارة شاملة للفواتير",
                features: ["دفع آمن", "فواتير تلقائية", "تتبع الدفعات"],
                action: () => navigate("/payments"),
                color: "border-purple-200 bg-purple-50"
              },
              {
                icon: TrendingUp,
                title: "لوحة التحكم الذكية",
                description: "لوحة تحكم ذكية مع رسوم بيانية وإحصائيات فورية",
                features: ["إحصائيات فورية", "رسوم بيانية تفاعلية", "مؤشرات الأداء"],
                action: () => navigate("/dashboard"),
                color: "border-orange-200 bg-orange-50"
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`p-6 border-2 rounded-lg transition-all duration-300 hover:shadow-lg ${feature.color}`}
              >
                <feature.icon className="w-8 h-8 text-gray-700 mb-4" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <ul className="space-y-2 mb-4">
                  {feature.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={feature.action}
                  variant="outline"
                  className="w-full"
                >
                  اكتشف المزيد
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mb-16 bg-gradient-to-r from-blue-50 to-blue-100 p-8 rounded-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">لماذا تختار نظامنا؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "سرعة عالية",
                description: "معالجة فورية للبيانات مع واجهة سريعة وسهلة الاستخدام"
              },
              {
                icon: Shield,
                title: "أمان عالي",
                description: "حماية كاملة للبيانات مع تشفير قوي ونسخ احتياطية منتظمة"
              },
              {
                icon: Clock,
                title: "توفير الوقت",
                description: "أتمتة العمليات الروتينية وتقليل الأخطاء اليدوية"
              }
            ].map((benefit, idx) => (
              <div key={idx} className="text-center">
                <benefit.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-700">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Download Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">تحميل التطبيقات</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Monitor,
                title: "تطبيق الويب",
                description: "استخدم التطبيق مباشرة من المتصفح بدون تثبيت",
                action: () => navigate("/"),
                buttonText: "فتح الآن"
              },
              {
                icon: Smartphone,
                title: "تطبيق الهاتف",
                description: "حمّل التطبيق على iOS أو Android للعمل في أي مكان",
                action: null,
                buttonText: "قريباً"
              },
              {
                icon: Download,
                title: "تطبيق سطح المكتب",
                description: "حمّل التطبيق لـ Windows أو Mac أو Linux",
                action: () => navigate("/download"),
                buttonText: "تحميل"
              }
            ].map((app, idx) => (
              <div key={idx} className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors">
                <app.icon className="w-8 h-8 text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{app.title}</h3>
                <p className="text-gray-600 mb-4">{app.description}</p>
                <Button
                  onClick={app.action || (() => {})}
                  className="w-full"
                  disabled={!app.action}
                >
                  {app.buttonText}
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-12 rounded-lg text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">ابدأ الآن مع نظام إدارة الجمارك</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            انضم إلى آلاف المستخدمين الذين يستخدمون نظامنا لإدارة عملياتهم الجمركية بكفاءة
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/declarations/new")}
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8 py-3"
            >
              إنشاء بيان جمركي
            </Button>
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-blue-500 hover:bg-blue-600 font-semibold px-8 py-3"
            >
              عرض لوحة التحكم
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">عن النظام</h3>
              <p className="text-gray-400 text-sm">نظام متكامل لإدارة البيانات الجمركية والشحنات بكفاءة عالية</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">الروابط السريعة</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => navigate("/declarations")} className="hover:text-white">البيانات الجمركية</button></li>
                <li><button onClick={() => navigate("/reports")} className="hover:text-white">التقارير</button></li>
                <li><button onClick={() => navigate("/dashboard")} className="hover:text-white">لوحة التحكم</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">المساعدة</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">الدعم الفني</a></li>
                <li><a href="#" className="hover:text-white">التوثيق</a></li>
                <li><a href="#" className="hover:text-white">الأسئلة الشائعة</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">القانوني</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-white">شروط الاستخدام</a></li>
                <li><a href="#" className="hover:text-white">اتصل بنا</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 نظام إدارة تكاليف الشحن والجمارك الأردنية. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

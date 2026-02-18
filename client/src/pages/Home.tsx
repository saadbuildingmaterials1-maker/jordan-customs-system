/**
 * Home Page - Simple Version
 * 
 * صفحة الرئيسية - نسخة بسيطة
 * 
 * @module ./client/src/pages/Home
 */
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Plus, FileText, LogIn } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Hero Section */}
      <header className="pt-20 pb-32 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              نظام إدارة تكاليف الشحن والجمارك الأردنية
            </h1>
            <p className="text-xl md:text-2xl text-blue-100/80 mb-8 max-w-3xl mx-auto">
              منصة متكاملة وذكية لإدارة البيانات الجمركية والشحنات والتكاليف بكفاءة عالية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                onClick={() => navigate("/dashboard")}
              >
                <Plus className="w-5 h-5 ml-2" />
                ابدأ الآن
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-blue-400 text-blue-200 hover:bg-blue-500/10"
                onClick={() => navigate("/about")}
              >
                <FileText className="w-5 h-5 ml-2" />
                المزيد من المعلومات
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 px-4 md:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">المميزات الرئيسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "إدارة الشحنات", desc: "تتبع شامل للشحنات والحاويات" },
              { title: "إدارة التكاليف", desc: "حساب الرسوم الجمركية تلقائياً" },
              { title: "التقارير المتقدمة", desc: "تحليلات وتقارير شاملة" },
              { title: "الشحن الدولي", desc: "تكامل مع خدمات الشحن العالمية" },
              { title: "الأمان والحماية", desc: "تشفير عالي وحماية البيانات" },
              { title: "الأداء العالي", desc: "نظام سريع وموثوق" },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-blue-500 transition-colors">
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">جاهز للبدء؟</h2>
          <p className="text-xl text-blue-100 mb-8">انضم إلى آلاف المستخدمين الذين يثقون بنا</p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => navigate("/login")}
          >
            <LogIn className="w-5 h-5 ml-2" />
            سجل الآن مجاناً
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-semibold mb-4">عن النظام</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-blue-400">المميزات</a></li>
                <li><a href="#" className="hover:text-blue-400">الأسعار</a></li>
                <li><a href="#" className="hover:text-blue-400">الدعم</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">الروابط السريعة</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-blue-400">البيانات الجمركية</a></li>
                <li><a href="#" className="hover:text-blue-400">التقارير</a></li>
                <li><a href="#" className="hover:text-blue-400">لوحة التحكم</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">المساعدة</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-blue-400">الدعم الفني</a></li>
                <li><a href="#" className="hover:text-blue-400">التوثيق</a></li>
                <li><a href="#" className="hover:text-blue-400">الأسئلة الشائعة</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">القانوني</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-blue-400">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-blue-400">شروط الاستخدام</a></li>
                <li><a href="#" className="hover:text-blue-400">اتصل بنا</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2026 نظام إدارة تكاليف الشحن والجمارك الأردنية. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

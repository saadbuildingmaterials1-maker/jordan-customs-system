/**
 * Home Page - Optimized Version
 * 
 * صفحة الرئيسية - نسخة محسّنة
 * 
 * @module ./client/src/pages/Home
 */
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Plus, FileText, LogIn } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Hero Section */}
      <header className="pt-16 pb-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              نظام إدارة الجمارك الأردنية
            </h1>
            <p className="text-lg md:text-xl text-blue-100/80 mb-6 max-w-2xl mx-auto">
              منصة ذكية لإدارة الشحنات والتكاليف الجمركية
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => navigate("/dashboard")}
              >
                <Plus className="w-4 h-4 ml-2" />
                ابدأ الآن
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-blue-400 text-blue-200 hover:bg-blue-500/10"
                onClick={() => navigate("/about")}
              >
                <FileText className="w-4 h-4 ml-2" />
                المزيد
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">المميزات</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "الشحنات", desc: "تتبع الشحنات" },
              { title: "التكاليف", desc: "حساب الرسوم" },
              { title: "التقارير", desc: "تحليلات شاملة" },
            ].map((feature, i) => (
              <div key={i} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-300 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">جاهز للبدء؟</h2>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-blue-50"
            onClick={() => navigate("/login")}
          >
            <LogIn className="w-4 h-4 ml-2" />
            سجل الآن
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
          <p>&copy; 2026 نظام إدارة الجمارك الأردنية. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  );
}

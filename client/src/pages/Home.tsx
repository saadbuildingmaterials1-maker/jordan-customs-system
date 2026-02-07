/**
 * Home Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/Home
 */
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  Plus, FileText, TrendingUp, DollarSign, Download, Smartphone, Monitor,
  ArrowRight, CheckCircle, Zap, BarChart3, Package, Truck, Clock, Shield,
  Sparkles, ChevronRight, Gauge, Lock, Zap as Lightning
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [, navigate] = useLocation();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      {/* Hero Section */}
      <header className="relative pt-20 pb-32 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {/* Top Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span className="text-sm text-blue-200">منصة متطورة للإدارة الجمركية</span>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200">
              نظام إدارة تكاليف الشحن والجمارك الأردنية
            </h1>
            <p className="text-xl md:text-2xl text-blue-100/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              منصة متكاملة وذكية لإدارة البيانات الجمركية والشحنات والتكاليف بكفاءة عالية وسهولة استخدام فائقة
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate("/declarations/new")}
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/50 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5" />
                  ابدأ الآن
                </div>
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="group px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-lg font-semibold text-lg transition-all duration-300 backdrop-blur-md"
              >
                <div className="flex items-center justify-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  لوحة التحكم
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="relative py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
            المميزات الرئيسية
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: FileText,
                title: "إدارة البيانات الجمركية",
                description: "إدارة شاملة مع حساب الرسوم والضرائب تلقائياً",
                features: ["حساب تلقائي", "ضرائب ديناميكية", "تقارير مفصلة"],
                gradient: "from-blue-600 to-blue-700",
                action: () => navigate("/declarations")
              },
              {
                icon: BarChart3,
                title: "التقارير والتحليلات",
                description: "رسوم بيانية متقدمة وتحليل شامل للبيانات",
                features: ["رسوم بيانية حية", "تصدير متعدد", "تحليلات عميقة"],
                gradient: "from-cyan-600 to-cyan-700",
                action: () => navigate("/reports")
              },
              {
                icon: DollarSign,
                title: "نظام الدفع والفواتير",
                description: "دفع آمن مع إدارة شاملة للفواتير",
                features: ["دفع آمن", "فواتير تلقائية", "تتبع الدفعات"],
                gradient: "from-purple-600 to-purple-700",
                action: () => navigate("/payments")
              },
              {
                icon: Truck,
                title: "تتبع الشحنات",
                description: "تتبع فوري للحاويات والشحنات",
                features: ["تتبع حي", "خريطة تفاعلية", "إشعارات فورية"],
                gradient: "from-orange-600 to-orange-700",
                action: () => navigate("/tracking")
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <button
                  key={idx}
                  onClick={feature.action}
                  onMouseEnter={() => setHoveredCard(`feature-${idx}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group text-left"
                >
                  <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${feature.gradient} overflow-hidden transition-all duration-500 ${
                    hoveredCard === `feature-${idx}` ? 'shadow-2xl scale-105' : 'shadow-lg'
                  }`}>
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="w-10 h-10 text-white/90" />
                        <ChevronRight className="w-6 h-6 text-white/60 group-hover:text-white group-hover:translate-x-2 transition-all" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                      <p className="text-white/80 mb-4">{feature.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {feature.features.map((f, i) => (
                          <span key={i} className="px-3 py-1 rounded-full bg-white/20 text-sm text-white/90">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="relative py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
            الإجراءات السريعة
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Plus,
                title: "إنشاء بيان جمركي",
                description: "أضف بيان جديد باستخدام نموذج سهل",
                action: () => navigate("/declarations/new"),
                color: "from-blue-500/20 to-blue-600/20"
              },
              {
                icon: FileText,
                title: "استيراد من PDF",
                description: "استخرج البيانات تلقائياً من الملفات",
                action: () => navigate("/pdf-import"),
                color: "from-orange-500/20 to-orange-600/20"
              },
              {
                icon: Truck,
                title: "تتبع الحاويات",
                description: "تابع حالة الشحنات في الوقت الفعلي",
                action: () => navigate("/tracking"),
                color: "from-green-500/20 to-green-600/20"
              }
            ].map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={action.action}
                  onMouseEnter={() => setHoveredCard(`action-${idx}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group"
                >
                  <div className={`p-8 rounded-2xl bg-gradient-to-br ${action.color} border border-white/10 hover:border-white/30 transition-all duration-500 backdrop-blur-md ${
                    hoveredCard === `action-${idx}` ? 'shadow-2xl' : 'shadow-lg'
                  }`}>
                    <Icon className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <h3 className="text-xl font-bold text-white mb-2">{action.title}</h3>
                    <p className="text-white/70 mb-4">{action.description}</p>
                    <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                      ابدأ الآن <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
            لماذا تختار نظامنا؟
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Lightning,
                title: "سرعة عالية",
                description: "معالجة فورية للبيانات مع واجهة سريعة وسلسة"
              },
              {
                icon: Lock,
                title: "أمان عالي",
                description: "حماية كاملة للبيانات مع تشفير قوي ونسخ احتياطية"
              },
              {
                icon: Gauge,
                title: "أداء ممتاز",
                description: "أتمتة العمليات الروتينية وتقليل الأخطاء اليدوية"
              }
            ].map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-400/30 mb-4">
                    <Icon className="w-8 h-8 text-blue-200" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-blue-100/70">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "بيانات جمركية", value: "1000+", icon: FileText },
              { label: "شحنات مُتتبعة", value: "500+", icon: Truck },
              { label: "مستخدمون نشطون", value: "200+", icon: Shield },
              { label: "دول مخدومة", value: "50+", icon: Package }
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md text-center hover:border-white/20 transition-all duration-300">
                  <Icon className="w-8 h-8 text-blue-300 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-blue-100/70">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 rounded-3xl bg-gradient-to-r from-blue-600/40 to-cyan-600/40 border border-white/20 backdrop-blur-md overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-bold text-white mb-4">ابدأ الآن مع نظام الإدارة الجمركية</h2>
              <p className="text-xl text-blue-100/80 mb-8">انضم إلى آلاف المستخدمين الذين يستخدمون نظامنا لإدارة عملياتهم بكفاءة</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate("/declarations/new")}
                  className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-1"
                >
                  إنشاء بيان جمركي
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-8 py-4 bg-white/20 text-white font-bold rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300"
                >
                  عرض لوحة التحكم
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 md:px-8 lg:px-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {[
              {
                title: "عن النظام",
                links: ["المميزات", "الأسعار", "الدعم"]
              },
              {
                title: "الروابط السريعة",
                links: ["البيانات الجمركية", "التقارير", "لوحة التحكم"]
              },
              {
                title: "المساعدة",
                links: ["الدعم الفني", "التوثيق", "الأسئلة الشائعة"]
              },
              {
                title: "القانوني",
                links: ["سياسة الخصوصية", "شروط الاستخدام", "اتصل بنا"]
              }
            ].map((section, idx) => (
              <div key={idx}>
                <h3 className="font-bold text-white mb-4">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-blue-100/70 hover:text-blue-200 transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-blue-100/50">
            <p>&copy; 2026 نظام إدارة تكاليف الشحن والجمارك الأردنية. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

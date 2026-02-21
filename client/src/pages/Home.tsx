import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calculator,
  FileText,
  Package,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Globe,
  Zap,
} from "lucide-react";

export default function Home() {
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Modern Gradient Design */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container relative z-10 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">نظام موثوق ودقيق</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                نظام إدارة
                <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  الجمارك والشحن
                </span>
                <br />
                الأردني المتكامل
              </h1>

              <p className="text-xl text-blue-100 leading-relaxed">
                احسب تكاليف الشحن والرسوم الجمركية بدقة فائقة. تتبع حاوياتك وأنشئ البيانات الجمركية تلقائياً باستخدام الذكاء الاصطناعي.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/calculator">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                    <Calculator className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                    ابدأ الحساب الآن
                    <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-700 transition-all duration-300"
                  onClick={scrollToFeatures}
                >
                  تعرف على المزيد
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold">24+</div>
                  <div className="text-sm text-blue-200">حاوية نشطة</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">18+</div>
                  <div className="text-sm text-blue-200">بيان جمركي</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">99%</div>
                  <div className="text-sm text-blue-200">دقة الحسابات</div>
                </div>
              </div>
            </div>

            {/* Right Content - Feature Cards */}
            <div className="hidden md:grid grid-cols-2 gap-4">
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold mb-2">حاسبة ذكية</h3>
                  <p className="text-sm text-blue-100">حساب دقيق للتكاليف</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 mt-8">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold mb-2">تتبع الحاويات</h3>
                  <p className="text-sm text-blue-100">تتبع لحظي ودقيق</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold mb-2">البيان الجمركي</h3>
                  <p className="text-sm text-blue-100">استيراد تلقائي بالAI</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 mt-8">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold mb-2">لوحة تحكم</h3>
                  <p className="text-sm text-blue-100">إحصائيات شاملة</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 80C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">الميزات الرئيسية</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">لماذا تختار نظامنا؟</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              نوفر لك مجموعة متكاملة من الأدوات الاحترافية لإدارة عمليات الاستيراد والجمارك
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:border-blue-500 hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">حسابات دقيقة</h3>
                <p className="text-gray-600 leading-relaxed">
                  احسب الرسوم الجمركية وضريبة المبيعات وتكاليف الشحن بدقة عالية وفقاً للقوانين الأردنية المحدثة
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:border-green-500 hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">نتائج فورية</h3>
                <p className="text-gray-600 leading-relaxed">
                  احصل على تقديرات التكاليف في ثوانٍ معدودة دون الحاجة للانتظار أو التعقيدات الإدارية
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:border-purple-500 hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">تحديثات مستمرة</h3>
                <p className="text-gray-600 leading-relaxed">
                  نحدّث قاعدة البيانات باستمرار لتعكس آخر التغييرات في الرسوم والقوانين الجمركية
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-2 hover:border-orange-500 hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">بيان جمركي ذكي</h3>
                <p className="text-gray-600 leading-relaxed">
                  ارفع ملف PDF واستخرج البيانات تلقائياً باستخدام الذكاء الاصطناعي مع توزيع التكاليف الدقيق
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-2 hover:border-cyan-500 hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">تتبع متقدم</h3>
                <p className="text-gray-600 leading-relaxed">
                  تتبع حاوياتك وشحناتك في الوقت الفعلي مع timeline كامل لجميع الأحداث والمواقع
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-2 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">تغطية شاملة</h3>
                <p className="text-gray-600 leading-relaxed">
                  دعم جميع أنواع المنتجات والشحنات من جميع دول العالم مع قاعدة بيانات محدثة
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">كيف يعمل النظام؟</h2>
            <p className="text-xl text-gray-600">ثلاث خطوات بسيطة للحصول على تقدير دقيق</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  1
                </div>
                <div className="mt-8 text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">أدخل بيانات الشحنة</h3>
                  <p className="text-gray-600">أدخل قيمة البضاعة، الوزن، ونوع المنتج</p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  2
                </div>
                <div className="mt-8 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Globe className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">اختر بلد المنشأ</h3>
                  <p className="text-gray-600">حدد الدولة التي ستستورد منها البضاعة</p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  3
                </div>
                <div className="mt-8 text-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">احصل على النتائج</h3>
                  <p className="text-gray-600">شاهد تفصيل كامل للتكاليف المتوقعة فوراً</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}></div>
        </div>

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              جاهز لحساب تكاليف استيرادك؟
            </h2>
            <p className="text-xl text-blue-100 mb-10">
              استخدم نظامنا المتكامل الآن واحصل على تقدير دقيق لجميع التكاليف المتوقعة
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/calculator">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 group">
                  <Calculator className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                  احسب التكاليف الآن
                  <ArrowRight className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/customs-declaration">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-700 transition-all duration-300">
                  <FileText className="w-5 h-5 ml-2" />
                  البيان الجمركي
                </Button>
              </Link>
              <Link href="/container-tracking">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-700 transition-all duration-300">
                  <Package className="w-5 h-5 ml-2" />
                  تتبع الحاويات
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Column 1 */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">نظام الجمارك الأردني</h3>
              <p className="text-sm leading-relaxed">
                نظام متكامل لحساب تكاليف الشحن والجمارك مع تتبع الحاويات والبيانات الجمركية الذكية.
              </p>
            </div>

            {/* Column 2 - Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/calculator" className="hover:text-white transition-colors">
                    حاسبة التكاليف
                  </Link>
                </li>
                <li>
                  <Link href="/customs-declaration" className="hover:text-white transition-colors">
                    البيان الجمركي
                  </Link>
                </li>
                <li>
                  <Link href="/container-tracking" className="hover:text-white transition-colors">
                    تتبع الحاويات
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    لوحة التحكم
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - About */}
            <div>
              <h4 className="text-white font-semibold mb-4">عن النظام</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    من نحن
                  </Link>
                </li>
                <li>
                  <Link href="/developer" className="hover:text-white transition-colors">
                    المطور
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    الأسعار والخطط
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 - Legal & Contact */}
            <div>
              <h4 className="text-white font-semibold mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-sm">
                <li>سعد النابلسي</li>
                <li dir="ltr">00962795917424</li>
                <li className="break-all">saad.building.materials1@gmail.com</li>
              </ul>
              <div className="mt-4">
                <Link href="/privacy" className="hover:text-white transition-colors text-sm block mb-2">
                  سياسة الخصوصية
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors text-sm block">
                  شروط الاستخدام
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2026 نظام إدارة تكاليف الشحن والجمارك الأردنية. جميع الحقوق محفوظة.</p>
            <p className="mt-2 text-gray-500">
              تنويه: هذا النظام يوفر تقديرات تقريبية. يُرجى التحقق من الرسوم الفعلية مع الجمارك الأردنية.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

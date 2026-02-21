import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Package, TrendingUp, Shield, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 to-slate-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-block">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
              <Shield className="w-4 h-4" />
              نظام موثوق ودقيق
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
            احسب تكاليف الشحن
            <br />
            <span className="text-blue-600 dark:text-blue-400">والجمارك الأردنية</span>
            <br />
            بدقة وسهولة
          </h1>
          
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            نظام متكامل لحساب تكاليف الشحن الدولي والرسوم الجمركية للأردن. احصل على تقديرات دقيقة فورية لتكاليف استيرادك.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                <Package className="w-5 h-5 ml-2" />
                لوحة التحكم
              </Button>
            </Link>
            <Link href="/customs-declaration">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto">
                <Calculator className="w-5 h-5 ml-2" />
                البيان الجمركي
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            لماذا تختار نظامنا؟
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            نوفر لك أدوات احترافية لحساب تكاليف الاستيراد بدقة
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>حسابات دقيقة</CardTitle>
              <CardDescription>
                احسب الرسوم الجمركية وضريبة المبيعات وتكاليف الشحن بدقة عالية وفقاً للقوانين الأردنية
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>نتائج فورية</CardTitle>
              <CardDescription>
                احصل على تقديرات التكاليف في ثوانٍ معدودة دون الحاجة للانتظار أو التعقيدات
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-500 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>تحديثات مستمرة</CardTitle>
              <CardDescription>
                نحدّث قاعدة البيانات باستمرار لتعكس آخر التغييرات في الرسوم والقوانين الجمركية
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-100 dark:bg-slate-900/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              كيف يعمل النظام؟
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              ثلاث خطوات بسيطة للحصول على تقدير دقيق
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                أدخل بيانات الشحنة
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                أدخل قيمة البضاعة، الوزن، ونوع المنتج
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                اختر بلد المنشأ
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                حدد الدولة التي ستستورد منها البضاعة
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                احصل على النتائج
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                شاهد تفصيل كامل للتكاليف المتوقعة فوراً
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/container-tracking">
              <Button size="lg" className="text-lg px-8 py-6">
                <Package className="w-5 h-5 ml-2" />
                تتبع الحاويات
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-4xl font-bold">
              جاهز لحساب تكاليف استيرادك؟
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              استخدم حاسبتنا المجانية الآن واحصل على تقدير دقيق لجميع التكاليف المتوقعة
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/calculator">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 w-full sm:w-auto">
                  <Calculator className="w-5 h-5 ml-2" />
                  احسب التكاليف
                </Button>
              </Link>
              <Link href="/shipments">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50">
                  <Package className="w-5 h-5 ml-2" />
                  إدارة الشحنات
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">نظام الجمارك</h3>
              <p className="text-slate-400 text-sm">
                نظام متكامل لحساب تكاليف الشحن والجمارك الأردنية
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/calculator" className="text-slate-400 hover:text-white transition-colors">حاسبة التكاليف</Link></li>
                <li><Link href="/customs-declaration" className="text-slate-400 hover:text-white transition-colors">البيان الجمركي</Link></li>
                <li><Link href="/container-tracking" className="text-slate-400 hover:text-white transition-colors">تتبع الحاويات</Link></li>
                <li><Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">لوحة التحكم</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">معلومات</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors">من نحن</Link></li>
                <li><Link href="/developer" className="text-slate-400 hover:text-white transition-colors">المطور</Link></li>
                <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">سياسة الخصوصية</Link></li>
                <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors">شروط الاستخدام</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">تواصل معنا</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>سعد النابلسي</li>
                <li dir="ltr">00962795917424</li>
                <li className="break-all">saad.building.materials1@gmail.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-400">
              © 2026 نظام إدارة تكاليف الشحن والجمارك الأردنية. جميع الحقوق محفوظة.
            </p>
            <p className="text-slate-500 text-sm mt-2">
              هذا النظام يوفر تقديرات تقريبية. للحصول على أرقام دقيقة، يرجى مراجعة دائرة الجمارك الأردنية.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

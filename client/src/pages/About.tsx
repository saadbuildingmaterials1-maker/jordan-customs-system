import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Users, Award, TrendingUp } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              من نحن
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              نظام موثوق لحساب تكاليف الشحن والجمارك الأردنية
            </p>
          </div>

          {/* Mission */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="h-6 w-6 text-blue-600" />
                رسالتنا
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 dark:text-slate-300 space-y-4">
              <p>
                نسعى لتوفير نظام احترافي ودقيق يساعد المستوردين والتجار في الأردن على حساب
                التكاليف الجمركية وتكاليف الشحن بدقة وسهولة، مما يساعدهم على اتخاذ قرارات
                مستنيرة في عمليات الاستيراد.
              </p>
              <p>
                نؤمن بأن الشفافية والدقة في حساب التكاليف هي أساس نجاح أي عملية استيراد،
                ولذلك نعمل على توفير أدوات حديثة ومتطورة تلبي احتياجات السوق الأردني.
              </p>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>سهولة الاستخدام</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300">
                واجهة بسيطة وسهلة الاستخدام تمكنك من الحصول على النتائج في ثوانٍ معدودة
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>دقة عالية</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300">
                حسابات دقيقة وفقاً للقوانين واللوائح الجمركية الأردنية المعمول بها
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>تحديثات مستمرة</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-700 dark:text-slate-300">
                نحدّث النظام باستمرار ليواكب آخر التغييرات في الرسوم والقوانين
              </CardContent>
            </Card>
          </div>

          {/* What We Offer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">ما نقدمه</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700 dark:text-slate-300 space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      حاسبة التكاليف الجمركية
                    </h3>
                    <p>
                      احسب الرسوم الجمركية وضريبة المبيعات وتكاليف الشحن بدقة عالية
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      استيراد البيانات الجمركية
                    </h3>
                    <p>
                      استيراد البيانات من ملفات PDF وتوزيع التكاليف تلقائياً على الأصناف
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      تتبع الحاويات والشحنات
                    </h3>
                    <p>
                      تتبع حاوياتك في الوقت الفعلي من الميناء إلى الوصول
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                      لوحة تحكم شاملة
                    </h3>
                    <p>
                      عرض إحصائيات مباشرة وتقارير تفصيلية عن جميع عملياتك
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>ملاحظة مهمة:</strong> هذا النظام يوفر تقديرات تقريبية للتكاليف.
                  للحصول على أرقام دقيقة ونهائية، يرجى مراجعة دائرة الجمارك الأردنية.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

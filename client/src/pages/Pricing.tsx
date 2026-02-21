import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "مجاني",
    price: "0",
    description: "للأفراد والاستخدام الشخصي",
    popular: false,
    features: [
      "حساب تكاليف الشحن الأساسية",
      "تتبع حتى 5 حاويات شهرياً",
      "إنشاء حتى 3 بيانات جمركية شهرياً",
      "دعم عبر البريد الإلكتروني",
    ],
  },
  {
    name: "أساسي",
    price: "29",
    description: "للشركات الصغيرة",
    popular: false,
    features: [
      "جميع ميزات الخطة المجانية",
      "تتبع حتى 50 حاوية شهرياً",
      "بيانات جمركية غير محدودة",
      "تقارير شهرية",
      "دعم ذو أولوية",
      "تصدير PDF للبيانات",
    ],
  },
  {
    name: "احترافي",
    price: "99",
    description: "للشركات المتوسطة",
    popular: true,
    features: [
      "جميع ميزات الخطة الأساسية",
      "تتبع غير محدود للحاويات",
      "استيراد البيانات من PDF تلقائياً",
      "تكامل API",
      "تقارير متقدمة وتحليلات",
      "دعم عبر الهاتف",
      "مدير حساب مخصص",
    ],
  },
  {
    name: "مؤسسي",
    price: "تواصل معنا",
    description: "للشركات الكبيرة",
    popular: false,
    features: [
      "جميع ميزات الخطة الاحترافية",
      "حلول مخصصة حسب الطلب",
      "تدريب للفريق",
      "SLA مخصص",
      "دعم 24/7",
      "تكامل مع أنظمتك الحالية",
      "استشارات جمركية",
    ],
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="container mx-auto px-4 py-16 text-center">
        <Badge className="mb-4" variant="outline">
          الأسعار والخطط
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          اختر الخطة المناسبة لك
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          خطط مرنة تناسب جميع احتياجاتك. ابدأ مجاناً وقم بالترقية عندما تحتاج.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? "border-primary shadow-lg scale-105"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    الأكثر شعبية
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  {plan.price === "تواصل معنا" ? (
                    <div className="text-3xl font-bold">{plan.price}</div>
                  ) : (
                    <div>
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground"> د.أ/شهر</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.price === "تواصل معنا" ? "تواصل معنا" : "ابدأ الآن"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16 border-t">
        <h2 className="text-3xl font-bold text-center mb-12">
          الأسئلة الشائعة
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              هل يمكنني تغيير خطتي لاحقاً؟
            </h3>
            <p className="text-muted-foreground">
              نعم، يمكنك الترقية أو التخفيض في أي وقت. سيتم تطبيق التغييرات فوراً.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              ما هي طرق الدفع المتاحة؟
            </h3>
            <p className="text-muted-foreground">
              نقبل جميع بطاقات الائتمان الرئيسية والتحويل البنكي للخطط المؤسسية.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              هل توجد رسوم إضافية؟
            </h3>
            <p className="text-muted-foreground">
              لا، جميع الأسعار شاملة. لا توجد رسوم خفية أو تكاليف إضافية.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

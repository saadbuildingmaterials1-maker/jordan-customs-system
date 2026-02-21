import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Calendar, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Subscription() {
  // Mock data - في الإنتاج سيتم جلبها من API
  const currentPlan = {
    name: "احترافي",
    price: 99,
    billingCycle: "شهري",
    nextBillingDate: "2026-03-21",
    features: [
      "تتبع غير محدود للحاويات",
      "بيانات جمركية غير محدودة",
      "استيراد من PDF تلقائياً",
      "تكامل API",
      "تقارير متقدمة",
      "دعم عبر الهاتف",
    ],
  };

  const invoices = [
    { id: "INV-001", date: "2026-02-21", amount: 99, status: "مدفوع" },
    { id: "INV-002", date: "2026-01-21", amount: 99, status: "مدفوع" },
    { id: "INV-003", date: "2025-12-21", amount: 99, status: "مدفوع" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">إدارة الاشتراك</h1>
          <p className="text-muted-foreground">
            إدارة خطتك والفواتير والمدفوعات
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">الخطة الحالية</CardTitle>
                    <CardDescription>
                      أنت مشترك في الخطة {currentPlan.name}
                    </CardDescription>
                  </div>
                  <Badge className="bg-primary text-primary-foreground">
                    نشط
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-bold">{currentPlan.price}</span>
                      <span className="text-muted-foreground">د.أ/{currentPlan.billingCycle}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        الدفعة القادمة في {currentPlan.nextBillingDate}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">الميزات المتاحة:</h3>
                    <ul className="space-y-2">
                      {currentPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Link href="/pricing">
                      <Button variant="outline" className="gap-2">
                        <TrendingUp className="h-4 w-4" />
                        ترقية الخطة
                      </Button>
                    </Link>
                    <Button variant="outline" className="text-destructive">
                      إلغاء الاشتراك
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>سجل الفواتير</CardTitle>
                <CardDescription>
                  جميع فواتيرك ومدفوعاتك السابقة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded">
                          <CreditCard className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{invoice.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.date}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">{invoice.amount} د.أ</div>
                          <Badge variant="outline" className="text-xs">
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          تحميل PDF
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الاستخدام</CardTitle>
                <CardDescription>هذا الشهر</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      الحاويات المتتبعة
                    </span>
                    <span className="font-semibold">24 / غير محدود</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-1/4"></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      البيانات الجمركية
                    </span>
                    <span className="font-semibold">18 / غير محدود</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-1/5"></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      الشحنات النشطة
                    </span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-1/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>طريقة الدفع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">•••• •••• •••• 4242</div>
                    <div className="text-sm text-muted-foreground">
                      تنتهي في 12/2027
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  تحديث طريقة الدفع
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

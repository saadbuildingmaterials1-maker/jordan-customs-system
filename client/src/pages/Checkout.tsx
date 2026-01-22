import { useState } from 'react';
import { useLocation } from 'wouter';
import DashboardLayout from '@/components/DashboardLayout';
import { CheckoutForm } from '@/components/CheckoutForm';
import { PaymentMethodsManager } from '@/components/PaymentMethodsManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, CreditCard, History } from 'lucide-react';

export default function Checkout() {
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState('payment');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* رأس الصفحة */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-8 h-8" />
            الدفع والفواتير
          </h1>
          <p className="text-gray-600 mt-2">
            إدارة عمليات الدفع والفواتير والاشتراكات
          </p>
        </div>

        {/* التبويبات */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">الدفع الآن</span>
            </TabsTrigger>
            <TabsTrigger value="methods" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">طرق الدفع</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">السجل</span>
            </TabsTrigger>
          </TabsList>

          {/* تبويب الدفع */}
          <TabsContent value="payment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* نموذج الدفع */}
              <div className="lg:col-span-2">
                <CheckoutForm
                  amount={100}
                  currency="JOD"
                  description="رسوم جمركية - بيان رقم 001"
                  onSuccess={() => {
                    navigate('/payments');
                  }}
                />
              </div>

              {/* ملخص الطلب */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>ملخص الطلب</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">المبلغ الأساسي:</span>
                        <span className="font-medium">100.00 JOD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">الضريبة:</span>
                        <span className="font-medium">0.00 JOD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">الرسوم:</span>
                        <span className="font-medium">0.00 JOD</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-medium">الإجمالي:</span>
                        <span className="text-lg font-bold text-blue-600">
                          100.00 JOD
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                      <p className="font-medium mb-1">💡 نصيحة:</p>
                      <p>
                        استخدم بطاقة الاختبار 4242 4242 4242 4242 للاختبار
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* معلومات الأمان */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-base">الأمان</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>🔒</span>
                      <span>تشفير SSL 256-bit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✓</span>
                      <span>معايير PCI DSS</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🛡️</span>
                      <span>حماية من الاحتيال</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* تبويب طرق الدفع */}
          <TabsContent value="methods">
            <PaymentMethodsManager />
          </TabsContent>

          {/* تبويب السجل */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>سجل الدفعات</CardTitle>
                <CardDescription>
                  جميع عمليات الدفع والفواتير السابقة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد دفعات سابقة</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

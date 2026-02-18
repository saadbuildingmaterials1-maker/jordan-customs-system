import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Shield, Zap, Clock } from 'lucide-react';
import { PaymentGatewaySelector } from '@/components/PaymentGatewaySelector';
import { PaymentForm, PaymentFormData } from '@/components/PaymentForm';
import { trpc } from '@/lib/trpc';
import { CreditCard, Banknote } from 'lucide-react';

interface PaymentGateway {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  currencies: string[];
  isActive: boolean;
  color: string;
}

export default function LocalPaymentPage() {
  const [, setLocation] = useLocation();
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // جلب البوابات المدعومة
  const { data: supportedGateways, isLoading: isLoadingGateways } = trpc.localPaymentGateway.getSupportedGateways.useQuery();

  const gateways: PaymentGateway[] = [
    {
      id: 'hyperpay',
      name: 'HyperPay',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'بوابة دفع آمنة بالدينار الأردني',
      currencies: ['JOD', 'USD', 'EUR'],
      isActive: true,
      color: 'from-blue-600 to-blue-700',
    },
    {
      id: 'telr',
      name: 'Telr',
      icon: <Banknote className="w-6 h-6" />,
      description: 'خدمة دفع محلية أردنية موثوقة',
      currencies: ['JOD', 'USD', 'EUR', 'AED'],
      isActive: true,
      color: 'from-green-600 to-green-700',
    },
  ];

  const handlePaymentSubmit = async (formData: PaymentFormData) => {
    if (!selectedGateway) {
      setError('يرجى اختيار طريقة دفع');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (selectedGateway === 'hyperpay') {
        // محاكاة إنشاء طلب دفع عبر HyperPay
        const response = await trpc.localPaymentGateway.createHyperPayPayment.mutate({
          amount: formData.amount,
          currency: formData.currency as 'JOD' | 'USD' | 'EUR',
          orderId: `ORD-${Date.now()}`,
          description: formData.description,
        });

        if (response.success && response.paymentUrl) {
          setSuccess(true);
          setTimeout(() => {
            window.location.href = response.paymentUrl!;
          }, 2000);
        } else {
          setError(response.message || 'فشل إنشاء طلب الدفع');
        }
      } else if (selectedGateway === 'telr') {
        // محاكاة إنشاء طلب دفع عبر Telr
        const response = await trpc.localPaymentGateway.createTelrPayment.mutate({
          amount: formData.amount,
          currency: formData.currency as 'JOD' | 'USD' | 'EUR' | 'AED',
          orderId: `ORD-${Date.now()}`,
          description: formData.description,
        });

        if (response.success && response.paymentUrl) {
          setSuccess(true);
          setTimeout(() => {
            window.location.href = response.paymentUrl!;
          }, 2000);
        } else {
          setError(response.message || 'فشل إنشاء طلب الدفع');
        }
      }
    } catch (err) {
      setError('حدث خطأ أثناء معالجة الطلب');
      console.error('Payment Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            بوابة الدفع المحلية
          </h1>
          <div className="w-10" />
        </div>

        {/* الوصف */}
        <div className="text-center space-y-2">
          <p className="text-lg text-gray-600 dark:text-gray-400">
            اختر من بين بوابات الدفع المحلية الموثوقة والآمنة
          </p>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* العمود الأيسر - اختيار البوابة والنموذج */}
          <div className="lg:col-span-2 space-y-6">
            {/* اختيار البوابة */}
            <PaymentGatewaySelector
              gateways={gateways}
              selectedGateway={selectedGateway}
              onSelectGateway={setSelectedGateway}
              isLoading={isLoadingGateways}
            />

            {/* نموذج الدفع */}
            {selectedGateway && (
              <PaymentForm
                onSubmit={handlePaymentSubmit}
                isLoading={isLoading}
                error={error}
                success={success}
                selectedGateway={selectedGateway}
              />
            )}
          </div>

          {/* العمود الأيمن - المعلومات */}
          <div className="space-y-4">
            {/* ملخص الميزات */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">لماذا نختار هذه البوابات؟</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      آمن 100%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      تشفير SSL 256-bit
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      فوري
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      معالجة فورية للدفع
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      دعم 24/7
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      فريق دعم متاح دائماً
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* معلومات إضافية */}
            <Card className="border-2 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">معلومات مهمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    العملات المدعومة:
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    JOD, USD, EUR, AED
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    الحد الأدنى:
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    0.10 JOD
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    الحد الأقصى:
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    1,000,000 JOD
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* الفوتر */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p>
            هل تواجه مشكلة؟{' '}
            <a href="/support" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              اتصل بالدعم الفني
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

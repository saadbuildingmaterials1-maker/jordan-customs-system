/**
 * Advanced Payment Page
 * صفحة الدفع المتقدمة
 * 
 * تدعم:
 * - Click (كليك)
 * - Alipay (الباي الصيني)
 * - PayPal
 */

import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AdvancedPaymentGateway } from '@/components/AdvancedPaymentGateway';
import { CheckCircle2, AlertCircle, Clock, ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface PaymentPageProps {
  orderId?: string;
  amount?: number;
  currency?: string;
  description?: string;
}

export const AdvancedPaymentPage: React.FC<any> = (props) => {
  const {
    orderId = '',
    amount = 0,
    currency = 'JOD',
    description = 'دفع الاشتراك أو الخدمات',
  } = props as PaymentPageProps;
  const [, setLocation] = useLocation();
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentMessage, setPaymentMessage] = useState<string>('');

  // Fetch payment details if orderId is provided
  const { data: paymentDetails, isLoading: isLoadingDetails } = trpc.localPaymentGateways.getSupportedGateways.useQuery(
    undefined,
    { enabled: !!orderId }
  );

  const handlePaymentSelect = (gateway: string, method: string) => {
    setSelectedGateway(gateway);
    setPaymentStatus('processing');
    setPaymentMessage(`جاري معالجة الدفع عبر ${method}...`);

    // Simulate payment processing
    setTimeout(() => {
      setPaymentStatus('success');
      setPaymentMessage(`تم إنشاء طلب الدفع بنجاح! رقم الطلب: ${orderId || 'N/A'}`);
    }, 2000);
  };

  const handleRetry = () => {
    setPaymentStatus('idle');
    setSelectedGateway(null);
    setPaymentMessage('');
  };

  const handleGoBack = () => {
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            بوابة الدفع الآمنة
          </h1>
          <div className="w-10" />
        </div>

        {/* Payment Status */}
        {paymentStatus !== 'idle' && (
          <Alert className={`border-2 ${
            paymentStatus === 'success'
              ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
              : paymentStatus === 'error'
              ? 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
              : 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'
          }`}>
            {paymentStatus === 'success' && (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-300">
                  نجح!
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-400">
                  {paymentMessage}
                </AlertDescription>
              </>
            )}
            {paymentStatus === 'processing' && (
              <>
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                <AlertTitle className="text-blue-800 dark:text-blue-300">
                  جاري المعالجة...
                </AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-400">
                  {paymentMessage}
                </AlertDescription>
              </>
            )}
            {paymentStatus === 'error' && (
              <>
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-300">
                  خطأ!
                </AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-400">
                  {paymentMessage}
                </AlertDescription>
              </>
            )}
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Gateway */}
          <div className="lg:col-span-2">
            {paymentStatus === 'idle' ? (
              <AdvancedPaymentGateway
                amount={amount}
                currency={currency}
                orderId={orderId}
                onPaymentSelect={handlePaymentSelect}
              />
            ) : (
              <Card className="border-2 border-gray-200 dark:border-gray-700">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <CardTitle>تفاصيل الطلب</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-gray-600 dark:text-gray-400">رقم الطلب:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {orderId || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-gray-600 dark:text-gray-400">المبلغ:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {amount.toLocaleString()} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b">
                      <span className="text-gray-600 dark:text-gray-400">الوصف:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {description}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">البوابة:</span>
                      <Badge className="bg-blue-600 hover:bg-blue-700">
                        {selectedGateway?.toUpperCase() || 'N/A'}
                      </Badge>
                    </div>
                  </div>

                  {paymentStatus === 'success' && (
                    <div className="pt-4 space-y-3">
                      <Button
                        onClick={() => setLocation('/dashboard')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        العودة إلى لوحة التحكم
                      </Button>
                      <Button
                        onClick={handleRetry}
                        variant="outline"
                        className="w-full"
                      >
                        إجراء دفع جديد
                      </Button>
                    </div>
                  )}

                  {paymentStatus === 'processing' && (
                    <div className="pt-4">
                      <Button disabled className="w-full">
                        جاري المعالجة...
                      </Button>
                    </div>
                  )}

                  {paymentStatus === 'error' && (
                    <div className="pt-4 space-y-3">
                      <Button
                        onClick={handleRetry}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        إعادة المحاولة
                      </Button>
                      <Button
                        onClick={handleGoBack}
                        variant="outline"
                        className="w-full"
                      >
                        إلغاء
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Payment Summary */}
          <div className="space-y-4">
            {/* Order Summary */}
            <Card className="border-2 border-gray-200 dark:border-gray-700 sticky top-4">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                <CardTitle className="text-lg">ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">المبلغ الأساسي:</span>
                    <span className="font-semibold">{amount.toLocaleString()} {currency}</span>
                  </div>
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>الخصم (إن وجد):</span>
                    <span>0.00 {currency}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>الإجمالي:</span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {amount.toLocaleString()} {currency}
                    </span>
                  </div>
                </div>

                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                  <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm">
                    جميع المعاملات محمية بتشفير SSL 256-bit
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Supported Gateways */}
            <Card className="border-2 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">البوابات المدعومة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full" />
                    <span className="text-sm font-medium">Click (كليك)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm font-medium">Alipay (الباي الصيني)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-700 rounded-full" />
                    <span className="text-sm font-medium">PayPal</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-6 border-t">
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
};

export default AdvancedPaymentPage;

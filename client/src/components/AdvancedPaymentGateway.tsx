/**
 * Advanced Payment Gateway Component
 * مكون واجهة الدفع المتقدمة
 * 
 * يدعم:
 * - Click (كليك) - بنك الأردن
 * - Alipay (الباي الصيني)
 * - QR Codes قابلة للمسح
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Copy, Check, QrCode, CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  qrCode: string;
  accountName: string;
  accountInfo: string;
  countries: string[];
  currencies: string[];
  color: string;
}

interface AdvancedPaymentGatewayProps {
  amount?: number;
  currency?: string;
  orderId?: string;
  onPaymentSelect?: (gateway: string, method: string) => void;
}

export const AdvancedPaymentGateway: React.FC<AdvancedPaymentGatewayProps> = ({
  amount = 0,
  currency = 'JOD',
  orderId = '',
  onPaymentSelect,
}) => {
  const [selectedGateway, setSelectedGateway] = useState<string>('click');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState<boolean>(true);

  const paymentOptions: PaymentOption[] = [
    {
      id: 'click',
      name: 'Click (كليك)',
      description: 'بنك الأردن - نظام الدفع الفوري',
      icon: (
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
          💳
        </div>
      ),
      qrCode: '/upload/1.jpeg', // PayPal QR Code
      accountName: 'Saad Saad aldeen',
      accountInfo: 'مسح ضوئي للدفع لحساب Saad Saad aldeen',
      countries: ['Jordan', 'Kuwait', 'UAE'],
      currencies: ['JOD', 'KWD', 'AED', 'USD'],
      color: 'from-blue-600 to-blue-700',
    },
    {
      id: 'alipay',
      name: 'Alipay (الباي الصيني)',
      description: 'نظام الدفع الصيني - Alipay',
      icon: (
        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
          支
        </div>
      ),
      qrCode: '/upload/2.jpeg', // Alipay QR Code
      accountName: 'ALDEEN SAED AHMAD GHAZI',
      accountInfo: 'مسح ضوئي للدفع عبر Alipay',
      countries: ['China', 'Global'],
      currencies: ['CNY', 'USD', 'EUR', 'AED'],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'نظام الدفع العالمي - PayPal',
      icon: (
        <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
          P
        </div>
      ),
      qrCode: '/upload/1.jpeg', // PayPal QR Code (نفس الأول)
      accountName: 'Saad Saad aldeen',
      accountInfo: 'مسح ضوئي للدفع عبر PayPal',
      countries: ['Global', 'Worldwide'],
      currencies: ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'KWD', 'JOD'],
      color: 'from-blue-700 to-blue-800',
    },
  ];

  const selectedOption = paymentOptions.find((opt) => opt.id === selectedGateway);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handlePaymentSelect = () => {
    if (onPaymentSelect) {
      onPaymentSelect(selectedGateway, selectedOption?.name || '');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            اختر طريقة الدفع
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            اختر من بين الطرق الآمنة والموثوقة للدفع
          </p>
          {amount > 0 && (
            <div className="pt-2">
              <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg font-semibold">
                المبلغ المستحق: {amount.toLocaleString()} {currency}
              </div>
            </div>
          )}
        </div>

        {/* Payment Options Tabs */}
        <Tabs value={selectedGateway} onValueChange={setSelectedGateway} className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-4 h-auto p-2 bg-gray-100 dark:bg-gray-800">
            {paymentOptions.map((option) => (
              <TabsTrigger
                key={option.id}
                value={option.id}
                className="flex flex-col items-center gap-2 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
              >
                {option.icon}
                <span className="text-sm font-semibold">{option.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {paymentOptions.map((option) => (
            <TabsContent key={option.id} value={option.id} className="space-y-6">
              {/* Payment Method Card */}
              <Card className="border-2 border-gray-200 dark:border-gray-700">
                <CardHeader className={`bg-gradient-to-r ${option.color} text-white`}>
                  <CardTitle className="flex items-center gap-3">
                    {option.icon}
                    {option.name}
                  </CardTitle>
                  <CardDescription className="text-gray-100">
                    {option.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* QR Code Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <QrCode className="w-5 h-5" />
                        رمز الدفع السريع
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowQRCode(!showQRCode)}
                      >
                        {showQRCode ? 'إخفاء' : 'عرض'}
                      </Button>
                    </div>

                    {showQRCode && (
                      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <div className="relative">
                          <img
                            src={option.qrCode}
                            alt={`${option.name} QR Code`}
                            className="w-64 h-64 object-contain rounded-lg shadow-lg"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white font-semibold text-sm">
                              امسح الرمز بكاميرا هاتفك
                            </span>
                          </div>
                        </div>
                        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                          {option.accountInfo}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Account Information */}
                  <div className="space-y-3 border-t pt-6">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      بيانات الحساب
                    </h3>

                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            اسم صاحب الحساب
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {option.accountName}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(option.accountName, 'accountName')}
                          className="gap-2"
                        >
                          {copiedText === 'accountName' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Supported Countries & Currencies */}
                  <div className="grid grid-cols-2 gap-4 border-t pt-6">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        الدول المدعومة
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {option.countries.map((country) => (
                          <span
                            key={country}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                          >
                            {country}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        العملات المدعومة
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {option.currencies.map((curr) => (
                          <span
                            key={curr}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-medium"
                          >
                            {curr}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Security Alert */}
                  <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                    <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-300">
                      جميع المعاملات محمية بتشفير SSL 256-bit وتوثيق ثنائي العامل (2FA)
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Payment Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">خطوات الدفع</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3 list-decimal list-inside">
                    <li className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">امسح رمز الاستجابة السريعة (QR Code)</span>
                      {' '}باستخدام كاميرا هاتفك الذكي
                    </li>
                    <li className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">أدخل المبلغ المستحق:</span>
                      {' '}{amount.toLocaleString()} {currency}
                    </li>
                    <li className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">أكمل عملية الدفع</span>
                      {' '}في تطبيق {option.name}
                    </li>
                    <li className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">احتفظ برقم المرجع</span>
                      {' '}للتحقق من الدفع
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pt-4">
          <Button
            onClick={handlePaymentSelect}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg font-semibold text-lg"
          >
            متابعة الدفع عبر {selectedOption?.name}
          </Button>
          <Button
            variant="outline"
            className="px-8 py-3 rounded-lg font-semibold text-lg"
          >
            إلغاء
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            هل تواجه مشكلة في الدفع؟{' '}
            <a href="/support" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
              اتصل بالدعم الفني
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPaymentGateway;

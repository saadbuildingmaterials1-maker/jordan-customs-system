/**
 * Click Payment Services Page
 * صفحة خدمات الدفع الفوري (Click)
 * 
 * تدعم:
 * - Qatar Airways Click Payment
 * - SAADBOOST (بنك الأردن)
 * - خدمات Click أخرى
 * - تحويل فوري
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';

interface ClickService {
  id: string;
  name: string;
  icon: string;
  category: string;
  color: string;
  description: string;
  website?: string;
  features: string[];
}

interface PaymentDetails {
  serviceId: string;
  amount: string | number;
  accountNumber: string;
  accountHolder: string;
  reference: string;
}

const clickServices: ClickService[] = [
  {
    id: 'saadboos',
    name: 'SAADBOOS',
    icon: '🏦',
    category: 'bank',
    color: 'bg-gradient-to-br from-blue-600 to-blue-800',
    description: 'خدمة الدفع الفوري من بنك الأردن',
    website: 'https://www.bankaudi.com.jo',
    features: [
      'تحويل فوري للحسابات',
      'دفع الفواتير',
      'سحب الأموال',
      'رسوم منخفضة'
    ]
  },
  {
    id: 'emirates-airlines',
    name: 'Emirates Airlines',
    icon: '✈️',
    category: 'airline',
    color: 'bg-gradient-to-br from-red-600 to-red-800',
    description: 'نظام الدفع الفوري من الإمارات',
    features: [
      'حجز تذاكر الطيران',
      'دفع فوري وآمن',
      'تأكيد فوري للحجز',
      'برنامج الأميال'
    ]
  },
  {
    id: 'etisalat',
    name: 'Etisalat',
    icon: '📱',
    category: 'telecom',
    color: 'bg-gradient-to-br from-red-500 to-orange-600',
    description: 'خدمة الدفع الفوري من اتصالات',
    features: [
      'دفع فواتير الهاتف',
      'شحن الرصيد',
      'دفع الإنترنت',
      'خدمات إضافية'
    ]
  },
  {
    id: 'zain',
    name: 'Zain',
    icon: '📱',
    category: 'telecom',
    color: 'bg-gradient-to-br from-orange-500 to-yellow-600',
    description: 'خدمة الدفع الفوري من زين',
    features: [
      'دفع فواتير الهاتف',
      'شحن الرصيد',
      'دفع الإنترنت',
      'خدمات إضافية'
    ]
  },
  {
    id: 'umniah',
    name: 'Umniah',
    icon: '📱',
    category: 'telecom',
    color: 'bg-gradient-to-br from-green-500 to-teal-600',
    description: 'خدمة الدفع الفوري من أمنية',
    features: [
      'دفع فواتير الهاتف',
      'شحن الرصيد',
      'دفع الإنترنت',
      'خدمات إضافية'
    ]
  }
];

export default function ClickPayment() {
  const [, setLocation] = useLocation();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    serviceId: '',
    amount: '100',
    accountNumber: '',
    accountHolder: '',
    reference: ''
  });
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const selected = clickServices.find(s => s.id === selectedService);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setPaymentDetails({
      ...paymentDetails,
      serviceId: serviceId
    });
  };

  const validatePayment = (): boolean => {
    if (!selectedService) {
      setStatusMessage('يرجى اختيار خدمة');
      return false;
    }
    if (!paymentDetails.amount || parseFloat(paymentDetails.amount.toString()) <= 0) {
      setStatusMessage('يرجى إدخال مبلغ صحيح');
      return false;
    }
    if (!paymentDetails.accountNumber) {
      setStatusMessage('يرجى إدخال رقم الحساب');
      return false;
    }
    if (!paymentDetails.accountHolder) {
      setStatusMessage('يرجى إدخال اسم صاحب الحساب');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validatePayment()) {
      setPaymentStatus('error');
      return;
    }

    setPaymentStatus('processing');
    setStatusMessage('جاري معالجة الدفع...');

    // محاكاة معالجة الدفع
    setTimeout(() => {
      setPaymentStatus('success');
      setStatusMessage(`تم الدفع بنجاح! المبلغ: ${paymentDetails.amount} JOD`);
      
      // إعادة تعيين النموذج بعد 3 ثوان
      setTimeout(() => {
        setPaymentDetails({
          serviceId: '',
          amount: '100',
          accountNumber: '',
          accountHolder: '',
          reference: ''
        });
        setSelectedService(null);
        setPaymentStatus('idle');
      }, 3000);
    }, 2000);
  };

  const handleVisitWebsite = (website?: string) => {
    if (website) {
      window.open(website, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
            className="mb-4"
          >
            ← العودة للرئيسية
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            ⚡ خدمات الدفع الفوري (Click)
          </h1>
          <p className="text-gray-600">
            اختر خدمة الدفع الفوري المفضلة لديك وأتمم عملية الدفع بسهولة
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Services List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              الخدمات المتاحة
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {clickServices.map((service) => (
                <Card
                  key={service.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedService === service.id
                      ? 'ring-2 ring-blue-500 shadow-lg'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleServiceSelect(service.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${service.color} text-white p-2 rounded-lg text-2xl`}>
                      {service.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{service.name}</h3>
                      <p className="text-xs text-gray-600">{service.category}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="space-y-6">
                {/* Service Details */}
                <Card className="p-6 bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selected.icon} {selected.name}
                      </h2>
                      <p className="text-gray-600">{selected.description}</p>
                    </div>
                    {selected.website && (
                      <Button
                        onClick={() => handleVisitWebsite(selected.website)}
                        variant="outline"
                        className="whitespace-nowrap"
                      >
                        🌐 زيارة الموقع
                      </Button>
                    )}
                  </div>

                  {/* Features */}
                  <div className="grid md:grid-cols-2 gap-2">
                    {selected.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-green-600">✓</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Payment Form */}
                <Card className="p-6 bg-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    تفاصيل الدفع
                  </h3>

                  <div className="space-y-4">
                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        المبلغ (JOD)
                      </label>
                      <input
                        type="number"
                        value={paymentDetails.amount}
                        onChange={(e) =>
                          setPaymentDetails({
                            ...paymentDetails,
                            amount: e.target.value || '0'
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="أدخل المبلغ"
                      />
                    </div>

                    {/* Account Number */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        رقم الحساب / الهاتف
                      </label>
                      <input
                        type="text"
                        value={paymentDetails.accountNumber}
                        onChange={(e) =>
                          setPaymentDetails({
                            ...paymentDetails,
                            accountNumber: e.target.value
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="أدخل رقم الحساب أو الهاتف"
                      />
                    </div>

                    {/* Account Holder */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        اسم صاحب الحساب
                      </label>
                      <input
                        type="text"
                        value={paymentDetails.accountHolder}
                        onChange={(e) =>
                          setPaymentDetails({
                            ...paymentDetails,
                            accountHolder: e.target.value
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="أدخل الاسم الكامل"
                      />
                    </div>

                    {/* Reference */}
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        رقم المرجع (اختياري)
                      </label>
                      <input
                        type="text"
                        value={paymentDetails.reference}
                        onChange={(e) =>
                          setPaymentDetails({
                            ...paymentDetails,
                            reference: e.target.value
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="رقم الفاتورة أو الحجز"
                      />
                    </div>

                    {/* Status Message */}
                    {statusMessage && (
                      <div
                        className={`p-4 rounded-lg ${
                          paymentStatus === 'success'
                            ? 'bg-green-50 border border-green-200 text-green-800'
                            : paymentStatus === 'error'
                            ? 'bg-red-50 border border-red-200 text-red-800'
                            : 'bg-blue-50 border border-blue-200 text-blue-800'
                        }`}
                      >
                        {paymentStatus === 'success' && '✓ '}
                        {paymentStatus === 'error' && '✗ '}
                        {paymentStatus === 'processing' && '⏳ '}
                        {statusMessage}
                      </div>
                    )}

                    {/* Payment Button */}
                    <Button
                      onClick={handlePayment}
                      disabled={paymentStatus === 'processing'}
                      className={`w-full py-3 font-bold text-lg ${
                        paymentStatus === 'processing'
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {paymentStatus === 'processing' ? (
                        <>⏳ جاري المعالجة...</>
                      ) : (
                        <>💳 دفع {paymentDetails.amount} JOD</>
                      )}
                    </Button>
                  </div>
                </Card>

                {/* Security Info */}
                <Card className="p-4 bg-green-50 border border-green-200">
                  <div className="space-y-2 text-sm text-green-800">
                    <p>✓ تشفير SSL 256-bit</p>
                    <p>✓ معايير أمان دولية</p>
                    <p>✓ حماية من الاحتيال</p>
                    <p>✓ لن نحفظ بيانات حسابك</p>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-12 flex items-center justify-center min-h-96">
                <div className="text-center">
                  <p className="text-gray-600 text-lg mb-4">
                    اختر خدمة من اليسار لعرض نموذج الدفع
                  </p>
                  <p className="text-gray-500 text-sm">
                    جميع الخدمات آمنة وموثوقة
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-2">⚡ دفع فوري</h3>
            <p className="text-sm text-gray-600">
              معالجة فورية للدفع بدون تأخير
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-2">🔒 آمن وموثوق</h3>
            <p className="text-sm text-gray-600">
              أعلى معايير الأمان والحماية
            </p>
          </Card>
          <Card className="p-4">
            <h3 className="font-bold text-gray-900 mb-2">📱 متعدد الخدمات</h3>
            <p className="text-sm text-gray-600">
              خدمات متنوعة من شركات موثوقة
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

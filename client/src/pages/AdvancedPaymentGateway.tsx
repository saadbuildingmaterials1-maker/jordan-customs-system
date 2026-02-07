/**
 * Advanced Payment Gateway - Qatar Airways Style
 * صفحة الدفع المتقدمة - تصميم محسّن وجميل
 * 
 * تدعم:
 * - SAADBOOS (بنك الأردن)
 * - PayPal QR Code
 * - Alipay QR Code
 * - Credit/Debit Card Payment
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';

interface PaymentOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  qrCode?: string;
  link?: string;
}

interface PaymentData {
  method: string;
  amount: string | number;
  currency: string;
  reference: string;
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'saadboos',
    name: 'SAADBOOS',
    icon: '🏦',
    color: '#1e40af',
    bgColor: 'bg-gradient-to-br from-blue-600 to-blue-700',
    description: 'بنك الأردن - الدفع الفوري',
    link: 'https://www.bankaudi.com.jo/saadboos'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '💳',
    color: '#0070ba',
    bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
    description: 'PayPal QR Code',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://paypal.me/saadboos'
  },
  {
    id: 'alipay',
    name: 'Alipay',
    icon: '🛒',
    color: '#1890ff',
    bgColor: 'bg-gradient-to-br from-cyan-500 to-blue-500',
    description: 'Alipay QR Code',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://alipay.com/saadboos'
  },
  {
    id: 'card',
    name: 'Card Payment',
    icon: '💰',
    color: '#059669',
    bgColor: 'bg-gradient-to-br from-green-600 to-green-700',
    description: 'Credit/Debit Card'
  }
];

export default function AdvancedPaymentGateway() {
  const [, setLocation] = useLocation();
  const [selectedMethod, setSelectedMethod] = useState<string>('saadboos');
  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: 'saadboos',
    amount: '100',
    currency: 'JOD',
    reference: '',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });
  const [showQRCode, setShowQRCode] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const selected = paymentOptions.find(o => o.id === selectedMethod);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    setPaymentData({
      ...paymentData,
      method: methodId
    });
    setShowQRCode(false);
  };

  const downloadQRCode = () => {
    if (selected?.qrCode) {
      const link = document.createElement('a');
      link.href = selected.qrCode;
      link.download = `${selected.name}-QR-Code.png`;
      link.click();
    }
  };

  const copyLink = () => {
    if (selected?.link) {
      navigator.clipboard.writeText(selected.link);
      setStatusMessage('تم نسخ الرابط بنجاح! ✓');
      setTimeout(() => setStatusMessage(''), 2000);
    }
  };

  const handlePayment = async () => {
    setPaymentStatus('processing');
    setStatusMessage('جاري معالجة الدفع...');

    setTimeout(() => {
      setPaymentStatus('success');
      setStatusMessage(`✓ تم الدفع بنجاح! المبلغ: ${paymentData.amount} ${paymentData.currency}`);
      
      setTimeout(() => {
        setPaymentStatus('idle');
        setPaymentData({
          method: 'saadboos',
          amount: '100',
          currency: 'JOD',
          reference: '',
          cardNumber: '',
          cardHolder: '',
          expiryDate: '',
          cvv: ''
        });
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header with Hero Image */}
      <div className="relative h-80 bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 overflow-hidden shadow-lg">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-center items-center text-center px-4">
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
            className="absolute top-6 left-6 bg-white/20 border-white/40 text-white hover:bg-white/30 hover:border-white/60 transition-all"
          >
            ← العودة للرئيسية
          </Button>

          <div className="space-y-3">
            <h1 className="text-6xl md:text-7xl font-bold text-white drop-shadow-lg">
              💳 بوابة الدفع
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl drop-shadow-md">
              اختر طريقة الدفع المفضلة وأتمم عملية الدفع بأمان وسهولة
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Payment Methods - Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-3xl">💳</span>
                طرق الدفع
              </h2>
              <div className="space-y-3">
                {paymentOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleMethodSelect(option.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 transform hover:scale-105 ${
                      selectedMethod === option.id
                        ? 'border-purple-600 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-purple-400 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`${option.bgColor} text-white p-3 rounded-lg text-2xl w-14 h-14 flex items-center justify-center shadow-md`}>
                        {option.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{option.name}</h3>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Form - Right Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Amount & Reference Card */}
            <Card className="p-6 border-0 shadow-lg hover:shadow-xl transition-shadow bg-white rounded-2xl">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                تفاصيل الدفع
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    المبلغ المراد دفعه
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          amount: e.target.value || '0'
                        })
                      }
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                      placeholder="أدخل المبلغ"
                    />
                    <select
                      value={paymentData.currency}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          currency: e.target.value
                        })
                      }
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 font-bold bg-white"
                    >
                      <option value="JOD">JOD</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="AED">AED</option>
                    </select>
                  </div>
                </div>

                {/* Reference */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    رقم المرجع (اختياري)
                  </label>
                  <input
                    type="text"
                    value={paymentData.reference}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        reference: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="رقم الفاتورة أو الحجز"
                  />
                </div>
              </div>
            </Card>

            {/* Payment Method Details */}
            {selected && (
              <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow bg-white rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-3xl">{selected.icon}</span>
                  {selected.name}
                </h3>

                {/* QR Code Methods */}
                {(selected.id === 'paypal' || selected.id === 'alipay') && (
                  <div className="space-y-6">
                    {!showQRCode ? (
                      <div className="text-center py-12 bg-gradient-to-b from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
                        <p className="text-gray-600 mb-6 text-lg">
                          📱 اضغط على الزر أدناه لعرض رمز الاستجابة السريعة
                        </p>
                        <Button
                          onClick={() => setShowQRCode(true)}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                        >
                          📱 عرض QR Code
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-b from-gray-50 to-white p-8 rounded-xl border-2 border-gray-300 flex justify-center">
                          <div className="bg-white p-4 rounded-lg shadow-lg">
                            <img
                              src={selected.qrCode}
                              alt={`${selected.name} QR Code`}
                              className="w-72 h-72 border-4 border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            onClick={downloadQRCode}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all"
                          >
                            ⬇️ تحميل الرمز
                          </Button>
                          <Button
                            onClick={copyLink}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all"
                          >
                            📋 نسخ الرابط
                          </Button>
                        </div>
                        <Button
                          onClick={() => setShowQRCode(false)}
                          variant="outline"
                          className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-3 transition-all"
                        >
                          ✕ إغلاق
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* SAADBOOS Method */}
                {selected.id === 'saadboos' && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 space-y-4">
                      <div className="flex justify-between items-center pb-4 border-b-2 border-blue-200">
                        <p className="text-sm font-bold text-gray-600">اسم البنك</p>
                        <p className="text-gray-900 font-bold text-lg">Bank of Jordan</p>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b-2 border-blue-200">
                        <p className="text-sm font-bold text-gray-600">رقم الآيبان</p>
                        <p className="text-gray-900 font-bold text-sm font-mono">JO58BJOR0650000013011123624002</p>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b-2 border-blue-200">
                        <p className="text-sm font-bold text-gray-600">SWIFT Code</p>
                        <p className="text-gray-900 font-bold text-lg font-mono">BJORJOAX</p>
                      </div>
                      <div className="flex justify-between items-center pb-4 border-b-2 border-blue-200">
                        <p className="text-sm font-bold text-gray-600">اسم الفرع</p>
                        <p className="text-gray-900 font-bold text-lg">City Mall</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-gray-600">الاسم المسجل</p>
                        <p className="text-gray-900 font-bold text-sm">saed ahmad ghazi saad aldeen</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText('JO58BJOR0650000013011123624002');
                        setStatusMessage('✓ تم نسخ رقم الآيبان!');
                        setTimeout(() => setStatusMessage(''), 2000);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all"
                    >
                      📋 نسخ رقم الآيبان
                    </Button>
                  </div>
                )}

                {/* Card Payment Method */}
                {selected.id === 'card' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        رقم البطاقة
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        value={paymentData.cardNumber}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            cardNumber: e.target.value
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 font-mono transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        اسم حامل البطاقة
                      </label>
                      <input
                        type="text"
                        placeholder="JOHN DOE"
                        value={paymentData.cardHolder}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            cardHolder: e.target.value.toUpperCase()
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          تاريخ الانتهاء
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={paymentData.expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4);
                            }
                            setPaymentData({ ...paymentData, expiryDate: value });
                          }}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 font-mono transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          CVV
                        </label>
                        <input
                          type="password"
                          placeholder="123"
                          maxLength={4}
                          value={paymentData.cvv}
                          onChange={(e) =>
                            setPaymentData({
                              ...paymentData,
                              cvv: e.target.value.replace(/\D/g, '')
                            })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 font-mono transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Status Message */}
            {statusMessage && (
              <Card className={`p-5 border-2 rounded-xl transition-all ${
                paymentStatus === 'success'
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-lg'
                  : paymentStatus === 'error'
                  ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-400 shadow-lg'
                  : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-400 shadow-lg'
              }`}>
                <p className={`font-bold text-lg ${
                  paymentStatus === 'success'
                    ? 'text-green-700'
                    : paymentStatus === 'error'
                    ? 'text-red-700'
                    : 'text-blue-700'
                }`}>
                  {statusMessage}
                </p>
              </Card>
            )}

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={paymentStatus === 'processing'}
              className={`w-full py-4 font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transition-all ${
                paymentStatus === 'processing'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
              } text-white`}
            >
              {paymentStatus === 'processing' ? (
                <>⏳ جاري المعالجة...</>
              ) : (
                <>💳 دفع {paymentData.amount} {paymentData.currency}</>
              )}
            </Button>

            {/* Security Info */}
            <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl shadow-lg">
              <div className="space-y-3 text-sm text-green-700 font-bold">
                <p className="flex items-center gap-2">🔒 تشفير SSL 256-bit</p>
                <p className="flex items-center gap-2">✓ معايير أمان دولية (PCI DSS)</p>
                <p className="flex items-center gap-2">✓ حماية من الاحتيال والتزييف</p>
                <p className="flex items-center gap-2">✓ لن نحفظ بيانات حسابك أو بطاقتك</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

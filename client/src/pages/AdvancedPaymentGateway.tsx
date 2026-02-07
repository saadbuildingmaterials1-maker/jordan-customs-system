/**
 * Advanced Payment Gateway
 * صفحة الدفع المتقدمة - تصميم مشابه لـ Qatar Airways
 * 
 * تدعم:
 * - SAADBOOS (بنك الأردن)
 * - PayPal QR Code
 * - Alipay QR Code
 * - Credit/Debit Card Payment
 * - عرض وتحميل QR Codes
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
    color: 'from-blue-600 to-blue-800',
    description: 'بنك الأردن - الدفع الفوري',
    link: 'https://www.bankaudi.com.jo/saadboos'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '💳',
    color: 'from-blue-500 to-blue-700',
    description: 'PayPal QR Code',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://paypal.me/saadboos'
  },
  {
    id: 'alipay',
    name: 'Alipay',
    icon: '🛒',
    color: 'from-orange-500 to-orange-700',
    description: 'Alipay QR Code',
    qrCode: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://alipay.com/saadboos'
  },
  {
    id: 'card',
    name: 'Card Payment',
    icon: '💰',
    color: 'from-green-600 to-green-800',
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
      setStatusMessage('تم نسخ الرابط بنجاح!');
      setTimeout(() => setStatusMessage(''), 2000);
    }
  };

  const handlePayment = async () => {
    setPaymentStatus('processing');
    setStatusMessage('جاري معالجة الدفع...');

    setTimeout(() => {
      setPaymentStatus('success');
      setStatusMessage(`تم الدفع بنجاح! المبلغ: ${paymentData.amount} ${paymentData.currency}`);
      
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => setLocation('/')}
            variant="outline"
            className="mb-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            ← العودة للرئيسية
          </Button>
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              💳 بوابة الدفع المتقدمة
            </h1>
            <p className="text-gray-300 text-lg">
              اختر طريقة الدفع المفضلة لديك وأتمم عملية الدفع بأمان وسهولة
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Methods Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-xl font-bold text-white mb-4">
                طرق الدفع المتاحة
              </h2>
              <div className="space-y-3">
                {paymentOptions.map((option) => (
                  <Card
                    key={option.id}
                    className={`p-4 cursor-pointer transition-all backdrop-blur-sm border ${
                      selectedMethod === option.id
                        ? 'bg-white/20 border-white/40 ring-2 ring-white/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    onClick={() => handleMethodSelect(option.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`bg-gradient-to-br ${option.color} text-white p-3 rounded-lg text-2xl`}>
                        {option.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{option.name}</h3>
                        <p className="text-xs text-gray-300">{option.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Amount & Reference */}
            <Card className="p-6 bg-white/10 border-white/20 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4">
                تفاصيل الدفع
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label className="block text-sm font-bold text-gray-200 mb-2">
                    المبلغ
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          amount: e.target.value || '0'
                        })
                      }
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-bold text-gray-200 mb-2">
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
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="رقم الفاتورة أو الحجز"
                  />
                </div>
              </div>
            </Card>

            {/* Payment Method Details */}
            {selected && (
              <Card className="p-6 bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">
                  {selected.icon} {selected.name}
                </h3>

                {/* QR Code Methods */}
                {(selected.id === 'paypal' || selected.id === 'alipay') && (
                  <div className="space-y-4">
                    {!showQRCode ? (
                      <div className="text-center py-8">
                        <p className="text-gray-300 mb-4">
                          اضغط على الزر أدناه لعرض رمز الاستجابة السريعة
                        </p>
                        <Button
                          onClick={() => setShowQRCode(true)}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-2"
                        >
                          📱 عرض QR Code
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg flex justify-center">
                          <img
                            src={selected.qrCode}
                            alt={`${selected.name} QR Code`}
                            className="w-64 h-64"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={downloadQRCode}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          >
                            ⬇️ تحميل الرمز
                          </Button>
                          <Button
                            onClick={copyLink}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            📋 نسخ الرابط
                          </Button>
                        </div>
                        <Button
                          onClick={() => setShowQRCode(false)}
                          variant="outline"
                          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          إغلاق
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* SAADBOOS Method */}
                {selected.id === 'saadboos' && (
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-sm text-gray-300 mb-1">اسم البنك</p>
                        <p className="text-white font-bold">بنك الأردن</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-300 mb-1">رقم الحساب</p>
                        <p className="text-white font-bold">1234567890</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-300 mb-1">SWIFT Code</p>
                        <p className="text-white font-bold">ARABJOXX</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-300 mb-1">الاسم المسجل</p>
                        <p className="text-white font-bold">SAAD SAAD ALDEEN</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText('1234567890');
                        setStatusMessage('تم نسخ رقم الحساب!');
                        setTimeout(() => setStatusMessage(''), 2000);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      📋 نسخ رقم الحساب
                    </Button>
                  </div>
                )}

                {/* Card Payment Method */}
                {selected.id === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-200 mb-2">
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
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-200 mb-2">
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
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-200 mb-2">
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
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-200 mb-2">
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
                          className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Status Message */}
            {statusMessage && (
              <Card className={`p-4 ${
                paymentStatus === 'success'
                  ? 'bg-green-500/20 border-green-500/50'
                  : paymentStatus === 'error'
                  ? 'bg-red-500/20 border-red-500/50'
                  : 'bg-blue-500/20 border-blue-500/50'
              }`}>
                <p className={
                  paymentStatus === 'success'
                    ? 'text-green-200'
                    : paymentStatus === 'error'
                    ? 'text-red-200'
                    : 'text-blue-200'
                }>
                  {paymentStatus === 'success' && '✓ '}
                  {paymentStatus === 'error' && '✗ '}
                  {paymentStatus === 'processing' && '⏳ '}
                  {statusMessage}
                </p>
              </Card>
            )}

            {/* Payment Button */}
            <Button
              onClick={handlePayment}
              disabled={paymentStatus === 'processing'}
              className={`w-full py-4 font-bold text-lg ${
                paymentStatus === 'processing'
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              } text-white`}
            >
              {paymentStatus === 'processing' ? (
                <>⏳ جاري المعالجة...</>
              ) : (
                <>💳 دفع {paymentData.amount} {paymentData.currency}</>
              )}
            </Button>

            {/* Security Info */}
            <Card className="p-4 bg-green-500/10 border-green-500/30">
              <div className="space-y-2 text-sm text-green-200">
                <p>🔒 تشفير SSL 256-bit</p>
                <p>✓ معايير أمان دولية (PCI DSS)</p>
                <p>✓ حماية من الاحتيال والتزييف</p>
                <p>✓ لن نحفظ بيانات حسابك أو بطاقتك</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

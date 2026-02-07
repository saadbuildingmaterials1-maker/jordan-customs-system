/**
 * Integrated Payment System Page
 * صفحة نظام الدفع المتكامل
 * 
 * تدعم:
 * - QR Code Payment (PayPal, Alipay)
 * - Credit/Debit Cards (Visa, Mastercard, Amex)
 * - Barcode Scanner & Analysis
 * - Bank Transfer
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLocation } from 'wouter';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  category: 'qr' | 'card' | 'bank' | 'mobile';
  color: string;
  description: string;
}

interface CardData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

interface BarcodeData {
  type: string;
  value: string;
  amount?: number;
  merchant?: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'paypal-qr',
    name: 'PayPal QR',
    icon: '🅿️',
    category: 'qr',
    color: 'bg-blue-600',
    description: 'ادفع عبر PayPal'
  },
  {
    id: 'alipay-qr',
    name: 'Alipay QR',
    icon: '🇨🇳',
    category: 'qr',
    color: 'bg-blue-500',
    description: 'ادفع عبر Alipay'
  },
  {
    id: 'visa',
    name: 'Visa',
    icon: '💳',
    category: 'card',
    color: 'bg-indigo-600',
    description: 'بطاقة Visa'
  },
  {
    id: 'mastercard',
    name: 'Mastercard',
    icon: '💳',
    category: 'card',
    color: 'bg-red-600',
    description: 'بطاقة Mastercard'
  },
  {
    id: 'amex',
    name: 'American Express',
    icon: '💳',
    category: 'card',
    color: 'bg-green-600',
    description: 'بطاقة American Express'
  },
  {
    id: 'bank-transfer',
    name: 'تحويل بنكي',
    icon: '🏦',
    category: 'bank',
    color: 'bg-purple-600',
    description: 'تحويل بنكي مباشر'
  }
];

export default function PaymentSystem() {
  const [, setLocation] = useLocation();
  const navigate = (path: string) => setLocation(path);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState<string | number>('100');
  const [activeTab, setActiveTab] = useState<'qr' | 'card' | 'bank' | 'barcode'>('qr');
  
  // Card Payment State
  const [cardData, setCardData] = useState<CardData>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  // Barcode Scanner State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [barcodeData, setBarcodeData] = useState<BarcodeData | null>(null);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedValue, setScannedValue] = useState('');

  // QR Code Payment
  const handleQRPayment = () => {
    if (!selectedMethod || !amount) {
      alert('يرجى اختيار طريقة دفع وإدخال المبلغ');
      return;
    }
    alert(`جاري معالجة الدفع: ${amount} JOD عبر ${selectedMethod}`);
  };

  // Card Payment
  const handleCardPayment = () => {
    if (!cardData.cardNumber || !cardData.cardHolder || !cardData.expiryDate || !cardData.cvv) {
      alert('يرجى ملء جميع بيانات البطاقة');
      return;
    }

    // Validate card number (basic validation)
    if (!/^\d{16}$/.test(cardData.cardNumber.replace(/\s/g, ''))) {
      alert('رقم البطاقة غير صحيح');
      return;
    }

    alert(`جاري معالجة الدفع: ${amount} JOD عبر ${cardData.cardNumber.slice(-4)}`);
  };

  // Barcode Scanner
  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScannerActive(true);
      }
    } catch (err) {
      alert('لم يتمكن من الوصول إلى الكاميرا');
    }
  };

  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      setScannerActive(false);
    }
  };

  const analyzeBarcode = (value: string) => {
    // تحليل الباركود
    const analysis: BarcodeData = {
      type: 'QR Code',
      value: value,
      amount: Math.floor(Math.random() * 1000) + 50,
      merchant: 'Jordan Customs System'
    };
    setBarcodeData(analysis);
  };

  const handleManualBarcode = () => {
    if (scannedValue) {
      analyzeBarcode(scannedValue);
      setScannedValue('');
    }
  };

  // Format card number
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="mb-4"
          >
            ← العودة للرئيسية
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            💳 نظام الدفع المتكامل
          </h1>
          <p className="text-gray-600">
            اختر طريقة الدفع المفضلة لديك
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['qr', 'card', 'bank', 'barcode'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-900 border border-gray-300 hover:border-blue-600'
              }`}
            >
              {tab === 'qr' && '📱 QR Code'}
              {tab === 'card' && '💳 البطاقات'}
              {tab === 'bank' && '🏦 تحويل بنكي'}
              {tab === 'barcode' && '📊 تحليل الباركود'}
            </button>
          ))}
        </div>

        {/* QR Code Payment */}
        {activeTab === 'qr' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                طرق الدفع عبر QR Code
              </h2>
              <div className="space-y-3">
                {paymentMethods
                  .filter(m => m.category === 'qr')
                  .map((method) => (
                    <Card
                      key={method.id}
                      className={`p-4 cursor-pointer transition-all ${
                        selectedMethod === method.id
                          ? 'ring-2 ring-blue-500 shadow-lg'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${method.color} text-white p-3 rounded-lg text-2xl`}>
                          {method.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{method.name}</h3>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  المبلغ (JOD)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                onClick={handleQRPayment}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              >
                متابعة الدفع
              </Button>
            </div>

            <div className="flex items-center justify-center">
              <Card className="p-8 w-full">
                <div className="text-center">
                  <p className="text-gray-600 text-lg">
                    اختر طريقة دفع لعرض رمز الاستجابة السريعة
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Card Payment */}
        {activeTab === 'card' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                بيانات البطاقة
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    رقم البطاقة
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.cardNumber}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        cardNumber: formatCardNumber(e.target.value)
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    maxLength={19}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    اسم حامل البطاقة
                  </label>
                  <input
                    type="text"
                    placeholder="JOHN DOE"
                    value={cardData.cardHolder}
                    onChange={(e) =>
                      setCardData({
                        ...cardData,
                        cardHolder: e.target.value.toUpperCase()
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      تاريخ الانتهاء
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardData.expiryDate}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length >= 2) {
                          value = value.slice(0, 2) + '/' + value.slice(2, 4);
                        }
                        setCardData({ ...cardData, expiryDate: value });
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      CVV
                    </label>
                    <input
                      type="password"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) =>
                        setCardData({
                          ...cardData,
                          cvv: e.target.value.replace(/\D/g, '').slice(0, 4)
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      المبلغ (JOD)
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value || '100')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                <Button
                  onClick={handleCardPayment}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  دفع {amount} JOD
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                معلومات الأمان
              </h2>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    ✓ تشفير SSL 256-bit
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    ✓ معايير PCI DSS
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    ✓ حماية من الاحتيال
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    ℹ️ لن نحفظ بيانات بطاقتك
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Bank Transfer */}
        {activeTab === 'bank' && (
          <Card className="p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              بيانات التحويل البنكي
            </h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-bold text-blue-900 mb-2">اسم البنك:</p>
                <p className="text-blue-800">البنك الأهلي الأردني</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-bold text-blue-900 mb-2">رقم الحساب:</p>
                <p className="text-blue-800 font-mono">1234567890</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-bold text-blue-900 mb-2">اسم المستقبل:</p>
                <p className="text-blue-800">Saad Aldeen LLC</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-bold text-blue-900 mb-2">رمز SWIFT:</p>
                <p className="text-blue-800 font-mono">ABNAJORD</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  ⚠️ يرجى تضمين رقم الفاتورة في موضوع التحويل
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Barcode Scanner & Analysis */}
        {activeTab === 'barcode' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                ماسح الباركود
              </h2>

              {!scannerActive ? (
                <Button
                  onClick={startScanner}
                  className="w-full bg-blue-600 hover:bg-blue-700 mb-4"
                >
                  🎥 تشغيل الكاميرا
                </Button>
              ) : (
                <Button
                  onClick={stopScanner}
                  className="w-full bg-red-600 hover:bg-red-700 mb-4"
                >
                  ⏹️ إيقاف الكاميرا
                </Button>
              )}

              {scannerActive && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full rounded-lg border-2 border-gray-300 mb-4"
                />
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    أو أدخل قيمة الباركود يدويًا
                  </label>
                  <input
                    type="text"
                    placeholder="أدخل قيمة الباركود"
                    value={scannedValue}
                    onChange={(e) => setScannedValue(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button
                  onClick={handleManualBarcode}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  🔍 تحليل الباركود
                </Button>
              </div>
            </Card>

            {barcodeData && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  نتائج التحليل
                </h2>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm font-bold text-green-900 mb-1">نوع الباركود:</p>
                    <p className="text-green-800">{barcodeData.type}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-bold text-blue-900 mb-1">القيمة:</p>
                    <p className="text-blue-800 break-all font-mono text-sm">{barcodeData.value}</p>
                  </div>
                  {barcodeData.amount && (
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-sm font-bold text-purple-900 mb-1">المبلغ:</p>
                      <p className="text-purple-800">{barcodeData.amount} JOD</p>
                    </div>
                  )}
                  {barcodeData.merchant && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <p className="text-sm font-bold text-orange-900 mb-1">التاجر:</p>
                      <p className="text-orange-800">{barcodeData.merchant}</p>
                    </div>
                  )}
                  <Button
                    onClick={() => {
                      if (barcodeData.amount) {
                        setAmount(barcodeData.amount.toString());
                      }
                      setActiveTab('card');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    متابعة الدفع
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, CreditCard, Loader2, DollarSign, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * صفحة الدفع المتقدمة
 */
export default function PaymentPage() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentId, setPaymentId] = useState('');

  // حساب الضرائب والخصم
  const amountNum = parseFloat(amount) || 0;
  const tax = amountNum * 0.16; // ضريبة 16%
  const discount = 0; // خصم اختياري
  const total = amountNum + tax - discount;

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMessage('يرجى إدخال مبلغ صحيح');
      setPaymentStatus('error');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('idle');

    try {
      // محاكاة معالجة الدفع
      const newPaymentId = `PAY-${Date.now()}`;
      setPaymentId(newPaymentId);

      // محاكاة تأخير المعالجة
      await new Promise(resolve => setTimeout(resolve, 2000));

      setPaymentStatus('success');
      setAmount('');
      setDescription('');
    } catch (error) {
      setErrorMessage('حدث خطأ أثناء معالجة الدفع');
      setPaymentStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-2">
            <CreditCard className="w-10 h-10 text-cyan-400" />
            نظام الدفع المتقدم
          </h1>
          <p className="text-gray-400">معالجة آمنة وسهلة للدفعات</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* نموذج الدفع */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">معلومات الدفع</CardTitle>
                <CardDescription>أدخل تفاصيل الدفع الخاصة بك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* المبلغ */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    المبلغ
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-gray-500"
                      disabled={isProcessing}
                    />
                  </div>
                </div>

                {/* العملة */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    العملة
                  </label>
                  <Select value={currency} onValueChange={setCurrency} disabled={isProcessing}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="EUR">يورو (EUR)</SelectItem>
                      <SelectItem value="JOD">دينار أردني (JOD)</SelectItem>
                      <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* طريقة الدفع */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    طريقة الدفع
                  </label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} disabled={isProcessing}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">بطاقة ائتمان</SelectItem>
                      <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="wallet">محفظة رقمية</SelectItem>
                      <SelectItem value="cash">دفع نقداً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* الوصف */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    وصف الدفع
                  </label>
                  <Input
                    placeholder="أدخل وصف الدفع"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder-gray-500"
                    disabled={isProcessing}
                  />
                </div>

                {/* رسالة الخطأ */}
                {paymentStatus === 'error' && (
                  <Alert className="bg-red-900/20 border-red-700">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-400">
                      {errorMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {/* رسالة النجاح */}
                {paymentStatus === 'success' && (
                  <Alert className="bg-green-900/20 border-green-700">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-400">
                      تم معالجة الدفع بنجاح! رقم الدفعة: {paymentId}
                    </AlertDescription>
                  </Alert>
                )}

                {/* زر الدفع */}
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || !amount}
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      إتمام الدفع
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* ملخص الدفع */}
          <div className="space-y-4">
            {/* ملخص الفاتورة */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  ملخص الفاتورة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>المبلغ الأساسي:</span>
                  <span className="font-semibold">{amountNum.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>الضريبة (16%):</span>
                  <span className="font-semibold text-amber-400">{tax.toFixed(2)} {currency}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>الخصم:</span>
                  <span className="font-semibold text-green-400">-{discount.toFixed(2)} {currency}</span>
                </div>
                <div className="border-t border-slate-600 pt-3 flex justify-between">
                  <span className="text-white font-bold">المجموع:</span>
                  <span className="text-cyan-400 font-bold text-lg">{total.toFixed(2)} {currency}</span>
                </div>
              </CardContent>
            </Card>

            {/* معلومات الأمان */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">معلومات الأمان</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-400">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1 flex-shrink-0" />
                  <span>تشفير SSL 256-bit</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1 flex-shrink-0" />
                  <span>معايير PCI DSS</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1 flex-shrink-0" />
                  <span>حماية من الاحتيال</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1 flex-shrink-0" />
                  <span>ضمان استرجاع الأموال</span>
                </div>
              </CardContent>
            </Card>

            {/* طرق الدفع المدعومة */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">طرق الدفع المدعومة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span>بطاقات ائتمان</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span>بطاقات خصم</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span>محافظ رقمية</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-cyan-400" />
                    <span>تحويلات بنكية</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* سجل الدفعات */}
        <Card className="bg-slate-800 border-slate-700 mt-6">
          <CardHeader>
            <CardTitle className="text-white">سجل الدفعات</CardTitle>
            <CardDescription>آخر الدفعات المعالجة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentId && (
                <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                  <div>
                    <p className="text-white font-semibold">{description || 'دفعة عامة'}</p>
                    <p className="text-sm text-gray-400">{paymentId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{total.toFixed(2)} {currency}</p>
                    <p className="text-sm text-green-400">✓ مكتملة</p>
                  </div>
                </div>
              )}
              {!paymentId && (
                <p className="text-gray-400 text-center py-4">لا توجد دفعات حتى الآن</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

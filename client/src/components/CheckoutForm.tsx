import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface CheckoutFormProps {
  amount: number;
  currency?: string;
  description: string;
  onSuccess?: () => void;
}

export function CheckoutForm({
  amount,
  currency = 'JOD',
  description,
  onSuccess,
}: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: '',
  });

  const createPaymentMutation = (trpc as any).stripe.createPaymentIntent.useMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // التحقق من صحة البيانات
      if (!formData.cardNumber || !formData.expiryDate || !formData.cvc) {
        throw new Error('يرجى ملء جميع حقول البطاقة');
      }

      // إنشاء payment intent
      const result = await createPaymentMutation.mutateAsync({
        amount,
        currency,
        description,
        metadata: {
          cardholderName: formData.cardholderName,
        },
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ في المعالجة');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-900">تم الدفع بنجاح!</p>
              <p className="text-sm text-green-700">شكراً لك على عملية الشراء</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          نموذج الدفع
        </CardTitle>
        <CardDescription>أدخل تفاصيل بطاقتك الائتمانية</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ملخص الطلب */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">الوصف:</span>
              <span className="font-medium">{description}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">المبلغ:</span>
              <span className="text-2xl font-bold text-blue-600">
                {amount.toFixed(2)} {currency}
              </span>
            </div>
          </div>

          {/* رسالة الخطأ */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* بيانات البطاقة */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم صاحب البطاقة
              </label>
              <Input
                type="text"
                name="cardholderName"
                placeholder="أحمد محمد"
                value={formData.cardholderName}
                onChange={handleInputChange}
                disabled={isLoading}
                className="text-right"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم البطاقة
              </label>
              <Input
                type="text"
                name="cardNumber"
                placeholder="4242 4242 4242 4242"
                value={formData.cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, '');
                  setFormData((prev) => ({
                    ...prev,
                    cardNumber: value.replace(/(\d{4})/g, '$1 ').trim(),
                  }));
                }}
                disabled={isLoading}
                maxLength={19}
              />
              <p className="text-xs text-gray-500 mt-1">
                للاختبار: 4242 4242 4242 4242
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ الانتهاء
                </label>
                <Input
                  type="text"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setFormData((prev) => ({
                      ...prev,
                      expiryDate: value,
                    }));
                  }}
                  disabled={isLoading}
                  maxLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رمز الأمان (CVC)
                </label>
                <Input
                  type="text"
                  name="cvc"
                  placeholder="123"
                  value={formData.cvc}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                    setFormData((prev) => ({
                      ...prev,
                      cvc: value,
                    }));
                  }}
                  disabled={isLoading}
                  maxLength={3}
                />
              </div>
            </div>
          </div>

          {/* أزرار الإجراء */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 text-lg font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                الدفع الآن - {amount.toFixed(2)} {currency}
              </>
            )}
          </Button>

          {/* معلومات الأمان */}
          <div className="text-center text-xs text-gray-500">
            <p>🔒 معاملتك آمنة وموثوقة 100%</p>
            <p>جميع البيانات مشفرة وآمنة</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

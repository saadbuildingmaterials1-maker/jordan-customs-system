import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { useToast } from '@/hooks/use-toast';

/**
 * صفحة الدفع - واجهة آمنة وبسيطة
 */
export function PaymentPage() {
  // const { toast } = useToast();
  const toast = (config: any) => console.log('Toast:', config);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // التحقق من البيانات
      if (!formData.amount || !formData.cardNumber) {
        toast({
          title: 'خطأ',
          description: 'يرجى ملء جميع الحقول المطلوبة',
          variant: 'destructive',
        });
        return;
      }

      // محاكاة إرسال الدفعة
      console.log('Processing payment:', formData);

      toast({
        title: 'نجح',
        description: 'تم معالجة الدفعة بنجاح',
      });

      // إعادة تعيين النموذج
      setFormData({
        amount: '',
        description: '',
        cardNumber: '',
        expiryDate: '',
        cvc: '',
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء معالجة الدفعة',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>الدفع الآمن</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* المبلغ */}
              <div>
                <Label htmlFor="amount">المبلغ (دينار أردني)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="أدخل المبلغ"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              {/* الوصف */}
              <div>
                <Label htmlFor="description">الوصف</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="وصف الدفعة"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              {/* رقم البطاقة */}
              <div>
                <Label htmlFor="cardNumber">رقم البطاقة</Label>
                <Input
                  id="cardNumber"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  maxLength={19}
                  required
                />
              </div>

              {/* تاريخ الانتهاء و CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">MM/YY</Label>
                  <Input
                  id="expiryDate"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  maxLength={5}
                  required
                  />
                </div>
                <div>
                  <Label htmlFor="cvc">CVC</Label>
                  <Input
                  id="cvc"
                  name="cvc"
                  placeholder="123"
                  value={formData.cvc}
                  onChange={(e) => setFormData(prev => ({ ...prev, cvc: e.target.value }))}
                  maxLength={4}
                  required
                  />
                </div>
              </div>

              {/* زر الدفع */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'جاري المعالجة...' : 'دفع الآن'}
              </Button>
            </form>

            {/* ملاحظة أمان */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              ⚠️ <strong>ملاحظة أمان:</strong> لا تشارك بيانات بطاقتك الحقيقية. هذه واجهة توضيحية فقط.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default PaymentPage;

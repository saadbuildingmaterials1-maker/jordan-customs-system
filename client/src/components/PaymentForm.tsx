import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  success?: boolean;
  selectedGateway?: string;
}

export interface PaymentFormData {
  amount: number;
  currency: string;
  email: string;
  description: string;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  success,
  selectedGateway,
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 0,
    currency: 'JOD',
    email: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleInputChange = (field: keyof PaymentFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className="border-2 border-gray-200 dark:border-gray-700">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <CardTitle>تفاصيل الدفع</CardTitle>
        <CardDescription className="text-blue-100">
          أدخل معلومات الدفع الخاصة بك
        </CardDescription>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* المبلغ والعملة */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-gray-700 font-semibold">
              المبلغ
            </Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="أدخل المبلغ"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                className="flex-1"
                min="0"
                step="0.01"
                required
              />
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JOD">JOD</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* البريد الإلكتروني */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-semibold">
              البريد الإلكتروني
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="أدخل بريدك الإلكتروني"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          {/* الوصف */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700 font-semibold">
              وصف الدفع
            </Label>
            <Input
              id="description"
              type="text"
              placeholder="مثال: دفع الفاتورة #12345"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
          </div>

          {/* الرسائل */}
          {error && (
            <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                تم إنشاء طلب الدفع بنجاح! جاري التحويل...
              </AlertDescription>
            </Alert>
          )}

          {/* زر الإرسال */}
          <Button
            type="submit"
            disabled={isLoading || !formData.amount || !formData.email || !selectedGateway}
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                جاري المعالجة...
              </>
            ) : (
              'متابعة الدفع'
            )}
          </Button>

          {/* معلومات الأمان */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">🔒 معلومات الأمان:</span> جميع معاملاتك محمية بتشفير SSL 256-bit
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

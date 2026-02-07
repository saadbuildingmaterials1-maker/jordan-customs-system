/**
 * PaymentMethodsManager Component
 * 
 * مكون React
 * 
 * @module ./client/src/components/PaymentMethodsManager
 */
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Apple, Trash2, Check } from 'lucide-react';

export function PaymentMethodsManager() {
  const [showAddMethod, setShowAddMethod] = useState(false);
  
  const paymentMethodsQuery = (trpc as any).paymentMethods.getPaymentMethods.useQuery();
  const deleteMethodMutation = (trpc as any).paymentMethods.deletePaymentMethod.useMutation();
  const setDefaultMutation = (trpc as any).paymentMethods.setDefaultPaymentMethod.useMutation();

  const handleDeleteMethod = async (paymentMethodId: string) => {
    if (confirm('هل تريد حذف هذه طريقة الدفع؟')) {
      await deleteMethodMutation.mutateAsync({ paymentMethodId });
      paymentMethodsQuery.refetch();
    }
  };

  const handleSetDefault = async (customerId: string, paymentMethodId: string) => {
    await setDefaultMutation.mutateAsync({ customerId, paymentMethodId });
    paymentMethodsQuery.refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                طرق الدفع المحفوظة
              </CardTitle>
              <CardDescription>إدارة طرق الدفع الخاصة بك</CardDescription>
            </div>
            <Button onClick={() => setShowAddMethod(!showAddMethod)} variant="outline">
              إضافة طريقة دفع
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {paymentMethodsQuery.isLoading ? (
            <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
          ) : paymentMethodsQuery.data?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد طرق دفع محفوظة
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethodsQuery.data?.map((method: any) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {method.card?.brand?.toUpperCase()} •••• {method.card?.last4}
                      </p>
                      <p className="text-sm text-gray-500">
                        ينتهي في {method.card?.exp_month}/{method.card?.exp_year}
                      </p>
                      {method.billingDetails?.name && (
                        <p className="text-sm text-gray-600">
                          {method.billingDetails.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault('cus_default', method.id)}
                    >
                      <Check className="w-4 h-4" />
                      افتراضي
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMethod(method.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showAddMethod && (
        <Card>
          <CardHeader>
            <CardTitle>إضافة طريقة دفع جديدة</CardTitle>
            <CardDescription>اختر طريقة الدفع المفضلة لديك</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => {
                  alert('سيتم تفعيل Apple Pay قريباً');
                }}
              >
                <Apple className="w-6 h-6" />
                <span>Apple Pay</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => {
                  alert('سيتم تفعيل Google Pay قريباً');
                }}
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
                <span>Google Pay</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
              >
                <CreditCard className="w-6 h-6" />
                <span>بطاقة ائتمان</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

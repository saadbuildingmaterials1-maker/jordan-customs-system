/**
 * Subscription Management Page
 * 
 * صفحة إدارة الاشتراكات
 * تسمح للمستخدمين بتغيير الخطط والإلغاء
 * 
 * @module client/src/pages/SubscriptionManagement
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, CreditCard, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SubscriptionData {
  id: string;
  planName: string;
  status: 'active' | 'cancelled' | 'expired';
  currentPrice: number;
  nextBillingDate: Date;
  startDate: Date;
  invoices: Invoice[];
}

interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: 'paid' | 'pending';
  downloadUrl: string;
}

export default function SubscriptionManagement() {
  const [subscription] = useState<SubscriptionData>({
    id: 'sub_123',
    planName: 'الخطة المهنية',
    status: 'active',
    currentPrice: 299,
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    invoices: [
      {
        id: 'inv_001',
        date: new Date(),
        amount: 299,
        status: 'paid',
        downloadUrl: '#',
      },
      {
        id: 'inv_002',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        amount: 299,
        status: 'paid',
        downloadUrl: '#',
      },
    ],
  });

  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'cancelled':
        return 'ملغى';
      case 'expired':
        return 'منتهي';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            إدارة الاشتراك
          </h1>
          <p className="text-gray-600">
            إدارة خطتك الحالية والدفعات والفواتير
          </p>
        </div>

        {/* Current Subscription Card */}
        <Card className="mb-8 border-2 border-indigo-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{subscription.planName}</CardTitle>
                <CardDescription className="text-indigo-100">
                  الخطة الحالية
                </CardDescription>
              </div>
              <Badge className={`${getStatusColor(subscription.status)} text-lg px-4 py-2`}>
                {getStatusLabel(subscription.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subscription Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">السعر الشهري</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {subscription.currentPrice} JOD
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">تاريخ البدء</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {subscription.startDate.toLocaleDateString('ar-JO')}
                  </p>
                </div>
              </div>

              {/* Next Billing */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">تاريخ الفاتورة التالية</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {subscription.nextBillingDate.toLocaleDateString('ar-JO')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">الحالة</p>
                  <p className="text-lg font-semibold text-green-600">
                    ✓ نشط
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4 flex-wrap">
              <Button
                onClick={() => setShowChangeDialog(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                تغيير الخطة
              </Button>
              <Button
                onClick={() => setShowCancelDialog(true)}
                variant="destructive"
              >
                إلغاء الاشتراك
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              الفواتير والدفعات
            </CardTitle>
            <CardDescription>
              سجل جميع الفواتير والدفعات السابقة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subscription.invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    {invoice.status === 'paid' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        الفاتورة #{invoice.id}
                      </p>
                      <p className="text-sm text-gray-600">
                        {invoice.date.toLocaleDateString('ar-JO')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        {invoice.amount} JOD
                      </p>
                      <Badge
                        variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                      >
                        {invoice.status === 'paid' ? 'مدفوعة' : 'معلقة'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        console.log(`تحميل الفاتورة ${invoice.id}`);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert className="mt-8 border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            إذا كان لديك أي أسئلة حول اشتراكك، يرجى التواصل مع فريق الدعم الفني.
          </AlertDescription>
        </Alert>

        {/* Change Plan Dialog */}
        {showChangeDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>تغيير الخطة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    اختر الخطة الجديدة التي تريد الترقية أو التنزيل إليها
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    الخطة الأساسية - 99 JOD
                  </Button>
                  <Button className="w-full" variant="outline">
                    الخطة المهنية - 299 JOD (الحالية)
                  </Button>
                  <Button className="w-full" variant="outline">
                    الخطة المؤسسية - 999 JOD
                  </Button>
                </div>
                <Button
                  onClick={() => setShowChangeDialog(false)}
                  variant="ghost"
                  className="w-full"
                >
                  إلغاء
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Cancel Subscription Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="w-5 h-5" />
                  إلغاء الاشتراك
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    هل أنت متأكد من رغبتك في إلغاء الاشتراك؟ ستفقد الوصول إلى جميع الميزات.
                  </AlertDescription>
                </Alert>
                <div className="space-y-2">
                  <Button
                    onClick={() => {
                      console.log('تم إلغاء الاشتراك');
                      setShowCancelDialog(false);
                    }}
                    variant="destructive"
                    className="w-full"
                  >
                    نعم، ألغِ الاشتراك
                  </Button>
                  <Button
                    onClick={() => setShowCancelDialog(false)}
                    variant="outline"
                    className="w-full"
                  >
                    إلغاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Subscription Dashboard
 * 
 * لوحة تحكم الاشتراكات - إدارة الاشتراكات النشطة والفترات التجريبية والفواتير
 * 
 * @module client/src/pages/SubscriptionDashboard
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Calendar, CreditCard, Download, MoreVertical, Zap } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

/**
 * Subscription Status Badge
 */
const SubscriptionStatusBadge = ({ status }: { status: string }) => {
  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    active: { label: 'نشط', variant: 'default' },
    trialing: { label: 'فترة تجريبية', variant: 'secondary' },
    past_due: { label: 'متأخر', variant: 'destructive' },
    canceled: { label: 'ملغى', variant: 'outline' },
    unpaid: { label: 'غير مدفوع', variant: 'destructive' },
  };

  const config = statusConfig[status] || { label: status, variant: 'outline' as const };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

/**
 * Trial Period Card
 */
const TrialPeriodCard = ({ subscription }: { subscription: any }) => {
  if (subscription.status !== 'trialing' || !subscription.trialEnd) {
    return null;
  }

  const trialEnd = new Date(subscription.trialEnd);
  const now = new Date();
  const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          فترة تجريبية نشطة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">الأيام المتبقية:</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.max(0, (daysRemaining / 7) * 100)}%` }}
              />
            </div>
            <span className="text-2xl font-bold text-blue-600">{Math.max(0, daysRemaining)}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          تنتهي الفترة التجريبية في: <strong>{trialEnd.toLocaleDateString('ar-JO')}</strong>
        </p>
        <p className="text-xs text-gray-500">
          بعد انتهاء الفترة التجريبية، سيتم تفعيل الاشتراك المدفوع تلقائياً.
        </p>
      </CardContent>
    </Card>
  );
};

/**
 * Active Subscription Card
 */
const ActiveSubscriptionCard = ({ subscription, onCancel }: { subscription: any; onCancel: () => void }) => {
  const currentPeriodEnd = new Date(subscription.currentPeriodEnd);
  const now = new Date();
  const daysUntilRenewal = Math.ceil((currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">الاشتراك النشط</CardTitle>
            <CardDescription>معلومات الاشتراك الحالي</CardDescription>
          </div>
          <SubscriptionStatusBadge status={subscription.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subscription Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">السعر الشهري</p>
            <p className="text-2xl font-bold">
              {(subscription.amount / 100).toFixed(2)} {subscription.currency?.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">فترة الدفع</p>
            <p className="text-lg font-semibold">
              {subscription.interval === 'month' ? 'شهري' : 'سنوي'}
            </p>
          </div>
        </div>

        {/* Renewal Date */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <p className="text-sm text-gray-600">تاريخ التجديد التالي</p>
          </div>
          <p className="text-lg font-semibold">
            {currentPeriodEnd.toLocaleDateString('ar-JO')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {daysUntilRenewal} أيام متبقية
          </p>
        </div>

        {/* Cancel Button */}
        <div className="pt-4 border-t">
          <Button
            variant="destructive"
            className="w-full"
            onClick={onCancel}
          >
            إلغاء الاشتراك
          </Button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            يمكنك إلغاء الاشتراك في أي وقت. سيظل لديك الوصول حتى نهاية فترة الفواتير.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Invoices List
 */
const InvoicesList = ({ invoices }: { invoices: any[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          الفواتير
        </CardTitle>
        <CardDescription>سجل الفواتير والدفعات</CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">لا توجد فواتير حتى الآن</p>
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    الفاتورة #{invoice.number}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(invoice.createdAt).toLocaleDateString('ar-JO')}
                  </p>
                </div>
                <div className="text-right mr-4">
                  <p className="font-bold">
                    {(invoice.amount / 100).toFixed(2)} {invoice.currency?.toUpperCase()}
                  </p>
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                    {invoice.status === 'paid' ? 'مدفوعة' : 'معلقة'}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2"
                  onClick={() => {
                    if (invoice.pdfUrl) {
                      window.open(invoice.pdfUrl, '_blank');
                    }
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Subscription Dashboard Component
 */
export default function SubscriptionDashboard() {
  const { user } = useAuth();
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Fetch invoices
  const invoicesQuery = trpc.stripe.listInvoices.useQuery(
    { limit: 10 },
    { enabled: !!user?.id }
  );

  // Cancel subscription mutation
  const cancelMutation = trpc.stripe.cancelSubscription.useMutation({
    onSuccess: () => {
      setShowCancelConfirm(false);
      invoicesQuery.refetch();
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">يجب تسجيل الدخول</h1>
          <p className="text-gray-600">يرجى تسجيل الدخول لعرض لوحة تحكم الاشتراكات</p>
        </div>
      </div>
    );
  }

  // Placeholder data for now
  const activeSubscription: any = null;
  const invoices: any[] = invoicesQuery.data?.invoices || [];

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">لوحة تحكم الاشتراكات</h1>
        <p className="text-gray-600">إدارة اشتراكك والفواتير والفترات التجريبية</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Subscription Info */}
        <div className="lg:col-span-2 space-y-6">
          {activeSubscription ? (
            <>
              <TrialPeriodCard subscription={activeSubscription as any} />
              <ActiveSubscriptionCard
                subscription={activeSubscription as any}
                onCancel={() => {
                  if (activeSubscription?.id) {
                    setSelectedSubscription(activeSubscription?.id as string);
                    setShowCancelConfirm(true);
                  }
                }}
              />
            </>
          ) : (
            <Card>
              <CardContent className="pt-8">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">لا توجد اشتراكات نشطة</h2>
                  <p className="text-gray-600 mb-4">
                    اختر خطة اشتراك لبدء الاستفادة من الميزات المتقدمة
                  </p>
                  <Button>اختر خطة</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoices List */}
          <InvoicesList invoices={invoices} />
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Plan Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ملخص الخطة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeSubscription ? (
                <>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الحالة</p>
                    <SubscriptionStatusBadge status={(activeSubscription as any).status} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">معرّف الاشتراك</p>
                    <p className="font-mono text-xs break-all">{(activeSubscription as any).id}</p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm">لا توجد خطة نشطة حالياً</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الإجراءات السريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                تغيير الخطة
              </Button>
              <Button variant="outline" className="w-full justify-start">
                تحديث طريقة الدفع
              </Button>
              <Button variant="outline" className="w-full justify-start">
                الحصول على الفاتورة
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>تأكيد إلغاء الاشتراك</CardTitle>
              <CardDescription>
                هل أنت متأكد من رغبتك في إلغاء الاشتراك؟
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  سيظل لديك الوصول إلى الخدمة حتى نهاية فترة الفواتير الحالية.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  إلغاء
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    cancelMutation.mutate({ subscriptionId: selectedSubscription });
                  }}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

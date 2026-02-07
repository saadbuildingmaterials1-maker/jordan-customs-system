/**
 * PaymentsManagement Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/PaymentsManagement
 */
import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, RefreshCw } from 'lucide-react';

export function PaymentsManagement() {
  const [activeTab, setActiveTab] = useState<'payments' | 'invoices' | 'subscriptions'>('payments');
  
  const paymentsQuery = (trpc as any).stripe.getPayments.useQuery();
  const invoicesQuery = (trpc as any).stripe.getInvoices.useQuery();
  const subscriptionsQuery = (trpc as any).stripe.getSubscriptions.useQuery();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
      case 'paid':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'draft':
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'uncollectible':
        return 'bg-red-100 text-red-800';
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      succeeded: 'نجح',
      pending: 'قيد الانتظار',
      failed: 'فشل',
      processing: 'قيد المعالجة',
      canceled: 'ملغى',
      refunded: 'مسترجع',
      paid: 'مدفوع',
      draft: 'مسودة',
      open: 'مفتوح',
      void: 'ملغى',
      uncollectible: 'غير قابل للتحصيل',
      active: 'نشط',
      past_due: 'متأخر',
      unpaid: 'غير مدفوع',
    };
    return labels[status] || status;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ar-JO', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ar-JO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الدفعات</h1>
          <p className="text-gray-600 mt-2">إدارة جميع الدفعات والفواتير والاشتراكات</p>
        </div>

        {/* التبويبات */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('payments')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'payments'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CreditCard className="inline mr-2 h-4 w-4" />
            الدفعات
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'invoices'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Download className="inline mr-2 h-4 w-4" />
            الفواتير
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`pb-4 px-4 font-medium transition-colors ${
              activeTab === 'subscriptions'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <RefreshCw className="inline mr-2 h-4 w-4" />
            الاشتراكات
          </button>
        </div>

        {/* الدفعات */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">إجمالي الدفعات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {paymentsQuery.data?.length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">الدفعات الناجحة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {paymentsQuery.data?.filter((p: any) => p.status === 'succeeded').length || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">الدفعات الفاشلة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {paymentsQuery.data?.filter((p: any) => p.status === 'failed').length || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>سجل الدفعات</CardTitle>
                <CardDescription>جميع الدفعات التي تمت من حسابك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-right py-3 px-4 font-medium text-gray-700">المبلغ</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">الحالة</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">البطاقة</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">التاريخ</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">الوصف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentsQuery.data?.map((payment: any) => (
                        <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            {formatCurrency(payment.amount, payment.currency)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(payment.status)}>
                              {getStatusLabel(payment.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            {payment.cardBrand && payment.cardLast4 ? (
                              <span className="text-gray-600">
                                {payment.cardBrand} •••• {payment.cardLast4}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {formatDate(payment.paidAt || payment.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 truncate max-w-xs">
                            {payment.description || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!paymentsQuery.data || paymentsQuery.data.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد دفعات حتى الآن
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* الفواتير */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الفواتير</CardTitle>
                <CardDescription>جميع الفواتير الصادرة لك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-right py-3 px-4 font-medium text-gray-700">رقم الفاتورة</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">المبلغ</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">الحالة</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">تاريخ الاستحقاق</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoicesQuery.data?.map((invoice: any) => (
                        <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{invoice.invoiceNumber}</td>
                          <td className="py-3 px-4">
                            {formatCurrency(invoice.amount, invoice.currency)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(invoice.status)}>
                              {getStatusLabel(invoice.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {formatDate(invoice.dueDate)}
                          </td>
                          <td className="py-3 px-4">
                            {invoice.pdfUrl && (
                              <a
                                href={invoice.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                تحميل PDF
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!invoicesQuery.data || invoicesQuery.data.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد فواتير حتى الآن
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* الاشتراكات */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الاشتراكات</CardTitle>
                <CardDescription>إدارة اشتراكاتك النشطة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-right py-3 px-4 font-medium text-gray-700">اسم الخطة</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">المبلغ</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">الفترة</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">الحالة</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-700">تاريخ الانتهاء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptionsQuery.data?.map((subscription: any) => (
                        <tr key={subscription.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{subscription.planName}</td>
                          <td className="py-3 px-4">
                            {formatCurrency(subscription.amount, subscription.currency)}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {subscription.interval === 'month' && 'شهري'}
                            {subscription.interval === 'year' && 'سنوي'}
                            {subscription.interval === 'week' && 'أسبوعي'}
                            {subscription.interval === 'day' && 'يومي'}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(subscription.status)}>
                              {getStatusLabel(subscription.status)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {formatDate(subscription.currentPeriodEnd)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!subscriptionsQuery.data || subscriptionsQuery.data.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد اشتراكات نشطة حتى الآن
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

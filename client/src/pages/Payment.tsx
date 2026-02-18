import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CreditCard, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/use-toast';

/**
 * صفحة نظام الدفع الإلكتروني المتكامل
 * Integrated Electronic Payment System Page
 */

export default function PaymentPage() {
  const { toast } = useToast();
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch data
  const { data: banks } = trpc.payment.getSupportedBanks.useQuery();
  const { data: transactions } = trpc.payment.getUserTransactions.useQuery({});
  const { data: pendingPayments } = trpc.payment.getPendingPayments.useQuery();
  const { data: statistics } = trpc.payment.getPaymentStatistics.useQuery({ period: 'month' });
  const { data: paymentSettings } = trpc.payment.getPaymentSettings.useQuery();

  // Mutations
  const initiateMutation = trpc.payment.initiatePayment.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'نجاح',
        description: 'تم بدء المعاملة بنجاح',
      });
      // إعادة التوجيه إلى بوابة البنك
      window.open(data.bankGatewayUrl, '_blank');
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في بدء المعاملة',
        variant: 'destructive',
      });
    },
  });

  const refundMutation = trpc.payment.initiateRefund.useMutation({
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم بدء عملية الاسترجاع',
      });
    },
  });

  const handleInitiatePayment = () => {
    if (!selectedBank || !paymentAmount) {
      toast({
        title: 'خطأ',
        description: 'الرجاء ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    initiateMutation.mutate({
      amount: parseFloat(paymentAmount),
      bankCode: selectedBank,
      paymentMethod: paymentMethod as any,
    });
    setIsProcessing(false);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'قيد الانتظار', variant: 'secondary' },
      processing: { label: 'قيد المعالجة', variant: 'secondary' },
      completed: { label: 'مكتملة', variant: 'default' },
      failed: { label: 'فشلت', variant: 'destructive' },
      cancelled: { label: 'ملغاة', variant: 'outline' },
      refunded: { label: 'مسترجعة', variant: 'outline' },
    };
    const config = statusMap[status] || { label: status, variant: 'default' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">نظام الدفع الإلكتروني</h1>
          <p className="text-gray-600 mt-2">إدارة المدفوعات والتحويلات البنكية مع البنوك الأردنية</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              إجمالي المدفوعات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics?.totalAmount?.toFixed(2) || '0.00'} د.ا
            </div>
            <p className="text-xs text-gray-600">هذا الشهر</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              المعاملات الناجحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.completedTransactions || 0}</div>
            <p className="text-xs text-gray-600">معاملة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              المعاملات المعلقة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.pendingTransactions || 0}</div>
            <p className="text-xs text-gray-600">معاملة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              معدل النجاح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.successRate?.toFixed(1) || '0'}%</div>
            <p className="text-xs text-gray-600">نسبة النجاح</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payment">إجراء دفع</TabsTrigger>
          <TabsTrigger value="transactions">المعاملات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إجراء دفع جديد</CardTitle>
              <CardDescription>
                اختر البنك وادخل المبلغ لبدء المعاملة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Alert */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  سيتم تحويلك إلى بوابة البنك الآمنة لإكمال عملية الدفع
                </AlertDescription>
              </Alert>

              {/* Payment Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>اختر البنك</Label>
                  <Select value={selectedBank} onValueChange={setSelectedBank}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر البنك..." />
                    </SelectTrigger>
                    <SelectContent>
                      {banks?.map((bank: any) => (
                        <SelectItem key={bank.id} value={bank.bankCode}>
                          {bank.bankNameAr} ({bank.bankName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>طريقة الدفع</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">بطاقة ائتمان</SelectItem>
                      <SelectItem value="debit_card">بطاقة خصم</SelectItem>
                      <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                      <SelectItem value="mobile_wallet">محفظة رقمية</SelectItem>
                      <SelectItem value="installment">تقسيط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>المبلغ (د.ا)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>

                <div>
                  <Label>العملة</Label>
                  <Select defaultValue="JOD">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JOD">دينار أردني (JOD)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                      <SelectItem value="EUR">يورو (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleInitiatePayment}
                disabled={isProcessing || initiateMutation.isPending}
                className="w-full"
                size="lg"
              >
                {isProcessing || initiateMutation.isPending ? 'جاري المعالجة...' : 'متابعة إلى البنك'}
              </Button>
            </CardContent>
          </Card>

          {/* Pending Payments */}
          {pendingPayments && pendingPayments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>الفواتير المعلقة</CardTitle>
                <CardDescription>
                  فواتير تنتظر الدفع
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingPayments.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">الفاتورة #{payment.invoiceId}</p>
                        <p className="text-sm text-gray-600">
                          تاريخ الاستحقاق: {new Date(payment.dueDate).toLocaleDateString('ar-JO')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{parseFloat(payment.amount).toFixed(2)} د.ا</p>
                        <Button
                          size="sm"
                          onClick={() => {
                            setPaymentAmount(payment.amount.toString());
                            // Scroll to payment form
                            document.querySelector('[value="payment"]')?.click();
                          }}
                        >
                          دفع الآن
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>سجل المعاملات</CardTitle>
              <CardDescription>
                جميع معاملاتك المالية
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>رقم المعاملة</TableHead>
                        <TableHead>البنك</TableHead>
                        <TableHead>المبلغ</TableHead>
                        <TableHead>التاريخ</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">
                            {transaction.referenceNumber}
                          </TableCell>
                          <TableCell>{transaction.bank?.bankNameAr}</TableCell>
                          <TableCell className="font-semibold">
                            {parseFloat(transaction.amount).toFixed(2)} {transaction.currency}
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.transactionDate).toLocaleDateString('ar-JO')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(transaction.status)}
                              {getStatusBadge(transaction.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {transaction.status === 'completed' && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline">
                                    استرجاع
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>طلب استرجاع المبلغ</DialogTitle>
                                  </DialogHeader>
                                  <RefundForm
                                    transactionId={transaction.id}
                                    amount={transaction.amount}
                                    onSuccess={() => {
                                      // Refresh transactions
                                    }}
                                  />
                                </DialogContent>
                              </Dialog>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  لا توجد معاملات حالياً
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الدفع</CardTitle>
              <CardDescription>
                إدارة تفضيلات الدفع والإشعارات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>تفعيل إشعارات الدفع</Label>
                  <input
                    type="checkbox"
                    defaultChecked={paymentSettings?.enablePaymentNotifications}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>إشعارات البريد الإلكتروني</Label>
                  <input
                    type="checkbox"
                    defaultChecked={paymentSettings?.enableEmailNotifications}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>إشعارات الرسائل النصية</Label>
                  <input
                    type="checkbox"
                    defaultChecked={paymentSettings?.enableSmsNotifications}
                    className="w-4 h-4"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>تفعيل المصادقة الثنائية</Label>
                  <input
                    type="checkbox"
                    defaultChecked={paymentSettings?.enableTwoFactorAuth}
                    className="w-4 h-4"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <Label className="mb-4 block">حدود المعاملات</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">الحد اليومي (د.ا)</Label>
                    <Input
                      type="number"
                      defaultValue={paymentSettings?.dailyTransactionLimit}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">الحد الشهري (د.ا)</Label>
                    <Input
                      type="number"
                      defaultValue={paymentSettings?.monthlyTransactionLimit}
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full">حفظ الإعدادات</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * نموذج طلب الاسترجاع
 * Refund Request Form
 */
function RefundForm({
  transactionId,
  amount,
  onSuccess,
}: {
  transactionId: number;
  amount: string;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [refundAmount, setRefundAmount] = useState(amount);
  const [reason, setReason] = useState('customer_request');
  const [description, setDescription] = useState('');

  const refundMutation = trpc.payment.initiateRefund.useMutation({
    onSuccess: () => {
      toast({
        title: 'نجاح',
        description: 'تم بدء عملية الاسترجاع',
      });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    refundMutation.mutate({
      transactionId,
      amount: parseFloat(refundAmount),
      reason: reason as any,
      description,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>مبلغ الاسترجاع (د.ا)</Label>
        <Input
          type="number"
          step="0.01"
          max={amount}
          value={refundAmount}
          onChange={(e) => setRefundAmount(e.target.value)}
        />
      </div>

      <div>
        <Label>السبب</Label>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="customer_request">طلب العميل</SelectItem>
            <SelectItem value="duplicate_charge">رسم مكرر</SelectItem>
            <SelectItem value="fraudulent">احتيالي</SelectItem>
            <SelectItem value="product_not_received">المنتج لم يُستلم</SelectItem>
            <SelectItem value="product_defective">المنتج معيب</SelectItem>
            <SelectItem value="service_not_provided">الخدمة لم تُقدم</SelectItem>
            <SelectItem value="other">أخرى</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>الوصف</Label>
        <Input
          placeholder="اشرح سبب الاسترجاع..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button
        type="submit"
        disabled={refundMutation.isPending}
        className="w-full"
      >
        {refundMutation.isPending ? 'جاري المعالجة...' : 'طلب الاسترجاع'}
      </Button>
    </form>
  );
}

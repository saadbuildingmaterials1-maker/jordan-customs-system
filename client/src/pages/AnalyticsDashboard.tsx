import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Truck,
  FileText,
  Calendar,
  Download,
  RefreshCw,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/components/ui/use-toast';

/**
 * لوحة التحكم التحليلية المتقدمة
 * Advanced Analytics Dashboard
 */

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsDashboard() {
  const { toast } = useToast();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch analytics data
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = trpc.analytics.getDashboardSummary.useQuery({ period });
  const { data: salesStats } = trpc.analytics.getSalesStatistics.useQuery({ period });
  const { data: paymentStats } = trpc.analytics.getPaymentStatistics.useQuery({ period });
  const { data: shippingStats } = trpc.analytics.getShippingStatistics.useQuery({ period });
  const { data: customsStats } = trpc.analytics.getCustomsStatistics.useQuery({ period });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchSummary();
    setRefreshing(false);
    toast({
      title: 'تم التحديث',
      description: 'تم تحديث البيانات بنجاح',
    });
  };

  const handleExport = () => {
    toast({
      title: 'قيد الإعداد',
      description: 'سيتم إضافة خاصية التصدير قريباً',
    });
  };

  // Prepare chart data
  const paymentMethodData = paymentStats ? Object.entries(paymentStats.paymentMethodDistribution).map(([name, value]) => ({
    name: getPaymentMethodLabel(name),
    value,
  })) : [];

  const statusDistributionData = salesStats ? Object.entries(salesStats.statusDistribution).map(([name, value]) => ({
    name: getStatusLabel(name),
    value,
  })) : [];

  const customsStatusData = customsStats ? Object.entries(customsStats.statusDistribution).map(([name, value]) => ({
    name: getCustomsStatusLabel(name),
    value,
  })) : [];

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">لوحة التحكم التحليلية</h1>
          <p className="text-gray-600 mt-2">تحليل شامل للمبيعات والمدفوعات والشحنات والجمارك</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {refreshing ? 'جاري التحديث...' : 'تحديث'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        <Select value={period} onValueChange={(value) => setPeriod(value as any)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">اليوم</SelectItem>
            <SelectItem value="week">هذا الأسبوع</SelectItem>
            <SelectItem value="month">هذا الشهر</SelectItem>
            <SelectItem value="year">هذه السنة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="إجمالي الإيرادات"
          value={summary?.summary?.totalRevenue || 0}
          currency="د.ا"
          icon={<DollarSign className="w-5 h-5" />}
          trend="up"
          percentage={12.5}
        />
        <MetricCard
          title="المدفوعات المعالجة"
          value={summary?.summary?.totalPaymentsProcessed || 0}
          currency="د.ا"
          icon={<ShoppingCart className="w-5 h-5" />}
          trend="up"
          percentage={8.2}
        />
        <MetricCard
          title="الشحنات"
          value={summary?.summary?.totalShipments || 0}
          icon={<Truck className="w-5 h-5" />}
          trend="down"
          percentage={-3.1}
        />
        <MetricCard
          title="التصريحات الجمركية"
          value={summary?.summary?.totalCustomsDeclarations || 0}
          icon={<FileText className="w-5 h-5" />}
          trend="up"
          percentage={5.4}
        />
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="sales">المبيعات</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="customs">الجمارك</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>اتجاه الإيرادات</CardTitle>
                <CardDescription>إجمالي الإيرادات على مدار الفترة</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={generateChartData(summary?.sales?.totalSales || 0, 7)}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Payment Success Rate */}
            <Card>
              <CardHeader>
                <CardTitle>معدل نجاح المدفوعات</CardTitle>
                <CardDescription>نسبة المعاملات الناجحة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-300 space-y-4">
                  <div className="text-5xl font-bold text-blue-600">
                    {paymentStats?.successRate?.toFixed(1) || 0}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full"
                      style={{ width: `${paymentStats?.successRate || 0}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {paymentStats?.completedTransactions || 0} معاملة ناجحة من {paymentStats?.totalTransactions || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Payment Methods Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع طرق الدفع</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Invoice Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع حالات الفواتير</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>ملخص المبيعات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">إجمالي المبيعات:</span>
                    <span className="font-bold">{salesStats?.totalSales?.toFixed(2) || 0} د.ا</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المبيعات المدفوعة:</span>
                    <span className="font-bold text-green-600">{salesStats?.paidSales?.toFixed(2) || 0} د.ا</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المبيعات المعلقة:</span>
                    <span className="font-bold text-yellow-600">{salesStats?.pendingSales?.toFixed(2) || 0} د.ا</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">متوسط قيمة الفاتورة:</span>
                    <span className="font-bold">{salesStats?.averageInvoiceValue?.toFixed(2) || 0} د.ا</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الرسوم والضرائب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الرسوم الجمركية:</span>
                    <span className="font-bold">{salesStats?.customsDuties?.toFixed(2) || 0} د.ا</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الضرائب:</span>
                    <span className="font-bold">{salesStats?.taxes?.toFixed(2) || 0} د.ا</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">الإجمالي:</span>
                    <span className="font-bold text-blue-600">
                      {((salesStats?.customsDuties || 0) + (salesStats?.taxes || 0)).toFixed(2)} د.ا
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>ملخص المدفوعات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">إجمالي المدفوعات:</span>
                    <span className="font-bold">{paymentStats?.totalPayments?.toFixed(2) || 0} د.ا</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المدفوعات المكتملة:</span>
                    <span className="font-bold text-green-600">{paymentStats?.completedPayments?.toFixed(2) || 0} د.ا</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المدفوعات الفاشلة:</span>
                    <span className="font-bold text-red-600">{paymentStats?.failedPayments?.toFixed(2) || 0} د.ا</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">متوسط قيمة المعاملة:</span>
                    <span className="font-bold">{paymentStats?.averageTransactionValue?.toFixed(2) || 0} د.ا</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع البنوك</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paymentStats?.bankDistribution && Object.entries(paymentStats.bankDistribution).map(([bank, count]) => (
                    <div key={bank} className="flex justify-between items-center">
                      <span className="text-sm">{bank}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customs Tab */}
        <TabsContent value="customs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>ملخص الجمارك</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">إجمالي التصريحات:</span>
                    <span className="font-bold">{customsStats?.totalDeclarations || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">القيمة المصرح بها:</span>
                    <span className="font-bold">{customsStats?.totalDeclaredValue?.toFixed(2) || 0} د.ا</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">إجمالي الرسوم:</span>
                    <span className="font-bold">{customsStats?.totalDuties?.toFixed(2) || 0} د.ا</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">إجمالي الضرائب:</span>
                    <span className="font-bold">{customsStats?.totalTaxes?.toFixed(2) || 0} د.ا</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">نسبة الموافقة:</span>
                    <span className="font-bold text-green-600">{customsStats?.approvalRate?.toFixed(1) || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع حالات التصريحات</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={customsStatusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * مكون بطاقة المقياس
 * Metric Card Component
 */
function MetricCard({
  title,
  value,
  currency,
  icon,
  trend,
  percentage,
}: {
  title: string;
  value: number;
  currency?: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  percentage: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{title}</span>
          {icon}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value.toFixed(2)} {currency || ''}
        </div>
        <div className="flex items-center gap-1 mt-2">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
            {Math.abs(percentage)}%
          </span>
          <span className="text-xs text-gray-600">من الفترة السابقة</span>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * دالة مساعدة لإنشاء بيانات الرسم البياني
 * Helper function to generate chart data
 */
function generateChartData(total: number, days: number) {
  const data = [];
  const dailyValue = total / days;

  for (let i = 0; i < days; i++) {
    data.push({
      name: `اليوم ${i + 1}`,
      value: Math.round(dailyValue * (0.8 + Math.random() * 0.4)),
    });
  }

  return data;
}

/**
 * دوال مساعدة للتسميات
 * Helper functions for labels
 */
function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    credit_card: 'بطاقة ائتمان',
    debit_card: 'بطاقة خصم',
    bank_transfer: 'تحويل بنكي',
    mobile_wallet: 'محفظة رقمية',
    installment: 'تقسيط',
  };
  return labels[method] || method;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'مسودة',
    issued: 'مُصدرة',
    approved: 'موافق عليها',
    cancelled: 'ملغاة',
  };
  return labels[status] || status;
}

function getCustomsStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'مسودة',
    submitted: 'مُرسلة',
    approved: 'موافق عليها',
    rejected: 'مرفوضة',
    cleared: 'مُخلصة',
  };
  return labels[status] || status;
}

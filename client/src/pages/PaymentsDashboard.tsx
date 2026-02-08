/**
 * Payments Dashboard
 * لوحة تحكم المدفوعات
 * 
 * عرض:
 * - سجل المدفوعات
 * - الإحصائيات المالية
 * - التقارير والرسوم البيانية
 * - إدارة المدفوعات
 * 
 * @module client/src/pages/PaymentsDashboard
 */

import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Filter,
  Search,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

/**
 * بيانات الدفعة
 */
interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'failed' | 'pending' | 'refunded' | 'cancelled';
  gateway: string;
  date: string;
  userName: string;
  userEmail: string;
}

/**
 * بيانات الإحصائيات
 */
interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  successRate: number;
  averageAmount: number;
}

/**
 * لوحة تحكم المدفوعات
 */
export const PaymentsDashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gatewayFilter, setGatewayFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // بيانات تجريبية للمدفوعات
  const mockPayments: Payment[] = [
    {
      id: '1',
      orderId: 'ORD-001',
      amount: 150,
      currency: 'JOD',
      status: 'completed',
      gateway: 'click',
      date: new Date().toISOString(),
      userName: 'أحمد محمد',
      userEmail: 'ahmed@example.com',
    },
    {
      id: '2',
      orderId: 'ORD-002',
      amount: 250,
      currency: 'JOD',
      status: 'completed',
      gateway: 'alipay',
      date: new Date(Date.now() - 86400000).toISOString(),
      userName: 'فاطمة علي',
      userEmail: 'fatima@example.com',
    },
    {
      id: '3',
      orderId: 'ORD-003',
      amount: 100,
      currency: 'JOD',
      status: 'failed',
      gateway: 'paypal',
      date: new Date(Date.now() - 172800000).toISOString(),
      userName: 'محمود حسن',
      userEmail: 'mahmoud@example.com',
    },
    {
      id: '4',
      orderId: 'ORD-004',
      amount: 300,
      currency: 'JOD',
      status: 'pending',
      gateway: 'payfort',
      date: new Date(Date.now() - 259200000).toISOString(),
      userName: 'ليلى إبراهيم',
      userEmail: 'leila@example.com',
    },
    {
      id: '5',
      orderId: 'ORD-005',
      amount: 200,
      currency: 'JOD',
      status: 'refunded',
      gateway: '2checkout',
      date: new Date(Date.now() - 345600000).toISOString(),
      userName: 'سارة محمود',
      userEmail: 'sarah@example.com',
    },
  ];

  // حساب الإحصائيات
  const stats = useMemo((): PaymentStats => {
    const completed = mockPayments.filter((p) => p.status === 'completed');
    const failed = mockPayments.filter((p) => p.status === 'failed');
    const pending = mockPayments.filter((p) => p.status === 'pending');

    const totalAmount = mockPayments.reduce((sum, p) => sum + p.amount, 0);
    const completedAmount = completed.reduce((sum, p) => sum + p.amount, 0);

    return {
      totalPayments: mockPayments.length,
      totalAmount,
      successfulPayments: completed.length,
      failedPayments: failed.length,
      pendingPayments: pending.length,
      successRate: (completed.length / mockPayments.length) * 100,
      averageAmount: totalAmount / mockPayments.length,
    };
  }, []);

  // بيانات الرسم البياني - الاتجاه
  const trendData = [
    { date: 'السبت', amount: 500, count: 3 },
    { date: 'الأحد', amount: 750, count: 5 },
    { date: 'الاثنين', amount: 600, count: 4 },
    { date: 'الثلاثاء', amount: 900, count: 6 },
    { date: 'الأربعاء', amount: 1200, count: 8 },
    { date: 'الخميس', amount: 1000, count: 7 },
    { date: 'الجمعة', amount: 800, count: 5 },
  ];

  // بيانات الرسم البياني - البوابات
  const gatewayData = [
    { name: 'Click', value: 35, color: '#3b82f6' },
    { name: 'Alipay', value: 25, color: '#10b981' },
    { name: 'PayPal', value: 20, color: '#f59e0b' },
    { name: 'PayFort', value: 15, color: '#8b5cf6' },
    { name: '2Checkout', value: 5, color: '#ef4444' },
  ];

  // بيانات الرسم البياني - الحالات
  const statusData = [
    { name: 'ناجح', value: stats.successfulPayments, color: '#10b981' },
    { name: 'فاشل', value: stats.failedPayments, color: '#ef4444' },
    { name: 'قيد الانتظار', value: stats.pendingPayments, color: '#f59e0b' },
  ];

  // تصفية المدفوعات
  const filteredPayments = useMemo(() => {
    return mockPayments.filter((payment) => {
      const matchesSearch =
        payment.orderId.includes(searchTerm) ||
        payment.userName.includes(searchTerm) ||
        payment.userEmail.includes(searchTerm);

      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      const matchesGateway = gatewayFilter === 'all' || payment.gateway === gatewayFilter;

      return matchesSearch && matchesStatus && matchesGateway;
    });
  }, [searchTerm, statusFilter, gatewayFilter]);

  // الحصول على لون الحالة
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      refunded: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // الحصول على نص الحالة
  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      completed: 'ناجح',
      failed: 'فاشل',
      pending: 'قيد الانتظار',
      refunded: 'مسترجع',
      cancelled: 'ملغى',
    };
    return texts[status] || status;
  };

  // تصدير التقرير
  const handleExportReport = () => {
    const csv = [
      ['رقم الطلب', 'المبلغ', 'العملة', 'الحالة', 'البوابة', 'التاريخ', 'المستخدم'],
      ...filteredPayments.map((p) => [
        p.orderId,
        p.amount,
        p.currency,
        getStatusText(p.status),
        p.gateway,
        new Date(p.date).toLocaleDateString('ar-JO'),
        p.userName,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `payments_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              لوحة تحكم المدفوعات
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              إدارة وتتبع جميع المدفوعات والإحصائيات المالية
            </p>
          </div>
          <Button onClick={handleExportReport} className="gap-2">
            <Download className="w-4 h-4" />
            تصدير التقرير
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Payments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                إجمالي المدفوعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalPayments}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">عملية دفع</p>
                </div>
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* Total Amount */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                المبلغ الإجمالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalAmount.toLocaleString()}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">JOD</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Successful Payments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                المدفوعات الناجحة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.successfulPayments}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.successRate.toFixed(1)}% نسبة النجاح
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Failed Payments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                المدفوعات الفاشلة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.failedPayments}
                  </div>
                  <p className="text-xs text-red-600 mt-1">تحتاج متابعة</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          {/* Average Amount */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                متوسط المبلغ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.averageAmount.toFixed(0)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">JOD</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>اتجاه المدفوعات</CardTitle>
              <CardDescription>آخر 7 أيام</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    name="المبلغ"
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    name="العدد"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع الحالات</CardTitle>
              <CardDescription>نسبة المدفوعات حسب الحالة</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>سجل المدفوعات</CardTitle>
                <CardDescription>جميع المدفوعات والمعاملات</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  تصفية
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="بحث عن رقم الطلب أو المستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="completed">ناجح</SelectItem>
                  <SelectItem value="failed">فاشل</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="refunded">مسترجع</SelectItem>
                </SelectContent>
              </Select>

              <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="البوابة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع البوابات</SelectItem>
                  <SelectItem value="click">Click</SelectItem>
                  <SelectItem value="alipay">Alipay</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="payfort">PayFort</SelectItem>
                  <SelectItem value="2checkout">2Checkout</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="الفترة الزمنية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">هذا الأسبوع</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                  <SelectItem value="year">هذا العام</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead className="text-right">رقم الطلب</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">البوابة</TableHead>
                    <TableHead className="text-right">المستخدم</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="font-medium">{payment.orderId}</TableCell>
                      <TableCell>
                        {payment.amount.toLocaleString()} {payment.currency}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusText(payment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="uppercase text-sm">{payment.gateway}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.userName}</p>
                          <p className="text-sm text-gray-500">{payment.userEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.date).toLocaleDateString('ar-JO')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          عرض التفاصيل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredPayments.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">لا توجد مدفوعات تطابق معايير البحث</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentsDashboard;

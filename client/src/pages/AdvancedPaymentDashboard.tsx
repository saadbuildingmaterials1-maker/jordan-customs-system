import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Download,
  Filter,
} from 'lucide-react';

// بيانات تجريبية
const paymentData = [
  { month: 'يناير', hyperpay: 45000, telr: 32000, total: 77000 },
  { month: 'فبراير', hyperpay: 52000, telr: 38000, total: 90000 },
  { month: 'مارس', hyperpay: 48000, telr: 41000, total: 89000 },
  { month: 'أبريل', hyperpay: 61000, telr: 45000, total: 106000 },
  { month: 'مايو', hyperpay: 55000, telr: 39000, total: 94000 },
  { month: 'يونيو', hyperpay: 67000, telr: 48000, total: 115000 },
];

const gatewayStats = [
  { name: 'HyperPay', value: 328000, percentage: 58 },
  { name: 'Telr', value: 243000, percentage: 42 },
];

const transactionStatus = [
  { status: 'نجح', count: 1245, percentage: 92 },
  { status: 'قيد الانتظار', count: 78, percentage: 6 },
  { status: 'فشل', count: 32, percentage: 2 },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdvancedPaymentDashboard() {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedGateway, setSelectedGateway] = useState('all');

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const totalRevenue = paymentData.reduce((sum, item) => sum + item.total, 0);
    const avgTransaction = totalRevenue / paymentData.length;
    const successRate = 92;

    return {
      totalRevenue: totalRevenue.toLocaleString('ar-JO'),
      avgTransaction: avgTransaction.toLocaleString('ar-JO', { maximumFractionDigits: 0 }),
      successRate,
      totalTransactions: 1355,
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            لوحة تحكم الدفع المتقدمة
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            تحليل شامل لمعاملات الدفع والإحصائيات
          </p>
        </div>

        {/* الفلاتر */}
        <div className="flex gap-4 flex-wrap">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر الفترة الزمنية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">آخر شهر</SelectItem>
              <SelectItem value="3months">آخر 3 أشهر</SelectItem>
              <SelectItem value="6months">آخر 6 أشهر</SelectItem>
              <SelectItem value="1year">آخر سنة</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedGateway} onValueChange={setSelectedGateway}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر البوابة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع البوابات</SelectItem>
              <SelectItem value="hyperpay">HyperPay</SelectItem>
              <SelectItem value="telr">Telr</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            فلاتر متقدمة
          </Button>

          <Button className="gap-2 ml-auto">
            <Download className="w-4 h-4" />
            تحميل التقرير
          </Button>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* إجمالي الإيرادات */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue} د.ا</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                <TrendingUp className="w-3 h-3 inline text-green-600 mr-1" />
                زيادة 12% عن الشهر السابق
              </p>
            </CardContent>
          </Card>

          {/* متوسط المعاملة */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط المعاملة</CardTitle>
              <CreditCard className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgTransaction} د.ا</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                من {stats.totalTransactions.toLocaleString('ar-JO')} معاملة
              </p>
            </CardContent>
          </Card>

          {/* معدل النجاح */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل النجاح</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                معاملات ناجحة
              </p>
            </CardContent>
          </Card>

          {/* المعاملات الفاشلة */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المعاملات الفاشلة</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                2% من المعاملات
              </p>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* رسم بياني خطي - الإيرادات بمرور الوقت */}
          <Card>
            <CardHeader>
              <CardTitle>الإيرادات بمرور الوقت</CardTitle>
              <CardDescription>
                مقارنة بين HyperPay و Telr
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={paymentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString('ar-JO')} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="hyperpay"
                    stroke="#3b82f6"
                    name="HyperPay"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="telr"
                    stroke="#10b981"
                    name="Telr"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* رسم بياني دائري - توزيع البوابات */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع البوابات</CardTitle>
              <CardDescription>
                نسبة المعاملات لكل بوابة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gatewayStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gatewayStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString('ar-JO')} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* رسم بياني عمودي - إجمالي الإيرادات */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>إجمالي الإيرادات الشهرية</CardTitle>
              <CardDescription>
                مقارنة الإيرادات الإجمالية لكل شهر
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={paymentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => value.toLocaleString('ar-JO')} />
                  <Legend />
                  <Bar dataKey="total" fill="#3b82f6" name="الإجمالي" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* جدول المعاملات الأخيرة */}
        <Card>
          <CardHeader>
            <CardTitle>آخر المعاملات</CardTitle>
            <CardDescription>
              قائمة بآخر 10 معاملات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4">رقم المعاملة</th>
                    <th className="text-right py-3 px-4">البوابة</th>
                    <th className="text-right py-3 px-4">المبلغ</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                    <th className="text-right py-3 px-4">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'TXN-001', gateway: 'HyperPay', amount: '5,000', status: 'نجح', date: '2026-02-18' },
                    { id: 'TXN-002', gateway: 'Telr', amount: '3,500', status: 'نجح', date: '2026-02-18' },
                    { id: 'TXN-003', gateway: 'HyperPay', amount: '2,750', status: 'نجح', date: '2026-02-17' },
                    { id: 'TXN-004', gateway: 'Telr', amount: '4,200', status: 'قيد الانتظار', date: '2026-02-17' },
                    { id: 'TXN-005', gateway: 'HyperPay', amount: '1,800', status: 'فشل', date: '2026-02-16' },
                  ].map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 font-semibold">{transaction.id}</td>
                      <td className="py-3 px-4">{transaction.gateway}</td>
                      <td className="py-3 px-4">{transaction.amount} د.ا</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            transaction.status === 'نجح'
                              ? 'default'
                              : transaction.status === 'قيد الانتظار'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{transaction.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

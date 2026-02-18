import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Target,
  Calendar,
  Download,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  BarChart3,
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SalesMetric {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export default function SalesDashboard() {
  const [timeRange, setTimeRange] = useState('month');

  const salesMetrics: SalesMetric[] = [
    {
      label: 'إجمالي المبيعات',
      value: '$125,400',
      change: 12.5,
      icon: <DollarSign className="w-8 h-8" />,
      color: 'text-green-600',
    },
    {
      label: 'عدد الطلبات',
      value: '1,245',
      change: 8.3,
      icon: <ShoppingCart className="w-8 h-8" />,
      color: 'text-blue-600',
    },
    {
      label: 'العملاء الجدد',
      value: '342',
      change: 5.2,
      icon: <Users className="w-8 h-8" />,
      color: 'text-purple-600',
    },
    {
      label: 'معدل التحويل',
      value: '3.2%',
      change: 2.1,
      icon: <Target className="w-8 h-8" />,
      color: 'text-yellow-600',
    },
  ];

  const salesData = [
    { month: 'يناير', sales: 45000, target: 50000, profit: 12000 },
    { month: 'فبراير', sales: 52000, target: 50000, profit: 14000 },
    { month: 'مارس', sales: 48000, target: 50000, profit: 13000 },
    { month: 'أبريل', sales: 61000, target: 55000, profit: 16000 },
    { month: 'مايو', sales: 55000, target: 55000, profit: 15000 },
    { month: 'يونيو', sales: 67000, target: 60000, profit: 18000 },
  ];

  const productSales = [
    { name: 'الشحن المحلي', value: 450, percentage: 36 },
    { name: 'الشحن الدولي', value: 380, percentage: 31 },
    { name: 'الخدمات الجمركية', value: 280, percentage: 23 },
    { name: 'خدمات أخرى', value: 135, percentage: 10 },
  ];

  const topProducts = [
    { name: 'خدمة الشحن السريع', sales: 450, revenue: 45000, trend: 'up' },
    { name: 'خدمة الشحن العادي', sales: 380, revenue: 38000, trend: 'up' },
    { name: 'التصريح الجمركي', sales: 280, revenue: 28000, trend: 'down' },
    { name: 'خدمة التخزين', sales: 135, revenue: 13500, trend: 'up' },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              لوحة تحكم المبيعات
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              تحليل شامل للمبيعات والإيرادات والأرباح
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              فلاتر
            </Button>
            <Button className="gap-2">
              <Download className="w-4 h-4" />
              تحميل التقرير
            </Button>
          </div>
        </div>

        {/* اختيار نطاق الوقت */}
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map(range => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              onClick={() => setTimeRange(range)}
              className="gap-1"
            >
              <Calendar className="w-4 h-4" />
              {range === 'week' ? 'أسبوع' :
               range === 'month' ? 'شهر' :
               range === 'quarter' ? 'ربع سنة' :
               'سنة'}
            </Button>
          ))}
        </div>

        {/* مؤشرات المبيعات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {salesMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{metric.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {metric.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      {metric.change > 0 ? (
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={metric.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} style={{ fontSize: '0.875rem' }}>
                        {Math.abs(metric.change)}% هذا الشهر
                      </span>
                    </div>
                  </div>
                  <div className={`${metric.color} opacity-20`}>
                    {metric.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* المبيعات والأرباح */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                المبيعات والأرباح
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#3b82f6" name="المبيعات" />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" name="الأرباح" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* توزيع المبيعات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                توزيع المبيعات حسب الفئة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={productSales}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productSales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* أفضل المنتجات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              أفضل الخدمات والمنتجات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {product.sales} عملية بيع
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      ${product.revenue.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      {product.trend === 'up' ? (
                        <>
                          <ArrowUp className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">صاعد</span>
                        </>
                      ) : (
                        <>
                          <ArrowDown className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-600">هابط</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* الأهداف والإنجازات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                الأهداف الشهرية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="font-semibold text-gray-900 dark:text-white">هدف المبيعات</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">$60,000</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '112%' }}></div>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">تم تحقيق 112% من الهدف</p>
              </div>

              <div className="p-3 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="font-semibold text-gray-900 dark:text-white">هدف الأرباح</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">$15,000</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '120%' }}></div>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">تم تحقيق 120% من الهدف</p>
              </div>

              <div className="p-3 border border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <p className="font-semibold text-gray-900 dark:text-white">هدف العملاء الجدد</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">300 عميل</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '114%' }}></div>
                </div>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">تم تحقيق 114% من الهدف</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                الفرص والتحديات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="font-semibold text-gray-900 dark:text-white">فرص النمو</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  ✓ زيادة الطلب على الخدمات الجمركية
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ✓ توسع السوق الدولي
                </p>
              </div>

              <div className="p-3 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <p className="font-semibold text-gray-900 dark:text-white">التحديات</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  ⚠ المنافسة المتزايدة في السوق
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ⚠ تقلبات أسعار الشحن
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: راقب مؤشرات المبيعات بانتظام واستخدم البيانات لاتخاذ قرارات استراتيجية. ركز على الخدمات الأكثر ربحية وطور خطط لزيادة المبيعات.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

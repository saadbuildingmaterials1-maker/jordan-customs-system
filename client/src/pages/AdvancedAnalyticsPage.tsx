import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart,
  PieChart,
  LineChart,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  DollarSign,
  Users,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
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

interface KPI {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export default function AdvancedAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('month');

  const kpis: KPI[] = [
    {
      label: 'إجمالي الإيرادات',
      value: '$125,400',
      change: 12.5,
      icon: <DollarSign className="w-8 h-8" />,
      color: 'text-green-600',
    },
    {
      label: 'عدد الطلبات',
      value: '1,245',
      change: 8.3,
      icon: <Package className="w-8 h-8" />,
      color: 'text-blue-600',
    },
    {
      label: 'عدد العملاء النشطين',
      value: '342',
      change: 5.2,
      icon: <Users className="w-8 h-8" />,
      color: 'text-purple-600',
    },
    {
      label: 'معدل الرضا',
      value: '4.7/5',
      change: 2.1,
      icon: <CheckCircle className="w-8 h-8" />,
      color: 'text-yellow-600',
    },
  ];

  const revenueData = [
    { month: 'يناير', revenue: 45000, target: 50000 },
    { month: 'فبراير', revenue: 52000, target: 50000 },
    { month: 'مارس', revenue: 48000, target: 50000 },
    { month: 'أبريل', revenue: 61000, target: 55000 },
    { month: 'مايو', revenue: 55000, target: 55000 },
    { month: 'يونيو', revenue: 67000, target: 60000 },
  ];

  const orderData = [
    { category: 'شحن محلي', value: 450, percentage: 36 },
    { category: 'شحن دولي', value: 380, percentage: 31 },
    { category: 'خدمات جمركية', value: 280, percentage: 23 },
    { category: 'خدمات أخرى', value: 135, percentage: 10 },
  ];

  const performanceData = [
    { week: 'الأسبوع 1', efficiency: 85, quality: 90, speed: 78 },
    { week: 'الأسبوع 2', efficiency: 88, quality: 92, speed: 82 },
    { week: 'الأسبوع 3', efficiency: 90, quality: 88, speed: 85 },
    { week: 'الأسبوع 4', efficiency: 92, quality: 94, speed: 88 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              نظام التحليلات المتقدمة
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              مؤشرات الأداء الرئيسية والتحليلات الشاملة
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

        {/* مؤشرات الأداء الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{kpi.label}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {kpi.value}
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">
                        +{kpi.change}% هذا الشهر
                      </span>
                    </div>
                  </div>
                  <div className={`${kpi.color} opacity-20`}>
                    {kpi.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* الإيرادات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5" />
                الإيرادات مقابل الهدف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="الإيرادات الفعلية" />
                  <Line type="monotone" dataKey="target" stroke="#10b981" name="الهدف" strokeDasharray="5 5" />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* توزيع الطلبات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                توزيع الطلبات حسب الفئة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={orderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* مؤشرات الأداء */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              مؤشرات الأداء الأسبوعية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="efficiency" fill="#3b82f6" name="الكفاءة %" />
                <Bar dataKey="quality" fill="#10b981" name="الجودة %" />
                <Bar dataKey="speed" fill="#f59e0b" name="السرعة %" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* الأفضليات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                أفضل الأداء
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="font-semibold text-gray-900 dark:text-white">أعلى إيرادات</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">يونيو: 67,000 دولار</p>
              </div>
              <div className="p-3 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="font-semibold text-gray-900 dark:text-white">أفضل جودة</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">الأسبوع الرابع: 94%</p>
              </div>
              <div className="p-3 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="font-semibold text-gray-900 dark:text-white">أعلى كفاءة</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">الأسبوع الرابع: 92%</p>
              </div>
            </CardContent>
          </Card>

          {/* المجالات التي تحتاج تحسين */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                مجالات التحسين
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <p className="font-semibold text-gray-900 dark:text-white">سرعة المعالجة</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">الأسبوع الأول: 78% (أقل من الهدف)</p>
              </div>
              <div className="p-3 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <p className="font-semibold text-gray-900 dark:text-white">الإيرادات في مارس</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">48,000 دولار (أقل من الهدف بـ 4%)</p>
              </div>
              <div className="p-3 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <p className="font-semibold text-gray-900 dark:text-white">جودة الخدمة</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">الأسبوع الثالث: 88% (انخفاض طفيف)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: استخدم هذه التحليلات لاتخاذ قرارات استراتيجية. ركز على تحسين مجالات الضعف وحافظ على نقاط القوة. تابع مؤشرات الأداء الرئيسية بانتظام لضمان النمو المستمر.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

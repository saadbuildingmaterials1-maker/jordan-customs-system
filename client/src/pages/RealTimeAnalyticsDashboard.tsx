import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import {
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  AlertCircle,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Zap,
  Clock,
  Target,
  Award,
} from 'lucide-react';

export default function RealTimeAnalyticsDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('week');

  const revenueData = [
    { day: 'الأحد', revenue: 4200, target: 5000, actual: 4200 },
    { day: 'الاثنين', revenue: 5100, target: 5000, actual: 5100 },
    { day: 'الثلاثاء', revenue: 4800, target: 5000, actual: 4800 },
    { day: 'الأربعاء', revenue: 6200, target: 5000, actual: 6200 },
    { day: 'الخميس', revenue: 5900, target: 5000, actual: 5900 },
    { day: 'الجمعة', revenue: 7100, target: 5000, actual: 7100 },
    { day: 'السبت', revenue: 6800, target: 5000, actual: 6800 },
  ];

  const performanceData = [
    { metric: 'معدل التحويل', value: 8.5, target: 10 },
    { metric: 'رضا العملاء', value: 92, target: 95 },
    { metric: 'الأداء', value: 88, target: 90 },
    { metric: 'الكفاءة', value: 85, target: 90 },
  ];

  const categoryDistribution = [
    { name: 'الشحن', value: 35, color: '#3b82f6' },
    { name: 'الجمارك', value: 28, color: '#10b981' },
    { name: 'الخدمات', value: 22, color: '#f59e0b' },
    { name: 'أخرى', value: 15, color: '#ef4444' },
  ];

  const topProducts = [
    { name: 'الشحن السريع', sales: 1250, growth: '+15%' },
    { name: 'الشحن الدولي', sales: 980, growth: '+8%' },
    { name: 'خدمة الجمارك', sales: 750, growth: '+12%' },
    { name: 'التخزين المؤقت', sales: 520, growth: '+5%' },
  ];

  const kpis = [
    { label: 'إجمالي الإيرادات', value: '$45,200', change: '+12.5%', icon: DollarSign, color: 'text-green-600' },
    { label: 'عدد العملاء النشطين', value: '324', change: '+8.2%', icon: Users, color: 'text-blue-600' },
    { label: 'الطلبات المعلقة', value: '42', change: '-3.1%', icon: Package, color: 'text-yellow-600' },
    { label: 'معدل الرضا', value: '92%', change: '+2.3%', icon: Award, color: 'text-purple-600' },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              لوحة تحكم التحليلات الفعلية
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              مراقبة الأداء والمؤشرات الرئيسية في الوقت الفعلي
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              تصدير
            </Button>
          </div>
        </div>

        {/* نطاق الوقت */}
        <div className="flex gap-2">
          {['today', 'week', 'month', 'year'].map(range => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === 'today' && 'اليوم'}
              {range === 'week' && 'هذا الأسبوع'}
              {range === 'month' && 'هذا الشهر'}
              {range === 'year' && 'هذه السنة'}
            </Button>
          ))}
        </div>

        {/* مؤشرات الأداء الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">{kpi.label}</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {kpi.value}
                      </p>
                      <p className="text-sm text-green-600 mt-2">{kpi.change}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${kpi.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* الإيرادات اليومية */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                الإيرادات اليومية مقابل الأهداف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="الإيرادات الفعلية"
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="#10b981"
                    fillOpacity={0.3}
                    fill="#10b981"
                    name="الهدف"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* توزيع الفئات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                توزيع الفئات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* أداء المؤشرات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              أداء المؤشرات الرئيسية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="القيمة الحالية" />
                <Bar dataKey="target" fill="#10b981" name="الهدف" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* أفضل المنتجات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              أفضل المنتجات والخدمات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    {product.growth}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(product.sales / 1250) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${product.sales}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* التنبيهات والتوصيات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              ⚠️ تنبيه: هناك 5 فواتير متأخرة بقيمة إجمالية $2,150. يرجى متابعة العملاء.
            </AlertDescription>
          </Alert>

          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              ✅ إنجاز: تم تحقيق 105% من هدف الإيرادات هذا الأسبوع!
            </AlertDescription>
          </Alert>
        </div>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: راقب مؤشرات الأداء الرئيسية بانتظام وقارنها مع الأهداف. استخدم البيانات لاتخاذ قرارات استراتيجية مستنيرة.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

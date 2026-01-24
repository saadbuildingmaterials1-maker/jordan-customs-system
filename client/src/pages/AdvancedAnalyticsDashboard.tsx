import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, AlertCircle, CheckCircle } from 'lucide-react';

interface AnalyticsData {
  date: string;
  revenue: number;
  expenses: number;
  declarations: number;
  variance: number;
}

interface KPICard {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down';
}

export function AdvancedAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // بيانات تجريبية - يتم استبدالها بـ API حقيقي
  const analyticsData: AnalyticsData[] = useMemo(() => {
    const data: AnalyticsData[] = [];
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));

      data.push({
        date: date.toLocaleDateString('ar-JO'),
        revenue: Math.floor(Math.random() * 50000) + 10000,
        expenses: Math.floor(Math.random() * 30000) + 5000,
        declarations: Math.floor(Math.random() * 100) + 10,
        variance: Math.random() * 20 - 10,
      });
    }

    return data;
  }, [timeRange]);

  const kpis: KPICard[] = useMemo(() => {
    const totalRevenue = analyticsData.reduce((sum, d) => sum + d.revenue, 0);
    const totalExpenses = analyticsData.reduce((sum, d) => sum + d.expenses, 0);
    const totalDeclarations = analyticsData.reduce((sum, d) => sum + d.declarations, 0);
    const avgVariance = analyticsData.reduce((sum, d) => sum + d.variance, 0) / analyticsData.length;

    return [
      {
        title: 'إجمالي الإيرادات',
        value: `د.ا ${(totalRevenue / 1000).toFixed(1)}K`,
        change: 12.5,
        icon: <DollarSign className="w-5 h-5" />,
        trend: 'up',
      },
      {
        title: 'إجمالي المصاريف',
        value: `د.ا ${(totalExpenses / 1000).toFixed(1)}K`,
        change: -8.3,
        icon: <Package className="w-5 h-5" />,
        trend: 'down',
      },
      {
        title: 'عدد البيانات الجمركية',
        value: totalDeclarations.toString(),
        change: 5.2,
        icon: <CheckCircle className="w-5 h-5" />,
        trend: 'up',
      },
      {
        title: 'متوسط الانحراف',
        value: `${avgVariance.toFixed(2)}%`,
        change: -3.1,
        icon: <AlertCircle className="w-5 h-5" />,
        trend: 'down',
      },
    ];
  }, [analyticsData]);

  const categoryData = [
    { name: 'رسوم جمركية', value: 35, fill: '#3b82f6' },
    { name: 'أجور شحن', value: 25, fill: '#10b981' },
    { name: 'تأمين', value: 20, fill: '#f59e0b' },
    { name: 'رسوم خدمات', value: 15, fill: '#ef4444' },
    { name: 'غرامات', value: 5, fill: '#8b5cf6' },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* رؤوس الصفحة */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحليلات المتقدمة</h1>
          <p className="text-gray-600 mt-2">تحليل شامل للبيانات والأداء المالي</p>
        </div>

        {/* اختيار نطاق الوقت */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {range === '7d' ? 'أسبوع' : range === '30d' ? 'شهر' : range === '90d' ? '3 أشهر' : 'سنة'}
            </button>
          ))}
        </div>
      </div>

      {/* بطاقات KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className="text-blue-600">{kpi.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className={`text-xs mt-2 flex items-center gap-1 ${
                kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(kpi.change)}% {kpi.trend === 'up' ? 'زيادة' : 'انخفاض'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* رسم بياني للإيرادات والمصاريف */}
        <Card>
          <CardHeader>
            <CardTitle>الإيرادات والمصاريف</CardTitle>
            <CardDescription>مقارنة الإيرادات والمصاريف على مدار الفترة</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  name="الإيرادات"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  name="المصاريف"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* رسم بياني للبيانات الجمركية */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الرسوم</CardTitle>
            <CardDescription>توزيع أنواع الرسوم المختلفة</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* رسم بياني للبيانات الجمركية اليومية */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>عدد البيانات الجمركية اليومية</CardTitle>
            <CardDescription>تطور عدد البيانات الجمركية المسجلة</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="declarations" fill="#10b981" name="البيانات الجمركية" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* جدول التفاصيل */}
      <Card>
        <CardHeader>
          <CardTitle>تفاصيل البيانات</CardTitle>
          <CardDescription>بيانات مفصلة عن الأداء اليومي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2 px-4">التاريخ</th>
                  <th className="text-right py-2 px-4">الإيرادات</th>
                  <th className="text-right py-2 px-4">المصاريف</th>
                  <th className="text-right py-2 px-4">الربح</th>
                  <th className="text-right py-2 px-4">البيانات الجمركية</th>
                  <th className="text-right py-2 px-4">الانحراف</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.slice(-10).reverse().map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{row.date}</td>
                    <td className="py-2 px-4">د.ا {row.revenue.toLocaleString()}</td>
                    <td className="py-2 px-4">د.ا {row.expenses.toLocaleString()}</td>
                    <td className="py-2 px-4 font-semibold text-green-600">
                      د.ا {(row.revenue - row.expenses).toLocaleString()}
                    </td>
                    <td className="py-2 px-4">{row.declarations}</td>
                    <td className={`py-2 px-4 ${row.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {row.variance > 0 ? '+' : ''}{row.variance.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

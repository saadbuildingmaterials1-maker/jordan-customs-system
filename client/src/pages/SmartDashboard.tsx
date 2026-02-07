/**
 * SmartDashboard Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/SmartDashboard
 */
import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';

export default function SmartDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // بيانات تجريبية للرسوم البيانية
  const trendData = [
    { date: '1 يناير', amount: 50000, forecast: 52000 },
    { date: '8 يناير', amount: 65000, forecast: 63000 },
    { date: '15 يناير', amount: 58000, forecast: 61000 },
    { date: '22 يناير', amount: 72000, forecast: 70000 },
  ];

  const costBreakdown = [
    { name: 'رسوم جمركية', value: 35, fill: '#3b82f6' },
    { name: 'ضريبة مبيعات', value: 25, fill: '#10b981' },
    { name: 'شحن وتأمين', value: 25, fill: '#f59e0b' },
    { name: 'رسوم إضافية', value: 15, fill: '#ef4444' },
  ];

  const performanceData = [
    { category: 'دقة التنبؤ', actual: 92, target: 95 },
    { category: 'سرعة المعالجة', actual: 88, target: 90 },
    { category: 'دقة الحسابات', actual: 99, target: 100 },
    { category: 'رضا المستخدم', actual: 85, target: 90 },
  ];

  const metrics = useMemo(() => ({
    totalDeclarations: 1250,
    totalValue: 5250000,
    averageCost: 4200,
    pendingDeclarations: 45,
    completedDeclarations: 1205,
    varianceRate: 3.5,
  }), []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* الرأس */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم الذكية</h1>
            <p className="text-gray-600 mt-2">تحليل شامل وتنبؤات ذكية للبيانات الجمركية</p>
          </div>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                onClick={() => setTimeRange(range)}
              >
                {range === 'week' ? 'أسبوع' : range === 'month' ? 'شهر' : 'سنة'}
              </Button>
            ))}
          </div>
        </div>

        {/* المقاييس الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                إجمالي البيانات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalDeclarations.toLocaleString('ar-JO')}</div>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                زيادة 12% عن الشهر السابق
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                إجمالي القيمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.totalValue / 1000000).toFixed(2)}M JOD
              </div>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                زيادة 8% عن الشهر السابق
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                متوسط التكلفة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.averageCost.toLocaleString('ar-JO')} JOD
              </div>
              <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                انخفاض 2% عن الشهر السابق
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                معدل الانحراف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.varianceRate}%</div>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                ضمن الحد المقبول
              </p>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* اتجاه القيم */}
          <Card>
            <CardHeader>
              <CardTitle>اتجاه القيم والتنبؤات</CardTitle>
              <CardDescription>مقارنة القيم الفعلية مع التنبؤات</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" name="القيمة الفعلية" />
                  <Line type="monotone" dataKey="forecast" stroke="#10b981" name="التنبؤ" strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* توزيع التكاليف */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع التكاليف</CardTitle>
              <CardDescription>نسبة كل نوع من أنواع التكاليف</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* مؤشرات الأداء */}
        <Card>
          <CardHeader>
            <CardTitle>مؤشرات الأداء الرئيسية</CardTitle>
            <CardDescription>مقارنة الأداء الفعلي مع الأهداف</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="actual" fill="#3b82f6" name="الفعلي" />
                <Bar dataKey="target" fill="#10b981" name="الهدف" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* الحالة والتنبيهات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>حالة البيانات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">بيانات مكتملة</p>
                  <p className="text-sm text-blue-700">{metrics.completedDeclarations} بيان</p>
                </div>
                <Badge className="bg-blue-600">
                  {((metrics.completedDeclarations / metrics.totalDeclarations) * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-yellow-900">بيانات قيد المعالجة</p>
                  <p className="text-sm text-yellow-700">{metrics.pendingDeclarations} بيان</p>
                </div>
                <Badge className="bg-yellow-600">
                  {((metrics.pendingDeclarations / metrics.totalDeclarations) * 100).toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>التنبيهات والتحذيرات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">انحراف كبير</p>
                  <p className="text-sm text-red-700">5 بيانات بها انحراف أكثر من 10%</p>
                </div>
              </div>
              <div className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">أداء ممتاز</p>
                  <p className="text-sm text-green-700">معدل دقة الحسابات 99%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

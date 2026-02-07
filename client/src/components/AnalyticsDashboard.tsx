/**
 * AnalyticsDashboard Component
 * 
 * مكون React
 * 
 * @module ./client/src/components/AnalyticsDashboard
 */
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Zap,
} from 'lucide-react';

interface AnalyticsData {
  period: string;
  declarations: number;
  shipments: number;
  costs: number;
  revenue: number;
}

interface AlertData {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  description: string;
  timestamp: Date;
}

/**
 * مكون لوحة التحليلات المتقدمة
 * يعرض رسوم بيانية وإحصائيات تفصيلية عن الأداء
 */
export function AnalyticsDashboard() {
  // بيانات الأداء على مدار الأسابيع
  const performanceData: AnalyticsData[] = useMemo(
    () => [
      { period: 'الأسبوع 1', declarations: 45, shipments: 12, costs: 15000, revenue: 18000 },
      { period: 'الأسبوع 2', declarations: 52, shipments: 15, costs: 18500, revenue: 21000 },
      { period: 'الأسبوع 3', declarations: 38, shipments: 10, costs: 12000, revenue: 16000 },
      { period: 'الأسبوع 4', declarations: 61, shipments: 18, costs: 22000, revenue: 25000 },
      { period: 'الأسبوع 5', declarations: 55, shipments: 14, costs: 19500, revenue: 22000 },
    ],
    []
  );

  // توزيع الحاويات حسب الحالة
  const containerStatusData = useMemo(
    () => [
      { name: 'قيد الانتظار', value: 15, color: '#9CA3AF' },
      { name: 'قيد النقل', value: 42, color: '#3B82F6' },
      { name: 'وصلت', value: 28, color: '#10B981' },
      { name: 'مخلصة', value: 35, color: '#059669' },
      { name: 'تم التسليم', value: 80, color: '#06B6D4' },
    ],
    []
  );

  // توزيع التكاليف
  const costDistribution = useMemo(
    () => [
      { name: 'تكاليف الشحن', value: 35, color: '#F59E0B' },
      { name: 'الرسوم الجمركية', value: 28, color: '#EF4444' },
      { name: 'ضريبة المبيعات', value: 22, color: '#8B5CF6' },
      { name: 'تأمين', value: 10, color: '#06B6D4' },
      { name: 'أخرى', value: 5, color: '#6B7280' },
    ],
    []
  );

  // التنبيهات والإشعارات
  const alerts: AlertData[] = useMemo(
    () => [
      {
        id: '1',
        type: 'warning',
        title: 'تأخر في التسليم',
        description: 'الشحنة CONT-001 متأخرة عن الموعد المتوقع بـ 2 يوم',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: '2',
        type: 'error',
        title: 'خطأ في البيانات',
        description: 'البيان الجمركي DEC-2024-001 يحتوي على بيانات غير صحيحة',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
      },
      {
        id: '3',
        type: 'success',
        title: 'تم التخليص بنجاح',
        description: 'تم تخليص الشحنة CONT-002 بنجاح',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
      },
      {
        id: '4',
        type: 'info',
        title: 'تحديث النظام',
        description: 'سيتم تحديث النظام غداً الساعة 2:00 صباحاً',
        timestamp: new Date(Date.now() - 1000 * 60 * 240),
      },
    ],
    []
  );

  // الحصول على أيقونة التنبيه
  const getAlertIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      warning: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
      error: <AlertTriangle className="w-4 h-4 text-red-600" />,
      success: <CheckCircle className="w-4 h-4 text-green-600" />,
      info: <Activity className="w-4 h-4 text-blue-600" />,
    };
    return iconMap[type] || <Activity className="w-4 h-4" />;
  };

  // الحصول على لون التنبيه
  const getAlertColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      warning: 'bg-yellow-50 border-yellow-200',
      error: 'bg-red-50 border-red-200',
      success: 'bg-green-50 border-green-200',
      info: 'bg-blue-50 border-blue-200',
    };
    return colorMap[type] || 'bg-gray-50 border-gray-200';
  };

  // حساب المؤشرات الرئيسية
  const kpis = useMemo(() => {
    const totalDeclarations = performanceData.reduce((sum, d) => sum + d.declarations, 0);
    const totalShipments = performanceData.reduce((sum, d) => sum + d.shipments, 0);
    const totalCosts = performanceData.reduce((sum, d) => sum + d.costs, 0);
    const totalRevenue = performanceData.reduce((sum, d) => sum + d.revenue, 0);
    const avgCostPerDeclaration = totalDeclarations > 0 ? totalCosts / totalDeclarations : 0;
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0;

    return {
      totalDeclarations,
      totalShipments,
      totalCosts,
      totalRevenue,
      avgCostPerDeclaration: avgCostPerDeclaration.toFixed(2),
      profitMargin: profitMargin.toFixed(1),
    };
  }, [performanceData]);

  return (
    <div className="space-y-6">
      {/* المؤشرات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700">إجمالي البيانات الجمركية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">{kpis.totalDeclarations}</p>
                <p className="text-xs text-slate-600 mt-1">خلال الفترة المختارة</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700">إجمالي الشحنات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">{kpis.totalShipments}</p>
                <p className="text-xs text-slate-600 mt-1">شحنات نشطة</p>
              </div>
              <Package className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700">هامش الربح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-orange-600">{kpis.profitMargin}%</p>
                <p className="text-xs text-slate-600 mt-1">من إجمالي الإيرادات</p>
              </div>
              <Zap className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* رسم بياني للأداء */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">📊 أداء البيانات الجمركية والشحنات</CardTitle>
            <CardDescription>المقارنة الأسبوعية</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorDeclarations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="period" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}
                  formatter={(value) => value.toLocaleString('ar-JO')}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="declarations"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorDeclarations)"
                  name="البيانات الجمركية"
                />
                <Area
                  type="monotone"
                  dataKey="shipments"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorShipments)"
                  name="الشحنات"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* رسم بياني للتكاليف */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">💰 توزيع التكاليف</CardTitle>
            <CardDescription>النسبة المئوية لكل نوع</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* حالة الحاويات والتنبيهات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* توزيع حالات الحاويات */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">📦 حالات الحاويات</CardTitle>
            <CardDescription>توزيع الحاويات حسب الحالة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {containerStatusData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-900">{item.name}</span>
                  </div>
                  <Badge className="bg-slate-200 text-slate-800">{item.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* التنبيهات والإشعارات */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">🔔 التنبيهات الأخيرة</CardTitle>
            <CardDescription>آخر {alerts.length} تنبيهات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{alert.title}</p>
                      <p className="text-sm text-slate-600 mt-1">{alert.description}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {alert.timestamp.toLocaleTimeString('ar-JO')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* إحصائيات مفصلة */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">📈 الإحصائيات المفصلة</CardTitle>
          <CardDescription>ملخص شامل للأداء</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-blue-900 mt-2">
                {(kpis.totalRevenue / 1000).toFixed(1)}K JOD
              </p>
              <p className="text-xs text-blue-600 mt-1">✓ نمو إيجابي</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
              <p className="text-sm text-red-700 font-medium">إجمالي التكاليف</p>
              <p className="text-2xl font-bold text-red-900 mt-2">
                {(kpis.totalCosts / 1000).toFixed(1)}K JOD
              </p>
              <p className="text-xs text-red-600 mt-1">↓ تحت السيطرة</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <p className="text-sm text-green-700 font-medium">متوسط التكلفة</p>
              <p className="text-2xl font-bold text-green-900 mt-2">
                {kpis.avgCostPerDeclaration} JOD
              </p>
              <p className="text-xs text-green-600 mt-1">لكل بيان</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <p className="text-sm text-purple-700 font-medium">معدل الكفاءة</p>
              <p className="text-2xl font-bold text-purple-900 mt-2">94%</p>
              <p className="text-xs text-purple-600 mt-1">✓ ممتاز</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

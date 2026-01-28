import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  ScatterChart,
  Scatter,
} from 'recharts';
import {
  Download,
  Filter,
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportData {
  period: string;
  declarations: number;
  shipments: number;
  revenue: number;
  costs: number;
  profit: number;
}

interface FilterOptions {
  startDate: string;
  endDate: string;
  reportType: 'summary' | 'detailed' | 'financial' | 'operational';
  exportFormat: 'pdf' | 'excel' | 'csv';
}

/**
 * صفحة التقارير الشاملة
 * توفر تقارير متقدمة وتحليلات شاملة
 */
export default function Reports() {
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reportType: 'summary',
    exportFormat: 'pdf',
  });

  // بيانات التقرير الشهري
  const monthlyData: ReportData[] = useMemo(
    () => [
      { period: 'يناير', declarations: 145, shipments: 38, revenue: 125000, costs: 85000, profit: 40000 },
      { period: 'فبراير', declarations: 168, shipments: 42, revenue: 142000, costs: 92000, profit: 50000 },
      { period: 'مارس', declarations: 152, shipments: 40, revenue: 138000, costs: 88000, profit: 50000 },
      { period: 'أبريل', declarations: 175, shipments: 45, revenue: 155000, costs: 98000, profit: 57000 },
      { period: 'مايو', declarations: 182, shipments: 48, revenue: 162000, costs: 102000, profit: 60000 },
      { period: 'يونيو', declarations: 195, shipments: 52, revenue: 175000, costs: 110000, profit: 65000 },
    ],
    []
  );

  // توزيع الإيرادات حسب الفئة
  const revenueByCategory = useMemo(
    () => [
      { name: 'رسوم التخليص', value: 35, color: '#3B82F6' },
      { name: 'رسوم الشحن', value: 28, color: '#10B981' },
      { name: 'رسوم التأمين', value: 18, color: '#F59E0B' },
      { name: 'خدمات إضافية', value: 12, color: '#8B5CF6' },
      { name: 'أخرى', value: 7, color: '#6B7280' },
    ],
    []
  );

  // مقارنة الأداء
  const performanceComparison = useMemo(
    () => [
      { month: 'يناير', target: 120000, actual: 125000, forecast: 128000 },
      { month: 'فبراير', target: 130000, actual: 142000, forecast: 145000 },
      { month: 'مارس', target: 135000, actual: 138000, forecast: 140000 },
      { month: 'أبريل', target: 145000, actual: 155000, forecast: 158000 },
      { month: 'مايو', target: 155000, actual: 162000, forecast: 165000 },
      { month: 'يونيو', target: 165000, actual: 175000, forecast: 180000 },
    ],
    []
  );

  // إحصائيات الأداء
  const performanceMetrics = useMemo(() => {
    const totalRevenue = monthlyData.reduce((sum, d) => sum + d.revenue, 0);
    const totalCosts = monthlyData.reduce((sum, d) => sum + d.costs, 0);
    const totalProfit = monthlyData.reduce((sum, d) => sum + d.profit, 0);
    const totalDeclarations = monthlyData.reduce((sum, d) => sum + d.declarations, 0);
    const avgProfit = totalProfit / monthlyData.length;
    const profitMargin = (totalProfit / totalRevenue) * 100;

    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      totalDeclarations,
      avgProfit,
      profitMargin: profitMargin.toFixed(1),
    };
  }, [monthlyData]);

  // تصدير التقرير
  const handleExport = () => {
    toast.success(`تم تصدير التقرير بصيغة ${filters.exportFormat.toUpperCase()}`);
  };

  // طباعة التقرير
  const handlePrint = () => {
    window.print();
    toast.success('تم فتح نافذة الطباعة');
  };

  return (
    <div className="space-y-6 p-6">
      {/* رأس الصفحة */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">📊 التقارير والتحليلات</h1>
        <p className="text-slate-600 mt-2">تقارير شاملة وتحليلات متقدمة عن أداء النظام</p>
      </div>

      {/* خيارات التصفية */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            خيارات التصفية والتصدير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* تاريخ البداية */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                من التاريخ
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* تاريخ النهاية */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                إلى التاريخ
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* نوع التقرير */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                نوع التقرير
              </label>
              <select
                value={filters.reportType}
                onChange={(e) => setFilters({ ...filters, reportType: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="summary">ملخص</option>
                <option value="detailed">مفصل</option>
                <option value="financial">مالي</option>
                <option value="operational">تشغيلي</option>
              </select>
            </div>

            {/* صيغة التصدير */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                صيغة التصدير
              </label>
              <select
                value={filters.exportFormat}
                onChange={(e) => setFilters({ ...filters, exportFormat: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex gap-3 mt-6">
            <Button onClick={handleExport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              تصدير التقرير
            </Button>
            <Button variant="outline" onClick={handlePrint} className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              طباعة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* المؤشرات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700">إجمالي الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {(performanceMetrics.totalRevenue / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-slate-600 mt-1">JOD</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700">إجمالي الأرباح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {(performanceMetrics.totalProfit / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-slate-600 mt-1">JOD</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
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
                <p className="text-3xl font-bold text-orange-600">
                  {performanceMetrics.profitMargin}%
                </p>
                <p className="text-xs text-slate-600 mt-1">من الإيرادات</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-700">إجمالي البيانات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-purple-600">
                  {performanceMetrics.totalDeclarations}
                </p>
                <p className="text-xs text-slate-600 mt-1">بيان جمركي</p>
              </div>
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* رسم بياني للإيرادات والتكاليف */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">📈 الإيرادات مقابل التكاليف</CardTitle>
            <CardDescription>المقارنة الشهرية</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="period" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}
                  formatter={(value) => (value as number).toLocaleString('ar-JO')}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#3B82F6" name="الإيرادات" />
                <Bar dataKey="costs" fill="#EF4444" name="التكاليف" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* توزيع الإيرادات */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">🥧 توزيع الإيرادات</CardTitle>
            <CardDescription>حسب الفئة</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* مقارنة الأداء */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">📊 مقارنة الأداء</CardTitle>
          <CardDescription>الهدف مقابل الفعلي والتنبؤ</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={performanceComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}
                formatter={(value) => (value as number).toLocaleString('ar-JO')}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#9CA3AF"
                strokeDasharray="5 5"
                name="الهدف"
                dot={{ fill: '#9CA3AF' }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3B82F6"
                name="الفعلي"
                dot={{ fill: '#3B82F6' }}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#10B981"
                strokeDasharray="5 5"
                name="التنبؤ"
                dot={{ fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* جدول التفاصيل */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">📋 تفاصيل الأداء الشهري</CardTitle>
          <CardDescription>ملخص شامل لكل شهر</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">الشهر</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">البيانات</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">الشحنات</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">الإيرادات</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">التكاليف</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">الربح</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900">الهامش</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.period}</td>
                    <td className="px-4 py-3 text-slate-600">{row.declarations}</td>
                    <td className="px-4 py-3 text-slate-600">{row.shipments}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {(row.revenue / 1000).toFixed(0)}K JOD
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {(row.costs / 1000).toFixed(0)}K JOD
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-600">
                      {(row.profit / 1000).toFixed(0)}K JOD
                    </td>
                    <td className="px-4 py-3">
                      <Badge className="bg-blue-100 text-blue-800">
                        {((row.profit / row.revenue) * 100).toFixed(1)}%
                      </Badge>
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

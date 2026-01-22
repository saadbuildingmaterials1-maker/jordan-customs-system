import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts";
import DateRangeFilter, { PeriodType, ComparisonType } from "@/components/DateRangeFilter";
import { Download, Printer, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

/**
 * صفحة التقارير المتقدمة
 * عرض التقارير المالية مع فلاتر زمنية متقدمة ومقارنات بين الفترات
 */
export default function AdvancedReports() {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState(new Date());
  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [comparisonType, setComparisonType] = useState<ComparisonType>("none");
  const [comparisonStartDate, setComparisonStartDate] = useState<Date>();
  const [comparisonEndDate, setComparisonEndDate] = useState<Date>();
  const [searchQuery, setSearchQuery] = useState("");

  // بيانات تجريبية للتقارير
  const revenueData = [
    { month: "يناير", current: 45000, previous: 38000, comparison: 35000 },
    { month: "فبراير", current: 52000, previous: 42000, comparison: 40000 },
    { month: "مارس", current: 48000, previous: 45000, comparison: 43000 },
    { month: "أبريل", current: 61000, previous: 55000, comparison: 52000 },
    { month: "مايو", current: 55000, previous: 50000, comparison: 48000 },
    { month: "يونيو", current: 67000, previous: 58000, comparison: 55000 },
  ];

  const expenseData = [
    { month: "يناير", current: 28000, previous: 25000, comparison: 23000 },
    { month: "فبراير", current: 32000, previous: 28000, comparison: 26000 },
    { month: "مارس", current: 30000, previous: 29000, comparison: 27000 },
    { month: "أبريل", current: 38000, previous: 35000, comparison: 33000 },
    { month: "مايو", current: 35000, previous: 32000, comparison: 30000 },
    { month: "يونيو", current: 42000, previous: 38000, comparison: 36000 },
  ];

  const profitData = revenueData.map((item, index) => ({
    month: item.month,
    current: item.current - expenseData[index].current,
    previous: item.previous - expenseData[index].previous,
    comparison: item.comparison - expenseData[index].comparison,
  }));

  const categoryData = [
    { name: "الشحن الدولي", value: 35, fill: "#3b82f6" },
    { name: "الرسوم الجمركية", value: 25, fill: "#ef4444" },
    { name: "التأمين", value: 20, fill: "#10b981" },
    { name: "التخليص", value: 15, fill: "#f59e0b" },
    { name: "أخرى", value: 5, fill: "#8b5cf6" },
  ];

  // حساب المؤشرات الرئيسية
  const calculateMetrics = () => {
    const currentRevenue = revenueData.reduce((sum, item) => sum + item.current, 0);
    const previousRevenue = revenueData.reduce((sum, item) => sum + item.previous, 0);
    const currentExpense = expenseData.reduce((sum, item) => sum + item.current, 0);
    const previousExpense = expenseData.reduce((sum, item) => sum + item.previous, 0);

    const revenueChange = ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);
    const expenseChange = ((currentExpense - previousExpense) / previousExpense * 100).toFixed(1);
    const profitMargin = ((currentRevenue - currentExpense) / currentRevenue * 100).toFixed(1);

    return {
      currentRevenue,
      previousRevenue,
      currentExpense,
      previousExpense,
      revenueChange,
      expenseChange,
      profitMargin,
    };
  };

  const metrics = calculateMetrics();

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleComparisonChange = (comparison: ComparisonType, start?: Date, end?: Date) => {
    setComparisonType(comparison);
    setComparisonStartDate(start);
    setComparisonEndDate(end);
  };

  const handlePeriodChange = (period: PeriodType) => {
    setPeriodType(period);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* رأس الصفحة */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">التقارير المالية المتقدمة</h1>
          <p className="text-slate-600">عرض شامل للتقارير المالية مع فلاتر زمنية ومقارنات متقدمة</p>
        </div>

        {/* الفلاتر الزمنية */}
        <DateRangeFilter
          onDateRangeChange={handleDateRangeChange}
          onComparisonChange={handleComparisonChange}
          onPeriodChange={handlePeriodChange}
        />

        {/* المؤشرات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">الإيرادات الحالية</p>
                <p className="text-2xl font-bold text-slate-900">
                  {(metrics.currentRevenue / 1000).toFixed(1)}k د.أ
                </p>
                <div className="flex items-center gap-1 text-sm">
                  {parseFloat(metrics.revenueChange) >= 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">+{metrics.revenueChange}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-red-600">{metrics.revenueChange}%</span>
                    </>
                  )}
                  <span className="text-slate-500">من الفترة السابقة</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">المصاريف الحالية</p>
                <p className="text-2xl font-bold text-slate-900">
                  {(metrics.currentExpense / 1000).toFixed(1)}k د.أ
                </p>
                <div className="flex items-center gap-1 text-sm">
                  {parseFloat(metrics.expenseChange) <= 0 ? (
                    <>
                      <TrendingDown className="w-4 h-4 text-green-500" />
                      <span className="text-green-600">{metrics.expenseChange}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 text-red-500" />
                      <span className="text-red-600">+{metrics.expenseChange}%</span>
                    </>
                  )}
                  <span className="text-slate-500">من الفترة السابقة</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">الربح الصافي</p>
                <p className="text-2xl font-bold text-green-600">
                  {((metrics.currentRevenue - metrics.currentExpense) / 1000).toFixed(1)}k د.أ
                </p>
                <p className="text-sm text-slate-600">هامش الربح: {metrics.profitMargin}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">الفترة المحددة</p>
                <p className="text-sm font-mono text-slate-900">
                  {format(startDate, "dd/MM/yyyy", { locale: ar })}
                </p>
                <p className="text-sm font-mono text-slate-900">
                  إلى {format(endDate, "dd/MM/yyyy", { locale: ar })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التقارير والرسوم البيانية */}
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
            <TabsTrigger value="expenses">المصاريف</TabsTrigger>
            <TabsTrigger value="profit">الأرباح</TabsTrigger>
            <TabsTrigger value="categories">التصنيفات</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>تقرير الإيرادات</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    تحميل
                  </Button>
                  <Button size="sm" variant="outline">
                    <Printer className="w-4 h-4 mr-1" />
                    طباعة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `${(value / 1000).toFixed(1)}k`} />
                    <Legend />
                    <Bar dataKey="current" fill="#3b82f6" name="الفترة الحالية" />
                    {comparisonType !== "none" && (
                      <>
                        <Bar dataKey="previous" fill="#10b981" name="الفترة السابقة" />
                        <Bar dataKey="comparison" fill="#f59e0b" name="المقارنة" />
                      </>
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>تقرير المصاريف</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    تحميل
                  </Button>
                  <Button size="sm" variant="outline">
                    <Printer className="w-4 h-4 mr-1" />
                    طباعة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={expenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `${(value / 1000).toFixed(1)}k`} />
                    <Legend />
                    <Line type="monotone" dataKey="current" stroke="#ef4444" name="الفترة الحالية" strokeWidth={2} />
                    {comparisonType !== "none" && (
                      <>
                        <Line type="monotone" dataKey="previous" stroke="#10b981" name="الفترة السابقة" strokeWidth={2} />
                        <Line type="monotone" dataKey="comparison" stroke="#f59e0b" name="المقارنة" strokeWidth={2} />
                      </>
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profit" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>تقرير الأرباح</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    تحميل
                  </Button>
                  <Button size="sm" variant="outline">
                    <Printer className="w-4 h-4 mr-1" />
                    طباعة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => `${(value / 1000).toFixed(1)}k`} />
                    <Legend />
                    <Bar dataKey="current" fill="#10b981" name="الفترة الحالية" />
                    {comparisonType !== "none" && (
                      <>
                        <Bar dataKey="previous" fill="#3b82f6" name="الفترة السابقة" />
                        <Bar dataKey="comparison" fill="#f59e0b" name="المقارنة" />
                      </>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>توزيع التصنيفات</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    تحميل
                  </Button>
                  <Button size="sm" variant="outline">
                    <Printer className="w-4 h-4 mr-1" />
                    طباعة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `${value}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-3">
                    {categoryData.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ backgroundColor: category.fill }}></div>
                          <span className="text-sm font-medium text-slate-700">{category.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">{category.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

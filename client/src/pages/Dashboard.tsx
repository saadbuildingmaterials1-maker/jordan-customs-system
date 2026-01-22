import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { trpc } from "@/lib/trpc";
import { ArrowUp, ArrowDown, DollarSign, Package, TrendingUp, AlertCircle } from "lucide-react";

export default function Dashboard() {
  const { data: declarations } = trpc.declarations.list.useQuery();
  const { data: items } = trpc.items.list.useQuery();

  // حساب الإحصائيات الأساسية
  const stats = useMemo(() => {
    if (!declarations || !items) return null;

    const totalValue = declarations.reduce((sum, d) => sum + (d.totalCost || 0), 0);
    const totalShipping = declarations.reduce((sum, d) => sum + (d.shippingCost || 0), 0);
    const totalTaxes = declarations.reduce((sum, d) => sum + (d.totalTaxes || 0), 0);
    const totalItems = items.length;
    const totalDeclarations = declarations.length;

    return {
      totalValue,
      totalShipping,
      totalTaxes,
      totalItems,
      totalDeclarations,
      averageDeclarationValue: totalDeclarations > 0 ? totalValue / totalDeclarations : 0,
    };
  }, [declarations, items]);

  // بيانات الرسم البياني الخطي (التكاليف حسب البيان)
  const lineChartData = useMemo(() => {
    if (!declarations) return [];
    return declarations.slice(-10).map((d, idx) => ({
      name: `البيان ${idx + 1}`,
      value: d.totalCost || 0,
      shipping: d.shippingCost || 0,
      taxes: d.totalTaxes || 0,
    }));
  }, [declarations]);

  // بيانات الرسم البياني الدائري (توزيع التكاليف)
  const pieChartData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "قيمة البضاعة", value: stats.totalValue },
      { name: "الشحن والتأمين", value: stats.totalShipping },
      { name: "الرسوم والضرائب", value: stats.totalTaxes },
    ].filter(item => item.value > 0);
  }, [stats]);

  // بيانات الرسم البياني العمودي (توزيع الأصناف)
  const barChartData = useMemo(() => {
    if (!items) return [];
    const categories = [...new Set(items.map((i: any) => i.category || "غير محدد"))];
    return categories.map((cat: string) => ({
      name: cat,
      count: items.filter((i: any) => (i.category || "غير محدد") === cat).length,
    }));
  }, [items]);

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* العنوان */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم الذكية</h1>
        <p className="text-gray-600 mt-2">ملخص شامل لجميع البيانات الجمركية والتكاليف</p>
      </div>

      {/* بطاقات الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* إجمالي البيانات الجمركية */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">إجمالي البيانات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDeclarations}</p>
                <p className="text-xs text-gray-500 mt-1">بيان جمركي</p>
              </div>
              <Package className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* إجمالي القيمة */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">إجمالي القيمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.totalValue / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-gray-500 mt-1">دينار أردني</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* إجمالي الشحن */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">الشحن والتأمين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.totalShipping / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-gray-500 mt-1">دينار أردني</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* إجمالي الرسوم والضرائب */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">الرسوم والضرائب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(stats.totalTaxes / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-gray-500 mt-1">دينار أردني</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        {/* إجمالي الأصناف */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">إجمالي الأصناف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                <p className="text-xs text-gray-500 mt-1">صنف</p>
              </div>
              <Package className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الرسم البياني الخطي */}
        <Card>
          <CardHeader>
            <CardTitle>تطور التكاليف</CardTitle>
            <CardDescription>أحدث 10 بيانات جمركية</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" name="إجمالي التكلفة" />
                <Line type="monotone" dataKey="shipping" stroke="#10b981" name="الشحن" />
                <Line type="monotone" dataKey="taxes" stroke="#ef4444" name="الرسوم" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* الرسم البياني الدائري */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع التكاليف</CardTitle>
            <CardDescription>نسبة كل فئة من إجمالي التكاليف</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${(value / 1000).toFixed(1)}K`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* الرسم البياني العمودي */}
      <Card>
        <CardHeader>
          <CardTitle>توزيع الأصناف حسب الفئة</CardTitle>
          <CardDescription>عدد الأصناف في كل فئة</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="عدد الأصناف" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ملخص الإحصائيات */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص الإحصائيات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600">متوسط قيمة البيان الواحد</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {(stats.averageDeclarationValue / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600">نسبة الشحن من إجمالي التكاليف</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.totalValue > 0 ? ((stats.totalShipping / (stats.totalValue + stats.totalShipping + stats.totalTaxes)) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div className="border-l-4 border-red-500 pl-4">
              <p className="text-sm text-gray-600">نسبة الرسوم والضرائب</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.totalValue > 0 ? ((stats.totalTaxes / (stats.totalValue + stats.totalShipping + stats.totalTaxes)) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

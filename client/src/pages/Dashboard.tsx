import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  // بيانات وهمية للعرض
  const stats = useMemo(() => ({
    totalValue: 150000,
    totalShipping: 5000,
    totalTaxes: 25000,
    totalItems: 45,
    totalDeclarations: 12,
    averageDeclarationValue: 12500,
  }), []);

  // بيانات الرسم البياني الخطي
  const lineChartData = [
    { name: "البيان 1", value: 10000, shipping: 500, taxes: 2000 },
    { name: "البيان 2", value: 12000, shipping: 600, taxes: 2400 },
    { name: "البيان 3", value: 11000, shipping: 550, taxes: 2200 },
    { name: "البيان 4", value: 13000, shipping: 650, taxes: 2600 },
    { name: "البيان 5", value: 14000, shipping: 700, taxes: 2800 },
  ];

  // بيانات الرسم البياني الدائري
  const pieChartData = [
    { name: "قيمة البضاعة", value: stats.totalValue },
    { name: "الشحن والتأمين", value: stats.totalShipping },
    { name: "الرسوم والضرائب", value: stats.totalTaxes },
  ];

  // بيانات الرسم البياني العمودي
  const barChartData = [
    { name: "صنف 1", value: 5000 },
    { name: "صنف 2", value: 4500 },
    { name: "صنف 3", value: 6000 },
    { name: "صنف 4", value: 3500 },
    { name: "صنف 5", value: 4000 },
  ];

  const COLORS: string[] = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="text-gray-600 mt-2">ملخص شامل لجميع العمليات والتكاليف الجمركية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">إجمالي قيمة البضاعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalValue.toLocaleString('ar-JO')} د.ا</div>
            <p className="text-xs text-gray-500 mt-1">من {stats.totalDeclarations} بيان</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">إجمالي الشحن</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShipping.toLocaleString('ar-JO')} د.ا</div>
            <p className="text-xs text-gray-500 mt-1">متوسط: {(stats.totalShipping / stats.totalDeclarations).toLocaleString('ar-JO')} د.ا</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">الرسوم والضرائب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTaxes.toLocaleString('ar-JO')} د.ا</div>
            <p className="text-xs text-gray-500 mt-1">نسبة: {((stats.totalTaxes / stats.totalValue) * 100).toFixed(2)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">عدد الأصناف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-gray-500 mt-1">متوسط: {(stats.totalItems / stats.totalDeclarations).toFixed(1)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">متوسط البيان</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageDeclarationValue.toLocaleString('ar-JO')} د.ا</div>
            <p className="text-xs text-gray-500 mt-1">من {stats.totalDeclarations} بيان</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>تطور التكاليف</CardTitle>
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
                <Line type="monotone" dataKey="taxes" stroke="#f59e0b" name="الرسوم" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزيع التكاليف</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }: any) => `${name}: ${value.toLocaleString('ar-JO')} د.ا`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>أعلى الأصناف قيمة</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#3b82f6" name="القيمة (د.ا)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

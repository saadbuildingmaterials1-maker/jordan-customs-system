import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "recharts";
import { Download, TrendingUp, Users, DollarSign, AlertCircle } from "lucide-react";

interface FinancialData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface SubscriptionStats {
  plan: string;
  count: number;
  revenue: number;
  color: string;
}

interface InvoiceData {
  id: string;
  date: string;
  customer: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
}

const financialData: FinancialData[] = [
  { month: "يناير", revenue: 5000, expenses: 2000, profit: 3000 },
  { month: "فبراير", revenue: 7200, expenses: 2400, profit: 4800 },
  { month: "مارس", revenue: 6800, expenses: 2200, profit: 4600 },
  { month: "أبريل", revenue: 8500, expenses: 2800, profit: 5700 },
  { month: "مايو", revenue: 9200, expenses: 3000, profit: 6200 },
  { month: "يونيو", revenue: 10500, expenses: 3200, profit: 7300 },
];

const subscriptionStats: SubscriptionStats[] = [
  { plan: "الأساسية", count: 150, revenue: 14850, color: "#3b82f6" },
  { plan: "المهنية", count: 320, revenue: 95040, color: "#8b5cf6" },
  { plan: "المؤسسية", count: 45, revenue: 44955, color: "#ec4899" },
];

const invoices: InvoiceData[] = [
  { id: "INV-001", date: "2026-02-08", customer: "أحمد محمد", amount: 99, status: "paid" },
  { id: "INV-002", date: "2026-02-07", customer: "فاطمة علي", amount: 299, status: "paid" },
  { id: "INV-003", date: "2026-02-06", customer: "محمود سالم", amount: 999, status: "pending" },
  { id: "INV-004", date: "2026-02-05", customer: "سارة حسن", amount: 99, status: "overdue" },
  { id: "INV-005", date: "2026-02-04", customer: "علي خالد", amount: 299, status: "paid" },
];

export function FinancialReports() {
  const [dateRange, setDateRange] = useState("6months");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  // حساب الإحصائيات
  const totalRevenue = financialData.reduce((sum, d) => sum + d.revenue, 0);
  const totalExpenses = financialData.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = financialData.reduce((sum, d) => sum + d.profit, 0);
  const totalSubscriptions = subscriptionStats.reduce((sum, s) => sum + s.count, 0);
  const totalSubscriptionRevenue = subscriptionStats.reduce((sum, s) => sum + s.revenue, 0);
  const overduInvoices = invoices.filter((i) => i.status === "overdue").length;
  const pendingInvoices = invoices.filter((i) => i.status === "pending").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "overdue":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "مدفوعة";
      case "pending":
        return "معلقة";
      case "overdue":
        return "متأخرة";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* الرأس */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">التقارير المالية</h1>
          <p className="text-slate-400">عرض شامل للإيرادات والاشتراكات والفواتير</p>
        </div>

        {/* البطاقات الإحصائية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* إجمالي الإيرادات */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجمالي الإيرادات</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {totalRevenue.toLocaleString()} JOD
                  </p>
                </div>
                <div className="bg-green-600/20 p-3 rounded-lg">
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* إجمالي الأرباح */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">إجمالي الأرباح</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {totalProfit.toLocaleString()} JOD
                  </p>
                </div>
                <div className="bg-blue-600/20 p-3 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* عدد الاشتراكات */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">عدد الاشتراكات</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {totalSubscriptions}
                  </p>
                </div>
                <div className="bg-purple-600/20 p-3 rounded-lg">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الفواتير المتأخرة */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">فواتير متأخرة</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {overduInvoices}
                  </p>
                </div>
                <div className="bg-red-600/20 p-3 rounded-lg">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* رسم بياني الإيرادات والنفقات */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">الإيرادات والنفقات</CardTitle>
              <CardDescription>آخر 6 أشهر</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="الإيرادات" />
                  <Bar dataKey="expenses" fill="#ef4444" name="النفقات" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* رسم بياني الأرباح */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">الأرباح الشهرية</CardTitle>
              <CardDescription>آخر 6 أشهر</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="الأرباح"
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* توزيع الاشتراكات */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* رسم بياني دائري */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">توزيع الاشتراكات</CardTitle>
              <CardDescription>عدد المشتركين حسب الخطة</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subscriptionStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ plan, count }) => `${plan}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {subscriptionStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* إحصائيات الاشتراكات */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">إحصائيات الاشتراكات</CardTitle>
              <CardDescription>الإيرادات حسب الخطة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptionStats.map((stat, index) => (
                  <div key={index} className="p-4 bg-slate-900/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stat.color }}
                        />
                        <p className="text-white font-semibold">{stat.plan}</p>
                      </div>
                      <p className="text-slate-400">{stat.count} مشترك</p>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(stat.count / totalSubscriptions) * 100}%`,
                          backgroundColor: stat.color,
                        }}
                      />
                    </div>
                    <p className="text-sm text-slate-400 mt-2">
                      الإيرادات: {stat.revenue.toLocaleString()} JOD
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* جدول الفواتير */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-white">الفواتير الأخيرة</CardTitle>
              <CardDescription>آخر 5 فواتير</CardDescription>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              تصدير التقرير
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">رقم الفاتورة</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">التاريخ</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">العميل</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">المبلغ</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-slate-700 hover:bg-slate-900/50">
                      <td className="py-3 px-4 text-white">{invoice.id}</td>
                      <td className="py-3 px-4 text-slate-300">{invoice.date}</td>
                      <td className="py-3 px-4 text-slate-300">{invoice.customer}</td>
                      <td className="py-3 px-4 text-white font-semibold">{invoice.amount} JOD</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                          {getStatusLabel(invoice.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

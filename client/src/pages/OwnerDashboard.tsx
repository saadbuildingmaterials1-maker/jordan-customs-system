/**
 * Owner Dashboard
 * لوحة تحكم المالك الشاملة
 * 
 * تعرض:
 * - إحصائيات مالية شاملة
 * - رسوم بيانية متقدمة
 * - إدارة المستخدمين
 * - إدارة الإعدادات
 * - تقارير مالية متقدمة
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from 'recharts';
import { AlertCircle, TrendingUp, Users, Settings, FileText, Download } from 'lucide-react';

/**
 * بيانات الإحصائيات
 */
interface Statistics {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  totalUsers: number;
  totalInvoices: number;
  totalPayments: number;
  averageOrderValue: number;
  conversionRate: number;
}

/**
 * بيانات المستخدم
 */
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
}

/**
 * بيانات التقرير المالي
 */
interface FinancialReport {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  invoices: number;
}

/**
 * لوحة تحكم المالك
 */
export default function OwnerDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('overview');

  // بيانات الإحصائيات (في الإنتاج، ستأتي من tRPC)
  const statistics: Statistics = {
    totalRevenue: 125000,
    totalExpenses: 45000,
    totalProfit: 80000,
    totalUsers: 156,
    totalInvoices: 342,
    totalPayments: 298,
    averageOrderValue: 365,
    conversionRate: 42.5,
  };

  // بيانات التقارير المالية
  const financialData: FinancialReport[] = [
    { month: 'يناير', revenue: 8500, expenses: 3200, profit: 5300, invoices: 24 },
    { month: 'فبراير', revenue: 9200, expenses: 3500, profit: 5700, invoices: 28 },
    { month: 'مارس', revenue: 10100, expenses: 3800, profit: 6300, invoices: 31 },
    { month: 'أبريل', revenue: 11500, expenses: 4200, profit: 7300, invoices: 35 },
    { month: 'مايو', revenue: 12800, expenses: 4500, profit: 8300, invoices: 39 },
    { month: 'يونيو', revenue: 14200, expenses: 4800, profit: 9400, invoices: 43 },
  ];

  // بيانات توزيع الإيرادات
  const revenueDistribution = [
    { name: 'Click', value: 35, color: '#3b82f6' },
    { name: 'Alipay', value: 28, color: '#10b981' },
    { name: 'PayPal', value: 22, color: '#f59e0b' },
    { name: 'بطاقات ائتمان', value: 15, color: '#8b5cf6' },
  ];

  // قائمة المستخدمين (في الإنتاج، ستأتي من tRPC)
  const users: User[] = [
    {
      id: '1',
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      role: 'user',
      status: 'active',
      joinDate: '2024-01-15',
      totalOrders: 12,
      totalSpent: 4380,
    },
    {
      id: '2',
      name: 'فاطمة علي',
      email: 'fatima@example.com',
      role: 'user',
      status: 'active',
      joinDate: '2024-02-20',
      totalOrders: 8,
      totalSpent: 2920,
    },
    {
      id: '3',
      name: 'محمود حسن',
      email: 'mahmoud@example.com',
      role: 'user',
      status: 'inactive',
      joinDate: '2024-03-10',
      totalOrders: 5,
      totalSpent: 1825,
    },
  ];

  // حساب نسب التغيير
  const revenueChange = ((statistics.totalRevenue - 100000) / 100000) * 100;
  const profitChange = ((statistics.totalProfit - 65000) / 65000) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">لوحة تحكم المالك</h1>
          <p className="text-slate-600">إدارة شاملة للإيرادات والمستخدمين والإعدادات</p>
        </div>

        {/* بطاقات الإحصائيات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* إجمالي الإيرادات */}
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">إجمالي الإيرادات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {statistics.totalRevenue.toLocaleString()} د.ا
              </div>
              <p className={`text-sm mt-2 ${revenueChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {revenueChange > 0 ? '+' : ''}{revenueChange.toFixed(1)}% من الشهر السابق
              </p>
            </CardContent>
          </Card>

          {/* إجمالي المصروفات */}
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">إجمالي المصروفات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {statistics.totalExpenses.toLocaleString()} د.ا
              </div>
              <p className="text-sm text-slate-500 mt-2">
                {((statistics.totalExpenses / statistics.totalRevenue) * 100).toFixed(1)}% من الإيرادات
              </p>
            </CardContent>
          </Card>

          {/* الربح الصافي */}
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">الربح الصافي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {statistics.totalProfit.toLocaleString()} د.ا
              </div>
              <p className={`text-sm mt-2 ${profitChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitChange > 0 ? '+' : ''}{profitChange.toFixed(1)}% من الشهر السابق
              </p>
            </CardContent>
          </Card>

          {/* عدد المستخدمين */}
          <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">عدد المستخدمين</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{statistics.totalUsers}</div>
              <p className="text-sm text-slate-500 mt-2">
                معدل التحويل: {statistics.conversionRate}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات الرئيسية */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="users">المستخدمون</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* تبويب النظرة العامة */}
          <TabsContent value="overview" className="space-y-6">
            {/* رسم بياني الإيرادات والمصروفات */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle>الإيرادات والمصروفات</CardTitle>
                <CardDescription>مقارنة الإيرادات والمصروفات الشهرية</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#10b981" name="الإيرادات" />
                    <Bar dataKey="expenses" fill="#ef4444" name="المصروفات" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* رسم بياني الربح */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle>اتجاه الربح</CardTitle>
                <CardDescription>تطور الربح الصافي على مدار الأشهر</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="الربح"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* توزيع الإيرادات */}
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle>توزيع الإيرادات حسب طريقة الدفع</CardTitle>
                <CardDescription>نسبة الإيرادات من كل بوابة دفع</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب المستخدمين */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle>إدارة المستخدمين</CardTitle>
                <CardDescription>قائمة المستخدمين المسجلين في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">الاسم</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">البريد الإلكتروني</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">الدور</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">الحالة</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">الطلبات</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">الإنفاق</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-slate-900">{user.name}</td>
                          <td className="py-3 px-4 text-slate-600">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {user.status === 'active' ? 'نشط' : 'معطل'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-900">{user.totalOrders}</td>
                          <td className="py-3 px-4 text-slate-900">{user.totalSpent} د.ا</td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm">
                              تعديل
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب التقارير */}
          <TabsContent value="reports" className="space-y-6">
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle>التقارير المالية</CardTitle>
                <CardDescription>تقارير شاملة عن الأداء المالي</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 ml-2" />
                    تقرير الإيرادات الشهري
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 ml-2" />
                    تقرير المصروفات
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 ml-2" />
                    تقرير الأرباح والخسائر
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Download className="w-4 h-4 ml-2" />
                    تقرير الفواتير
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الإعدادات */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle>إعدادات النظام</CardTitle>
                <CardDescription>تخصيص إعدادات النظام والتكوينات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      اسم الشركة
                    </label>
                    <input
                      type="text"
                      defaultValue="نظام إدارة تكاليف الشحن والجمارك"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      البريد الإلكتروني الرسمي
                    </label>
                    <input
                      type="email"
                      defaultValue="info@example.com"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      defaultValue="+962 6 5xxx xxxx"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      العملة الافتراضية
                    </label>
                    <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>دينار أردني (JOD)</option>
                      <option>دولار أمريكي (USD)</option>
                      <option>يورو (EUR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      معدل الضريبة الافتراضي (%)
                    </label>
                    <input
                      type="number"
                      defaultValue="16"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  حفظ الإعدادات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

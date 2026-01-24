import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, Truck, DollarSign, AlertCircle, CheckCircle, Clock, Users, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  color: string;
}

export default function Dashboard() {
  const [dateRange, setDateRange] = useState('month');

  // بيانات الإحصائيات
  const stats: StatCard[] = [
    {
      title: 'إجمالي البيانات الجمركية',
      value: '156',
      change: '+12% من الشهر الماضي',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'الشحنات النشطة',
      value: '42',
      change: '+8% من الأسبوع الماضي',
      icon: <Truck className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'إجمالي المصاريف',
      value: '125,450 JOD',
      change: '-5% من الشهر الماضي',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      title: 'المستخدمون النشطون',
      value: '28',
      change: '+3 مستخدمين جدد',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  // بيانات الرسم البياني الشهري
  const monthlyData = [
    { month: 'يناير', declarations: 120, shipments: 45, expenses: 8500 },
    { month: 'فبراير', declarations: 135, shipments: 52, expenses: 9200 },
    { month: 'مارس', declarations: 156, shipments: 42, expenses: 7800 },
  ];

  // بيانات توزيع الحالات
  const statusData = [
    { name: 'مكتمل', value: 120, color: '#10b981' },
    { name: 'معلق', value: 28, color: '#f59e0b' },
    { name: 'قيد المعالجة', value: 8, color: '#3b82f6' },
  ];

  // المهام المعلقة
  const pendingTasks = [
    { id: 1, title: 'مراجعة بيان جمركي DECL-2026-045', priority: 'عالي', dueDate: '2026-01-25' },
    { id: 2, title: 'الموافقة على فاتورة مورد INV-2026-012', priority: 'متوسط', dueDate: '2026-01-26' },
    { id: 3, title: 'تسجيل شحنة جديدة SHIP-2026-089', priority: 'منخفض', dueDate: '2026-01-27' },
  ];

  // الأنشطة الأخيرة
  const recentActivities = [
    { id: 1, action: 'تم إنشاء بيان جمركي جديد', user: 'أحمد محمد', time: 'منذ 2 ساعة' },
    { id: 2, action: 'تم الموافقة على فاتورة مورد', user: 'فاطمة علي', time: 'منذ 4 ساعات' },
    { id: 3, action: 'تم تحديث حالة الشحنة', user: 'محمود حسن', time: 'منذ 6 ساعات' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'عالي':
        return 'bg-red-100 text-red-800';
      case 'متوسط':
        return 'bg-yellow-100 text-yellow-800';
      case 'منخفض':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportReport = () => {
    toast.success('تم تصدير التقرير بنجاح');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* الرأس */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم الرئيسية</h1>
            <p className="text-gray-600 mt-2">ملخص شامل لأداء النظام والعمليات الجارية</p>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
              <option value="year">هذا العام</option>
            </select>
            <Button onClick={handleExportReport} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              تصدير التقرير
            </Button>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <p className="text-xs text-green-600 mt-2">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* الرسم البياني الخطي */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>الأداء الشهري</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="declarations" stroke="#3b82f6" name="البيانات الجمركية" />
                  <Line type="monotone" dataKey="shipments" stroke="#10b981" name="الشحنات" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* الرسم البياني الدائري */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع الحالات</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* المهام المعلقة والأنشطة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* المهام المعلقة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                المهام المعلقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTasks.map(task => (
                  <div key={task.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <p className="text-sm text-gray-600 mt-1">الموعد: {task.dueDate}</p>
                      </div>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* الأنشطة الأخيرة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                الأنشطة الأخيرة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600 mt-1">بواسطة: {activity.user}</p>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ملخص الأداء */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              ملخص الأداء
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-600 text-sm">معدل الإنجاز</p>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">85% من المهام مكتملة</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">رضا المستخدمين</p>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">92% رضا عام</p>
              </div>

              <div>
                <p className="text-gray-600 text-sm">استقرار النظام</p>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '99%' }}></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">99% وقت تشغيل</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

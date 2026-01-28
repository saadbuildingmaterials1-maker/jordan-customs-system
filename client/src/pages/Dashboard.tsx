import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Package, Truck, DollarSign, AlertCircle, CheckCircle, Clock, Users, FileText, Download, ArrowUpRight, ArrowDownRight, Zap, Target } from 'lucide-react';
import { toast } from 'sonner';

interface StatCard {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  gradient: string;
}

export default function Dashboard() {
  const [dateRange, setDateRange] = useState('month');
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(true);

  // بيانات الإحصائيات المحسّنة
  const stats: StatCard[] = [
    {
      title: 'إجمالي البيانات الجمركية',
      value: '156',
      change: '+12% من الشهر الماضي',
      trend: 'up',
      icon: <FileText className="w-6 h-6" />,
      gradient: 'from-blue-600 to-blue-700',
    },
    {
      title: 'الشحنات النشطة',
      value: '42',
      change: '+8% من الأسبوع الماضي',
      trend: 'up',
      icon: <Truck className="w-6 h-6" />,
      gradient: 'from-green-600 to-green-700',
    },
    {
      title: 'إجمالي المصاريف',
      value: '125,450 JOD',
      change: '-5% من الشهر الماضي',
      trend: 'down',
      icon: <DollarSign className="w-6 h-6" />,
      gradient: 'from-orange-600 to-orange-700',
    },
    {
      title: 'المستخدمون النشطون',
      value: '28',
      change: '+3 مستخدمين جدد',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      gradient: 'from-purple-600 to-purple-700',
    },
  ];

  // بيانات الرسم البياني الشهري
  const monthlyData = [
    { month: 'يناير', declarations: 120, shipments: 45, expenses: 8500 },
    { month: 'فبراير', declarations: 135, shipments: 52, expenses: 9200 },
    { month: 'مارس', declarations: 156, shipments: 42, expenses: 7800 },
    { month: 'أبريل', declarations: 145, shipments: 48, expenses: 8900 },
    { month: 'مايو', declarations: 165, shipments: 55, expenses: 9500 },
    { month: 'يونيو', declarations: 180, shipments: 60, expenses: 10200 },
  ];

  // بيانات توزيع الحالات
  const statusData = [
    { name: 'مكتمل', value: 120, color: '#10b981' },
    { name: 'معلق', value: 28, color: '#f59e0b' },
    { name: 'قيد المعالجة', value: 8, color: '#3b82f6' },
  ];

  // المهام المعلقة
  const pendingTasks = [
    { id: 1, title: 'مراجعة بيان جمركي DECL-2026-045', priority: 'عالي', dueDate: '2026-01-25', status: 'urgent' },
    { id: 2, title: 'الموافقة على فاتورة مورد INV-2026-012', priority: 'متوسط', dueDate: '2026-01-26', status: 'pending' },
    { id: 3, title: 'تسجيل شحنة جديدة SHIP-2026-089', priority: 'منخفض', dueDate: '2026-01-27', status: 'normal' },
  ];

  // الأنشطة الأخيرة
  const recentActivities = [
    { id: 1, action: 'تم إنشاء بيان جمركي جديد', user: 'أحمد محمد', time: 'منذ 2 ساعة', type: 'create' },
    { id: 2, action: 'تم الموافقة على فاتورة مورد', user: 'فاطمة علي', time: 'منذ 4 ساعات', type: 'approve' },
    { id: 3, action: 'تم تحديث حالة الشحنة', user: 'محمود حسن', time: 'منذ 6 ساعات', type: 'update' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'عالي':
        return 'bg-red-100/50 text-red-700 border border-red-300/50';
      case 'متوسط':
        return 'bg-yellow-100/50 text-yellow-700 border border-yellow-300/50';
      case 'منخفض':
        return 'bg-green-100/50 text-green-700 border border-green-300/50';
      default:
        return 'bg-gray-100/50 text-gray-700 border border-gray-300/50';
    }
  };

  const handleExportReport = () => {
    toast.success('تم تصدير التقرير بنجاح');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* الرأس المحسّن */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
              لوحة التحكم الرئيسية
            </h1>
            <p className="text-gray-600 mt-2">ملخص شامل وتحليلي لأداء النظام والعمليات الجارية</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white hover:border-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">هذا الأسبوع</option>
              <option value="month">هذا الشهر</option>
              <option value="year">هذا العام</option>
            </select>
            <Button onClick={handleExportReport} className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg transition-all">
              <Download className="w-4 h-4" />
              تصدير التقرير
            </Button>
          </div>
        </div>

        {/* بطاقات الإحصائيات المحسّنة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="group relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              <Card className="relative border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-r ${stat.gradient} opacity-5 rounded-full -mr-16 -mt-16`}></div>
                <CardContent className="pt-6 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-3">{stat.value}</p>
                      <div className="flex items-center gap-1 mt-3">
                        {stat.trend === 'up' ? (
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-green-600" />
                        )}
                        <p className="text-xs font-medium text-green-600">{stat.change}</p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-lg`}>
                      {stat.icon}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* الرسم البياني الخطي المحسّن */}
          <Card className="lg:col-span-2 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  الأداء الشهري
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-700 border-0">آخر 6 أشهر</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorDeclarations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    formatter={(value) => value.toLocaleString('ar-JO')}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="declarations" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDeclarations)" name="البيانات الجمركية" strokeWidth={2} />
                  <Area type="monotone" dataKey="shipments" stroke="#10b981" fillOpacity={1} fill="url(#colorShipments)" name="الشحنات" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* الرسم البياني الدائري المحسّن */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="w-5 h-5 text-purple-600" />
                توزيع الحالات
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString('ar-JO')} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* المهام والأنشطة */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* المهام المعلقة المحسّنة */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <AlertCircle className="w-5 h-5 text-red-600" />
                المهام المعلقة
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {pendingTasks.map(task => (
                  <div key={task.id} className="p-4 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-300 group cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{task.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600">الموعد: {task.dueDate}</p>
                        </div>
                      </div>
                      <Badge className={`${getPriorityColor(task.priority)} whitespace-nowrap`}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* الأنشطة الأخيرة المحسّنة */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CheckCircle className="w-5 h-5 text-green-600" />
                الأنشطة الأخيرة
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="p-4 rounded-xl border-l-4 border-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent hover:from-blue-100/50 transition-all duration-300">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600 mt-1">بواسطة: {activity.user}</p>
                      </div>
                      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ملخص الأداء */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardHeader className="border-b border-blue-100">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className="w-5 h-5 text-blue-600" />
              ملخص الأداء
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'معدل الإنجاز', value: '94%', color: 'text-green-600' },
                { label: 'متوسط وقت المعالجة', value: '2.5 يوم', color: 'text-blue-600' },
                { label: 'رضا المستخدمين', value: '4.8/5', color: 'text-purple-600' },
              ].map((item, idx) => (
                <div key={idx} className="text-center p-4 rounded-lg bg-white/50 border border-white/80">
                  <p className="text-gray-600 text-sm font-medium">{item.label}</p>
                  <p className={`text-3xl font-bold ${item.color} mt-2`}>{item.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* لوحة التحليلات المتقدمة */}
      {showAdvancedAnalytics && (
        <div className="mt-8">
          <AnalyticsDashboard />
        </div>
      )}
    </DashboardLayout>
  );
}

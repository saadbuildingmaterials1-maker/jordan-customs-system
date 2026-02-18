import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Download,
  Calendar,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
  DollarSign,
  Briefcase,
  Eye,
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'active' | 'on_leave' | 'inactive';
  salary: number;
  performance: number;
}

interface Leave {
  id: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'approved' | 'pending' | 'rejected';
}

export default function HRManagementDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      position: 'مدير العمليات',
      department: 'العمليات',
      email: 'ahmad@customs.jo',
      phone: '+962791234567',
      joinDate: '2020-03-15',
      status: 'active',
      salary: 1500,
      performance: 92,
    },
    {
      id: '2',
      name: 'فاطمة علي',
      position: 'موظف شحن',
      department: 'الشحن',
      email: 'fatima@customs.jo',
      phone: '+962792345678',
      joinDate: '2021-06-20',
      status: 'active',
      salary: 800,
      performance: 85,
    },
    {
      id: '3',
      name: 'محمود حسن',
      position: 'مسؤول الجمارك',
      department: 'الجمارك',
      email: 'mahmoud@customs.jo',
      phone: '+962793456789',
      joinDate: '2019-01-10',
      status: 'on_leave',
      salary: 1200,
      performance: 88,
    },
    {
      id: '4',
      name: 'سارة أحمد',
      position: 'مسؤول المبيعات',
      department: 'المبيعات',
      email: 'sarah@customs.jo',
      phone: '+962794567890',
      joinDate: '2021-09-05',
      status: 'active',
      salary: 950,
      performance: 90,
    },
  ]);

  const [leaves, setLeaves] = useState<Leave[]>([
    {
      id: '1',
      employeeName: 'محمود حسن',
      type: 'إجازة سنوية',
      startDate: '2026-02-18',
      endDate: '2026-02-25',
      days: 7,
      status: 'approved',
    },
    {
      id: '2',
      employeeName: 'أحمد محمد',
      type: 'إجازة مرضية',
      startDate: '2026-02-20',
      endDate: '2026-02-22',
      days: 2,
      status: 'pending',
    },
    {
      id: '3',
      employeeName: 'فاطمة علي',
      type: 'إجازة أمومة',
      startDate: '2026-03-01',
      endDate: '2026-05-31',
      days: 90,
      status: 'approved',
    },
  ]);

  const departmentData = [
    { name: 'العمليات', employees: 8, percentage: 32 },
    { name: 'الشحن', employees: 6, percentage: 24 },
    { name: 'الجمارك', employees: 7, percentage: 28 },
    { name: 'المبيعات', employees: 4, percentage: 16 },
  ];

  const performanceData = [
    { range: '90-100', count: 12 },
    { range: '80-89', count: 8 },
    { range: '70-79', count: 4 },
    { range: 'أقل من 70', count: 1 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'on_leave':
        return 'في إجازة';
      case 'inactive':
        return 'غير نشط';
      case 'approved':
        return 'موافق عليه';
      case 'pending':
        return 'قيد الانتظار';
      case 'rejected':
        return 'مرفوض';
      default:
        return '';
    }
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const onLeave = employees.filter(e => e.status === 'on_leave').length;
  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);
  const averagePerformance = (employees.reduce((sum, e) => sum + e.performance, 0) / employees.length).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              لوحة تحكم الموارد البشرية
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة الموظفين والرواتب والإجازات
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            موظف جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي الموظفين</p>
                <p className="text-3xl font-bold text-blue-600">{totalEmployees}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">موظفون نشطون</p>
                <p className="text-3xl font-bold text-green-600">{activeEmployees}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">في إجازة</p>
                <p className="text-3xl font-bold text-yellow-600">{onLeave}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي الرواتب</p>
                <p className="text-2xl font-bold text-purple-600">${totalPayroll}K</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                <p className="text-gray-600 text-sm">متوسط الأداء</p>
                <p className="text-3xl font-bold text-orange-600">{averagePerformance}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* توزيع الموظفين حسب القسم */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                توزيع الموظفين حسب القسم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="employees"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* توزيع الأداء */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                توزيع مستويات الأداء
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="عدد الموظفين" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* قائمة الموظفين */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              قائمة الموظفين
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {employees.map(employee => (
              <div
                key={employee.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <User className="w-10 h-10 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {employee.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {employee.position} - {employee.department}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {employee.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {employee.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(employee.status)}>
                      {getStatusLabel(employee.status)}
                    </Badge>
                    <div className="mt-2 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">الراتب: ${employee.salary}K</p>
                      <p className="text-gray-600 dark:text-gray-400">الأداء: {employee.performance}%</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-4 h-4" />
                    عرض
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* طلبات الإجازات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              طلبات الإجازات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {leaves.map(leave => (
              <div
                key={leave.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {leave.employeeName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {leave.type} - {leave.days} أيام
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    من {leave.startDate} إلى {leave.endDate}
                  </p>
                </div>
                <Badge className={getStatusColor(leave.status)}>
                  {getStatusLabel(leave.status)}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: راقب أداء الموظفين بانتظام وقدم ملاحظات بناءة. تأكد من إدارة الرواتب والإجازات بكفاءة لضمان رضا الموظفين.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

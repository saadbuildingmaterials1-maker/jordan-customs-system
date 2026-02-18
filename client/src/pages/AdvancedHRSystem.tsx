import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Clock,
  Award,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  salary: number;
  joinDate: string;
  status: 'active' | 'on-leave' | 'inactive';
  performance: number;
  email: string;
  phone: string;
}

interface Payroll {
  id: string;
  month: string;
  totalSalaries: number;
  bonuses: number;
  deductions: number;
  netPayment: number;
  status: 'pending' | 'processed' | 'paid';
}

interface LeaveRequest {
  id: string;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
}

export default function AdvancedHRSystem() {
  const [employees] = useState<Employee[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      position: 'مدير العمليات',
      department: 'العمليات',
      salary: 2500,
      joinDate: '2020-01-15',
      status: 'active',
      performance: 92,
      email: 'ahmad@example.com',
      phone: '+962791234567',
    },
    {
      id: '2',
      name: 'فاطمة علي',
      position: 'مسؤول الحسابات',
      department: 'المالية',
      salary: 2000,
      joinDate: '2021-06-20',
      status: 'active',
      performance: 88,
      email: 'fatima@example.com',
      phone: '+962792345678',
    },
    {
      id: '3',
      name: 'محمود سالم',
      position: 'مندوب المبيعات',
      department: 'المبيعات',
      salary: 1800,
      joinDate: '2022-03-10',
      status: 'on-leave',
      performance: 85,
      email: 'mahmoud@example.com',
      phone: '+962793456789',
    },
  ]);

  const [payrolls] = useState<Payroll[]>([
    {
      id: '1',
      month: 'فبراير 2026',
      totalSalaries: 45000,
      bonuses: 5000,
      deductions: 2000,
      netPayment: 48000,
      status: 'paid',
    },
    {
      id: '2',
      month: 'يناير 2026',
      totalSalaries: 45000,
      bonuses: 3000,
      deductions: 1500,
      netPayment: 46500,
      status: 'processed',
    },
  ]);

  const [leaveRequests] = useState<LeaveRequest[]>([
    {
      id: '1',
      employee: 'محمود سالم',
      type: 'إجازة سنوية',
      startDate: '2026-02-20',
      endDate: '2026-02-27',
      days: 8,
      status: 'approved',
      reason: 'إجازة عائلية',
    },
    {
      id: '2',
      employee: 'سارة حسن',
      type: 'إجازة مرضية',
      startDate: '2026-02-18',
      endDate: '2026-02-19',
      days: 2,
      status: 'pending',
      reason: 'مرض',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'on-leave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return '';
    }
  };

  const getLeaveStatusColor = (status: string) => {
    switch (status) {
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

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const totalSalaries = employees.reduce((sum, e) => sum + e.salary, 0);
  const averagePerformance = (employees.reduce((sum, e) => sum + e.performance, 0) / employees.length).toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              نظام إدارة الموارد البشرية المتقدم
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة الموظفين والرواتب والإجازات والأداء
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            موظف جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-gray-600 text-sm">الموظفين النشطين</p>
                <p className="text-3xl font-bold text-green-600">{activeEmployees}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي الرواتب</p>
                <p className="text-3xl font-bold text-purple-600">{totalSalaries.toLocaleString()} JOD</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                <p className="text-gray-600 text-sm">متوسط الأداء</p>
                <p className="text-3xl font-bold text-orange-600">{averagePerformance}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* قائمة الموظفين */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              الموظفين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الاسم</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الوظيفة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">القسم</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الراتب</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الأداء</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(employee => (
                    <tr
                      key={employee.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-semibold">{employee.name}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{employee.position}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{employee.department}</td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{employee.salary.toLocaleString()} JOD</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(employee.status)}>
                          {employee.status === 'active' ? 'نشط' : employee.status === 'on-leave' ? 'في إجازة' : 'غير نشط'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{employee.performance}%</td>
                      <td className="py-3 px-4 flex gap-2">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* الرواتب والمدفوعات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              الرواتب والمدفوعات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payrolls.map(payroll => (
              <div key={payroll.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{payroll.month}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      إجمالي الرواتب: {payroll.totalSalaries.toLocaleString()} JOD
                    </p>
                  </div>
                  <Badge className={payroll.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'}>
                    {payroll.status === 'paid' ? 'مدفوعة' : 'قيد المعالجة'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">المكافآت</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{payroll.bonuses.toLocaleString()} JOD</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">الخصومات</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{payroll.deductions.toLocaleString()} JOD</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">الدفع الصافي</p>
                    <p className="font-semibold text-green-600">{payroll.netPayment.toLocaleString()} JOD</p>
                  </div>
                </div>

                <Button size="sm" variant="outline" className="gap-1">
                  <Download className="w-4 h-4" />
                  تحميل التقرير
                </Button>
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
            {leaveRequests.map(request => (
              <div key={request.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{request.employee}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{request.type}</p>
                  </div>
                  <Badge className={getLeaveStatusColor(request.status)}>
                    {request.status === 'approved' ? 'موافق عليها' : request.status === 'pending' ? 'قيد الانتظار' : 'مرفوضة'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">من</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{request.startDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">إلى</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{request.endDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">الأيام</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{request.days}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">السبب: {request.reason}</p>

                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1">
                      <CheckCircle className="w-4 h-4" />
                      الموافقة
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <XCircle className="w-4 h-4" />
                      الرفض
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: تأكد من تحديث بيانات الموظفين بانتظام وتقييم الأداء بشكل دوري لتحسين إنتاجية الفريق.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

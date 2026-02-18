import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Search,
  Download,
  Filter,
  User,
  FileText,
  DollarSign,
  Trash2,
  Edit,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
} from 'lucide-react';

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  type: 'create' | 'edit' | 'delete' | 'view' | 'download' | 'payment';
  target: string;
  timestamp: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failed' | 'pending';
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>([
    {
      id: '1',
      user: 'أحمد محمد',
      action: 'إنشاء فاتورة جديدة',
      type: 'create',
      target: 'INV-1708315294000-A7K9X2B1',
      timestamp: '2026-02-18 10:30:45',
      details: 'فاتورة بقيمة 5,000 د.ا',
      ipAddress: '192.168.1.100',
      status: 'success',
    },
    {
      id: '2',
      user: 'فاطمة علي',
      action: 'تعديل فاتورة',
      type: 'edit',
      target: 'INV-1708315294000-A7K9X2B1',
      timestamp: '2026-02-18 10:15:30',
      details: 'تم تحديث حالة الفاتورة إلى مدفوع',
      ipAddress: '192.168.1.101',
      status: 'success',
    },
    {
      id: '3',
      user: 'محمود حسن',
      action: 'عرض تقرير',
      type: 'view',
      target: 'تقرير يناير 2026',
      timestamp: '2026-02-18 09:45:15',
      details: 'عرض تقرير الفواتير الشهري',
      ipAddress: '192.168.1.102',
      status: 'success',
    },
    {
      id: '4',
      user: 'سارة يوسف',
      action: 'تحميل ملف',
      type: 'download',
      target: 'تقرير_فبراير_2026.pdf',
      timestamp: '2026-02-18 08:30:20',
      details: 'تحميل تقرير شامل',
      ipAddress: '192.168.1.103',
      status: 'success',
    },
    {
      id: '5',
      user: 'أحمد محمد',
      action: 'معالجة دفعة',
      type: 'payment',
      target: 'PAY-1708315294000-B2K8Y3C4',
      timestamp: '2026-02-18 07:20:10',
      details: 'دفعة بقيمة 3,500 د.ا عبر Telr',
      ipAddress: '192.168.1.100',
      status: 'success',
    },
    {
      id: '6',
      user: 'فاطمة علي',
      action: 'حذف فاتورة',
      type: 'delete',
      target: 'INV-1708315294000-OLD1',
      timestamp: '2026-02-17 16:45:30',
      details: 'حذف فاتورة قديمة',
      ipAddress: '192.168.1.101',
      status: 'failed',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    const matchesUser = filterUser === 'all' || log.user === filterUser;
    return matchesSearch && matchesType && matchesStatus && matchesUser;
  });

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'create':
        return <Plus className="w-4 h-4 text-green-500" />;
      case 'edit':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'view':
        return <FileText className="w-4 h-4 text-gray-500" />;
      case 'download':
        return <Download className="w-4 h-4 text-purple-500" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getActionLabel = (type: string) => {
    switch (type) {
      case 'create':
        return 'إنشاء';
      case 'edit':
        return 'تعديل';
      case 'delete':
        return 'حذف';
      case 'view':
        return 'عرض';
      case 'download':
        return 'تحميل';
      case 'payment':
        return 'دفعة';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
        return 'نجح';
      case 'failed':
        return 'فشل';
      case 'pending':
        return 'قيد الانتظار';
      default:
        return '';
    }
  };

  const uniqueUsers = Array.from(new Set(logs.map(l => l.user)));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              سجل النشاط والتدقيق
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              متابعة جميع الأنشطة والعمليات في النظام
            </p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            تصدير السجل
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Activity className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي النشاطات</p>
                <p className="text-3xl font-bold text-blue-600">{logs.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">ناجحة</p>
                <p className="text-3xl font-bold text-green-600">
                  {logs.filter(l => l.status === 'success').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
                <p className="text-gray-600 text-sm">فاشلة</p>
                <p className="text-3xl font-bold text-red-600">
                  {logs.filter(l => l.status === 'failed').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <User className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">المستخدمون النشطون</p>
                <p className="text-3xl font-bold text-purple-600">
                  {uniqueUsers.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* البحث والفلترة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              البحث والفلترة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="ابحث عن مستخدم أو إجراء أو هدف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">جميع الأنواع</option>
                  <option value="create">إنشاء</option>
                  <option value="edit">تعديل</option>
                  <option value="delete">حذف</option>
                  <option value="view">عرض</option>
                  <option value="download">تحميل</option>
                  <option value="payment">دفعة</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="success">نجح</option>
                  <option value="failed">فشل</option>
                  <option value="pending">قيد الانتظار</option>
                </select>

                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">جميع المستخدمين</option>
                  {uniqueUsers.map(user => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>

                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="من التاريخ"
                />

                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="إلى التاريخ"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* السجل */}
        <Card>
          <CardHeader>
            <CardTitle>السجل التفصيلي</CardTitle>
            <CardDescription>
              {filteredLogs.length} نشاط
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="mt-1">
                          {getActionIcon(log.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {log.action}
                            </h3>
                            <Badge variant="outline">
                              {getActionLabel(log.type)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {log.details}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {log.user}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {log.target}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {log.timestamp}
                            </span>
                            <span>IP: {log.ipAddress}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <Badge variant="outline">
                          {getStatusLabel(log.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    لا توجد نشاطات تطابق البحث
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: يمكنك تصدير السجل الكامل لأغراض التدقيق والمراجعة. جميع العمليات يتم تسجيلها مع عنوان IP والمستخدم والوقت.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

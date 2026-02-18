import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  FileText,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  User,
  Calendar,
  TrendingUp,
  Shield,
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  status: 'success' | 'warning' | 'error';
  module: string;
  ipAddress: string;
}

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  status: 'compliant' | 'warning' | 'non-compliant';
  lastChecked: string;
  nextCheck: string;
  severity: 'high' | 'medium' | 'low';
}

export default function ComplianceAudit() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: '1',
      action: 'تسجيل الدخول',
      user: 'أحمد محمد',
      timestamp: '2026-02-18 14:30:00',
      details: 'تسجيل دخول ناجح',
      status: 'success',
      module: 'المصادقة',
      ipAddress: '192.168.1.100',
    },
    {
      id: '2',
      action: 'تعديل الفاتورة',
      user: 'فاطمة علي',
      timestamp: '2026-02-18 14:25:00',
      details: 'تم تعديل رقم الفاتورة #12345',
      status: 'success',
      module: 'الفواتير',
      ipAddress: '192.168.1.101',
    },
    {
      id: '3',
      action: 'محاولة وصول غير مصرح',
      user: 'نظام',
      timestamp: '2026-02-18 14:20:00',
      details: 'محاولة وصول إلى صفحة محمية بدون صلاحيات',
      status: 'warning',
      module: 'الأمان',
      ipAddress: '192.168.1.102',
    },
    {
      id: '4',
      action: 'حذف المستند',
      user: 'محمود حسن',
      timestamp: '2026-02-18 14:15:00',
      details: 'تم حذف المستند: نموذج الفاتورة',
      status: 'success',
      module: 'المستندات',
      ipAddress: '192.168.1.103',
    },
    {
      id: '5',
      action: 'خطأ في النظام',
      user: 'نظام',
      timestamp: '2026-02-18 14:10:00',
      details: 'خطأ في الاتصال بقاعدة البيانات',
      status: 'error',
      module: 'قاعدة البيانات',
      ipAddress: '192.168.1.1',
    },
  ]);

  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([
    {
      id: '1',
      name: 'حماية البيانات الشخصية',
      description: 'التأكد من تشفير جميع البيانات الشخصية',
      status: 'compliant',
      lastChecked: '2026-02-18 10:00',
      nextCheck: '2026-02-25 10:00',
      severity: 'high',
    },
    {
      id: '2',
      name: 'سجل التدقيق',
      description: 'الاحتفاظ بسجل كامل لجميع العمليات',
      status: 'compliant',
      lastChecked: '2026-02-18 09:00',
      nextCheck: '2026-02-25 09:00',
      severity: 'high',
    },
    {
      id: '3',
      name: 'الوصول المراقب',
      description: 'التحكم في الوصول بناءً على الأدوار والصلاحيات',
      status: 'warning',
      lastChecked: '2026-02-17 11:00',
      nextCheck: '2026-02-24 11:00',
      severity: 'high',
    },
    {
      id: '4',
      name: 'النسخ الاحتياطية',
      description: 'إجراء نسخ احتياطية يومية للبيانات',
      status: 'compliant',
      lastChecked: '2026-02-18 08:00',
      nextCheck: '2026-02-19 08:00',
      severity: 'medium',
    },
    {
      id: '5',
      name: 'تحديثات الأمان',
      description: 'تطبيق تحديثات الأمان بانتظام',
      status: 'non-compliant',
      lastChecked: '2026-02-15 14:00',
      nextCheck: '2026-02-22 14:00',
      severity: 'high',
    },
  ]);

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'non-compliant':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
        return 'نجح';
      case 'warning':
        return 'تحذير';
      case 'error':
        return 'خطأ';
      case 'compliant':
        return 'متوافق';
      case 'non-compliant':
        return 'غير متوافق';
      case 'warning':
        return 'تحذير';
      default:
        return '';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return '';
    }
  };

  const successCount = auditLogs.filter(l => l.status === 'success').length;
  const warningCount = auditLogs.filter(l => l.status === 'warning').length;
  const errorCount = auditLogs.filter(l => l.status === 'error').length;
  const compliantCount = complianceRules.filter(r => r.status === 'compliant').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              نظام التدقيق والامتثال
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              تتبع جميع العمليات والتحقق من الامتثال للمتطلبات
            </p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            تصدير التقرير
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">عمليات ناجحة</p>
                <p className="text-3xl font-bold text-green-600">{successCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">تحذيرات</p>
                <p className="text-3xl font-bold text-yellow-600">{warningCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
                <p className="text-gray-600 text-sm">أخطاء</p>
                <p className="text-3xl font-bold text-red-600">{errorCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">متوافقة</p>
                <p className="text-3xl font-bold text-blue-600">{compliantCount}/{complianceRules.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* سجل التدقيق */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  سجل التدقيق
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {auditLogs.map(log => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(log.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {log.action}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {log.details}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">{log.module}</Badge>
                            <Badge variant="outline" className="text-xs">
                              {log.timestamp}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {log.user}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {log.ipAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* قواعد الامتثال */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  قواعد الامتثال
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {complianceRules.map(rule => (
                  <div
                    key={rule.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(rule.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {rule.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {rule.description}
                          </p>
                        </div>
                      </div>
                      <Badge className={getSeverityColor(rule.severity)}>
                        {rule.severity === 'high' ? 'عالية' :
                         rule.severity === 'medium' ? 'متوسطة' :
                         'منخفضة'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mt-2">
                      <span>آخر فحص: {rule.lastChecked}</span>
                      <span>الفحص التالي: {rule.nextCheck}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* تفاصيل السجل */}
          <div>
            {selectedLog ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(selectedLog.status)}
                    {selectedLog.action}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الحالة</p>
                    <Badge variant="outline">
                      {getStatusLabel(selectedLog.status)}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      المستخدم
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedLog.user}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      الوقت
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedLog.timestamp}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">الوحدة</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedLog.module}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">عنوان IP</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedLog.ipAddress}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">التفاصيل</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedLog.details}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    اختر سجلاً لعرض التفاصيل
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: راجع سجل التدقيق بانتظام وتأكد من امتثال النظام لجميع القواعس المطلوبة. قم بتصدير التقارير للحفاظ على سجل دائم.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Settings,
  Trash2,
  Eye,
  Plus,
  Filter,
  Search,
  Send,
  BarChart3,
  TrendingUp,
  Users,
  Zap,
  Mail,
  MessageSquare,
  Phone,
} from 'lucide-react';

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
  source: string;
  action?: string;
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  severity: 'critical' | 'warning' | 'info';
  channels: string[];
  enabled: boolean;
  recipients: number;
}

interface AlertStatistics {
  total: number;
  critical: number;
  warning: number;
  info: number;
  unread: number;
}

export default function FinalAdvancedAlerts() {
  const [alerts] = useState<Alert[]>([
    {
      id: '1',
      title: 'تأخر في المدفوعات',
      message: 'العميل أحمد محمد لم يسدد الفاتورة #2024-001 بعد 30 يوماً',
      severity: 'critical',
      timestamp: '2026-02-18 14:30',
      read: false,
      source: 'نظام الفواتير',
      action: 'متابعة الدفع',
    },
    {
      id: '2',
      title: 'تحذير: استهلاك الموارد مرتفع',
      message: 'استخدام الذاكرة وصل إلى 85% من الحد الأقصى',
      severity: 'warning',
      timestamp: '2026-02-18 14:15',
      read: false,
      source: 'نظام المراقبة',
      action: 'تحسين الأداء',
    },
    {
      id: '3',
      title: 'معلومة: تحديث النظام متاح',
      message: 'تحديث أمني جديد متاح للنظام. يُنصح بالتحديث في أقرب وقت',
      severity: 'info',
      timestamp: '2026-02-18 14:00',
      read: true,
      source: 'إدارة النظام',
    },
    {
      id: '4',
      title: 'نجاح: تمت المزامنة بنجاح',
      message: 'تمت مزامنة 156 سجل من نظام الشحن SMSA بنجاح',
      severity: 'info',
      timestamp: '2026-02-18 13:45',
      read: true,
      source: 'نظام التكامل',
    },
  ]);

  const [alertRules] = useState<AlertRule[]>([
    {
      id: '1',
      name: 'تأخر المدفوعات',
      condition: 'الفاتورة غير مدفوعة بعد 30 يوماً',
      severity: 'critical',
      channels: ['بريد إلكتروني', 'رسالة نصية', 'تطبيق'],
      enabled: true,
      recipients: 5,
    },
    {
      id: '2',
      name: 'استهلاك الموارد المرتفع',
      condition: 'استخدام الذاكرة > 80%',
      severity: 'warning',
      channels: ['بريد إلكتروني', 'تطبيق'],
      enabled: true,
      recipients: 3,
    },
    {
      id: '3',
      name: 'فشل المزامنة',
      condition: 'فشل المزامنة مع النظام الخارجي',
      severity: 'critical',
      channels: ['بريد إلكتروني', 'رسالة نصية'],
      enabled: true,
      recipients: 2,
    },
  ]);

  const [statistics] = useState<AlertStatistics>({
    total: 156,
    critical: 12,
    warning: 34,
    info: 110,
    unread: 8,
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return '';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'حرج';
      case 'warning':
        return 'تحذير';
      case 'info':
        return 'معلومة';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-10 h-10 text-red-600" />
              نظام الإشعارات المتقدم النهائي
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة شاملة للإشعارات والتنبيهات الذكية
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إشعار جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Bell className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي الإشعارات</p>
                <p className="text-3xl font-bold text-blue-600">{statistics.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
                <p className="text-gray-600 text-sm">حرجة</p>
                <p className="text-3xl font-bold text-red-600">{statistics.critical}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">تحذيرات</p>
                <p className="text-3xl font-bold text-yellow-600">{statistics.warning}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Info className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">معلومات</p>
                <p className="text-3xl font-bold text-blue-600">{statistics.info}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">غير مقروءة</p>
                <p className="text-3xl font-bold text-purple-600">{statistics.unread}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* قائمة الإشعارات */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                الإشعارات الأخيرة
              </CardTitle>
              <input
                type="text"
                placeholder="ابحث عن إشعار..."
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${
                  !alert.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {alert.title}
                      </h3>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {getSeverityLabel(alert.severity)}
                      </Badge>
                      {!alert.read && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                          جديد
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span>المصدر: {alert.source}</span>
                        <span>{alert.timestamp}</span>
                      </div>
                      {alert.action && (
                        <Button size="sm" className="gap-1">
                          <Send className="w-3 h-3" />
                          {alert.action}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* قواعس الإشعارات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              قواعس الإشعارات المتقدمة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertRules.map(rule => (
              <div key={rule.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {rule.name}
                      </h3>
                      <Badge className={getSeverityColor(rule.severity)}>
                        {getSeverityLabel(rule.severity)}
                      </Badge>
                      <Badge className={rule.enabled ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'}>
                        {rule.enabled ? 'مفعل' : 'معطل'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      الشرط: {rule.condition}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">قنوات الإخطار</p>
                    <div className="flex gap-1 flex-wrap mt-1">
                      {rule.channels.map((channel, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {channel === 'بريد إلكتروني' && <Mail className="w-3 h-3 ml-1" />}
                          {channel === 'رسالة نصية' && <MessageSquare className="w-3 h-3 ml-1" />}
                          {channel === 'تطبيق' && <Bell className="w-3 h-3 ml-1" />}
                          {channel}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">المستقبلين</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{rule.recipients} أشخاص</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-4 h-4" />
                    عرض
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Settings className="w-4 h-4" />
                    تعديل
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            ✅ نصيحة: استخدم قواعس الإشعارات المتقدمة لتخصيص التنبيهات حسب احتياجاتك. تأكد من تفعيل الإشعارات المهمة وتعطيل غير الضرورية لتحسين الإنتاجية.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

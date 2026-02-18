import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  ToggleLeft,
  ToggleRight,
  Mail,
  MessageSquare,
  Smartphone,
} from 'lucide-react';

interface SmartAlert {
  id: string;
  name: string;
  condition: string;
  threshold: string;
  type: 'warning' | 'critical' | 'info';
  enabled: boolean;
  recipients: string[];
  notificationMethods: ('email' | 'sms' | 'push')[];
  lastTriggered: string;
  triggerCount: number;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
}

export default function SmartAlerts() {
  const [alerts, setAlerts] = useState<SmartAlert[]>([
    {
      id: '1',
      name: 'تأخر المدفوعات',
      condition: 'الفاتورة غير مدفوعة بعد 7 أيام',
      threshold: '7 أيام',
      type: 'warning',
      enabled: true,
      recipients: ['admin@customs.jo', 'manager@customs.jo'],
      notificationMethods: ['email', 'sms'],
      lastTriggered: '2026-02-18 14:30',
      triggerCount: 5,
    },
    {
      id: '2',
      name: 'زيادة الأسعار',
      condition: 'ارتفاع سعر الشحن أكثر من 10%',
      threshold: '10%',
      type: 'critical',
      enabled: true,
      recipients: ['admin@customs.jo'],
      notificationMethods: ['email', 'push'],
      lastTriggered: '2026-02-17 10:15',
      triggerCount: 2,
    },
    {
      id: '3',
      name: 'خطأ في النظام',
      condition: 'معدل الأخطاء أكثر من 5%',
      threshold: '5%',
      type: 'critical',
      enabled: true,
      recipients: ['admin@customs.jo', 'tech@customs.jo'],
      notificationMethods: ['email', 'sms', 'push'],
      lastTriggered: '2026-02-15 09:00',
      triggerCount: 1,
    },
    {
      id: '4',
      name: 'استخدام قاعدة البيانات',
      condition: 'استخدام مساحة قاعدة البيانات أكثر من 80%',
      threshold: '80%',
      type: 'warning',
      enabled: false,
      recipients: ['admin@customs.jo'],
      notificationMethods: ['email'],
      lastTriggered: '2026-02-10 16:45',
      triggerCount: 3,
    },
  ]);

  const [selectedAlert, setSelectedAlert] = useState<SmartAlert | null>(null);
  const [showAddAlert, setShowAddAlert] = useState(false);

  const alertRules: AlertRule[] = [
    {
      id: '1',
      name: 'تأخر المدفوعات',
      description: 'إرسال تنبيه عند تأخر الدفع',
      condition: 'invoice.status === "unpaid" && days_since_creation > 7',
      action: 'send_notification("payment_overdue")',
    },
    {
      id: '2',
      name: 'زيادة الأسعار',
      description: 'إرسال تنبيه عند ارتفاع الأسعار',
      condition: 'price_change > 10%',
      action: 'send_notification("price_increase")',
    },
    {
      id: '3',
      name: 'خطأ في النظام',
      description: 'إرسال تنبيه عند حدوث أخطاء متكررة',
      condition: 'error_rate > 5%',
      action: 'send_notification("system_error")',
    },
  ];

  const handleToggleAlert = (alertId: string) => {
    setAlerts(alerts.map(a =>
      a.id === alertId ? { ...a, enabled: !a.enabled } : a
    ));
  };

  const handleDeleteAlert = (alertId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التنبيه؟')) {
      setAlerts(alerts.filter(a => a.id !== alertId));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Bell className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
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

  const getTypeColor = (type: string) => {
    switch (type) {
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

  const enabledCount = alerts.filter(a => a.enabled).length;
  const criticalCount = alerts.filter(a => a.type === 'critical' && a.enabled).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              نظام التنبيهات الذكية
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة التنبيهات والتنبيهات التلقائية
            </p>
          </div>
          <Button onClick={() => setShowAddAlert(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة تنبيه جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Bell className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي التنبيهات</p>
                <p className="text-3xl font-bold text-blue-600">{alerts.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">مفعلة</p>
                <p className="text-3xl font-bold text-green-600">{enabledCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 mx-auto text-red-500 mb-2" />
                <p className="text-gray-600 text-sm">حرجة</p>
                <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي التفعيلات</p>
                <p className="text-3xl font-bold text-purple-600">
                  {alerts.reduce((sum, a) => sum + a.triggerCount, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة التنبيهات */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  التنبيهات المُعرّفة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getTypeIcon(alert.type)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {alert.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {alert.condition}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge className={getTypeColor(alert.type)}>
                              {getTypeLabel(alert.type)}
                            </Badge>
                            {alert.enabled ? (
                              <Badge variant="default">مفعل</Badge>
                            ) : (
                              <Badge variant="outline">معطل</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleAlert(alert.id);
                          }}
                          className="p-2"
                        >
                          {alert.enabled ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAlert(alert);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAlert(alert.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* قواعد التنبيهات */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  قواعد التنبيهات المتقدمة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alertRules.map(rule => (
                  <div
                    key={rule.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {rule.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {rule.description}
                    </p>
                    <div className="space-y-1 text-xs font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900 p-2 rounded">
                      <div>الشرط: {rule.condition}</div>
                      <div>الإجراء: {rule.action}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* تفاصيل التنبيه */}
          <div>
            {selectedAlert ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedAlert.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">النوع</p>
                    <Badge className={getTypeColor(selectedAlert.type)}>
                      {getTypeLabel(selectedAlert.type)}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الشرط</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedAlert.condition}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الحد الأدنى</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedAlert.threshold}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      طرق الإخطار
                    </p>
                    <div className="space-y-1">
                      {selectedAlert.notificationMethods.map(method => (
                        <div key={method} className="flex items-center gap-2 text-sm">
                          {method === 'email' && <Mail className="w-4 h-4" />}
                          {method === 'sms' && <MessageSquare className="w-4 h-4" />}
                          {method === 'push' && <Smartphone className="w-4 h-4" />}
                          <span className="text-gray-700 dark:text-gray-300">
                            {method === 'email' ? 'البريد الإلكتروني' :
                             method === 'sms' ? 'رسالة نصية' :
                             'إشعار فوري'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      المستقبلون
                    </p>
                    <div className="space-y-1">
                      {selectedAlert.recipients.map(recipient => (
                        <div key={recipient} className="text-sm text-gray-700 dark:text-gray-300">
                          {recipient}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">آخر تفعيل</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedAlert.lastTriggered}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">عدد التفعيلات</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedAlert.triggerCount}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    اختر تنبيهاً لعرض التفاصيل
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
            💡 نصيحة: يمكنك تخصيص التنبيهات حسب احتياجاتك واختيار طرق الإخطار المناسبة. التنبيهات الحرجة تتطلب انتباهاً فوري.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

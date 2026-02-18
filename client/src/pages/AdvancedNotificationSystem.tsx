import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Trash2,
  Eye,
  Send,
  Plus,
  Filter,
  Search,
  Volume2,
  Mail,
  MessageSquare,
  Smartphone,
  Edit,
  Archive,
  Zap,
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info';
  status: 'read' | 'unread';
  timestamp: string;
  channels: string[];
  priority: 'high' | 'medium' | 'low';
}

interface NotificationRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  channels: string[];
  status: 'active' | 'inactive';
  createdDate: string;
}

export default function AdvancedNotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'فاتورة متأخرة',
      message: 'العميل أحمد محمد لم يدفع الفاتورة INV-2026-001 بعد تاريخ الاستحقاق',
      type: 'critical',
      status: 'unread',
      timestamp: '2026-02-18 10:30',
      channels: ['email', 'sms', 'app'],
      priority: 'high',
    },
    {
      id: '2',
      title: 'طلب جديد',
      message: 'تم استقبال طلب شحن جديد من فاطمة علي برقم ORD-2026-045',
      type: 'info',
      status: 'unread',
      timestamp: '2026-02-18 09:15',
      channels: ['email', 'app'],
      priority: 'medium',
    },
    {
      id: '3',
      title: 'تحذير الأداء',
      message: 'معدل الاستجابة انخفض إلى 85% من المستهدف',
      type: 'warning',
      status: 'read',
      timestamp: '2026-02-18 08:00',
      channels: ['email', 'app'],
      priority: 'medium',
    },
    {
      id: '4',
      title: 'نجاح العملية',
      message: 'تم معالجة الشحنة رقم SHP-2026-123 بنجاح',
      type: 'info',
      status: 'read',
      timestamp: '2026-02-18 07:45',
      channels: ['app'],
      priority: 'low',
    },
  ]);

  const [rules, setRules] = useState<NotificationRule[]>([
    {
      id: '1',
      name: 'تنبيه الفواتير المتأخرة',
      trigger: 'Invoice Status Changed',
      condition: 'Status = Overdue',
      channels: ['email', 'sms', 'app'],
      status: 'active',
      createdDate: '2026-01-15',
    },
    {
      id: '2',
      name: 'تنبيه الطلبات الجديدة',
      trigger: 'New Order Created',
      condition: 'Order Amount > $500',
      channels: ['email', 'app'],
      status: 'active',
      createdDate: '2026-01-20',
    },
    {
      id: '3',
      name: 'تنبيه الأداء المنخفض',
      trigger: 'Performance Metric Changed',
      condition: 'Performance < 90%',
      channels: ['email', 'app'],
      status: 'active',
      createdDate: '2026-02-01',
    },
  ]);

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const criticalCount = notifications.filter(n => n.type === 'critical').length;
  const warningCount = notifications.filter(n => n.type === 'warning').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              نظام الإشعارات المتقدم
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة الإشعارات والتنبيهات الذكية والقواعس المتقدمة
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إشعار جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Bell className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي الإشعارات</p>
                <p className="text-3xl font-bold text-blue-600">{notifications.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
                <p className="text-gray-600 text-sm">إشعارات حرجة</p>
                <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">تحذيرات</p>
                <p className="text-3xl font-bold text-yellow-600">{warningCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Bell className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">غير مقروءة</p>
                <p className="text-3xl font-bold text-purple-600">{unreadCount}</p>
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
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-start justify-between ${
                  notification.status === 'unread'
                    ? 'bg-blue-50 dark:bg-blue-900/10'
                    : 'bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex gap-3 flex-1">
                  {getTypeIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {notification.title}
                      </h3>
                      <Badge className={getTypeColor(notification.type)}>
                        {getTypeLabel(notification.type)}
                      </Badge>
                      {notification.status === 'unread' && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {notification.timestamp}
                      </span>
                      <span>الأولوية: {notification.priority === 'high' ? 'عالية' : notification.priority === 'medium' ? 'متوسطة' : 'منخفضة'}</span>
                    </div>
                    <div className="flex gap-1">
                      {notification.channels.map(channel => (
                        <Badge key={channel} variant="outline" className="text-xs">
                          {channel === 'email' && <Mail className="w-3 h-3 mr-1" />}
                          {channel === 'sms' && <MessageSquare className="w-3 h-3 mr-1" />}
                          {channel === 'app' && <Bell className="w-3 h-3 mr-1" />}
                          {channel === 'email' && 'بريد'}
                          {channel === 'sms' && 'رسالة'}
                          {channel === 'app' && 'تطبيق'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Archive className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* قواعس الإشعارات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              قواعس الإشعارات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rules.map(rule => (
              <div
                key={rule.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {rule.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      المحفز: {rule.trigger}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      الشرط: {rule.condition}
                    </p>
                  </div>
                  <Badge
                    className={
                      rule.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                    }
                  >
                    {rule.status === 'active' ? 'نشط' : 'معطل'}
                  </Badge>
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">قنوات الإخطار:</p>
                  <div className="flex gap-2">
                    {rule.channels.map(channel => (
                      <Badge key={channel} variant="outline" className="text-xs">
                        {channel === 'email' && 'بريد إلكتروني'}
                        {channel === 'sms' && 'رسالة نصية'}
                        {channel === 'app' && 'تطبيق'}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Settings className="w-4 h-4" />
                    إعدادات
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* إعدادات الإشعارات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              إعدادات الإشعارات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                  تفعيل الإشعارات الصوتية
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>مفعل</option>
                  <option>معطل</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                  مستوى الإشعارات المهمة
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>جميع الإشعارات</option>
                  <option>الإشعارات الحرجة فقط</option>
                  <option>الإشعارات الحرجة والتحذيرات</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                  وقت الإخطار الأول
                </label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  defaultValue="08:00"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                  وقت الإخطار الأخير
                </label>
                <input
                  type="time"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  defaultValue="22:00"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="gap-2">
                <CheckCircle className="w-4 h-4" />
                حفظ الإعدادات
              </Button>
              <Button variant="outline" className="gap-2">
                <AlertCircle className="w-4 h-4" />
                إعادة تعيين
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: استخدم قواعس الإشعارات لتلقي تنبيهات فورية عند حدوث أحداث مهمة. قم بتخصيص القنوات والأولويات حسب احتياجاتك.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

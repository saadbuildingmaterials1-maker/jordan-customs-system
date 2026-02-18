import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  Plus,
  Trash2,
  Settings,
  Check,
  AlertCircle,
  Info,
  Zap,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Filter,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
  channels: string[];
  priority: 'high' | 'medium' | 'low';
  actionUrl?: string;
}

interface NotificationRule {
  id: string;
  name: string;
  condition: string;
  trigger: string;
  channels: string[];
  enabled: boolean;
}

export default function AdvancedNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'تحذير: تأخر في الدفع',
      message: 'العميل "شركة الأردن للشحن" تأخر عن دفع الفاتورة INV-2026-003',
      type: 'critical',
      timestamp: '2026-02-18T08:15:00',
      read: false,
      channels: ['email', 'sms', 'in-app'],
      priority: 'high',
      actionUrl: '/invoices-receipts',
    },
    {
      id: '2',
      title: 'معلومة: طلب جديد',
      message: 'تم استقبال طلب شحن جديد من "مؤسسة الجمارك الأردنية"',
      type: 'info',
      timestamp: '2026-02-18T07:45:00',
      read: true,
      channels: ['in-app', 'email'],
      priority: 'medium',
      actionUrl: '/orders',
    },
    {
      id: '3',
      title: 'تنبيه: المخزون منخفض',
      message: 'كمية صناديق الشحن انخفضت إلى 50 صندوق فقط',
      type: 'warning',
      timestamp: '2026-02-18T06:30:00',
      read: false,
      channels: ['email', 'in-app'],
      priority: 'high',
      actionUrl: '/inventory-management',
    },
    {
      id: '4',
      title: 'معلومة: تحديث النظام',
      message: 'تم تحديث النظام بنجاح إلى الإصدار 2.5.0',
      type: 'info',
      timestamp: '2026-02-17T22:00:00',
      read: true,
      channels: ['in-app'],
      priority: 'low',
    },
  ]);

  const [rules, setRules] = useState<NotificationRule[]>([
    {
      id: '1',
      name: 'تنبيهات تأخر الدفع',
      condition: 'الفاتورة متأخرة أكثر من 7 أيام',
      trigger: 'يومياً',
      channels: ['email', 'sms'],
      enabled: true,
    },
    {
      id: '2',
      name: 'تنبيهات المخزون المنخفض',
      condition: 'الكمية أقل من 100 وحدة',
      trigger: 'فوراً',
      channels: ['email', 'in-app'],
      enabled: true,
    },
    {
      id: '3',
      name: 'تنبيهات الطلبات الجديدة',
      condition: 'استقبال طلب جديد',
      trigger: 'فوراً',
      channels: ['in-app', 'sms'],
      enabled: true,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all');

  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || notif.type === filterType;
    const matchesRead = filterRead === 'all' ||
                       (filterRead === 'read' && notif.read) ||
                       (filterRead === 'unread' && !notif.read);
    return matchesSearch && matchesType && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.type === 'critical' && !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return '';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              نظام الإشعارات الفورية المتقدم
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة الإشعارات والتنبيهات الذكية
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              الإعدادات
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              إشعار جديد
            </Button>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Eye className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">غير مقروءة</p>
                <p className="text-3xl font-bold text-yellow-600">{unreadCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* الإشعارات */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  الإشعارات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* البحث والفلاتر */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="ابحث عن إشعار..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={filterType === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType('all')}
                    >
                      الكل
                    </Button>
                    <Button
                      variant={filterType === 'critical' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType('critical')}
                      className="gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      حرج
                    </Button>
                    <Button
                      variant={filterType === 'warning' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType('warning')}
                      className="gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      تحذير
                    </Button>
                    <Button
                      variant={filterType === 'info' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType('info')}
                      className="gap-1"
                    >
                      <Info className="w-3 h-3" />
                      معلومة
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={filterRead === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterRead('all')}
                    >
                      الكل
                    </Button>
                    <Button
                      variant={filterRead === 'unread' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterRead('unread')}
                      className="gap-1"
                    >
                      <EyeOff className="w-3 h-3" />
                      غير مقروءة
                    </Button>
                    <Button
                      variant={filterRead === 'read' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterRead('read')}
                      className="gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      مقروءة
                    </Button>
                  </div>
                </div>

                {/* قائمة الإشعارات */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredNotifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        notif.read
                          ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                          : 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {getTypeIcon(notif.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {notif.title}
                              </h3>
                              {!notif.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notif.message}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge className={getTypeColor(notif.type)}>
                                {getTypeLabel(notif.type)}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getPriorityColor(notif.priority)}`}
                              >
                                {notif.priority === 'high' ? 'أولوية عالية' :
                                 notif.priority === 'medium' ? 'أولوية متوسطة' :
                                 'أولوية منخفضة'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {new Date(notif.timestamp).toLocaleTimeString('ar-JO')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!notif.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notif.id)}
                              className="gap-1"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notif.id)}
                            className="gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* قواعس الإشعارات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                قواعس الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rules.map(rule => (
                <div
                  key={rule.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                      {rule.name}
                    </h3>
                    <Badge variant={rule.enabled ? 'default' : 'outline'}>
                      {rule.enabled ? 'مفعل' : 'معطل'}
                    </Badge>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {rule.condition}
                  </p>

                  <div className="flex gap-1 flex-wrap mb-2">
                    {rule.channels.map(channel => (
                      <Badge key={channel} variant="outline" className="text-xs">
                        {channel === 'email' && <Mail className="w-3 h-3 mr-1" />}
                        {channel === 'sms' && <MessageSquare className="w-3 h-3 mr-1" />}
                        {channel === 'in-app' && <Bell className="w-3 h-3 mr-1" />}
                        {channel === 'email' ? 'بريد' :
                         channel === 'sms' ? 'رسالة' :
                         'تطبيق'}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    التفعيل: {rule.trigger}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: استخدم قواعس الإشعارات المتقدمة لتخصيص التنبيهات حسب احتياجاتك. يمكنك تعيين قنوات إخطار مختلفة لأنواع مختلفة من الأحداث.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

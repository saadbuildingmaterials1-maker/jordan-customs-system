import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Trash2,
  Archive,
  Settings,
  Filter,
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export default function NotificationsAndAlerts() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'تم إتمام الدفع بنجاح',
      message: 'تم استقبال الدفع برقم INV-1708315294000-A7K9X2B1 بمبلغ 5,000 د.ا',
      timestamp: '2026-02-18 10:30',
      read: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'تم إنشاء فاتورة جديدة',
      message: 'تم إنشاء فاتورة جديدة برقم INV-1708315400000-B3M7Q5C2',
      timestamp: '2026-02-18 09:45',
      read: false,
    },
    {
      id: '3',
      type: 'warning',
      title: 'فاتورة قيد الانتظار',
      message: 'الفاتورة INV-1708315500000-D9L2R8E3 لم يتم دفعها بعد',
      timestamp: '2026-02-17 14:20',
      read: true,
    },
    {
      id: '4',
      type: 'error',
      title: 'فشل عملية الدفع',
      message: 'فشلت عملية الدفع للفاتورة INV-1708315600000-F5N4S1G4',
      timestamp: '2026-02-16 11:15',
      read: true,
    },
    {
      id: '5',
      type: 'success',
      title: 'تم استرجاع المبلغ',
      message: 'تم استرجاع مبلغ 4,200 د.ا للفاتورة INV-1708315600000-F5N4S1G4',
      timestamp: '2026-02-16 12:00',
      read: true,
    },
  ]);

  const [filterType, setFilterType] = useState('all');

  const filteredNotifications = notifications.filter(notif => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !notif.read;
    return notif.type === filterType;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">نجح</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">خطأ</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">تحذير</Badge>;
      case 'info':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">معلومة</Badge>;
      default:
        return null;
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleArchive = (id: string) => {
    // يمكن إضافة حقل archived للإشعار
    console.log('Archive notification:', id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              الإشعارات والتنبيهات
            </h1>
            {unreadCount > 0 && (
              <Badge className="bg-red-600 text-white hover:bg-red-700">
                {unreadCount} جديد
              </Badge>
            )}
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            إدارة جميع الإشعارات والتنبيهات الخاصة بك
          </p>
        </div>

        {/* إحصائيات الإشعارات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الإجمالي</CardTitle>
              <Bell className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.length}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                إشعار
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">غير مقروءة</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                إشعار جديد
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ناجحة</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications.filter(n => n.type === 'success').length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                عملية ناجحة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تنبيهات</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {notifications.filter(n => n.type === 'warning' || n.type === 'error').length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                تنبيه أو خطأ
              </p>
            </CardContent>
          </Card>
        </div>

        {/* الفلاتر */}
        <div className="flex gap-4 flex-wrap">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الإشعارات</SelectItem>
              <SelectItem value="unread">غير مقروءة فقط</SelectItem>
              <SelectItem value="success">ناجحة</SelectItem>
              <SelectItem value="error">أخطاء</SelectItem>
              <SelectItem value="warning">تحذيرات</SelectItem>
              <SelectItem value="info">معلومات</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            إعدادات الإشعارات
          </Button>
        </div>

        {/* قائمة الإشعارات */}
        <Card>
          <CardHeader>
            <CardTitle>الإشعارات الحديثة</CardTitle>
            <CardDescription>
              {filteredNotifications.length} إشعار
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      notif.read
                        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                        : 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {notif.title}
                            </h3>
                            {getNotificationBadge(notif.type)}
                            {!notif.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {notif.timestamp}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title="تحديد كمقروء"
                          >
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleArchive(notif.id)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title="أرشفة"
                        >
                          <Archive className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>لا توجد إشعارات</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* إعدادات الإشعارات */}
        <Card>
          <CardHeader>
            <CardTitle>إعدادات الإشعارات</CardTitle>
            <CardDescription>
              تحكم في نوع الإشعارات التي تريد استقبالها
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'إشعارات الدفع الناجحة', checked: true },
                { label: 'تنبيهات الفواتير المعلقة', checked: true },
                { label: 'إشعارات الأخطاء', checked: true },
                { label: 'تحديثات النظام', checked: false },
              ].map((setting, index) => (
                <label key={index} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={setting.checked}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {setting.label}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

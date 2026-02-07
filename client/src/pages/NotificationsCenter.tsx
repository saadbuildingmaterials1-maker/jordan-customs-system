/**
 * NotificationsCenter Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/NotificationsCenter
 */
import React, { useState } from 'react';
import { Bell, Trash2, Archive, CheckCircle, AlertCircle, Info, Zap, Gift } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// نموذج بيانات الإشعارات
interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'update' | 'offer' | 'alert' | 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
}

// بيانات تجريبية للإشعارات
const mockNotifications: Notification[] = [
  {
    id: 1,
    title: 'تحديث جديد متاح',
    message: 'تم إصدار نسخة جديدة من التطبيق بمميزات محسّنة وإصلاحات أمنية مهمة',
    type: 'update',
    isRead: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actionLabel: 'تحديث الآن'
  },
  {
    id: 2,
    title: 'عرض خاص محدود',
    message: 'احصل على خصم 20% على جميع الخدمات المدفوعة لمدة 3 أشهر',
    type: 'offer',
    isRead: false,
    isArchived: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    actionLabel: 'استفد من العرض'
  },
  {
    id: 3,
    title: 'تنبيه أمني',
    message: 'تم اكتشاف محاولة دخول غير عادية على حسابك من موقع جديد',
    type: 'alert',
    isRead: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    actionLabel: 'مراجعة النشاط'
  },
  {
    id: 4,
    title: 'معلومة مهمة',
    message: 'تم تحديث سياسة الخصوصية الخاصة بنا. يرجى مراجعة التغييرات الجديدة',
    type: 'info',
    isRead: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    actionLabel: 'اقرأ السياسة'
  },
  {
    id: 5,
    title: 'عملية نجحت',
    message: 'تم تحديث بيانات حسابك بنجاح. جميع التغييرات محفوظة الآن',
    type: 'success',
    isRead: true,
    isArchived: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 6,
    title: 'تحذير',
    message: 'سيتم حذف الملفات القديمة بعد 7 أيام. تأكد من نسخ احتياطي للبيانات المهمة',
    type: 'warning',
    isRead: true,
    isArchived: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'update':
      return <Zap className="w-5 h-5 text-blue-500" />;
    case 'offer':
      return <Gift className="w-5 h-5 text-green-500" />;
    case 'alert':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    default:
      return <Info className="w-5 h-5 text-blue-500" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'update':
      return 'bg-blue-50 border-blue-200';
    case 'offer':
      return 'bg-green-50 border-green-200';
    case 'alert':
      return 'bg-red-50 border-red-200';
    case 'success':
      return 'bg-green-50 border-green-200';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const getNotificationBadge = (type: string) => {
  const badges: Record<string, string> = {
    update: 'تحديث',
    offer: 'عرض خاص',
    alert: 'تنبيه',
    info: 'معلومة',
    success: 'نجح',
    warning: 'تحذير',
    error: 'خطأ'
  };
  return badges[type] || 'إشعار';
};

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedTab, setSelectedTab] = useState('all');

  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;
  const filteredNotifications = notifications.filter(n => {
    if (selectedTab === 'unread') return !n.isRead && !n.isArchived;
    if (selectedTab === 'archived') return n.isArchived;
    return !n.isArchived;
  });

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const handleArchive = (id: number) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isArchived: true } : n
    ));
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'للتو';
    if (diffMins < 60) return `قبل ${diffMins} دقيقة`;
    if (diffHours < 24) return `قبل ${diffHours} ساعة`;
    if (diffDays < 7) return `قبل ${diffDays} يوم`;
    return date.toLocaleDateString('ar-JO');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">مركز الإشعارات</h1>
          </div>
          <p className="text-gray-600">إدارة جميع إشعاراتك والبقاء على اطلاع بآخر التحديثات</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{notifications.length}</div>
                <p className="text-gray-600">إجمالي الإشعارات</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">{unreadCount}</div>
                <p className="text-gray-600">إشعارات غير مقروءة</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-600 mb-2">
                  {notifications.filter(n => n.isArchived).length}
                </div>
                <p className="text-gray-600">إشعارات مؤرشفة</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs and Notifications */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle>الإشعارات</CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="text-xs"
                >
                  وضع علامة على الكل كمقروء
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="all">الكل ({notifications.filter(n => !n.isArchived).length})</TabsTrigger>
                <TabsTrigger value="unread">غير مقروء ({unreadCount})</TabsTrigger>
                <TabsTrigger value="archived">مؤرشف ({notifications.filter(n => n.isArchived).length})</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">لا توجد إشعارات</p>
                  </div>
                ) : (
                  filteredNotifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-4 transition-all ${getNotificationColor(notification.type)} ${
                        !notification.isRead ? 'ring-2 ring-blue-300' : ''
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Icon */}
                        <div className="flex-shrink-0 pt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-grow">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {getNotificationBadge(notification.type)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{notification.message}</p>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-gray-500">{formatDate(notification.createdAt)}</span>
                            <div className="flex gap-2">
                              {notification.actionLabel && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => notification.actionUrl && window.open(notification.actionUrl)}
                                >
                                  {notification.actionLabel}
                                </Button>
                              )}
                              {!notification.isRead && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-xs"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleArchive(notification.id)}
                                className="text-xs"
                              >
                                <Archive className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(notification.id)}
                                className="text-xs text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

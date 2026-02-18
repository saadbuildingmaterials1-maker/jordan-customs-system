/**
 * Notifications Page
 * 
 * صفحة عرض جميع الإشعارات
 * - عرض الإشعارات مع الفلترة والبحث
 * - تحديث الحالة والحذف
 * - إدارة التفضيلات
 * 
 * @component
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Trash2,
  Check,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info,
  AlertCircle,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useQueryClient } from '@tanstack/react-query';

export function NotificationsPage() {
  const [filterType, setFilterType] = useState<string>('all');
  const [showPreferences, setShowPreferences] = useState(false);
  const queryClient = useQueryClient();

  // جلب الإشعارات
  const { data: notificationsData, isLoading } = trpc.notificationsCenter.getNotifications.useQuery({
    limit: 100,
    unreadOnly: filterType === 'unread',
  });

  // جلب الإحصائيات
  const { data: statsData } = trpc.notificationsCenter.getStatistics.useQuery();

  // جلب التفضيلات
  const { data: preferencesData } = trpc.notificationsCenter.getPreferences.useQuery();

  // تحديث الإشعار كمقروء
  const markAsReadMutation = trpc.notificationsCenter.markAsRead.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsCenter.getNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsCenter.getStatistics'] });
    },
  });

  // حذف الإشعار
  const deleteNotificationMutation = trpc.notificationsCenter.deleteNotification.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsCenter.getNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsCenter.getStatistics'] });
    },
  });

  // تحديث التفضيلات
  const updatePreferencesMutation = trpc.notificationsCenter.updatePreferences.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsCenter.getPreferences'] });
    },
  });

  const notifications = notificationsData?.notifications ?? [];
  const stats = statsData?.statistics;
  const preferences = preferencesData?.preferences;

  // الحصول على أيقونة الإشعار
  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      success: <CheckCircle className="w-5 h-5 text-green-600" />,
      error: <AlertCircle className="w-5 h-5 text-red-600" />,
      warning: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
      info: <Info className="w-5 h-5 text-blue-600" />,
    };
    return iconMap[type] || <Bell className="w-5 h-5" />;
  };

  // الحصول على لون الخلفية حسب النوع
  const getTypeColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      success: 'bg-green-50 hover:bg-green-100',
      error: 'bg-red-50 hover:bg-red-100',
      warning: 'bg-yellow-50 hover:bg-yellow-100',
      info: 'bg-blue-50 hover:bg-blue-100',
    };
    return colorMap[type] || 'bg-gray-50 hover:bg-gray-100';
  };

  // حساب الوقت المنقضي
  const getTimeAgo = (timestamp: Date | string): string => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diff = now.getTime() - notifTime.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'للتو';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return notifTime.toLocaleDateString('ar-JO');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">الإشعارات</h1>
          <p className="text-gray-600 mt-1">إدارة جميع إشعاراتك والتفضيلات</p>
        </div>
        <Button
          onClick={() => setShowPreferences(!showPreferences)}
          variant="outline"
          size="lg"
        >
          <Settings className="w-5 h-5 mr-2" />
          التفضيلات
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي الإشعارات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">غير المقروءة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
            </CardContent>
          </Card>

          {Object.entries(stats.byType).map(([type, count]) => (
            <Card key={type}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 capitalize">
                  {type === 'success' && 'نجاح'}
                  {type === 'error' && 'أخطاء'}
                  {type === 'warning' && 'تحذيرات'}
                  {type === 'info' && 'معلومات'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preferences Section */}
      {showPreferences && preferences && (
        <Card>
          <CardHeader>
            <CardTitle>تفضيلات الإشعارات</CardTitle>
            <CardDescription>تحكم في كيفية استقبالك للإشعارات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">إشعارات البريد الإلكتروني</label>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications ?? false}
                  onChange={(e) =>
                    updatePreferencesMutation.mutate({
                      emailNotifications: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">إشعارات SMS</label>
                <input
                  type="checkbox"
                  checked={preferences.smsNotifications ?? false}
                  onChange={(e) =>
                    updatePreferencesMutation.mutate({
                      smsNotifications: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">إشعارات الدفع</label>
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications ?? false}
                  onChange={(e) =>
                    updatePreferencesMutation.mutate({
                      pushNotifications: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">إشعارات داخل التطبيق</label>
                <input
                  type="checkbox"
                  checked={preferences.inAppNotifications ?? false}
                  onChange={(e) =>
                    updatePreferencesMutation.mutate({
                      inAppNotifications: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">الملخص اليومي</label>
                <input
                  type="checkbox"
                  checked={preferences.dailyDigest}
                  onChange={(e) =>
                    updatePreferencesMutation.mutate({
                      dailyDigest: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">التقرير الأسبوعي</label>
                <input
                  type="checkbox"
                  checked={preferences.weeklyReport}
                  onChange={(e) =>
                    updatePreferencesMutation.mutate({
                      weeklyReport: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterType('all')}
        >
          جميع الإشعارات
        </Button>
        <Button
          variant={filterType === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilterType('unread')}
        >
          غير المقروءة
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin inline-block">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 mt-2">جاري تحميل الإشعارات...</p>
            </CardContent>
          </Card>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card key={notification.id} className={getTypeColor(notification.type)}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-3 h-3 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-slate-100 text-slate-800">
                          {notification.type === 'success' && 'نجاح'}
                          {notification.type === 'error' && 'خطأ'}
                          {notification.type === 'warning' && 'تحذير'}
                          {notification.type === 'info' && 'معلومة'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsReadMutation.mutate({ notificationId: notification.id })}
                            title="تحديث كمقروء"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotificationMutation.mutate({ notificationId: notification.id })}
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">لا توجد إشعارات</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * NotificationCenter Component
 * 
 * مكون مركز الإشعارات المتقدم
 * - عرض الإشعارات مع bell icon
 * - عداد الإشعارات غير المقروءة
 * - قائمة منسدلة للإشعارات
 * - تحديث الحالة والحذف
 * - تكامل مع قاعدة البيانات عبر tRPC
 * 
 * @component
 */

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  AlertCircle,
  Trash2,
  Check,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useQueryClient } from '@tanstack/react-query';

/**
 * مركز الإشعارات
 * يعرض الإشعارات الفورية والتنبيهات من قاعدة البيانات
 */
export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // جلب الإشعارات من قاعدة البيانات
  const { data: notificationsData, isLoading } = trpc.notificationsCenter.getNotifications.useQuery(
    { limit: 20, unreadOnly: false },
    { enabled: isOpen }
  );

  // جلب عدد الإشعارات غير المقروءة
  const { data: unreadData } = trpc.notificationsCenter.getUnreadCount.useQuery(
    undefined,
    { refetchInterval: 30000 } // تحديث كل 30 ثانية
  );

  // تحديث الإشعار كمقروء
  const markAsReadMutation = trpc.notificationsCenter.markAsRead.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsCenter.getNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsCenter.getUnreadCount'] });
    },
  });

  // حذف الإشعار
  const deleteNotificationMutation = trpc.notificationsCenter.deleteNotification.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsCenter.getNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsCenter.getUnreadCount'] });
    },
  });

  // تحديث جميع الإشعارات كمقروءة
  const markAllAsReadMutation = trpc.notificationsCenter.markAllAsRead.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsCenter.getNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsCenter.getUnreadCount'] });
    },
  });

  // حذف جميع الإشعارات
  const deleteAllMutation = trpc.notificationsCenter.deleteAllNotifications.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationsCenter.getNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['notificationsCenter.getUnreadCount'] });
    },
  });

  const unreadCount = unreadData?.unreadCount ?? 0;
  const notifications = notificationsData?.notifications ?? [];

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

  // إغلاق عند النقر خارج المركز
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      {/* زر الإشعارات */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {/* لوحة الإشعارات */}
      {isOpen && (
        <Card className="absolute right-0 top-12 w-96 shadow-2xl z-50 border-slate-200">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">🔔 الإشعارات</CardTitle>
                <CardDescription>
                  {unreadCount} إشعارات غير مقروءة
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* قائمة الإشعارات */}
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin inline-block">
                  <Bell className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 mt-2">جاري تحميل الإشعارات...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b last:border-b-0 transition-colors ${
                      notification.isRead
                        ? 'bg-white hover:bg-slate-50'
                        : getTypeColor(notification.type)
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* أيقونة الإشعار */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* محتوى الإشعار */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
                          )}
                        </div>

                        {/* معلومات إضافية */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-slate-100 text-slate-800">
                              {notification.type === 'success' && 'نجاح'}
                              {notification.type === 'error' && 'خطأ'}
                              {notification.type === 'warning' && 'تحذير'}
                              {notification.type === 'info' && 'معلومة'}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {getTimeAgo(notification.createdAt)}
                            </span>
                          </div>

                          {/* أزرار الإجراءات */}
                          <div className="flex gap-1">
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">لا توجد إشعارات</p>
              </div>
            )}

            {/* الأزرار السفلية */}
            {notifications.length > 0 && (
              <div className="p-3 border-t bg-slate-50 flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                    className="flex-1"
                    disabled={markAllAsReadMutation.isPending}
                  >
                    تحديد الكل كمقروء
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteAllMutation.mutate()}
                  className="flex-1"
                  disabled={deleteAllMutation.isPending}
                >
                  مسح الكل
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

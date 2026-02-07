/**
 * NotificationCenter Component
 * 
 * مكون React
 * 
 * @module ./client/src/components/NotificationCenter
 */
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

interface Notification {
  id: string;
  type: 'container_status' | 'declaration_status' | 'payment' | 'alert' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  read: boolean;
  data?: Record<string, any>;
}

/**
 * مركز الإشعارات
 * يعرض الإشعارات الفورية والتنبيهات
 */
export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // محاكاة الإشعارات (في التطبيق الحقيقي ستأتي من WebSocket)
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'container_status',
        title: 'تحديث حالة الحاوية',
        message: 'الحاوية CONT-001 وصلت إلى ميناء عمّان',
        priority: 'high',
        timestamp: Date.now() - 1000 * 60 * 5,
        read: false,
        data: { containerId: 'CONT-001', status: 'arrived' },
      },
      {
        id: '2',
        type: 'declaration_status',
        title: 'تحديث البيان الجمركي',
        message: 'تم تخليص البيان DEC-2024-001 بنجاح',
        priority: 'medium',
        timestamp: Date.now() - 1000 * 60 * 15,
        read: false,
        data: { declarationId: 'DEC-2024-001', status: 'cleared' },
      },
      {
        id: '3',
        type: 'alert',
        title: 'تنبيه مهم',
        message: 'الشحنة CONT-002 متأخرة عن الموعد المتوقع',
        priority: 'critical',
        timestamp: Date.now() - 1000 * 60 * 30,
        read: false,
        data: { containerId: 'CONT-002', delay: '2 days' },
      },
      {
        id: '4',
        type: 'payment',
        title: 'تأكيد الدفع',
        message: 'تم استلام دفعتك بنجاح',
        priority: 'low',
        timestamp: Date.now() - 1000 * 60 * 60,
        read: true,
        data: { amount: 5000, currency: 'JOD' },
      },
    ];

    setNotifications(mockNotifications);
    updateUnreadCount(mockNotifications);
  }, []);

  // تحديث عدد الإشعارات غير المقروءة
  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  // الحصول على أيقونة الإشعار
  const getNotificationIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      container_status: <AlertCircle className="w-5 h-5 text-blue-600" />,
      declaration_status: <CheckCircle className="w-5 h-5 text-green-600" />,
      payment: <CheckCircle className="w-5 h-5 text-purple-600" />,
      alert: <AlertTriangle className="w-5 h-5 text-red-600" />,
      system: <Info className="w-5 h-5 text-slate-600" />,
    };
    return iconMap[type] || <Bell className="w-5 h-5" />;
  };

  // الحصول على لون الأولوية
  const getPriorityColor = (priority: string): string => {
    const colorMap: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colorMap[priority] || 'bg-gray-100 text-gray-800';
  };

  // الحصول على نص الأولوية
  const getPriorityLabel = (priority: string): string => {
    const labelMap: Record<string, string> = {
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
      critical: 'حرجة',
    };
    return labelMap[priority] || priority;
  };

  // تحديد الإشعار كمقروء
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    updateUnreadCount(
      notifications.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // حذف الإشعار
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    updateUnreadCount(notifications.filter(n => n.id !== id));
  };

  // تحديد جميع الإشعارات كمقروءة
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // حساب الوقت المنقضي
  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'للتو';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return new Date(timestamp).toLocaleDateString('ar-JO');
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
            {unreadCount > 9 ? '9+' : unreadCount}
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
            {notifications.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b last:border-b-0 transition-colors ${
                      notification.read
                        ? 'bg-white hover:bg-slate-50'
                        : 'bg-blue-50 hover:bg-blue-100'
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
                            <p className="text-sm text-slate-600 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-2" />
                          )}
                        </div>

                        {/* معلومات إضافية */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(notification.priority)}>
                              {getPriorityLabel(notification.priority)}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {getTimeAgo(notification.timestamp)}
                            </span>
                          </div>

                          {/* أزرار الإجراءات */}
                          <div className="flex gap-1">
                            {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              title="تحديث كمقروء"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
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
                    onClick={markAllAsRead}
                    className="flex-1"
                  >
                    تحديد الكل كمقروء
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNotifications([])}
                  className="flex-1"
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

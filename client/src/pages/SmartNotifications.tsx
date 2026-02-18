/**
 * Smart Notifications Component
 * نظام الإشعارات الذكية المتقدم
 * 
 * الميزات:
 * - تصنيف الإشعارات الذكي
 * - أولويات الإشعارات
 * - جدولة الإشعارات
 * - نظام التصفية الذكي
 * - نظام التجميع (Grouping)
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Filter, Settings, Archive, Zap, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface SmartNotification {
  id: string;
  title: string;
  message: string;
  category: 'payment' | 'shipment' | 'customs' | 'system' | 'alert';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  isRead: boolean;
  isArchived: boolean;
  scheduledFor?: Date;
  relatedItems: string[];
}

export default function SmartNotifications() {
  const [notifications, setNotifications] = useState<SmartNotification[]>([
    {
      id: '1',
      title: 'دفعة جديدة مستقبلة',
      message: 'تم استقبال دفعة بقيمة 5,000 دينار من العميل أحمد محمد',
      category: 'payment',
      priority: 'high',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false,
      isArchived: false,
      relatedItems: ['INV-2026-001', 'CUST-001'],
    },
    {
      id: '2',
      title: 'شحنة وصلت الميناء',
      message: 'الشحنة SHP-2026-045 وصلت ميناء عمّان',
      category: 'shipment',
      priority: 'medium',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      isArchived: false,
      relatedItems: ['SHP-2026-045'],
    },
    {
      id: '3',
      title: 'فحص جمركي مطلوب',
      message: 'الشحنة SHP-2026-044 تحتاج إلى فحص جمركي إضافي',
      category: 'customs',
      priority: 'critical',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isRead: true,
      isArchived: false,
      relatedItems: ['SHP-2026-044'],
    },
    {
      id: '4',
      title: 'تحديث النظام متاح',
      message: 'تحديث أمان جديد متاح للتثبيت',
      category: 'system',
      priority: 'low',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true,
      isArchived: false,
      relatedItems: [],
    },
  ]);

  const [filterCategory, setFilterCategory] = useState<'all' | SmartNotification['category']>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | SmartNotification['priority']>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const handleArchive = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, isArchived: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleClearArchived = () => {
    setNotifications(notifications.filter(n => !n.isArchived));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'payment':
        return '💳';
      case 'shipment':
        return '📦';
      case 'customs':
        return '📋';
      case 'system':
        return '⚙️';
      case 'alert':
        return '⚠️';
      default:
        return '📢';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'payment':
        return 'الدفع';
      case 'shipment':
        return 'الشحنات';
      case 'customs':
        return 'الجمارك';
      case 'system':
        return 'النظام';
      case 'alert':
        return 'تنبيهات';
      default:
        return 'عام';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'payment':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'shipment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'customs':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'system':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'alert':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'حرجة';
      case 'high':
        return 'عالية';
      case 'medium':
        return 'متوسطة';
      case 'low':
        return 'منخفضة';
      default:
        return 'عادية';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (n.isArchived) return false;
    if (showUnreadOnly && n.isRead) return false;
    if (filterCategory !== 'all' && n.category !== filterCategory) return false;
    if (filterPriority !== 'all' && n.priority !== filterPriority) return false;
    if (searchQuery && !n.title.includes(searchQuery) && !n.message.includes(searchQuery)) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.isArchived).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">الإشعارات الذكية</h1>
            <p className="text-muted-foreground mt-2">إدارة الإشعارات والتنبيهات المتقدمة</p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white text-lg px-4 py-2">
                {unreadCount} جديد
              </Badge>
            )}
            {criticalCount > 0 && (
              <Badge className="bg-orange-500 text-white text-lg px-4 py-2">
                {criticalCount} حرج
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-4 border-border">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={showUnreadOnly ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            >
              <Bell size={16} className="ml-2" />
              غير مقروء فقط
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCircle2 size={16} className="ml-2" />
              تحديد الكل كمقروء
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearArchived}
            >
              <Archive size={16} className="ml-2" />
              مسح المؤرشفة
            </Button>
          </div>
        </Card>

        {/* Search and Filters */}
        <Card className="p-4 border-border">
          <div className="space-y-4">
            <Input
              placeholder="ابحث عن الإشعارات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">الفئة:</p>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'payment', 'shipment', 'customs', 'system', 'alert'] as const).map(cat => (
                    <Button
                      key={cat}
                      variant={filterCategory === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterCategory(cat)}
                    >
                      {cat === 'all' ? 'الكل' : getCategoryLabel(cat)}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-2">الأولوية:</p>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'low', 'medium', 'high', 'critical'] as const).map(pri => (
                    <Button
                      key={pri}
                      variant={filterPriority === pri ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterPriority(pri)}
                    >
                      {pri === 'all' ? 'الكل' : getPriorityLabel(pri)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(notification => (
              <Card
                key={notification.id}
                className={`p-4 border-l-4 transition-all ${
                  notification.isRead
                    ? 'border-l-gray-300 opacity-75'
                    : 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl mt-1">{getCategoryIcon(notification.category)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                          {notification.title}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {notification.timestamp.toLocaleString('ar-JO')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(notification.priority)}>
                          {getPriorityLabel(notification.priority)}
                        </Badge>
                        <Badge className={getCategoryColor(notification.category)}>
                          {getCategoryLabel(notification.category)}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-foreground mb-3">{notification.message}</p>
                    {notification.relatedItems.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground mb-1">العناصر المرتبطة:</p>
                        <div className="flex flex-wrap gap-2">
                          {notification.relatedItems.map(item => (
                            <Badge key={item} variant="secondary">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {!notification.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <CheckCircle2 size={16} className="ml-2" />
                          تحديد كمقروء
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchive(notification.id)}
                      >
                        <Archive size={16} className="ml-2" />
                        أرشفة
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center border-border">
              <Bell size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">لا توجد إشعارات</p>
              <p className="text-muted-foreground text-sm mt-2">جميع إشعاراتك مقروءة ومحدثة</p>
            </Card>
          )}
        </div>

        {/* Statistics */}
        <Card className="p-6 border-border bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-950 dark:to-cyan-950">
          <h3 className="text-lg font-semibold text-foreground mb-4">إحصائيات الإشعارات</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">{notifications.length}</p>
              <p className="text-muted-foreground">إجمالي الإشعارات</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{unreadCount}</p>
              <p className="text-muted-foreground">غير مقروء</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{criticalCount}</p>
              <p className="text-muted-foreground">حرج</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {notifications.filter(n => n.category === 'payment').length}
              </p>
              <p className="text-muted-foreground">الدفع</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {notifications.filter(n => n.category === 'shipment').length}
              </p>
              <p className="text-muted-foreground">الشحنات</p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

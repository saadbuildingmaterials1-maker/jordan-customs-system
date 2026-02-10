/**
 * NotificationsManagement Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/NotificationsManagement
 */
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, Smartphone, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  channels: string[];
  createdAt: Date;
  relatedEntityType?: string;
  relatedEntityId?: number;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  accountAddedNotification: boolean;
  accountVerifiedNotification: boolean;
  transactionNotification: boolean;
  securityAlertNotification: boolean;
  dailyDigest: boolean;
  weeklyReport: boolean;
}

export default function NotificationsManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    inAppNotifications: true,
    accountAddedNotification: true,
    accountVerifiedNotification: true,
    transactionNotification: true,
    securityAlertNotification: true,
    dailyDigest: false,
    weeklyReport: false,
  });
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // محاكاة البيانات
      const mockNotifications: Notification[] = [
        {
          id: 1,
          type: 'account_added',
          title: 'تم إضافة حساب بنكي جديد',
          message: 'تم إضافة الحساب البنكي "Saad Ahmed Saad El Din" بنجاح',
          priority: 'high',
          isRead: false,
          channels: ['email', 'in_app'],
          createdAt: new Date(),
          relatedEntityType: 'bank_account',
          relatedEntityId: 1,
        },
        {
          id: 2,
          type: 'transaction_completed',
          title: 'تم إكمال المعاملة',
          message: 'تم إكمال المعاملة بنجاح. المبلغ: 5000 دينار أردني',
          priority: 'medium',
          isRead: true,
          channels: ['email', 'in_app', 'push'],
          createdAt: new Date(Date.now() - 3600000),
          relatedEntityType: 'transaction',
          relatedEntityId: 1,
        },
      ];
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter((n) => !n.isRead).length);
    } catch (error) {
      logger.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    try {
      // محاكاة تحميل التفضيلات
      setPreferences({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        inAppNotifications: true,
        accountAddedNotification: true,
        accountVerifiedNotification: true,
        transactionNotification: true,
        securityAlertNotification: true,
        dailyDigest: false,
        weeklyReport: false,
      });
    } catch (error) {
      logger.error('Error loading preferences:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      logger.error('Error marking notification as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      setNotifications(notifications.filter((n) => n.id !== notificationId));
    } catch (error) {
      logger.error('Error deleting notification:', error);
    }
  };

  const handlePreferenceChange = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    try {
      const updated = { ...preferences, [key]: value };
      setPreferences(updated);
      // حفظ التفضيلات في الحالة المحلية
    } catch (error) {
      logger.error('Error updating preferences:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'account_added':
      case 'account_verified':
        return '🏦';
      case 'transaction_completed':
      case 'transaction_failed':
        return '💳';
      case 'security_alert':
        return '🔒';
      case 'payment_received':
      case 'payment_sent':
        return '💰';
      default:
        return '📬';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">إدارة الإشعارات</h1>
            <p className="text-gray-600 mt-1">
              إدارة الإشعارات والتفضيلات الخاصة بك
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications">
              الإشعارات ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="preferences">التفضيلات</TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-500">لا توجد إشعارات</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={notification.isRead ? 'opacity-75' : 'border-blue-200'}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="text-2xl">
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {notification.title}
                              </h3>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority === 'critical'
                                  ? 'حرج'
                                  : notification.priority === 'high'
                                  ? 'مرتفع'
                                  : notification.priority === 'medium'
                                  ? 'متوسط'
                                  : 'منخفض'}
                              </Badge>
                              {!notification.isRead && (
                                <Badge variant="default">جديد</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              <span>
                                {new Date(notification.createdAt).toLocaleString(
                                  'ar-JO'
                                )}
                              </span>
                              <span>•</span>
                              <div className="flex gap-1">
                                {notification.channels.includes('email') && (
                                  <div title="بريد إلكتروني"><Mail className="w-3 h-3" /></div>
                                )}
                                {notification.channels.includes('sms') && (
                                  <div title="رسالة نصية"><MessageSquare className="w-3 h-3" /></div>
                                )}
                                {notification.channels.includes('push') && (
                                  <div title="إشعار فوري"><Smartphone className="w-3 h-3" /></div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            {/* Channels */}
            <Card>
              <CardHeader>
                <CardTitle>قنوات الإشعارات</CardTitle>
                <CardDescription>
                  اختر القنوات التي تريد استقبال الإشعارات عليها
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                  </div>
                  <Switch
                    id="email"
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('emailNotifications', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    <Label htmlFor="sms">الرسائل النصية</Label>
                  </div>
                  <Switch
                    id="sms"
                    checked={preferences.smsNotifications}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('smsNotifications', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    <Label htmlFor="push">الإشعارات الفورية</Label>
                  </div>
                  <Switch
                    id="push"
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('pushNotifications', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    <Label htmlFor="inapp">الإشعارات داخل التطبيق</Label>
                  </div>
                  <Switch
                    id="inapp"
                    checked={preferences.inAppNotifications}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('inAppNotifications', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card>
              <CardHeader>
                <CardTitle>أنواع الإشعارات</CardTitle>
                <CardDescription>
                  اختر أنواع الإشعارات التي تريد استقبالها
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="account-added">إضافة حساب بنكي جديد</Label>
                  <Switch
                    id="account-added"
                    checked={preferences.accountAddedNotification}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('accountAddedNotification', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="account-verified">التحقق من الحساب</Label>
                  <Switch
                    id="account-verified"
                    checked={preferences.accountVerifiedNotification}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('accountVerifiedNotification', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="transaction">المعاملات المالية</Label>
                  <Switch
                    id="transaction"
                    checked={preferences.transactionNotification}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('transactionNotification', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="security">التنبيهات الأمنية</Label>
                  <Switch
                    id="security"
                    checked={preferences.securityAlertNotification}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('securityAlertNotification', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Reports */}
            <Card>
              <CardHeader>
                <CardTitle>التقارير الدورية</CardTitle>
                <CardDescription>
                  استقبل تقارير دورية عن نشاطك
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="daily">التقرير اليومي</Label>
                  <Switch
                    id="daily"
                    checked={preferences.dailyDigest}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('dailyDigest', checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly">التقرير الأسبوعي</Label>
                  <Switch
                    id="weekly"
                    checked={preferences.weeklyReport}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('weeklyReport', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Button className="w-full">حفظ التفضيلات</Button>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

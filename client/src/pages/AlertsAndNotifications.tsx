/**
 * AlertsAndNotifications Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/AlertsAndNotifications
 */
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, AlertCircle, CheckCircle, Info, Clock, Settings, Trash2 } from 'lucide-react';

export default function AlertsAndNotifications() {
  const [activeTab, setActiveTab] = useState('alerts');
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'error',
      title: 'انحراف كبير في البيان #1245',
      message: 'تم اكتشاف انحراف 15% في البيان الجمركي رقم 1245',
      time: '2 ساعة',
      read: false,
    },
    {
      id: 2,
      type: 'warning',
      title: 'فاتورة قيد الانتظار',
      message: 'هناك 3 فواتير قيد الانتظار للدفع',
      time: '4 ساعات',
      read: false,
    },
    {
      id: 3,
      type: 'success',
      title: 'تم إكمال البيان #1244',
      message: 'تم معالجة البيان الجمركي رقم 1244 بنجاح',
      time: '1 يوم',
      read: true,
    },
    {
      id: 4,
      type: 'info',
      title: 'تحديث النظام',
      message: 'تم تحديث النظام إلى الإصدار 2.5.0',
      time: '2 يوم',
      read: true,
    },
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'إشعار البريد الإلكتروني',
      description: 'استقبال إشعارات عبر البريد الإلكتروني',
      enabled: true,
    },
    {
      id: 2,
      title: 'إشعار SMS',
      description: 'استقبال رسائل نصية قصيرة',
      enabled: false,
    },
    {
      id: 3,
      title: 'إشعارات الويب',
      description: 'إشعارات مباشرة في المتصفح',
      enabled: true,
    },
    {
      id: 4,
      title: 'إشعارات الانحرافات',
      description: 'تنبيهات عند اكتشاف انحرافات كبيرة',
      enabled: true,
    },
    {
      id: 5,
      title: 'إشعارات الدفعات',
      description: 'تنبيهات عند استحقاق الدفعات',
      enabled: true,
    },
  ]);

  const handleMarkAsRead = (alertId: number) => {
    setAlerts(alerts.map(alert =>
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const handleDeleteAlert = (alertId: number) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* الرأس */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-8 h-8" />
            الإشعارات والتنبيهات
          </h1>
          <p className="text-gray-600 mt-2">
            إدارة الإشعارات والتنبيهات والتحكم في تفضيلاتك
          </p>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">التنبيهات</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">الإعدادات</span>
            </TabsTrigger>
          </TabsList>

          {/* تبويب التنبيهات */}
          <TabsContent value="alerts" className="space-y-6">
            {/* إحصائيات التنبيهات */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    إجمالي التنبيهات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alerts.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    غير مقروءة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {alerts.filter(a => !a.read).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    أخطاء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {alerts.filter(a => a.type === 'error').length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    تحذيرات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {alerts.filter(a => a.type === 'warning').length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* قائمة التنبيهات */}
            <Card>
              <CardHeader>
                <CardTitle>التنبيهات الأخيرة</CardTitle>
                <CardDescription>جميع التنبيهات والتحذيرات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد تنبيهات</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex gap-4 p-4 rounded-lg border ${getAlertColor(alert.type)} ${
                        !alert.read ? 'ring-2 ring-offset-2 ring-blue-400' : ''
                      }`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{alert.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-500">{alert.time}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {!alert.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(alert.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الإعدادات */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>تفضيلات الإشعارات</CardTitle>
                <CardDescription>
                  اختر كيفية استقبال الإشعارات والتنبيهات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                          notification.enabled ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        onClick={() => {
                          const updatedNotifications = notifications.map((n) =>
                            n.id === notification.id
                              ? { ...n, enabled: !n.enabled }
                              : n
                          );
                          setNotifications(updatedNotifications);
                        }}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                            notification.enabled ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* إعدادات إضافية */}
            <Card>
              <CardHeader>
                <CardTitle>إعدادات إضافية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">الصوت</p>
                    <p className="text-sm text-gray-600">تشغيل صوت للتنبيهات</p>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-blue-600 cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full shadow-md translate-x-6" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">الإشعارات المنبثقة</p>
                    <p className="text-sm text-gray-600">عرض إشعارات منبثقة على الشاشة</p>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-blue-600 cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full shadow-md translate-x-6" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">التنبيهات الليلية</p>
                    <p className="text-sm text-gray-600">تعطيل التنبيهات من الساعة 10 مساءً إلى 8 صباحاً</p>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-gray-300 cursor-pointer">
                    <div className="w-5 h-5 bg-white rounded-full shadow-md translate-x-0.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

/**
 * مكون نظام الإشعارات الفورية
 * Price Alert System Component
 * 
 * يتضمن:
 * - إشعارات تنبيهية عند تغير الأسعار
 * - الاشتراك في تحديثات الأسعار الدورية
 * - إدارة الإشعارات المحفوظة
 * - إرسال إشعارات فورية
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, X, Check, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PriceAlert {
  id: string;
  country: string;
  alertType: 'price_increase' | 'price_decrease' | 'specific_price';
  threshold: number;
  isActive: boolean;
  createdAt: number;
  lastTriggered?: number;
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const COUNTRIES = [
  { code: 'SA', name: 'المملكة العربية السعودية' },
  { code: 'AE', name: 'الإمارات العربية المتحدة' },
  { code: 'KW', name: 'دولة الكويت' },
  { code: 'QA', name: 'دولة قطر' },
  { code: 'BH', name: 'مملكة البحرين' },
  { code: 'OM', name: 'سلطنة عمان' },
];

export default function PriceAlertSystem() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('SA');
  const [alertType, setAlertType] = useState<'price_increase' | 'price_decrease' | 'specific_price'>('price_decrease');
  const [threshold, setThreshold] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load alerts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('priceAlerts');
    if (saved) {
      setAlerts(JSON.parse(saved));
    }

    const savedNotifications = localStorage.getItem('priceNotifications');
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications);
      setNotifications(parsed);
      setUnreadCount(parsed.filter((n: Notification) => !n.read).length);
    }
  }, []);

  // Save alerts to localStorage
  useEffect(() => {
    localStorage.setItem('priceAlerts', JSON.stringify(alerts));
  }, [alerts]);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('priceNotifications', JSON.stringify(notifications));
  }, [notifications]);

  const handleAddAlert = () => {
    if (!threshold || parseFloat(threshold) <= 0) {
      addNotification('error', 'خطأ في الإدخال', 'يرجى إدخال قيمة صحيحة للحد الأدنى');
      return;
    }

    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      country: selectedCountry,
      alertType,
      threshold: parseFloat(threshold),
      isActive: true,
      createdAt: Date.now(),
    };

    setAlerts([newAlert, ...alerts]);
    setThreshold('');
    addNotification('success', 'تم إضافة التنبيه', `تم إضافة تنبيه جديد للدولة ${selectedCountry}`);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
    addNotification('info', 'تم حذف التنبيه', 'تم حذف التنبيه بنجاح');
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const addNotification = (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications([newNotification, ...notifications]);
    setUnreadCount(prev => prev + 1);
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'price_increase':
        return 'ارتفاع السعر';
      case 'price_decrease':
        return 'انخفاض السعر';
      case 'specific_price':
        return 'سعر محدد';
      default:
        return type;
    }
  };

  const getCountryName = (code: string) => {
    return COUNTRIES.find(c => c.code === code)?.name || code;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      default:
        return <Bell className="h-5 w-5 text-blue-400" />;
    }
  };

  return (
    <div className="w-full space-y-6 py-20 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-slate-900 via-blue-900/50 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md mb-6">
            <Bell className="w-4 h-4 text-blue-300" />
            <span className="text-sm text-blue-200">نظام الإشعارات الفورية</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            تنبيهات أسعار الشحن والجمارك
          </h2>
          <p className="text-xl text-blue-100/70 max-w-2xl mx-auto">
            احصل على إشعارات فورية عند تغير الأسعار والاشتراك في تحديثات دورية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Alert Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent lg:col-span-1">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>إضافة تنبيه جديد</CardTitle>
                  <CardDescription>اضبط التنبيهات حسب احتياجاتك</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الدولة</label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(country => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">نوع التنبيه</label>
                <Select value={alertType} onValueChange={(value: any) => setAlertType(value)}>
                  <SelectTrigger className="border-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price_decrease">انخفاض السعر</SelectItem>
                    <SelectItem value="price_increase">ارتفاع السعر</SelectItem>
                    <SelectItem value="specific_price">سعر محدد</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">الحد الأدنى للسعر (د.ا)</label>
                <Input
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder="أدخل السعر"
                  min="0"
                  step="10"
                  className="border-2"
                />
              </div>

              <Button onClick={handleAddAlert} className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                إضافة التنبيه
              </Button>
            </CardContent>
          </Card>

          {/* Alerts List */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle>التنبيهات المفعلة</CardTitle>
                    <CardDescription>إدارة التنبيهات والاشتراكات</CardDescription>
                  </div>
                </div>
                <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  {alerts.filter(a => a.isActive).length}
                </span>
              </div>
            </CardHeader>

            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>لا توجد تنبيهات مفعلة بعد</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        alert.isActive
                          ? 'bg-slate-800/50 border-slate-700'
                          : 'bg-slate-800/30 border-slate-700/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {alert.alertType === 'price_decrease' ? (
                            <TrendingDown className="h-4 w-4 text-green-400" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-red-400" />
                          )}
                          <div>
                            <p className="font-semibold text-white">{getCountryName(alert.country)}</p>
                            <p className="text-xs text-slate-400">{getAlertTypeLabel(alert.alertType)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleAlert(alert.id)}
                            className={alert.isActive ? 'text-green-400' : 'text-slate-400'}
                          >
                            {alert.isActive ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300">
                        الحد الأدنى: <span className="font-semibold text-blue-400">د.ا {alert.threshold.toFixed(2)}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notifications Panel */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>الإشعارات</CardTitle>
                  <CardDescription>آخر الإشعارات والتحديثات</CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {unreadCount} جديد
                  </span>
                )}
                {notifications.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleClearNotifications}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    مسح الكل
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>لا توجد إشعارات حالياً</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg border ${
                      notif.read
                        ? 'bg-slate-800/30 border-slate-700/50'
                        : 'bg-slate-800/50 border-slate-700'
                    }`}
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notif.type)}
                      <div className="flex-1">
                        <p className="font-semibold text-white">{notif.title}</p>
                        <p className="text-sm text-slate-400 mt-1">{notif.message}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(notif.timestamp).toLocaleString('ar-JO')}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent mt-6">
          <CardHeader>
            <CardTitle className="text-lg">ℹ️ معلومات مهمة</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm text-slate-300">
            <p>
              ✅ <strong>التنبيهات الفورية:</strong> احصل على إشعارات فورية عند تغير أسعار الشحن والجمارك
            </p>
            <p>
              ✅ <strong>تحديثات دورية:</strong> اشترك في التحديثات اليومية أو الأسبوعية للأسعار
            </p>
            <p>
              ✅ <strong>إدارة سهلة:</strong> يمكنك تفعيل أو تعطيل التنبيهات في أي وقت
            </p>
            <p>
              ✅ <strong>حفظ محلي:</strong> جميع التنبيهات والإشعارات محفوظة على جهازك
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

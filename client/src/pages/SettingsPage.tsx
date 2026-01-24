import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Lock, Bell, Eye, EyeOff, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [showPassword, setShowPassword] = useState(false);

  // إعدادات عامة
  const [generalSettings, setGeneralSettings] = useState({
    appName: 'نظام إدارة تكاليف الشحن والجمارك الأردنية',
    language: 'ar',
    currency: 'JOD',
    timezone: 'Asia/Amman',
    dateFormat: 'DD/MM/YYYY',
  });

  // إعدادات الأمان
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordExpiry: 90,
    sessionTimeout: 30,
    ipWhitelist: false,
    autoLogout: true,
  });

  // إعدادات الإشعارات
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    dailyReport: true,
    weeklyReport: false,
    monthlyReport: true,
  });

  // إعدادات النسخ الاحتياطي
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    lastBackup: '2026-01-24 14:30',
  });

  const handleSaveGeneral = () => {
    toast.success('تم حفظ الإعدادات العامة بنجاح');
  };

  const handleSaveSecurity = () => {
    toast.success('تم حفظ إعدادات الأمان بنجاح');
  };

  const handleSaveNotifications = () => {
    toast.success('تم حفظ إعدادات الإشعارات بنجاح');
  };

  const handleSaveBackup = () => {
    toast.success('تم حفظ إعدادات النسخ الاحتياطي بنجاح');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* الرأس */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-8 h-8" />
            الإعدادات والتكوين
          </h1>
          <p className="text-gray-600 mt-2">
            إدارة إعدادات النظام والأمان والإشعارات
          </p>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
            <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
            <TabsTrigger value="backup">النسخ الاحتياطي</TabsTrigger>
          </TabsList>

          {/* تبويب الإعدادات العامة */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم التطبيق</label>
                  <Input
                    value={generalSettings.appName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, appName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">اللغة</label>
                    <select
                      value={generalSettings.language}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">العملة</label>
                    <select
                      value={generalSettings.currency}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="JOD">دينار أردني (JOD)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="EGP">جنيه مصري (EGP)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">المنطقة الزمنية</label>
                    <Input
                      value={generalSettings.timezone}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">صيغة التاريخ</label>
                    <select
                      value={generalSettings.dateFormat}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>

                <Button onClick={handleSaveGeneral} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  حفظ الإعدادات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الأمان */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الأمان</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">المصادقة الثنائية</p>
                      <p className="text-sm text-gray-600">تفعيل المصادقة الثنائية لحماية أفضل</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">تسجيل الخروج التلقائي</p>
                      <p className="text-sm text-gray-600">تسجيل الخروج تلقائياً عند عدم النشاط</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={securitySettings.autoLogout}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, autoLogout: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">قائمة بيضاء IP</p>
                      <p className="text-sm text-gray-600">السماح فقط بعناوين IP محددة</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={securitySettings.ipWhitelist}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, ipWhitelist: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">انتهاء صلاحية كلمة المرور (أيام)</label>
                    <Input
                      type="number"
                      value={securitySettings.passwordExpiry}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiry: parseInt(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">مهلة انتهاء الجلسة (دقائق)</label>
                    <Input
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveSecurity} className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  حفظ إعدادات الأمان
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الإشعارات */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الإشعارات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">إشعارات البريد الإلكتروني</p>
                      <p className="text-sm text-gray-600">استقبال إشعارات عبر البريد الإلكتروني</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">إشعارات SMS</p>
                      <p className="text-sm text-gray-600">استقبال إشعارات عبر الرسائل النصية</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">إشعارات الدفع</p>
                      <p className="text-sm text-gray-600">استقبال إشعارات الدفع الفورية</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium mb-4">التقارير الدورية</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <p>التقرير اليومي</p>
                      <input
                        type="checkbox"
                        checked={notificationSettings.dailyReport}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, dailyReport: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <p>التقرير الأسبوعي</p>
                      <input
                        type="checkbox"
                        checked={notificationSettings.weeklyReport}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyReport: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <p>التقرير الشهري</p>
                      <input
                        type="checkbox"
                        checked={notificationSettings.monthlyReport}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, monthlyReport: e.target.checked })}
                        className="w-5 h-5"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveNotifications} className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  حفظ إعدادات الإشعارات
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب النسخ الاحتياطي */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات النسخ الاحتياطي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>آخر نسخة احتياطية:</strong> {backupSettings.lastBackup}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">النسخ الاحتياطي التلقائي</p>
                    <p className="text-sm text-gray-600">تفعيل النسخ الاحتياطي التلقائي للبيانات</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={backupSettings.autoBackup}
                    onChange={(e) => setBackupSettings({ ...backupSettings, autoBackup: e.target.checked })}
                    className="w-5 h-5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">تكرار النسخ الاحتياطي</label>
                    <select
                      value={backupSettings.backupFrequency}
                      onChange={(e) => setBackupSettings({ ...backupSettings, backupFrequency: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="hourly">كل ساعة</option>
                      <option value="daily">يومياً</option>
                      <option value="weekly">أسبوعياً</option>
                      <option value="monthly">شهرياً</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">الاحتفاظ بـ (أيام)</label>
                    <Input
                      type="number"
                      value={backupSettings.backupRetention}
                      onChange={(e) => setBackupSettings({ ...backupSettings, backupRetention: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveBackup} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    حفظ الإعدادات
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    إنشاء نسخة احتياطية الآن
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

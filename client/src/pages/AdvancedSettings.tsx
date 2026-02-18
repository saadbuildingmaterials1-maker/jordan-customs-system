import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Settings,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Toggle2,
  Database,
  Lock,
  Bell,
  Globe,
  Mail,
  Phone,
} from 'lucide-react';

export default function AdvancedSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [settings, setSettings] = useState({
    // إعدادات عامة
    companyName: 'نظام إدارة تكاليف الشحن والجمارك الأردنية',
    companyEmail: 'info@customs-system.jo',
    companyPhone: '+962791234567',
    companyAddress: 'عمّان، الأردن',
    
    // إعدادات الدفع
    defaultCurrency: 'JOD',
    paymentTimeout: '30',
    maxRetries: '3',
    
    // إعدادات الأمان
    sessionTimeout: '60',
    passwordMinLength: '8',
    enableTwoFactor: true,
    enableIPWhitelist: false,
    
    // إعدادات الإشعارات
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    enablePushNotifications: true,
    
    // إعدادات النسخ الاحتياطية
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    retentionDays: '30',
  });

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaveSuccess(true);
    setIsSaving(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            الإعدادات المتقدمة
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            تكوين جميع جوانب النظام
          </p>
        </div>

        {/* رسالة النجاح */}
        {saveSuccess && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              ✓ تم حفظ الإعدادات بنجاح
            </AlertDescription>
          </Alert>
        )}

        {/* الإعدادات العامة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              الإعدادات العامة
            </CardTitle>
            <CardDescription>
              معلومات الشركة والاتصال
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                اسم الشركة
              </label>
              <Input
                value={settings.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  البريد الإلكتروني
                </label>
                <Input
                  type="email"
                  value={settings.companyEmail}
                  onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  رقم الهاتف
                </label>
                <Input
                  value={settings.companyPhone}
                  onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                العنوان
              </label>
              <Input
                value={settings.companyAddress}
                onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* إعدادات الدفع */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              إعدادات الدفع
            </CardTitle>
            <CardDescription>
              تكوين معاملات الدفع والعملات
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  العملة الافتراضية
                </label>
                <select
                  value={settings.defaultCurrency}
                  onChange={(e) => handleInputChange('defaultCurrency', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="JOD">د.ا (JOD)</option>
                  <option value="USD">$ (USD)</option>
                  <option value="EUR">€ (EUR)</option>
                  <option value="AED">د.إ (AED)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  مهلة انتظار الدفع (ثانية)
                </label>
                <Input
                  type="number"
                  value={settings.paymentTimeout}
                  onChange={(e) => handleInputChange('paymentTimeout', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  عدد محاولات إعادة المحاولة
                </label>
                <Input
                  type="number"
                  value={settings.maxRetries}
                  onChange={(e) => handleInputChange('maxRetries', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إعدادات الأمان */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              إعدادات الأمان
            </CardTitle>
            <CardDescription>
              تكوين معايير الأمان والحماية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  مهلة انتهاء الجلسة (دقيقة)
                </label>
                <Input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange('sessionTimeout', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  الحد الأدنى لطول كلمة المرور
                </label>
                <Input
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleInputChange('passwordMinLength', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  تفعيل المصادقة الثنائية
                </label>
                <input
                  type="checkbox"
                  checked={settings.enableTwoFactor}
                  onChange={(e) => handleInputChange('enableTwoFactor', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  قائمة IP البيضاء
                </label>
                <input
                  type="checkbox"
                  checked={settings.enableIPWhitelist}
                  onChange={(e) => handleInputChange('enableIPWhitelist', e.target.checked)}
                  className="w-4 h-4 rounded"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إعدادات الإشعارات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              إعدادات الإشعارات
            </CardTitle>
            <CardDescription>
              تكوين قنوات الإشعارات
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                إشعارات البريد الإلكتروني
              </label>
              <input
                type="checkbox"
                checked={settings.enableEmailNotifications}
                onChange={(e) => handleInputChange('enableEmailNotifications', e.target.checked)}
                className="w-4 h-4 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                إشعارات SMS
              </label>
              <input
                type="checkbox"
                checked={settings.enableSMSNotifications}
                onChange={(e) => handleInputChange('enableSMSNotifications', e.target.checked)}
                className="w-4 h-4 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                إشعارات الدفع
              </label>
              <input
                type="checkbox"
                checked={settings.enablePushNotifications}
                onChange={(e) => handleInputChange('enablePushNotifications', e.target.checked)}
                className="w-4 h-4 rounded"
              />
            </div>
          </CardContent>
        </Card>

        {/* إعدادات النسخ الاحتياطية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              إعدادات النسخ الاحتياطية
            </CardTitle>
            <CardDescription>
              تكوين النسخ الاحتياطية التلقائية
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                تفعيل النسخ الاحتياطية التلقائية
              </label>
              <input
                type="checkbox"
                checked={settings.autoBackupEnabled}
                onChange={(e) => handleInputChange('autoBackupEnabled', e.target.checked)}
                className="w-4 h-4 rounded"
              />
            </div>

            {settings.autoBackupEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    تكرار النسخ الاحتياطية
                  </label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => handleInputChange('backupFrequency', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="hourly">كل ساعة</option>
                    <option value="daily">يومياً</option>
                    <option value="weekly">أسبوعياً</option>
                    <option value="monthly">شهرياً</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    مدة الاحتفاظ (أيام)
                  </label>
                  <Input
                    type="number"
                    value={settings.retentionDays}
                    onChange={(e) => handleInputChange('retentionDays', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* أزرار الإجراءات */}
        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            إعادة تعيين
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                حفظ الإعدادات
              </>
            )}
          </Button>
        </div>

        {/* معلومات إضافية */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            تأكد من مراجعة جميع الإعدادات بعناية قبل الحفظ. بعض التغييرات قد تتطلب إعادة تشغيل النظام.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Lock, Database, Shield, Key, Download, AlertCircle } from 'lucide-react';

export default function SettingsAndSecurity() {
  const [activeTab, setActiveTab] = useState('general');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* الرأس */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-8 h-8" />
            الإعدادات والأمان
          </h1>
          <p className="text-gray-600 mt-2">
            إدارة إعدادات النظام والأمان والنسخ الاحتياطية
          </p>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">عام</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">الأمان</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">النسخ</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">متقدم</span>
            </TabsTrigger>
          </TabsList>

          {/* تبويب الإعدادات العامة */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات النظام</CardTitle>
                <CardDescription>بيانات عامة عن النظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم النظام
                  </label>
                  <Input
                    defaultValue="نظام إدارة تكاليف الشحن والجمارك الأردنية"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الإصدار
                  </label>
                  <Input defaultValue="2.5.0" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الإطلاق
                  </label>
                  <Input defaultValue="2025-01-15" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحالة
                  </label>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">نشط</Badge>
                    <span className="text-sm text-gray-600">النظام يعمل بشكل طبيعي</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إعدادات اللغة والمنطقة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اللغة
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>العربية</option>
                    <option>English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المنطقة الزمنية
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>GMT+3 (الأردن)</option>
                    <option>GMT+2 (مصر)</option>
                    <option>GMT+3 (السعودية)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    صيغة التاريخ
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>YYYY-MM-DD</option>
                    <option>DD-MM-YYYY</option>
                    <option>MM/DD/YYYY</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الأمان */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  المصادقة الثنائية
                </CardTitle>
                <CardDescription>
                  تحسين أمان حسابك بتفعيل المصادقة الثنائية
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">المصادقة عبر التطبيق</p>
                    <p className="text-sm text-gray-600">استخدم تطبيق المصادقة</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={twoFactorEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {twoFactorEnabled ? 'مفعّل' : 'معطّل'}
                    </Badge>
                    <div
                      className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                        twoFactorEnabled ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                          twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>كلمة المرور</CardTitle>
                <CardDescription>تغيير كلمة المرور الخاصة بك</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور الحالية
                  </label>
                  <Input type="password" placeholder="أدخل كلمة المرور الحالية" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور الجديدة
                  </label>
                  <Input type="password" placeholder="أدخل كلمة المرور الجديدة" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تأكيد كلمة المرور
                  </label>
                  <Input type="password" placeholder="أعد إدخال كلمة المرور" />
                </div>
                <Button>تحديث كلمة المرور</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  جلسات النشاط
                </CardTitle>
                <CardDescription>إدارة جلسات تسجيل الدخول النشطة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Chrome - Windows</p>
                    <p className="text-sm text-gray-600">آخر نشاط: الآن</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">نشط</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Safari - iPhone</p>
                    <p className="text-sm text-gray-600">آخر نشاط: أمس</p>
                  </div>
                  <Button variant="ghost" size="sm">حذف</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب النسخ الاحتياطية */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  النسخ الاحتياطية التلقائية
                </CardTitle>
                <CardDescription>
                  إدارة النسخ الاحتياطية التلقائية للبيانات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">النسخ الاحتياطية اليومية</p>
                    <p className="text-sm text-gray-600">تشغيل النسخ الاحتياطية كل يوم</p>
                  </div>
                  <div
                    className={`w-12 h-6 rounded-full cursor-pointer transition-colors ${
                      backupEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    onClick={() => setBackupEnabled(!backupEnabled)}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                        backupEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>النسخ الاحتياطية السابقة</CardTitle>
                <CardDescription>قائمة النسخ الاحتياطية المحفوظة</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { date: '2026-01-22', size: '2.5 GB', status: 'مكتملة' },
                  { date: '2026-01-21', size: '2.4 GB', status: 'مكتملة' },
                  { date: '2026-01-20', size: '2.3 GB', status: 'مكتملة' },
                ].map((backup) => (
                  <div key={backup.date} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{backup.date}</p>
                      <p className="text-sm text-gray-600">{backup.size}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-green-100 text-green-800">{backup.status}</Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الإعدادات المتقدمة */}
          <TabsContent value="advanced" className="space-y-6">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-900">
                  <AlertCircle className="w-5 h-5" />
                  تنبيه
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-yellow-800">
                  تعديل الإعدادات المتقدمة قد يؤثر على أداء النظام. يرجى التأكد من معرفتك بما تفعله.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إعدادات قاعدة البيانات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حجم قاعدة البيانات
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="font-medium">15.2 GB</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عدد السجلات
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="font-medium">2,450,000 سجل</p>
                  </div>
                </div>
                <Button variant="outline">تحسين قاعدة البيانات</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>تنظيف البيانات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  حذف البيانات المؤقتة والملفات غير المستخدمة
                </p>
                <Button variant="outline" className="w-full">
                  تنظيف البيانات المؤقتة
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

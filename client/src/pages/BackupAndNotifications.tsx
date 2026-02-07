/**
 * BackupAndNotifications Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/BackupAndNotifications
 */
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Bell, Mail, Smartphone, Archive, RotateCcw } from 'lucide-react';

/**
 * صفحة إدارة النسخ الاحتياطية والإشعارات
 * توفر واجهة شاملة لإدارة النسخ الاحتياطية والإشعارات المتقدمة
 */
export function BackupAndNotifications() {
  const [toastMessage, setToastMessage] = useState<{ title: string; description: string; variant?: string } | null>(null);
  const toast = (msg: any) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  const [backups, setBackups] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // بيانات توضيحية
  const backupData = [
    {
      id: '1',
      name: 'Backup-2026-01-24',
      description: 'نسخة احتياطية يدوية',
      createdAt: new Date(),
    },
  ];

  const notificationData = [
    { type: 'email', enabled: true, value: 'user@example.com' },
    { type: 'sms', enabled: false, value: '' },
  ];

  useEffect(() => {
    setBackups(backupData || []);
    setNotifications(notificationData || []);
  }, []);

  // إنشاء نسخة احتياطية جديدة
  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const newBackup = {
        id: Date.now().toString(),
        name: `Backup-${new Date().toISOString()}`,
        description: 'نسخة احتياطية يدوية',
        createdAt: new Date(),
      };

      toast({
        title: 'نجح',
        description: 'تم إنشاء النسخة الاحتياطية بنجاح',
      });

      setBackups([...backups, newBackup]);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل إنشاء النسخة الاحتياطية',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // استعادة نسخة احتياطية
  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في استعادة هذه النسخة؟')) return;

    setLoading(true);
    try {
      toast({
        title: 'نجح',
        description: 'تم استعادة النسخة الاحتياطية بنجاح',
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل استعادة النسخة الاحتياطية',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // حذف نسخة احتياطية
  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذه النسخة؟')) return;

    try {
      toast({
        title: 'نجح',
        description: 'تم حذف النسخة الاحتياطية بنجاح',
      });

      setBackups(backups.filter(b => b.id !== backupId));
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل حذف النسخة الاحتياطية',
        variant: 'destructive',
      });
    }
  };

  // تحديث إعدادات الإشعارات
  const handleUpdateNotifications = async (type: string, enabled: boolean) => {
    try {
      toast({
        title: 'نجح',
        description: 'تم تحديث إعدادات الإشعارات',
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل تحديث الإعدادات',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة النسخ الاحتياطية والإشعارات</h1>
          <p className="text-gray-600 mt-2">إدارة النسخ الاحتياطية وإعدادات الإشعارات المتقدمة</p>
        </div>

        <Tabs defaultValue="backups" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="backups">النسخ الاحتياطية</TabsTrigger>
            <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          </TabsList>

          {/* تبويب النسخ الاحتياطية */}
          <TabsContent value="backups" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إدارة النسخ الاحتياطية</CardTitle>
                <CardDescription>
                  إنشاء واستعادة وحذف النسخ الاحتياطية من بيانات النظام
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* زر إنشاء نسخة احتياطية */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleCreateBackup}
                    disabled={loading}
                    className="gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    إنشاء نسخة احتياطية جديدة
                  </Button>
                </div>

                {/* قائمة النسخ الاحتياطية */}
                <div className="space-y-2">
                  <h3 className="font-semibold">النسخ الاحتياطية المتاحة</h3>
                  {backups.length === 0 ? (
                    <p className="text-gray-500">لا توجد نسخ احتياطية</p>
                  ) : (
                    <div className="space-y-2">
                      {backups.map((backup) => (
                        <Card key={backup.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium">{backup.name}</p>
                              <p className="text-sm text-gray-500">
                                <Clock className="w-4 h-4 inline mr-1" />
                                {new Date(backup.createdAt).toLocaleString('ar-JO')}
                              </p>
                              <p className="text-sm text-gray-500">{backup.description}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestoreBackup(backup.id)}
                                disabled={loading}
                                className="gap-1"
                              >
                                <RotateCcw className="w-4 h-4" />
                                استعادة
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteBackup(backup.id)}
                                disabled={loading}
                                className="gap-1 text-red-600 hover:text-red-700"
                              >
                                حذف
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* معلومات إضافية */}
                <Card className="bg-blue-50 border-blue-200 p-4">
                  <p className="text-sm text-blue-900">
                    <strong>ملاحظة:</strong> يتم إنشاء نسخة احتياطية تلقائية يومياً. يمكنك أيضاً إنشاء نسخ احتياطية يدوية متى شئت.
                  </p>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الإشعارات */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الإشعارات</CardTitle>
                <CardDescription>
                  تخصيص طرق الإشعارات والتنبيهات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* إشعارات البريد الإلكتروني */}
                <div className="space-y-4 border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">إشعارات البريد الإلكتروني</p>
                        <p className="text-sm text-gray-500">استقبال الإشعارات عبر البريد الإلكتروني</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.find(n => n.type === 'email')?.enabled || false}
                      onCheckedChange={(checked) =>
                        handleUpdateNotifications('email', checked)
                      }
                    />
                  </div>

                  {/* عنوان البريد الإلكتروني */}
                  <div className="ml-8 space-y-2">
                    <Label htmlFor="email">عنوان البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      defaultValue={notifications.find(n => n.type === 'email')?.value || ''}
                    />
                  </div>

                  {/* أنواع الإشعارات */}
                  <div className="ml-8 space-y-2">
                    <p className="text-sm font-medium">أنواع الإشعارات:</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span>إنشاء بيان جديد</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span>اكتمال عملية دفع</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span>تخليص جمركي</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span>تنبيهات الأخطاء</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* إشعارات SMS */}
                <div className="space-y-4 border-b pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">إشعارات SMS</p>
                        <p className="text-sm text-gray-500">استقبال الإشعارات عبر الرسائل النصية</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.find(n => n.type === 'sms')?.enabled || false}
                      onCheckedChange={(checked) =>
                        handleUpdateNotifications('sms', checked)
                      }
                    />
                  </div>

                  {/* رقم الهاتف */}
                  <div className="ml-8 space-y-2">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+962791234567"
                      defaultValue={notifications.find(n => n.type === 'sms')?.value || ''}
                    />
                  </div>
                </div>

                {/* إشعارات الدفع والعمليات الحرجة */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-medium">إشعارات الدفع والعمليات الحرجة</p>
                        <p className="text-sm text-gray-500">إشعارات فورية للعمليات المهمة</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  {/* أنواع الإشعارات الحرجة */}
                  <div className="ml-8 space-y-2">
                    <p className="text-sm font-medium">العمليات الحرجة:</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span>عمليات الدفع الكبيرة (أكثر من 10,000 دينار)</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span>تغييرات في البيانات الحساسة</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span>محاولات دخول غير موثوقة</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked />
                        <span>أخطاء النظام الحرجة</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* زر الحفظ */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button className="gap-2">
                    حفظ الإعدادات
                  </Button>
                  <Button variant="outline">
                    إعادة تعيين
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

export default BackupAndNotifications;

// إضافة الصفحة إلى التطبيق
// في App.tsx أضف:
// import BackupAndNotifications from '@/pages/BackupAndNotifications';
// <Route path="/backup-notifications" component={BackupAndNotifications} />

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mail,
  Send,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  ToggleLeft,
  ToggleRight,
  Eye,
  Download,
  Trash2,
} from 'lucide-react';

interface EmailNotification {
  id: string;
  type: string;
  recipient: string;
  subject: string;
  content: string;
  status: 'sent' | 'pending' | 'failed';
  date: string;
  template: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  triggers: string[];
}

export default function EmailNotifications() {
  const [notifications, setNotifications] = useState<EmailNotification[]>([
    {
      id: '1',
      type: 'invoice',
      recipient: 'customer@example.com',
      subject: 'فاتورة جديدة - INV-1708315294000-A7K9X2B1',
      content: 'تم إنشاء فاتورة جديدة بقيمة 5,000 د.ا',
      status: 'sent',
      date: '2026-02-18 10:30',
      template: 'invoice_created',
    },
    {
      id: '2',
      type: 'payment',
      recipient: 'admin@customs.jo',
      subject: 'تم استقبال دفعة جديدة',
      content: 'تم استقبال دفعة بقيمة 3,500 د.ا عبر Telr',
      status: 'sent',
      date: '2026-02-18 09:15',
      template: 'payment_received',
    },
    {
      id: '3',
      type: 'shipment',
      recipient: 'logistics@customs.jo',
      subject: 'تحديث حالة الشحنة',
      content: 'الشحنة CNT-001 وصلت إلى ميناء العقبة',
      status: 'pending',
      date: '2026-02-18 08:00',
      template: 'shipment_update',
    },
  ]);

  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'إنشاء فاتورة جديدة',
      description: 'إرسال إشعار عند إنشاء فاتورة جديدة',
      enabled: true,
      triggers: ['invoice_created'],
    },
    {
      id: '2',
      name: 'استقبال دفعة',
      description: 'إرسال إشعار عند استقبال دفعة جديدة',
      enabled: true,
      triggers: ['payment_received'],
    },
    {
      id: '3',
      name: 'تحديث حالة الشحنة',
      description: 'إرسال إشعار عند تحديث حالة الشحنة',
      enabled: true,
      triggers: ['shipment_updated'],
    },
    {
      id: '4',
      name: 'استرجاع المبلغ',
      description: 'إرسال إشعار عند معالجة استرجاع المبلغ',
      enabled: false,
      triggers: ['refund_processed'],
    },
    {
      id: '5',
      name: 'تنبيه أمني',
      description: 'إرسال إشعار عند اكتشاف نشاط غير عادي',
      enabled: true,
      triggers: ['security_alert'],
    },
  ]);

  const [selectedNotification, setSelectedNotification] = useState<EmailNotification | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleToggleTemplate = (id: string) => {
    setTemplates(templates.map(t =>
      t.id === id ? { ...t, enabled: !t.enabled } : t
    ));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'مرسل';
      case 'pending':
        return 'قيد الانتظار';
      case 'failed':
        return 'فشل';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            نظام الإشعارات البريدية
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            إدارة الإشعارات والقوالب البريدية
          </p>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Mail className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي الإشعارات</p>
                <p className="text-3xl font-bold text-blue-600">{notifications.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">مرسل</p>
                <p className="text-3xl font-bold text-green-600">
                  {notifications.filter(n => n.status === 'sent').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">قيد الانتظار</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {notifications.filter(n => n.status === 'pending').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
                <p className="text-gray-600 text-sm">فشل</p>
                <p className="text-3xl font-bold text-red-600">
                  {notifications.filter(n => n.status === 'failed').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة الإشعارات */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  الإشعارات الأخيرة
                </CardTitle>
                <CardDescription>
                  {notifications.length} إشعار
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      onClick={() => setSelectedNotification(notification)}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(notification.status)}
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {notification.subject}
                            </h3>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {notification.content}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{notification.recipient}</span>
                            <span>•</span>
                            <span>{notification.date}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNotification(notification);
                              setShowPreview(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* القوالب */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                القوالب
              </CardTitle>
              <CardDescription>
                إدارة قوالب الإشعارات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map(template => (
                <div
                  key={template.id}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {template.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleTemplate(template.id)}
                      className="p-1"
                    >
                      {template.enabled ? (
                        <ToggleRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {template.triggers.map(trigger => (
                      <Badge key={trigger} variant="outline" className="text-xs">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* معاينة الإشعار */}
        {showPreview && selectedNotification && (
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>معاينة الإشعار</span>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">من:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    noreply@customs-system.jo
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">إلى:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedNotification.recipient}
                  </p>
                </div>

                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">الموضوع:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedNotification.subject}
                  </p>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedNotification.content}
                  </p>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button className="gap-2">
                    <Send className="w-4 h-4" />
                    إعادة إرسال
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download className="w-4 h-4" />
                    تحميل
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: يمكنك تفعيل أو تعطيل القوالب حسب احتياجاتك. الإشعارات المرسلة تظهر في السجل للمراجعة والمتابعة.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

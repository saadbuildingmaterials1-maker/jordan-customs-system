import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Mail,
  Plus,
  Send,
  Settings,
  Eye,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Search,
  Copy,
  MoreVertical,
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: string;
  status: 'active' | 'inactive';
  createdDate: string;
  lastModified: string;
  recipients: number;
}

interface ScheduledEmail {
  id: string;
  title: string;
  template: string;
  recipients: string;
  scheduledTime: string;
  status: 'pending' | 'sent' | 'failed';
  openRate?: number;
  clickRate?: number;
}

export default function EmailNotificationSystem() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'تأكيد الطلب',
      subject: 'تأكيد استقبال طلبك',
      category: 'Orders',
      status: 'active',
      createdDate: '2026-01-15',
      lastModified: '2026-02-10',
      recipients: 1245,
    },
    {
      id: '2',
      name: 'تحديث حالة الشحن',
      subject: 'تحديث حالة شحنتك',
      category: 'Shipping',
      status: 'active',
      createdDate: '2026-01-20',
      lastModified: '2026-02-12',
      recipients: 892,
    },
    {
      id: '3',
      name: 'إشعار الدفع',
      subject: 'تم استقبال دفعتك',
      category: 'Payment',
      status: 'active',
      createdDate: '2026-01-25',
      lastModified: '2026-02-08',
      recipients: 756,
    },
    {
      id: '4',
      name: 'تقرير شهري',
      subject: 'تقرير النشاط الشهري',
      category: 'Reports',
      status: 'inactive',
      createdDate: '2026-02-01',
      lastModified: '2026-02-15',
      recipients: 0,
    },
  ]);

  const [scheduledEmails, setScheduledEmails] = useState<ScheduledEmail[]>([
    {
      id: '1',
      title: 'تقرير المبيعات الأسبوعي',
      template: 'تقرير المبيعات',
      recipients: 'فريق الإدارة (5 أشخاص)',
      scheduledTime: '2026-02-25 09:00 AM',
      status: 'pending',
    },
    {
      id: '2',
      title: 'إشعار العملاء الجدد',
      template: 'ترحيب العملاء',
      recipients: 'جميع العملاء الجدد',
      scheduledTime: '2026-02-18 08:00 AM',
      status: 'sent',
      openRate: 45.2,
      clickRate: 12.5,
    },
    {
      id: '3',
      title: 'تذكير الفواتير المتأخرة',
      template: 'تذكير الفواتير',
      recipients: 'العملاء ذوو الفواتير المتأخرة',
      scheduledTime: '2026-02-20 10:00 AM',
      status: 'pending',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'نشط';
      case 'inactive':
        return 'غير نشط';
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

  const totalTemplates = templates.length;
  const activeTemplates = templates.filter(t => t.status === 'active').length;
  const totalRecipients = templates.reduce((sum, t) => sum + t.recipients, 0);
  const sentEmails = scheduledEmails.filter(e => e.status === 'sent').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              نظام الإشعارات عبر البريد الإلكتروني
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة قوالب البريد والإشعارات المجدولة
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            قالب جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Mail className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي القوالب</p>
                <p className="text-3xl font-bold text-blue-600">{totalTemplates}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">قوالب نشطة</p>
                <p className="text-3xl font-bold text-green-600">{activeTemplates}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Send className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">رسائل مرسلة</p>
                <p className="text-3xl font-bold text-purple-600">{sentEmails}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي المستقبلين</p>
                <p className="text-3xl font-bold text-yellow-600">{totalRecipients}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* قوالب البريد */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                قوالب البريد الإلكتروني
              </CardTitle>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ابحث عن قالب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map(template => (
              <div
                key={template.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    <Badge className={getStatusColor(template.status)}>
                      {getStatusLabel(template.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    الموضوع: {template.subject}
                  </p>
                  <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span>الفئة: {template.category}</span>
                    <span>المستقبلون: {template.recipients}</span>
                    <span>آخر تعديل: {template.lastModified}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* الرسائل المجدولة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              الرسائل المجدولة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scheduledEmails.map(email => (
              <div
                key={email.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {email.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      القالب: {email.template}
                    </p>
                  </div>
                  <Badge className={getStatusColor(email.status)}>
                    {getStatusLabel(email.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">المستقبلون</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {email.recipients}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">الوقت المجدول</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {email.scheduledTime}
                    </p>
                  </div>
                </div>

                {email.status === 'sent' && (
                  <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="text-xs text-green-700 dark:text-green-300">معدل الفتح</p>
                      <p className="text-lg font-bold text-green-600">{email.openRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 dark:text-green-300">معدل النقر</p>
                      <p className="text-lg font-bold text-green-600">{email.clickRate}%</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-4 h-4" />
                    عرض
                  </Button>
                  {email.status === 'pending' && (
                    <Button size="sm" variant="outline" className="gap-1">
                      <Send className="w-4 h-4" />
                      إرسال الآن
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="gap-1">
                    <Download className="w-4 h-4" />
                    تحميل
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* إعدادات البريد */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              إعدادات البريد الإلكتروني
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                  عنوان البريد الإرسالي
                </label>
                <input
                  type="email"
                  defaultValue="noreply@jordan-customs.com"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                  اسم المرسل
                </label>
                <input
                  type="text"
                  defaultValue="نظام إدارة الجمارك الأردنية"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                  خادم SMTP
                </label>
                <input
                  type="text"
                  defaultValue="smtp.gmail.com"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                  منفذ SMTP
                </label>
                <input
                  type="text"
                  defaultValue="587"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="gap-2">
                <CheckCircle className="w-4 h-4" />
                اختبار الاتصال
              </Button>
              <Button variant="outline" className="gap-2">
                حفظ الإعدادات
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: استخدم قوالب البريل المخصصة لتحسين معدلات الفتح والنقر. اختبر الإعدادات قبل إرسال الرسائل المهمة.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

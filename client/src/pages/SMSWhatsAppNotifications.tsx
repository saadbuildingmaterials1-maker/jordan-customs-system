import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MessageCircle,
  Send,
  Phone,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
} from 'lucide-react';

interface NotificationTemplate {
  id: string;
  name: string;
  channel: 'sms' | 'whatsapp' | 'both';
  content: string;
  variables: string[];
  status: 'active' | 'inactive';
  usageCount: number;
}

interface NotificationLog {
  id: string;
  recipient: string;
  channel: 'sms' | 'whatsapp';
  message: string;
  status: 'sent' | 'failed' | 'pending';
  timestamp: string;
  template: string;
}

export default function SMSWhatsAppNotifications() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'تأكيد الشحنة',
      channel: 'both',
      content: 'تم تأكيد شحنتك برقم {{shipmentId}}. سيتم التسليم في {{deliveryDate}}',
      variables: ['shipmentId', 'deliveryDate'],
      status: 'active',
      usageCount: 245,
    },
    {
      id: '2',
      name: 'تنبيه الدفع',
      channel: 'sms',
      content: 'تذكير: فاتورتك برقم {{invoiceId}} بقيمة {{amount}} دينار مستحقة في {{dueDate}}',
      variables: ['invoiceId', 'amount', 'dueDate'],
      status: 'active',
      usageCount: 156,
    },
    {
      id: '3',
      name: 'تحديث الحالة',
      channel: 'whatsapp',
      content: 'تحديث: شحنتك {{shipmentId}} وصلت إلى {{location}} في {{time}}',
      variables: ['shipmentId', 'location', 'time'],
      status: 'active',
      usageCount: 189,
    },
    {
      id: '4',
      name: 'تنبيه الجمارك',
      channel: 'both',
      content: 'تنبيه: شحنتك {{shipmentId}} تحتاج إلى موافقة جمركية. يرجى تقديم المستندات المطلوبة',
      variables: ['shipmentId'],
      status: 'active',
      usageCount: 78,
    },
  ]);

  const [logs, setLogs] = useState<NotificationLog[]>([
    {
      id: '1',
      recipient: '+962791234567',
      channel: 'sms',
      message: 'تم تأكيد شحنتك برقم SHP001. سيتم التسليم في 2026-02-20',
      status: 'sent',
      timestamp: '2026-02-18 14:30:00',
      template: 'تأكيد الشحنة',
    },
    {
      id: '2',
      recipient: '+962799876543',
      channel: 'whatsapp',
      message: 'تحديث: شحنتك SHP002 وصلت إلى عمّان في 14:25',
      status: 'sent',
      timestamp: '2026-02-18 14:28:00',
      template: 'تحديث الحالة',
    },
    {
      id: '3',
      recipient: '+962788765432',
      channel: 'sms',
      message: 'تذكير: فاتورتك برقم INV001 بقيمة 500 دينار مستحقة في 2026-02-20',
      status: 'sent',
      timestamp: '2026-02-18 14:25:00',
      template: 'تنبيه الدفع',
    },
    {
      id: '4',
      recipient: '+962797654321',
      channel: 'whatsapp',
      message: 'تنبيه: شحنتك SHP003 تحتاج إلى موافقة جمركية',
      status: 'pending',
      timestamp: '2026-02-18 14:20:00',
      template: 'تنبيه الجمارك',
    },
  ]);

  const totalSent = logs.filter(l => l.status === 'sent').length;
  const totalFailed = logs.filter(l => l.status === 'failed').length;
  const totalPending = logs.filter(l => l.status === 'pending').length;
  const smsSent = logs.filter(l => l.channel === 'sms' && l.status === 'sent').length;
  const whatsappSent = logs.filter(l => l.channel === 'whatsapp' && l.status === 'sent').length;

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'sms':
        return <Phone className="w-4 h-4" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getChannelLabel = (channel: string) => {
    switch (channel) {
      case 'sms':
        return 'رسالة نصية';
      case 'whatsapp':
        return 'واتس آب';
      case 'both':
        return 'كلاهما';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'مرسل';
      case 'failed':
        return 'فشل';
      case 'pending':
        return 'قيد الانتظار';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">نظام الإشعارات عبر SMS و WhatsApp</h1>
        <p className="text-gray-600 dark:text-gray-400">إدارة الإشعارات الفورية عبر الرسائل النصية والواتس آب</p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">إجمالي المرسل</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{totalSent}</p>
                <p className="text-xs text-gray-500">إشعار</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">رسائل SMS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{smsSent}</p>
                <p className="text-xs text-gray-500">رسالة</p>
              </div>
              <Phone className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">رسائل WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{whatsappSent}</p>
                <p className="text-xs text-gray-500">رسالة</p>
              </div>
              <MessageCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">معدل النجاح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{Math.round((totalSent / (totalSent + totalFailed + totalPending)) * 100)}%</p>
                <p className="text-xs text-gray-500">نسبة النجاح</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* القوالب */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                قوالب الإشعارات
              </CardTitle>
              <CardDescription>إدارة قوالب الرسائل والإشعارات</CardDescription>
            </div>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة قالب
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getChannelIcon(template.channel)}
                      <h3 className="font-semibold">{template.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {getChannelLabel(template.channel)}
                      </Badge>
                      <Badge
                        className={
                          template.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                        }
                      >
                        {template.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{template.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>المتغيرات: {template.variables.join(', ')}</span>
                      <span>الاستخدام: {template.usageCount}</span>
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
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* سجل الإشعارات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            سجل الإشعارات المرسلة
          </CardTitle>
          <CardDescription>تتبع جميع الإشعارات المرسلة والحالات</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-2 px-2">المستقبل</th>
                  <th className="text-right py-2 px-2">القناة</th>
                  <th className="text-right py-2 px-2">الرسالة</th>
                  <th className="text-right py-2 px-2">الحالة</th>
                  <th className="text-right py-2 px-2">الوقت</th>
                  <th className="text-right py-2 px-2">القالب</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-900/50">
                    <td className="py-2 px-2 font-mono">{log.recipient}</td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        {getChannelIcon(log.channel)}
                        <span>{getChannelLabel(log.channel)}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-gray-600 dark:text-gray-400 truncate max-w-xs">{log.message}</td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(log.status)}
                        <Badge className={getStatusColor(log.status)}>
                          {getStatusLabel(log.status)}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-2 px-2">{log.timestamp}</td>
                    <td className="py-2 px-2">{log.template}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* التنبيهات */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          نظام الإشعارات يعمل بكفاءة عالية. معدل النجاح {Math.round((totalSent / (totalSent + totalFailed + totalPending)) * 100)}% مع {totalPending} إشعار قيد الانتظار.
        </AlertDescription>
      </Alert>
    </div>
  );
}

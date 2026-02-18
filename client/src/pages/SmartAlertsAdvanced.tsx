import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Activity,
  BarChart3,
  Zap,
  Brain,
  Send,
  Clock,
  Filter,
  Search,
} from 'lucide-react';

interface SmartAlert {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  trigger: string;
  condition: string;
  channels: string[];
  recipients: string[];
  status: 'active' | 'inactive';
  lastTriggered?: string;
  frequency: string;
}

interface AlertHistory {
  id: string;
  alert: string;
  severity: string;
  triggeredAt: string;
  recipient: string;
  status: 'sent' | 'failed' | 'pending';
  details: string;
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  action: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
}

export default function SmartAlertsAdvanced() {
  const [alerts] = useState<SmartAlert[]>([
    {
      id: '1',
      title: 'تأخر الدفع الحرج',
      description: 'تنبيه عند تأخر الدفع أكثر من 7 أيام',
      severity: 'critical',
      trigger: 'payment_delay',
      condition: 'delay > 7 days',
      channels: ['email', 'sms', 'app'],
      recipients: ['manager@company.com', '+962791234567'],
      status: 'active',
      lastTriggered: '2026-02-18 14:30',
      frequency: 'فوري',
    },
    {
      id: '2',
      title: 'تجاوز الميزانية',
      description: 'تنبيه عند تجاوز ميزانية الشحن الشهرية',
      severity: 'warning',
      trigger: 'budget_exceeded',
      condition: 'spending > monthly_budget',
      channels: ['email', 'app'],
      recipients: ['finance@company.com'],
      status: 'active',
      lastTriggered: '2026-02-17 10:15',
      frequency: 'يومي',
    },
    {
      id: '3',
      title: 'خطأ في النظام',
      description: 'تنبيه عند حدوث أخطاء في النظام',
      severity: 'critical',
      trigger: 'system_error',
      condition: 'error_rate > 5%',
      channels: ['email', 'sms'],
      recipients: ['admin@company.com', '+962791234567'],
      status: 'active',
      lastTriggered: '2026-02-18 12:00',
      frequency: 'فوري',
    },
    {
      id: '4',
      title: 'مستوى المخزون منخفض',
      description: 'تنبيه عند انخفاض مستوى المخزون',
      severity: 'warning',
      trigger: 'low_inventory',
      condition: 'inventory < minimum_level',
      channels: ['email'],
      recipients: ['warehouse@company.com'],
      status: 'inactive',
      frequency: 'يومي',
    },
  ]);

  const [history] = useState<AlertHistory[]>([
    {
      id: '1',
      alert: 'تأخر الدفع الحرج',
      severity: 'critical',
      triggeredAt: '2026-02-18 14:30',
      recipient: 'manager@company.com',
      status: 'sent',
      details: 'تأخر دفع من العميل أحمد محمد',
    },
    {
      id: '2',
      alert: 'خطأ في النظام',
      severity: 'critical',
      triggeredAt: '2026-02-18 12:00',
      recipient: '+962791234567',
      status: 'sent',
      details: 'خطأ في قاعدة البيانات',
    },
    {
      id: '3',
      alert: 'تجاوز الميزانية',
      severity: 'warning',
      triggeredAt: '2026-02-17 10:15',
      recipient: 'finance@company.com',
      status: 'sent',
      details: 'تم تجاوز ميزانية الشحن بمقدار 500 JOD',
    },
  ]);

  const [recommendations] = useState<AIRecommendation[]>([
    {
      id: '1',
      title: 'تحسين معدل الموافقة الجمركية',
      description: 'استخدم قوالب المستندات المعتمدة لزيادة معدل الموافقة',
      confidence: 92,
      action: 'تطبيق التوصية',
      impact: 'زيادة معدل الموافقة بـ 15%',
      priority: 'high',
    },
    {
      id: '2',
      title: 'تحسين كفاءة الشحن',
      description: 'استخدم مسارات الشحن الأسرع لتقليل وقت التسليم',
      confidence: 87,
      action: 'تطبيق التوصية',
      impact: 'تقليل وقت التسليم بـ 2 يوم',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'تقليل تكاليف الشحن',
      description: 'اختر مزودي الخدمات ذوي الأسعار المنخفضة',
      confidence: 85,
      action: 'تطبيق التوصية',
      impact: 'تقليل التكاليف بـ 10%',
      priority: 'medium',
    },
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Brain className="w-10 h-10 text-orange-600" />
              نظام التنبيهات الذكية المتقدم
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              تنبيهات ذكية مع توصيات مدعومة بالذكاء الاصطناعي
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            تنبيه جديد
          </Button>
        </div>

        {/* التنبيهات الذكية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              التنبيهات الذكية النشطة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map(alert => (
              <div key={alert.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {alert.title}
                      </h3>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity === 'critical' ? 'حرج' : alert.severity === 'warning' ? 'تحذير' : 'معلومة'}
                      </Badge>
                      <Badge variant={alert.status === 'active' ? 'default' : 'outline'}>
                        {alert.status === 'active' ? '✓ مفعل' : '✕ معطل'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {alert.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">المشغل</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{alert.trigger}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">الشرط</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{alert.condition}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">التكرار</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{alert.frequency}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">آخر تفعيل</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{alert.lastTriggered || 'لم يتم'}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">القنوات:</p>
                  <div className="flex gap-2 flex-wrap">
                    {alert.channels.map((channel, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {channel === 'email' ? '📧 بريد' : channel === 'sms' ? '📱 رسالة' : '🔔 تطبيق'}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="gap-1">
                    <Send className="w-4 h-4" />
                    اختبار الآن
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* التوصيات الذكية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              التوصيات الذكية المدعومة بالذكاء الاصطناعي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map(rec => (
              <div key={rec.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {rec.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {rec.description}
                    </p>
                  </div>
                  <Badge className={getPriorityColor(rec.priority)}>
                    {rec.priority === 'high' ? 'أولوية عالية' : rec.priority === 'medium' ? 'أولوية متوسطة' : 'أولوية منخفضة'}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">درجة الثقة</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${rec.confidence}%` }}
                        />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">{rec.confidence}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">التأثير المتوقع</p>
                    <p className="font-semibold text-green-600 mt-1">{rec.impact}</p>
                  </div>
                </div>

                <Button size="sm" className="gap-1">
                  <Zap className="w-4 h-4" />
                  {rec.action}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* سجل التنبيهات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              سجل التنبيهات المرسلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">التنبيه</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الخطورة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الوقت</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">المستقبل</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">التفاصيل</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(item => (
                    <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-semibold">{item.alert}</td>
                      <td className="py-3 px-4">
                        <Badge className={getSeverityColor(item.severity)}>
                          {item.severity === 'critical' ? 'حرج' : item.severity === 'warning' ? 'تحذير' : 'معلومة'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{item.triggeredAt}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{item.recipient}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status === 'sent' ? '✓ مرسل' : item.status === 'failed' ? '✕ فشل' : '⏳ قيد الانتظار'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{item.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800">
          <Brain className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            🧠 نصيحة: استخدم التنبيهات الذكية لمراقبة العمليات الحرجة. اتبع التوصيات المدعومة بالذكاء الاصطناعي لتحسين الأداء والكفاءة. قم بضبط حساسية التنبيهات حسب احتياجاتك.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

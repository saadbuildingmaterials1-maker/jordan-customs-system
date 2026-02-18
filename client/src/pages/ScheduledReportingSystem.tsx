import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  Clock,
  FileText,
  Mail,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Settings,
  Send,
  RefreshCw,
  Filter,
  Search,
} from 'lucide-react';

interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  recipients: string[];
  nextRun: string;
  lastRun: string;
  status: 'active' | 'paused' | 'failed';
  metrics: string[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: number;
  usage: number;
  lastModified: string;
}

interface ReportHistory {
  id: string;
  name: string;
  generatedAt: string;
  format: string;
  size: string;
  status: 'success' | 'failed' | 'pending';
  recipients: number;
}

export default function ScheduledReportingSystem() {
  const [scheduledReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      name: 'تقرير المبيعات الأسبوعي',
      description: 'تقرير شامل للمبيعات والإيرادات الأسبوعية',
      frequency: 'weekly',
      format: 'pdf',
      recipients: ['manager@company.com', 'director@company.com'],
      nextRun: '2026-02-25 08:00',
      lastRun: '2026-02-18 08:00',
      status: 'active',
      metrics: ['المبيعات الإجمالية', 'الإيرادات', 'عدد الطلبات', 'متوسط القيمة'],
    },
    {
      id: '2',
      name: 'تقرير الأداء الشهري',
      description: 'تقرير شامل لأداء النظام والموظفين',
      frequency: 'monthly',
      format: 'excel',
      recipients: ['ceo@company.com', 'finance@company.com'],
      nextRun: '2026-03-01 09:00',
      lastRun: '2026-02-01 09:00',
      status: 'active',
      metrics: ['الأداء', 'الكفاءة', 'الإنتاجية', 'جودة الخدمة'],
    },
    {
      id: '3',
      name: 'تقرير الامتثال والتدقيق',
      description: 'تقرير التدقيق والامتثال القانوني',
      frequency: 'quarterly',
      format: 'pdf',
      recipients: ['audit@company.com', 'compliance@company.com'],
      nextRun: '2026-04-01 10:00',
      lastRun: '2026-01-01 10:00',
      status: 'active',
      metrics: ['الامتثال', 'المخاطر', 'الأخطاء', 'التوصيات'],
    },
  ]);

  const [templates] = useState<ReportTemplate[]>([
    {
      id: '1',
      name: 'قالب المبيعات',
      description: 'قالب شامل لتقارير المبيعات والإيرادات',
      sections: 5,
      usage: 12,
      lastModified: '2026-02-15',
    },
    {
      id: '2',
      name: 'قالب الأداء',
      description: 'قالب لتقارير الأداء والكفاءة',
      sections: 4,
      usage: 8,
      lastModified: '2026-02-10',
    },
    {
      id: '3',
      name: 'قالب التدقيق',
      description: 'قالب لتقارير التدقيق والامتثال',
      sections: 6,
      usage: 5,
      lastModified: '2026-02-05',
    },
  ]);

  const [history] = useState<ReportHistory[]>([
    {
      id: '1',
      name: 'تقرير المبيعات الأسبوعي',
      generatedAt: '2026-02-18 08:15',
      format: 'PDF',
      size: '2.4 MB',
      status: 'success',
      recipients: 2,
    },
    {
      id: '2',
      name: 'تقرير الأداء الشهري',
      generatedAt: '2026-02-01 09:30',
      format: 'Excel',
      size: '1.8 MB',
      status: 'success',
      recipients: 2,
    },
    {
      id: '3',
      name: 'تقرير الامتثال والتدقيق',
      generatedAt: '2026-01-01 10:45',
      format: 'PDF',
      size: '3.2 MB',
      status: 'success',
      recipients: 2,
    },
  ]);

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      quarterly: 'ربع سنوي',
      yearly: 'سنوي',
    };
    return labels[frequency] || frequency;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
      case 'paused':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-10 h-10 text-blue-600" />
              نظام التقارير المجدولة المتقدم
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              جدولة وإدارة التقارير التلقائية بصيغ متعددة
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            تقرير جديد
          </Button>
        </div>

        {/* التقارير المجدولة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              التقارير المجدولة النشطة
            </CardTitle>
            <CardDescription>
              إدارة التقارير المجدولة والتكرار التلقائي
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduledReports.map(report => (
              <div key={report.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {report.name}
                      </h3>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status === 'active' ? 'مفعل' : report.status === 'paused' ? 'موقوف' : 'فشل'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {report.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">التكرار</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {getFrequencyLabel(report.frequency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">الصيغة</p>
                    <p className="font-semibold text-gray-900 dark:text-white uppercase">
                      {report.format}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">التشغيل القادم</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{report.nextRun}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">المستقبلين</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{report.recipients.length} أشخاص</p>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">المقاييس المضمنة:</p>
                  <div className="flex gap-2 flex-wrap">
                    {report.metrics.map((metric, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="gap-1">
                    <Send className="w-4 h-4" />
                    إرسال الآن
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-4 h-4" />
                    معاينة
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* قوالب التقارير */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              قوالب التقارير المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map(template => (
                <div key={template.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {template.description}
                  </p>
                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">الأقسام:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{template.sections}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">الاستخدام:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{template.usage} مرات</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">آخر تعديل:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{template.lastModified}</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full gap-1">
                    <Plus className="w-4 h-4" />
                    استخدام هذا القالب
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* سجل التقارير */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              سجل التقارير المُنشأة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">اسم التقرير</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">تاريخ الإنشاء</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الصيغة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الحجم</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">المستقبلين</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(report => (
                    <tr key={report.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 text-gray-900 dark:text-white">{report.name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{report.generatedAt}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{report.format}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{report.size}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1">
                            {report.status === 'success' ? 'نجح' : report.status === 'failed' ? 'فشل' : 'قيد الانتظار'}
                          </span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{report.recipients}</td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Download className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: استخدم التقارير المجدولة لتوزيع البيانات الهامة تلقائياً على المسؤولين. يمكنك تخصيص التكرار والصيغة والمستقبلين حسب احتياجاتك.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

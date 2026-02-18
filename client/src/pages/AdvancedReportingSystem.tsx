import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  BarChart3,
  Calendar,
  Clock,
  Mail,
  Settings,
  Share2,
  Filter,
  Search,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'financial' | 'operational' | 'customs' | 'shipping' | 'analytics';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'once';
  format: string[];
  recipients: string[];
  lastGenerated?: string;
  nextScheduled?: string;
  status: 'active' | 'inactive' | 'paused';
  generatedReports: number;
}

interface GeneratedReport {
  id: string;
  name: string;
  generatedAt: string;
  format: string;
  size: string;
  status: 'completed' | 'processing' | 'failed';
  downloads: number;
}

interface ExportFormat {
  id: string;
  name: string;
  extension: string;
  icon: string;
  description: string;
  supported: boolean;
}

export default function AdvancedReportingSystem() {
  const [reports] = useState<Report[]>([
    {
      id: '1',
      name: 'التقرير المالي الشهري',
      description: 'تقرير شامل للإيرادات والمصروفات والأرباح',
      type: 'financial',
      frequency: 'monthly',
      format: ['PDF', 'Excel', 'CSV'],
      recipients: ['finance@company.com', 'manager@company.com'],
      lastGenerated: '2026-02-18',
      nextScheduled: '2026-03-18',
      status: 'active',
      generatedReports: 12,
    },
    {
      id: '2',
      name: 'تقرير العمليات اليومي',
      description: 'تقرير يومي بأداء العمليات والمعاملات',
      type: 'operational',
      frequency: 'daily',
      format: ['PDF', 'Excel'],
      recipients: ['operations@company.com'],
      lastGenerated: '2026-02-18 08:00',
      nextScheduled: '2026-02-19 08:00',
      status: 'active',
      generatedReports: 365,
    },
    {
      id: '3',
      name: 'تقرير الجمارك الشهري',
      description: 'تقرير شامل للتصاريح الجمركية والضرائب',
      type: 'customs',
      frequency: 'monthly',
      format: ['PDF', 'Excel', 'CSV'],
      recipients: ['customs@company.com'],
      lastGenerated: '2026-02-15',
      nextScheduled: '2026-03-15',
      status: 'active',
      generatedReports: 11,
    },
  ]);

  const [generatedReports] = useState<GeneratedReport[]>([
    {
      id: '1',
      name: 'التقرير المالي - فبراير 2026',
      generatedAt: '2026-02-18 14:30',
      format: 'PDF',
      size: '2.5 MB',
      status: 'completed',
      downloads: 5,
    },
    {
      id: '2',
      name: 'تقرير العمليات - 18 فبراير 2026',
      generatedAt: '2026-02-18 08:00',
      format: 'Excel',
      size: '1.8 MB',
      status: 'completed',
      downloads: 12,
    },
    {
      id: '3',
      name: 'تقرير الجمارك - فبراير 2026',
      generatedAt: '2026-02-15 10:00',
      format: 'PDF',
      size: '3.2 MB',
      status: 'completed',
      downloads: 3,
    },
  ]);

  const [exportFormats] = useState<ExportFormat[]>([
    {
      id: '1',
      name: 'PDF',
      extension: '.pdf',
      icon: '📄',
      description: 'تنسيق PDF محمول وآمن',
      supported: true,
    },
    {
      id: '2',
      name: 'Excel',
      extension: '.xlsx',
      icon: '📊',
      description: 'تنسيق Excel للتحليل المتقدم',
      supported: true,
    },
    {
      id: '3',
      name: 'CSV',
      extension: '.csv',
      icon: '📋',
      description: 'تنسيق CSV للاستيراد والتصدير',
      supported: true,
    },
    {
      id: '4',
      name: 'JSON',
      extension: '.json',
      icon: '{}',
      description: 'تنسيق JSON للتطبيقات',
      supported: true,
    },
  ]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'financial':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'operational':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'customs':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'shipping':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'analytics':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return '';
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      financial: 'تقرير مالي',
      operational: 'تقرير عمليات',
      customs: 'تقرير جمارك',
      shipping: 'تقرير شحن',
      analytics: 'تقرير تحليلي',
    };
    return labels[type] || type;
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels: Record<string, string> = {
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      quarterly: 'ربع سنوي',
      yearly: 'سنوي',
      once: 'مرة واحدة',
    };
    return labels[frequency] || frequency;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-10 h-10 text-blue-600" />
              نظام التقارير المتقدم مع التصدير
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إنشاء وجدولة وتصدير التقارير الشاملة
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
              التقارير المجدولة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reports.map(report => (
              <div key={report.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {report.name}
                      </h3>
                      <Badge className={getTypeColor(report.type)}>
                        {getTypeLabel(report.type)}
                      </Badge>
                      <Badge variant={report.status === 'active' ? 'default' : 'outline'}>
                        {report.status === 'active' ? '✓ مفعل' : '✕ معطل'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {report.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">التكرار</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{getFrequencyLabel(report.frequency)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">الصيغ</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{report.format.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">آخر إنشاء</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{report.lastGenerated}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">التالي</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{report.nextScheduled}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">التقارير</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{report.generatedReports}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="gap-1">
                    <RefreshCw className="w-4 h-4" />
                    إنشاء الآن
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Mail className="w-4 h-4" />
                    إرسال
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* التقارير المُنشأة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              التقارير المُنشأة مؤخراً
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
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">التحميلات</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedReports.map(report => (
                    <tr key={report.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-semibold">{report.name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{report.generatedAt}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{report.format}</Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{report.size}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(report.status)}>
                          {report.status === 'completed' ? '✓ مكتمل' : report.status === 'processing' ? '⏳ جاري' : '✕ فشل'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{report.downloads}</td>
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

        {/* صيغ التصدير المدعومة */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              صيغ التصدير المدعومة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {exportFormats.map(format => (
                <div key={format.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
                  <div className="text-4xl mb-2">{format.icon}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{format.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{format.extension}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{format.description}</p>
                  {format.supported && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      <CheckCircle className="w-3 h-3 ml-1" />
                      مدعوم
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            📊 نصيحة: استخدم التقارير المجدولة لتوليد التقارير تلقائياً وإرسالها للمستقبلين. اختر الصيغة المناسبة حسب الاستخدام (PDF للطباعة، Excel للتحليل، CSV للاستيراد).
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

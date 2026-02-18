import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Send,
  Download,
  Clock,
  Mail,
  CheckCircle,
  AlertCircle,
  FileText,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface ScheduledReport {
  id: string;
  name: string;
  type: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextRun: string;
  lastRun: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'csv';
  enabled: boolean;
  status: 'scheduled' | 'running' | 'completed' | 'failed';
}

export default function ScheduledReports() {
  const [reports, setReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      name: 'تقرير الفواتير الشهري',
      type: 'invoices',
      frequency: 'monthly',
      nextRun: '2026-03-01 08:00',
      lastRun: '2026-02-01 08:15',
      recipients: ['admin@customs.jo', 'manager@customs.jo'],
      format: 'pdf',
      enabled: true,
      status: 'scheduled',
    },
    {
      id: '2',
      name: 'تقرير المدفوعات الأسبوعي',
      type: 'payments',
      frequency: 'weekly',
      nextRun: '2026-02-25 10:00',
      lastRun: '2026-02-18 10:05',
      recipients: ['admin@customs.jo'],
      format: 'excel',
      enabled: true,
      status: 'completed',
    },
    {
      id: '3',
      name: 'تقرير الأداء اليومي',
      type: 'performance',
      frequency: 'daily',
      nextRun: '2026-02-19 09:00',
      lastRun: '2026-02-18 09:02',
      recipients: ['admin@customs.jo', 'tech@customs.jo'],
      format: 'csv',
      enabled: true,
      status: 'completed',
    },
    {
      id: '4',
      name: 'تقرير التحليلات الشهري',
      type: 'analytics',
      frequency: 'monthly',
      nextRun: '2026-03-01 15:00',
      lastRun: '2026-01-01 15:30',
      recipients: ['admin@customs.jo'],
      format: 'pdf',
      enabled: false,
      status: 'scheduled',
    },
  ]);

  const [selectedReport, setSelectedReport] = useState<ScheduledReport | null>(null);
  const [showAddReport, setShowAddReport] = useState(false);

  const handleToggleReport = (reportId: string) => {
    setReports(reports.map(r =>
      r.id === reportId ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const handleDeleteReport = (reportId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التقرير؟')) {
      setReports(reports.filter(r => r.id !== reportId));
    }
  };

  const handleRunNow = (reportId: string) => {
    setReports(reports.map(r =>
      r.id === reportId ? { ...r, status: 'running' } : r
    ));
    setTimeout(() => {
      setReports(prev => prev.map(r =>
        r.id === reportId ? { ...r, status: 'completed', lastRun: new Date().toLocaleString('ar-JO') } : r
      ));
    }, 2000);
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'daily':
        return 'يومياً';
      case 'weekly':
        return 'أسبوعياً';
      case 'monthly':
        return 'شهرياً';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'scheduled':
        return <Calendar className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'running':
        return 'جاري';
      case 'failed':
        return 'فشل';
      case 'scheduled':
        return 'مجدول';
      default:
        return '';
    }
  };

  const enabledCount = reports.filter(r => r.enabled).length;
  const completedCount = reports.filter(r => r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              نظام التقارير المجدولة
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              جدولة وإدارة التقارير التلقائية
            </p>
          </div>
          <Button onClick={() => setShowAddReport(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة تقرير جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي التقارير</p>
                <p className="text-3xl font-bold text-blue-600">{reports.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">مفعلة</p>
                <p className="text-3xl font-bold text-green-600">{enabledCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">مكتملة</p>
                <p className="text-3xl font-bold text-purple-600">{completedCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Mail className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                <p className="text-gray-600 text-sm">المستقبلون</p>
                <p className="text-3xl font-bold text-orange-600">
                  {new Set(reports.flatMap(r => r.recipients)).size}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة التقارير */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  التقارير المجدولة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {reports.map(report => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getStatusIcon(report.status)}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {report.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {getFrequencyLabel(report.frequency)} • {report.format.toUpperCase()}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">
                              {getStatusLabel(report.status)}
                            </Badge>
                            {report.enabled ? (
                              <Badge variant="default">مفعل</Badge>
                            ) : (
                              <Badge variant="outline">معطل</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleReport(report.id);
                          }}
                          className="p-2"
                        >
                          {report.enabled ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRunNow(report.id);
                          }}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReport(report);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReport(report.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* تفاصيل التقرير */}
          <div>
            {selectedReport ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedReport.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">التكرار</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getFrequencyLabel(selectedReport.frequency)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الصيغة</p>
                    <Badge variant="outline">
                      {selectedReport.format.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">التشغيل التالي</p>
                    <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                      <Calendar className="w-4 h-4" />
                      {selectedReport.nextRun}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">آخر تشغيل</p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedReport.lastRun}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">المستقبلون</p>
                    <div className="space-y-1">
                      {selectedReport.recipients.map(recipient => (
                        <div key={recipient} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {recipient}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">الحالة</p>
                    <Badge variant="outline">
                      {getStatusLabel(selectedReport.status)}
                    </Badge>
                  </div>

                  <Button className="w-full gap-2 mt-4">
                    <Download className="w-4 h-4" />
                    تحميل آخر تقرير
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    اختر تقريراً لعرض التفاصيل
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: يمكنك جدولة التقارير بتكرارات مختلفة وإرسالها تلقائياً إلى المستقبلين. استخدم خيار "تشغيل الآن" لاختبار التقرير قبل جدولته.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Plus,
  Download,
  Share2,
  Trash2,
  Eye,
  Edit,
  Clock,
  Calendar,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  Settings,
  Mail,
  BarChart3,
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: string;
  format: string;
  frequency: string;
  lastGenerated: string;
  nextScheduled: string;
  status: 'scheduled' | 'generated' | 'failed';
  recipients: number;
  size: string;
}

export default function AdvancedReporting() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: '1',
      name: 'تقرير الإيرادات الشهري',
      type: 'مالي',
      format: 'PDF',
      frequency: 'شهري',
      lastGenerated: '2026-02-18',
      nextScheduled: '2026-03-18',
      status: 'scheduled',
      recipients: 5,
      size: '2.5 MB',
    },
    {
      id: '2',
      name: 'تقرير الطلبات والشحنات',
      type: 'عمليات',
      format: 'Excel',
      frequency: 'أسبوعي',
      lastGenerated: '2026-02-17',
      nextScheduled: '2026-02-24',
      status: 'generated',
      recipients: 8,
      size: '1.8 MB',
    },
    {
      id: '3',
      name: 'تقرير أداء الفريق',
      type: 'موارد بشرية',
      format: 'PDF',
      frequency: 'شهري',
      lastGenerated: '2026-02-10',
      nextScheduled: '2026-03-10',
      status: 'scheduled',
      recipients: 3,
      size: '1.2 MB',
    },
    {
      id: '4',
      name: 'تقرير الجمارك والضرائب',
      type: 'قانوني',
      format: 'PDF + Excel',
      frequency: 'ربع سنوي',
      lastGenerated: '2026-01-15',
      nextScheduled: '2026-04-15',
      status: 'generated',
      recipients: 2,
      size: '3.1 MB',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredReports = reports.filter(report =>
    (report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     report.type.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (filterType === 'all' || report.type === filterType)
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'generated':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'مجدول';
      case 'generated':
        return 'تم الإنشاء';
      case 'failed':
        return 'فشل';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'generated':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return '';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'مالي':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'عمليات':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'موارد بشرية':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'قانوني':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              نظام التقارير المتقدم
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إنشاء وجدولة التقارير الشاملة
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            تقرير جديد
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
                <p className="text-gray-600 text-sm">تم إنشاؤها</p>
                <p className="text-3xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'generated').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">مجدولة</p>
                <p className="text-3xl font-bold text-blue-600">
                  {reports.filter(r => r.status === 'scheduled').length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Mail className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">المستقبلين</p>
                <p className="text-3xl font-bold text-purple-600">
                  {reports.reduce((sum, r) => sum + r.recipients, 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* قائمة التقارير */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              التقارير المتاحة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* البحث والفلاتر */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="ابحث عن تقرير..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  الكل
                </Button>
                <Button
                  variant={filterType === 'مالي' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('مالي')}
                >
                  مالي
                </Button>
                <Button
                  variant={filterType === 'عمليات' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('عمليات')}
                >
                  عمليات
                </Button>
                <Button
                  variant={filterType === 'موارد بشرية' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('موارد بشرية')}
                >
                  موارد بشرية
                </Button>
                <Button
                  variant={filterType === 'قانوني' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('قانوني')}
                >
                  قانوني
                </Button>
              </div>
            </div>

            {/* قائمة التقارير */}
            <div className="space-y-3">
              {filteredReports.map(report => (
                <div
                  key={report.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(report.status)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {report.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {report.type} • {report.format}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge className={getTypeColor(report.type)}>
                            {report.type}
                          </Badge>
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusLabel(report.status)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {report.frequency}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {report.recipients} مستقبل
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        آخر إنشاء: {report.lastGenerated}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        التالي: {report.nextScheduled}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {report.size}
                      </p>
                    </div>
                  </div>

                  {/* الإجراءات */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Button size="sm" variant="outline" className="gap-1">
                      <Eye className="w-4 h-4" />
                      عرض
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Download className="w-4 h-4" />
                      تحميل
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Share2 className="w-4 h-4" />
                      مشاركة
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Edit className="w-4 h-4" />
                      تعديل
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* خيارات التصدير */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              خيارات التصدير والمشاركة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button className="gap-2 h-auto py-4 flex-col">
                <FileText className="w-6 h-6" />
                <span>تصدير PDF</span>
              </Button>
              <Button className="gap-2 h-auto py-4 flex-col">
                <BarChart3 className="w-6 h-6" />
                <span>تصدير Excel</span>
              </Button>
              <Button className="gap-2 h-auto py-4 flex-col">
                <Mail className="w-6 h-6" />
                <span>إرسال بريد</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: استخدم جدولة التقارير لإرسال التقارير تلقائياً للمستقبلين في أوقات محددة. يمكنك تخصيص صيغ التقارير وإضافة تعليقات وملاحظات مهمة.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

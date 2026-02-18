import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download,
  FileText,
  Table2,
  BarChart3,
  Calendar,
  Filter,
  CheckCircle,
  Loader2,
} from 'lucide-react';

export default function ExportAndReports() {
  const [exportFormat, setExportFormat] = useState('pdf');
  const [reportType, setReportType] = useState('invoices');
  const [dateRange, setDateRange] = useState('month');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);

    try {
      // محاكاة عملية التصدير
      await new Promise(resolve => setTimeout(resolve, 2000));
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    { value: 'pdf', label: 'PDF', icon: '📄' },
    { value: 'excel', label: 'Excel', icon: '📊' },
    { value: 'csv', label: 'CSV', icon: '📋' },
    { value: 'json', label: 'JSON', icon: '{}' },
  ];

  const reportTypes = [
    { value: 'invoices', label: 'الفواتير', description: 'تقرير جميع الفواتير والمبالغ' },
    { value: 'payments', label: 'المدفوعات', description: 'تقرير المدفوعات والحالات' },
    { value: 'customers', label: 'العملاء', description: 'تقرير العملاء والمشتريات' },
    { value: 'gateways', label: 'بوابات الدفع', description: 'تقرير أداء البوابات' },
    { value: 'summary', label: 'ملخص شامل', description: 'ملخص شامل لجميع البيانات' },
  ];

  const dateRanges = [
    { value: 'today', label: 'اليوم' },
    { value: 'week', label: 'هذا الأسبوع' },
    { value: 'month', label: 'هذا الشهر' },
    { value: 'quarter', label: 'هذا الربع' },
    { value: 'year', label: 'هذه السنة' },
    { value: 'all', label: 'جميع البيانات' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            التصدير والتقارير
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            تصدير البيانات وإنشاء التقارير بصيغ متعددة
          </p>
        </div>

        {/* رسالة النجاح */}
        {exportSuccess && (
          <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              ✓ تم تصدير البيانات بنجاح! جاري تحميل الملف...
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* العمود الأيسر - خيارات التصدير */}
          <div className="lg:col-span-2 space-y-6">
            {/* اختيار نوع التقرير */}
            <Card>
              <CardHeader>
                <CardTitle>اختر نوع التقرير</CardTitle>
                <CardDescription>
                  اختر البيانات التي تريد تصديرها
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reportTypes.map((report) => (
                    <button
                      key={report.value}
                      onClick={() => setReportType(report.value)}
                      className={`p-4 text-right rounded-lg border-2 transition-all ${
                        reportType === report.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {report.label}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {report.description}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* اختيار صيغة التصدير */}
            <Card>
              <CardHeader>
                <CardTitle>اختر صيغة التصدير</CardTitle>
                <CardDescription>
                  الصيغة التي تريد تصدير البيانات بها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {exportOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setExportFormat(option.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        exportFormat === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="font-semibold text-sm text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* اختيار نطاق التاريخ */}
            <Card>
              <CardHeader>
                <CardTitle>اختر نطاق التاريخ</CardTitle>
                <CardDescription>
                  الفترة الزمنية للبيانات المراد تصديرها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dateRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* زر التصدير */}
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  جاري التصدير...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  تصدير البيانات
                </>
              )}
            </Button>
          </div>

          {/* العمود الأيمن - معلومات وإحصائيات */}
          <div className="space-y-6">
            {/* معلومات التصدير الحالي */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-lg">ملخص التصدير</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">نوع التقرير:</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {reportTypes.find(r => r.value === reportType)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">الصيغة:</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {exportOptions.find(o => o.value === exportFormat)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">الفترة الزمنية:</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {dateRanges.find(d => d.value === dateRange)?.label}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* الإحصائيات السريعة */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">الإحصائيات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الفواتير</p>
                    <p className="font-semibold text-gray-900 dark:text-white">1,245</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Table2 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">المدفوعات</p>
                    <p className="font-semibold text-gray-900 dark:text-white">1,143</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الإجمالي</p>
                    <p className="font-semibold text-gray-900 dark:text-white">571,500 د.ا</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* نصائح مفيدة */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">نصائح مفيدة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <span className="text-blue-600 font-bold">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    استخدم PDF للطباعة والعرض
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    استخدم Excel للتحليل والمعالجة
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    استخدم CSV للمشاركة والتكامل
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <p className="text-gray-700 dark:text-gray-300">
                    استخدم JSON للبرمجة والأتمتة
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* التقارير الحديثة */}
        <Card>
          <CardHeader>
            <CardTitle>التقارير الحديثة</CardTitle>
            <CardDescription>
              آخر التقارير التي تم تصديرها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'تقرير الفواتير - فبراير 2026', date: '2026-02-18', format: 'PDF' },
                { name: 'تقرير المدفوعات - يناير 2026', date: '2026-02-15', format: 'Excel' },
                { name: 'ملخص شامل - 2025', date: '2026-02-10', format: 'PDF' },
              ].map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {report.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {report.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-blue-600">
                      {report.format}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

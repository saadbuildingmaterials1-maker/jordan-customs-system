import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { FileText, Download, Eye, Filter, Calendar, BarChart3 } from 'lucide-react';

export default function ReportsAndExports() {
  const [activeTab, setActiveTab] = useState('reports');
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-01-31');

  const reports = [
    {
      id: 1,
      name: 'تقرير التكاليف الشهري',
      description: 'ملخص شامل للتكاليف والرسوم الجمركية',
      type: 'Monthly',
      lastGenerated: '2026-01-22',
      format: ['PDF', 'Excel'],
    },
    {
      id: 2,
      name: 'تقرير الانحرافات',
      description: 'تحليل الانحرافات بين التقديري والفعلي',
      type: 'Analysis',
      lastGenerated: '2026-01-21',
      format: ['PDF', 'Excel'],
    },
    {
      id: 3,
      name: 'تقرير الأصناف والمنتجات',
      description: 'قائمة شاملة بجميع الأصناف والمنتجات',
      type: 'Inventory',
      lastGenerated: '2026-01-20',
      format: ['PDF', 'Excel', 'CSV'],
    },
    {
      id: 4,
      name: 'تقرير الدفعات والفواتير',
      description: 'سجل كامل للدفعات والفواتير',
      type: 'Financial',
      lastGenerated: '2026-01-19',
      format: ['PDF', 'Excel'],
    },
  ];

  const exports = [
    {
      id: 1,
      name: 'تصدير البيانات الجمركية',
      description: 'تصدير جميع البيانات الجمركية',
      format: 'Excel',
      size: '2.5 MB',
      records: 1250,
    },
    {
      id: 2,
      name: 'تصدير الفواتير',
      description: 'تصدير جميع الفواتير المسجلة',
      format: 'PDF',
      size: '5.2 MB',
      records: 450,
    },
    {
      id: 3,
      name: 'تصدير الأصناف',
      description: 'تصدير قائمة الأصناف والمنتجات',
      format: 'CSV',
      size: '1.1 MB',
      records: 3200,
    },
  ];

  const handleGenerateReport = (reportId: number) => {
    alert(`جاري إنشاء التقرير #${reportId}...`);
  };

  const handleExportData = (exportId: number) => {
    alert(`جاري تصدير البيانات #${exportId}...`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* الرأس */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-8 h-8" />
            التقارير والتصدير
          </h1>
          <p className="text-gray-600 mt-2">
            إنشاء وتصدير التقارير والبيانات بصيغ متعددة
          </p>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">التقارير</span>
            </TabsTrigger>
            <TabsTrigger value="exports" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">التصدير</span>
            </TabsTrigger>
          </TabsList>

          {/* تبويب التقارير */}
          <TabsContent value="reports" className="space-y-6">
            {/* مرشحات التاريخ */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  مرشحات التقرير
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      من التاريخ
                    </label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      إلى التاريخ
                    </label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* قائمة التقارير */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((report) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          {report.name}
                        </CardTitle>
                        <CardDescription>{report.description}</CardDescription>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">{report.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">آخر إنشاء</p>
                      <p className="font-medium">{report.lastGenerated}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">الصيغ المتاحة</p>
                      <div className="flex gap-2 flex-wrap">
                        {report.format.map((fmt) => (
                          <Badge key={fmt} className="bg-gray-100 text-gray-800">
                            {fmt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleGenerateReport(report.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        معاينة
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => handleGenerateReport(report.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        إنشاء
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* تبويب التصدير */}
          <TabsContent value="exports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exports.map((exp) => (
                <Card key={exp.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5 text-green-600" />
                      {exp.name}
                    </CardTitle>
                    <CardDescription>{exp.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">الصيغة</p>
                        <p className="font-medium">{exp.format}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">الحجم</p>
                        <p className="font-medium">{exp.size}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">السجلات</p>
                        <p className="font-medium">{exp.records.toLocaleString('ar-JO')}</p>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleExportData(exp.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      تصدير الآن
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* إحصائيات التصدير */}
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات التصدير</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">إجمالي التصديرات</p>
                    <p className="text-2xl font-bold text-blue-600">1,245</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">البيانات المصدرة</p>
                    <p className="text-2xl font-bold text-green-600">4,850 سجل</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">المساحة المستخدمة</p>
                    <p className="text-2xl font-bold text-purple-600">8.8 GB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

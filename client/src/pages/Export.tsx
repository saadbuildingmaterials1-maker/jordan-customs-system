import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Download, Loader2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

/**
 * صفحة التصدير المتقدمة
 * Advanced Export Page
 */

export default function Export() {
  const { toast } = useToast();
  const [dataType, setDataType] = useState<'invoices' | 'payments' | 'shipments' | 'customs' | 'all'>('invoices');
  const [format, setFormat] = useState<'csv' | 'json' | 'xml' | 'excel'>('excel');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [compress, setCompress] = useState(false);
  const [delimiter, setDelimiter] = useState(',');
  const [isLoading, setIsLoading] = useState(false);

  const exportMutation = trpc.export.exportData.useMutation();
  const statsQuery = trpc.export.getExportStatistics.useQuery();

  const handleExport = async () => {
    try {
      setIsLoading(true);

      const result = await exportMutation.mutateAsync({
        dataType,
        format,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        includeMetadata,
        compress,
        delimiter: format === 'csv' ? delimiter : undefined,
      });

      if (result.success) {
        // تحويل base64 إلى blob
        const binaryString = atob(result.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: result.mimeType });

        // إنشاء رابط التحميل
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = result.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: 'نجح التصدير',
          description: `تم تصدير ${result.recordCount} سجل بنجاح`,
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'خطأ في التصدير',
        description: 'فشل في تصدير البيانات. حاول مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div>
        <h1 className="text-3xl font-bold">تصدير البيانات</h1>
        <p className="text-muted-foreground">صدر بيانات نظامك بصيغ متعددة</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* نموذج التصدير */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>خيارات التصدير</CardTitle>
              <CardDescription>اختر نوع البيانات والصيغة والخيارات المتقدمة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* نوع البيانات */}
              <div className="space-y-2">
                <Label htmlFor="dataType">نوع البيانات</Label>
                <Select value={dataType} onValueChange={(value: any) => setDataType(value)}>
                  <SelectTrigger id="dataType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invoices">الفواتير</SelectItem>
                    <SelectItem value="payments">المدفوعات</SelectItem>
                    <SelectItem value="shipments">الشحنات</SelectItem>
                    <SelectItem value="customs">التصريحات الجمركية</SelectItem>
                    <SelectItem value="all">جميع البيانات</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* صيغة التصدير */}
              <div className="space-y-2">
                <Label htmlFor="format">صيغة التصدير</Label>
                <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xml">XML</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* نطاق التاريخ */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">تاريخ البداية</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">تاريخ النهاية</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              {/* خيارات CSV */}
              {format === 'csv' && (
                <div className="space-y-2">
                  <Label htmlFor="delimiter">الفاصل</Label>
                  <Select value={delimiter} onValueChange={setDelimiter}>
                    <SelectTrigger id="delimiter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=",">فاصلة (,)</SelectItem>
                      <SelectItem value=";">فاصلة منقوطة (;)</SelectItem>
                      <SelectItem value="\t">تبويب (Tab)</SelectItem>
                      <SelectItem value="|">خط عمودي (|)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* خيارات متقدمة */}
              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold">الخيارات المتقدمة</h3>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="metadata"
                    checked={includeMetadata}
                    onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                  />
                  <Label htmlFor="metadata" className="font-normal cursor-pointer">
                    تضمين البيانات الوصفية
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="compress"
                    checked={compress}
                    onCheckedChange={(checked) => setCompress(checked as boolean)}
                  />
                  <Label htmlFor="compress" className="font-normal cursor-pointer">
                    ضغط الملف (GZ)
                  </Label>
                </div>
              </div>

              {/* زر التصدير */}
              <Button
                onClick={handleExport}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التصدير...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    تصدير البيانات
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="space-y-4">
          {/* بطاقة المعلومات */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معلومات التصدير</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="text-sm space-y-2">
                  <p className="font-semibold">الصيغ المدعومة:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>CSV - للجداول والبيانات</li>
                    <li>JSON - للتطبيقات</li>
                    <li>XML - للأنظمة الخارجية</li>
                    <li>Excel - للتقارير</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* بطاقة الإحصائيات */}
          {statsQuery.data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إحصائيات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">إجمالي التصديرات</p>
                  <p className="text-2xl font-bold">{statsQuery.data.totalExports}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">متوسط حجم الملف</p>
                  <p className="text-lg font-semibold">
                    {(statsQuery.data.averageFileSize / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الصيغة الأكثر استخداماً</p>
                  <p className="text-lg font-semibold uppercase">
                    {statsQuery.data.mostUsedFormat}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* بطاقة النصائح */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">نصائح مفيدة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• استخدم Excel للتقارير والعروض التقديمية</p>
              <p>• استخدم JSON للتطبيقات والواجهات البرمجية</p>
              <p>• استخدم CSV للبيانات الكبيرة والمعالجة</p>
              <p>• فعّل الضغط للملفات الكبيرة</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

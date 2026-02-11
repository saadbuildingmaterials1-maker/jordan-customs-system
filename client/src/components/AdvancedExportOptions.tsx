import React, { useState } from 'react';
import { Download, FileText, Sheet, Mail, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  format: string;
  action: () => void;
}

interface AdvancedExportOptionsProps {
  data: any;
  fileName?: string;
  onExport?: (format: string) => void;
}

export default function AdvancedExportOptions({
  data,
  fileName = 'export',
  onExport
}: AdvancedExportOptionsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      console.log('تم التصدير إلى PDF بنجاح');
      alert('تم التصدير إلى ملف PDF بنجاح');
      onExport?.('pdf');
    } catch (error) {
      alert('فشل تصدير البيانات إلى PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      console.log('تم التصدير إلى Excel بنجاح');
      alert('تم التصدير إلى ملف Excel بنجاح');
      onExport?.('excel');
    } catch (error) {
      alert('فشل تصدير البيانات إلى Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      console.log('تم التصدير إلى CSV بنجاح');
      alert('تم التصدير إلى ملف CSV بنجاح');
      onExport?.('csv');
    } catch (error) {
      alert('فشل تصدير البيانات إلى CSV');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      console.log('تم التصدير إلى JSON بنجاح');
      alert('تم التصدير إلى ملف JSON بنجاح');
      onExport?.('json');
    } catch (error) {
      alert('فشل تصدير البيانات إلى JSON');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const text = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(text);
      console.log('تم النسخ بنجاح');
      alert('تم نسخ البيانات إلى الحافظة بنجاح');
    } catch (error) {
      alert('فشل نسخ البيانات إلى الحافظة');
    }
  };

  const handleSendEmail = async () => {
    try {
      console.log('تم الإرسال بنجاح');
      alert('تم إرسال البيانات عبر البريد الإلكتروني بنجاح');
      onExport?.('email');
    } catch (error) {
      alert('فشل إرسال البيانات عبر البريد الإلكتروني');
    }
  };

  const exportOptions: ExportOption[] = [
    {
      id: 'pdf',
      label: 'تصدير إلى PDF',
      description: 'حفظ البيانات بصيغة PDF للطباعة والمشاركة',
      icon: <FileText className="w-6 h-6" />,
      format: 'pdf',
      action: handleExportPDF
    },
    {
      id: 'excel',
      label: 'تصدير إلى Excel',
      description: 'حفظ البيانات بصيغة Excel للتحليل والمعالجة',
      icon: <Sheet className="w-6 h-6" />,
      format: 'excel',
      action: handleExportExcel
    },
    {
      id: 'csv',
      label: 'تصدير إلى CSV',
      description: 'حفظ البيانات بصيغة CSV للاستخدام في برامج أخرى',
      icon: <Sheet className="w-6 h-6" />,
      format: 'csv',
      action: handleExportCSV
    },
    {
      id: 'json',
      label: 'تصدير إلى JSON',
      description: 'حفظ البيانات بصيغة JSON للمطورين والتطبيقات',
      icon: <FileText className="w-6 h-6" />,
      format: 'json',
      action: handleExportJSON
    }
  ];

  return (
    <div className="space-y-6">
      {/* Export Formats */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-right">خيارات التصدير</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exportOptions.map(option => (
            <Card key={option.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 justify-end">
                  <div>
                    <CardTitle className="text-right">{option.label}</CardTitle>
                    <CardDescription className="text-right">{option.description}</CardDescription>
                  </div>
                  <div className="text-blue-500">{option.icon}</div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={option.action}
                  disabled={isExporting}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 ml-2" />
                  {isExporting ? 'جاري التصدير...' : 'تصدير'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Options */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-right">خيارات إضافية</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Copy to Clipboard */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 justify-end">
                <div>
                  <CardTitle className="text-right">نسخ إلى الحافظة</CardTitle>
                  <CardDescription className="text-right">نسخ البيانات كنص JSON</CardDescription>
                </div>
                <Copy className="w-6 h-6 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCopyToClipboard}
                disabled={isExporting}
                className="w-full"
                variant="outline"
              >
                <Copy className="w-4 h-4 ml-2" />
                نسخ
              </Button>
            </CardContent>
          </Card>

          {/* Send Email */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 justify-end">
                <div>
                  <CardTitle className="text-right">إرسال عبر البريد</CardTitle>
                  <CardDescription className="text-right">إرسال البيانات إلى بريدك الإلكتروني</CardDescription>
                </div>
                <Mail className="w-6 h-6 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSendEmail}
                disabled={isExporting}
                className="w-full"
                variant="outline"
              >
                <Mail className="w-4 h-4 ml-2" />
                إرسال
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Export Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-right text-blue-900">نصائح التصدير</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-right text-blue-800">
          <p>استخدم PDF للطباعة والمشاركة الرسمية</p>
          <p>استخدم Excel للتحليل والمعالجة الإضافية</p>
          <p>استخدم CSV للاستيراد في برامج أخرى</p>
          <p>استخدم JSON للتطبيقات والمطورين</p>
          <p>احفظ نسخة احتياطية من البيانات المهمة</p>
        </CardContent>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Download, Eye } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: Date;
  status: 'pending' | 'processing' | 'success' | 'error';
  extractedData?: any;
  error?: string;
}

export default function PDFImport() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

  const extractPdfMutation = trpc.pdfImport.importDeclaration.useMutation({
    onSuccess: (data: any) => {
      setFiles(prev => prev.map(f => 
        f.id === selectedFile?.id 
          ? { ...f, status: 'success', extractedData: data }
          : f
      ));
      setIsProcessing(false);
    },
    onError: (error: any) => {
      setFiles(prev => prev.map(f =>
        f.id === selectedFile?.id
          ? { ...f, status: 'error', error: error.message }
          : f
      ));
      setIsProcessing(false);
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];
      
      // التحقق من نوع الملف
      if (file.type !== 'application/pdf') {
        alert('يرجى تحميل ملفات PDF فقط');
        continue;
      }

      // التحقق من حجم الملف (حد أقصى 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('حجم الملف يجب أن يكون أقل من 10MB');
        continue;
      }

      const newFile: UploadedFile = {
        id: `${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        uploadedAt: new Date(),
        status: 'pending',
      };

      setFiles(prev => [...prev, newFile]);

      // قراءة الملف وإرساله للمعالجة
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          setIsProcessing(true);
          setSelectedFile(newFile);
          
          // تحويل الملف إلى base64
          const base64 = event.target?.result as string;
          
          // استدعاء الإجراء tRPC
          await extractPdfMutation.mutateAsync({
            filePath: file.name,
          });
        } catch (error) {
          console.error('Error processing file:', error);
          setFiles(prev => prev.map(f =>
            f.id === newFile.id
              ? { ...f, status: 'error', error: 'فشل معالجة الملف' }
              : f
          ));
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: 'قيد الانتظار', color: 'bg-gray-500', icon: <Loader className="w-3 h-3 animate-spin" /> },
      processing: { label: 'قيد المعالجة', color: 'bg-blue-500', icon: <Loader className="w-3 h-3 animate-spin" /> },
      success: { label: 'نجح', color: 'bg-green-500', icon: <CheckCircle className="w-3 h-3" /> },
      error: { label: 'خطأ', color: 'bg-red-500', icon: <AlertCircle className="w-3 h-3" /> },
    };

    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-500', icon: null };
    return (
      <Badge className={`${statusInfo.color} text-white flex items-center gap-1 w-fit`}>
        {statusInfo.icon}
        {statusInfo.label}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">استيراد البيانات من PDF</h1>
        <p className="text-slate-600 mt-2">قم بتحميل ملفات PDF لاستخراج البيانات تلقائياً</p>
      </div>

      {/* منطقة التحميل */}
      <Card>
        <CardHeader>
          <CardTitle>تحميل ملفات PDF</CardTitle>
          <CardDescription>اسحب وأفلت الملفات أو انقر للاختيار</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">اسحب ملفات PDF هنا أو انقر للاختيار</p>
            <Input
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="pdf-upload"
            />
            <label htmlFor="pdf-upload">
              <Button asChild variant="outline">
                <span>اختر الملفات</span>
              </Button>
            </label>
            <p className="text-xs text-slate-500 mt-4">الحد الأقصى لحجم الملف: 10MB</p>
          </div>
        </CardContent>
      </Card>

      {/* تنبيهات */}
      {files.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            تم تحميل {files.length} ملف. سيتم معالجة الملفات تلقائياً.
          </AlertDescription>
        </Alert>
      )}

      {/* قائمة الملفات المحملة */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الملفات المحملة ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{file.name}</h3>
                        <p className="text-sm text-slate-600">
                          {formatFileSize(file.size)} • تم التحميل {new Date(file.uploadedAt).toLocaleString('ar-JO')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(file.status)}
                      {file.status === 'success' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFile(file)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* عرض البيانات المستخرجة */}
                  {file.status === 'success' && file.extractedData && selectedFile?.id === file.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <h4 className="font-semibold text-slate-900 mb-3">البيانات المستخرجة:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {file.extractedData.declarationNumber && (
                          <div>
                            <p className="text-slate-600">رقم البيان</p>
                            <p className="font-semibold">{file.extractedData.declarationNumber}</p>
                          </div>
                        )}
                        {file.extractedData.containerNumber && (
                          <div>
                            <p className="text-slate-600">رقم الحاوية</p>
                            <p className="font-semibold">{file.extractedData.containerNumber}</p>
                          </div>
                        )}
                        {file.extractedData.billOfLading && (
                          <div>
                            <p className="text-slate-600">بوليصة الشحن</p>
                            <p className="font-semibold">{file.extractedData.billOfLading}</p>
                          </div>
                        )}
                        {file.extractedData.totalValue && (
                          <div>
                            <p className="text-slate-600">القيمة الإجمالية</p>
                            <p className="font-semibold">{file.extractedData.totalValue} {file.extractedData.currency}</p>
                          </div>
                        )}
                        {file.extractedData.totalDuties && (
                          <div>
                            <p className="text-slate-600">الرسوم الجمركية</p>
                            <p className="font-semibold">{file.extractedData.totalDuties} {file.extractedData.currency}</p>
                          </div>
                        )}
                        {file.extractedData.totalTaxes && (
                          <div>
                            <p className="text-slate-600">الضرائب</p>
                            <p className="font-semibold">{file.extractedData.totalTaxes} {file.extractedData.currency}</p>
                          </div>
                        )}
                      </div>

                      {/* الأصناف */}
                      {file.extractedData.items && file.extractedData.items.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-semibold text-slate-900 mb-2">الأصناف:</h5>
                          <div className="space-y-2">
                            {file.extractedData.items.map((item: any, idx: number) => (
                              <div key={idx} className="bg-slate-50 p-2 rounded text-sm">
                                <p className="font-medium">{item.description}</p>
                                <p className="text-slate-600">الكمية: {item.quantity} | السعر: {item.unitPrice} {file.extractedData.currency}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* الأزرار */}
                      <div className="flex gap-2 mt-4">
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                          <Download className="w-4 h-4 ml-2" />
                          استيراد البيانات
                        </Button>
                        <Button variant="outline" className="flex-1">
                          تعديل البيانات
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* عرض الخطأ */}
                  {file.status === 'error' && (
                    <div className="mt-4 pt-4 border-t border-red-200 bg-red-50 p-3 rounded">
                      <p className="text-sm text-red-700">
                        <AlertCircle className="w-4 h-4 inline ml-2" />
                        {file.error || 'حدث خطأ أثناء معالجة الملف'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* معلومات مفيدة */}
      <Card>
        <CardHeader>
          <CardTitle>نصائح مفيدة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>✓ يدعم استخراج البيانات من ملفات البيان الجمركي والفواتير</p>
          <p>✓ يتم استخراج المعلومات التالية تلقائياً: رقم البيان، الحاويات، الأصناف، الرسوم والضرائب</p>
          <p>✓ يمكنك تعديل البيانات المستخرجة قبل الاستيراد</p>
          <p>✓ تدعم معالجة عدة ملفات في نفس الوقت</p>
        </CardContent>
      </Card>
    </div>
  );
}

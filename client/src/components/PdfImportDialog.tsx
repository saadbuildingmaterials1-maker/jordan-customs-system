'use client';

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export interface PdfImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDataImported: (data: any) => void;
}

export function PdfImportDialog({
  open,
  onOpenChange,
  onDataImported,
}: PdfImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = trpc.pdfImport.importDeclaration.useMutation();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError('يجب اختيار ملف PDF');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('حجم الملف يجب أن يكون أقل من 10 MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('يجب اختيار ملف PDF');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // في التطبيق الحقيقي، يتم رفع الملف إلى الخادم أولاً
      // ثم استدعاء API الاستيراد
      // هنا نستخدم مسار الملف المحلي كمثال
      
      const result = await importMutation.mutateAsync({
        filePath: file.name,
      });

      if (result.success) {
        setSuccess(true);
        setImportResult(result);
        onDataImported(result.data);
      } else {
        setError('فشل استيراد الملف. تحقق من صيغة الملف.');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'حدث خطأ أثناء استيراد الملف'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            استيراد بيان جمركي من PDF
          </DialogTitle>
          <DialogDescription>
            قم برفع ملف البيان الجمركي لاستخراج البيانات تلقائياً
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* منطقة رفع الملف */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              {file ? file.name : 'اضغط لاختيار ملف PDF'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              أو اسحب الملف هنا (الحد الأقصى 10 MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* رسائل الخطأ */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* رسالة النجاح */}
          {success && importResult && (
            <div className="space-y-2">
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  تم استيراد الملف بنجاح!
                </AlertDescription>
              </Alert>

              {/* عرض درجة الثقة */}
              <div className="bg-blue-50 p-3 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">درجة الثقة:</span>
                  <span className="text-sm font-bold text-blue-600">
                    {importResult.confidence}%
                  </span>
                </div>
                <Progress value={importResult.confidence} className="h-2" />
              </div>

              {/* عرض الأخطاء في التحقق */}
              {importResult.validationErrors.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium mb-1">تحذيرات:</p>
                    <ul className="text-sm space-y-1">
                      {importResult.validationErrors.map(
                        (error: string, index: number) => (
                          <li key={index}>• {error}</li>
                        )
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* عرض ملخص البيانات المستخرجة */}
              {importResult.data && (
                <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
                  <p>
                    <strong>رقم البيان:</strong>{' '}
                    {importResult.data.declarationNumber || 'غير متوفر'}
                  </p>
                  <p>
                    <strong>المستورد:</strong>{' '}
                    {importResult.data.importerName || 'غير متوفر'}
                  </p>
                  <p>
                    <strong>عدد الأصناف:</strong>{' '}
                    {importResult.data.items?.length || 0}
                  </p>
                  <p>
                    <strong>إجمالي القيمة:</strong>{' '}
                    {importResult.data.totalValue || 'غير متوفر'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* مؤشر التحميل */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">
                جاري استيراد الملف...
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            إلغاء
          </Button>
          {success ? (
            <Button
              onClick={handleClose}
              className="bg-green-600 hover:bg-green-700"
            >
              تم
            </Button>
          ) : (
            <Button
              onClick={handleImport}
              disabled={!file || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'جاري الاستيراد...' : 'استيراد'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

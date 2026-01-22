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

import { Upload, AlertCircle, FileText } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { ImportSuccessAlert, type ImportSuccessData } from './ImportSuccessAlert';

// نوع البيانات المستخرجة من PDF
interface ExtractedData {
  declarationNumber?: string;
  date?: string;
  importerName?: string;
  items?: any[];
  totalValue?: number;
  currency?: string;
  customsDuty?: number;
  tax?: number;
  totalAmount?: number;
}

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
  const [successData, setSuccessData] = useState<ImportSuccessData | null>(null);
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
      const result = await importMutation.mutateAsync({
        filePath: file.name,
      });

      if (result.success) {
        setSuccess(true);
        setImportResult(result);

        // تحضير بيانات رسالة النجاح
        const extractedData = result.data as ExtractedData;
        const successInfo: ImportSuccessData = {
          declarationNumber: extractedData?.declarationNumber || 'غير متوفر',
          date: extractedData?.date || new Date().toLocaleDateString('ar-JO'),
          importerName: extractedData?.importerName || 'غير متوفر',
          itemsCount: extractedData?.items?.length || 0,
          totalValue: extractedData?.totalValue || 0,
          currency: extractedData?.currency || 'JOD',
          confidence: result.confidence || 85,
          customsDuty: extractedData?.customsDuty,
          tax: extractedData?.tax,
          totalAmount: extractedData?.totalAmount,
        };
        setSuccessData(successInfo);
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
    setSuccessData(null);
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
      <DialogContent className={success ? 'max-w-2xl' : 'max-w-md'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {success ? 'تم الاستيراد بنجاح' : 'استيراد بيان جمركي من PDF'}
          </DialogTitle>
          <DialogDescription>
            {success
              ? 'تم استخراج جميع البيانات بنجاح'
              : 'قم برفع ملف البيان الجمركي لاستخراج البيانات تلقائياً'}
          </DialogDescription>
        </DialogHeader>

        <div className={success ? 'space-y-4 max-h-[60vh] overflow-y-auto' : 'space-y-4'}>
          {/* منطقة رفع الملف - تظهر فقط قبل الاستيراد */}
          {!success && (
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
          )}

          {/* رسائل الخطأ */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* رسالة النجاح مع التفاصيل الشاملة */}
          {success && successData && (
            <ImportSuccessAlert data={successData} />
          )}

          {/* مؤشر التحميل */}
          {isLoading && !success && (
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
            {success ? 'إغلاق' : 'إلغاء'}
          </Button>
          {success ? (
            <Button
              onClick={handleClose}
              className="bg-green-600 hover:bg-green-700"
            >
              ✓ تم
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

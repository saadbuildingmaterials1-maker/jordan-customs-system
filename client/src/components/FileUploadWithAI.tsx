import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  FileText,
  Loader,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2,
  Eye,
} from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface ExtractedData {
  declarationNumber?: string;
  exportCountry?: string;
  billOfLadingNumber?: string;
  grossWeight?: number;
  netWeight?: number;
  numberOfPackages?: number;
  packageType?: string;
  fobValue?: number;
  freightCost?: number;
  insuranceCost?: number;
  customsDuty?: number;
  salesTax?: number;
  containerNumber?: string;
  containerType?: string;
  shippingCompany?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  items?: Array<{
    description: string;
    hsCode?: string;
    quantity?: number;
    unit?: string;
    unitPrice?: number;
    totalPrice?: number;
    origin?: string;
  }>;
  confidence?: number;
  errors?: string[];
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  extractedData?: ExtractedData;
  isProcessing: boolean;
  error?: string;
}

/**
 * مكون رفع الملفات مع قراءة ذكية باستخدام AI
 * يدعم PDF و Excel ويستخرج البيانات تلقائياً
 */
interface FileUploadWithAIProps {
  onDataExtracted?: () => void;
}

export function FileUploadWithAI({ onDataExtracted }: FileUploadWithAIProps = {}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

  // استدعاء tRPC لاستخراج البيانات
  const extractDataMutation = trpc.ai.extractFromFile.useMutation({
    onSuccess: (data: any, variables: any) => {
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === variables.fileId
            ? {
              ...f,
              extractedData: data,
              isProcessing: false,
            }
            : f
        )
      );
    },
    onError: (error: any, variables: any) => {
      setUploadedFiles(prev =>
        prev.map(f =>
          f.id === variables.fileId
            ? {
              ...f,
              error: error.message,
              isProcessing: false,
            }
            : f
        )
      );
    },
  });

  // معالج السحب والإفلات
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  // معالج اختيار الملفات
  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      // التحقق من نوع الملف
      const validTypes = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(file.type)) {
        alert('نوع الملف غير مدعوم. يرجى رفع ملف PDF أو Excel');
        return;
      }

      // التحقق من حجم الملف (أقصى 10 MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('حجم الملف كبير جداً. الحد الأقصى 10 MB');
        return;
      }

      const fileId = `file-${Date.now()}-${Math.random()}`;
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        isProcessing: true,
      };

      setUploadedFiles(prev => [newFile, ...prev]);

      // قراءة الملف وإرساله للمعالجة
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
          // إرسال الملف للمعالجة
          extractDataMutation.mutate({
            fileId,
            fileName: file.name,
            fileContent: content,
            fileType: file.type as 'application/pdf' | 'application/vnd.ms-excel' | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
        } catch (error) {
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === fileId
                ? {
                  ...f,
                  error: 'فشل في معالجة الملف',
                  isProcessing: false,
                }
                : f
            )
          );
        }
      };

      reader.readAsText(file);
    });
  };

  // حذف ملف
  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
    }
  };

  // تحميل البيانات المستخرجة
  const handleDownloadData = (file: UploadedFile) => {
    if (!file.extractedData) return;

    const dataStr = JSON.stringify(file.extractedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.split('.')[0]}-extracted.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // الحصول على نص حالة الملف
  const getStatusLabel = (file: UploadedFile): string => {
    if (file.isProcessing) return 'جاري المعالجة...';
    if (file.error) return 'خطأ في المعالجة';
    if (file.extractedData) return 'تم الاستخراج بنجاح';
    return 'في الانتظار';
  };

  // الحصول على لون الحالة
  const getStatusColor = (file: UploadedFile): string => {
    if (file.isProcessing) return 'bg-blue-100 text-blue-700';
    if (file.error) return 'bg-red-100 text-red-700';
    if (file.extractedData) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* منطقة الرفع */}
      <Card className="border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors">
        <CardHeader>
          <CardTitle className="text-lg">📤 رفع الملفات</CardTitle>
          <CardDescription>رفع ملفات PDF أو Excel لاستخراج البيانات تلقائياً</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`p-8 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <Upload className={`w-12 h-12 ${dragActive ? 'text-blue-500' : 'text-slate-400'}`} />
              <div className="text-center">
                <p className="font-semibold text-slate-900">
                  {dragActive ? 'أفلت الملفات هنا' : 'اسحب الملفات هنا أو انقر للاختيار'}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  ملفات مدعومة: PDF, Excel | الحد الأقصى: 10 MB
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.xls,.xlsx,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* قائمة الملفات المرفوعة */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">📁 الملفات المرفوعة</CardTitle>
            <CardDescription>{uploadedFiles.length} ملفات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    selectedFile?.id === file.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText className="w-5 h-5 text-slate-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{file.name}</p>
                        <p className="text-xs text-slate-600 mt-1">
                          {(file.size / 1024).toFixed(2)} KB • {new Date(file.uploadedAt).toLocaleTimeString('ar-JO')}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(file)} px-3 py-1 flex-shrink-0`}>
                      {file.isProcessing && <Loader className="w-3 h-3 animate-spin mr-1" />}
                      {file.error && <AlertCircle className="w-3 h-3 mr-1" />}
                      {file.extractedData && <CheckCircle className="w-3 h-3 mr-1" />}
                      {getStatusLabel(file)}
                    </Badge>
                  </div>

                  {/* شريط التقدم */}
                  {file.isProcessing && (
                    <div className="mt-3">
                      <Progress value={65} className="h-2" />
                    </div>
                  )}

                  {/* الأخطاء */}
                  {file.error && (
                    <Alert variant="destructive" className="mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{file.error}</AlertDescription>
                    </Alert>
                  )}

                  {/* أزرار الإجراءات */}
                  {file.extractedData && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedFile(file)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        عرض البيانات
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadData(file)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        تحميل
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteFile(file.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* عرض البيانات المستخرجة */}
      {selectedFile?.extractedData && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="text-lg">🔍 البيانات المستخرجة</CardTitle>
            <CardDescription>
              ملف: {selectedFile.name}
              {selectedFile.extractedData.confidence && (
                <span className="ml-2">
                  • درجة الثقة: {selectedFile.extractedData.confidence}%
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* البيانات الأساسية */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedFile.extractedData.declarationNumber && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-slate-600 font-semibold">رقم البيان</p>
                    <p className="font-mono text-sm mt-1">{selectedFile.extractedData.declarationNumber}</p>
                  </div>
                )}
                {selectedFile.extractedData.billOfLadingNumber && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-slate-600 font-semibold">بوليصة الشحن</p>
                    <p className="font-mono text-sm mt-1">{selectedFile.extractedData.billOfLadingNumber}</p>
                  </div>
                )}
                {selectedFile.extractedData.exportCountry && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-slate-600 font-semibold">دولة التصدير</p>
                    <p className="font-mono text-sm mt-1">{selectedFile.extractedData.exportCountry}</p>
                  </div>
                )}
                {selectedFile.extractedData.containerNumber && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-slate-600 font-semibold">رقم الحاوية</p>
                    <p className="font-mono text-sm mt-1">{selectedFile.extractedData.containerNumber}</p>
                  </div>
                )}
                {selectedFile.extractedData.grossWeight && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-slate-600 font-semibold">الوزن الإجمالي</p>
                    <p className="font-mono text-sm mt-1">{selectedFile.extractedData.grossWeight} كجم</p>
                  </div>
                )}
                {selectedFile.extractedData.fobValue && (
                  <div className="bg-white p-3 rounded-lg">
                    <p className="text-xs text-slate-600 font-semibold">قيمة FOB</p>
                    <p className="font-mono text-sm mt-1">${selectedFile.extractedData.fobValue}</p>
                  </div>
                )}
              </div>

              {/* الأصناف */}
              {selectedFile.extractedData.items && selectedFile.extractedData.items.length > 0 && (
                <div className="bg-white p-4 rounded-lg">
                  <p className="font-semibold text-slate-900 mb-3">📦 الأصناف</p>
                  <div className="space-y-2">
                    {selectedFile.extractedData.items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900">{item.description}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          {item.hsCode && <p className="text-slate-600">كود HS: {item.hsCode}</p>}
                          {item.quantity && <p className="text-slate-600">الكمية: {item.quantity} {item.unit || 'وحدة'}</p>}
                          {item.unitPrice && <p className="text-slate-600">السعر: ${item.unitPrice}</p>}
                          {item.totalPrice && <p className="text-slate-600">الإجمالي: ${item.totalPrice}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* الأخطاء */}
              {selectedFile.extractedData.errors && selectedFile.extractedData.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-semibold mb-2">تحذيرات:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedFile.extractedData.errors.map((error, idx) => (
                        <li key={idx} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

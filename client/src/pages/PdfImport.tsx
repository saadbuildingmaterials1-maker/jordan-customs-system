/**
 * PDF Import Page
 * صفحة استيراد ملفات PDF والمستندات
 * 
 * @module ./client/src/pages/PdfImport
 */
import { Button } from "@/components/ui/button";
import { Upload, File, CheckCircle, AlertCircle, Trash2, Download } from "lucide-react";
import { useState } from "react";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadDate: string;
  status: "success" | "processing" | "error";
  pages: number;
}

export default function PdfImport() {
  const [files, setFiles] = useState<UploadedFile[]>([
    {
      id: "1",
      name: "Invoice-2024-001.pdf",
      size: 2.5,
      uploadDate: "2026-02-07 14:30",
      status: "success",
      pages: 3
    },
    {
      id: "2",
      name: "Customs-Declaration.pdf",
      size: 1.8,
      uploadDate: "2026-02-07 13:15",
      status: "success",
      pages: 2
    }
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (uploadedFiles) {
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const newFile: UploadedFile = {
          id: Date.now().toString() + i,
          name: file.name,
          size: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
          uploadDate: new Date().toLocaleString("ar-JO"),
          status: "processing",
          pages: Math.floor(Math.random() * 5) + 1
        };
        setFiles([newFile, ...files]);
        
        // Simulate processing
        setTimeout(() => {
          setFiles(prev => 
            prev.map(f => f.id === newFile.id ? { ...f, status: "success" as const } : f)
          );
        }, 2000);
      }
    }
  };

  const deleteFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
              استيراد المستندات
            </h1>
            <p className="text-blue-200/60 mt-2">استيراد ملفات PDF والمستندات وتحليلها تلقائياً</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Upload Area */}
        <div className="mb-8">
          <label className="block">
            <div className="border-2 border-dashed border-blue-500/50 rounded-2xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all">
              <Upload className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">اسحب الملفات هنا أو انقر للاختيار</h3>
              <p className="text-blue-200/60 mb-4">ادعم PDF و صور المستندات</p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/50">
                <Upload className="w-4 h-4 mr-2" />
                اختر الملفات
              </Button>
            </div>
          </label>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 rounded-2xl p-6">
            <p className="text-green-200/60 text-sm">الملفات المعالجة</p>
            <p className="text-3xl font-bold text-green-300 mt-2">
              {files.filter(f => f.status === "success").length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-2xl p-6">
            <p className="text-yellow-200/60 text-sm">قيد المعالجة</p>
            <p className="text-3xl font-bold text-yellow-300 mt-2">
              {files.filter(f => f.status === "processing").length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-2xl p-6">
            <p className="text-blue-200/60 text-sm">إجمالي الصفحات</p>
            <p className="text-3xl font-bold text-blue-300 mt-2">
              {files.reduce((sum, f) => sum + f.pages, 0)}
            </p>
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">الملفات المرفوعة</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">اسم الملف</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">الحجم</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">الصفحات</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">تاريخ الرفع</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-red-400" />
                        <span className="text-white font-medium">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70">{file.size} MB</td>
                    <td className="px-6 py-4 text-sm text-white/70">{file.pages}</td>
                    <td className="px-6 py-4 text-sm text-white/70">{file.uploadDate}</td>
                    <td className="px-6 py-4">
                      {file.status === "success" && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300">
                          <CheckCircle className="w-4 h-4" />
                          معالج
                        </span>
                      )}
                      {file.status === "processing" && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">
                          <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
                          قيد المعالجة
                        </span>
                      )}
                      {file.status === "error" && (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300">
                          <AlertCircle className="w-4 h-4" />
                          خطأ
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="تحميل">
                          <Download className="w-4 h-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold text-white mb-6">المميزات</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-blue-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">رفع سريع</h4>
              <p className="text-white/60 text-sm">رفع ملفات متعددة في نفس الوقت</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <File className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">معالجة ذكية</h4>
              <p className="text-white/60 text-sm">استخراج البيانات تلقائياً من المستندات</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">تحقق آمن</h4>
              <p className="text-white/60 text-sm">فحص شامل للملفات والبيانات</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

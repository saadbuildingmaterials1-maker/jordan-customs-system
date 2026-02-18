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
  Trash2,
  Share2,
  Lock,
  Unlock,
  Eye,
  Search,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  HardDrive,
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadDate: string;
  lastModified: string;
  status: 'active' | 'archived' | 'deleted';
  isPublic: boolean;
  category: string;
  tags: string[];
  version: number;
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'نموذج الفاتورة القياسي',
      type: 'pdf',
      size: '2.5 MB',
      uploadedBy: 'أحمد محمد',
      uploadDate: '2026-01-15',
      lastModified: '2026-02-10',
      status: 'active',
      isPublic: true,
      category: 'نماذج',
      tags: ['فاتورة', 'قياسي'],
      version: 3,
    },
    {
      id: '2',
      name: 'دليل المستخدم الشامل',
      type: 'pdf',
      size: '5.8 MB',
      uploadedBy: 'فاطمة علي',
      uploadDate: '2026-02-01',
      lastModified: '2026-02-15',
      status: 'active',
      isPublic: false,
      category: 'توثيق',
      tags: ['دليل', 'مستخدم'],
      version: 2,
    },
    {
      id: '3',
      name: 'سياسة الخصوصية',
      type: 'docx',
      size: '1.2 MB',
      uploadedBy: 'محمود حسن',
      uploadDate: '2025-12-20',
      lastModified: '2026-02-18',
      status: 'active',
      isPublic: true,
      category: 'سياسات',
      tags: ['خصوصية', 'قانوني'],
      version: 1,
    },
    {
      id: '4',
      name: 'تقرير الأداء الربع سنوي',
      type: 'xlsx',
      size: '3.1 MB',
      uploadedBy: 'سارة يوسف',
      uploadDate: '2026-02-10',
      lastModified: '2026-02-18',
      status: 'active',
      isPublic: false,
      category: 'تقارير',
      tags: ['أداء', 'ربع سنوي'],
      version: 1,
    },
  ]);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(documents.map(d => d.category)));
  const totalSize = documents.reduce((sum, d) => sum + parseFloat(d.size), 0);

  const handleTogglePublic = (docId: string) => {
    setDocuments(documents.map(d =>
      d.id === docId ? { ...d, isPublic: !d.isPublic } : d
    ));
  };

  const handleDeleteDocument = (docId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستند؟')) {
      setDocuments(documents.filter(d => d.id !== docId));
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'xlsx':
        return '📊';
      case 'txt':
        return '📋';
      default:
        return '📎';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              إدارة المستندات والملفات
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              تنظيم وإدارة المستندات والملفات المهمة
            </p>
          </div>
          <Button className="gap-2">
            <Upload className="w-4 h-4" />
            رفع ملف جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي المستندات</p>
                <p className="text-3xl font-bold text-blue-600">{documents.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <HardDrive className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">المساحة المستخدمة</p>
                <p className="text-3xl font-bold text-green-600">
                  {totalSize.toFixed(1)} MB
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Unlock className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">عامة</p>
                <p className="text-3xl font-bold text-purple-600">
                  {documents.filter(d => d.isPublic).length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Lock className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                <p className="text-gray-600 text-sm">خاصة</p>
                <p className="text-3xl font-bold text-orange-600">
                  {documents.filter(d => !d.isPublic).length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة المستندات */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  المستندات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* البحث والفلترة */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="ابحث عن مستند..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  >
                    <option value="all">جميع الفئات</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* قائمة المستندات */}
                <div className="space-y-3">
                  {filteredDocuments.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocument(doc)}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-2xl">{getFileIcon(doc.type)}</span>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {doc.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {doc.size} • {doc.type.toUpperCase()}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{doc.category}</Badge>
                              {doc.isPublic ? (
                                <Badge variant="default">عام</Badge>
                              ) : (
                                <Badge variant="outline">خاص</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePublic(doc.id);
                            }}
                          >
                            {doc.isPublic ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDocument(doc.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* تفاصيل المستند */}
          <div>
            {selectedDocument ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{getFileIcon(selectedDocument.type)}</span>
                    {selectedDocument.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">النوع</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedDocument.type.toUpperCase()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">الحجم</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedDocument.size}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      رفع بواسطة
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedDocument.uploadedBy}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      تاريخ الرفع
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedDocument.uploadDate}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      آخر تعديل
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedDocument.lastModified}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">الإصدار</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      v{selectedDocument.version}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">الوسوم</p>
                    <div className="flex gap-1 flex-wrap">
                      {selectedDocument.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full gap-2 mt-4">
                    <Download className="w-4 h-4" />
                    تحميل المستند
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    اختر مستنداً لعرض التفاصيل
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: يمكنك تنظيم المستندات حسب الفئات والوسوم. استخدم خيار "عام/خاص" للتحكم في من يمكنه الوصول إلى المستند.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

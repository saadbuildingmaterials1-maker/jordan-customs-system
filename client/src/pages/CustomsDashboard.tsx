import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Package,
  DollarSign,
  Activity,
  BarChart3,
  Download,
  Upload,
  Send,
  Lock,
  Unlock,
  Scale,
  Zap,
} from 'lucide-react';

interface CustomsDeclaration {
  id: string;
  declarationNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'under-review' | 'cleared';
  shipmentValue: number;
  taxAmount: number;
  dutyAmount: number;
  totalAmount: number;
  submittedDate: string;
  approvalDate?: string;
  documents: number;
}

interface TaxCalculation {
  id: string;
  shipmentId: string;
  baseValue: number;
  taxRate: number;
  taxAmount: number;
  dutyRate: number;
  dutyAmount: number;
  totalTax: number;
  currency: string;
}

interface CustomsDocument {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedDate: string;
  verifiedDate?: string;
  size: string;
}

export default function CustomsDashboard() {
  const [declarations] = useState<CustomsDeclaration[]>([
    {
      id: '1',
      declarationNumber: 'CUSTOMS-2026-001250',
      status: 'approved',
      shipmentValue: 5000,
      taxAmount: 500,
      dutyAmount: 250,
      totalAmount: 5750,
      submittedDate: '2026-02-15',
      approvalDate: '2026-02-17',
      documents: 4,
    },
    {
      id: '2',
      declarationNumber: 'CUSTOMS-2026-001251',
      status: 'under-review',
      shipmentValue: 8500,
      taxAmount: 850,
      dutyAmount: 425,
      totalAmount: 9775,
      submittedDate: '2026-02-16',
      documents: 5,
    },
    {
      id: '3',
      declarationNumber: 'CUSTOMS-2026-001252',
      status: 'cleared',
      shipmentValue: 3200,
      taxAmount: 320,
      dutyAmount: 160,
      totalAmount: 3680,
      submittedDate: '2026-02-14',
      approvalDate: '2026-02-18',
      documents: 3,
    },
  ]);

  const [taxCalculations] = useState<TaxCalculation[]>([
    {
      id: '1',
      shipmentId: 'SHIP-001',
      baseValue: 5000,
      taxRate: 10,
      taxAmount: 500,
      dutyRate: 5,
      dutyAmount: 250,
      totalTax: 750,
      currency: 'JOD',
    },
    {
      id: '2',
      shipmentId: 'SHIP-002',
      baseValue: 8500,
      taxRate: 10,
      taxAmount: 850,
      dutyRate: 5,
      dutyAmount: 425,
      totalTax: 1275,
      currency: 'JOD',
    },
  ]);

  const [documents] = useState<CustomsDocument[]>([
    {
      id: '1',
      name: 'فاتورة تجارية',
      type: 'Invoice',
      status: 'verified',
      uploadedDate: '2026-02-15',
      verifiedDate: '2026-02-15',
      size: '2.5 MB',
    },
    {
      id: '2',
      name: 'شهادة المنشأ',
      type: 'Certificate of Origin',
      status: 'verified',
      uploadedDate: '2026-02-15',
      verifiedDate: '2026-02-16',
      size: '1.8 MB',
    },
    {
      id: '3',
      name: 'بوليصة الشحن',
      type: 'Bill of Lading',
      status: 'pending',
      uploadedDate: '2026-02-16',
      size: '3.2 MB',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'cleared':
      case 'verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'under-review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'cleared':
      case 'verified':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      case 'under-review':
      case 'pending':
        return <Activity className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      approved: 'موافق عليه',
      pending: 'قيد الانتظار',
      rejected: 'مرفوض',
      'under-review': 'قيد المراجعة',
      cleared: 'تم الإفراج',
      verified: 'تم التحقق',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Scale className="w-10 h-10 text-purple-600" />
              لوحة تحكم الجمارك المتقدمة
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة التصاريح الجمركية والمستندات والضرائب
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            تصريح جديد
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                التصاريح المعلقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">12</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">قيد المراجعة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                الضرائب المستحقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">15,250 JOD</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">هذا الشهر</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                الرسوم الجمركية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">7,625 JOD</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">هذا الشهر</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                معدل الموافقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">94.5%</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">هذا الشهر</p>
            </CardContent>
          </Card>
        </div>

        {/* التصاريح الجمركية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              التصاريح الجمركية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">رقم التصريح</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الحالة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">قيمة الشحنة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الضريبة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الرسم الجمركي</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الإجمالي</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">المستندات</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {declarations.map(decl => (
                    <tr key={decl.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-mono text-xs">{decl.declarationNumber}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(decl.status)}>
                          {getStatusIcon(decl.status)}
                          <span className="ml-1">{getStatusLabel(decl.status)}</span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{decl.shipmentValue.toLocaleString()} JOD</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{decl.taxAmount.toLocaleString()} JOD</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{decl.dutyAmount.toLocaleString()} JOD</td>
                      <td className="py-3 px-4 text-green-600 font-semibold">{decl.totalAmount.toLocaleString()} JOD</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{decl.documents}</td>
                      <td className="py-3 px-4">
                        <Button size="sm" variant="outline" className="gap-1">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* حسابات الضرائب */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              حسابات الضرائب والرسوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">معرف الشحنة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">القيمة الأساسية</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">معدل الضريبة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الضريبة</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">معدل الرسم</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الرسم</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {taxCalculations.map(calc => (
                    <tr key={calc.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-4 text-gray-900 dark:text-white font-mono text-xs">{calc.shipmentId}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{calc.baseValue.toLocaleString()} {calc.currency}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{calc.taxRate}%</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{calc.taxAmount.toLocaleString()} {calc.currency}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{calc.dutyRate}%</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{calc.dutyAmount.toLocaleString()} {calc.currency}</td>
                      <td className="py-3 px-4 text-green-600 font-semibold">{calc.totalTax.toLocaleString()} {calc.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* المستندات الجمركية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              المستندات الجمركية المطلوبة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map(doc => (
                <div key={doc.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{doc.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{doc.type} • {doc.size}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(doc.status)}>
                      {getStatusIcon(doc.status)}
                      <span className="ml-1">{getStatusLabel(doc.status)}</span>
                    </Badge>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800">
          <Scale className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <AlertDescription className="text-purple-700 dark:text-purple-300">
            ⚖️ نصيحة: تأكد من تقديم جميع المستندات الجمركية المطلوبة. احرص على دقة البيانات لتسريع عملية الموافقة. استخدم حاسبة الضرائب للتحقق من الحسابات قبل التقديم.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

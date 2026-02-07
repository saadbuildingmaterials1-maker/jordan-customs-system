/**
 * CustomsDeclarationComplete Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/CustomsDeclarationComplete
 */
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  Save,
  BarChart3,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

/**
 * صفحة البيان الجمركي المتكاملة والمحسنة
 * Comprehensive Customs Declaration Page
 */

interface DeclarationItem {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  hsCode: string;
  weight: number;
  category: string;
}

interface CustomsDeclaration {
  id: string;
  number: string;
  date: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'cleared';
  importerName: string;
  exporterName: string;
  exportCountry: string;
  items: DeclarationItem[];
  fobValue: number;
  freightCost: number;
  insuranceCost: number;
  customsDuty: number;
  salesTax: number;
  additionalFees: number;
  totalCost: number;
  notes: string;
}

export default function CustomsDeclarationComplete() {
  const [activeTab, setActiveTab] = useState('overview');
  const [declaration, setDeclaration] = useState<CustomsDeclaration>({
    id: '1',
    number: 'CD-2026-001',
    date: new Date().toISOString().split('T')[0],
    status: 'draft',
    importerName: '',
    exporterName: '',
    exportCountry: '',
    items: [],
    fobValue: 0,
    freightCost: 0,
    insuranceCost: 0,
    customsDuty: 0,
    salesTax: 0,
    additionalFees: 0,
    totalCost: 0,
    notes: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingItem, setEditingItem] = useState<DeclarationItem | null>(null);

  // حساب الإحصائيات
  const statistics = useMemo(() => {
    const totalItems = declaration.items.length;
    const totalQuantity = declaration.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalWeight = declaration.items.reduce((sum, item) => sum + item.weight, 0);
    const totalValue = declaration.items.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      totalItems,
      totalQuantity,
      totalWeight,
      totalValue,
    };
  }, [declaration.items]);

  // حساب التكاليف
  const costBreakdown = useMemo(() => {
    const fobValue = declaration.fobValue || statistics.totalValue;
    const freightCost = declaration.freightCost;
    const insuranceCost = declaration.insuranceCost;
    const cif = fobValue + freightCost + insuranceCost;
    const customsDuty = cif * 0.15; // 15% duty rate
    const subtotal = cif + customsDuty;
    const salesTax = subtotal * 0.16; // 16% sales tax
    const additionalFees = declaration.additionalFees;
    const totalCost = subtotal + salesTax + additionalFees;

    return {
      fobValue: Math.round(fobValue * 100) / 100,
      freightCost: Math.round(freightCost * 100) / 100,
      insuranceCost: Math.round(insuranceCost * 100) / 100,
      cif: Math.round(cif * 100) / 100,
      customsDuty: Math.round(customsDuty * 100) / 100,
      subtotal: Math.round(subtotal * 100) / 100,
      salesTax: Math.round(salesTax * 100) / 100,
      additionalFees: Math.round(additionalFees * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
    };
  }, [declaration, statistics.totalValue]);

  // إضافة صنف جديد
  const handleAddItem = () => {
    const newItem: DeclarationItem = {
      id: Date.now(),
      name: '',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
      hsCode: '',
      weight: 0,
      category: '',
    };
    setDeclaration({
      ...declaration,
      items: [...declaration.items, newItem],
    });
    toast.success('تم إضافة صنف جديد');
  };

  // تحديث صنف
  const handleUpdateItem = (updatedItem: DeclarationItem) => {
    setDeclaration({
      ...declaration,
      items: declaration.items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    });
    setEditingItem(null);
    toast.success('تم تحديث الصنف بنجاح');
  };

  // حذف صنف
  const handleDeleteItem = (itemId: number) => {
    setDeclaration({
      ...declaration,
      items: declaration.items.filter((item) => item.id !== itemId),
    });
    toast.success('تم حذف الصنف بنجاح');
  };

  // حفظ البيان
  const handleSave = () => {
    toast.success('تم حفظ البيان الجمركي بنجاح');
  };

  // تصدير PDF
  const handleExportPDF = () => {
    toast.success('جاري تصدير البيان إلى PDF...');
  };

  // تصدير Excel
  const handleExportExcel = () => {
    toast.success('جاري تصدير البيان إلى Excel...');
  };

  // استيراد من PDF
  const handleImportPDF = () => {
    toast.success('جاري استيراد البيان من PDF...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cleared':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="w-4 h-4" />;
      case 'submitted':
        return <FileText className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      case 'cleared':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* رأس الصفحة */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">البيان الجمركي</h1>
            <p className="text-gray-600 mt-1">رقم البيان: {declaration.number}</p>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(declaration.status)}>
              {getStatusIcon(declaration.status)}
              <span className="mr-2">{declaration.status}</span>
            </Badge>
          </div>
        </div>

        {/* التبويبات الرئيسية */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="items">الأصناف</TabsTrigger>
            <TabsTrigger value="costs">التكاليف</TabsTrigger>
            <TabsTrigger value="analysis">التحليلات</TabsTrigger>
            <TabsTrigger value="export">التصدير</TabsTrigger>
          </TabsList>

          {/* تبويب النظرة العامة */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">عدد الأصناف</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.totalItems}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الكمية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.totalQuantity}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الوزن</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.totalWeight} كغ</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">القيمة الإجمالية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{costBreakdown.totalCost} د.ا</div>
                </CardContent>
              </Card>
            </div>

            {/* معلومات البيان الأساسية */}
            <Card>
              <CardHeader>
                <CardTitle>معلومات البيان الأساسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>اسم المستورد</Label>
                    <Input
                      value={declaration.importerName}
                      onChange={(e) =>
                        setDeclaration({
                          ...declaration,
                          importerName: e.target.value,
                        })
                      }
                      placeholder="أدخل اسم المستورد"
                    />
                  </div>
                  <div>
                    <Label>اسم المصدر</Label>
                    <Input
                      value={declaration.exporterName}
                      onChange={(e) =>
                        setDeclaration({
                          ...declaration,
                          exporterName: e.target.value,
                        })
                      }
                      placeholder="أدخل اسم المصدر"
                    />
                  </div>
                  <div>
                    <Label>دولة التصدير</Label>
                    <Input
                      value={declaration.exportCountry}
                      onChange={(e) =>
                        setDeclaration({
                          ...declaration,
                          exportCountry: e.target.value,
                        })
                      }
                      placeholder="أدخل دولة التصدير"
                    />
                  </div>
                  <div>
                    <Label>التاريخ</Label>
                    <Input
                      type="date"
                      value={declaration.date}
                      onChange={(e) =>
                        setDeclaration({
                          ...declaration,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>الملاحظات</Label>
                  <Textarea
                    value={declaration.notes}
                    onChange={(e) =>
                      setDeclaration({
                        ...declaration,
                        notes: e.target.value,
                      })
                    }
                    placeholder="أضف ملاحظات إضافية"
                    rows={3}
                  />
                </div>

                <Button onClick={handleSave} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  حفظ البيان
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الأصناف */}
          <TabsContent value="items" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">قائمة الأصناف</h3>
              <Button onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-2" />
                إضافة صنف
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4 font-medium">الاسم</th>
                    <th className="text-right py-3 px-4 font-medium">الكمية</th>
                    <th className="text-right py-3 px-4 font-medium">السعر</th>
                    <th className="text-right py-3 px-4 font-medium">الإجمالي</th>
                    <th className="text-right py-3 px-4 font-medium">الرمز الجمركي</th>
                    <th className="text-right py-3 px-4 font-medium">الوزن</th>
                    <th className="text-right py-3 px-4 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {declaration.items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4">{item.quantity}</td>
                      <td className="py-3 px-4">{item.unitPrice}</td>
                      <td className="py-3 px-4">{item.totalPrice}</td>
                      <td className="py-3 px-4">{item.hsCode}</td>
                      <td className="py-3 px-4">{item.weight} كغ</td>
                      <td className="py-3 px-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingItem(item)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* تبويب التكاليف */}
          <TabsContent value="costs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>هيكل التكاليف الشامل</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span>القيمة FOB</span>
                    <span className="font-semibold">{costBreakdown.fobValue} د.ا</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span>أجور الشحن</span>
                    <span className="font-semibold">{costBreakdown.freightCost} د.ا</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span>التأمين</span>
                    <span className="font-semibold">{costBreakdown.insuranceCost} د.ا</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b bg-gray-50 p-2">
                    <span>القيمة CIF</span>
                    <span className="font-semibold">{costBreakdown.cif} د.ا</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span>الرسوم الجمركية (15%)</span>
                    <span className="font-semibold">{costBreakdown.customsDuty} د.ا</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b bg-gray-50 p-2">
                    <span>المجموع الفرعي</span>
                    <span className="font-semibold">{costBreakdown.subtotal} د.ا</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span>ضريبة المبيعات (16%)</span>
                    <span className="font-semibold">{costBreakdown.salesTax} د.ا</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span>رسوم إضافية</span>
                    <span className="font-semibold">{costBreakdown.additionalFees} د.ا</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 text-lg font-bold bg-blue-50 p-3 rounded">
                    <span>التكلفة الإجمالية</span>
                    <span>{costBreakdown.totalCost} د.ا</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب التحليلات */}
          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>التحليلات والإحصائيات</CardTitle>
                <CardDescription>ملخص شامل لبيانات البيان الجمركي</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">معلومات الشحنة</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>عدد الأصناف:</span>
                        <span>{statistics.totalItems}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>إجمالي الكمية:</span>
                        <span>{statistics.totalQuantity} وحدة</span>
                      </div>
                      <div className="flex justify-between">
                        <span>إجمالي الوزن:</span>
                        <span>{statistics.totalWeight} كغ</span>
                      </div>
                      <div className="flex justify-between">
                        <span>متوسط وزن الصنف:</span>
                        <span>
                          {statistics.totalItems > 0
                            ? (statistics.totalWeight / statistics.totalItems).toFixed(2)
                            : 0}{' '}
                          كغ
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">تحليل التكاليف</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>نسبة الشحن:</span>
                        <span>
                          {costBreakdown.fobValue > 0
                            ? ((costBreakdown.freightCost / costBreakdown.fobValue) * 100).toFixed(2)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>نسبة التأمين:</span>
                        <span>
                          {costBreakdown.fobValue > 0
                            ? ((costBreakdown.insuranceCost / costBreakdown.fobValue) * 100).toFixed(2)
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>نسبة الرسوم الجمركية:</span>
                        <span>15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>نسبة ضريبة المبيعات:</span>
                        <span>16%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب التصدير */}
          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>تصدير البيان</CardTitle>
                  <CardDescription>تصدير البيان بصيغ مختلفة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={handleExportPDF} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    تصدير إلى PDF
                  </Button>
                  <Button onClick={handleExportExcel} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    تصدير إلى Excel
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>استيراد البيان</CardTitle>
                  <CardDescription>استيراد بيان من ملف</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={handleImportPDF} className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    استيراد من PDF
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

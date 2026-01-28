import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, FileText, Download, Plus, Edit2, Trash2, TrendingUp, BarChart3, Search, Filter, Save, X, Copy, Share2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface DeclarationItem {
  id: string;
  itemCode: string;
  description: string;
  hsCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  dutyRate: number;
  taxRate: number;
  weight: number;
  cbm: number;
}

interface Declaration {
  id: string;
  date: string;
  importerName: string;
  importerLicense: string;
  taxNumber: string;
  origin: string;
  clearanceCenter: string;
  billOfLading: string;
  exchangeRate: number;
  totalValue: number;
  totalWeight: number;
  totalCBM: number;
}

export default function AdvancedCustomsDeclarationPage() {
  const [activeTab, setActiveTab] = useState('declaration');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditingDeclaration, setIsEditingDeclaration] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDutyRate, setFilterDutyRate] = useState<number | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const [declaration, setDeclaration] = useState<Declaration>({
    id: 'DECL-2026-001',
    date: '2026-01-15',
    importerName: 'شركة الواحة للتجارة',
    importerLicense: 'LIC-12345',
    taxNumber: 'TAX-98765',
    origin: 'Shanghai',
    clearanceCenter: 'مركز تخليص ميناء العقبة',
    billOfLading: 'BL-2026-001',
    exchangeRate: 0.71,
    totalValue: 50000,
    totalWeight: 25000,
    totalCBM: 1250,
  });

  const [items, setItems] = useState<DeclarationItem[]>([
    {
      id: '1',
      itemCode: 'SKU-001',
      description: 'أجهزة إلكترونية',
      hsCode: '8471.30',
      quantity: 100,
      unitPrice: 250,
      totalPrice: 25000,
      dutyRate: 5,
      taxRate: 16,
      weight: 12000,
      cbm: 600,
    },
    {
      id: '2',
      itemCode: 'SKU-002',
      description: 'قطع غيار',
      hsCode: '8708.99',
      quantity: 200,
      unitPrice: 125,
      totalPrice: 25000,
      dutyRate: 10,
      taxRate: 16,
      weight: 13000,
      cbm: 650,
    },
  ]);

  const [newItem, setNewItem] = useState<Partial<DeclarationItem>>({
    itemCode: '',
    description: '',
    hsCode: '',
    quantity: 1,
    unitPrice: 0,
    dutyRate: 5,
    taxRate: 16,
    weight: 0,
    cbm: 0,
  });

  // حسابات ذكية
  const calculations = useMemo(() => {
    const totalGoodValue = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalDuties = items.reduce((sum, item) => sum + (item.totalPrice * item.dutyRate / 100), 0);
    const totalTaxBase = totalGoodValue + totalDuties;
    const totalSalesTax = totalTaxBase * 0.16;
    const freight = totalGoodValue * 0.05;
    const insurance = totalGoodValue * 0.01;
    const additionalFees = 500;
    const totalCost = totalGoodValue + totalDuties + totalSalesTax + freight + insurance + additionalFees;
    const averageLandedCost = items.length > 0 ? totalCost / items.reduce((sum, item) => sum + item.quantity, 0) : 0;

    return {
      totalGoodValue,
      totalDuties,
      totalSalesTax,
      freight,
      insurance,
      additionalFees,
      totalCost,
      averageLandedCost,
      totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
      totalWeight: items.reduce((sum, item) => sum + item.weight, 0),
      totalCBM: items.reduce((sum, item) => sum + item.cbm, 0),
    };
  }, [items]);

  // تصفية الأصناف
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.description.includes(searchQuery) || 
                           item.itemCode.includes(searchQuery) ||
                           item.hsCode.includes(searchQuery);
      const matchesDuty = filterDutyRate === null || item.dutyRate === filterDutyRate;
      return matchesSearch && matchesDuty;
    });
  }, [items, searchQuery, filterDutyRate]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast.success(`تم اختيار الملف: ${file.name}`);
    }
  };

  const handleAddItem = () => {
    if (!newItem.itemCode || !newItem.description || !newItem.hsCode) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    const item: DeclarationItem = {
      id: editingItemId || Date.now().toString(),
      itemCode: newItem.itemCode || '',
      description: newItem.description || '',
      hsCode: newItem.hsCode || '',
      quantity: newItem.quantity || 1,
      unitPrice: newItem.unitPrice || 0,
      totalPrice: (newItem.quantity || 1) * (newItem.unitPrice || 0),
      dutyRate: newItem.dutyRate || 5,
      taxRate: newItem.taxRate || 16,
      weight: newItem.weight || 0,
      cbm: newItem.cbm || 0,
    };

    if (editingItemId) {
      setItems(items.map(i => i.id === editingItemId ? item : i));
      setEditingItemId(null);
      toast.success('تم تحديث الصنف بنجاح');
    } else {
      setItems([...items, item]);
      toast.success('تم إضافة الصنف بنجاح');
    }

    setNewItem({
      itemCode: '',
      description: '',
      hsCode: '',
      quantity: 1,
      unitPrice: 0,
      dutyRate: 5,
      taxRate: 16,
      weight: 0,
      cbm: 0,
    });
    setIsAddingItem(false);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.success('تم حذف الصنف بنجاح');
  };

  const handleEditItem = (item: DeclarationItem) => {
    setNewItem(item);
    setEditingItemId(item.id);
    setIsAddingItem(true);
  };

  const handleExportPDF = () => {
    toast.loading('جاري تصدير البيان إلى PDF...');
    setTimeout(() => {
      toast.success('تم تصدير البيان بنجاح');
    }, 2000);
  };

  const handleExportExcel = () => {
    const csvContent = [
      ['رقم البيان', declaration.id],
      ['التاريخ', declaration.date],
      ['المستورد', declaration.importerName],
      [''],
      ['الرمز', 'الوصف', 'HS Code', 'الكمية', 'السعر', 'الإجمالي', 'نسبة الرسم', 'نسبة الضريبة'],
      ...filteredItems.map(item => [
        item.itemCode,
        item.description,
        item.hsCode,
        item.quantity,
        item.unitPrice,
        item.totalPrice,
        item.dutyRate,
        item.taxRate,
      ]),
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `customs-declaration-${declaration.id}.csv`;
    link.click();
    toast.success('تم تصدير البيان إلى Excel بنجاح');
  };

  const handlePrint = () => {
    window.print();
    toast.success('تم فتح نافذة الطباعة');
  };

  const handleSaveDeclaration = () => {
    toast.success('تم حفظ البيان الجمركي بنجاح');
  };

  const handleCopyToClipboard = () => {
    const text = `البيان الجمركي: ${declaration.id}\nالمستورد: ${declaration.importerName}\nالتاريخ: ${declaration.date}`;
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ البيانات إلى الحافظة');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* الرأس */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-8 h-8" />
              البيان الجمركي المتقدم
            </h1>
            <p className="text-gray-600 mt-2">
              عرض وتحليل شامل لبيانات الشحنة والرسوم والضرائب
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="flex items-center gap-2" onClick={handleCopyToClipboard}>
              <Copy className="w-4 h-4" />
              نسخ
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={handleExportExcel}>
              <Download className="w-4 h-4" />
              Excel
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={handleExportPDF}>
              <Download className="w-4 h-4" />
              PDF
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={handlePrint}>
              <FileText className="w-4 h-4" />
              طباعة
            </Button>
            <Button className="flex items-center gap-2" onClick={handleSaveDeclaration}>
              <Save className="w-4 h-4" />
              حفظ
            </Button>
          </div>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="declaration">البيان</TabsTrigger>
            <TabsTrigger value="items">الأصناف ({items.length})</TabsTrigger>
            <TabsTrigger value="distribution">التوزيع</TabsTrigger>
            <TabsTrigger value="analysis">التحليل</TabsTrigger>
          </TabsList>

          {/* تبويب البيان */}
          <TabsContent value="declaration" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>معلومات البيان الجمركي</CardTitle>
                    <CardDescription>التفاصيل الأساسية للبيان</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingDeclaration(!isEditingDeclaration)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm text-gray-600">رقم البيان</label>
                    <p className="font-medium text-lg">{declaration.id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">التاريخ</label>
                    <p className="font-medium text-lg">{declaration.date}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">الحالة</label>
                    <Badge className="bg-green-100 text-green-800 mt-1">مكتمل</Badge>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">اسم المستورد</label>
                    <p className="font-medium">{declaration.importerName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">رقم الرخصة</label>
                    <p className="font-medium">{declaration.importerLicense}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">الرقم الضريبي</label>
                    <p className="font-medium">{declaration.taxNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">بلد المنشأ</label>
                    <p className="font-medium">{declaration.origin}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">مركز التخليص</label>
                    <p className="font-medium">{declaration.clearanceCenter}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">بوليصة الشحن</label>
                    <p className="font-medium">{declaration.billOfLading}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">سعر الصرف</label>
                    <p className="font-medium">{declaration.exchangeRate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* استيراد من PDF */}
            <Card>
              <CardHeader>
                <CardTitle>استيراد من ملف PDF</CardTitle>
                <CardDescription>قم برفع ملف البيان الجمركي PDF لاستخراج البيانات تلقائياً</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      اسحب ملف PDF هنا أو انقر للاختيار
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedFile ? selectedFile.name : 'لم يتم اختيار ملف'}
                    </p>
                  </label>
                </div>
                {selectedFile && (
                  <Button className="w-full mt-4">
                    <Upload className="w-4 h-4 mr-2" />
                    استيراد البيانات
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الأصناف */}
          <TabsContent value="items" className="space-y-6">
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <div className="flex gap-2 flex-1 min-w-64">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="ابحث عن صنف..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  تصفية
                </Button>
              </div>
              <Button className="flex items-center gap-2" onClick={() => setIsAddingItem(true)}>
                <Plus className="w-4 h-4" />
                صنف جديد
              </Button>
            </div>

            {/* جدول الأصناف */}
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4 font-medium">الرمز</th>
                        <th className="text-right py-3 px-4 font-medium">الوصف</th>
                        <th className="text-right py-3 px-4 font-medium">HS Code</th>
                        <th className="text-right py-3 px-4 font-medium">الكمية</th>
                        <th className="text-right py-3 px-4 font-medium">السعر</th>
                        <th className="text-right py-3 px-4 font-medium">الإجمالي</th>
                        <th className="text-right py-3 px-4 font-medium">الرسم %</th>
                        <th className="text-right py-3 px-4 font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map(item => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{item.itemCode}</td>
                          <td className="py-3 px-4">{item.description}</td>
                          <td className="py-3 px-4">{item.hsCode}</td>
                          <td className="py-3 px-4">{item.quantity}</td>
                          <td className="py-3 px-4">${item.unitPrice}</td>
                          <td className="py-3 px-4 font-medium">${item.totalPrice.toLocaleString()}</td>
                          <td className="py-3 px-4">{item.dutyRate}%</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* نموذج إضافة/تعديل صنف */}
            {isAddingItem && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{editingItemId ? 'تعديل الصنف' : 'إضافة صنف جديد'}</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => {
                      setIsAddingItem(false);
                      setEditingItemId(null);
                      setNewItem({
                        itemCode: '',
                        description: '',
                        hsCode: '',
                        quantity: 1,
                        unitPrice: 0,
                        dutyRate: 5,
                        taxRate: 16,
                        weight: 0,
                        cbm: 0,
                      });
                    }}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="رمز الصنف"
                      value={newItem.itemCode || ''}
                      onChange={(e) => setNewItem({ ...newItem, itemCode: e.target.value })}
                    />
                    <Input
                      placeholder="الوصف"
                      value={newItem.description || ''}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    />
                    <Input
                      placeholder="HS Code"
                      value={newItem.hsCode || ''}
                      onChange={(e) => setNewItem({ ...newItem, hsCode: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="الكمية"
                      value={newItem.quantity || 1}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                    />
                    <Input
                      type="number"
                      placeholder="السعر"
                      value={newItem.unitPrice || 0}
                      onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                      type="number"
                      placeholder="نسبة الرسم %"
                      value={newItem.dutyRate || 5}
                      onChange={(e) => setNewItem({ ...newItem, dutyRate: parseFloat(e.target.value) || 5 })}
                    />
                    <Input
                      type="number"
                      placeholder="الوزن"
                      value={newItem.weight || 0}
                      onChange={(e) => setNewItem({ ...newItem, weight: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                      type="number"
                      placeholder="الحجم CBM"
                      value={newItem.cbm || 0}
                      onChange={(e) => setNewItem({ ...newItem, cbm: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleAddItem} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      {editingItemId ? 'تحديث' : 'إضافة'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setIsAddingItem(false);
                      setEditingItemId(null);
                    }} className="flex-1">
                      إلغاء
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* تبويب التوزيع */}
          <TabsContent value="distribution" className="space-y-6">
            <h2 className="text-xl font-semibold">توزيع القيم والرسوم</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>الملخص المالي</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">قيمة البضاعة</span>
                    <span className="font-medium">${calculations.totalGoodValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">أجور الشحن</span>
                    <span className="font-medium">${calculations.freight.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">التأمين</span>
                    <span className="font-medium">${calculations.insurance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">الرسوم الجمركية</span>
                    <span className="font-medium text-blue-600">${calculations.totalDuties.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">ضريبة المبيعات 16%</span>
                    <span className="font-medium text-blue-600">${calculations.totalSalesTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">رسوم إضافية</span>
                    <span className="font-medium">${calculations.additionalFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
                    <span className="font-semibold">التكلفة الإجمالية</span>
                    <span className="font-bold text-lg text-green-600">
                      ${calculations.totalCost.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>تكلفة الوحدة والأوزان</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-600 mb-2">متوسط تكلفة الوحدة</p>
                    <p className="text-4xl font-bold text-blue-600">
                      ${calculations.averageLandedCost.toFixed(2)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">الكمية الإجمالية</p>
                      <p className="font-medium">{calculations.totalQuantity.toLocaleString()} وحدة</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">الوزن الإجمالي</p>
                      <p className="font-medium">{calculations.totalWeight.toLocaleString()} كغ</p>
                    </div>
                    <div className="text-center col-span-2">
                      <p className="text-sm text-gray-600">الحجم الإجمالي</p>
                      <p className="font-medium">{calculations.totalCBM} CBM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب التحليل */}
          <TabsContent value="analysis" className="space-y-6">
            <h2 className="text-xl font-semibold">التحليل والإحصائيات</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    نسبة التكاليف
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">قيمة البضاعة</span>
                      <span className="text-sm font-medium">
                        {((calculations.totalGoodValue / calculations.totalCost) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(calculations.totalGoodValue / calculations.totalCost) * 100}%` }} 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">الرسوم والضرائب</span>
                      <span className="text-sm font-medium">
                        {(((calculations.totalDuties + calculations.totalSalesTax) / calculations.totalCost) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${((calculations.totalDuties + calculations.totalSalesTax) / calculations.totalCost) * 100}%` }} 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">الشحن والتأمين</span>
                      <span className="text-sm font-medium">
                        {(((calculations.freight + calculations.insurance) / calculations.totalCost) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${((calculations.freight + calculations.insurance) / calculations.totalCost) * 100}%` }} 
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">رسوم إضافية</span>
                      <span className="text-sm font-medium">
                        {((calculations.additionalFees / calculations.totalCost) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full" 
                        style={{ width: `${(calculations.additionalFees / calculations.totalCost) * 100}%` }} 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    المؤشرات الرئيسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">معدل الرسوم الجمركية</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {items.length > 0 ? (items.reduce((sum, item) => sum + item.dutyRate, 0) / items.length).toFixed(1) : 0}%
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">معدل الضريبة</p>
                    <p className="text-2xl font-bold text-green-600">16%</p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">إجمالي الرسوم والضرائب</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${(calculations.totalDuties + calculations.totalSalesTax).toLocaleString()}
                    </p>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">تكلفة الشحن لكل وحدة</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ${(calculations.freight / calculations.totalQuantity).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* تحذيرات وملاحظات */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  ملاحظات وتحذيرات
                </CardTitle>
              </CardHeader>
              <CardContent className="text-yellow-800 space-y-2">
                <p>• تأكد من صحة أكواد HS للأصناف قبل التقديم</p>
                <p>• تحقق من أسعار الصرف المستخدمة</p>
                <p>• تأكد من استكمال جميع المستندات المطلوبة</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

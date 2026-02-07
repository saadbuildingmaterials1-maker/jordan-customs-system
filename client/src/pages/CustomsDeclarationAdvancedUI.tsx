/**
 * CustomsDeclarationAdvancedUI Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/CustomsDeclarationAdvancedUI
 */
import { useState, useMemo, useCallback } from 'react';
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
  TrendingUp,
  DollarSign,
  Package,
  Globe,
  Calendar,
  User,
  Search,
  Filter,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Share2,
  Archive,
  Printer,
  Settings,
} from 'lucide-react';

/**
 * صفحة البيان الجمركي المتقدمة بتصميم محسّن
 * Advanced Customs Declaration Page with Enhanced UI
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
  description: string;
  origin: string;
  customsDutyRate: number;
  customsDuty: number;
  vat: number;
}

interface CustomsDeclaration {
  id: string;
  number: string;
  date: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'cleared';
  importerName: string;
  importerTaxId: string;
  exporterName: string;
  exporterTaxId: string;
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
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvalDate?: string;
}

const statusConfig = {
  draft: { label: 'مسودة', color: 'bg-gray-100 text-gray-800', icon: '📝' },
  submitted: { label: 'مرسلة', color: 'bg-blue-100 text-blue-800', icon: '📤' },
  approved: { label: 'موافق عليها', color: 'bg-green-100 text-green-800', icon: '✅' },
  rejected: { label: 'مرفوضة', color: 'bg-red-100 text-red-800', icon: '❌' },
  cleared: { label: 'مخلصة', color: 'bg-purple-100 text-purple-800', icon: '🎉' },
};

export default function CustomsDeclarationAdvancedUI() {
  const [activeTab, setActiveTab] = useState('overview');
  const [declaration, setDeclaration] = useState<CustomsDeclaration>({
    id: '1',
    number: `CD-${new Date().getFullYear()}-001`,
    date: new Date().toISOString().split('T')[0],
    status: 'draft',
    importerName: '',
    importerTaxId: '',
    exporterName: '',
    exporterTaxId: '',
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
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingItem, setEditingItem] = useState<DeclarationItem | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // حساب الإحصائيات المتقدمة
  const statistics = useMemo(() => {
    const totalItems = declaration.items.length;
    const totalQuantity = declaration.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalWeight = declaration.items.reduce((sum, item) => sum + item.weight, 0);
    const totalValue = declaration.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalDuty = declaration.items.reduce((sum, item) => sum + item.customsDuty, 0);
    const totalVAT = declaration.items.reduce((sum, item) => sum + item.vat, 0);
    const averagePrice = totalValue / totalItems || 0;
    const averageWeight = totalWeight / totalItems || 0;

    return {
      totalItems,
      totalQuantity,
      totalWeight,
      totalValue,
      totalDuty,
      totalVAT,
      averagePrice,
      averageWeight,
    };
  }, [declaration.items]);

  // حساب التكاليف الإجمالية
  const calculateTotals = useCallback(() => {
    const fobValue = declaration.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const customsDuty = declaration.items.reduce((sum, item) => sum + item.customsDuty, 0);
    const vat = declaration.items.reduce((sum, item) => sum + item.vat, 0);
    const subtotal = fobValue + declaration.freightCost + declaration.insuranceCost;
    const totalCost = subtotal + customsDuty + vat + declaration.additionalFees;

    return {
      fobValue,
      customsDuty,
      vat,
      subtotal,
      totalCost,
    };
  }, [declaration]);

  const totals = calculateTotals();

  // إضافة عنصر جديد
  const handleAddItem = useCallback(() => {
    const newItem: DeclarationItem = {
      id: Date.now(),
      name: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      hsCode: '',
      weight: 0,
      category: '',
      description: '',
      origin: '',
      customsDutyRate: 0.05,
      customsDuty: 0,
      vat: 0,
    };
    setDeclaration((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    toast.success('تم إضافة عنصر جديد');
  }, []);

  // تحديث عنصر
  const handleUpdateItem = useCallback((updatedItem: DeclarationItem) => {
    setDeclaration((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    }));
    setEditingItem(null);
    toast.success('تم تحديث العنصر');
  }, []);

  // حذف عنصر
  const handleDeleteItem = useCallback((itemId: number) => {
    setDeclaration((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
    toast.success('تم حذف العنصر');
  }, []);

  // حفظ البيان
  const handleSaveDeclaration = useCallback(() => {
    if (!declaration.importerName || !declaration.exporterName) {
      toast.error('يرجى ملء البيانات المطلوبة');
      return;
    }

    setDeclaration((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
    }));
    toast.success('تم حفظ البيان الجمركي');
  }, [declaration.importerName, declaration.exporterName]);

  // إرسال البيان
  const handleSubmitDeclaration = useCallback(() => {
    if (declaration.items.length === 0) {
      toast.error('يرجى إضافة عناصر للبيان');
      return;
    }

    setDeclaration((prev) => ({
      ...prev,
      status: 'submitted',
      updatedAt: new Date().toISOString(),
    }));
    toast.success('تم إرسال البيان الجمركي');
  }, [declaration.items.length]);

  // تصدير البيان
  const handleExportDeclaration = useCallback(() => {
    const dataStr = JSON.stringify(declaration, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `declaration-${declaration.number}.json`;
    link.click();
    toast.success('تم تصدير البيان');
  }, [declaration]);

  // طباعة البيان
  const handlePrintDeclaration = useCallback(() => {
    window.print();
    toast.success('تم فتح نافذة الطباعة');
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">البيان الجمركي</h1>
            <p className="text-gray-600 mt-1">إدارة وتتبع البيانات الجمركية</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrintDeclaration}>
              <Printer className="w-4 h-4 mr-2" />
              طباعة
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportDeclaration}>
              <Download className="w-4 h-4 mr-2" />
              تصدير
            </Button>
            <Button size="sm" onClick={handleSaveDeclaration}>
              <Save className="w-4 h-4 mr-2" />
              حفظ
            </Button>
          </div>
        </div>

        {/* شريط المعلومات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">رقم البيان</p>
                  <p className="text-2xl font-bold">{declaration.number}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الحالة</p>
                  <Badge className={statusConfig[declaration.status].color}>
                    {statusConfig[declaration.status].icon} {statusConfig[declaration.status].label}
                  </Badge>
                </div>
                <Clock className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي القيمة</p>
                  <p className="text-2xl font-bold">${totals.totalCost.toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">عدد العناصر</p>
                  <p className="text-2xl font-bold">{statistics.totalItems}</p>
                </div>
                <Package className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات الرئيسية */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="items">العناصر</TabsTrigger>
            <TabsTrigger value="costs">التكاليف</TabsTrigger>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* تبويب النظرة العامة */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* بيانات المستورد */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    بيانات المستورد
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>اسم المستورد</Label>
                    <Input
                      value={declaration.importerName}
                      onChange={(e) =>
                        setDeclaration((prev) => ({
                          ...prev,
                          importerName: e.target.value,
                        }))
                      }
                      placeholder="أدخل اسم المستورد"
                    />
                  </div>
                  <div>
                    <Label>رقم التعريف الضريبي</Label>
                    <Input
                      value={declaration.importerTaxId}
                      onChange={(e) =>
                        setDeclaration((prev) => ({
                          ...prev,
                          importerTaxId: e.target.value,
                        }))
                      }
                      placeholder="أدخل رقم التعريف الضريبي"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* بيانات المصدر */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    بيانات المصدر
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>اسم المصدر</Label>
                    <Input
                      value={declaration.exporterName}
                      onChange={(e) =>
                        setDeclaration((prev) => ({
                          ...prev,
                          exporterName: e.target.value,
                        }))
                      }
                      placeholder="أدخل اسم المصدر"
                    />
                  </div>
                  <div>
                    <Label>دولة المصدر</Label>
                    <Input
                      value={declaration.exportCountry}
                      onChange={(e) =>
                        setDeclaration((prev) => ({
                          ...prev,
                          exportCountry: e.target.value,
                        }))
                      }
                      placeholder="أدخل دولة المصدر"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* الملاحظات */}
            <Card>
              <CardHeader>
                <CardTitle>ملاحظات إضافية</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={declaration.notes}
                  onChange={(e) =>
                    setDeclaration((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="أدخل أي ملاحظات إضافية"
                  rows={4}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب العناصر */}
          <TabsContent value="items" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="بحث عن عنصر..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
              <Button onClick={handleAddItem}>
                <Plus className="w-4 h-4 mr-2" />
                إضافة عنصر
              </Button>
            </div>

            {/* جدول العناصر */}
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-2">الاسم</th>
                        <th className="text-right py-2">الكمية</th>
                        <th className="text-right py-2">السعر الوحدة</th>
                        <th className="text-right py-2">الإجمالي</th>
                        <th className="text-right py-2">HS Code</th>
                        <th className="text-right py-2">الوزن</th>
                        <th className="text-right py-2">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {declaration.items.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{item.name}</td>
                          <td className="py-3">{item.quantity}</td>
                          <td className="py-3">${item.unitPrice.toFixed(2)}</td>
                          <td className="py-3">${item.totalPrice.toFixed(2)}</td>
                          <td className="py-3">{item.hsCode}</td>
                          <td className="py-3">{item.weight} kg</td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingItem(item)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
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

            {/* ملخص الإحصائيات */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">إجمالي الكمية</p>
                  <p className="text-2xl font-bold">{statistics.totalQuantity}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">إجمالي الوزن</p>
                  <p className="text-2xl font-bold">{statistics.totalWeight} kg</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">إجمالي القيمة</p>
                  <p className="text-2xl font-bold">${statistics.totalValue.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-gray-600">متوسط السعر</p>
                  <p className="text-2xl font-bold">${statistics.averagePrice.toFixed(2)}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب التكاليف */}
          <TabsContent value="costs" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل التكاليف</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>قيمة FOB</span>
                    <span className="font-bold">${totals.fobValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تكاليف الشحن</span>
                    <Input
                      type="number"
                      value={declaration.freightCost}
                      onChange={(e) =>
                        setDeclaration((prev) => ({
                          ...prev,
                          freightCost: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-32"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span>تكاليف التأمين</span>
                    <Input
                      type="number"
                      value={declaration.insuranceCost}
                      onChange={(e) =>
                        setDeclaration((prev) => ({
                          ...prev,
                          insuranceCost: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-32"
                    />
                  </div>
                  <div className="border-t pt-4 flex justify-between">
                    <span className="font-bold">الإجمالي الفرعي</span>
                    <span className="font-bold">${totals.subtotal.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الرسوم والضرائب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>الرسوم الجمركية</span>
                    <span className="font-bold">${totals.customsDuty.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ضريبة القيمة المضافة</span>
                    <span className="font-bold">${totals.vat.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>رسوم إضافية</span>
                    <Input
                      type="number"
                      value={declaration.additionalFees}
                      onChange={(e) =>
                        setDeclaration((prev) => ({
                          ...prev,
                          additionalFees: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-32"
                    />
                  </div>
                  <div className="border-t pt-4 flex justify-between">
                    <span className="font-bold text-lg">الإجمالي النهائي</span>
                    <span className="font-bold text-lg text-green-600">
                      ${totals.totalCost.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* رسم بياني للتكاليف */}
            <Card>
              <CardHeader>
                <CardTitle>توزيع التكاليف</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>قيمة FOB</span>
                      <span>
                        {((totals.fobValue / totals.totalCost) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(totals.fobValue / totals.totalCost) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>الرسوم الجمركية</span>
                      <span>
                        {((totals.customsDuty / totals.totalCost) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${(totals.customsDuty / totals.totalCost) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>ضريبة القيمة المضافة</span>
                      <span>
                        {((totals.vat / totals.totalCost) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(totals.vat / totals.totalCost) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب المستندات */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>المستندات المرفقة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">اسحب المستندات هنا أو انقر للتحميل</p>
                  <Button variant="outline">اختر ملفات</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الإعدادات */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات البيان</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>تاريخ البيان</Label>
                  <Input
                    type="date"
                    value={declaration.date}
                    onChange={(e) =>
                      setDeclaration((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>الحالة</Label>
                  <select
                    value={declaration.status}
                    onChange={(e) =>
                      setDeclaration((prev) => ({
                        ...prev,
                        status: e.target.value as any,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="draft">مسودة</option>
                    <option value="submitted">مرسلة</option>
                    <option value="approved">موافق عليها</option>
                    <option value="rejected">مرفوضة</option>
                    <option value="cleared">مخلصة</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* أزرار الإجراءات */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleExportDeclaration}>
            <Download className="w-4 h-4 mr-2" />
            تصدير
          </Button>
          <Button variant="outline" onClick={handlePrintDeclaration}>
            <Printer className="w-4 h-4 mr-2" />
            طباعة
          </Button>
          <Button onClick={handleSaveDeclaration}>
            <Save className="w-4 h-4 mr-2" />
            حفظ
          </Button>
          {declaration.status === 'draft' && (
            <Button onClick={handleSubmitDeclaration} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              إرسال
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

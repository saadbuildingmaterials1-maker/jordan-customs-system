/**
 * SupplierInvoice Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/SupplierInvoice
 */
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Trash2, Edit2, Download, Printer, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface InvoiceItem {
  id: string;
  hsCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: 'USD' | 'EGP' | 'JOD';
  piecesPerBox: number;
  boxCount: number;
  totalPrice: number;
}

interface SupplierInvoiceData {
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  items: InvoiceItem[];
  notes: string;
}

const CURRENCY_SYMBOLS = {
  USD: '$',
  EGP: '£',
  JOD: 'د.ا'
};

export default function SupplierInvoice() {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditingId, setIsEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCurrency, setFilterCurrency] = useState<'ALL' | 'USD' | 'EGP' | 'JOD'>('ALL');
  const [sortBy, setSortBy] = useState<'hsCode' | 'price' | 'quantity'>('hsCode');
  
  const [supplierData, setSupplierData] = useState({
    supplierId: '',
    supplierName: '',
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [formData, setFormData] = useState({
    hsCode: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    currency: 'USD' as 'USD' | 'EGP' | 'JOD',
    piecesPerBox: 1,
    boxCount: 1,
  });

  // Local storage for supplier invoices
  const saveInvoiceLocally = (data: SupplierInvoiceData) => {
    try {
      const invoices = JSON.parse(localStorage.getItem('supplierInvoices') || '[]');
      invoices.push({
        ...data,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('supplierInvoices', JSON.stringify(invoices));
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleAddItem = () => {
    if (!formData.hsCode || !formData.description) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    const newItem: InvoiceItem = {
      id: isEditingId || Date.now().toString(),
      hsCode: formData.hsCode,
      description: formData.description,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      currency: formData.currency,
      piecesPerBox: formData.piecesPerBox,
      boxCount: formData.boxCount,
      totalPrice: formData.quantity * formData.unitPrice,
    };

    if (isEditingId) {
      setItems(items.map(item => item.id === isEditingId ? newItem : item));
      setIsEditingId(null);
      toast.success("تم تحديث الصنف بنجاح");
    } else {
      setItems([...items, newItem]);
      toast.success("تم إضافة الصنف بنجاح");
    }

    setFormData({
      hsCode: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      currency: 'USD',
      piecesPerBox: 1,
      boxCount: 1,
    });
    setIsDialogOpen(false);
  };

  const handleEditItem = (item: InvoiceItem) => {
    setFormData({
      hsCode: item.hsCode,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      currency: item.currency,
      piecesPerBox: item.piecesPerBox,
      boxCount: item.boxCount,
    });
    setIsEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.success("تم حذف الصنف بنجاح");
  };

  // Calculations
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalBoxes = items.reduce((sum, item) => sum + item.boxCount, 0);
  const totalPieces = items.reduce((sum, item) => sum + (item.piecesPerBox * item.boxCount), 0);

  // Filtering and sorting
  const filteredItems = useMemo(() => {
    let filtered = items.filter(item => {
      const matchesSearch = item.hsCode.includes(searchTerm) || 
                           item.description.includes(searchTerm);
      const matchesCurrency = filterCurrency === 'ALL' || item.currency === filterCurrency;
      return matchesSearch && matchesCurrency;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'hsCode':
          return a.hsCode.localeCompare(b.hsCode);
        case 'price':
          return b.totalPrice - a.totalPrice;
        case 'quantity':
          return b.quantity - a.quantity;
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, searchTerm, filterCurrency, sortBy]);

  // Currency-wise totals
  const currencyTotals = useMemo(() => {
    const totals = { USD: 0, EGP: 0, JOD: 0 };
    items.forEach(item => {
      totals[item.currency] += item.totalPrice;
    });
    return totals;
  }, [items]);

  const handleSaveInvoice = async () => {
    if (!supplierData.supplierId || !supplierData.supplierName) {
      toast.error("الرجاء إدخال بيانات المورد");
      return;
    }

    if (items.length === 0) {
      toast.error("الرجاء إضافة أصناف للفاتورة");
      return;
    }

    const success = saveInvoiceLocally({
      supplierId: supplierData.supplierId,
      supplierName: supplierData.supplierName,
      invoiceNumber: supplierData.invoiceNumber,
      invoiceDate: supplierData.invoiceDate,
      items: items,
      notes: supplierData.notes,
    });

    if (success) {
      toast.success("تم حفظ فاتورة المورد بنجاح");
      // Reset form
      setItems([]);
      setSupplierData({
        supplierId: '',
        supplierName: '',
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } else {
      toast.error("فشل حفظ الفاتورة");
    }
  };

  const handleExportPDF = () => {
    // PDF export logic
    toast.loading("جاري تصدير الفاتورة إلى PDF");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // Excel export logic
    const csvContent = [
      ['رمز HS', 'الوصف', 'الكمية', 'سعر الوحدة', 'العملة', 'القطع/الكرتون', 'عدد الكراتين', 'الإجمالي'],
      ...items.map(item => [
        item.hsCode,
        item.description,
        item.quantity,
        item.unitPrice,
        item.currency,
        item.piecesPerBox,
        item.boxCount,
        item.totalPrice,
      ]),
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supplier-invoice-${supplierData.invoiceNumber}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("تم تصدير الفاتورة إلى Excel");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">فاتورة المورد</h1>
          <p className="text-slate-600">إدارة فواتير الموردين وتتبع الأصناف والأسعار والكميات</p>
        </div>

        {/* بيانات المورد */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>بيانات المورد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">معرف المورد *</label>
                <Input
                  value={supplierData.supplierId}
                  onChange={(e) => setSupplierData({ ...supplierData, supplierId: e.target.value })}
                  placeholder="مثال: SUP001"
                />
              </div>
              <div>
                <label className="text-sm font-medium">اسم المورد *</label>
                <Input
                  value={supplierData.supplierName}
                  onChange={(e) => setSupplierData({ ...supplierData, supplierName: e.target.value })}
                  placeholder="اسم الشركة"
                />
              </div>
              <div>
                <label className="text-sm font-medium">رقم الفاتورة</label>
                <Input
                  value={supplierData.invoiceNumber}
                  onChange={(e) => setSupplierData({ ...supplierData, invoiceNumber: e.target.value })}
                  placeholder="رقم الفاتورة"
                />
              </div>
              <div>
                <label className="text-sm font-medium">تاريخ الفاتورة</label>
                <Input
                  type="date"
                  value={supplierData.invoiceDate}
                  onChange={(e) => setSupplierData({ ...supplierData, invoiceDate: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="text-sm font-medium">ملاحظات</label>
              <textarea
                value={supplierData.notes}
                onChange={(e) => setSupplierData({ ...supplierData, notes: e.target.value })}
                placeholder="أي ملاحظات إضافية..."
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* شريط الأدوات */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <Input
              placeholder="ابحث عن رمز HS أو الوصف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterCurrency}
            onChange={(e) => setFilterCurrency(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-md"
          >
            <option value="ALL">جميع العملات</option>
            <option value="USD">دولار أمريكي</option>
            <option value="EGP">جنيه مصري</option>
            <option value="JOD">دينار أردني</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-slate-300 rounded-md"
          >
            <option value="hsCode">ترتيب: رمز HS</option>
            <option value="price">ترتيب: السعر</option>
            <option value="quantity">ترتيب: الكمية</option>
          </select>
          <Button onClick={() => {
            setIsDialogOpen(true);
            setIsEditingId(null);
            setFormData({
              hsCode: '',
              description: '',
              quantity: 1,
              unitPrice: 0,
              currency: 'USD',
              piecesPerBox: 1,
              boxCount: 1,
            });
          }} className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة صنف جديد
          </Button>
        </div>

        {/* جدول الأصناف */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>الأصناف المضافة</CardTitle>
            <CardDescription>
              {filteredItems.length} صنف - الإجمالي: {totalPrice.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">لا توجد أصناف مضافة حالياً</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-100">
                      <TableHead className="text-right">رمز HS</TableHead>
                      <TableHead className="text-right">الوصف</TableHead>
                      <TableHead className="text-center">الكمية</TableHead>
                      <TableHead className="text-center">سعر الوحدة</TableHead>
                      <TableHead className="text-center">العملة</TableHead>
                      <TableHead className="text-center">القطع/الكرتون</TableHead>
                      <TableHead className="text-center">عدد الكراتين</TableHead>
                      <TableHead className="text-left">الإجمالي</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50">
                        <TableCell className="text-right font-medium">{item.hsCode}</TableCell>
                        <TableCell className="text-right">{item.description}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-center">{item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-center">{item.currency}</TableCell>
                        <TableCell className="text-center">{item.piecesPerBox}</TableCell>
                        <TableCell className="text-center">{item.boxCount}</TableCell>
                        <TableCell className="text-left font-semibold">
                          {item.totalPrice.toFixed(2)} {CURRENCY_SYMBOLS[item.currency]}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleEditItem(item)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-slate-100 font-bold">
                      <TableCell colSpan={2} className="text-right">الإجمالي</TableCell>
                      <TableCell className="text-center">{totalQuantity}</TableCell>
                      <TableCell colSpan={2}></TableCell>
                      <TableCell className="text-center">{totalPieces}</TableCell>
                      <TableCell className="text-center">{totalBoxes}</TableCell>
                      <TableCell className="text-left text-lg">{totalPrice.toFixed(2)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ملخص العملات */}
        {items.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>ملخص العملات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">دولار أمريكي (USD)</p>
                  <p className="text-2xl font-bold text-blue-600">${currencyTotals.USD.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">جنيه مصري (EGP)</p>
                  <p className="text-2xl font-bold text-green-600">£{currencyTotals.EGP.toFixed(2)}</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-600">دينار أردني (JOD)</p>
                  <p className="text-2xl font-bold text-amber-600">د.ا{currencyTotals.JOD.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* أزرار الإجراءات */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Button onClick={handleSaveInvoice} className="gap-2 flex-1">
            <Save className="w-4 h-4" />
            حفظ الفاتورة
          </Button>
          <Button onClick={handleExportPDF} variant="outline" className="gap-2 flex-1">
            <Download className="w-4 h-4" />
            تصدير PDF
          </Button>
          <Button onClick={handleExportExcel} variant="outline" className="gap-2 flex-1">
            <Download className="w-4 h-4" />
            تصدير Excel
          </Button>
          <Button onClick={handlePrint} variant="outline" className="gap-2 flex-1">
            <Printer className="w-4 h-4" />
            طباعة
          </Button>
        </div>

        {/* نموذج إضافة/تعديل صنف */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditingId ? 'تعديل الصنف' : 'إضافة صنف جديد'}</DialogTitle>
              <DialogDescription>
                {isEditingId ? 'تحديث تفاصيل الصنف' : 'أدخل تفاصيل الصنف الجديد'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">رمز HS *</label>
                <Input
                  value={formData.hsCode}
                  onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
                  placeholder="مثال: 8704"
                />
              </div>
              <div>
                <label className="text-sm font-medium">الوصف *</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف المنتج"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">الكمية</label>
                  <Input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">سعر الوحدة</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">القطع/الكرتون</label>
                  <Input
                    type="number"
                    value={formData.piecesPerBox}
                    onChange={(e) => setFormData({ ...formData, piecesPerBox: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">عدد الكراتين</label>
                  <Input
                    type="number"
                    value={formData.boxCount}
                    onChange={(e) => setFormData({ ...formData, boxCount: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">العملة</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EGP">جنيه مصري (EGP)</option>
                  <option value="JOD">دينار أردني (JOD)</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  setIsEditingId(null);
                }}>
                  إلغاء
                </Button>
                <Button onClick={handleAddItem}>
                  {isEditingId ? 'تحديث الصنف' : 'إضافة الصنف'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

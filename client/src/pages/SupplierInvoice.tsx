'use client';
import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';

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

export default function SupplierInvoice() {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    hsCode: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    currency: 'USD' as 'USD' | 'EGP' | 'JOD',
    piecesPerBox: 1,
    boxCount: 1,
  });

  const handleAddItem = () => {
    if (!formData.hsCode || !formData.description) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      hsCode: formData.hsCode,
      description: formData.description,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      currency: formData.currency,
      piecesPerBox: formData.piecesPerBox,
      boxCount: formData.boxCount,
      totalPrice: formData.quantity * formData.unitPrice,
    };

    setItems([...items, newItem]);
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

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const filteredItems = items.filter(item =>
    item.hsCode.includes(searchTerm) || item.description.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">فاتورة المورد</h1>
          <p className="text-slate-600">إدارة فواتير الموردين وتتبع الأصناف والأسعار</p>
        </div>

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
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
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
                        <TableCell className="text-left font-semibold">{item.totalPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Button variant="ghost" size="sm" className="gap-1">
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
                      <TableCell colSpan={7} className="text-right">الإجمالي</TableCell>
                      <TableCell className="text-left text-lg">{totalPrice.toFixed(2)}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* نموذج إضافة صنف */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة صنف جديد</DialogTitle>
              <DialogDescription>أدخل تفاصيل الصنف الجديد</DialogDescription>
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddItem}>
                  إضافة الصنف
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

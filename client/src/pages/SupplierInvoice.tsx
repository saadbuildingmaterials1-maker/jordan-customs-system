'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface InvoiceItem {
  id?: string;
  hsCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: 'USD' | 'EGP' | 'JOD';
  piecesPerBox: number;
  boxesCount: number;
  totalPrice: number;
}

const CURRENCIES = [
  { value: 'USD', label: 'دولار أمريكي' },
  { value: 'EGP', label: 'جنيه مصري' },
  { value: 'JOD', label: 'دينار أردني' }
];

const EXCHANGE_RATES = {
  USD: 0.708,
  EGP: 0.0225,
  JOD: 1
};

const HS_CODES = [
  { code: '8704', description: 'Motor vehicles for transport of goods' },
  { code: '8703', description: 'Motor cars and other motor vehicles' },
  { code: '8708', description: 'Parts and accessories of motor vehicles' },
  { code: '6204', description: 'Women\'s or girls\' suits, jackets, dresses' },
  { code: '6203', description: 'Men\'s or boys\' suits, jackets, trousers' },
  { code: '6109', description: 'T-shirts, singlets and other vests' },
];

export default function SupplierInvoice() {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<InvoiceItem>>({
    currency: 'USD',
    piecesPerBox: 1,
    boxesCount: 1
  });

  const filteredHSCodes = useMemo(() => {
    return HS_CODES.filter(item =>
      item.code.includes(searchTerm) || item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleAddItem = () => {
    if (!formData.hsCode || !formData.description || !formData.quantity || !formData.unitPrice) {
      alert('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    const exchangeRate = EXCHANGE_RATES[formData.currency as keyof typeof EXCHANGE_RATES] || 1;
    const totalPrice = (formData.quantity || 0) * (formData.unitPrice || 0) * exchangeRate;

    const newItem: InvoiceItem = {
      id: Math.random().toString(),
      hsCode: formData.hsCode || '',
      description: formData.description || '',
      quantity: formData.quantity || 0,
      unitPrice: formData.unitPrice || 0,
      currency: formData.currency as 'USD' | 'EGP' | 'JOD',
      piecesPerBox: formData.piecesPerBox || 1,
      boxesCount: formData.boxesCount || 1,
      totalPrice
    };

    setItems([...items, newItem]);
    setFormData({ currency: 'USD', piecesPerBox: 1, boxesCount: 1 });
    setIsDialogOpen(false);
  };

  const handleDeleteItem = (id: string | undefined) => {
    if (id) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const totalInvoiceAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">فاتورة المورد</h1>
        <p className="text-gray-600 mt-2">إدارة فواتير المورد وتفاصيل الأصناف</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الأصناف المضافة</CardTitle>
          <CardDescription>قائمة الأصناف في الفاتورة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة صنف جديد
            </Button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد أصناف مضافة حالياً
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الرمز الجمركي</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>السعر/الوحدة</TableHead>
                    <TableHead>العملة</TableHead>
                    <TableHead>السعر الإجمالي</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{item.hsCode}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unitPrice}</TableCell>
                      <TableCell>{item.currency}</TableCell>
                      <TableCell>{item.totalPrice.toFixed(2)} د.أ</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">إجمالي الفاتورة:</span>
              <span className="text-2xl font-bold text-blue-600">{totalInvoiceAmount.toFixed(2)} د.أ</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة صنف جديد</DialogTitle>
            <DialogDescription>أدخل تفاصيل الصنف الجديد</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">البحث عن الرمز الجمركي</label>
              <Input
                placeholder="ابحث عن الرمز أو الوصف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchTerm && filteredHSCodes.length > 0 && (
              <div className="border rounded-lg p-2 max-h-40 overflow-y-auto">
                {filteredHSCodes.map(item => (
                  <div
                    key={item.code}
                    className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                    onClick={() => {
                      setFormData({ ...formData, hsCode: item.code, description: item.description });
                      setSearchTerm('');
                    }}
                  >
                    <div className="font-semibold">{item.code}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">الرمز الجمركي</label>
              <Input
                value={formData.hsCode || ''}
                onChange={(e) => setFormData({ ...formData, hsCode: e.target.value })}
                placeholder="مثال: 8704"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">الوصف</label>
              <Input
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="وصف الصنف"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">الكمية</label>
                <Input
                  type="number"
                  value={formData.quantity || ''}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">السعر/الوحدة</label>
                <Input
                  type="number"
                  value={formData.unitPrice || ''}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">العملة</label>
              <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value as 'USD' | 'EGP' | 'JOD' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(curr => (
                    <SelectItem key={curr.value} value={curr.value}>
                      {curr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">عدد القطع بالكرتون</label>
                <Input
                  type="number"
                  value={formData.piecesPerBox || ''}
                  onChange={(e) => setFormData({ ...formData, piecesPerBox: parseInt(e.target.value) })}
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">عدد الكراتين</label>
                <Input
                  type="number"
                  value={formData.boxesCount || ''}
                  onChange={(e) => setFormData({ ...formData, boxesCount: parseInt(e.target.value) })}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
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
  );
}

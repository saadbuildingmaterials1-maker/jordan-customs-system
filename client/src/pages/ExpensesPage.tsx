import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, DollarSign, TrendingDown } from 'lucide-react';

interface Expense {
  id: string;
  type: string;
  description: string;
  amount: number;
  currency: 'USD' | 'EGP' | 'JOD';
  exchangeRate: number;
  amountInJod: number;
}

interface ExchangeRates {
  USD: number;
  EGP: number;
  JOD: number;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    type: string;
    description: string;
    amount: number;
    currency: 'USD' | 'EGP' | 'JOD';
  }>({
    type: 'freight',
    description: '',
    amount: 0,
    currency: 'USD',
  });

  // أسعار الصرف الحالية (محاكاة)
  const exchangeRates: ExchangeRates = {
    USD: 0.708,
    EGP: 0.0225,
    JOD: 1.0,
  };

  const expenseTypes = [
    { value: 'freight', label: 'أجور الشحن' },
    { value: 'insurance', label: 'التأمين' },
    { value: 'customs', label: 'الرسوم الجمركية' },
    { value: 'handling', label: 'مصاريف التعامل' },
    { value: 'storage', label: 'مصاريف التخزين' },
    { value: 'documentation', label: 'مصاريف التوثيق' },
    { value: 'other', label: 'مصاريف أخرى' },
  ];

  const handleAddExpense = () => {
    if (!formData.type || formData.amount <= 0) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const exchangeRate = exchangeRates[formData.currency];
    const amountInJod = formData.amount * exchangeRate;

    const newExpense: Expense = {
      id: editingId || Date.now().toString(),
      type: formData.type,
      description: formData.description,
      amount: formData.amount,
      currency: formData.currency,
      exchangeRate,
      amountInJod,
    };

    if (editingId) {
      setExpenses(items => items.map(item => item.id === editingId ? newExpense : item));
      setEditingId(null);
    } else {
      setExpenses(items => [...items, newExpense]);
    }

    setFormData({
      type: 'freight',
      description: '',
      amount: 0,
      currency: 'USD' as 'USD' | 'EGP' | 'JOD',
    });
    setIsAddDialogOpen(false);
  };

  const handleEditExpense = (expense: Expense) => {
    setFormData({
      type: expense.type,
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
    });
    setEditingId(expense.id);
    setIsAddDialogOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(items => items.filter(item => item.id !== id));
  };

  const totalExpensesInJod = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amountInJod, 0);
  }, [expenses]);

  const expensesByType = useMemo(() => {
    const grouped: Record<string, number> = {};
    expenses.forEach(expense => {
      if (!grouped[expense.type]) {
        grouped[expense.type] = 0;
      }
      grouped[expense.type] += expense.amountInJod;
    });
    return grouped;
  }, [expenses]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة المصاريف</h1>
          <p className="text-gray-600 mt-2">تتبع وإدارة مصاريف الشحنة</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة مصروف جديد
        </Button>
      </div>

      {/* أسعار الصرف الحالية */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">سعر الدولار</p>
                <p className="text-2xl font-bold text-blue-600">{exchangeRates.USD}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">سعر الجنيه</p>
                <p className="text-2xl font-bold text-green-600">{exchangeRates.EGP}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">الدينار الأردني</p>
                <p className="text-2xl font-bold text-purple-600">{exchangeRates.JOD}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول المصاريف */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
          <CardTitle>قائمة المصاريف</CardTitle>
          <CardDescription className="text-orange-100">
            إجمالي المصاريف: {expenses.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {expenses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              لا توجد مصاريف مضافة حالياً
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="text-right">نوع المصروف</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">العملة</TableHead>
                    <TableHead className="text-right">سعر الصرف</TableHead>
                    <TableHead className="text-right">المبلغ بالدينار</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {expenseTypes.find(t => t.value === expense.type)?.label}
                      </TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell>{expense.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                          {expense.currency}
                        </span>
                      </TableCell>
                      <TableCell>{expense.exchangeRate.toFixed(4)}</TableCell>
                      <TableCell className="font-bold text-green-600">
                        {expense.amountInJod.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExpense(expense)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-800"
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
        </CardContent>
      </Card>

      {/* ملخص المصاريف */}
      {expenses.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* إجمالي المصاريف */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardHeader>
              <CardTitle className="text-green-700">إجمالي المصاريف</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {totalExpensesInJod.toFixed(2)} د.أ
              </div>
              <p className="text-gray-600 text-sm mt-2">
                إجمالي المصاريف بالدينار الأردني
              </p>
            </CardContent>
          </Card>

          {/* توزيع المصاريف حسب النوع */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>توزيع المصاريف حسب النوع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(expensesByType).map(([type, amount]) => (
                <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">
                    {expenseTypes.find(t => t.value === type)?.label}
                  </span>
                  <span className="font-bold text-blue-600">
                    {amount.toFixed(2)} د.أ
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* نموذج إضافة مصروف */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'تعديل المصروف' : 'إضافة مصروف جديد'}</DialogTitle>
            <DialogDescription>
              أدخل تفاصيل المصروف الجديد
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع المصروف
              </label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expenseTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف
              </label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="وصف المصروف"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المبلغ
                </label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العملة
                </label>
                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value as 'USD' | 'EGP' | 'JOD' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">دولار أمريكي</SelectItem>
                    <SelectItem value="EGP">جنيه مصري</SelectItem>
                    <SelectItem value="JOD">دينار أردني</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* عرض المبلغ بالدينار */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">المبلغ بالدينار الأردني</p>
              <p className="text-2xl font-bold text-blue-600">
                {(formData.amount * exchangeRates[formData.currency]).toFixed(2)} د.أ
              </p>
            </div>

            {/* الأزرار */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddExpense} className="bg-orange-600 hover:bg-orange-700">
                {editingId ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

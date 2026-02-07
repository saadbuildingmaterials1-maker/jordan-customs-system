/**
 * ExpensesManagement Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/ExpensesManagement
 */
import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Plus, Edit2, Trash2, TrendingUp, Calendar, Download } from 'lucide-react';

export default function ExpensesManagement() {
  const [activeTab, setActiveTab] = useState('expenses');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleExportCSV = () => {
    const headers = ['النوع', 'المبلغ', 'العملة', 'التاريخ', 'الوصف', 'الحالة'];
    const rows = expenses.map(exp => [
      exp.type,
      exp.amount,
      exp.currency,
      exp.date,
      exp.description,
      exp.status
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('تم تصدير المصاريف بنجاح');
  };

  const [expenses, setExpenses] = useState([
    {
      id: 1,
      type: 'رسوم الشحن',
      amount: 5000,
      currency: 'USD',
      date: '2026-01-15',
      description: 'شحن من Shanghai إلى Aqaba',
      status: 'مدفوع',
      category: 'شحن',
    },
    {
      id: 2,
      type: 'تأمين الشحنة',
      amount: 500,
      currency: 'USD',
      date: '2026-01-15',
      description: 'تأمين شامل للشحنة',
      status: 'مدفوع',
      category: 'تأمين',
    },
    {
      id: 3,
      type: 'رسوم التخليص',
      amount: 1500,
      currency: 'JOD',
      date: '2026-01-20',
      description: 'رسوم التخليص الجمركي',
      status: 'قيد الانتظار',
      category: 'جمارك',
    },
    {
      id: 4,
      type: 'رسوم المناولة',
      amount: 800,
      currency: 'JOD',
      date: '2026-01-22',
      description: 'مناولة وتفريغ الحاوية',
      status: 'مدفوع',
      category: 'مناولة',
    },
  ]);

  const [expenseTypes] = useState([
    { id: 1, name: 'رسوم الشحن', category: 'شحن', icon: '📦' },
    { id: 2, name: 'تأمين الشحنة', category: 'تأمين', icon: '🛡️' },
    { id: 3, name: 'رسوم التخليص', category: 'جمارك', icon: '📋' },
    { id: 4, name: 'رسوم المناولة', category: 'مناولة', icon: '🏗️' },
    { id: 5, name: 'رسوم التخزين', category: 'تخزين', icon: '📦' },
    { id: 6, name: 'رسوم النقل الداخلي', category: 'نقل', icon: '🚚' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مدفوع':
        return 'bg-green-100 text-green-800';
      case 'قيد الانتظار':
        return 'bg-yellow-100 text-yellow-800';
      case 'متأخر':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => {
    const rate = exp.currency === 'USD' ? 0.71 : 1; // تحويل تقريبي
    return sum + (exp.amount * rate);
  }, 0);

  const paidExpenses = expenses
    .filter(exp => exp.status === 'مدفوع')
    .reduce((sum, exp) => {
      const rate = exp.currency === 'USD' ? 0.71 : 1;
      return sum + (exp.amount * rate);
    }, 0);

  const pendingExpenses = expenses
    .filter(exp => exp.status === 'قيد الانتظار')
    .reduce((sum, exp) => {
      const rate = exp.currency === 'USD' ? 0.71 : 1;
      return sum + (exp.amount * rate);
    }, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* الرأس */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-8 h-8" />
              إدارة المصاريف
            </h1>
            <p className="text-gray-600 mt-2">
              تتبع وإدارة جميع مصاريف الشحن والتخليص والمناولة
            </p>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                إجمالي المصاريف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExpenses.toFixed(2)} د.ا</div>
              <p className="text-xs text-gray-500 mt-1">{expenses.length} مصروف</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                المدفوع
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{paidExpenses.toFixed(2)} د.ا</div>
              <p className="text-xs text-gray-500 mt-1">
                {((paidExpenses / totalExpenses) * 100).toFixed(0)}% من الإجمالي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                قيد الانتظار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingExpenses.toFixed(2)} د.ا</div>
              <p className="text-xs text-gray-500 mt-1">
                {((pendingExpenses / totalExpenses) * 100).toFixed(0)}% من الإجمالي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                عدد المصاريف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expenses.length}</div>
              <p className="text-xs text-gray-500 mt-1">هذا الشهر</p>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expenses" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">المصاريف</span>
            </TabsTrigger>
            <TabsTrigger value="types" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">الأنواع</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">التقارير</span>
            </TabsTrigger>
          </TabsList>

          {/* تبويب المصاريف */}
          <TabsContent value="expenses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">قائمة المصاريف</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                مصروف جديد
              </Button>
            </div>

            {/* البحث والتصفية */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <Input
                  placeholder="ابحث عن المصاريف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex gap-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="مدفوع">مدفوع</option>
                    <option value="قيد الانتظار">قيد الانتظار</option>
                    <option value="متأخر">متأخر</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>المصاريف</CardTitle>
                <CardDescription>جميع المصاريف المسجلة في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4 font-medium">نوع المصروف</th>
                        <th className="text-right py-3 px-4 font-medium">المبلغ</th>
                        <th className="text-right py-3 px-4 font-medium">العملة</th>
                        <th className="text-right py-3 px-4 font-medium">التاريخ</th>
                        <th className="text-right py-3 px-4 font-medium">الحالة</th>
                        <th className="text-right py-3 px-4 font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses
                        .filter(exp => {
                          const matchesSearch = exp.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                             exp.type.toLowerCase().includes(searchQuery.toLowerCase());
                          const matchesStatus = filterStatus === 'all' || exp.status === filterStatus;
                          return matchesSearch && matchesStatus;
                        })
                        .map((expense) => (
                        <tr key={expense.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{expense.type}</td>
                          <td className="py-3 px-4">
                            {expense.amount.toLocaleString('ar-JO')}
                          </td>
                          <td className="py-3 px-4">{expense.currency}</td>
                          <td className="py-3 px-4">{expense.date}</td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(expense.status)}>
                              {expense.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
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
          </TabsContent>

          {/* تبويب أنواع المصاريف */}
          <TabsContent value="types" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">أنواع المصاريف</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                نوع جديد
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenseTypes.map(type => {
                const typeExpenses = expenses.filter(e => e.category === type.category);
                const typeTotal = typeExpenses.reduce((sum, e) => {
                  const rate = e.currency === 'USD' ? 0.71 : 1;
                  return sum + (e.amount * rate);
                }, 0);

                return (
                  <Card key={type.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{type.icon}</span>
                          <div>
                            <CardTitle className="text-base">{type.name}</CardTitle>
                            <CardDescription>{type.category}</CardDescription>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">الإجمالي</p>
                        <p className="text-2xl font-bold">{typeTotal.toFixed(2)} د.ا</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">عدد المصاريف</p>
                        <p className="font-medium">{typeExpenses.length} مصروف</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* تبويب التقارير */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">التقارير والتحليلات</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2" onClick={handleExportCSV}>
                  <Download className="w-4 h-4" />
                  تصدير CSV
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>توزيع المصاريف حسب النوع</CardTitle>
                <CardDescription>نسبة كل نوع من المصاريف</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseTypes.map(type => {
                    const typeExpenses = expenses.filter(e => e.category === type.category);
                    const typeTotal = typeExpenses.reduce((sum, e) => {
                      const rate = e.currency === 'USD' ? 0.71 : 1;
                      return sum + (e.amount * rate);
                    }, 0);
                    const percentage = (typeTotal / totalExpenses) * 100;

                    return (
                      <div key={type.id}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{type.name}</span>
                          <span className="text-sm text-gray-600">
                            {percentage.toFixed(1)}% ({typeTotal.toFixed(2)} د.ا)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ملخص المصاريف</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">المدفوع</p>
                    <p className="text-2xl font-bold text-green-600">
                      {paidExpenses.toFixed(2)} د.ا
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">قيد الانتظار</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {pendingExpenses.toFixed(2)} د.ا
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

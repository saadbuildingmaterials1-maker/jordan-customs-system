import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, FileText, Plus, Edit2, Trash2, Download, Eye } from 'lucide-react';

export default function FactoriesAndInvoices() {
  const [activeTab, setActiveTab] = useState('factories');
  const [factories, setFactories] = useState([
    {
      id: 1,
      name: 'مصنع الأردن للنسيج',
      country: 'الأردن',
      email: 'info@jordan-textile.com',
      phone: '+962791234567',
      address: 'عمّان - منطقة الزرقاء الصناعية',
      invoicesCount: 15,
    },
    {
      id: 2,
      name: 'مصنع الخليج للمنتجات',
      country: 'الإمارات',
      email: 'contact@gulf-products.ae',
      phone: '+971501234567',
      address: 'دبي - منطقة جبل علي',
      invoicesCount: 8,
    },
  ]);

  const [invoices, setInvoices] = useState([
    {
      id: 'INV-001',
      factoryName: 'مصنع الأردن للنسيج',
      date: '2026-01-20',
      amount: 25000,
      currency: 'JOD',
      status: 'مدفوعة',
      items: 5,
    },
    {
      id: 'INV-002',
      factoryName: 'مصنع الخليج للمنتجات',
      date: '2026-01-22',
      amount: 18500,
      currency: 'AED',
      status: 'قيد الانتظار',
      items: 3,
    },
  ]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* الرأس */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-8 h-8" />
              إدارة المصانع والفواتير
            </h1>
            <p className="text-gray-600 mt-2">
              إدارة بيانات المصانع والفواتير المرتبطة بها
            </p>
          </div>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="factories" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">المصانع</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">الفواتير</span>
            </TabsTrigger>
          </TabsList>

          {/* تبويب المصانع */}
          <TabsContent value="factories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">قائمة المصانع</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                إضافة مصنع جديد
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {factories.map((factory) => (
                <Card key={factory.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          {factory.name}
                        </CardTitle>
                        <CardDescription>{factory.country}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                      <p className="font-medium">{factory.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">الهاتف</p>
                      <p className="font-medium">{factory.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">العنوان</p>
                      <p className="font-medium">{factory.address}</p>
                    </div>
                    <div className="pt-3 border-t">
                      <Badge className="bg-blue-100 text-blue-800">
                        {factory.invoicesCount} فاتورة
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* تبويب الفواتير */}
          <TabsContent value="invoices" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">قائمة الفواتير</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                فاتورة جديدة
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>الفواتير</CardTitle>
                <CardDescription>جميع الفواتير المسجلة في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4 font-medium">رقم الفاتورة</th>
                        <th className="text-right py-3 px-4 font-medium">المصنع</th>
                        <th className="text-right py-3 px-4 font-medium">التاريخ</th>
                        <th className="text-right py-3 px-4 font-medium">المبلغ</th>
                        <th className="text-right py-3 px-4 font-medium">الحالة</th>
                        <th className="text-right py-3 px-4 font-medium">العناصر</th>
                        <th className="text-right py-3 px-4 font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{invoice.id}</td>
                          <td className="py-3 px-4">{invoice.factoryName}</td>
                          <td className="py-3 px-4">{invoice.date}</td>
                          <td className="py-3 px-4 font-medium">
                            {invoice.amount.toLocaleString('ar-JO')} {invoice.currency}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                invoice.status === 'مدفوعة'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{invoice.items} عناصر</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit2 className="w-4 h-4" />
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

            {/* إحصائيات الفواتير */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    إجمالي الفواتير
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{invoices.length}</div>
                  <p className="text-xs text-gray-500 mt-1">فاتورة مسجلة</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    المبلغ الإجمالي
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString('ar-JO')}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">جميع العملات</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    الفواتير المدفوعة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {invoices.filter((inv) => inv.status === 'مدفوعة').length}
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    {(
                      (invoices.filter((inv) => inv.status === 'مدفوعة').length /
                        invoices.length) *
                      100
                    ).toFixed(1)}
                    % من الإجمالي
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

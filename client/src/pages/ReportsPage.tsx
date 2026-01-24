import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart, Download, Filter, Calendar, TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: '2026-01-31' });
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  // بيانات تجريبية
  const reportData = {
    totalRevenue: 125000,
    totalExpenses: 45000,
    netProfit: 80000,
    totalShipments: 45,
    totalDeclarations: 38,
    totalCustomers: 12,
    averageShipmentCost: 2777.78,
    profitMargin: 64,
  };

  const monthlyData = [
    { month: 'يناير', revenue: 125000, expenses: 45000, profit: 80000 },
    { month: 'فبراير', revenue: 98000, expenses: 38000, profit: 60000 },
    { month: 'مارس', revenue: 112000, expenses: 42000, profit: 70000 },
  ];

  const shipmentsByStatus = [
    { status: 'تم التسليم', count: 30, percentage: 66.7 },
    { status: 'قيد النقل', count: 10, percentage: 22.2 },
    { status: 'قيد الانتظار', count: 5, percentage: 11.1 },
  ];

  const topCustomers = [
    { id: 1, name: 'شركة الخليج للتجارة', revenue: 45000, shipments: 15 },
    { id: 2, name: 'مصنع الإلكترونيات المتقدمة', revenue: 35000, shipments: 12 },
    { id: 3, name: 'شركة النقل الدولية', revenue: 25000, shipments: 10 },
    { id: 4, name: 'مستوردات الملابس الحديثة', revenue: 20000, shipments: 8 },
  ];

  const expenseBreakdown = [
    { category: 'الشحن', amount: 25000, percentage: 55.6 },
    { category: 'الرسوم الجمركية', amount: 12000, percentage: 26.7 },
    { category: 'التأمين', amount: 5000, percentage: 11.1 },
    { category: 'أخرى', amount: 3000, percentage: 6.7 },
  ];

  const handleExportReport = (format: string) => {
    toast.success(`تم تصدير التقرير بصيغة ${format}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* الرأس */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart className="w-8 h-8" />
              التقارير والتحليلات
            </h1>
            <p className="text-gray-600 mt-2">
              عرض شامل للإحصائيات والتحليلات المالية
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              تحديد التاريخ
            </Button>
            <Button className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              تصدير
            </Button>
          </div>
        </div>

        {/* الإحصائيات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">إجمالي الإيرادات</p>
                  <p className="text-2xl font-bold text-blue-600">${reportData.totalRevenue.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">إجمالي المصاريف</p>
                  <p className="text-2xl font-bold text-red-600">${reportData.totalExpenses.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">صافي الربح</p>
                  <p className="text-2xl font-bold text-green-600">${reportData.netProfit.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">هامش الربح</p>
                  <p className="text-2xl font-bold text-purple-600">{reportData.profitMargin}%</p>
                </div>
                <PieChart className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="shipments">الشحنات</TabsTrigger>
            <TabsTrigger value="customers">العملاء</TabsTrigger>
            <TabsTrigger value="expenses">المصاريف</TabsTrigger>
          </TabsList>

          {/* تبويب النظرة العامة */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* الإيرادات والمصاريف الشهرية */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    الإيرادات والمصاريف الشهرية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map(data => (
                      <div key={data.month} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{data.month}</span>
                          <span className="text-green-600 font-bold">${data.profit.toLocaleString()}</span>
                        </div>
                        <div className="flex gap-2 h-8">
                          <div className="flex-1 bg-blue-100 rounded relative overflow-hidden">
                            <div className="bg-blue-600 h-full" style={{ width: '100%' }} />
                            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
                              ${data.revenue}
                            </span>
                          </div>
                          <div className="flex-1 bg-red-100 rounded relative overflow-hidden">
                            <div className="bg-red-600 h-full" style={{ width: `${(data.expenses / data.revenue) * 100}%` }} />
                            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-bold">
                              ${data.expenses}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* الإحصائيات الأساسية */}
              <Card>
                <CardHeader>
                  <CardTitle>الإحصائيات الأساسية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">إجمالي الشحنات</span>
                      <Badge className="bg-blue-100 text-blue-800">{reportData.totalShipments}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">إجمالي البيانات الجمركية</span>
                      <Badge className="bg-green-100 text-green-800">{reportData.totalDeclarations}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">إجمالي العملاء</span>
                      <Badge className="bg-purple-100 text-purple-800">{reportData.totalCustomers}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">متوسط تكلفة الشحنة</span>
                      <Badge className="bg-yellow-100 text-yellow-800">${reportData.averageShipmentCost.toFixed(2)}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب الشحنات */}
          <TabsContent value="shipments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع الشحنات حسب الحالة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {shipmentsByStatus.map(item => (
                    <div key={item.status} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.status}</span>
                        <span className="text-gray-600">{item.count} شحنة ({item.percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-600 h-3 rounded-full" 
                          style={{ width: `${item.percentage}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب العملاء */}
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>أفضل العملاء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4 font-medium">اسم العميل</th>
                        <th className="text-right py-3 px-4 font-medium">الإيرادات</th>
                        <th className="text-right py-3 px-4 font-medium">عدد الشحنات</th>
                        <th className="text-right py-3 px-4 font-medium">النسبة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCustomers.map(customer => (
                        <tr key={customer.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{customer.name}</td>
                          <td className="py-3 px-4">${customer.revenue.toLocaleString()}</td>
                          <td className="py-3 px-4">{customer.shipments}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${(customer.revenue / 45000) * 100}%` }} 
                                />
                              </div>
                              <span className="text-sm">{((customer.revenue / 45000) * 100).toFixed(0)}%</span>
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

          {/* تبويب المصاريف */}
          <TabsContent value="expenses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع المصاريف حسب الفئة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseBreakdown.map(item => (
                    <div key={item.category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-gray-600">${item.amount.toLocaleString()} ({item.percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-red-600 h-3 rounded-full" 
                          style={{ width: `${item.percentage}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* أزرار التصدير */}
        <Card>
          <CardHeader>
            <CardTitle>تصدير التقارير</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={() => handleExportReport('PDF')} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                تصدير PDF
              </Button>
              <Button onClick={() => handleExportReport('Excel')} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                تصدير Excel
              </Button>
              <Button onClick={() => handleExportReport('CSV')} variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                تصدير CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

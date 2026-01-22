import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Download, Plus, Edit2, Trash2, TrendingUp, BarChart3 } from 'lucide-react';

export default function AdvancedCustomsDeclarationPage() {
  const [activeTab, setActiveTab] = useState('declaration');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [declaration] = useState({
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

  const [items] = useState([
    {
      id: 1,
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
      id: 2,
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

  const [summary] = useState({
    totalGoodValue: 50000,
    freight: 2500,
    insurance: 500,
    customsDuties: 2750,
    salesTax: 8400,
    additionalFees: 500,
    totalCost: 65150,
    averageLandedCost: 651.50,
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
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
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              استيراد من PDF
            </Button>
            <Button className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              تصدير
            </Button>
          </div>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="declaration">البيان</TabsTrigger>
            <TabsTrigger value="items">الأصناف</TabsTrigger>
            <TabsTrigger value="distribution">التوزيع</TabsTrigger>
            <TabsTrigger value="analysis">التحليل</TabsTrigger>
          </TabsList>

          {/* تبويب البيان */}
          <TabsContent value="declaration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>معلومات البيان الجمركي</CardTitle>
                <CardDescription>التفاصيل الأساسية للبيان</CardDescription>
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
                    className="hidden"
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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">الأصناف</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                صنف جديد
              </Button>
            </div>

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
                        <th className="text-right py-3 px-4 font-medium">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium">{item.itemCode}</td>
                          <td className="py-3 px-4">{item.description}</td>
                          <td className="py-3 px-4">{item.hsCode}</td>
                          <td className="py-3 px-4">{item.quantity}</td>
                          <td className="py-3 px-4">${item.unitPrice}</td>
                          <td className="py-3 px-4 font-medium">${item.totalPrice.toLocaleString()}</td>
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
                    <span className="font-medium">${summary.totalGoodValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">أجور الشحن</span>
                    <span className="font-medium">${summary.freight.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">التأمين</span>
                    <span className="font-medium">${summary.insurance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">الرسوم الجمركية</span>
                    <span className="font-medium text-blue-600">${summary.customsDuties.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">ضريبة المبيعات 16%</span>
                    <span className="font-medium text-blue-600">${summary.salesTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-gray-600">رسوم إضافية</span>
                    <span className="font-medium">${summary.additionalFees.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t-2 border-gray-300">
                    <span className="font-semibold">التكلفة الإجمالية</span>
                    <span className="font-bold text-lg text-green-600">
                      ${summary.totalCost.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>تكلفة الوحدة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-600 mb-2">متوسط تكلفة الوحدة</p>
                    <p className="text-4xl font-bold text-blue-600">
                      ${summary.averageLandedCost.toFixed(2)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">الوزن الإجمالي</p>
                      <p className="font-medium">{declaration.totalWeight.toLocaleString()} كغ</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">الحجم الإجمالي</p>
                      <p className="font-medium">{declaration.totalCBM} CBM</p>
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
                      <span className="text-sm font-medium">76.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '76.8%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">الرسوم والضرائب</span>
                      <span className="text-sm font-medium">17.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '17.2%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">الشحن والتأمين</span>
                      <span className="text-sm font-medium">4.6%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '4.6%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">رسوم إضافية</span>
                      <span className="text-sm font-medium">0.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '0.8%' }} />
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
                    <p className="text-2xl font-bold text-blue-600">5.5%</p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">معدل الضريبة</p>
                    <p className="text-2xl font-bold text-green-600">16%</p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">إجمالي الرسوم والضرائب</p>
                    <p className="text-2xl font-bold text-purple-600">11,150 د.ا</p>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">تكلفة الشحن لكل وحدة</p>
                    <p className="text-2xl font-bold text-orange-600">25 د.ا</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

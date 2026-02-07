/**
 * AdvancedCustomsDeclaration Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/AdvancedCustomsDeclaration
 */
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileUp, Printer, BarChart3 } from 'lucide-react';
import { PdfImportDialog } from '@/components/PdfImportDialog';

interface DeclarationData {
  // معلومات البيان الأساسية
  declarationNumber: string;
  declarationDate: string;
  clearanceCenter: string;
  
  // معلومات المستورد
  importerName: string;
  importerTaxNumber: string;
  
  // معلومات الشركة المصدرة
  exporterCompany: string;
  exporterCountry: string;
  
  // معلومات الشحنة
  containerNumber: string;
  billOfLadingNumber: string;
  shippingCompany: string;
  packageCount: number;
  packageType: string;
  grossWeight: number;
  netWeight: number;
  
  // الأصناف
  items: DeclarationItem[];
  
  // الملخص المالي
  summary: FinancialSummary;
}

interface DeclarationItem {
  itemNumber: number;
  hsCode: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  currency: 'USD' | 'EGP' | 'JOD';
  tariffBand: string;
  dutyRate: number;
  dutyAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  percentageOfTotal: number;
}

interface FinancialSummary {
  totalGoodsValue: number;
  shippingCost: number;
  insurance: number;
  customsDuty: number;
  tax: number;
  additionalFees: number;
  totalAmount: number;
  currency: 'USD' | 'EGP' | 'JOD';
}

export default function AdvancedCustomsDeclaration() {
  const [declaration, setDeclaration] = useState<DeclarationData>({
    declarationNumber: '89430/4',
    declarationDate: '2025-12-14',
    clearanceCenter: 'جمرك الشرقية',
    importerName: 'سعد احمد غازي سعد الدين',
    importerTaxNumber: '01375216',
    exporterCompany: 'TIANJIN YINGXINTAI IMPORT AND EXPO',
    exporterCountry: 'الصين',
    containerNumber: 'EMIVCHXINX006881',
    billOfLadingNumber: '1385',
    shippingCompany: 'JNSW',
    packageCount: 1385,
    packageType: 'CT',
    grossWeight: 5000,
    netWeight: 4500,
    items: [
      {
        itemNumber: 1,
        hsCode: '853210',
        description: 'Card No',
        quantity: 1,
        unit: 'UNIT',
        unitPrice: 20100.00,
        totalPrice: 20100.00,
        currency: 'JOD',
        tariffBand: '001',
        dutyRate: 0,
        dutyAmount: 0,
        taxRate: 0,
        taxAmount: 0,
        totalAmount: 20100.00,
        percentageOfTotal: 100,
      },
    ],
    summary: {
      totalGoodsValue: 20100.00,
      shippingCost: 0,
      insurance: 0,
      customsDuty: 412.20,
      tax: 3928.35,
      additionalFees: 0,
      totalAmount: 24440.55,
      currency: 'JOD',
    },
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // حساب النسب المئوية
  const itemsWithPercentages = useMemo(() => {
    const total = declaration.items.reduce((sum, item) => sum + item.totalPrice, 0);
    return declaration.items.map((item) => ({
      ...item,
      percentageOfTotal: total > 0 ? (item.totalPrice / total) * 100 : 0,
    }));
  }, [declaration.items]);

  // حساب الإجماليات
  const totals = useMemo(() => {
    return {
      quantity: declaration.items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: declaration.items.reduce((sum, item) => sum + item.totalPrice, 0),
      totalDuty: declaration.items.reduce((sum, item) => sum + item.dutyAmount, 0),
      totalTax: declaration.items.reduce((sum, item) => sum + item.taxAmount, 0),
      totalAmount: declaration.items.reduce((sum, item) => sum + item.totalAmount, 0),
    };
  }, [declaration.items]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">البيان الجمركي</h1>
              <p className="text-slate-600">رقم البيان: {declaration.declarationNumber}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                تحميل PDF
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Printer className="w-4 h-4" />
                طباعة
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setImportDialogOpen(true)}
              >
                <FileUp className="w-4 h-4" />
                استيراد
              </Button>
            </div>
          </div>
        </div>

        {/* التبويبات */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="items">الأصناف</TabsTrigger>
            <TabsTrigger value="financial">الملخص المالي</TabsTrigger>
            <TabsTrigger value="distribution">توزيع القيم</TabsTrigger>
          </TabsList>

          {/* تبويب النظرة العامة */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* معلومات البيان */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معلومات البيان</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">رقم البيان</p>
                      <p className="font-semibold text-slate-900">{declaration.declarationNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">التاريخ</p>
                      <p className="font-semibold text-slate-900">{declaration.declarationDate}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-slate-600">مركز التخليص</p>
                      <p className="font-semibold text-slate-900">{declaration.clearanceCenter}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* معلومات المستورد */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معلومات المستورد</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">اسم المستورد</p>
                    <p className="font-semibold text-slate-900">{declaration.importerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">الرقم الضريبي</p>
                    <p className="font-semibold text-slate-900">{declaration.importerTaxNumber}</p>
                  </div>
                </CardContent>
              </Card>

              {/* معلومات المصدر */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معلومات المصدر</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">الشركة المصدرة</p>
                    <p className="font-semibold text-slate-900">{declaration.exporterCompany}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">دولة التصدير</p>
                    <p className="font-semibold text-slate-900">{declaration.exporterCountry}</p>
                  </div>
                </CardContent>
              </Card>

              {/* معلومات الشحنة */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">معلومات الشحنة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">رقم الحاوية</p>
                      <p className="font-semibold text-slate-900 text-sm">{declaration.containerNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">بوليصة الشحن</p>
                      <p className="font-semibold text-slate-900">{declaration.billOfLadingNumber}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-slate-600">شركة الشحن</p>
                      <p className="font-semibold text-slate-900">{declaration.shippingCompany}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* معلومات الأوزان والطرود */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">الأوزان والطرود</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">الوزن القائم</p>
                      <p className="font-semibold text-slate-900">{declaration.grossWeight} كغم</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">الوزن الصافي</p>
                      <p className="font-semibold text-slate-900">{declaration.netWeight} كغم</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">عدد الطرود</p>
                      <p className="font-semibold text-slate-900">{declaration.packageCount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">نوع الطرود</p>
                      <p className="font-semibold text-slate-900">{declaration.packageType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب الأصناف */}
          <TabsContent value="items" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>جدول الأصناف والبنود</CardTitle>
                <CardDescription>تفاصيل جميع الأصناف المشمولة في البيان الجمركي</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-100">
                        <TableHead className="text-right">البند</TableHead>
                        <TableHead className="text-right">رمز HS</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-center">الكمية</TableHead>
                        <TableHead className="text-center">الوحدة</TableHead>
                        <TableHead className="text-left">سعر الوحدة</TableHead>
                        <TableHead className="text-left">السعر الإجمالي</TableHead>
                        <TableHead className="text-center">%</TableHead>
                        <TableHead className="text-left">العملة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itemsWithPercentages.map((item) => (
                        <TableRow key={item.itemNumber} className="hover:bg-slate-50">
                          <TableCell className="text-right font-medium">{item.itemNumber}</TableCell>
                          <TableCell className="text-right">{item.hsCode}</TableCell>
                          <TableCell className="text-right">{item.description}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-center">{item.unit}</TableCell>
                          <TableCell className="text-left">{item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-left font-semibold">{item.totalPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-center">{item.percentageOfTotal.toFixed(1)}%</TableCell>
                          <TableCell className="text-left">{item.currency}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-slate-100 font-bold">
                        <TableCell colSpan={3} className="text-right">الإجمالي</TableCell>
                        <TableCell className="text-center">{totals.quantity}</TableCell>
                        <TableCell></TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-left">{totals.totalPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-center">100%</TableCell>
                        <TableCell className="text-left">JOD</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الملخص المالي */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل التكاليف</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-slate-600">قيمة البضاعة</span>
                      <span className="font-semibold">{declaration.summary.totalGoodsValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-slate-600">الشحن والتأمين</span>
                      <span className="font-semibold">{(declaration.summary.shippingCost + declaration.summary.insurance).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-slate-600">الرسوم الجمركية</span>
                      <span className="font-semibold text-orange-600">{declaration.summary.customsDuty.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-slate-600">الضريبة</span>
                      <span className="font-semibold text-orange-600">{declaration.summary.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-slate-600">رسوم إضافية</span>
                      <span className="font-semibold">{declaration.summary.additionalFees.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 bg-slate-100 p-3 rounded-lg">
                      <span className="font-bold text-slate-900">الإجمالي النهائي</span>
                      <span className="font-bold text-lg text-slate-900">{declaration.summary.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات مالية</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-900">نسبة الرسوم</span>
                      <span className="font-bold text-blue-600">
                        {((declaration.summary.customsDuty / declaration.summary.totalGoodsValue) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-green-900">نسبة الضريبة</span>
                      <span className="font-bold text-green-600">
                        {((declaration.summary.tax / (declaration.summary.totalGoodsValue + declaration.summary.customsDuty)) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-900">إجمالي الرسوم والضرائب</span>
                      <span className="font-bold text-purple-600">
                        {(declaration.summary.customsDuty + declaration.summary.tax).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <span className="text-amber-900">التكلفة الإضافية</span>
                      <span className="font-bold text-amber-600">
                        {((declaration.summary.customsDuty + declaration.summary.tax) / declaration.summary.totalGoodsValue * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب توزيع القيم */}
          <TabsContent value="distribution" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع القيم والرسوم على الأصناف</CardTitle>
                <CardDescription>توزيع الرسوم والضرائب حسب نسبة كل صنف من إجمالي القيمة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-100">
                        <TableHead className="text-right">البند</TableHead>
                        <TableHead className="text-right">الوصف</TableHead>
                        <TableHead className="text-center">النسبة %</TableHead>
                        <TableHead className="text-left">السعر الأصلي</TableHead>
                        <TableHead className="text-left">الرسوم المخصصة</TableHead>
                        <TableHead className="text-left">الضريبة المخصصة</TableHead>
                        <TableHead className="text-left">السعر النهائي</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {itemsWithPercentages.map((item) => {
                        const allocatedDuty = declaration.summary.customsDuty * (item.percentageOfTotal / 100);
                        const allocatedTax = declaration.summary.tax * (item.percentageOfTotal / 100);
                        const finalPrice = item.totalPrice + allocatedDuty + allocatedTax;

                        return (
                          <TableRow key={item.itemNumber} className="hover:bg-slate-50">
                            <TableCell className="text-right font-medium">{item.itemNumber}</TableCell>
                            <TableCell className="text-right">{item.description}</TableCell>
                            <TableCell className="text-center font-semibold">{item.percentageOfTotal.toFixed(1)}%</TableCell>
                            <TableCell className="text-left">{item.totalPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-left text-orange-600 font-semibold">{allocatedDuty.toFixed(2)}</TableCell>
                            <TableCell className="text-left text-orange-600 font-semibold">{allocatedTax.toFixed(2)}</TableCell>
                            <TableCell className="text-left font-bold text-slate-900">{finalPrice.toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-slate-100 font-bold">
                        <TableCell colSpan={3} className="text-right">الإجمالي</TableCell>
                        <TableCell className="text-left">{totals.totalPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-left text-orange-600">{declaration.summary.customsDuty.toFixed(2)}</TableCell>
                        <TableCell className="text-left text-orange-600">{declaration.summary.tax.toFixed(2)}</TableCell>
                        <TableCell className="text-left text-slate-900">{declaration.summary.totalAmount.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* مربع حوار استيراد PDF */}
        <PdfImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          onDataImported={(data) => {
            // تحديث البيانات من الملف المستورد
            console.log('البيانات المستخرجة من PDF:', data);
          }}
        />
      </div>
    </div>
  );
}

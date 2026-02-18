import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Download,
  Eye,
  Printer,
  Search,
  Filter,
  Plus,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  date: string;
  gateway: string;
}

export default function InvoicesAndReceipts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-1708315294000-A7K9X2B1',
      orderId: 'ORD-001',
      customerId: 'CUST-001',
      amount: 5000,
      currency: 'JOD',
      status: 'paid',
      date: '2026-02-18',
      gateway: 'HyperPay',
    },
    {
      id: '2',
      invoiceNumber: 'INV-1708315400000-B3M7Q5C2',
      orderId: 'ORD-002',
      customerId: 'CUST-002',
      amount: 3500,
      currency: 'JOD',
      status: 'paid',
      date: '2026-02-18',
      gateway: 'Telr',
    },
    {
      id: '3',
      invoiceNumber: 'INV-1708315500000-D9L2R8E3',
      orderId: 'ORD-003',
      customerId: 'CUST-003',
      amount: 2750,
      currency: 'USD',
      status: 'pending',
      date: '2026-02-17',
      gateway: 'HyperPay',
    },
    {
      id: '4',
      invoiceNumber: 'INV-1708315600000-F5N4S1G4',
      orderId: 'ORD-004',
      customerId: 'CUST-004',
      amount: 4200,
      currency: 'JOD',
      status: 'refunded',
      date: '2026-02-16',
      gateway: 'Telr',
    },
  ]);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            مدفوع
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            قيد الانتظار
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            ملغى
          </Badge>
        );
      case 'refunded':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <RefreshCw className="w-3 h-3 mr-1" />
            مسترجع
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleDownloadInvoice = (invoiceNumber: string) => {
    console.log('تحميل الفاتورة:', invoiceNumber);
    // سيتم تنفيذ التحميل الفعلي لاحقاً
  };

  const handlePrintInvoice = (invoiceNumber: string) => {
    console.log('طباعة الفاتورة:', invoiceNumber);
    // سيتم تنفيذ الطباعة الفعلية لاحقاً
  };

  const handleViewReceipt = (invoiceNumber: string) => {
    console.log('عرض الإيصال:', invoiceNumber);
    // سيتم تنفيذ عرض الإيصال لاحقاً
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            الفواتير والإيصالات
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            إدارة وتتبع جميع الفواتير والإيصالات
          </p>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الفواتير</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                فاتورة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المدفوعة</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invoices.filter(inv => inv.status === 'paid').length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                فاتورة مدفوعة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invoices.filter(inv => inv.status === 'pending').length}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                فاتورة معلقة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الإجمالي</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString('ar-JO')}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                د.ا
              </p>
            </CardContent>
          </Card>
        </div>

        {/* الفلاتر والبحث */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-64">
            <Input
              placeholder="ابحث عن رقم الفاتورة أو الطلب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="paid">مدفوع</SelectItem>
              <SelectItem value="pending">قيد الانتظار</SelectItem>
              <SelectItem value="cancelled">ملغى</SelectItem>
              <SelectItem value="refunded">مسترجع</SelectItem>
            </SelectContent>
          </Select>

          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            فاتورة جديدة
          </Button>
        </div>

        {/* جدول الفواتير */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الفواتير</CardTitle>
            <CardDescription>
              {filteredInvoices.length} فاتورة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4">رقم الفاتورة</th>
                    <th className="text-right py-3 px-4">رقم الطلب</th>
                    <th className="text-right py-3 px-4">العميل</th>
                    <th className="text-right py-3 px-4">المبلغ</th>
                    <th className="text-right py-3 px-4">الحالة</th>
                    <th className="text-right py-3 px-4">البوابة</th>
                    <th className="text-right py-3 px-4">التاريخ</th>
                    <th className="text-right py-3 px-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-4 font-semibold text-blue-600">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="py-3 px-4">{invoice.orderId}</td>
                        <td className="py-3 px-4">{invoice.customerId}</td>
                        <td className="py-3 px-4 font-semibold">
                          {invoice.amount.toLocaleString('ar-JO')} {invoice.currency}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="py-3 px-4">{invoice.gateway}</td>
                        <td className="py-3 px-4">{invoice.date}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewReceipt(invoice.invoiceNumber)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              title="عرض الإيصال"
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDownloadInvoice(invoice.invoiceNumber)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              title="تحميل الفاتورة"
                            >
                              <Download className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => handlePrintInvoice(invoice.invoiceNumber)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              title="طباعة الفاتورة"
                            >
                              <Printer className="w-4 h-4 text-purple-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-600 dark:text-gray-400">
                        لا توجد فواتير تطابق البحث
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* معلومات إضافية */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            جميع الفواتير والإيصالات يتم إنشاؤها تلقائياً عند إتمام عملية الدفع. يمكنك تحميلها أو طباعتها أو عرض الإيصالات الخاصة بها.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Download,
  Send,
  Eye,
  Copy,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Mail,
  MessageSquare,
  Settings,
  MoreVertical,
} from 'lucide-react';

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  tax: number;
  total: number;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: number;
  format: string;
}

export default function AdvancedInvoicing() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      number: 'INV-2026-001',
      client: 'شركة الأردن للشحن',
      amount: 5000,
      tax: 500,
      total: 5500,
      date: '2026-02-18',
      dueDate: '2026-03-18',
      status: 'paid',
      items: 5,
      format: 'PDF',
    },
    {
      id: '2',
      number: 'INV-2026-002',
      client: 'مؤسسة الجمارك الأردنية',
      amount: 3200,
      tax: 320,
      total: 3520,
      date: '2026-02-17',
      dueDate: '2026-03-17',
      status: 'sent',
      items: 3,
      format: 'Excel',
    },
    {
      id: '3',
      number: 'INV-2026-003',
      client: 'شركة النقل الدولية',
      amount: 7500,
      tax: 750,
      total: 8250,
      date: '2026-02-16',
      dueDate: '2026-03-16',
      status: 'overdue',
      items: 8,
      format: 'PDF',
    },
    {
      id: '4',
      number: 'INV-2026-004',
      client: 'مستودعات عمّان',
      amount: 2100,
      tax: 210,
      total: 2310,
      date: '2026-02-15',
      dueDate: '2026-03-15',
      status: 'draft',
      items: 2,
      format: 'PDF',
    },
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvoices = invoices.filter(inv =>
    inv.number.includes(searchQuery) ||
    inv.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'sent':
        return <Send className="w-5 h-5 text-blue-500" />;
      case 'draft':
        return <FileText className="w-5 h-5 text-gray-500" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'مدفوعة';
      case 'sent':
        return 'مرسلة';
      case 'draft':
        return 'مسودة';
      case 'overdue':
        return 'متأخرة';
      case 'cancelled':
        return 'ملغاة';
      default:
        return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return '';
    }
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled').reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              نظام الفواتير المتقدم
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إنشاء وإدارة الفواتير بصيغ متعددة
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            فاتورة جديدة
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">الإجمالي</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${totalAmount.toFixed(0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">مدفوعة</p>
                <p className="text-3xl font-bold text-green-600">
                  ${paidAmount.toFixed(0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">قيد الانتظار</p>
                <p className="text-3xl font-bold text-yellow-600">
                  ${pendingAmount.toFixed(0)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي الفواتير</p>
                <p className="text-3xl font-bold text-purple-600">
                  {invoices.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* قائمة الفواتير */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  الفواتير
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* البحث */}
                <div className="relative">
                  <Input
                    placeholder="ابحث عن فاتورة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* قائمة الفواتير */}
                <div className="space-y-3">
                  {filteredInvoices.map(invoice => (
                    <div
                      key={invoice.id}
                      onClick={() => setSelectedInvoice(invoice)}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {getStatusIcon(invoice.status)}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {invoice.number}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {invoice.client}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline">{invoice.items} بند</Badge>
                              <Badge className={getStatusColor(invoice.status)}>
                                {getStatusLabel(invoice.status)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            ${invoice.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {invoice.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* تفاصيل الفاتورة */}
          <div>
            {selectedInvoice ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(selectedInvoice.status)}
                    {selectedInvoice.number}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">العميل</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedInvoice.client}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">المبلغ</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>الأساسي:</span>
                        <span className="font-bold">${selectedInvoice.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>الضريبة:</span>
                        <span className="font-bold">${selectedInvoice.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                        <span>الإجمالي:</span>
                        <span className="font-bold text-lg text-blue-600">${selectedInvoice.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">التواريخ</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center justify-between">
                        <span>التاريخ:</span>
                        <span>{selectedInvoice.date}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>الاستحقاق:</span>
                        <span>{selectedInvoice.dueDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">الصيغة</p>
                    <Badge variant="outline">{selectedInvoice.format}</Badge>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                    <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                      <Download className="w-4 h-4" />
                      تحميل PDF
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <Mail className="w-4 h-4" />
                      إرسال بريد
                    </Button>
                    <Button variant="outline" className="w-full gap-2">
                      <MessageSquare className="w-4 h-4" />
                      إرسال SMS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    اختر فاتورة لعرض التفاصيل
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: يمكنك إنشاء فواتير بصيغ متعددة (PDF، Excel، CSV) وإرسالها مباشرة عبر البريد الإلكتروني أو الرسائل النصية. استخدم القوالب المخصصة لتحسين العلامة التجارية.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  FileText,
  Plus,
  Send,
  Download,
  Settings,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Mail,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Filter,
  Search,
  Copy,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  items: number;
  paymentMethod: string;
}

interface InvoiceTemplate {
  id: string;
  name: string;
  category: string;
  format: string;
  status: 'active' | 'inactive';
  usageCount: number;
  lastUsed: string;
}

export default function AutomatedInvoicing() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2026-001',
      customerName: 'أحمد محمد',
      amount: 1250,
      date: '2026-02-15',
      dueDate: '2026-03-15',
      status: 'paid',
      items: 5,
      paymentMethod: 'HyperPay',
    },
    {
      id: '2',
      invoiceNumber: 'INV-2026-002',
      customerName: 'فاطمة علي',
      amount: 890,
      date: '2026-02-16',
      dueDate: '2026-03-16',
      status: 'pending',
      items: 3,
      paymentMethod: 'Telr',
    },
    {
      id: '3',
      invoiceNumber: 'INV-2026-003',
      customerName: 'محمود حسن',
      amount: 2150,
      date: '2026-02-10',
      dueDate: '2026-03-10',
      status: 'overdue',
      items: 8,
      paymentMethod: 'Bank Transfer',
    },
    {
      id: '4',
      invoiceNumber: 'INV-2026-004',
      customerName: 'سارة أحمد',
      amount: 1500,
      date: '2026-02-18',
      dueDate: '2026-03-18',
      status: 'draft',
      items: 4,
      paymentMethod: 'Credit Card',
    },
  ]);

  const [templates, setTemplates] = useState<InvoiceTemplate[]>([
    {
      id: '1',
      name: 'فاتورة الشحن القياسية',
      category: 'Shipping',
      format: 'PDF',
      status: 'active',
      usageCount: 45,
      lastUsed: '2026-02-18',
    },
    {
      id: '2',
      name: 'فاتورة الجمارك المتقدمة',
      category: 'Customs',
      format: 'Excel',
      status: 'active',
      usageCount: 32,
      lastUsed: '2026-02-17',
    },
    {
      id: '3',
      name: 'فاتورة الخدمات',
      category: 'Services',
      format: 'PDF',
      status: 'active',
      usageCount: 28,
      lastUsed: '2026-02-16',
    },
  ]);

  const invoiceData = [
    { month: 'يناير', paid: 12500, pending: 3200, overdue: 1500 },
    { month: 'فبراير', paid: 15800, pending: 4500, overdue: 2100 },
    { month: 'مارس', paid: 18900, pending: 5200, overdue: 1800 },
    { month: 'أبريل', paid: 21200, pending: 6100, overdue: 2500 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'مدفوع';
      case 'pending':
        return 'قيد الانتظار';
      case 'overdue':
        return 'متأخر';
      case 'draft':
        return 'مسودة';
      case 'active':
        return 'نشط';
      case 'inactive':
        return 'غير نشط';
      default:
        return '';
    }
  };

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(i => i.status === 'paid').length;
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0);
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              نظام الفواتير الآلي المتقدم
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              إدارة الفواتير والدفع الفوري والإرسال الآلي
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            فاتورة جديدة
          </Button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي الفواتير</p>
                <p className="text-3xl font-bold text-blue-600">{totalInvoices}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p className="text-gray-600 text-sm">فواتير مدفوعة</p>
                <p className="text-3xl font-bold text-green-600">{paidInvoices}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">مبلغ قيد الانتظار</p>
                <p className="text-2xl font-bold text-yellow-600">${pendingAmount}K</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-red-500 mb-2" />
                <p className="text-gray-600 text-sm">مبلغ متأخر</p>
                <p className="text-2xl font-bold text-red-600">${overdueAmount}K</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <p className="text-gray-600 text-sm">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-purple-600">${totalRevenue}K</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الرسم البياني للفواتير */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              اتجاهات الفواتير والدفع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={invoiceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="paid" stroke="#10b981" name="مدفوع" />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="قيد الانتظار" />
                <Line type="monotone" dataKey="overdue" stroke="#ef4444" name="متأخر" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* قائمة الفواتير */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                الفواتير الأخيرة
              </CardTitle>
              <input
                type="text"
                placeholder="ابحث عن فاتورة..."
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoices.map(invoice => (
              <div
                key={invoice.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </h3>
                    <Badge className={getStatusColor(invoice.status)}>
                      {getStatusLabel(invoice.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    العميل: {invoice.customerName}
                  </p>
                  <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span>المبلغ: ${invoice.amount}</span>
                    <span>التاريخ: {invoice.date}</span>
                    <span>تاريخ الاستحقاق: {invoice.dueDate}</span>
                    <span>طريقة الدفع: {invoice.paymentMethod}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* قوالب الفواتير */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              قوالب الفواتير
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map(template => (
              <div
                key={template.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      الفئة: {template.category} | الصيغة: {template.format}
                    </p>
                  </div>
                  <Badge className={getStatusColor(template.status)}>
                    {getStatusLabel(template.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">عدد الاستخدامات</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{template.usageCount}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs">آخر استخدام</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{template.lastUsed}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1">
                    <Edit className="w-4 h-4" />
                    تعديل
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Copy className="w-4 h-4" />
                    نسخ
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1">
                    <Eye className="w-4 h-4" />
                    معاينة
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* الإعدادات الآلية */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              الإعدادات الآلية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                  إرسال الفواتير تلقائياً عند
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>الإنشاء</option>
                  <option>الموافقة</option>
                  <option>الدفع الجزئي</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                  طريقة الإرسال
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>بريد إلكتروني + رسالة نصية</option>
                  <option>بريد إلكتروني فقط</option>
                  <option>رسالة نصية فقط</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                  تذكيرات الفواتير المتأخرة
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>يومي</option>
                  <option>كل 3 أيام</option>
                  <option>أسبوعي</option>
                  <option>معطل</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                  صيغة التصدير الافتراضية
                </label>
                <select className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                  <option>PDF</option>
                  <option>Excel</option>
                  <option>CSV</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="gap-2">
                <CheckCircle className="w-4 h-4" />
                حفظ الإعدادات
              </Button>
              <Button variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                إعادة تعيين
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* نصائح مفيدة */}
        <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            💡 نصيحة: استخدم الإرسال الآلي للفواتير لتوفير الوقت وتحسين معدلات الدفع. تابع الفواتير المتأخرة وأرسل تذكيرات دورية للعملاء.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

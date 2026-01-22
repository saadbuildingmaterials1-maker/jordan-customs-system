import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, FileText, Printer, Search, Plus, Edit2, Trash2, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/formatting";

// دالة تنسيق الأرقام العربية
const formatNumberArabic = (num: number): string => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => arabicNumbers[parseInt(d)] || d).join('');
};

// دالة تنسيق العملة العربية
const formatCurrencyArabic = (amount: number): string => {
  return formatCurrency(amount);
};

/**
 * لوحة تحكم المحاسبة المتكاملة
 * عرض الحسابات والحركات والتقارير المالية مع رسوم بيانية تفاعلية
 */

export default function AccountingDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("accounts");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState("all");

  // بيانات تجريبية للحسابات
  const accountsData = [
    { code: "101", name: "الصندوق", type: "asset", balance: 50000, currency: "JOD" },
    { code: "102", name: "البنك - دينار أردني", type: "asset", balance: 250000, currency: "JOD" },
    { code: "105", name: "الذمم المدينة", type: "asset", balance: 120000, currency: "JOD" },
    { code: "106", name: "المخزون", type: "asset", balance: 350000, currency: "JOD" },
    { code: "301", name: "الذمم الدائنة", type: "liability", balance: -180000, currency: "JOD" },
    { code: "302", name: "رسوم جمركية مستحقة", type: "liability", balance: -45000, currency: "JOD" },
    { code: "303", name: "ضريبة المبيعات مستحقة", type: "liability", balance: -32000, currency: "JOD" },
    { code: "501", name: "رأس المال", type: "equity", balance: 500000, currency: "JOD" },
    { code: "601", name: "المبيعات المحلية", type: "revenue", balance: 450000, currency: "JOD" },
    { code: "602", name: "مبيعات التصدير", type: "revenue", balance: 280000, currency: "JOD" },
    { code: "701", name: "تكلفة شراء البضاعة", type: "cogs", balance: -200000, currency: "JOD" },
    { code: "801", name: "مصاريف إدارية", type: "expense", balance: -85000, currency: "JOD" },
  ];

  // بيانات تجريبية للحركات
  const transactionsData = [
    { id: 1, date: "2026-01-22", description: "فاتورة مبيعات #001", debit: 50000, credit: 0, account: "102" },
    { id: 2, date: "2026-01-21", description: "دفع رسوم جمركية", debit: 0, credit: 15000, account: "301" },
    { id: 3, date: "2026-01-20", description: "شراء بضاعة", debit: 120000, credit: 0, account: "106" },
    { id: 4, date: "2026-01-19", description: "تحويل بنكي", debit: 75000, credit: 0, account: "102" },
    { id: 5, date: "2026-01-18", description: "دفع رواتب", debit: 0, credit: 25000, account: "801" },
  ];

  // بيانات التقارير المالية
  const incomeStatementData = {
    revenues: 730000,
    cogs: 200000,
    grossProfit: 530000,
    expenses: 85000,
    netProfit: 445000,
  };

  const balanceSheetData = {
    assets: 770000,
    liabilities: 257000,
    equity: 513000,
  };

  // بيانات الرسوم البيانية
  const accountTypeChart = [
    { name: "الأصول", value: 770000, fill: "#3b82f6" },
    { name: "الالتزامات", value: 257000, fill: "#ef4444" },
    { name: "حقوق الملكية", value: 513000, fill: "#10b981" },
  ];

  const monthlyRevenueChart = [
    { month: "يناير", revenue: 450000, expenses: 85000 },
    { month: "ديسمبر", revenue: 420000, expenses: 78000 },
    { month: "نوفمبر", revenue: 380000, expenses: 72000 },
    { month: "أكتوبر", revenue: 350000, expenses: 65000 },
  ];

  const filteredAccounts = accountsData.filter((account) => {
    const matchesSearch =
      account.name.includes(searchTerm) || account.code.includes(searchTerm);
    const matchesType = selectedAccountType === "all" || account.type === selectedAccountType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">لوحة تحكم المحاسبة</h1>
          <p className="text-slate-600">إدارة الحسابات والحركات والتقارير المالية</p>
        </div>

        {/* بطاقات الملخص */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">إجمالي الأصول</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrencyArabic(balanceSheetData.assets)}
              </div>
              <p className="text-xs text-slate-500 mt-1">دينار أردني</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">إجمالي الالتزامات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrencyArabic(balanceSheetData.liabilities)}
              </div>
              <p className="text-xs text-slate-500 mt-1">دينار أردني</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">حقوق الملكية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrencyArabic(balanceSheetData.equity)}
              </div>
              <p className="text-xs text-slate-500 mt-1">دينار أردني</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">صافي الربح</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrencyArabic(incomeStatementData.netProfit)}
              </div>
              <p className="text-xs text-slate-500 mt-1">دينار أردني</p>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* الرسم البياني الدائري */}
          <Card>
            <CardHeader>
              <CardTitle>هيكل الميزانية العمومية</CardTitle>
              <CardDescription>توزيع الأصول والالتزامات وحقوق الملكية</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={accountTypeChart}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatNumberArabic(value / 1000)}ك`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {accountTypeChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrencyArabic(typeof value === 'number' ? value : 0)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* رسم بياني الإيرادات والمصاريف */}
          <Card>
            <CardHeader>
              <CardTitle>الإيرادات والمصاريف الشهرية</CardTitle>
              <CardDescription>مقارنة الإيرادات مع المصاريف</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenueChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrencyArabic(typeof value === 'number' ? value : 0)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" name="الإيرادات" />
                  <Bar dataKey="expenses" fill="#ef4444" name="المصاريف" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* التبويبات الرئيسية */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="accounts">الحسابات</TabsTrigger>
            <TabsTrigger value="transactions">الحركات</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
            <TabsTrigger value="audit">سجل التدقيق</TabsTrigger>
          </TabsList>

          {/* تبويب الحسابات */}
          <TabsContent value="accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الحسابات</CardTitle>
                <CardDescription>عرض وإدارة جميع حسابات النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* أدوات البحث والتصفية */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute right-3 top-3 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="ابحث عن حساب..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                    <Select value={selectedAccountType} onValueChange={setSelectedAccountType}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="نوع الحساب" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الأنواع</SelectItem>
                        <SelectItem value="asset">أصول</SelectItem>
                        <SelectItem value="liability">التزامات</SelectItem>
                        <SelectItem value="equity">حقوق ملكية</SelectItem>
                        <SelectItem value="revenue">إيرادات</SelectItem>
                        <SelectItem value="expense">مصاريف</SelectItem>
                        <SelectItem value="cogs">تكلفة البضاعة</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 ml-2" />
                      حساب جديد
                    </Button>
                  </div>

                  {/* جدول الحسابات */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-3 text-right font-semibold text-slate-700">الرمز</th>
                          <th className="px-4 py-3 text-right font-semibold text-slate-700">اسم الحساب</th>
                          <th className="px-4 py-3 text-right font-semibold text-slate-700">النوع</th>
                          <th className="px-4 py-3 text-right font-semibold text-slate-700">الرصيد</th>
                          <th className="px-4 py-3 text-right font-semibold text-slate-700">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAccounts.map((account) => (
                          <tr key={account.code} className="border-b border-slate-200 hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono text-slate-900">{account.code}</td>
                            <td className="px-4 py-3 text-slate-900">{account.name}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {account.type}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {formatCurrencyArabic(account.balance)}
                            </td>
                            <td className="px-4 py-3 flex gap-2">
                              <Button size="sm" variant="ghost">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب الحركات */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>الحركات المحاسبية</CardTitle>
                <CardDescription>عرض جميع الحركات المسجلة في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-right font-semibold text-slate-700">التاريخ</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-700">الوصف</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-700">مدين</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-700">دائن</th>
                        <th className="px-4 py-3 text-right font-semibold text-slate-700">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionsData.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-900">{transaction.date}</td>
                          <td className="px-4 py-3 text-slate-900">{transaction.description}</td>
                          <td className="px-4 py-3 text-green-600 font-semibold">
                            {transaction.debit > 0 ? formatCurrencyArabic(transaction.debit) : "-"}
                          </td>
                          <td className="px-4 py-3 text-red-600 font-semibold">
                            {transaction.credit > 0 ? formatCurrencyArabic(transaction.credit) : "-"}
                          </td>
                          <td className="px-4 py-3 flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب التقارير */}
          <TabsContent value="reports" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* قائمة الدخل */}
              <Card>
                <CardHeader>
                  <CardTitle>قائمة الدخل</CardTitle>
                  <CardDescription>للفترة من 2026-01-01 إلى 2026-01-22</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-slate-600">الإيرادات</span>
                    <span className="font-semibold">{formatCurrencyArabic(incomeStatementData.revenues)}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b text-red-600">
                    <span>تكلفة البضاعة المباعة</span>
                    <span className="font-semibold">({formatCurrencyArabic(incomeStatementData.cogs)})</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b font-semibold">
                    <span>الربح الإجمالي</span>
                    <span>{formatCurrencyArabic(incomeStatementData.grossProfit)}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b text-red-600">
                    <span>المصاريف التشغيلية</span>
                    <span className="font-semibold">({formatCurrencyArabic(incomeStatementData.expenses)})</span>
                  </div>
                  <div className="flex justify-between pt-2 text-lg font-bold text-green-600">
                    <span>صافي الربح</span>
                    <span>{formatCurrencyArabic(incomeStatementData.netProfit)}</span>
                  </div>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 ml-2" />
                    تحميل التقرير
                  </Button>
                </CardContent>
              </Card>

              {/* الميزانية العمومية */}
              <Card>
                <CardHeader>
                  <CardTitle>الميزانية العمومية</CardTitle>
                  <CardDescription>كما في 2026-01-22</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="pb-3 border-b">
                    <div className="font-semibold text-slate-900 mb-2">الأصول</div>
                    <div className="flex justify-between text-slate-600">
                      <span>إجمالي الأصول</span>
                      <span className="font-semibold">{formatCurrencyArabic(balanceSheetData.assets)}</span>
                    </div>
                  </div>
                  <div className="pb-3 border-b">
                    <div className="font-semibold text-slate-900 mb-2">الالتزامات</div>
                    <div className="flex justify-between text-slate-600">
                      <span>إجمالي الالتزامات</span>
                      <span className="font-semibold">{formatCurrencyArabic(balanceSheetData.liabilities)}</span>
                    </div>
                  </div>
                  <div className="pb-3">
                    <div className="font-semibold text-slate-900 mb-2">حقوق الملكية</div>
                    <div className="flex justify-between text-slate-600">
                      <span>إجمالي حقوق الملكية</span>
                      <span className="font-semibold">{formatCurrencyArabic(balanceSheetData.equity)}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                    <Printer className="w-4 h-4 ml-2" />
                    طباعة التقرير
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب سجل التدقيق */}
          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>سجل التدقيق</CardTitle>
                <CardDescription>تتبع جميع التغييرات والعمليات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: "إنشاء", entity: "فاتورة مبيعات", user: "أحمد محمد", date: "2026-01-22 14:30" },
                    { action: "تعديل", entity: "حساب بنكي", user: "فاطمة علي", date: "2026-01-22 13:15" },
                    { action: "حذف", entity: "حركة محاسبية", user: "محمود سالم", date: "2026-01-22 11:45" },
                    { action: "موافقة", entity: "تقرير مالي", user: "إدارة", date: "2026-01-22 10:20" },
                  ].map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">
                          {log.action} - {log.entity}
                        </div>
                        <div className="text-sm text-slate-600">بواسطة: {log.user}</div>
                      </div>
                      <div className="text-sm text-slate-500">{log.date}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, FileText, TrendingUp, DollarSign, Package, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Reports() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Mock data for charts
  const monthlyData = [
    { month: "يناير", customs: 12500, suppliers: 8500, shipments: 15000 },
    { month: "فبراير", customs: 15000, suppliers: 9500, shipments: 18000 },
    { month: "مارس", customs: 18000, suppliers: 11000, shipments: 22000 },
    { month: "أبريل", customs: 16000, suppliers: 10000, shipments: 19000 },
    { month: "مايو", customs: 20000, suppliers: 12000, shipments: 25000 },
    { month: "يونيو", customs: 22000, suppliers: 13500, shipments: 28000 },
  ];

  const costDistribution = [
    { category: "رسوم جمركية", value: 45, color: "bg-blue-500" },
    { category: "ضريبة مبيعات", value: 30, color: "bg-green-500" },
    { category: "رسوم إضافية", value: 15, color: "bg-yellow-500" },
    { category: "رسوم بيان", value: 10, color: "bg-purple-500" },
  ];

  const topSuppliers = [
    { name: "شركة النقل الدولي", amount: 45000, shipments: 12 },
    { name: "الشحن السريع", amount: 38000, shipments: 10 },
    { name: "الخدمات اللوجستية", amount: 32000, shipments: 8 },
    { name: "النقل البحري", amount: 28000, shipments: 7 },
    { name: "الشحن الجوي", amount: 22000, shipments: 5 },
  ];

  const shipmentsByStatus = [
    { status: "قيد التخليص", count: 8, percentage: 25, color: "bg-orange-500" },
    { status: "قيد النقل", count: 12, percentage: 38, color: "bg-blue-500" },
    { status: "تم التسليم", count: 10, percentage: 31, color: "bg-green-500" },
    { status: "ملغاة", count: 2, percentage: 6, color: "bg-red-500" },
  ];

  const kpis = [
    {
      title: "إجمالي التكاليف الجمركية",
      value: "103,500 دينار",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "إجمالي مدفوعات الموردين",
      value: "165,000 دينار",
      change: "+8.3%",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "عدد الشحنات النشطة",
      value: "32",
      change: "+5",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "متوسط وقت التخليص",
      value: "4.2 يوم",
      change: "-0.8 يوم",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const handleExportPDF = () => {
    toast.success("جاري تصدير التقرير كملف PDF...");
    // TODO: Implement PDF export
  };

  const handleExportExcel = () => {
    toast.success("جاري تصدير التقرير كملف Excel...");
    // TODO: Implement Excel export
  };

  const maxMonthlyValue = Math.max(...monthlyData.flatMap(d => [d.customs, d.suppliers, d.shipments]));

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">التقارير والإحصائيات</h1>
        <p className="text-muted-foreground mt-2">
          تحليل شامل للتكاليف الجمركية والموردين والشحنات
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">من تاريخ</label>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2">إلى تاريخ</label>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full pr-10 pl-3 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleExportPDF} variant="outline">
              <FileText className="ml-2 h-4 w-4" />
              تصدير PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline">
              <Download className="ml-2 h-4 w-4" />
              تصدير Excel
            </Button>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${kpi.bgColor} p-3 rounded-lg`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
              <span className="text-sm font-medium text-green-600">{kpi.change}</span>
            </div>
            <h3 className="text-sm text-muted-foreground mb-1">{kpi.title}</h3>
            <p className="text-2xl font-bold">{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Monthly Costs Chart */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-6">التكاليف الشهرية</h2>
        <div className="space-y-6">
          {monthlyData.map((data) => (
            <div key={data.month}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{data.month}</span>
                <span className="text-sm text-muted-foreground">
                  {(data.customs + data.suppliers + data.shipments).toLocaleString()} دينار
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex gap-1">
                  <div
                    className="bg-blue-500 h-6 rounded transition-all"
                    style={{ width: `${(data.customs / maxMonthlyValue) * 100}%` }}
                    title={`رسوم جمركية: ${data.customs.toLocaleString()} دينار`}
                  />
                  <div
                    className="bg-green-500 h-6 rounded transition-all"
                    style={{ width: `${(data.suppliers / maxMonthlyValue) * 100}%` }}
                    title={`موردين: ${data.suppliers.toLocaleString()} دينار`}
                  />
                  <div
                    className="bg-purple-500 h-6 rounded transition-all"
                    style={{ width: `${(data.shipments / maxMonthlyValue) * 100}%` }}
                    title={`شحنات: ${data.shipments.toLocaleString()} دينار`}
                  />
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    رسوم جمركية
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    موردين
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-purple-500 rounded" />
                    شحنات
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Cost Distribution */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">توزيع التكاليف</h2>
          <div className="space-y-4">
            {costDistribution.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.category}</span>
                  <span className="text-sm text-muted-foreground">{item.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${item.color} h-3 rounded-full transition-all`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Shipments by Status */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">الشحنات حسب الحالة</h2>
          <div className="space-y-4">
            {shipmentsByStatus.map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.status}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.count} شحنة ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`${item.color} h-3 rounded-full transition-all`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Suppliers */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-6">أكثر الموردين نشاطاً</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-right py-3 px-4 font-medium">المورد</th>
                <th className="text-right py-3 px-4 font-medium">إجمالي المبلغ</th>
                <th className="text-right py-3 px-4 font-medium">عدد الشحنات</th>
                <th className="text-right py-3 px-4 font-medium">متوسط الشحنة</th>
              </tr>
            </thead>
            <tbody>
              {topSuppliers.map((supplier, index) => (
                <tr key={supplier.name} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {index + 1}
                      </div>
                      <span className="font-medium">{supplier.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{supplier.amount.toLocaleString()} دينار</td>
                  <td className="py-3 px-4">{supplier.shipments} شحنة</td>
                  <td className="py-3 px-4">
                    {Math.round(supplier.amount / supplier.shipments).toLocaleString()} دينار
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

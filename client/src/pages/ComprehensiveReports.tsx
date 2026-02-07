import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Filter, RefreshCw, TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// بيانات تجريبية للتقارير
const mockReports = [
  {
    id: 1,
    name: "تقرير الشحنات الشهري",
    type: "shipments",
    date: "2026-02-07",
    summary: "إجمالي الشحنات: 150، التكلفة الإجمالية: 45,000 JOD",
    data: [
      { month: "يناير", shipments: 120, cost: 35000 },
      { month: "فبراير", shipments: 150, cost: 45000 },
    ],
  },
  {
    id: 2,
    name: "تقرير الجمارك والضرائب",
    type: "customs",
    date: "2026-02-06",
    summary: "إجمالي الرسوم الجمركية: 12,500 JOD، الضرائب: 8,750 JOD",
    data: [
      { country: "السعودية", customs: 3500, taxes: 2450 },
      { country: "الإمارات", customs: 4200, taxes: 2940 },
      { country: "الكويت", customs: 2800, taxes: 1960 },
      { country: "قطر", customs: 2000, taxes: 1400 },
    ],
  },
  {
    id: 3,
    name: "تقرير الأسعار والتكاليف",
    type: "costs",
    date: "2026-02-05",
    summary: "متوسط تكلفة الشحن: 300 JOD، متوسط الرسوم: 83 JOD",
    data: [
      { week: "الأسبوع 1", shippingCost: 280, customsFees: 75, taxes: 52 },
      { week: "الأسبوع 2", shippingCost: 310, customsFees: 85, taxes: 59 },
      { week: "الأسبوع 3", shippingCost: 295, customsFees: 80, taxes: 56 },
      { week: "الأسبوع 4", shippingCost: 320, customsFees: 90, taxes: 63 },
    ],
  },
];

const COLORS = ["#667eea", "#764ba2", "#f093fb", "#4facfe"];

export function ComprehensiveReports() {
  const [selectedReport, setSelectedReport] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [reportType, setReportType] = useState("all");
  const [exportFormat, setExportFormat] = useState("pdf");

  const filteredReports = useMemo(() => {
    return mockReports.filter((report) => {
      const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = reportType === "all" || report.type === reportType;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, reportType]);

  const currentReport = selectedReport ? mockReports.find((r) => r.id === selectedReport) : null;

  const handleExport = (format: string) => {
    if (!currentReport) return;

    // محاكاة التصدير
    console.log(`تصدير التقرير "${currentReport.name}" بصيغة ${format}`);

    // هنا يتم إضافة منطق التصدير الفعلي
    // يمكن استخدام مكتبات مثل jsPDF و xlsx
    alert(`تم تصدير التقرير بصيغة ${format.toUpperCase()}`);
  };

  const handleRefresh = () => {
    console.log("تحديث التقارير...");
    alert("تم تحديث التقارير بنجاح");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* الرأس */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">التقارير الشاملة</h1>
          <p className="text-slate-400">عرض وتحليل التقارير المفصلة مع خيارات التصدير المتعددة</p>
        </div>

        {/* الفلاتر والبحث */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Input
            placeholder="البحث عن تقرير..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
          />

          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              <SelectItem value="all" className="text-white">
                جميع التقارير
              </SelectItem>
              <SelectItem value="shipments" className="text-white">
                تقارير الشحنات
              </SelectItem>
              <SelectItem value="customs" className="text-white">
                تقارير الجمارك
              </SelectItem>
              <SelectItem value="costs" className="text-white">
                تقارير التكاليف
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleRefresh}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            تحديث
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* قائمة التقارير */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  التقارير المتاحة
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {filteredReports.length} تقرير
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report.id)}
                    className={`w-full text-right p-3 rounded-lg transition-colors ${
                      selectedReport === report.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm opacity-75">{report.date}</div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* محتوى التقرير */}
          <div className="lg:col-span-2">
            {currentReport ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-slate-700 border-slate-600 mb-4">
                  <TabsTrigger value="overview" className="text-slate-300">
                    نظرة عامة
                  </TabsTrigger>
                  <TabsTrigger value="charts" className="text-slate-300">
                    الرسوم البيانية
                  </TabsTrigger>
                  <TabsTrigger value="export" className="text-slate-300">
                    التصدير
                  </TabsTrigger>
                </TabsList>

                {/* نظرة عامة */}
                <TabsContent value="overview">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white">{currentReport.name}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {currentReport.date}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <p className="text-slate-300">{currentReport.summary}</p>
                      </div>

                      {/* الإحصائيات السريعة */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-lg">
                          <div className="text-slate-300 text-sm">عدد البيانات</div>
                          <div className="text-white text-2xl font-bold">
                            {currentReport.data.length}
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-lg">
                          <div className="text-slate-300 text-sm">آخر تحديث</div>
                          <div className="text-white text-sm font-medium">
                            {new Date(currentReport.date).toLocaleDateString("ar-JO")}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* الرسوم البيانية */}
                <TabsContent value="charts">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        الرسوم البيانية
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentReport.type === "shipments" && (
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={currentReport.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis dataKey="month" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #475569",
                                borderRadius: "8px",
                              }}
                              labelStyle={{ color: "#e2e8f0" }}
                            />
                            <Legend />
                            <Area
                              type="monotone"
                              dataKey="shipments"
                              stroke="#667eea"
                              fill="#667eea"
                              fillOpacity={0.6}
                              name="عدد الشحنات"
                            />
                            <Area
                              type="monotone"
                              dataKey="cost"
                              stroke="#764ba2"
                              fill="#764ba2"
                              fillOpacity={0.6}
                              name="التكلفة"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      )}

                      {currentReport.type === "customs" && (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={currentReport.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis dataKey="country" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #475569",
                                borderRadius: "8px",
                              }}
                              labelStyle={{ color: "#e2e8f0" }}
                            />
                            <Legend />
                            <Bar dataKey="customs" fill="#667eea" name="الرسوم الجمركية" />
                            <Bar dataKey="taxes" fill="#764ba2" name="الضرائب" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}

                      {currentReport.type === "costs" && (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={currentReport.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis dataKey="week" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#1e293b",
                                border: "1px solid #475569",
                                borderRadius: "8px",
                              }}
                              labelStyle={{ color: "#e2e8f0" }}
                            />
                            <Legend />
                            <Bar dataKey="shippingCost" fill="#667eea" name="تكلفة الشحن" />
                            <Bar dataKey="customsFees" fill="#764ba2" name="الرسوم الجمركية" />
                            <Bar dataKey="taxes" fill="#f093fb" name="الضرائب" />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* التصدير */}
                <TabsContent value="export">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        خيارات التصدير
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        اختر صيغة التصدير المفضلة لديك
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={() => handleExport("pdf")}
                          className="p-4 bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg text-white transition-all"
                        >
                          <div className="font-bold mb-1">PDF</div>
                          <div className="text-sm opacity-90">تصدير بصيغة PDF</div>
                        </button>

                        <button
                          onClick={() => handleExport("excel")}
                          className="p-4 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg text-white transition-all"
                        >
                          <div className="font-bold mb-1">Excel</div>
                          <div className="text-sm opacity-90">تصدير بصيغة Excel</div>
                        </button>

                        <button
                          onClick={() => handleExport("csv")}
                          className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg text-white transition-all"
                        >
                          <div className="font-bold mb-1">CSV</div>
                          <div className="text-sm opacity-90">تصدير بصيغة CSV</div>
                        </button>

                        <button
                          onClick={() => handleExport("json")}
                          className="p-4 bg-gradient-to-br from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 rounded-lg text-white transition-all"
                        >
                          <div className="font-bold mb-1">JSON</div>
                          <div className="text-sm opacity-90">تصدير بصيغة JSON</div>
                        </button>
                      </div>

                      <div className="bg-slate-700 p-4 rounded-lg">
                        <p className="text-slate-300 text-sm">
                          يمكنك تصدير التقرير بصيغ متعددة لاستخدامه في تطبيقات أخرى أو مشاركته مع فريقك.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">اختر تقرير من القائمة لعرض التفاصيل</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

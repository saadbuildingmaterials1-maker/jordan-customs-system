import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from "lucide-react";

interface AnalyticsData {
  date: string;
  shippingCost: number;
  customsRate: number;
  taxRate: number;
  totalCost: number;
}

// بيانات تحليلية وهمية
const generateAnalyticsData = (): AnalyticsData[] => {
  const data: AnalyticsData[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      shippingCost: 50 + Math.random() * 100,
      customsRate: 5 + Math.random() * 20,
      taxRate: 10 + Math.random() * 15,
      totalCost: 150 + Math.random() * 200,
    });
  }

  return data;
};

// حساب المتوسط المتحرك
const calculateMovingAverage = (data: AnalyticsData[], days: number): number[] => {
  return data.map((_, index) => {
    const start = Math.max(0, index - days + 1);
    const subset = data.slice(start, index + 1);
    const sum = subset.reduce((acc, item) => acc + item.totalCost, 0);
    return sum / subset.length;
  });
};

// حساب التنبؤات
const calculateForecast = (data: AnalyticsData[], days: number): number[] => {
  const forecast: number[] = [];
  const lastValues = data.slice(-days).map(d => d.totalCost);
  const average = lastValues.reduce((a, b) => a + b, 0) / lastValues.length;
  const trend = (lastValues[lastValues.length - 1] - lastValues[0]) / lastValues.length;

  for (let i = 0; i < 7; i++) {
    forecast.push(average + trend * (i + 1) + (Math.random() - 0.5) * 20);
  }

  return forecast;
};

export function AdvancedAnalytics() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");
  const [selectedMetric, setSelectedMetric] = useState<"total" | "shipping" | "customs" | "tax">("total");

  const analyticsData = useMemo(() => generateAnalyticsData(), []);
  const movingAverage = useMemo(() => calculateMovingAverage(analyticsData, 7), [analyticsData]);
  const forecast = useMemo(() => calculateForecast(analyticsData, 7), [analyticsData]);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const costs = analyticsData.map(d => d.totalCost);
    const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
    const maxCost = Math.max(...costs);
    const minCost = Math.min(...costs);
    const trend = costs[costs.length - 1] - costs[0];
    const trendPercent = (trend / costs[0]) * 100;

    return {
      avgCost: avgCost.toFixed(2),
      maxCost: maxCost.toFixed(2),
      minCost: minCost.toFixed(2),
      trend: trend.toFixed(2),
      trendPercent: trendPercent.toFixed(1),
    };
  }, [analyticsData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* الرأس */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">لوحة التحليلات المتقدمة</h1>
          <p className="text-slate-400">تحليل شامل لأسعار الشحن والجمارك مع التنبؤات</p>
        </div>

        {/* المرشحات */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex gap-2">
            {["7d", "30d", "90d"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range as "7d" | "30d" | "90d")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  dateRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {range === "7d" ? "7 أيام" : range === "30d" ? "30 يوم" : "90 يوم"}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {["total", "shipping", "customs", "tax"].map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric as "total" | "shipping" | "customs" | "tax")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedMetric === metric
                    ? "bg-purple-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {metric === "total" ? "المجموع" : metric === "shipping" ? "الشحن" : metric === "customs" ? "الجمارك" : "الضريبة"}
              </button>
            ))}
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">متوسط التكلفة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.avgCost} JOD</div>
              <p className="text-xs text-slate-500 mt-1">آخر 30 يوم</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">أعلى تكلفة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.maxCost} JOD</div>
              <p className="text-xs text-slate-500 mt-1">في الفترة المحددة</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">أقل تكلفة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.minCost} JOD</div>
              <p className="text-xs text-slate-500 mt-1">في الفترة المحددة</p>
            </CardContent>
          </Card>

          <Card className={`${parseFloat(stats.trend) >= 0 ? "bg-red-900/30 border-red-700" : "bg-green-900/30 border-green-700"}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-400">الاتجاه</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {parseFloat(stats.trend) >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-red-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-green-500" />
                )}
                <div>
                  <div className={`text-2xl font-bold ${parseFloat(stats.trend) >= 0 ? "text-red-400" : "text-green-400"}`}>
                    {stats.trendPercent}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{stats.trend} JOD</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* رسم بياني للتكاليف */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <LineChartIcon className="w-5 h-5" />
                اتجاه التكاليف
              </CardTitle>
              <CardDescription>آخر 30 يوم مع المتوسط المتحرك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-slate-900/50 rounded-lg p-4 flex items-end gap-1">
                {analyticsData.map((data, index) => {
                  const maxValue = Math.max(...analyticsData.map(d => d.totalCost));
                  const height = (data.totalCost / maxValue) * 100;
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-blue-600 rounded-t hover:bg-blue-500 transition-colors cursor-pointer group relative"
                      style={{ height: `${height}%`, minHeight: "4px" }}
                      title={`${data.date}: ${data.totalCost.toFixed(2)} JOD`}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {data.totalCost.toFixed(0)} JOD
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 mt-4">اسحب الماوس فوق الأعمدة لعرض التفاصيل</p>
            </CardContent>
          </Card>

          {/* توزيع التكاليف */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <PieChartIcon className="w-5 h-5" />
                توزيع التكاليف
              </CardTitle>
              <CardDescription>نسبة كل عنصر من التكلفة الإجمالية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "تكاليف الشحن", value: 35, color: "bg-blue-600" },
                  { label: "الرسوم الجمركية", value: 30, color: "bg-purple-600" },
                  { label: "الضرائب", value: 25, color: "bg-pink-600" },
                  { label: "رسوم أخرى", value: 10, color: "bg-slate-600" },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-white font-bold">{item.value}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full`}
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* التنبؤات */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart3 className="w-5 h-5" />
              التنبؤات المستقبلية
            </CardTitle>
            <CardDescription>توقع التكاليف للأيام السبعة القادمة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-900/50 rounded-lg p-4 flex items-end gap-2">
              {forecast.map((value, index) => {
                const maxValue = Math.max(...forecast);
                const height = (value / maxValue) * 100;
                return (
                  <div
                    key={index}
                    className="flex-1 bg-gradient-to-t from-green-600 to-green-400 rounded-t hover:from-green-500 hover:to-green-300 transition-colors cursor-pointer group relative"
                    style={{ height: `${height}%`, minHeight: "4px" }}
                    title={`اليوم ${index + 1}: ${value.toFixed(2)} JOD`}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {value.toFixed(0)} JOD
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500 mt-4">التنبؤات مبنية على البيانات التاريخية والاتجاهات الحالية</p>
          </CardContent>
        </Card>

        {/* التوصيات */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">التوصيات والرؤى</CardTitle>
            <CardDescription>نصائح لتحسين إدارة التكاليف</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "أفضل وقت للشحن",
                  description: "الأيام الثلاثاء والأربعاء تشهد أقل أسعار شحن في الأسبوع",
                  icon: "📅",
                },
                {
                  title: "تحسين المسارات",
                  description: "استخدم المسار عبر الإمارات لتوفير 15% من تكاليف الجمارك",
                  icon: "🗺️",
                },
                {
                  title: "تجميع الشحنات",
                  description: "تجميع الشحنات الصغيرة يقلل التكاليف الإجمالية بنسبة 20%",
                  icon: "📦",
                },
                {
                  title: "مراقبة الأسعار",
                  description: "أسعار الجمارك قد تزداد بنسبة 5% في الشهر القادم",
                  icon: "⚠️",
                },
              ].map((insight, index) => (
                <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                  <div className="flex gap-3">
                    <span className="text-2xl">{insight.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{insight.title}</h3>
                      <p className="text-slate-400 text-sm">{insight.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

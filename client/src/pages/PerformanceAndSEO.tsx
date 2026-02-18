/**
 * Performance and SEO Optimization Page
 * 
 * صفحة تحسين الأداء والـ SEO
 * 
 * @module ./client/src/pages/PerformanceAndSEO
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Zap, Search, TrendingUp, CheckCircle2, AlertCircle, Gauge } from "lucide-react";

interface MetricData {
  name: string;
  value: number;
  target: number;
  unit: string;
  status: "good" | "warning" | "critical";
}

interface SEOData {
  metric: string;
  score: number;
  status: "good" | "warning" | "critical";
  description: string;
}

export default function PerformanceAndSEO() {
  const [activeTab, setActiveTab] = useState("performance");
  const [metrics, setMetrics] = useState<MetricData[]>([
    { name: "First Contentful Paint", value: 1.2, target: 1.8, unit: "s", status: "good" },
    { name: "Largest Contentful Paint", value: 2.5, target: 2.5, unit: "s", status: "good" },
    { name: "Cumulative Layout Shift", value: 0.05, target: 0.1, unit: "", status: "good" },
    { name: "Time to Interactive", value: 3.8, target: 3.8, unit: "s", status: "good" },
  ]);

  const [seoScores, setSeoScores] = useState<SEOData[]>([
    { metric: "Mobile Friendly", score: 100, status: "good", description: "الموقع متوافق مع الأجهزة المحمولة" },
    { metric: "Meta Tags", score: 95, status: "good", description: "جميع Meta Tags موجودة وصحيحة" },
    { metric: "Headings Structure", score: 90, status: "good", description: "هيكل العناوين منظم بشكل صحيح" },
    { metric: "Image Optimization", score: 85, status: "warning", description: "بعض الصور تحتاج إلى تحسين" },
    { metric: "Page Speed", score: 92, status: "good", description: "سرعة الصفحة جيدة جداً" },
  ]);

  const performanceData = [
    { time: "00:00", FCP: 1.2, LCP: 2.5, TTI: 3.8 },
    { time: "04:00", FCP: 1.1, LCP: 2.4, TTI: 3.7 },
    { time: "08:00", FCP: 1.3, LCP: 2.6, TTI: 3.9 },
    { time: "12:00", FCP: 1.2, LCP: 2.5, TTI: 3.8 },
    { time: "16:00", FCP: 1.0, LCP: 2.3, TTI: 3.6 },
    { time: "20:00", FCP: 1.2, LCP: 2.5, TTI: 3.8 },
  ];

  const seoData = [
    { metric: "Mobile Friendly", score: 100 },
    { metric: "Meta Tags", score: 95 },
    { metric: "Headings", score: 90 },
    { metric: "Images", score: 85 },
    { metric: "Speed", score: 92 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-500";
      case "warning":
        return "text-yellow-500";
      case "critical":
        return "text-red-500";
      default:
        return "text-slate-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <CheckCircle2 className="w-4 h-4" />;
      case "warning":
        return <AlertCircle className="w-4 h-4" />;
      case "critical":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const optimizationTasks = [
    { task: "Code Splitting", status: "completed", description: "تقسيم الكود إلى ملفات أصغر" },
    { task: "Image Optimization", status: "completed", description: "ضغط وتحسين جودة الصور" },
    { task: "Lazy Loading", status: "completed", description: "تحميل المكونات عند الحاجة" },
    { task: "Caching", status: "in-progress", description: "تطبيق نظام التخزين المؤقت" },
    { task: "CDN Integration", status: "pending", description: "تكامل شبكة توزيع المحتوى" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">تحسين الأداء والـ SEO</h1>
          <p className="text-slate-300">مراقبة وتحسين أداء الموقع وتحسين محركات البحث</p>
        </div>

        {/* Overall Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">درجة الأداء</p>
                  <p className="text-3xl font-bold text-white">92/100</p>
                </div>
                <Gauge className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">درجة SEO</p>
                  <p className="text-3xl font-bold text-white">92/100</p>
                </div>
                <Search className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-1">سرعة التحميل</p>
                  <p className="text-3xl font-bold text-white">1.2s</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Details */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-700/50 border-slate-600 mb-6">
            <TabsTrigger value="performance" className="text-slate-200">
              <Gauge className="w-4 h-4 ml-2" />
              الأداء
            </TabsTrigger>
            <TabsTrigger value="seo" className="text-slate-200">
              <Search className="w-4 h-4 ml-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="optimization" className="text-slate-200">
              <Zap className="w-4 h-4 ml-2" />
              التحسينات
            </TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">مقاييس الأداء</CardTitle>
                <CardDescription className="text-slate-400">
                  تطور مقاييس الأداء الرئيسية
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="time" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #475569" }}
                      labelStyle={{ color: "#E2E8F0" }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="FCP" stroke="#3B82F6" strokeWidth={2} name="FCP" />
                    <Line type="monotone" dataKey="LCP" stroke="#10B981" strokeWidth={2} name="LCP" />
                    <Line type="monotone" dataKey="TTI" stroke="#F59E0B" strokeWidth={2} name="TTI" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.map((metric, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-200">{metric.name}</span>
                        <div className={`flex items-center gap-1 ${getStatusColor(metric.status)}`}>
                          {getStatusIcon(metric.status)}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">{metric.value}</span>
                        <span className="text-sm text-slate-400">{metric.unit}</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400">الهدف: {metric.target} {metric.unit}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">درجات SEO</CardTitle>
                <CardDescription className="text-slate-400">
                  تقييم تحسين محركات البحث
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={seoData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="metric" stroke="#94A3B8" />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#1E293B", border: "1px solid #475569" }}
                      labelStyle={{ color: "#E2E8F0" }}
                    />
                    <Bar dataKey="score" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {seoScores.map((score, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-200 font-medium">{score.metric}</span>
                          <div className={`flex items-center gap-1 ${getStatusColor(score.status)}`}>
                            {getStatusIcon(score.status)}
                          </div>
                        </div>
                        <p className="text-sm text-slate-400">{score.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{score.score}</p>
                        <p className="text-xs text-slate-400">/100</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">مهام التحسين</CardTitle>
                <CardDescription className="text-slate-400">
                  حالة مهام تحسين الأداء والـ SEO
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {optimizationTasks.map((task, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600"
                    >
                      <div className="flex-1">
                        <p className="text-slate-200 font-medium">{task.task}</p>
                        <p className="text-sm text-slate-400">{task.description}</p>
                      </div>
                      <div className="text-right">
                        {task.status === "completed" && (
                          <span className="inline-flex items-center gap-1 text-green-400 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            مكتمل
                          </span>
                        )}
                        {task.status === "in-progress" && (
                          <span className="inline-flex items-center gap-1 text-yellow-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            قيد الإنجاز
                          </span>
                        )}
                        {task.status === "pending" && (
                          <span className="inline-flex items-center gap-1 text-slate-400 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            معلق
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Alert className="bg-blue-500/10 border-blue-500/20">
              <Zap className="w-4 h-4 text-blue-500" />
              <AlertDescription className="text-blue-400">
                جميع التحسينات الرئيسية تم تطبيقها. الموقع يعمل بأداء ممتاز.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

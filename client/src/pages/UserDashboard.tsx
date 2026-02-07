import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ArrowRight, TrendingUp, FileText, Bell, CalculatorIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";

// بيانات تجريبية للرسوم البيانية
const chartData = [
  { month: "يناير", calculations: 12, reports: 5, total: 17 },
  { month: "فبراير", calculations: 19, reports: 8, total: 27 },
  { month: "مارس", calculations: 15, reports: 6, total: 21 },
  { month: "أبريل", calculations: 22, reports: 10, total: 32 },
  { month: "مايو", calculations: 28, reports: 14, total: 42 },
  { month: "يونيو", calculations: 25, reports: 12, total: 37 },
];

const countryData = [
  { name: "السعودية", value: 35, color: "#3b82f6" },
  { name: "الإمارات", value: 25, color: "#10b981" },
  { name: "الكويت", value: 20, color: "#f59e0b" },
  { name: "قطر", value: 12, color: "#ef4444" },
  { name: "البحرين", value: 8, color: "#8b5cf6" },
];

export default function UserDashboard() {
  const [, setLocation] = useLocation();
  const [userName, setUserName] = useState("المستخدم");

  useEffect(() => {
    // محاكاة جلب بيانات المستخدم
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || "المستخدم");
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            مرحباً، {userName}! 👋
          </h1>
          <p className="text-slate-400">
            لوحة تحكمك الشخصية - تتبع جميع حساباتك وتقاريرك في مكان واحد
          </p>
        </div>

        {/* بطاقات الإحصائيات السريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <CalculatorIcon className="w-4 h-4 text-blue-400" />
                الحسابات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">127</div>
              <p className="text-xs text-slate-400 mt-1">+12 هذا الشهر</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-green-500 transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-400" />
                التقارير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">45</div>
              <p className="text-xs text-slate-400 mt-1">+5 هذا الشهر</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500 transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                إجمالي التكاليف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">125,450</div>
              <p className="text-xs text-slate-400 mt-1">JOD هذا الشهر</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500 transition">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-400" />
                الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">8</div>
              <p className="text-xs text-slate-400 mt-1">3 جديدة</p>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* رسم بياني خطي */}
          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">نشاطك هذا الشهر</CardTitle>
              <CardDescription className="text-slate-400">
                عدد الحسابات والتقارير المنشأة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCalc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorReport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="calculations" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorCalc)"
                    name="الحسابات"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="reports" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#colorReport)"
                    name="التقارير"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* رسم بياني دائري */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">توزيع الدول</CardTitle>
              <CardDescription className="text-slate-400">
                الحسابات حسب الدولة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={countryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {countryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* الحسابات الأخيرة والتقارير */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* الحسابات الأخيرة */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>الحسابات الأخيرة</span>
                <Link href="/advanced-calculator">
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    عرض الكل <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { country: "السعودية", weight: "500 كغ", value: "5,000 USD", date: "اليوم" },
                { country: "الإمارات", weight: "750 كغ", value: "7,500 USD", date: "أمس" },
                { country: "الكويت", weight: "1000 كغ", value: "10,000 USD", date: "قبل يومين" },
              ].map((calc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <div>
                    <p className="text-white font-medium">{calc.country}</p>
                    <p className="text-sm text-slate-400">{calc.weight} • {calc.value}</p>
                  </div>
                  <span className="text-xs text-slate-400">{calc.date}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* التقارير الأخيرة */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>التقارير الأخيرة</span>
                <Link href="/reports">
                  <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
                    عرض الكل <ArrowRight className="w-4 h-4 mr-2" />
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "تقرير الشهر الحالي", date: "2026-02-08", status: "مكتمل" },
                { name: "تقرير مقارنة الدول", date: "2026-02-07", status: "مكتمل" },
                { name: "تقرير الإحصائيات السنوية", date: "2026-02-06", status: "قيد المراجعة" },
              ].map((report, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <div>
                    <p className="text-white font-medium">{report.name}</p>
                    <p className="text-sm text-slate-400">{report.date}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    report.status === "مكتمل" 
                      ? "bg-green-500/20 text-green-400" 
                      : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {report.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* الإشعارات */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-400" />
              الإشعارات الأخيرة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { message: "تم إنشاء حساب جديد من السعودية", time: "قبل ساعة", type: "info" },
              { message: "تقرير جديد متاح للتحميل", time: "قبل 3 ساعات", type: "success" },
              { message: "تنبيه: تغير سعر الشحن من الإمارات", time: "قبل يوم", type: "warning" },
              { message: "انتهت صلاحية الفترة التجريبية", time: "قبل يومين", type: "error" },
            ].map((notif, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  notif.type === "info" ? "bg-blue-400" :
                  notif.type === "success" ? "bg-green-400" :
                  notif.type === "warning" ? "bg-amber-400" :
                  "bg-red-400"
                }`} />
                <div className="flex-1">
                  <p className="text-white text-sm">{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

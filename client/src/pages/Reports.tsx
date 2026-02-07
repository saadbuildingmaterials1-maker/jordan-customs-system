/**
 * Reports Page
 * صفحة التقارير والتحليلات
 * 
 * @module ./client/src/pages/Reports
 */
import { Button } from "@/components/ui/button";
import { BarChart3, LineChart, PieChart, Download, Filter, Calendar, TrendingUp, Users, DollarSign, Package } from "lucide-react";
import { useState } from "react";

export default function Reports() {
  const [dateRange, setDateRange] = useState("month");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
                التقارير والتحليلات
              </h1>
              <p className="text-blue-200/60 mt-2">رسوم بيانية متقدمة وتحليل شامل للبيانات</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/50">
              <Download className="w-4 h-4 mr-2" />
              تصدير التقرير
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="week">هذا الأسبوع</option>
            <option value="month">هذا الشهر</option>
            <option value="quarter">هذا الربع</option>
            <option value="year">هذا العام</option>
          </select>
          <Button variant="outline" className="border-white/20 hover:bg-white/10">
            <Filter className="w-4 h-4 mr-2" />
            تصفية متقدمة
          </Button>
          <Button variant="outline" className="border-white/20 hover:bg-white/10">
            <Calendar className="w-4 h-4 mr-2" />
            تحديد التاريخ
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-blue-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-blue-200/60 text-sm">إجمالي الإيرادات</p>
            <p className="text-3xl font-bold text-blue-300 mt-2">$45,230</p>
            <p className="text-green-400 text-xs mt-2">↑ 12% عن الشهر السابق</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-600/20 to-cyan-700/20 border border-cyan-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-cyan-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-cyan-200/60 text-sm">عدد الشحنات</p>
            <p className="text-3xl font-bold text-cyan-300 mt-2">328</p>
            <p className="text-green-400 text-xs mt-2">↑ 8% عن الشهر السابق</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-purple-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-purple-200/60 text-sm">عدد العملاء</p>
            <p className="text-3xl font-bold text-purple-300 mt-2">156</p>
            <p className="text-green-400 text-xs mt-2">↑ 5% عن الشهر السابق</p>
          </div>

          <div className="bg-gradient-to-br from-orange-600/20 to-orange-700/20 border border-orange-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-orange-400" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-orange-200/60 text-sm">متوسط القيمة</p>
            <p className="text-3xl font-bold text-orange-300 mt-2">$138</p>
            <p className="text-green-400 text-xs mt-2">↑ 3% عن الشهر السابق</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">الإيرادات الشهرية</h3>
              <LineChart className="w-5 h-5 text-blue-400" />
            </div>
            <div className="h-64 bg-gradient-to-b from-blue-500/10 to-transparent rounded-lg flex items-end justify-around p-4">
              {[40, 60, 45, 75, 85, 65, 90].map((height, i) => (
                <div
                  key={i}
                  className="w-8 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">توزيع الشحنات</h3>
              <PieChart className="w-5 h-5 text-purple-400" />
            </div>
            <div className="h-64 flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#grad1)" strokeWidth="15" strokeDasharray="70 100" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#grad2)" strokeWidth="15" strokeDasharray="20 100" strokeDashoffset="-70" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#grad3)" strokeWidth="15" strokeDasharray="10 100" strokeDashoffset="-90" />
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#eab308" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white">328</p>
                    <p className="text-white/60 text-xs">شحنة</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white">أفضل الشاحنين</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">الترتيب</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">الشاحن</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">الشحنات</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">الإيرادات</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">النسبة</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: 1, name: "شركة النقل السريع", shipments: 85, revenue: "$12,450", percentage: "27%" },
                  { rank: 2, name: "مستوردات الأردن", shipments: 72, revenue: "$10,320", percentage: "23%" },
                  { rank: 3, name: "الشركة الدولية", shipments: 68, revenue: "$9,850", percentage: "22%" },
                  { rank: 4, name: "نقل الخليج", shipments: 55, revenue: "$7,920", percentage: "17%" },
                  { rank: 5, name: "الشحن المتقدم", shipments: 48, revenue: "$6,890", percentage: "15%" }
                ].map((row) => (
                  <tr key={row.rank} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">#{row.rank}</td>
                    <td className="px-6 py-4 text-sm text-white/70">{row.name}</td>
                    <td className="px-6 py-4 text-sm text-white/70">{row.shipments}</td>
                    <td className="px-6 py-4 text-sm font-medium text-white">{row.revenue}</td>
                    <td className="px-6 py-4 text-sm text-green-400">{row.percentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

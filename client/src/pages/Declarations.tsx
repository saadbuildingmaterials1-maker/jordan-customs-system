/**
 * Declarations Page
 * صفحة إدارة البيانات الجمركية
 * 
 * @module ./client/src/pages/Declarations
 */
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Plus, FileText, Search, Filter, Download, Eye, Edit, Trash2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function Declarations() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock data
  const declarations = [
    {
      id: "DEC-001",
      date: "2026-02-07",
      shipper: "شركة النقل السريع",
      items: 5,
      total: 1250,
      status: "مكتمل",
      statusColor: "bg-green-500/20 text-green-300"
    },
    {
      id: "DEC-002",
      date: "2026-02-06",
      shipper: "مستوردات الأردن",
      items: 3,
      total: 890,
      status: "قيد المراجعة",
      statusColor: "bg-yellow-500/20 text-yellow-300"
    },
    {
      id: "DEC-003",
      date: "2026-02-05",
      shipper: "الشركة الدولية",
      items: 8,
      total: 2150,
      status: "معلق",
      statusColor: "bg-red-500/20 text-red-300"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
                إدارة البيانات الجمركية
              </h1>
              <p className="text-blue-200/60 mt-2">إدارة شاملة للبيانات الجمركية والرسوم والضرائب</p>
            </div>
            <Button
              onClick={() => navigate("/declarations/new")}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/50"
            >
              <Plus className="w-4 h-4 mr-2" />
              بيان جديد
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="ابحث عن بيان..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <Button variant="outline" className="border-white/20 hover:bg-white/10">
            <Filter className="w-4 h-4 mr-2" />
            تصفية
          </Button>
          <Button variant="outline" className="border-white/20 hover:bg-white/10">
            <Download className="w-4 h-4 mr-2" />
            تصدير
          </Button>
        </div>

        {/* Declarations Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">رقم البيان</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">التاريخ</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">الشاحن</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">العناصر</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">الإجمالي</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-blue-200">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {declarations.map((decl) => (
                  <tr key={decl.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">{decl.id}</td>
                    <td className="px-6 py-4 text-sm text-white/70">{decl.date}</td>
                    <td className="px-6 py-4 text-sm text-white/70">{decl.shipper}</td>
                    <td className="px-6 py-4 text-sm text-white/70">{decl.items}</td>
                    <td className="px-6 py-4 text-sm font-medium text-white">${decl.total}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${decl.statusColor}`}>
                        {decl.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="عرض">
                          <Eye className="w-4 h-4 text-blue-400" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="تعديل">
                          <Edit className="w-4 h-4 text-yellow-400" />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="حذف">
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200/60 text-sm">البيانات المكتملة</p>
                <p className="text-3xl font-bold text-green-300 mt-2">12</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-400/50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/20 border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200/60 text-sm">قيد المراجعة</p>
                <p className="text-3xl font-bold text-yellow-300 mt-2">5</p>
              </div>
              <Clock className="w-10 h-10 text-yellow-400/50" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-600/20 to-red-700/20 border border-red-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200/60 text-sm">معلقة</p>
                <p className="text-3xl font-bold text-red-300 mt-2">3</p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-400/50" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

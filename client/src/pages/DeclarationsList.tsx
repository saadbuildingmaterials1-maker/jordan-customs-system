/**
 * DeclarationsList Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/DeclarationsList
 */
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useToast } from "@/contexts/ToastContext";
import { FileUploadWithAI } from "@/components/FileUploadWithAI";
import { 
  Loader2, Plus, Trash2, Eye, Edit2, Search, Download, Filter, 
  Calendar, MapPin, FileCheck, AlertCircle, CheckCircle, Clock, Zap,
  TrendingUp, MoreVertical, Copy, Share2, Archive, FileText
} from "lucide-react";
import { CustomsDeclaration } from "@shared/types";

export default function DeclarationsList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "number">("date");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const { addToast } = useToast();

  // Queries
  const { data: declarations, isLoading, refetch } =
    trpc.customs.listDeclarations.useQuery();

  // Mutations
  const deleteDeclarationMutation =
    trpc.customs.deleteDeclaration.useMutation();

  // Filter and sort declarations
  const filteredDeclarations = useMemo(() => {
    let filtered = (declarations || []).filter((decl: CustomsDeclaration) => {
      const matchesSearch =
        decl.declarationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        decl.clearanceCenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
        decl.exportCountry.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || decl.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a: CustomsDeclaration, b: CustomsDeclaration) => {
      if (sortBy === "date") {
        return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
      }
      return b.declarationNumber.localeCompare(a.declarationNumber);
    });

    return filtered;
  }, [declarations, searchTerm, statusFilter, sortBy]);

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا البيان الجمركي؟")) return;

    try {
      await deleteDeclarationMutation.mutateAsync({ id });
      toast.success("تم حذف البيان الجمركي بنجاح");
      await refetch();
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف البيان الجمركي");
    }
  };

  const getStatusInfo = (status: string | null) => {
    if (!status) return { label: "غير محدد", color: "bg-gray-100 text-gray-800", bgColor: "bg-gray-50", icon: AlertCircle };
    
    const statusMap: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
      draft: { label: "مسودة", color: "bg-gray-100 text-gray-800", bgColor: "bg-gray-50", icon: Clock },
      submitted: { label: "مرسلة", color: "bg-blue-100 text-blue-800", bgColor: "bg-blue-50", icon: Zap },
      approved: { label: "موافق عليها", color: "bg-yellow-100 text-yellow-800", bgColor: "bg-yellow-50", icon: FileCheck },
      cleared: { label: "مخلصة", color: "bg-green-100 text-green-800", bgColor: "bg-green-50", icon: CheckCircle },
    };

    return statusMap[status] || statusMap.draft;
  };

  const getStatusBadge = (status: string | null) => {
    const statusInfo = getStatusInfo(status);
    const Icon = statusInfo.icon;
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color} border border-current border-opacity-20`}>
        <Icon className="w-4 h-4" />
        {statusInfo.label}
      </div>
    );
  };

  // Statistics
  const stats = useMemo(() => {
    return {
      total: declarations?.length || 0,
      draft: declarations?.filter((d: CustomsDeclaration) => d.status === "draft").length || 0,
      submitted: declarations?.filter((d: CustomsDeclaration) => d.status === "submitted").length || 0,
      cleared: declarations?.filter((d: CustomsDeclaration) => d.status === "cleared").length || 0,
    };
  }, [declarations]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header المحسّن */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600">
              البيانات الجمركية
            </h1>
            <p className="text-gray-600 mt-2">
              إدارة وعرض جميع البيانات الجمركية المحفوظة ({filteredDeclarations.length})
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={() => navigate("/declarations/new")}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg text-white gap-2 px-4 sm:px-6 py-2 rounded-lg transition-all text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">بيان جديد</span>
              <span className="sm:hidden">جديد</span>
            </Button>
            <Button
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg text-white gap-2 px-4 sm:px-6 py-2 rounded-lg transition-all text-sm sm:text-base"
            >
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">استيراد ملف</span>
              <span className="sm:hidden">استيراد</span>
            </Button>
          </div>
        </div>

        {/* File Upload Section */}
        {showFileUpload && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-900">استيراد بيانات جمركية من ملف</h2>
              <button
                onClick={() => setShowFileUpload(false)}
                className="text-purple-600 hover:text-purple-900 text-2xl"
              >
                ×
              </button>
            </div>
            <FileUploadWithAI onDataExtracted={() => refetch()} />
          </div>
        )}

        {/* Quick Stats المحسّنة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "إجمالي البيانات", value: stats.total, gradient: "from-blue-600 to-blue-700", icon: FileCheck },
            { label: "المسودات", value: stats.draft, gradient: "from-gray-600 to-gray-700", icon: Clock },
            { label: "المرسلة", value: stats.submitted, gradient: "from-yellow-600 to-yellow-700", icon: Zap },
            { label: "المخلصة", value: stats.cleared, gradient: "from-green-600 to-green-700", icon: CheckCircle },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className={`relative p-6 rounded-2xl border border-gray-200 bg-white hover:border-blue-300 transition-all shadow-lg hover:shadow-xl`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} text-white`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters المحسّنة */}
        <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900 text-lg">البحث والتصفية</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 rounded-lg transition-all ${viewMode === "table" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                جدول
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`px-3 py-2 rounded-lg transition-all ${viewMode === "card" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                بطاقات
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث عن رقم البيان أو مركز التخليص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as string)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
            >
              <option value="all">جميع الحالات</option>
              <option value="draft">مسودة</option>
              <option value="submitted">مرسلة</option>
              <option value="approved">موافق عليها</option>
              <option value="cleared">مخلصة</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "number")}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-300 transition-colors"
            >
              <option value="date">الأحدث أولاً</option>
              <option value="number">رقم البيان</option>
            </select>
          </div>
        </div>

        {/* View Mode: Table أو Cards */}
        {viewMode === "table" ? (
          // Table View
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all">
            {filteredDeclarations.length === 0 ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4 text-lg font-semibold">
                  لا توجد بيانات جمركية
                </p>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== "all" 
                    ? "حاول تغيير معايير البحث"
                    : "ابدأ بإنشاء بيان جمركي جديد"}
                </p>
                <Button
                  onClick={() => navigate("/declarations/new")}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إنشاء بيان جديد
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200 hover:bg-blue-100/50">
                      <TableHead className="text-right font-bold text-gray-700">رقم البيان</TableHead>
                      <TableHead className="text-right font-bold text-gray-700">التاريخ</TableHead>
                      <TableHead className="text-right font-bold text-gray-700">مركز التخليص</TableHead>
                      <TableHead className="text-right font-bold text-gray-700">بلد التصدير</TableHead>
                      <TableHead className="text-right font-bold text-gray-700">الحالة</TableHead>
                      <TableHead className="text-center font-bold text-gray-700">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeclarations.map((declaration: CustomsDeclaration, idx: number) => (
                      <TableRow 
                        key={declaration.id}
                        className={`border-b border-gray-200 hover:bg-blue-50/50 transition-all ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                      >
                        <TableCell className="font-bold text-gray-900">
                          {declaration.declarationNumber}
                        </TableCell>
                        <TableCell className="text-gray-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            {new Date(declaration.registrationDate).toLocaleDateString("ar-JO")}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-green-500" />
                            {declaration.clearanceCenter}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700 font-medium">{declaration.exportCountry}</TableCell>
                        <TableCell>{getStatusBadge(declaration.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                navigate(`/declarations/${declaration.id}`)
                              }
                              className="hover:bg-blue-100 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                navigate(`/declarations/${declaration.id}/edit`)
                              }
                              className="hover:bg-yellow-100 hover:text-yellow-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(declaration.id)}
                              className="hover:bg-red-100 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        ) : (
          // Card View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeclarations.length === 0 ? (
              <div className="col-span-full p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-4 text-lg font-semibold">
                  لا توجد بيانات جمركية
                </p>
              </div>
            ) : (
              filteredDeclarations.map((declaration: CustomsDeclaration) => (
                <div key={declaration.id} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity"></div>
                  <div className="relative p-6 rounded-2xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">رقم البيان</p>
                        <p className="text-lg font-bold text-gray-900 mt-1">{declaration.declarationNumber}</p>
                      </div>
                      {getStatusBadge(declaration.status)}
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">{new Date(declaration.registrationDate).toLocaleDateString("ar-JO")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">{declaration.clearanceCenter}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600">{declaration.exportCountry}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/declarations/${declaration.id}`)}
                        className="flex-1 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4 ml-2" />
                        عرض
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate(`/declarations/${declaration.id}/edit`)}
                        className="flex-1 hover:bg-yellow-100 hover:text-yellow-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 ml-2" />
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(declaration.id)}
                        className="flex-1 hover:bg-red-100 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

import React, { useState, useMemo } from "react";
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
import { 
  Loader2, Plus, Trash2, Eye, Edit2, Search, Download, Filter, 
  Calendar, MapPin, FileCheck, AlertCircle, CheckCircle, Clock, Zap
} from "lucide-react";
import { CustomsDeclaration } from "@shared/types";

export default function DeclarationsList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "number">("date");
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
    if (!status) return { label: "غير محدد", color: "bg-gray-100 text-gray-800", icon: AlertCircle };
    
    const statusMap: Record<string, { label: string; color: string; icon: any }> = {
      draft: { label: "مسودة", color: "bg-gray-100 text-gray-800", icon: Clock },
      submitted: { label: "مرسلة", color: "bg-blue-100 text-blue-800", icon: Zap },
      approved: { label: "موافق عليها", color: "bg-yellow-100 text-yellow-800", icon: FileCheck },
      cleared: { label: "مخلصة", color: "bg-green-100 text-green-800", icon: CheckCircle },
    };

    return statusMap[status] || statusMap.draft;
  };

  const getStatusBadge = (status: string | null) => {
    const statusInfo = getStatusInfo(status);
    const Icon = statusInfo.icon;
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">البيانات الجمركية</h1>
            <p className="text-gray-600 mt-1">
              إدارة وعرض جميع البيانات الجمركية المحفوظة ({filteredDeclarations.length})
            </p>
          </div>
          <Button
            onClick={() => navigate("/declarations/new")}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6 py-2 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            بيان جديد
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "إجمالي البيانات", value: stats.total, color: "bg-blue-50 text-blue-600", icon: FileCheck },
            { label: "المسودات", value: stats.draft, color: "bg-gray-50 text-gray-600", icon: Clock },
            { label: "المرسلة", value: stats.submitted, color: "bg-yellow-50 text-yellow-600", icon: Zap },
            { label: "المخلصة", value: stats.cleared, color: "bg-green-50 text-green-600", icon: CheckCircle },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className={`p-4 rounded-lg border border-gray-200 ${stat.color}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-75">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <Icon className="w-8 h-8 opacity-20" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="space-y-4 bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">البحث والتصفية</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث عن رقم البيان أو مركز التخليص..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as string)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">الأحدث أولاً</option>
              <option value="number">رقم البيان</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {filteredDeclarations.length === 0 ? (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4 text-lg">
                لا توجد بيانات جمركية
              </p>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== "all" 
                  ? "حاول تغيير معايير البحث"
                  : "ابدأ بإنشاء بيان جمركي جديد"}
              </p>
              <Button
                onClick={() => navigate("/declarations/new")}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Plus className="w-4 h-4" />
                إنشاء بيان جديد
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead className="text-right font-semibold text-gray-700">رقم البيان</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">التاريخ</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">مركز التخليص</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">بلد التصدير</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">الحالة</TableHead>
                    <TableHead className="text-center font-semibold text-gray-700">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeclarations.map((declaration: CustomsDeclaration, idx: number) => (
                    <TableRow 
                      key={declaration.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <TableCell className="font-semibold text-gray-900">
                        {declaration.declarationNumber}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(declaration.registrationDate).toLocaleDateString("ar-JO")}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {declaration.clearanceCenter}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-700">{declaration.exportCountry}</TableCell>
                      <TableCell>{getStatusBadge(declaration.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              navigate(`/declarations/${declaration.id}`)
                            }
                            title="عرض التفاصيل"
                            className="hover:bg-blue-100 hover:text-blue-600"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              navigate(`/declarations/${declaration.id}`)
                            }
                            title="تعديل"
                            className="hover:bg-green-100 hover:text-green-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(declaration.id)}
                            disabled={deleteDeclarationMutation.isPending}
                            title="حذف"
                            className="hover:bg-red-100 hover:text-red-600"
                          >
                            {deleteDeclarationMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
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

        {/* Export */}
        {filteredDeclarations.length > 0 && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                toast.success("جاري تصدير البيانات...");
                // Export logic here
              }}
            >
              <Download className="w-4 h-4" />
              تصدير
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

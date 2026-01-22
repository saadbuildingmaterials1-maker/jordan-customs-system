import { useState } from "react";
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
import { Loader2, Plus, Trash2, Eye, Edit2, Search } from "lucide-react";
import { CustomsDeclaration } from "@shared/types";

export default function DeclarationsList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Queries
  const { data: declarations, isLoading, refetch } =
    trpc.customs.listDeclarations.useQuery();

  // Mutations
  const deleteDeclarationMutation =
    trpc.customs.deleteDeclaration.useMutation();

  // Filter declarations
  const filteredDeclarations = (declarations || []).filter((decl: CustomsDeclaration) => {
    const matchesSearch =
      decl.declarationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decl.clearanceCenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decl.exportCountry.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || decl.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">غير محدد</span>;
    const statusMap: Record<string, { label: string; color: string }> = {
      draft: { label: "مسودة", color: "bg-gray-100 text-gray-800" },
      submitted: { label: "مرسلة", color: "bg-blue-100 text-blue-800" },
      approved: { label: "موافق عليها", color: "bg-green-100 text-green-800" },
      cleared: { label: "مخلصة", color: "bg-purple-100 text-purple-800" },
    };

    const statusInfo = statusMap[status] || statusMap.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
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
            <h1 className="section-title">البيانات الجمركية</h1>
            <p className="text-muted-foreground">
              إدارة وعرض جميع البيانات الجمركية المحفوظة
            </p>
          </div>
          <Button
            onClick={() => navigate("/declarations/new")}
            className="gap-2 btn-primary"
          >
            <Plus className="w-4 h-4" />
            بيان جديد
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن رقم البيان أو مركز التخليص..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as string)}
              className="px-4 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">جميع الحالات</option>
              <option value="draft">مسودة</option>
              <option value="submitted">مرسلة</option>
              <option value="approved">موافق عليها</option>
              <option value="cleared">مخلصة</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          {filteredDeclarations.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                لا توجد بيانات جمركية
              </p>
              <Button
                onClick={() => navigate("/declarations/new")}
                variant="outline"
              >
                إنشاء بيان جديد
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم البيان</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">مركز التخليص</TableHead>
                  <TableHead className="text-right">بلد التصدير</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeclarations.map((declaration: CustomsDeclaration) => (
                  <TableRow key={declaration.id}>
                    <TableCell className="font-medium">
                      {declaration.declarationNumber}
                    </TableCell>
                    <TableCell>
                      {new Date(declaration.registrationDate).toLocaleDateString(
                        "ar-JO"
                      )}
                    </TableCell>
                    <TableCell>{declaration.clearanceCenter}</TableCell>
                    <TableCell>{declaration.exportCountry}</TableCell>
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
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(declaration.id)}
                          disabled={deleteDeclarationMutation.isPending}
                          title="حذف"
                          className="text-destructive hover:text-destructive"
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
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="stat-label">إجمالي البيانات</p>
            <p className="stat-value">{declarations?.length || 0}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">المسودات</p>
            <p className="stat-value">
              {declarations?.filter((d: CustomsDeclaration) => d.status === "draft").length || 0}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">المرسلة</p>
            <p className="stat-value">
              {declarations?.filter((d: CustomsDeclaration) => d.status === "submitted").length || 0}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">المخلصة</p>
            <p className="stat-value">
              {declarations?.filter((d: CustomsDeclaration) => d.status === "cleared").length || 0}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

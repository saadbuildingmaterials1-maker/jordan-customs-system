/**
 * DeclarationDetail Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/DeclarationDetail
 */
import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import ItemModal from "@/components/ItemModal";
import ItemsTable from "@/components/ItemsTable";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowRight, Loader2, BarChart3 } from "lucide-react";
import { Item } from "@shared/types";
import ExportButtons from "@/components/ExportButtons";

interface ItemFormData {
  itemName: string;
  quantity: number;
  unitPriceForeign: number;
}

export default function DeclarationDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Queries
  const { data: declaration, isLoading: isLoadingDeclaration } =
    trpc.customs.getDeclaration.useQuery(
      { id: parseInt(id!) },
      { enabled: !!id }
    );

  const { data: items, isLoading: isLoadingItems, refetch: refetchItems } =
    trpc.items.getItems.useQuery(
      { declarationId: parseInt(id!) },
      { enabled: !!id }
    );

  const { data: summary } = trpc.financialSummary.getSummary.useQuery(
    { declarationId: parseInt(id!) },
    { enabled: !!id }
  );

  // Mutations
  const createItemMutation = trpc.items.createItem.useMutation();
  const updateItemMutation = trpc.items.updateItem.useMutation();
  const deleteItemMutation = trpc.items.deleteItem.useMutation();

  const handleAddItem = async (data: ItemFormData) => {
    try {
      await createItemMutation.mutateAsync({
        declarationId: parseInt(id!),
        ...data,
      });
      toast.success("تم إضافة الصنف بنجاح");
      await refetchItems();
    } catch (error) {
      toast.error("حدث خطأ أثناء إضافة الصنف");
    }
  };

  const handleUpdateItem = async (data: ItemFormData) => {
    if (!editingItem) return;
    try {
      await updateItemMutation.mutateAsync({
        id: editingItem.id,
        quantity: data.quantity,
        unitPriceForeign: data.unitPriceForeign,
      } as any);
      toast.success("تم تحديث الصنف بنجاح");
      setEditingItem(null);
      await refetchItems();
    } catch (error) {
      toast.error("حدث خطأ أثناء تحديث الصنف");
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteItemMutation.mutateAsync({
        id: itemId,
      } as any);
      toast.success("تم حذف الصنف بنجاح");
      await refetchItems();
    } catch (error) {
      toast.error("حدث خطأ أثناء حذف الصنف");
    }
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleModalSubmit = async (data: ItemFormData) => {
    if (editingItem) {
      await handleUpdateItem(data);
    } else {
      await handleAddItem(data);
    }
  };

  if (isLoadingDeclaration) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!declaration) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">البيان الجمركي غير موجود</p>
          <Button onClick={() => navigate("/")} className="btn-primary">
            العودة للرئيسية
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const exchangeRate = Number(declaration.exchangeRate);
  const isLoading = isLoadingItems || createItemMutation.isPending || updateItemMutation.isPending || deleteItemMutation.isPending;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="section-title">
                البيان الجمركي #{declaration.declarationNumber}
              </h1>
              <p className="text-muted-foreground">
                {new Date(declaration.registrationDate).toLocaleDateString("ar-JO")}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <ExportButtons
              declaration={declaration}
              items={items || []}
              summary={summary}
            />
            <Button
              onClick={() => navigate(`/declarations/${id}/variance`)}
              className="gap-2"
              variant="outline"
            >
              <BarChart3 className="w-4 h-4" />
              تحليل الانحرافات
            </Button>
          </div>
        </div>

        {/* معلومات البيان الأساسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <p className="stat-label">مركز التخليص</p>
            <p className="stat-value text-base">{declaration.clearanceCenter}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">بلد التصدير</p>
            <p className="stat-value text-base">{declaration.exportCountry}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">سعر التعادل</p>
            <p className="stat-value text-base">{exchangeRate}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">الحالة</p>
            <p className={`stat-value text-base badge-${declaration.status}`}>
              {declaration.status === "draft" && "مسودة"}
              {declaration.status === "submitted" && "مرسلة"}
              {declaration.status === "approved" && "موافق عليها"}
              {declaration.status === "cleared" && "مخلصة"}
            </p>
          </div>
        </div>

        {/* جدول الأصناف */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">الأصناف</h2>
          <ItemsTable
            items={items || []}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onAddNew={() => setIsModalOpen(true)}
            isLoading={isLoading}
            exchangeRate={exchangeRate}
          />
        </div>

        {/* ملخص التكاليف */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-elegant border-2 border-accent">
              <p className="stat-label">إجمالي قيمة البضاعة</p>
              <p className="stat-value text-accent">
                {Number(summary.totalFobValue).toLocaleString("ar-JO", {
                  style: "currency",
                  currency: "JOD",
                  minimumFractionDigits: 3,
                })}
              </p>
            </div>
            <div className="card-elegant">
              <p className="stat-label">الشحن والتأمين</p>
              <p className="stat-value">
                {Number(summary.totalFreightAndInsurance).toLocaleString("ar-JO", {
                  style: "currency",
                  currency: "JOD",
                  minimumFractionDigits: 3,
                })}
              </p>
            </div>
            <div className="card-elegant">
              <p className="stat-label">الرسوم والضرائب</p>
              <p className="stat-value">
                {Number(summary.totalCustomsAndTaxes).toLocaleString("ar-JO", {
                  style: "currency",
                  currency: "JOD",
                  minimumFractionDigits: 3,
                })}
              </p>
            </div>
            <div className="card-elegant border-2 border-green-500">
              <p className="stat-label">التكلفة الكلية النهائية</p>
              <p className="stat-value text-green-600">
                {Number(summary.totalLandedCost).toLocaleString("ar-JO", {
                  style: "currency",
                  currency: "JOD",
                  minimumFractionDigits: 3,
                })}
              </p>
            </div>
          </div>
        )}

        {/* معلومات إضافية */}
        <div className="card-elegant">
          <h3 className="text-lg font-bold mb-4 text-foreground">معلومات الشحنة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">الوزن القائم</p>
              <p className="text-lg font-semibold">
                {Number(declaration.grossWeight).toLocaleString("ar-JO")} كغم
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الوزن الصافي</p>
              <p className="text-lg font-semibold">
                {Number(declaration.netWeight).toLocaleString("ar-JO")} كغم
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">عدد الطرود</p>
              <p className="text-lg font-semibold">
                {declaration.numberOfPackages} {declaration.packageType}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">نسبة المصاريف الإضافية</p>
              <p className="text-lg font-semibold">
                {Number(declaration.additionalExpensesRatio).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Item Modal */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={
          editingItem
            ? {
                itemName: editingItem.itemName,
                quantity: Number(editingItem.quantity),
                unitPriceForeign: Number(editingItem.unitPriceForeign),
              }
            : undefined
        }
        isLoading={isLoading}
        title={editingItem ? "تعديل الصنف" : "إضافة صنف جديد"}
        exchangeRate={exchangeRate}
      />
    </DashboardLayout>
  );
}

import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { SmartSuggestionsModal } from "@/components/SmartSuggestionsModal";
import ItemsTable from "@/components/ItemsTable";
import ItemModal from "@/components/ItemModal";

interface ItemFormData {
  itemName: string;
  quantity: number;
  unitPriceForeign: number;
  customsCode?: string;
  description?: string;
}

export default function ItemsManagementWithAI() {
  const [, params] = useRoute("/declarations/:id/items");
  const id = params?.id;
  const [location] = useLocation();

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSmartModal, setShowSmartModal] = useState(false);
  const [smartModalType, setSmartModalType] = useState<"classification" | "analysis" | "prediction">("classification");
  const [smartSuggestion, setSmartSuggestion] = useState<any>(null);

  // Queries
  const { data: declaration, isLoading: isLoadingDeclaration } = trpc.customs.getDeclaration.useQuery(
    { id: parseInt(id!) },
    { enabled: !!id }
  );

  const { data: items = [], isLoading: isLoadingItems, refetch: refetchItems } =
    (trpc.customs as any).getItems?.useQuery?.(
      { declarationId: parseInt(id!) },
      { enabled: !!id }
    ) || { data: [], isLoading: false, refetch: async () => {} };

  // Mutations
  const addItemMutation = (trpc.customs as any).addItem?.useMutation?.() || { mutateAsync: async () => {} };
  const updateItemMutation = (trpc.customs as any).updateItem?.useMutation?.() || { mutateAsync: async () => {} };
  const deleteItemMutation = (trpc.customs as any).deleteItem?.useMutation?.() || { mutateAsync: async () => {} };

  // AI Mutations
  const classificationMutation = trpc.ai.suggestItemClassification.useMutation();
  const analysisMutation = trpc.ai.analyzeDeclaration.useMutation();
  const predictionMutation = trpc.ai.predictCosts.useMutation();

  // Handlers
  const handleAddItem = async (data: ItemFormData) => {
    if (!id) return;
    try {
      await addItemMutation.mutateAsync({
        declarationId: parseInt(id),
        ...data,
      } as any);
      toast.success("تم إضافة الصنف بنجاح");
      setIsModalOpen(false);
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
        customsCode: data.customsCode,
        description: data.description,
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

  // AI Handlers
  const handleSmartClassification = async (itemName: string) => {
    try {
      setSmartModalType("classification");
      const result = await classificationMutation.mutateAsync({
        itemName,
      });
      setSmartSuggestion(result);
      setShowSmartModal(true);
    } catch (error) {
      toast.error("فشل الحصول على الاقتراح الذكي");
    }
  };

  const handleSmartAnalysis = async () => {
    if (!declaration) return;
    try {
      setSmartModalType("analysis");
      const result = await analysisMutation.mutateAsync({
        declarationId: parseInt(id!),
        declarationNumber: declaration.declarationNumber,
        exportCountry: declaration.exportCountry,
        totalFobValue: Number(declaration.fobValueJod),
      });
      setSmartSuggestion(result);
      setShowSmartModal(true);
    } catch (error) {
      toast.error("فشل التحليل الذكي");
    }
  };

  const handleSmartPrediction = async () => {
    if (!declaration) return;
    try {
      setSmartModalType("prediction");
      const result = await predictionMutation.mutateAsync({
        declarationId: parseInt(id!),
        fobValue: Number(declaration.fobValueJod),
        freightCost: Number(declaration.freightCost),
        insuranceCost: Number(declaration.insuranceCost),
        exportCountry: declaration.exportCountry,
      });
      setSmartSuggestion(result);
      setShowSmartModal(true);
    } catch (error) {
      toast.error("فشل توقع التكاليف");
    }
  };

  const filteredItems = items.filter((item: any) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoadingDeclaration) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة الأصناف</h1>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة صنف جديد
        </Button>
      </div>

      {/* Smart AI Buttons */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-right">
            <Sparkles className="h-5 w-5 text-blue-600" />
            أدوات الذكاء الاصطناعي
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            onClick={handleSmartAnalysis}
            disabled={analysisMutation.isPending}
            variant="outline"
            className="gap-2"
          >
            {analysisMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            تحليل ذكي للبيان
          </Button>

          <Button
            onClick={handleSmartPrediction}
            disabled={predictionMutation.isPending}
            variant="outline"
            className="gap-2"
          >
            {predictionMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            توقع التكاليف
          </Button>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="ابحث عن صنف أو رمز..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-4 pr-10"
        />
      </div>

      {/* Items Table */}
      {isLoadingItems ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <ItemsTable
          items={filteredItems}
          onEdit={(item) => {
            setEditingItem(item);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteItem}
          onAddNew={() => setIsModalOpen(true)}
        />
      )}

      {/* Item Modal */}
      <ItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={editingItem ? handleUpdateItem : handleAddItem}
        initialData={editingItem}
        isLoading={addItemMutation.isPending || updateItemMutation.isPending}
      />

      {/* Smart Suggestions Modal */}
      <SmartSuggestionsModal
        isOpen={showSmartModal}
        onClose={() => setShowSmartModal(false)}
        type={smartModalType}
        data={smartSuggestion}
        isLoading={classificationMutation.isPending || analysisMutation.isPending || predictionMutation.isPending}
        onAccept={(data) => {
          if (smartModalType === "classification" && editingItem) {
            setEditingItem({
              ...editingItem,
              customsCode: data.suggestedCustomsCode,
            });
          }
        }}
      />
    </div>
  );
}

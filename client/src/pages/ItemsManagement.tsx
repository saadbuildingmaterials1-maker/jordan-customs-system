/**
 * ItemsManagement Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/ItemsManagement
 */
import { useState, useMemo } from "react";
import { useParams } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Search, Edit2, Trash2, Loader2, Copy, Check } from "lucide-react";
import { formatCurrency, formatArabicNumber } from "@/lib/formatting";
import { useToast } from "@/contexts/ToastContext";

interface ItemFormData {
  itemName: string;
  itemCode: string;
  quantity: number;
  unitPriceForeign: number;
  description: string;
  customsCode: string;
}

export default function ItemsManagement() {
  const { id } = useParams<{ id: string }>();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [formData, setFormData] = useState<ItemFormData>({
    itemName: "",
    itemCode: "",
    quantity: 0,
    unitPriceForeign: 0,
    description: "",
    customsCode: "",
  });

  // Queries
  const { data: declaration, isLoading: isLoadingDeclaration } =
    trpc.customs.getDeclaration.useQuery(
      { id: parseInt(id!) },
      { enabled: !!id }
    );

  const { data: items = [], isLoading: isLoadingItems, refetch: refetchItems } =
    (trpc.customs as any).getItems?.useQuery(
      { declarationId: parseInt(id!) },
      { enabled: !!id }
    ) || { data: [], isLoading: false, refetch: async () => {} };

  // Mutations
  const addItemMutation = (trpc.customs as any).addItem?.useMutation?.() || { mutateAsync: async () => {} };
  const updateItemMutation = (trpc.customs as any).updateItem?.useMutation?.() || { mutateAsync: async () => {} };
  const deleteItemMutation = (trpc.customs as any).deleteItem?.useMutation?.() || { mutateAsync: async () => {} };

  // Filter items by search term
  const filteredItems = useMemo(() => {
    return items.filter(
      (item: any) =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customsCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  // Generate unique item code
  const generateItemCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `SKU-${timestamp}-${random}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        itemName: item.itemName,
        itemCode: item.itemCode || "",
        quantity: item.quantity,
        unitPriceForeign: item.unitPriceForeign,
        description: item.description || "",
        customsCode: item.customsCode || "",
      });
    } else {
      setEditingItem(null);
      setFormData({
        itemName: "",
        itemCode: generateItemCode(),
        quantity: 0,
        unitPriceForeign: 0,
        description: "",
        customsCode: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.itemName || !formData.itemCode) {
        addToast({
        type: 'warning',
        title: '⚠ حقول مطلوبة',
        message: 'يرجى ملء جميع الحقول المطلوبة',
        duration: 3000,
      });
        return;
      }

      if (editingItem) {
        await updateItemMutation.mutateAsync({
          id: editingItem.id,
          itemName: formData.itemName,
          itemCode: formData.itemCode,
          quantity: formData.quantity,
          unitPriceForeign: formData.unitPriceForeign,
          description: formData.description,
          customsCode: formData.customsCode,
        });
        addToast({
        type: 'success',
        title: '✓ تم التحديث بنجاح',
        message: 'تم تحديث بيانات الصنف بنجاح',
        duration: 4000,
      });
      } else {
        await addItemMutation.mutateAsync({
          declarationId: parseInt(id!),
          itemName: formData.itemName,
          itemCode: formData.itemCode,
          quantity: formData.quantity,
          unitPriceForeign: formData.unitPriceForeign,
          description: formData.description,
          customsCode: formData.customsCode,
        });
        addToast({
        type: 'success',
        title: '✓ تم الإضافة بنجاح',
        message: 'تم إضافة الصنف الجديد بنجاح',
        duration: 4000,
      });
      }

      setIsModalOpen(false);
      refetchItems();
    } catch (error) {
      addToast({
        type: 'error',
        title: '✗ خطأ في الحفظ',
        message: 'حدث خطأ أثناء حفظ الصنف',
        duration: 4000,
      });
    }
  };

  const handleDelete = async (itemId: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الصنف؟")) {
      try {
        await deleteItemMutation.mutateAsync({ id: itemId });
        addToast({
        type: 'success',
        title: '✓ تم الحذف بنجاح',
        message: 'تم حذف الصنف بنجاح من البيان',
        duration: 4000,
      });
        refetchItems();
      } catch (error) {
        addToast({
        type: 'error',
        title: '✗ خطأ في الحذف',
        message: 'حدث خطأ أثناء حذف الصنف',
        duration: 4000,
      });
      }
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoadingDeclaration || isLoadingItems) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            <h1 className="section-title">إدارة الأصناف</h1>
            <p className="text-muted-foreground">
              البيان: {declaration?.declarationNumber}
            </p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => handleOpenModal()}
                className="btn-primary gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة صنف جديد
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "تعديل الصنف" : "إضافة صنف جديد"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">
                      اسم الصنف *
                    </Label>
                    <Input
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleInputChange}
                      placeholder="مثال: قماش"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">
                      رقم الرمز (SKU) *
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        name="itemCode"
                        value={formData.itemCode}
                        onChange={handleInputChange}
                        placeholder="رمز فريد"
                        readOnly={!editingItem}
                        className="flex-1"
                      />
                      {!editingItem && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              itemCode: generateItemCode(),
                            }))
                          }
                        >
                          توليد
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">الكمية *</Label>
                    <Input
                      name="quantity"
                      type="number"
                      step="0.001"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">
                      سعر الوحدة (أجنبي) *
                    </Label>
                    <Input
                      name="unitPriceForeign"
                      type="number"
                      step="0.001"
                      value={formData.unitPriceForeign}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">
                      الكود الجمركي
                    </Label>
                    <Input
                      name="customsCode"
                      value={formData.customsCode}
                      onChange={handleInputChange}
                      placeholder="مثال: 853210"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold">الوصف</Label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="وصف تفصيلي للصنف"
                    className="mt-2 w-full p-2 border rounded-md min-h-[80px]"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="btn-primary"
                    disabled={addItemMutation.isPending || updateItemMutation.isPending}
                  >
                    {addItemMutation.isPending || updateItemMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        جاري الحفظ...
                      </>
                    ) : (
                      "حفظ الصنف"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="card-elegant p-4">
          <div className="flex gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="ابحث عن صنف باسمه أو رمزه أو الكود الجمركي..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </Card>

        {/* Items Table */}
        <Card className="card-elegant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    اسم الصنف
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    رقم الرمز
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    الكود الجمركي
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    الكمية
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    سعر الوحدة
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">
                    الإجمالي
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      لا توجد أصناف
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item: any) => (
                    <tr key={item.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{item.itemName}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {item.itemCode}
                          </code>
                          <button
                            onClick={() => copyToClipboard(item.itemCode)}
                            className="p-1 hover:bg-muted rounded"
                          >
                            {copiedCode === item.itemCode ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.customsCode || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatArabicNumber(item.quantity.toString())}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatCurrency(item.unitPriceForeign)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {formatCurrency(item.totalPriceJod)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenModal(item)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Summary */}
        {filteredItems.length > 0 && (
          <Card className="card-elegant p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الأصناف</p>
                <p className="text-2xl font-bold">
                  {formatArabicNumber(filteredItems.length.toString())}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الكمية</p>
                <p className="text-2xl font-bold">
                  {formatArabicNumber(
                    filteredItems
                      .reduce((sum: number, item: any) => sum + item.quantity, 0)
                      .toFixed(3)
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي القيمة</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    filteredItems.reduce((sum: number, item: any) => sum + item.totalPriceJod, 0)
                  )}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

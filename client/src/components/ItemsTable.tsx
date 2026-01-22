import { Item } from "@shared/types";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit2, Trash2, Plus } from "lucide-react";
import { useState } from "react";

interface ItemsTableProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (itemId: number) => Promise<void>;
  onAddNew: () => void;
  isLoading?: boolean;
  exchangeRate?: number;
}

export default function ItemsTable({
  items,
  onEdit,
  onDelete,
  onAddNew,
  isLoading = false,
  exchangeRate = 0.708,
}: ItemsTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (itemId: number) => {
    try {
      setIsDeleting(true);
      await onDelete(itemId);
      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="card-elegant text-center py-12">
        <p className="text-muted-foreground mb-4">لا توجد أصناف حتى الآن</p>
        <Button onClick={onAddNew} className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          إضافة صنف جديد
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="card-elegant overflow-x-auto">
        <table className="table-elegant">
          <thead>
            <tr>
              <th>اسم الصنف</th>
              <th>الكمية</th>
              <th>سعر الوحدة (أجنبي)</th>
              <th>الإجمالي (أجنبي)</th>
              <th>الإجمالي (JOD)</th>
              <th>نسبة القيمة %</th>
              <th>تكلفة الوحدة (JOD)</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="font-semibold">{item.itemName}</td>
                <td>{Number(item.quantity).toLocaleString("ar-JO")}</td>
                <td>
                  {Number(item.unitPriceForeign).toLocaleString("ar-JO", {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </td>
                <td>
                  {Number(item.totalPriceForeign).toLocaleString("ar-JO", {
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </td>
                <td className="text-accent font-semibold">
                  {Number(item.totalPriceJod).toLocaleString("ar-JO", {
                    style: "currency",
                    currency: "JOD",
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </td>
                <td>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">
                    {Number(item.valuePercentage).toFixed(2)}%
                  </span>
                </td>
                <td className="font-semibold">
                  {Number(item.unitCostJod).toLocaleString("ar-JO", {
                    style: "currency",
                    currency: "JOD",
                    minimumFractionDigits: 3,
                    maximumFractionDigits: 3,
                  })}
                </td>
                <td>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(item)}
                      disabled={isLoading}
                      className="gap-1"
                    >
                      <Edit2 className="w-4 h-4" />
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(item.id)}
                      disabled={isLoading}
                      className="gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* زر إضافة صنف جديد */}
      <div className="mt-6">
        <Button onClick={onAddNew} className="btn-primary gap-2" disabled={isLoading}>
          <Plus className="w-5 h-5" />
          إضافة صنف جديد
        </Button>
      </div>

      {/* تأكيد الحذف */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا الصنف؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

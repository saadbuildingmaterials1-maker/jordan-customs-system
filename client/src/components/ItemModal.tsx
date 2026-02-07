/**
 * ItemModal Component
 * 
 * مكون React
 * 
 * @module ./client/src/components/ItemModal
 */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const itemSchema = z.object({
  itemName: z.string().min(1, "اسم الصنف مطلوب"),
  quantity: z.number().positive("الكمية يجب أن تكون موجبة"),
  unitPriceForeign: z.number().positive("سعر الوحدة يجب أن يكون موجباً"),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormData) => Promise<void>;
  initialData?: ItemFormData;
  isLoading?: boolean;
  title?: string;
  exchangeRate?: number;
}

export default function ItemModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  title = "إضافة صنف جديد",
  exchangeRate = 0.708,
}: ItemModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema as any),
    defaultValues: initialData || {
      itemName: "",
      quantity: 1,
      unitPriceForeign: 0,
    },
  });

  const quantity = watch("quantity");
  const unitPrice = watch("unitPriceForeign");

  // حساب السعر الإجمالي تلقائياً
  useEffect(() => {
    const total = quantity * unitPrice;
    setTotalPrice(total);
  }, [quantity, unitPrice]);

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await onSubmit({
        ...data,
        quantity: data.quantity || 1,
        unitPriceForeign: data.unitPriceForeign || 0,
      } as ItemFormData);
      reset();
      onClose();
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ الصنف");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-right">{title}</DialogTitle>
          <DialogDescription className="text-right">
            أدخل تفاصيل الصنف وسيتم حساب التكاليف تلقائياً
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* اسم الصنف */}
          <div className="space-y-2">
            <label className="label-elegant">اسم الصنف</label>
            <Input
              {...register("itemName")}
              placeholder="مثال: أجهزة إلكترونية"
              className="input-elegant"
            />
            {errors.itemName && (
              <p className="text-red-500 text-sm">{errors.itemName.message}</p>
            )}
          </div>

          {/* الكمية */}
          <div className="space-y-2">
            <label className="label-elegant">الكمية</label>
            <Input
              {...register("quantity", { valueAsNumber: true })}
              type="number"
              step="0.001"
              placeholder="0"
              className="input-elegant"
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm">{errors.quantity.message}</p>
            )}
          </div>

          {/* سعر الوحدة */}
          <div className="space-y-2">
            <label className="label-elegant">سعر الوحدة (أجنبي)</label>
            <Input
              {...register("unitPriceForeign", { valueAsNumber: true })}
              type="number"
              step="0.001"
              placeholder="0"
              className="input-elegant"
            />
            {errors.unitPriceForeign && (
              <p className="text-red-500 text-sm">
                {errors.unitPriceForeign.message}
              </p>
            )}
          </div>

          {/* عرض الحسابات التلقائية */}
          <div className="bg-muted rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">السعر الإجمالي (أجنبي):</span>
              <span className="font-semibold text-foreground">
                {totalPrice.toLocaleString("ar-JO", {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">سعر التعادل:</span>
              <span className="font-semibold text-foreground">{exchangeRate}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="text-sm font-semibold text-foreground">
                السعر الإجمالي (JOD):
              </span>
              <span className="font-bold text-accent text-lg">
                {(totalPrice * exchangeRate).toLocaleString("ar-JO", {
                  style: "currency",
                  currency: "JOD",
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}
              </span>
            </div>
          </div>

          {/* الأزرار */}
          <DialogFooter className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ الصنف"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

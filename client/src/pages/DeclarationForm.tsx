/**
 * DeclarationForm Page
 * 
 * صفحة
 * 
 * @module ./client/src/pages/DeclarationForm
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowRight, Save, Loader2 } from "lucide-react";
import { CLEARANCE_CENTERS, EXPORT_COUNTRIES, PACKAGE_TYPES } from "@shared/constants";

const declarationSchema = z.object({
  declarationNumber: z.string().min(1, "رقم البيان مطلوب"),
  registrationDate: z.string().refine((date) => !isNaN(Date.parse(date)), "تاريخ غير صحيح"),
  clearanceCenter: z.string().min(1, "مركز التخليص مطلوب"),
  exchangeRate: z.number().positive("سعر التعادل يجب أن يكون موجباً"),
  exportCountry: z.string().min(1, "بلد التصدير مطلوب"),
  billOfLadingNumber: z.string().min(1, "رقم بوليصة الشحن مطلوب"),
  grossWeight: z.number().positive("الوزن القائم يجب أن يكون موجباً"),
  netWeight: z.number().positive("الوزن الصافي يجب أن يكون موجباً"),
  numberOfPackages: z.number().int().positive("عدد الطرود يجب أن يكون موجباً"),
  packageType: z.string().min(1, "نوع الطرود مطلوب"),
  fobValue: z.number().positive("قيمة البضاعة يجب أن تكون موجبة"),
  freightCost: z.number().nonnegative("أجور الشحن لا يمكن أن تكون سالبة"),
  insuranceCost: z.number().nonnegative("التأمين لا يمكن أن يكون سالباً"),
  customsDuty: z.number().nonnegative("الرسوم الجمركية لا يمكن أن تكون سالبة"),
  additionalFees: z.number().nonnegative().default(0),
  customsServiceFee: z.number().nonnegative().default(0),
  penalties: z.number().nonnegative().default(0),
});

type DeclarationFormData = z.infer<typeof declarationSchema>;

export default function DeclarationForm() {
  const [, navigate] = useLocation();
  const createMutation = trpc.customs.createDeclaration.useMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<DeclarationFormData>({
    resolver: zodResolver(declarationSchema as any),
    defaultValues: {
      registrationDate: new Date().toISOString().split("T")[0],
      exchangeRate: 0.708,
      additionalFees: 0,
      customsServiceFee: 0,
      penalties: 0,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const result = await createMutation.mutateAsync({
        ...data,
        additionalFees: data.additionalFees || 0,
        customsServiceFee: data.customsServiceFee || 0,
        penalties: data.penalties || 0,
      } as DeclarationFormData);
      toast.success("تم إنشاء البيان الجمركي بنجاح");
      navigate(`/declarations/${result.id}`);
    } catch (error) {
      toast.error("حدث خطأ أثناء إنشاء البيان الجمركي");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/declarations")}
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="section-title">بيان جمركي جديد</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: معلومات البيان الأساسية */}
          <div className="card-elegant">
            <h2 className="text-lg font-bold mb-6 text-foreground">معلومات البيان الأساسية</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="label-elegant">رقم البيان الجمركي</label>
                <Input
                  {...register("declarationNumber")}
                  placeholder="مثال: 2024001"
                  className="input-elegant"
                />
                {errors.declarationNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.declarationNumber.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="label-elegant">تاريخ التسجيل</label>
                <Input
                  {...register("registrationDate")}
                  type="date"
                  className="input-elegant"
                />
                {errors.registrationDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.registrationDate.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="label-elegant">مركز التخليص</label>
                <select
                  {...register("clearanceCenter")}
                  className="input-elegant"
                >
                  <option value="">اختر مركز التخليص</option>
                  {CLEARANCE_CENTERS.map((center) => (
                    <option key={center} value={center}>
                      {center}
                    </option>
                  ))}
                </select>
                {errors.clearanceCenter && (
                  <p className="text-red-500 text-sm mt-1">{errors.clearanceCenter.message}</p>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label-elegant">سعر التعادل (JOD)</label>
                <Input
                  {...register("exchangeRate", { valueAsNumber: true })}
                  type="number"
                  step="0.001"
                  placeholder="0.708"
                  className="input-elegant"
                />
                {errors.exchangeRate && (
                  <p className="text-red-500 text-sm mt-1">{errors.exchangeRate.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="label-elegant">بلد التصدير</label>
                <select
                  {...register("exportCountry")}
                  className="input-elegant"
                >
                  <option value="">اختر بلد التصدير</option>
                  {EXPORT_COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {errors.exportCountry && (
                  <p className="text-red-500 text-sm mt-1">{errors.exportCountry.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="label-elegant">رقم بوليصة الشحن</label>
                <Input
                  {...register("billOfLadingNumber")}
                  placeholder="مثال: BL123456"
                  className="input-elegant"
                />
                {errors.billOfLadingNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.billOfLadingNumber.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: معلومات الأوزان والطرود */}
          <div className="card-elegant">
            <h2 className="text-lg font-bold mb-6 text-foreground">معلومات الأوزان والطرود</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="label-elegant">الوزن القائم (كغم)</label>
                <Input
                  {...register("grossWeight", { valueAsNumber: true })}
                  type="number"
                  step="0.001"
                  placeholder="0"
                  className="input-elegant"
                />
                {errors.grossWeight && (
                  <p className="text-red-500 text-sm mt-1">{errors.grossWeight.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="label-elegant">الوزن الصافي (كغم)</label>
                <Input
                  {...register("netWeight", { valueAsNumber: true })}
                  type="number"
                  step="0.001"
                  placeholder="0"
                  className="input-elegant"
                />
                {errors.netWeight && (
                  <p className="text-red-500 text-sm mt-1">{errors.netWeight.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="label-elegant">عدد الطرود</label>
                <Input
                  {...register("numberOfPackages", { valueAsNumber: true })}
                  type="number"
                  placeholder="0"
                  className="input-elegant"
                />
                {errors.numberOfPackages && (
                  <p className="text-red-500 text-sm mt-1">{errors.numberOfPackages.message}</p>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label-elegant">نوع الطرود</label>
                <select
                  {...register("packageType")}
                  className="input-elegant"
                >
                  <option value="">اختر نوع الطرود</option>
                  {PACKAGE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.packageType && (
                  <p className="text-red-500 text-sm mt-1">{errors.packageType.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: القيم المالية */}
          <div className="card-elegant">
            <h2 className="text-lg font-bold mb-6 text-foreground">القيم المالية</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="label-elegant">قيمة البضاعة FOB (أجنبي)</label>
                <Input
                  {...register("fobValue", { valueAsNumber: true })}
                  type="number"
                  step="0.001"
                  placeholder="0"
                  className="input-elegant"
                />
                {errors.fobValue && (
                  <p className="text-red-500 text-sm mt-1">{errors.fobValue.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="label-elegant">أجور الشحن (JOD)</label>
                <Input
                  {...register("freightCost", { valueAsNumber: true })}
                  type="number"
                  step="0.001"
                  placeholder="0"
                  className="input-elegant"
                />
                {errors.freightCost && (
                  <p className="text-red-500 text-sm mt-1">{errors.freightCost.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="label-elegant">التأمين (JOD)</label>
                <Input
                  {...register("insuranceCost", { valueAsNumber: true })}
                  type="number"
                  step="0.001"
                  placeholder="0"
                  className="input-elegant"
                />
                {errors.insuranceCost && (
                  <p className="text-red-500 text-sm mt-1">{errors.insuranceCost.message}</p>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label-elegant">الرسوم الجمركية (JOD)</label>
                <Input
                  {...register("customsDuty", { valueAsNumber: true })}
                  type="number"
                  step="0.001"
                  placeholder="0"
                  className="input-elegant"
                />
                {errors.customsDuty && (
                  <p className="text-red-500 text-sm mt-1">{errors.customsDuty.message}</p>
                )}
              </div>

              <div className="form-group">
                <label className="label-elegant">رسوم إضافية (JOD)</label>
                <Input
                  {...register("additionalFees", { valueAsNumber: true })}
                  type="number"
                  step="0.001"
                  placeholder="0"
                  className="input-elegant"
                />
              </div>

              <div className="form-group">
                <label className="label-elegant">بدل خدمات جمركية (JOD)</label>
                <Input
                  {...register("customsServiceFee", { valueAsNumber: true })}
                  type="number"
                  step="0.001"
                  placeholder="0"
                  className="input-elegant"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label-elegant">غرامات (JOD)</label>
                <Input
                  {...register("penalties", { valueAsNumber: true })}
                  type="number"
                  step="0.001"
                  placeholder="0"
                  className="input-elegant"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/declarations")}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="btn-primary gap-2"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ البيان الجمركي
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowRight, Save, Loader2 } from "lucide-react";

export default function DeclarationFormAdvanced() {
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // معلومات البيان الأساسية
    declarationNumber: "",
    registrationDate: "",
    clearanceCenter: "",
    exchangeRate: 0.708,
    exportCountry: "",
    billOfLadingNumber: "",

    // معلومات الأوزان والطرود
    grossWeight: 0,
    netWeight: 0,
    numberOfPackages: 0,
    packageType: "",
    volumeCbm: 0,

    // معلومات المستورد
    importerName: "",
    importerLicenseNumber: "",
    importerTaxNumber: "",
    importerSequentialNumber: "",

    // معلومات المصدر
    exporterName: "",
    exporterLicenseNumber: "",

    // القيم المالية
    fobValue: 0,
    freightCost: 0,
    insuranceCost: 0,
    customsDuty: 0,
    additionalFees: 0,
    customsServiceFee: 0,
    penalties: 0,

    // معلومات إضافية
    barcodeNumber: "",
    egyptianReferenceNumber: "",
    certificateNumber: "",
    transactionNumber: "",
    customsCode: "",
    notes: "",
  });

  const createDeclarationMutation = trpc.customs.createDeclaration.useMutation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(Number(value)) ? value : Number(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const declaration = await createDeclarationMutation.mutateAsync({
        declarationNumber: formData.declarationNumber,
        registrationDate: formData.registrationDate,
        clearanceCenter: formData.clearanceCenter,
        exchangeRate: formData.exchangeRate,
        exportCountry: formData.exportCountry,
        billOfLadingNumber: formData.billOfLadingNumber,
        grossWeight: formData.grossWeight,
        netWeight: formData.netWeight,
        numberOfPackages: formData.numberOfPackages,
        packageType: formData.packageType,
        fobValue: formData.fobValue,
        freightCost: formData.freightCost,
        insuranceCost: formData.insuranceCost,
        customsDuty: formData.customsDuty,
        additionalFees: formData.additionalFees,
        customsServiceFee: formData.customsServiceFee,
        penalties: formData.penalties,
      });

      toast.success("تم إنشاء البيان الجمركي بنجاح");
      navigate(`/declarations/${declaration.id}`);
    } catch (error) {
      toast.error("حدث خطأ أثناء إنشاء البيان الجمركي");
    } finally {
      setIsSubmitting(false);
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
            onClick={() => navigate("/")}
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="section-title">إنشاء بيان جمركي جديد</h1>
            <p className="text-muted-foreground">
              أدخل جميع التفاصيل المطلوبة بدقة
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tabs للتنظيم */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">معلومات أساسية</TabsTrigger>
              <TabsTrigger value="importer">المستورد</TabsTrigger>
              <TabsTrigger value="financial">مالية</TabsTrigger>
              <TabsTrigger value="additional">إضافية</TabsTrigger>
            </TabsList>

            {/* Tab 1: معلومات أساسية */}
            <TabsContent value="basic" className="space-y-6">
              <Card className="card-elegant p-6">
                <h2 className="text-lg font-bold mb-6 text-foreground">
                  معلومات البيان الجمركي
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="declarationNumber" className="text-sm font-semibold">
                      رقم البيان *
                    </Label>
                    <Input
                      id="declarationNumber"
                      name="declarationNumber"
                      value={formData.declarationNumber}
                      onChange={handleInputChange}
                      placeholder="مثال: 89430/4"
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="registrationDate" className="text-sm font-semibold">
                      تاريخ التسجيل *
                    </Label>
                    <Input
                      id="registrationDate"
                      name="registrationDate"
                      type="date"
                      value={formData.registrationDate}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clearanceCenter" className="text-sm font-semibold">
                      مركز التخليص *
                    </Label>
                    <Input
                      id="clearanceCenter"
                      name="clearanceCenter"
                      value={formData.clearanceCenter}
                      onChange={handleInputChange}
                      placeholder="مثال: جمرك الشرقية"
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exchangeRate" className="text-sm font-semibold">
                      سعر التعادل *
                    </Label>
                    <Input
                      id="exchangeRate"
                      name="exchangeRate"
                      type="number"
                      step="0.001"
                      value={formData.exchangeRate}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exportCountry" className="text-sm font-semibold">
                      بلد التصدير *
                    </Label>
                    <Input
                      id="exportCountry"
                      name="exportCountry"
                      value={formData.exportCountry}
                      onChange={handleInputChange}
                      placeholder="مثال: الصين"
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billOfLadingNumber" className="text-sm font-semibold">
                      رقم بوليصة الشحن *
                    </Label>
                    <Input
                      id="billOfLadingNumber"
                      name="billOfLadingNumber"
                      value={formData.billOfLadingNumber}
                      onChange={handleInputChange}
                      placeholder="مثال: 1385"
                      required
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>

              <Card className="card-elegant p-6">
                <h2 className="text-lg font-bold mb-6 text-foreground">
                  معلومات الشحنة
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="grossWeight" className="text-sm font-semibold">
                      الوزن القائم (كغم) *
                    </Label>
                    <Input
                      id="grossWeight"
                      name="grossWeight"
                      type="number"
                      step="0.001"
                      value={formData.grossWeight}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="netWeight" className="text-sm font-semibold">
                      الوزن الصافي (كغم) *
                    </Label>
                    <Input
                      id="netWeight"
                      name="netWeight"
                      type="number"
                      step="0.001"
                      value={formData.netWeight}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="numberOfPackages" className="text-sm font-semibold">
                      عدد الطرود *
                    </Label>
                    <Input
                      id="numberOfPackages"
                      name="numberOfPackages"
                      type="number"
                      value={formData.numberOfPackages}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="packageType" className="text-sm font-semibold">
                      نوع الطرود *
                    </Label>
                    <Input
                      id="packageType"
                      name="packageType"
                      value={formData.packageType}
                      onChange={handleInputChange}
                      placeholder="مثال: CT (حاوية)"
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="volumeCbm" className="text-sm font-semibold">
                      الحجم (CBM)
                    </Label>
                    <Input
                      id="volumeCbm"
                      name="volumeCbm"
                      type="number"
                      step="0.001"
                      value={formData.volumeCbm}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Tab 2: المستورد والمصدر */}
            <TabsContent value="importer" className="space-y-6">
              <Card className="card-elegant p-6">
                <h2 className="text-lg font-bold mb-6 text-foreground">
                  معلومات المستورد
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="importerName" className="text-sm font-semibold">
                      اسم المستورد
                    </Label>
                    <Input
                      id="importerName"
                      name="importerName"
                      value={formData.importerName}
                      onChange={handleInputChange}
                      placeholder="اسم المستورد الكامل"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="importerLicenseNumber" className="text-sm font-semibold">
                      رقم الرخصة
                    </Label>
                    <Input
                      id="importerLicenseNumber"
                      name="importerLicenseNumber"
                      value={formData.importerLicenseNumber}
                      onChange={handleInputChange}
                      placeholder="رقم الرخصة"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="importerTaxNumber" className="text-sm font-semibold">
                      الرقم الضريبي
                    </Label>
                    <Input
                      id="importerTaxNumber"
                      name="importerTaxNumber"
                      value={formData.importerTaxNumber}
                      onChange={handleInputChange}
                      placeholder="الرقم الضريبي"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="importerSequentialNumber" className="text-sm font-semibold">
                      الرقم التسلسلي
                    </Label>
                    <Input
                      id="importerSequentialNumber"
                      name="importerSequentialNumber"
                      value={formData.importerSequentialNumber}
                      onChange={handleInputChange}
                      placeholder="الرقم التسلسلي"
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>

              <Card className="card-elegant p-6">
                <h2 className="text-lg font-bold mb-6 text-foreground">
                  معلومات المصدر
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="exporterName" className="text-sm font-semibold">
                      اسم الشركة المصدرة
                    </Label>
                    <Input
                      id="exporterName"
                      name="exporterName"
                      value={formData.exporterName}
                      onChange={handleInputChange}
                      placeholder="اسم الشركة المصدرة"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exporterLicenseNumber" className="text-sm font-semibold">
                      رقم الترخيص
                    </Label>
                    <Input
                      id="exporterLicenseNumber"
                      name="exporterLicenseNumber"
                      value={formData.exporterLicenseNumber}
                      onChange={handleInputChange}
                      placeholder="رقم الترخيص"
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Tab 3: معلومات مالية */}
            <TabsContent value="financial" className="space-y-6">
              <Card className="card-elegant p-6">
                <h2 className="text-lg font-bold mb-6 text-foreground">
                  القيم المالية
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="fobValue" className="text-sm font-semibold">
                      قيمة البضاعة (FOB) *
                    </Label>
                    <Input
                      id="fobValue"
                      name="fobValue"
                      type="number"
                      step="0.001"
                      value={formData.fobValue}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="freightCost" className="text-sm font-semibold">
                      أجور الشحن *
                    </Label>
                    <Input
                      id="freightCost"
                      name="freightCost"
                      type="number"
                      step="0.001"
                      value={formData.freightCost}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insuranceCost" className="text-sm font-semibold">
                      التأمين *
                    </Label>
                    <Input
                      id="insuranceCost"
                      name="insuranceCost"
                      type="number"
                      step="0.001"
                      value={formData.insuranceCost}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customsDuty" className="text-sm font-semibold">
                      الرسوم الجمركية *
                    </Label>
                    <Input
                      id="customsDuty"
                      name="customsDuty"
                      type="number"
                      step="0.001"
                      value={formData.customsDuty}
                      onChange={handleInputChange}
                      required
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="additionalFees" className="text-sm font-semibold">
                      رسوم إضافية
                    </Label>
                    <Input
                      id="additionalFees"
                      name="additionalFees"
                      type="number"
                      step="0.001"
                      value={formData.additionalFees}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customsServiceFee" className="text-sm font-semibold">
                      رسوم الخدمات الجمركية
                    </Label>
                    <Input
                      id="customsServiceFee"
                      name="customsServiceFee"
                      type="number"
                      step="0.001"
                      value={formData.customsServiceFee}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="penalties" className="text-sm font-semibold">
                      غرامات
                    </Label>
                    <Input
                      id="penalties"
                      name="penalties"
                      type="number"
                      step="0.001"
                      value={formData.penalties}
                      onChange={handleInputChange}
                      className="mt-2"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Tab 4: معلومات إضافية */}
            <TabsContent value="additional" className="space-y-6">
              <Card className="card-elegant p-6">
                <h2 className="text-lg font-bold mb-6 text-foreground">
                  معلومات إضافية
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="barcodeNumber" className="text-sm font-semibold">
                      رقم الباركود
                    </Label>
                    <Input
                      id="barcodeNumber"
                      name="barcodeNumber"
                      value={formData.barcodeNumber}
                      onChange={handleInputChange}
                      placeholder="رقم الباركود"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="egyptianReferenceNumber" className="text-sm font-semibold">
                      رقم المرجع المصري
                    </Label>
                    <Input
                      id="egyptianReferenceNumber"
                      name="egyptianReferenceNumber"
                      value={formData.egyptianReferenceNumber}
                      onChange={handleInputChange}
                      placeholder="رقم المرجع المصري"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="certificateNumber" className="text-sm font-semibold">
                      رقم الشهادة
                    </Label>
                    <Input
                      id="certificateNumber"
                      name="certificateNumber"
                      value={formData.certificateNumber}
                      onChange={handleInputChange}
                      placeholder="رقم الشهادة"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transactionNumber" className="text-sm font-semibold">
                      رقم المعاملة
                    </Label>
                    <Input
                      id="transactionNumber"
                      name="transactionNumber"
                      value={formData.transactionNumber}
                      onChange={handleInputChange}
                      placeholder="رقم المعاملة"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="customsCode" className="text-sm font-semibold">
                      الكود الجمركي
                    </Label>
                    <Input
                      id="customsCode"
                      name="customsCode"
                      value={formData.customsCode}
                      onChange={handleInputChange}
                      placeholder="الكود الجمركي"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <Label htmlFor="notes" className="text-sm font-semibold">
                    ملاحظات عامة
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="أي ملاحظات إضافية..."
                    className="mt-2 min-h-[120px]"
                  />
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/")}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="btn-primary gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  إنشاء البيان الجمركي
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

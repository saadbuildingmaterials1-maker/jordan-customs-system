import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { CustomsDeclaration, Item } from "@shared/types";
import { exportToExcel } from "@/services/excelExport";
import { exportToPDF, exportToPDFWithDownload } from "@/services/pdfExport";

interface ExportButtonsProps {
  declaration: CustomsDeclaration;
  items: Item[];
  summary?: {
    totalFobValue: string;
    totalFreightAndInsurance: string;
    totalCustomsAndTaxes: string;
    totalLandedCost: string;
  };
}

export default function ExportButtons({
  declaration,
  items,
  summary,
}: ExportButtonsProps) {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      await exportToExcel({
        declaration,
        items,
        summary,
      });
      toast.success("تم تصدير الملف إلى Excel بنجاح");
    } catch (error) {
      console.error("Excel export error:", error);
      toast.error("حدث خطأ أثناء تصدير الملف إلى Excel");
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);
      // محاولة التحميل المباشر أولاً
      try {
        await exportToPDFWithDownload({
          declaration,
          items,
          summary,
        });
      } catch (downloadError) {
        // إذا فشل التحميل المباشر، استخدم الطريقة البديلة
        console.warn("Direct download failed, trying alternative method", downloadError);
        await exportToPDF({
          declaration,
          items,
          summary,
        });
      }
      toast.success("تم تصدير الملف إلى PDF بنجاح");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("حدث خطأ أثناء تصدير الملف إلى PDF");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleExportPDF}
        disabled={isExportingPDF || isExportingExcel}
        className="gap-2"
        variant="outline"
      >
        {isExportingPDF ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري التصدير...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            تصدير PDF
          </>
        )}
      </Button>
      <Button
        onClick={handleExportExcel}
        disabled={isExportingExcel || isExportingPDF}
        className="gap-2"
        variant="outline"
      >
        {isExportingExcel ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري التصدير...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            تصدير Excel
          </>
        )}
      </Button>
    </div>
  );
}

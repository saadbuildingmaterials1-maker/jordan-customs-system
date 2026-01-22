import jsPDF from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas";
import { CustomsDeclaration, Item } from "@shared/types";

interface ExportData {
  declaration: CustomsDeclaration;
  items: Item[];
  summary?: {
    totalFobValue: string;
    totalFreightAndInsurance: string;
    totalCustomsAndTaxes: string;
    totalLandedCost: string;
  };
}

export async function exportToPDF(data: ExportData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // إضافة الشعار والعنوان
  doc.setFontSize(20);
  doc.setTextColor(31, 71, 136); // اللون الأزرق
  doc.text("نظام إدارة تكاليف الشحن والجمارك الأردنية", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 12;

  // خط فاصل
  doc.setDrawColor(31, 71, 136);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // معلومات البيان الأساسية
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const infoData = [
    [`رقم البيان: ${data.declaration.declarationNumber}`, `التاريخ: ${new Date(data.declaration.registrationDate).toLocaleDateString("ar-JO")}`],
    [`مركز التخليص: ${data.declaration.clearanceCenter}`, `بلد التصدير: ${data.declaration.exportCountry}`],
    [`رقم بوليصة الشحن: ${data.declaration.billOfLadingNumber}`, `سعر التعادل: ${Number(data.declaration.exchangeRate).toFixed(3)}`],
  ];

  infoData.forEach((row) => {
    doc.text(row[0], margin, yPosition, { align: "right" });
    doc.text(row[1], pageWidth - margin, yPosition, { align: "left" });
    yPosition += 6;
  });

  yPosition += 4;

  // جدول الأصناف
  const tableData: (string | number)[][] = [
    ["اسم الصنف", "الكمية", "سعر الوحدة", "الإجمالي (أجنبي)", "الإجمالي (JOD)", "النسبة %", "تكلفة الوحدة"],
  ];

  data.items.forEach((item) => {
    tableData.push([
      item.itemName,
      Number(item.quantity).toLocaleString("ar-JO"),
      Number(item.unitPriceForeign).toLocaleString("ar-JO", {
        minimumFractionDigits: 3,
      }),
      Number(item.totalPriceForeign).toLocaleString("ar-JO", {
        minimumFractionDigits: 3,
      }),
      Number(item.totalPriceJod).toLocaleString("ar-JO", {
        minimumFractionDigits: 3,
      }),
      `${Number(item.valuePercentage).toFixed(2)}%`,
      Number(item.unitCostJod).toLocaleString("ar-JO", {
        minimumFractionDigits: 3,
      }),
    ]);
  });

  // استخدام autoTable لرسم الجدول
  (doc as any).autoTable({
    head: [tableData[0]],
    body: tableData.slice(1),
    startY: yPosition,
    margin: { left: margin, right: margin },
    styles: {
      font: "courier",
      fontSize: 9,
      cellPadding: 3,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [31, 71, 136],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // الملخص المالي
  if (data.summary) {
    doc.setFontSize(12);
    doc.setTextColor(31, 71, 136);
    doc.text("الملخص المالي", pageWidth - margin, yPosition, { align: "right" });
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const summaryItems = [
      [`إجمالي قيمة البضاعة (FOB): ${data.summary.totalFobValue}`],
      [`الشحن والتأمين: ${data.summary.totalFreightAndInsurance}`],
      [`الرسوم والضرائب: ${data.summary.totalCustomsAndTaxes}`],
      [`التكلفة الكلية النهائية: ${data.summary.totalLandedCost}`],
    ];

    summaryItems.forEach((item) => {
      doc.text(item[0], pageWidth - margin, yPosition, { align: "right" });
      yPosition += 6;
    });
  }

  // إضافة التاريخ والتوقيع في الأسفل
  yPosition = pageHeight - 20;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`تم إنشاء التقرير: ${new Date().toLocaleString("ar-JO")}`, margin, yPosition, {
    align: "right",
  });

  // حفظ الملف
  doc.save(`البيان_الجمركي_${data.declaration.declarationNumber}.pdf`);
}

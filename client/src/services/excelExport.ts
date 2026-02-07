/**
 * excelExport Service
 * 
 * خدمة
 * 
 * @module ./client/src/services/excelExport
 */
import ExcelJS from "exceljs";
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

export async function exportToExcel(data: ExportData) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("البيان الجمركي");

  // تعيين الاتجاه من اليمين إلى اليسار
  worksheet.pageSetup = {
    paperSize: 9, // A4
    orientation: "portrait",
  };

  // إضافة الشعار والعنوان
  const logoRow = worksheet.addRow([]);
  logoRow.height = 30;

  const titleRow = worksheet.addRow(["نظام إدارة تكاليف الشحن والجمارك الأردنية"]);
  titleRow.getCell(1).font = {
    name: "Cairo",
    size: 18,
    bold: true,
    color: { argb: "FF1F4788" },
  };
  titleRow.getCell(1).alignment = { horizontal: "center", vertical: "middle" };
  worksheet.mergeCells("A2:H2");

  // معلومات البيان الأساسية
  const infoRow = worksheet.addRow([]);
  infoRow.height = 5;

  const headerStyle = {
    font: { name: "Cairo", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4788" } },
    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
  };

  const cellStyle = {
    font: { name: "Cairo", size: 10 },
    alignment: { horizontal: "center", vertical: "middle", wrapText: true },
    border: {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    },
  };

  // معلومات البيان
  const declRow = worksheet.addRow([
    "رقم البيان",
    data.declaration.declarationNumber,
    "التاريخ",
    new Date(data.declaration.registrationDate).toLocaleDateString("ar-JO"),
    "مركز التخليص",
    data.declaration.clearanceCenter,
  ]);

  declRow.eachCell((cell) => {
    cell.font = { name: "Cairo", size: 10 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  const declRow2 = worksheet.addRow([
    "بلد التصدير",
    data.declaration.exportCountry,
    "رقم بوليصة الشحن",
    data.declaration.billOfLadingNumber,
    "سعر التعادل",
    Number(data.declaration.exchangeRate).toFixed(3),
  ]);

  declRow2.eachCell((cell) => {
    cell.font = { name: "Cairo", size: 10 };
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });

  // إضافة مسافة
  worksheet.addRow([]);

  // رأس جدول الأصناف
  const itemsHeaderRow = worksheet.addRow([
    "اسم الصنف",
    "الكمية",
    "سعر الوحدة (أجنبي)",
    "الإجمالي (أجنبي)",
    "الإجمالي (JOD)",
    "نسبة القيمة %",
    "تكلفة الوحدة (JOD)",
  ]);

  itemsHeaderRow.eachCell((cell) => {
    Object.assign(cell, headerStyle);
  });

  // إضافة بيانات الأصناف
  data.items.forEach((item) => {
    const itemRow = worksheet.addRow([
      item.itemName,
      Number(item.quantity).toLocaleString("ar-JO"),
      Number(item.unitPriceForeign).toLocaleString("ar-JO", {
        minimumFractionDigits: 3,
      }),
      Number(item.totalPriceForeign).toLocaleString("ar-JO", {
        minimumFractionDigits: 3,
      }),
      Number(item.totalPriceJod).toLocaleString("ar-JO", {
        style: "currency",
        currency: "JOD",
        minimumFractionDigits: 3,
      }),
      `${Number(item.valuePercentage).toFixed(2)}%`,
      Number(item.unitCostJod).toLocaleString("ar-JO", {
        style: "currency",
        currency: "JOD",
        minimumFractionDigits: 3,
      }),
    ]);

    itemRow.eachCell((cell) => {
      Object.assign(cell, cellStyle);
    });
  });

  // إضافة مسافة
  worksheet.addRow([]);

  // الملخص المالي
  if (data.summary) {
    const summaryHeaderRow = worksheet.addRow(["الملخص المالي"]);
    summaryHeaderRow.getCell(1).font = {
      name: "Cairo",
      size: 12,
      bold: true,
      color: { argb: "FF1F4788" },
    };

    const summaryItems = [
      ["إجمالي قيمة البضاعة (FOB)", data.summary.totalFobValue],
      ["الشحن والتأمين", data.summary.totalFreightAndInsurance],
      ["الرسوم والضرائب", data.summary.totalCustomsAndTaxes],
      ["التكلفة الكلية النهائية", data.summary.totalLandedCost],
    ];

    summaryItems.forEach(([label, value]) => {
      const summaryRow = worksheet.addRow([label, value]);
      summaryRow.getCell(1).font = { name: "Cairo", size: 10, bold: true };
      summaryRow.getCell(2).font = { name: "Cairo", size: 10, bold: true };
      summaryRow.getCell(1).alignment = { horizontal: "right" };
      summaryRow.getCell(2).alignment = { horizontal: "left" };
    });
  }

  // تعيين عرض الأعمدة
  worksheet.columns = [
    { width: 20 },
    { width: 15 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 15 },
    { width: 18 },
    { width: 15 },
  ];

  // حفظ الملف
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `البيان_الجمركي_${data.declaration.declarationNumber}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

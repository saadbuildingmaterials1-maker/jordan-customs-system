import { db } from './db';
import { declarations, items, variances, invoices } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * خدمة التصدير المتقدمة - دعم صيغ متعددة
 */

export async function exportDeclarationToExcel(declarationId: number) {
  // الحصول على البيان والأصناف
  const declaration = await db.query.declarations.findFirst({
    where: eq(declarations.id, declarationId),
  });

  if (!declaration) {
    throw new Error('البيان الجمركي غير موجود');
  }

  const itemsList = await db.query.items.findMany({
    where: eq(items.declarationId, declarationId),
  });

  const variancesList = await db.query.variances.findMany({
    where: eq(variances.declarationId, declarationId),
  });

  // إنشاء workbook
  const wb = XLSX.utils.book_new();

  // ورقة البيانات الجمركية
  const declarationData = [
    ['رقم البيان', declaration.declarationNumber],
    ['تاريخ التسجيل', new Date(declaration.registrationDate).toLocaleDateString('ar-JO')],
    ['مركز التخليص', declaration.clearanceCenter],
    ['سعر التعادل', declaration.exchangeRate],
    ['بلد التصدير', declaration.exportCountry],
    ['رقم بوليصة الشحن', declaration.billOfLadingNumber],
    ['الوزن القائم', declaration.grossWeight],
    ['الوزن الصافي', declaration.netWeight],
    ['عدد الطرود', declaration.numberOfPackages],
    ['نوع الطرود', declaration.packageType],
    ['قيمة FOB', declaration.fobValue],
    ['أجور الشحن', declaration.freightCost],
    ['التأمين', declaration.insuranceCost],
    ['الرسوم الجمركية', declaration.customsDuty],
    ['الرسوم الإضافية', declaration.additionalFees],
    ['رسوم الخدمات', declaration.customsServiceFee],
    ['الغرامات', declaration.penalties],
  ];

  const declarationSheet = XLSX.utils.aoa_to_sheet(declarationData);
  XLSX.utils.book_append_sheet(wb, declarationSheet, 'البيان الجمركي');

  // ورقة الأصناف
  if (itemsList.length > 0) {
    const itemsData = [
      ['اسم الصنف', 'الكمية', 'سعر الوحدة (أجنبي)', 'إجمالي السعر', 'السعر بالدينار'],
      ...itemsList.map((item: any) => [
        item.itemName,
        item.quantity,
        item.unitPriceForeign,
        item.quantity * item.unitPriceForeign,
        (item.quantity * item.unitPriceForeign) * declaration.exchangeRate,
      ]),
    ];

    const itemsSheet = XLSX.utils.aoa_to_sheet(itemsData);
    XLSX.utils.book_append_sheet(wb, itemsSheet, 'الأصناف');
  }

  // ورقة الانحرافات
  if (variancesList.length > 0) {
    const variancesData = [
      ['نوع الانحراف', 'النسبة المئوية', 'الملاحظات'],
      ...variancesList.map((v: any) => [
        v.varianceType,
        `${v.variancePercentage}%`,
        v.notes || '-',
      ]),
    ];

    const variancesSheet = XLSX.utils.aoa_to_sheet(variancesData);
    XLSX.utils.book_append_sheet(wb, variancesSheet, 'الانحرافات');
  }

  // حفظ الملف
  const fileName = `بيان-جمركي-${declaration.declarationNumber}.xlsx`;
  XLSX.writeFile(wb, fileName);

  return { success: true, fileName };
}

export async function exportDeclarationToPDF(declarationId: number) {
  const declaration = await db.query.declarations.findFirst({
    where: eq(declarations.id, declarationId),
  });

  if (!declaration) {
    throw new Error('البيان الجمركي غير موجود');
  }

  const itemsList = await db.query.items.findMany({
    where: eq(items.declarationId, declarationId),
  });

  // إنشاء PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // تعيين الخط العربي
  doc.setFont('Arial', 'bold');
  doc.setFontSize(16);
  doc.text('بيان جمركي', 105, 20, { align: 'center' });

  // معلومات البيان
  doc.setFontSize(10);
  doc.setFont('Arial', 'normal');

  const declarationInfo = [
    [`رقم البيان: ${declaration.declarationNumber}`],
    [`تاريخ التسجيل: ${new Date(declaration.registrationDate).toLocaleDateString('ar-JO')}`],
    [`مركز التخليص: ${declaration.clearanceCenter}`],
    [`بلد التصدير: ${declaration.exportCountry}`],
  ];

  let yPosition = 40;
  declarationInfo.forEach((info) => {
    doc.text(info[0], 10, yPosition, { align: 'left' });
    yPosition += 8;
  });

  // جدول الأصناف
  if (itemsList.length > 0) {
    yPosition += 10;
    doc.setFont('Arial', 'bold');
    doc.text('الأصناف', 10, yPosition);
    yPosition += 10;

    const tableData = itemsList.map((item: any) => [
      item.itemName,
      item.quantity.toString(),
      item.unitPriceForeign.toString(),
      (item.quantity * item.unitPriceForeign).toString(),
    ]);

    (doc as any).autoTable({
      head: [['اسم الصنف', 'الكمية', 'السعر/الوحدة', 'الإجمالي']],
      body: tableData,
      startY: yPosition,
      margin: 10,
      didDrawPage: (data: any) => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.getHeight();
        const pageWidth = pageSize.getWidth();
        doc.setFontSize(10);
        doc.text(
          `الصفحة ${data.pageNumber}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      },
    });
  }

  // الملخص المالي
  const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;
  doc.setFont('Arial', 'bold');
  doc.text('الملخص المالي', 10, finalY + 20);

  const summary = [
    [`قيمة FOB: ${declaration.fobValue}`],
    [`أجور الشحن: ${declaration.freightCost}`],
    [`التأمين: ${declaration.insuranceCost}`],
    [`الرسوم الجمركية: ${declaration.customsDuty}`],
    [`الرسوم الإضافية: ${declaration.additionalFees}`],
  ];

  let summaryY = finalY + 30;
  summary.forEach((item: any) => {
    doc.setFont('Arial', 'normal');
    doc.text(item[0], 10, summaryY);
    summaryY += 8;
  });

  // حفظ الملف
  const fileName = `بيان-جمركي-${declaration.declarationNumber}.pdf`;
  doc.save(fileName);

  return { success: true, fileName };
}

export async function exportDeclarationToCSV(declarationId: number) {
  const declaration = await db.query.declarations.findFirst({
    where: eq(declarations.id, declarationId),
  });

  if (!declaration) {
    throw new Error('البيان الجمركي غير موجود');
  }

  const itemsList = await db.query.items.findMany({
    where: eq(items.declarationId, declarationId),
  });

  // إنشاء محتوى CSV
  let csv = 'رقم البيان,تاريخ التسجيل,مركز التخليص,بلد التصدير,قيمة FOB,الرسوم الجمركية\n';
  csv += `${declaration.declarationNumber},${new Date(declaration.registrationDate).toLocaleDateString('ar-JO')},${declaration.clearanceCenter},${declaration.exportCountry},${declaration.fobValue},${declaration.customsDuty}\n\n`;

  csv += 'اسم الصنف,الكمية,سعر الوحدة,الإجمالي\n';
  itemsList.forEach((item: any) => {
    csv += `${item.itemName},${item.quantity},${item.unitPriceForeign},${item.quantity * item.unitPriceForeign}\n`;
  });

  return csv;
}

export async function exportBulkDeclarations(declarationIds: number[], format: 'xlsx' | 'pdf' | 'csv') {
  const results = [];

  for (const id of declarationIds) {
    try {
      if (format === 'xlsx') {
        const result = await exportDeclarationToExcel(id);
        results.push({ id, success: true, fileName: result.fileName });
      } else if (format === 'pdf') {
        const result = await exportDeclarationToPDF(id);
        results.push({ id, success: true, fileName: result.fileName });
      } else if (format === 'csv') {
        const csv = await exportDeclarationToCSV(id);
        results.push({ id, success: true, data: csv });
      }
    } catch (error) {
      results.push({ id, success: false, error: (error as Error).message });
    }
  }

  return results;
}

/**
 * Print Service
 * 
 * خدمة الطباعة المباشرة والمعاينة
 * Service for direct printing and print preview
 * 
 * @module ./client/src/services/printService
 */

import { CustomsDeclaration, Item } from "@shared/types";

interface PrintOptions {
  declaration: CustomsDeclaration;
  items: Item[];
  summary?: {
    totalFobValue: string;
    totalFreightAndInsurance: string;
    totalCustomsAndTaxes: string;
    totalLandedCost: string;
  };
  title?: string;
}

/**
 * Generate HTML content for printing
 * إنشاء محتوى HTML للطباعة
 */
function generatePrintHTML(options: PrintOptions): string {
  const { declaration, items, summary, title = "بيان جمركي" } = options;

  const itemsHTML = items
    .map(
      (item, idx) => `
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${idx + 1}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.itemName || "-"}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity || 0}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.unitPriceForeign || 0}</td>
      <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${Number(item.totalPriceForeign || 0)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Arial', sans-serif;
          direction: rtl;
          background-color: #f5f5f5;
          padding: 20px;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          background-color: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #1e40af;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #1e40af;
          font-size: 28px;
          margin-bottom: 10px;
        }
        .header p {
          color: #666;
          font-size: 14px;
        }
        .declaration-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
          padding: 15px;
          background-color: #f9fafb;
          border-radius: 6px;
        }
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .info-label {
          font-weight: bold;
          color: #374151;
          min-width: 150px;
        }
        .info-value {
          color: #1f2937;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background-color: #1e40af;
          color: white;
          padding: 12px;
          text-align: right;
          font-weight: bold;
        }
        td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: right;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .summary {
          margin-top: 30px;
          padding: 20px;
          background-color: #f0f9ff;
          border-radius: 6px;
          border-left: 4px solid #1e40af;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          font-size: 16px;
        }
        .summary-row.total {
          font-weight: bold;
          font-size: 18px;
          color: #1e40af;
          border-top: 2px solid #1e40af;
          padding-top: 15px;
          margin-top: 10px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .print-date {
          text-align: left;
          color: #999;
          font-size: 12px;
          margin-top: 20px;
        }
        @media print {
          body {
            background-color: white;
            padding: 0;
          }
          .container {
            box-shadow: none;
            max-width: 100%;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
          <p>نظام إدارة تكاليف الشحن والجمارك الأردنية</p>
        </div>

        <div class="declaration-info">
          <div>
            <div class="info-item">
              <span class="info-label">رقم البيان:</span>
              <span class="info-value">${declaration.id || "-"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">الشاحن:</span>
              <span class="info-value">${declaration.exportCountry || "-"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">البلد المصدر:</span>
              <span class="info-value">${declaration.exportCountry || "-"}</span>
            </div>
          </div>
          <div>
            <div class="info-item">
              <span class="info-label">تاريخ الإنشاء:</span>
              <span class="info-value">${new Date().toLocaleDateString("ar-JO")}</span>
            </div>
            <div class="info-item">
              <span class="info-label">نوع الشحنة:</span>
              <span class="info-value">${declaration.billOfLadingNumber || "-"}</span>
            </div>
            <div class="info-item">
              <span class="info-label">الوزن الإجمالي:</span>
              <span class="info-value">${declaration.grossWeight || 0} كغ</span>
            </div>
          </div>
        </div>

        <h2 style="color: #1e40af; margin-top: 30px; margin-bottom: 15px;">تفاصيل البنود</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الوصف</th>
              <th>الكمية</th>
              <th>السعر الوحدة</th>
              <th>المجموع</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        ${
          summary
            ? `
        <div class="summary">
          <h3 style="margin-bottom: 15px; color: #1e40af;">الملخص المالي</h3>
          <div class="summary-row">
            <span>قيمة البضاعة (FOB):</span>
            <span>${summary.totalFobValue}</span>
          </div>
          <div class="summary-row">
            <span>أجور الشحن والتأمين:</span>
            <span>${summary.totalFreightAndInsurance}</span>
          </div>
          <div class="summary-row">
            <span>الجمارك والضرائب:</span>
            <span>${summary.totalCustomsAndTaxes}</span>
          </div>
          <div class="summary-row total">
            <span>التكلفة الإجمالية (Landed Cost):</span>
            <span>${summary.totalLandedCost}</span>
          </div>
        </div>
        `
            : ""
        }

        <div class="footer">
          <p>تم إنشاء هذا البيان بواسطة نظام إدارة تكاليف الشحن والجمارك الأردنية</p>
          <p>© 2026 جميع الحقوق محفوظة</p>
          <div class="print-date">
            تاريخ الطباعة: ${new Date().toLocaleString("ar-JO")}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Print directly to printer
 * طباعة مباشرة إلى الطابعة
 */
export function printDirectly(options: PrintOptions): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("فشل فتح نافذة الطباعة");
  }

  const htmlContent = generatePrintHTML(options);
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load before printing
  printWindow.onload = () => {
    printWindow.print();
  };
}

/**
 * Show print preview
 * عرض معاينة الطباعة
 */
export function showPrintPreview(options: PrintOptions): void {
  const previewWindow = window.open("", "_blank");
  if (!previewWindow) {
    throw new Error("فشل فتح نافذة المعاينة");
  }

  const htmlContent = generatePrintHTML(options);
  previewWindow.document.write(htmlContent);
  previewWindow.document.close();
}

/**
 * Save as PDF (using browser print to PDF)
 * حفظ كـ PDF (باستخدام طباعة المتصفح إلى PDF)
 */
export function savePrintAsPDF(options: PrintOptions): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("فشل فتح نافذة الحفظ");
  }

  const htmlContent = generatePrintHTML(options);
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load before showing print dialog
  printWindow.onload = () => {
    // Show print dialog with PDF printer selected
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
}

/**
 * Generate print HTML for preview
 * إنشاء HTML للمعاينة
 */
export function getPrintHTML(options: PrintOptions): string {
  return generatePrintHTML(options);
}

export default {
  printDirectly,
  showPrintPreview,
  savePrintAsPDF,
  getPrintHTML,
};

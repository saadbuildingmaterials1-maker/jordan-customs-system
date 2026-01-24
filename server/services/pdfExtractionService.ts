// استخراج البيانات من PDF - يتم استخدام مكتبة pdf-parse
// npm install pdf-parse

/**
 * خدمة استخراج البيانات من ملفات PDF
 * توفر وظائف لاستخراج النصوص والجداول من ملفات PDF
 */

export interface ExtractedData {
  text: string;
  pages: number;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
  tables?: Array<{
    rows: string[][];
    headers?: string[];
  }>;
}

/**
 * استخراج البيانات من ملف PDF
 * @param pdfBuffer - محتوى ملف PDF
 * @returns البيانات المستخرجة من PDF
 */
export async function extractDeclarationFromPDF(
  pdfBuffer: Buffer
): Promise<ExtractedData> {
  try {
    // ملاحظة: يب تثبيت pdf-parse من npm
    // const data = await pdfParse(pdfBuffer);
    // للآن نستخدم بيانات وهمية للاختبار
    const data = {
      text: pdfBuffer.toString('utf-8').substring(0, 1000),
      numpages: 1,
      info: {},
    };

    return {
      text: data.text || '',
      pages: data.numpages || 1,
      metadata: {
        title: (data.info as any)?.Title,
        author: (data.info as any)?.Author,
        subject: (data.info as any)?.Subject,
        creator: (data.info as any)?.Creator,
        producer: (data.info as any)?.Producer,
        creationDate: (data.info as any)?.CreationDate,
        modificationDate: (data.info as any)?.ModDate,
      },
      tables: extractTables(data.text || ''),
    };
  } catch (error) {
    console.error('[PDF Extraction] Error:', error);
    throw new Error('فشل استخراج البيانات من ملف PDF');
  }
}

/**
 * استخراج الجداول من النص
 * @param text - النص المستخرج من PDF
 * @returns الجداول المستخرجة
 */
function extractTables(text: string): Array<{
  rows: string[][];
  headers?: string[];
}> {
  const tables: Array<{
    rows: string[][];
    headers?: string[];
  }> = [];

  // البحث عن الأنماط التي تشير إلى جداول
  const lines = text.split('\n');
  let currentTable: string[][] = [];
  let inTable = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // تحقق من ما إذا كان السطر يحتوي على فواصل (|) أو مسافات متعددة
    if (trimmedLine.includes('|') || /\s{2,}/.test(trimmedLine)) {
      if (!inTable) {
        inTable = true;
        currentTable = [];
      }

      // تقسيم السطر إلى أعمدة
      const columns = trimmedLine
        .split(/\||\s{2,}/)
        .map(col => col.trim())
        .filter(col => col.length > 0);

      if (columns.length > 0) {
        currentTable.push(columns);
      }
    } else if (inTable && trimmedLine.length === 0) {
      // نهاية الجدول
      if (currentTable.length > 0) {
        tables.push({
          rows: currentTable,
          headers: currentTable.length > 0 ? currentTable[0] : undefined,
        });
      }
      inTable = false;
      currentTable = [];
    }
  }

  // أضف الجدول الأخير إذا كان موجوداً
  if (inTable && currentTable.length > 0) {
    tables.push({
      rows: currentTable,
      headers: currentTable.length > 0 ? currentTable[0] : undefined,
    });
  }

  return tables;
}

/**
 * استخراج البيانات الجمركية من PDF
 * @param pdfBuffer - محتوى ملف PDF
 * @returns البيانات الجمركية المستخرجة
 */
export async function extractCustomsDataFromPDF(pdfBuffer: Buffer) {
  try {
    const extracted = await extractDeclarationFromPDF(pdfBuffer);

    // استخراج البيانات الجمركية المحددة
    const customsData = {
      declarationNumber: extractField(extracted.text, /رقم البيان|Declaration Number|Bill of Lading/i),
      date: extractField(extracted.text, /التاريخ|Date|Date:/i),
      shipper: extractField(extracted.text, /الشاحن|Shipper|From:/i),
      consignee: extractField(extracted.text, /المستقبل|Consignee|To:/i),
      items: extractItems(extracted.tables || []),
      totalValue: extractField(extracted.text, /الإجمالي|Total|Amount:/i),
      currency: extractField(extracted.text, /العملة|Currency|USD|JOD/i),
    };

    return customsData;
  } catch (error) {
    console.error('[Customs Data Extraction] Error:', error);
    throw error;
  }
}

/**
 * استخراج حقل محدد من النص باستخدام regex
 * @param text - النص المراد البحث فيه
 * @param pattern - نمط البحث
 * @returns القيمة المستخرجة
 */
function extractField(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  if (match) {
    // استخراج القيمة بعد النمط
    const lineMatch = text.match(new RegExp(`${pattern.source}[:\\s]*([^\\n]*)`));
    if (lineMatch && lineMatch[1]) {
      return lineMatch[1].trim();
    }
  }
  return null;
}

/**
 * استخراج البنود من الجداول
 * @param tables - الجداول المستخرجة
 * @returns البنود المستخرجة
 */
function extractItems(
  tables: Array<{
    rows: string[][];
    headers?: string[];
  }>
) {
  const items = [];

  for (const table of tables) {
    // تخطي الصف الأول (العناوين) إذا كان موجوداً
    const startIndex = table.headers ? 1 : 0;

    for (let i = startIndex; i < table.rows.length; i++) {
      const row = table.rows[i];
      if (row.length >= 3) {
        items.push({
          description: row[0],
          quantity: row[1],
          unitPrice: row[2],
          totalPrice: row[3] || '',
        });
      }
    }
  }

  return items;
}

/**
 * التحقق من صحة البيانات المستخرجة
 * @param data - البيانات المستخرجة
 * @returns صحة البيانات
 */
export function validateExtractedData(data: ExtractedData): boolean {
  // التحقق من أن النص ليس فارغاً
  if (!data.text || data.text.trim().length === 0) {
    return false;
  }

  // التحقق من أن عدد الصفحات موجب
  if (data.pages < 1) {
    return false;
  }

  return true;
}

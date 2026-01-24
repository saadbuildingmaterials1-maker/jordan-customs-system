# دليل استيراد PDF والرموز الجمركية

## المقدمة

هذا الدليل يوضح كيفية استيراد ملفات PDF واستخراج البيانات الجمركية والرموز منها بشكل آلي.

---

## 1. استيراد ملفات PDF

### المميزات

- ✅ استخراج النصوص من PDF
- ✅ استخراج الجداول
- ✅ استخراج الصور
- ✅ التعرف على الأنماط
- ✅ معالجة ملفات كبيرة

### الخطوات

```typescript
import PDFParser from 'pdf-parse';
import fs from 'fs';

export async function importPDF(filePath: string) {
  try {
    // قراءة الملف
    const fileBuffer = fs.readFileSync(filePath);
    
    // تحليل PDF
    const data = await PDFParser(fileBuffer);
    
    // استخراج النصوص
    const text = data.text;
    
    // استخراج الجداول
    const tables = extractTables(text);
    
    // استخراج البيانات الجمركية
    const customsData = extractCustomsData(text, tables);
    
    return {
      text,
      tables,
      customsData,
      pageCount: data.numpages,
    };
  } catch (error) {
    console.error('Error importing PDF:', error);
    throw error;
  }
}
```

### استخراج الجداول

```typescript
function extractTables(text: string) {
  const tables = [];
  const lines = text.split('\n');
  
  let currentTable = [];
  let inTable = false;
  
  for (const line of lines) {
    if (line.includes('|') || line.match(/\t+/)) {
      if (!inTable) {
        inTable = true;
        currentTable = [];
      }
      currentTable.push(line);
    } else if (inTable && line.trim() === '') {
      if (currentTable.length > 0) {
        tables.push(parseTable(currentTable));
        currentTable = [];
        inTable = false;
      }
    }
  }
  
  return tables;
}

function parseTable(lines: string[]) {
  return lines.map(line => 
    line.split(/\||\t/).map(cell => cell.trim()).filter(Boolean)
  );
}
```

---

## 2. الرموز الجمركية

### نظام الرموز

الرموز الجمركية تتبع نظام HS (Harmonized System) الدولي:

| المستوى | الأرقام | الوصف |
|--------|--------|--------|
| الفصل | 2 | مثل 01 (حيوانات حية) |
| العنوان | 4 | مثل 0101 (خيول) |
| البند | 6 | مثل 010121 (خيول للسباق) |
| الرقم الإضافي | 8 | تفاصيل إضافية |
| الرقم الوطني | 10 | تفاصيل وطنية |

### قاعدة بيانات الرموز

```typescript
interface CustomsCode {
  code: string;           // 0101.21.00
  description: string;    // خيول للسباق
  chapter: string;        // 01
  heading: string;        // 0101
  subheading: string;     // 010121
  category: string;       // حيوانات
  taxRate: number;        // 5%
  restrictions: string[]; // قيود التصدير
  notes: string;          // ملاحظات إضافية
}
```

### قائمة الرموز الشائعة

```typescript
const COMMON_CUSTOMS_CODES = [
  // المواد الغذائية
  {
    code: '0201',
    description: 'لحم البقر',
    taxRate: 10,
  },
  {
    code: '0701',
    description: 'البطاطس',
    taxRate: 5,
  },
  
  // المنسوجات
  {
    code: '6204',
    description: 'ملابس نسائية',
    taxRate: 15,
  },
  
  // الآلات
  {
    code: '8471',
    description: 'أجهزة حاسوب',
    taxRate: 0,
  },
  
  // المعادن
  {
    code: '7208',
    description: 'منتجات حديدية',
    taxRate: 8,
  },
];
```

### البحث عن الرموز

```typescript
export async function searchCustomsCode(query: string) {
  // البحث في قاعدة البيانات
  const results = await db.select().from(customsCodes).where(
    or(
      like(customsCodes.code, `%${query}%`),
      like(customsCodes.description, `%${query}%`)
    )
  );
  
  return results;
}

export async function getCustomsCodeByCode(code: string) {
  const result = await db.select().from(customsCodes).where(
    eq(customsCodes.code, code)
  );
  
  return result[0];
}
```

---

## 3. استخراج البيانات الجمركية من PDF

### التعرف على الأنماط

```typescript
function extractCustomsData(text: string, tables: any[]) {
  const data = {
    codes: [],
    descriptions: [],
    quantities: [],
    values: [],
  };
  
  // البحث عن أرقام الرموز (4-6 أرقام متتالية)
  const codePattern = /\b\d{4,6}\b/g;
  const codes = text.match(codePattern) || [];
  data.codes = codes.map(code => ({
    code,
    description: getCodeDescription(code),
  }));
  
  // البحث عن الكميات
  const quantityPattern = /(\d+(?:\.\d+)?)\s*(كيلو|طن|قطعة|صندوق|كارتون)/gi;
  const quantities = text.match(quantityPattern) || [];
  data.quantities = quantities;
  
  // البحث عن القيم
  const valuePattern = /(\d+(?:\.\d+)?)\s*(دينار|دولار|يورو)/gi;
  const values = text.match(valuePattern) || [];
  data.values = values;
  
  return data;
}
```

### استخراج من الجداول

```typescript
function extractFromTables(tables: any[]) {
  const results = [];
  
  for (const table of tables) {
    // البحث عن الأعمدة
    const headers = table[0];
    const codeColumnIndex = headers.findIndex(h => 
      h.includes('رمز') || h.includes('code')
    );
    const descriptionColumnIndex = headers.findIndex(h => 
      h.includes('وصف') || h.includes('description')
    );
    const quantityColumnIndex = headers.findIndex(h => 
      h.includes('كمية') || h.includes('quantity')
    );
    
    // استخراج البيانات
    for (let i = 1; i < table.length; i++) {
      const row = table[i];
      results.push({
        code: row[codeColumnIndex],
        description: row[descriptionColumnIndex],
        quantity: row[quantityColumnIndex],
      });
    }
  }
  
  return results;
}
```

---

## 4. واجهة استيراد PDF

### صفحة الاستيراد

```typescript
export function PDFImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };
  
  const handleImport = async () => {
    if (!file) {
      setError('يرجى اختيار ملف PDF');
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/import/pdf', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('فشل استيراد الملف');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h1>استيراد ملف PDF</h1>
      
      <div className="border-2 border-dashed rounded-lg p-6">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={loading}
        />
      </div>
      
      {file && (
        <div className="bg-blue-50 p-4 rounded">
          <p>الملف المختار: {file.name}</p>
          <p>الحجم: {(file.size / 1024).toFixed(2)} KB</p>
        </div>
      )}
      
      <button
        onClick={handleImport}
        disabled={!file || loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'جاري الاستيراد...' : 'استيراد'}
      </button>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded">
          {error}
        </div>
      )}
      
      {results && (
        <div className="space-y-4">
          <h2>النتائج</h2>
          
          {/* الرموز المستخرجة */}
          <div>
            <h3>الرموز الجمركية</h3>
            <table className="w-full border">
              <thead>
                <tr>
                  <th>الرمز</th>
                  <th>الوصف</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {results.codes.map((code: any) => (
                  <tr key={code.code}>
                    <td>{code.code}</td>
                    <td>{code.description}</td>
                    <td>
                      <button onClick={() => addCode(code)}>
                        إضافة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* الكميات */}
          <div>
            <h3>الكميات</h3>
            <ul>
              {results.quantities.map((qty: string, i: number) => (
                <li key={i}>{qty}</li>
              ))}
            </ul>
          </div>
          
          {/* القيم */}
          <div>
            <h3>القيم</h3>
            <ul>
              {results.values.map((val: string, i: number) => (
                <li key={i}>{val}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 5. خادم الاستيراد

### نقطة نهاية API

```typescript
import express from 'express';
import multer from 'multer';
import { importPDF } from '../services/pdfImportService';

const router = express.Router();
const upload = multer({ dest: '/tmp/uploads' });

router.post('/import/pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    const results = await importPDF(req.file.path);
    
    // حفظ النتائج
    await savePDFImportResults(req.user.id, results);
    
    res.json(results);
  } catch (error) {
    console.error('PDF import error:', error);
    res.status(500).json({ error: 'Failed to import PDF' });
  }
});

export default router;
```

---

## 6. الخلاصة

تم توثيق نظام استيراد PDF والرموز الجمركية مع واجهة سهلة الاستخدام.

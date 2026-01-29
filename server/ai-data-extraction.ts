import { invokeLLM } from './_core/llm';

/**
 * خدمة استخراج البيانات الذكية من ملفات PDF و Excel
 * تستخدم الذكاء الاصطناعي لتحديد وتصنيف البيانات تلقائياً
 */

export interface ExtractedData {
  declarationNumber?: string;
  exportCountry?: string;
  billOfLadingNumber?: string;
  grossWeight?: number;
  netWeight?: number;
  numberOfPackages?: number;
  packageType?: string;
  fobValue?: number;
  freightCost?: number;
  insuranceCost?: number;
  customsDuty?: number;
  salesTax?: number;
  containerNumber?: string;
  containerType?: string;
  shippingCompany?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  items?: ExtractedItem[];
  confidence?: number;
  errors?: string[];
}

export interface ExtractedItem {
  description: string;
  hsCode?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  totalPrice?: number;
  origin?: string;
}

/**
 * استخراج البيانات من نص باستخدام الذكاء الاصطناعي
 */
export async function extractDataFromText(text: string): Promise<ExtractedData> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `أنت مساعد متخصص في استخراج البيانات الجمركية والشحنات من النصوص.
          
استخرج البيانات التالية من النص المعطى وأرجعها بصيغة JSON:
- declarationNumber: رقم البيان الجمركي
- exportCountry: دولة التصدير
- billOfLadingNumber: رقم بوليصة الشحن
- grossWeight: الوزن الإجمالي
- netWeight: الوزن الصافي
- numberOfPackages: عدد الطرود
- packageType: نوع الطرود
- fobValue: قيمة FOB
- freightCost: تكلفة الشحن
- insuranceCost: تكلفة التأمين
- customsDuty: الرسوم الجمركية
- salesTax: ضريبة المبيعات
- containerNumber: رقم الحاوية
- containerType: نوع الحاوية (20ft, 40ft, إلخ)
- shippingCompany: شركة الشحن
- portOfLoading: ميناء الشحن
- portOfDischarge: ميناء التفريغ
- items: قائمة الأصناف مع الوصف وكود HS والكمية والسعر
- confidence: درجة الثقة (0-100)

أرجع البيانات بصيغة JSON صحيحة فقط بدون شرح.`,
        },
        {
          role: 'user',
          content: `استخرج البيانات من النص التالي:\n\n${text}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'extracted_data',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              declarationNumber: { type: 'string' },
              exportCountry: { type: 'string' },
              billOfLadingNumber: { type: 'string' },
              grossWeight: { type: 'number' },
              netWeight: { type: 'number' },
              numberOfPackages: { type: 'integer' },
              packageType: { type: 'string' },
              fobValue: { type: 'number' },
              freightCost: { type: 'number' },
              insuranceCost: { type: 'number' },
              customsDuty: { type: 'number' },
              salesTax: { type: 'number' },
              containerNumber: { type: 'string' },
              containerType: { type: 'string' },
              shippingCompany: { type: 'string' },
              portOfLoading: { type: 'string' },
              portOfDischarge: { type: 'string' },
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    description: { type: 'string' },
                    hsCode: { type: 'string' },
                    quantity: { type: 'number' },
                    unit: { type: 'string' },
                    unitPrice: { type: 'number' },
                    totalPrice: { type: 'number' },
                    origin: { type: 'string' },
                  },
                  required: ['description'],
                },
              },
              confidence: { type: 'integer', minimum: 0, maximum: 100 },
              errors: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['confidence'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (typeof content === 'string') {
      return JSON.parse(content);
    }
    return content as ExtractedData;
  } catch (error) {
    console.error('خطأ في استخراج البيانات:', error);
    return {
      confidence: 0,
      errors: [`فشل استخراج البيانات: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`],
    };
  }
}

/**
 * التحقق من جودة البيانات المستخرجة
 */
export function validateExtractedData(data: ExtractedData): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // التحقق من درجة الثقة
  if (!data.confidence || data.confidence < 50) {
    issues.push('درجة الثقة منخفضة جداً');
  }

  // التحقق من البيانات الأساسية
  if (!data.billOfLadingNumber) {
    issues.push('رقم بوليصة الشحن مفقود');
  }

  if (!data.exportCountry) {
    issues.push('دولة التصدير مفقودة');
  }

  // التحقق من الأوزان
  if (data.grossWeight && data.netWeight && data.grossWeight < data.netWeight) {
    issues.push('الوزن الإجمالي أقل من الوزن الصافي');
  }

  // التحقق من الأسعار
  if (data.fobValue && data.fobValue < 0) {
    issues.push('قيمة FOB سالبة');
  }

  if (data.freightCost && data.freightCost < 0) {
    issues.push('تكلفة الشحن سالبة');
  }

  // التحقق من الأصناف
  if (data.items && data.items.length > 0) {
    data.items.forEach((item, index) => {
      if (!item.description) {
        issues.push(`الصنف ${index + 1}: الوصف مفقود`);
      }
      if (item.quantity !== undefined && item.quantity !== null && item.quantity <= 0) {
        issues.push(`الصنف ${index + 1}: الكمية يجب أن تكون موجبة`);
      }
    });
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * تحسين البيانات المستخرجة باستخدام الذكاء الاصطناعي
 */
export async function enhanceExtractedData(data: ExtractedData): Promise<ExtractedData> {
  try {
    const validation = validateExtractedData(data);
    
    if (validation.valid && data.confidence && data.confidence > 80) {
      return data; // البيانات جيدة بالفعل
    }

    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `أنت مساعد متخصص في تحسين وتصحيح البيانات الجمركية.
          
قم بتحسين البيانات التالية:
- تصحيح الأخطاء الواضحة
- ملء الحقول المفقودة إن أمكن
- التحقق من المنطقية
- تحسين درجة الثقة

أرجع البيانات المحسّنة بصيغة JSON صحيحة فقط.`,
        },
        {
          role: 'user',
          content: `البيانات الحالية:\n${JSON.stringify(data, null, 2)}\n\nالمشاكل المكتشفة:\n${validation.issues.join('\n')}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'enhanced_data',
          strict: false,
          schema: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (typeof content === 'string') {
      return JSON.parse(content);
    }
    return content as ExtractedData;
  } catch (error) {
    console.error('خطأ في تحسين البيانات:', error);
    return data;
  }
}

/**
 * استخراج البيانات من ملف PDF (نص)
 */
export async function extractFromPDF(pdfText: string): Promise<ExtractedData> {
  const extracted = await extractDataFromText(pdfText);
  return await enhanceExtractedData(extracted);
}

/**
 * استخراج البيانات من ملف Excel (نص)
 */
export async function extractFromExcel(excelText: string): Promise<ExtractedData> {
  const extracted = await extractDataFromText(excelText);
  return await enhanceExtractedData(extracted);
}

/**
 * مقارنة البيانات المستخرجة مع البيانات الموجودة
 */
export async function compareExtractedData(
  extracted: ExtractedData,
  existing: ExtractedData
): Promise<{ differences: string[]; recommendation: string }> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `أنت مساعد متخصص في مقارنة البيانات الجمركية.
          
قارن البيانات المستخرجة مع البيانات الموجودة وحدد:
1. الاختلافات الرئيسية
2. التوصية (استخدام البيانات الجديدة أم الموجودة أم دمجهما)

أرجع النتيجة بصيغة JSON.`,
        },
        {
          role: 'user',
          content: `البيانات المستخرجة:\n${JSON.stringify(extracted, null, 2)}\n\nالبيانات الموجودة:\n${JSON.stringify(existing, null, 2)}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'comparison_result',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              differences: {
                type: 'array',
                items: { type: 'string' },
              },
              recommendation: { type: 'string' },
            },
            required: ['differences', 'recommendation'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (typeof content === 'string') {
      return JSON.parse(content) as { differences: string[]; recommendation: string };
    }
    return {
      differences: [],
      recommendation: 'فشل المقارنة',
    };
  } catch (error) {
    console.error('خطأ في مقارنة البيانات:', error);
    return {
      differences: [],
      recommendation: 'فشل المقارنة',
    };
  }
}

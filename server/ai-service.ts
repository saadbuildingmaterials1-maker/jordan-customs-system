/**
 * ai-service
 * @module ./server/ai-service
 */
import { invokeLLM } from "./_core/llm";

/**
 * خدمة الذكاء الاصطناعي للتحليل والاقتراحات الذكية
 */

interface ItemClassificationSuggestion {
  itemName: string;
  suggestedCustomsCode: string;
  suggestedDutyRate: number;
  confidence: number;
  reasoning: string;
}

interface DeclarationAnalysis {
  riskLevel: "منخفض" | "متوسط" | "مرتفع";
  warnings: string[];
  suggestions: string[];
  estimatedDutyPercentage: number;
}

interface CostPrediction {
  estimatedCustomsDuty: number;
  estimatedTotalCost: number;
  costBreakdown: {
    fobValue: number;
    freight: number;
    insurance: number;
    customsDuty: number;
    salesTax: number;
    totalCost: number;
  };
}

/**
 * تصنيف ذكي للأصناف مع اقتراح الأكواد الجمركية
 */
export async function suggestItemClassification(
  itemName: string,
  description?: string
): Promise<ItemClassificationSuggestion> {
  try {
    const prompt = `
أنت خبير جمركي متخصص في تصنيف البضائع. قم بتحليل الصنف التالي واقترح الكود الجمركي المناسب:

اسم الصنف: ${itemName}
${description ? `الوصف: ${description}` : ""}

يرجى تقديم الاستجابة بصيغة JSON مع المعلومات التالية:
- suggestedCustomsCode: الكود الجمركي المقترح (6 أرقام)
- suggestedDutyRate: معدل الرسم الجمركي المقترح (نسبة مئوية)
- confidence: درجة الثقة (0-100)
- reasoning: التفسير العلمي للاختيار

تذكر: استخدم الأكواد الجمركية الأردنية الصحيحة.
    `;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "أنت خبير جمركي متخصص في تصنيف البضائع والأكواد الجمركية الأردنية.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "item_classification",
          strict: true,
          schema: {
            type: "object",
            properties: {
              suggestedCustomsCode: {
                type: "string",
                description: "الكود الجمركي المقترح",
              },
              suggestedDutyRate: {
                type: "number",
                description: "معدل الرسم الجمركي",
              },
              confidence: {
                type: "number",
                description: "درجة الثقة",
              },
              reasoning: {
                type: "string",
                description: "التفسير العلمي",
              },
            },
            required: [
              "suggestedCustomsCode",
              "suggestedDutyRate",
              "confidence",
              "reasoning",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("لم تحصل على استجابة من النموذج");

    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);
    return {
      itemName,
      ...parsed,
    };
  } catch (error) {
    console.error("خطأ في تصنيف الصنف:", error);
    throw error;
  }
}

/**
 * تحليل ذكي للبيان الجمركي
 */
export async function analyzeDeclaration(
  declarationData: {
    declarationNumber: string;
    items: { itemName: string; quantity: number; unitPrice: number }[];
    totalFobValue: number;
    exportCountry: string;
  }
): Promise<DeclarationAnalysis> {
  try {
    const itemsList = declarationData.items
      .map((item) => `- ${item.itemName}: ${item.quantity} وحدة بسعر ${item.unitPrice}`)
      .join("\n");

    const prompt = `
قم بتحليل البيان الجمركي التالي وتقديم تقييم المخاطر والاقتراحات:

رقم البيان: ${declarationData.declarationNumber}
بلد التصدير: ${declarationData.exportCountry}
القيمة الإجمالية FOB: ${declarationData.totalFobValue}

الأصناف:
${itemsList}

يرجى تقديم:
1. تقييم مستوى المخاطر (منخفض/متوسط/مرتفع)
2. قائمة بالتحذيرات المحتملة
3. اقتراحات للامتثال الجمركي
4. تقدير معدل الرسم الجمركي المتوقع

الاستجابة بصيغة JSON.
    `;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "أنت محلل جمركي متخصص في تقييم المخاطر والامتثال الجمركي.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "declaration_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              riskLevel: {
                type: "string",
                enum: ["منخفض", "متوسط", "مرتفع"],
                description: "مستوى المخاطر",
              },
              warnings: {
                type: "array",
                items: { type: "string" },
                description: "التحذيرات",
              },
              suggestions: {
                type: "array",
                items: { type: "string" },
                description: "الاقتراحات",
              },
              estimatedDutyPercentage: {
                type: "number",
                description: "معدل الرسم الجمركي المتوقع",
              },
            },
            required: [
              "riskLevel",
              "warnings",
              "suggestions",
              "estimatedDutyPercentage",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("لم تحصل على استجابة من النموذج");

    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    return JSON.parse(contentStr);
  } catch (error) {
    console.error("خطأ في تحليل البيان:", error);
    throw error;
  }
}

/**
 * توقع التكاليف بناءً على البيانات التاريخية والذكاء الاصطناعي
 */
export async function predictCosts(
  declarationData: {
    fobValue: number;
    freightCost: number;
    insuranceCost: number;
    items: { itemName: string; customsCode?: string }[];
    exportCountry: string;
  }
): Promise<CostPrediction> {
  try {
    const itemsList = declarationData.items
      .map((item) => `- ${item.itemName} (${item.customsCode || "بدون كود"})`)
      .join("\n");

    const prompt = `
قم بتوقع التكاليف الجمركية والضريبية للبيان التالي:

القيمة FOB: ${declarationData.fobValue}
أجور الشحن: ${declarationData.freightCost}
التأمين: ${declarationData.insuranceCost}
بلد التصدير: ${declarationData.exportCountry}

الأصناف:
${itemsList}

يرجى تقديم:
1. معدل الرسم الجمركي المتوقع
2. إجمالي الرسوم الجمركية المتوقعة
3. ضريبة المبيعات 16%
4. إجمالي التكلفة النهائية

الاستجابة بصيغة JSON مع تفصيل كامل للتكاليف.
    `;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "أنت محلل مالي جمركي متخصص في حساب التكاليف والرسوم الجمركية.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "cost_prediction",
          strict: true,
          schema: {
            type: "object",
            properties: {
              estimatedCustomsDuty: {
                type: "number",
                description: "الرسوم الجمركية المتوقعة",
              },
              estimatedTotalCost: {
                type: "number",
                description: "إجمالي التكلفة",
              },
              costBreakdown: {
                type: "object",
                properties: {
                  fobValue: { type: "number" },
                  freight: { type: "number" },
                  insurance: { type: "number" },
                  customsDuty: { type: "number" },
                  salesTax: { type: "number" },
                  totalCost: { type: "number" },
                },
                required: [
                  "fobValue",
                  "freight",
                  "insurance",
                  "customsDuty",
                  "salesTax",
                  "totalCost",
                ],
              },
            },
            required: [
              "estimatedCustomsDuty",
              "estimatedTotalCost",
              "costBreakdown",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("لم تحصل على استجابة من النموذج");

    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    return JSON.parse(contentStr);
  } catch (error) {
    console.error("خطأ في توقع التكاليف:", error);
    throw error;
  }
}

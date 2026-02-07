/**
 * AI Router
 * 
 * عمليات الذكاء الاصطناعي والتحليل الذكي
 * 
 * @module server/ai-router
 */
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import {
  suggestItemClassification,
  analyzeDeclaration,
  predictCosts,
} from "./ai-service";
import {
  extractDataFromText,
  validateExtractedData,
  enhanceExtractedData,
} from "./ai-data-extraction";

export const aiRouter = router({
  /**
   * اقتراح ذكي لتصنيف الصنف
   */
  suggestItemClassification: protectedProcedure
    .input(
      z.object({
        itemName: z.string().min(1, "اسم الصنف مطلوب"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await suggestItemClassification(input.itemName, input.description);
      } catch (error) {
        console.error("خطأ في الاقتراح الذكي:", error);
        throw new Error("فشل الحصول على اقتراح ذكي. يرجى محاولة مجددا");
      }
    }),

  /**
   * تحليل ذكي للبيان الجمركي
   */
  analyzeDeclaration: protectedProcedure
    .input(
      z.object({
        declarationId: z.number(),
        declarationNumber: z.string(),
        exportCountry: z.string(),
        totalFobValue: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const declaration = await db.getCustomsDeclarationById(input.declarationId);
        if (!declaration || declaration.userId !== ctx.user.id) {
          throw new Error("البيان الجمركي غير موجود");
        }

        const items = await db.getItemsByDeclarationId(input.declarationId);
        return await analyzeDeclaration({
          declarationNumber: input.declarationNumber,
          items: items.map((item) => ({
            itemName: item.itemName,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPriceForeign),
          })),
          totalFobValue: input.totalFobValue,
          exportCountry: input.exportCountry,
        });
      } catch (error) {
        console.error("خطأ في التحليل الذكي:", error);
        throw new Error("فشل التحليل الذكي. يرجى محاولة مجددا");
      }
    }),

  /**
   * استخراج بيانات من ملف PDF أو Excel
   */
  extractFromFile: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
        fileName: z.string(),
        fileContent: z.string(),
        fileType: z.enum(['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // استخراج البيانات باستخدام الذكاء الاصطناعي
        const extracted = await extractDataFromText(input.fileContent);
        
        // التحقق من البيانات
        const validation = validateExtractedData(extracted);
        
        // تحسين البيانات إذا لم تكن مرضية
        const enhanced = validation.valid ? extracted : await enhanceExtractedData(extracted);
        
        return enhanced;
      } catch (error) {
        console.error('خطأ في استخراج البيانات:', error);
        throw new Error('فشل استخراج البيانات من الملف. يرجى محاولة مجددا');
      }
    }),

  /**
   * توقع ذكي للتكاليف
   */
  predictCosts: protectedProcedure
    .input(
      z.object({
        declarationId: z.number(),
        fobValue: z.number(),
        freightCost: z.number(),
        insuranceCost: z.number(),
        exportCountry: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const declaration = await db.getCustomsDeclarationById(input.declarationId);
        if (!declaration || declaration.userId !== ctx.user.id) {
          throw new Error("البيان الجمركي غير موجود");
        }

        const items = await db.getItemsByDeclarationId(input.declarationId);
        return await predictCosts({
          fobValue: input.fobValue,
          freightCost: input.freightCost,
          insuranceCost: input.insuranceCost,
          items: items.map((item) => ({
            itemName: item.itemName,
            customsCode: item.customsCode || undefined,
          })),
          exportCountry: input.exportCountry,
        })
      } catch (error) {
        console.error("خطأ في توقع التكاليف:", error);
        throw new Error("فشل توقع التكاليف. يرجى محاولة مجددا");
      }
    }),
});

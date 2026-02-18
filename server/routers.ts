/**
 * routers Router
 * tRPC Router
 * @module ./server/routers
 */
import { z } from "zod";
/**
 * Main tRPC Router
 * 
 * يحتوي على جميع tRPC procedures للتطبيق
 * يربط بين العميل والخادم بطريقة آمنة مع الأنواع
 * 
 * @module server/routers
 * @requires server/_core/trpc
 * @requires server/db
 * @requires server/routers/*
 */

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";
import {
  calculateAllCosts,
  calculateItemCosts,
  calculateVariance,
  calculateVariancePercentage,
} from "@shared/calculations";
import { aiRouter } from "./ai-router";
import {
  analyzeCustomsDeclaration,
  distributeValues,
  DEFAULT_EXCHANGE_RATES,
} from "./customs-analyzer";
import {
  extractPdfData,
  validateExtractedData,
} from "./pdf-extraction-service";
import { stripePaymentRouter } from "./stripe-payment-router";
import { paymentMethodsRouter } from "./routers/payment-methods";
import { governmentRouter } from "./routers/government";
import { authRouter } from "./routers/auth";
import { errorsRouter } from "./routers/errors";
import { updatesRouter } from "./routers/updates";
import { notificationsRouter } from "./routers/notifications";
import { paymentGatewaysRouter } from "./routers/payment-gateways";
import { currencyRouter } from "./routers/currency";
import { couponsRouter } from "./routers/coupons";
import { billingRouter } from "./routers/billing";
import { operationsRouter } from "./routers/operations";
import { localPaymentGatewaysRouter } from "./routers/local-payment-gateways";
import { localPaymentGatewayRouter } from "./routers/local-payment-gateway";
import { webhooksRouter } from "./routers/webhooks";
import { notificationsAccountingRouter } from "./routers/notifications-accounting";
import { paymentApisRouter } from "./routers/payment-apis";
import { invoicesRouter } from "./routers/invoices";
import { advancedFeaturesRouter } from "./routers/advanced-features";
import { advancedOperationsRouter } from "./routers/advanced-operations";
import { notificationsCenterRouter } from "./routers/notifications-center";

/**
 * Main Application Router
 * الراوتر الرئيسي للتطبيق يحتوي على جميع العمليات
 */
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  /**
   * ===== إجراءات البيانات الجمركية =====
   */
  customs: router({
    /**
     * إنشاء بيان جمركي جديد
     */
    createDeclaration: protectedProcedure
      .input(
        z.object({
          declarationNumber: z.string().min(1, "رقم البيان مطلوب"),
          registrationDate: z.string().refine((date) => !isNaN(Date.parse(date)), "تاريخ غير صحيح"),
          clearanceCenter: z.string().min(1, "مركز التخليص مطلوب"),
          exchangeRate: z.number().positive("سعر التعادل يجب أن يكون موجباً"),
          exportCountry: z.string().min(1, "بلد التصدير مطلوب"),
          billOfLadingNumber: z.string().min(1, "رقم بوليصة الشحن مطلوب"),
          grossWeight: z.number().positive("الوزن القائم يجب أن يكون موجباً"),
          netWeight: z.number().positive("الوزن الصافي يجب أن يكون موجباً"),
          numberOfPackages: z.number().int().positive("عدد الطرود يجب أن يكون موجباً"),
          packageType: z.string().min(1, "نوع الطرود مطلوب"),
          fobValue: z.number().positive("قيمة البضاعة يجب أن تكون موجبة"),
          freightCost: z.number().nonnegative("أجور الشحن لا يمكن أن تكون سالبة"),
          insuranceCost: z.number().nonnegative("التأمين لا يمكن أن يكون سالباً"),
          customsDuty: z.number().nonnegative("الرسوم الجمركية لا يمكن أن تكون سالبة"),
          additionalFees: z.number().nonnegative().optional().default(0),
          customsServiceFee: z.number().nonnegative().optional().default(0),
          penalties: z.number().nonnegative().optional().default(0),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // حساب جميع التكاليف
        const calculations = calculateAllCosts({
          fobValueForeign: input.fobValue,
          exchangeRate: input.exchangeRate,
          freightCost: input.freightCost,
          insuranceCost: input.insuranceCost,
          customsDuty: input.customsDuty,
          additionalFees: input.additionalFees,
          customsServiceFee: input.customsServiceFee,
          penalties: input.penalties,
        });

        // إنشاء البيان الجمركي
        const declaration = await db.createCustomsDeclaration(ctx.user.id, {
          declarationNumber: input.declarationNumber,
          registrationDate: new Date(input.registrationDate),
          clearanceCenter: input.clearanceCenter,
          exchangeRate: input.exchangeRate.toString(),
          exportCountry: input.exportCountry,
          billOfLadingNumber: input.billOfLadingNumber,
          grossWeight: input.grossWeight.toString(),
          netWeight: input.netWeight.toString(),
          numberOfPackages: input.numberOfPackages,
          packageType: input.packageType,
          fobValue: input.fobValue.toString(),
          fobValueJod: calculations.fobValueJod.toString(),
          freightCost: input.freightCost.toString(),
          insuranceCost: input.insuranceCost.toString(),
          customsDuty: input.customsDuty.toString(),
          salesTax: calculations.salesTax.toString(),
          additionalFees: input.additionalFees.toString(),
          customsServiceFee: input.customsServiceFee.toString(),
          penalties: input.penalties.toString(),
          totalLandedCost: calculations.totalLandedCost.toString(),
          additionalExpensesRatio: calculations.additionalExpensesRatio.toString(),
          status: "draft",
        });

        // إنشاء الملخص المالي
        await db.createOrUpdateFinancialSummary({
          declarationId: declaration.id,
          totalFobValue: calculations.fobValueJod.toString(),
          totalFreightAndInsurance: calculations.freightAndInsurance.toString(),
          totalCustomsAndTaxes: calculations.totalCustomsAndTaxes.toString(),
          totalLandedCost: calculations.totalLandedCost.toString(),
          additionalExpensesRatio: calculations.additionalExpensesRatio.toString(),
        });

        return declaration;
      }),

    /**
     * الحصول على بيان جمركي
     */
    getDeclaration: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const declaration = await db.getCustomsDeclarationById(input.id);
        if (!declaration || declaration.userId !== ctx.user.id) {
          throw new Error("البيان الجمركي غير موجود أو ليس لديك صلاحية الوصول إليه");
        }
        return declaration;
      }),

    /**
     * الحصول على قائمة البيانات الجمركية للمستخدم
     */
    listDeclarations: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCustomsDeclarationsByUserId(ctx.user.id);
    }),

    /**
     * تحديث بيان جمركي
     */
    updateDeclaration: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: z.object({
            status: z.enum(["draft", "submitted", "approved", "cleared"]).optional(),
            notes: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const declaration = await db.getCustomsDeclarationById(input.id);
        if (!declaration || declaration.userId !== ctx.user.id) {
          throw new Error("البيان الجمركي غير موجود أو ليس لديك صلاحية تعديله");
        }
        return await db.updateCustomsDeclaration(input.id, input.data);
      }),

    /**
     * حذف بيان جمركي
     */
    deleteDeclaration: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const declaration = await db.getCustomsDeclarationById(input.id);
        if (!declaration || declaration.userId !== ctx.user.id) {
          throw new Error("البيان الجمركي غير موجود أو ليس لديك صلاحية حذفه");
        }
        await db.deleteItemsByDeclarationId(input.id);
        return await db.deleteCustomsDeclaration(input.id);
      }),
  }),

  /**
   * ===== إجراءات الأصناف =====
   */
  items: router({
    /**
     * إضافة صنف جديد
     */
    createItem: protectedProcedure
      .input(
        z.object({
          declarationId: z.number(),
          itemName: z.string().min(1, "اسم الصنف مطلوب"),
          quantity: z.number().positive("الكمية يجب أن تكون موجبة"),
          unitPriceForeign: z.number().positive("سعر الوحدة يجب أن يكون موجباً"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // التحقق من أن البيان الجمركي ينتمي للمستخدم
        const declaration = await db.getCustomsDeclarationById(input.declarationId);
        if (!declaration || declaration.userId !== ctx.user.id) {
          throw new Error("البيان الجمركي غير موجود");
        }

        // حساب الأسعار
        const totalPriceForeign = input.quantity * input.unitPriceForeign;
        const totalPriceJod = totalPriceForeign * Number(declaration.exchangeRate);

        // الحصول على الملخص المالي لحساب النسبة والحصة
        const summary = await db.getFinancialSummaryByDeclarationId(input.declarationId);
        if (!summary) {
          throw new Error("الملخص المالي غير موجود");
        }

        const totalFobValueJod = Number(summary.totalFobValue);
        const totalCustomsAndTaxes = Number(summary.totalCustomsAndTaxes);

        // حساب تكاليف الصنف
        const itemCalculations = calculateItemCosts({
          itemFobValueForeign: totalPriceForeign,
          exchangeRate: Number(declaration.exchangeRate),
          quantity: input.quantity,
          totalFobValueJod,
          totalCustomsAndTaxes,
        });

        // إنشاء الصنف
        const item = await db.createItem({
          declarationId: input.declarationId,
          itemName: input.itemName,
          quantity: input.quantity.toString(),
          unitPriceForeign: input.unitPriceForeign.toString(),
          totalPriceForeign: totalPriceForeign.toString(),
          totalPriceJod: totalPriceJod.toString(),
          valuePercentage: itemCalculations.itemValuePercentage.toString(),
          itemExpensesShare: itemCalculations.itemExpensesShare.toString(),
          totalItemCostJod: itemCalculations.itemTotalCost.toString(),
          unitCostJod: itemCalculations.unitCost.toString(),
        });

        return item;
      }),

    /**
     * الحصول على أصناف البيان الجمركي
     */
    getItems: protectedProcedure
      .input(z.object({ declarationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const declaration = await db.getCustomsDeclarationById(input.declarationId);
        if (!declaration || declaration.userId !== ctx.user.id) {
          throw new Error("البيان الجمركي غير موجود");
        }
        return await db.getItemsByDeclarationId(input.declarationId);
      }),

    /**
     * تحديث صنف
     */
    updateItem: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          itemName: z.string().optional(),
          itemCode: z.string().optional(),
          quantity: z.number().positive().optional(),
          unitPriceForeign: z.number().positive().optional(),
          description: z.string().optional(),
          customsCode: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const item = await db.getItemById(input.id);
        if (!item) {
          throw new Error("الصنف غير موجود");
        }

        const declaration = await db.getCustomsDeclarationById(item.declarationId);
        if (!declaration || declaration.userId !== ctx.user.id) {
          throw new Error("البيان الجمركي غير موجود");
        }

        const updateData: Record<string, string> = {};
        if (input.itemName) updateData.itemName = input.itemName;
        if (input.itemCode) updateData.itemCode = input.itemCode;
        if (input.quantity) updateData.quantity = input.quantity.toString();
        if (input.unitPriceForeign) updateData.unitPriceForeign = input.unitPriceForeign.toString();
        if (input.description) updateData.description = input.description;
        if (input.customsCode) updateData.customsCode = input.customsCode;

        return await db.updateItem(input.id, updateData);
      }),

    /**
     * حذف صنف
     */
    deleteItem: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const item = await db.getItemById(input.id);
        if (!item) {
          throw new Error("الصنف غير موجود");
        }

        const declaration = await db.getCustomsDeclarationById(item.declarationId);
        if (!declaration || declaration.userId !== ctx.user.id) {
          throw new Error("البيان الجمركي غير موجود");
        }
        return await db.deleteItem(input.id);
      }),
  }),

  /**
   * ===== إجراءات الانحرافات والمقارنات =====
   */
  variances: router({
    /**
     * حساب وحفظ الانحرافات
     */
    calculateVariances: protectedProcedure
      .input(
        z.object({
          declarationId: z.number(),
          estimatedFobValue: z.number().nonnegative(),
          estimatedFreight: z.number().nonnegative(),
          estimatedInsurance: z.number().nonnegative(),
          estimatedCustomsDuty: z.number().nonnegative(),
          estimatedSalesTax: z.number().nonnegative(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const declaration = await db.getCustomsDeclarationById(input.declarationId);
        if (!declaration || declaration.userId !== ctx.user.id) {
          throw new Error("البيان الجمركي غير موجود");
        }

        const fobVariance = calculateVariance(
          Number(declaration.fobValueJod),
          input.estimatedFobValue
        );
        const freightVariance = calculateVariance(
          Number(declaration.freightCost),
          input.estimatedFreight
        );
        const insuranceVariance = calculateVariance(
          Number(declaration.insuranceCost),
          input.estimatedInsurance
        );
        const customsDutyVariance = calculateVariance(
          Number(declaration.customsDuty),
          input.estimatedCustomsDuty
        );
        const salesTaxVariance = calculateVariance(
          Number(declaration.salesTax),
          input.estimatedSalesTax
        );
        const totalVariance = fobVariance + freightVariance + insuranceVariance + customsDutyVariance + salesTaxVariance;

        return await db.createOrUpdateVariance({
          declarationId: input.declarationId,
          fobVariance: fobVariance.toString(),
          freightVariance: freightVariance.toString(),
          insuranceVariance: insuranceVariance.toString(),
          customsDutyVariance: customsDutyVariance.toString(),
          salesTaxVariance: salesTaxVariance.toString(),
          totalVariance: totalVariance.toString(),
          fobVariancePercent: calculateVariancePercentage(fobVariance, input.estimatedFobValue).toString(),
          freightVariancePercent: calculateVariancePercentage(freightVariance, input.estimatedFreight).toString(),
          insuranceVariancePercent: calculateVariancePercentage(insuranceVariance, input.estimatedInsurance).toString(),
          customsDutyVariancePercent: calculateVariancePercentage(customsDutyVariance, input.estimatedCustomsDuty).toString(),
          salesTaxVariancePercent: calculateVariancePercentage(salesTaxVariance, input.estimatedSalesTax).toString(),
          totalVariancePercent: calculateVariancePercentage(totalVariance, input.estimatedFobValue + input.estimatedFreight + input.estimatedInsurance + input.estimatedCustomsDuty + input.estimatedSalesTax).toString(),
        });
      }),

    /**
     * الحصول على الانحرافات
     */
    getVariances: protectedProcedure
      .input(z.object({ declarationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const declaration = await db.getCustomsDeclarationById(input.declarationId);
        if (!declaration || declaration.userId !== ctx.user.id) {
          throw new Error("البيان الجمركي غير موجود");
        }
        return await db.getVarianceByDeclarationId(input.declarationId);
      }),
  }),

  /**
   * ===== إجراءات الملخصات المالية =====
   */
  financialSummary: router({
    /**
     * الحصول على الملخص المالي
     */
    getSummary: protectedProcedure
      .input(z.object({ declarationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const declaration = await db.getCustomsDeclarationById(input.declarationId);
        if (!declaration || declaration.userId !== ctx.user.id) {
          throw new Error("البيان الجمركي غير موجود");
        }
        return await db.getFinancialSummaryByDeclarationId(input.declarationId);
      }),
  }),

  /**
   * ===== إجراءات استيراد PDF =====
   */
  pdfImport: router({
    importDeclaration: protectedProcedure
      .input(
        z.object({
          filePath: z.string().min(1, "مسار الملف مطلوب"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const extractedData = await extractPdfData(input.filePath);
          const validationErrors = validateExtractedData(extractedData);
          
          return {
            success: extractedData.extractionSuccess,
            data: extractedData,
            validationErrors,
            confidence: extractedData.confidence,
          };
        } catch (error) {
          throw new Error(`خطأ في استيراد الملف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        }
      }),
  }),

  /**
   * ===== إجراءات الإشعارات =====
   */
  notifications: router({
    getNotifications: protectedProcedure
      .input(
        z.object({
          limit: z.number().int().positive().default(50),
          offset: z.number().int().nonnegative().default(0),
        })
      )
      .query(async ({ ctx, input }) => {
        return await db.getNotificationsByUserId(ctx.user.id, input.limit, input.offset);
      }),

    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUnreadNotificationCount(ctx.user.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.notificationId);
        return { success: true };
      }),

    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),

    delete: protectedProcedure
      .input(z.object({ notificationId: z.number().int().positive() }))
      .mutation(async ({ input }) => {
        await db.deleteNotification(input.notificationId);
        return { success: true };
      }),
  }),

  /**
   * ===== إجراءات تتبع الحاويات =====
   */
  tracking: router({
    createContainer: protectedProcedure
      .input(
        z.object({
          containerNumber: z.string().min(1, "رقم الحاوية مطلوب"),
          containerType: z.enum(["20ft", "40ft", "40ftHC", "45ft", "other"]),
          shippingCompany: z.string().min(1, "شركة الشحن مطلوبة"),
          billOfLadingNumber: z.string().min(1, "بوليصة الشحن مطلوبة"),
          portOfLoading: z.string().min(1, "ميناء الشحن مطلوب"),
          portOfDischarge: z.string().min(1, "ميناء التفريغ مطلوب"),
          sealNumber: z.string().optional(),
          loadingDate: z.string().optional(),
          estimatedArrivalDate: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await db.createContainer({
            userId: ctx.user.id,
            ...input,
          });
          return { success: true };
        } catch (error) {
          throw new Error("فشل في إنشاء الحاوية");
        }
      }),

    getContainers: protectedProcedure.query(async ({ ctx }) => {
      try {
        const containers = await db.getUserContainers(ctx.user.id);
        return containers;
      } catch (error) {
        throw new Error("فشل في جلب الحاويات");
      }
    }),

    searchContainers: protectedProcedure
      .input(z.object({ query: z.string().min(1) }))
      .query(async ({ input, ctx }) => {
        try {
          const results = await db.searchContainers(ctx.user.id, input.query);
          return results;
        } catch (error) {
          throw new Error("فشل في البحث عن الحاويات");
        }
      }),

    getContainerByNumber: protectedProcedure
      .input(z.object({ containerNumber: z.string().min(1) }))
      .query(async ({ input }) => {
        try {
          const container = await db.getContainerByNumber(input.containerNumber);
          return container;
        } catch (error) {
          throw new Error("فشل في جلب بيانات الحاوية");
        }
      }),

    addTrackingEvent: protectedProcedure
      .input(
        z.object({
          containerId: z.number().int().positive(),
          eventType: z.enum(["loaded", "departed", "in_transit", "arrived", "cleared", "delivered", "delayed", "customs_clearance", "other"]),
          eventLocation: z.string().optional(),
          eventDescription: z.string().optional(),
          eventDateTime: z.string(),
          documentUrl: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await db.addTrackingEvent({
            containerId: input.containerId,
            userId: ctx.user.id,
            eventType: input.eventType,
            eventLocation: input.eventLocation,
            eventDescription: input.eventDescription,
            eventDateTime: new Date(input.eventDateTime),
            documentUrl: input.documentUrl,
            notes: input.notes,
          });
          return { success: true };
        } catch (error) {
          throw new Error("فشل في إضافة حدث التتبع");
        }
      }),

    getTrackingHistory: protectedProcedure
      .input(z.object({ containerId: z.number().int().positive() }))
      .query(async ({ input }) => {
        try {
          const history = await db.getContainerTrackingHistory(input.containerId);
          return history;
        } catch (error) {
          throw new Error("فشل في جلب سجل التتبع");
        }
      }),

    updateContainerStatus: protectedProcedure
      .input(
        z.object({
          containerId: z.number().int().positive(),
          status: z.enum(["pending", "in_transit", "arrived", "cleared", "delivered", "delayed"]),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await db.updateContainerStatus(input.containerId, input.status);
          return { success: true };
        } catch (error) {
          throw new Error("فشل في تحديث حالة الحاوية");
        }
      }),

    createShipmentDetail: protectedProcedure
      .input(
        z.object({
          containerId: z.number().int().positive(),
          shipmentNumber: z.string().min(1),
          totalWeight: z.number().positive(),
          totalVolume: z.number().optional(),
          numberOfPackages: z.number().int().positive(),
          packageType: z.string().optional(),
          shipper: z.string().min(1),
          consignee: z.string().min(1),
          freightCharges: z.number().optional(),
          insuranceCharges: z.number().optional(),
          handlingCharges: z.number().optional(),
          otherCharges: z.number().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const result = await db.createShipmentDetail({
            userId: ctx.user.id,
            ...input,
          });
          return { success: true };
        } catch (error) {
          throw new Error("فشل في إنشاء تفاصيل الشحنة");
        }
      }),

    getShipmentDetail: protectedProcedure
      .input(z.object({ shipmentContainerId: z.number().int().positive() }))
      .query(async ({ input }) => {
        try {
          const detail = await db.getShipmentDetail(input.shipmentContainerId);
          return detail;
        } catch (error) {
          throw new Error("فشل في جلب تفاصيل الشحنة");
        }
      }),
  }),
  stripe: stripePaymentRouter,
  paymentMethods: paymentMethodsRouter,
  government: governmentRouter,
  ai: aiRouter,
  errors: errorsRouter,
  updates: updatesRouter,
  sms: notificationsRouter,
  paymentGateways: paymentGatewaysRouter,
  currency: currencyRouter,
  coupons: couponsRouter,
  billing: billingRouter,
  operations: operationsRouter,
  localPaymentGateways: localPaymentGatewaysRouter,
  localPaymentGateway: localPaymentGatewayRouter,
  webhooks: webhooksRouter,
  notificationsAccounting: notificationsAccountingRouter,
  paymentApis: paymentApisRouter,
  invoices: invoicesRouter,
  advancedFeatures: advancedFeaturesRouter,
  advancedOperations: advancedOperationsRouter,
  notificationsCenter: notificationsCenterRouter,
});

export type AppRouter = typeof appRouter;

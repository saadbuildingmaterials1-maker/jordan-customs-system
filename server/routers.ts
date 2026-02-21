import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    
    // Check trial status for authenticated user
    checkTrial: protectedProcedure.query(async ({ ctx }) => {
      const trialInfo = await db.checkUserTrial(ctx.user.id);
      return trialInfo;
    }),
  }),

  // System info router
  info: router({
    developer: publicProcedure.query(() => {
      return {
        name: process.env.DEVELOPER_NAME || "غير محدد",
        email: process.env.DEVELOPER_EMAIL || "غير محدد",
        phone: process.env.DEVELOPER_PHONE || "غير محدد",
      };
    }),
  }),

  // Shipments router
  shipments: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserShipments(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        return db.getShipmentById(input.id, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        senderName: z.string().min(1),
        senderCountry: z.string().min(1),
        recipientName: z.string().min(1),
        recipientAddress: z.string().min(1),
        recipientPhone: z.string().min(1),
        productType: z.string().min(1),
        productValue: z.number().positive(),
        weight: z.number().positive(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createShipment({
          ...input,
          userId: ctx.user.id,
        });
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'in_transit', 'customs_clearance', 'out_for_delivery', 'delivered', 'cancelled']),
        location: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.updateShipmentStatus(input.id, input.status, ctx.user.id, input.location, input.notes);
      }),
    
    track: publicProcedure
      .input(z.object({ trackingNumber: z.string() }))
      .query(async ({ input }) => {
        return db.trackShipment(input.trackingNumber);
      }),
  }),

  // Customs Declarations router
  customsDeclarations: router({    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserCustomsDeclarations(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        return db.getCustomsDeclarationById(input.id, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        declarationNumber: z.string().min(1),
        declarationDate: z.string(),
        importerName: z.string().min(1),
        importerTaxId: z.string().optional(),
        originCountry: z.string().min(1),
        totalValue: z.number().positive(),
        salesTax: z.number().nonnegative(),
        additionalFees: z.number().nonnegative(),
        declarationFees: z.number().nonnegative(),
        items: z.array(z.object({
          itemCode: z.string().optional(),
          itemDescription: z.string().min(1),
          hsCode: z.string().optional(),
          quantity: z.number().positive(),
          unit: z.string().min(1),
          unitPrice: z.number().positive(),
          itemValue: z.number().positive(),
          itemWeight: z.number().optional(),
          valuePercentage: z.number().nonnegative(),
          salesTaxAmount: z.number().nonnegative(),
          additionalFeesDistributed: z.number().nonnegative(),
          declarationFeesDistributed: z.number().nonnegative(),
          totalItemCost: z.number().nonnegative(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createCustomsDeclaration({
          ...input,
          userId: ctx.user.id,
        });
      }),
  }),

  // Containers router
  containers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserContainers(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        return db.getContainerById(input.id, ctx.user.id);
      }),
    
    track: publicProcedure
      .input(z.object({ containerNumber: z.string() }))
      .query(async ({ input }) => {
        return db.trackContainer(input.containerNumber);
      }),
    
    create: protectedProcedure
      .input(z.object({
        containerNumber: z.string().min(1),
        shippingLine: z.string().min(1),
        originPort: z.string().min(1),
        destinationPort: z.string().min(1),
        departureDate: z.string().optional(),
        estimatedArrival: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createContainer({
          ...input,
          userId: ctx.user.id,
        });
      }),
  }),

  // Suppliers router
  suppliers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserSuppliers(ctx.user.id);
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        return db.getSupplierById(input.id, ctx.user.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        companyName: z.string().min(1),
        phone: z.string().min(1),
        email: z.string().email().optional(),
        address: z.string().optional(),
        totalAmount: z.number().nonnegative(),
        paidAmount: z.number().nonnegative().default(0),
        status: z.enum(['active', 'inactive', 'blocked']).default('active'),
      }))
      .mutation(async ({ input, ctx }) => {
        const remainingAmount = input.totalAmount - input.paidAmount;
        return db.createSupplier({
          ...input,
          userId: ctx.user.id,
          remainingAmount,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        companyName: z.string().min(1).optional(),
        phone: z.string().min(1).optional(),
        email: z.string().email().optional(),
        address: z.string().optional(),
        totalAmount: z.number().nonnegative().optional(),
        status: z.enum(['active', 'inactive', 'blocked']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        return db.updateSupplier(id, ctx.user.id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return db.deleteSupplier(input.id, ctx.user.id);
      }),
    
    // Payments
    getPayments: protectedProcedure
      .input(z.object({ supplierId: z.number() }))
      .query(async ({ input, ctx }) => {
        return db.getSupplierPayments(input.supplierId, ctx.user.id);
      }),
    
    addPayment: protectedProcedure
      .input(z.object({
        supplierId: z.number(),
        amount: z.number().positive(),
        paymentDate: z.string(),
        paymentMethod: z.string().min(1),
        referenceNumber: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify supplier ownership
        const supplier = await db.getSupplierById(input.supplierId, ctx.user.id);
        if (!supplier) throw new Error("Supplier not found");
        
        return db.createSupplierPayment({
          ...input,
          status: 'completed',
        });
      }),
    
    // Items
    getItems: protectedProcedure
      .input(z.object({ supplierId: z.number() }))
      .query(async ({ input, ctx }) => {
        return db.getSupplierItems(input.supplierId, ctx.user.id);
      }),
    
    addItem: protectedProcedure
      .input(z.object({
        supplierId: z.number(),
        itemName: z.string().min(1),
        itemCode: z.string().optional(),
        unitPrice: z.number().positive(),
        quantity: z.number().positive(),
        unit: z.string().min(1),
        category: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verify supplier ownership
        const supplier = await db.getSupplierById(input.supplierId, ctx.user.id);
        if (!supplier) throw new Error("Supplier not found");
        
        return db.createSupplierItem({
          ...input,
          status: 'active',
        });
      }),
    
    updateItem: protectedProcedure
      .input(z.object({
        id: z.number(),
        itemName: z.string().min(1).optional(),
        itemCode: z.string().optional(),
        unitPrice: z.number().positive().optional(),
        quantity: z.number().positive().optional(),
        unit: z.string().min(1).optional(),
        category: z.string().optional(),
        status: z.enum(['active', 'inactive']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        return db.updateSupplierItem(id, ctx.user.id, data);
      }),
    
    deleteItem: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        return db.deleteSupplierItem(input.id, ctx.user.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;

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
});

export type AppRouter = typeof appRouter;

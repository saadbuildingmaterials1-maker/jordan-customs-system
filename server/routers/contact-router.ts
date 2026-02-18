/**
 * Contact Form tRPC Router
 * 
 * Handles contact form submissions and management
 * 
 * @module ./server/routers/contact-router
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  submitContactForm,
  getContactMessages,
  getContactMessageById,
  replyToContactMessage,
  getContactStatistics,
} from '../services/contact-service';
import { TRPCError } from '@trpc/server';

export const contactRouter = router({
  /**
   * Submit a contact form
   * Public procedure - no authentication required
   */
  submitForm: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        email: z.string().email(),
        phone: z.string().min(9).max(20),
        company: z.string().max(255).optional(),
        subject: z.string().min(5).max(255),
        category: z.enum([
          'general_inquiry',
          'technical_support',
          'billing',
          'partnership',
          'feedback',
          'complaint',
          'other',
        ]),
        message: z.string().min(10).max(5000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await submitContactForm({
          ...input,
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers['user-agent'],
        });

        return result;
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error instanceof Error ? error.message : 'فشل في إرسال الرسالة',
        });
      }
    }),

  /**
   * Get contact messages (admin only)
   */
  getMessages: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
        status: z.enum(['new', 'read', 'in_progress', 'resolved', 'closed']).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'ليس لديك صلاحية للوصول إلى هذه البيانات',
        });
      }

      try {
        return await getContactMessages(input.limit, input.offset, input.status);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'فشل في جلب الرسائل',
        });
      }
    }),

  /**
   * Get contact message by ID (admin only)
   */
  getMessageById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'ليس لديك صلاحية للوصول إلى هذه البيانات',
        });
      }

      try {
        const message = await getContactMessageById(input.id);

        if (!message) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'الرسالة غير موجودة',
          });
        }

        return message;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'فشل في جلب الرسالة',
        });
      }
    }),

  /**
   * Reply to contact message (admin only)
   */
  replyToMessage: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        reply: z.string().min(10).max(5000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'ليس لديك صلاحية لتنفيذ هذا الإجراء',
        });
      }

      try {
        return await replyToContactMessage(
          input.messageId,
          input.reply,
          ctx.user.id
        );
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'فشل في إرسال الرد',
        });
      }
    }),

  /**
   * Get contact statistics (admin only)
   */
  getStatistics: protectedProcedure
    .input(
      z.object({
        period: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
      })
    )
    .query(async ({ input, ctx }) => {
      // Check if user is admin
      if (ctx.user.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'ليس لديك صلاحية للوصول إلى هذه البيانات',
        });
      }

      try {
        return await getContactStatistics(input.period);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'فشل في جلب الإحصائيات',
        });
      }
    }),
});

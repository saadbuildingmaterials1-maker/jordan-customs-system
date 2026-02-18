import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '@/server/_core/trpc';
import {
  createBackup,
  getBackups,
  getBackupById,
  restoreBackup,
  deleteBackup,
  verifyBackup,
  getRestoreHistory,
  getBackupStatistics,
  updateBackupSettings,
  getBackupSettings,
} from '@/server/services/backup-service';

/**
 * مسارات النسخ الاحتياطي
 * Backup Router
 */

export const backupRouter = router({
  // ==================== إنشاء نسخة احتياطية ====================
  create: adminProcedure
    .input(
      z.object({
        backupName: z.string().min(1).max(100),
        backupType: z.enum(['full', 'incremental', 'differential']),
        includedTables: z.array(z.string()),
        excludedTables: z.array(z.string()).optional(),
        compressionEnabled: z.boolean().optional(),
        encryptionEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return createBackup(input, ctx.user.id);
    }),

  // ==================== جلب النسخ الاحتياطية ====================
  list: adminProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      return getBackups(input.limit, input.offset);
    }),

  // ==================== جلب نسخة احتياطية واحدة ====================
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getBackupById(input.id);
    }),

  // ==================== استعادة نسخة احتياطية ====================
  restore: adminProcedure
    .input(
      z.object({
        backupId: z.number(),
        restoreType: z.enum(['full', 'partial', 'point_in_time']),
        tablesToRestore: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return restoreBackup(input, ctx.user.id);
    }),

  // ==================== حذف نسخة احتياطية ====================
  delete: adminProcedure
    .input(z.object({ backupId: z.number() }))
    .mutation(async ({ input }) => {
      return deleteBackup(input.backupId);
    }),

  // ==================== التحقق من النسخة الاحتياطية ====================
  verify: adminProcedure
    .input(z.object({ backupId: z.number() }))
    .mutation(async ({ input }) => {
      return verifyBackup(input.backupId);
    }),

  // ==================== جلب سجل الاستعادة ====================
  getRestoreHistory: adminProcedure
    .input(
      z.object({
        backupId: z.number(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      return getRestoreHistory(input.backupId, input.limit);
    }),

  // ==================== جلب إحصائيات النسخ الاحتياطية ====================
  getStatistics: adminProcedure.query(async () => {
    return getBackupStatistics();
  }),

  // ==================== تحديث إعدادات النسخ الاحتياطي ====================
  updateSettings: adminProcedure
    .input(
      z.object({
        backupEnabled: z.boolean().optional(),
        autoBackupEnabled: z.boolean().optional(),
        encryptionEnabled: z.boolean().optional(),
        compressionEnabled: z.boolean().optional(),
        verificationEnabled: z.boolean().optional(),
        retentionDays: z.number().optional(),
        notificationsEnabled: z.boolean().optional(),
        adminEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return updateBackupSettings(input);
    }),

  // ==================== جلب إعدادات النسخ الاحتياطي ====================
  getSettings: adminProcedure.query(async () => {
    return getBackupSettings();
  }),

  // ==================== جلب أحدث النسخ الاحتياطية ====================
  getLatest: adminProcedure
    .input(z.object({ limit: z.number().default(5) }))
    .query(async ({ input }) => {
      return getBackups(input.limit, 0);
    }),

  // ==================== جلب النسخ الاحتياطية المكتملة ====================
  getCompleted: adminProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const allBackups = await getBackups(input.limit + input.offset, 0);
      return allBackups.filter((b) => b.status === 'completed').slice(input.offset, input.offset + input.limit);
    }),

  // ==================== جلب النسخ الاحتياطية الفاشلة ====================
  getFailed: adminProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const allBackups = await getBackups(input.limit + input.offset, 0);
      return allBackups.filter((b) => b.status === 'failed').slice(input.offset, input.offset + input.limit);
    }),

  // ==================== جدولة النسخ الاحتياطية ====================
  scheduleBackup: adminProcedure
    .input(
      z.object({
        backupName: z.string(),
        frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
        backupTime: z.string().optional(),
        includedTables: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return createBackup(
        {
          backupName: input.backupName,
          backupType: 'full',
          includedTables: input.includedTables,
        },
        ctx.user.id
      );
    }),
});

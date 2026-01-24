/**
 * Auth Router
 * يتعامل مع عمليات المصادقة وإدارة الجلسات
 */

import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { publicProcedure, router } from "../_core/trpc";

export const authRouter = router({
  /**
   * الحصول على بيانات المستخدم الحالي
   */
  me: publicProcedure.query((opts) => opts.ctx.user),

  /**
   * تسجيل الخروج
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),
});

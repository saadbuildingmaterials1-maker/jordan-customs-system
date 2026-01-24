/**
 * خدمة معالجة الأخطاء الموحدة
 * توفر معالجة موحدة لجميع الأخطاء في التطبيق
 */

import { TRPCError } from '@trpc/server';

export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
  timestamp: Date;
}

export class AppErrorHandler {
  /**
   * معالجة الخطأ وتحويله إلى TRPCError
   */
  static handle(error: any): TRPCError {
    if (error instanceof TRPCError) {
      return error;
    }

    if (error instanceof ValidationError) {
      return new TRPCError({
        code: 'BAD_REQUEST',
        message: error.message,
        cause: error.details,
      });
    }

    if (error instanceof NotFoundError) {
      return new TRPCError({
        code: 'NOT_FOUND',
        message: error.message,
      });
    }

    if (error instanceof UnauthorizedError) {
      return new TRPCError({
        code: 'UNAUTHORIZED',
        message: error.message,
      });
    }

    if (error instanceof ForbiddenError) {
      return new TRPCError({
        code: 'FORBIDDEN',
        message: error.message,
      });
    }

    if (error instanceof ConflictError) {
      return new TRPCError({
        code: 'CONFLICT',
        message: error.message,
      });
    }

    if (error instanceof RateLimitError) {
      return new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: error.message,
      });
    }

    // خطأ عام غير متوقع
    console.error('Unexpected error:', error);
    return new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'حدث خطأ غير متوقع',
    });
  }

  /**
   * تسجيل الخطأ
   */
  static log(error: any, context?: string): void {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] ${context || 'Error'}`;

    if (error instanceof Error) {
      console.error(message, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    } else {
      console.error(message, error);
    }
  }
}

/**
 * أخطاء مخصصة للتطبيق
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'غير مصرح') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'ممنوع الوصول') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string = 'تم تجاوز حد الطلبات',
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Middleware معالجة الأخطاء
 */
export const errorHandlingMiddleware = (error: any) => {
  AppErrorHandler.log(error);
  return AppErrorHandler.handle(error);
};

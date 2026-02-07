/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Re-export schema types for convenience
export type {
  CustomsDeclaration,
  Item,
  Variance,
  FinancialSummary,
  User,
} from "../drizzle/schema";


// ============================================
// Generic Types for replacing 'any'
// ============================================

/** أي نوع من البيانات */
export type AnyData = Record<string, unknown>;

/** دالة callback عامة */
export type Callback<T = void> = () => T;

/** نوع الخطأ العام */
export type ErrorType = Error | unknown;

/** دالة معالج الأخطاء */
export type ErrorHandler = (error: ErrorType, context?: string) => void;

/** دالة معالج النجاح */
export type SuccessHandler<T = unknown> = (data: T) => void;

/** استجابة API عامة */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** بيانات النموذج العامة */
export interface FormData {
  [key: string]: unknown;
}

/** معالج إرسال النموذج */
export type FormSubmitHandler<T extends FormData = FormData> = (data: T) => Promise<void> | void;

/** خصائص المكون العامة */
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}

/** حالة التحميل */
export interface LoadingState {
  isLoading: boolean;
  error?: Error | null;
  data?: unknown;
}

/** وحدة Lazy Loaded */
export interface LazyModule<T = unknown> {
  default: T;
  [key: string]: unknown;
}

/** معالج الحدث العام */
export type EventHandler<T extends Event = Event> = (event: T) => void;

/** دالة غير متزامنة */
export type AsyncFunction<T = unknown, Args extends any[] = any[]> = (
  ...args: Args
) => Promise<T>;


/**
 * دالة helper للحصول على رسالة الخطأ بشكل آمن
 */
export function getErrorMessage(error: ErrorType): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as Record<string, unknown>).message);
  }
  return 'خطأ غير معروف';
}

/**
 * دالة helper للتحقق من أن الخطأ هو Error
 */
export function isError(error: ErrorType): error is Error {
  return error instanceof Error;
}

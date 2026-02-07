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

/** دالة معالج الأخطاء */
export type ErrorHandler = (error: Error | unknown, context?: string) => void;

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

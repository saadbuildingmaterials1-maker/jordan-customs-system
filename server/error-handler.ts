/**
 * معالج الأخطاء المركزي
 * يوفر معالجة موحدة لجميع أنواع الأخطاء في التطبيق
 */

export enum ErrorCode {
  // أخطاء المصادقة والتفويض
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // أخطاء المدخلات
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // أخطاء قاعدة البيانات
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD = 'DUPLICATE_RECORD',
  DATABASE_CONNECTION_ERROR = 'DATABASE_CONNECTION_ERROR',

  // أخطاء Stripe
  STRIPE_ERROR = 'STRIPE_ERROR',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  INVALID_PAYMENT_METHOD = 'INVALID_PAYMENT_METHOD',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',

  // أخطاء الملفات
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_SIZE_EXCEEDED = 'FILE_SIZE_EXCEEDED',

  // أخطاء الخدمات الخارجية
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  API_ERROR = 'API_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // أخطاء عامة
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * معالج الأخطاء الرئيسي
 */
export class ErrorHandler {
  /**
   * معالجة خطأ وإرجاع استجابة موحدة
   */
  static handle(error: unknown, requestId?: string): ErrorResponse {
    console.error('[ErrorHandler]', error);

    if (error instanceof AppError) {
      return {
        code: error.code,
        message: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
        requestId,
      };
    }

    if (error instanceof Error) {
      // أخطاء قاعدة البيانات
      if (error.message.includes('database')) {
        return {
          code: ErrorCode.DATABASE_ERROR,
          message: 'حدث خطأ في قاعدة البيانات',
          details: { originalError: error.message },
          timestamp: new Date().toISOString(),
          requestId,
        };
      }

      // أخطاء Stripe
      if (error.message.includes('stripe') || error.message.includes('payment')) {
        return {
          code: ErrorCode.STRIPE_ERROR,
          message: 'حدث خطأ في معالجة الدفع',
          details: { originalError: error.message },
          timestamp: new Date().toISOString(),
          requestId,
        };
      }

      // أخطاء الملفات
      if (error.message.includes('file') || error.message.includes('upload')) {
        return {
          code: ErrorCode.FILE_UPLOAD_ERROR,
          message: 'حدث خطأ في رفع الملف',
          details: { originalError: error.message },
          timestamp: new Date().toISOString(),
          requestId,
        };
      }

      // أخطاء عامة
      return {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: 'حدث خطأ في الخادم',
        details: { originalError: error.message },
        timestamp: new Date().toISOString(),
        requestId,
      };
    }

    // خطأ غير معروف
    return {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'حدث خطأ غير متوقع',
      details: { error: String(error) },
      timestamp: new Date().toISOString(),
      requestId,
    };
  }

  /**
   * التحقق من صحة المدخلات
   */
  static validateInput(data: any, schema: Record<string, any>): void {
    const errors: Record<string, string> = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      const fieldRules = rules as any;

      // التحقق من الحقول المطلوبة
      if (fieldRules.required && !value) {
        errors[field] = `${field} مطلوب`;
        continue;
      }

      // التحقق من النوع
      if (value && fieldRules.type) {
        if (typeof value !== fieldRules.type) {
          errors[field] = `${field} يجب أن يكون من نوع ${fieldRules.type}`;
        }
      }

      // التحقق من الطول
      if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `${field} يجب أن يكون على الأقل ${fieldRules.minLength} أحرف`;
      }

      if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = `${field} يجب أن يكون بحد أقصى ${fieldRules.maxLength} أحرف`;
      }

      // التحقق من القيم المسموحة
      if (value && fieldRules.enum && !fieldRules.enum.includes(value)) {
        errors[field] = `${field} يجب أن تكون قيمة من: ${fieldRules.enum.join(', ')}`;
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new AppError(
        ErrorCode.INVALID_INPUT,
        'بيانات الإدخال غير صحيحة',
        400,
        errors
      );
    }
  }

  /**
   * التحقق من المصادقة
   */
  static checkAuth(user: any): void {
    if (!user) {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'يجب تسجيل الدخول أولاً',
        401
      );
    }
  }

  /**
   * التحقق من الصلاحيات
   */
  static checkPermission(user: any, requiredRole: string): void {
    if (!user) {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'يجب تسجيل الدخول أولاً',
        401
      );
    }

    if (user.role !== requiredRole && user.role !== 'admin') {
      throw new AppError(
        ErrorCode.FORBIDDEN,
        'ليس لديك صلاحيات كافية',
        403
      );
    }
  }

  /**
   * معالجة أخطاء قاعدة البيانات
   */
  static handleDatabaseError(error: any): void {
    if (error.message.includes('Unique constraint')) {
      throw new AppError(
        ErrorCode.DUPLICATE_RECORD,
        'هذا السجل موجود بالفعل',
        409,
        { originalError: error.message }
      );
    }

    if (error.message.includes('Foreign key constraint')) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        'خطأ في العلاقة بين الجداول',
        400,
        { originalError: error.message }
      );
    }

    throw new AppError(
      ErrorCode.DATABASE_ERROR,
      'حدث خطأ في قاعدة البيانات',
      500,
      { originalError: error.message }
    );
  }

  /**
   * معالجة أخطاء Stripe
   */
  static handleStripeError(error: any): void {
    if (error.code === 'card_declined') {
      throw new AppError(
        ErrorCode.PAYMENT_FAILED,
        'تم رفض البطاقة',
        402,
        { stripeCode: error.code }
      );
    }

    if (error.code === 'insufficient_funds') {
      throw new AppError(
        ErrorCode.INSUFFICIENT_FUNDS,
        'رصيد غير كافي',
        402,
        { stripeCode: error.code }
      );
    }

    if (error.code === 'expired_card') {
      throw new AppError(
        ErrorCode.INVALID_PAYMENT_METHOD,
        'البطاقة منتهية الصلاحية',
        402,
        { stripeCode: error.code }
      );
    }

    throw new AppError(
      ErrorCode.STRIPE_ERROR,
      error.message || 'حدث خطأ في معالجة الدفع',
      402,
      { stripeCode: error.code }
    );
  }

  /**
   * معالجة أخطاء المهلة الزمنية
   */
  static handleTimeoutError(): void {
    throw new AppError(
      ErrorCode.TIMEOUT_ERROR,
      'انتهت المهلة الزمنية للعملية',
      408
    );
  }

  /**
   * معالجة أخطاء الخدمات الخارجية
   */
  static handleExternalServiceError(serviceName: string, error: any): void {
    throw new AppError(
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      `خطأ في خدمة ${serviceName}`,
      503,
      { service: serviceName, originalError: error.message }
    );
  }
}

/**
 * Middleware لمعالجة الأخطاء
 */
export function createErrorHandler() {
  return (error: any, req: any, res: any, next: any) => {
    const requestId = req.id || req.headers['x-request-id'];
    const errorResponse = ErrorHandler.handle(error, requestId);

    const statusCode = error instanceof AppError ? error.statusCode : 500;
    res.status(statusCode).json(errorResponse);
  };
}

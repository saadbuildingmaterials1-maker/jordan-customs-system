/**
 * نظام السجلات المركزي
 * يوفر تسجيل موحد لجميع أحداث التطبيق
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  requestId?: string;
  userId?: number;
  duration?: number;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 10000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * تسجيل رسالة
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
    requestId?: string,
    userId?: number,
    duration?: number
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      requestId,
      userId,
      duration,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    this.logs.push(entry);

    // تنظيف السجلات القديمة
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // طباعة إلى console
    this.printToConsole(entry);
  }

  /**
   * طباعة السجل إلى console
   */
  private printToConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level}]`;
    const context = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    const duration = entry.duration ? ` (${entry.duration}ms)` : '';

    const message = `${prefix} ${entry.message}${context}${duration}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message);
        if (entry.error) {
          console.error(entry.error.stack);
        }
        break;
    }
  }

  /**
   * تسجيل معلومات
   */
  debug(message: string, context?: Record<string, any>, requestId?: string): void {
    this.log(LogLevel.DEBUG, message, context, undefined, requestId);
  }

  info(message: string, context?: Record<string, any>, requestId?: string): void {
    this.log(LogLevel.INFO, message, context, undefined, requestId);
  }

  warn(message: string, context?: Record<string, any>, requestId?: string): void {
    this.log(LogLevel.WARN, message, context, undefined, requestId);
  }

  error(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    requestId?: string
  ): void {
    this.log(LogLevel.ERROR, message, context, error, requestId);
  }

  fatal(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    requestId?: string
  ): void {
    this.log(LogLevel.FATAL, message, context, error, requestId);
  }

  /**
   * تسجيل طلب HTTP
   */
  logRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    requestId?: string,
    userId?: number
  ): void {
    this.log(
      statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO,
      `${method} ${path} ${statusCode}`,
      { method, path, statusCode },
      undefined,
      requestId,
      userId,
      duration
    );
  }

  /**
   * تسجيل عملية قاعدة بيانات
   */
  logDatabase(
    operation: string,
    table: string,
    duration: number,
    success: boolean,
    requestId?: string,
    userId?: number
  ): void {
    this.log(
      success ? LogLevel.DEBUG : LogLevel.WARN,
      `Database: ${operation} on ${table}`,
      { operation, table, success },
      undefined,
      requestId,
      userId,
      duration
    );
  }

  /**
   * تسجيل عملية دفع
   */
  logPayment(
    action: string,
    amount: number,
    currency: string,
    status: string,
    requestId?: string,
    userId?: number
  ): void {
    this.log(
      status === 'success' ? LogLevel.INFO : LogLevel.WARN,
      `Payment: ${action} - ${amount} ${currency}`,
      { action, amount, currency, status },
      undefined,
      requestId,
      userId
    );
  }

  /**
   * تسجيل عملية أمان
   */
  logSecurity(
    action: string,
    result: string,
    requestId?: string,
    userId?: number,
    context?: Record<string, any>
  ): void {
    this.log(
      result === 'success' ? LogLevel.INFO : LogLevel.WARN,
      `Security: ${action}`,
      { action, result, ...context },
      undefined,
      requestId,
      userId
    );
  }

  /**
   * الحصول على السجلات
   */
  getLogs(
    level?: LogLevel,
    limit: number = 100,
    offset: number = 0
  ): LogEntry[] {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter((log) => log.level === level);
    }

    return filtered.slice(-limit - offset, -offset || undefined);
  }

  /**
   * البحث في السجلات
   */
  search(query: string, limit: number = 100): LogEntry[] {
    return this.logs
      .filter((log) => log.message.includes(query) || (log.context && JSON.stringify(log.context).includes(query)))
      .slice(-limit);
  }

  /**
   * مسح السجلات
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * الحصول على إحصائيات
   */
  getStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    for (const log of this.logs) {
      stats[log.level] = (stats[log.level] || 0) + 1;
    }

    return stats;
  }
}

export const logger = Logger.getInstance();

/**
 * Middleware لتسجيل الطلبات
 */
export function createLoggingMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();
    const requestId = req.id || req.headers['x-request-id'] || `req-${Date.now()}`;

    // تخزين معرف الطلب
    req.requestId = requestId;

    // تسجيل الاستجابة
    const originalSend = res.send;
    res.send = function (data: any) {
      const duration = Date.now() - startTime;
      logger.logRequest(
        req.method,
        req.path,
        res.statusCode,
        duration,
        requestId,
        req.user?.id
      );

      return originalSend.call(this, data);
    };

    next();
  };
}

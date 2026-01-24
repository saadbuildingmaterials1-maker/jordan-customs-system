/**
 * خدمة Logging موحدة
 * توفر تسجيل موحد لجميع الأحداث والأخطاء
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export class Logger {
  private static isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * تسجيل رسالة معلومات
   */
  static info(message: string, context?: string, data?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  /**
   * تسجيل تحذير
   */
  static warn(message: string, context?: string, data?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  /**
   * تسجيل خطأ
   */
  static error(message: string, error?: Error, context?: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: this.isDevelopment ? error.stack : undefined,
          }
        : undefined,
    };

    console.error(this.formatLog(entry));
  }

  /**
   * تسجيل معلومات تصحيح
   */
  static debug(message: string, context?: string, data?: Record<string, any>): void {
    if (this.isDevelopment) {
      this.log(LogLevel.DEBUG, message, context, data);
    }
  }

  /**
   * تسجيل عملية
   */
  static operation(
    operationName: string,
    status: 'start' | 'success' | 'failure',
    data?: Record<string, any>
  ): void {
    const message = `[${operationName}] ${status.toUpperCase()}`;
    this.log(LogLevel.INFO, message, 'OPERATION', data);
  }

  /**
   * تسجيل طلب HTTP
   */
  static httpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number
  ): void {
    const message = `${method} ${path} - ${statusCode} (${duration}ms)`;
    this.log(LogLevel.INFO, message, 'HTTP');
  }

  /**
   * تسجيل استعلام قاعدة البيانات
   */
  static dbQuery(query: string, duration: number, error?: Error): void {
    if (error) {
      this.error(`DB Query Failed: ${query}`, error, 'DATABASE');
    } else {
      this.debug(`DB Query: ${query} (${duration}ms)`, 'DATABASE');
    }
  }

  /**
   * الدالة الداخلية للتسجيل
   */
  private static log(
    level: LogLevel,
    message: string,
    context?: string,
    data?: Record<string, any>
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
    };

    const formattedLog = this.formatLog(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedLog);
        break;
      case LogLevel.INFO:
        console.log(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
    }
  }

  /**
   * تنسيق رسالة السجل
   */
  private static formatLog(entry: LogEntry): string {
    let log = `[${entry.timestamp}] [${entry.level}]`;

    if (entry.context) {
      log += ` [${entry.context}]`;
    }

    log += ` ${entry.message}`;

    if (entry.data && Object.keys(entry.data).length > 0) {
      log += ` ${JSON.stringify(entry.data)}`;
    }

    if (entry.error) {
      log += ` - ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        log += `\n${entry.error.stack}`;
      }
    }

    return log;
  }
}

/**
 * Middleware تسجيل الطلبات
 */
export const loggingMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function (data: any) {
    const duration = Date.now() - start;
    Logger.httpRequest(req.method, req.path, res.statusCode, duration);
    originalSend.call(this, data);
  };

  next();
};

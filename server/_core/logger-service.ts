/**
 * Professional Logger Service
 * يستبدل console.error و console.log بنظام logging احترافي
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  error?: any;
  userId?: string;
  requestId?: string;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private isDevelopment = process.env.NODE_ENV !== 'production';

  log(
    level: LogLevel,
    message: string,
    context?: string,
    error?: any,
    userId?: string,
    requestId?: string
  ) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error?.message || error,
      userId,
      requestId,
    };

    // في الإنتاج، لا نطبع DEBUG و INFO
    if (this.isDevelopment || level === LogLevel.WARN || level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
      console.log(`[${entry.timestamp}] [${level}] ${message}`, context ? `(${context})` : '', error ? error : '');
    }

    // حفظ في السجل
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  debug(message: string, context?: string) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: string) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: string, error?: any) {
    this.log(LogLevel.WARN, message, context, error);
  }

  error(message: string, context?: string, error?: any, userId?: string, requestId?: string) {
    this.log(LogLevel.ERROR, message, context, error, userId, requestId);
  }

  critical(message: string, context?: string, error?: any, userId?: string, requestId?: string) {
    this.log(LogLevel.CRITICAL, message, context, error, userId, requestId);
  }

  getLogs(level?: LogLevel) {
    if (!level) return this.logs;
    return this.logs.filter(log => log.level === level);
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new LoggerService();

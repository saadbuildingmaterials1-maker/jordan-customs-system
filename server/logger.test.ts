import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Logger', () => {
  beforeEach(() => {
    logger.clear();
  });

  afterEach(() => {
    logger.clear();
  });

  describe('Logging Methods', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message', { key: 'value' });
      const logs = logger.getLogs(LogLevel.DEBUG);

      expect(logs.length).toBe(1);
      expect(logs[0].message).toBe('Debug message');
      expect(logs[0].context).toEqual({ key: 'value' });
    });

    it('should log info messages', () => {
      logger.info('Info message');
      const logs = logger.getLogs(LogLevel.INFO);

      expect(logs.length).toBe(1);
      expect(logs[0].message).toBe('Info message');
    });

    it('should log warning messages', () => {
      logger.warn('Warning message');
      const logs = logger.getLogs(LogLevel.WARN);

      expect(logs.length).toBe(1);
      expect(logs[0].message).toBe('Warning message');
    });

    it('should log error messages with error object', () => {
      const error = new Error('Test error');
      const logs = logger.getLogs(LogLevel.ERROR);

      expect(logs.length).toBe(1);
      expect(logs[0].message).toBe('Error occurred');
      expect(logs[0].error?.message).toBe('Test error');
    });

    it('should log fatal messages', () => {
      logger.fatal('Fatal error');
      const logs = logger.getLogs(LogLevel.FATAL);

      expect(logs.length).toBe(1);
      expect(logs[0].message).toBe('Fatal error');
    });
  });

  describe('Request Logging', () => {
    it('should log HTTP requests', () => {
      logger.logRequest('GET', '/api/users', 200, 150, 'req-123', 1);
      const logs = logger.getLogs();

      expect(logs.length).toBeGreaterThan(0);
      const lastLog = logs[logs.length - 1];
      expect(lastLog.context?.method).toBe('GET');
      expect(lastLog.context?.path).toBe('/api/users');
      expect(lastLog.context?.statusCode).toBe(200);
      expect(lastLog.duration).toBe(150);
    });

    it('should log failed requests as warnings', () => {
      logger.logRequest('POST', '/api/users', 500, 200, 'req-124', 1);
      const logs = logger.getLogs(LogLevel.WARN);

      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Database Logging', () => {
    it('should log database operations', () => {
      logger.logDatabase('SELECT', 'users', 50, true, 'req-125', 1);
      const logs = logger.getLogs();

      expect(logs.length).toBeGreaterThan(0);
      const lastLog = logs[logs.length - 1];
      expect(lastLog.context?.operation).toBe('SELECT');
      expect(lastLog.context?.table).toBe('users');
      expect(lastLog.context?.success).toBe(true);
    });

    it('should log failed database operations as warnings', () => {
      logger.logDatabase('INSERT', 'users', 100, false, 'req-126', 1);
      const logs = logger.getLogs(LogLevel.WARN);

      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Payment Logging', () => {
    it('should log payment operations', () => {
      logger.logPayment('charge', 100, 'USD', 'success', 'req-127', 1);
      const logs = logger.getLogs();

      expect(logs.length).toBeGreaterThan(0);
      const lastLog = logs[logs.length - 1];
      expect(lastLog.context?.action).toBe('charge');
      expect(lastLog.context?.amount).toBe(100);
      expect(lastLog.context?.currency).toBe('USD');
    });
  });

  describe('Security Logging', () => {
    it('should log security events', () => {
      logger.logSecurity('login', 'success', 'req-128', 1);
      const logs = logger.getLogs();

      expect(logs.length).toBeGreaterThan(0);
      const lastLog = logs[logs.length - 1];
      expect(lastLog.context?.action).toBe('login');
      expect(lastLog.context?.result).toBe('success');
    });

    it('should log failed security events as warnings', () => {
      logger.logSecurity('login', 'failed', 'req-129', 1);
      const logs = logger.getLogs(LogLevel.WARN);

      expect(logs.length).toBeGreaterThan(0);
    });
  });

  describe('Log Retrieval', () => {
    beforeEach(() => {
      logger.debug('Debug 1');
      logger.info('Info 1');
      logger.warn('Warning 1');
      logger.fatal('Fatal 1');
    });

    it('should get all logs', () => {
      const logs = logger.getLogs();
      expect(logs.length).toBe(5);
    });

    it('should get logs by level', () => {
      const logs = logger.getLogs(LogLevel.INFO);
      expect(logs.length).toBe(1);
      expect(logs[0].message).toBe('Info 1');
    });

    it('should get logs with limit', () => {
      const logs = logger.getLogs(undefined, 2);
      expect(logs.length).toBeLessThanOrEqual(2);
    });

    it('should search logs', () => {
      const results = logger.search('Info');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].message).toBe('Info 1');
    });

    it('should get statistics', () => {
      const stats = logger.getStats();
      expect(stats[LogLevel.DEBUG]).toBe(1);
      expect(stats[LogLevel.INFO]).toBe(1);
      expect(stats[LogLevel.WARN]).toBe(1);
      expect(stats[LogLevel.ERROR]).toBe(1);
      expect(stats[LogLevel.FATAL]).toBe(1);
    });
  });

  describe('Log Limits', () => {
    it('should maintain max log limit', () => {
      // Log many messages
      for (let i = 0; i < 11000; i++) {
        logger.info(`Message ${i}`);
      }

      const logs = logger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(10000);
    });
  });
});

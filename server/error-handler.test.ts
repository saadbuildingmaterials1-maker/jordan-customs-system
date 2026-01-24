import { describe, it, expect, beforeEach } from 'vitest';
import {
  ErrorHandler,
  ErrorCode,
  AppError,
} from './error-handler';

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create an error with correct properties', () => {
      const error = new AppError(
        ErrorCode.INVALID_INPUT,
        'Invalid input',
        400,
        { field: 'email' }
      );

      expect(error.code).toBe(ErrorCode.INVALID_INPUT);
      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'email' });
    });

    it('should convert to JSON correctly', () => {
      const error = new AppError(
        ErrorCode.INVALID_INPUT,
        'Invalid input',
        400
      );

      const json = error.toJSON();
      expect(json.code).toBe(ErrorCode.INVALID_INPUT);
      expect(json.message).toBe('Invalid input');
      expect(json.timestamp).toBeDefined();
    });
  });

  describe('ErrorHandler.handle', () => {
    it('should handle AppError correctly', () => {
      const error = new AppError(
        ErrorCode.UNAUTHORIZED,
        'Not authorized',
        401
      );

      const result = ErrorHandler.handle(error, 'req-123');
      expect(result.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(result.message).toBe('Not authorized');
      expect(result.requestId).toBe('req-123');
    });

    it('should handle generic Error correctly', () => {
      const error = new Error('Something went wrong');
      const result = ErrorHandler.handle(error);

      expect(result.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe('حدث خطأ في الخادم');
    });

    it('should handle unknown error correctly', () => {
      const result = ErrorHandler.handle('unknown error');

      expect(result.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe('حدث خطأ غير متوقع');
    });

    it('should detect database errors', () => {
      const error = new Error('database connection failed');
      const result = ErrorHandler.handle(error);

      expect(result.code).toBe(ErrorCode.DATABASE_ERROR);
    });

    it('should detect Stripe errors', () => {
      const error = new Error('stripe payment failed');
      const result = ErrorHandler.handle(error);

      expect(result.code).toBe(ErrorCode.STRIPE_ERROR);
    });

    it('should detect file errors', () => {
      const error = new Error('file upload failed');
      const result = ErrorHandler.handle(error);

      expect(result.code).toBe(ErrorCode.FILE_UPLOAD_ERROR);
    });
  });

  describe('ErrorHandler.validateInput', () => {
    it('should validate required fields', () => {
      const schema = {
        email: { required: true, type: 'string' },
      };

      expect(() => {
        ErrorHandler.validateInput({}, schema);
      }).toThrow();
    });

    it('should validate field types', () => {
      const schema = {
        age: { required: true, type: 'number' },
      };

      expect(() => {
        ErrorHandler.validateInput({ age: 'invalid' }, schema);
      }).toThrow();
    });

    it('should validate field length', () => {
      const schema = {
        password: { required: true, type: 'string', minLength: 8 },
      };

      expect(() => {
        ErrorHandler.validateInput({ password: 'short' }, schema);
      }).toThrow();
    });

    it('should validate enum values', () => {
      const schema = {
        status: { required: true, type: 'string', enum: ['active', 'inactive'] },
      };

      expect(() => {
        ErrorHandler.validateInput({ status: 'invalid' }, schema);
      }).toThrow();
    });

    it('should pass valid input', () => {
      const schema = {
        email: { required: true, type: 'string' },
        age: { required: false, type: 'number' },
      };

      expect(() => {
        ErrorHandler.validateInput({ email: 'test@example.com' }, schema);
      }).not.toThrow();
    });
  });

  describe('ErrorHandler.checkAuth', () => {
    it('should throw error if user is not authenticated', () => {
      expect(() => {
        ErrorHandler.checkAuth(null);
      }).toThrow();
    });

    it('should not throw error if user is authenticated', () => {
      expect(() => {
        ErrorHandler.checkAuth({ id: 1, email: 'test@example.com' });
      }).not.toThrow();
    });
  });

  describe('ErrorHandler.checkPermission', () => {
    it('should throw error if user is not authenticated', () => {
      expect(() => {
        ErrorHandler.checkPermission(null, 'admin');
      }).toThrow();
    });

    it('should throw error if user does not have required role', () => {
      const user = { id: 1, role: 'user' };
      expect(() => {
        ErrorHandler.checkPermission(user, 'admin');
      }).toThrow();
    });

    it('should allow admin users', () => {
      const user = { id: 1, role: 'admin' };
      expect(() => {
        ErrorHandler.checkPermission(user, 'user');
      }).not.toThrow();
    });

    it('should allow users with correct role', () => {
      const user = { id: 1, role: 'user' };
      expect(() => {
        ErrorHandler.checkPermission(user, 'user');
      }).not.toThrow();
    });
  });

  describe('ErrorHandler.handleDatabaseError', () => {
    it('should handle duplicate record error', () => {
      const error = new Error('Unique constraint failed');
      expect(() => {
        ErrorHandler.handleDatabaseError(error);
      }).toThrow();
    });

    it('should handle foreign key constraint error', () => {
      const error = new Error('Foreign key constraint failed');
      expect(() => {
        ErrorHandler.handleDatabaseError(error);
      }).toThrow();
    });

    it('should handle generic database error', () => {
      const error = new Error('Database error');
      expect(() => {
        ErrorHandler.handleDatabaseError(error);
      }).toThrow();
    });
  });

  describe('ErrorHandler.handleStripeError', () => {
    it('should handle card declined error', () => {
      const error = { code: 'card_declined', message: 'Card declined' };
      expect(() => {
        ErrorHandler.handleStripeError(error);
      }).toThrow();
    });

    it('should handle insufficient funds error', () => {
      const error = { code: 'insufficient_funds', message: 'Insufficient funds' };
      expect(() => {
        ErrorHandler.handleStripeError(error);
      }).toThrow();
    });

    it('should handle expired card error', () => {
      const error = { code: 'expired_card', message: 'Card expired' };
      expect(() => {
        ErrorHandler.handleStripeError(error);
      }).toThrow();
    });

    it('should handle generic Stripe error', () => {
      const error = { code: 'unknown', message: 'Unknown error' };
      expect(() => {
        ErrorHandler.handleStripeError(error);
      }).toThrow();
    });
  });

  describe('ErrorHandler.handleTimeoutError', () => {
    it('should throw timeout error', () => {
      expect(() => {
        ErrorHandler.handleTimeoutError();
      }).toThrow();
    });
  });

  describe('ErrorHandler.handleExternalServiceError', () => {
    it('should throw external service error', () => {
      const error = new Error('Service unavailable');
      expect(() => {
        ErrorHandler.handleExternalServiceError('PaymentService', error);
      }).toThrow();
    });
  });
});

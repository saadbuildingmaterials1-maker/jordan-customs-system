/**
 * خدمة التحقق من صحة البيانات
 * توفر دوال للتحقق من صحة المدخلات
 */

import { ValidationError } from './error-handler';

export class Validator {
  /**
   * التحقق من أن القيمة ليست فارغة
   */
  static required(value: any, fieldName: string): void {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      throw new ValidationError(`${fieldName} مطلوب`);
    }
  }

  /**
   * التحقق من أن القيمة رقم صحيح
   */
  static isNumber(value: any, fieldName: string): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationError(`${fieldName} يجب أن يكون رقم`);
    }
  }

  /**
   * التحقق من أن القيمة رقم موجب
   */
  static isPositive(value: number, fieldName: string): void {
    if (value <= 0) {
      throw new ValidationError(`${fieldName} يجب أن يكون موجب`);
    }
  }

  /**
   * التحقق من أن القيمة بريد إلكتروني صحيح
   */
  static isEmail(value: string, fieldName: string = 'البريد الإلكتروني'): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new ValidationError(`${fieldName} غير صحيح`);
    }
  }

  /**
   * التحقق من أن القيمة رقم هاتف صحيح
   */
  static isPhone(value: string, fieldName: string = 'رقم الهاتف'): void {
    const phoneRegex = /^[0-9\-\+\s\(\)]{7,}$/;
    if (!phoneRegex.test(value)) {
      throw new ValidationError(`${fieldName} غير صحيح`);
    }
  }

  /**
   * التحقق من أن القيمة IBAN صحيح
   */
  static isIBAN(value: string, fieldName: string = 'رقم IBAN'): void {
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
    if (!ibanRegex.test(value)) {
      throw new ValidationError(`${fieldName} غير صحيح`);
    }
  }

  /**
   * التحقق من أن القيمة تاريخ صحيح
   */
  static isDate(value: any, fieldName: string = 'التاريخ'): void {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError(`${fieldName} غير صحيح`);
    }
  }

  /**
   * التحقق من أن القيمة ضمن نطاق معين
   */
  static isInRange(
    value: number,
    min: number,
    max: number,
    fieldName: string
  ): void {
    if (value < min || value > max) {
      throw new ValidationError(
        `${fieldName} يجب أن يكون بين ${min} و ${max}`
      );
    }
  }

  /**
   * التحقق من أن القيمة طول نص معين
   */
  static isLength(
    value: string,
    min: number,
    max: number,
    fieldName: string
  ): void {
    if (value.length < min || value.length > max) {
      throw new ValidationError(
        `${fieldName} يجب أن يكون بين ${min} و ${max} أحرف`
      );
    }
  }

  /**
   * التحقق من أن القيمة تطابق نمط معين
   */
  static matches(
    value: string,
    pattern: RegExp,
    fieldName: string,
    message?: string
  ): void {
    if (!pattern.test(value)) {
      throw new ValidationError(
        message || `${fieldName} غير صحيح`
      );
    }
  }

  /**
   * التحقق من أن القيمة موجودة في قائمة
   */
  static isIn(
    value: any,
    allowedValues: any[],
    fieldName: string
  ): void {
    if (!allowedValues.includes(value)) {
      throw new ValidationError(
        `${fieldName} يجب أن يكون واحد من: ${allowedValues.join(', ')}`
      );
    }
  }

  /**
   * التحقق من أن القيمة نوع معين
   */
  static isType(
    value: any,
    type: string,
    fieldName: string
  ): void {
    if (typeof value !== type) {
      throw new ValidationError(
        `${fieldName} يجب أن يكون من نوع ${type}`
      );
    }
  }

  /**
   * التحقق من أن القيمة مصفوفة
   */
  static isArray(value: any, fieldName: string): void {
    if (!Array.isArray(value)) {
      throw new ValidationError(`${fieldName} يجب أن تكون مصفوفة`);
    }
  }

  /**
   * التحقق من أن المصفوفة ليست فارغة
   */
  static isNotEmpty(value: any[], fieldName: string): void {
    if (value.length === 0) {
      throw new ValidationError(`${fieldName} لا يمكن أن تكون فارغة`);
    }
  }

  /**
   * التحقق من عدة شروط
   */
  static validate(rules: Array<() => void>): void {
    const errors: string[] = [];

    for (const rule of rules) {
      try {
        rule();
      } catch (error) {
        if (error instanceof ValidationError) {
          errors.push(error.message);
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('خطأ في التحقق من البيانات', {
        errors,
      });
    }
  }
}

/**
 * خدمة معالجة رسائل الأخطاء الشاملة
 * Comprehensive Error Message Handler Service
 */

export interface ErrorMessage {
  code: string;
  title: string;
  message: string;
  suggestion: string;
  severity: 'error' | 'warning' | 'info';
}

export const errorMessages: Record<string, ErrorMessage> = {
  // Authentication Errors
  'AUTH_001': {
    code: 'AUTH_001',
    title: 'فشل تسجيل الدخول',
    message: 'بيانات الدخول غير صحيحة. تأكد من اسم المستخدم وكلمة المرور.',
    suggestion: 'تحقق من بيانات الدخول وحاول مرة أخرى. إذا نسيت كلمة المرور، استخدم خيار "نسيت كلمة المرور".',
    severity: 'error'
  },
  'AUTH_002': {
    code: 'AUTH_002',
    title: 'انتهت جلسة المستخدم',
    message: 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.',
    suggestion: 'انقر على "تسجيل الدخول" وأدخل بيانات اعتمادك مرة أخرى.',
    severity: 'warning'
  },
  'AUTH_003': {
    code: 'AUTH_003',
    title: 'عدم الصلاحية',
    message: 'ليس لديك صلاحية للوصول إلى هذه الصفحة.',
    suggestion: 'تأكد من أن حسابك لديه الصلاحيات المطلوبة. اتصل بمسؤول النظام إذا لزم الأمر.',
    severity: 'error'
  },

  // Form Validation Errors
  'FORM_001': {
    code: 'FORM_001',
    title: 'حقل مطلوب',
    message: 'يجب ملء جميع الحقول المطلوبة (المشار إليها بـ *).',
    suggestion: 'تأكد من إدخال جميع البيانات المطلوبة قبل الحفظ.',
    severity: 'error'
  },
  'FORM_002': {
    code: 'FORM_002',
    title: 'صيغة غير صحيحة',
    message: 'البيانات المدخلة بصيغة غير صحيحة.',
    suggestion: 'تحقق من صيغة البيانات. مثلاً: البريد الإلكتروني يجب أن يكون بصيغة name@example.com',
    severity: 'error'
  },
  'FORM_003': {
    code: 'FORM_003',
    title: 'قيمة خارج النطاق',
    message: 'القيمة المدخلة خارج النطاق المسموح به.',
    suggestion: 'تأكد من أن القيمة ضمن النطاق المحدد. مثلاً: الوزن يجب أن يكون أكثر من 0 كغ.',
    severity: 'error'
  },
  'FORM_004': {
    code: 'FORM_004',
    title: 'قيمة مكررة',
    message: 'هذه القيمة موجودة بالفعل في النظام.',
    suggestion: 'استخدم قيمة مختلفة. إذا كنت تريد تعديل البيان الموجود، استخدم خيار "تعديل".',
    severity: 'warning'
  },

  // Calculation Errors
  'CALC_001': {
    code: 'CALC_001',
    title: 'خطأ في الحساب',
    message: 'حدث خطأ أثناء حساب التكاليف.',
    suggestion: 'تأكد من إدخال جميع البيانات بشكل صحيح وحاول مرة أخرى.',
    severity: 'error'
  },
  'CALC_002': {
    code: 'CALC_002',
    title: 'بيانات غير كافية',
    message: 'لا توجد بيانات كافية لحساب التكاليف.',
    suggestion: 'تأكد من إدخال الوزن والقيمة واختيار الدولة والعملة.',
    severity: 'error'
  },
  'CALC_003': {
    code: 'CALC_003',
    title: 'دولة غير مدعومة',
    message: 'الدولة المختارة غير مدعومة حالياً.',
    suggestion: 'اختر دولة مختلفة من القائمة. إذا كنت بحاجة إلى دولة معينة، اتصل بالدعم الفني.',
    severity: 'warning'
  },

  // File Upload Errors
  'FILE_001': {
    code: 'FILE_001',
    title: 'فشل تحميل الملف',
    message: 'فشل تحميل الملف. تأكد من أن الملف بصيغة صحيحة.',
    suggestion: 'استخدم ملفات PDF أو Excel. تأكد من أن حجم الملف لا يتجاوز 10 MB.',
    severity: 'error'
  },
  'FILE_002': {
    code: 'FILE_002',
    title: 'صيغة ملف غير مدعومة',
    message: 'صيغة الملف غير مدعومة.',
    suggestion: 'استخدم ملفات PDF أو Excel (.xlsx, .xls).',
    severity: 'error'
  },
  'FILE_003': {
    code: 'FILE_003',
    title: 'حجم الملف كبير جداً',
    message: 'حجم الملف يتجاوز الحد الأقصى المسموح به (10 MB).',
    suggestion: 'قلل حجم الملف وحاول مرة أخرى.',
    severity: 'error'
  },
  'FILE_004': {
    code: 'FILE_004',
    title: 'فشل استخراج البيانات',
    message: 'فشل استخراج البيانات من الملف.',
    suggestion: 'تأكد من أن الملف يحتوي على البيانات الصحيحة بالصيغة المتوقعة.',
    severity: 'error'
  },

  // Database Errors
  'DB_001': {
    code: 'DB_001',
    title: 'خطأ في قاعدة البيانات',
    message: 'حدث خطأ أثناء الوصول إلى قاعدة البيانات.',
    suggestion: 'حاول مرة أخرى لاحقاً. إذا استمرت المشكلة، اتصل بالدعم الفني.',
    severity: 'error'
  },
  'DB_002': {
    code: 'DB_002',
    title: 'البيان غير موجود',
    message: 'البيان المطلوب غير موجود في قاعدة البيانات.',
    suggestion: 'تأكد من رقم البيان وحاول مرة أخرى.',
    severity: 'warning'
  },
  'DB_003': {
    code: 'DB_003',
    title: 'فشل حفظ البيانات',
    message: 'فشل حفظ البيانات في قاعدة البيانات.',
    suggestion: 'تأكد من اتصالك بالإنترنت وحاول مرة أخرى.',
    severity: 'error'
  },

  // Network Errors
  'NET_001': {
    code: 'NET_001',
    title: 'خطأ في الاتصال',
    message: 'فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت.',
    suggestion: 'تأكد من أن لديك اتصال إنترنت مستقر وحاول مرة أخرى.',
    severity: 'error'
  },
  'NET_002': {
    code: 'NET_002',
    title: 'انتهاء المهلة الزمنية',
    message: 'انتهاء المهلة الزمنية للطلب. حاول مرة أخرى.',
    suggestion: 'تأكد من سرعة الاتصال بالإنترنت وحاول مرة أخرى.',
    severity: 'warning'
  },
  'NET_003': {
    code: 'NET_003',
    title: 'الخادم غير متاح',
    message: 'الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.',
    suggestion: 'حاول مرة أخرى بعد قليل. إذا استمرت المشكلة، اتصل بالدعم الفني.',
    severity: 'warning'
  },

  // Tracking Errors
  'TRACK_001': {
    code: 'TRACK_001',
    title: 'الشحنة غير موجودة',
    message: 'لم يتم العثور على الشحنة برقم التتبع المدخل.',
    suggestion: 'تأكد من رقم التتبع وحاول مرة أخرى.',
    severity: 'warning'
  },
  'TRACK_002': {
    code: 'TRACK_002',
    title: 'لا توجد تحديثات',
    message: 'لا توجد تحديثات جديدة لهذه الشحنة حالياً.',
    suggestion: 'سيتم تحديث الحالة قريباً. تحقق مرة أخرى لاحقاً.',
    severity: 'info'
  },

  // General Errors
  'GEN_001': {
    code: 'GEN_001',
    title: 'خطأ غير متوقع',
    message: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
    suggestion: 'إذا استمرت المشكلة، اتصل بالدعم الفني وأخبرهم برقم الخطأ.',
    severity: 'error'
  },
  'GEN_002': {
    code: 'GEN_002',
    title: 'عملية ناجحة',
    message: 'تمت العملية بنجاح.',
    suggestion: '',
    severity: 'info'
  }
};

/**
 * الحصول على رسالة خطأ من الكود
 * Get error message by code
 */
export function getErrorMessage(code: string): ErrorMessage {
  return errorMessages[code] || errorMessages['GEN_001'];
}

/**
 * عرض رسالة خطأ مفصلة
 * Display detailed error message
 */
export function displayErrorMessage(code: string): string {
  const error = getErrorMessage(code);
  return `${error.title}\n${error.message}\n\nالاقتراح: ${error.suggestion}`;
}

/**
 * التحقق من صحة البريد الإلكتروني
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: ErrorMessage } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: errorMessages['FORM_002']
    };
  }
  return { valid: true };
}

/**
 * التحقق من صحة الرقم
 * Validate number format
 */
export function validateNumber(value: string | number): { valid: boolean; error?: ErrorMessage } {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return {
      valid: false,
      error: errorMessages['FORM_003']
    };
  }
  return { valid: true };
}

/**
 * التحقق من صحة الوزن
 * Validate weight
 */
export function validateWeight(weight: string | number): { valid: boolean; error?: ErrorMessage } {
  const validation = validateNumber(weight);
  if (!validation.valid) {
    return validation;
  }
  const w = Number(weight);
  if (w > 1000) {
    return {
      valid: false,
      error: {
        ...errorMessages['FORM_003'],
        message: 'الوزن يجب أن يكون أقل من 1000 كغ'
      }
    };
  }
  return { valid: true };
}

/**
 * التحقق من صحة القيمة المالية
 * Validate monetary value
 */
export function validateMonetaryValue(value: string | number): { valid: boolean; error?: ErrorMessage } {
  const validation = validateNumber(value);
  if (!validation.valid) {
    return validation;
  }
  const v = Number(value);
  if (v > 1000000) {
    return {
      valid: false,
      error: {
        ...errorMessages['FORM_003'],
        message: 'القيمة يجب أن تكون أقل من 1,000,000 د.ا'
      }
    };
  }
  return { valid: true };
}

export default {
  getErrorMessage,
  displayErrorMessage,
  validateEmail,
  validateNumber,
  validateWeight,
  validateMonetaryValue
};

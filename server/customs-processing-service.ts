/**
 * خدمة معالجة البيانات الجمركية المتقدمة
 * Advanced Customs Data Processing Service
 */

interface CustomsDeclarationData {
  declarationNumber: string;
  importerName: string;
  exporterName: string;
  exportCountry: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    hsCode: string;
    weight: number;
  }>;
  fobValue: number;
  freightCost: number;
  insuranceCost: number;
}

interface ProcessedDeclaration {
  declarationNumber: string;
  cifValue: number;
  customsDuty: number;
  salesTax: number;
  totalCost: number;
  itemsProcessed: number;
  totalWeight: number;
  validationStatus: 'valid' | 'warning' | 'error';
  validationMessages: string[];
}

/**
 * معالجة وتحقق من صحة البيان الجمركي
 */
export async function processCustomsDeclaration(
  data: CustomsDeclarationData
): Promise<ProcessedDeclaration> {
  const validationMessages: string[] = [];
  let validationStatus: 'valid' | 'warning' | 'error' = 'valid';

  // التحقق من البيانات الأساسية
  if (!data.declarationNumber) {
    validationMessages.push('رقم البيان مفقود');
    validationStatus = 'error';
  }

  if (!data.importerName) {
    validationMessages.push('اسم المستورد مفقود');
    validationStatus = 'error';
  }

  if (!data.exporterName) {
    validationMessages.push('اسم المصدر مفقود');
    validationStatus = 'error';
  }

  if (data.items.length === 0) {
    validationMessages.push('لا توجد أصناف في البيان');
    validationStatus = 'error';
  }

  // التحقق من الأصناف
  data.items.forEach((item, index) => {
    if (!item.name) {
      validationMessages.push(`الصنف ${index + 1}: الاسم مفقود`);
      validationStatus = 'error';
    }
    if (item.quantity <= 0) {
      validationMessages.push(`الصنف ${index + 1}: الكمية يجب أن تكون أكبر من صفر`);
      validationStatus = 'error';
    }
    if (item.unitPrice <= 0) {
      validationMessages.push(`الصنف ${index + 1}: السعر يجب أن يكون أكبر من صفر`);
      validationStatus = 'error';
    }
    if (!item.hsCode) {
      validationMessages.push(`الصنف ${index + 1}: الرمز الجمركي مفقود`);
      validationStatus = 'warning';
    }
  });

  // حساب القيم
  const totalWeight = data.items.reduce((sum, item) => sum + item.weight, 0);
  const fobValue = data.fobValue || data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const cifValue = fobValue + data.freightCost + data.insuranceCost;
  const customsDuty = cifValue * 0.15; // 15% duty rate
  const subtotal = cifValue + customsDuty;
  const salesTax = subtotal * 0.16; // 16% sales tax
  const totalCost = subtotal + salesTax;

  return {
    declarationNumber: data.declarationNumber,
    cifValue: Math.round(cifValue * 100) / 100,
    customsDuty: Math.round(customsDuty * 100) / 100,
    salesTax: Math.round(salesTax * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    itemsProcessed: data.items.length,
    totalWeight,
    validationStatus,
    validationMessages,
  };
}

/**
 * حساب الرسوم الجمركية بناءً على HS Code
 */
export async function calculateDutiesByHSCode(
  hsCode: string,
  cifValue: number
): Promise<number> {
  // معدلات الرسوم حسب الفئة
  const dutyRates: Record<string, number> = {
    '01': 0.05, // حيوانات حية
    '02': 0.1, // لحوم
    '03': 0.08, // أسماك
    '04': 0.12, // منتجات الألبان
    '05': 0.05, // منتجات حيوانية أخرى
    '06': 0.05, // نباتات حية
    '07': 0.05, // خضروات
    '08': 0.05, // فواكه
    '09': 0.1, // قهوة وشاي
    '10': 0.05, // حبوب
    '11': 0.08, // منتجات الطحن
    '12': 0.05, // بذور وفواكه زيتية
    '13': 0.05, // عصارات نباتية
    '14': 0.05, // مواد نسيج
    '15': 0.08, // دهون وزيوت
    '16': 0.1, // لحوم معلبة
    '17': 0.15, // سكريات
    '18': 0.15, // كاكاو
    '19': 0.1, // منتجات حبوب
    '20': 0.1, // خضروات معلبة
    '21': 0.12, // منتجات غذائية متنوعة
    '22': 0.15, // مشروبات
    '23': 0.05, // بقايا غذائية
    '24': 0.2, // تبغ
    '25': 0.05, // ملح وكبريت
    '26': 0.05, // خامات معدنية
    '27': 0.05, // وقود ومعادن
    '28': 0.08, // مواد كيميائية
    '29': 0.1, // مواد عضوية
    '30': 0.15, // أدوية
    '31': 0.05, // أسمدة
    '32': 0.1, // مواد تلوين
    '33': 0.15, // زيوت عطرية
    '34': 0.12, // صابون ومنظفات
    '35': 0.1, // بروتينات
    '36': 0.1, // بارود وألعاب نارية
    '37': 0.15, // مواد تصوير
    '38': 0.1, // مواد كيميائية متنوعة
    '39': 0.12, // بلاستيك
    '40': 0.1, // مطاط
    '41': 0.1, // جلود
    '42': 0.12, // منتجات جلدية
    '43': 0.15, // فراء
    '44': 0.08, // خشب
    '45': 0.1, // فلين
    '46': 0.12, // منتجات نسيج
    '47': 0.08, // لب الخشب
    '48': 0.1, // ورق
    '49': 0.12, // كتب ومطبوعات
    '50': 0.12, // حرير
    '51': 0.12, // صوف
    '52': 0.12, // قطن
    '53': 0.12, // نسيج نباتي
    '54': 0.12, // نسيج صناعي
    '55': 0.12, // ألياف صناعية
    '56': 0.12, // خيوط ونسيج
    '57': 0.12, // سجاد
    '58': 0.12, // نسيج خاص
    '59': 0.12, // نسيج مطلي
    '60': 0.12, // نسيج محبوك
    '61': 0.15, // ملابس محبوكة
    '62': 0.15, // ملابس أخرى
    '63': 0.12, // منتجات نسيج
    '64': 0.15, // أحذية
    '65': 0.15, // قبعات
    '66': 0.12, // مظلات
    '67': 0.12, // ريش وزغب
    '68': 0.1, // حجر وجص
    '69': 0.1, // منتجات سيراميك
    '70': 0.1, // زجاج
    '71': 0.05, // لؤلؤ وأحجار كريمة
    '72': 0.08, // حديد وفولاذ
    '73': 0.1, // منتجات حديد وفولاذ
    '74': 0.1, // نحاس
    '75': 0.08, // نيكل
    '76': 0.1, // ألومنيوم
    '78': 0.08, // رصاص
    '79': 0.08, // زنك
    '80': 0.08, // قصدير
    '81': 0.08, // معادن أخرى
    '82': 0.12, // أدوات معدنية
    '83': 0.12, // منتجات معدنية متنوعة
    '84': 0.08, // آلات ومحركات
    '85': 0.08, // معدات كهربائية
    '86': 0.08, // عربات سكك حديدية
    '87': 0.08, // مركبات
    '88': 0.08, // طائرات
    '89': 0.08, // سفن
    '90': 0.12, // أدوات بصرية
    '91': 0.15, // ساعات
    '92': 0.15, // آلات موسيقية
    '93': 0.2, // أسلحة وذخيرة
    '94': 0.12, // أثاث
    '95': 0.15, // ألعاب
    '96': 0.12, // منتجات متنوعة
    '97': 0.15, // قطع فنية
    '98': 0.05, // بضائع خاصة
    '99': 0.05, // بضائع متنوعة
  };

  const firstTwoDigits = hsCode.substring(0, 2);
  const dutyRate = dutyRates[firstTwoDigits] || 0.1; // معدل افتراضي 10%

  return Math.round(cifValue * dutyRate * 100) / 100;
}

/**
 * التحقق من صحة رقم البيان
 */
export async function validateDeclarationNumber(declarationNumber: string): Promise<boolean> {
  // التحقق من الصيغة: CD-YYYY-XXXXX
  const pattern = /^CD-\d{4}-\d{5}$/;
  return pattern.test(declarationNumber);
}

/**
 * توليد رقم بيان جديد
 */
export async function generateDeclarationNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, '0');
  return `CD-${year}-${randomNumber}`;
}

/**
 * حساب نسبة التكاليف
 */
export async function calculateCostRatios(
  fobValue: number,
  freightCost: number,
  insuranceCost: number,
  customsDuty: number,
  salesTax: number
): Promise<{
  freightRatio: number;
  insuranceRatio: number;
  dutyRatio: number;
  taxRatio: number;
}> {
  const cifValue = fobValue + freightCost + insuranceCost;

  return {
    freightRatio: Math.round((freightCost / fobValue) * 100 * 100) / 100,
    insuranceRatio: Math.round((insuranceCost / fobValue) * 100 * 100) / 100,
    dutyRatio: Math.round((customsDuty / cifValue) * 100 * 100) / 100,
    taxRatio: Math.round((salesTax / (cifValue + customsDuty)) * 100 * 100) / 100,
  };
}

/**
 * فحص البيان للأخطاء الشائعة
 */
export async function checkCommonErrors(
  data: CustomsDeclarationData
): Promise<string[]> {
  const errors: string[] = [];

  // فحص القيم المنطقية
  if (data.fobValue < 0) {
    errors.push('قيمة FOB لا يمكن أن تكون سالبة');
  }

  if (data.freightCost < 0) {
    errors.push('أجور الشحن لا يمكن أن تكون سالبة');
  }

  if (data.insuranceCost < 0) {
    errors.push('التأمين لا يمكن أن يكون سالباً');
  }

  // فحص الأصناف المكررة
  const itemNames = data.items.map((item) => item.name);
  const duplicates = itemNames.filter((name, index) => itemNames.indexOf(name) !== index);
  if (duplicates.length > 0) {
    errors.push(`أصناف مكررة: ${duplicates.join(', ')}`);
  }

  // فحص الأوزان غير المعقولة
  data.items.forEach((item) => {
    if (item.weight > 10000) {
      errors.push(`الصنف ${item.name}: الوزن يبدو مرتفعاً جداً (${item.weight} كغ)`);
    }
  });

  // فحص الكميات غير المعقولة
  data.items.forEach((item) => {
    if (item.quantity > 1000000) {
      errors.push(`الصنف ${item.name}: الكمية تبدو مرتفعة جداً (${item.quantity} وحدة)`);
    }
  });

  return errors;
}

export default {
  processCustomsDeclaration,
  calculateDutiesByHSCode,
  validateDeclarationNumber,
  generateDeclarationNumber,
  calculateCostRatios,
  checkCommonErrors,
};

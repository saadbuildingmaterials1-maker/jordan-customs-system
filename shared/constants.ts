/**
 * ثوابت النظام الجمركي الأردني
 */

// معدل ضريبة المبيعات
export const SALES_TAX_RATE = 0.16; // 16%

// معدل الرسوم الجمركية (يمكن تعديله حسب نوع البضاعة)
export const DEFAULT_CUSTOMS_DUTY_RATE = 0.05; // 5% (قد يختلف)

// العملة
export const CURRENCY_CODE = "JOD";
export const CURRENCY_SYMBOL = "د.ا";

// الدقة العددية
export const DECIMAL_PLACES = 3;
export const PERCENTAGE_PLACES = 2;

/**
 * دالة تنسيق الأرقام بالطريقة العربية
 */
export function formatArabicNumber(num: number | string): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num).replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
}

/**
 * دالة تحويل الأرقام العربية إلى إنجليزية
 */
export function parseArabicNumber(arabicNum: string): number {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  let englishNum = arabicNum;
  arabicDigits.forEach((digit, index) => {
    englishNum = englishNum.replace(new RegExp(digit, "g"), String(index));
  });
  return parseFloat(englishNum);
}

/**
 * دالة تنسيق العملة بالدينار الأردني
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const formatted = num.toLocaleString("ar-JO", {
    style: "currency",
    currency: "JOD",
    minimumFractionDigits: DECIMAL_PLACES,
    maximumFractionDigits: DECIMAL_PLACES,
  });
  return formatted;
}

/**
 * دالة تنسيق النسبة المئوية
 */
export function formatPercentage(percentage: number | string): string {
  const num = typeof percentage === "string" ? parseFloat(percentage) : percentage;
  return `${num.toFixed(PERCENTAGE_PLACES)}%`;
}

/**
 * دالة تنسيق التاريخ بالصيغة العربية
 */
export function formatArabicDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("ar-JO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * دالة تحويل الأرقام إلى كلمات عربية
 */
export function numberToArabicWords(num: number): string {
  const ones = [
    "",
    "واحد",
    "اثنان",
    "ثلاثة",
    "أربعة",
    "خمسة",
    "ستة",
    "سبعة",
    "ثمانية",
    "تسعة",
  ];
  const teens = [
    "عشرة",
    "احدى عشر",
    "اثنا عشر",
    "ثلاثة عشر",
    "أربعة عشر",
    "خمسة عشر",
    "ستة عشر",
    "سبعة عشر",
    "ثمانية عشر",
    "تسعة عشر",
  ];
  const tens = [
    "",
    "",
    "عشرون",
    "ثلاثون",
    "أربعون",
    "خمسون",
    "ستون",
    "سبعون",
    "ثمانون",
    "تسعون",
  ];
  const scales = ["", "ألف", "مليون", "مليار"];

  if (num === 0) return "صفر";

  let result = "";
  let scaleIndex = 0;

  while (num > 0 && scaleIndex < scales.length) {
    const chunk = num % 1000;

    if (chunk !== 0) {
      let chunkWords = "";

      const hundred = Math.floor(chunk / 100);
      if (hundred > 0) {
        const hundredNames = [
          "",
          "مائة",
          "مائتان",
          "ثلاثمائة",
          "أربعمائة",
          "خمسمائة",
          "ستمائة",
          "سبعمائة",
          "ثمانمائة",
          "تسعمائة",
        ];
        chunkWords = hundredNames[hundred];
      }

      const remainder = chunk % 100;
      if (remainder >= 10 && remainder < 20) {
        if (chunkWords) chunkWords += " و" + teens[remainder - 10];
        else chunkWords = teens[remainder - 10];
      } else {
        const ten = Math.floor(remainder / 10);
        const one = remainder % 10;

        if (one > 0) {
          if (chunkWords) chunkWords += " و" + ones[one];
          else chunkWords = ones[one];
        }

        if (ten > 0) {
          if (chunkWords) chunkWords += " و" + tens[ten];
          else chunkWords = tens[ten];
        }
      }

      if (scales[scaleIndex]) {
        chunkWords += " " + scales[scaleIndex];
      }

      if (result) result = chunkWords + " و" + result;
      else result = chunkWords;
    }

    num = Math.floor(num / 1000);
    scaleIndex++;
  }

  return result;
}

/**
 * أسماء الحقول بالعربية
 */
export const FIELD_LABELS = {
  declarationNumber: "رقم البيان الجمركي",
  registrationDate: "تاريخ التسجيل",
  clearanceCenter: "مركز التخليص",
  exchangeRate: "سعر التعادل",
  exportCountry: "بلد التصدير",
  billOfLadingNumber: "رقم بوليصة الشحن",
  grossWeight: "الوزن القائم",
  netWeight: "الوزن الصافي",
  numberOfPackages: "عدد الطرود",
  packageType: "نوع الطرود",
  fobValue: "قيمة البضاعة FOB",
  freightCost: "أجور الشحن",
  insuranceCost: "التأمين",
  customsDuty: "الرسوم الجمركية",
  salesTax: "ضريبة المبيعات",
  additionalFees: "رسوم إضافية",
  customsServiceFee: "بدل خدمات جمركية",
  penalties: "غرامات",
  totalLandedCost: "التكلفة الكلية النهائية",
  additionalExpensesRatio: "نسبة المصاريف الإضافية",
};

/**
 * حالات البيان الجمركي
 */
export const DECLARATION_STATUSES = {
  draft: "مسودة",
  submitted: "مرسلة",
  approved: "موافق عليها",
  cleared: "مخلصة",
};

/**
 * أنواع الطرود الشائعة
 */
export const PACKAGE_TYPES = [
  "طبلية",
  "كرتون",
  "صندوق خشبي",
  "كيس",
  "صندوق معدني",
  "برميل",
  "أخرى",
];

/**
 * مراكز التخليص الأردنية الرئيسية
 */
export const CLEARANCE_CENTERS = [
  "ميناء العقبة",
  "مطار الملكة علياء",
  "معبر جسر الملك حسين",
  "معبر الكرامة",
  "معبر درعا",
  "معبر رمثا",
  "معبر الشونة الشمالية",
];

/**
 * الدول الشائعة للتصدير
 */
export const EXPORT_COUNTRIES = [
  "الصين",
  "الهند",
  "تايلاند",
  "فيتنام",
  "ماليزيا",
  "إندونيسيا",
  "باكستان",
  "بنغلاديش",
  "تركيا",
  "مصر",
  "الإمارات",
  "السعودية",
  "أخرى",
];

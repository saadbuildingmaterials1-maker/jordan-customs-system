/**
 * خدمة الرموز الجمركية (HS Codes Service)
 * تدير جميع العمليات المتعلقة برموز التعريفة الجمركية
 */

// خدمة الرموز الجمركية - لا تحتاج إلى db مباشرة

/**
 * قاعدة بيانات شاملة للرموز الجمركية الأردنية
 */
export const hsCodesDatabase = [
  // الفصل 1: الحيوانات الحية والمنتجات الحيوانية
  { code: '0101', description: 'خيول وحمير وبغال', category: 'حيوانات حية' },
  { code: '0102', description: 'ماشية حية', category: 'حيوانات حية' },
  { code: '0103', description: 'خنازير حية', category: 'حيوانات حية' },
  { code: '0104', description: 'أغنام وماعز حية', category: 'حيوانات حية' },
  { code: '0105', description: 'دواجن حية', category: 'حيوانات حية' },

  // الفصل 2: اللحوم والأسماك
  { code: '0201', description: 'لحم بقري طازج أو مبرد', category: 'لحوم' },
  { code: '0202', description: 'لحم بقري مجمد', category: 'لحوم' },
  { code: '0301', description: 'أسماك حية', category: 'أسماك' },
  { code: '0302', description: 'أسماك طازة أو مبردة', category: 'أسماك' },
  { code: '0303', description: 'أسماك مجمدة', category: 'أسماك' },

  // الفصل 3: الألبان والبيض
  { code: '0401', description: 'حليب طازج', category: 'ألبان' },
  { code: '0402', description: 'حليب مركز أو مجفف', category: 'ألبان' },
  { code: '0403', description: 'لبن رائب', category: 'ألبان' },
  { code: '0404', description: 'مصل اللبن', category: 'ألبان' },
  { code: '0405', description: 'زبدة وكريمة', category: 'ألبان' },
  { code: '0406', description: 'جبن', category: 'ألبان' },
  { code: '0407', description: 'بيض الدواجن', category: 'بيض' },

  // الفصل 4: الحبوب
  { code: '1001', description: 'قمح', category: 'حبوب' },
  { code: '1002', description: 'جاودار', category: 'حبوب' },
  { code: '1003', description: 'شعير', category: 'حبوب' },
  { code: '1004', description: 'شوفان', category: 'حبوب' },
  { code: '1005', description: 'ذرة', category: 'حبوب' },
  { code: '1006', description: 'أرز', category: 'حبوب' },
  { code: '1007', description: 'ذرة الذرة البيضاء', category: 'حبوب' },

  // الفصل 5: الخضروات
  { code: '0701', description: 'بطاطس', category: 'خضروات' },
  { code: '0702', description: 'طماطم', category: 'خضروات' },
  { code: '0703', description: 'بصل وثوم', category: 'خضروات' },
  { code: '0704', description: 'ملفوف وخس', category: 'خضروات' },
  { code: '0705', description: 'خيار وخضروات أخرى', category: 'خضروات' },

  // الفصل 6: الفواكه
  { code: '0801', description: 'جوز الهند', category: 'فواكه' },
  { code: '0802', description: 'تمر وجوز برازيلي', category: 'فواكه' },
  { code: '0803', description: 'موز', category: 'فواكه' },
  { code: '0804', description: 'تمر', category: 'فواكه' },
  { code: '0805', description: 'حمضيات', category: 'فواكه' },
  { code: '0806', description: 'عنب', category: 'فواكه' },
  { code: '0807', description: 'شمام وبطيخ', category: 'فواكه' },

  // الفصل 7: القهوة والشاي
  { code: '0901', description: 'قهوة', category: 'مشروبات' },
  { code: '0902', description: 'شاي', category: 'مشروبات' },
  { code: '0903', description: 'مته', category: 'مشروبات' },

  // الفصل 8: السكر والعسل
  { code: '1701', description: 'سكر قصب', category: 'سكريات' },
  { code: '1702', description: 'سكر بنجر', category: 'سكريات' },
  { code: '1704', description: 'حلويات', category: 'سكريات' },
  { code: '0401', description: 'عسل', category: 'سكريات' },

  // الفصل 9: الدهون والزيوت
  { code: '1501', description: 'شحم حيواني', category: 'دهون' },
  { code: '1502', description: 'دهن سمك', category: 'دهون' },
  { code: '1503', description: 'شحم عظام', category: 'دهون' },
  { code: '1504', description: 'دهن حيواني آخر', category: 'دهون' },
  { code: '1505', description: 'زيت كبد السمك', category: 'زيوت' },
  { code: '1506', description: 'زيوت حيوانية أخرى', category: 'زيوت' },
  { code: '1507', description: 'زيت فول الصويا', category: 'زيوت' },
  { code: '1508', description: 'زيت الفول السوداني', category: 'زيوت' },
  { code: '1509', description: 'زيت الزيتون', category: 'زيوت' },
  { code: '1510', description: 'زيوت نباتية أخرى', category: 'زيوت' },

  // الفصل 10: المنتجات الغذائية المعالجة
  { code: '1901', description: 'مستخلصات الشعير', category: 'غذائيات' },
  { code: '1902', description: 'معكرونة', category: 'غذائيات' },
  { code: '1903', description: 'تابيوكا', category: 'غذائيات' },
  { code: '1904', description: 'حبوب مصنعة', category: 'غذائيات' },
  { code: '1905', description: 'خبز وحلويات', category: 'غذائيات' },

  // الفصل 11: الملح والكبريت
  { code: '2501', description: 'ملح', category: 'معادن' },
  { code: '2502', description: 'كبريت', category: 'معادن' },

  // الفصل 12: الأحجار والمعادن
  { code: '2601', description: 'حديد خام', category: 'معادن' },
  { code: '2602', description: 'نحاس خام', category: 'معادن' },
  { code: '2603', description: 'نيكل خام', category: 'معادن' },
  { code: '2604', description: 'تنجستن خام', category: 'معادن' },
  { code: '2605', description: 'زنك خام', category: 'معادن' },
  { code: '2606', description: 'قصدير خام', category: 'معادن' },

  // الفصل 13: المعادن الثمينة
  { code: '7101', description: 'لؤلؤ', category: 'معادن ثمينة' },
  { code: '7102', description: 'ماس', category: 'معادن ثمينة' },
  { code: '7103', description: 'أحجار كريمة', category: 'معادن ثمينة' },
  { code: '7104', description: 'أحجار نصف كريمة', category: 'معادن ثمينة' },
  { code: '7108', description: 'ذهب', category: 'معادن ثمينة' },
  { code: '7110', description: 'بلاتين', category: 'معادن ثمينة' },

  // الفصل 14: الآلات والمعدات
  { code: '8401', description: 'مفاعلات نووية', category: 'آلات' },
  { code: '8402', description: 'مراجل بخار', category: 'آلات' },
  { code: '8403', description: 'آلات توليد البخار', category: 'آلات' },
  { code: '8404', description: 'أجهزة مساعدة', category: 'آلات' },
  { code: '8405', description: 'مولدات غاز', category: 'آلات' },
  { code: '8406', description: 'توربينات بخار', category: 'آلات' },
  { code: '8407', description: 'محركات احتراق داخلي', category: 'آلات' },
  { code: '8408', description: 'محركات ديزل', category: 'آلات' },
  { code: '8409', description: 'أجزاء محركات', category: 'آلات' },
  { code: '8410', description: 'توربينات مائية', category: 'آلات' },

  // الفصل 15: الأجهزة الكهربائية
  { code: '8501', description: 'مولدات كهربائية', category: 'كهربائيات' },
  { code: '8502', description: 'مجموعات توليد', category: 'كهربائيات' },
  { code: '8503', description: 'أجزاء مولدات', category: 'كهربائيات' },
  { code: '8504', description: 'محولات كهربائية', category: 'كهربائيات' },
  { code: '8505', description: 'مغناطيسات كهربائية', category: 'كهربائيات' },
  { code: '8506', description: 'بطاريات كهربائية', category: 'كهربائيات' },
  { code: '8507', description: 'بطاريات رصاصية', category: 'كهربائيات' },
  { code: '8508', description: 'مكانس كهربائية', category: 'كهربائيات' },
  { code: '8509', description: 'أجهزة كهربائية أخرى', category: 'كهربائيات' },
  { code: '8510', description: 'حلاقات كهربائية', category: 'كهربائيات' },

  // الفصل 16: المركبات
  { code: '8701', description: 'جرارات', category: 'مركبات' },
  { code: '8702', description: 'حافلات', category: 'مركبات' },
  { code: '8703', description: 'سيارات ركاب', category: 'مركبات' },
  { code: '8704', description: 'شاحنات', category: 'مركبات' },
  { code: '8705', description: 'مركبات متخصصة', category: 'مركبات' },
  { code: '8706', description: 'هياكل مركبات', category: 'مركبات' },
  { code: '8707', description: 'أجزاء مركبات', category: 'مركبات' },

  // الفصل 17: الطائرات والسفن
  { code: '8801', description: 'بالونات وطائرات', category: 'طائرات' },
  { code: '8802', description: 'طائرات أخرى', category: 'طائرات' },
  { code: '8803', description: 'أجزاء طائرات', category: 'طائرات' },
  { code: '8901', description: 'سفن حربية', category: 'سفن' },
  { code: '8902', description: 'سفن صيد', category: 'سفن' },
  { code: '8903', description: 'سفن أخرى', category: 'سفن' },

  // الفصل 18: البصريات والدقة
  { code: '9001', description: 'ألياف بصرية', category: 'بصريات' },
  { code: '9002', description: 'عدسات بصرية', category: 'بصريات' },
  { code: '9003', description: 'أطر نظارات', category: 'بصريات' },
  { code: '9004', description: 'نظارات شمسية', category: 'بصريات' },
  { code: '9005', description: 'تلسكوبات', category: 'بصريات' },
  { code: '9006', description: 'كاميرات فوتوغرافية', category: 'بصريات' },
  { code: '9007', description: 'كاميرات فيديو', category: 'بصريات' },
  { code: '9008', description: 'أجهزة إسقاط', category: 'بصريات' },
  { code: '9009', description: 'أجهزة قياس بصرية', category: 'بصريات' },
  { code: '9010', description: 'أجهزة فحص بصرية', category: 'بصريات' },

  // الفصل 19: الساعات والأدوات الدقيقة
  { code: '9101', description: 'ساعات يد', category: 'ساعات' },
  { code: '9102', description: 'ساعات جيب', category: 'ساعات' },
  { code: '9103', description: 'ساعات أخرى', category: 'ساعات' },
  { code: '9104', description: 'ساعات إلكترونية', category: 'ساعات' },
  { code: '9105', description: 'أجزاء ساعات', category: 'ساعات' },

  // الفصل 20: الأسلحة والذخيرة
  { code: '9301', description: 'أسلحة نارية', category: 'أسلحة' },
  { code: '9302', description: 'مسدسات', category: 'أسلحة' },
  { code: '9303', description: 'بنادق صيد', category: 'أسلحة' },
  { code: '9304', description: 'أسلحة أخرى', category: 'أسلحة' },
  { code: '9305', description: 'أجزاء أسلحة', category: 'أسلحة' },
  { code: '9306', description: 'ذخيرة', category: 'أسلحة' },
];

/**
 * البحث عن رمز جمركي
 */
export async function searchHSCode(query: string) {
  const lowerQuery = query.toLowerCase();
  return hsCodesDatabase.filter(
    (item) =>
      item.code.includes(query) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * الحصول على رمز جمركي محدد
 */
export async function getHSCode(code: string) {
  return hsCodesDatabase.find((item) => item.code === code);
}

/**
 * الحصول على جميع الفئات
 */
export async function getHSCodeCategories() {
  const categories = new Set(hsCodesDatabase.map((item) => item.category));
  return Array.from(categories).sort();
}

/**
 * الحصول على جميع الرموز في فئة معينة
 */
export async function getHSCodesByCategory(category: string) {
  return hsCodesDatabase.filter((item) => item.category === category);
}

/**
 * التحقق من صحة رمز جمركي
 */
export async function validateHSCode(code: string): Promise<boolean> {
  const found = hsCodesDatabase.find((item) => item.code === code);
  return !!found;
}

/**
 * الحصول على جميع الرموز الجمركية
 */
export async function getAllHSCodes() {
  return hsCodesDatabase;
}

/**
 * إضافة رمز جمركي مخصص
 */
export async function addCustomHSCode(
  code: string,
  description: string,
  category: string
) {
  const existing = hsCodesDatabase.find((item) => item.code === code);
  if (existing) {
    throw new Error(`الرمز ${code} موجود بالفعل`);
  }

  hsCodesDatabase.push({ code, description, category });
  return { code, description, category };
}

/**
 * تحديث رمز جمركي
 */
export async function updateHSCode(
  code: string,
  description: string,
  category: string
) {
  const index = hsCodesDatabase.findIndex((item) => item.code === code);
  if (index === -1) {
    throw new Error(`الرمز ${code} غير موجود`);
  }

  hsCodesDatabase[index] = { code, description, category };
  return hsCodesDatabase[index];
}

/**
 * حذف رمز جمركي
 */
export async function deleteHSCode(code: string) {
  const index = hsCodesDatabase.findIndex((item) => item.code === code);
  if (index === -1) {
    throw new Error(`الرمز ${code} غير موجود`);
  }

  hsCodesDatabase.splice(index, 1);
  return { success: true };
}

/**
 * حساب الرسم الجمركي بناءً على الرمز
 */
export async function calculateDutyRate(code: string): Promise<number> {
  const hsCode = await getHSCode(code);
  if (!hsCode) {
    throw new Error(`الرمز ${code} غير موجود`);
  }

  // معدلات الرسوم الجمركية حسب الفئة
  const dutyRates: Record<string, number> = {
    'حيوانات حية': 0.05,
    لحوم: 0.1,
    أسماك: 0.08,
    ألبان: 0.12,
    بيض: 0.05,
    حبوب: 0.05,
    خضروات: 0.08,
    فواكه: 0.08,
    مشروبات: 0.15,
    سكريات: 0.1,
    دهون: 0.1,
    زيوت: 0.1,
    غذائيات: 0.12,
    معادن: 0.03,
    'معادن ثمينة': 0.01,
    آلات: 0.05,
    كهربائيات: 0.05,
    مركبات: 0.08,
    طائرات: 0.02,
    سفن: 0.02,
    بصريات: 0.05,
    ساعات: 0.1,
    أسلحة: 0.2,
  };

  return dutyRates[hsCode.category] || 0.1;
}

export default {
  searchHSCode,
  getHSCode,
  getHSCodeCategories,
  getHSCodesByCategory,
  validateHSCode,
  getAllHSCodes,
  addCustomHSCode,
  updateHSCode,
  deleteHSCode,
  calculateDutyRate,
};

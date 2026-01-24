/**
 * بيانات البنوك الأردنية
 * معلومات البنوك المدعومة في النظام
 */

export interface BankInfo {
  id: string;
  name: string;
  nameAr: string;
  swiftCode: string;
  ibanPrefix: string;
  country: string;
  currency: string[];
  website?: string;
  phone?: string;
  email?: string;
  logo?: string;
}

export const JORDANIAN_BANKS: BankInfo[] = [
  {
    id: 'ubsi',
    name: 'Union Bank of Jordan',
    nameAr: 'بنك الاتحاد الأردني',
    swiftCode: 'UBSIJORX',
    ibanPrefix: 'JO59UBSI',
    country: 'Jordan',
    currency: ['JOD', 'USD', 'EUR'],
    website: 'https://www.ubj.com.jo',
    phone: '+962 6 5690000',
    email: 'info@ubj.com.jo',
  },
  {
    id: 'cbjo',
    name: 'Central Bank of Jordan',
    nameAr: 'البنك المركزي الأردني',
    swiftCode: 'CBJO',
    ibanPrefix: 'JO94CBJO',
    country: 'Jordan',
    currency: ['JOD'],
    website: 'https://www.cbj.gov.jo',
    phone: '+962 6 4630301',
  },
  {
    id: 'arab',
    name: 'Arab Bank',
    nameAr: 'البنك العربي',
    swiftCode: 'ARABJO',
    ibanPrefix: 'JO94ARAB',
    country: 'Jordan',
    currency: ['JOD', 'USD', 'EUR'],
    website: 'https://www.arabbank.com.jo',
    phone: '+962 6 5686000',
  },
  {
    id: 'ahli',
    name: 'Bank Al-Ahli',
    nameAr: 'بنك الأهلي',
    swiftCode: 'AHLIJO',
    ibanPrefix: 'JO94AHLI',
    country: 'Jordan',
    currency: ['JOD', 'USD'],
    website: 'https://www.bankahlij.com',
    phone: '+962 6 5693000',
  },
  {
    id: 'cairo',
    name: 'Cairo Amman Bank',
    nameAr: 'بنك القاهرة عمّان',
    swiftCode: 'CAABJO',
    ibanPrefix: 'JO94CAAB',
    country: 'Jordan',
    currency: ['JOD', 'USD', 'EUR'],
    website: 'https://www.cairoamman.com',
    phone: '+962 6 5626000',
  },
  {
    id: 'jordan',
    name: 'Jordan Islamic Bank',
    nameAr: 'بنك الإسلامي الأردني',
    swiftCode: 'JIBAJO',
    ibanPrefix: 'JO94JIBA',
    country: 'Jordan',
    currency: ['JOD', 'USD'],
    website: 'https://www.jordanislamicbank.com',
    phone: '+962 6 5689000',
  },
  {
    id: 'invest',
    name: 'Jordan Investment Bank',
    nameAr: 'بنك الاستثمار الأردني',
    swiftCode: 'JIBAJO',
    ibanPrefix: 'JO94JIBA',
    country: 'Jordan',
    currency: ['JOD', 'USD'],
    website: 'https://www.jib.com.jo',
    phone: '+962 6 5635000',
  },
  {
    id: 'capital',
    name: 'Capital Bank',
    nameAr: 'بنك رأس المال',
    swiftCode: 'CABAJO',
    ibanPrefix: 'JO94CABA',
    country: 'Jordan',
    currency: ['JOD', 'USD'],
    website: 'https://www.capitalbank.com.jo',
    phone: '+962 6 5809000',
  },
  {
    id: 'housing',
    name: 'Housing Bank for Trade and Finance',
    nameAr: 'بنك الإسكان للتجارة والتمويل',
    swiftCode: 'HOUBJO',
    ibanPrefix: 'JO94HOUB',
    country: 'Jordan',
    currency: ['JOD', 'USD'],
    website: 'https://www.housing.com.jo',
    phone: '+962 6 5689000',
  },
  {
    id: 'middle',
    name: 'Middle East Bank',
    nameAr: 'بنك الشرق الأوسط',
    swiftCode: 'MEABJO',
    ibanPrefix: 'JO94MEAB',
    country: 'Jordan',
    currency: ['JOD', 'USD'],
    website: 'https://www.mebank.com.jo',
    phone: '+962 6 5692000',
  },
  {
    id: 'abc',
    name: 'Arab Banking Corporation',
    nameAr: 'مؤسسة البنوك العربية',
    swiftCode: 'ABCOJO',
    ibanPrefix: 'JO94ABCO',
    country: 'Jordan',
    currency: ['JOD', 'USD'],
    website: 'https://www.arabbanking.com',
    phone: '+962 6 5651000',
  },
];

/**
 * الحصول على بيانات البنك من المعرف
 */
export function getBankInfo(bankId: string): BankInfo | undefined {
  return JORDANIAN_BANKS.find((bank) => bank.id === bankId);
}

/**
 * الحصول على بيانات البنك من الاسم
 */
export function getBankByName(name: string): BankInfo | undefined {
  return JORDANIAN_BANKS.find(
    (bank) =>
      bank.name.toLowerCase() === name.toLowerCase() ||
      bank.nameAr === name
  );
}

/**
 * الحصول على بيانات البنك من رمز SWIFT
 */
export function getBankBySwiftCode(swiftCode: string): BankInfo | undefined {
  return JORDANIAN_BANKS.find(
    (bank) => bank.swiftCode.toLowerCase() === swiftCode.toLowerCase()
  );
}

/**
 * التحقق من صحة رقم IBAN
 */
export function validateIBAN(iban: string): boolean {
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();

  // التحقق من الطول
  if (cleanIBAN.length < 15 || cleanIBAN.length > 34) {
    return false;
  }

  // التحقق من أن يبدأ برمز الدولة
  if (!cleanIBAN.startsWith('JO')) {
    return false;
  }

  // التحقق من أن يحتوي على أرقام وأحرف فقط
  if (!/^[A-Z0-9]+$/.test(cleanIBAN)) {
    return false;
  }

  // حساب checksum (Mod-97)
  const rearranged = cleanIBAN.slice(4) + cleanIBAN.slice(0, 4);
  let numericIBAN = '';

  for (let i = 0; i < rearranged.length; i++) {
    const char = rearranged[i];
    numericIBAN += char.charCodeAt(0) - (char >= 'A' ? 55 : 48);
  }

  // حساب الـ mod 97
  let remainder = 0;
  for (let i = 0; i < numericIBAN.length; i++) {
    remainder = (remainder * 10 + parseInt(numericIBAN[i])) % 97;
  }

  return remainder === 1;
}

/**
 * استخراج معرف البنك من IBAN
 */
export function extractBankIdFromIBAN(iban: string): string | undefined {
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();

  // البحث عن البنك من بادئة IBAN
  for (const bank of JORDANIAN_BANKS) {
    if (cleanIBAN.startsWith(bank.ibanPrefix)) {
      return bank.id;
    }
  }

  return undefined;
}

/**
 * تنسيق IBAN للعرض
 */
export function formatIBAN(iban: string): string {
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  return cleanIBAN.match(/.{1,4}/g)?.join(' ') || cleanIBAN;
}

/**
 * إخفاء IBAN (عرض آخر 4 أرقام فقط)
 */
export function maskIBAN(iban: string): string {
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  const lastFour = cleanIBAN.slice(-4);
  return `****${lastFour}`;
}

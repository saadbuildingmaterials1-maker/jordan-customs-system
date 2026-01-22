/**
 * تنسيق العملة بالدينار الأردني
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ar-JO", {
    style: "currency",
    currency: "JOD",
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(value);
}

/**
 * تنسيق الأرقام بالعربية
 */
export function formatArabicNumber(value: string | number): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(value).replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
}

/**
 * تنسيق النسبة المئوية
 */
export function formatPercentage(value: number): string {
  return `${formatArabicNumber(value.toFixed(2))}%`;
}

/**
 * تنسيق التاريخ بالعربية
 */
export function formatDateArabic(date: Date): string {
  return new Intl.DateTimeFormat("ar-JO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

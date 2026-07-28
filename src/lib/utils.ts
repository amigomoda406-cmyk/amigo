// src/lib/utils.ts

// تنسيق السعر بالدينار الجزائري
export function formatPrice(price: number): string {
  return `${price.toLocaleString('fr-DZ')} DA`;
}

// حساب نسبة الخصم
export function calculateDiscount(price: number, comparePrice: number): number {
  return Math.round((1 - price / comparePrice) * 100);
}

// اقتطاع النص
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

// تأخير
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// تنسيق التاريخ بالتوقيت الجزائري
export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(dateStr).toLocaleDateString('fr-DZ', {
    timeZone: 'Africa/Algiers',
    ...options,
  });
}

// تنسيق رقم الطلب
export function formatOrderId(id: string): string {
  return `#${id.slice(-8).toUpperCase()}`;
}

// التحقق من صحة رقم الهاتف الجزائري
export function isValidAlgerianPhone(phone: string): boolean {
  return /^(0)(5|6|7)[0-9]{8}$/.test(phone);
}

// تحويل رقم الهاتف للـ WhatsApp
export function toWhatsAppNumber(phone: string): string {
  return `213${phone.slice(1)}`;
}

// cn — دمج كلاسات CSS
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

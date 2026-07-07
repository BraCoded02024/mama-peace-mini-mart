export const PHONE_DIGIT_LENGTH = 10;

export function sanitizePhoneInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, PHONE_DIGIT_LENGTH);
}

export function isValidPhoneNumber(phone: string): boolean {
  return new RegExp(`^\\d{${PHONE_DIGIT_LENGTH}}$`).test(phone);
}

/** Ghana local numbers (10 digits) → `tel:+233...` for click-to-call links. */
export function toTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("233") && digits.length >= 12) {
    return `tel:+${digits}`;
  }
  const local = digits.startsWith("0") ? digits.slice(1) : digits;
  return `tel:+233${local}`;
}

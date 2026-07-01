export const PHONE_DIGIT_LENGTH = 10;

export function sanitizePhoneInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, PHONE_DIGIT_LENGTH);
}

export function isValidPhoneNumber(phone: string): boolean {
  return new RegExp(`^\\d{${PHONE_DIGIT_LENGTH}}$`).test(phone);
}

/** Online order payment is collected by CODETECHS on behalf of Mama Peace Mini Mart. */
export const PAYMENT_MERCHANT = {
  name: "CODETECHS",
  mtnNumbers: ["947300", "0245322173"] as const,
  dispatchNotice:
    "Full payment of the total amount is required before your order is dispatched.",
} as const;

export const PAYMENT_AUTHORIZED_NOTICE = {
  heading: "Authorized payment — CODETECHS only",
  operator:
    "CODETECHS is in charge of Mama Peace Mini Mart online ordering and payment.",
  mtnLine: `MTN Mobile Money: ${PAYMENT_MERCHANT.mtnNumbers.join(" or ")}`,
  merchantName: `Merchant name: ${PAYMENT_MERCHANT.name}`,
  onlyChannel:
    "This is the only authorized payment channel for online orders. Do not send money to any third person, rider, staff member, or other phone number.",
  liability:
    "Mama Peace Mini Mart is not responsible for payments made to anyone other than the CODETECHS merchant account above.",
} as const;

export function formatMtnNumbersList() {
  return PAYMENT_MERCHANT.mtnNumbers.join(" or ");
}

export const PAYMENT_METHOD_LABELS = {
  PAYSTACK: "Paystack (card / online mobile money)",
  MTN_MOMO: "MTN Mobile Money (merchant number)",
} as const;

export type OrderPaymentMethod = keyof typeof PAYMENT_METHOD_LABELS;

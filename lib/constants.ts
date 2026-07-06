export const MIN_ORDER_AMOUNT_GHS = 80;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Pending Review",
  AWAITING_PAYMENT: "Awaiting Payment",
  PAYMENT_CONFIRMED: "Payment Confirmed",
  READY_FOR_PICKUP: "Ready for Pickup",
  RIDER_ASSIGNED: "Rider Assigned",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const RIDER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export const PAID_ORDER_STATUSES = [
  "PAYMENT_CONFIRMED",
  "READY_FOR_PICKUP",
  "RIDER_ASSIGNED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

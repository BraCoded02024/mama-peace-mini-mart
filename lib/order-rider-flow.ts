import type { OrderStatus } from "@prisma/client";

/** New orders riders can pick up from the pool (traditional flow). */
export const RIDER_POOL_STATUSES: OrderStatus[] = [
  "PENDING_REVIEW",
  // Legacy orders that were priced/paid before rider pickup
  "READY_FOR_PICKUP",
];

/** Statuses shown on the rider's active order card. */
export const RIDER_ACTIVE_STATUSES: OrderStatus[] = [
  "RIDER_ASSIGNED",
  "AWAITING_PAYMENT",
  "PAYMENT_CONFIRMED",
  "OUT_FOR_DELIVERY",
];

export function isRiderPoolStatus(status: OrderStatus) {
  return RIDER_POOL_STATUSES.includes(status);
}

export function statusAfterRiderUnassign(order: {
  status: OrderStatus;
  totalAmount: number | null;
}) {
  if (order.status !== "RIDER_ASSIGNED") return {};

  if (order.totalAmount != null) {
    return { status: "READY_FOR_PICKUP" as const };
  }

  return { status: "PENDING_REVIEW" as const };
}

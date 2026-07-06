import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@prisma/client";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variant =
    status === "PAYMENT_CONFIRMED" ||
    status === "DELIVERED" ||
    status === "READY_FOR_PICKUP"
      ? "success"
      : status === "PENDING_REVIEW" || status === "AWAITING_PAYMENT"
        ? "warning"
        : status === "CANCELLED"
          ? "muted"
          : status === "RIDER_ASSIGNED" || status === "OUT_FOR_DELIVERY"
            ? "default"
            : "default";

  return (
    <Badge variant={variant}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@prisma/client";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variant =
    status === "PAID" || status === "DELIVERED"
      ? "success"
      : status === "PENDING_REVIEW" || status === "AWAITING_PAYMENT"
        ? "warning"
        : status === "CANCELLED"
          ? "muted"
          : "default";

  return (
    <Badge variant={variant}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}

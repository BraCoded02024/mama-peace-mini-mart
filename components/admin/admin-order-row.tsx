"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Loader2, Phone } from "lucide-react";
import {
  assignRiderToOrderAction,
} from "@/app/actions/riders";
import { toTelHref } from "@/lib/phone";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, Rider } from "@prisma/client";

export function AdminOrderRow({
  order,
  riders,
}: {
  order: Order & { assignedRider?: Rider | null };
  riders: Rider[];
}) {
  const router = useRouter();
  const [riderId, setRiderId] = useState(order.assignedRiderId ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeRiders = riders.filter((r) => r.status === "ACTIVE");
  const assignedRider =
    order.assignedRider ??
    activeRiders.find((r) => r.id === order.assignedRiderId);

  async function handleAssign(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!riderId) return;
    setLoading(true);
    setError("");
    const result = await assignRiderToOrderAction({
      orderId: order.id,
      riderId,
    });
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  const showQuickAssign =
    order.status === "PENDING_REVIEW" && !order.assignedRiderId;

  return (
    <Link href={`/admin/orders/${order.id}`} className="group block">
      <Card className="transition hover:border-mama-green/40 hover:shadow-md">
        <CardContent className="flex items-center justify-between gap-4 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-mama-ink">
                {order.referenceNumber}
              </p>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="mt-1 truncate text-sm text-mama-muted">
              {order.customerName} ·{" "}
              <a
                href={toTelHref(order.phoneNumber)}
                onClick={(e) => e.stopPropagation()}
                className="text-mama-green hover:underline"
              >
                {order.phoneNumber}
              </a>
            </p>
            <p className="mt-0.5 text-xs text-mama-muted">
              {formatDate(order.createdAt)}
            </p>

            {assignedRider && (
              <p className="mt-2 text-xs text-mama-muted">
                Rider: {assignedRider.name}
                {" · "}
                <a
                  href={toTelHref(assignedRider.phone)}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-0.5 text-mama-green hover:underline"
                >
                  <Phone className="h-3 w-3" />
                  Call
                </a>
              </p>
            )}

            {showQuickAssign && activeRiders.length > 0 && (
              <div
                className="mt-3 flex flex-wrap items-center gap-2"
                onClick={(e) => e.preventDefault()}
              >
                <select
                  value={riderId}
                  onChange={(e) => setRiderId(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-lg border border-mama-border bg-white px-2 py-1.5 text-xs text-mama-ink"
                >
                  <option value="">Assign rider…</option>
                  {activeRiders.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.area})
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  disabled={!riderId || loading}
                  onClick={handleAssign}
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Assign
                </Button>
              </div>
            )}
            {error && (
              <p className="mt-1 text-xs text-red-600" onClick={(e) => e.stopPropagation()}>
                {error}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {order.totalAmount != null && (
              <span className="font-semibold text-mama-ink">
                {formatCurrency(order.totalAmount)}
              </span>
            )}
            <ChevronRight className="h-5 w-5 text-mama-muted transition group-hover:translate-x-0.5 group-hover:text-mama-green" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

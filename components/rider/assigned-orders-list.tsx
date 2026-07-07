"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Phone, User, Loader2 } from "lucide-react";
import { acceptOrderAction } from "@/app/actions/riders";
import { toTelHref } from "@/lib/phone";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { Order } from "@prisma/client";

export function AssignedOrdersList({
  orders,
  canAccept,
}: {
  orders: Order[];
  canAccept: boolean;
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleAccept(orderId: string) {
    setLoadingId(orderId);
    setError("");
    const result = await acceptOrderAction(orderId);
    setLoadingId(null);
    if (!result.success) {
      setError(result.error);
      router.refresh();
      return;
    }
    router.refresh();
  }

  if (orders.length === 0) return null;

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="space-y-4 py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-mama-ink">
                  {order.referenceNumber}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-mama-muted">
                  <User className="h-3.5 w-3.5" />
                  {order.customerName}
                </p>
                <a
                  href={toTelHref(order.phoneNumber)}
                  className="mt-0.5 flex items-center gap-1.5 text-sm text-mama-green hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {order.phoneNumber}
                </a>
              </div>
              <Badge variant="muted">
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </Badge>
            </div>

            <div className="flex items-start gap-2 text-sm text-mama-ink">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mama-green" />
              <span>{order.gpsAddress}</span>
            </div>

            {order.totalAmount != null && (
              <p className="text-sm">
                <span className="text-mama-muted">Estimated total: </span>
                <span className="font-semibold text-mama-ink">
                  {formatCurrency(order.totalAmount)}
                </span>
              </p>
            )}

            {canAccept && order.status === "READY_FOR_PICKUP" && (
              <Button
                className="w-full"
                disabled={loadingId === order.id}
                onClick={() => handleAccept(order.id)}
              >
                {loadingId === order.id && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Start Delivery
              </Button>
            )}

            {!canAccept && order.status !== "READY_FOR_PICKUP" && (
              <p className="text-sm text-mama-muted">
                Waiting for admin to mark this order ready for pickup.
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

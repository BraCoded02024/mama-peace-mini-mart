"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, User, Loader2, Lock } from "lucide-react";
import { acceptOrderAction } from "@/app/actions/riders";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Order } from "@prisma/client";

export function AvailableOrdersList({ orders }: { orders: Order[] }) {
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

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="font-medium text-mama-ink">No orders available</p>
          <p className="mt-1 text-sm text-mama-muted">
            New customer orders appear here as soon as they are placed. Accept
            one and go to the shop to pick items.
          </p>
        </CardContent>
      </Card>
    );
  }

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
                  Customer
                </p>
              </div>
              <Badge variant="muted">New order</Badge>
            </div>

            <div className="flex items-start gap-2 text-sm text-mama-ink">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mama-green" />
              <span>{order.gpsAddress}</span>
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-mama-gray px-3 py-2 text-sm text-mama-muted">
              <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Items and customer contact are revealed once you accept this
                order.
              </span>
            </div>

            <Button
              className="w-full"
              disabled={loadingId === order.id}
              onClick={() => handleAccept(order.id)}
            >
              {loadingId === order.id && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Accept & go to shop
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

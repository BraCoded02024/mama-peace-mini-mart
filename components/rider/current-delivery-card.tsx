"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Phone,
  User,
  Loader2,
  Package,
  CheckCheck,
  ShoppingBasket,
} from "lucide-react";
import {
  riderConfirmPaymentAction,
  riderUpdateOrderStatusAction,
} from "@/app/actions/riders";
import { resolveOrderMapsUrl, stripMapPinNote } from "@/lib/location";
import { MomoPaymentInstructions } from "@/components/order/momo-payment-instructions";
import { RiderShopPriceForm } from "@/components/rider/rider-shop-price-form";
import { toTelHref } from "@/lib/phone";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import type { Order } from "@prisma/client";

export function CurrentDeliveryCard({ order }: { order: Order }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mapsUrl = resolveOrderMapsUrl(
    order.gpsAddress,
    order.locationDescription
  );
  const riderDirections = order.locationDescription
    ? stripMapPinNote(order.locationDescription)
    : "";

  const canDispatchLegacy =
    order.status === "RIDER_ASSIGNED" && order.totalAmount != null;
  const canDispatchPaid = order.status === "PAYMENT_CONFIRMED";

  async function handleDispatch() {
    setLoading(true);
    setError("");
    const result = await riderUpdateOrderStatusAction(
      order.id,
      "OUT_FOR_DELIVERY"
    );
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelivered() {
    setLoading(true);
    setError("");
    const result = await riderUpdateOrderStatusAction(order.id, "DELIVERED");
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleConfirmPayment() {
    setLoading(true);
    setError("");
    const result = await riderConfirmPaymentAction(order.id);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-mama-border bg-mama-green px-5 py-4 text-white">
        <p className="text-[10px] uppercase tracking-wider text-mama-cream/80">
          Active Order
        </p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h2 className="font-serif text-xl">{order.referenceNumber}</h2>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <CardContent className="space-y-4 pt-5">
        <div className="rounded-xl border border-mama-border bg-mama-gray/60 p-3 text-sm">
          <p className="mb-1 flex items-center gap-2 font-medium text-mama-ink">
            <ShoppingBasket className="h-4 w-4 text-mama-green" />
            Items requested
          </p>
          <p className="whitespace-pre-wrap text-mama-ink">
            {order.itemsRequested}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <p className="flex items-center gap-2 text-mama-ink">
            <User className="h-4 w-4 text-mama-green" />
            {order.customerName}
          </p>
          <a
            href={toTelHref(order.phoneNumber)}
            className="flex items-center gap-2 text-mama-green hover:underline"
          >
            <Phone className="h-4 w-4" />
            {order.phoneNumber}
          </a>
          <p className="flex items-start gap-2 text-mama-ink">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mama-green" />
            <span>{order.gpsAddress}</span>
          </p>
        </div>

        {riderDirections && (
          <p className="rounded-xl bg-mama-gray px-3 py-2 text-sm text-mama-muted">
            {riderDirections}
          </p>
        )}

        {order.specialInstructions && (
          <p className="rounded-xl border border-mama-border px-3 py-2 text-sm text-mama-muted">
            <span className="font-medium text-mama-ink">Instructions: </span>
            {order.specialInstructions}
          </p>
        )}

        {order.status === "RIDER_ASSIGNED" && order.totalAmount == null && (
          <RiderShopPriceForm orderId={order.id} />
        )}

        {order.status === "AWAITING_PAYMENT" && order.totalAmount != null && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-mama-ink">
              Total: {formatCurrency(order.totalAmount)}
            </p>
            <p className="text-sm text-mama-muted">
              Waiting for customer payment. Confirm below once Mama Peace /
              CODETECHS receives the MoMo payment.
            </p>
            {order.paymentMethod === "MTN_MOMO" && (
              <MomoPaymentInstructions
                totalAmount={order.totalAmount}
                referenceNumber={order.referenceNumber}
              />
            )}
            <Button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm payment received
            </Button>
          </div>
        )}

        {order.totalAmount != null && order.status !== "AWAITING_PAYMENT" && (
          <p className="text-sm font-semibold text-mama-ink">
            Total: {formatCurrency(order.totalAmount)}
          </p>
        )}

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-full border border-mama-green bg-white px-4 py-2.5 text-sm font-semibold text-mama-green transition hover:bg-mama-cream"
        >
          Open in Google Maps
        </a>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          {(canDispatchPaid || canDispatchLegacy) && (
            <Button onClick={handleDispatch} disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Package className="h-4 w-4" />
              Dispatch order
            </Button>
          )}
          {order.status === "OUT_FOR_DELIVERY" && (
            <Button onClick={handleDelivered} disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <CheckCheck className="h-4 w-4" />
              Delivered
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

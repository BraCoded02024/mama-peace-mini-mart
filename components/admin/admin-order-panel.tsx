"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Mail,
  MapPin,
  StickyNote,
  ShoppingBasket,
  Tag,
  KeyRound,
  Package,
  Truck,
  CheckCheck,
  Loader2,
} from "lucide-react";
import {
  approveOrderAction,
  updateOrderStatusAction,
} from "@/app/actions/orders";
import { MIN_ORDER_AMOUNT_GHS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { AdminSendMessageCard } from "@/components/admin/admin-send-message-card";
import type { Order, OrderItem } from "@prisma/client";

type OrderWithItems = Order & { items: OrderItem[] };

export function AdminOrderPanel({ order }: { order: OrderWithItems }) {
  const router = useRouter();
  const [subtotal, setSubtotal] = useState(order.subtotal?.toString() ?? "");
  const [deliveryFee, setDeliveryFee] = useState(
    order.deliveryFee?.toString() ?? "15"
  );
  const [serviceFee, setServiceFee] = useState(
    order.serviceFee?.toString() ?? "0"
  );
  const [adminMessage, setAdminMessage] = useState(order.adminMessage ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const total =
    (parseFloat(subtotal) || 0) +
    (parseFloat(deliveryFee) || 0) +
    (parseFloat(serviceFee) || 0);

  async function handleApprove() {
    setLoading(true);
    setError("");
    const result = await approveOrderAction({
      orderId: order.id,
      subtotal: parseFloat(subtotal) || 0,
      deliveryFee: parseFloat(deliveryFee) || 0,
      serviceFee: parseFloat(serviceFee) || 0,
      adminMessage: adminMessage || undefined,
    });
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleStatus(status: "PREPARING" | "ON_THE_WAY" | "DELIVERED") {
    setLoading(true);
    await updateOrderStatusAction({ orderId: order.id, status });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-mama-border bg-mama-green px-5 py-4 text-white">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-mama-cream/80">
              Reference
            </p>
            <h2 className="truncate font-serif text-xl">{order.referenceNumber}</h2>
            <p className="mt-0.5 text-xs text-mama-cream/80">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <CardContent className="space-y-4 pt-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoRow icon={User} label="Customer" value={order.customerName} />
            <InfoRow icon={Phone} label="Phone" value={order.phoneNumber} />
            {order.customerEmail && (
              <InfoRow icon={Mail} label="Email" value={order.customerEmail} />
            )}
            <InfoRow
              icon={MapPin}
              label="Delivery Address"
              value={
                order.locationDescription
                  ? `${order.gpsAddress} — ${order.locationDescription}`
                  : order.gpsAddress
              }
            />
          </div>

          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mama-muted">
              <ShoppingBasket className="h-4 w-4 text-mama-green" />
              Items Requested
            </p>
            <div className="rounded-xl border border-mama-border bg-mama-gray p-4 text-sm whitespace-pre-wrap text-mama-ink">
              {order.itemsRequested}
            </div>
          </div>

          {order.specialInstructions && (
            <div className="flex gap-2 rounded-xl border border-mama-border bg-white p-3 text-sm">
              <StickyNote className="h-4 w-4 shrink-0 text-mama-brown" />
              <p className="text-mama-muted">
                <span className="font-medium text-mama-ink">Note: </span>
                {order.specialInstructions}
              </p>
            </div>
          )}

          {order.items.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mama-muted">
                <Tag className="h-4 w-4 text-mama-green" />
                Priced Items
              </p>
              <div className="divide-y divide-mama-border rounded-xl border border-mama-border bg-white">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="block font-medium text-mama-ink">
                        {item.itemName}
                      </span>
                      <span className="text-xs text-mama-muted">
                        {item.quantity} x {formatCurrency(item.unitPrice)}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium text-mama-ink">
                      {formatCurrency(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {order.status === "PENDING_REVIEW" && (
        <>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <h3 className="font-serif text-lg text-mama-ink">
                  Set Pricing &amp; Approve
                </h3>
                <p className="text-sm text-mama-muted">
                  Enter the costs, then send the customer a payment link.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Subtotal</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={subtotal}
                    onChange={(e) => setSubtotal(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Delivery</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Service</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceFee}
                    onChange={(e) => setServiceFee(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-mama-gray px-4 py-3">
                <span className="text-sm font-medium text-mama-ink">Total</span>
                <span className="font-serif text-lg text-mama-green">
                  {formatCurrency(total)}
                </span>
              </div>
              {total < MIN_ORDER_AMOUNT_GHS && (
                <p className="text-sm text-red-600">
                  Below the GHS {MIN_ORDER_AMOUNT_GHS} minimum order amount.
                </p>
              )}

              <div className="space-y-1.5">
                <Label>Message to customer (optional)</Label>
                <Textarea
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="e.g. Tomatoes out of stock — substituted with fresh garden eggs."
                  className="min-h-[90px]"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button
                onClick={handleApprove}
                disabled={loading}
                className="w-full"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Approve &amp; Send Payment Link
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {order.status === "PAID" && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-serif text-lg text-mama-ink">
              Update Delivery Status
            </h3>
            <div className="grid gap-2 sm:grid-cols-3">
              <Button onClick={() => handleStatus("PREPARING")} disabled={loading}>
                <Package className="h-4 w-4" />
                Preparing
              </Button>
              <Button onClick={() => handleStatus("ON_THE_WAY")} disabled={loading}>
                <Truck className="h-4 w-4" />
                On the Way
              </Button>
              <Button onClick={() => handleStatus("DELIVERED")} disabled={loading}>
                <CheckCheck className="h-4 w-4" />
                Delivered
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {order.verificationCode && (
        <div className="flex items-center gap-3 rounded-2xl border border-mama-green/30 bg-mama-green/5 px-5 py-4">
          <KeyRound className="h-5 w-5 shrink-0 text-mama-green" />
          <div>
            <p className="text-xs uppercase tracking-wider text-mama-muted">
              Verification Code
            </p>
            <p className="font-serif text-xl text-mama-ink">
              {order.verificationCode}
            </p>
          </div>
        </div>
      )}

      {order.status !== "CANCELLED" && (
        <>
          {order.adminMessage && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-mama-muted">
                  Last message sent to customer
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-mama-ink">
                  {order.adminMessage}
                </p>
              </CardContent>
            </Card>
          )}
          <AdminSendMessageCard
            orderId={order.id}
            customerEmail={order.customerEmail}
          />
        </>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-mama-border bg-white p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mama-green/10 text-mama-green">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-mama-muted">
          {label}
        </p>
        <p className="break-words text-sm font-medium text-mama-ink">{value}</p>
      </div>
    </div>
  );
}

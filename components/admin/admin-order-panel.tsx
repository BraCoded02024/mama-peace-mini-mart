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
  Loader2,
  PhoneCall,
  AlertTriangle,
} from "lucide-react";
import {
  approveOrderAction,
  confirmMomoPaymentAction,
  markOrderReadyForPickupAction,
} from "@/app/actions/orders";
import {
  assignRiderToOrderAction,
  unassignRiderAction,
} from "@/app/actions/riders";
import { MIN_ORDER_AMOUNT_GHS, STALE_ASSIGNMENT_MINUTES } from "@/lib/constants";
import {
  PAYMENT_METHOD_LABELS,
  type OrderPaymentMethod,
} from "@/lib/payment-config";
import { MomoPaymentInstructions } from "@/components/order/momo-payment-instructions";
import { toTelHref } from "@/lib/phone";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { AdminSendMessageCard } from "@/components/admin/admin-send-message-card";
import { resolveOrderMapsUrl, stripMapPinNote } from "@/lib/location";
import type { Order, OrderItem, Rider } from "@prisma/client";

type OrderWithItems = Order & {
  items: OrderItem[];
  assignedRider?: Rider | null;
};

export function AdminOrderPanel({
  order,
  riders,
}: {
  order: OrderWithItems;
  riders: Rider[];
}) {
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
  const [selectedRiderId, setSelectedRiderId] = useState(
    order.assignedRiderId ?? ""
  );
  const [assignLoading, setAssignLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] =
    useState<OrderPaymentMethod>("PAYSTACK");
  const [momoConfirmLoading, setMomoConfirmLoading] = useState(false);

  const activeRiders = riders.filter((r) => r.status === "ACTIVE");
  const canAssignRider = !["DELIVERED", "CANCELLED"].includes(order.status);
  const showAssignCard = canAssignRider;

  const staleAssignment =
    order.status === "RIDER_ASSIGNED" &&
    order.assignedAt &&
    Date.now() - new Date(order.assignedAt).getTime() >
      STALE_ASSIGNMENT_MINUTES * 60 * 1000;

  const staleMinutes = order.assignedAt
    ? Math.floor(
        (Date.now() - new Date(order.assignedAt).getTime()) / 60_000
      )
    : 0;

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
      paymentMethod,
    });
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleReadyForPickup() {
    setLoading(true);
    setError("");
    const result = await markOrderReadyForPickupAction(order.id);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleAssignRider() {
    if (!selectedRiderId) return;
    setAssignLoading(true);
    setError("");
    const result = await assignRiderToOrderAction({
      orderId: order.id,
      riderId: selectedRiderId,
    });
    setAssignLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleUnassignRider() {
    setAssignLoading(true);
    setError("");
    const result = await unassignRiderAction(order.id);
    setAssignLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setSelectedRiderId("");
    router.refresh();
  }

  async function handleConfirmMomoPayment() {
    setMomoConfirmLoading(true);
    setError("");
    const result = await confirmMomoPaymentAction(order.id);
    setMomoConfirmLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
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
            <div className="flex items-start gap-3 rounded-xl border border-mama-border bg-white p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mama-green/10 text-mama-green">
                <Phone className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-mama-muted">
                  Phone
                </p>
                <a
                  href={toTelHref(order.phoneNumber)}
                  className="break-words text-sm font-medium text-mama-green hover:underline"
                >
                  {order.phoneNumber}
                </a>
              </div>
            </div>
            {order.customerEmail && (
              <InfoRow icon={Mail} label="Email" value={order.customerEmail} />
            )}
            <DeliveryAddressRow
              gpsAddress={order.gpsAddress}
              locationDescription={order.locationDescription}
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
                  Enter the costs, choose how the customer should pay, then send
                  payment instructions.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Payment method to send</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(Object.keys(PAYMENT_METHOD_LABELS) as OrderPaymentMethod[]).map(
                    (method) => (
                      <label
                        key={method}
                        className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-sm transition ${
                          paymentMethod === method
                            ? "border-mama-green bg-mama-green/5"
                            : "border-mama-border bg-white hover:bg-mama-gray"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method}
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                          className="mt-1"
                        />
                        <span>{PAYMENT_METHOD_LABELS[method]}</span>
                      </label>
                    )
                  )}
                </div>
                {paymentMethod === "MTN_MOMO" && (
                  <p className="text-xs text-mama-muted">
                    Customer receives MTN numbers 947300 / 0245322173 — Name:
                    CODETECHS. You confirm payment manually after MoMo is
                    received.
                  </p>
                )}
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
                Approve &amp; Send Payment Instructions
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {order.status === "AWAITING_PAYMENT" &&
        order.paymentMethod === "MTN_MOMO" &&
        order.totalAmount != null && (
          <Card>
            <CardContent className="space-y-4 pt-6">
              <h3 className="font-serif text-lg text-mama-ink">
                Awaiting MTN MoMo Payment
              </h3>
              <MomoPaymentInstructions
                totalAmount={order.totalAmount}
                referenceNumber={order.referenceNumber}
              />
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <Button
                onClick={handleConfirmMomoPayment}
                disabled={momoConfirmLoading}
                className="w-full"
              >
                {momoConfirmLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Confirm MoMo Payment Received
              </Button>
            </CardContent>
          </Card>
        )}

      {order.status === "AWAITING_PAYMENT" &&
        order.paymentMethod === "PAYSTACK" && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-mama-muted">
                Customer was sent a Paystack payment link. Payment confirms
                automatically when they pay online.
              </p>
            </CardContent>
          </Card>
        )}

      {order.status === "PAYMENT_CONFIRMED" && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-serif text-lg text-mama-ink">
              Ready for Rider Pickup
            </h3>
            <p className="text-sm text-mama-muted">
              Mark this order ready when packed. Riders will only see it after
              you confirm.
            </p>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <Button onClick={handleReadyForPickup} disabled={loading} className="w-full">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Mark Ready for Pickup
            </Button>
          </CardContent>
        </Card>
      )}

      {showAssignCard && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <h3 className="font-serif text-lg text-mama-ink">Assign Rider</h3>
              <p className="text-sm text-mama-muted">
                Pre-assign a rider when the order is placed, or assign when ready
                for pickup. Call the rider if they do not respond.
              </p>
            </div>

            {order.assignedRider ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-mama-border bg-mama-gray p-4 text-sm">
                  <p className="font-medium text-mama-ink">
                    {order.assignedRider.name}
                  </p>
                  <p className="text-mama-muted">{order.assignedRider.area}</p>
                  {order.assignedAt && (
                    <p className="mt-1 text-xs text-mama-muted">
                      Assigned {formatDate(order.assignedAt)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={toTelHref(order.assignedRider.phone)}
                    className="inline-flex items-center gap-2 rounded-full bg-mama-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-mama-green-light"
                  >
                    <PhoneCall className="h-4 w-4" />
                    Call Rider
                  </a>
                  {order.status !== "OUT_FOR_DELIVERY" && (
                    <Button
                      variant="outline"
                      disabled={assignLoading}
                      onClick={handleUnassignRider}
                    >
                      Unassign
                    </Button>
                  )}
                </div>
                {staleAssignment && (
                  <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>
                      Assigned {staleMinutes} min ago — rider has not picked up
                      yet. Consider calling them.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                  className="w-full rounded-xl border border-mama-border bg-white px-3 py-2.5 text-sm text-mama-ink"
                >
                  <option value="">Select a rider…</option>
                  {activeRiders.map((rider) => (
                    <option key={rider.id} value={rider.id}>
                      {rider.name} — {rider.area} ({rider.phone})
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleAssignRider}
                  disabled={!selectedRiderId || assignLoading}
                  className="w-full"
                >
                  {assignLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Assign Rider
                </Button>
              </div>
            )}

            {order.status === "READY_FOR_PICKUP" && !order.assignedRiderId && (
              <p className="text-sm text-mama-muted">
                This order is visible to all active riders until you assign one.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {order.status === "READY_FOR_PICKUP" && order.assignedRiderId && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-mama-muted">
              Assigned to {order.assignedRider?.name}. Rider can start delivery
              from their portal, or you can call them.
            </p>
          </CardContent>
        </Card>
      )}

      {(order.status === "RIDER_ASSIGNED" ||
        order.status === "OUT_FOR_DELIVERY") &&
        order.assignedRider && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <h3 className="font-serif text-lg text-mama-ink">Delivery in Progress</h3>
            <a
              href={toTelHref(order.assignedRider.phone)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-mama-green px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-mama-green-light"
            >
              <PhoneCall className="h-4 w-4" />
              Call Rider
            </a>
          </CardContent>
        </Card>
      )}

      {order.status === "DELIVERED" && order.assignedRider && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-mama-muted">
              Delivered by{" "}
              <span className="font-medium text-mama-ink">
                {order.assignedRider.name}
              </span>
            </p>
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

function DeliveryAddressRow({
  gpsAddress,
  locationDescription,
}: {
  gpsAddress: string;
  locationDescription: string | null;
}) {
  const mapsUrl = resolveOrderMapsUrl(gpsAddress, locationDescription);
  const riderDirections = locationDescription
    ? stripMapPinNote(locationDescription)
    : "";

  return (
    <div className="flex items-start gap-3 rounded-xl border border-mama-border bg-white p-3 sm:col-span-2">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mama-green/10 text-mama-green">
        <MapPin className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-mama-muted">
          Delivery Address
        </p>
        <p className="break-words text-sm font-medium text-mama-ink">{gpsAddress}</p>
        {riderDirections && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-mama-muted">
            {riderDirections}
          </p>
        )}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex rounded-full bg-mama-green px-4 py-2 text-xs font-semibold text-white transition hover:bg-mama-green-light"
        >
          Open in Google Maps
        </a>
      </div>
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

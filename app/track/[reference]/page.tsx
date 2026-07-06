import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Shield,
  Truck,
  Pencil,
  X,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/layout/app-shell";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { DeliveryStatusGrid } from "@/components/order/trust-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AdminMessageNotice } from "@/components/order/admin-message-notice";
import { OrderPaymentSummary } from "@/components/order/order-payment-summary";
import { PaymentCallbackHandler } from "@/components/order/payment-callback-handler";

function normalizePhoneDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

export default async function TrackOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ phone?: string; reference?: string; trxref?: string }>;
}) {
  const { reference } = await params;
  const { phone, reference: paystackReference, trxref } = await searchParams;
  const paymentReference = paystackReference ?? trxref;

  const order = await prisma.order.findUnique({
    where: { referenceNumber: decodeURIComponent(reference) },
    include: { items: true, assignedRider: true },
  });

  if (!order) {
    notFound();
  }

  if (
    phone &&
    normalizePhoneDigits(order.phoneNumber) !== normalizePhoneDigits(phone)
  ) {
    notFound();
  }

  const showPaidView = order.status === "PAYMENT_CONFIRMED";

  if (showPaidView && order.verificationCode) {
    return (
      <AppShell showSearch={false}>
        <Card>
          <CardContent className="space-y-4 pt-8 text-center">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mama-green">
              <span className="text-3xl text-white">✓</span>
            </div>
            <OrderStatusBadge status={order.status} />
            <h1 className="font-serif text-2xl">Payment Received</h1>
            <p className="text-sm text-mama-muted">
              Your order has been confirmed and is being prepared. A rider will
              contact you shortly.
            </p>

            {order.adminMessage && (
              <AdminMessageNotice
                referenceNumber={order.referenceNumber}
                message={order.adminMessage}
              />
            )}

            <div className="rounded-xl bg-mama-gray p-4">
              <p className="text-xs uppercase tracking-wider text-mama-muted">
                Verification Code
              </p>
              <p className="font-serif text-3xl">{order.verificationCode}</p>
            </div>

            {order.assignedRider && (
              <div className="rounded-xl bg-mama-gray p-4 text-left">
                <p className="text-xs uppercase tracking-wider text-mama-muted">
                  Assigned Rider
                </p>
                <p className="font-medium">{order.assignedRider.name}</p>
                <p className="text-sm text-mama-muted">{order.assignedRider.phone}</p>
              </div>
            )}

            <Button asChild className="w-full">
              <Link href={`/track/${order.referenceNumber}?phone=${order.phoneNumber}`}>
                Track Delivery
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6">
          <h3 className="mb-1 font-serif text-lg">Delivery Progress</h3>
          <DeliveryStatusGrid status={order.status} />
        </div>

        <p className="mt-8 text-center text-sm text-mama-muted">
          Thank you for shopping with Mama Peace Mini Mart.
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PaymentCallbackHandler
        referenceNumber={order.referenceNumber}
        phoneNumber={order.phoneNumber}
        paystackReference={paymentReference}
      />

      <div className="text-center">
        <OrderStatusBadge status={order.status} />
        <h1 className="mt-3 font-serif text-xl">Order #{order.referenceNumber}</h1>
        <p className="text-sm text-mama-muted">
          Submitted on {formatDate(order.createdAt)}
        </p>
      </div>

      {order.adminMessage && (
        <AdminMessageNotice
          referenceNumber={order.referenceNumber}
          message={order.adminMessage}
        />
      )}

      {order.assignedRider &&
        (order.status === "RIDER_ASSIGNED" ||
          order.status === "OUT_FOR_DELIVERY" ||
          order.status === "DELIVERED") && (
          <Card className="mt-6">
            <CardContent className="pt-4">
              <p className="text-[10px] uppercase tracking-wider text-mama-muted">
                Your Rider
              </p>
              <p className="mt-1 font-medium text-mama-ink">
                {order.assignedRider.name}
              </p>
              <p className="text-sm text-mama-muted">{order.assignedRider.phone}</p>
            </CardContent>
          </Card>
        )}

      <Card className="mt-6">
        <CardContent className="space-y-4 pt-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-mama-border bg-mama-gray">
            <MapPin className="h-9 w-9 text-mama-green" />
          </div>
          <h2 className="font-serif text-xl text-mama-ink">We&apos;re on it</h2>
          <p className="text-sm text-mama-muted">
            Our team is preparing your order.{" "}
            {order.status === "PENDING_REVIEW" &&
              "We are reviewing availability and final pricing for your list."}
            {order.status === "AWAITING_PAYMENT" &&
              "Your order has been priced and is ready for payment."}
          </p>

          <div className="grid gap-2">
            <div className="flex items-center gap-3 rounded-xl bg-mama-gray p-3 text-left text-sm">
              <Shield className="h-5 w-5 text-mama-green" />
              Freshness check in progress
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-mama-gray p-3 text-left text-sm">
              <Truck className="h-5 w-5 text-mama-green" />
              Delivery route being planned
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4">
            <p className="text-[10px] uppercase tracking-wider text-mama-muted">
              Reference
            </p>
            <p className="font-serif text-lg">{order.referenceNumber}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-[10px] uppercase tracking-wider text-mama-muted">
              Estimated Review
            </p>
            <p className="font-serif text-lg">15–30 Mins</p>
          </CardContent>
        </Card>
      </div>

      {order.status === "AWAITING_PAYMENT" && order.totalAmount && (
        <OrderPaymentSummary
          referenceNumber={order.referenceNumber}
          phoneNumber={order.phoneNumber}
          customerEmail={order.customerEmail}
          customerName={order.customerName}
          gpsAddress={order.gpsAddress}
          items={order.items}
          itemsRequested={order.itemsRequested}
          subtotal={order.subtotal}
          deliveryFee={order.deliveryFee}
          serviceFee={order.serviceFee}
          totalAmount={order.totalAmount}
        />
      )}

      <Link
        href="/support"
        className="mt-4 flex items-center justify-between rounded-2xl bg-mama-green px-5 py-4 text-white"
      >
        <div>
          <p className="text-[10px] uppercase tracking-wider text-mama-cream">
            Need Help?
          </p>
          <p className="font-medium">Chat with a store manager about this order</p>
        </div>
        <ArrowRight className="h-5 w-5" />
      </Link>

      <div className="mt-6">
        <h3 className="mb-1 font-serif text-lg">Delivery Progress</h3>
        <DeliveryStatusGrid status={order.status} />
      </div>

      {order.status !== "AWAITING_PAYMENT" && (
        <div className="mt-6">
          <h3 className="mb-3 font-serif text-lg">Items Under Review</h3>
          <div className="space-y-2">
            {order.items.length > 0 ? (
              order.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-mama-border bg-white p-4"
                >
                  <p className="font-medium">{item.itemName}</p>
                  <p className="text-xs text-mama-muted">
                    Qty {item.quantity} · {formatCurrency(item.unitPrice)} each
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-white p-4 text-sm text-mama-muted whitespace-pre-wrap">
                {order.itemsRequested}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="outline" className="w-full" disabled>
          <Pencil className="h-4 w-4" />
          Modify Request
        </Button>
        <Button variant="secondary" className="w-full" disabled>
          <X className="h-4 w-4" />
          Cancel Order
        </Button>
      </div>
    </AppShell>
  );
}

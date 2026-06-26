"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  approveOrderAction,
  replyToOrderAction,
  updateOrderStatusAction,
} from "@/app/actions/orders";
import { MIN_ORDER_AMOUNT_GHS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import type { Order, OrderItem } from "@prisma/client";

type OrderWithItems = Order & { items: OrderItem[] };

export function AdminOrderPanel({ order }: { order: OrderWithItems }) {
  const router = useRouter();
  const [subtotal, setSubtotal] = useState(
    order.subtotal?.toString() ?? ""
  );
  const [deliveryFee, setDeliveryFee] = useState(
    order.deliveryFee?.toString() ?? "15"
  );
  const [serviceFee, setServiceFee] = useState(
    order.serviceFee?.toString() ?? "0"
  );
  const [adminMessage, setAdminMessage] = useState(order.adminMessage ?? "");
  const [replyMessage, setReplyMessage] = useState("");
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

  async function handleReply() {
    if (!replyMessage.trim()) return;
    setLoading(true);
    await replyToOrderAction({ orderId: order.id, message: replyMessage });
    setLoading(false);
    setReplyMessage("");
    router.refresh();
  }

  async function handleStatus(status: "PREPARING" | "ON_THE_WAY" | "DELIVERED") {
    setLoading(true);
    await updateOrderStatusAction({ orderId: order.id, status });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">{order.referenceNumber}</h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm">
            <strong>{order.customerName}</strong> · {order.phoneNumber}
          </p>
          <p className="text-sm text-mama-muted">
            {order.gpsAddress}
            {order.locationDescription && ` — ${order.locationDescription}`}
          </p>
          <div className="rounded-xl bg-mama-gray p-4 text-sm whitespace-pre-wrap">
            {order.itemsRequested}
          </div>
          {order.specialInstructions && (
            <p className="text-sm italic text-mama-muted">
              Note: {order.specialInstructions}
            </p>
          )}
        </CardContent>
      </Card>

      {order.status === "PENDING_REVIEW" && (
        <>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <h3 className="font-medium">Set Pricing & Approve</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Subtotal (GHS)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={subtotal}
                    onChange={(e) => setSubtotal(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Delivery (GHS)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Service (GHS)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceFee}
                    onChange={(e) => setServiceFee(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-sm">
                Total: <strong>{formatCurrency(total)}</strong>
                {total < MIN_ORDER_AMOUNT_GHS && (
                  <span className="ml-2 text-red-600">
                    (below GHS {MIN_ORDER_AMOUNT_GHS} minimum)
                  </span>
                )}
              </p>
              <div className="space-y-1">
                <Label>Message to customer (optional)</Label>
                <Textarea
                  value={adminMessage}
                  onChange={(e) => setAdminMessage(e.target.value)}
                  placeholder="e.g. Tomatoes out of stock — substituted with fresh garden eggs."
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button onClick={handleApprove} disabled={loading}>
                Approve & Send Payment Link
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <h3 className="font-medium">Reply (stock / enquiry)</h3>
              <Textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Let the customer know about availability..."
              />
              <Button variant="secondary" onClick={handleReply} disabled={loading}>
                Send Reply Email
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {order.status === "PAID" && (
        <Card>
          <CardContent className="flex flex-wrap gap-2 pt-6">
            <Button onClick={() => handleStatus("PREPARING")} disabled={loading}>
              Mark Preparing
            </Button>
            <Button onClick={() => handleStatus("ON_THE_WAY")} disabled={loading}>
              Mark On the Way
            </Button>
            <Button onClick={() => handleStatus("DELIVERED")} disabled={loading}>
              Mark Delivered
            </Button>
          </CardContent>
        </Card>
      )}

      {order.verificationCode && (
        <p className="text-sm text-mama-muted">
          Verification code: <strong>{order.verificationCode}</strong>
        </p>
      )}
    </div>
  );
}

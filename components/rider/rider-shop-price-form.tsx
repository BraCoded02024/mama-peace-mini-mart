"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBasket } from "lucide-react";
import { riderSubmitOrderPriceAction } from "@/app/actions/riders";
import { MIN_ORDER_AMOUNT_GHS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function RiderShopPriceForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [subtotal, setSubtotal] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("15");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total =
    (parseFloat(subtotal) || 0) + (parseFloat(deliveryFee) || 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await riderSubmitOrderPriceAction({
      orderId,
      subtotal: parseFloat(subtotal) || 0,
      deliveryFee: parseFloat(deliveryFee) || 0,
      note: note || undefined,
    });

    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-mama-green/30 bg-mama-green/5 p-4"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-mama-ink">
        <ShoppingBasket className="h-5 w-5 text-mama-green" />
        Enter shop total for customer
      </div>
      <p className="text-sm text-mama-muted">
        After Mama Peace gathers the items, enter the amounts below. The
        customer will be notified to pay before dispatch.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="subtotal">Items total (GHS)</Label>
          <Input
            id="subtotal"
            type="number"
            min="0"
            step="0.01"
            required
            value={subtotal}
            onChange={(e) => setSubtotal(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deliveryFee">Delivery fee (GHS)</Label>
          <Input
            id="deliveryFee"
            type="number"
            min="0"
            step="0.01"
            required
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="note">Note for customer (optional)</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Item substituted, out of stock note..."
          rows={2}
        />
      </div>

      <p className="text-sm">
        <span className="text-mama-muted">Total to charge: </span>
        <span className="font-semibold text-mama-ink">
          {formatCurrency(total)}
        </span>
        {total > 0 && total < MIN_ORDER_AMOUNT_GHS && (
          <span className="mt-1 block text-xs text-amber-700">
            Minimum order is GHS {MIN_ORDER_AMOUNT_GHS}
          </span>
        )}
      </p>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading || total < MIN_ORDER_AMOUNT_GHS}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Send price to customer
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronRight, Info, MapPin } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { DeliveryStatusGrid } from "@/components/order/trust-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import { isValidPhoneNumber } from "@/lib/phone";
import { Card, CardContent } from "@/components/ui/card";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

type TrackOrderMatch = {
  referenceNumber: string;
  customerName: string;
  phoneNumber: string;
  status: string;
  totalAmount: number | null;
  createdAt: string;
};

type TrackResponse =
  | { mode: "single"; order: TrackOrderMatch }
  | { mode: "matches"; orders: TrackOrderMatch[] };

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("en-GH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function TrackPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [lookup, setLookup] = useState("");
  const [matches, setMatches] = useState<TrackOrderMatch[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function openOrder(order: TrackOrderMatch) {
    router.push(
      `/track/${encodeURIComponent(order.referenceNumber)}?phone=${encodeURIComponent(order.phoneNumber)}`
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMatches([]);

    if (!isValidPhoneNumber(phoneNumber)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);

    try {
      const params = new URLSearchParams({
        phoneNumber: phoneNumber.trim(),
        lookup: lookup.trim(),
      });
      const res = await fetch(`/api/track?${params}`);
      if (!res.ok) {
        setError("Order not found. Check your phone number and reference or name.");
        return;
      }
      const data = (await res.json()) as TrackResponse;

      if (data.mode === "single") {
        openOrder(data.order);
        return;
      }

      setMatches(data.orders);
    } catch {
      setError("Unable to check status. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-mama-border bg-mama-gray">
          <MapPin className="h-9 w-9 text-mama-green" />
        </div>
        <h1 className="font-serif text-2xl text-mama-ink">Track Your Order</h1>
        <p className="mt-2 text-sm text-mama-muted">
          Enter your phone number, then use either your order reference or the
          name used for the order.
        </p>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <PhoneNumberInput
              placeholder="10-digit phone number"
              value={phoneNumber}
              onChange={setPhoneNumber}
              required
            />
            <Input
              placeholder="Reference Number or Full Name"
              value={lookup}
              onChange={(e) => setLookup(e.target.value)}
              required
            />
            <p className="text-xs text-mama-muted">
              Example: enter <strong>MP-2026-0001</strong> if you have your
              reference, or enter the name used for the order.
            </p>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Checking..." : "Check Status"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 border-t border-mama-border pt-4">
            <div className="flex gap-3 rounded-xl border border-mama-border bg-mama-gray p-3">
              <Info className="h-5 w-5 shrink-0 text-mama-green" />
              <p className="text-xs text-mama-muted">
                Can&apos;t find your reference number? It was shown right after
                you placed your order. If you added an email, check your inbox
                for Mama Peace updates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <Card className="mt-4">
          <CardContent className="space-y-3 pt-5">
            <div>
              <h2 className="font-serif text-lg text-mama-ink">
                Choose Your Order
              </h2>
              <p className="text-sm text-mama-muted">
                We found {matches.length} recent orders for this phone and name.
              </p>
            </div>

            <div className="space-y-2">
              {matches.map((order) => (
                <button
                  key={order.referenceNumber}
                  type="button"
                  onClick={() => openOrder(order)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-mama-border bg-white p-4 text-left transition hover:border-mama-green/50 hover:bg-mama-gray"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-mama-ink">
                      {order.referenceNumber}
                    </p>
                    <p className="mt-1 text-sm text-mama-muted">
                      {ORDER_STATUS_LABELS[order.status] ?? order.status} ·{" "}
                      {formatShortDate(order.createdAt)}
                    </p>
                    {order.totalAmount != null && (
                      <p className="mt-1 text-sm font-medium text-mama-green">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-mama-muted" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <DeliveryStatusGrid />
    </AppShell>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Info, MapPin } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { DeliveryStatusGrid } from "@/components/order/trust-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function TrackPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const params = new URLSearchParams({
        phoneNumber: phoneNumber.trim(),
        referenceNumber: referenceNumber.trim(),
      });
      const res = await fetch(`/api/track?${params}`);
      if (!res.ok) {
        setError("Order not found. Check your phone and reference number.");
        return;
      }
      router.push(
        `/track/${encodeURIComponent(referenceNumber.trim())}?phone=${encodeURIComponent(phoneNumber.trim())}`
      );
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
          Enter your phone number and order reference to check your delivery
          status.
        </p>
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <Input
              placeholder="Reference Number"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              required
            />
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
                Can&apos;t find your reference number? Check your SMS
                confirmation or recent order emails from Mama Peace.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeliveryStatusGrid />
    </AppShell>
  );
}

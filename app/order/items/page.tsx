"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, ShoppingCart, List, CheckCircle2, Bike } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { OrderStepper } from "@/components/order/order-stepper";
import { useOrderDraft } from "@/components/order/order-draft-context";
import { createOrderAction } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function OrderItemsPage() {
  const router = useRouter();
  const { draft, updateDraft, clearDraft } = useOrderDraft();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!draft.itemsRequested.trim()) {
      setError("Please list the items you need.");
      return;
    }

    if (
      !draft.customerName.trim() ||
      !draft.phoneNumber.trim() ||
      !draft.gpsAddress.trim()
    ) {
      router.push("/order");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createOrderAction({
        customerName: draft.customerName,
        phoneNumber: draft.phoneNumber,
        customerEmail: draft.customerEmail,
        gpsAddress: draft.gpsAddress,
        locationDescription: draft.locationDescription,
        itemsRequested: draft.itemsRequested,
        specialInstructions: draft.specialInstructions,
      });
      clearDraft();
      router.push(`/order/success?ref=${encodeURIComponent(result.referenceNumber)}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <OrderStepper currentStep={2} />

      <div className="mb-6">
        <h1 className="font-serif text-2xl text-mama-ink">
          Create Shopping Request
        </h1>
        <p className="mt-2 text-sm text-mama-muted">
          Step 2: List the items you need Mama Peace to gather for you.
        </p>
      </div>

      <Card className="relative overflow-hidden">
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="itemsRequested" className="font-serif text-base">
                  Items Needed
                </Label>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-mama-orange-dark">
                  Mandatory
                </span>
              </div>
              <div className="relative">
                <Textarea
                  id="itemsRequested"
                  value={draft.itemsRequested}
                  onChange={(e) =>
                    updateDraft({ itemsRequested: e.target.value })
                  }
                  placeholder="Rice - 2 Bags, Milo - 2 Tins, Plantain - 10 Pieces..."
                  className="min-h-[160px]"
                  required
                />
                <ShoppingCart className="absolute bottom-3 right-3 h-5 w-5 text-mama-muted/50" />
              </div>
              <p className="text-xs text-mama-muted">
                List items clearly with quantities. Our staff picks the freshest
                products.
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="specialInstructions"
                className="text-[10px] font-semibold uppercase tracking-wider text-mama-muted"
              >
                Optional Notes
              </Label>
              <div className="relative">
                <Input
                  id="specialInstructions"
                  value={draft.specialInstructions}
                  onChange={(e) =>
                    updateDraft({ specialInstructions: e.target.value })
                  }
                  placeholder="e.g. Please choose ripe plantain..."
                />
                <List className="absolute right-3 top-3.5 h-5 w-5 text-mama-muted/50" />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
              <Send className="h-4 w-4" />
            </Button>

            <button
              type="button"
              onClick={() => router.push("/order")}
              className="w-full text-center text-sm text-mama-muted hover:text-mama-ink"
            >
              Back to Details
            </button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-3">
        <div className="rounded-2xl bg-amber-50 p-4">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-mama-brown" />
            <div>
              <p className="font-medium">Quality Guaranteed</p>
              <p className="text-sm text-mama-muted">
                We only select items we would bring home to our own family.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-4">
          <div className="flex gap-3">
            <Bike className="h-5 w-5 shrink-0 text-mama-green" />
            <div>
              <p className="font-medium">Fast Delivery</p>
              <p className="text-sm text-mama-muted">
                Most requests are fulfilled and delivered within 2 hours of
                confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

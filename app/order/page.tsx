"use client";

import { useRouter } from "next/navigation";
import { User, Phone, Mail, ArrowRight, CheckCircle2, Bike } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { OrderStepper } from "@/components/order/order-stepper";
import { useOrderDraft } from "@/components/order/order-draft-context";
import { LocationAddressField } from "@/components/order/location-address-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import { isValidPhoneNumber } from "@/lib/phone";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function OrderDetailsPage() {
  const router = useRouter();
  const { draft, updateDraft } = useOrderDraft();

  function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    if (
      !draft.customerName.trim() ||
      !isValidPhoneNumber(draft.phoneNumber) ||
      !draft.gpsAddress.trim()
    ) {
      return;
    }
    router.push("/order/items");
  }

  return (
    <AppShell>
      <OrderStepper currentStep={1} />

      <div className="mb-6">
        <h1 className="font-serif text-2xl text-mama-ink">
          Welcome Back to Mama Peace
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-mama-muted">
          Tell us where to deliver your groceries. No account needed — just your
          details and your shopping list.
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={handleContinue} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Full Name</Label>
              <div className="relative">
                <Input
                  id="customerName"
                  value={draft.customerName}
                  onChange={(e) => updateDraft({ customerName: e.target.value })}
                  placeholder="Your full name"
                  required
                />
                <User className="absolute right-3 top-3.5 h-5 w-5 text-mama-muted" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative">
                <PhoneNumberInput
                  id="phoneNumber"
                  value={draft.phoneNumber}
                  onChange={(phoneNumber) => updateDraft({ phoneNumber })}
                  required
                />
                <Phone className="absolute right-3 top-3.5 h-5 w-5 text-mama-muted" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">
                Email Address <span className="font-normal text-mama-muted">(Optional)</span>
              </Label>
              <div className="relative">
                <Input
                  id="customerEmail"
                  type="email"
                  value={draft.customerEmail}
                  onChange={(e) => updateDraft({ customerEmail: e.target.value })}
                  placeholder="you@example.com"
                  className="pr-10"
                />
                <Mail className="absolute right-3 top-3.5 h-5 w-5 text-mama-muted" />
              </div>
              <p className="text-xs text-mama-muted">
                Add an email if you want order updates and receipts sent to your inbox.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpsAddress">Delivery Address / GPS Code</Label>
              <LocationAddressField
                id="gpsAddress"
                value={draft.gpsAddress}
                onChange={(gpsAddress) => updateDraft({ gpsAddress })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationDescription">
                Additional Location Description
              </Label>
              <Textarea
                  id="locationDescription"
                  value={draft.locationDescription}
                  onChange={(e) =>
                    updateDraft({ locationDescription: e.target.value })
                  }
                  placeholder="Near Ecobank Junction, the blue gate opposite the bakery..."
                  className="min-h-[100px]"
                />
              <p className="text-xs text-mama-muted">
                Be descriptive to help our riders find you easily.
              </p>
            </div>

            <Button type="submit" className="w-full">
              Continue to Shopping List
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 space-y-4">
        <p className="text-center font-serif italic text-mama-brown">
          &ldquo;Delivered with Care&rdquo;
        </p>
        <div className="rounded-2xl bg-amber-50 p-4">
          <div className="flex gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-mama-brown" />
            <div>
              <p className="font-medium">Quality Guarantee</p>
              <p className="text-sm text-mama-muted">
                Every order is hand-picked to ensure only the highest quality
                produce enters your home.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl bg-mama-gray p-4">
          <div className="flex gap-3">
            <Bike className="h-5 w-5 shrink-0 text-mama-green" />
            <div>
              <p className="font-medium">Local Expertise</p>
              <p className="text-sm text-mama-muted">
                Our dedicated riders know your neighborhood like the back of
                their hand.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

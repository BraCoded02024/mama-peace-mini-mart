"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type PaymentCallbackHandlerProps = {
  referenceNumber: string;
  phoneNumber: string;
  paystackReference?: string;
};

export function PaymentCallbackHandler({
  referenceNumber,
  phoneNumber,
  paystackReference,
}: PaymentCallbackHandlerProps) {
  const router = useRouter();
  const [message, setMessage] = useState("Confirming your payment with Paystack...");

  useEffect(() => {
    if (!paystackReference) return;

    let cancelled = false;

    async function verifyPayment() {
      try {
        const res = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: paystackReference,
            referenceNumber,
            phoneNumber,
          }),
        });

        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setMessage(data.error ?? "Payment could not be confirmed.");
          return;
        }

        setMessage("Payment confirmed. Updating your order...");
        router.replace(`/track/${encodeURIComponent(referenceNumber)}?phone=${encodeURIComponent(phoneNumber)}`);
        router.refresh();
      } catch {
        if (!cancelled) {
          setMessage("Payment could not be confirmed. Please try again.");
        }
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [paystackReference, referenceNumber, phoneNumber, router]);

  if (!paystackReference) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-mama-border bg-white p-6 text-center shadow-lg">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-mama-green" />
        <p className="mt-4 font-serif text-lg text-mama-ink">Verifying Payment</p>
        <p className="mt-2 text-sm text-mama-muted">{message}</p>
      </div>
    </div>
  );
}

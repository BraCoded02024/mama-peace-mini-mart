"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";

type PaystackPopHandler = {
  openIframe: () => void;
};

type PaystackPopStatic = {
  setup: (options: {
    key: string;
    email: string;
    amount: number;
    currency: string;
    ref: string;
    callback: (response: { reference: string }) => void;
    onClose: () => void;
  }) => PaystackPopHandler;
};

declare global {
  interface Window {
    PaystackPop?: PaystackPopStatic;
  }
}

type InitializeResponse = {
  authorization_url: string;
  reference: string;
  email: string;
  amountKobo: number;
  error?: string;
};

async function verifyPaymentOnServer(
  paystackReference: string,
  referenceNumber: string,
  phoneNumber: string
) {
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
  if (!res.ok) {
    throw new Error(data.error ?? "Payment could not be confirmed");
  }

  return data;
}

export function PayNowButton({
  referenceNumber,
  phoneNumber,
}: {
  referenceNumber: string;
  phoneNumber: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  useEffect(() => {
    if (!publicKey || window.PaystackPop) {
      setScriptReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [publicKey]);

  async function handlePay() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceNumber, phoneNumber }),
      });
      const data = (await res.json()) as InitializeResponse;

      if (!res.ok) {
        setError(data.error ?? "Payment could not be started");
        return;
      }

      const canUsePopup =
        publicKey && scriptReady && typeof window.PaystackPop?.setup === "function";

      if (canUsePopup) {
        const handler = window.PaystackPop!.setup({
          key: publicKey,
          email: data.email,
          amount: data.amountKobo,
          currency: "GHS",
          ref: data.reference,
          callback: async (response) => {
            try {
              await verifyPaymentOnServer(
                response.reference,
                referenceNumber,
                phoneNumber
              );
              router.replace(
                `/track/${encodeURIComponent(referenceNumber)}?phone=${encodeURIComponent(phoneNumber)}`
              );
              router.refresh();
            } catch (verifyError) {
              setError(
                verifyError instanceof Error
                  ? verifyError.message
                  : "Payment could not be confirmed"
              );
            } finally {
              setLoading(false);
            }
          },
          onClose: () => {
            setLoading(false);
          },
        });

        handler.openIframe();
        return;
      }

      window.location.href = data.authorization_url;
    } catch {
      setError("Payment could not be started. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-mama-green px-6 py-3 text-sm font-medium text-white hover:bg-mama-green/90 disabled:opacity-50"
      >
        <CreditCard className="h-4 w-4" />
        {loading ? "Opening Paystack..." : "Pay Now with Paystack"}
      </button>
      <p className="mt-2 text-center text-xs text-mama-muted">
        You&apos;ll enter your card or mobile money details securely on Paystack.
      </p>
    </div>
  );
}

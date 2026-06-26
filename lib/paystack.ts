const PAYSTACK_BASE = "https://api.paystack.co";

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }
  return key;
}

export async function initializePaystackPayment(params: {
  email: string;
  amountGhs: number;
  reference: string;
  metadata?: Record<string, string>;
}) {
  const amountKobo = Math.round(params.amountGhs * 100);

  const response = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: amountKobo,
      reference: params.reference,
      currency: "GHS",
      metadata: params.metadata,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/track/${params.metadata?.orderReference ?? ""}?phone=${encodeURIComponent(params.metadata?.phoneNumber ?? "")}`,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message ?? "Failed to initialize Paystack payment");
  }

  return data.data as {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${getSecretKey()}`,
      },
    }
  );

  const data = await response.json();
  if (!response.ok || !data.status) {
    throw new Error(data.message ?? "Failed to verify Paystack transaction");
  }

  return data.data as {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    metadata?: {
      orderId?: string;
      orderReference?: string;
    };
  };
}

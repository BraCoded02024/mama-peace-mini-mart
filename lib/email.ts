type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Mama Peace <noreply@mamapeace.com>";

  if (!apiKey) {
    console.log("[email:dev]", { to, subject, html });
    return { success: true, dev: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("[email:error]", error);
    return { success: false, error };
  }

  return { success: true };
}

export function orderSubmittedEmail(params: {
  customerName: string;
  referenceNumber: string;
  trackUrl: string;
}) {
  return {
    subject: `Order ${params.referenceNumber} received — Mama Peace`,
    html: `
      <p>Hi ${params.customerName},</p>
      <p>Your grocery request <strong>${params.referenceNumber}</strong> has been received and is pending review.</p>
      <p>Track your order: <a href="${params.trackUrl}">${params.trackUrl}</a></p>
      <p>— Mama Peace Mini Mart</p>
    `,
  };
}

export function orderAwaitingPaymentEmail(params: {
  customerName: string;
  referenceNumber: string;
  totalAmount: number;
  paymentUrl: string;
  adminMessage?: string | null;
}) {
  return {
    subject: `Your order ${params.referenceNumber} is ready for payment`,
    html: `
      <p>Hi ${params.customerName},</p>
      <p>Mama Peace has reviewed your order <strong>${params.referenceNumber}</strong>.</p>
      ${params.adminMessage ? `<p><em>${params.adminMessage}</em></p>` : ""}
      <p><strong>Total: GHS ${params.totalAmount.toFixed(2)}</strong> (minimum order GHS 100)</p>
      <p><a href="${params.paymentUrl}">Pay now with Paystack</a></p>
      <p>— Mama Peace Mini Mart</p>
    `,
  };
}

export function orderPaidEmail(params: {
  customerName: string;
  referenceNumber: string;
  verificationCode: string;
  trackUrl: string;
}) {
  return {
    subject: `Payment confirmed — ${params.referenceNumber}`,
    html: `
      <p>Hi ${params.customerName},</p>
      <p>Payment received for order <strong>${params.referenceNumber}</strong>.</p>
      <p>Verification code: <strong>${params.verificationCode}</strong></p>
      <p>Track delivery: <a href="${params.trackUrl}">${params.trackUrl}</a></p>
      <p>— Mama Peace Mini Mart</p>
    `,
  };
}

export function adminReplyEmail(params: {
  customerName: string;
  referenceNumber: string;
  message: string;
  trackUrl: string;
}) {
  return {
    subject: `Update on your order ${params.referenceNumber}`,
    html: `
      <p>Hi ${params.customerName},</p>
      <p>Mama Peace has an update regarding order <strong>${params.referenceNumber}</strong>:</p>
      <p>${params.message}</p>
      <p>Track your order: <a href="${params.trackUrl}">${params.trackUrl}</a></p>
      <p>— Mama Peace Mini Mart</p>
    `,
  };
}

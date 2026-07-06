import { MIN_ORDER_AMOUNT_GHS } from "@/lib/constants";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

function truncateText(text: string, maxLength = 280) {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendEmail({ to, subject, html }: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Mama Peace <orders@mamapeacemart.com>";

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

export async function sendAdminEmail(content: { subject: string; html: string }) {
  const to = process.env.ADMIN_EMAIL?.trim();
  if (!to) {
    console.log("[admin-email:dev]", content);
    return { success: true as const, skipped: true as const };
  }

  return sendEmail({ to, ...content });
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
      <p><strong>Total: GHS ${params.totalAmount.toFixed(2)}</strong> (minimum order GHS ${MIN_ORDER_AMOUNT_GHS})</p>
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

export function adminNewOrderEmail(params: {
  customerName: string;
  phoneNumber: string;
  referenceNumber: string;
  itemsRequested: string;
  adminUrl: string;
}) {
  const items = escapeHtml(truncateText(params.itemsRequested));
  return {
    subject: `New order ${params.referenceNumber} — review needed`,
    html: `
      <p><strong>New grocery request</strong></p>
      <p>
        <strong>Customer:</strong> ${escapeHtml(params.customerName)}<br />
        <strong>Phone:</strong> ${escapeHtml(params.phoneNumber)}<br />
        <strong>Reference:</strong> ${escapeHtml(params.referenceNumber)}
      </p>
      <p><strong>Items requested:</strong></p>
      <p style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;">${items}</p>
      <p><a href="${params.adminUrl}">Open in admin dashboard</a></p>
      <p>— Mama Peace Mini Mart</p>
    `,
  };
}

export function adminSupportMessageEmail(params: {
  name: string;
  phoneNumber: string;
  category: string;
  message: string;
  adminUrl: string;
}) {
  const categoryLabels: Record<string, string> = {
    ENQUIRY: "Enquiry",
    COMPLAINT: "Complaint",
    GENERAL: "General support",
  };
  const category =
    categoryLabels[params.category] ?? params.category.replaceAll("_", " ");
  const preview = escapeHtml(truncateText(params.message, 320));

  return {
    subject: `New ${category.toLowerCase()} from ${params.name}`,
    html: `
      <p><strong>New customer support message</strong></p>
      <p>
        <strong>Name:</strong> ${escapeHtml(params.name)}<br />
        <strong>Phone:</strong> ${escapeHtml(params.phoneNumber)}<br />
        <strong>Type:</strong> ${escapeHtml(category)}
      </p>
      <p><strong>Message:</strong></p>
      <p style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px;">${preview}</p>
      <p><a href="${params.adminUrl}">Open admin dashboard</a></p>
      <p>— Mama Peace Mini Mart</p>
    `,
  };
}

export function adminPaymentReceivedEmail(params: {
  customerName: string;
  phoneNumber: string;
  referenceNumber: string;
  totalAmount: number;
  adminUrl: string;
}) {
  return {
    subject: `Payment received — ${params.referenceNumber}`,
    html: `
      <p><strong>Customer payment confirmed</strong></p>
      <p>
        <strong>Customer:</strong> ${escapeHtml(params.customerName)}<br />
        <strong>Phone:</strong> ${escapeHtml(params.phoneNumber)}<br />
        <strong>Reference:</strong> ${escapeHtml(params.referenceNumber)}<br />
        <strong>Amount:</strong> GHS ${params.totalAmount.toFixed(2)}
      </p>
      <p>You can now prepare and update delivery status.</p>
      <p><a href="${params.adminUrl}">Open order in admin</a></p>
      <p>— Mama Peace Mini Mart</p>
    `,
  };
}

export function promotionEmail(params: {
  customerName: string;
  subject: string;
  message: string;
  shopUrl: string;
}) {
  const messageHtml = escapeHtml(params.message).replace(/\n/g, "<br />");

  return {
    subject: params.subject,
    html: `
      <p>Hi ${escapeHtml(params.customerName)},</p>
      <p>${messageHtml}</p>
      <p style="margin-top:24px;">
        <a href="${params.shopUrl}" style="display:inline-block;background:#2d6a4f;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;">
          Shop Now
        </a>
      </p>
      <p style="margin-top:24px;color:#666;font-size:14px;">
        Mama Peace Mini Mart · Fresh groceries delivered in Greater Accra
      </p>
    `,
  };
}

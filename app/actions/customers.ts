"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { getCustomerSummaries } from "@/lib/customers";
import { promotionEmail, sendEmail } from "@/lib/email";

function appUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return { authorized: false as const, error: "Unauthorized" };
  }
  return { authorized: true as const };
}

function validatePromotionContent(subject: string, message: string) {
  const trimmedSubject = subject.trim();
  const trimmedMessage = message.trim();

  if (!trimmedSubject) {
    return { valid: false as const, error: "Subject is required" };
  }
  if (trimmedSubject.length > 120) {
    return { valid: false as const, error: "Subject must be 120 characters or less" };
  }
  if (!trimmedMessage) {
    return { valid: false as const, error: "Message is required" };
  }
  if (trimmedMessage.length > 2000) {
    return { valid: false as const, error: "Message must be 2000 characters or less" };
  }

  return {
    valid: true as const,
    subject: trimmedSubject,
    message: trimmedMessage,
  };
}

export async function sendPromotionToCustomerAction(data: {
  phone: string;
  subject: string;
  message: string;
}) {
  const auth = await requireAdmin();
  if (!auth.authorized) return { success: false as const, error: auth.error };

  const content = validatePromotionContent(data.subject, data.message);
  if (!content.valid) return { success: false as const, error: content.error };

  const customers = await getCustomerSummaries();
  const customer = customers.find(
    (c) => c.phone.replace(/\D/g, "") === data.phone.replace(/\D/g, "")
  );

  if (!customer) {
    return { success: false as const, error: "Customer not found" };
  }
  if (!customer.email) {
    return {
      success: false as const,
      error: "This customer has no email on file. They cannot receive promotions by email.",
    };
  }

  const emailContent = promotionEmail({
    customerName: customer.name,
    subject: content.subject,
    message: content.message,
    shopUrl: appUrl("/home"),
  });

  const result = await sendEmail({
    to: customer.email,
    ...emailContent,
  });

  if (!result.success) {
    return { success: false as const, error: "Failed to send email" };
  }

  revalidatePath("/admin/customers");
  return { success: true as const, dev: "dev" in result && result.dev };
}

export async function sendPromotionToAllAction(data: {
  subject: string;
  message: string;
}) {
  const auth = await requireAdmin();
  if (!auth.authorized) return { success: false as const, error: auth.error };

  const content = validatePromotionContent(data.subject, data.message);
  if (!content.valid) return { success: false as const, error: content.error };

  const customers = await getCustomerSummaries();
  const withEmail = customers.filter((c) => c.email);

  if (withEmail.length === 0) {
    return {
      success: false as const,
      error: "No customers with email addresses on file.",
    };
  }

  let sent = 0;
  let failed = 0;

  for (const customer of withEmail) {
    const emailContent = promotionEmail({
      customerName: customer.name,
      subject: content.subject,
      message: content.message,
      shopUrl: appUrl("/home"),
    });

    const result = await sendEmail({
      to: customer.email!,
      ...emailContent,
    });

    if (result.success) sent += 1;
    else failed += 1;
  }

  const skipped = customers.length - withEmail.length;

  revalidatePath("/admin/customers");
  return {
    success: true as const,
    sent,
    failed,
    skipped,
    total: customers.length,
  };
}

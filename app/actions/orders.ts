"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { generateReferenceNumber, generateVerificationCode } from "@/lib/reference";
import {
  orderSubmittedEmail,
  orderAwaitingPaymentEmail,
  orderPaidEmail,
  adminReplyEmail,
  adminNewOrderEmail,
  adminSupportMessageEmail,
  adminPaymentReceivedEmail,
  sendEmail,
  sendAdminEmail,
} from "@/lib/email";
import { MIN_ORDER_AMOUNT_GHS } from "@/lib/constants";
import { initializePaystackPayment } from "@/lib/paystack";
import type { OrderStatus } from "@prisma/client";

function appUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}${path}`;
}

function normalizeCustomerEmail(email?: string | null) {
  const trimmed = email?.trim().toLowerCase();
  return trimmed || null;
}

function paystackEmailForOrder(phone: string, email?: string | null) {
  const normalized = normalizeCustomerEmail(email);
  if (normalized) return normalized;

  const digits = phone.replace(/\D/g, "");
  return `customer+${digits}@mamapeace.local`;
}

async function sendCustomerEmail(
  email: string | null | undefined,
  content: { subject: string; html: string }
) {
  const to = normalizeCustomerEmail(email);
  if (!to) return { success: true as const, skipped: true as const };

  return sendEmail({ to, ...content });
}

export async function createOrderAction(data: {
  customerName: string;
  phoneNumber: string;
  customerEmail?: string;
  gpsAddress: string;
  locationDescription?: string;
  itemsRequested: string;
  specialInstructions?: string;
}) {
  const referenceNumber = await generateReferenceNumber();

  const order = await prisma.order.create({
    data: {
      referenceNumber,
      customerName: data.customerName.trim(),
      phoneNumber: data.phoneNumber.trim(),
      customerEmail: normalizeCustomerEmail(data.customerEmail),
      gpsAddress: data.gpsAddress.trim(),
      locationDescription: data.locationDescription?.trim() || null,
      itemsRequested: data.itemsRequested.trim(),
      specialInstructions: data.specialInstructions?.trim() || null,
      status: "PENDING_REVIEW",
    },
  });

  const trackUrl = appUrl(`/track/${order.referenceNumber}`);
  const emailContent = orderSubmittedEmail({
    customerName: order.customerName,
    referenceNumber: order.referenceNumber,
    trackUrl,
  });

  await sendCustomerEmail(order.customerEmail, emailContent);

  await sendAdminEmail(
    adminNewOrderEmail({
      customerName: order.customerName,
      phoneNumber: order.phoneNumber,
      referenceNumber: order.referenceNumber,
      itemsRequested: order.itemsRequested,
      adminUrl: appUrl(`/admin/orders/${order.id}`),
    })
  );

  revalidatePath("/admin");
  return { referenceNumber: order.referenceNumber };
}

export async function approveOrderAction(data: {
  orderId: string;
  subtotal: number;
  deliveryFee: number;
  serviceFee?: number;
  adminMessage?: string;
  lineItems?: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
  }>;
}) {
  const serviceFee = data.serviceFee ?? 0;
  const totalAmount = data.subtotal + data.deliveryFee + serviceFee;

  if (totalAmount < MIN_ORDER_AMOUNT_GHS) {
    return {
      success: false as const,
      error: `Minimum order is GHS ${MIN_ORDER_AMOUNT_GHS}. Current total is GHS ${totalAmount.toFixed(2)}.`,
    };
  }

  const order = await prisma.order.update({
    where: { id: data.orderId },
    data: {
      subtotal: data.subtotal,
      deliveryFee: data.deliveryFee,
      serviceFee,
      totalAmount,
      adminMessage: data.adminMessage?.trim() || null,
      status: "AWAITING_PAYMENT",
      items: data.lineItems?.length
        ? {
            deleteMany: {},
            create: data.lineItems.map((item) => ({
              itemName: item.itemName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.quantity * item.unitPrice,
            })),
          }
        : undefined,
    },
  });

  const trackUrl = appUrl(`/track/${order.referenceNumber}`);
  let paymentUrl = trackUrl;
  try {
    const paymentInit = await initializePaystackPayment({
      email: paystackEmailForOrder(order.phoneNumber, order.customerEmail),
      amountGhs: totalAmount,
      reference: `MP-${order.referenceNumber}-${Date.now()}`,
      metadata: {
        orderId: order.id,
        orderReference: order.referenceNumber,
        phoneNumber: order.phoneNumber,
      },
    });
    paymentUrl = paymentInit.authorization_url;
  } catch (error) {
    console.warn("[approveOrder] Paystack unavailable, using track page URL", error);
  }

  const emailContent = orderAwaitingPaymentEmail({
    customerName: order.customerName,
    referenceNumber: order.referenceNumber,
    totalAmount,
    paymentUrl,
    adminMessage: order.adminMessage,
  });

  await sendCustomerEmail(order.customerEmail, emailContent);

  revalidatePath("/admin");
  revalidatePath(`/track/${order.referenceNumber}`);

  return { success: true as const, paymentUrl };
}

export async function replyToOrderAction(data: {
  orderId: string;
  message: string;
}) {
  return sendOrderMessageAction(data);
}

export async function sendOrderMessageAction(data: {
  orderId: string;
  message: string;
}) {
  const message = data.message.trim();
  if (!message) {
    return { success: false as const, error: "Message cannot be empty" };
  }

  const order = await prisma.order.update({
    where: { id: data.orderId },
    data: {
      adminMessage: message,
    },
  });

  const trackUrl = appUrl(`/track/${order.referenceNumber}?phone=${encodeURIComponent(order.phoneNumber)}`);
  const emailContent = adminReplyEmail({
    customerName: order.customerName,
    referenceNumber: order.referenceNumber,
    message,
    trackUrl,
  });

  const emailResult = await sendCustomerEmail(order.customerEmail, emailContent);

  revalidatePath("/admin");
  revalidatePath(`/track/${order.referenceNumber}`);

  return {
    success: true as const,
    emailed: !("skipped" in emailResult && emailResult.skipped),
  };
}

export async function updateOrderStatusAction(data: {
  orderId: string;
  status: OrderStatus;
}) {
  await prisma.order.update({
    where: { id: data.orderId },
    data: { status: data.status },
  });

  revalidatePath("/admin");
  return { success: true as const };
}

export async function cancelOrderAction(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/admin");
  return { success: true as const };
}

export async function markOrderPaidAction(orderId: string, transactionReference: string) {
  const existing = await prisma.order.findUnique({ where: { id: orderId } });

  if (!existing) {
    return { success: false as const, error: "Order not found" };
  }

  if (existing.status === "PAID") {
    return {
      success: true as const,
      alreadyPaid: true as const,
      verificationCode: existing.verificationCode,
    };
  }

  if (existing.status !== "AWAITING_PAYMENT") {
    return { success: false as const, error: "Order is not awaiting payment" };
  }

  const verificationCode = generateVerificationCode();

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PAID",
      transactionReference,
      verificationCode,
    },
  });

  const trackUrl = appUrl(`/track/${order.referenceNumber}`);
  const emailContent = orderPaidEmail({
    customerName: order.customerName,
    referenceNumber: order.referenceNumber,
    verificationCode,
    trackUrl,
  });

  await sendCustomerEmail(order.customerEmail, emailContent);

  await sendAdminEmail(
    adminPaymentReceivedEmail({
      customerName: order.customerName,
      phoneNumber: order.phoneNumber,
      referenceNumber: order.referenceNumber,
      totalAmount: order.totalAmount ?? 0,
      adminUrl: appUrl(`/admin/orders/${order.id}`),
    })
  );

  revalidatePath("/admin");
  revalidatePath(`/track/${order.referenceNumber}`);

  return { success: true as const, verificationCode };
}

export async function createComplaintAction(data: {
  name: string;
  phoneNumber: string;
  category: string;
  message: string;
}) {
  const complaint = await prisma.complaint.create({
    data: {
      name: data.name.trim(),
      phoneNumber: data.phoneNumber.trim(),
      category: data.category,
      message: data.message.trim(),
    },
  });

  await sendAdminEmail(
    adminSupportMessageEmail({
      name: complaint.name,
      phoneNumber: complaint.phoneNumber,
      category: complaint.category,
      message: complaint.message,
      adminUrl: appUrl("/admin"),
    })
  );

  revalidatePath("/admin");
  return { success: true as const };
}

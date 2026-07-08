"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { getAdminSession } from "@/lib/auth";
import { getRiderSession } from "@/lib/rider-auth";
import { isValidPin } from "@/lib/pin";
import { sanitizePhoneInput, isValidPhoneNumber } from "@/lib/phone";
import {
  notifyAdminActivity,
  orderAwaitingPaymentEmail,
  sendEmail,
} from "@/lib/email";
import { appUrl } from "@/lib/app-url";
import { MIN_ORDER_AMOUNT_GHS } from "@/lib/constants";
import type { OrderPaymentMethod } from "@/lib/payment-config";
import {
  isRiderPoolStatus,
  statusAfterRiderUnassign,
} from "@/lib/order-rider-flow";
import { markOrderPaidAction } from "@/app/actions/orders";
import type { OrderStatus, RiderStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    return { authorized: false as const, error: "Unauthorized" };
  }
  return { authorized: true as const, session };
}

async function requireRider() {
  const session = await getRiderSession();
  if (!session) {
    return { authorized: false as const, error: "Unauthorized" };
  }
  return { authorized: true as const, session };
}

export async function createRiderAction(data: {
  name: string;
  phone: string;
  pin: string;
  area: string;
  motorbikeNumber?: string;
  status: RiderStatus;
}) {
  const auth = await requireAdmin();
  if (!auth.authorized) return { success: false as const, error: auth.error };

  const name = data.name.trim();
  const phone = sanitizePhoneInput(data.phone);
  const area = data.area.trim();
  const motorbikeNumber = data.motorbikeNumber?.trim() || null;

  if (!name) return { success: false as const, error: "Name is required" };
  if (!isValidPhoneNumber(phone)) {
    return { success: false as const, error: "Phone number must be 10 digits" };
  }
  if (!isValidPin(data.pin)) {
    return { success: false as const, error: "PIN must be exactly 4 digits" };
  }
  if (!area) return { success: false as const, error: "Area is required" };

  const existing = await prisma.rider.findUnique({ where: { phone } });
  if (existing) {
    return { success: false as const, error: "A rider with this phone number already exists" };
  }

  const pinHash = await hashPassword(data.pin);

  await prisma.rider.create({
    data: {
      name,
      phone,
      pinHash,
      area,
      motorbikeNumber,
      status: data.status,
    },
  });

  revalidatePath("/admin/riders");
  return { success: true as const };
}

export async function updateRiderAction(data: {
  riderId: string;
  name: string;
  phone: string;
  area: string;
  motorbikeNumber?: string;
  status: RiderStatus;
}) {
  const auth = await requireAdmin();
  if (!auth.authorized) return { success: false as const, error: auth.error };

  const name = data.name.trim();
  const phone = sanitizePhoneInput(data.phone);
  const area = data.area.trim();
  const motorbikeNumber = data.motorbikeNumber?.trim() || null;

  if (!name) return { success: false as const, error: "Name is required" };
  if (!isValidPhoneNumber(phone)) {
    return { success: false as const, error: "Phone number must be 10 digits" };
  }
  if (!area) return { success: false as const, error: "Area is required" };

  const existing = await prisma.rider.findFirst({
    where: { phone, NOT: { id: data.riderId } },
  });
  if (existing) {
    return { success: false as const, error: "A rider with this phone number already exists" };
  }

  await prisma.rider.update({
    where: { id: data.riderId },
    data: { name, phone, area, motorbikeNumber, status: data.status },
  });

  revalidatePath("/admin/riders");
  revalidatePath(`/admin/riders/${data.riderId}/edit`);
  return { success: true as const };
}

export async function setRiderStatusAction(riderId: string, status: RiderStatus) {
  const auth = await requireAdmin();
  if (!auth.authorized) return { success: false as const, error: auth.error };

  await prisma.rider.update({
    where: { id: riderId },
    data: { status },
  });

  revalidatePath("/admin/riders");
  return { success: true as const };
}

export async function resetRiderPinAction(riderId: string, pin: string) {
  const auth = await requireAdmin();
  if (!auth.authorized) return { success: false as const, error: auth.error };

  if (!isValidPin(pin)) {
    return { success: false as const, error: "PIN must be exactly 4 digits" };
  }

  const pinHash = await hashPassword(pin);

  await prisma.rider.update({
    where: { id: riderId },
    data: { pinHash },
  });

  revalidatePath("/admin/riders");
  revalidatePath(`/admin/riders/${riderId}/edit`);
  return { success: true as const };
}

const TERMINAL_ORDER_STATUSES: OrderStatus[] = ["DELIVERED", "CANCELLED"];

export async function assignRiderToOrderAction(data: {
  orderId: string;
  riderId: string;
}) {
  const auth = await requireAdmin();
  if (!auth.authorized) return { success: false as const, error: auth.error };

  const [order, rider] = await Promise.all([
    prisma.order.findUnique({ where: { id: data.orderId } }),
    prisma.rider.findUnique({ where: { id: data.riderId } }),
  ]);

  if (!order) return { success: false as const, error: "Order not found" };
  if (!rider) return { success: false as const, error: "Rider not found" };
  if (rider.status !== "ACTIVE") {
    return { success: false as const, error: "Rider is not active" };
  }
  if (TERMINAL_ORDER_STATUSES.includes(order.status)) {
    return {
      success: false as const,
      error: "Cannot assign a rider to a completed or cancelled order",
    };
  }

  const statusUpdate =
    order.status === "READY_FOR_PICKUP" || order.status === "PENDING_REVIEW"
      ? { status: "RIDER_ASSIGNED" as const }
      : {};

  const updated = await prisma.order.update({
    where: { id: data.orderId },
    data: {
      assignedRiderId: data.riderId,
      assignedAt: new Date(),
      ...statusUpdate,
    },
  });

  await notifyAdminActivity({
    event: "rider_assigned",
    referenceNumber: updated.referenceNumber,
    orderId: updated.id,
    details: {
      Customer: updated.customerName,
      Rider: rider.name,
      "Rider phone": rider.phone,
      Status: updated.status.replaceAll("_", " "),
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${data.orderId}`);
  revalidatePath("/riders");
  revalidatePath(`/track/${updated.referenceNumber}`);
  return { success: true as const };
}

export async function unassignRiderAction(orderId: string) {
  const auth = await requireAdmin();
  if (!auth.authorized) return { success: false as const, error: auth.error };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { assignedRider: true },
  });
  if (!order) return { success: false as const, error: "Order not found" };
  if (!order.assignedRiderId) {
    return { success: false as const, error: "No rider is assigned" };
  }
  if (order.status === "OUT_FOR_DELIVERY") {
    return {
      success: false as const,
      error: "Cannot unassign while order is out for delivery",
    };
  }

  const statusUpdate = statusAfterRiderUnassign(order);

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      assignedRiderId: null,
      assignedAt: null,
      ...statusUpdate,
    },
  });

  await notifyAdminActivity({
    event: "rider_unassigned",
    referenceNumber: updated.referenceNumber,
    orderId: updated.id,
    details: {
      Customer: updated.customerName,
      "Previous rider": order.assignedRider?.name ?? "Unknown",
      Status: updated.status.replaceAll("_", " "),
    },
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/riders");
  revalidatePath(`/track/${updated.referenceNumber}`);
  return { success: true as const };
}

export async function acceptOrderAction(orderId: string) {
  const auth = await requireRider();
  if (!auth.authorized) return { success: false as const, error: auth.error };

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || !isRiderPoolStatus(order.status)) {
      return {
        success: false as const,
        error: "This order is no longer available.",
      };
    }

    if (order.assignedRiderId && order.assignedRiderId !== auth.session.id) {
      return {
        success: false as const,
        error: "This order is assigned to another rider.",
      };
    }

    const updated = await tx.order.updateMany({
      where: {
        id: orderId,
        status: { in: ["PENDING_REVIEW", "READY_FOR_PICKUP"] },
        OR: [
          { assignedRiderId: null },
          { assignedRiderId: auth.session.id },
        ],
      },
      data: {
        status: "RIDER_ASSIGNED",
        assignedRiderId: auth.session.id,
        assignedAt: order.assignedAt ?? new Date(),
      },
    });

    if (updated.count === 0) {
      return {
        success: false as const,
        error: "This order has already been assigned.",
      };
    }

    return { success: true as const, referenceNumber: order.referenceNumber };
  });

  if (result.success) {
    const rider = await prisma.rider.findUnique({
      where: { id: auth.session.id },
      select: { name: true, phone: true },
    });
    await notifyAdminActivity({
      event: "rider_assigned",
      referenceNumber: result.referenceNumber,
      orderId,
      details: {
        Rider: rider?.name ?? "Unknown",
        "Rider phone": rider?.phone ?? "",
        Source: "Rider self-accepted",
      },
    });
  }

  revalidatePath("/riders");
  revalidatePath("/admin");
  return result;
}

export async function riderUpdateOrderStatusAction(
  orderId: string,
  status: "OUT_FOR_DELIVERY" | "DELIVERED"
) {
  const auth = await requireRider();
  if (!auth.authorized) return { success: false as const, error: auth.error };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.assignedRiderId !== auth.session.id) {
    return { success: false as const, error: "Order not found" };
  }

  if (status === "OUT_FOR_DELIVERY") {
    const canDispatch =
      order.status === "PAYMENT_CONFIRMED" ||
      (order.status === "RIDER_ASSIGNED" && order.totalAmount != null);
    if (!canDispatch) {
      return {
        success: false as const,
        error: "Payment must be confirmed before dispatch",
      };
    }
  } else if (status === "DELIVERED" && order.status !== "OUT_FOR_DELIVERY") {
    return { success: false as const, error: "Order cannot be marked as delivered" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  const event = status === "OUT_FOR_DELIVERY" ? "out_for_delivery" : "delivered";
  const rider = await prisma.rider.findUnique({
    where: { id: auth.session.id },
    select: { name: true },
  });

  await notifyAdminActivity({
    event,
    referenceNumber: order.referenceNumber,
    orderId: order.id,
    details: {
      Customer: order.customerName,
      Rider: rider?.name ?? "Unknown",
      Status: status.replaceAll("_", " "),
    },
  });

  revalidatePath("/riders");
  revalidatePath("/admin");
  revalidatePath(`/track/${order.referenceNumber}`);
  return { success: true as const };
}

function normalizeCustomerEmail(email?: string | null) {
  const trimmed = email?.trim().toLowerCase();
  return trimmed || null;
}

export async function riderSubmitOrderPriceAction(data: {
  orderId: string;
  subtotal: number;
  deliveryFee: number;
  serviceFee?: number;
  note?: string;
  paymentMethod?: OrderPaymentMethod;
}) {
  const auth = await requireRider();
  if (!auth.authorized) return { success: false as const, error: auth.error };

  const serviceFee = data.serviceFee ?? 0;
  const totalAmount = data.subtotal + data.deliveryFee + serviceFee;
  const paymentMethod = data.paymentMethod ?? "MTN_MOMO";

  if (totalAmount < MIN_ORDER_AMOUNT_GHS) {
    return {
      success: false as const,
      error: `Minimum order is GHS ${MIN_ORDER_AMOUNT_GHS}. Current total is GHS ${totalAmount.toFixed(2)}.`,
    };
  }

  const order = await prisma.order.findUnique({ where: { id: data.orderId } });
  if (!order || order.assignedRiderId !== auth.session.id) {
    return { success: false as const, error: "Order not found" };
  }
  if (order.status !== "RIDER_ASSIGNED") {
    return {
      success: false as const,
      error: "Order is not ready for pricing at the shop",
    };
  }

  const updated = await prisma.order.update({
    where: { id: data.orderId },
    data: {
      subtotal: data.subtotal,
      deliveryFee: data.deliveryFee,
      serviceFee,
      totalAmount,
      paymentMethod,
      adminMessage: data.note?.trim() || null,
      status: "AWAITING_PAYMENT",
    },
  });

  const trackUrl = appUrl(
    `/track/${updated.referenceNumber}?phone=${encodeURIComponent(updated.phoneNumber)}`
  );

  const emailContent = orderAwaitingPaymentEmail({
    customerName: updated.customerName,
    referenceNumber: updated.referenceNumber,
    totalAmount,
    paymentUrl: trackUrl,
    paymentMethod,
    adminMessage: updated.adminMessage,
  });

  const customerEmail = normalizeCustomerEmail(updated.customerEmail);
  if (customerEmail) {
    await sendEmail({ to: customerEmail, ...emailContent });
  }

  const rider = await prisma.rider.findUnique({
    where: { id: auth.session.id },
    select: { name: true },
  });

  await notifyAdminActivity({
    event: "order_approved",
    referenceNumber: updated.referenceNumber,
    orderId: updated.id,
    details: {
      Customer: updated.customerName,
      Phone: updated.phoneNumber,
      Total: `GHS ${totalAmount.toFixed(2)}`,
      Rider: rider?.name ?? "Unknown",
      Source: "Shop pricing by rider",
      "Payment method":
        paymentMethod === "MTN_MOMO" ? "MTN MoMo (CODETECHS)" : "Paystack",
    },
  });

  revalidatePath("/riders");
  revalidatePath("/admin");
  revalidatePath(`/track/${updated.referenceNumber}`);
  return { success: true as const };
}

export async function riderConfirmPaymentAction(orderId: string) {
  const auth = await requireRider();
  if (!auth.authorized) return { success: false as const, error: auth.error };

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.assignedRiderId !== auth.session.id) {
    return { success: false as const, error: "Order not found" };
  }
  if (order.status !== "AWAITING_PAYMENT") {
    return {
      success: false as const,
      error: "Order is not awaiting payment",
    };
  }

  return markOrderPaidAction(
    orderId,
    `MOMO-${order.referenceNumber}-${Date.now()}`
  );
}

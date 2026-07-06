"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { getAdminSession } from "@/lib/auth";
import { getRiderSession } from "@/lib/rider-auth";
import { isValidPin } from "@/lib/pin";
import { sanitizePhoneInput, isValidPhoneNumber } from "@/lib/phone";
import type { RiderStatus } from "@prisma/client";

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

export async function acceptOrderAction(orderId: string) {
  const auth = await requireRider();
  if (!auth.authorized) return { success: false as const, error: auth.error };

  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== "READY_FOR_PICKUP") {
      return {
        success: false as const,
        error: "This order has already been assigned.",
      };
    }

    const updated = await tx.order.updateMany({
      where: { id: orderId, status: "READY_FOR_PICKUP" },
      data: {
        status: "RIDER_ASSIGNED",
        assignedRiderId: auth.session.id,
        assignedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      return {
        success: false as const,
        error: "This order has already been assigned.",
      };
    }

    return { success: true as const };
  });

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

  if (status === "OUT_FOR_DELIVERY" && order.status !== "RIDER_ASSIGNED") {
    return { success: false as const, error: "Order cannot be marked as picked up" };
  }

  if (status === "DELIVERED" && order.status !== "OUT_FOR_DELIVERY") {
    return { success: false as const, error: "Order cannot be marked as delivered" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  revalidatePath("/riders");
  revalidatePath("/admin");
  revalidatePath(`/track/${order.referenceNumber}`);
  return { success: true as const };
}

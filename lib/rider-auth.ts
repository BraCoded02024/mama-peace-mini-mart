import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isValidPin } from "@/lib/pin";
import { sanitizePhoneInput, isValidPhoneNumber } from "@/lib/phone";

const COOKIE_NAME = "mama_peace_rider";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SECRET is not configured");
  }
  return secret;
}

function signPayload(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function createSessionToken(riderId: string) {
  const payload = `${riderId}.${Date.now()}`;
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

function verifySessionToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [riderId, timestamp, signature] = parts;
  const payload = `${riderId}.${timestamp}`;
  const expected = signPayload(payload);

  try {
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    if (
      sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }
  } catch {
    return null;
  }

  const age = Date.now() - Number(timestamp);
  if (Number.isNaN(age) || age > SESSION_MAX_AGE * 1000) {
    return null;
  }

  return riderId;
}

export async function loginRider(phone: string, pin: string) {
  const sanitizedPhone = sanitizePhoneInput(phone);
  if (!isValidPhoneNumber(sanitizedPhone)) {
    return { success: false as const, error: "Invalid phone number" };
  }
  if (!isValidPin(pin)) {
    return { success: false as const, error: "PIN must be exactly 4 digits" };
  }

  const rider = await prisma.rider.findUnique({
    where: { phone: sanitizedPhone },
  });

  if (!rider || rider.status !== "ACTIVE") {
    return { success: false as const, error: "Invalid credentials" };
  }

  const valid = await bcrypt.compare(pin, rider.pinHash);
  if (!valid) {
    return { success: false as const, error: "Invalid credentials" };
  }

  const token = createSessionToken(rider.id);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return { success: true as const };
}

export async function logoutRider() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getRiderSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const riderId = verifySessionToken(token);
  if (!riderId) return null;

  const rider = await prisma.rider.findUnique({
    where: { id: riderId },
    select: {
      id: true,
      name: true,
      phone: true,
      area: true,
      motorbikeNumber: true,
      status: true,
    },
  });

  if (!rider || rider.status !== "ACTIVE") return null;

  return rider;
}

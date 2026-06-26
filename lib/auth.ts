import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "mama_peace_admin";
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

function createSessionToken(adminId: string) {
  const payload = `${adminId}.${Date.now()}`;
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

function verifySessionToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [adminId, timestamp, signature] = parts;
  const payload = `${adminId}.${timestamp}`;
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

  return adminId;
}

export async function loginAdmin(username: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return { success: false as const, error: "Invalid credentials" };

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) return { success: false as const, error: "Invalid credentials" };

  const token = createSessionToken(admin.id);
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

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const adminId = verifySessionToken(token);
  if (!adminId) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, username: true },
  });

  return admin;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

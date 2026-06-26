import { prisma } from "@/lib/prisma";

export async function generateReferenceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `MP-${year}-`;

  for (let attempt = 0; attempt < 10; attempt++) {
    const suffix = String(Math.floor(1000 + Math.random() * 9000));
    const referenceNumber = `${prefix}${suffix}`;

    const existing = await prisma.order.findUnique({
      where: { referenceNumber },
      select: { id: true },
    });

    if (!existing) {
      return referenceNumber;
    }
  }

  throw new Error("Failed to generate unique reference number");
}

export function generateVerificationCode(): string {
  return `MP${Math.floor(1000 + Math.random() * 9000)}`;
}

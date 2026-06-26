import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function normalizePhoneDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function looksLikeReference(value: string) {
  return /^MP[-\w]*\d/i.test(value.trim());
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phoneNumber = searchParams.get("phoneNumber")?.trim();
  const lookup = (
    searchParams.get("lookup") ??
    searchParams.get("referenceNumber") ??
    ""
  ).trim();
  const phoneDigits = normalizePhoneDigits(phoneNumber ?? "");

  if (!phoneNumber || !lookup) {
    return NextResponse.json(
      { error: "phoneNumber and lookup are required" },
      { status: 400 }
    );
  }

  if (looksLikeReference(lookup)) {
    const order = await prisma.order.findUnique({
      where: {
        referenceNumber: lookup,
      },
      include: {
        items: true,
      },
    });

    if (!order || normalizePhoneDigits(order.phoneNumber) !== phoneDigits) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ mode: "single", order });
  }

  const nameTokens = normalizeName(lookup).split(" ").filter(Boolean);
  if (nameTokens.length === 0) {
    return NextResponse.json({ error: "Enter a reference or name" }, { status: 400 });
  }

  const ordersForPhone = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      referenceNumber: true,
      customerName: true,
      phoneNumber: true,
      status: true,
      totalAmount: true,
      createdAt: true,
    },
  });

  const orders = ordersForPhone.filter((order) => {
    const customerName = normalizeName(order.customerName);
    return (
      normalizePhoneDigits(order.phoneNumber) === phoneDigits &&
      nameTokens.every((token) => customerName.includes(token))
    );
  });

  if (orders.length === 0) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (orders.length === 1) {
    const order = await prisma.order.findUnique({
      where: { id: orders[0].id },
      include: { items: true },
    });

    return NextResponse.json({ mode: "single", order });
  }

  return NextResponse.json({ mode: "matches", orders });
}

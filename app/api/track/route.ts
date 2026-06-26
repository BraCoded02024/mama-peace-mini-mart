import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phoneNumber = searchParams.get("phoneNumber")?.trim();
  const referenceNumber = searchParams.get("referenceNumber")?.trim();

  if (!phoneNumber || !referenceNumber) {
    return NextResponse.json(
      { error: "phoneNumber and referenceNumber are required" },
      { status: 400 }
    );
  }

  const order = await prisma.order.findFirst({
    where: {
      referenceNumber,
      phoneNumber,
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

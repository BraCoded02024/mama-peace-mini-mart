import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { initializePaystackPayment } from "@/lib/paystack";
import { MIN_ORDER_AMOUNT_GHS } from "@/lib/constants";

function paystackEmailForOrder(phone: string, email?: string | null) {
  const normalized = email?.trim().toLowerCase();
  if (normalized) return normalized;

  const digits = phone.replace(/\D/g, "");
  return `customer+${digits}@mamapeace.local`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const referenceNumber = String(body.referenceNumber ?? "").trim();
    const phoneNumber = String(body.phoneNumber ?? "").trim();

    const order = await prisma.order.findFirst({
      where: { referenceNumber, phoneNumber },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "AWAITING_PAYMENT") {
      return NextResponse.json(
        { error: "Order is not awaiting payment" },
        { status: 400 }
      );
    }

    if (!order.totalAmount || order.totalAmount < MIN_ORDER_AMOUNT_GHS) {
      return NextResponse.json(
        { error: `Minimum order amount is GHS ${MIN_ORDER_AMOUNT_GHS}` },
        { status: 400 }
      );
    }

    const paystackEmail = paystackEmailForOrder(
      order.phoneNumber,
      order.customerEmail
    );

    const payment = await initializePaystackPayment({
      email: paystackEmail,
      amountGhs: order.totalAmount,
      reference: `MP-${order.referenceNumber}-${Date.now()}`,
      metadata: {
        orderId: order.id,
        orderReference: order.referenceNumber,
        phoneNumber: order.phoneNumber,
      },
    });

    return NextResponse.json({
      authorization_url: payment.authorization_url,
      reference: payment.reference,
      email: paystackEmail,
      amountKobo: Math.round(order.totalAmount * 100),
    });
  } catch (error) {
    console.error("[api/paystack/initialize]", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}

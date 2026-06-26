import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { markOrderPaidAction } from "@/app/actions/orders";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const paystackReference = String(body.reference ?? "").trim();
    const referenceNumber = String(body.referenceNumber ?? "").trim();
    const phoneNumber = String(body.phoneNumber ?? "").trim();

    if (!paystackReference || !referenceNumber || !phoneNumber) {
      return NextResponse.json(
        { error: "Missing payment verification details" },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: { referenceNumber, phoneNumber },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "PAID") {
      return NextResponse.json({
        success: true,
        alreadyPaid: true,
        verificationCode: order.verificationCode,
      });
    }

    const transaction = await verifyPaystackTransaction(paystackReference);

    if (transaction.status !== "success") {
      return NextResponse.json(
        { error: "Payment was not completed successfully" },
        { status: 400 }
      );
    }

    if (transaction.metadata?.orderId && transaction.metadata.orderId !== order.id) {
      return NextResponse.json(
        { error: "Payment does not match this order" },
        { status: 400 }
      );
    }

    if (transaction.metadata?.orderReference && transaction.metadata.orderReference !== order.referenceNumber) {
      return NextResponse.json(
        { error: "Payment does not match this order" },
        { status: 400 }
      );
    }

    if (!order.totalAmount) {
      return NextResponse.json(
        { error: "Order total is not set" },
        { status: 400 }
      );
    }

    const expectedAmount = Math.round(order.totalAmount * 100);
    if (transaction.amount !== expectedAmount) {
      return NextResponse.json(
        { error: "Payment amount does not match order total" },
        { status: 400 }
      );
    }

    const result = await markOrderPaidAction(order.id, transaction.reference);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Could not update order" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verificationCode: result.verificationCode,
      alreadyPaid: result.alreadyPaid ?? false,
    });
  } catch (error) {
    console.error("[api/paystack/verify]", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}

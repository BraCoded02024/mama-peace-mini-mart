import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { markOrderPaidAction } from "@/app/actions/orders";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reference = body?.data?.reference as string | undefined;

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const transaction = await verifyPaystackTransaction(reference);

    if (transaction.status !== "success") {
      return NextResponse.json({ received: true });
    }

    const orderId =
      (transaction.metadata?.orderId as string | undefined) ??
      (body?.data?.metadata?.orderId as string | undefined);

    if (!orderId) {
      return NextResponse.json({ error: "Missing order metadata" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (order?.totalAmount) {
      const expectedAmount = Math.round(order.totalAmount * 100);
      if (transaction.amount !== expectedAmount) {
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }
    }

    await markOrderPaidAction(orderId, transaction.reference);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[api/paystack/webhook]", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}

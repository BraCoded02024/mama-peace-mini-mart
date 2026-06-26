import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReferenceNumber } from "@/lib/reference";
import { orderSubmittedEmail, sendEmail } from "@/lib/email";

function emailFromPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return `customer+${digits}@mamapeace.local`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const referenceNumber = await generateReferenceNumber();
    const order = await prisma.order.create({
      data: {
        referenceNumber,
        customerName: String(body.customerName ?? "").trim(),
        phoneNumber: String(body.phoneNumber ?? "").trim(),
        gpsAddress: String(body.gpsAddress ?? "").trim(),
        locationDescription: body.locationDescription?.trim() || null,
        itemsRequested: String(body.itemsRequested ?? "").trim(),
        specialInstructions: body.specialInstructions?.trim() || null,
        status: "PENDING_REVIEW",
      },
    });

    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const trackUrl = `${base}/track/${order.referenceNumber}`;
    const emailContent = orderSubmittedEmail({
      customerName: order.customerName,
      referenceNumber: order.referenceNumber,
      trackUrl,
    });

    await sendEmail({
      to: emailFromPhone(order.phoneNumber),
      ...emailContent,
    });

    return NextResponse.json({
      referenceNumber: order.referenceNumber,
      status: order.status,
    });
  } catch (error) {
    console.error("[api/orders]", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

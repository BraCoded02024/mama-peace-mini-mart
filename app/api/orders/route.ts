import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReferenceNumber } from "@/lib/reference";
import { orderSubmittedEmail, sendAdminNewOrderNotification, sendEmail } from "@/lib/email";

function normalizeCustomerEmail(email?: string | null) {
  const trimmed = email?.trim().toLowerCase();
  return trimmed || null;
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
        customerEmail: normalizeCustomerEmail(String(body.customerEmail ?? "")),
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

    if (order.customerEmail) {
      await sendEmail({
        to: order.customerEmail,
        ...emailContent,
      });
    }

    await sendAdminNewOrderNotification({
      customerName: order.customerName,
      phoneNumber: order.phoneNumber,
      customerEmail: order.customerEmail,
      referenceNumber: order.referenceNumber,
      itemsRequested: order.itemsRequested,
      gpsAddress: order.gpsAddress,
      specialInstructions: order.specialInstructions,
      adminUrl: `${base}/admin/orders/${order.id}`,
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

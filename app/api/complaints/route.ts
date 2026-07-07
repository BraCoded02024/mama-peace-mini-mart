import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { adminSupportMessageEmail, sendAdminEmail } from "@/lib/email";
import { appUrl } from "@/lib/app-url";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const complaint = await prisma.complaint.create({
      data: {
        name: String(body.name ?? "").trim(),
        phoneNumber: String(body.phoneNumber ?? "").trim(),
        category: String(body.category ?? "GENERAL"),
        message: String(body.message ?? "").trim(),
      },
    });

    await sendAdminEmail(
      adminSupportMessageEmail({
        name: complaint.name,
        phoneNumber: complaint.phoneNumber,
        category: complaint.category,
        message: complaint.message,
        adminUrl: appUrl("/admin"),
      })
    );

    revalidatePath("/admin");

    return NextResponse.json({ id: complaint.id, status: complaint.status });
  } catch (error) {
    console.error("[api/complaints]", error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}

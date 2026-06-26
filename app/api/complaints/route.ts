import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json({ id: complaint.id, status: complaint.status });
  } catch (error) {
    console.error("[api/complaints]", error);
    return NextResponse.json(
      { error: "Failed to submit request" },
      { status: 500 }
    );
  }
}

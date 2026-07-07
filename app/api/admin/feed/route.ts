import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sinceParam = searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : new Date(0);

  if (Number.isNaN(since.getTime())) {
    return NextResponse.json({ error: "Invalid since parameter" }, { status: 400 });
  }

  const [orders, complaints] = await Promise.all([
    prisma.order.findMany({
      where: { updatedAt: { gt: since } },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        referenceNumber: true,
        customerName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.complaint.findMany({
      where: { createdAt: { gt: since } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        name: true,
        category: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    orders,
    complaints,
    serverTime: new Date().toISOString(),
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRiderSession } from "@/lib/rider-auth";
import {
  RIDER_ACTIVE_STATUSES,
  RIDER_POOL_STATUSES,
} from "@/lib/order-rider-flow";

export async function GET(request: Request) {
  const session = await getRiderSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sinceParam = searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : new Date(0);

  if (Number.isNaN(since.getTime())) {
    return NextResponse.json({ error: "Invalid since parameter" }, { status: 400 });
  }

  const [assignedOrders, availableOrders, currentDelivery] = await Promise.all([
    prisma.order.findMany({
      where: {
        assignedRiderId: session.id,
        status: { in: RIDER_ACTIVE_STATUSES },
        updatedAt: { gt: since },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        referenceNumber: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.order.findMany({
      where: {
        status: { in: RIDER_POOL_STATUSES },
        assignedRiderId: null,
        updatedAt: { gt: since },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        referenceNumber: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.order.findFirst({
      where: {
        assignedRiderId: session.id,
        status: { in: RIDER_ACTIVE_STATUSES },
        updatedAt: { gt: since },
      },
      select: {
        id: true,
        referenceNumber: true,
        status: true,
        updatedAt: true,
      },
    }),
  ]);

  const changedOrders = [
    ...assignedOrders,
    ...availableOrders,
    ...(currentDelivery ? [currentDelivery] : []),
  ];

  return NextResponse.json({
    changedOrders,
    assignedCount: assignedOrders.length,
    availableCount: availableOrders.length,
    hasCurrentDeliveryUpdate: Boolean(currentDelivery),
    serverTime: new Date().toISOString(),
  });
}

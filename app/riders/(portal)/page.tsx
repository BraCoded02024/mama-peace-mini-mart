import { redirect } from "next/navigation";
import Image from "next/image";
import { Bike } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getRiderSession } from "@/lib/rider-auth";
import { riderLogoutAction } from "@/app/actions/rider-auth";
import { AvailableOrdersList } from "@/components/rider/available-orders-list";
import { CurrentDeliveryCard } from "@/components/rider/current-delivery-card";
import { RiderPortalError } from "@/components/rider/rider-portal-error";
import { Badge } from "@/components/ui/badge";

export default async function RiderPortalPage() {
  const session = await getRiderSession();
  if (!session) redirect("/riders/login");

  let availableOrders;
  let currentDelivery;

  try {
    [availableOrders, currentDelivery] = await Promise.all([
      prisma.order.findMany({
        where: { status: "READY_FOR_PICKUP" },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.order.findFirst({
        where: {
          assignedRiderId: session.id,
          status: { in: ["RIDER_ASSIGNED", "OUT_FOR_DELIVERY"] },
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);
  } catch (error) {
    console.error("[riders] failed to load portal data", error);
    return (
      <RiderPortalError message="Could not load orders. The production database may need the rider schema update." />
    );
  }

  return (
    <div className="min-h-screen bg-mama-green/5">
      <header className="sticky top-0 z-30 border-b border-mama-border bg-mama-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 overflow-hidden rounded-full border border-mama-border bg-white">
              <Image
                src="/images/logo.png"
                alt="Mama Peace Mini Mart"
                fill
                sizes="40px"
                className="object-contain p-1.5"
              />
            </div>
            <div>
              <p className="font-serif text-lg text-mama-ink">Rider Portal</p>
              <p className="text-xs text-mama-muted">{session.area}</p>
            </div>
          </div>
          <form action={riderLogoutAction}>
            <button
              type="submit"
              className="rounded-full border border-mama-border bg-white px-4 py-2 text-sm font-medium text-mama-ink transition hover:bg-mama-gray"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 px-4 py-6">
        <section className="rounded-2xl border border-mama-border bg-white p-5 shadow-sm">
          <p className="font-serif text-2xl text-mama-ink">
            Welcome, {session.name}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Bike className="h-4 w-4 text-mama-green" />
            <span className="text-sm text-mama-muted">Status</span>
            <Badge variant="success">Online</Badge>
          </div>
        </section>

        {currentDelivery ? (
          <section className="space-y-3">
            <h2 className="font-serif text-xl text-mama-ink">Current Delivery</h2>
            <CurrentDeliveryCard order={currentDelivery} />
          </section>
        ) : (
          <section className="space-y-3">
            <h2 className="font-serif text-xl text-mama-ink">Available Orders</h2>
            <AvailableOrdersList orders={availableOrders} />
          </section>
        )}
      </main>
    </div>
  );
}

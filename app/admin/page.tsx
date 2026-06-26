import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    return (
      <div className="min-h-screen bg-mama-cream px-4 py-12">
        <AdminLoginForm />
      </div>
    );
  }

  const [orders, complaints] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.complaint.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="min-h-screen bg-mama-cream">
      <header className="border-b border-mama-border bg-white px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl">Mama Peace Admin</h1>
            <p className="text-sm text-mama-muted">Signed in as {session.username}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm text-mama-muted hover:text-mama-ink"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        <section>
          <h2 className="mb-4 font-serif text-xl">Orders</h2>
          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-sm text-mama-muted">No orders yet.</p>
            ) : (
              orders.map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}>
                  <Card className="transition hover:shadow-md">
                    <CardContent className="flex items-center justify-between pt-4">
                      <div>
                        <p className="font-medium">{order.referenceNumber}</p>
                        <p className="text-sm text-mama-muted">
                          {order.customerName} · {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <OrderStatusBadge status={order.status} />
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-serif text-xl">Support Requests</h2>
          <div className="space-y-3">
            {complaints.length === 0 ? (
              <p className="text-sm text-mama-muted">No support requests.</p>
            ) : (
              complaints.map((c) => (
                <Card key={c.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{c.name}</p>
                      <span className="text-xs uppercase text-mama-muted">
                        {c.category}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-mama-muted">{c.phoneNumber}</p>
                    <p className="mt-2 text-sm">{c.message}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

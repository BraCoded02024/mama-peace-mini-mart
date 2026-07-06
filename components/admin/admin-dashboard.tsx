import Link from "next/link";
import {
  ClipboardList,
  Clock,
  CreditCard,
  Banknote,
  ChevronRight,
  MessageSquare,
  Phone,
  Inbox,
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { OrderStatusBadge } from "@/components/order/order-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { PAID_ORDER_STATUSES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Complaint, Order } from "@prisma/client";

export function AdminDashboard({
  username,
  pathname,
  orders,
  complaints,
}: {
  username: string;
  pathname: string;
  orders: Order[];
  complaints: Complaint[];
}) {
  const pendingCount = orders.filter((o) => o.status === "PENDING_REVIEW").length;
  const awaitingPaymentCount = orders.filter(
    (o) => o.status === "AWAITING_PAYMENT"
  ).length;
  const revenue = orders
    .filter((o) => PAID_ORDER_STATUSES.includes(o.status as (typeof PAID_ORDER_STATUSES)[number]))
    .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  const stats = [
    {
      label: "Total Orders",
      value: orders.length.toString(),
      icon: ClipboardList,
      accent: "text-mama-green",
      bg: "bg-mama-green/10",
    },
    {
      label: "Pending Review",
      value: pendingCount.toString(),
      icon: Clock,
      accent: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      label: "Awaiting Payment",
      value: awaitingPaymentCount.toString(),
      icon: CreditCard,
      accent: "text-mama-brown",
      bg: "bg-mama-peach/40",
    },
    {
      label: "Revenue (Paid)",
      value: formatCurrency(revenue),
      icon: Banknote,
      accent: "text-mama-green",
      bg: "bg-mama-green/10",
    },
  ];

  return (
    <AdminShell username={username} pathname={pathname}>
      <div className="space-y-8">
        <section>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, accent, bg }) => (
              <div
                key={label}
                className="rounded-2xl border border-mama-border bg-white p-4 shadow-sm"
              >
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${bg}`}
                >
                  <Icon className={`h-5 w-5 ${accent}`} />
                </div>
                <p className="text-2xl font-semibold text-mama-ink">{value}</p>
                <p className="mt-1 text-xs text-mama-muted">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl text-mama-ink">Orders</h2>
            <span className="text-sm text-mama-muted">{orders.length} total</span>
          </div>

          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-mama-border bg-white py-16 text-center">
              <Inbox className="h-10 w-10 text-mama-muted/60" />
              <p className="mt-3 font-medium text-mama-ink">No orders yet</p>
              <p className="mt-1 text-sm text-mama-muted">
                New grocery requests will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="group block"
                >
                  <Card className="transition hover:border-mama-green/40 hover:shadow-md">
                    <CardContent className="flex items-center justify-between gap-4 py-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-mama-ink">
                            {order.referenceNumber}
                          </p>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="mt-1 truncate text-sm text-mama-muted">
                          {order.customerName} · {order.phoneNumber}
                        </p>
                        <p className="mt-0.5 text-xs text-mama-muted">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        {order.totalAmount != null && (
                          <span className="font-semibold text-mama-ink">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        )}
                        <ChevronRight className="h-5 w-5 text-mama-muted transition group-hover:translate-x-0.5 group-hover:text-mama-green" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section id="support">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl text-mama-ink">Support Requests</h2>
            <span className="text-sm text-mama-muted">{complaints.length} total</span>
          </div>

          {complaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-mama-border bg-white py-12 text-center">
              <MessageSquare className="h-10 w-10 text-mama-muted/60" />
              <p className="mt-3 font-medium text-mama-ink">No support requests</p>
              <p className="mt-1 text-sm text-mama-muted">
                Customer enquiries and complaints will show up here.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {complaints.map((c) => (
                <Card key={c.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-mama-ink">{c.name}</p>
                      <span className="rounded-full bg-mama-gray px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-mama-muted">
                        {c.category}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-mama-muted">
                      <Phone className="h-3.5 w-3.5" />
                      {c.phoneNumber}
                    </p>
                    <p className="mt-2 text-sm text-mama-ink">{c.message}</p>
                    <p className="mt-2 text-xs text-mama-muted">
                      {formatDate(c.createdAt)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}

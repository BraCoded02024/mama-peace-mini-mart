import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { AdminOrderPanel } from "@/components/admin/admin-order-panel";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin");

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) notFound();

  return (
    <div className="min-h-screen bg-mama-cream">
      <header className="border-b border-mama-border bg-white px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <Link href="/admin" className="text-sm text-mama-green hover:underline">
            ← Back to dashboard
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">
        <AdminOrderPanel order={order} />
      </main>
    </div>
  );
}

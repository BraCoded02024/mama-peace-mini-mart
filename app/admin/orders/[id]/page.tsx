import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-mama-green/5">
      <header className="sticky top-0 z-30 border-b border-mama-border bg-mama-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link
            href="/admin"
            className="flex items-center gap-2 rounded-full border border-mama-border bg-white px-3.5 py-2 text-sm font-medium text-mama-ink transition hover:bg-mama-gray"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <div className="flex items-center gap-2.5">
            <span className="font-serif text-base text-mama-ink">Order Details</span>
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-mama-border bg-white">
              <Image
                src="/images/logo.png"
                alt="Mama Peace Mini Mart"
                fill
                sizes="36px"
                className="object-contain p-1.5"
              />
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <AdminOrderPanel order={order} />
      </main>
    </div>
  );
}

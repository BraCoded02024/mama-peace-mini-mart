import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    return <AdminLoginForm />;
  }

  const [orders, complaints, riders] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { assignedRider: true },
    }),
    prisma.complaint.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.rider.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <AdminDashboard
      username={session.username}
      pathname="/admin"
      orders={orders}
      complaints={complaints}
      riders={riders}
    />
  );
}

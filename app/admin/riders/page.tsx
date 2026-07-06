import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AdminShell } from "@/components/admin/admin-shell";
import { RidersTable } from "@/components/admin/riders-table";
import { RiderPortalLink } from "@/components/admin/rider-portal-link";

function riderPortalUrl() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/riders/login`;
}

export default async function AdminRidersPage() {
  const session = await getAdminSession();

  if (!session) {
    return <AdminLoginForm />;
  }

  const riders = await prisma.rider.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      username={session.username}
      pathname="/admin/riders"
      title="Rider Management"
      subtitle="Manage your delivery riders"
    >
      <RiderPortalLink url={riderPortalUrl()} />
      <RidersTable riders={riders} />
    </AdminShell>
  );
}

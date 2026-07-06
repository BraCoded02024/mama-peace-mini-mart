import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AdminShell } from "@/components/admin/admin-shell";
import { RiderForm } from "@/components/admin/rider-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function EditRiderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();

  if (!session) {
    return <AdminLoginForm />;
  }

  const { id } = await params;
  const rider = await prisma.rider.findUnique({ where: { id } });

  if (!rider) notFound();

  return (
    <AdminShell
      username={session.username}
      pathname="/admin/riders"
      title="Edit Rider"
      subtitle={rider.name}
      maxWidth="max-w-lg"
    >
      <Card>
        <CardContent className="pt-6">
          <RiderForm mode="edit" rider={rider} />
        </CardContent>
      </Card>
    </AdminShell>
  );
}

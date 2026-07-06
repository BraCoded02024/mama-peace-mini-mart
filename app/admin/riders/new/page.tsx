import { getAdminSession } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AdminShell } from "@/components/admin/admin-shell";
import { RiderForm } from "@/components/admin/rider-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewRiderPage() {
  const session = await getAdminSession();

  if (!session) {
    return <AdminLoginForm />;
  }

  return (
    <AdminShell
      username={session.username}
      pathname="/admin/riders"
      title="Add Rider"
      subtitle="Create a new delivery rider"
      maxWidth="max-w-lg"
    >
      <Card>
        <CardContent className="pt-6">
          <RiderForm mode="create" />
        </CardContent>
      </Card>
    </AdminShell>
  );
}

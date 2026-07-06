import { getAdminSession } from "@/lib/auth";
import { getCustomerSummaries } from "@/lib/customers";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { AdminShell } from "@/components/admin/admin-shell";
import { CustomersPanel } from "@/components/admin/customers-panel";

export default async function AdminCustomersPage() {
  const session = await getAdminSession();

  if (!session) {
    return <AdminLoginForm />;
  }

  const customers = await getCustomerSummaries();

  return (
    <AdminShell
      username={session.username}
      pathname="/admin/customers"
      title="Customers"
      subtitle="View customers and send promotions"
    >
      <CustomersPanel customers={customers} />
    </AdminShell>
  );
}

import { redirect } from "next/navigation";
import { getRiderSession } from "@/lib/rider-auth";
import { RiderLoginForm } from "@/components/rider/rider-login-form";

export default async function RiderLoginPage() {
  const session = await getRiderSession();
  if (session) redirect("/riders");

  return <RiderLoginForm />;
}

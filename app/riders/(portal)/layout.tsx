import { redirect } from "next/navigation";
import { getRiderSession } from "@/lib/rider-auth";

export default async function RiderPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getRiderSession();
  if (!session) redirect("/riders/login");

  return children;
}

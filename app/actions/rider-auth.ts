"use server";

import { redirect } from "next/navigation";
import { logoutRider } from "@/lib/rider-auth";

export async function riderLogoutAction() {
  await logoutRider();
  redirect("/riders/login");
}

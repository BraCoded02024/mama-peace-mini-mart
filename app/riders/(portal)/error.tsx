"use client";

import { RiderPortalError } from "@/components/rider/rider-portal-error";

export default function RiderPortalRouteError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  console.error("[riders] route error", error.digest, error.message);

  return (
    <RiderPortalError message="Something went wrong loading the rider portal. Please try again in a moment." />
  );
}

"use client";

import { X } from "lucide-react";
import { useRiderLiveFeed } from "@/components/rider/use-rider-live-feed";

export function RiderLiveBanner() {
  const { alerts, dismissAlerts } = useRiderLiveFeed();

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.slice(0, 2).map((alert) => (
        <div
          key={alert.id}
          className="flex items-center justify-between gap-3 rounded-xl border border-mama-green/40 bg-mama-green/10 px-4 py-3"
        >
          <p className="text-sm font-medium text-mama-ink">{alert.title}</p>
          <button
            type="button"
            onClick={dismissAlerts}
            className="shrink-0 rounded-full p-1 text-mama-muted hover:bg-white/60"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
      <p className="text-center text-xs text-mama-muted">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="underline hover:text-mama-ink"
        >
          Refresh
        </button>{" "}
        if the list looks out of date
      </p>
    </div>
  );
}

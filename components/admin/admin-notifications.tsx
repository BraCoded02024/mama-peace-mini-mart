"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Volume2, VolumeX, X } from "lucide-react";
import { useAdminLiveFeed } from "@/components/admin/use-admin-live-feed";
import { cn } from "@/lib/utils";

export function AdminNotifications() {
  const { alerts, unreadCount, dismissAlerts } = useAdminLiveFeed();
  const [open, setOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    setSoundOn(localStorage.getItem("mama_admin_sound") === "1");
  }, []);

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem("mama_admin_sound", next ? "1" : "0");
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={toggleSound}
          className="hidden rounded-full p-2 text-mama-muted transition hover:bg-mama-gray hover:text-mama-ink sm:inline-flex"
          title={soundOn ? "Disable new-order sound" : "Enable new-order sound"}
        >
          {soundOn ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen((v) => !v);
            if (!open) dismissAlerts();
          }}
          className="relative rounded-full p-2 text-mama-muted transition hover:bg-mama-gray hover:text-mama-ink"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-mama-border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-mama-border px-4 py-3">
            <p className="text-sm font-semibold text-mama-ink">Notifications</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 text-mama-muted hover:bg-mama-gray"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {alerts.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-mama-muted">
              No new activity
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto divide-y divide-mama-border">
              {alerts.map((alert) => (
                <li key={alert.id}>
                  <Link
                    href={alert.href}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 text-sm transition hover:bg-mama-gray"
                  >
                    <p className="font-medium text-mama-ink">{alert.title}</p>
                    <p className="mt-0.5 text-xs text-mama-muted">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {alerts.length > 0 && unreadCount > 0 && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm space-y-2">
          {alerts.slice(0, 3).map((alert) => (
            <Link
              key={`toast-${alert.id}`}
              href={alert.href}
              className={cn(
                "block rounded-xl border border-mama-green/30 bg-white px-4 py-3 shadow-lg transition hover:shadow-xl",
                alert.type === "order"
                  ? "border-l-4 border-l-mama-green"
                  : "border-l-4 border-l-amber-500"
              )}
            >
              <p className="text-sm font-medium text-mama-ink">{alert.title}</p>
              <p className="mt-0.5 text-xs text-mama-green">Tap to view</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

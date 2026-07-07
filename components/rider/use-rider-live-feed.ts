"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 15_000;

export type RiderFeedAlert = {
  id: string;
  title: string;
};

export function useRiderLiveFeed() {
  const router = useRouter();
  const sinceRef = useRef(new Date().toISOString());
  const seenRef = useRef(new Set<string>());
  const [alerts, setAlerts] = useState<RiderFeedAlert[]>([]);

  const dismissAlerts = useCallback(() => {
    setAlerts([]);
    seenRef.current.clear();
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/rider/feed?since=${encodeURIComponent(sinceRef.current)}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;

      const data = (await res.json()) as {
        changedOrders: Array<{
          id: string;
          referenceNumber: string;
          status: string;
          updatedAt: string;
        }>;
        serverTime: string;
      };

      const newAlerts: RiderFeedAlert[] = [];

      for (const order of data.changedOrders) {
        const key = `order:${order.id}:${order.updatedAt}`;
        if (seenRef.current.has(key)) continue;
        seenRef.current.add(key);

        const title =
          order.status === "READY_FOR_PICKUP"
            ? `New pickup available: ${order.referenceNumber}`
            : order.status === "RIDER_ASSIGNED"
              ? `Assigned to you: ${order.referenceNumber}`
              : `Order ${order.referenceNumber} updated`;

        newAlerts.push({ id: key, title });
      }

      if (newAlerts.length > 0) {
        setAlerts((prev) => [...newAlerts, ...prev].slice(0, 5));
        router.refresh();
      }

      sinceRef.current = data.serverTime;
    } catch {
      // silent fail on poll errors
    }
  }, [router]);

  useEffect(() => {
    const id = setInterval(poll, POLL_INTERVAL_MS);
    poll();
    return () => clearInterval(id);
  }, [poll]);

  return { alerts, dismissAlerts };
}

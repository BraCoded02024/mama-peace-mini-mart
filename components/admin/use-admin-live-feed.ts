"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 15_000;

type FeedOrder = {
  id: string;
  referenceNumber: string;
  customerName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type FeedComplaint = {
  id: string;
  name: string;
  category: string;
  createdAt: string;
};

export type AdminFeedAlert = {
  id: string;
  type: "order" | "complaint";
  title: string;
  href: string;
  createdAt: string;
};

function playNewOrderSound() {
  if (typeof window === "undefined") return;
  const enabled = localStorage.getItem("mama_admin_sound") === "1";
  if (!enabled) return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.08;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // ignore audio errors
  }
}

export function useAdminLiveFeed() {
  const router = useRouter();
  const sinceRef = useRef(new Date().toISOString());
  const seenRef = useRef(new Set<string>());
  const [alerts, setAlerts] = useState<AdminFeedAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dismissAlerts = useCallback(() => {
    setUnreadCount(0);
    setAlerts([]);
    seenRef.current.clear();
  }, []);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/feed?since=${encodeURIComponent(sinceRef.current)}`,
        { cache: "no-store" }
      );
      if (!res.ok) return;

      const data = (await res.json()) as {
        orders: FeedOrder[];
        complaints: FeedComplaint[];
        serverTime: string;
      };

      const newAlerts: AdminFeedAlert[] = [];

      for (const order of data.orders) {
        const key = `order:${order.id}:${order.updatedAt}`;
        if (seenRef.current.has(key)) continue;
        seenRef.current.add(key);

        if (order.status === "PENDING_REVIEW" && order.createdAt === order.updatedAt) {
          playNewOrderSound();
        }

        newAlerts.push({
          id: key,
          type: "order",
          title:
            order.status === "PENDING_REVIEW"
              ? `New order ${order.referenceNumber}`
              : `Order ${order.referenceNumber} updated`,
          href: `/admin/orders/${order.id}`,
          createdAt: order.updatedAt,
        });
      }

      for (const complaint of data.complaints) {
        const key = `complaint:${complaint.id}`;
        if (seenRef.current.has(key)) continue;
        seenRef.current.add(key);

        newAlerts.push({
          id: key,
          type: "complaint",
          title: `New ${complaint.category.toLowerCase()} from ${complaint.name}`,
          href: "/admin#support",
          createdAt: complaint.createdAt,
        });
      }

      if (newAlerts.length > 0) {
        setAlerts((prev) => [...newAlerts, ...prev].slice(0, 10));
        setUnreadCount((c) => c + newAlerts.length);
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

  return { alerts, unreadCount, dismissAlerts };
}

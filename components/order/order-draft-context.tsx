"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type OrderDraft = {
  customerName: string;
  phoneNumber: string;
  gpsAddress: string;
  locationDescription: string;
  itemsRequested: string;
  specialInstructions: string;
};

const STORAGE_KEY = "mama_peace_order_draft";

const emptyDraft: OrderDraft = {
  customerName: "",
  phoneNumber: "",
  gpsAddress: "",
  locationDescription: "",
  itemsRequested: "",
  specialInstructions: "",
};

type OrderDraftContextValue = {
  draft: OrderDraft;
  updateDraft: (patch: Partial<OrderDraft>) => void;
  clearDraft: () => void;
};

const OrderDraftContext = createContext<OrderDraftContextValue | null>(null);

export function OrderDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<OrderDraft>(emptyDraft);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        setDraft({ ...emptyDraft, ...JSON.parse(stored) });
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, hydrated]);

  const value = useMemo(
    () => ({
      draft,
      updateDraft: (patch: Partial<OrderDraft>) =>
        setDraft((prev) => ({ ...prev, ...patch })),
      clearDraft: () => {
        setDraft(emptyDraft);
        sessionStorage.removeItem(STORAGE_KEY);
      },
    }),
    [draft]
  );

  if (!hydrated) {
    return null;
  }

  return (
    <OrderDraftContext.Provider value={value}>
      {children}
    </OrderDraftContext.Provider>
  );
}

export function useOrderDraft() {
  const context = useContext(OrderDraftContext);
  if (!context) {
    throw new Error("useOrderDraft must be used within OrderDraftProvider");
  }
  return context;
}

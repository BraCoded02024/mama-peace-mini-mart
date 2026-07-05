"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useOrderDraft } from "@/components/order/order-draft-context";
import { marketCategories } from "@/lib/market-data";

export function OrderPrefillFromQuery() {
  const searchParams = useSearchParams();
  const { draft, updateDraft } = useOrderDraft();

  useEffect(() => {
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    if (category) {
      const match = marketCategories.find((item) => item.id === category);
      if (match && !draft.itemsRequested.includes(match.name)) {
        const prefix = draft.itemsRequested.trim();
        const next = prefix ? `${prefix}\n${match.name}:` : `${match.name}:`;
        updateDraft({ itemsRequested: next });
      }
      return;
    }

    if (search && !draft.itemsRequested.includes(search)) {
      const prefix = draft.itemsRequested.trim();
      const next = prefix ? `${prefix}\n${search}` : search;
      updateDraft({ itemsRequested: next });
    }
    // Only run when query params change on first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}

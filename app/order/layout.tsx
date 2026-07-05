import { Suspense } from "react";
import { OrderDraftProvider } from "@/components/order/order-draft-context";
import { OrderPrefillFromQuery } from "@/components/order/order-prefill-from-query";

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OrderDraftProvider>
      <Suspense fallback={null}>
        <OrderPrefillFromQuery />
      </Suspense>
      {children}
    </OrderDraftProvider>
  );
}

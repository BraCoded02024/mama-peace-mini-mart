import { OrderDraftProvider } from "@/components/order/order-draft-context";

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OrderDraftProvider>{children}</OrderDraftProvider>;
}

import { CreditCard, Mail, MapPin, Phone, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PayNowButton } from "@/components/order/pay-now-button";
import { MomoPaymentInstructions } from "@/components/order/momo-payment-instructions";
import { PaymentMerchantNotice } from "@/components/order/payment-merchant-notice";
import { formatCurrency } from "@/lib/utils";
import { MIN_ORDER_AMOUNT_GHS } from "@/lib/constants";
import type { OrderPaymentMethod } from "@/lib/payment-config";

type OrderItem = {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type OrderPaymentSummaryProps = {
  referenceNumber: string;
  phoneNumber: string;
  customerEmail?: string | null;
  customerName: string;
  gpsAddress: string;
  items: OrderItem[];
  itemsRequested: string;
  subtotal: number | null;
  deliveryFee: number | null;
  serviceFee: number | null;
  totalAmount: number;
  paymentMethod?: OrderPaymentMethod | null;
};

export function OrderPaymentSummary({
  referenceNumber,
  phoneNumber,
  customerEmail,
  customerName,
  gpsAddress,
  items,
  itemsRequested,
  subtotal,
  deliveryFee,
  serviceFee,
  totalAmount,
  paymentMethod = "PAYSTACK",
}: OrderPaymentSummaryProps) {
  const belowMinimum = totalAmount < MIN_ORDER_AMOUNT_GHS;
  const isMomo = paymentMethod === "MTN_MOMO";

  return (
    <Card className="mt-4 overflow-hidden border-mama-green">
      <div className="bg-mama-green px-5 py-4 text-white">
        <p className="text-[10px] uppercase tracking-wider text-mama-cream">
          Ready for Payment
        </p>
        <h2 className="font-serif text-xl">Your Order Summary</h2>
        <p className="mt-1 text-sm text-white/85">
          {isMomo
            ? "Pay the full total via MTN Mobile Money before dispatch."
            : "Review your priced items below, then pay securely with Paystack."}
        </p>
      </div>

      <CardContent className="space-y-5 p-0">
        <div className="px-5 pt-5">
          <PaymentMerchantNotice compact />
        </div>

        <div className="space-y-3 px-5">
          <p className="text-xs font-medium uppercase tracking-wider text-mama-muted">
            Your Details
          </p>
          <div className="space-y-2 rounded-xl bg-mama-gray p-4 text-sm">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 shrink-0 text-mama-green" />
              <span>{customerName}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-mama-green" />
              <span>{phoneNumber}</span>
            </div>
            {customerEmail && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-mama-green" />
                <span>{customerEmail}</span>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-mama-green" />
              <span>{gpsAddress}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 px-5">
          <p className="text-xs font-medium uppercase tracking-wider text-mama-muted">
            Items
          </p>
          {items.length > 0 ? (
            <div className="divide-y divide-mama-border rounded-xl border border-mama-border bg-white">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-mama-ink">{item.itemName}</p>
                    <p className="text-xs text-mama-muted">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="shrink-0 font-medium text-mama-ink">
                    {formatCurrency(item.totalPrice)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-mama-border bg-white p-4 text-sm whitespace-pre-wrap text-mama-muted">
              {itemsRequested}
            </div>
          )}
        </div>

        <div className="mx-5 space-y-2 rounded-xl bg-mama-gray p-4 text-sm">
          {subtotal != null && (
            <div className="flex justify-between">
              <span className="text-mama-muted">Items subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          )}
          {deliveryFee != null && (
            <div className="flex justify-between">
              <span className="text-mama-muted">Delivery fee</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
          )}
          {serviceFee != null && serviceFee > 0 && (
            <div className="flex justify-between">
              <span className="text-mama-muted">Service fee</span>
              <span>{formatCurrency(serviceFee)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-mama-border pt-3 text-base font-semibold text-mama-ink">
            <span>Total to pay</span>
            <span className="text-mama-green">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div className="space-y-3 border-t border-mama-border bg-white px-5 py-5">
          {belowMinimum ? (
            <p className="text-sm text-red-600">
              Minimum order is GHC {MIN_ORDER_AMOUNT_GHS}. Please contact support.
            </p>
          ) : isMomo ? (
            <MomoPaymentInstructions
              totalAmount={totalAmount}
              referenceNumber={referenceNumber}
            />
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm text-mama-muted">
                <CreditCard className="h-4 w-4 text-mama-green" />
                Pay with card, mobile money, or bank via Paystack
              </div>
              <PayNowButton
                referenceNumber={referenceNumber}
                phoneNumber={phoneNumber}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

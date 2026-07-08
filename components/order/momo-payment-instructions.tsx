import { Smartphone } from "lucide-react";
import { PAYMENT_AUTHORIZED_NOTICE, PAYMENT_MERCHANT } from "@/lib/payment-config";
import { formatCurrency } from "@/lib/utils";

export function MomoPaymentInstructions({
  totalAmount,
  referenceNumber,
}: {
  totalAmount: number;
  referenceNumber: string;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-mama-green/30 bg-mama-green/5 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-mama-ink">
        <Smartphone className="h-5 w-5 text-mama-green" />
        Pay with MTN Mobile Money
      </div>

      <p className="text-sm text-mama-muted">
        Send the <strong className="text-mama-ink">full amount</strong> to the
        merchant account below. Use your order reference as the payment note.
      </p>

      <div className="space-y-2 rounded-xl bg-white p-4 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-mama-muted">Amount to pay</span>
          <span className="font-semibold text-mama-green">
            {formatCurrency(totalAmount)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-mama-muted">Merchant name</span>
          <span className="font-semibold text-mama-ink">
            {PAYMENT_MERCHANT.name}
          </span>
        </div>
        {PAYMENT_MERCHANT.mtnNumbers.map((number) => (
          <div key={number} className="flex justify-between gap-4">
            <span className="text-mama-muted">MTN number</span>
            <span className="font-semibold text-mama-ink">{number}</span>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-mama-border pt-2">
          <span className="text-mama-muted">Payment reference</span>
          <span className="font-semibold text-mama-ink">{referenceNumber}</span>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-mama-muted">
        {PAYMENT_AUTHORIZED_NOTICE.onlyChannel}{" "}
        {PAYMENT_AUTHORIZED_NOTICE.liability}{" "}
        {PAYMENT_MERCHANT.dispatchNotice}
      </p>
    </div>
  );
}

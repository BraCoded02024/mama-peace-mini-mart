import { Info } from "lucide-react";
import {
  PAYMENT_AUTHORIZED_NOTICE,
  PAYMENT_MERCHANT,
  formatMtnNumbersList,
} from "@/lib/payment-config";

export function PaymentMerchantNotice({ compact = false }: { compact?: boolean }) {
  const numbers = formatMtnNumbersList();
  const notice = PAYMENT_AUTHORIZED_NOTICE;

  if (compact) {
    return (
      <p className="text-xs leading-relaxed text-mama-muted">
        {notice.operator} Pay only to MTN{" "}
        <strong className="text-mama-ink">{numbers}</strong> — Name:{" "}
        <strong className="text-mama-ink">{PAYMENT_MERCHANT.name}</strong>.{" "}
        {notice.onlyChannel} {PAYMENT_MERCHANT.dispatchNotice}
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
      <div className="flex gap-2">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div className="space-y-2 text-mama-ink">
          <p className="font-semibold">{notice.heading}</p>
          <p className="leading-relaxed text-mama-muted">{notice.operator}</p>
          <div className="rounded-lg bg-white p-3 text-mama-ink">
            <p className="font-medium">Authorized payment account</p>
            <p className="mt-1">
              <span className="text-mama-muted">MTN Mobile Money: </span>
              <strong>{numbers}</strong>
            </p>
            <p>
              <span className="text-mama-muted">Merchant name: </span>
              <strong>{PAYMENT_MERCHANT.name}</strong>
            </p>
          </div>
          <p className="leading-relaxed text-mama-muted">{notice.onlyChannel}</p>
          <p className="leading-relaxed text-mama-muted">{notice.liability}</p>
          <p className="font-medium text-amber-900">
            {PAYMENT_MERCHANT.dispatchNotice}
          </p>
        </div>
      </div>
    </div>
  );
}

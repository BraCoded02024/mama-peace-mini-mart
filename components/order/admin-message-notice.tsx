"use client";

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminMessageNoticeProps = {
  referenceNumber: string;
  message: string;
};

export function AdminMessageNotice({
  referenceNumber,
  message,
}: AdminMessageNoticeProps) {
  const trimmed = message.trim();
  const [showPopup, setShowPopup] = useState(false);
  const storageKey = `mama-peace-msg-${referenceNumber}`;

  useEffect(() => {
    if (!trimmed) return;

    const seenMessage = sessionStorage.getItem(storageKey);
    if (seenMessage !== trimmed) {
      setShowPopup(true);
    }
  }, [trimmed, storageKey]);

  function dismissPopup() {
    sessionStorage.setItem(storageKey, trimmed);
    setShowPopup(false);
  }

  if (!trimmed) return null;

  return (
    <>
      {showPopup && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mama-peace-message-title"
        >
          <div className="w-full max-w-sm rounded-2xl border border-mama-border bg-white p-5 shadow-lg">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mama-green text-white">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <p
                    id="mama-peace-message-title"
                    className="font-serif text-lg text-mama-ink"
                  >
                    Message from Mama Peace
                  </p>
                  <p className="text-xs text-mama-muted">
                    A reply was sent for your order
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={dismissPopup}
                className="rounded-lg p-1 text-mama-muted hover:bg-mama-gray"
                aria-label="Close message"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-relaxed text-mama-ink">
              {trimmed}
            </p>

            <Button
              type="button"
              className="mt-5 w-full"
              onClick={dismissPopup}
            >
              Got it
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-2xl border border-mama-green bg-white p-4">
        <div className="mb-2 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-mama-green" />
          <p className="text-sm font-medium text-mama-ink">
            Message from Mama Peace
          </p>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-mama-muted">
          {trimmed}
        </p>
      </div>
    </>
  );
}

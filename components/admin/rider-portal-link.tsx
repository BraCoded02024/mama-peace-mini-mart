"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Copy, Check, Bike } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RiderPortalLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard without permission
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-mama-green/30 bg-mama-green/5 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mama-green/15 text-mama-green">
            <Bike className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-mama-ink">Rider Portal</p>
            <p className="mt-0.5 text-sm text-mama-muted">
              Share this link with riders so they can sign in and see pickup
              orders.
            </p>
            <p className="mt-2 break-all font-mono text-xs text-mama-ink/80">
              {url}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={copyLink}>
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy link"}
          </Button>
          <Button asChild size="sm">
            <Link href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open Rider Portal
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

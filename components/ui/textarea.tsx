import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[140px] w-full rounded-xl border border-mama-border bg-mama-input px-4 py-3 text-[15px] font-normal leading-relaxed tracking-[-0.01em] text-mama-ink shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-mama-muted/70 hover:border-mama-muted/40 focus-visible:border-mama-green focus-visible:ring-2 focus-visible:ring-mama-green/15 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };

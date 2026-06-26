import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-mama-border bg-mama-input px-4 py-2 text-[15px] font-normal tracking-[-0.01em] text-mama-ink shadow-sm outline-none transition-colors placeholder:font-normal placeholder:text-mama-muted/70 hover:border-mama-muted/40 focus-visible:border-mama-green focus-visible:ring-2 focus-visible:ring-mama-green/15 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

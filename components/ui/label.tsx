import * as React from "react";
import { cn } from "@/lib/utils";

function Label({
  className,
  ...props
}: React.ComponentProps<"label">) {
  return (
    <label
      className={cn(
        "mb-0.5 block text-[13px] font-semibold tracking-[-0.01em] text-mama-ink",
        className
      )}
      {...props}
    />
  );
}

export { Label };

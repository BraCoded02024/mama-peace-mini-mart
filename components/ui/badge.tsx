import { cn } from "@/lib/utils";

type BadgeProps = React.ComponentProps<"span"> & {
  variant?: "default" | "warning" | "success" | "muted";
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        variant === "default" && "bg-mama-orange/20 text-mama-orange-dark",
        variant === "warning" && "bg-yellow-400/25 text-mama-brown",
        variant === "success" && "bg-mama-green/15 text-mama-green",
        variant === "muted" && "bg-mama-gray text-mama-muted",
        className
      )}
      {...props}
    />
  );
}

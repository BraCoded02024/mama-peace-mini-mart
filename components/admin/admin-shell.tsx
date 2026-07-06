import Link from "next/link";
import Image from "next/image";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Orders", match: (p: string) => p === "/admin" },
  {
    href: "/admin#support",
    label: "Complaints",
    match: (p: string) => p === "/admin",
  },
  {
    href: "/admin",
    label: "Customers",
    match: () => false,
    disabled: true,
  },
  {
    href: "/admin",
    label: "Payments",
    match: () => false,
    disabled: true,
  },
  {
    href: "/admin/riders",
    label: "Riders",
    match: (p: string) => p.startsWith("/admin/riders"),
  },
  {
    href: "/admin",
    label: "Settings",
    match: () => false,
    disabled: true,
  },
];

export function AdminShell({
  children,
  username,
  pathname,
  title = "Mama Peace Admin",
  subtitle = "Order management console",
  maxWidth = "max-w-5xl",
}: {
  children: React.ReactNode;
  username: string;
  pathname: string;
  title?: string;
  subtitle?: string;
  maxWidth?: string;
}) {
  const initial = (username?.[0] ?? "A").toUpperCase();

  return (
    <div className="min-h-screen bg-mama-green/5">
      <header className="sticky top-0 z-30 border-b border-mama-border bg-mama-cream/95 backdrop-blur">
        <div className={cn("mx-auto px-4 py-3.5 sm:px-6", maxWidth)}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-mama-border bg-white">
                <Image
                  src="/images/logo.png"
                  alt="Mama Peace Mini Mart"
                  fill
                  sizes="40px"
                  className="object-contain p-1.5"
                />
              </div>
              <div>
                <h1 className="font-serif text-lg leading-tight text-mama-ink">
                  {title}
                </h1>
                <p className="text-xs text-mama-muted">{subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-mama-green text-sm font-semibold text-white">
                  {initial}
                </div>
                <span className="max-w-[160px] truncate text-sm text-mama-ink">
                  {username}
                </span>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-mama-border bg-white px-4 py-2 text-sm font-medium text-mama-ink transition hover:bg-mama-gray"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>

          <nav className="mt-3 flex gap-1 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const active = item.match(pathname);
              if (item.disabled) {
                return (
                  <span
                    key={item.label}
                    className="shrink-0 rounded-full px-3.5 py-1.5 text-sm text-mama-muted/50"
                  >
                    {item.label}
                  </span>
                );
              }
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                    active
                      ? "bg-mama-green text-white"
                      : "text-mama-muted hover:bg-mama-gray hover:text-mama-ink"
                  )}
                >
                  {item.label === "Riders" ? "⭐ Riders" : item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className={cn("mx-auto px-4 py-6 sm:px-6 sm:py-8", maxWidth)}>
        {children}
      </main>
    </div>
  );
}

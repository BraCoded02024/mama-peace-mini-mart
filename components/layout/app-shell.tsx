"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Headphones, ShoppingBasket } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/order", label: "Requests", icon: ShoppingBasket },
  { href: "/track", label: "Tracking", icon: MapPin },
  { href: "/support", label: "Support", icon: Headphones },
];

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-mama-border bg-mama-cream">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Link
          href="/home"
          className="relative h-9 w-9 overflow-hidden rounded-full border border-mama-border bg-white"
          aria-label="Home"
        >
          <Image
            src="/images/logo.png"
            alt=""
            fill
            sizes="36px"
            className="object-contain p-1"
          />
        </Link>
        <Link
          href="/home"
          className="font-serif text-xl text-mama-ink"
        >
          Mama Peace
        </Link>
        <div className="h-9 w-9" aria-hidden />
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-mama-border bg-white">
      <div className="mx-auto grid max-w-lg grid-cols-4 px-2 py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href === "/order" && pathname.startsWith("/order")) ||
            (href === "/track" && pathname.startsWith("/track"));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-2 py-1 text-[11px]",
                active ? "text-mama-green font-semibold" : "text-mama-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mama-cream pb-24">
      <AppHeader />
      <main className="mx-auto max-w-lg px-4 py-6">{children}</main>
      <BottomNav />
    </div>
  );
}

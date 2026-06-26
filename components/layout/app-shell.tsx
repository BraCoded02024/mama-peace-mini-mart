"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MapPin,
  Headphones,
  ShoppingBasket,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/order", label: "Order", icon: ShoppingBasket },
  { href: "/track", label: "Track", icon: MapPin },
  { href: "/support", label: "Support", icon: Headphones },
];

const menuItems = [
  { href: "/home", label: "Home", description: "Back to the start", icon: Home },
  {
    href: "/order",
    label: "Place an Order",
    description: "Send your shopping list",
    icon: ShoppingBasket,
  },
  {
    href: "/track",
    label: "Track an Order",
    description: "Check your delivery status",
    icon: MapPin,
  },
  {
    href: "/support",
    label: "Customer Support",
    description: "We're here to help",
    icon: Headphones,
  },
];

export function AppHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-mama-border bg-mama-cream">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-mama-border bg-white text-mama-ink transition hover:bg-mama-gray"
          aria-label="Open menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/home" className="font-serif text-xl text-mama-ink">
          Mama Peace
        </Link>

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
      </div>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-black/30"
          />
          <div className="absolute left-3 right-3 top-16 z-50 mx-auto max-w-lg overflow-hidden rounded-2xl border border-mama-border bg-white shadow-xl">
            <div className="flex items-center gap-3 border-b border-mama-border bg-mama-green px-4 py-3 text-white">
              <div className="relative h-9 w-9 overflow-hidden rounded-full bg-white">
                <Image
                  src="/images/logo.png"
                  alt="Mama Peace Mini Mart"
                  fill
                  sizes="36px"
                  className="object-contain p-1"
                />
              </div>
              <div>
                <p className="font-serif text-base leading-tight">Mama Peace</p>
                <p className="text-xs text-mama-cream/80">What would you like to do?</p>
              </div>
            </div>

            <nav className="p-2">
              {menuItems.map(({ href, label, description, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-mama-gray"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mama-green/10 text-mama-green">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-mama-ink">
                      {label}
                    </span>
                    <span className="block text-xs text-mama-muted">
                      {description}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-mama-muted" />
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}

function DesktopBrandPanel() {
  const highlights = [
    { icon: ShoppingBasket, text: "Order groceries with no account needed" },
    { icon: MapPin, text: "Pick your delivery spot on the map" },
    { icon: Headphones, text: "Friendly support, every step of the way" },
  ];

  return (
    <aside className="hidden lg:sticky lg:top-12 lg:flex lg:w-80 lg:shrink-0 lg:flex-col lg:self-start lg:rounded-[2rem] lg:bg-mama-green lg:p-8 lg:text-white lg:shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white">
          <Image
            src="/images/logo.png"
            alt="Mama Peace Mini Mart"
            fill
            sizes="48px"
            className="object-contain p-1.5"
          />
        </div>
        <div>
          <p className="font-serif text-xl">Mama Peace</p>
          <p className="text-xs text-mama-cream/80">Mini Mart</p>
        </div>
      </div>

      <h2 className="mt-10 font-serif text-3xl leading-snug">
        Fresh groceries, delivered with care.
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-mama-cream/80">
        Groceries, provisions, fresh produce and household essentials brought
        right to your door.
      </p>

      <ul className="mt-8 space-y-4">
        {highlights.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3 text-sm text-mama-cream/90">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
              <Icon className="h-4 w-4" />
            </span>
            <span className="pt-1.5">{text}</span>
          </li>
        ))}
      </ul>

      <p className="mt-auto pt-10 text-xs text-mama-cream/60">
        Delivered with care across the city.
      </p>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 lg:static">
      <div className="mx-auto max-w-lg px-4 pb-4 lg:px-0 lg:pb-0">
        <div className="flex items-center justify-between rounded-full border border-mama-border bg-white px-3 py-2 shadow-[0_8px_30px_rgba(6,51,40,0.12)] lg:rounded-none lg:border-x-0 lg:border-b-0 lg:shadow-none">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href === "/order" && pathname.startsWith("/order")) ||
              (href === "/track" && pathname.startsWith("/track"));

            return (
              <Link
                key={href}
                href={href}
                className="group flex flex-1 flex-col items-center"
                aria-label={label}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200",
                    active
                      ? "-translate-y-3 bg-mama-green text-white shadow-lg shadow-mama-green/30"
                      : "text-mama-muted group-hover:bg-mama-gray"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={cn(
                    "text-[11px] transition-colors",
                    active
                      ? "-mt-2 font-semibold text-mama-green"
                      : "mt-0.5 text-mama-muted"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mama-cream lg:bg-mama-green/5">
      <div className="lg:mx-auto lg:flex lg:max-w-5xl lg:items-start lg:justify-center lg:gap-10 lg:px-8 lg:py-12">
        <DesktopBrandPanel />

        <div className="lg:flex lg:w-[440px] lg:shrink-0 lg:flex-col lg:overflow-hidden lg:rounded-[2rem] lg:border lg:border-mama-border lg:bg-mama-cream lg:shadow-2xl">
          <AppHeader />
          <main className="mx-auto w-full max-w-lg px-4 pb-28 pt-6 lg:pb-6">
            {children}
          </main>
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  LayoutGrid,
  ClipboardList,
  User,
  Menu,
  X,
  ChevronRight,
  MapPin,
  ShoppingCart,
  Search,
  ShoppingBasket,
  Headphones,
  Phone,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MARKET_LOCATION,
  MARKET_CONTACT,
  howItWorksSteps,
} from "@/lib/market-data";
import { MIN_ORDER_AMOUNT_GHS } from "@/lib/constants";

const navItems = [
  { href: "/home", label: "Home", icon: Home, match: (p: string) => p === "/home" },
  {
    href: "/home#categories",
    label: "Categories",
    icon: LayoutGrid,
    match: (p: string) => p === "/home",
  },
  {
    href: "/track",
    label: "My Orders",
    icon: ClipboardList,
    match: (p: string) => p.startsWith("/track"),
  },
  {
    href: "/support",
    label: "Profile",
    icon: User,
    match: (p: string) => p.startsWith("/support"),
  },
];

const menuItems = [
  { href: "/home", label: "Home", description: "Browse the mart", icon: Home },
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
    icon: ClipboardList,
  },
  {
    href: "/support",
    label: "Customer Support",
    description: "We're here to help",
    icon: Headphones,
  },
];

function useDraftItemCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function readDraft() {
      try {
        const raw = sessionStorage.getItem("mama_peace_order_draft");
        if (!raw) {
          setCount(0);
          return;
        }
        const draft = JSON.parse(raw) as { itemsRequested?: string };
        const hasItems = Boolean(draft.itemsRequested?.trim());
        const hasDetails = raw.length > 2;
        setCount(hasItems ? 1 : hasDetails ? 1 : 0);
      } catch {
        setCount(0);
      }
    }

    readDraft();
    window.addEventListener("storage", readDraft);
    window.addEventListener("mama-draft-updated", readDraft);
    return () => {
      window.removeEventListener("storage", readDraft);
      window.removeEventListener("mama-draft-updated", readDraft);
    };
  }, []);

  return count;
}

export function AppHeader({ showSearch = true }: { showSearch?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const draftCount = useDraftItemCount();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query.trim() ? `/order?search=${encodeURIComponent(query.trim())}` : "/order");
  }

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-mama-border/80 bg-white">
      <div className="mx-auto max-w-lg px-3 pt-2 lg:max-w-none">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-mama-green lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href="/home" className="flex min-w-0 flex-1 items-center gap-2">
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-mama-yellow-light">
              <Image
                src="/images/logo.png"
                alt=""
                fill
                sizes="32px"
                className="object-contain p-0.5"
              />
            </div>
            <div className="min-w-0 leading-none">
              <p className="truncate font-serif text-sm font-bold text-mama-green">
                MamaPeace
              </p>
              <p className="text-[9px] font-semibold tracking-[0.14em] text-mama-green/70">
                MINI MART
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 truncate rounded-full bg-mama-gray px-2.5 py-1.5 text-[10px] text-mama-ink sm:flex">
            <MapPin className="h-3 w-3 shrink-0 text-mama-green" />
            <span className="truncate">Deliver to {MARKET_LOCATION}</span>
          </div>

          <Link
            href="/order"
            className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mama-green text-white shadow-sm"
            aria-label="Your order"
          >
            <ShoppingCart className="h-4 w-4" />
            {draftCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-mama-yellow px-1 text-[9px] font-bold text-mama-ink">
                {draftCount}
              </span>
            )}
          </Link>
        </div>

        {showSearch && (
          <form onSubmit={handleSearch} className="mt-2.5 pb-2.5 lg:mt-2 lg:pb-2">
            <div className="flex overflow-hidden rounded-full border border-mama-border bg-mama-gray/60 shadow-sm">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for products..."
                className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-mama-ink outline-none placeholder:text-mama-muted lg:py-2 lg:text-[13px]"
              />
              <button
                type="submit"
                className="flex w-12 items-center justify-center bg-mama-green text-white transition hover:bg-mama-green-light"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}
      </div>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-black/30 lg:hidden"
          />
          <div className="absolute left-3 right-3 top-[calc(100%-4px)] z-50 mx-auto max-w-lg overflow-hidden rounded-2xl border border-mama-border bg-white shadow-xl lg:hidden">
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
                <p className="font-serif text-base leading-tight">MamaPeace Mini Mart</p>
                <p className="text-xs text-white/80">What would you like to do?</p>
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
                    <span className="block text-sm font-semibold text-mama-ink">{label}</span>
                    <span className="block text-xs text-mama-muted">{description}</span>
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
  return (
    <aside className="hidden lg:flex lg:h-full lg:min-h-0 lg:w-[400px] lg:shrink-0 lg:flex-col lg:overflow-hidden lg:rounded-[2rem] lg:border lg:border-mama-border lg:bg-white lg:shadow-2xl xl:w-[440px]">
      <div className="relative h-[212px] w-full shrink-0 xl:h-[228px]">
        <Image
          src="/images/market/homenew.png"
          alt="Mama Peace Mini Mart"
          fill
          className="object-cover object-[50%_38%]"
          sizes="440px"
          priority
        />
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto bg-mama-green p-4 text-white xl:p-5">
        <p className="font-serif text-lg leading-tight xl:text-xl">Your Trusted Mini Mart</p>
        <p className="mt-1.5 text-xs leading-relaxed text-white/85">
          Fresh groceries and household essentials delivered across {MARKET_LOCATION}.
          Minimum order GHC {MIN_ORDER_AMOUNT_GHS}.
        </p>

        <div className="mt-4 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wide text-mama-yellow">
            How It Works
          </p>
          {howItWorksSteps.map((step) => (
            <div key={step.step} className="flex gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-mama-yellow text-[10px] font-bold text-mama-green">
                {step.step}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-snug">{step.title}</p>
                <p className="text-[10px] leading-snug text-white/75">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-1.5 text-xs text-white/85">
          <p className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0 text-mama-yellow" />
            {MARKET_CONTACT.phone}
          </p>
          <p className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 shrink-0 text-mama-yellow" />
            {MARKET_CONTACT.email}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-mama-yellow" />
            {MARKET_LOCATION}, Ghana
          </p>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <Link
            href="/order"
            className="inline-flex rounded-full bg-mama-yellow px-4 py-2 text-xs font-semibold text-mama-ink transition hover:bg-mama-yellow-light"
          >
            Start Shopping
          </Link>
          <Link
            href="/track"
            className="inline-flex rounded-full border border-white/30 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            Track Order
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 shrink-0 border-t border-mama-border bg-white lg:static">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)] lg:max-w-none lg:px-0 lg:pb-0">
        {navItems.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);

          return (
            <Link
              key={label}
              href={href}
              className="group flex flex-1 flex-col items-center py-2 lg:py-1.5"
              aria-label={label}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full transition",
                  active ? "bg-mama-yellow text-mama-green" : "text-mama-muted"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
              </span>
              <span
                className={cn(
                  "mt-0.5 text-[10px] font-medium",
                  active ? "font-semibold text-mama-green" : "text-mama-muted"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({
  children,
  showSearch = true,
}: {
  children: React.ReactNode;
  showSearch?: boolean;
}) {
  return (
    <div className="min-h-screen bg-white lg:h-screen lg:overflow-hidden lg:bg-mama-beige/50">
      <div className="lg:mx-auto lg:flex lg:h-full lg:max-w-6xl lg:items-stretch lg:justify-center lg:gap-8 lg:px-8 lg:py-2 xl:max-w-7xl xl:gap-12">
        <DesktopBrandPanel />

        <div className="lg:flex lg:h-full lg:min-h-0 lg:w-[440px] lg:shrink-0 lg:flex-col lg:overflow-hidden lg:rounded-[2rem] lg:border lg:border-mama-border lg:bg-white lg:shadow-2xl xl:w-[460px]">
          <AppHeader showSearch={showSearch} />
          <main className="mx-auto w-full max-w-lg flex-1 overflow-y-auto px-4 pb-24 pt-4 lg:max-w-none lg:px-4 lg:pb-2 lg:pt-3">
            {children}
          </main>
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

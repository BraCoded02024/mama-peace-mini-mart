import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBasket,
  MapPin,
  Headphones,
  Banknote,
  Gauge,
  HandHeart,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MIN_ORDER_AMOUNT_GHS } from "@/lib/constants";

const actions = [
  {
    href: "/order",
    title: "Place a Pre-Order",
    subtitle: "Fresh stock ready for you",
    icon: ShoppingBasket,
    primary: true,
  },
  {
    href: "/track",
    title: "Track My Order",
    subtitle: "Real-time status updates",
    icon: MapPin,
    primary: false,
  },
  {
    href: "/support",
    title: "Customer Support",
    subtitle: "We're here to help",
    icon: Headphones,
    primary: false,
  },
];

export default function HomePage() {
  return (
    <AppShell>
      <div className="pin-pattern flex flex-col rounded-3xl px-1">
        <div className="text-center">
          <div className="relative mx-auto mb-4 h-40 w-40 sm:h-48 sm:w-48">
            <div className="h-full w-full overflow-hidden rounded-full bg-white shadow-md">
              <div className="relative h-full w-full">
                <Image
                  src="/images/logo.png"
                  alt="Mama Peace Mini Mart"
                  fill
                  className="object-contain p-4"
                  priority
                />
              </div>
            </div>
            <span className="absolute -bottom-1 right-2 z-10 rotate-[-8deg] rounded-lg bg-yellow-400 px-3 py-1 text-xs font-semibold text-mama-ink shadow-md">
              Open Daily
            </span>
          </div>

          <h1 className="font-serif text-2xl text-mama-ink sm:text-3xl">
            Welcome to Mama Peace
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-mama-muted">
            Groceries, provisions, fresh produce and household essentials
            delivered to your door.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          {actions.map(({ href, title, subtitle, icon: Icon, primary }) => (
            <Link
              key={href}
              href={href}
              className={
                primary
                  ? "flex items-center gap-4 rounded-2xl bg-mama-green px-5 py-4 text-white shadow-md transition hover:bg-mama-green-light"
                  : "flex items-center gap-4 rounded-2xl bg-mama-gray px-5 py-4 shadow-sm transition hover:bg-stone-200"
              }
            >
              <span
                className={
                  primary
                    ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15"
                    : "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white"
                }
              >
                <Icon
                  className={
                    primary
                      ? "h-6 w-6 text-white"
                      : "h-6 w-6 text-mama-brown"
                  }
                />
              </span>
              <span className="min-w-0">
                <span
                  className={
                    primary
                      ? "block font-serif text-lg text-white"
                      : "block font-serif text-lg text-mama-ink"
                  }
                >
                  {title}
                </span>
                <span
                  className={
                    primary
                      ? "block text-sm text-white/80"
                      : "block text-sm text-mama-muted"
                  }
                >
                  {subtitle}
                </span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-white/70 p-4 text-center">
          <div className="flex flex-col items-center gap-1.5">
            <Banknote className="h-6 w-6 text-mama-brown" />
            <span className="text-xs leading-tight text-mama-muted">
              Min Order
              <strong className="block text-sm text-mama-ink">GHC {MIN_ORDER_AMOUNT_GHS}</strong>
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5 border-x border-mama-border">
            <Gauge className="h-6 w-6 text-mama-brown" />
            <span className="text-xs leading-tight text-mama-muted">
              Delivery
              <strong className="block text-sm text-mama-ink">Under 45 Min</strong>
            </span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <HandHeart className="h-6 w-6 text-mama-brown" />
            <span className="text-xs leading-tight text-mama-muted">
              Community
              <strong className="block text-sm text-mama-ink">Trusted</strong>
            </span>
          </div>
        </div>

        <p className="mt-6 flex justify-center pb-2">
          <a
            href="https://bernardowusu.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-mama-border bg-white/90 px-4 py-2 text-xs text-mama-muted shadow-sm backdrop-blur transition hover:border-mama-green/40 hover:text-mama-green"
          >
            Developed by{" "}
            <span className="font-semibold tracking-wide text-mama-ink">
              Codetechs
            </span>
          </a>
        </p>
      </div>
    </AppShell>
  );
}

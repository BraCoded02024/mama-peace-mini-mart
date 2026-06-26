import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBasket,
  MapPin,
  Headphones,
  Banknote,
  Gauge,
  HandHeart,
  ShoppingCart,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MIN_ORDER_AMOUNT_GHS } from "@/lib/constants";

export default function HomePage() {
  return (
    <AppShell>
      <div className="pin-pattern rounded-3xl px-1 pb-2">
        <div className="relative mx-auto mb-5 h-56 w-56 overflow-hidden rounded-full bg-white shadow-md">
          <Image
            src="/images/logo.png"
            alt="Mama Peace Mini Mart"
            fill
            className="object-contain p-4"
            priority
          />
          <span className="absolute -bottom-2 right-2 rotate-[-8deg] rounded-lg bg-yellow-400 px-3 py-1 text-xs font-semibold shadow">
            Open Daily
          </span>
        </div>

        <div className="text-center">
          <h1 className="font-serif text-2xl text-mama-ink">
            Welcome to Mama Peace Mini Mart
          </h1>
          <p className="mt-3 font-serif text-sm italic leading-relaxed text-mama-muted">
            Groceries, provisions, fresh produce, beverages, household essentials
            and more delivered conveniently to your location.
          </p>
          <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-mama-brown">
            <span className="h-px flex-1 bg-mama-border" />
            Delivered with care
            <span className="h-px flex-1 bg-mama-border" />
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/order"
            className="flex items-center gap-4 rounded-2xl bg-mama-green px-5 py-5 text-white shadow-md transition hover:bg-mama-green-light"
          >
            <ShoppingBasket className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-serif text-lg">Place a Pre-Order</p>
              <p className="text-sm text-white/80">Fresh stock ready for you</p>
            </div>
          </Link>

          <Link
            href="/track"
            className="flex items-center gap-4 rounded-2xl bg-mama-gray px-5 py-5 shadow-sm transition hover:bg-stone-200"
          >
            <MapPin className="h-6 w-6 shrink-0 text-mama-brown" />
            <div>
              <p className="font-serif text-lg text-mama-ink">Track My Order</p>
              <p className="text-sm text-mama-muted">Real-time status updates</p>
            </div>
          </Link>

          <Link
            href="/support"
            className="flex items-center gap-4 rounded-2xl bg-mama-gray px-5 py-5 shadow-sm transition hover:bg-stone-200"
          >
            <Headphones className="h-6 w-6 shrink-0 text-mama-ink" />
            <div>
              <p className="font-serif text-lg text-mama-ink">Customer Support</p>
              <p className="text-sm text-mama-muted">We&apos;re here to help</p>
            </div>
          </Link>
        </div>

        <div className="mt-6 space-y-3 rounded-2xl bg-white/70 p-4">
          <div className="flex items-center gap-3 text-sm">
            <Banknote className="h-5 w-5 text-mama-brown" />
            <span>
              Minimum Order <strong>GHC {MIN_ORDER_AMOUNT_GHS}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Gauge className="h-5 w-5 text-mama-brown" />
            <span>
              Fast Delivery <strong>Under 45 Mins</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <HandHeart className="h-5 w-5 text-mama-brown" />
            <span>
              Community <strong>Trusted</strong>
            </span>
          </div>
        </div>

        <Link
          href="/order"
          className="fixed bottom-20 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-mama-brown text-white shadow-lg"
          aria-label="Quick pre-order"
        >
          <ShoppingCart className="h-5 w-5" />
        </Link>
      </div>
    </AppShell>
  );
}

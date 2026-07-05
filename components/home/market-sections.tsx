import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ShoppingBag,
  ClipboardList,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import {
  whyShopItems,
  howItWorksSteps,
  helpCards,
  footerQuickLinks,
  MARKET_LOCATION,
  MARKET_CONTACT,
} from "@/lib/market-data";

export function MarketWhyShop() {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-mama-border/60">
      <h2 className="font-serif text-base font-bold text-mama-green">Why Shop With Us</h2>
      <ul className="mt-3 space-y-2.5">
        {whyShopItems.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-sm text-mama-ink">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-mama-green" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MarketDeliveryBanner() {
  return (
    <section className="overflow-hidden rounded-2xl bg-mama-beige">
      <div className="relative flex min-h-[120px] items-center">
        <div className="relative z-10 flex-1 px-4 py-4">
          <h2 className="font-serif text-sm font-bold text-mama-green">
            Fast &amp; Reliable Delivery
          </h2>
          <p className="mt-1 max-w-[140px] text-[11px] leading-relaxed text-mama-muted">
            Your order delivered fresh to your doorstep across {MARKET_LOCATION}.
          </p>
        </div>
        <div className="relative h-[120px] w-[45%] shrink-0">
          <Image
            src="/images/market/deliverypng.png"
            alt="Mama Peace delivery"
            fill
            sizes="200px"
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  );
}

export function MarketHowItWorks() {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-mama-border/60">
      <h2 className="font-serif text-base font-bold text-mama-green">How It Works</h2>
      <div className="relative mt-4 space-y-5 pl-2">
        <div className="absolute bottom-4 left-[19px] top-4 w-px border-l-2 border-dashed border-mama-green/25" />
        {howItWorksSteps.map((item) => (
          <div key={item.step} className="relative flex gap-3">
            <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mama-green text-sm font-bold text-white shadow-sm">
              {item.step}
            </span>
            <div className="pt-1.5">
              <p className="text-sm font-semibold text-mama-ink">{item.title}</p>
              <p className="text-xs text-mama-muted">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const helpIcons = [ShoppingBag, ClipboardList, MessageCircle];

export function MarketHelpSection() {
  return (
    <section>
      <h2 className="mb-3 font-serif text-base font-bold text-mama-green">
        We&apos;re Here To Help
      </h2>
      <div className="space-y-3">
        {helpCards.map((card, index) => {
          const Icon = helpIcons[index];
          return (
            <div
              key={card.title}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-mama-border/60"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mama-green/10">
                  <Icon className="h-5 w-5 text-mama-green" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-mama-ink">{card.title}</p>
                  <p className="mt-0.5 text-xs text-mama-muted">{card.description}</p>
                  <Link
                    href={card.href}
                    className="mt-3 inline-flex rounded-full bg-mama-green px-4 py-2 text-xs font-semibold text-white transition hover:bg-mama-green-light"
                  >
                    {card.cta}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function MarketDownloadBanner() {
  return (
    <section className="rounded-2xl bg-mama-yellow px-4 py-5">
      <h2 className="font-serif text-base font-bold text-mama-green">Stay Updated on Your Order</h2>
      <p className="mt-1.5 text-xs leading-relaxed text-mama-ink/80">
        No app needed. We keep you informed every step of the way.
      </p>
      <ul className="mt-3 space-y-2.5">
        <li className="flex items-start gap-2.5 text-xs text-mama-ink/90">
          <Mail className="mt-0.5 h-4 w-4 shrink-0 text-mama-green" />
          <span>
            Add your email when ordering to get updates and payment links in your inbox.
          </span>
        </li>
        <li className="flex items-start gap-2.5 text-xs text-mama-ink/90">
          <ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-mama-green" />
          <span>
            Track anytime with your phone number and full name, or your order reference
            number.
          </span>
        </li>
      </ul>
      <Link
        href="/track"
        className="mt-4 inline-flex rounded-full bg-mama-green px-4 py-2 text-xs font-semibold text-white transition hover:bg-mama-green-light"
      >
        Track My Order
      </Link>
    </section>
  );
}

export function MarketFooter() {
  return (
    <footer id="about" className="-mx-4 scroll-mt-24">
      <div className="bg-mama-green px-4 pb-4 pt-6 text-white">
        <div className="flex items-center gap-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white">
            <Image
              src="/images/logo.png"
              alt="Mama Peace Mini Mart"
              fill
              sizes="40px"
              className="object-contain p-1"
            />
          </div>
          <div>
            <p className="font-serif text-sm font-bold text-white">MamaPeace</p>
            <p className="text-[10px] font-semibold tracking-wide text-mama-yellow-light">
              MINI MART
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-white/80">
          Your neighbourhood mini mart for fresh groceries, provisions, and household
          essentials — delivered with care across {MARKET_LOCATION}.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold text-mama-yellow">Quick Links</p>
            <ul className="mt-2 space-y-1.5">
              {footerQuickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[11px] text-white/80 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-mama-yellow">Contact Us</p>
            <ul className="mt-2 space-y-2 text-[11px] text-white/80">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mama-yellow" />
                {MARKET_CONTACT.phone}
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mama-yellow" />
                {MARKET_CONTACT.email}
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mama-yellow" />
                {MARKET_LOCATION}, Ghana
              </li>
            </ul>
            <div className="mt-3 flex gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold text-white">
                f
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold text-white">
                ig
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
                <MessageCircle className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-mama-ink px-4 py-3 text-center text-[10px] text-white/80">
        <p>© {new Date().getFullYear()} Mama Peace Mini Mart. All rights reserved.</p>
        <p className="mt-1">Delivery Across {MARKET_LOCATION} and Surrounding Areas</p>
      </div>
    </footer>
  );
}

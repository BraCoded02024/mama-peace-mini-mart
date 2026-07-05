import Image from "next/image";
import Link from "next/link";
import { Shield, Leaf, LayoutGrid, Users } from "lucide-react";
import { marketFeatures } from "@/lib/market-data";

const featureIcons = [Shield, Leaf, LayoutGrid, Users];

export function MarketFeatures() {
  return (
    <section className="grid grid-cols-4 gap-2 px-1 lg:gap-1.5">
      {marketFeatures.map((feature, index) => {
        const Icon = featureIcons[index];
        return (
          <div key={feature.title} className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-mama-green/20 bg-white shadow-sm lg:h-11 lg:w-11">
              <Icon className="h-6 w-6 text-mama-green lg:h-5 lg:w-5" strokeWidth={1.75} />
            </span>
            <p className="mt-2 text-[10px] font-semibold leading-tight text-mama-ink lg:mt-1.5 lg:text-[9px]">
              {feature.title}
            </p>
            <p className="text-[9px] leading-tight text-mama-muted">{feature.subtitle}</p>
          </div>
        );
      })}
    </section>
  );
}

export function MarketHero() {
  return (
    <section className="overflow-hidden rounded-2xl">
      {/* home.png is 1536×1024 — button sits lower-left under the copy */}
      <div className="relative w-full max-lg:aspect-[3/2] lg:h-[168px]">
        <Image
          src="/images/market/home.png"
          alt="Your Trusted Mini Mart — Mama Peace"
          fill
          className="object-cover max-lg:object-center lg:object-top"
          priority
          sizes="(max-width: 440px) 100vw, 440px"
        />
        <Link
          href="/order"
          aria-label="Shop now"
          className="absolute z-20 left-[5.5%] top-[58%] h-[7.5%] w-[26%] max-w-[200px] cursor-pointer touch-manipulation rounded-lg before:absolute before:-inset-x-1 before:-inset-y-2 before:content-[''] active:before:bg-mama-green/10"
        />
      </div>
    </section>
  );
}

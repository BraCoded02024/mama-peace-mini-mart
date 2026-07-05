"use client";

import Image from "next/image";
import { marketProducts } from "@/lib/market-data";

const showcaseItems = [...marketProducts, ...marketProducts];

export function MarketProductShowcase() {
  return (
    <section aria-label="Product showcase">
      <div className="mb-3 lg:mb-2">
        <h2 className="font-serif text-base font-bold text-mama-green lg:text-sm">Our Products</h2>
        <p className="mt-0.5 text-xs text-mama-muted lg:text-[10px]">Fresh picks from our shelves</p>
      </div>

      <div className="showcase-marquee relative -mx-4 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-white to-transparent" />

        <div className="showcase-marquee-track flex w-max gap-4 px-4 lg:gap-3">
          {showcaseItems.map((product, index) => (
            <figure
              key={`${product.id}-${index}`}
              className="w-[140px] shrink-0 sm:w-[160px] lg:w-[118px]"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-mama-gray shadow-md ring-1 ring-mama-border/40 lg:rounded-xl">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="160px"
                  className="object-cover"
                  draggable={false}
                />
              </div>
              <figcaption className="mt-2 text-center text-[10px] font-medium text-mama-muted">
                {product.name}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { marketCategories } from "@/lib/market-data";

function SectionHeading({
  title,
  href,
  linkLabel = "View all",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between lg:mb-2">
      <h2 className="font-serif text-base font-bold text-mama-green lg:text-sm">{title}</h2>
      {href && (
        <Link href={href} className="text-xs font-semibold text-mama-green">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

export function MarketCategories() {
  return (
    <section id="categories" className="scroll-mt-24">
      <SectionHeading title="Shop by Category" href="/order" />
      <div className="grid grid-cols-4 gap-2.5 lg:gap-2">
        {marketCategories.map((category) => (
          <Link
            key={category.id}
            href={`/order?category=${category.id}`}
            className="group flex flex-col items-center"
          >
            <div className="relative h-[72px] w-full overflow-hidden rounded-xl bg-mama-gray shadow-sm ring-1 ring-mama-border/60 transition group-hover:ring-mama-green/30 lg:h-[58px]">
              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="90px"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
            </div>
            <p className="mt-1.5 text-center text-[10px] font-medium leading-tight text-mama-ink">
              {category.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

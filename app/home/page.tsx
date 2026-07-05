import { AppShell } from "@/components/layout/app-shell";
import { MarketHero, MarketFeatures } from "@/components/home/market-hero";
import { MarketCategories } from "@/components/home/market-catalog";
import { MarketProductShowcase } from "@/components/home/market-product-showcase";
import {
  MarketWhyShop,
  MarketDeliveryBanner,
  MarketHowItWorks,
  MarketHelpSection,
  MarketDownloadBanner,
  MarketFooter,
} from "@/components/home/market-sections";

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-5 lg:space-y-3">
        <MarketHero />
        <MarketFeatures />
        <MarketCategories />
        <MarketProductShowcase />
        <MarketWhyShop />
        <MarketDeliveryBanner />
        <MarketHowItWorks />
        <MarketHelpSection />
        <MarketDownloadBanner />
        <MarketFooter />
      </div>
    </AppShell>
  );
}

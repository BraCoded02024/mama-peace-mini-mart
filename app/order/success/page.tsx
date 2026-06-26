import Link from "next/link";
import { CheckCircle2, HelpCircle, Info, MapPin, Home } from "lucide-react";
import { TrustFooter } from "@/components/order/trust-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const referenceNumber = ref ?? "MP-2026-0000";

  return (
    <div className="min-h-screen bg-mama-cream">
      <header className="flex items-center justify-between px-4 py-4">
        <Link href="/home" className="font-serif text-xl italic text-mama-ink">
          Mama Peace
        </Link>
        <HelpCircle className="h-6 w-6 text-mama-muted" />
      </header>

      <main className="mx-auto max-w-lg px-4 pb-10">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-mama-green">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-mama-ink">
            Order Submitted Successfully
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-mama-muted">
            Your grocery request has been received. We&apos;re getting things
            ready for you with the same care you&apos;d give your own family.
          </p>
        </div>

        <Card className="mt-8">
          <CardContent className="space-y-4 pt-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-mama-muted">
                Reference Number
              </p>
              <p className="font-serif text-2xl text-mama-ink">{referenceNumber}</p>
            </div>

            <Badge variant="warning">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
              Pending Review
            </Badge>

            <div className="rounded-xl border-l-4 border-mama-brown bg-amber-50 p-4">
              <div className="flex gap-2">
                <Info className="h-5 w-5 shrink-0 text-mama-brown" />
                <div>
                  <p className="font-medium">What&apos;s Next?</p>
                  <p className="mt-1 text-sm text-mama-muted">
                    Mama Peace is reviewing your request. You&apos;ll receive an
                    email once pricing is confirmed or if we need to update you
                    on availability.
                  </p>
                </div>
              </div>
            </div>

            <Button asChild className="w-full">
              <Link href={`/track/${encodeURIComponent(referenceNumber)}`}>
                <MapPin className="h-4 w-4" />
                Track Order
              </Link>
            </Button>

            <Button asChild variant="secondary" className="w-full">
              <Link href="/home">
                <Home className="h-4 w-4" />
                Back To Home
              </Link>
            </Button>
          </CardContent>
        </Card>

        <TrustFooter />
      </main>
    </div>
  );
}

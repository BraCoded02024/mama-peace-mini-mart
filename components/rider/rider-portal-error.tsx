import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RiderPortalError({
  message,
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mama-cream px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl text-mama-ink">
              Rider portal unavailable
            </h1>
            <p className="mt-2 text-sm text-mama-muted">
              {message ??
                "The server could not load rider orders. This is usually a database setup issue on production."}
            </p>
            <p className="mt-3 text-sm text-mama-muted">
              Ask the store admin to run the database update script, then try
              again.
            </p>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/riders/login">Back to login</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/home">Go to store</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

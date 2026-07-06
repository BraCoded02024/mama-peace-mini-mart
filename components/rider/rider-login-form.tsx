"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Phone, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";

export function RiderLoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/rider-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, pin }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Login failed");
      setLoading(false);
      return;
    }

    router.push("/riders");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-mama-cream px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full border border-mama-border bg-white">
            <Image
              src="/images/logo.png"
              alt="Mama Peace Mini Mart"
              fill
              sizes="44px"
              className="object-contain p-1.5"
            />
          </div>
          <div>
            <p className="font-serif text-lg text-mama-ink">Mama Peace</p>
            <p className="text-xs text-mama-muted">Rider Portal</p>
          </div>
        </div>

        <h1 className="font-serif text-3xl text-mama-ink">Rider sign in</h1>
        <p className="mt-2 text-sm text-mama-muted">
          Enter your phone number and 4-digit PIN.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-mama-muted" />
              <PhoneNumberInput
                id="phone"
                value={phone}
                onChange={setPhone}
                className="pl-11"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin">PIN</Label>
            <Input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="4-digit PIN"
              required
            />
          </div>

          {error && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-8 flex items-center justify-center gap-2 text-xs text-mama-muted">
          <ShieldCheck className="h-4 w-4" />
          Mama Peace delivery riders only
        </p>
      </div>
    </div>
  );
}

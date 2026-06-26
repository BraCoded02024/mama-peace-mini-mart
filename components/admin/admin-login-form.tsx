"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, User, Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Login failed");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-mama-green p-12 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/5" />

        <div className="relative flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white">
            <Image
              src="/images/logo.png"
              alt="Mama Peace Mini Mart"
              fill
              sizes="48px"
              className="object-contain p-1.5"
            />
          </div>
          <div>
            <p className="font-serif text-xl">Mama Peace</p>
            <p className="text-xs text-mama-cream/70">Admin Console</p>
          </div>
        </div>

        <div className="relative">
          <h2 className="font-serif text-4xl leading-tight">
            Manage orders with calm and clarity.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-mama-cream/80">
            Review requests, set pricing, reply to customers and keep every
            delivery on track — all from one place.
          </p>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-mama-cream/70">
          <ShieldCheck className="h-4 w-4" />
          Secure, private access for Mama Peace staff only.
        </div>
      </div>

      <div className="flex items-center justify-center bg-mama-cream px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
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
              <p className="text-xs text-mama-muted">Admin Console</p>
            </div>
          </div>

          <h1 className="font-serif text-3xl text-mama-ink">Welcome back</h1>
          <p className="mt-2 text-sm text-mama-muted">
            Sign in to manage orders and customer requests.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-mama-muted" />
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="pl-11"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-mama-muted" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="px-11"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 rounded-lg p-1 text-mama-muted transition hover:bg-mama-gray hover:text-mama-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-mama-muted">
            Mama Peace Mini Mart · Staff access only
          </p>
        </div>
      </div>
    </div>
  );
}

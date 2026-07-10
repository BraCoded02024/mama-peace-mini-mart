"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SPLASH_DURATION_MS = 1000;
const SPLASH_SEEN_KEY = "mama_peace_splash_seen";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function SplashScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [skipAnimation, setSkipAnimation] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SPLASH_SEEN_KEY)) {
        setSkipAnimation(true);
        router.replace("/home");
        return;
      }
    } catch {
      // ignore storage errors
    }

    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(1, elapsed / SPLASH_DURATION_MS);
      const next = easeOutCubic(ratio) * 100;
      setProgress(next);

      if (ratio >= 1) {
        try {
          sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
        } catch {
          // ignore
        }
        router.replace("/home");
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [router]);

  if (skipAnimation) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="relative min-h-0 flex-1">
        <Image
          src="/images/splash.png"
          alt="Mama Peace Mini Mart"
          fill
          priority
          className="object-contain p-4 sm:p-8"
        />
      </div>

      <p className="shrink-0 px-8 pb-2 text-center font-serif text-xs italic leading-relaxed tracking-wide text-mama-muted sm:px-12 sm:text-sm">
        If God be for Us,
        <br />
        who can stand against us
      </p>

      <div className="shrink-0 px-8 pb-10 pt-4 sm:px-12 sm:pb-12">
        <p className="mb-3 text-center text-xs font-medium tracking-wide text-mama-muted">
          Getting things ready
        </p>
        <div
          className="h-1 w-full overflow-hidden rounded-full bg-mama-border"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Loading"
        >
          <div
            className="h-full rounded-full bg-mama-green transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

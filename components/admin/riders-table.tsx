"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, KeyRound, Loader2 } from "lucide-react";
import { setRiderStatusAction, resetRiderPinAction } from "@/app/actions/riders";
import { RIDER_STATUS_LABELS } from "@/lib/constants";
import { toTelHref } from "@/lib/phone";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Rider } from "@prisma/client";

export function RidersTable({ riders }: { riders: Rider[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [resetRiderId, setResetRiderId] = useState<string | null>(null);
  const [newPin, setNewPin] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return riders;
    return riders.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.phone.includes(q) ||
        r.area.toLowerCase().includes(q) ||
        (r.motorbikeNumber?.toLowerCase().includes(q) ?? false)
    );
  }, [riders, query]);

  async function handleStatus(riderId: string, status: "ACTIVE" | "INACTIVE") {
    setLoadingId(riderId);
    await setRiderStatusAction(riderId, status);
    setLoadingId(null);
    router.refresh();
  }

  async function handleResetPin(e: React.FormEvent) {
    e.preventDefault();
    if (!resetRiderId) return;
    setError("");
    setLoadingId(resetRiderId);
    const result = await resetRiderPinAction(resetRiderId, newPin);
    setLoadingId(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setResetRiderId(null);
    setNewPin("");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone, area, or motorbike..."
          className="max-w-md"
        />
        <Link href="/admin/riders/new">
          <Button>+ Add Rider</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-mama-border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-mama-border bg-mama-gray/50 text-xs uppercase tracking-wider text-mama-muted">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone Number</th>
                <th className="px-4 py-3 font-semibold">Area</th>
                <th className="px-4 py-3 font-semibold">Motorbike Number</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mama-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-mama-muted">
                    {riders.length === 0
                      ? "No riders yet. Add your first delivery rider."
                      : "No riders match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((rider) => (
                  <tr key={rider.id} className="hover:bg-mama-gray/30">
                    <td className="px-4 py-3 font-medium text-mama-ink">
                      {rider.name}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={toTelHref(rider.phone)}
                        className="text-mama-green hover:underline"
                      >
                        {rider.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-mama-muted">{rider.area}</td>
                    <td className="px-4 py-3 text-mama-muted">
                      {rider.motorbikeNumber ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={rider.status === "ACTIVE" ? "success" : "muted"}
                      >
                        {RIDER_STATUS_LABELS[rider.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Link href={`/admin/riders/${rider.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </Link>
                        {rider.status === "INACTIVE" ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={loadingId === rider.id}
                            onClick={() => handleStatus(rider.id, "ACTIVE")}
                          >
                            Activate
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={loadingId === rider.id}
                            onClick={() => handleStatus(rider.id, "INACTIVE")}
                          >
                            Deactivate
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setResetRiderId(rider.id);
                            setNewPin("");
                            setError("");
                          }}
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                          Reset PIN
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-mama-muted">
          Showing {filtered.length} of {riders.length} riders · Last updated{" "}
          {formatDate(new Date())}
        </p>
      )}

      {resetRiderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleResetPin}
            className="w-full max-w-sm rounded-2xl border border-mama-border bg-white p-6 shadow-xl"
          >
            <h3 className="font-serif text-lg text-mama-ink">Reset Rider PIN</h3>
            <p className="mt-1 text-sm text-mama-muted">
              Enter a new 4-digit PIN for this rider.
            </p>
            <div className="mt-4 space-y-2">
              <Input
                value={newPin}
                onChange={(e) =>
                  setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="4-digit PIN"
                inputMode="numeric"
                maxLength={4}
                required
              />
              {error && (
                <p className="text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
            </div>
            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setResetRiderId(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loadingId === resetRiderId}
              >
                {loadingId === resetRiderId && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Save PIN
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

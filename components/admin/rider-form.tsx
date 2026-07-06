"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  createRiderAction,
  updateRiderAction,
} from "@/app/actions/riders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import type { Rider, RiderStatus } from "@prisma/client";

type RiderFormProps = {
  mode: "create" | "edit";
  rider?: Rider;
};

export function RiderForm({ mode, rider }: RiderFormProps) {
  const router = useRouter();
  const [name, setName] = useState(rider?.name ?? "");
  const [phone, setPhone] = useState(rider?.phone ?? "");
  const [pin, setPin] = useState("");
  const [area, setArea] = useState(rider?.area ?? "");
  const [motorbikeNumber, setMotorbikeNumber] = useState(
    rider?.motorbikeNumber ?? ""
  );
  const [status, setStatus] = useState<RiderStatus>(
    rider?.status ?? "ACTIVE"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result =
      mode === "create"
        ? await createRiderAction({
            name,
            phone,
            pin,
            area,
            motorbikeNumber: motorbikeNumber || undefined,
            status,
          })
        : await updateRiderAction({
            riderId: rider!.id,
            name,
            phone,
            area,
            motorbikeNumber: motorbikeNumber || undefined,
            status,
          });

    setLoading(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push("/admin/riders");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Rider full name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <PhoneNumberInput
          id="phone"
          value={phone}
          onChange={setPhone}
          required
        />
      </div>

      {mode === "create" && (
        <div className="space-y-2">
          <Label htmlFor="pin">PIN (4 digits)</Label>
          <Input
            id="pin"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="4-digit PIN"
            inputMode="numeric"
            maxLength={4}
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="area">Area</Label>
        <Input
          id="area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          placeholder="e.g. East Legon, Osu"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="motorbike">Motorbike Number (optional)</Label>
        <Input
          id="motorbike"
          value={motorbikeNumber}
          onChange={(e) => setMotorbikeNumber(e.target.value)}
          placeholder="e.g. GR-1234-21"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as RiderStatus)}
          className="flex h-11 w-full rounded-xl border border-mama-border bg-white px-3.5 text-sm text-mama-ink outline-none focus:border-mama-green focus:ring-2 focus:ring-mama-green/20"
        >
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/admin/riders" className="flex-1">
          <Button type="button" variant="outline" className="w-full">
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </Button>
        </Link>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Add Rider" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

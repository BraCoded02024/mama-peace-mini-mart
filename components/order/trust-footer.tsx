"use client";

import {
  CheckCircle2,
  Shield,
  Bike,
  Heart,
  Package,
  Truck,
  MapPin,
  BadgeCheck,
} from "lucide-react";

export function TrustFooter() {
  return (
    <div className="mt-8 flex items-center justify-around text-[10px] uppercase tracking-wider text-mama-muted">
      <div className="flex flex-col items-center gap-1">
        <Shield className="h-4 w-4" />
        Trusted
      </div>
      <div className="flex flex-col items-center gap-1">
        <Bike className="h-4 w-4" />
        Fast
      </div>
      <div className="flex flex-col items-center gap-1">
        <Heart className="h-4 w-4" />
        Fresh
      </div>
    </div>
  );
}

const DELIVERY_STAGES = [
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", icon: Package },
  { key: "transit", label: "On the Way", icon: Bike },
  { key: "delivered", label: "Delivered", icon: BadgeCheck },
];

function deliveryStageIndex(status?: string) {
  switch (status) {
    case "PAID":
      return 0;
    case "PREPARING":
      return 1;
    case "ON_THE_WAY":
      return 2;
    case "DELIVERED":
      return 3;
    default:
      return -1;
  }
}

export function DeliveryStatusGrid({ status }: { status?: string }) {
  const activeIndex = deliveryStageIndex(status);

  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      {DELIVERY_STAGES.map(({ key, label, icon: Icon }, index) => {
        const done = index < activeIndex;
        const current = index === activeIndex;
        const reached = index <= activeIndex;

        return (
          <div
            key={key}
            className={`flex flex-col items-center gap-2 rounded-2xl px-4 py-5 text-sm transition-colors ${
              current
                ? "bg-mama-green text-white shadow-sm"
                : done
                  ? "bg-mama-green/10 text-mama-green"
                  : "bg-mama-gray text-mama-muted"
            }`}
          >
            <Icon
              className={`h-6 w-6 ${reached ? (current ? "text-white" : "text-mama-green") : "text-mama-muted"}`}
            />
            {label}
          </div>
        );
      })}
    </div>
  );
}

export function OrderProgressSteps({
  status,
}: {
  status: string;
}) {
  const steps = [
    { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { key: "preparing", label: "Preparing", icon: Package },
    { key: "transit", label: "On the Way", icon: Truck },
    { key: "delivered", label: "Delivered", icon: MapPin },
  ];

  const activeIndex =
    status === "PAID"
      ? 0
      : status === "PREPARING"
        ? 1
        : status === "ON_THE_WAY"
          ? 2
          : status === "DELIVERED"
            ? 3
            : -1;

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-serif text-lg">Next Steps</h3>
        {activeIndex >= 0 && (
          <span className="text-sm text-mama-orange-dark">In progress</span>
        )}
      </div>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const active = index <= activeIndex;
          return (
            <div key={step.key} className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  active ? "bg-mama-green text-white" : "bg-mama-gray text-mama-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={`mt-2 text-[10px] ${
                  active ? "font-semibold text-mama-ink" : "text-mama-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

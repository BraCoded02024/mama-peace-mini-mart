import { cn } from "@/lib/utils";

const steps = ["Customer Details", "Shopping List", "Submit"];

export function OrderStepper({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-2">
        {steps.map((label, index) => {
          const step = index + 1;
          const active = step === currentStep;
          const completed = step < currentStep;

          return (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold",
                  completed || active
                    ? "bg-mama-green text-white"
                    : "bg-mama-gray text-mama-muted"
                )}
              >
                {step}
              </div>
              <span
                className={cn(
                  "mt-2 hidden text-center text-[10px] sm:block",
                  active ? "font-semibold text-mama-brown" : "text-mama-muted"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 h-0.5 w-full rounded bg-mama-gray">
        <div
          className="h-full rounded bg-mama-brown transition-all"
          style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
        />
      </div>
    </div>
  );
}

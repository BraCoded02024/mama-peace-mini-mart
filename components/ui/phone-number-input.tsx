"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { PHONE_DIGIT_LENGTH, sanitizePhoneInput } from "@/lib/phone";
import { cn } from "@/lib/utils";

type PhoneNumberInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "onChange" | "maxLength" | "minLength" | "inputMode" | "pattern"
> & {
  value: string;
  onChange: (value: string) => void;
};

export const PhoneNumberInput = React.forwardRef<
  HTMLInputElement,
  PhoneNumberInputProps
>(({ value, onChange, className, placeholder = "e.g. 0241234567", ...props }, ref) => {
  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = sanitizePhoneInput(e.clipboardData.getData("text"));
    const input = e.currentTarget;
    const start = input.selectionStart ?? value.length;
    const end = input.selectionEnd ?? value.length;
    onChange(sanitizePhoneInput(value.slice(0, start) + pasted + value.slice(end)));
  }

  return (
    <Input
      ref={ref}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      pattern={`\\d{${PHONE_DIGIT_LENGTH}}`}
      minLength={PHONE_DIGIT_LENGTH}
      maxLength={PHONE_DIGIT_LENGTH}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(sanitizePhoneInput(e.target.value))}
      onPaste={handlePaste}
      className={cn(className)}
      {...props}
    />
  );
});
PhoneNumberInput.displayName = "PhoneNumberInput";

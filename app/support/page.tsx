"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { createComplaintAction } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  { value: "ENQUIRY", label: "Make an Enquiry" },
  { value: "COMPLAINT", label: "File a Complaint" },
  { value: "GENERAL", label: "General Support" },
];

export default function SupportPage() {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("ENQUIRY");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createComplaintAction({ name, phoneNumber, category, message });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-mama-ink">Customer Support</h1>
        <p className="mt-2 text-sm text-mama-muted">
          Make enquiries or share a complaint. Mama Peace will respond by email
          or phone.
        </p>
      </div>

      {submitted ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="font-serif text-xl">Message Received</p>
            <p className="mt-2 text-sm text-mama-muted">
              Thank you, {name}. We&apos;ll get back to you shortly.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Request Type</Label>
                <div className="grid gap-2">
                  {categories.map((cat) => (
                    <label
                      key={cat.value}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm ${
                        category === cat.value
                          ? "border-mama-green bg-emerald-50"
                          : "border-mama-border"
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={category === cat.value}
                        onChange={() => setCategory(cat.value)}
                        className="accent-mama-green"
                      />
                      {cat.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}

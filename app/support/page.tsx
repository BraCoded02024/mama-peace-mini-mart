"use client";

import { useState } from "react";
import {
  Headphones,
  Shield,
  Lock,
  Users,
  Zap,
  CheckCircle2,
  MessageCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { createComplaintAction } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const categories = [
  {
    value: "ENQUIRY",
    label: "Make an Enquiry",
    description: "Ask about products, delivery, or pricing",
    icon: HelpCircle,
  },
  {
    value: "COMPLAINT",
    label: "File a Complaint",
    description: "Tell us what went wrong — we'll make it right",
    icon: AlertCircle,
  },
  {
    value: "GENERAL",
    label: "General Support",
    description: "Anything else we can help with",
    icon: MessageCircle,
  },
];

const trustBadges = [
  {
    icon: Zap,
    title: "Service Online",
    text: "Our team is active and your message goes straight to Mama Peace.",
  },
  {
    icon: Users,
    title: "Trusted Daily",
    text: "Hundreds of neighbours order through us — you're in good company.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    text: "Your details are handled with care on an encrypted connection.",
  },
  {
    icon: Lock,
    title: "Encrypted in Transit",
    text: "Messages are protected end-to-end over a secure HTTPS link.",
  },
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
    <AppShell showSearch={false}>
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mama-green/10 text-mama-green">
            <Headphones className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-serif text-2xl text-mama-ink">Customer Support</h1>
            <p className="text-sm text-mama-muted">
              Enquiries, complaints &amp; help — we&apos;re here for you.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-5 overflow-hidden rounded-2xl border border-mama-green/25 bg-gradient-to-br from-mama-green/10 via-white to-mama-cream/40 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="relative mt-0.5 flex h-3 w-3 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mama-green opacity-40" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-mama-green" />
          </span>
          <div>
            <p className="font-medium text-mama-ink">We&apos;re online &amp; running</p>
            <p className="mt-1 text-sm leading-relaxed text-mama-muted">
              Mama Peace Mini Mart is serving customers right now. Because so many
              people use our system every day, responses may take a little longer at
              busy times — but we read every message and will get back to you shortly.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {trustBadges.map((badge) => (
          <div
            key={badge.title}
            className="rounded-xl border border-mama-border bg-white p-3 text-center sm:p-4"
          >
            <badge.icon className="mx-auto h-5 w-5 text-mama-green" />
            <p className="mt-2 text-xs font-semibold text-mama-ink sm:text-sm">
              {badge.title}
            </p>
            <p className="mt-1 hidden text-[11px] leading-snug text-mama-muted sm:block">
              {badge.text}
            </p>
          </div>
        ))}
      </div>

      {submitted ? (
        <Card className="overflow-hidden border-mama-green/30">
          <div className="bg-mama-green px-5 py-6 text-center text-white">
            <CheckCircle2 className="mx-auto h-10 w-10 text-mama-cream" />
            <p className="mt-3 font-serif text-xl">Message Received</p>
          </div>
          <CardContent className="space-y-3 pt-6 text-center">
            <p className="text-sm text-mama-ink">
              Thank you, <span className="font-medium">{name}</span>. Your message is
              in our queue.
            </p>
            <p className="text-sm leading-relaxed text-mama-muted">
              Our service is running and your request is secure. With many customers
              reaching out each day, please allow a little time — Mama Peace will
              respond by phone or email as soon as possible.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-mama-muted">
              <span className="inline-flex items-center gap-1 rounded-full bg-mama-gray px-3 py-1">
                <Lock className="h-3 w-3 text-mama-green" />
                Encrypted connection
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-mama-gray px-3 py-1">
                <Users className="h-3 w-3 text-mama-green" />
                Response coming soon
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>What can we help with?</Label>
                <div className="grid gap-2">
                  {categories.map((cat) => (
                    <label
                      key={cat.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
                        category === cat.value
                          ? "border-mama-green bg-mama-green/10"
                          : "border-mama-border hover:border-mama-green/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        checked={category === cat.value}
                        onChange={() => setCategory(cat.value)}
                        className="mt-1 accent-mama-green"
                      />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-medium text-mama-ink">
                          <cat.icon className="h-4 w-4 text-mama-green" />
                          {cat.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-mama-muted">
                          {cat.description}
                        </span>
                      </span>
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
                  placeholder="As we should address you"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <PhoneNumberInput
                  id="phone"
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  placeholder="10-digit number so we can reach you"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your enquiry or complaint in detail..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <p className="flex items-center gap-2 text-xs text-mama-muted">
                <Lock className="h-3.5 w-3.5 shrink-0 text-mama-green" />
                Sent over a secure, encrypted connection. Only Mama Peace sees your
                message.
              </p>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Sending securely..." : "Send Message"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}

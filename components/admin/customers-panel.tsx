"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Loader2, Send, Users } from "lucide-react";
import {
  sendPromotionToAllAction,
  sendPromotionToCustomerAction,
} from "@/app/actions/customers";
import { PROMOTION_PRESETS } from "@/lib/customers";
import type { CustomerSummary } from "@/lib/customers";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function CustomersPanel({ customers }: { customers: CustomerSummary[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<string>(PROMOTION_PRESETS[0].subject);
  const [message, setMessage] = useState<string>(PROMOTION_PRESETS[0].message);
  const [selectedPreset, setSelectedPreset] = useState<string>(PROMOTION_PRESETS[0].id);
  const [loading, setLoading] = useState(false);
  const [emailingPhone, setEmailingPhone] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false) ||
        (c.area?.toLowerCase().includes(q) ?? false)
    );
  }, [customers, query]);

  const withEmailCount = customers.filter((c) => c.email).length;

  function applyPreset(presetId: string) {
    const preset = PROMOTION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPreset(preset.id);
    setSubject(preset.subject);
    setMessage(preset.message);
  }

  async function handleSendAll() {
    setLoading(true);
    setError("");
    setFeedback("");
    const result = await sendPromotionToAllAction({ subject, message });
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setFeedback(
      `Sent to ${result.sent} customer${result.sent === 1 ? "" : "s"}` +
        (result.skipped > 0
          ? ` · ${result.skipped} skipped (no email on file)`
          : "") +
        (result.failed > 0 ? ` · ${result.failed} failed` : "")
    );
    router.refresh();
  }

  async function handleSendOne(phone: string) {
    setEmailingPhone(phone);
    setError("");
    setFeedback("");
    const result = await sendPromotionToCustomerAction({ phone, subject, message });
    setEmailingPhone(null);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setFeedback(`Promotion email sent successfully.`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-mama-border bg-white p-4 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-mama-green/10">
            <Users className="h-5 w-5 text-mama-green" />
          </div>
          <p className="text-2xl font-semibold text-mama-ink">{customers.length}</p>
          <p className="mt-1 text-xs text-mama-muted">Total customers</p>
        </div>
        <div className="rounded-2xl border border-mama-border bg-white p-4 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-mama-green/10">
            <Mail className="h-5 w-5 text-mama-green" />
          </div>
          <p className="text-2xl font-semibold text-mama-ink">{withEmailCount}</p>
          <p className="mt-1 text-xs text-mama-muted">Reachable by email</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-mama-border bg-white p-4 shadow-sm lg:col-span-1">
          <p className="text-sm text-mama-muted">
            Customers are built from past orders. Only customers who provided an
            email can receive promotions.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div>
            <h2 className="font-serif text-xl text-mama-ink">
              Send Promotion or Greeting
            </h2>
            <p className="text-sm text-mama-muted">
              Email customers about special days, weekend deals, or new stock.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {PROMOTION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  selectedPreset === preset.id
                    ? "bg-mama-green text-white"
                    : "bg-mama-gray text-mama-muted hover:text-mama-ink"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-subject">Subject</Label>
            <Input
              id="promo-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-message">Message</Label>
            <Textarea
              id="promo-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
              placeholder="Write your promotion or holiday greeting..."
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {feedback && (
            <div className="rounded-xl border border-mama-green/30 bg-mama-green/5 px-4 py-3 text-sm text-mama-green">
              {feedback}
            </div>
          )}

          <Button
            onClick={handleSendAll}
            disabled={loading || withEmailCount === 0}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Email all customers with email ({withEmailCount})
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-xl text-mama-ink">Customer List</h2>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, email, or area..."
            className="max-w-md"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-mama-border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-mama-border bg-mama-gray/50 text-xs uppercase tracking-wider text-mama-muted">
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Orders</th>
                  <th className="px-4 py-3 font-semibold">Total Spent</th>
                  <th className="px-4 py-3 font-semibold">Last Order</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mama-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-mama-muted">
                      {customers.length === 0
                        ? "No customers yet. They will appear here after the first order."
                        : "No customers match your search."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((customer) => (
                    <tr key={customer.phone} className="hover:bg-mama-gray/30">
                      <td className="px-4 py-3 font-medium text-mama-ink">
                        {customer.name}
                      </td>
                      <td className="px-4 py-3 text-mama-muted">{customer.phone}</td>
                      <td className="px-4 py-3">
                        {customer.email ? (
                          <span className="text-mama-ink">{customer.email}</span>
                        ) : (
                          <Badge variant="muted">No email</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-mama-muted">
                        {customer.orderCount}
                      </td>
                      <td className="px-4 py-3 font-medium text-mama-ink">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td className="px-4 py-3 text-mama-muted">
                        {formatDate(customer.lastOrderAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!customer.email || emailingPhone === customer.phone}
                          onClick={() => handleSendOne(customer.phone)}
                        >
                          {emailingPhone === customer.phone ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Mail className="h-3.5 w-3.5" />
                          )}
                          Email
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

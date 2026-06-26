"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2, Mail, Smartphone } from "lucide-react";
import { sendOrderMessageAction } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function AdminSendMessageCard({
  orderId,
  customerEmail,
}: {
  orderId: string;
  customerEmail?: string | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function handleSend() {
    if (!message.trim()) return;
    setLoading(true);
    setError("");
    setFeedback("");

    const result = await sendOrderMessageAction({ orderId, message: message.trim() });
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? "Could not send message");
      return;
    }

    setMessage("");
    setFeedback(
      result.emailed
        ? "Message sent. Customer will see it on Track Order and by email."
        : "Message sent. Customer will see it when they track their order."
    );
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h3 className="flex items-center gap-2 font-serif text-lg text-mama-ink">
            <MessageSquare className="h-5 w-5 text-mama-green" />
            Send Message to Customer
          </h3>
          <p className="mt-1 text-sm text-mama-muted">
            Send an update anytime. The customer sees it on their track page
            {customerEmail ? " and by email." : "."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-mama-gray px-3 py-1.5 text-mama-muted">
            <Smartphone className="h-3.5 w-3.5 text-mama-green" />
            Shows on Track Order
          </span>
          {customerEmail ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mama-gray px-3 py-1.5 text-mama-muted">
              <Mail className="h-3.5 w-3.5 text-mama-green" />
              Email to {customerEmail}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mama-gray px-3 py-1.5 text-mama-muted">
              No email on file — track page only
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="admin-follow-up-message">Your message</Label>
          <Textarea
            id="admin-follow-up-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Your rider is 10 minutes away, or we substituted an item..."
            className="min-h-[100px]"
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
          onClick={handleSend}
          disabled={loading || !message.trim()}
          className="w-full"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Send Message
        </Button>
      </CardContent>
    </Card>
  );
}

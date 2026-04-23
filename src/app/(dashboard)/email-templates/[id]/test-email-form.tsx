"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendTestEmail } from "../actions";

interface TestEmailFormProps {
  templateId: number;
}

export function TestEmailForm({ templateId }: TestEmailFormProps) {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await sendTestEmail(templateId, to);
      if (result.success) {
        setMessage(`Test email sent to ${to}`);
      } else {
        setError(result.error ?? "Failed to send");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="testTo">Send To</Label>
        <Input
          id="testTo"
          type="email"
          required
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="recipient@example.com"
        />
      </div>
      <Button type="submit" disabled={isPending || !to} className="w-full">
        {isPending ? "Sending..." : "Send Test Email"}
      </Button>
      {message && <p className="text-sm text-green-600">{message}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { sendMessage } from "../actions";

interface ReplyFormProps {
  parentId: number;
  toStaffId: number;
  subject: string;
  currentStaffId: number;
}

export function ReplyForm({ parentId, toStaffId, subject, currentStaffId }: ReplyFormProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await sendMessage(currentStaffId, toStaffId, subject, body, parentId);
      setBody("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Label>Reply</Label>
      <textarea
        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        placeholder="Type your reply..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Sending..." : "Send Reply"}
        </Button>
      </div>
    </form>
  );
}

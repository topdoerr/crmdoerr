"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sendMessage } from "../actions";

const CURRENT_STAFF_ID = 1;

interface StaffOption {
  staffid: number;
  firstName: string;
  lastName: string;
}

export default function ComposePage() {
  const router = useRouter();
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [toStaffId, setToStaffId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/staff-list")
      .then((r) => r.json())
      .then(setStaff)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!toStaffId || !body.trim()) {
      setError("Recipient and message body are required.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await sendMessage(CURRENT_STAFF_ID, parseInt(toStaffId, 10), subject, body);
      router.push("/messages");
      router.refresh();
    } catch {
      setError("Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Link href="/messages" className="text-sm text-muted-foreground hover:underline">
          Inbox
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm">Compose</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">To *</Label>
              <Select value={toStaffId} onValueChange={setToStaffId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient..." />
                </SelectTrigger>
                <SelectContent>
                  {staff
                    .filter((s) => s.staffid !== CURRENT_STAFF_ID)
                    .map((s) => (
                      <SelectItem key={s.staffid} value={String(s.staffid)}>
                        {s.firstName} {s.lastName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Message *</Label>
              <textarea
                id="body"
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Type your message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push("/messages")}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

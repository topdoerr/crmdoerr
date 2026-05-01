"use client";

import { useState } from "react";
import { Mail, Copy, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AiEmailWriterProps {
  context?: string;
  defaultTo?: string;
}

export function AiEmailWriter({ context, defaultTo }: AiEmailWriterProps) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState(defaultTo || "");
  const [purpose, setPurpose] = useState(context || "");
  const [tone, setTone] = useState<"formal" | "friendly" | "urgent">("formal");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!to.trim() || !purpose.trim()) return;
    setLoading(true);
    setGeneratedEmail("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Draft a professional email to ${to} about: ${purpose}. Use a ${tone} tone. Return only the email content with subject line, greeting, body, and sign-off. Do not include any meta-commentary.`,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.response) {
        setGeneratedEmail(data.response);
      }
    } catch {
      setGeneratedEmail("Failed to generate email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-md bg-amber px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600">
          <Mail className="h-4 w-4" />
          AI Email Writer
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Email Writer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* To field */}
          <div>
            <label className="text-sm font-medium mb-1 block">To</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipient name or email"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Purpose / Context
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="What is this email about?"
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="text-sm font-medium mb-1 block">Tone</label>
            <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !to.trim() || !purpose.trim()}
            className="inline-flex items-center gap-2 rounded-md bg-amber px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Generate Email
              </>
            )}
          </button>

          {/* Generated email preview */}
          {generatedEmail && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Generated Email</label>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy to clipboard
                    </>
                  )}
                </button>
              </div>
              <div className="rounded-md border bg-muted/50 p-4 text-sm whitespace-pre-wrap">
                {generatedEmail}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

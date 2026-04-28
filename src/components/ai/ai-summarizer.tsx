"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AiSummarizerProps {
  content: string;
  title: string;
}

export function AiSummarizer({ content, title }: AiSummarizerProps) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSummarize() {
    setLoading(true);
    setSummary("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Summarize the following document/content titled "${title}":\n\n${content}`,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.response) {
        setSummary(data.response);
      }
    } catch {
      setSummary("Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted">
          <FileText className="h-4 w-4" />
          Summarize
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Summary</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">
            Generate an AI-powered summary of{" "}
            <span className="font-medium text-foreground">{title}</span>
          </p>

          <button
            onClick={handleSummarize}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md bg-forest-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-forest-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Summarizing...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Summarize
              </>
            )}
          </button>

          {summary && (
            <div className="rounded-md border bg-muted/50 p-4 text-sm whitespace-pre-wrap">
              {summary}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

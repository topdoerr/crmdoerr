"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface SuggestReplyProps {
  ticketSubject: string;
  ticketMessage: string;
  existingReplies?: string[];
}

export function SuggestReply({
  ticketSubject,
  ticketMessage,
  existingReplies = [],
}: SuggestReplyProps) {
  const [suggestedReply, setSuggestedReply] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSuggest() {
    setLoading(true);
    setSuggestedReply("");

    const repliesContext =
      existingReplies.length > 0
        ? `\n\nExisting replies in the conversation:\n${existingReplies.map((r, i) => `Reply ${i + 1}: ${r}`).join("\n")}`
        : "";

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Draft a professional and helpful support reply for the following ticket.\n\nSubject: ${ticketSubject}\nMessage: ${ticketMessage}${repliesContext}\n\nProvide only the reply text, no meta-commentary. Be helpful, empathetic, and concise.`,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data.response) {
        setSuggestedReply(data.response);
      }
    } catch {
      setSuggestedReply("Failed to generate a suggestion. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleSuggest}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md border border-forest-600 bg-white px-3 py-2 text-sm font-medium text-forest-600 transition-colors hover:bg-forest-50 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            AI Suggest Reply
          </>
        )}
      </button>

      {suggestedReply && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Suggested Reply</label>
          <textarea
            value={suggestedReply}
            onChange={(e) => setSuggestedReply(e.target.value)}
            rows={6}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-y"
          />
          <p className="text-xs text-muted-foreground">
            Review and edit the suggestion before sending.
          </p>
        </div>
      )}
    </div>
  );
}

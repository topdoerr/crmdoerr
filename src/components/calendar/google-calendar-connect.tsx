"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Link2, Unlink } from "lucide-react";

interface GoogleCalendarConnectProps {
  connected: boolean;
  lastSynced: string | null;
}

export function GoogleCalendarConnect({ connected, lastSynced }: GoogleCalendarConnectProps) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/google/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId: 1 }),
      });
      const data = await res.json();
      if (res.ok) {
        setSyncResult(`Synced ${data.synced} new events (${data.total} total in Google)`);
        router.refresh();
      } else {
        setSyncResult(`Error: ${data.error}`);
      }
    } catch {
      setSyncResult("Sync failed");
    }
    setSyncing(false);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z" fill="#fff" stroke="#e5e5e0"/>
              <path d="M17.5 12.3l-3.9-2.3V6.5h-3v4.3L7 13.5l1.5 2.6 3-1.8 3 1.8 1.5-2.6-.5-.2z" fill="#4285f4"/>
              <path d="M12 6.5v3.5l3.6 2.3.5.3 1.5-2.6L12 6.5z" fill="#ea4335"/>
              <path d="M7 13.5l3.6-2.5V6.5L7 10v3.5z" fill="#34a853"/>
              <path d="M10.6 11l-3.6 2.5 1.5 2.6 3-1.8V11h-.9z" fill="#fbbc04"/>
            </svg>
            Google Calendar
          </CardTitle>
          {connected ? (
            <Badge variant="success">Connected</Badge>
          ) : (
            <Badge variant="secondary">Not connected</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {connected ? (
          <div className="space-y-3">
            {lastSynced && (
              <p className="text-xs text-muted-foreground font-mono">
                Last synced: {new Date(lastSynced).toLocaleString()}
              </p>
            )}
            {syncResult && (
              <p className="text-xs text-accent">{syncResult}</p>
            )}
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSync} disabled={syncing} className="gap-1.5">
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing..." : "Sync now"}
              </Button>
              <Button size="sm" variant="outline" asChild>
                <a href="/api/google/connect?staffId=1">
                  <Unlink className="h-3.5 w-3.5 mr-1.5" />
                  Reconnect
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect your Google Calendar to sync events both ways.
            </p>
            <Button size="sm" asChild className="gap-1.5">
              <a href="/api/google/connect?staffId=1">
                <Link2 className="h-3.5 w-3.5" />
                Connect Google Calendar
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

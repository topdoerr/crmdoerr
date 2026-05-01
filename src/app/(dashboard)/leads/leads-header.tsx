"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LayoutList, Columns3 } from "lucide-react";
import { LeadForm } from "./lead-form";

export function LeadsHeader({
  count,
  view,
  leadStatuses,
  leadSources,
}: {
  count: number;
  view: string;
  leadStatuses: { id: number; name: string }[];
  leadSources: { id: number; name: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <Badge variant="secondary">{count}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border">
            <Link
              href="/leads?view=list"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              } rounded-l-md`}
            >
              <LayoutList className="h-4 w-4" />
              List
            </Link>
            <Link
              href="/leads?view=kanban"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "kanban"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              } rounded-r-md`}
            >
              <Columns3 className="h-4 w-4" />
              Kanban
            </Link>
          </div>
          <Button onClick={() => setOpen(true)}>Add Lead</Button>
        </div>
      </div>

      <LeadForm
        open={open}
        onOpenChange={setOpen}
        leadStatuses={leadStatuses}
        leadSources={leadSources}
      />
    </>
  );
}

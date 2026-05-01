"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TicketForm } from "./ticket-form";

export function TicketsHeader({ count }: { count: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Support Tickets
          </h1>
          <Badge variant="secondary">{count}</Badge>
        </div>
        <Button onClick={() => setOpen(true)}>New Ticket</Button>
      </div>

      <TicketForm open={open} onOpenChange={setOpen} />
    </>
  );
}

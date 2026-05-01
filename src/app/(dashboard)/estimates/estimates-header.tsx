"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EstimateForm } from "./estimate-form";

export function EstimatesHeader({
  count,
  clients,
}: {
  count: number;
  clients: { id: number; company: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
          <Badge variant="secondary">{count}</Badge>
        </div>
        <Button onClick={() => setOpen(true)}>New Estimate</Button>
      </div>

      <EstimateForm open={open} onOpenChange={setOpen} clients={clients} />
    </>
  );
}

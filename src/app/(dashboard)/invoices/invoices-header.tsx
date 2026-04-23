"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InvoiceForm } from "./invoice-form";

interface InvoicesHeaderProps {
  totalCount: number;
  clients: { id: number; company: string }[];
  nextNumber: number;
}

export function InvoicesHeader({
  totalCount,
  clients,
  nextNumber,
}: InvoicesHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <Badge variant="secondary">{totalCount}</Badge>
        </div>
        <Button onClick={() => setOpen(true)}>Create Invoice</Button>
      </div>

      <InvoiceForm
        clients={clients}
        open={open}
        onOpenChange={setOpen}
        nextNumber={nextNumber}
      />
    </>
  );
}

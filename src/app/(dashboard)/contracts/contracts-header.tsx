"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContractForm } from "./contract-form";

export function ContractsHeader({
  count,
  clients,
  contractTypes,
}: {
  count: number;
  clients: { id: number; company: string }[];
  contractTypes: { id: number; name: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
          <Badge variant="secondary">{count}</Badge>
        </div>
        <Button onClick={() => setOpen(true)}>New Contract</Button>
      </div>

      <ContractForm
        open={open}
        onOpenChange={setOpen}
        clients={clients}
        contractTypes={contractTypes}
      />
    </>
  );
}

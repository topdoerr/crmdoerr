"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "./expense-form";

export function ExpensesHeader({
  count,
  clients,
  expenseCategories,
}: {
  count: number;
  clients: { id: number; company: string }[];
  expenseCategories: { id: number; name: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <Badge variant="secondary">{count}</Badge>
        </div>
        <Button onClick={() => setOpen(true)}>New Expense</Button>
      </div>

      <ExpenseForm
        open={open}
        onOpenChange={setOpen}
        clients={clients}
        expenseCategories={expenseCategories}
      />
    </>
  );
}

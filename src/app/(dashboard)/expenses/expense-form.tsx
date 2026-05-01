"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createExpense } from "./actions";

interface ExpenseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: { id: number; company: string }[];
  expenseCategories: { id: number; name: string }[];
}

export function ExpenseForm({
  open,
  onOpenChange,
  clients,
  expenseCategories,
}: ExpenseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    if (!formData.get("billable")) {
      formData.set("billable", "0");
    }
    startTransition(async () => {
      await createExpense(formData);
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>New Expense</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expenseName">Expense Name *</Label>
            <Input id="expenseName" name="expenseName" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input id="date" name="date" type="date" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <Select name="clientId">
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="billable"
              name="billable"
              value="1"
              onCheckedChange={(checked) => {
                const input = document.getElementById(
                  "billable-hidden"
                ) as HTMLInputElement;
                if (input) input.value = checked ? "1" : "0";
              }}
            />
            <input
              type="hidden"
              id="billable-hidden"
              name="billable"
              defaultValue="0"
            />
            <Label htmlFor="billable">Billable</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

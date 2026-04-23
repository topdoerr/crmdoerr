"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Trash2 } from "lucide-react";
import { createInvoice } from "./actions";

interface LineItem {
  description: string;
  qty: number;
  rate: number;
  unit?: string;
}

interface InvoiceFormProps {
  clients: { id: number; company: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nextNumber: number;
}

export function InvoiceForm({
  clients,
  open,
  onOpenChange,
  nextNumber,
}: InvoiceFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clientId, setClientId] = useState<string>("");
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "", qty: 1, rate: 0 },
  ]);

  function updateLineItem(i: number, patch: Partial<LineItem>) {
    setLineItems((items) =>
      items.map((item, idx) => (idx === i ? { ...item, ...patch } : item))
    );
  }

  function addLineItem() {
    setLineItems((items) => [...items, { description: "", qty: 1, rate: 0 }]);
  }

  function removeLineItem(i: number) {
    setLineItems((items) => items.filter((_, idx) => idx !== i));
  }

  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.qty * item.rate,
    0
  );

  async function handleSubmit(formData: FormData) {
    if (!clientId) return;

    startTransition(async () => {
      await createInvoice({
        clientId: Number(clientId),
        number: Number(formData.get("number")),
        prefix: (formData.get("prefix") as string) || "INV-",
        date: formData.get("date") as string,
        dueDate: formData.get("dueDate") as string,
        subtotal,
        total: subtotal,
        clientNote: (formData.get("clientNote") as string) || undefined,
        adminNote: (formData.get("adminNote") as string) || undefined,
        status: Number(formData.get("status")),
        lineItems,
      });
      onOpenChange(false);
      setLineItems([{ description: "", qty: 1, rate: 0 }]);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="6">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">Draft</SelectItem>
                  <SelectItem value="2">Sent</SelectItem>
                  <SelectItem value="1">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prefix">Prefix</Label>
              <Input id="prefix" name="prefix" defaultValue="INV-" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Number *</Label>
              <Input
                id="number"
                name="number"
                type="number"
                defaultValue={nextNumber}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              defaultValue={
                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 10)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLineItem}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {lineItems.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      updateLineItem(i, { description: e.target.value })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Qty"
                    value={item.qty}
                    onChange={(e) =>
                      updateLineItem(i, { qty: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) =>
                      updateLineItem(i, { rate: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="col-span-2 text-sm pt-2">
                  ${(item.qty * item.rate).toFixed(2)}
                </div>
                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(i)}
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end text-lg font-semibold">
            Total: ${subtotal.toFixed(2)}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientNote">Client Note</Label>
              <Input id="clientNote" name="clientNote" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminNote">Admin Note</Label>
              <Input id="adminNote" name="adminNote" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !clientId}>
              {isPending ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createCustomField,
  updateCustomField,
  deleteCustomField,
} from "@/app/(dashboard)/custom-fields/actions";

interface CustomFieldFormProps {
  field?: {
    id: number;
    name: string;
    slug: string;
    fieldTo: string;
    fieldType: string;
    options: string | null;
    required: number;
    active: number;
    showOnTable: number;
    showOnPdf: number;
    onlyAdmin: number;
    displayOrder: number;
  };
}

const FIELD_TO_OPTIONS = [
  "client",
  "lead",
  "invoice",
  "estimate",
  "proposal",
  "contract",
  "project",
  "task",
  "ticket",
  "expense",
];

const FIELD_TYPES = [
  "text",
  "textarea",
  "select",
  "checkbox",
  "date",
  "number",
];

export function CustomFieldForm({ field }: CustomFieldFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!field;

  async function onSubmit(formData: FormData) {
    setSubmitting(true);
    try {
      if (isEditing && field) {
        await updateCustomField(field.id, formData);
      } else {
        await createCustomField(formData);
      }
      setOpen(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!field || !confirm("Delete this custom field?")) return;
    await deleteCustomField(field.id);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isEditing ? "outline" : "default"} size={isEditing ? "sm" : "default"}>
          {isEditing ? "Edit" : "Add Custom Field"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Custom Field" : "New Custom Field"}
          </DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" defaultValue={field?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={field?.slug} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fieldTo">Field To *</Label>
              <select
                id="fieldTo"
                name="fieldTo"
                defaultValue={field?.fieldTo || "client"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {FIELD_TO_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type *</Label>
              <select
                id="fieldType"
                name="fieldType"
                defaultValue={field?.fieldType || "text"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {FIELD_TYPES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="options">Options (comma-separated for select)</Label>
            <Input id="options" name="options" defaultValue={field?.options ?? ""} placeholder="Option 1, Option 2, Option 3" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input id="displayOrder" name="displayOrder" type="number" defaultValue={field?.displayOrder ?? 0} />
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-md border p-3">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox name="required" defaultChecked={!!field?.required} />
              Required
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox name="active" defaultChecked={field ? !!field.active : true} />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox name="showOnTable" defaultChecked={!!field?.showOnTable} />
              Show on Table
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox name="showOnPdf" defaultChecked={!!field?.showOnPdf} />
              Show on PDF
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox name="onlyAdmin" defaultChecked={!!field?.onlyAdmin} />
              Admin Only
            </label>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {isEditing && (
                <Button type="button" variant="destructive" onClick={onDelete}>
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateTemplate,
  addItem,
  updateItem,
  deleteItem,
  deleteTemplate,
} from "../actions";
import { Trash2, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";

interface ItemData {
  id: number;
  title: string;
  description: string;
  assignTo: string;
  itemOrder: number;
}

export function TemplateEditor({
  templateId,
  templateName,
  items: initialItems,
}: {
  templateId: number;
  templateName: string;
  items: ItemData[];
}) {
  const [name, setName] = useState(templateName);
  const [items, setItems] = useState(initialItems);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newAssign, setNewAssign] = useState("employee");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSaveName() {
    startTransition(async () => {
      await updateTemplate(templateId, name);
    });
  }

  function handleAddItem() {
    if (!newTitle.trim()) return;
    startTransition(async () => {
      await addItem(
        templateId,
        newTitle.trim(),
        newDesc.trim() || undefined,
        newAssign,
        items.length
      );
      setNewTitle("");
      setNewDesc("");
      setNewAssign("employee");
      router.refresh();
    });
  }

  function handleUpdateItem(id: number, data: Partial<ItemData>) {
    startTransition(async () => {
      await updateItem(id, data);
      router.refresh();
    });
  }

  function handleDeleteItem(id: number) {
    startTransition(async () => {
      await deleteItem(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    });
  }

  function handleDeleteTemplate() {
    if (!confirm("Delete this template and all its items?")) return;
    startTransition(async () => {
      await deleteTemplate(templateId);
      router.push("/onboarding");
    });
  }

  return (
    <div className="space-y-6">
      {/* Template name */}
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Template name"
          className="max-w-sm"
        />
        <Button onClick={handleSaveName} disabled={isPending} variant="outline">
          <Save className="mr-2 h-4 w-4" /> Save Name
        </Button>
        <Button
          onClick={handleDeleteTemplate}
          disabled={isPending}
          variant="destructive"
          className="ml-auto"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Template
        </Button>
      </div>

      {/* Existing items */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-start gap-2 rounded-lg border p-3"
          >
            <span className="mt-2 text-sm font-medium text-muted-foreground w-6">
              {idx + 1}.
            </span>
            <div className="flex-1 space-y-2">
              <Input
                defaultValue={item.title}
                onBlur={(e) =>
                  e.target.value !== item.title &&
                  handleUpdateItem(item.id, { title: e.target.value })
                }
                placeholder="Title"
              />
              <Input
                defaultValue={item.description}
                onBlur={(e) =>
                  e.target.value !== item.description &&
                  handleUpdateItem(item.id, { description: e.target.value })
                }
                placeholder="Description (optional)"
              />
            </div>
            <Select
              defaultValue={item.assignTo}
              onValueChange={(v) => handleUpdateItem(item.id, { assignTo: v })}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="it">IT</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteItem(item.id)}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add new item */}
      <div className="rounded-lg border border-dashed p-4 space-y-3">
        <p className="text-sm font-medium">Add New Item</p>
        <div className="flex gap-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title"
            className="flex-1"
          />
          <Input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="flex-1"
          />
          <Select value={newAssign} onValueChange={setNewAssign}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="it">IT</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddItem} disabled={isPending}>
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
}

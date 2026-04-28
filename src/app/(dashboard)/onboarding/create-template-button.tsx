"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createTemplate } from "./actions";
import { Plus } from "lucide-react";

export function CreateTemplateButton() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  async function handleSubmit() {
    if (!name.trim()) return;
    await createTemplate(name.trim());
    setName("");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Template
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Onboarding Template</DialogTitle>
        </DialogHeader>
        <form
          action={handleSubmit}
          className="space-y-4"
        >
          <Input
            placeholder="Template name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

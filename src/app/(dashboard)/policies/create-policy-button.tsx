"use client";

import { useState } from "react";
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
import { createPolicy } from "./actions";
import { Plus } from "lucide-react";

export function CreatePolicyButton() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [version, setVersion] = useState("1.0");
  const [requireAck, setRequireAck] = useState(true);

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return;
    await createPolicy(title.trim(), content.trim(), version, requireAck ? 1 : 0);
    setTitle("");
    setContent("");
    setVersion("1.0");
    setRequireAck(true);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Policy
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New Company Policy</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Policy title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content (HTML)</Label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Policy content..."
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="requireAck"
              checked={requireAck}
              onCheckedChange={(v) => setRequireAck(v === true)}
            />
            <Label htmlFor="requireAck">Require acknowledgement</Label>
          </div>
          <Button type="submit" className="w-full">
            Create Policy
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

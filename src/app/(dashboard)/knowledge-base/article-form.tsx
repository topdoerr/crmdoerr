"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createArticle, updateArticle } from "./actions";

interface GroupOption {
  id: number;
  name: string;
}

interface ArticleFormValues {
  id?: number;
  subject?: string;
  slug?: string;
  description?: string;
  groupId?: number | null;
  active?: boolean;
  staffArticle?: boolean;
}

interface ArticleFormProps {
  groups: GroupOption[];
  article?: ArticleFormValues;
  trigger?: React.ReactNode;
}

export function ArticleForm({ groups, article, trigger }: ArticleFormProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [subject, setSubject] = useState(article?.subject ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [description, setDescription] = useState(article?.description ?? "");
  const [groupId, setGroupId] = useState<string>(
    article?.groupId ? String(article.groupId) : "none"
  );
  const [active, setActive] = useState(article?.active !== false);
  const [staffArticle, setStaffArticle] = useState(
    article?.staffArticle ?? false
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        subject,
        slug,
        description,
        groupId: groupId === "none" ? null : parseInt(groupId, 10),
        active,
        staffArticle,
      };
      if (article?.id) {
        await updateArticle(article.id, payload);
      } else {
        await createArticle(payload);
      }
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>{article?.id ? "Edit Article" : "New Article"}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {article?.id ? "Edit Article" : "Create Article"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated from subject"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (HTML allowed)</Label>
            <textarea
              id="description"
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Group</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No group</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={String(g.id)}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={active}
                onCheckedChange={(v) => setActive(!!v)}
              />
              <span className="text-sm">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={staffArticle}
                onCheckedChange={(v) => setStaffArticle(!!v)}
              />
              <span className="text-sm">Staff Only</span>
            </label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

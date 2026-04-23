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
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "./actions";

interface AnnouncementFormProps {
  announcement?: {
    id: number;
    name: string;
    message: string;
    showToStaff: number;
    showToClients: number;
    dateStart: Date | null;
    dateEnd: Date | null;
  };
}

const toInput = (d: Date | null | undefined) =>
  d ? new Date(d).toISOString().slice(0, 10) : "";

export function AnnouncementForm({ announcement }: AnnouncementFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEditing = !!announcement;

  async function onSubmit(formData: FormData) {
    setSubmitting(true);
    try {
      if (isEditing && announcement) {
        await updateAnnouncement(announcement.id, formData);
      } else {
        await createAnnouncement(formData);
      }
      setOpen(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete() {
    if (!announcement || !confirm("Delete this announcement?")) return;
    await deleteAnnouncement(announcement.id);
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEditing ? "outline" : "default"}
          size={isEditing ? "sm" : "default"}
        >
          {isEditing ? "Edit" : "Add Announcement"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Announcement" : "New Announcement"}
          </DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              required
              defaultValue={announcement?.name}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (HTML allowed) *</Label>
            <textarea
              id="message"
              name="message"
              required
              defaultValue={announcement?.message}
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateStart">Start Date</Label>
              <Input
                id="dateStart"
                name="dateStart"
                type="date"
                defaultValue={toInput(announcement?.dateStart)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateEnd">End Date</Label>
              <Input
                id="dateEnd"
                name="dateEnd"
                type="date"
                defaultValue={toInput(announcement?.dateEnd)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-md border p-3">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                name="showToStaff"
                defaultChecked={
                  announcement ? !!announcement.showToStaff : true
                }
              />
              Show to Staff
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                name="showToClients"
                defaultChecked={!!announcement?.showToClients}
              />
              Show to Clients
            </label>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onDelete}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
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

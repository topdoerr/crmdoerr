"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createEvent } from "./actions";

const COLOR_OPTIONS = [
  "#03a9f4",
  "#4caf50",
  "#ff9800",
  "#f44336",
  "#9c27b0",
  "#607d8b",
  "#e91e63",
  "#795548",
];

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EventForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const now = new Date();
  const later = new Date(now.getTime() + 60 * 60 * 1000);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(toLocalInputValue(now));
  const [endDate, setEndDate] = useState(toLocalInputValue(later));
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [isPublic, setIsPublic] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setStartDate(toLocalInputValue(new Date()));
    setEndDate(toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)));
    setColor(COLOR_OPTIONS[0]);
    setIsPublic(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) return;
    startTransition(async () => {
      await createEvent({
        title: title.trim(),
        description: description.trim() || undefined,
        startDate,
        endDate: endDate || null,
        color,
        isPublic,
      });
      reset();
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Event</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Calendar Event</DialogTitle>
          <DialogDescription>
            Create a new event to track on the calendar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="event-title">Title</Label>
            <Input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="event-description">Description</Label>
            <Input
              id="event-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="event-start">Start</Label>
              <Input
                id="event-start"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="event-end">End</Label>
              <Input
                id="event-end"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    color === c
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="event-public"
              checked={isPublic}
              onCheckedChange={(v) => setIsPublic(v === true)}
            />
            <Label htmlFor="event-public" className="cursor-pointer">
              Public (visible to all staff)
            </Label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !title.trim() || !startDate}
            >
              {isPending ? "Saving..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

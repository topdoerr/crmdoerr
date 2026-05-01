"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskForm } from "./task-form";

export function TasksHeader({
  count,
  view,
}: {
  count: number;
  view: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <Badge variant="secondary">{count}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border">
            <Button
              variant={view === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
              asChild
            >
              <Link href="/tasks?view=list">List</Link>
            </Button>
            <Button
              variant={view === "kanban" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
              asChild
            >
              <Link href="/tasks?view=kanban">Kanban</Link>
            </Button>
          </div>
          <Button onClick={() => setOpen(true)}>Add Task</Button>
        </div>
      </div>

      <TaskForm open={open} onOpenChange={setOpen} />
    </>
  );
}

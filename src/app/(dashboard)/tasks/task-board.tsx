"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TaskItem {
  id: number;
  name: string;
  status: number;
  priority: number;
  duedate: string | null;
  kanbanOrder: number;
  relType: string | null;
  relId: number | null;
  projectName: string | null;
  assignees: {
    id: number;
    firstName: string;
    lastName: string;
  }[];
}

interface TaskBoardProps {
  tasks: TaskItem[];
}

const COLUMNS: { status: number; label: string; color: string }[] = [
  { status: 1, label: "Not Started", color: "bg-slate-500" },
  { status: 2, label: "In Progress", color: "bg-blue-500" },
  { status: 3, label: "Testing", color: "bg-purple-500" },
  { status: 4, label: "Awaiting Feedback", color: "bg-amber-500" },
  { status: 5, label: "Complete", color: "bg-green-500" },
];

const PRIORITY_CONFIG: Record<
  number,
  { label: string; variant: "secondary" | "default" | "warning" | "destructive" }
> = {
  1: { label: "Low", variant: "secondary" },
  2: { label: "Medium", variant: "default" },
  3: { label: "High", variant: "warning" },
  4: { label: "Urgent", variant: "destructive" },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: string | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export default function TaskBoard({ tasks }: TaskBoardProps) {
  const grouped = COLUMNS.map((col) => ({
    ...col,
    tasks: tasks
      .filter((t) => t.status === col.status)
      .sort((a, b) => a.kanbanOrder - b.kanbanOrder),
  }));

  return (
    <div className="grid grid-cols-5 gap-4 min-h-[600px]">
      {grouped.map((column) => (
        <div key={column.status} className="flex flex-col">
          {/* Column header */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
            <h3 className="text-sm font-semibold">{column.label}</h3>
            <span className="text-xs text-muted-foreground ml-auto">
              {column.tasks.length}
            </span>
          </div>

          {/* Column body */}
          <div className="flex-1 space-y-3 overflow-y-auto rounded-lg bg-muted/40 p-2">
            {column.tasks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                No tasks
              </p>
            ) : (
              column.tasks.map((task) => {
                const priority =
                  PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG[2];
                const due = formatDate(task.duedate);

                return (
                  <Card key={task.id} className="p-3 space-y-2.5 shadow-sm">
                    <p className="text-sm font-medium leading-snug">
                      {task.name}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant={priority.variant} className="text-[10px] px-1.5 py-0">
                        {priority.label}
                      </Badge>
                      {task.projectName && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                          {task.projectName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Assignee avatars */}
                      <div className="flex -space-x-1.5">
                        {task.assignees.slice(0, 3).map((a) => {
                          const name = `${a.firstName ?? ""} ${a.lastName ?? ""}`.trim();
                          return (
                            <Avatar
                              key={a.id}
                              className="h-6 w-6 border-2 border-background"
                            >
                              <AvatarFallback className="text-[9px]">
                                {getInitials(name || "?")}
                              </AvatarFallback>
                            </Avatar>
                          );
                        })}
                        {task.assignees.length > 3 && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px]">
                            +{task.assignees.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Due date */}
                      {due && (
                        <span className="text-[10px] text-muted-foreground">
                          {due}
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

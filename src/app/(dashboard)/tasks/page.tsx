import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TaskBoard from "./task-board";
import { TasksHeader } from "./tasks-header";

const TASK_STATUS: Record<
  number,
  { label: string; variant: "secondary" | "default" | "outline" | "warning" | "success" }
> = {
  1: { label: "Not Started", variant: "secondary" },
  2: { label: "In Progress", variant: "default" },
  3: { label: "Testing", variant: "outline" },
  4: { label: "Awaiting Feedback", variant: "warning" },
  5: { label: "Complete", variant: "success" },
};

const TASK_PRIORITY: Record<
  number,
  { label: string; variant: "secondary" | "default" | "warning" | "destructive" }
> = {
  1: { label: "Low", variant: "secondary" },
  2: { label: "Medium", variant: "default" },
  3: { label: "High", variant: "warning" },
  4: { label: "Urgent", variant: "destructive" },
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const view = searchParams?.view === "kanban" ? "kanban" : "list";

  const tasks = await prisma.task.findMany({
    include: {
      assignees: {
        include: {
          staff: {
            select: { staffid: true, firstName: true, lastName: true },
          },
        },
      },
    },
    orderBy: { startdate: "desc" },
  });

  // Fetch project names for tasks that have relType = "project"
  const projectIds = [
    ...new Set(
      tasks
        .filter((t) => t.relType === "project" && t.relId)
        .map((t) => t.relId!)
    ),
  ];

  const projects =
    projectIds.length > 0
      ? await prisma.project.findMany({
          where: { id: { in: projectIds } },
          select: { id: true, name: true },
        })
      : [];

  const projectMap = new Map(projects.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-6">
      <TasksHeader count={tasks.length} view={view} />

      {view === "kanban" ? (
        <TaskBoard
          tasks={tasks.map((task) => ({
            id: task.id,
            name: task.name,
            status: task.status ?? 1,
            priority: task.priority ?? 2,
            duedate: task.duedate ? task.duedate.toISOString() : null,
            kanbanOrder: task.kanbanOrder ?? 0,
            relType: task.relType,
            relId: task.relId,
            projectName:
              task.relType === "project" && task.relId
                ? projectMap.get(task.relId) ?? null
                : null,
            assignees: task.assignees.map((a) => ({
              id: a.id,
              firstName: a.staff.firstName,
              lastName: a.staff.lastName,
            })),
          }))}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assignees</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Related To</TableHead>
                  <TableHead>Billable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      No tasks found.
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => {
                    const status =
                      TASK_STATUS[task.status ?? 1] ?? TASK_STATUS[1];
                    const priority =
                      TASK_PRIORITY[task.priority ?? 2] ?? TASK_PRIORITY[2];
                    const relatedName =
                      task.relType === "project" && task.relId
                        ? projectMap.get(task.relId)
                        : null;

                    return (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          {task.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={priority.variant}>
                            {priority.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex -space-x-2">
                            {task.assignees.map((a) => {
                              const name = `${a.staff.firstName ?? ""} ${a.staff.lastName ?? ""}`.trim();
                              return (
                                <Avatar
                                  key={a.id}
                                  className="h-7 w-7 border-2 border-background"
                                >
                                  <AvatarFallback className="text-xs">
                                    {getInitials(name || "?")}
                                  </AvatarFallback>
                                </Avatar>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(task.duedate)}</TableCell>
                        <TableCell>
                          {relatedName ? (
                            <Link
                              href={`/projects/${task.relId}`}
                              className="hover:underline text-sm"
                            >
                              {relatedName}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {task.billable === 1 ? (
                            <Badge variant="outline">Yes</Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

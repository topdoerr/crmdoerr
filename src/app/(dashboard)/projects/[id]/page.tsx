import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatDate, formatCurrency, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PROJECT_STATUS: Record<
  number,
  { label: string; variant: "secondary" | "default" | "warning" | "success" | "destructive" }
> = {
  1: { label: "Not Started", variant: "secondary" },
  2: { label: "In Progress", variant: "default" },
  3: { label: "On Hold", variant: "warning" },
  4: { label: "Completed", variant: "success" },
  5: { label: "Cancelled", variant: "destructive" },
};

const TASK_STATUS: Record<number, { label: string; variant: string }> = {
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

const BILLING_TYPE: Record<number, string> = {
  1: "Fixed Rate",
  2: "Project Hours",
  3: "Task Hours",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const projectId = Number(params.id);
  if (isNaN(projectId)) notFound();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: {
        select: { id: true, company: true },
      },
      members: {
        include: {
          staff: {
            select: { staffid: true, firstName: true, lastName: true, email: true },
          },
        },
      },
      tasks: {
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
      },
      notes: {
        orderBy: { datecontacted: "desc" },
      },
    },
  });

  if (!project) notFound();

  const status = PROJECT_STATUS[project.status ?? 1] ?? PROJECT_STATUS[1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {project.name}
            </h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          {project.client && (
            <p className="text-muted-foreground">
              Client:{" "}
              <Link
                href={`/clients/${project.client.id}`}
                className="hover:underline"
              >
                {project.client.company}
              </Link>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/projects/${project.id}?modal=edit`}>Edit</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/projects/${project.id}?modal=members`}>
              Manage Members
            </Link>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">
            Tasks ({project.tasks.length})
          </TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="notes">
            Notes ({project.notes.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {formatDate(project.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Deadline</p>
                    <p className="font-medium">
                      {formatDate(project.deadline)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Date Finished</p>
                    <p className="font-medium">
                      {formatDate(project.dateFinished)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Billing Type</p>
                    <p className="font-medium">
                      {BILLING_TYPE[project.billingType ?? 0] ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Project Cost</p>
                    <p className="font-medium">
                      {project.projectCost
                        ? formatCurrency(Number(project.projectCost))
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hourly Rate</p>
                    <p className="font-medium">
                      {project.projectRatePerHour
                        ? formatCurrency(Number(project.projectRatePerHour))
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Estimated Hours</p>
                    <p className="font-medium">
                      {project.estimatedHours
                        ? `${project.estimatedHours}h`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(project.progress ?? 0, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {project.progress ?? 0}%
                      </span>
                    </div>
                  </div>
                </div>
                {project.description && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">
                        Description
                      </p>
                      <p className="text-sm whitespace-pre-wrap">
                        {project.description}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                {project.members.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No members assigned yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {project.members.map((member) => {
                      const name = `${member.staff.firstName ?? ""} ${member.staff.lastName ?? ""}`.trim();
                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-3"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(name || "?")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {name || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.staff.email}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assignees</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.tasks.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        No tasks yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    project.tasks.map((task) => {
                      const taskStatus =
                        TASK_STATUS[task.status ?? 1] ?? TASK_STATUS[1];
                      const taskPriority =
                        TASK_PRIORITY[task.priority ?? 2] ?? TASK_PRIORITY[2];
                      return (
                        <TableRow key={task.id}>
                          <TableCell>
                            <Link
                              href={`/tasks?id=${task.id}`}
                              className="font-medium hover:underline"
                            >
                              {task.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant={taskPriority.variant}>
                              {taskPriority.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                taskStatus.variant as
                                  | "secondary"
                                  | "default"
                                  | "warning"
                                  | "success"
                                  | "outline"
                              }
                            >
                              {taskStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex -space-x-2">
                              {task.assignees.map((a) => {
                                const aName = `${a.staff.firstName ?? ""} ${a.staff.lastName ?? ""}`.trim();
                                return (
                                  <Avatar
                                    key={a.id}
                                    className="h-7 w-7 border-2 border-background"
                                  >
                                    <AvatarFallback className="text-xs">
                                      {getInitials(aName || "?")}
                                    </AvatarFallback>
                                  </Avatar>
                                );
                              })}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(task.duedate)}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center py-8">
                No files uploaded yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-6">
              {project.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No notes yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {project.notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-lg border p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(note.datecontacted)}
                        </p>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {note.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

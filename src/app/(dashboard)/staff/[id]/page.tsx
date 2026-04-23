import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StaffForm } from "../staff-form";
import { PermissionToggle } from "./permission-toggle";
import { PasswordForm } from "./password-form";
import { deactivateStaff } from "../actions";

const FEATURES = [
  { key: "clients", label: "Clients" },
  { key: "invoices", label: "Invoices" },
  { key: "estimates", label: "Estimates" },
  { key: "projects", label: "Projects" },
  { key: "tasks", label: "Tasks" },
  { key: "leads", label: "Leads" },
  { key: "contracts", label: "Contracts" },
  { key: "expenses", label: "Expenses" },
  { key: "tickets", label: "Tickets" },
  { key: "reports", label: "Reports" },
];

const CAPABILITIES = ["view", "create", "edit", "delete"];

const taskStatuses: Record<number, string> = {
  1: "Not Started",
  2: "Awaiting Feedback",
  3: "Testing",
  4: "In Progress",
  5: "Complete",
};

export default async function StaffDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseInt(params.id, 10);
  if (Number.isNaN(id)) notFound();

  const staff = await prisma.staff.findUnique({
    where: { staffid: id },
    include: {
      taskAssignments: {
        include: {
          task: true,
        },
        take: 50,
      },
      projectMembers: {
        include: {
          project: {
            include: {
              client: { select: { company: true } },
            },
          },
        },
        take: 50,
      },
    },
  });

  if (!staff) notFound();

  const permissions = await prisma.staffPermission.findMany({
    where: { staffId: id },
  });

  const permSet = new Set(
    permissions.map((p) => `${p.feature}:${p.capability}`)
  );

  async function handleDeactivate() {
    "use server";
    await deactivateStaff(id);
  }

  const initials = `${staff.firstName[0] ?? ""}${staff.lastName[0] ?? ""}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/staff">Back to Staff</Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback>{initials.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {staff.firstName} {staff.lastName}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-muted-foreground">{staff.email}</span>
              {staff.admin === 1 && <Badge>Admin</Badge>}
              <Badge variant={staff.active === 1 ? "success" : "secondary"}>
                {staff.active === 1 ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StaffForm
            staff={{
              staffid: staff.staffid,
              email: staff.email,
              firstName: staff.firstName,
              lastName: staff.lastName,
              phonenumber: staff.phonenumber,
              admin: staff.admin,
              active: staff.active,
            }}
            trigger={<Button variant="outline">Edit</Button>}
          />
          {staff.active === 1 && (
            <form action={handleDeactivate}>
              <Button type="submit" variant="destructive">
                Deactivate
              </Button>
            </form>
          )}
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="tasks">
            Assigned Tasks ({staff.taskAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="projects">
            Assigned Projects ({staff.projectMembers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">First Name</span>
                  <span>{staff.firstName}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Last Name</span>
                  <span>{staff.lastName}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Email</span>
                  <span>{staff.email}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Phone</span>
                  <span>{staff.phonenumber || "—"}</span>
                </div>
                <div className="grid grid-cols-2">
                  <span className="text-muted-foreground">Created</span>
                  <span>{formatDate(staff.createdAt)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Set a new password for this staff member.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PasswordForm staffId={staff.staffid} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Feature Permissions</CardTitle>
              <CardDescription>
                Toggle capabilities per feature. Admins have full access by
                default.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    {CAPABILITIES.map((cap) => (
                      <TableHead key={cap} className="capitalize">
                        {cap}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FEATURES.map((f) => (
                    <TableRow key={f.key}>
                      <TableCell className="font-medium">{f.label}</TableCell>
                      {CAPABILITIES.map((cap) => (
                        <TableCell key={cap}>
                          <PermissionToggle
                            staffId={staff.staffid}
                            feature={f.key}
                            capability={cap}
                            initial={permSet.has(`${f.key}:${cap}`)}
                            label=""
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.taskAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-center text-muted-foreground py-8"
                      >
                        No tasks assigned.
                      </TableCell>
                    </TableRow>
                  ) : (
                    staff.taskAssignments.map((ta) => (
                      <TableRow key={ta.id}>
                        <TableCell>
                          <Link
                            href={`/tasks/${ta.task.id}`}
                            className="font-medium hover:underline"
                          >
                            {ta.task.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {taskStatuses[ta.task.status] ?? "Unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(ta.task.duedate)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Deadline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.projectMembers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
                      >
                        No projects assigned.
                      </TableCell>
                    </TableRow>
                  ) : (
                    staff.projectMembers.map((pm) => (
                      <TableRow key={pm.id}>
                        <TableCell>
                          <Link
                            href={`/projects/${pm.project.id}`}
                            className="font-medium hover:underline"
                          >
                            {pm.project.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {pm.project.client?.company ?? "—"}
                        </TableCell>
                        <TableCell>{formatDate(pm.project.startDate)}</TableCell>
                        <TableCell>{formatDate(pm.project.deadline)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

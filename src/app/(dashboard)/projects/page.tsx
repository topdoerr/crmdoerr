import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProjectForm } from "./project-form";

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

const BILLING_TYPE: Record<number, string> = {
  1: "Fixed Rate",
  2: "Project Hours",
  3: "Task Hours",
};

function ProgressBar({ value }: { value: number | null }) {
  const percent = value ?? 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{percent}%</span>
    </div>
  );
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const statusFilter = searchParams?.status
    ? Number(searchParams.status)
    : undefined;

  const projects = await prisma.project.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: {
      client: {
        select: { id: true, company: true },
      },
    },
    orderBy: { projectCreated: "desc" },
  });

  const clients = await prisma.client.findMany({
    where: { active: 1 },
    select: { id: true, company: true },
    orderBy: { company: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <Badge variant="secondary">{projects.length}</Badge>
        </div>
        <ProjectForm clients={clients} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={!statusFilter ? "default" : "outline"}
          size="sm"
          asChild
        >
          <Link href="/projects">All</Link>
        </Button>
        {Object.entries(PROJECT_STATUS).map(([key, { label, variant }]) => (
          <Button
            key={key}
            variant={statusFilter === Number(key) ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href={`/projects?status=${key}`}>{label}</Link>
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Billing Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No projects found.
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => {
                  const status = PROJECT_STATUS[project.status ?? 1] ?? PROJECT_STATUS[1];
                  return (
                    <TableRow key={project.id}>
                      <TableCell>
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-medium hover:underline"
                        >
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {project.client ? (
                          <Link
                            href={`/clients/${project.client.id}`}
                            className="hover:underline"
                          >
                            {project.client.company}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(project.startDate)}</TableCell>
                      <TableCell>{formatDate(project.deadline)}</TableCell>
                      <TableCell>
                        <ProgressBar value={project.progress} />
                      </TableCell>
                      <TableCell>
                        {BILLING_TYPE[project.billingType ?? 0] ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

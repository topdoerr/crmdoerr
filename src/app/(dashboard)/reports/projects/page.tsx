import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectsBar } from "@/components/reports/projects-chart";

const STATUS_LABELS: Record<number, string> = {
  1: "Not Started",
  2: "In Progress",
  3: "On Hold",
  4: "Cancelled",
  5: "Finished",
};

export default async function ProjectsReportPage() {
  const projects = await prisma.project.findMany();

  const statusMap = new Map<string, number>();
  for (const p of projects) {
    const name = STATUS_LABELS[p.status] ?? `Status ${p.status}`;
    statusMap.set(name, (statusMap.get(name) ?? 0) + 1);
  }
  const statusData = Array.from(statusMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  // Avg duration (startDate -> dateFinished or now)
  const durations: number[] = [];
  for (const p of projects) {
    const end = p.dateFinished ?? new Date();
    const ms = end.getTime() - new Date(p.startDate).getTime();
    if (ms > 0) durations.push(ms / (1000 * 60 * 60 * 24));
  }
  const avgDays =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

  const estimatedHours = projects.reduce(
    (s, p) => s + Number(p.estimatedHours ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Projects Report</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Avg Duration (days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgDays}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Estimated Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{estimatedHours}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Projects by Status</CardTitle>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 ? (
            <ProjectsBar data={statusData} />
          ) : (
            <div className="text-center text-muted-foreground py-12">
              No projects yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

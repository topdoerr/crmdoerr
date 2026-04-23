import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TimerWidget from "./timer-widget";

function formatDateTime(date: Date | string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatDuration(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default async function TimesheetsPage() {
  const timers = await prisma.taskTimer.findMany({
    orderBy: { startTime: "desc" },
  });

  const taskIds = [...new Set(timers.map((t) => t.taskId))];
  const staffIds = [...new Set(timers.map((t) => t.staffId))];

  const [tasks, staffList, allTasks, allStaff] = await Promise.all([
    taskIds.length
      ? prisma.task.findMany({
          where: { id: { in: taskIds } },
          select: { id: true, name: true },
        })
      : Promise.resolve([]),
    staffIds.length
      ? prisma.staff.findMany({
          where: { staffid: { in: staffIds } },
          select: { staffid: true, firstName: true, lastName: true },
        })
      : Promise.resolve([]),
    prisma.task.findMany({
      select: { id: true, name: true },
      orderBy: { dateadded: "desc" },
      take: 50,
    }),
    prisma.staff.findMany({
      where: { active: 1 },
      select: { staffid: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  const taskMap = new Map(tasks.map((t) => [t.id, t.name]));
  const staffMap = new Map(
    staffList.map((s) => [
      s.staffid,
      `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim(),
    ])
  );

  // Calculate summary metrics
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  let totalHoursThisWeek = 0;
  let totalBillable = 0;
  let activeTimersCount = 0;

  for (const t of timers) {
    if (!t.endTime) {
      activeTimersCount += 1;
      continue;
    }
    const durationMs = t.endTime.getTime() - t.startTime.getTime();
    const hours = durationMs / (1000 * 60 * 60);
    if (t.startTime >= startOfWeek) {
      totalHoursThisWeek += hours;
    }
    if (t.hourlyRate) {
      totalBillable += hours * Number(t.hourlyRate);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Timesheets</h1>
          <Badge variant="secondary">{timers.length}</Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Hours This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {totalHoursThisWeek.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Total Billable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(totalBillable)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Active Timers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeTimersCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Hourly Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No timer entries yet.
                  </TableCell>
                </TableRow>
              ) : (
                timers.map((timer) => {
                  const rate = timer.hourlyRate
                    ? Number(timer.hourlyRate)
                    : 0;
                  const durationMs = timer.endTime
                    ? timer.endTime.getTime() - timer.startTime.getTime()
                    : 0;
                  const hours = durationMs / (1000 * 60 * 60);
                  const amount = hours * rate;
                  const running = !timer.endTime;

                  return (
                    <TableRow key={timer.id}>
                      <TableCell className="font-medium">
                        {taskMap.get(timer.taskId) ?? `Task #${timer.taskId}`}
                      </TableCell>
                      <TableCell>
                        {staffMap.get(timer.staffId) ?? "—"}
                      </TableCell>
                      <TableCell>{formatDateTime(timer.startTime)}</TableCell>
                      <TableCell>
                        {running ? (
                          <Badge variant="success">Running</Badge>
                        ) : (
                          formatDateTime(timer.endTime)
                        )}
                      </TableCell>
                      <TableCell>
                        {running ? "—" : formatDuration(durationMs)}
                      </TableCell>
                      <TableCell className="text-right">
                        {rate ? formatCurrency(rate) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {running ? "—" : formatCurrency(amount)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TimerWidget
        tasks={allTasks}
        staff={allStaff.map((s) => ({
          id: s.staffid,
          name: `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim(),
        }))}
        activeTimer={
          timers.find((t) => !t.endTime)
            ? {
                id: timers.find((t) => !t.endTime)!.id,
                taskId: timers.find((t) => !t.endTime)!.taskId,
                startTime: timers
                  .find((t) => !t.endTime)!
                  .startTime.toISOString(),
                note: timers.find((t) => !t.endTime)!.note ?? "",
              }
            : null
        }
      />
    </div>
  );
}

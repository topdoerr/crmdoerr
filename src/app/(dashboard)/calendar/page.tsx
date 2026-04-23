import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import CalendarView from "./calendar-view";
import EventForm from "./event-form";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string };
}) {
  const now = new Date();
  const year = searchParams?.year
    ? parseInt(searchParams.year, 10)
    : now.getFullYear();
  const month = searchParams?.month
    ? parseInt(searchParams.month, 10)
    : now.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // Include the visible grid range (up to 6 weeks) so events on adjacent
  // month days that are still visible show up.
  const gridStart = new Date(startOfMonth);
  gridStart.setDate(gridStart.getDate() - startOfMonth.getDay());
  const gridEnd = new Date(gridStart);
  gridEnd.setDate(gridEnd.getDate() + 42);

  const events = await prisma.calendarEvent.findMany({
    where: {
      startDate: {
        gte: gridStart,
        lte: gridEnd,
      },
    },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <Badge variant="secondary">{events.length}</Badge>
        </div>
        <EventForm />
      </div>

      <CalendarView
        year={year}
        month={month}
        events={events.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          startDate: e.startDate.toISOString(),
          endDate: e.endDate ? e.endDate.toISOString() : null,
          color: e.color ?? "#03a9f4",
          isPublic: e.isPublic === 1,
        }))}
      />
    </div>
  );
}

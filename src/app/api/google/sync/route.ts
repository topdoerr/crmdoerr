import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCalendarClient } from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { staffId } = await request.json();
  const id = Number(staffId || 1);

  const token = await prisma.googleCalendarToken.findUnique({
    where: { staffId: id },
  });

  if (!token) {
    return NextResponse.json({ error: "Not connected" }, { status: 400 });
  }

  try {
    const calendar = await getCalendarClient(token.accessToken, token.refreshToken);

    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const threeMonthsAhead = new Date(now);
    threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);

    const res = await calendar.events.list({
      calendarId: token.calendarId || "primary",
      timeMin: threeMonthsAgo.toISOString(),
      timeMax: threeMonthsAhead.toISOString(),
      maxResults: 500,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = res.data.items || [];
    let synced = 0;

    for (const event of events) {
      if (!event.summary || !event.start) continue;

      const startDate = event.start.dateTime
        ? new Date(event.start.dateTime)
        : event.start.date
          ? new Date(event.start.date)
          : null;

      const endDate = event.end?.dateTime
        ? new Date(event.end.dateTime)
        : event.end?.date
          ? new Date(event.end.date)
          : null;

      if (!startDate) continue;

      const existing = await prisma.calendarEvent.findFirst({
        where: {
          title: event.summary,
          startDate,
          staffId: id,
        },
      });

      if (!existing) {
        await prisma.calendarEvent.create({
          data: {
            title: event.summary,
            description: event.description || undefined,
            startDate,
            endDate: endDate || undefined,
            color: "#4285f4",
            staffId: id,
          },
        });
        synced++;
      }
    }

    await prisma.googleCalendarToken.update({
      where: { staffId: id },
      data: { lastSynced: new Date() },
    });

    return NextResponse.json({ synced, total: events.length });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

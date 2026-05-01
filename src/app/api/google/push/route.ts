import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCalendarClient } from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { staffId, eventId } = await request.json();
  const id = Number(staffId || 1);

  const token = await prisma.googleCalendarToken.findUnique({
    where: { staffId: id },
  });

  if (!token) {
    return NextResponse.json({ error: "Not connected" }, { status: 400 });
  }

  const event = await prisma.calendarEvent.findUnique({
    where: { id: Number(eventId) },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  try {
    const calendar = await getCalendarClient(token.accessToken, token.refreshToken);

    const googleEvent = await calendar.events.insert({
      calendarId: token.calendarId || "primary",
      requestBody: {
        summary: event.title,
        description: event.description || undefined,
        start: {
          dateTime: event.startDate.toISOString(),
          timeZone: "America/Puerto_Rico",
        },
        end: {
          dateTime: (event.endDate || event.startDate).toISOString(),
          timeZone: "America/Puerto_Rico",
        },
      },
    });

    return NextResponse.json({ id: googleEvent.data.id, link: googleEvent.data.htmlLink });
  } catch (error: any) {
    console.error("Push error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

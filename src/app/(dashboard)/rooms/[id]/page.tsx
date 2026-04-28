import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookingForm } from "../booking-form";
import { cancelBooking } from "../actions";

const currentStaffId = 1;

const HOURS = Array.from({ length: 12 }, (_, i) => i + 7); // 7 AM to 6 PM
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export default async function RoomDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const roomId = parseInt(params.id);
  const room = await prisma.meetingRoom.findUnique({ where: { id: roomId } });
  if (!room) notFound();

  const rooms = await prisma.meetingRoom.findMany({
    where: { active: 1 },
    select: { id: true, name: true },
  });

  // Get this week's bookings
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek === 0 ? 7 : dayOfWeek) - 1));
  monday.setHours(0, 0, 0, 0);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 5);

  const bookings = await prisma.roomBooking.findMany({
    where: {
      roomId,
      startTime: { gte: monday },
      endTime: { lte: friday },
    },
    orderBy: { startTime: "asc" },
  });

  // Map bookings to grid positions
  function getBookingStyle(booking: typeof bookings[0], dayIndex: number) {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const bookingDay = (start.getDay() + 6) % 7; // Mon=0
    if (bookingDay !== dayIndex) return null;
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const top = ((startHour - 7) / 11) * 100;
    const height = ((endHour - startHour) / 11) * 100;
    return { top: `${top}%`, height: `${height}%` };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/rooms" className="hover:underline text-primary">
              Meeting Rooms
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{room.name}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: room.color }}
            />
            {room.name}
          </h1>
        </div>
        <BookingForm
          rooms={rooms}
          defaultRoomId={roomId}
          staffId={currentStaffId}
          trigger={<button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">Book This Room</button>}
        />
      </div>

      {/* Room Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{room.location || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{room.capacity} people</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Amenities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {room.amenities ? (
              <div className="flex flex-wrap gap-1">
                {room.amenities.split(",").map((a) => (
                  <Badge key={a} variant="secondary">
                    {a.trim()}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-px bg-border rounded-md overflow-hidden">
            {/* Header */}
            <div className="bg-muted p-2 text-xs font-medium text-muted-foreground">
              Time
            </div>
            {DAYS.map((day) => (
              <div
                key={day}
                className="bg-muted p-2 text-xs font-medium text-center text-muted-foreground"
              >
                {day}
              </div>
            ))}

            {/* Time rows */}
            {HOURS.map((hour) => (
              <>
                <div
                  key={`t-${hour}`}
                  className="bg-background p-2 text-xs text-muted-foreground border-t border-border"
                >
                  {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                </div>
                {DAYS.map((_, dayIndex) => {
                  const booked = bookings.find((b) => {
                    const s = new Date(b.startTime);
                    const e = new Date(b.endTime);
                    const bd = (s.getDay() + 6) % 7;
                    return (
                      bd === dayIndex &&
                      s.getHours() <= hour &&
                      e.getHours() > hour
                    );
                  });
                  return (
                    <div
                      key={`${hour}-${dayIndex}`}
                      className={`bg-background p-1 text-xs border-t border-border min-h-[2rem] ${
                        booked ? "bg-primary/10" : ""
                      }`}
                    >
                      {booked &&
                        new Date(booked.startTime).getHours() === hour && (
                          <div
                            className="rounded px-1 py-0.5 text-xs font-medium truncate"
                            style={{
                              backgroundColor: room.color + "30",
                              borderLeft: `3px solid ${room.color}`,
                            }}
                          >
                            {booked.title}
                          </div>
                        )}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>This Week{"'"}s Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No bookings this week.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.title}</TableCell>
                    <TableCell>{formatDateTime(booking.startTime)}</TableCell>
                    <TableCell>{formatDateTime(booking.endTime)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {booking.notes || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {booking.staffId === currentStaffId && (
                        <form action={async () => {
                          "use server";
                          await cancelBooking(booking.id);
                        }}>
                          <button
                            type="submit"
                            className="text-sm text-destructive hover:underline"
                          >
                            Cancel
                          </button>
                        </form>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

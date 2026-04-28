import prisma from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
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
import { BookingForm } from "./booking-form";
import { cancelBooking } from "./actions";

const currentStaffId = 1;

export default async function RoomsPage() {
  const rooms = await prisma.meetingRoom.findMany({
    where: { active: 1 },
    orderBy: { name: "asc" },
  });

  // Get bookings for today and this week
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWeek = new Date(startOfDay);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const bookings = await prisma.roomBooking.findMany({
    where: {
      startTime: { gte: startOfDay },
      endTime: { lte: endOfWeek },
    },
    include: { room: true },
    orderBy: { startTime: "asc" },
  });

  const roomList = rooms.map((r) => ({ id: r.id, name: r.name }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Meeting Rooms</h1>
        <BookingForm rooms={roomList} staffId={currentStaffId} />
      </div>

      {/* Room Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Link key={room.id} href={`/rooms/${room.id}`}>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: room.color }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {room.location && (
                  <p className="text-sm text-muted-foreground">{room.location}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm">
                    Capacity: <strong>{room.capacity}</strong>
                  </span>
                </div>
                {room.amenities && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {room.amenities.split(",").map((a) => (
                      <Badge key={a} variant="secondary" className="text-xs">
                        {a.trim()}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
        {rooms.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-8">
            No meeting rooms configured.
          </p>
        )}
      </div>

      {/* This Week's Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings (This Week)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No bookings this week.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: booking.room.color }}
                        />
                        <span className="font-medium">{booking.room.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{booking.title}</TableCell>
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

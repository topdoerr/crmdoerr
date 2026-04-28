"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function createRoom(
  name: string,
  location: string | undefined,
  capacity: number,
  amenities: string | undefined,
  color: string
) {
  await prisma.meetingRoom.create({
    data: {
      name,
      location: location || undefined,
      capacity,
      amenities: amenities || undefined,
      color,
      active: 1,
    },
  });
  revalidatePath("/rooms");
}

export async function updateRoom(
  id: number,
  data: {
    name?: string;
    location?: string;
    capacity?: number;
    amenities?: string;
    color?: string;
    active?: number;
  }
) {
  await prisma.meetingRoom.update({
    where: { id },
    data,
  });
  revalidatePath("/rooms");
  revalidatePath(`/rooms/${id}`);
}

export async function createBooking(
  roomId: number,
  staffId: number,
  title: string,
  startTime: string,
  endTime: string,
  notes?: string
) {
  // Check for conflicts
  const conflicts = await prisma.roomBooking.findMany({
    where: {
      roomId,
      startTime: { lt: new Date(endTime) },
      endTime: { gt: new Date(startTime) },
    },
  });

  if (conflicts.length > 0) {
    throw new Error("This room is already booked for the selected time.");
  }

  await prisma.roomBooking.create({
    data: {
      roomId,
      staffId,
      title,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      notes: notes || undefined,
    },
  });

  revalidatePath("/rooms");
  revalidatePath(`/rooms/${roomId}`);
}

export async function cancelBooking(id: number) {
  const booking = await prisma.roomBooking.findUniqueOrThrow({ where: { id } });
  await prisma.roomBooking.delete({ where: { id } });
  revalidatePath("/rooms");
  revalidatePath(`/rooms/${booking.roomId}`);
}

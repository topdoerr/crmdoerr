"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface EventInput {
  title: string;
  description?: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  color?: string;
  isPublic?: boolean;
  staffId?: number | null;
  reminderBefore?: number | null;
}

export async function createEvent(data: EventInput) {
  if (!data.title) throw new Error("title is required");
  if (!data.startDate) throw new Error("startDate is required");

  const event = await prisma.calendarEvent.create({
    data: {
      title: data.title,
      description: data.description ?? undefined,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      color: data.color ?? undefined,
      isPublic: data.isPublic ? 1 : 0,
      staffId: data.staffId ?? undefined,
      reminderBefore: data.reminderBefore ?? undefined,
    },
  });

  revalidatePath("/calendar");
  return event;
}

export async function updateEvent(id: number, data: Partial<EventInput>) {
  if (!id) throw new Error("id is required");

  await prisma.calendarEvent.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate:
        data.endDate === null
          ? null
          : data.endDate
            ? new Date(data.endDate)
            : undefined,
      color: data.color,
      isPublic:
        data.isPublic === undefined ? undefined : data.isPublic ? 1 : 0,
      staffId: data.staffId === null ? null : data.staffId,
      reminderBefore:
        data.reminderBefore === null ? null : data.reminderBefore,
    },
  });

  revalidatePath("/calendar");
}

export async function deleteEvent(id: number) {
  if (!id) throw new Error("id is required");

  await prisma.calendarEvent.delete({ where: { id } });

  revalidatePath("/calendar");
}

"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function startTimer(
  taskId: number,
  staffId: number,
  hourlyRate?: number,
  note?: string
) {
  if (!taskId || !staffId) throw new Error("taskId and staffId are required");

  const timer = await prisma.taskTimer.create({
    data: {
      taskId,
      staffId,
      startTime: new Date(),
      endTime: undefined,
      hourlyRate: hourlyRate ?? undefined,
      note: note ?? undefined,
    },
  });

  revalidatePath("/timesheets");
  return timer;
}

export async function stopTimer(timerId: number) {
  if (!timerId) throw new Error("timerId is required");

  const timer = await prisma.taskTimer.update({
    where: { id: timerId },
    data: { endTime: new Date() },
  });

  revalidatePath("/timesheets");
  return timer;
}

export async function deleteTimer(id: number) {
  if (!id) throw new Error("id is required");

  await prisma.taskTimer.delete({ where: { id } });

  revalidatePath("/timesheets");
}

interface UpdateTimerData {
  taskId?: number;
  staffId?: number;
  startTime?: Date | string;
  endTime?: Date | string | null;
  hourlyRate?: number | null;
  note?: string | null;
}

export async function updateTimer(id: number, data: UpdateTimerData) {
  if (!id) throw new Error("id is required");

  await prisma.taskTimer.update({
    where: { id },
    data: {
      taskId: data.taskId,
      staffId: data.staffId,
      startTime: data.startTime ? new Date(data.startTime) : undefined,
      endTime:
        data.endTime === null
          ? null
          : data.endTime
            ? new Date(data.endTime)
            : undefined,
      hourlyRate:
        data.hourlyRate === null ? null : (data.hourlyRate ?? undefined),
      note: data.note === null ? null : (data.note ?? undefined),
    },
  });

  revalidatePath("/timesheets");
}

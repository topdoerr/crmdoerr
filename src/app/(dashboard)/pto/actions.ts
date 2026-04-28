"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function ensureBalance(staffId: number, year: number) {
  const existing = await prisma.ptoBalance.findUnique({
    where: { staffId_year: { staffId, year } },
  });
  if (existing) return existing;
  return prisma.ptoBalance.create({
    data: { staffId, year, allocated: 15, used: 0, pending: 0 },
  });
}

export async function createRequest(
  staffId: number,
  type: string,
  startDate: string,
  endDate: string,
  days: number,
  reason?: string
) {
  const year = new Date(startDate).getFullYear();
  await ensureBalance(staffId, year);

  await prisma.ptoRequest.create({
    data: {
      staffId,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      days,
      reason: reason || undefined,
      status: "pending",
    },
  });

  await prisma.ptoBalance.update({
    where: { staffId_year: { staffId, year } },
    data: { pending: { increment: days } },
  });

  revalidatePath("/pto");
}

export async function approveRequest(
  id: number,
  reviewedBy: number,
  reviewNote?: string
) {
  const request = await prisma.ptoRequest.findUniqueOrThrow({ where: { id } });

  await prisma.ptoRequest.update({
    where: { id },
    data: {
      status: "approved",
      reviewedBy,
      reviewedAt: new Date(),
      reviewNote: reviewNote || undefined,
    },
  });

  const year = new Date(request.startDate).getFullYear();
  await prisma.ptoBalance.update({
    where: { staffId_year: { staffId: request.staffId, year } },
    data: {
      pending: { decrement: request.days },
      used: { increment: request.days },
    },
  });

  revalidatePath("/pto");
}

export async function denyRequest(
  id: number,
  reviewedBy: number,
  reviewNote: string
) {
  const request = await prisma.ptoRequest.findUniqueOrThrow({ where: { id } });

  await prisma.ptoRequest.update({
    where: { id },
    data: {
      status: "denied",
      reviewedBy,
      reviewedAt: new Date(),
      reviewNote,
    },
  });

  const year = new Date(request.startDate).getFullYear();
  await prisma.ptoBalance.update({
    where: { staffId_year: { staffId: request.staffId, year } },
    data: { pending: { decrement: request.days } },
  });

  revalidatePath("/pto");
}

export async function cancelRequest(id: number) {
  const request = await prisma.ptoRequest.findUniqueOrThrow({ where: { id } });

  if (request.status === "pending") {
    const year = new Date(request.startDate).getFullYear();
    await prisma.ptoBalance.update({
      where: { staffId_year: { staffId: request.staffId, year } },
      data: { pending: { decrement: request.days } },
    });
  } else if (request.status === "approved") {
    const year = new Date(request.startDate).getFullYear();
    await prisma.ptoBalance.update({
      where: { staffId_year: { staffId: request.staffId, year } },
      data: { used: { decrement: request.days } },
    });
  }

  await prisma.ptoRequest.update({
    where: { id },
    data: { status: "cancelled" },
  });

  revalidatePath("/pto");
}

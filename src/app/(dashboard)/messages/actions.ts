"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function sendMessage(
  fromStaffId: number,
  toStaffId: number,
  subject: string,
  body: string,
  parentId?: number
) {
  const message = await prisma.message.create({
    data: {
      fromStaffId,
      toStaffId,
      subject: subject || undefined,
      body,
      parentId: parentId ?? undefined,
    },
  });

  revalidatePath("/messages");
  return message;
}

export async function markAsRead(id: number) {
  await prisma.message.update({
    where: { id },
    data: { read: 1 },
  });
  revalidatePath("/messages");
  revalidatePath(`/messages/${id}`);
}

export async function deleteMessage(id: number) {
  await prisma.message.delete({ where: { id } });
  revalidatePath("/messages");
}

"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(formData: FormData) {
  const dateStart = formData.get("dateStart") as string;
  const dateEnd = formData.get("dateEnd") as string;
  const data = {
    name: formData.get("name") as string,
    message: formData.get("message") as string,
    showToStaff: formData.get("showToStaff") ? 1 : 0,
    showToClients: formData.get("showToClients") ? 1 : 0,
    showFrom: formData.get("showFrom")
      ? Number(formData.get("showFrom"))
      : undefined,
    dateStart: dateStart ? new Date(dateStart) : undefined,
    dateEnd: dateEnd ? new Date(dateEnd) : undefined,
  };
  const a = await prisma.announcement.create({ data });
  revalidatePath("/announcements");
  return a;
}

export async function updateAnnouncement(id: number, formData: FormData) {
  const dateStart = formData.get("dateStart") as string;
  const dateEnd = formData.get("dateEnd") as string;
  const data = {
    name: formData.get("name") as string,
    message: formData.get("message") as string,
    showToStaff: formData.get("showToStaff") ? 1 : 0,
    showToClients: formData.get("showToClients") ? 1 : 0,
    dateStart: dateStart ? new Date(dateStart) : null,
    dateEnd: dateEnd ? new Date(dateEnd) : null,
  };
  const a = await prisma.announcement.update({ where: { id }, data });
  revalidatePath("/announcements");
  return a;
}

export async function deleteAnnouncement(id: number) {
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/announcements");
}

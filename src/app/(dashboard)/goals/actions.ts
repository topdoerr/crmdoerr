"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createGoal(formData: FormData) {
  await prisma.goal.create({
    data: {
      subject: formData.get("subject") as string,
      description: (formData.get("description") as string) || undefined,
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      goalType: Number(formData.get("goalType")) || 1,
      achievement: "0",
      notifyWhenAchieved: formData.get("notifyWhenAchieved") ? 1 : 0,
      notifyStaff: formData.get("notifyStaff") ? 1 : 0,
    },
  });

  revalidatePath("/goals");
}

export async function updateGoal(id: number, formData: FormData) {
  await prisma.goal.update({
    where: { id },
    data: {
      subject: (formData.get("subject") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      startDate: formData.get("startDate")
        ? new Date(formData.get("startDate") as string)
        : undefined,
      endDate: formData.get("endDate")
        ? new Date(formData.get("endDate") as string)
        : undefined,
      goalType: formData.get("goalType")
        ? Number(formData.get("goalType"))
        : undefined,
      achievement: (formData.get("achievement") as string) || undefined,
    },
  });

  revalidatePath("/goals");
}

export async function deleteGoal(id: number) {
  await prisma.goal.delete({ where: { id } });
  revalidatePath("/goals");
}

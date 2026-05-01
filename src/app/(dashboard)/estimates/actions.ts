"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createEstimate(formData: FormData) {
  const data = {
    clientId: formData.get("clientId") ? Number(formData.get("clientId")) : 0,
    prefix: (formData.get("prefix") as string) || undefined,
    number: formData.get("number") ? Number(formData.get("number")) : 1,
    date: formData.get("date")
      ? new Date(formData.get("date") as string)
      : new Date(),
    expirydate: formData.get("expirydate")
      ? new Date(formData.get("expirydate") as string)
      : new Date(),
    status: formData.get("status") ? Number(formData.get("status")) : 1,
  };

  const estimate = await prisma.estimate.create({ data });

  revalidatePath("/estimates");
  return estimate;
}

export async function deleteEstimate(id: number) {
  await prisma.estimate.delete({ where: { id } });

  revalidatePath("/estimates");
}

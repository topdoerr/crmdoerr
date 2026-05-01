"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createContract(formData: FormData) {
  const data = {
    subject: (formData.get("subject") as string) || "",
    client: formData.get("client") ? Number(formData.get("client")) : 0,
    description: (formData.get("description") as string) || undefined,
    content: (formData.get("content") as string) || undefined,
    contractType: formData.get("contractType")
      ? Number(formData.get("contractType"))
      : undefined,
    contractValue: formData.get("contractValue")
      ? Number(formData.get("contractValue"))
      : undefined,
    datestart: formData.get("datestart")
      ? new Date(formData.get("datestart") as string)
      : new Date(),
    dateend: formData.get("dateend")
      ? new Date(formData.get("dateend") as string)
      : undefined,
    signed: 0,
    trash: 0,
  };

  const contract = await prisma.contract.create({ data });

  revalidatePath("/contracts");
  return contract;
}

export async function deleteContract(id: number) {
  await prisma.contract.delete({ where: { id } });

  revalidatePath("/contracts");
}

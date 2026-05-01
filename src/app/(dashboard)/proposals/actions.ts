"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProposal(formData: FormData) {
  const data = {
    subject: (formData.get("subject") as string) || "",
    proposalTo: (formData.get("proposalTo") as string) || undefined,
    content: (formData.get("content") as string) || undefined,
    date: formData.get("date")
      ? new Date(formData.get("date") as string)
      : new Date(),
    openTill: formData.get("openTill")
      ? new Date(formData.get("openTill") as string)
      : undefined,
    status: formData.get("status") ? Number(formData.get("status")) : 6,
  };

  const proposal = await prisma.proposal.create({ data });

  revalidatePath("/proposals");
  return proposal;
}

export async function deleteProposal(id: number) {
  await prisma.proposal.delete({ where: { id } });

  revalidatePath("/proposals");
}

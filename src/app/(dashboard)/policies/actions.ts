"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPolicy(
  title: string,
  content: string,
  version: string,
  requireAck: number
) {
  const policy = await prisma.companyPolicy.create({
    data: { title, content, version, requireAck, publishedAt: new Date() },
  });
  revalidatePath("/policies");
  return policy;
}

export async function updatePolicy(
  id: number,
  data: { title?: string; content?: string; version?: string; requireAck?: number }
) {
  await prisma.companyPolicy.update({ where: { id }, data });
  revalidatePath("/policies");
  revalidatePath(`/policies/${id}`);
}

export async function deletePolicy(id: number) {
  await prisma.companyPolicy.delete({ where: { id } });
  revalidatePath("/policies");
}

export async function acknowledgePolicy(policyId: number, staffId: number) {
  await prisma.policyAcknowledgement.create({
    data: { policyId, staffId },
  });
  revalidatePath(`/policies/${policyId}`);
  revalidatePath("/policies");
  revalidatePath("/dashboard");
}

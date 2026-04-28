"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTemplate(name: string) {
  const template = await prisma.onboardingTemplate.create({ data: { name } });
  revalidatePath("/onboarding");
  return template;
}

export async function updateTemplate(id: number, name: string) {
  await prisma.onboardingTemplate.update({ where: { id }, data: { name } });
  revalidatePath("/onboarding");
  revalidatePath(`/onboarding/${id}`);
}

export async function deleteTemplate(id: number) {
  await prisma.onboardingTemplate.delete({ where: { id } });
  revalidatePath("/onboarding");
}

export async function addItem(
  templateId: number,
  title: string,
  description: string | undefined,
  assignTo: string,
  itemOrder: number
) {
  const item = await prisma.onboardingItem.create({
    data: { templateId, title, description, assignTo, itemOrder },
  });
  revalidatePath(`/onboarding/${templateId}`);
  return item;
}

export async function updateItem(
  id: number,
  data: { title?: string; description?: string; assignTo?: string; itemOrder?: number }
) {
  const item = await prisma.onboardingItem.update({ where: { id }, data });
  revalidatePath(`/onboarding/${item.templateId}`);
  return item;
}

export async function deleteItem(id: number) {
  const item = await prisma.onboardingItem.delete({ where: { id } });
  revalidatePath(`/onboarding/${item.templateId}`);
}

export async function assignTemplate(staffId: number, templateId: number) {
  const items = await prisma.onboardingItem.findMany({
    where: { templateId },
    select: { id: true },
  });

  await prisma.onboardingProgress.createMany({
    data: items.map((item) => ({
      staffId,
      templateId,
      itemId: item.id,
      completed: 0,
    })),
    skipDuplicates: true,
  });

  revalidatePath(`/onboarding/${templateId}`);
  revalidatePath("/onboarding");
}

export async function toggleItemComplete(staffId: number, itemId: number) {
  const existing = await prisma.onboardingProgress.findUnique({
    where: { staffId_itemId: { staffId, itemId } },
  });

  if (!existing) return;

  const nowComplete = existing.completed === 0;
  await prisma.onboardingProgress.update({
    where: { id: existing.id },
    data: {
      completed: nowComplete ? 1 : 0,
      completedAt: nowComplete ? new Date() : undefined,
    },
  });

  revalidatePath("/onboarding");
}

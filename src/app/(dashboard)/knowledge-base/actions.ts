"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 180);
}

interface ArticleInput {
  subject: string;
  slug?: string;
  description: string;
  groupId?: number | null;
  active?: boolean;
  staffArticle?: boolean;
}

export async function createArticle(data: ArticleInput) {
  const slug = (data.slug && data.slug.trim()) || slugify(data.subject);
  const article = await prisma.knowledgeBaseArticle.create({
    data: {
      subject: data.subject,
      slug,
      description: data.description,
      groupId: data.groupId ?? undefined,
      active: data.active === false ? 0 : 1,
      staffArticle: data.staffArticle ? 1 : 0,
    },
  });
  revalidatePath("/knowledge-base");
  return article;
}

export async function updateArticle(id: number, data: ArticleInput) {
  const slug = (data.slug && data.slug.trim()) || slugify(data.subject);
  await prisma.knowledgeBaseArticle.update({
    where: { id },
    data: {
      subject: data.subject,
      slug,
      description: data.description,
      groupId: data.groupId ?? null,
      active: data.active === false ? 0 : 1,
      staffArticle: data.staffArticle ? 1 : 0,
    },
  });
  revalidatePath("/knowledge-base");
  revalidatePath(`/knowledge-base/${slug}`);
}

export async function deleteArticle(id: number) {
  await prisma.knowledgeBaseArticle.delete({ where: { id } });
  revalidatePath("/knowledge-base");
}

export async function incrementViews(id: number) {
  await prisma.knowledgeBaseArticle.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
}

interface GroupInput {
  name: string;
  description?: string;
  color?: string;
  groupOrder?: number;
  active?: boolean;
}

export async function createGroup(data: GroupInput) {
  const g = await prisma.knowledgeBaseGroup.create({
    data: {
      name: data.name,
      description: data.description || undefined,
      color: data.color || "#2a88d5",
      groupOrder: data.groupOrder ?? 0,
      active: data.active === false ? 0 : 1,
    },
  });
  revalidatePath("/knowledge-base");
  revalidatePath("/knowledge-base/groups");
  return g;
}

export async function updateGroup(id: number, data: GroupInput) {
  await prisma.knowledgeBaseGroup.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || null,
      color: data.color || "#2a88d5",
      groupOrder: data.groupOrder ?? 0,
      active: data.active === false ? 0 : 1,
    },
  });
  revalidatePath("/knowledge-base");
  revalidatePath("/knowledge-base/groups");
}

export async function deleteGroup(id: number) {
  // Detach articles
  await prisma.knowledgeBaseArticle.updateMany({
    where: { groupId: id },
    data: { groupId: null },
  });
  await prisma.knowledgeBaseGroup.delete({ where: { id } });
  revalidatePath("/knowledge-base");
  revalidatePath("/knowledge-base/groups");
}

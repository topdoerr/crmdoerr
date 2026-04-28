"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function createPost(staffId: number, content: string) {
  if (!content.trim()) throw new Error("Content is required");
  await prisma.newsFeedPost.create({
    data: { staffId, content },
  });
  revalidatePath("/feed");
}

export async function deletePost(id: number) {
  await prisma.newsFeedPost.delete({ where: { id } });
  revalidatePath("/feed");
}

export async function toggleLike(postId: number, staffId: number) {
  const existing = await prisma.newsFeedLike.findUnique({
    where: { postId_staffId: { postId, staffId } },
  });
  if (existing) {
    await prisma.newsFeedLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.newsFeedLike.create({
      data: { postId, staffId },
    });
  }
  revalidatePath("/feed");
}

export async function addComment(postId: number, staffId: number, content: string) {
  if (!content.trim()) throw new Error("Comment is required");
  await prisma.newsFeedComment.create({
    data: { postId, staffId, content },
  });
  revalidatePath("/feed");
}

export async function deleteComment(id: number) {
  await prisma.newsFeedComment.delete({ where: { id } });
  revalidatePath("/feed");
}

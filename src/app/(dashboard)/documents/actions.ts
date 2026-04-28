"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function createFolder(
  name: string,
  parentId?: number,
  createdBy?: number
) {
  await prisma.documentFolder.create({
    data: {
      name,
      parentId: parentId ?? undefined,
      createdBy: createdBy ?? undefined,
      isPublic: 1,
    },
  });
  revalidatePath("/documents");
}

export async function deleteFolder(id: number) {
  // Delete all documents in the folder first
  await prisma.document.deleteMany({ where: { folderId: id } });
  // Delete child folders recursively
  const children = await prisma.documentFolder.findMany({
    where: { parentId: id },
  });
  for (const child of children) {
    await deleteFolder(child.id);
  }
  await prisma.documentFolder.delete({ where: { id } });
  revalidatePath("/documents");
}

export async function uploadDocument(
  folderId: number | null,
  title: string,
  description: string | undefined,
  fileName: string,
  filePath: string,
  fileSize: number | undefined,
  fileType: string | undefined,
  uploadedBy: number | undefined
) {
  await prisma.document.create({
    data: {
      folderId: folderId ?? undefined,
      title,
      description: description || undefined,
      fileName,
      filePath,
      fileSize: fileSize ?? undefined,
      fileType: fileType ?? undefined,
      version: 1,
      uploadedBy: uploadedBy ?? undefined,
    },
  });
  revalidatePath("/documents");
}

export async function deleteDocument(id: number) {
  await prisma.document.delete({ where: { id } });
  revalidatePath("/documents");
}

export async function moveDocument(docId: number, newFolderId: number) {
  await prisma.document.update({
    where: { id: docId },
    data: { folderId: newFolderId },
  });
  revalidatePath("/documents");
}

"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { saveUploadedFile, deleteUploadedFile } from "@/lib/upload";
import { authOptions } from "@/lib/auth";

export async function uploadFile(
  formData: FormData,
  relType: string,
  relId: number
) {
  const file = formData.get("file") as File | null;
  if (!file || typeof file === "string") {
    throw new Error("No file uploaded");
  }

  const session = await getServerSession(authOptions);
  const staffId = session?.user?.id ? parseInt(session.user.id, 10) : undefined;

  const filePath = await saveUploadedFile(file, relType, relId);

  const record = await prisma.fileAttachment.create({
    data: {
      relId,
      relType,
      fileName: file.name,
      fileType: file.type || undefined,
      fileSize: file.size,
      filePath,
      staffId: staffId ?? undefined,
      contactId: undefined,
    },
  });

  revalidatePath(`/${relType}/${relId}`);
  return record;
}

export async function deleteFile(id: number) {
  const record = await prisma.fileAttachment.findUnique({ where: { id } });
  if (!record) return;

  await deleteUploadedFile(record.filePath);
  await prisma.fileAttachment.delete({ where: { id } });

  revalidatePath(`/${record.relType}/${record.relId}`);
}

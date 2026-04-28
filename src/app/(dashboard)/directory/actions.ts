"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function updateProfile(
  staffId: number,
  data: {
    birthday?: string;
    startDate?: string;
    department?: string;
    jobTitle?: string;
    location?: string;
    bio?: string;
    phone?: string;
    extension?: string;
    linkedIn?: string;
    reportsTo?: number;
  }
) {
  await prisma.staffProfile.upsert({
    where: { staffId },
    update: {
      birthday: data.birthday ? new Date(data.birthday) : undefined,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      department: data.department || undefined,
      jobTitle: data.jobTitle || undefined,
      location: data.location || undefined,
      bio: data.bio || undefined,
      phone: data.phone || undefined,
      extension: data.extension || undefined,
      linkedIn: data.linkedIn || undefined,
      reportsTo: data.reportsTo || undefined,
    },
    create: {
      staffId,
      birthday: data.birthday ? new Date(data.birthday) : undefined,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      department: data.department || undefined,
      jobTitle: data.jobTitle || undefined,
      location: data.location || undefined,
      bio: data.bio || undefined,
      phone: data.phone || undefined,
      extension: data.extension || undefined,
      linkedIn: data.linkedIn || undefined,
      reportsTo: data.reportsTo || undefined,
    },
  });

  revalidatePath("/directory");
  revalidatePath(`/directory/${staffId}`);
}

export async function createProfile(
  staffId: number,
  data: {
    department?: string;
    jobTitle?: string;
    location?: string;
    bio?: string;
    phone?: string;
    extension?: string;
    linkedIn?: string;
  }
) {
  await prisma.staffProfile.create({
    data: {
      staffId,
      department: data.department || undefined,
      jobTitle: data.jobTitle || undefined,
      location: data.location || undefined,
      bio: data.bio || undefined,
      phone: data.phone || undefined,
      extension: data.extension || undefined,
      linkedIn: data.linkedIn || undefined,
    },
  });

  revalidatePath("/directory");
  revalidatePath(`/directory/${staffId}`);
}

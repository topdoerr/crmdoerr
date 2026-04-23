"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function createStaff(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phonenumber = (formData.get("phonenumber") as string) || undefined;
  const admin = formData.get("admin") ? 1 : 0;
  const active = formData.get("active") ? 1 : 0;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const hashed = await bcrypt.hash(password, 10);

  const staff = await prisma.staff.create({
    data: {
      email,
      password: hashed,
      firstName,
      lastName,
      phonenumber: phonenumber ?? undefined,
      admin,
      active,
    },
  });

  revalidatePath("/staff");
  return staff;
}

export async function updateStaff(id: number, formData: FormData) {
  const email = formData.get("email") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const phonenumber = (formData.get("phonenumber") as string) || null;
  const admin = formData.get("admin") ? 1 : 0;
  const active = formData.get("active") ? 1 : 0;

  const staff = await prisma.staff.update({
    where: { staffid: id },
    data: {
      email,
      firstName,
      lastName,
      phonenumber,
      admin,
      active,
    },
  });

  revalidatePath("/staff");
  revalidatePath(`/staff/${id}`);
  return staff;
}

export async function deactivateStaff(id: number) {
  await prisma.staff.update({
    where: { staffid: id },
    data: { active: 0 },
  });
  revalidatePath("/staff");
  revalidatePath(`/staff/${id}`);
}

export async function setPassword(id: number, newPassword: string) {
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await prisma.staff.update({
    where: { staffid: id },
    data: { password: hashed },
  });
  revalidatePath(`/staff/${id}`);
}

export async function setPermission(
  staffId: number,
  feature: string,
  capability: string,
  granted: boolean
) {
  if (granted) {
    await prisma.staffPermission.upsert({
      where: {
        staffId_feature_capability: { staffId, feature, capability },
      },
      create: { staffId, feature, capability },
      update: {},
    });
  } else {
    await prisma.staffPermission.deleteMany({
      where: { staffId, feature, capability },
    });
  }
  revalidatePath(`/staff/${staffId}`);
}

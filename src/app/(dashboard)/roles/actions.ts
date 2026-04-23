"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createRole(formData: FormData) {
  const name = formData.get("name") as string;
  const permissions = (formData.get("permissions") as string) || undefined;
  const role = await prisma.role.create({
    data: { name, permissions },
  });
  revalidatePath("/roles");
  return role;
}

export async function updateRole(
  id: number,
  data: { name?: string; permissions?: Record<string, string[]> },
) {
  await prisma.role.update({
    where: { id },
    data: {
      name: data.name,
      permissions: data.permissions
        ? JSON.stringify(data.permissions)
        : undefined,
    },
  });
  revalidatePath("/roles");
  revalidatePath(`/roles/${id}`);
}

export async function deleteRole(id: number) {
  await prisma.role.delete({ where: { id } });
  revalidatePath("/roles");
}

export async function assignRoleToStaff(staffId: number, roleId: number) {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) throw new Error("Role not found");

  // Parse role permissions and apply to staff
  let perms: Record<string, string[]> = {};
  try {
    perms = role.permissions ? JSON.parse(role.permissions) : {};
  } catch {
    perms = {};
  }

  // Clear existing and re-apply
  await prisma.staffPermission.deleteMany({ where: { staffId } });

  const rows: { staffId: number; feature: string; capability: string }[] = [];
  for (const [feature, caps] of Object.entries(perms)) {
    for (const capability of caps) {
      rows.push({ staffId, feature, capability });
    }
  }
  if (rows.length) {
    await prisma.staffPermission.createMany({ data: rows });
  }

  revalidatePath("/roles");
}

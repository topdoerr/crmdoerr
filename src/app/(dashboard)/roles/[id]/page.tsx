import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { FEATURES, CAPABILITIES } from "@/lib/permissions";
import { RoleEditor } from "./role-editor";

export default async function RolePage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (Number.isNaN(id)) notFound();

  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) notFound();

  let parsed: Record<string, string[]> = {};
  try {
    parsed = role.permissions ? JSON.parse(role.permissions) : {};
  } catch {
    parsed = {};
  }

  return (
    <RoleEditor
      role={{ id: role.id, name: role.name, permissions: parsed }}
      features={FEATURES}
      capabilities={[...CAPABILITIES]}
    />
  );
}

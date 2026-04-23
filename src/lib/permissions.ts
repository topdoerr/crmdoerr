import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function hasPermission(
  staffId: number,
  feature: string,
  capability: string,
): Promise<boolean> {
  const staff = await prisma.staff.findUnique({
    where: { staffid: staffId },
    select: { admin: true },
  });
  if (staff?.admin === 1) return true;

  const perm = await prisma.staffPermission.findFirst({
    where: { staffId, feature, capability },
  });
  return !!perm;
}

export async function requirePermission(
  feature: string,
  capability: string,
): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  const allowed = await hasPermission(
    Number(session.user.id),
    feature,
    capability,
  );
  if (!allowed) {
    throw new Error(
      `Permission denied: missing ${capability} on ${feature}`,
    );
  }
}

export const FEATURES = [
  "clients",
  "invoices",
  "estimates",
  "proposals",
  "contracts",
  "projects",
  "tasks",
  "tickets",
  "leads",
  "expenses",
  "reports",
  "settings",
  "staff",
  "roles",
];

export const CAPABILITIES = ["view", "create", "edit", "delete"] as const;

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const staff = await prisma.staff.findMany({
    where: { active: 1 },
    select: { staffid: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });
  return NextResponse.json(staff);
}

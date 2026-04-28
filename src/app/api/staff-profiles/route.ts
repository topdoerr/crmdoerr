import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const profiles = await prisma.staffProfile.findMany({
    select: { staffId: true, jobTitle: true, reportsTo: true },
  });
  return NextResponse.json(profiles);
}

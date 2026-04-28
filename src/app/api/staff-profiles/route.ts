import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const profiles = await prisma.staffProfile.findMany({
    select: { staffId: true, jobTitle: true, reportsTo: true },
  });
  return NextResponse.json(profiles);
}

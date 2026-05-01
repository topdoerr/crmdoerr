import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const staffCount = await prisma.staff.count();
    const adminUser = await prisma.staff.findFirst({
      where: { email: "admin@crmdoerr.com" },
      select: { staffid: true, email: true, firstName: true, active: true },
    });

    return NextResponse.json({
      status: "ok",
      database: "connected",
      staffCount,
      adminUser: adminUser
        ? { exists: true, active: adminUser.active === 1 }
        : { exists: false, hint: "Run: node prisma/seed.js" },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error.message,
        hint: "Check DATABASE_URL environment variable",
      },
      { status: 500 }
    );
  }
}

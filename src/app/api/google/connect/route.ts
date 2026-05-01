import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const staffId = Number(searchParams.get("staffId") || 1);
  const url = getAuthUrl(staffId);
  return NextResponse.redirect(url);
}

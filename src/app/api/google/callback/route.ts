import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOAuth2Client } from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const staffId = Number(searchParams.get("state") || 1);

  if (!code) {
    return NextResponse.redirect(new URL("/calendar?error=no_code", request.url));
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    await prisma.googleCalendarToken.upsert({
      where: { staffId },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || undefined,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      },
      create: {
        staffId,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      },
    });

    return NextResponse.redirect(new URL("/calendar?connected=true", request.url));
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(new URL("/calendar?error=auth_failed", request.url));
  }
}

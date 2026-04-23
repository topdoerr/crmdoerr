import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET() {
  return processQueue();
}

export async function POST() {
  return processQueue();
}

async function processQueue() {
  const pending = await prisma.emailQueue.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  const results: Array<{ id: number; status: string; error?: string }> = [];

  for (const item of pending) {
    try {
      await sendEmail({
        to: item.toName ? `"${item.toName}" <${item.toEmail}>` : item.toEmail,
        subject: item.subject,
        html: item.message,
      });

      await prisma.emailQueue.update({
        where: { id: item.id },
        data: {
          status: "sent",
          sentAt: new Date(),
          error: null,
          attempts: item.attempts + 1,
        },
      });

      results.push({ id: item.id, status: "sent" });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error";
      await prisma.emailQueue.update({
        where: { id: item.id },
        data: {
          status: "failed",
          error: errorMessage,
          attempts: item.attempts + 1,
        },
      });
      results.push({ id: item.id, status: "failed", error: errorMessage });
    }
  }

  return NextResponse.json({
    processed: results.length,
    results,
  });
}

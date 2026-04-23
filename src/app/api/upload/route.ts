import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/upload";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const relType = formData.get("relType") as string | null;
    const relIdRaw = formData.get("relId") as string | null;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "File required" }, { status: 400 });
    }
    if (!relType || !relIdRaw) {
      return NextResponse.json(
        { error: "relType and relId required" },
        { status: 400 }
      );
    }
    const relId = parseInt(relIdRaw, 10);
    if (Number.isNaN(relId)) {
      return NextResponse.json({ error: "Invalid relId" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const staffId = session?.user?.id
      ? parseInt(session.user.id, 10)
      : undefined;

    const filePath = await saveUploadedFile(file, relType, relId);

    const record = await prisma.fileAttachment.create({
      data: {
        relId,
        relType,
        fileName: file.name,
        fileType: file.type || undefined,
        fileSize: file.size,
        filePath,
        staffId: staffId ?? undefined,
        contactId: undefined,
      },
    });

    return NextResponse.json({ success: true, file: record });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

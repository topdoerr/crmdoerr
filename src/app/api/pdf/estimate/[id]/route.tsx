import { NextResponse } from "next/server";
import { Readable } from "stream";
import { renderToStream } from "@react-pdf/renderer";
import prisma from "@/lib/prisma";
import { EstimatePDF } from "@/lib/pdf/estimate-pdf";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const estimate = await prisma.estimate.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!estimate) {
    return NextResponse.json({ error: "Estimate not found" }, { status: 404 });
  }

  const lineItems = await prisma.lineItem.findMany({
    where: { relId: estimate.id, relType: "estimate" },
    orderBy: { itemOrder: "asc" },
  });

  const stream = await renderToStream(
    <EstimatePDF
      estimate={estimate}
      client={estimate.client}
      lineItems={lineItems}
    />
  );

  const filename = `estimate-${estimate.prefix ?? "EST-"}${estimate.number}.pdf`;

  return new NextResponse(Readable.toWeb(stream as any) as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

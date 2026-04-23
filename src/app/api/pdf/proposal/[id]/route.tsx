import { NextResponse } from "next/server";
import { Readable } from "stream";
import { renderToStream } from "@react-pdf/renderer";
import prisma from "@/lib/prisma";
import { ProposalPDF } from "@/lib/pdf/proposal-pdf";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }

  const lineItems = await prisma.lineItem.findMany({
    where: { relId: proposal.id, relType: "proposal" },
    orderBy: { itemOrder: "asc" },
  });

  const stream = await renderToStream(
    <ProposalPDF proposal={proposal} lineItems={lineItems} />
  );

  const filename = `proposal-${proposal.id}.pdf`;

  return new NextResponse(Readable.toWeb(stream as any) as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

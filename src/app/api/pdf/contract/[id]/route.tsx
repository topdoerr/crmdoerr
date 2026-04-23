import { NextResponse } from "next/server";
import { Readable } from "stream";
import { renderToStream } from "@react-pdf/renderer";
import prisma from "@/lib/prisma";
import { ContractPDF } from "@/lib/pdf/contract-pdf";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { contractClient: true },
  });

  if (!contract) {
    return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  }

  const stream = await renderToStream(
    <ContractPDF contract={contract} client={contract.contractClient} />
  );

  const filename = `contract-${contract.id}.pdf`;

  return new NextResponse(Readable.toWeb(stream as any) as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

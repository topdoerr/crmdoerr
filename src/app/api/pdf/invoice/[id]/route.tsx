import { NextResponse } from "next/server";
import { Readable } from "stream";
import { renderToStream } from "@react-pdf/renderer";
import prisma from "@/lib/prisma";
import { InvoicePDF } from "@/lib/pdf/invoice-pdf";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: true },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const lineItems = await prisma.lineItem.findMany({
    where: { relId: invoice.id, relType: "invoice" },
    orderBy: { itemOrder: "asc" },
  });

  const stream = await renderToStream(
    <InvoicePDF
      invoice={invoice}
      client={invoice.client}
      lineItems={lineItems}
    />
  );

  const filename = `invoice-${invoice.prefix ?? "INV-"}${invoice.number}.pdf`;

  return new NextResponse(Readable.toWeb(stream as any) as any, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

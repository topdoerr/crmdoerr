import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

function computeNext(from: Date, type: string, value: number): Date {
  const d = new Date(from);
  if (type === "day") d.setDate(d.getDate() + value);
  else if (type === "week") d.setDate(d.getDate() + value * 7);
  else if (type === "month") d.setMonth(d.getMonth() + value);
  return d;
}

export async function GET() {
  const now = new Date();

  const due = await prisma.recurringInvoice.findMany({
    where: {
      active: 1,
      nextCreation: { lte: now },
    },
  });

  const results: Array<{
    recurringId: number;
    invoiceId?: number;
    deactivated?: boolean;
    error?: string;
  }> = [];

  for (const ri of due) {
    try {
      // Determine the next invoice number for this client (or global)
      const last = await prisma.invoice.findFirst({
        orderBy: { number: "desc" },
        select: { number: true },
      });
      const nextNumber = (last?.number ?? 0) + 1;

      const date = now;
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 30);

      // Find any existing line-item template for this recurring invoice (relType="recurring_invoice")
      const templateItems = await prisma.lineItem.findMany({
        where: { relId: ri.id, relType: "recurring_invoice" },
        orderBy: { itemOrder: "asc" },
      });

      const invoice = await prisma.invoice.create({
        data: {
          clientId: ri.clientId,
          number: nextNumber,
          prefix: "INV-",
          date,
          dueDate,
          subtotal: ri.subtotal,
          total: ri.total,
          status: 1,
        },
      });

      if (templateItems.length > 0) {
        await prisma.lineItem.createMany({
          data: templateItems.map((it, idx) => ({
            relId: invoice.id,
            relType: "invoice",
            description: it.description,
            longDescription: it.longDescription ?? undefined,
            qty: it.qty,
            rate: it.rate,
            unit: it.unit ?? undefined,
            itemOrder: it.itemOrder ?? idx + 1,
          })),
        });
      }

      const newCycles = ri.cycles + 1;
      const reachedLimit =
        ri.totalCycles > 0 && newCycles >= ri.totalCycles;

      const nextCreation = reachedLimit
        ? null
        : computeNext(now, ri.recurringType, ri.recurringValue);

      await prisma.recurringInvoice.update({
        where: { id: ri.id },
        data: {
          lastCreated: now,
          nextCreation: nextCreation ?? undefined,
          cycles: newCycles,
          active: reachedLimit ? 0 : 1,
        },
      });

      results.push({
        recurringId: ri.id,
        invoiceId: invoice.id,
        deactivated: reachedLimit,
      });
    } catch (err) {
      results.push({
        recurringId: ri.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    processedAt: now.toISOString(),
    count: results.length,
    results,
  });
}

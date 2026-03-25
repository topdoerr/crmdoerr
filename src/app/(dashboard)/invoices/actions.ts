"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface LineItemInput {
  description: string;
  longDescription?: string;
  qty: number;
  rate: number;
  unit?: string;
  itemOrder?: number;
}

interface CreateInvoiceData {
  clientId: number;
  number: number;
  prefix?: string;
  date: string;
  dueDate: string;
  subtotal: number;
  total: number;
  totalTax?: number;
  discountPercent?: number;
  discountTotal?: number;
  adjustment?: number;
  clientNote?: string;
  adminNote?: string;
  status?: number;
  lineItems: LineItemInput[];
}

export async function createInvoice(data: CreateInvoiceData) {
  const invoice = await prisma.invoice.create({
    data: {
      clientId: data.clientId,
      number: data.number,
      prefix: data.prefix || "INV-",
      date: new Date(data.date),
      dueDate: new Date(data.dueDate),
      subtotal: data.subtotal,
      total: data.total,
      totalTax: data.totalTax ?? 0,
      discountPercent: data.discountPercent ?? 0,
      discountTotal: data.discountTotal ?? 0,
      adjustment: data.adjustment ?? 0,
      clientNote: data.clientNote || null,
      adminNote: data.adminNote || null,
      status: data.status ?? 6,
    },
  });

  if (data.lineItems.length > 0) {
    await prisma.lineItem.createMany({
      data: data.lineItems.map((item, index) => ({
        relId: invoice.id,
        relType: "invoice",
        description: item.description,
        longDescription: item.longDescription || null,
        qty: item.qty,
        rate: item.rate,
        unit: item.unit || null,
        itemOrder: item.itemOrder ?? index + 1,
      })),
    });
  }

  revalidatePath("/invoices");
  return invoice;
}

export async function updateInvoiceStatus(id: number, status: number) {
  await prisma.invoice.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${id}`);
}

export async function recordPayment(invoiceId: number, formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  const date = formData.get("date") as string;
  const paymentMode = (formData.get("paymentMode") as string) || null;
  const note = (formData.get("note") as string) || null;
  const transactionId =
    (formData.get("transactionId") as string) || null;

  await prisma.payment.create({
    data: {
      invoiceId,
      amount,
      date: new Date(date),
      paymentMode,
      note,
      transactionId,
    },
  });

  // Check if invoice is fully paid
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });

  if (invoice) {
    const totalPaid = invoice.payments.reduce(
      (sum, p) => sum + Number(p.amount ?? 0),
      0
    );
    const invoiceTotal = Number(invoice.total ?? 0);

    let newStatus = invoice.status;
    if (totalPaid >= invoiceTotal) {
      newStatus = 4; // Paid
    } else if (totalPaid > 0) {
      newStatus = 3; // Partially Paid
    }

    if (newStatus !== invoice.status) {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      });
    }
  }

  revalidatePath("/invoices");
  revalidatePath(`/invoices/${invoiceId}`);
}

export async function deleteInvoice(id: number) {
  // Delete related line items first
  await prisma.lineItem.deleteMany({
    where: { relId: id, relType: "invoice" },
  });

  await prisma.invoice.delete({ where: { id } });

  revalidatePath("/invoices");
}

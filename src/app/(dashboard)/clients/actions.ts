"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function buildClientData(formData: FormData) {
  return {
    company: formData.get("company") as string,
    vat: (formData.get("vat") as string) || undefined,
    phonenumber: (formData.get("phonenumber") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
    state: (formData.get("state") as string) || undefined,
    zip: (formData.get("zip") as string) || undefined,
    website: (formData.get("website") as string) || undefined,
    billingStreet: (formData.get("billingStreet") as string) || undefined,
    billingCity: (formData.get("billingCity") as string) || undefined,
    billingState: (formData.get("billingState") as string) || undefined,
    billingZip: (formData.get("billingZip") as string) || undefined,
    shippingStreet: (formData.get("shippingStreet") as string) || undefined,
    shippingCity: (formData.get("shippingCity") as string) || undefined,
    shippingState: (formData.get("shippingState") as string) || undefined,
    shippingZip: (formData.get("shippingZip") as string) || undefined,
  };
}

export async function createClient(formData: FormData) {
  const client = await prisma.client.create({
    data: { ...buildClientData(formData), active: 1, datecreated: new Date() },
  });

  revalidatePath("/clients");
  return client;
}

export async function updateClient(id: number, formData: FormData) {
  const client = await prisma.client.update({
    where: { id },
    data: buildClientData(formData),
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  return client;
}

export async function deleteClient(id: number) {
  await prisma.$transaction(async (tx) => {
    await tx.lineItem.deleteMany({ where: { relId: id, relType: "invoice" } });
    const invoices = await tx.invoice.findMany({ where: { clientId: id }, select: { id: true } });
    const invoiceIds = invoices.map((i) => i.id);
    if (invoiceIds.length > 0) {
      await tx.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
    }
    await tx.invoice.deleteMany({ where: { clientId: id } });
    await tx.contact.deleteMany({ where: { clientId: id } });
    await tx.expense.deleteMany({ where: { clientId: id } });
    await tx.estimate.deleteMany({ where: { clientId: id } });
    await tx.contract.deleteMany({ where: { client: id } });
    const projects = await tx.project.findMany({ where: { clientId: id }, select: { id: true } });
    const projectIds = projects.map((p) => p.id);
    if (projectIds.length > 0) {
      await tx.projectMember.deleteMany({ where: { projectId: { in: projectIds } } });
      await tx.note.deleteMany({ where: { relId: { in: projectIds }, relType: "project" } });
      await tx.task.deleteMany({ where: { relId: { in: projectIds }, relType: "project" } });
    }
    await tx.project.deleteMany({ where: { clientId: id } });
    await tx.lead.updateMany({ where: { clientId: id }, data: { clientId: null } });
    await tx.client.delete({ where: { id } });
  });

  revalidatePath("/clients");
}

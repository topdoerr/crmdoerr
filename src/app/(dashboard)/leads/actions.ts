"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createLead(formData: FormData) {
  const data = {
    name: (formData.get("name") as string) || "",
    title: (formData.get("title") as string) || null,
    company: (formData.get("company") as string) || null,
    email: (formData.get("email") as string) || null,
    phonenumber: (formData.get("phonenumber") as string) || null,
    address: (formData.get("address") as string) || null,
    city: (formData.get("city") as string) || null,
    state: (formData.get("state") as string) || null,
    zip: (formData.get("zip") as string) || null,
    country: formData.get("country") ? Number(formData.get("country")) : null,
    website: (formData.get("website") as string) || null,
    status: formData.get("status") ? Number(formData.get("status")) : 1,
    source: formData.get("source") ? Number(formData.get("source")) : null,
    assigned: formData.get("assigned") ? Number(formData.get("assigned")) : null,
    leadValue: formData.get("leadValue")
      ? Number(formData.get("leadValue"))
      : null,
    dateadded: new Date(),
    lost: 0,
    junk: 0,
  };

  const lead = await prisma.lead.create({ data });

  revalidatePath("/leads");
  return lead;
}

export async function updateLead(id: number, formData: FormData) {
  const data = {
    name: (formData.get("name") as string) || undefined,
    title: (formData.get("title") as string) || undefined,
    company: (formData.get("company") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    phonenumber: (formData.get("phonenumber") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    city: (formData.get("city") as string) || undefined,
    state: (formData.get("state") as string) || undefined,
    zip: (formData.get("zip") as string) || undefined,
    country: formData.get("country") ? Number(formData.get("country")) : undefined,
    website: (formData.get("website") as string) || undefined,
    status: formData.get("status") ? Number(formData.get("status")) : undefined,
    source: formData.get("source") ? Number(formData.get("source")) : undefined,
    assigned: formData.get("assigned")
      ? Number(formData.get("assigned"))
      : undefined,
    leadValue: formData.get("leadValue")
      ? Number(formData.get("leadValue"))
      : undefined,
  };

  const lead = await prisma.lead.update({
    where: { id },
    data,
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return lead;
}

export async function deleteLead(id: number) {
  await prisma.lead.delete({ where: { id } });

  revalidatePath("/leads");
}

export async function convertLeadToClient(id: number) {
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new Error("Lead not found");

  const client = await prisma.client.create({
    data: {
      company: lead.company || lead.name || "Unnamed",
      phonenumber: lead.phonenumber,
      address: lead.address,
      city: lead.city,
      state: lead.state,
      zip: lead.zip,
      country: lead.country,
      website: lead.website,
      active: 1,
      datecreated: new Date(),
    },
  });

  await prisma.lead.update({
    where: { id },
    data: {
      clientId: client.id,
      dateConverted: new Date(),
    },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/clients");
}

export async function markLeadAsLost(id: number) {
  await prisma.lead.update({
    where: { id },
    data: { lost: 1 },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
}

export async function markLeadAsJunk(id: number) {
  await prisma.lead.update({
    where: { id },
    data: { junk: 1 },
  });

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
}

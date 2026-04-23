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
  await prisma.client.delete({ where: { id } });

  revalidatePath("/clients");
}

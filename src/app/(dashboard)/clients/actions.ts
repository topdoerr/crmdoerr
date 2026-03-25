"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClient(formData: FormData) {
  const data = {
    company: formData.get("company") as string,
    vat: (formData.get("vat") as string) || null,
    phonenumber: (formData.get("phonenumber") as string) || null,
    address: (formData.get("address") as string) || null,
    city: (formData.get("city") as string) || null,
    state: (formData.get("state") as string) || null,
    zip: (formData.get("zip") as string) || null,
    website: (formData.get("website") as string) || null,
    active: 1,
    datecreated: new Date(),
  };

  const client = await prisma.client.create({ data });

  revalidatePath("/clients");
  return client;
}

export async function updateClient(id: number, formData: FormData) {
  const data = {
    company: formData.get("company") as string,
    vat: (formData.get("vat") as string) || null,
    phonenumber: (formData.get("phonenumber") as string) || null,
    address: (formData.get("address") as string) || null,
    city: (formData.get("city") as string) || null,
    state: (formData.get("state") as string) || null,
    zip: (formData.get("zip") as string) || null,
    website: (formData.get("website") as string) || null,
  };

  const client = await prisma.client.update({
    where: { id },
    data,
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  return client;
}

export async function deleteClient(id: number) {
  await prisma.client.delete({ where: { id } });

  revalidatePath("/clients");
}

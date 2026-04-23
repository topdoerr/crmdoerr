"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCustomField(formData: FormData) {
  const data = {
    fieldTo: formData.get("fieldTo") as string,
    name: formData.get("name") as string,
    slug: (formData.get("slug") as string) || (formData.get("name") as string).toLowerCase().replace(/\s+/g, "_"),
    required: formData.get("required") ? 1 : 0,
    fieldType: formData.get("fieldType") as string,
    options: (formData.get("options") as string) || undefined,
    displayOrder: formData.get("displayOrder") ? Number(formData.get("displayOrder")) : 0,
    active: formData.get("active") ? 1 : 0,
    showOnTable: formData.get("showOnTable") ? 1 : 0,
    showOnPdf: formData.get("showOnPdf") ? 1 : 0,
    onlyAdmin: formData.get("onlyAdmin") ? 1 : 0,
  };

  const field = await prisma.customField.create({ data });
  revalidatePath("/custom-fields");
  return field;
}

export async function updateCustomField(id: number, formData: FormData) {
  const data = {
    fieldTo: formData.get("fieldTo") as string,
    name: formData.get("name") as string,
    slug: (formData.get("slug") as string) || undefined,
    required: formData.get("required") ? 1 : 0,
    fieldType: formData.get("fieldType") as string,
    options: (formData.get("options") as string) || undefined,
    displayOrder: formData.get("displayOrder") ? Number(formData.get("displayOrder")) : 0,
    active: formData.get("active") ? 1 : 0,
    showOnTable: formData.get("showOnTable") ? 1 : 0,
    showOnPdf: formData.get("showOnPdf") ? 1 : 0,
    onlyAdmin: formData.get("onlyAdmin") ? 1 : 0,
  };

  const field = await prisma.customField.update({ where: { id }, data });
  revalidatePath("/custom-fields");
  return field;
}

export async function deleteCustomField(id: number) {
  await prisma.customFieldValue.deleteMany({ where: { fieldId: id } });
  await prisma.customField.delete({ where: { id } });
  revalidatePath("/custom-fields");
}

export async function setCustomFieldValue(
  fieldId: number,
  relId: number,
  fieldTo: string,
  value: string,
) {
  const existing = await prisma.customFieldValue.findFirst({
    where: { fieldId, relId, fieldTo },
  });

  if (existing) {
    await prisma.customFieldValue.update({
      where: { id: existing.id },
      data: { value },
    });
  } else {
    await prisma.customFieldValue.create({
      data: { fieldId, relId, fieldTo, value },
    });
  }

  revalidatePath(`/${fieldTo}s/${relId}`);
}

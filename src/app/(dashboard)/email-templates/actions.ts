"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { sendTemplate } from "@/lib/email";

function parseForm(formData: FormData) {
  return {
    name: (formData.get("name") as string) ?? "",
    slug: (formData.get("slug") as string) ?? "",
    subject: (formData.get("subject") as string) ?? "",
    message: (formData.get("message") as string) ?? "",
    fromName: (formData.get("fromName") as string) || undefined,
    fromEmail: (formData.get("fromEmail") as string) || undefined,
    active: formData.get("active") ? 1 : 0,
  };
}

export async function createTemplate(formData: FormData) {
  const data = parseForm(formData);
  const template = await prisma.emailTemplate.create({
    data: {
      name: data.name,
      slug: data.slug,
      subject: data.subject,
      message: data.message,
      fromName: data.fromName ?? undefined,
      fromEmail: data.fromEmail ?? undefined,
      active: data.active,
    },
  });
  revalidatePath("/email-templates");
  redirect(`/email-templates/${template.id}`);
}

export async function updateTemplate(id: number, formData: FormData) {
  const data = parseForm(formData);
  await prisma.emailTemplate.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      subject: data.subject,
      message: data.message,
      fromName: data.fromName ?? null,
      fromEmail: data.fromEmail ?? null,
      active: data.active,
    },
  });
  revalidatePath("/email-templates");
  revalidatePath(`/email-templates/${id}`);
}

export async function deleteTemplate(id: number) {
  await prisma.emailTemplate.delete({ where: { id } });
  revalidatePath("/email-templates");
  redirect("/email-templates");
}

export async function sendTestEmail(id: number, toAddress: string) {
  const template = await prisma.emailTemplate.findUnique({ where: { id } });
  if (!template) throw new Error("Template not found");
  if (!toAddress) throw new Error("Recipient email is required");

  try {
    await sendTemplate(template.slug, toAddress, {
      firstName: "Test",
      lastName: "Recipient",
      company: "Test Co",
    });
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to send",
    };
  }
}

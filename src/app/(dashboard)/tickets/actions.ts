"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTicket(formData: FormData) {
  const data = {
    subject: (formData.get("subject") as string) || "",
    message: (formData.get("message") as string) || "",
    email: (formData.get("email") as string) || undefined,
    name: (formData.get("name") as string) || undefined,
    department: formData.get("department")
      ? Number(formData.get("department"))
      : undefined,
    priority: formData.get("priority")
      ? Number(formData.get("priority"))
      : 0,
    status: 1, // default: Open
    date: new Date(),
    assigned: formData.get("assigned")
      ? Number(formData.get("assigned"))
      : undefined,
    userid: formData.get("userid") ? Number(formData.get("userid")) : undefined,
    contactid: formData.get("contactid")
      ? Number(formData.get("contactid"))
      : undefined,
  };

  const ticket = await prisma.ticket.create({ data });

  revalidatePath("/tickets");
  return ticket;
}

export async function replyToTicket(ticketId: number, formData: FormData) {
  const message = formData.get("message") as string;
  if (!message) throw new Error("Message is required");

  await prisma.ticketReply.create({
    data: {
      ticketid: ticketId,
      message,
      date: new Date(),
      name: "Admin",
      email: null,
      admin: 1,
    },
  });

  await prisma.ticket.update({
    where: { ticketid: ticketId },
    data: { lastreply: new Date() },
  });

  revalidatePath(`/tickets/${ticketId}`);
  revalidatePath("/tickets");
}

export async function updateTicketStatus(id: number, status: number) {
  await prisma.ticket.update({
    where: { ticketid: id },
    data: { status },
  });

  revalidatePath("/tickets");
  revalidatePath(`/tickets/${id}`);
}

export async function assignTicket(id: number, staffId: number) {
  await prisma.ticket.update({
    where: { ticketid: id },
    data: { assigned: staffId },
  });

  revalidatePath("/tickets");
  revalidatePath(`/tickets/${id}`);
}

export async function deleteTicket(id: number) {
  await prisma.ticketReply.deleteMany({ where: { ticketid: id } });
  await prisma.ticket.delete({ where: { ticketid: id } });

  revalidatePath("/tickets");
}

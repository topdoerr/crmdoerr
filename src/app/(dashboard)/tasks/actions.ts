"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTask(formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    priority: Number(formData.get("priority")) || 2,
    status: Number(formData.get("status")) || 1,
    startdate: formData.get("startdate")
      ? new Date(formData.get("startdate") as string)
      : new Date(),
    duedate: formData.get("duedate")
      ? new Date(formData.get("duedate") as string)
      : null,
    relId: formData.get("relId") ? Number(formData.get("relId")) : null,
    relType: (formData.get("relType") as string) || null,
    isPublic: Number(formData.get("isPublic")) || 0,
    billable: Number(formData.get("billable")) || 0,
    kanbanOrder: Number(formData.get("kanbanOrder")) || 0,
  };

  const task = await prisma.task.create({ data });

  revalidatePath("/tasks");
  if (data.relType === "project" && data.relId) {
    revalidatePath(`/projects/${data.relId}`);
  }
  return task;
}

export async function updateTask(id: number, formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    priority: Number(formData.get("priority")) || 2,
    status: Number(formData.get("status")) || 1,
    startdate: formData.get("startdate")
      ? new Date(formData.get("startdate") as string)
      : undefined,
    duedate: formData.get("duedate")
      ? new Date(formData.get("duedate") as string)
      : null,
    relId: formData.get("relId") ? Number(formData.get("relId")) : null,
    relType: (formData.get("relType") as string) || null,
    isPublic: Number(formData.get("isPublic")) || 0,
    billable: Number(formData.get("billable")) || 0,
  };

  const task = await prisma.task.update({
    where: { id },
    data,
  });

  revalidatePath("/tasks");
  if (data.relType === "project" && data.relId) {
    revalidatePath(`/projects/${data.relId}`);
  }
  return task;
}

export async function updateTaskStatus(id: number, status: number) {
  const task = await prisma.task.update({
    where: { id },
    data: {
      status,
      datefinished: status === 5 ? new Date() : null,
    },
  });

  revalidatePath("/tasks");
  if (task.relType === "project" && task.relId) {
    revalidatePath(`/projects/${task.relId}`);
  }
  return task;
}

export async function deleteTask(id: number) {
  const task = await prisma.task.findUnique({
    where: { id },
    select: { relType: true, relId: true },
  });

  await prisma.task.delete({ where: { id } });

  revalidatePath("/tasks");
  if (task?.relType === "project" && task.relId) {
    revalidatePath(`/projects/${task.relId}`);
  }
}

export async function assignTask(taskId: number, staffId: number) {
  const existing = await prisma.taskAssigned.findFirst({
    where: { taskId, staffId },
  });

  if (existing) return existing;

  const assignment = await prisma.taskAssigned.create({
    data: { taskId, staffId },
  });

  revalidatePath("/tasks");
  return assignment;
}

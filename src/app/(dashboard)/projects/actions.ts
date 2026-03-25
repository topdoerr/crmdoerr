"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProject(formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    status: Number(formData.get("status")) || 1,
    clientId: Number(formData.get("clientId")) || 0,
    billingType: Number(formData.get("billingType")) || null,
    startDate: formData.get("startDate")
      ? new Date(formData.get("startDate") as string)
      : null,
    deadline: formData.get("deadline")
      ? new Date(formData.get("deadline") as string)
      : null,
    projectCost: formData.get("projectCost")
      ? parseFloat(formData.get("projectCost") as string)
      : null,
    projectRatePerHour: formData.get("projectRatePerHour")
      ? parseFloat(formData.get("projectRatePerHour") as string)
      : null,
    estimatedHours: formData.get("estimatedHours")
      ? parseFloat(formData.get("estimatedHours") as string)
      : null,
    progress: 0,
    projectCreated: new Date(),
    addedfrom: Number(formData.get("addedfrom")) || 0,
  };

  const project = await prisma.project.create({ data });

  revalidatePath("/projects");
  return project;
}

export async function updateProject(id: number, formData: FormData) {
  const data = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    status: Number(formData.get("status")) || 1,
    clientId: Number(formData.get("clientId")) || 0,
    billingType: Number(formData.get("billingType")) || null,
    startDate: formData.get("startDate")
      ? new Date(formData.get("startDate") as string)
      : null,
    deadline: formData.get("deadline")
      ? new Date(formData.get("deadline") as string)
      : null,
    projectCost: formData.get("projectCost")
      ? parseFloat(formData.get("projectCost") as string)
      : null,
    projectRatePerHour: formData.get("projectRatePerHour")
      ? parseFloat(formData.get("projectRatePerHour") as string)
      : null,
    estimatedHours: formData.get("estimatedHours")
      ? parseFloat(formData.get("estimatedHours") as string)
      : null,
    progress: formData.get("progress")
      ? Number(formData.get("progress"))
      : undefined,
  };

  const project = await prisma.project.update({
    where: { id },
    data,
  });

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return project;
}

export async function deleteProject(id: number) {
  await prisma.project.delete({ where: { id } });

  revalidatePath("/projects");
}

export async function addProjectMember(projectId: number, staffId: number) {
  const existing = await prisma.projectMember.findFirst({
    where: { projectId, staffId },
  });

  if (existing) return existing;

  const member = await prisma.projectMember.create({
    data: { projectId, staffId },
  });

  revalidatePath(`/projects/${projectId}`);
  return member;
}

export async function removeProjectMember(projectId: number, staffId: number) {
  await prisma.projectMember.deleteMany({
    where: { projectId, staffId },
  });

  revalidatePath(`/projects/${projectId}`);
}

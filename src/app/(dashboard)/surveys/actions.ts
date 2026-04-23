"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSurvey(formData: FormData) {
  const survey = await prisma.survey.create({
    data: {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
      fromEmail: (formData.get("fromEmail") as string) || undefined,
      fromName: (formData.get("fromName") as string) || undefined,
      subject: (formData.get("subject") as string) || undefined,
      emailBody: (formData.get("emailBody") as string) || undefined,
      active: formData.get("active") ? 1 : 0,
      forStaff: formData.get("forStaff") ? 1 : 0,
    },
  });

  revalidatePath("/surveys");
  return survey;
}

export async function updateSurvey(id: number, formData: FormData) {
  await prisma.survey.update({
    where: { id },
    data: {
      name: (formData.get("name") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      subject: (formData.get("subject") as string) || undefined,
      emailBody: (formData.get("emailBody") as string) || undefined,
      active: formData.get("active") ? 1 : 0,
      forStaff: formData.get("forStaff") ? 1 : 0,
    },
  });

  revalidatePath("/surveys");
  revalidatePath(`/surveys/${id}`);
}

export async function deleteSurvey(id: number) {
  await prisma.surveyQuestion.deleteMany({ where: { surveyId: id } });
  await prisma.survey.delete({ where: { id } });
  revalidatePath("/surveys");
}

export async function addQuestion(surveyId: number, formData: FormData) {
  const lastQuestion = await prisma.surveyQuestion.findFirst({
    where: { surveyId },
    orderBy: { questionOrder: "desc" },
  });

  await prisma.surveyQuestion.create({
    data: {
      surveyId,
      question: formData.get("question") as string,
      questionType: (formData.get("questionType") as string) || "text",
      questionOrder: (lastQuestion?.questionOrder ?? 0) + 1,
      required: formData.get("required") ? 1 : 0,
    },
  });

  revalidatePath(`/surveys/${surveyId}`);
}

export async function updateQuestion(id: number, formData: FormData) {
  const question = await prisma.surveyQuestion.update({
    where: { id },
    data: {
      question: (formData.get("question") as string) || undefined,
      questionType: (formData.get("questionType") as string) || undefined,
      required: formData.get("required") ? 1 : 0,
    },
  });

  revalidatePath(`/surveys/${question.surveyId}`);
}

export async function deleteQuestion(id: number) {
  const question = await prisma.surveyQuestion.delete({ where: { id } });
  revalidatePath(`/surveys/${question.surveyId}`);
}

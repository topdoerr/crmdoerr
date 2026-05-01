"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createExpense(formData: FormData) {
  const data = {
    expenseName: (formData.get("expenseName") as string) || "",
    amount: formData.get("amount") ? Number(formData.get("amount")) : 0,
    date: formData.get("date")
      ? new Date(formData.get("date") as string)
      : new Date(),
    expenseCategory: formData.get("category")
      ? Number(formData.get("category"))
      : undefined,
    clientId: formData.get("clientId")
      ? Number(formData.get("clientId"))
      : undefined,
    billable: formData.get("billable") === "1" ? 1 : 0,
  };

  const expense = await prisma.expense.create({ data });

  revalidatePath("/expenses");
  return expense;
}

export async function deleteExpense(id: number) {
  await prisma.expense.delete({ where: { id } });

  revalidatePath("/expenses");
}

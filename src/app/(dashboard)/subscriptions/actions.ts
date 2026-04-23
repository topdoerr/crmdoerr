"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CreateSubscriptionInput {
  name: string;
  description?: string;
  clientId: number;
  currency?: number;
  price: number;
  tax?: number;
  quantity?: number;
  nextBillingCycle?: string;
  status?: string;
  stripeSubscription?: string;
}

export async function createSubscription(data: CreateSubscriptionInput) {
  const sub = await prisma.subscription.create({
    data: {
      name: data.name,
      description: data.description || undefined,
      clientId: data.clientId,
      currency: data.currency ?? 1,
      price: data.price,
      tax: data.tax ?? 0,
      quantity: data.quantity ?? 1,
      status: data.status ?? "not_subscribed",
      nextBillingCycle: data.nextBillingCycle
        ? new Date(data.nextBillingCycle)
        : undefined,
      stripeSubscription: data.stripeSubscription || undefined,
    },
  });
  revalidatePath("/subscriptions");
  return sub;
}

export async function updateSubscription(
  id: number,
  data: Partial<CreateSubscriptionInput>
) {
  await prisma.subscription.update({
    where: { id },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.description !== undefined
        ? { description: data.description || null }
        : {}),
      ...(data.price !== undefined ? { price: data.price } : {}),
      ...(data.tax !== undefined ? { tax: data.tax } : {}),
      ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.nextBillingCycle
        ? { nextBillingCycle: new Date(data.nextBillingCycle) }
        : {}),
    },
  });
  revalidatePath("/subscriptions");
  revalidatePath(`/subscriptions/${id}`);
}

export async function cancelSubscription(id: number) {
  await prisma.subscription.update({
    where: { id },
    data: {
      status: "canceled",
      dateCanceled: new Date(),
    },
  });
  revalidatePath("/subscriptions");
  revalidatePath(`/subscriptions/${id}`);
}

interface CreateRecurringInput {
  clientId: number;
  subtotal: number;
  total: number;
  recurringType: "day" | "week" | "month";
  recurringValue: number;
  totalCycles?: number;
  nextCreation?: string;
}

function computeNext(
  from: Date,
  type: string,
  value: number
): Date {
  const d = new Date(from);
  if (type === "day") d.setDate(d.getDate() + value);
  else if (type === "week") d.setDate(d.getDate() + value * 7);
  else if (type === "month") d.setMonth(d.getMonth() + value);
  return d;
}

export async function createRecurringInvoice(data: CreateRecurringInput) {
  const next = data.nextCreation
    ? new Date(data.nextCreation)
    : computeNext(new Date(), data.recurringType, data.recurringValue);

  const ri = await prisma.recurringInvoice.create({
    data: {
      clientId: data.clientId,
      subtotal: data.subtotal,
      total: data.total,
      recurringType: data.recurringType,
      recurringValue: data.recurringValue,
      totalCycles: data.totalCycles ?? 0,
      nextCreation: next,
      active: 1,
    },
  });
  revalidatePath("/subscriptions");
  return ri;
}

export async function pauseRecurring(id: number) {
  await prisma.recurringInvoice.update({
    where: { id },
    data: { active: 0 },
  });
  revalidatePath("/subscriptions");
}

export async function resumeRecurring(id: number) {
  await prisma.recurringInvoice.update({
    where: { id },
    data: { active: 1 },
  });
  revalidatePath("/subscriptions");
}

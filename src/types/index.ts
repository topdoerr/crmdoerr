// Re-export Prisma types for convenience
export type { Staff, Client, Contact, Invoice, LineItem, Project, Task, Lead, Ticket, Estimate, Proposal, Contract, Expense } from "@prisma/client";

// Dashboard stat card type
export interface StatCard {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

// Invoice status mapping
export const invoiceStatuses: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  1: { label: "Unpaid", variant: "warning" },
  2: { label: "Sent", variant: "default" },
  3: { label: "Partially Paid", variant: "warning" },
  4: { label: "Paid", variant: "success" },
  5: { label: "Cancelled", variant: "secondary" },
  6: { label: "Draft", variant: "outline" },
};

// Project status mapping
export const projectStatuses: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  1: { label: "Not Started", variant: "secondary" },
  2: { label: "In Progress", variant: "default" },
  3: { label: "On Hold", variant: "warning" },
  4: { label: "Completed", variant: "success" },
  5: { label: "Cancelled", variant: "destructive" },
};

// Task status mapping
export const taskStatuses: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  1: { label: "Not Started", variant: "secondary" },
  2: { label: "In Progress", variant: "default" },
  3: { label: "Testing", variant: "warning" },
  4: { label: "Awaiting Feedback", variant: "outline" },
  5: { label: "Complete", variant: "success" },
};

// Task priority mapping
export const taskPriorities: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  1: { label: "Low", variant: "secondary" },
  2: { label: "Medium", variant: "default" },
  3: { label: "High", variant: "warning" },
  4: { label: "Urgent", variant: "destructive" },
};

// Estimate status mapping
export const estimateStatuses: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  1: { label: "Draft", variant: "outline" },
  2: { label: "Sent", variant: "default" },
  3: { label: "Declined", variant: "destructive" },
  4: { label: "Accepted", variant: "success" },
  5: { label: "Expired", variant: "secondary" },
};

// Proposal status mapping
export const proposalStatuses: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  1: { label: "Open", variant: "default" },
  2: { label: "Declined", variant: "destructive" },
  3: { label: "Accepted", variant: "success" },
  4: { label: "Revised", variant: "warning" },
  5: { label: "Sent", variant: "default" },
  6: { label: "Draft", variant: "outline" },
};

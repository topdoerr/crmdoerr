import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Users,
  FileText,
  FolderKanban,
  CheckSquare,
  Target,
  Ticket,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { RecentActivity } from "./recent-activity";

async function getStats() {
  const [
    clientCount,
    invoiceCount,
    projectCount,
    taskCount,
    leadCount,
    ticketCount,
    invoiceTotals,
    pendingTasks,
  ] = await Promise.all([
    prisma.client.count(),
    prisma.invoice.count(),
    prisma.project.count(),
    prisma.task.count(),
    prisma.lead.count(),
    prisma.ticket.count(),
    prisma.invoice.aggregate({
      _sum: { total: true },
      where: { status: { not: 5 } }, // exclude cancelled
    }),
    prisma.task.count({
      where: { status: { in: [1, 2, 3, 4] } }, // not completed (5)
    }),
  ]);

  return {
    clientCount,
    invoiceCount,
    projectCount,
    taskCount,
    leadCount,
    ticketCount,
    totalRevenue: invoiceTotals._sum.total?.toNumber() ?? 0,
    pendingTasks,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "text-olive-600",
      bg: "bg-olive-50",
    },
    {
      title: "Clients",
      value: stats.clientCount.toLocaleString(),
      icon: Users,
      color: "text-forest-600",
      bg: "bg-forest-50",
    },
    {
      title: "Invoices",
      value: stats.invoiceCount.toLocaleString(),
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Projects",
      value: stats.projectCount.toLocaleString(),
      icon: FolderKanban,
      color: "text-forest-600",
      bg: "bg-forest-50",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks.toLocaleString(),
      icon: CheckSquare,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Leads",
      value: stats.leadCount.toLocaleString(),
      icon: Target,
      color: "text-olive-600",
      bg: "bg-olive-50",
    },
    {
      title: "Open Tickets",
      value: stats.ticketCount.toLocaleString(),
      icon: Ticket,
      color: "text-brand-600",
      bg: "bg-brand-50",
    },
    {
      title: "Active Tasks",
      value: stats.taskCount.toLocaleString(),
      icon: TrendingUp,
      color: "text-forest-600",
      bg: "bg-forest-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your CRM activity</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
      </div>
    </div>
  );
}

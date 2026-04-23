import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReportsHubPage() {
  const [
    invoiceAgg,
    leadsCount,
    convertedLeads,
    projectsCount,
    expenseAgg,
    clientsCount,
  ] = await Promise.all([
    prisma.invoice.aggregate({ _sum: { total: true }, _count: true }),
    prisma.lead.count(),
    prisma.lead.count({ where: { clientId: { not: null } } }),
    prisma.project.count(),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.client.count(),
  ]);

  const totalRevenue = Number(invoiceAgg._sum.total ?? 0);
  const totalExpenses = Number(expenseAgg._sum.amount ?? 0);
  const conversion =
    leadsCount > 0 ? Math.round((convertedLeads / leadsCount) * 100) : 0;

  const cards = [
    {
      href: "/reports/sales",
      title: "Sales Report",
      metric: formatCurrency(totalRevenue),
      label: `${invoiceAgg._count} invoices`,
    },
    {
      href: "/reports/leads",
      title: "Leads Report",
      metric: `${conversion}%`,
      label: `${leadsCount} leads / ${convertedLeads} converted`,
    },
    {
      href: "/reports/projects",
      title: "Project Report",
      metric: String(projectsCount),
      label: "Total projects",
    },
    {
      href: "/reports/expenses",
      title: "Expense Report",
      metric: formatCurrency(totalExpenses),
      label: "Total expenses",
    },
    {
      href: "/reports/customers",
      title: "Customer Report",
      metric: String(clientsCount),
      label: "Total customers",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="block">
            <Card className="hover:border-primary transition-colors">
              <CardHeader>
                <CardTitle className="text-base">{c.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{c.metric}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {c.label}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

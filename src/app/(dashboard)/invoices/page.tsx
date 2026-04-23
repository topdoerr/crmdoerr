import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InvoicesHeader } from "./invoices-header";

const invoiceStatuses: Record<number, { label: string; variant: string }> = {
  1: { label: "Unpaid", variant: "warning" },
  2: { label: "Sent", variant: "default" },
  3: { label: "Partially Paid", variant: "warning" },
  4: { label: "Paid", variant: "success" },
  5: { label: "Cancelled", variant: "secondary" },
  6: { label: "Draft", variant: "outline" },
};

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const statusFilter = searchParams?.status
    ? parseInt(searchParams.status, 10)
    : null;

  const invoices = await prisma.invoice.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: {
      client: {
        select: { id: true, company: true },
      },
    },
    orderBy: { date: "desc" },
  });

  const allInvoices = await prisma.invoice.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const statusCounts: Record<number, number> = {};
  allInvoices.forEach((group) => {
    if (group.status !== null) {
      statusCounts[group.status] = group._count.id;
    }
  });

  const totalCount = Object.values(statusCounts).reduce(
    (sum, c) => sum + c,
    0
  );

  const clients = await prisma.client.findMany({
    where: { active: 1 },
    select: { id: true, company: true },
    orderBy: { company: "asc" },
  });

  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const nextNumber = (lastInvoice?.number ?? 0) + 1;

  return (
    <div className="space-y-6">
      <InvoicesHeader
        totalCount={totalCount}
        clients={clients}
        nextNumber={nextNumber}
      />

      <Tabs defaultValue={statusFilter?.toString() || "all"}>
        <TabsList>
          <TabsTrigger value="all" asChild>
            <Link href="/invoices">All ({totalCount})</Link>
          </TabsTrigger>
          {Object.entries(invoiceStatuses).map(([key, { label }]) => (
            <TabsTrigger key={key} value={key} asChild>
              <Link href={`/invoices?status=${key}`}>
                {label} ({statusCounts[parseInt(key)] || 0})
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent
          value={statusFilter?.toString() || "all"}
          forceMount
        >
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => {
                      const status =
                        invoiceStatuses[invoice.status ?? 0];
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <Link
                              href={`/invoices/${invoice.id}`}
                              className="font-medium hover:underline"
                            >
                              {invoice.prefix}
                              {invoice.number}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {invoice.client ? (
                              <Link
                                href={`/clients/${invoice.client.id}`}
                                className="hover:underline"
                              >
                                {invoice.client.company}
                              </Link>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              Number(invoice.total ?? 0)
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(invoice.date)}
                          </TableCell>
                          <TableCell>
                            {formatDate(invoice.dueDate)}
                          </TableCell>
                          <TableCell>
                            {status ? (
                              <Badge
                                variant={
                                  status.variant as BadgeVariant
                                }
                              >
                                {status.label}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

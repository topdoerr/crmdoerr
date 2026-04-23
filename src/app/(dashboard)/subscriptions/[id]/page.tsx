import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning";

const subStatusVariant: Record<string, BadgeVariant> = {
  active: "success",
  not_subscribed: "secondary",
  canceled: "destructive",
  past_due: "warning",
  incomplete: "warning",
  paused: "outline",
};

export default async function SubscriptionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseInt(params.id, 10);
  if (!Number.isFinite(id)) notFound();

  const sub = await prisma.subscription.findUnique({ where: { id } });
  if (!sub) notFound();

  const client = await prisma.client.findUnique({
    where: { id: sub.clientId },
    select: { id: true, company: true },
  });

  // "Cycle history" approximated from invoices for this client created after dateSubscribed
  const invoices = await prisma.invoice.findMany({
    where: {
      clientId: sub.clientId,
      ...(sub.dateSubscribed ? { datecreated: { gte: sub.dateSubscribed } } : {}),
    },
    orderBy: { date: "desc" },
    take: 25,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/subscriptions"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Back to subscriptions
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-1">{sub.name}</h1>
          {sub.description ? (
            <p className="text-muted-foreground mt-1">{sub.description}</p>
          ) : null}
        </div>
        <Badge variant={subStatusVariant[sub.status] ?? "secondary"}>
          {sub.status}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2 text-sm text-muted-foreground">
            Price
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatCurrency(Number(sub.price ?? 0))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 text-sm text-muted-foreground">
            Quantity
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {sub.quantity}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 text-sm text-muted-foreground">
            Next Billing
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {formatDate(sub.nextBillingCycle)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <h2 className="text-lg font-semibold">Details</h2>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Client</span>
            {client ? (
              <Link
                href={`/clients/${client.id}`}
                className="hover:underline"
              >
                {client.company}
              </Link>
            ) : (
              <span>—</span>
            )}
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatCurrency(Number(sub.tax ?? 0))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date Subscribed</span>
            <span>{formatDate(sub.dateSubscribed)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date Canceled</span>
            <span>{formatDate(sub.dateCanceled)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stripe ID</span>
            <span className="font-mono text-xs">
              {sub.stripeSubscription ?? "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold">Cycle History</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    No cycles yet.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-medium hover:underline"
                      >
                        {inv.prefix}
                        {inv.number}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(inv.date)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(inv.total ?? 0))}
                    </TableCell>
                    <TableCell>#{inv.status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href="/subscriptions">Back</Link>
        </Button>
      </div>
    </div>
  );
}

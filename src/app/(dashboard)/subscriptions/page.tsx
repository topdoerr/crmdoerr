import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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

export default async function SubscriptionsPage() {
  const [subscriptions, recurring, clients] = await Promise.all([
    prisma.subscription.findMany({ orderBy: { datecreated: "desc" } }),
    prisma.recurringInvoice.findMany({ orderBy: { datecreated: "desc" } }),
    prisma.client.findMany({ select: { id: true, company: true } }),
  ]);

  const clientMap = new Map(clients.map((c) => [c.id, c.company]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <Badge variant="secondary">
            {subscriptions.length + recurring.length}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="subscriptions">
        <TabsList>
          <TabsTrigger value="subscriptions">
            Subscriptions ({subscriptions.length})
          </TabsTrigger>
          <TabsTrigger value="recurring">
            Recurring Invoices ({recurring.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No subscriptions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <Link
                            href={`/subscriptions/${s.id}`}
                            className="font-medium hover:underline"
                          >
                            {s.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {clientMap.get(s.clientId) ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(s.price ?? 0))}
                        </TableCell>
                        <TableCell>{s.quantity}</TableCell>
                        <TableCell>{formatDate(s.nextBillingCycle)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={subStatusVariant[s.status] ?? "secondary"}
                          >
                            {s.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recurring">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Cycle</TableHead>
                    <TableHead>Cycles</TableHead>
                    <TableHead>Next Creation</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recurring.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-muted-foreground py-8"
                      >
                        No recurring invoices found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recurring.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">#{r.id}</TableCell>
                        <TableCell>
                          {clientMap.get(r.clientId) ?? "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(r.total ?? 0))}
                        </TableCell>
                        <TableCell>
                          Every {r.recurringValue} {r.recurringType}
                          {r.recurringValue > 1 ? "s" : ""}
                        </TableCell>
                        <TableCell>
                          {r.cycles}
                          {r.totalCycles > 0 ? ` / ${r.totalCycles}` : ""}
                        </TableCell>
                        <TableCell>{formatDate(r.nextCreation)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={r.active ? "success" : "secondary"}
                          >
                            {r.active ? "Active" : "Paused"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
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

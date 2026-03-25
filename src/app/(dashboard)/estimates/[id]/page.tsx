import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

const ESTIMATE_STATUSES: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline" }> = {
  1: { label: "Draft", variant: "secondary" },
  2: { label: "Sent", variant: "default" },
  3: { label: "Declined", variant: "destructive" },
  4: { label: "Accepted", variant: "success" },
  5: { label: "Expired", variant: "warning" },
};

export default async function EstimateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const estimate = await prisma.estimate.findUnique({
    where: { id: Number(params.id) },
    include: {
      client: true,
    },
  });

  if (!estimate) notFound();

  const lineItems = await prisma.lineItem.findMany({
    where: { relId: estimate.id, relType: "estimate" },
    orderBy: { itemOrder: "asc" },
  });

  const statusInfo = ESTIMATE_STATUSES[estimate.status ?? 0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/estimates">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {estimate.prefix ?? "EST-"}
              {estimate.number}
            </h1>
            {statusInfo && (
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {estimate.client?.company || "No client"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      No line items.
                    </TableCell>
                  </TableRow>
                ) : (
                  lineItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <p className="font-medium">{item.description || "—"}</p>
                        {item.longDescription && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.longDescription}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.qty ? Number(item.qty) : 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.rate ? formatCurrency(Number(item.rate)) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.rate && item.qty
                          ? formatCurrency(Number(item.rate) * Number(item.qty))
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <Separator className="my-4" />

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {formatCurrency(Number(estimate.subtotal ?? 0))}
                  </span>
                </div>
                {estimate.discountTotal && Number(estimate.discountTotal) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Discount
                      {estimate.discountPercent
                        ? ` (${estimate.discountPercent}%)`
                        : ""}
                    </span>
                    <span className="text-destructive">
                      -{formatCurrency(Number(estimate.discountTotal))}
                    </span>
                  </div>
                )}
                {estimate.totalTax && Number(estimate.totalTax) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(Number(estimate.totalTax))}</span>
                  </div>
                )}
                {estimate.adjustment && Number(estimate.adjustment) !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Adjustment</span>
                    <span>
                      {formatCurrency(Number(estimate.adjustment))}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(Number(estimate.total ?? 0))}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Estimate Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Client
              </p>
              <p className="text-sm">
                {estimate.client ? (
                  <Link
                    href={`/clients/${estimate.client.id}`}
                    className="text-primary hover:underline"
                  >
                    {estimate.client.company}
                  </Link>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-sm">{formatDate(estimate.date)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Expiry Date
              </p>
              <p className="text-sm">{formatDate(estimate.expirydate)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Reference #
              </p>
              <p className="text-sm">{estimate.referenceNo || "—"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

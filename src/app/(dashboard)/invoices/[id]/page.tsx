import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const invoiceId = parseInt(params.id, 10);

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: true,
      payments: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!invoice) {
    notFound();
  }

  const lineItems = await prisma.lineItem.findMany({
    where: {
      relId: invoice.id,
      relType: "invoice",
    },
    orderBy: { itemOrder: "asc" },
  });

  const status = invoiceStatuses[invoice.status ?? 0];
  const totalPaid = invoice.payments.reduce(
    (sum, p) => sum + Number(p.amount ?? 0),
    0
  );
  const balanceDue = Number(invoice.total ?? 0) - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/invoices">Back to Invoices</Link>
        </Button>
      </div>

      {/* Invoice Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {invoice.prefix}
            {invoice.number}
          </h1>
          {status && (
            <Badge variant={status.variant as BadgeVariant}>
              {status.label}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Send
          </Button>
          <Button variant="outline" size="sm">
            Record Payment
          </Button>
          <Button variant="outline" size="sm">
            PDF
          </Button>
          <Button size="sm" asChild>
            <Link href={`/invoices/${invoice.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow
              label="Invoice Number"
              value={`${invoice.prefix}${invoice.number}`}
            />
            <DetailRow label="Date" value={formatDate(invoice.date)} />
            <DetailRow
              label="Due Date"
              value={formatDate(invoice.dueDate)}
            />
            <DetailRow
              label="Status"
              value={status?.label ?? "Unknown"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoice.client ? (
              <>
                <DetailRow
                  label="Company"
                  value={invoice.client.company}
                />
                <DetailRow
                  label="Phone"
                  value={invoice.client.phonenumber}
                />
                <DetailRow
                  label="Address"
                  value={
                    [
                      invoice.client.address,
                      invoice.client.city,
                      invoice.client.state,
                      invoice.client.zip,
                    ]
                      .filter(Boolean)
                      .join(", ") || null
                  }
                />
              </>
            ) : (
              <p className="text-muted-foreground">No client assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Description</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-4"
                  >
                    No line items.
                  </TableCell>
                </TableRow>
              ) : (
                lineItems.map((item) => {
                  const amount =
                    Number(item.qty ?? 0) * Number(item.rate ?? 0);
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">
                          {item.description}
                        </div>
                        {item.longDescription && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {item.longDescription}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(item.qty)}
                        {item.unit ? ` ${item.unit}` : ""}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(Number(item.rate ?? 0))}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(amount)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          {/* Totals Summary */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <SummaryRow
                label="Subtotal"
                value={formatCurrency(Number(invoice.subtotal ?? 0))}
              />
              {Number(invoice.discountTotal ?? 0) > 0 && (
                <SummaryRow
                  label={`Discount${invoice.discountPercent ? ` (${invoice.discountPercent}%)` : ""}`}
                  value={`-${formatCurrency(Number(invoice.discountTotal ?? 0))}`}
                />
              )}
              {Number(invoice.totalTax ?? 0) > 0 && (
                <SummaryRow
                  label="Tax"
                  value={formatCurrency(
                    Number(invoice.totalTax ?? 0)
                  )}
                />
              )}
              {Number(invoice.adjustment ?? 0) !== 0 && (
                <SummaryRow
                  label="Adjustment"
                  value={formatCurrency(
                    Number(invoice.adjustment ?? 0)
                  )}
                />
              )}
              <Separator />
              <SummaryRow
                label="Total"
                value={formatCurrency(Number(invoice.total ?? 0))}
                bold
              />
              {totalPaid > 0 && (
                <SummaryRow
                  label="Paid"
                  value={`-${formatCurrency(totalPaid)}`}
                />
              )}
              <SummaryRow
                label="Balance Due"
                value={formatCurrency(balanceDue)}
                bold
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments */}
      {invoice.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardDescription>Recorded payments for this invoice</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.date)}</TableCell>
                    <TableCell>
                      {payment.paymentMode || "—"}
                    </TableCell>
                    <TableCell>
                      {payment.transactionId || "—"}
                    </TableCell>
                    <TableCell>{payment.note || "—"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(payment.amount ?? 0))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {(invoice.clientNote || invoice.adminNote) && (
        <div className="grid gap-6 md:grid-cols-2">
          {invoice.clientNote && (
            <Card>
              <CardHeader>
                <CardTitle>Client Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {invoice.clientNote}
                </p>
              </CardContent>
            </Card>
          )}
          {invoice.adminNote && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {invoice.adminNote}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span
        className={`text-sm ${bold ? "font-semibold" : "text-muted-foreground"}`}
      >
        {label}
      </span>
      <span className={`text-sm ${bold ? "font-semibold" : ""}`}>
        {value}
      </span>
    </div>
  );
}

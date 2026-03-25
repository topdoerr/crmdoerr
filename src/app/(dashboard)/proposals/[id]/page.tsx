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

const PROPOSAL_STATUSES: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline" }> = {
  1: { label: "Open", variant: "default" },
  2: { label: "Declined", variant: "destructive" },
  3: { label: "Accepted", variant: "success" },
  4: { label: "Revised", variant: "warning" },
  5: { label: "Sent", variant: "secondary" },
  6: { label: "Draft", variant: "outline" },
};

export default async function ProposalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const proposal = await prisma.proposal.findUnique({
    where: { id: Number(params.id) },
    include: {
      lineItems: {
        where: { relType: "proposal" },
        orderBy: { itemOrder: "asc" },
      },
    },
  });

  if (!proposal) notFound();

  const statusInfo = PROPOSAL_STATUSES[proposal.status ?? 0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/proposals">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {proposal.subject || "Untitled Proposal"}
            </h1>
            {statusInfo && (
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            To: {proposal.proposalTo || "—"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Proposal content */}
          {proposal.content && (
            <Card>
              <CardHeader>
                <CardTitle>Proposal Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: proposal.content }}
                />
              </CardContent>
            </Card>
          )}

          {/* Line Items */}
          <Card>
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
                  {proposal.lineItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        No line items.
                      </TableCell>
                    </TableRow>
                  ) : (
                    proposal.lineItems.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <p className="font-medium">
                            {item.description || "—"}
                          </p>
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
                          {item.rate
                            ? formatCurrency(Number(item.rate))
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.rate && item.qty
                            ? formatCurrency(
                                Number(item.rate) * Number(item.qty)
                              )
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
                      {formatCurrency(Number(proposal.subtotal ?? 0))}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {formatCurrency(Number(proposal.total ?? 0))}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Proposal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">To</p>
              <p className="text-sm">{proposal.proposalTo || "—"}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-sm">{formatDate(proposal.date)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Open Till
              </p>
              <p className="text-sm">{formatDate(proposal.openTill)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total
              </p>
              <p className="text-lg font-semibold">
                {formatCurrency(Number(proposal.total ?? 0))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

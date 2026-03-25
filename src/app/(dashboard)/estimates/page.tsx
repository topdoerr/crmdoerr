import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ESTIMATE_STATUSES: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline" }> = {
  1: { label: "Draft", variant: "secondary" },
  2: { label: "Sent", variant: "default" },
  3: { label: "Declined", variant: "destructive" },
  4: { label: "Accepted", variant: "success" },
  5: { label: "Expired", variant: "warning" },
};

export default async function EstimatesPage() {
  const estimates = await prisma.estimate.findMany({
    include: {
      client: true,
    },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
          <Badge variant="secondary">{estimates.length}</Badge>
        </div>
        <Button asChild>
          <Link href="/estimates?modal=new">New Estimate</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estimate #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No estimates found.
                  </TableCell>
                </TableRow>
              ) : (
                estimates.map((estimate) => {
                  const statusInfo = ESTIMATE_STATUSES[estimate.status ?? 0];
                  return (
                    <TableRow key={estimate.id}>
                      <TableCell>
                        <Link
                          href={`/estimates/${estimate.id}`}
                          className="font-medium hover:underline"
                        >
                          {estimate.prefix ?? "EST-"}
                          {estimate.number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {estimate.client?.company || "—"}
                      </TableCell>
                      <TableCell>
                        {estimate.total
                          ? formatCurrency(Number(estimate.total))
                          : "—"}
                      </TableCell>
                      <TableCell>{formatDate(estimate.date)}</TableCell>
                      <TableCell>{formatDate(estimate.expirydate)}</TableCell>
                      <TableCell>
                        {statusInfo ? (
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
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
    </div>
  );
}

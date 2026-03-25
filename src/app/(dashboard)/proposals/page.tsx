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

const PROPOSAL_STATUSES: Record<number, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "outline" }> = {
  1: { label: "Open", variant: "default" },
  2: { label: "Declined", variant: "destructive" },
  3: { label: "Accepted", variant: "success" },
  4: { label: "Revised", variant: "warning" },
  5: { label: "Sent", variant: "secondary" },
  6: { label: "Draft", variant: "outline" },
};

export default async function ProposalsPage() {
  const proposals = await prisma.proposal.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Proposals</h1>
          <Badge variant="secondary">{proposals.length}</Badge>
        </div>
        <Button asChild>
          <Link href="/proposals?modal=new">New Proposal</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Open Till</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No proposals found.
                  </TableCell>
                </TableRow>
              ) : (
                proposals.map((proposal) => {
                  const statusInfo =
                    PROPOSAL_STATUSES[proposal.status ?? 0];
                  return (
                    <TableRow key={proposal.id}>
                      <TableCell>
                        <Link
                          href={`/proposals/${proposal.id}`}
                          className="font-medium hover:underline"
                        >
                          {proposal.subject || "—"}
                        </Link>
                      </TableCell>
                      <TableCell>{proposal.proposalTo || "—"}</TableCell>
                      <TableCell>
                        {proposal.total
                          ? formatCurrency(Number(proposal.total))
                          : "—"}
                      </TableCell>
                      <TableCell>{formatDate(proposal.date)}</TableCell>
                      <TableCell>{formatDate(proposal.openTill)}</TableCell>
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

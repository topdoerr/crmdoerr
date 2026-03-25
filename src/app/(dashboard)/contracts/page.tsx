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
import { Check, X } from "lucide-react";

export default async function ContractsPage() {
  const contracts = await prisma.contract.findMany({
    where: { trash: { not: 1 } },
    include: {
      contractClient: true,
      contractTypeRel: true,
    },
    orderBy: { datestart: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
          <Badge variant="secondary">{contracts.length}</Badge>
        </div>
        <Button asChild>
          <Link href="/contracts?modal=new">New Contract</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Signed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No contracts found.
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <Link
                        href={`/contracts/${contract.id}`}
                        className="font-medium hover:underline"
                      >
                        {contract.subject || "—"}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {contract.contractClient?.company || "—"}
                    </TableCell>
                    <TableCell>
                      {contract.contractTypeRel?.name || "—"}
                    </TableCell>
                    <TableCell>
                      {contract.contractValue
                        ? formatCurrency(Number(contract.contractValue))
                        : "—"}
                    </TableCell>
                    <TableCell>{formatDate(contract.datestart)}</TableCell>
                    <TableCell>{formatDate(contract.dateend)}</TableCell>
                    <TableCell>
                      {contract.signed === 1 ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

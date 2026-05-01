import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
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
import { ContractsHeader } from "./contracts-header";

export default async function ContractsPage() {
  const [contracts, clients, contractTypes] = await Promise.all([
    prisma.contract.findMany({
      where: { trash: { not: 1 } },
      include: {
        contractClient: true,
        contractTypeRel: true,
      },
      orderBy: { datestart: "desc" },
    }),
    prisma.client.findMany({
      select: { id: true, company: true },
      orderBy: { company: "asc" },
    }),
    prisma.contractType.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <ContractsHeader
        count={contracts.length}
        clients={clients}
        contractTypes={contractTypes}
      />

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

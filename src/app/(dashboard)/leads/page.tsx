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
import { Target, LayoutList, Columns3 } from "lucide-react";
import { LeadBoard } from "./lead-board";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { view?: string };
}) {
  const view = searchParams?.view || "list";

  const [leads, statuses] = await Promise.all([
    prisma.lead.findMany({
      include: {
        leadStatus: true,
        leadSource: true,
      },
      orderBy: { dateadded: "desc" },
    }),
    prisma.leadStatus.findMany({
      orderBy: { statusorder: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <Badge variant="secondary">{leads.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border">
            <Link
              href="/leads?view=list"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              } rounded-l-md`}
            >
              <LayoutList className="h-4 w-4" />
              List
            </Link>
            <Link
              href="/leads?view=kanban"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "kanban"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              } rounded-r-md`}
            >
              <Columns3 className="h-4 w-4" />
              Kanban
            </Link>
          </div>
          <Button asChild>
            <Link href="/leads?modal=new">Add Lead</Link>
          </Button>
        </div>
      </div>

      {view === "kanban" ? (
        <LeadBoard
          leads={leads.map((lead) => ({
            id: lead.id,
            name: lead.name ?? "",
            company: lead.company ?? "",
            email: lead.email ?? "",
            assigned: lead.assigned ?? 0,
            leadValue: lead.leadValue ? Number(lead.leadValue) : null,
            status: lead.status ?? 0,
          }))}
          statuses={statuses.map((s) => ({
            id: s.id,
            name: s.name,
            color: s.color ?? "#6b7280",
          }))}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead>Date Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-8"
                    >
                      No leads found.
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-medium hover:underline"
                        >
                          {lead.name ?? "—"}
                        </Link>
                      </TableCell>
                      <TableCell>{lead.company || "—"}</TableCell>
                      <TableCell>{lead.email || "—"}</TableCell>
                      <TableCell>
                        {lead.leadStatus ? (
                          <Badge
                            className="border-transparent text-white"
                            style={{
                              backgroundColor: lead.leadStatus.color ?? "#6b7280",
                            }}
                          >
                            {lead.leadStatus.name}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {lead.leadSource?.name || "—"}
                      </TableCell>
                      <TableCell>
                        {lead.leadValue
                          ? formatCurrency(Number(lead.leadValue))
                          : "—"}
                      </TableCell>
                      <TableCell>{lead.assigned ?? "—"}</TableCell>
                      <TableCell>{formatDate(lead.dateadded)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

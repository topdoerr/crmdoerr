import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
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
import { TicketsHeader } from "./tickets-header";

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const statusFilter = searchParams?.status
    ? Number(searchParams.status)
    : undefined;

  const [tickets, statuses, priorities] = await Promise.all([
    prisma.ticket.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      include: {
        ticketStatus: true,
        ticketPriority: true,
      },
      orderBy: { date: "desc" },
    }),
    prisma.ticketStatus.findMany({
      orderBy: { statusorder: "asc" },
    }),
    prisma.ticketPriority.findMany(),
  ]);

  return (
    <div className="space-y-6">
      <TicketsHeader count={tickets.length} />

      <Tabs defaultValue={statusFilter?.toString() || "all"}>
        <TabsList>
          <TabsTrigger value="all" asChild>
            <Link href="/tickets">All</Link>
          </TabsTrigger>
          {statuses.map((s) => (
            <TabsTrigger key={s.ticketstatusid} value={s.ticketstatusid.toString()} asChild>
              <Link href={`/tickets?status=${s.ticketstatusid}`}>
                {s.name}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket #</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Reply</TableHead>
                <TableHead>Assigned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground py-8"
                  >
                    No tickets found.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.ticketid}>
                    <TableCell>
                      <Link
                        href={`/tickets/${ticket.ticketid}`}
                        className="font-medium hover:underline"
                      >
                        #{ticket.ticketkey || ticket.ticketid}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/tickets/${ticket.ticketid}`}
                        className="hover:underline"
                      >
                        {ticket.subject || "—"}
                      </Link>
                    </TableCell>
                    <TableCell>{ticket.department || "—"}</TableCell>
                    <TableCell>
                      {ticket.ticketPriority ? (
                        <Badge variant="outline">
                          {ticket.ticketPriority.name}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {ticket.ticketStatus ? (
                        <Badge
                          className="border-transparent text-white"
                          style={{
                            backgroundColor:
                              ticket.ticketStatus.statuscolor ?? "#6b7280",
                          }}
                        >
                          {ticket.ticketStatus.name}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(ticket.lastreply)}</TableCell>
                    <TableCell>
                      {ticket.assigned ? `Staff #${ticket.assigned}` : "—"}
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

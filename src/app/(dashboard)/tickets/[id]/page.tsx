import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Shield } from "lucide-react";
import { replyToTicket } from "../actions";

export default async function TicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const ticket = await prisma.ticket.findUnique({
    where: { ticketid: Number(params.id) },
    include: {
      ticketStatus: true,
      ticketPriority: true,
      replies: {
        orderBy: { date: "asc" },
      },
    },
  });

  if (!ticket) notFound();

  const replyAction = replyToTicket.bind(null, ticket.ticketid);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/tickets">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {ticket.subject || "Untitled Ticket"}
            </h1>
            <span className="text-muted-foreground">
              #{ticket.ticketkey || ticket.ticketid}
            </span>
            {ticket.ticketStatus && (
              <Badge
                className="border-transparent text-white"
                style={{
                  backgroundColor:
                    ticket.ticketStatus.statuscolor ?? "#6b7280",
                }}
              >
                {ticket.ticketStatus.name}
              </Badge>
            )}
            {ticket.ticketPriority && (
              <Badge variant="outline">{ticket.ticketPriority.name}</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-4">
          {/* Original message */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 pb-3">
              <div className="flex-1">
                <p className="font-semibold">{ticket.name || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(ticket.date)}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: ticket.message || "<p>No message content.</p>",
                }}
              />
            </CardContent>
          </Card>

          {/* Replies */}
          {ticket.replies?.map((reply) => (
            <Card
              key={reply.id}
              className={reply.admin === 1 ? "border-l-4 border-l-primary" : ""}
            >
              <CardHeader className="flex flex-row items-center gap-3 pb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">
                      {reply.name || "Unknown"}
                    </p>
                    {reply.admin === 1 && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        <Shield className="h-3 w-3" />
                        Staff
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(reply.date)}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: reply.message || "",
                  }}
                />
              </CardContent>
            </Card>
          ))}

          {/* Reply form */}
          <Card>
            <CardHeader>
              <CardTitle>Reply</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={replyAction} className="space-y-4">
                <textarea
                  name="message"
                  rows={5}
                  required
                  placeholder="Type your reply..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <Button type="submit">Send Reply</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Ticket Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Department
              </p>
              <p className="text-sm">{ticket.department || "—"}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Contact
              </p>
              <p className="text-sm">{ticket.name || "—"}</p>
              {ticket.email && (
                <a
                  href={`mailto:${ticket.email}`}
                  className="text-xs text-primary hover:underline"
                >
                  {ticket.email}
                </a>
              )}
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Assigned Staff
              </p>
              <p className="text-sm">
                {ticket.assigned ? `Staff #${ticket.assigned}` : "Unassigned"}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created
              </p>
              <p className="text-sm">{formatDate(ticket.date)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Last Reply
              </p>
              <p className="text-sm">{formatDate(ticket.lastreply)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

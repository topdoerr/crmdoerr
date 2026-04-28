import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
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

const CURRENT_STAFF_ID = 1;

export default async function MessagesPage() {
  const messages = await prisma.message.findMany({
    where: { toStaffId: CURRENT_STAFF_ID },
    orderBy: { createdAt: "desc" },
  });

  const staffIds = [...new Set(messages.map((m) => m.fromStaffId))];
  const staffList = await prisma.staff.findMany({
    where: { staffid: { in: staffIds } },
  });
  const staffMap = new Map(staffList.map((s) => [s.staffid, s]));

  const unreadCount = messages.filter((m) => m.read === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          )}
        </div>
        <Link href="/messages/compose">
          <Button>Compose</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground py-8"
                  >
                    No messages.
                  </TableCell>
                </TableRow>
              ) : (
                messages.map((msg) => {
                  const sender = staffMap.get(msg.fromStaffId);
                  const senderName = sender
                    ? `${sender.firstName} ${sender.lastName}`
                    : "Unknown";
                  return (
                    <TableRow
                      key={msg.id}
                      className={msg.read === 0 ? "font-semibold" : ""}
                    >
                      <TableCell>
                        {msg.read === 0 && (
                          <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                        )}
                      </TableCell>
                      <TableCell>{senderName}</TableCell>
                      <TableCell>
                        <Link
                          href={`/messages/${msg.id}`}
                          className="hover:underline"
                        >
                          {msg.subject || "(no subject)"}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(msg.createdAt)}
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

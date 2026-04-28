import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatDateTime, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { markAsRead } from "../actions";
import { ReplyForm } from "./reply-form";

const CURRENT_STAFF_ID = 1;

export default async function MessageDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = parseInt(params.id, 10);
  const message = await prisma.message.findUnique({ where: { id } });
  if (!message) return notFound();

  // Mark as read if unread and addressed to current user
  if (message.read === 0 && message.toStaffId === CURRENT_STAFF_ID) {
    await markAsRead(id);
  }

  // Load thread: messages sharing the same parentId, or replies to this message
  const threadParentId = message.parentId ?? message.id;
  const thread = await prisma.message.findMany({
    where: {
      OR: [
        { id: threadParentId },
        { parentId: threadParentId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  // Gather staff info
  const staffIds = [...new Set(thread.map((m) => m.fromStaffId).concat(thread.map((m) => m.toStaffId)))];
  const staffList = await prisma.staff.findMany({
    where: { staffid: { in: staffIds } },
  });
  const staffMap = new Map(staffList.map((s) => [s.staffid, s]));

  const sender = staffMap.get(message.fromStaffId);
  const senderName = sender ? `${sender.firstName} ${sender.lastName}` : "Unknown";

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link href="/messages" className="text-sm text-muted-foreground hover:underline">
          Inbox
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm">{message.subject || "(no subject)"}</span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg">
                {message.subject || "(no subject)"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                From <span className="font-medium text-foreground">{senderName}</span>
                {" "}to{" "}
                <span className="font-medium text-foreground">
                  {staffMap.get(message.toStaffId)
                    ? `${staffMap.get(message.toStaffId)!.firstName} ${staffMap.get(message.toStaffId)!.lastName}`
                    : "Unknown"}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(message.createdAt)}
              </p>
            </div>
            <Badge variant={message.read === 1 ? "secondary" : "default"}>
              {message.read === 1 ? "Read" : "Unread"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm">{message.body}</div>
        </CardContent>
      </Card>

      {/* Thread */}
      {thread.length > 1 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Thread</h2>
          {thread.map((msg) => {
            const msgSender = staffMap.get(msg.fromStaffId);
            const msgSenderName = msgSender
              ? `${msgSender.firstName} ${msgSender.lastName}`
              : "Unknown";
            return (
              <Card
                key={msg.id}
                className={msg.id === id ? "border-primary" : ""}
              >
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">
                        {getInitials(msgSenderName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{msgSenderName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(msg.createdAt)}
                    </span>
                  </div>
                  <div className="whitespace-pre-wrap text-sm pl-10">
                    {msg.body}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Separator />

      <ReplyForm
        parentId={threadParentId}
        toStaffId={message.fromStaffId === CURRENT_STAFF_ID ? message.toStaffId : message.fromStaffId}
        subject={message.subject ? `Re: ${message.subject.replace(/^Re:\s*/i, "")}` : "Re:"}
        currentStaffId={CURRENT_STAFF_ID}
      />
    </div>
  );
}

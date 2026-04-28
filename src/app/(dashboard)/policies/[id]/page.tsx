import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatDateTime, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { AcknowledgeButton } from "./acknowledge-button";

const CURRENT_STAFF_ID = 1;

export default async function PolicyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const [policy, myAck, allAcks] = await Promise.all([
    prisma.companyPolicy.findUnique({ where: { id } }),
    prisma.policyAcknowledgement.findFirst({
      where: { policyId: id, staffId: CURRENT_STAFF_ID },
    }),
    prisma.policyAcknowledgement.findMany({
      where: { policyId: id },
      orderBy: { ackedAt: "desc" },
    }),
  ]);

  if (!policy) notFound();

  // Fetch staff names for acknowledgements
  const staffIds = allAcks.map((a) => a.staffId);
  const staffMembers =
    staffIds.length > 0
      ? await prisma.staff.findMany({
          where: { staffid: { in: staffIds } },
          select: { staffid: true, firstName: true, lastName: true },
        })
      : [];
  const staffMap = new Map(staffMembers.map((s) => [s.staffid, s]));

  const hasAcked = !!myAck;
  const needsAck = policy.requireAck === 1 && !hasAcked;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold tracking-tight">{policy.title}</h1>
          <Badge variant="secondary">v{policy.version}</Badge>
          {policy.requireAck === 1 && (
            <Badge variant={hasAcked ? "success" : "warning"}>
              {hasAcked ? "Acknowledged" : "Action Required"}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Published {formatDateTime(policy.publishedAt)}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: policy.content }} />
        </CardContent>
      </Card>

      {needsAck && (
        <AcknowledgeButton policyId={policy.id} staffId={CURRENT_STAFF_ID} />
      )}

      <Separator />

      {/* Admin view: acknowledgement list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Acknowledgements ({allAcks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allAcks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No one has acknowledged this policy yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {allAcks.map((ack) => {
                const s = staffMap.get(ack.staffId);
                const name = s
                  ? `${s.firstName} ${s.lastName}`
                  : `Staff #${ack.staffId}`;
                return (
                  <li key={ack.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(ack.ackedAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

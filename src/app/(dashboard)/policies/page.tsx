import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreatePolicyButton } from "./create-policy-button";

const CURRENT_STAFF_ID = 1;

export default async function PoliciesPage() {
  const [policies, myAcks] = await Promise.all([
    prisma.companyPolicy.findMany({
      orderBy: { publishedAt: "desc" },
    }),
    prisma.policyAcknowledgement.findMany({
      where: { staffId: CURRENT_STAFF_ID },
      select: { policyId: true },
    }),
  ]);

  const ackedIds = new Set(myAcks.map((a) => a.policyId));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            Company Policies
          </h1>
          <Badge variant="secondary">{policies.length}</Badge>
        </div>
        <CreatePolicyButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {policies.map((policy) => {
          const acked = ackedIds.has(policy.id);
          const needsAck = policy.requireAck === 1 && !acked;
          return (
            <Link key={policy.id} href={`/policies/${policy.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{policy.title}</CardTitle>
                    {policy.requireAck === 1 && (
                      <Badge variant={acked ? "success" : "warning"}>
                        {acked ? "Acknowledged" : "Action Required"}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>v{policy.version}</span>
                    <span>{formatDate(policy.publishedAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {policies.length === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-8">
            No policies yet.
          </p>
        )}
      </div>
    </div>
  );
}

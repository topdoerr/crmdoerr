import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, UserPlus, XCircle, Trash2 } from "lucide-react";
import { DeleteButton } from "@/components/ui/delete-button";
import { convertLeadToClient, markLeadAsLost, markLeadAsJunk, deleteLead } from "../actions";

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const lead = await prisma.lead.findUnique({
    where: { id: Number(params.id) },
    include: {
      leadStatus: true,
      leadSource: true,
    },
  });

  if (!lead) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/leads">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {lead.name ?? "Unnamed Lead"}
            </h1>
            {lead.company && (
              <span className="text-lg text-muted-foreground">
                at {lead.company}
              </span>
            )}
            {lead.leadStatus && (
              <Badge
                className="border-transparent text-white"
                style={{
                  backgroundColor: lead.leadStatus.color ?? "#6b7280",
                }}
              >
                {lead.leadStatus.name}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!lead.clientId && !lead.lost && !lead.junk && (
            <>
              <form action={convertLeadToClient.bind(null, lead.id)}>
                <Button type="submit" size="sm" className="gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  Convert to Client
                </Button>
              </form>
              <form action={markLeadAsLost.bind(null, lead.id)}>
                <Button type="submit" variant="outline" size="sm" className="gap-1.5">
                  <XCircle className="h-4 w-4" />
                  Mark as Lost
                </Button>
              </form>
              <form action={markLeadAsJunk.bind(null, lead.id)}>
                <Button type="submit" variant="destructive" size="sm" className="gap-1.5">
                  <Trash2 className="h-4 w-4" />
                  Mark as Junk
                </Button>
              </form>
              <DeleteButton
                onDelete={deleteLead.bind(null, lead.id)}
                entityName="Lead"
                redirectTo="/leads"
              />
            </>
          )}
          {lead.clientId && (
            <Badge variant="success">Converted to Client</Badge>
          )}
          {lead.lost === 1 && <Badge variant="destructive">Lost</Badge>}
          {lead.junk === 1 && <Badge variant="destructive">Junk</Badge>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Email
                </dt>
                <dd className="mt-1">
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-primary hover:underline"
                    >
                      {lead.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Phone
                </dt>
                <dd className="mt-1">{lead.phonenumber || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Company
                </dt>
                <dd className="mt-1">{lead.company || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Title
                </dt>
                <dd className="mt-1">{lead.title || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">
                  Address
                </dt>
                <dd className="mt-1">
                  {[lead.address, lead.city, lead.state, lead.zip, lead.country]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Website
                </dt>
                <dd className="mt-1">
                  {lead.website ? (
                    <a
                      href={lead.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {lead.website}
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">
                  Source
                </dt>
                <dd className="mt-1">{lead.leadSource?.name || "—"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Value</p>
              <p className="text-lg font-semibold">
                {lead.leadValue
                  ? formatCurrency(Number(lead.leadValue))
                  : "—"}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Assigned To
              </p>
              <p>{lead.assigned ? `Staff #${lead.assigned}` : "Unassigned"}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Date Added
              </p>
              <p>{formatDate(lead.dateadded)}</p>
            </div>
            {lead.dateConverted && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Date Converted
                  </p>
                  <p>{formatDate(lead.dateConverted)}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity / Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No activity recorded yet.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

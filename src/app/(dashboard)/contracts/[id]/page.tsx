import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Check, X } from "lucide-react";

export default async function ContractDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const contract = await prisma.contract.findUnique({
    where: { id: Number(params.id) },
    include: {
      contractClient: true,
      contractTypeRel: true,
    },
  });

  if (!contract) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/contracts">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {contract.subject || "Untitled Contract"}
            </h1>
            {contract.signed === 1 ? (
              <Badge variant="success" className="gap-1">
                <Check className="h-3 w-3" />
                Signed
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <X className="h-3 w-3" />
                Not Signed
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {contract.contractClient?.company || "No client"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contract Content</CardTitle>
          </CardHeader>
          <CardContent>
            {contract.content ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: contract.content }}
              />
            ) : contract.description ? (
              <p className="text-sm">{contract.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No contract content available.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Contract Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Client
              </p>
              <p className="text-sm">
                {contract.contractClient ? (
                  <Link
                    href={`/clients/${contract.contractClient.id}`}
                    className="text-primary hover:underline"
                  >
                    {contract.contractClient.company}
                  </Link>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <p className="text-sm">
                {contract.contractTypeRel?.name || "—"}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Value
              </p>
              <p className="text-lg font-semibold">
                {contract.contractValue
                  ? formatCurrency(Number(contract.contractValue))
                  : "—"}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Start Date
              </p>
              <p className="text-sm">{formatDate(contract.datestart)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                End Date
              </p>
              <p className="text-sm">{formatDate(contract.dateend)}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Signature Status
              </p>
              <div className="mt-1">
                {contract.signed === 1 ? (
                  <Badge variant="success" className="gap-1">
                    <Check className="h-3 w-3" />
                    Signed
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <X className="h-3 w-3" />
                    Awaiting Signature
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

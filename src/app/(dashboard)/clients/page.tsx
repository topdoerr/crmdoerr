import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const search = searchParams?.search || "";

  const clients = await prisma.client.findMany({
    where: search
      ? {
          company: {
            contains: search,
            mode: "insensitive",
          },
        }
      : undefined,
    include: {
      contacts: {
        where: { isPrimary: 1 },
        take: 1,
      },
    },
    orderBy: { datecreated: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <Badge variant="secondary">{clients.length}</Badge>
        </div>
        <Button asChild>
          <Link href="/clients?modal=new">Add Client</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <form>
              <Input
                name="search"
                placeholder="Search clients..."
                defaultValue={search}
                className="max-w-sm"
              />
            </form>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>City / Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No clients found.
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => {
                  const primaryContact = client.contacts[0];
                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Link
                          href={`/clients/${client.id}`}
                          className="font-medium hover:underline"
                        >
                          {client.company}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {primaryContact
                          ? `${primaryContact.firstName ?? ""} ${primaryContact.lastName ?? ""}`.trim()
                          : "—"}
                      </TableCell>
                      <TableCell>{client.phonenumber || "—"}</TableCell>
                      <TableCell>
                        {[client.city, client.country]
                          .filter(Boolean)
                          .join(", ") || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            client.active === 1 ? "success" : "secondary"
                          }
                        >
                          {client.active === 1 ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(client.datecreated)}</TableCell>
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

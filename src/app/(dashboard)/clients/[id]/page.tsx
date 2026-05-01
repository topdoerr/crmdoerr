import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/ui/delete-button";
import { deleteClient } from "../actions";

const invoiceStatuses: Record<number, { label: string; variant: string }> = {
  1: { label: "Unpaid", variant: "warning" },
  2: { label: "Sent", variant: "default" },
  3: { label: "Partially Paid", variant: "warning" },
  4: { label: "Paid", variant: "success" },
  5: { label: "Cancelled", variant: "secondary" },
  6: { label: "Draft", variant: "outline" },
};

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const clientId = parseInt(params.id, 10);

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      contacts: true,
      invoices: {
        take: 5,
        orderBy: { date: "desc" },
      },
      projects: true,
      contracts: true,
    },
  });

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/clients">Back to Clients</Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            {client.company}
          </h1>
          <Badge variant={client.active === 1 ? "success" : "secondary"}>
            {client.active === 1 ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/clients/${client.id}?edit=true`}>Edit Client</Link>
          </Button>
          <DeleteButton
            onDelete={deleteClient.bind(null, client.id)}
            entityName="Client"
            redirectTo="/clients"
          />
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contacts">
            Contacts ({client.contacts.length})
          </TabsTrigger>
          <TabsTrigger value="invoices">
            Invoices ({client.invoices.length})
          </TabsTrigger>
          <TabsTrigger value="projects">
            Projects ({client.projects.length})
          </TabsTrigger>
          <TabsTrigger value="contracts">
            Contracts ({client.contracts.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Company" value={client.company} />
                <DetailRow label="VAT Number" value={client.vat} />
                <DetailRow label="Phone" value={client.phonenumber} />
                <DetailRow label="Website" value={client.website} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Address" value={client.address} />
                <DetailRow label="City" value={client.city} />
                <DetailRow label="State" value={client.state} />
                <DetailRow label="Zip" value={client.zip} />
                <DetailRow label="Country" value={client.country} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow
                  label="Street"
                  value={client.billingStreet}
                />
                <DetailRow label="City" value={client.billingCity} />
                <DetailRow label="State" value={client.billingState} />
                <DetailRow label="Zip" value={client.billingZip} />
                <DetailRow
                  label="Country"
                  value={client.billingCountry}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow
                  label="Street"
                  value={client.shippingStreet}
                />
                <DetailRow label="City" value={client.shippingCity} />
                <DetailRow
                  label="State"
                  value={client.shippingState}
                />
                <DetailRow label="Zip" value={client.shippingZip} />
                <DetailRow
                  label="Country"
                  value={client.shippingCountry}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts">
          <Card>
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
              <CardDescription>
                People associated with this client
              </CardDescription>
            </CardHeader>
            <CardContent>
              {client.contacts.length === 0 ? (
                <p className="text-muted-foreground py-4">
                  No contacts found.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">
                          {`${contact.firstName ?? ""} ${contact.lastName ?? ""}`.trim()}
                          {contact.isPrimary === 1 && (
                            <Badge variant="default" className="ml-2">
                              Primary
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{contact.email || "—"}</TableCell>
                        <TableCell>
                          {contact.phonenumber || "—"}
                        </TableCell>
                        <TableCell>{contact.title || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Last 5 invoices for this client</CardDescription>
            </CardHeader>
            <CardContent>
              {client.invoices.length === 0 ? (
                <p className="text-muted-foreground py-4">
                  No invoices found.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.invoices.map((invoice) => {
                      const status = invoiceStatuses[invoice.status ?? 0];
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <Link
                              href={`/invoices/${invoice.id}`}
                              className="font-medium hover:underline"
                            >
                              {invoice.prefix}
                              {invoice.number}
                            </Link>
                          </TableCell>
                          <TableCell>{formatDate(invoice.date)}</TableCell>
                          <TableCell>
                            {formatDate(invoice.dueDate)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(
                              Number(invoice.total ?? 0)
                            )}
                          </TableCell>
                          <TableCell>
                            {status ? (
                              <Badge
                                variant={
                                  status.variant as
                                    | "default"
                                    | "secondary"
                                    | "destructive"
                                    | "outline"
                                    | "success"
                                    | "warning"
                                }
                              >
                                {status.label}
                              </Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects">
          <Card>
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>Projects for this client</CardDescription>
            </CardHeader>
            <CardContent>
              {client.projects.length === 0 ? (
                <p className="text-muted-foreground py-4">
                  No projects found.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deadline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <Link
                            href={`/projects/${project.id}`}
                            className="font-medium hover:underline"
                          >
                            {project.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {project.status ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(project.deadline)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contracts Tab */}
        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>Contracts for this client</CardDescription>
            </CardHeader>
            <CardContent>
              {client.contracts.length === 0 ? (
                <p className="text-muted-foreground py-4">
                  No contracts found.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.contracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">
                          {contract.subject}
                        </TableCell>
                        <TableCell>
                          {formatDate(contract.datestart)}
                        </TableCell>
                        <TableCell>
                          {formatDate(contract.dateend)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(
                            Number(contract.contractValue ?? 0)
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  );
}

import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomFieldForm } from "@/components/custom-fields/custom-field-form";

const FIELD_TO_LABELS: Record<string, string> = {
  client: "Clients",
  lead: "Leads",
  invoice: "Invoices",
  estimate: "Estimates",
  proposal: "Proposals",
  contract: "Contracts",
  project: "Projects",
  task: "Tasks",
  ticket: "Tickets",
  expense: "Expenses",
};

export default async function CustomFieldsPage() {
  const fields = await prisma.customField.findMany({
    orderBy: [{ fieldTo: "asc" }, { displayOrder: "asc" }],
  });

  const grouped = fields.reduce<Record<string, typeof fields>>((acc, f) => {
    (acc[f.fieldTo] ||= []).push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Custom Fields</h1>
          <Badge variant="secondary">{fields.length}</Badge>
        </div>
        <CustomFieldForm />
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No custom fields yet.
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([fieldTo, list]) => (
          <Card key={fieldTo}>
            <CardHeader>
              <CardTitle className="text-lg">
                {FIELD_TO_LABELS[fieldTo] || fieldTo}
                <Badge variant="secondary" className="ml-2">
                  {list.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Required</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.name}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {f.slug}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{f.fieldType}</Badge>
                      </TableCell>
                      <TableCell>
                        {f.required ? (
                          <Badge variant="warning">Required</Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={f.active ? "success" : "secondary"}>
                          {f.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <CustomFieldForm field={f} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

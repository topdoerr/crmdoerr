import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplateEditor } from "./template-editor";
import { AssignSection } from "./assign-section";

export default async function OnboardingTemplatePage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const [template, staffList] = await Promise.all([
    prisma.onboardingTemplate.findUnique({
      where: { id },
      include: { items: { orderBy: { itemOrder: "asc" } } },
    }),
    prisma.staff.findMany({
      where: { active: 1 },
      orderBy: { firstName: "asc" },
    }),
  ]);

  if (!template) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Edit Template: {template.name}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Template Items</CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateEditor
            templateId={template.id}
            templateName={template.name}
            items={template.items.map((i) => ({
              id: i.id,
              title: i.title,
              description: i.description ?? "",
              assignTo: i.assignTo,
              itemOrder: i.itemOrder,
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assign to Staff</CardTitle>
        </CardHeader>
        <CardContent>
          <AssignSection
            templateId={template.id}
            staffList={staffList.map((s) => ({
              id: s.staffid,
              name: `${s.firstName} ${s.lastName}`,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}

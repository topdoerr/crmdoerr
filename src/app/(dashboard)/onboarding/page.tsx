import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTemplateButton } from "./create-template-button";
import { OnboardingChecklist } from "./onboarding-checklist";

const CURRENT_STAFF_ID = 1;

export default async function OnboardingPage() {
  const [templates, myProgress, staff] = await Promise.all([
    prisma.onboardingTemplate.findMany({
      include: { items: { orderBy: { itemOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.onboardingProgress.findMany({
      where: { staffId: CURRENT_STAFF_ID },
    }),
    prisma.staff.findUnique({ where: { staffid: CURRENT_STAFF_ID } }),
  ]);

  const hasOnboarding = myProgress.length > 0;

  // Group progress by template
  const progressByTemplate = myProgress.reduce(
    (acc, p) => {
      if (!acc[p.templateId]) acc[p.templateId] = [];
      acc[p.templateId].push(p);
      return acc;
    },
    {} as Record<number, typeof myProgress>
  );

  return (
    <div className="space-y-6">
      {/* Employee onboarding view */}
      {hasOnboarding && (
        <section className="space-y-4">
          <h1 className="text-2xl font-bold tracking-tight">My Onboarding</h1>
          {Object.entries(progressByTemplate).map(([templateIdStr, items]) => {
            const templateId = Number(templateIdStr);
            const template = templates.find((t) => t.id === templateId);
            if (!template) return null;
            const total = items.length;
            const completed = items.filter((i) => i.completed === 1).length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Card key={templateId}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{template.name}</span>
                    <Badge variant={pct === 100 ? "success" : "warning"}>
                      {pct}% Complete
                    </Badge>
                  </CardTitle>
                  {/* Progress bar */}
                  <div className="mt-2 h-2 w-full rounded-full bg-secondary">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <OnboardingChecklist
                    items={template.items.map((item) => {
                      const prog = items.find((p) => p.itemId === item.id);
                      return {
                        id: item.id,
                        title: item.title,
                        description: item.description,
                        completed: prog?.completed === 1,
                      };
                    })}
                    staffId={CURRENT_STAFF_ID}
                  />
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      {/* Admin view: templates */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Onboarding Templates
            </h1>
            <Badge variant="secondary">{templates.length}</Badge>
          </div>
          <CreateTemplateButton />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <Link key={t.id} href={`/onboarding/${t.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{t.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{t.items.length} items</span>
                    <span>{formatDate(t.createdAt)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {templates.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">
              No templates yet. Create one to get started.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

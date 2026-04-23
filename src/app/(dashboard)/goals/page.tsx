import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalForm } from "./goal-form";

const GOAL_TYPES: Record<number, string> = {
  1: "Total Income",
  2: "Convert Leads",
  3: "Increase Customers",
  4: "Make Contracts by Type",
  5: "Increase Project Income",
};

export default async function GoalsPage() {
  const goals = await prisma.goal.findMany({
    orderBy: { endDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <Badge variant="secondary">{goals.length}</Badge>
        </div>
        <GoalForm />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {goals.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No goals yet. Click &quot;Add Goal&quot; to create one.
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => {
            const achievement = Number(goal.achievement ?? 0);
            const isAchieved = achievement >= 100;
            return (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{goal.subject}</CardTitle>
                    <Badge variant={isAchieved ? "success" : "secondary"}>
                      {GOAL_TYPES[goal.goalType] ?? "Goal"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {goal.description && (
                    <p className="text-sm text-muted-foreground">
                      {goal.description}
                    </p>
                  )}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{achievement}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${Math.min(achievement, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Start: {formatDate(goal.startDate)}</span>
                    <span>End: {formatDate(goal.endDate)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

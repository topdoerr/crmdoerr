import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export async function RecentActivity() {
  const activities = await prisma.activityLog.findMany({
    take: 10,
    orderBy: { date: "desc" },
  });

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between gap-4 text-sm"
              >
                <p className="flex-1">{activity.description}</p>
                <time className="shrink-0 text-muted-foreground">
                  {formatDate(activity.date)}
                </time>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

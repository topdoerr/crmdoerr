import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementForm } from "./announcement-form";

export default async function AnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { datecreated: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <Badge variant="secondary">{announcements.length}</Badge>
        </div>
        <AnnouncementForm />
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No announcements yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">{a.name}</CardTitle>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(a.dateStart)} — {formatDate(a.dateEnd)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.showToStaff === 1 && (
                    <Badge variant="outline">Staff</Badge>
                  )}
                  {a.showToClients === 1 && (
                    <Badge variant="outline">Clients</Badge>
                  )}
                  <AnnouncementForm
                    announcement={{
                      id: a.id,
                      name: a.name,
                      message: a.message,
                      showToStaff: a.showToStaff,
                      showToClients: a.showToClients,
                      dateStart: a.dateStart,
                      dateEnd: a.dateEnd,
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: a.message }}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

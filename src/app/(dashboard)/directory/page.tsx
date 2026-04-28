import Link from "next/link";
import prisma from "@/lib/prisma";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const search = searchParams?.search || "";

  const staffList = await prisma.staff.findMany({
    where: {
      active: 1,
      ...(search
        ? {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { firstName: "asc" },
  });

  const profiles = await prisma.staffProfile.findMany({
    where: { staffId: { in: staffList.map((s) => s.staffid) } },
  });
  const profileMap = new Map(profiles.map((p) => [p.staffId, p]));

  // Group by department
  const grouped = new Map<string, typeof staffList>();
  staffList.forEach((s) => {
    const profile = profileMap.get(s.staffid);
    const dept = profile?.department || "Unassigned";
    if (!grouped.has(dept)) grouped.set(dept, []);
    grouped.get(dept)!.push(s);
  });

  // Sort departments alphabetically, with "Unassigned" last
  const departments = [...grouped.keys()].sort((a, b) => {
    if (a === "Unassigned") return 1;
    if (b === "Unassigned") return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Company Directory
          </h1>
          <Badge variant="secondary">{staffList.length}</Badge>
        </div>
      </div>

      <div className="max-w-sm">
        <form>
          <Input
            name="search"
            placeholder="Search by name or email..."
            defaultValue={search}
          />
        </form>
      </div>

      {departments.map((dept) => {
        const members = grouped.get(dept)!;
        return (
          <div key={dept} className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {dept}
              <Badge variant="outline">{members.length}</Badge>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {members.map((staff) => {
                const profile = profileMap.get(staff.staffid);
                const fullName = `${staff.firstName} ${staff.lastName}`;
                return (
                  <Link key={staff.staffid} href={`/directory/${staff.staffid}`}>
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="pt-5">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-11 w-11">
                            <AvatarFallback>
                              {getInitials(fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {fullName}
                            </p>
                            {profile?.jobTitle && (
                              <p className="text-xs text-muted-foreground truncate">
                                {profile.jobTitle}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {staff.email}
                            </p>
                            {(profile?.phone || staff.phonenumber) && (
                              <p className="text-xs text-muted-foreground">
                                {profile?.phone || staff.phonenumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}

      {staffList.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No staff found.
        </p>
      )}
    </div>
  );
}

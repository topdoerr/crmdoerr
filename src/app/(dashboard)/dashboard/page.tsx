import prisma from "@/lib/prisma";
import { formatDate, formatDateTime, getInitials } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Mail,
  Palmtree,
  CalendarDays,
  CheckSquare,
  Cake,
  FileWarning,
  Clock,
} from "lucide-react";
import Link from "next/link";

const CURRENT_STAFF_ID = 1;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  const endOfWeek = new Date(startOfDay);
  endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
  const currentMonth = today.getMonth() + 1; // 1-based

  const [
    currentStaff,
    unreadMessages,
    pendingPto,
    upcomingEventsCount,
    openTasks,
    recentPosts,
    upcomingEvents,
    staffOnPto,
    birthdayProfiles,
    pendingApprovals,
    unackedPolicies,
  ] = await Promise.all([
    prisma.staff.findUnique({ where: { staffid: CURRENT_STAFF_ID } }),
    prisma.message.count({
      where: { toStaffId: CURRENT_STAFF_ID, read: 0 },
    }),
    prisma.ptoRequest.count({
      where: { staffId: CURRENT_STAFF_ID, status: "pending" },
    }),
    prisma.calendarEvent.count({
      where: {
        startDate: { gte: startOfDay, lte: endOfWeek },
      },
    }),
    prisma.task.count({
      where: {
        status: { in: [1, 2, 3, 4] },
        assignees: { some: { staffId: CURRENT_STAFF_ID } },
      },
    }),
    prisma.newsFeedPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.calendarEvent.findMany({
      where: { startDate: { gte: startOfDay } },
      orderBy: { startDate: "asc" },
      take: 5,
    }),
    prisma.ptoRequest.findMany({
      where: {
        status: "approved",
        startDate: { lte: endOfDay },
        endDate: { gte: startOfDay },
      },
    }),
    prisma.staffProfile.findMany({
      where: {
        birthday: { not: null },
      },
    }),
    prisma.ptoRequest.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.companyPolicy.findMany({
      where: {
        requireAck: 1,
        acknowledgements: { none: { staffId: CURRENT_STAFF_ID } },
      },
    }),
  ]);

  // Fetch staff names for PTO / posts / approvals
  const allStaffIds = [
    ...new Set([
      ...staffOnPto.map((p) => p.staffId),
      ...recentPosts.map((p) => p.staffId),
      ...pendingApprovals.map((p) => p.staffId),
    ]),
  ];
  const staffMembers =
    allStaffIds.length > 0
      ? await prisma.staff.findMany({
          where: { staffid: { in: allStaffIds } },
          select: { staffid: true, firstName: true, lastName: true },
        })
      : [];
  const staffMap = new Map(
    staffMembers.map((s) => [s.staffid, `${s.firstName} ${s.lastName}`])
  );

  // Filter birthdays for current month
  const birthdaysThisMonth = birthdayProfiles.filter((p) => {
    if (!p.birthday) return false;
    return p.birthday.getMonth() + 1 === currentMonth;
  });
  const birthdayStaffIds = birthdaysThisMonth.map((p) => p.staffId);
  const birthdayStaff =
    birthdayStaffIds.length > 0
      ? await prisma.staff.findMany({
          where: { staffid: { in: birthdayStaffIds } },
          select: { staffid: true, firstName: true, lastName: true },
        })
      : [];
  const birthdayStaffMap = new Map(
    birthdayStaff.map((s) => [s.staffid, `${s.firstName} ${s.lastName}`])
  );

  const staffName = currentStaff
    ? `${currentStaff.firstName} ${currentStaff.lastName}`
    : "there";

  const statCards = [
    {
      title: "Unread Messages",
      value: unreadMessages,
      icon: Mail,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Pending PTO",
      value: pendingPto,
      icon: Palmtree,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Events This Week",
      value: upcomingEventsCount,
      icon: CalendarDays,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Open Tasks",
      value: openTasks,
      icon: CheckSquare,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {getGreeting()}, {staffName}
        </h1>
        <p className="text-muted-foreground">{formatDate(today)}</p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          {/* Recent News */}
          <Card>
            <CardHeader>
              <CardTitle>Recent News</CardTitle>
            </CardHeader>
            <CardContent>
              {recentPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent posts.</p>
              ) : (
                <ul className="space-y-4">
                  {recentPosts.map((post) => {
                    const author = staffMap.get(post.staffId) ?? "Unknown";
                    const snippet =
                      post.content.length > 120
                        ? post.content.slice(0, 120) + "..."
                        : post.content;
                    return (
                      <li key={post.id} className="flex gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs">
                            {getInitials(author)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{author}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {snippet}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(post.createdAt)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming events.</p>
              ) : (
                <ul className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <li key={event.id} className="flex items-center gap-3">
                      <div
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: event.color ?? "#03a9f4" }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(event.startDate)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Who's Out */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palmtree className="h-4 w-4" /> Who&apos;s Out Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              {staffOnPto.length === 0 ? (
                <p className="text-sm text-muted-foreground">Everyone is in today.</p>
              ) : (
                <ul className="space-y-3">
                  {staffOnPto.map((pto) => {
                    const name = staffMap.get(pto.staffId) ?? `Staff #${pto.staffId}`;
                    return (
                      <li key={pto.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {pto.type} &middot; until {formatDate(pto.endDate)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Birthdays This Month */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cake className="h-4 w-4" /> Birthdays This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              {birthdaysThisMonth.length === 0 ? (
                <p className="text-sm text-muted-foreground">No birthdays this month.</p>
              ) : (
                <ul className="space-y-3">
                  {birthdaysThisMonth.map((profile) => {
                    const name =
                      birthdayStaffMap.get(profile.staffId) ??
                      `Staff #${profile.staffId}`;
                    return (
                      <li key={profile.id} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">
                            {profile.birthday
                              ? formatDate(profile.birthday)
                              : ""}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Pending Approvals (admin) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingApprovals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending approvals.</p>
              ) : (
                <ul className="space-y-3">
                  {pendingApprovals.map((req) => {
                    const name =
                      staffMap.get(req.staffId) ?? `Staff #${req.staffId}`;
                    return (
                      <li key={req.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {req.type} &middot; {req.days} day(s)
                            </p>
                          </div>
                        </div>
                        <Badge variant="warning">Pending</Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Unread Policies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileWarning className="h-4 w-4" /> Unread Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unackedPolicies.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  All caught up! No policies require your attention.
                </p>
              ) : (
                <ul className="space-y-3">
                  {unackedPolicies.map((policy) => (
                    <li key={policy.id}>
                      <Link
                        href={`/policies/${policy.id}`}
                        className="flex items-center justify-between hover:bg-muted/50 rounded-md p-2 -mx-2 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium">{policy.title}</p>
                          <p className="text-xs text-muted-foreground">
                            v{policy.version} &middot;{" "}
                            {formatDate(policy.publishedAt)}
                          </p>
                        </div>
                        <Badge variant="warning">Action Required</Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { formatDate, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfileEditForm } from "./profile-edit-form";

const CURRENT_STAFF_ID = 1;

export default async function DirectoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const staffId = parseInt(params.id, 10);
  const staff = await prisma.staff.findUnique({
    where: { staffid: staffId },
  });
  if (!staff) return notFound();

  const profile = await prisma.staffProfile.findUnique({
    where: { staffId },
  });

  // Get manager info if reportsTo is set
  let manager: { staffid: number; firstName: string; lastName: string } | null = null;
  if (profile?.reportsTo) {
    manager = await prisma.staff.findUnique({
      where: { staffid: profile.reportsTo },
      select: { staffid: true, firstName: true, lastName: true },
    });
  }

  // Get all staff for the edit form's reportsTo dropdown
  const allStaff = await prisma.staff.findMany({
    where: { active: 1, staffid: { not: staffId } },
    select: { staffid: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });

  const fullName = `${staff.firstName} ${staff.lastName}`;
  const isOwn = staffId === CURRENT_STAFF_ID;

  // Format birthday as month/day only
  const birthdayDisplay = profile?.birthday
    ? new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric" }).format(
        new Date(profile.birthday)
      )
    : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2">
        <Link
          href="/directory"
          className="text-sm text-muted-foreground hover:underline"
        >
          Directory
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm">{fullName}</span>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-5">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{fullName}</CardTitle>
              {profile?.jobTitle && (
                <p className="text-muted-foreground">{profile.jobTitle}</p>
              )}
              {profile?.department && (
                <Badge variant="outline" className="mt-1">
                  {profile.department}
                </Badge>
              )}
            </div>
            {isOwn && (
              <ProfileEditForm
                staffId={staffId}
                profile={profile ? {
                  birthday: profile.birthday?.toISOString().slice(0, 10) ?? "",
                  startDate: profile.startDate?.toISOString().slice(0, 10) ?? "",
                  department: profile.department ?? "",
                  jobTitle: profile.jobTitle ?? "",
                  location: profile.location ?? "",
                  bio: profile.bio ?? "",
                  phone: profile.phone ?? "",
                  extension: profile.extension ?? "",
                  linkedIn: profile.linkedIn ?? "",
                  reportsTo: profile.reportsTo ?? 0,
                } : undefined}
                allStaff={allStaff}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.bio && (
            <>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Bio
                </h3>
                <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
              </div>
              <Separator />
            </>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField label="Email" value={staff.email} />
            <InfoField
              label="Phone"
              value={profile?.phone || staff.phonenumber || undefined}
            />
            <InfoField label="Extension" value={profile?.extension || undefined} />
            <InfoField label="Location" value={profile?.location || undefined} />
            <InfoField label="Start Date" value={profile?.startDate ? formatDate(profile.startDate) : undefined} />
            <InfoField label="Birthday" value={birthdayDisplay || undefined} />
            {profile?.linkedIn && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  LinkedIn
                </p>
                <a
                  href={profile.linkedIn.startsWith("http") ? profile.linkedIn : `https://${profile.linkedIn}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {profile.linkedIn}
                </a>
              </div>
            )}
            {manager && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Reports To
                </p>
                <Link
                  href={`/directory/${manager.staffid}`}
                  className="text-sm text-primary hover:underline"
                >
                  {manager.firstName} {manager.lastName}
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-0.5">
        {label}
      </p>
      <p className="text-sm">{value}</p>
    </div>
  );
}

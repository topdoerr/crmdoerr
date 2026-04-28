"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProfile } from "../actions";

interface ProfileEditFormProps {
  staffId: number;
  profile?: {
    birthday: string;
    startDate: string;
    department: string;
    jobTitle: string;
    location: string;
    bio: string;
    phone: string;
    extension: string;
    linkedIn: string;
    reportsTo: number;
  };
  allStaff: { staffid: number; firstName: string; lastName: string }[];
}

export function ProfileEditForm({ staffId, profile, allStaff }: ProfileEditFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reportsTo, setReportsTo] = useState(String(profile?.reportsTo || "0"));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      await updateProfile(staffId, {
        birthday: (fd.get("birthday") as string) || undefined,
        startDate: (fd.get("startDate") as string) || undefined,
        department: (fd.get("department") as string) || undefined,
        jobTitle: (fd.get("jobTitle") as string) || undefined,
        location: (fd.get("location") as string) || undefined,
        bio: (fd.get("bio") as string) || undefined,
        phone: (fd.get("phone") as string) || undefined,
        extension: (fd.get("extension") as string) || undefined,
        linkedIn: (fd.get("linkedIn") as string) || undefined,
        reportsTo: reportsTo !== "0" ? parseInt(reportsTo, 10) : undefined,
      });
      setOpen(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                defaultValue={profile?.jobTitle ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                defaultValue={profile?.department ?? ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                defaultValue={profile?.phone ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="extension">Extension</Label>
              <Input
                id="extension"
                name="extension"
                defaultValue={profile?.extension ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={profile?.location ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              name="bio"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue={profile?.bio ?? ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                name="birthday"
                type="date"
                defaultValue={profile?.birthday ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={profile?.startDate ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedIn">LinkedIn</Label>
            <Input
              id="linkedIn"
              name="linkedIn"
              defaultValue={profile?.linkedIn ?? ""}
              placeholder="linkedin.com/in/username"
            />
          </div>

          <div className="space-y-2">
            <Label>Reports To</Label>
            <Select value={reportsTo} onValueChange={setReportsTo}>
              <SelectTrigger>
                <SelectValue placeholder="Select manager..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None</SelectItem>
                {allStaff.map((s) => (
                  <SelectItem key={s.staffid} value={String(s.staffid)}>
                    {s.firstName} {s.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

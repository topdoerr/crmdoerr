"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createStaff, updateStaff } from "./actions";

interface StaffFormProps {
  staff?: {
    staffid: number;
    email: string;
    firstName: string;
    lastName: string;
    phonenumber: string | null;
    admin: number;
    active: number;
  };
  trigger?: React.ReactNode;
}

export function StaffForm({ staff, trigger }: StaffFormProps) {
  const router = useRouter();
  const isEditing = !!staff;
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      if (isEditing && staff) {
        await updateStaff(staff.staffid, formData);
      } else {
        await createStaff(formData);
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button>Add Staff</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Staff" : "Add New Staff"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                required
                defaultValue={staff?.firstName ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                required
                defaultValue={staff?.lastName ?? ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={staff?.email ?? ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phonenumber">Phone</Label>
            <Input
              id="phonenumber"
              name="phonenumber"
              defaultValue={staff?.phonenumber ?? ""}
            />
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
              />
            </div>
          )}

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Checkbox
                id="admin"
                name="admin"
                defaultChecked={staff ? staff.admin === 1 : false}
              />
              <Label htmlFor="admin" className="cursor-pointer">
                Admin
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="active"
                name="active"
                defaultChecked={staff ? staff.active === 1 : true}
              />
              <Label htmlFor="active" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : isEditing
                  ? "Update Staff"
                  : "Create Staff"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

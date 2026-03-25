"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient, updateClient } from "./actions";

const clientSchema = z.object({
  company: z.string().min(1, "Company name is required"),
  vat: z.string().optional(),
  phonenumber: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  website: z.string().optional(),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: {
    id: number;
    company: string | null;
    vat: string | null;
    phonenumber: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    website: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClientForm({ client, open, onOpenChange }: ClientFormProps) {
  const router = useRouter();
  const isEditing = !!client;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company: client?.company ?? "",
      vat: client?.vat ?? "",
      phonenumber: client?.phonenumber ?? "",
      address: client?.address ?? "",
      city: client?.city ?? "",
      state: client?.state ?? "",
      zip: client?.zip ?? "",
      website: client?.website ?? "",
    },
  });

  async function onSubmit(values: ClientFormValues) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    if (isEditing && client) {
      await updateClient(client.id, formData);
    } else {
      await createClient(formData);
    }

    reset();
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Client" : "Add New Client"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Input id="company" {...register("company")} />
            {errors.company && (
              <p className="text-sm text-destructive">
                {errors.company.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vat">VAT Number</Label>
              <Input id="vat" {...register("vat")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phonenumber">Phone</Label>
              <Input id="phonenumber" {...register("phonenumber")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" {...register("city")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register("state")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">Zip</Label>
              <Input id="zip" {...register("zip")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...register("website")} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Update Client"
                  : "Create Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

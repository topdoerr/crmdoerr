"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateRole, deleteRole } from "../actions";

interface RoleEditorProps {
  role: {
    id: number;
    name: string;
    permissions: Record<string, string[]>;
  };
  features: string[];
  capabilities: string[];
}

export function RoleEditor({ role, features, capabilities }: RoleEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(role.name);
  const [perms, setPerms] = useState<Record<string, string[]>>(role.permissions);
  const [saving, setSaving] = useState(false);

  const toggle = (feature: string, capability: string) => {
    setPerms((prev) => {
      const current = new Set(prev[feature] ?? []);
      if (current.has(capability)) current.delete(capability);
      else current.add(capability);
      return { ...prev, [feature]: Array.from(current) };
    });
  };

  const has = (feature: string, capability: string) =>
    perms[feature]?.includes(capability);

  const onSave = async () => {
    setSaving(true);
    try {
      await updateRole(role.id, { name, permissions: perms });
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!confirm("Delete this role?")) return;
    await deleteRole(role.id);
    router.push("/roles");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/roles">Back</Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Role</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" onClick={onDelete}>
            Delete
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Role Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div key={feature} className="rounded-md border p-4 space-y-3">
                <div className="font-medium capitalize">{feature}</div>
                <div className="grid grid-cols-2 gap-2">
                  {capabilities.map((cap) => (
                    <label
                      key={cap}
                      className="flex items-center gap-2 text-sm capitalize"
                    >
                      <Checkbox
                        checked={has(feature, cap)}
                        onCheckedChange={() => toggle(feature, cap)}
                      />
                      {cap}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

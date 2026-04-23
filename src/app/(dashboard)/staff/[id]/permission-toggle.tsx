"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { setPermission } from "../actions";

interface PermissionToggleProps {
  staffId: number;
  feature: string;
  capability: string;
  initial: boolean;
  label: string;
}

export function PermissionToggle({
  staffId,
  feature,
  capability,
  initial,
  label,
}: PermissionToggleProps) {
  const [checked, setChecked] = useState(initial);
  const [, startTransition] = useTransition();

  function handleChange(next: boolean | "indeterminate") {
    const val = next === true;
    setChecked(val);
    startTransition(async () => {
      await setPermission(staffId, feature, capability, val);
    });
  }

  const id = `perm-${feature}-${capability}`;

  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={handleChange} />
      <label htmlFor={id} className="text-sm cursor-pointer">
        {label}
      </label>
    </div>
  );
}

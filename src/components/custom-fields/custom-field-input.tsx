"use client";

import { useState, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { setCustomFieldValue } from "@/app/(dashboard)/custom-fields/actions";

interface CustomFieldInputProps {
  field: {
    id: number;
    name: string;
    fieldType: string;
    options: string | null;
    required: number;
  };
  relType: string;
  relId: number;
  initialValue: string;
}

export function CustomFieldInput({
  field,
  relType,
  relId,
  initialValue,
}: CustomFieldInputProps) {
  const [value, setValue] = useState(initialValue);
  const [, startTransition] = useTransition();
  const [saving, setSaving] = useState(false);

  const commit = (newValue: string) => {
    setValue(newValue);
    setSaving(true);
    startTransition(async () => {
      await setCustomFieldValue(field.id, relId, relType, newValue);
      setSaving(false);
    });
  };

  const options =
    field.options
      ?.split(",")
      .map((o) => o.trim())
      .filter(Boolean) ?? [];

  return (
    <div className="space-y-2">
      <Label htmlFor={`cf-${field.id}`}>
        {field.name}
        {field.required ? " *" : ""}
        {saving ? (
          <span className="ml-2 text-xs text-muted-foreground">Saving…</span>
        ) : null}
      </Label>

      {field.fieldType === "textarea" ? (
        <textarea
          id={`cf-${field.id}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      ) : field.fieldType === "select" ? (
        <select
          id={`cf-${field.id}`}
          value={value}
          onChange={(e) => commit(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">-- Select --</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : field.fieldType === "checkbox" ? (
        <div className="flex items-center gap-2">
          <Checkbox
            checked={value === "1"}
            onCheckedChange={(c) => commit(c ? "1" : "0")}
          />
          <span className="text-sm text-muted-foreground">{field.name}</span>
        </div>
      ) : field.fieldType === "date" ? (
        <Input
          id={`cf-${field.id}`}
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
        />
      ) : field.fieldType === "number" ? (
        <Input
          id={`cf-${field.id}`}
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
        />
      ) : (
        <Input
          id={`cf-${field.id}`}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
        />
      )}
    </div>
  );
}

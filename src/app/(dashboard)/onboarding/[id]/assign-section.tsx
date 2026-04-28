"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { assignTemplate } from "../actions";
import { UserPlus } from "lucide-react";

export function AssignSection({
  templateId,
  staffList,
}: {
  templateId: number;
  staffList: { id: number; name: string }[];
}) {
  const [selectedStaff, setSelectedStaff] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleAssign() {
    if (!selectedStaff) return;
    startTransition(async () => {
      await assignTemplate(Number(selectedStaff), templateId);
      setSelectedStaff("");
    });
  }

  return (
    <div className="flex gap-2 items-center">
      <Select value={selectedStaff} onValueChange={setSelectedStaff}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select staff member" />
        </SelectTrigger>
        <SelectContent>
          {staffList.map((s) => (
            <SelectItem key={s.id} value={String(s.id)}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleAssign} disabled={isPending || !selectedStaff}>
        <UserPlus className="mr-2 h-4 w-4" /> Assign
      </Button>
    </div>
  );
}

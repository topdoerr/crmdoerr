"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleItemComplete } from "./actions";

interface ChecklistItem {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
}

export function OnboardingChecklist({
  items,
  staffId,
}: {
  items: ChecklistItem[];
  staffId: number;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle(itemId: number) {
    startTransition(async () => {
      await toggleItemComplete(staffId, itemId);
    });
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="flex items-start gap-3">
          <Checkbox
            checked={item.completed}
            onCheckedChange={() => handleToggle(item.id)}
            disabled={isPending}
            className="mt-0.5"
          />
          <div>
            <p
              className={`font-medium ${item.completed ? "line-through text-muted-foreground" : ""}`}
            >
              {item.title}
            </p>
            {item.description && (
              <p className="text-sm text-muted-foreground">
                {item.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

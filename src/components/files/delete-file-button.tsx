"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteFile } from "@/app/(dashboard)/files/actions";

export function DeleteFileButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function onClick() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    startTransition(async () => {
      await deleteFile(id);
    });
  }

  return (
    <Button
      variant={confirming ? "destructive" : "outline"}
      size="sm"
      onClick={onClick}
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4" />
      {confirming && <span className="ml-1 text-xs">Confirm</span>}
    </Button>
  );
}

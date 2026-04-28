"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { acknowledgePolicy } from "../actions";
import { CheckCircle } from "lucide-react";

export function AcknowledgeButton({
  policyId,
  staffId,
}: {
  policyId: number;
  staffId: number;
}) {
  const [isPending, startTransition] = useTransition();

  function handleAck() {
    startTransition(async () => {
      await acknowledgePolicy(policyId, staffId);
    });
  }

  return (
    <Button onClick={handleAck} disabled={isPending} size="lg">
      <CheckCircle className="mr-2 h-5 w-5" />
      {isPending ? "Acknowledging..." : "I Acknowledge This Policy"}
    </Button>
  );
}

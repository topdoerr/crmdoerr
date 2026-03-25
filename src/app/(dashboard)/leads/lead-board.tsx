"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface LeadCard {
  id: number;
  name: string;
  company: string;
  email: string;
  assigned: number;
  leadValue: number | null;
  status: number;
}

interface Status {
  id: number;
  name: string;
  color: string;
}

interface LeadBoardProps {
  leads: LeadCard[];
  statuses: Status[];
}

export function LeadBoard({ leads, statuses }: LeadBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statuses.map((status) => {
        const columnLeads = leads.filter((lead) => lead.status === status.id);
        return (
          <div
            key={status.id}
            className="min-w-[300px] flex-shrink-0 rounded-lg border bg-muted/30"
          >
            <div
              className="flex items-center gap-2 border-b px-4 py-3"
              style={{ borderTopColor: status.color, borderTopWidth: "3px" }}
            >
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              <h3 className="text-sm font-semibold">{status.name}</h3>
              <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {columnLeads.length}
              </span>
            </div>
            <div className="space-y-2 p-3">
              {columnLeads.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  No leads
                </p>
              ) : (
                columnLeads.map((lead) => (
                  <Link key={lead.id} href={`/leads/${lead.id}`}>
                    <Card className="cursor-pointer transition-shadow hover:shadow-md">
                      <CardContent className="p-3">
                        <p className="font-medium text-sm">{lead.name}</p>
                        {lead.company && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {lead.company}
                          </p>
                        )}
                        {lead.email && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {lead.email}
                          </p>
                        )}
                        {lead.leadValue != null && lead.leadValue > 0 && (
                          <p className="mt-2 text-sm font-semibold text-olive-600">
                            ${lead.leadValue.toLocaleString()}
                          </p>
                        )}
                        {lead.assigned > 0 && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Assigned: Staff #{lead.assigned}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
